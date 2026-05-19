// api/neon/jira-projects.js
// GET    → fetch all jira project mappings
// POST   → create (no id) or update (with id)
// DELETE → delete by id

import { neon }                       from '@neondatabase/serverless';
import { requireAuth, requireEditor } from '../_jwt.js';

const INIT_SQL = `
  CREATE TABLE IF NOT EXISTS jira_projects (
    id         SERIAL PRIMARY KEY,
    jira_id    TEXT NOT NULL,
    team_name  TEXT NOT NULL,
    sort_order INT  NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = requireAuth(req, res);
  if (!user) return;
  if (req.method !== 'GET' && !requireEditor(user, 'settings-neon', res)) return;

  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'GET') {
    try {
      await sql.unsafe(INIT_SQL);
      const rows = await sql`
        SELECT id, jira_id, team_name, sort_order
        FROM jira_projects
        ORDER BY sort_order ASC, id ASC
      `;
      return res.status(200).json(rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { id, jira_id, team_name, sort_order } = req.body;
      if (!jira_id) return res.status(400).json({ error: 'jira_id required' });
      if (!team_name) return res.status(400).json({ error: 'team_name required' });
      var rows;
      if (id) {
        rows = await sql`
          UPDATE jira_projects
          SET jira_id=${jira_id}, team_name=${team_name}, sort_order=${sort_order != null ? sort_order : 0}
          WHERE id=${id}
          RETURNING id
        `;
      } else {
        rows = await sql`
          INSERT INTO jira_projects (jira_id, team_name, sort_order)
          VALUES (${jira_id}, ${team_name}, ${sort_order != null ? sort_order : 0})
          RETURNING id
        `;
      }
      return res.status(200).json({ ok: true, id: rows[0]?.id });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      await sql`DELETE FROM jira_projects WHERE id=${id}`;
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
