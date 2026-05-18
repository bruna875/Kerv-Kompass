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
        const jql  = `issue in (${keys.join(',')}) ORDER BY key ASC`;
        const data = await jiraPost('/rest/api/3/search', {
          jql, fields: ['status', 'summary'], maxResults: 200
        });
        const result = {};
        (data.issues || []).forEach(issue => {
          const cat = issue.fields?.status?.statusCategory?.key || 'new';
          result[issue.key] = {
            status:         issue.fields?.status?.name || 'Unknown',
            statusCategory: cat,
            pct:            cat === 'done' ? 100 : cat === 'indeterminate' ? 50 : 0
          };
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
      storyPoints,
      assigneeAccountId,
      project         = DEFAULT_PROJECT,
      sprintId        // optional: assign to sprint immediately after creation
    } = req.body || {};

    if (!title) return res.status(400).json({ ok: false, error: 'title required' });

    const jiraType = TYPE_MAP[type] || 'Task';
    const fields = {
      project:   { key: project },
      summary:   title,
      issuetype: { name: jiraType },
      ...(storyPoints != null    ? { customfield_10016: Number(storyPoints) } : {}),
      ...(assigneeAccountId      ? { assignee: { accountId: assigneeAccountId } } : {}),
      ...(type === 'Spike'       ? { labels: ['spike'] } : {})
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
