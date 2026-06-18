// api/neon/pinned-links.js
// GET    ?pageId=X → list pinned links for a page
// POST   { action:'pin-create', pageId, label, url } → create
// POST   { action:'pin-update', id, label, url }     → update
// POST   { action:'pin-delete', id }                 → delete

import { neon }                   from '@neondatabase/serverless';
import { requireAuth, canAccess } from '../_jwt.js';

async function ensureTable(sql) {
  await sql`CREATE TABLE IF NOT EXISTS pinned_links (
    id         SERIAL PRIMARY KEY,
    page_id    TEXT NOT NULL,
    label      TEXT NOT NULL,
    url        TEXT NOT NULL,
    sort_order INT  NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = requireAuth(req, res);
  if (!user) return;

  const sql = neon(process.env.DATABASE_URL);
  await ensureTable(sql);

  if (req.method === 'GET') {
    const { pageId } = req.query;
    if (!pageId) return res.status(400).json({ error: 'pageId required' });
    try {
      const rows = await sql`
        SELECT id, page_id, label, url, sort_order
        FROM pinned_links WHERE page_id=${pageId}
        ORDER BY sort_order ASC, id ASC
      `;
      return res.json(rows);
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  if (req.method === 'POST') {
    const isAnyEditor = user.superAdmin || Object.values(user.permissions || {}).some(v => v === 'editor');
    if (!isAnyEditor) return res.status(403).json({ error: 'Editor access required' });

    const { action, pageId, id, label, url } = req.body || {};

    try {
      if (action === 'pin-create') {
        if (!pageId || !label || !url) return res.status(400).json({ error: 'pageId, label and url required' });
        const mx = await sql`SELECT COALESCE(MAX(sort_order),0) AS m FROM pinned_links WHERE page_id=${pageId}`;
        const ord = (mx[0]?.m ?? 0) + 1;
        const ins = await sql`INSERT INTO pinned_links (page_id, label, url, sort_order) VALUES (${pageId}, ${label}, ${url}, ${ord}) RETURNING id`;
        return res.json({ ok: true, id: ins[0].id });
      }

      if (action === 'pin-update') {
        if (!id || !label || !url) return res.status(400).json({ error: 'id, label and url required' });
        await sql`UPDATE pinned_links SET label=${label}, url=${url} WHERE id=${Number(id)}`;
        return res.json({ ok: true });
      }

      if (action === 'pin-delete') {
        if (!id) return res.status(400).json({ error: 'id required' });
        await sql`DELETE FROM pinned_links WHERE id=${Number(id)}`;
        return res.json({ ok: true });
      }

      return res.status(400).json({ error: 'Unknown action' });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
