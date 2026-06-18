// api/neon/dashboards.js
// GET    → list all sprint dashboards
// POST   → create or update (body: { id?, name, project_keys })
// DELETE → delete (body: { id })

import { neon }                   from '@neondatabase/serverless';
import { requireAuth, canAccess } from '../_jwt.js';

async function ensureTable(sql) {
  await sql`CREATE TABLE IF NOT EXISTS sprint_dashboards (
    id           SERIAL PRIMARY KEY,
    name         TEXT NOT NULL,
    project_keys TEXT NOT NULL DEFAULT '[]',
    sort_order   INT  NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
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
      const rows = await sql`SELECT id, name, project_keys, sort_order FROM sprint_dashboards ORDER BY sort_order ASC, id ASC`;
      return res.status(200).json(rows);
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  const canEdit = user.superAdmin || canAccess(user, 'settings-neon', 'editor');
  if (!canEdit) return res.status(403).json({ error: 'Editor access required' });

  if (req.method === 'POST') {
    const { id, name, project_keys } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name required' });
    const keysJson = typeof project_keys === 'string' ? project_keys : JSON.stringify(project_keys || []);
    try {
      let rows;
      if (id) {
        rows = await sql`UPDATE sprint_dashboards SET name=${name}, project_keys=${keysJson} WHERE id=${id} RETURNING id`;
      } else {
        const mx = await sql`SELECT COALESCE(MAX(sort_order),0) AS m FROM sprint_dashboards`;
        const ord = (mx[0]?.m ?? 0) + 1;
        rows = await sql`INSERT INTO sprint_dashboards (name, project_keys, sort_order) VALUES (${name}, ${keysJson}, ${ord}) RETURNING id`;
      }
      return res.status(200).json({ ok: true, id: rows[0]?.id });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id required' });
    try {
      await sql`DELETE FROM sprint_dashboards WHERE id=${id}`;
      return res.status(200).json({ ok: true });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
