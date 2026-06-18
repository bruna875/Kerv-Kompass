// api/neon/lookup.js
// Reference tables: teams, drivers, themes
// GET    ?t=teams|drivers|themes  → list rows
// POST   { t, name, id?, ... }    → upsert
// DELETE { t, id }                → delete

import { neon }                   from '@neondatabase/serverless';
import { requireAuth, canAccess } from '../_jwt.js';

const ALLOWED = ['teams', 'drivers', 'themes'];

function table(t) {
  if (!ALLOWED.includes(t)) throw new Error('Invalid table: ' + t);
  return t;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = requireAuth(req, res);
  if (!user) return;

  if (req.method !== 'GET') {
    const canEdit = canAccess(user, 'roadmap-neon', 'editor')
      || canAccess(user, 'teamcapacity-neon', 'editor')
      || canAccess(user, 'settings-neon', 'editor');
    if (!canEdit) return res.status(403).json({ error: 'Viewer access — read only' });
  }

  const sql = neon(process.env.DATABASE_URL);

  // ── GET ────────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const t = table(req.query.t);
      let rows;
      if (t === 'teams') {
        try {
          rows = await sql`SELECT id, name, description FROM teams ORDER BY name ASC`;
        } catch (e) {
          const base = await sql`SELECT id, name FROM teams ORDER BY name ASC`;
          rows = base.map(r => ({ ...r, description: '' }));
        }
      }
      if (t === 'drivers') rows = await sql`SELECT id, name, template_slug AS "templateSlug" FROM drivers ORDER BY name ASC`;
      if (t === 'themes')  rows = await sql`SELECT id, name FROM themes ORDER BY name ASC`;
      return res.status(200).json(rows);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  // ── POST (upsert) ──────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    try {
      const { t: tRaw, id, name, templateSlug, description } = req.body || {};
      const t    = table(tRaw);
      const slug = templateSlug || '';
      const desc = description ?? '';
      if (!name) return res.status(400).json({ error: 'name required' });

      let rows;
      if (id) {
        if (t === 'teams') {
          let oldName = null;
          try { const r = await sql`SELECT name FROM teams WHERE id=${id}`; oldName = r[0]?.name ?? null; } catch (e) {}
          try {
            rows = await sql`UPDATE teams SET name=${name}, description=${desc} WHERE id=${id} RETURNING id`;
          } catch (e) {
            rows = await sql`UPDATE teams SET name=${name} WHERE id=${id} RETURNING id`;
          }
          if (oldName && oldName !== name) {
            try { await sql`UPDATE initiatives SET team=${name} WHERE team=${oldName}`; } catch (e) {}
            try { await sql`UPDATE team_budget  SET team=${name} WHERE team=${oldName}`; } catch (e) {}
          }
        }
        if (t === 'drivers') {
          let oldDriver = null;
          try { const r = await sql`SELECT name FROM drivers WHERE id=${id}`; oldDriver = r[0]?.name ?? null; } catch (e) {}
          rows = await sql`UPDATE drivers SET name=${name}, template_slug=${slug} WHERE id=${id} RETURNING id`;
          if (oldDriver && oldDriver !== name) {
            try { await sql`UPDATE initiatives SET driver=${name} WHERE driver=${oldDriver}`; } catch (e) {}
          }
        }
        if (t === 'themes') rows = await sql`UPDATE themes SET name=${name} WHERE id=${id} RETURNING id`;
      } else {
        if (t === 'teams') {
          try {
            rows = await sql`INSERT INTO teams (name, description) VALUES (${name}, ${desc}) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name, description=${desc} RETURNING id`;
          } catch (e) {
            rows = await sql`INSERT INTO teams (name) VALUES (${name}) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id`;
          }
        }
        if (t === 'drivers') rows = await sql`INSERT INTO drivers (name, template_slug) VALUES (${name}, ${slug}) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name, template_slug=${slug} RETURNING id`;
        if (t === 'themes')  rows = await sql`INSERT INTO themes  (name) VALUES (${name}) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id`;
      }
      return res.status(200).json({ ok: true, id: rows[0]?.id });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── DELETE ─────────────────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    try {
      const { t: tRaw, id } = req.body || {};
      const t = table(tRaw);
      if (!id) return res.status(400).json({ error: 'id required' });
      if (t === 'teams')   await sql`DELETE FROM teams   WHERE id=${id}`;
      if (t === 'drivers') await sql`DELETE FROM drivers WHERE id=${id}`;
      if (t === 'themes')  await sql`DELETE FROM themes  WHERE id=${id}`;
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
