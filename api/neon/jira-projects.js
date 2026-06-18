// api/neon/jira-projects.js
// GET    → list all jira project mappings
// POST   → create or update a mapping (body: { id?, jira_id, team_name, board_type, sort_order })
// DELETE → delete a mapping (body: { id })

import { neon }                   from '@neondatabase/serverless';
import { requireAuth, canAccess } from '../_jwt.js';

async function ensureTable(sql) {
  await sql`CREATE TABLE IF NOT EXISTS jira_projects (
    id         SERIAL PRIMARY KEY,
    jira_id    TEXT NOT NULL,
    team_name  TEXT NOT NULL,
    board_type TEXT NOT NULL DEFAULT 'scrum',
    sort_order INT  NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`ALTER TABLE jira_projects ADD COLUMN IF NOT EXISTS board_type TEXT NOT NULL DEFAULT 'scrum'`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = requireAuth(req, res);
  if (!user) return;

  const sql = neon(process.env.DATABASE_URL);
  await ensureTable(sql);

  if (req.method === 'GET') {
    try {
      const rows = await sql`SELECT id, jira_id, team_name, board_type, sort_order FROM jira_projects ORDER BY sort_order ASC, id ASC`;
      return res.status(200).json(rows);
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  const canEdit = user.superAdmin || canAccess(user, 'settings-neon', 'editor');
  if (!canEdit) return res.status(403).json({ error: 'Editor access required' });

  if (req.method === 'POST') {
    const { id, jira_id, team_name, board_type, sort_order } = req.body || {};
    if (!jira_id || !team_name) return res.status(400).json({ error: 'jira_id and team_name required' });
    const bType = (board_type === 'kanban') ? 'kanban' : 'scrum';
    try {
      let rows;
      if (id) {
        rows = await sql`UPDATE jira_projects SET jira_id=${jira_id}, team_name=${team_name}, board_type=${bType}, sort_order=${sort_order ?? 0} WHERE id=${id} RETURNING id`;
      } else {
        rows = await sql`INSERT INTO jira_projects (jira_id, team_name, board_type, sort_order) VALUES (${jira_id}, ${team_name}, ${bType}, ${sort_order ?? 0}) RETURNING id`;
      }
      return res.status(200).json({ ok: true, id: rows[0]?.id });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id required' });
    try {
      await sql`DELETE FROM jira_projects WHERE id=${id}`;
      return res.status(200).json({ ok: true });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
