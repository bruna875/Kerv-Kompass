// api/neon/team-members.js
// GET    → all members (with teamId)
// POST   → create (no id) or update (with id)
// DELETE → delete by id

import { neon }                       from '@neondatabase/serverless';
import { requireAuth, requireEditor } from '../_jwt.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = requireAuth(req, res);
  if (!user) return;
  if (req.method !== 'GET' && !requireEditor(user, 'teamcapacity-neon', res)) return;

  const sql = neon(process.env.DATABASE_URL);

  // ── Auto-migrate: add user_id FK + auto-link by inferred email ────────────
  await sql`ALTER TABLE team_members ADD COLUMN IF NOT EXISTS user_id INTEGER DEFAULT NULL`;
  // Auto-link members that match a users row by inferred email (idempotent)
  await sql`
    UPDATE team_members tm
    SET user_id = u.id
    FROM users u
    WHERE tm.user_id IS NULL
      AND LOWER(LEFT(TRIM(tm.name), 1))
          || REGEXP_REPLACE(LOWER(TRIM(SUBSTRING(tm.name FROM POSITION(' ' IN tm.name) + 1))), '[^a-z]', '', 'g')
          || '@kerv.ai' = LOWER(u.email)
  `;
  // Fallback: auto-link by exact full name match (handles users whose email format differs)
  await sql`
    UPDATE team_members tm
    SET user_id = u.id
    FROM users u
    WHERE tm.user_id IS NULL
      AND LOWER(TRIM(tm.name)) = LOWER(TRIM(u.first_name || ' ' || u.last_name))
  `;
  // Reverse-sync: backfill users.department/job_title/photo_url from linked team_members when blank
  await sql`
    UPDATE users u
    SET
      department = CASE WHEN COALESCE(TRIM(u.department), '') = '' THEN COALESCE(TRIM(tm.role), '') ELSE u.department END,
      job_title  = CASE WHEN COALESCE(TRIM(u.job_title),  '') = '' THEN COALESCE(TRIM(tm.title), '')        ELSE u.job_title  END,
      photo_url  = CASE WHEN COALESCE(TRIM(u.photo_url),  '') = '' THEN COALESCE(TRIM(tm.picture_url), '')  ELSE u.photo_url  END
    FROM team_members tm
    WHERE tm.user_id = u.id
      AND (
        COALESCE(TRIM(u.department), '') = '' OR
        COALESCE(TRIM(u.job_title),  '') = '' OR
        COALESCE(TRIM(u.photo_url),  '') = ''
      )
  `;
  // Auto-import users with Product/Tech/Design department who have no team_member yet
  await sql`
    INSERT INTO team_members (name, title, picture_url, role, team_id, team_ids, user_id)
    SELECT
      TRIM(u.first_name || ' ' || u.last_name),
      COALESCE(u.job_title, ''),
      COALESCE(u.photo_url, ''),
      u.department,
      NULL,
      '[]',
      u.id
    FROM users u
    WHERE u.department IN ('Product', 'Tech', 'Design')
      AND TRIM(u.first_name || ' ' || u.last_name) != ''
      AND NOT EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = u.id)
    ON CONFLICT DO NOTHING
  `;

  if (req.method === 'GET') {
    try {
      // LEFT JOIN with users: if user_id is set, override profile fields from users
      const rows = await sql`
        SELECT
          tm.id,
          tm.team_id    AS "teamId",
          tm.team_ids   AS "teamIdsRaw",
          tm.user_id    AS "userId",
          -- profile: prefer users row when linked
          COALESCE(u.first_name || ' ' || u.last_name, tm.name)   AS name,
          COALESCE(NULLIF(u.job_title, ''), tm.title)              AS title,
          COALESCE(NULLIF(u.photo_url, ''), tm.picture_url)        AS "pictureUrl",
          COALESCE(NULLIF(u.department, ''), tm.role)              AS role
        FROM team_members tm
        LEFT JOIN users u ON u.id = tm.user_id
        ORDER BY name ASC
      `;
      return res.status(200).json(rows.map(r => {
        let teamIds = [];
        try { teamIds = JSON.parse(r.teamIdsRaw) || []; } catch(e) {}
        if (teamIds.length === 0 && r.teamId) teamIds = [r.teamId];
        const { teamIdsRaw, ...rest } = r;
        return { ...rest, teamIds };
      }));
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { id, name, title, pictureUrl, role, teamIds } = req.body;
      const teamIdsArr    = Array.isArray(teamIds) ? teamIds.map(Number) : [];
      const teamIdsJson   = JSON.stringify(teamIdsArr);
      const primaryTeamId = teamIdsArr.length > 0 ? teamIdsArr[0] : null;
      let rows;
      if (id) {
        // Check if linked to a user — if so, only update team fields
        const linked = await sql`SELECT user_id FROM team_members WHERE id = ${id}`;
        const isLinked = linked.length > 0 && linked[0].user_id !== null;
        if (isLinked) {
          rows = await sql`
            UPDATE team_members SET team_id = ${primaryTeamId}, team_ids = ${teamIdsJson}
            WHERE id = ${id} RETURNING id
          `;
        } else {
          if (!name) return res.status(400).json({ error: 'name required' });
          rows = await sql`
            UPDATE team_members
            SET name = ${name}, title = ${title ?? ''}, picture_url = ${pictureUrl ?? ''},
                role = ${role ?? 'Product'}, team_id = ${primaryTeamId}, team_ids = ${teamIdsJson}
            WHERE id = ${id} RETURNING id
          `;
        }
      } else {
        if (!name) return res.status(400).json({ error: 'name required' });
        rows = await sql`
          INSERT INTO team_members (name, title, picture_url, role, team_id, team_ids)
          VALUES (${name}, ${title ?? ''}, ${pictureUrl ?? ''}, ${role ?? 'Product'}, ${primaryTeamId}, ${teamIdsJson})
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
      await sql`DELETE FROM team_members WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
