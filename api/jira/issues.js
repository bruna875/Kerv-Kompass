// api/jira/issues.js
// GET ?sprintId=xxx → individual tickets for that sprint (called on-demand when user selects a sprint)

import { jiraGet, jiraPost } from './_client.js';

const FIELDS = 'summary,issuetype,status,assignee,customfield_10016,customfield_10028,priority,parent,customfield_10014';

function pts(fields) {
  return Number(fields.customfield_10016 || fields.customfield_10028 || 0);
}

function normType(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('bug')   || n.includes('defect'))   return 'Bug';
  if (n.includes('story') || n.includes('feature'))  return 'Story';
  if (n.includes('spike') || n.includes('research')) return 'Spike';
  if (n.includes('epic'))                            return 'Epic';
  return 'Task';
}

// Returns status key used by XTS_STS_COLORS / XTS_STS_LABELS in the frontend
function normStatus(statusName, categoryKey) {
  const n = (statusName || '').toLowerCase();
  const c = (categoryKey || '').toLowerCase();
  if (c === 'done'         || n.includes('done')     || n.includes('closed') || n.includes('resolved')) return 'done';
  if (n.includes('review') || n.includes('testing')  || n.includes('qa'))                               return 'review';
  if (c === 'indeterminate'|| n.includes('progress') || n.includes('doing'))                             return 'in-progress';
  return 'todo';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')    return res.status(405).json({ error: 'GET only' });

  // ── ?project=SDT&type=Epic  → list all epics in a project ──────────────────
  const project = req.query?.project;
  const type    = req.query?.type;
  if (project && type === 'Epic') {
    try {
      // Use issuetype in ("Epic") to handle both classic and next-gen projects
      const jql  = `project = ${project} AND issuetype in ("Epic") ORDER BY key ASC`;
      console.log('[jira/issues] epics JQL:', jql);
      const data = await jiraPost('/rest/api/3/search/jql', {
        jql, fields: ['summary', 'status'], maxResults: 200
      });
      console.log('[jira/issues] epics found:', data.total, 'issues:', data.issues?.length);
      const epics = (data.issues || []).map(i => ({
        key:            i.key,
        summary:        i.fields.summary || i.key,
        status:         i.fields.status?.name || 'Unknown',
        statusCategory: i.fields.status?.statusCategory?.key || 'new'
      }));
      return res.status(200).json({ ok: true, epics });
    } catch (e) {
      console.error('[jira/issues] epics error:', e.message);
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  const sprintId = req.query?.sprintId;
  if (!sprintId) return res.status(400).json({ ok: false, error: 'sprintId or project+type required' });

  try {
    // Paginate through all sprint issues
    let all = [], start = 0;
    while (true) {
      const d = await jiraGet(
        `/rest/agile/1.0/sprint/${sprintId}/issue?maxResults=100&startAt=${start}&fields=${FIELDS}`
      );
      all = all.concat(d.issues || []);
      if (!d.issues?.length || all.length >= (d.total || 0)) break;
      start += d.issues.length;
    }

    // Collect parent epic keys (next-gen: parent field; classic: customfield_10014)
    const seenKeys = new Set(all.map(i => i.key));
    const epicKeysToFetch = new Set();
    all.forEach(i => {
      const parentKey  = i.fields.parent?.key;
      const parentType = i.fields.parent?.fields?.issuetype?.name || '';
      if (parentKey && parentType.toLowerCase().includes('epic')) epicKeysToFetch.add(parentKey);
      const epicLink = i.fields.customfield_10014;
      if (epicLink && typeof epicLink === 'string') epicKeysToFetch.add(epicLink);
    });
    // Fetch each unique parent epic (best-effort)
    const epicMap = {};  // key → summary
    await Promise.all([...epicKeysToFetch].map(async k => {
      try {
        const src = seenKeys.has(k)
          ? all.find(i => i.key === k)
          : await jiraGet(`/rest/api/3/issue/${k}?fields=summary`);
        if (src) epicMap[k] = src.fields.summary || k;
      } catch (_) {}
    }));

    // Helper: resolve epic name for an issue
    function epicName(i) {
      // next-gen: parent is the epic
      const parentKey  = i.fields.parent?.key;
      const parentType = i.fields.parent?.fields?.issuetype?.name || '';
      if (parentKey && parentType.toLowerCase().includes('epic')) return epicMap[parentKey] || null;
      // classic: customfield_10014 = Epic Link (key string)
      const link = i.fields.customfield_10014;
      if (link && typeof link === 'string' && epicMap[link]) return epicMap[link];
      return null;
    }

    // Return only non-epic issues; epics are now represented as inline badges
    const issues = all
      .filter(i => normType(i.fields.issuetype?.name) !== 'Epic')
      .map(i => ({
        id:        i.key,
        title:     i.fields.summary,
        type:      normType(i.fields.issuetype?.name),
        pts:       pts(i.fields),
        assignee:  i.fields.assignee?.displayName || '—',
        status:    normStatus(i.fields.status?.name, i.fields.status?.statusCategory?.key),
        statusRaw: i.fields.status?.name || '',
        epic:      epicName(i)
      }));

    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');
    return res.status(200).json({ ok: true, sprintId: Number(sprintId), issues });

  } catch (e) {
    console.error('[jira/issues]', e.message);
    return res.status(500).json({ ok: false, error: e.message });
  }
}
