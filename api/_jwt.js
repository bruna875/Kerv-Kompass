// api/_jwt.js — JWT sign/verify helpers (shared module, NOT a serverless function)

import { createHmac } from 'crypto';

const getSecret = () => process.env.JWT_SECRET || 'kerv-dev-secret-do-not-use-in-prod';

function b64u(s)     { return Buffer.from(s).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,''); }
function fromb64u(s) { return Buffer.from(s.replace(/-/g,'+').replace(/_/g,'/'), 'base64').toString('utf8'); }
function hmacSign(d) {
  return createHmac('sha256', getSecret()).update(d).digest('base64')
    .replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
}

// Sign a JWT payload. Default expiry: 24 h.
export function signJwt(payload, expiresMs) {
  var h = b64u(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  var p = b64u(JSON.stringify(Object.assign({}, payload, { exp: Date.now() + (expiresMs || 24 * 3600 * 1000) })));
  return h + '.' + p + '.' + hmacSign(h + '.' + p);
}

// Verify and decode a JWT. Returns payload or null if invalid/expired.
export function verifyJwt(token) {
  if (!token) return null;
  try {
    var parts = token.split('.');
    if (parts.length !== 3) return null;
    var h = parts[0], p = parts[1], s = parts[2];
    if (hmacSign(h + '.' + p) !== s) return null;
    var payload = JSON.parse(fromb64u(p));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch(e) { return null; }
}

// Express-style middleware: verifies Bearer token and returns decoded user,
// or sends 401 + returns null so the caller can `return` immediately.
export function requireAuth(req, res) {
  var auth  = req.headers['authorization'] || '';
  var token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  var user  = verifyJwt(token);
  if (!user) { res.status(401).json({ error: 'Unauthorized' }); return null; }
  return user;
}

// Check if user has the required permission level for a module.
// level: 'viewer' (any access) | 'editor' (write access)
export function canAccess(user, moduleId, level) {
  if (!user) return false;
  if (user.superAdmin) return true;
  var perm = (user.permissions || {})[moduleId];
  if (!perm) return false;
  if (level === 'editor') return perm === 'editor';
  return true; // 'viewer' — any role satisfies
}

// Shorthand: call at start of write handler. Sends 403 and returns false if not editor.
export function requireEditor(user, moduleId, res) {
  if (canAccess(user, moduleId, 'editor')) return true;
  res.status(403).json({ error: 'Viewer access — read only' });
  return false;
}
