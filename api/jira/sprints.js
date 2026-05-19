// api/jira/sprints.js
// GET  → all recent sprints for a project with computed stats (no individual tickets)
// Query params:
//   ?project=SDT     (default: SDT)
//   ?maxSprints=8    (default: 8)

import { jiraGet } from './_client.js';

const DEFAULT_PROJECT = 'SDT';

// ── Helpers ────────────────────────────────────────────────────────────────

// Story points: try both classic (10016) and next-gen (10028) custom fields
function pts(fields) {
  return Number(fields.customfield_10016 || fields.customfield_10028 || 0);
}

// Normalise issue type → Story / Bug / Task / Spike
function normType(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('bug')   || n.includes('defect'))   return 'Bug';
  if (n.includes('story') || n.includes('feature'))  return 'Story';
  if (n.includes('spike') || n.includes('research') || n.includes('poc')) return 'Spike';
  if (n.includes('epic'))                             return 'Epic';
  return 'Task';
}

// Normalise Jira status → keys used in byStatus aggregation
function normStatusKey(statusName, categoryKey) {
  const n = (statusName || '').toLowerCase();
  const c = (categoryKey || '').toLowerCase();
  if (c === 'done' || n.includes('done') || n.includes('closed') || n.includes('resolved')) return 'done';
  if (n.includes('review') || n.includes('testing') || n.includes('qa'))                    return 'review';
  if (c === 'indeterminate' || n.includes('progress') || n.includes('doing'))               return 'inprogress';
  return 'todo';
}

// Format Jira ISO date → "1 Apr"
function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.getDate() + ' ' + d.toLocaleString('en-GB', { month: 'short' });
}

// Paginated fetch of all issues in a sprint (stats fields only)
const STAT_FIELDS = 'summary,issuetype,status,assignee,customfield_10016,customfield_10028';

async function fetchSprintIssues(sprintId) {
  let all = [], start = 0;
  while (true) {
    const d = await jiraGet(
      `/rest/agile/1.0/sprint/${sprintId}/issue?maxResults=100&startAt=${start}&fields=${STAT_FIELDS}`
    );
    all = all.concat(d.issues || []);
    if (!d.issues?.length || all.length >= (d.total || 0)) break;
    start += d.issues.length;
  }
  return all;
}

// Build per-sprint stats from raw Jira issues
function computeStats(jiraSprint, issues) {
  const isDone = i => normStatusKey(
    i.fields.status?.name,
    i.fields.status?.statusCategory?.key
  ) === 'done';
  const isBug = i => normType(i.fields.issuetype?.name) === 'Bug';

  const planned   = issues.reduce((s, i) => s + pts(i.fields), 0);
  const completed = issues.filter(isDone).reduce((s, i) => s + pts(i.fields), 0);
  const carryover = issues.filter(i => !isDone(i)).length;

  const allBugs      = issues.filter(isBug);
  const bugsResolved = allBugs.filter(isDone).length;
  const bugsIntroduced = allBugs.length;
  const bugs           = allBugs.length - bugsResolved; // open bugs

  // Ticket type mix
  const tickets = { story: 0, bug: 0, task: 0, spike: 0, epic: 0 };
  issues.forEach(i => {
    const t = normType(i.fields.issuetype?.name).toLowerCase();
    if (t === 'story') tickets.story++;
    else if (t === 'bug') tickets.bug++;
    else if (t === 'spike') tickets.spike++;
    else if (t === 'epic') tickets.epic++;
    else tickets.task++;
  });

  // Ticket status breakdown
  const byStatus = { todo: 0, inprogress: 0, review: 0, done: 0 };
  issues.forEach(i => {
    const k = normStatusKey(i.fields.status?.name, i.fields.status?.statusCategory?.key);
    byStatus[k] = (byStatus[k] || 0) + 1;
  });

  // Team capacity — aggregated by assignee (story points + ticket counts)
  const memberMap = {};
  issues.forEach(i => {
    const name = i.fields.assignee?.displayName || 'Unassigned';
    if (!memberMap[name]) memberMap[name] = { assigned: 0, completed: 0, ticketsAssigned: 0, ticketsCompleted: 0 };
    const p = pts(i.fields);
    memberMap[name].assigned         += p;
    memberMap[name].ticketsAssigned  += 1;
    if (isDone(i)) {
      memberMap[name].completed        += p;
      memberMap[name].ticketsCompleted += 1;
    }
  });
  const members = Object.entries(memberMap).map(([name, m]) => ({
    name,
    initials:         name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    role:             '',
    capacity:         m.assigned,
    assigned:         m.assigned,
    completed:        m.completed,
    ticketsAssigned:  m.ticketsAssigned,
    ticketsCompleted: m.ticketsCompleted
  }));

  return {
    id:             jiraSprint.id,
    name:           jiraSprint.name,
    start:          fmtDate(jiraSprint.startDate),
    end:            fmtDate(jiraSprint.endDate),
    status:         jiraSprint.state === 'active'  ? 'in-progress' :
                    jiraSprint.state === 'closed'  ? 'completed'   : 'future',
    jiraState:      jiraSprint.state,
    planned,
    completed,
    bugs,
    carryover,
    bugsIntroduced,
    bugsResolved,
    tickets,
    byStatus,
    members
  };
}

// ── Handler ────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')    return res.status(405).json({ error: 'GET only' });

  const project    = req.query?.project    || DEFAULT_PROJECT;
  const maxSprints = Math.min(parseInt(req.query?.maxSprints || '8', 10), 20);

  try {
    // 1 — Find the scrum board for the project
    const boardsData = await jiraGet(
      `/rest/agile/1.0/board?projectKeyOrId=${project}&maxResults=10`
    );
    const board = boardsData.values?.[0];
    if (!board) {
      return res.status(404).json({ ok: false, error: `No board found for project ${project}` });
    }

    // 2 — Kanban boards don't have sprints — return early with a clear flag
    if ((board.type || '').toLowerCase() === 'kanban') {
      return res.status(200).json({
        ok:        true,
        boardType: 'kanban',
        boardId:   board.id,
        boardName: board.name,
        sprints:   []
      });
    }

    // 4 — Fetch active + last 3 closed + 1 future sprint in parallel
    const [activeRes, closedRes, futureRes] = await Promise.all([
      jiraGet(`/rest/agile/1.0/board/${board.id}/sprint?state=active&maxResults=5`),
      jiraGet(`/rest/agile/1.0/board/${board.id}/sprint?state=closed&maxResults=${maxSprints}`),
      jiraGet(`/rest/agile/1.0/board/${board.id}/sprint?state=future&maxResults=5`)
    ]);

    const closed = (closedRes.values || []).sort((a, b) => a.id - b.id).slice(-3);
    const active = (activeRes.values || []).slice(0, 1);
    const future = (futureRes.values || []).sort((a, b) => a.id - b.id).slice(0, 1);
    const allSprints = [...closed, ...active, ...future];

    if (!allSprints.length) {
      return res.status(200).json({ ok: true, boardId: board.id, boardName: board.name, sprints: [] });
    }

    // 3 — Fetch issues for all sprints in parallel, then compute stats
    const issueArrays = await Promise.all(allSprints.map(s => fetchSprintIssues(s.id)));
    const sprints     = allSprints.map((s, idx) => computeStats(s, issueArrays[idx]));

    // Cache: 5 min fresh, 10 min stale-while-revalidate
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({
      ok:        true,
      boardId:   board.id,
      boardName: board.name,
      sprints
    });

  } catch (e) {
    console.error('[jira/sprints]', e.message);
    return res.status(500).json({ ok: false, error: e.message });
  }
}
