// api/neon/lookup.js
// Generic CRUD for simple name-only reference tables: teams, drivers, themes
// GET    ?t=teams|drivers|themes  → [{ id, name }] (drivers also returns templateSlug)
// POST   body: { t, name, id?, templateSlug? }   → upsert
// DELETE body: { t, id }          → delete

import { neon }                              from '@neondatabase/serverless';
import { requireAuth, canAccess } from '../_jwt.js';

const ALLOWED = ['teams', 'drivers', 'themes'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = requireAuth(req, res);
  if (!user) return;
  // Writes require editor on roadmap or capacity
  if (req.method !== 'GET') {
    var canEdit = canAccess(user, 'roadmap-neon', 'editor') || canAccess(user, 'teamcapacity-neon', 'editor') || canAccess(user, 'settings-neon', 'editor');
    if (!canEdit) { res.status(403).json({ error: 'Viewer access — read only' }); return; }
  }

  const sql = neon(process.env.DATABASE_URL);

  // ── Pinned links ──────────────────────────────────────────────────────────
  // Detected by: GET ?pageId=... (no ?t=) or POST body.action in pin-*
  const pinAction = (req.body || {}).action || '';

  if (req.method === 'GET' && req.query.pageId && !req.query.t) {
    try {
      await sql`CREATE TABLE IF NOT EXISTS pinned_links (
        id         SERIAL PRIMARY KEY,
        page_id    TEXT NOT NULL,
        label      TEXT NOT NULL,
        url        TEXT NOT NULL,
        sort_order INT  NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      const rows = await sql`
        SELECT id, page_id, label, url, sort_order
        FROM pinned_links WHERE page_id=${req.query.pageId}
        ORDER BY sort_order ASC, id ASC`;
      return res.json(rows);
    } catch(e) { return res.status(500).json({ error: e.message }); }
  }

  if (req.method === 'POST' && ['pin-create','pin-update','pin-delete'].includes(pinAction)) {
    const isAnyEditor = user.superAdmin || Object.values(user.permissions || {}).some(v => v === 'editor');
    if (!isAnyEditor) return res.status(403).json({ error: 'Editor access required' });
    const { pageId, id: pid, label, url } = req.body;
    try {
      await sql`CREATE TABLE IF NOT EXISTS pinned_links (
        id SERIAL PRIMARY KEY, page_id TEXT NOT NULL, label TEXT NOT NULL,
        url TEXT NOT NULL, sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
      if (pinAction === 'pin-create') {
        if (!pageId || !label || !url) return res.status(400).json({ error: 'pageId, label and url required' });
        const mx = await sql`SELECT COALESCE(MAX(sort_order),0) AS m FROM pinned_links WHERE page_id=${pageId}`;
        const ord = (mx[0]?.m ?? 0) + 1;
        const ins = await sql`INSERT INTO pinned_links (page_id,label,url,sort_order) VALUES (${pageId},${label},${url},${ord}) RETURNING id`;
        return res.json({ ok: true, id: ins[0].id });
      }
      if (pinAction === 'pin-update') {
        if (!pid || !label || !url) return res.status(400).json({ error: 'id, label and url required' });
        await sql`UPDATE pinned_links SET label=${label}, url=${url} WHERE id=${Number(pid)}`;
        return res.json({ ok: true });
      }
      if (pinAction === 'pin-delete') {
        if (!pid) return res.status(400).json({ error: 'id required' });
        await sql`DELETE FROM pinned_links WHERE id=${Number(pid)}`;
        return res.json({ ok: true });
      }
    } catch(e) { return res.status(500).json({ error: e.message }); }
  }
  // ── End pinned links ──────────────────────────────────────────────────────

  // ── Jira Projects Mapping ─────────────────────────────────────────────────
  const tParam = (req.body || {}).t || req.query?.t;
  if (tParam === 'jira-projects') {
    const canEdit = user.superAdmin || canAccess(user, 'settings-neon', 'editor');

    if (req.method === 'GET') {
      try {
        await sql`CREATE TABLE IF NOT EXISTS jira_projects (
          id         SERIAL PRIMARY KEY,
          jira_id    TEXT NOT NULL,
          team_name  TEXT NOT NULL,
          board_type TEXT NOT NULL DEFAULT 'scrum',
          sort_order INT  NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`;
        // Add board_type column to existing tables that predate this migration
        await sql`ALTER TABLE jira_projects ADD COLUMN IF NOT EXISTS board_type TEXT NOT NULL DEFAULT 'scrum'`;
        const rows = await sql`SELECT id, jira_id, team_name, board_type, sort_order FROM jira_projects ORDER BY sort_order ASC, id ASC`;
        return res.status(200).json(rows);
      } catch(e) { return res.status(500).json({ error: e.message }); }
    }

    if (!canEdit) return res.status(403).json({ error: 'Editor access required' });

    if (req.method === 'POST') {
      const { id, jira_id, team_name, board_type, sort_order } = req.body;
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
      } catch(e) { return res.status(500).json({ error: e.message }); }
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      try {
        await sql`DELETE FROM jira_projects WHERE id=${id}`;
        return res.status(200).json({ ok: true });
      } catch(e) { return res.status(500).json({ error: e.message }); }
    }
  }
  // ── End Jira Projects Mapping ─────────────────────────────────────────────

  // ── Sprint Dashboards ─────────────────────────────────────────────────────
  const tParam2 = (req.body || {}).t || req.query?.t;
  if (tParam2 === 'sprint-dashboards') {
    const canEdit = user.superAdmin || canAccess(user, 'settings-neon', 'editor');

    if (req.method === 'GET') {
      try {
        await sql`CREATE TABLE IF NOT EXISTS sprint_dashboards (
          id           SERIAL PRIMARY KEY,
          name         TEXT NOT NULL,
          project_keys TEXT NOT NULL DEFAULT '[]',
          sort_order   INT  NOT NULL DEFAULT 0,
          created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`;
        const rows = await sql`SELECT id, name, project_keys, sort_order FROM sprint_dashboards ORDER BY sort_order ASC, id ASC`;
        return res.status(200).json(rows);
      } catch(e) { return res.status(500).json({ error: e.message }); }
    }

    if (!canEdit) return res.status(403).json({ error: 'Editor access required' });

    if (req.method === 'POST') {
      const { id, name, project_keys } = req.body;
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
      } catch(e) { return res.status(500).json({ error: e.message }); }
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      try {
        await sql`DELETE FROM sprint_dashboards WHERE id=${id}`;
        return res.status(200).json({ ok: true });
      } catch(e) { return res.status(500).json({ error: e.message }); }
    }
  }
  // ── End Sprint Dashboards ─────────────────────────────────────────────────

  function table(t) {
    if (!ALLOWED.includes(t)) throw new Error('Invalid table: ' + t);
    return t;
  }

  // ── GET ──────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const t = table(req.query.t);
      let rows;
      if (t === 'teams') {
        try {
          rows = await sql`SELECT id, name, description FROM teams ORDER BY name ASC`;
        } catch(e) {
          // description column not yet migrated — fall back gracefully
          const base = await sql`SELECT id, name FROM teams ORDER BY name ASC`;
          rows = base.map(function(r) { return Object.assign({}, r, { description: '' }); });
        }
      }
      if (t === 'drivers') rows = await sql`SELECT id, name, template_slug AS "templateSlug" FROM drivers ORDER BY name ASC`;
      if (t === 'themes')  rows = await sql`SELECT id, name FROM themes  ORDER BY name ASC`;
      return res.status(200).json(rows);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  // ── POST (upsert) ─────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    try {
      const { t: tRaw, id, name, templateSlug, description } = req.body;
      const t = table(tRaw);
      if (!name) return res.status(400).json({ error: 'name required' });
      const slug = templateSlug || '';
      const desc = description ?? '';

      let rows;
      if (id) {
        if (t === 'teams') {
          // Fetch old name first so we can cascade the rename to initiatives
          let oldName = null;
          try {
            const oldRows = await sql`SELECT name FROM teams WHERE id=${id}`;
            oldName = oldRows[0]?.name ?? null;
          } catch(e) { /* ignore */ }

          try {
            rows = await sql`UPDATE teams SET name=${name}, description=${desc} WHERE id=${id} RETURNING id`;
          } catch(e) {
            rows = await sql`UPDATE teams SET name=${name} WHERE id=${id} RETURNING id`;
          }

          // Cascade rename to initiatives and team_budget so capacity stays intact
          if (oldName && oldName !== name) {
            try {
              await sql`UPDATE initiatives SET team=${name} WHERE team=${oldName}`;
            } catch(e) { /* non-fatal */ }
            try {
              await sql`UPDATE team_budget SET team=${name} WHERE team=${oldName}`;
            } catch(e) { /* non-fatal */ }
          }
        }
        if (t === 'drivers') rows = await sql`UPDATE drivers SET name=${name}, template_slug=${slug} WHERE id=${id} RETURNING id`;
        if (t === 'themes')  rows = await sql`UPDATE themes  SET name=${name} WHERE id=${id} RETURNING id`;
      } else {
        if (t === 'teams') {
          try {
            rows = await sql`INSERT INTO teams (name, description) VALUES (${name}, ${desc}) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name, description=${desc} RETURNING id`;
          } catch(e) {
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

  // ── DELETE ────────────────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    try {
      const { t: tRaw, id } = req.body;
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
