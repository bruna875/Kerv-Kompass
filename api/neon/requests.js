// api/neon/requests.js
// GET  ?action=lookup  → { teams, themes }  (NO AUTH — public form)
// GET                  → list all requests  (auth: any)
// POST { action:'pr-submit', ... }           → insert request (NO AUTH — public form)
// POST { action:'pr-promote', id, initiative_id? }
// POST { action:'pr-promote-story', id }
// POST { action:'pr-park', id }
// POST { action:'pr-pending', id }
// POST { action:'pr-archive', id }

import { neon }                   from '@neondatabase/serverless';
import { requireAuth, canAccess } from '../_jwt.js';

const VALID_PRIORITIES = ['critical', 'high', 'medium', 'low', 'nice-to-have'];

async function ensureTable(sql) {
  await sql`CREATE TABLE IF NOT EXISTS product_requests (
    id                     SERIAL PRIMARY KEY,
    title                  TEXT NOT NULL,
    description            TEXT,
    requester_name         TEXT NOT NULL,
    requester_email        TEXT,
    team                   TEXT,
    theme                  TEXT,
    priority               TEXT NOT NULL DEFAULT 'medium',
    notes                  TEXT,
    status                 TEXT NOT NULL DEFAULT 'pending',
    promoted_initiative_id INT,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const sql = neon(process.env.DATABASE_URL);
  const body   = req.body || {};
  const action = body.action || req.query?.action || '';

  // ── No-auth: public form — teams + themes lookup ───────────────────────────
  if (req.method === 'GET' && action === 'lookup') {
    try {
      const [teams, themes] = await Promise.all([
        sql`SELECT id, name FROM teams  ORDER BY name ASC`,
        sql`SELECT id, name FROM themes ORDER BY name ASC`
      ]);
      return res.status(200).json({ teams, themes });
    } catch (e) {
      return res.status(200).json({ teams: [], themes: [] });
    }
  }

  // ── No-auth: public form — submit new request ──────────────────────────────
  if (req.method === 'POST' && action === 'pr-submit') {
    const { title, description, requester_name, requester_email, team, theme, priority, notes } = body;
    if (!title || !title.trim())                   return res.status(400).json({ error: 'Title is required' });
    if (!requester_name || !requester_name.trim()) return res.status(400).json({ error: 'Name is required' });
    const pri = VALID_PRIORITIES.includes(priority) ? priority : 'medium';
    try {
      await ensureTable(sql);
      const rows = await sql`
        INSERT INTO product_requests
          (title, description, requester_name, requester_email, team, theme, priority, notes)
        VALUES
          (${title.trim()}, ${description || null}, ${requester_name.trim()},
           ${requester_email || null}, ${team || null}, ${theme || null}, ${pri}, ${notes || null})
        RETURNING id
      `;
      return res.status(200).json({ ok: true, id: rows[0].id });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── All other routes require auth ──────────────────────────────────────────
  const user = requireAuth(req, res);
  if (!user) return;

  // ── Auth: list product requests ────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      await ensureTable(sql);
      const rows = await sql`
        SELECT id, title, description,
               requester_name  AS "requesterName",
               requester_email AS "requesterEmail",
               team, theme, priority, notes, status,
               promoted_initiative_id AS "promotedInitiativeId",
               created_at AS "createdAt", updated_at AS "updatedAt"
        FROM product_requests ORDER BY created_at DESC
      `;
      return res.status(200).json(rows);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── Auth: status-change actions ────────────────────────────────────────────
  if (req.method === 'POST') {
    const canEdit = user.superAdmin || canAccess(user, 'product-ideas', 'editor') || canAccess(user, 'roadmap-neon', 'editor');
    const { id, initiative_id } = body;

    if (['pr-promote','pr-promote-story','pr-park','pr-pending','pr-archive'].includes(action)) {
      if (!canEdit) return res.status(403).json({ error: 'Editor access required' });
      if (!id)      return res.status(400).json({ error: 'id required' });
      try {
        await ensureTable(sql);
        if (action === 'pr-promote') {
          await sql`UPDATE product_requests SET status='promoted_to_initiative', promoted_initiative_id=${initiative_id || null}, updated_at=NOW() WHERE id=${id}`;
        } else if (action === 'pr-promote-story') {
          await sql`UPDATE product_requests SET status='promoted_to_story', updated_at=NOW() WHERE id=${id}`;
        } else if (action === 'pr-park') {
          await sql`UPDATE product_requests SET status='parked', updated_at=NOW() WHERE id=${id}`;
        } else if (action === 'pr-pending') {
          await sql`UPDATE product_requests SET status='pending', updated_at=NOW() WHERE id=${id}`;
        } else if (action === 'pr-archive') {
          await sql`UPDATE product_requests SET status='archived', updated_at=NOW() WHERE id=${id}`;
        }
        return res.status(200).json({ ok: true });
      } catch (e) {
        return res.status(500).json({ error: e.message });
      }
    }

    return res.status(400).json({ error: 'Unknown action' });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
