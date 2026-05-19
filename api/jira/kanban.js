// api/jira/kanban.js
// GET ?project=XYZ  → Kanban flow metrics: WIP, throughput, cycle time, aging
// Query params:
//   ?project=SDT          (default: SDT)
//   ?weeks=8              (default: 8 weeks of throughput history)

import { jiraGet } from './_client.js';

const DEFAULT_PROJECT = 'SDT';

// ── Helpers ────────────────────────────────────────────────────────────────

function pts(fields) {
  return Number(fields.customfield_10016 || fields.customfield_10028 || 0);
}

function normType(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('bug')    || n.includes('defect'))                     return 'Bug';
  if (n.includes('story')  || n.includes('feature'))                    return 'Story';
  if (n.includes('spike')  || n.includes('research') || n.includes('poc')) return 'Spike';
  if (n.includes('epic'))                                                return 'Epic';
  return 'Task';
}

function normStatusKey(statusName, categoryKey) {
  const n = (statusName || '').toLowerCase();
  const c = (categoryKey || '').toLowerCase();
  if (c === 'done'          || n.includes('done')     || n.includes('closed') || n.includes('resolved')) return 'done';
  if (n.includes('review')  || n.includes('testing')  || n.includes('qa'))                               return 'review';
  if (c === 'indeterminate' || n.includes('progress') || n.includes('doing'))                             return 'inprogress';
  return 'todo';
}

function daysSince(iso) {
  if (!iso) return null;
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86400000));
}

// Paginated fetch from board issues endpoint with JQL
async function fetchBoardIssues(boardId, jql, fields, maxTotal = 400) {
  let all = [], start = 0;
  while (true) {
    const d = await jiraGet(
      `/rest/agile/1.0/board/${boardId}/issue?jql=${encodeURIComponent(jql)}&maxResults=100&startAt=${start}&fields=${fields}`
    );
    all = all.concat(d.issues || []);
    if (!d.issues?.length || all.length >= Math.min(d.total || 0, maxTotal)) break;
    start += d.issues.length;
  }
  return all;
}

// ── Handler ────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')    return res.status(405).json({ error: 'GET only' });

  const project = req.query?.project || DEFAULT_PROJECT;
  const weeks   = Math.min(parseInt(req.query?.weeks || '8', 10), 16);

  try {
    // 1 — Find the board
    const boardsData = await jiraGet(`/rest/agile/1.0/board?projectKeyOrId=${project}&maxResults=10`);
    const board = boardsData.values?.[0];
    if (!board) return res.status(404).json({ ok: false, error: `No board found for project ${project}` });

    // 2 — Fetch WIP (non-done) + recently done in parallel
    const lookbackDays = weeks * 7 + 7;
    const WIP_FIELDS  = 'summary,issuetype,status,assignee,created,statuscategorychangedate,customfield_10016,customfield_10028,priority';
    const DONE_FIELDS = 'summary,issuetype,status,assignee,created,resolutiondate,customfield_10016,customfield_10028';

    const [wipRaw, doneRaw] = await Promise.all([
      fetchBoardIssues(board.id, 'statusCategory != Done ORDER BY created ASC', WIP_FIELDS),
      fetchBoardIssues(board.id, `statusCategory = Done AND updated >= -${lookbackDays}d ORDER BY updated DESC`, DONE_FIELDS, 600)
    ]);

    // 3 — Process WIP
    const wip = wipRaw
      .filter(i => normType(i.fields.issuetype?.name) !== 'Epic')
      .map(i => {
        const statusKey  = normStatusKey(i.fields.status?.name, i.fields.status?.statusCategory?.key);
        // statuscategorychangedate = when status category last changed (best proxy for "time in current stage")
        const stageChangedAt = i.fields.statuscategorychangedate || i.fields.created;
        const ageInStage = daysSince(stageChangedAt) ?? 0;
        const totalAge   = daysSince(i.fields.created) ?? 0;
        return {
          key:        i.key,
          title:      (i.fields.summary || '').slice(0, 80),
          type:       normType(i.fields.issuetype?.name),
          pts:        pts(i.fields),
          assignee:   i.fields.assignee?.displayName || '—',
          initials:   (i.fields.assignee?.displayName || '?').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase(),
          status:     i.fields.status?.name || 'Unknown',
          statusKey,
          ageInStage,
          totalAge,
          created:    i.fields.created
        };
      });

    // WIP by status key (excluding done)
    const wipByStatus = { todo: 0, inprogress: 0, review: 0 };
    wip.forEach(t => {
      if (wipByStatus[t.statusKey] !== undefined) wipByStatus[t.statusKey]++;
    });

    // Aging buckets (days in current stage)
    const agingBuckets = {
      fresh:   wip.filter(t => t.ageInStage <= 2).length,           // 0-2 days
      normal:  wip.filter(t => t.ageInStage >= 3 && t.ageInStage <= 7).length,  // 3-7
      stale:   wip.filter(t => t.ageInStage >= 8 && t.ageInStage <= 14).length, // 8-14
      blocked: wip.filter(t => t.ageInStage > 14).length                        // 14+
    };

    // Type mix (WIP)
    const typeMix = {};
    wip.forEach(t => { typeMix[t.type] = (typeMix[t.type] || 0) + 1; });

    // Assignee workload (WIP)
    const assigneeMap = {};
    wip.forEach(t => {
      if (!assigneeMap[t.assignee]) assigneeMap[t.assignee] = { name: t.assignee, initials: t.initials, count: 0, pts: 0 };
      assigneeMap[t.assignee].count++;
      assigneeMap[t.assignee].pts += t.pts;
    });
    const assigneeLoad = Object.values(assigneeMap).sort((a, b) => b.count - a.count).slice(0, 8);

    // 4 — Process completed tickets
    const done = doneRaw
      .filter(i => normType(i.fields.issuetype?.name) !== 'Epic' && i.fields.resolutiondate)
      .map(i => {
        const created  = new Date(i.fields.created).getTime();
        const resolved = new Date(i.fields.resolutiondate).getTime();
        return {
          key:           i.key,
          type:          normType(i.fields.issuetype?.name),
          resolvedDate:  i.fields.resolutiondate,
          cycleTimeDays: Math.max(0, Math.round((resolved - created) / 86400000))
        };
      });

    // 5 — Throughput per week (last N weeks)
    const now = Date.now();
    const throughputWeeks = [];
    for (let w = weeks - 1; w >= 0; w--) {
      const wStart = now - (w + 1) * 7 * 86400000;
      const wEnd   = now - w       * 7 * 86400000;
      const count  = done.filter(t => {
        const ts = new Date(t.resolvedDate).getTime();
        return ts >= wStart && ts < wEnd;
      }).length;
      throughputWeeks.push({
        label: new Date(wStart).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        count
      });
    }

    // Last-7 vs prev-7 throughput
    const last7 = done.filter(t => new Date(t.resolvedDate).getTime() >= now - 7 * 86400000).length;
    const prev7 = done.filter(t => {
      const ts = new Date(t.resolvedDate).getTime();
      return ts >= now - 14 * 86400000 && ts < now - 7 * 86400000;
    }).length;

    // 6 — Cycle time stats
    const cycleTimes = done.map(t => t.cycleTimeDays).filter(d => d >= 0 && d < 365).sort((a, b) => a - b);
    const avgCycleTime    = cycleTimes.length ? Math.round(cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length) : null;
    const medianCycleTime = cycleTimes.length ? cycleTimes[Math.floor(cycleTimes.length / 2)] : null;
    const p85CycleTime    = cycleTimes.length ? cycleTimes[Math.floor(cycleTimes.length * 0.85)] : null;

    // Cycle time histogram
    const ctBuckets = [
      { label: '0-1d',   min: 0,  max: 1  },
      { label: '2-3d',   min: 2,  max: 3  },
      { label: '4-7d',   min: 4,  max: 7  },
      { label: '8-14d',  min: 8,  max: 14 },
      { label: '15-30d', min: 15, max: 30 },
      { label: '30d+',   min: 31, max: Infinity }
    ];
    const ctHistogram = ctBuckets.map(b => ({
      label: b.label,
      count: cycleTimes.filter(d => d >= b.min && d <= b.max).length
    }));

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({
      ok:        true,
      boardId:   board.id,
      boardName: board.name,
      boardType: board.type,
      projectKey: project,
      // Summary stats
      wipCount:        wip.length,
      wipByStatus,
      last7Throughput: last7,
      prev7Throughput: prev7,
      avgCycleTime,
      medianCycleTime,
      p85CycleTime,
      blockedCount:    agingBuckets.blocked,
      // Chart data
      throughputWeeks,
      ctHistogram,
      agingBuckets,
      typeMix,
      assigneeLoad,
      // Tables
      wipItems:  wip.sort((a, b) => b.ageInStage - a.ageInStage).slice(0, 60),
      doneCount: done.length
    });

  } catch (e) {
    console.error('[jira/kanban]', e.message);
    return res.status(500).json({ ok: false, error: e.message });
  }
}
