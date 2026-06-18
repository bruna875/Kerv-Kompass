// api/cron/cap-report.js
// Runs on the 5th of each month at 08:00 UTC.
// Generates the previous month's Capitalization Report for SDT and emails it.

import { jiraGet }          from '../jira/_client.js';
import { signDownloadUrl }  from '../cap-download.js';
import { Resend }           from 'resend';
import * as XLSX            from 'xlsx';

const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];

const FIELDS = [
  'summary','issuetype','status','assignee',
  'customfield_10016','customfield_10028', // story points
  'customfield_10285',                      // Capitalizable Item
  'resolutiondate','parent','customfield_10014'
].join(',');

function pts(fields) {
  return Number(fields.customfield_10016 || fields.customfield_10028 || 0);
}
function normType(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('bug')   || n.includes('defect'))   return 'Bug';
  if (n.includes('story') || n.includes('feature'))  return 'Story';
  if (n.includes('spike') || n.includes('research')) return 'Spike';
  if (n.includes('epic'))                             return 'Epic';
  return 'Task';
}
function isDone(fields) {
  const n = (fields.status?.name || '').toLowerCase();
  const c = (fields.status?.statusCategory?.key || '').toLowerCase();
  return c === 'done' || n.includes('done') || n.includes('closed') || n.includes('resolved');
}

export default async function handler(req, res) {
  // ── Auth: Vercel sets Authorization: Bearer <CRON_SECRET> on cron requests
  if (process.env.CRON_SECRET &&
      req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // ── Target: previous calendar month ────────────────────────────────────
    const now         = new Date();
    const targetYear  = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const targetMonth = now.getMonth() === 0 ? 12 : now.getMonth(); // 1-indexed
    const monthName   = MONTH_NAMES[targetMonth - 1];
    const mFirst      = new Date(targetYear, targetMonth - 1, 1);
    const mLast       = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    console.log(`[cap-report] Generating ${monthName} ${targetYear} report`);

    // ── Find SDT Jira board ─────────────────────────────────────────────────
    const boardData = await jiraGet('/rest/agile/1.0/board?projectKeyOrId=SDT&maxResults=5');
    const board = boardData.values?.[0];
    if (!board) throw new Error('No Agile board found for project SDT');

    // ── Fetch closed + active sprints ───────────────────────────────────────
    const sprintData = await jiraGet(
      `/rest/agile/1.0/board/${board.id}/sprint?state=closed,active&maxResults=50`
    );
    const allSprints = sprintData.values || [];

    // Keep only sprints that overlap with target month
    const relevantSprints = allSprints.filter(s => {
      const start = s.startDate ? new Date(s.startDate) : null;
      const end   = s.endDate   ? new Date(s.endDate)   : null;
      if (!start && !end) return false;
      if (start && end)   return start <= mLast && end >= mFirst;
      if (end)            return end   >= mFirst && end  <= mLast;
      if (start)          return start >= mFirst && start <= mLast;
      return false;
    });

    if (!relevantSprints.length) {
      console.log(`[cap-report] No sprints overlap ${monthName} ${targetYear} — skipping`);
      return res.status(200).json({ ok: true, message: 'No sprints for target month', tickets: 0 });
    }

    // ── Fetch issues for each relevant sprint ───────────────────────────────
    const seen = new Set();
    const rows = [];

    for (const sprint of relevantSprints) {
      let all = [], cursor = 0;
      while (true) {
        const d = await jiraGet(
          `/rest/agile/1.0/sprint/${sprint.id}/issue?maxResults=100&startAt=${cursor}&fields=${FIELDS}`
        );
        all = all.concat(d.issues || []);
        if (!d.issues?.length || all.length >= (d.total || 0)) break;
        cursor += d.issues.length;
      }

      for (const issue of all) {
        if (seen.has(issue.key))       continue;
        if (!isDone(issue.fields))     continue;

        // Completion date: resolutiondate first, then sprint end as fallback
        let completionDate = null;
        if (issue.fields.resolutiondate) {
          const d = new Date(issue.fields.resolutiondate);
          if (d >= mFirst && d <= mLast) completionDate = d;
        }
        if (!completionDate && sprint.endDate) {
          const de = new Date(sprint.endDate);
          if (de >= mFirst && de <= mLast) completionDate = de;
        }
        if (!completionDate) continue;

        seen.add(issue.key);

        const capRaw = issue.fields.customfield_10285;
        const cap = capRaw?.value === 'Yes' ? 'Yes'
                  : capRaw?.value === 'No'  ? 'No'
                  : '—';

        rows.push([
          completionDate.toLocaleDateString('en-GB'),
          issue.key,
          sprint.name,
          normType(issue.fields.issuetype?.name),
          issue.fields.summary || '',
          cap,
          pts(issue.fields)
        ]);
      }
    }

    // Sort by date ascending
    rows.sort((a, b) =>
      new Date(a[0].split('/').reverse().join('-')) -
      new Date(b[0].split('/').reverse().join('-'))
    );

    // ── Build Excel ─────────────────────────────────────────────────────────
    const headers = [['Completion Date', 'Ticket ID', 'Sprint', 'Type', 'Title', 'Capitalizable', 'Story Points']];
    const ws = XLSX.utils.aoa_to_sheet(headers.concat(rows));
    ws['!cols'] = [{ wch: 16 }, { wch: 14 }, { wch: 18 }, { wch: 10 }, { wch: 52 }, { wch: 14 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${monthName.slice(0, 3)} ${targetYear}`);
    const buffer = Buffer.from(XLSX.write(wb, { type: 'array', bookType: 'xlsx' }));

    // ── Send via Resend ─────────────────────────────────────────────────────
    const resend     = new Resend(process.env.RESEND_API_KEY);
    const filename   = `Capitalization Report | SDT | ${monthName} ${targetYear}.xlsx`;
    const recipients = (process.env.CAP_REPORT_RECIPIENTS || '')
      .split(',').map(e => e.trim()).filter(Boolean);

    if (!recipients.length) throw new Error('CAP_REPORT_RECIPIENTS env var not set');

    const emailHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background:#F0EEE8">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0EEE8;padding:40px 0">
        <tr><td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08)">
            <tr><td style="background:#ED005E;height:4px;font-size:0">&nbsp;</td></tr>
            <tr><td style="padding:28px 36px 20px">
              <table cellpadding="0" cellspacing="0"><tr>
                <td style="padding-right:10px;vertical-align:middle">
                  <img src="https://res.cloudinary.com/dhfrgr4qd/image/upload/v1775830255/Kerv-Logo-1-1_bl2xdt.jpg" width="28" height="28" style="border-radius:6px;display:block"/>
                </td>
                <td style="vertical-align:middle;font-size:14px;font-weight:600;color:#0D1E36;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">KERV Dashboard</td>
              </tr></table>
            </td></tr>
            <tr><td style="padding:0 36px"><div style="height:1px;background:rgba(0,0,0,0.07)"></div></td></tr>
            <tr><td style="padding:28px 36px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
              <p style="margin:0 0 6px;font-size:15px;font-weight:600;color:#0D1E36">Capitalization Report — ${monthName} ${targetYear}</p>
              <p style="margin:0 0 20px;font-size:14px;color:#0D1E36;line-height:1.7">
                Hi,<br/><br/>
                Please find attached the <strong>Capitalization Report for ${monthName} ${targetYear}</strong>,
                covering the SDT team's completed tickets for the month.<br/><br/>
                The report includes <strong>${rows.length} completed ticket${rows.length !== 1 ? 's' : ''}</strong>
                with completion date, ticket type, epic, capitalizable flag, and story points.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin-bottom:24px"><tr>
                <td style="background:#ED005E;border-radius:8px">
                  <a href="${signDownloadUrl(targetYear, targetMonth)}" style="display:inline-block;padding:12px 24px;font-size:13px;font-weight:600;color:#ffffff;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">&#8595;&nbsp; Download Report</a>
                </td>
                <td width="12"></td>
                <td style="border:1.5px solid #ED005E;border-radius:8px">
                  <a href="https://kerv.space" style="display:inline-block;padding:10px 22px;font-size:13px;font-weight:600;color:#ED005E;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">Open Dashboard</a>
                </td>
              </tr></table>
            </td></tr>
            <tr><td style="padding:0 36px"><div style="height:1px;background:rgba(0,0,0,0.07)"></div></td></tr>
            <tr><td style="padding:18px 36px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
              <p style="margin:0;font-size:11px;color:#A8A8A0;line-height:1.6">
                Sent automatically by KERV Dashboard on the 5th of each month.<br/>
                To update recipients or settings, contact your KERV admin.
              </p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body></html>`;

    await resend.emails.send({
      from:    process.env.CAP_REPORT_FROM || 'reports@kerv.space',
      to:      recipients,
      subject: `Capitalization Report | SDT | ${monthName} ${targetYear}`,
      html:    emailHtml,
      attachments: [{ filename, content: buffer }]
    });

    console.log(`[cap-report] ✓ ${rows.length} tickets → ${recipients.join(', ')}`);
    return res.status(200).json({ ok: true, month: `${monthName} ${targetYear}`, tickets: rows.length });

  } catch (e) {
    console.error('[cap-report] ERROR:', e.message);
    return res.status(500).json({ ok: false, error: e.message });
  }
}
