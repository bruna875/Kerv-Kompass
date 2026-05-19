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

  if (req.method === 'GET') {
    try {
      const rows = await sql`
        SELECT id, name, title, picture_url AS "pictureUrl", role, team_id AS "teamId", team_ids AS "teamIdsRaw"
        FROM team_members
        ORDER BY name ASC
      `;
      return res.status(200).json(rows.map(r => {
        let teamIds = [];
        try { teamIds = JSON.parse(r.teamIdsRaw) || []; } catch(e) {}
        if (teamIds.length === 0 && r.teamId) teamIds = [r.teamId]; // backward compat
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
      if (!name) return res.status(400).json({ error: 'name required' });
      const teamIdsArr  = Array.isArray(teamIds) ? teamIds.map(Number) : [];
      const teamIdsJson = JSON.stringify(teamIdsArr);
      const primaryTeamId = teamIdsArr.length > 0 ? teamIdsArr[0] : null;
      let rows;
      if (id) {
        rows = await sql`
          UPDATE team_members
          SET name        = ${name},
              title       = ${title ?? ''},
              picture_url = ${pictureUrl ?? ''},
              role        = ${role ?? 'Product'},
              team_id     = ${primaryTeamId},
              team_ids    = ${teamIdsJson}
          WHERE id = ${id}
          RETURNING id
        `;
      } else {
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
