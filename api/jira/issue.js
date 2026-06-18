// api/jira/issue.js
// GET  ?key=SDT-123              → fetch a single issue
// POST body: { title, type, storyPoints, assigneeAccountId, project, sprintId }  → create issue
// PUT  body: { key, title?, storyPoints?, assigneeAccountId?, statusTransitionId? } → update issue

import { jiraGet, jiraPost, jiraPut } from './_client.js';

const DEFAULT_PROJECT = 'SDT';

// Jira doesn't have a native "Spike" type; map it to Story with a label
const TYPE_MAP = {
  Story: 'Story',
  Bug:   'Bug',
  Task:  'Task',
  Spike: 'Story',
  Epic:  'Epic'
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── GET — fetch single issue OR batch epics progress ──────────────────────
  if (req.method === 'GET') {
    // ?keys=SDT-1,SDT-2  → batch progress for multiple epics (one JQL call)
    if (req.query?.keys) {
      const keys = req.query.keys.split(',').map(k => k.trim()).filter(Boolean);
      if (!keys.length) return res.status(200).json({});
      try {
        // Fetch CHILD tickets under each epic.
        // Next-gen projects use the `parent` field; classic projects use the
        // "Epic Link" custom field (customfield_10014).  We cover both with one
        // JQL OR clause and read whichever field is populated per issue.
        const keyList = keys.join(',');
        const epicStats = {};
        keys.forEach(k => { epicStats[k] = { total: 0, done: 0 }; });

        // Helper: tally issues into epicStats
        function tallyIssues(issues) {
          (issues || []).forEach(issue => {
            // next-gen: parent.key
            // classic:  customfield_10014 is a string key
            const parentKey = issue.fields?.parent?.key
                           || (typeof issue.fields?.customfield_10014 === 'string'
                                 ? issue.fields.customfield_10014 : null);
            if (!parentKey || !epicStats[parentKey]) return;
            epicStats[parentKey].total++;
            if (issue.fields?.status?.statusCategory?.key === 'done') {
              epicStats[parentKey].done++;
            }
          });
        }

        // Query 1 — next-gen projects: parent in (keys)
        try {
          const d1 = await jiraPost('/rest/api/3/search/jql', {
            jql:    `parent in (${keyList}) AND issuetype not in ("Epic") ORDER BY key ASC`,
            fields: ['status', 'parent'],
            maxResults: 500
          });
          tallyIssues(d1.issues);
        } catch (_) { /* field not supported — skip */ }

        // Query 2 — classic projects: Epic Link (cf[10014]) in (keys)
        try {
          const d2 = await jiraPost('/rest/api/3/search/jql', {
            jql:    `cf[10014] in (${keyList}) AND issuetype not in ("Epic") ORDER BY key ASC`,
            fields: ['status', 'customfield_10014'],
            maxResults: 500
          });
          tallyIssues(d2.issues);
        } catch (_) { /* field not supported — skip */ }

        const result = {};
        keys.forEach(key => {
          const s = epicStats[key];
          if (!s || s.total === 0) {
            result[key] = { status: 'No tickets', statusCategory: 'new', pct: 0 };
          } else {
            const pct = Math.round((s.done / s.total) * 100);
            result[key] = {
              status:         `${s.done}/${s.total} done`,
              statusCategory: pct === 100 ? 'done' : s.done > 0 ? 'indeterminate' : 'new',
              pct
            };
          }
        });
        return res.status(200).json(result);
      } catch (e) {
        return res.status(500).json({ ok: false, error: e.message });
      }
    }
    // ?key=SDT-123  → single issue
    const key = req.query?.key;
    if (!key) return res.status(400).json({ ok: false, error: 'key or keys required' });
    try {
      const data = await jiraGet(`/rest/api/3/issue/${key}`);
      return res.status(200).json({ ok: true, issue: data });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  // ── POST — create issue ────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const {
      title,
      type            = 'Task',
      description,
      parentKey,      // optional: epic key to set as parent (next-gen) or epic link (classic)
      storyPoints,
      assigneeAccountId,
      project         = DEFAULT_PROJECT,
      sprintId        // optional: assign to sprint immediately after creation
    } = req.body || {};

    if (!title) return res.status(400).json({ ok: false, error: 'title required' });

    const jiraType = TYPE_MAP[type] || 'Task';

    // Jira REST API v3 requires Atlassian Document Format for description
    const descriptionAdf = description ? {
      type: 'doc', version: 1,
      content: [{ type: 'paragraph', content: [{ type: 'text', text: String(description) }] }]
    } : undefined;

    const fields = {
      project:   { key: project },
      summary:   title,
      issuetype: { name: jiraType },
      ...(descriptionAdf             ? { description: descriptionAdf } : {}),
      ...(parentKey                  ? { parent: { key: parentKey } } : {}),
      ...(storyPoints != null        ? { customfield_10016: Number(storyPoints) } : {}),
      ...(assigneeAccountId          ? { assignee: { accountId: assigneeAccountId } } : {}),
      ...(type === 'Spike'           ? { labels: ['spike'] } : {})
    };

    try {
      const result = await jiraPost('/rest/api/3/issue', { fields });

      // If sprintId provided, move issue to that sprint
      if (sprintId && result.key) {
        try {
          await jiraPost(`/rest/agile/1.0/sprint/${sprintId}/issue`, { issues: [result.key] });
        } catch (sprintErr) {
          console.warn('[jira/issue] sprint assign failed:', sprintErr.message);
        }
      }

      return res.status(200).json({ ok: true, key: result.key, id: result.id });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  // ── PUT — update issue ─────────────────────────────────────────────────────
  if (req.method === 'PUT') {
    const { key, title, storyPoints, assigneeAccountId, statusTransitionId } = req.body || {};
    if (!key) return res.status(400).json({ ok: false, error: 'key required' });

    try {
      // Build fields update (only include provided fields)
      const fields = {
        ...(title              != null ? { summary:          title }                          : {}),
        ...(storyPoints        != null ? { customfield_10016: Number(storyPoints) }           : {}),
        ...(assigneeAccountId  != null ? { assignee: { accountId: assigneeAccountId } }       : {})
      };

      if (Object.keys(fields).length) {
        await jiraPut(`/rest/api/3/issue/${key}`, { fields });
      }

      // Status transition (separate call in Jira)
      if (statusTransitionId) {
        await jiraPost(`/rest/api/3/issue/${key}/transitions`, {
          transition: { id: String(statusTransitionId) }
        });
      }

      return res.status(200).json({ ok: true, key });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
