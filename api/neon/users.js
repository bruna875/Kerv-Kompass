// api/neon/users.js
// GET    → list all users (no password_hash)
// POST   → create or update (module_permissions: { [moduleId]: 'admin'|'team_member'|'viewer' })
// POST   → invite actions: { action:'send', userId } | { action:'validate', token } | { action:'set', token, password }
// DELETE → delete user (body: { id })

import { neon }                    from '@neondatabase/serverless';
import { createHash, randomBytes } from 'crypto';
import { signJwt, requireAuth }    from '../_jwt.js';

function sha256(str) {
  return createHash('sha256').update(str).digest('hex');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── Auth guard — public: login, validate (invite), set (invite) ─────────────
  const PUBLIC_ACTIONS = ['login', 'validate', 'set'];
  const reqAction = (req.body && req.body.action) || null;
  if (!(reqAction && PUBLIC_ACTIONS.includes(reqAction))) {
    const authUser = requireAuth(req, res);
    if (!authUser) return;
  }

  const sql = neon(process.env.DATABASE_URL);

  // Auto-create / migrate table
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id                  SERIAL PRIMARY KEY,
      first_name          VARCHAR(100) NOT NULL DEFAULT '',
      last_name           VARCHAR(100) NOT NULL DEFAULT '',
      email               VARCHAR(255) UNIQUE NOT NULL,
      password_hash       VARCHAR(255) NOT NULL DEFAULT '',
      module_permissions  JSONB        NOT NULL DEFAULT '{}',
      created_at          TIMESTAMPTZ  DEFAULT NOW(),
      updated_at          TIMESTAMPTZ  DEFAULT NOW()
    )
  `;
  // Drop legacy columns if they exist from an older schema
  await sql`ALTER TABLE users DROP COLUMN IF EXISTS role`;
  await sql`ALTER TABLE users DROP COLUMN IF EXISTS modules`;
  // Add module_permissions if missing (migration from old schema)
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS module_permissions JSONB NOT NULL DEFAULT '{}'`;

  // ── GET ─────────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const rows = await sql`
        SELECT
          id,
          first_name          AS "firstName",
          last_name           AS "lastName",
          email,
          module_permissions  AS "modulePermissions",
          created_at          AS "createdAt"
        FROM users
        ORDER BY id ASC
      `;
      return res.status(200).json(rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST: actions ─────────────────────────────────────────────────────────────
  if (req.method === 'POST' && req.body && req.body.action) {
    const { action, userId, token, password } = req.body;

    // ── login ────────────────────────────────────────────────────────────────
    if (action === 'login') {
      const { email: loginEmail, password: loginPw } = req.body;
      if (!loginEmail || !loginPw) return res.status(400).json({ error: 'Email and password required' });

      const emailLow = loginEmail.toLowerCase().trim();
      const hash     = sha256(loginPw.trim());

      const dbRows = await sql`
        SELECT id, first_name, last_name, email, password_hash, module_permissions
        FROM users WHERE LOWER(email) = ${emailLow}
      `;

      let userData = null;

      if (dbRows.length && dbRows[0].password_hash === hash) {
        const u = dbRows[0];
        userData = {
          userId:      u.id,
          email:       u.email,
          firstName:   u.first_name,
          lastName:    u.last_name,
          permissions: u.module_permissions || {}
        };
      } else if (emailLow === 'product@kerv.ai' && hash === sha256('roadmap')) {
        // Demo super-admin fallback
        const perms = {};
        ['overview','roadmap-neon','settings-neon','teamcapacity-neon','sdt-sprint-analysis',
         'api-team','ads-team','kervone-team','shared-team','reporting-team','product-ideas','admin-users']
          .forEach(function(m) { perms[m] = 'editor'; });
        userData = { userId: 0, email: emailLow, firstName: 'Product', lastName: '', permissions: perms, superAdmin: true };
      }

      if (!userData) return res.status(401).json({ error: 'Invalid credentials' });

      const jwtToken = signJwt(userData);
      return res.status(200).json(Object.assign({ ok: true, token: jwtToken }, userData));
    }

    // Ensure invite columns exist
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS invite_token   VARCHAR(64)`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS invite_expires TIMESTAMPTZ`;

    if (action === 'send') {
      if (!userId) return res.status(400).json({ error: 'userId required' });
      const rows = await sql`SELECT id, first_name, last_name, email FROM users WHERE id = ${userId}`;
      if (!rows.length) return res.status(404).json({ error: 'User not found' });
      const u = rows[0];

      const inviteToken = randomBytes(32).toString('hex');
      const expires     = new Date(Date.now() + 72 * 60 * 60 * 1000);
      await sql`UPDATE users SET invite_token = ${inviteToken}, invite_expires = ${expires} WHERE id = ${userId}`;

      const baseUrl    = process.env.NEXT_PUBLIC_BASE_URL || 'https://kerv-dashboard.vercel.app';
      const inviteLink = `${baseUrl}/invite?token=${inviteToken}`;
      const from       = process.env.RESEND_FROM || 'KERV Team <onboarding@resend.dev>';
      const apiKey     = process.env.RESEND_API_KEY;
      if (!apiKey) return res.status(500).json({ error: 'RESEND_API_KEY not configured' });

      const emailBody = {
        from,
        to:      u.email,
        subject: `You've been invited to KERV Team`,
        html: `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background:#F0EEE8">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0EEE8;padding:40px 0">
            <tr><td align="center">
              <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08)">
                <tr><td style="background:#ED005E;height:4px;font-size:0">&nbsp;</td></tr>
                <tr><td style="padding:28px 36px 20px">
                  <table cellpadding="0" cellspacing="0"><tr>
                    <td style="padding-right:10px;vertical-align:middle">
                      <img src="https://res.cloudinary.com/dhfrgr4qd/image/upload/v1775830255/Kerv-Logo-1-1_bl2xdt.jpg" width="28" height="28" style="border-radius:6px;display:block"/>
                    </td>
                    <td style="vertical-align:middle;font-size:14px;font-weight:600;color:#0D1E36;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">KERV Team</td>
                  </tr></table>
                </td></tr>
                <tr><td style="padding:0 36px"><div style="height:1px;background:rgba(0,0,0,0.07)"></div></td></tr>
                <tr><td style="padding:28px 36px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
                  <p style="margin:0 0 20px;font-size:14px;color:#0D1E36;line-height:1.7">
                    Hi ${u.first_name || 'there'},<br/><br/>
                    Your account has been created on KERV Dashboard Team.<br/>
                    Click the button below to set your password and start working.
                  </p>
                  <table cellpadding="0" cellspacing="0" style="margin-bottom:24px"><tr>
                    <td style="background:#ED005E;border-radius:8px">
                      <a href="${inviteLink}" style="display:inline-block;padding:12px 24px;font-size:13px;font-weight:600;color:#ffffff;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">Set your password &nbsp;→</a>
                    </td>
                  </tr></table>
                  <p style="margin:0 0 24px;font-size:11px;color:#A8A8A0;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
                    Or copy this link into your browser:<br/>
                    <span style="color:#ED005E;word-break:break-all">${inviteLink}</span>
                  </p>
                </td></tr>
                <tr><td style="padding:0 36px"><div style="height:1px;background:rgba(0,0,0,0.07)"></div></td></tr>
                <tr><td style="padding:18px 36px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
                  <p style="margin:0;font-size:11px;color:#A8A8A0;line-height:1.6">
                    This link expires in <strong style="color:#6B6B65">72 hours</strong>.<br/>
                    If you weren't expecting this invitation, you can safely ignore this email.
                  </p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body></html>`
      };

      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(emailBody)
      });
      if (!emailRes.ok) {
        const err = await emailRes.json().catch(() => ({}));
        return res.status(500).json({ error: 'Email failed: ' + (err.message || emailRes.statusText) });
      }
      return res.status(200).json({ ok: true });
    }

    if (action === 'validate') {
      if (!token) return res.status(400).json({ error: 'token required' });
      const rows = await sql`
        SELECT first_name, last_name, email FROM users
        WHERE invite_token = ${token} AND invite_expires > NOW()
      `;
      if (!rows.length) return res.status(400).json({ error: 'Invalid or expired link' });
      return res.status(200).json({ ok: true, user: rows[0] });
    }

    if (action === 'set') {
      if (!token || !password) return res.status(400).json({ error: 'token and password required' });
      const rows = await sql`SELECT id FROM users WHERE invite_token = ${token} AND invite_expires > NOW()`;
      if (!rows.length) return res.status(400).json({ error: 'Invalid or expired link' });
      await sql`
        UPDATE users SET password_hash = ${sha256(password.trim())}, invite_token = NULL, invite_expires = NULL
        WHERE id = ${rows[0].id}
      `;
      return res.status(200).json({ ok: true });
    }

    // ── me: return fresh permissions for the current JWT holder ──────────────
    if (action === 'me') {
      // superAdmin is not in the DB — just echo back what they already have
      if (user.superAdmin) return res.status(200).json({ ok: true, superAdmin: true, permissions: user.permissions || {} });
      const rows = await sql`
        SELECT id, first_name, last_name, email, module_permissions
        FROM users WHERE id = ${user.userId}
      `;
      if (!rows.length) return res.status(404).json({ error: 'User not found' });
      const u = rows[0];
      const mp = u.module_permissions || {};
      return res.status(200).json({
        ok: true,
        userId:      u.id,
        firstName:   u.first_name,
        lastName:    u.last_name,
        email:       u.email,
        permissions: typeof mp === 'string' ? JSON.parse(mp) : mp
      });
    }

    return res.status(400).json({ error: 'Unknown action' });
  }

  // ── POST (create / update) ──────────────────────────────────────────────────
  if (req.method === 'POST') {
    try {
      const b   = req.body;
      const mp  = b.modulePermissions && typeof b.modulePermissions === 'object'
        ? JSON.stringify(b.modulePermissions) : '{}';

      if (b.id) {
        if (b.password && b.password.trim()) {
          await sql`
            UPDATE users SET
              first_name         = ${b.firstName ?? ''},
              last_name          = ${b.lastName  ?? ''},
              email              = ${b.email     ?? ''},
              password_hash      = ${sha256(b.password.trim())},
              module_permissions = ${mp}::jsonb,
              updated_at         = NOW()
            WHERE id = ${b.id}
          `;
        } else {
          await sql`
            UPDATE users SET
              first_name         = ${b.firstName ?? ''},
              last_name          = ${b.lastName  ?? ''},
              email              = ${b.email     ?? ''},
              module_permissions = ${mp}::jsonb,
              updated_at         = NOW()
            WHERE id = ${b.id}
          `;
        }
        return res.status(200).json({ ok: true, id: b.id });
      } else {
        const hash = b.password ? sha256(b.password.trim()) : '';
        const rows = await sql`
          INSERT INTO users (first_name, last_name, email, password_hash, module_permissions)
          VALUES (${b.firstName ?? ''}, ${b.lastName ?? ''}, ${b.email ?? ''}, ${hash}, ${mp}::jsonb)
          RETURNING id
        `;
        return res.status(200).json({ ok: true, id: rows[0].id });
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── DELETE ──────────────────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    try {
      await sql`DELETE FROM users WHERE id = ${req.body.id}`;
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
