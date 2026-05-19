// admin-users.js — User & Permissions management UI

// ── Module registry ───────────────────────────────────────────────────────────
// section is derived dynamically from NAV_CONFIG at render time via _auModuleSection()
var AU_MODULES = [
  { id: 'overview',            label: 'Overview'                  },
  { id: 'overview-product',    label: 'Product & Tech', parent: 'overview' },
  { id: 'overview-okrs',       label: 'OKRs',           parent: 'overview' },
  { id: 'overview-finance',    label: 'Finance',         parent: 'overview' },
  { id: 'overview-sales',      label: 'Sales',           parent: 'overview' },
  { id: 'roadmap-neon',        label: 'Product Roadmap'           },
  { id: 'settings-neon',       label: 'Assumptions', parent: 'roadmap-neon' },
  { id: 'teamcapacity-neon',   label: 'Team Capacity'             },
  { id: 'admin-users',         label: 'Admin — User & Permissions'}
];

// Two roles only: editor (can act) · viewer (read-only)
var AU_ROLES = [
  { val: 'editor', label: 'Admin',  title: 'Admin — can act',    color: 'var(--accent)', bg: 'rgba(237,0,94,.10)',    accent: '#ED005E' },
  { val: 'viewer', label: 'Viewer', title: 'Viewer — read only', color: '#6366F1',       bg: 'rgba(99,102,241,.10)', accent: '#6366F1' }
];

// ── Derive section from NAV_CONFIG ────────────────────────────────────────────
function _auModuleSection(modId) {
  if (typeof NAV_CONFIG === 'undefined') return 'General';
  var result = null;
  NAV_CONFIG.forEach(function(sec) {
    sec.items.forEach(function(item) {
      if (item.id === modId) result = sec.noHeader ? 'General' : sec.section;
      if (item.children) item.children.forEach(function(c) {
        if (c.id === modId) result = sec.noHeader ? 'General' : sec.section;
      });
    });
  });
  // admin-users lives under Administration (removed from sidebar but keep label)
  if (!result && modId === 'admin-users') result = 'Administration';
  return result || 'General';
}

// ── State ─────────────────────────────────────────────────────────────────────
var _auUsers  = [];
var _auEditId = null;

// ── Render shell ──────────────────────────────────────────────────────────────
function renderAdminUsers() {
  return '<div id="au-root"></div>';
}

function auLoad() {
  var root = document.getElementById('au-root');
  if (root) root.innerHTML = _KERV_LOADER_HTML;
  fetch('/api/neon/users')
    .then(function(r) { return r.json(); })
    .then(function(rows) {
      if (rows.length === 0) return _auSeedDummy();
      _auUsers = rows; auRender();
    })
    .catch(function(e) {
      var root = document.getElementById('au-root');
      if (root) root.innerHTML = '<div style="text-align:center;padding:60px 0;color:#E5243B;font-size:13px">Failed to load: ' + e.message + '</div>';
    });
}

function _auSeedDummy() {
  return fetch('/api/neon/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'Alice', lastName: 'Chen', email: 'alice@kerv.ai', password: 'kerv2025',
      modulePermissions: {
        'overview': 'viewer',
        'roadmap-neon': 'editor',
        'teamcapacity-neon': 'viewer',
        'sdt-sprint-analysis': 'viewer'
      }
    })
  })
  .then(function() { return fetch('/api/neon/users'); })
  .then(function(r) { return r.json(); })
  .then(function(rows) { _auUsers = rows; auRender(); });
}

function auRender() {
  var root = document.getElementById('au-root');
  if (root) root.innerHTML = auPageHtml();
}

// ── Page ──────────────────────────────────────────────────────────────────────
function _auCanEdit() {
  if (typeof _kervUser !== 'undefined' && _kervUser && _kervUser.superAdmin) return true;
  return typeof _kervCan === 'function' && _kervCan('admin-users', 'editor');
}

function auPageHtml() {
  var isEditor = _auCanEdit();
  var rows  = _auUsers.map(auRowHtml).join('');
  var empty = '<tr><td colspan="4" style="text-align:center;padding:48px 0;color:var(--faint);font-size:13px">No users yet — add the first one</td></tr>';

  return ''
    + '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px">'
    +   '<div>'
    +     '<div style="font-size:20px;font-weight:600;letter-spacing:-.4px;color:var(--text)">User & Permissions</div>'
    +     '<div style="font-size:12px;color:var(--muted);margin-top:3px">Each user has an independent role per module</div>'
    +   '</div>'
    +   (isEditor
        ? '<button onclick="auOpenDrawer(null)" style="padding:7px 12px;background:var(--accent);color:#fff;border:none;border-radius:7px;font-size:13px;font-weight:500;font-family:inherit;cursor:pointer;display:inline-flex;align-items:center;gap:6px;flex-shrink:0;transition:opacity .15s" onmouseenter="this.style.opacity=\'.85\'" onmouseleave="this.style.opacity=\'1\'">'
        +   '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>Add User'
        + '</button>'
        : '')
    + '</div>'
    + '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden">'
    +   '<table style="width:100%;border-collapse:collapse">'
    +     '<thead><tr style="border-bottom:1px solid var(--border)">'
    +       '<th style="padding:10px 16px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);width:200px">Name</th>'
    +       '<th style="padding:10px 16px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--faint)">Email</th>'
    +       '<th style="padding:10px 16px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--faint)">Module Permissions</th>'
    +       '<th style="width:72px"></th>'
    +     '</tr></thead>'
    +     '<tbody>' + (rows || empty) + '</tbody>'
    +   '</table>'
    + '</div>';
}

function auRowHtml(u) {
  var mp = u.modulePermissions || {};
  var counts = { editor: 0, viewer: 0 };
  Object.values(mp).forEach(function(r) {
    // back-compat: treat legacy 'admin'/'team_member' as editor
    var normalized = (r === 'admin' || r === 'team_member') ? 'editor' : r;
    if (counts[normalized] !== undefined) counts[normalized]++;
  });
  var total = counts.editor + counts.viewer;

  var summary = total === 0
    ? '<span style="font-size:11px;color:var(--faint)">No access</span>'
    : [
        counts.editor ? '<span style="font-size:11px;font-weight:500;color:var(--accent);background:rgba(237,0,94,.08);padding:2px 7px;border-radius:5px">Admin ×' + counts.editor + '</span>' : '',
        counts.viewer ? '<span style="font-size:11px;font-weight:500;color:#6366F1;background:rgba(99,102,241,.08);padding:2px 7px;border-radius:5px">Viewer ×' + counts.viewer + '</span>' : ''
      ].filter(Boolean).join(' ');

  var isEditor = _auCanEdit();
  return '<tr'
    + (isEditor ? ' onclick="auOpenDrawer(' + u.id + ')"' : '')
    + ' style="border-bottom:1px solid var(--border);' + (isEditor ? 'cursor:pointer;' : '') + 'transition:background .1s"'
    + (isEditor ? ' onmouseenter="this.style.background=\'var(--subtle)\'" onmouseleave="this.style.background=\'\'"' : '')
    + '>'
    + '<td style="padding:12px 16px"><span style="font-size:13px;font-weight:500;color:var(--text)">' + _auEsc(u.firstName) + ' ' + _auEsc(u.lastName) + '</span></td>'
    + '<td style="padding:12px 16px;font-size:12px;color:var(--muted)">' + _auEsc(u.email) + '</td>'
    + '<td style="padding:12px 16px"><div style="display:flex;gap:5px;flex-wrap:wrap">' + summary + '</div></td>'
    + '<td style="padding:12px 16px;text-align:right;white-space:nowrap" onclick="event.stopPropagation()">'
    + (isEditor
        ? _auIconBtn('auOpenDrawer(' + u.id + ')', 'Edit',
            '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
            'var(--muted)', 'var(--accent)', 'rgba(237,0,94,.08)')
          + _auIconBtn('auDelete(' + u.id + ')', 'Delete',
              '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.8 7.5A1 1 0 004.8 12.5h4.4a1 1 0 001-.9L11 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
              'var(--faint)', '#E5243B', '#FFF0F0')
        : '')
    + '</td>'
    + '</tr>';
}

function _auIconBtn(onclick, title, svg, baseColor, hoverColor, hoverBg) {
  return '<button onclick="' + onclick + '" title="' + title + '" '
    + 'style="width:28px;height:28px;border:none;border-radius:6px;background:none;color:' + baseColor + ';cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:color .12s,background .12s" '
    + 'onmouseenter="this.style.color=\'' + hoverColor + '\';this.style.background=\'' + hoverBg + '\'" '
    + 'onmouseleave="this.style.color=\'' + baseColor + '\';this.style.background=\'none\'">'
    + svg + '</button>';
}

// ── Password visibility toggle ────────────────────────────────────────────────
function auTogglePw() {
  var inp = document.getElementById('au-f-pw');
  var ico = document.getElementById('au-pw-eye-ico');
  if (!inp) return;
  var show = inp.type === 'password';
  inp.setAttribute('type', show ? 'text' : 'password');
  if (ico) ico.innerHTML = show
    // eye-off: crossed-out eye
    ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>'
    // eye: normal
    : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
}

// ── Invite toggle ─────────────────────────────────────────────────────────────
var _auInviteMode = false;

function auToggleInvite() {
  _auInviteMode = !_auInviteMode;
  var pwEl  = document.getElementById('au-f-pw');
  var btn   = document.getElementById('au-invite-btn');
  var info  = document.getElementById('au-invite-info');
  if (!pwEl || !btn) return;
  if (_auInviteMode) {
    pwEl.disabled     = true;
    pwEl.style.opacity = '.35';
    pwEl.value        = '';
    btn.style.background   = '#6366F1';
    btn.style.borderColor  = '#6366F1';
    btn.style.color        = '#fff';
    btn.classList.add('au-inv-active');
    if (info) info.style.display = '';
  } else {
    pwEl.disabled      = false;
    pwEl.style.opacity = '1';
    btn.style.background  = 'var(--surface)';
    btn.style.borderColor = 'var(--border-md)';
    btn.style.color       = 'var(--muted)';
    btn.classList.remove('au-inv-active');
    if (info) info.style.display = 'none';
  }
}

// ── Drawer ────────────────────────────────────────────────────────────────────
function _auFormHtml(isNew) {
  var IF = 'width:100%;box-sizing:border-box;padding:8px 11px;font-size:13px;border:1px solid var(--border-md);border-radius:7px;background:var(--surface);color:var(--text);outline:none;font-family:inherit;transition:border-color .15s';
  var LB = 'font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);display:block;margin-bottom:5px';

  // Build sections dynamically from NAV_CONFIG
  var sections = [];
  AU_MODULES.forEach(function(m) {
    if (m.parent) return;
    var sec = _auModuleSection(m.id);
    if (sections.indexOf(sec) === -1) sections.push(sec);
  });

  // Column header row — shown once at the top of the table
  var colHeader = '<tr>'
    + '<th style="text-align:left;padding:6px 0 10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--faint)">Product Module</th>'
    + AU_ROLES.map(function(r) {
        return '<th style="text-align:center;padding:6px 0 10px;width:72px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:' + r.color + '">' + r.label + '</th>';
      }).join('')
    + '</tr>';

  var permRows = sections.map(function(sec, si) {
    var items = AU_MODULES.filter(function(m) {
      return !m.parent && _auModuleSection(m.id) === sec;
    });

    var sectionHeader = '<tr><td colspan="' + (AU_ROLES.length + 1) + '" style="padding:' + (si === 0 ? '0' : '14px') + ' 0 6px">'
      + '<span style="font-size:10px;font-weight:700;color:var(--faint);text-transform:uppercase;letter-spacing:.5px">' + sec + '</span>'
      + '</td></tr>';

    var moduleRows = items.map(function(m) {
      var children = AU_MODULES.filter(function(c) { return c.parent === m.id; });
      return _auPermRow(m, false) + children.map(function(c) { return _auPermRow(c, true); }).join('');
    }).join('');

    return '<tbody>' + sectionHeader + moduleRows + '</tbody>';
  }).join('');

  var inviteBtnTitle = isNew ? 'Send invite email instead' : 'Send password reset email';
  var inviteInfoText = isNew
    ? 'Invite email will be sent — user sets their own password (link expires in 72 h)'
    : 'Password reset email will be sent — user sets a new password (link expires in 72 h)';

  return ''
    + '<div style="display:grid;grid-template-columns:1fr 1fr 36px;gap:10px;margin-bottom:14px">'
    +   '<div><label style="' + LB + '">First Name</label><input id="au-f-first" type="text" placeholder="Alice" class="au-inp" autocomplete="off" style="' + IF + '"></div>'
    +   '<div><label style="' + LB + '">Last Name</label><input id="au-f-last"  type="text" placeholder="Smith"  class="au-inp" autocomplete="off" style="' + IF + '"></div>'
    +   '<div></div>'
    + '</div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr 36px;gap:10px;align-items:flex-end;margin-bottom:8px">'
    +   '<div><label style="' + LB + '">Email</label><input id="au-f-email" type="email" placeholder="alice@kerv.ai" class="au-inp" autocomplete="off" style="' + IF + '"></div>'
    +   '<div><label style="' + LB + '">'
    +     (isNew ? 'Password' : 'Password <span style="font-weight:400;font-size:10px;color:var(--faint)">(blank = keep)</span>')
    +   '</label>'
    +   '<div style="position:relative">'
    +     '<input id="au-f-pw" type="password" placeholder="••••••••" class="au-inp" autocomplete="new-password" style="' + IF + ';padding-right:34px">'
    +     '<button type="button" onclick="auTogglePw()" title="Show/hide password" id="au-pw-eye"'
    +       ' style="position:absolute;right:0;top:0;bottom:0;width:34px;z-index:2;background:none;border:none;cursor:pointer;color:var(--muted);display:flex;align-items:center;justify-content:center;padding:0;transition:color .12s"'
    +       ' onmouseenter="this.style.color=\'var(--text)\'" onmouseleave="this.style.color=\'var(--muted)\'">'
    +       '<svg id="au-pw-eye-ico" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
    +     '</button>'
    +   '</div>'
    +   '</div>'
    +   '<button type="button" id="au-invite-btn" onclick="auToggleInvite()" title="' + inviteBtnTitle + '"'
    +     ' style="width:36px;height:36px;border:1px solid var(--border-md);border-radius:7px;background:var(--surface);color:var(--muted);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0"'
    +     ' onmouseenter="if(!this.classList.contains(\'au-inv-active\'))this.style.borderColor=\'var(--border)\'"'
    +     ' onmouseleave="if(!this.classList.contains(\'au-inv-active\'))this.style.borderColor=\'var(--border-md)\'">'
    +     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>'
    +   '</button>'
    + '</div>'
    + '<div id="au-invite-info" style="display:none;margin-bottom:18px;padding:9px 12px;background:rgba(99,102,241,.06);border-radius:7px;border:1px solid rgba(99,102,241,.18)">'
    +   '<span style="font-size:11px;color:#6366F1">' + inviteInfoText + '</span>'
    + '</div>'
    + '<div style="margin-bottom:6px"></div>'
    + '<div style="border-top:1px solid var(--border);padding-top:18px">'
    +   '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">'
    +     '<div style="font-size:13px;font-weight:600;color:var(--text);letter-spacing:-.2px">Module Permissions</div>'
    +     '<div style="display:flex;align-items:center;gap:2px">'
    +       AU_ROLES.map(function(r) {
              return '<button type="button" onclick="auSetAll(\'' + r.val + '\')" style="font-size:11px;color:' + r.color + ';background:none;border:none;cursor:pointer;padding:3px 7px;font-family:inherit;border-radius:4px;transition:background .1s" onmouseenter="this.style.background=\'' + r.bg + '\'" onmouseleave="this.style.background=\'none\'">All ' + r.label + '</button>';
            }).join('<span style="color:var(--border-md);font-size:10px">·</span>')
    +       '<span style="color:var(--border-md);font-size:10px">·</span>'
    +       '<button type="button" onclick="auSetAll(\'\')" style="font-size:11px;color:var(--muted);background:none;border:none;cursor:pointer;padding:3px 7px;font-family:inherit;border-radius:4px;transition:background .1s" onmouseenter="this.style.background=\'var(--subtle)\'" onmouseleave="this.style.background=\'none\'">Clear</button>'
    +     '</div>'
    +   '</div>'
    +   '<table style="width:100%;border-collapse:collapse"><thead>' + colHeader + '</thead>' + permRows + '</table>'
    + '</div>'
    + '<div id="au-drawer-err" style="display:none;font-size:12px;color:#E5243B;margin-top:10px;padding:8px 10px;background:#FFF0F0;border-radius:6px"></div>';
}

function _auPermRow(m, isChild) {
  var radios = AU_ROLES.map(function(r) {
    return '<td style="text-align:center;padding:6px 0;width:72px">'
      + '<input type="radio" id="au-rad-' + m.id + '-' + r.val + '" name="au-role-' + m.id + '" value="' + r.val + '" '
      + 'disabled style="width:15px;height:15px;accent-color:' + r.accent + ';cursor:pointer;opacity:.3">'
      + '</td>';
  }).join('');

  return '<tr style="border-bottom:1px solid var(--border)">'
    + '<td style="padding:7px 0">'
    +   '<label style="display:inline-flex;align-items:center;gap:8px;cursor:pointer;user-select:none' + (isChild ? ';padding-left:20px' : '') + '">'
    +     '<input type="checkbox" id="au-chk-' + m.id + '" data-mod="' + m.id + '" onchange="auModToggle(\'' + m.id + '\')" style="width:14px;height:14px;accent-color:var(--accent);cursor:pointer;flex-shrink:0">'
    +     '<span style="font-size:' + (isChild ? '11px;color:var(--muted)' : '12px;color:var(--text)') + '">' + m.label + '</span>'
    +   '</label>'
    + '</td>'
    + radios
    + '</tr>';
}

function auOpenDrawer(id) {
  var existing = document.getElementById('au-drawer-overlay');
  if (existing) existing.parentNode.removeChild(existing);
  _auInviteMode = false;

  _auEditId = id;
  var isNew = id === null;

  var overlay = document.createElement('div');
  overlay.id = 'au-drawer-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:600;display:flex;justify-content:flex-end;pointer-events:auto';

  var backdrop = document.createElement('div');
  backdrop.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0);transition:background .28s ease;cursor:pointer';
  backdrop.onclick = auCloseDrawer;

  var panel = document.createElement('div');
  panel.style.cssText = [
    'position:relative', 'width:680px', 'max-width:95vw', 'height:100%',
    'background:var(--surface)', 'box-shadow:-6px 0 40px rgba(0,0,0,.13)',
    'display:flex', 'flex-direction:column',
    'transform:translateX(100%)', 'transition:transform .3s cubic-bezier(.4,0,.2,1)',
    'font-family:inherit'
  ].join(';');

  var drawerTitle = isNew ? 'Add User' : (function() {
    var u = _auUsers.filter(function(x) { return x.id === id; })[0];
    return 'Edit User' + (u ? ' — ' + (u.firstName || '') + ' ' + (u.lastName || '') : '');
  })();

  var header = document.createElement('div');
  header.style.cssText = 'padding:18px 28px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0';
  header.innerHTML = ''
    + '<div>'
    +   '<div style="font-size:15px;font-weight:600;letter-spacing:-.3px;color:var(--text)">' + _auEsc(drawerTitle) + '</div>'
    +   '<div style="font-size:12px;color:var(--faint);margin-top:2px">Set name, email and per-module access</div>'
    + '</div>'
    + '<button onclick="auCloseDrawer()" style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border-md);border-radius:8px;background:none;cursor:pointer;color:var(--muted);transition:border-color .15s,color .15s;flex-shrink:0" onmouseenter="this.style.borderColor=\'var(--accent)\';this.style.color=\'var(--accent)\'" onmouseleave="this.style.borderColor=\'var(--border-md)\';this.style.color=\'var(--muted)\'">'
    +   '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    + '</button>';

  var body = document.createElement('div');
  body.style.cssText = 'flex:1;overflow-y:auto;padding:24px 28px';
  body.innerHTML = _auFormHtml(isNew);

  var footer = document.createElement('div');
  footer.style.cssText = 'padding:14px 28px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px;flex-shrink:0;background:var(--surface)';
  footer.innerHTML = ''
    + '<button onclick="auCloseDrawer()" style="height:34px;padding:0 16px;background:none;border:1px solid var(--border-md);border-radius:7px;font-size:13px;font-family:inherit;color:var(--muted);cursor:pointer;transition:border-color .15s">Cancel</button>'
    + '<button id="au-save-btn" onclick="auSave()" style="height:34px;padding:0 18px;background:var(--accent);color:#fff;border:none;border-radius:7px;font-size:13px;font-weight:500;font-family:inherit;cursor:pointer;transition:opacity .15s" onmouseenter="this.style.opacity=\'.85\'" onmouseleave="this.style.opacity=\'1\'">Save</button>';

  panel.appendChild(header);
  panel.appendChild(body);
  panel.appendChild(footer);
  overlay.appendChild(backdrop);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      backdrop.style.background = 'rgba(0,0,0,.28)';
      panel.style.transform = 'translateX(0)';
    });
  });

  if (!isNew) {
    var u = _auUsers.filter(function(x) { return x.id === id; })[0];
    if (u) {
      var fFirst = document.getElementById('au-f-first');
      var fLast  = document.getElementById('au-f-last');
      var fEmail = document.getElementById('au-f-email');
      if (fFirst) fFirst.value = u.firstName || '';
      if (fLast)  fLast.value  = u.lastName  || '';
      if (fEmail) fEmail.value = u.email     || '';
      var mp = u.modulePermissions || {};
      Object.keys(mp).forEach(function(modId) {
        // back-compat: normalize legacy roles
        var role = mp[modId];
        if (role === 'admin' || role === 'team_member') role = 'editor';
        var chk = document.getElementById('au-chk-' + modId);
        if (chk) { chk.checked = true; auModToggle(modId); }
        var rad = document.getElementById('au-rad-' + modId + '-' + role);
        if (rad) rad.checked = true;
      });
    }
  }
}

function auCloseDrawer() {
  var overlay = document.getElementById('au-drawer-overlay');
  if (!overlay) return;
  var backdrop = overlay.firstElementChild;
  var panel    = overlay.lastElementChild;
  if (backdrop) backdrop.style.background = 'rgba(0,0,0,0)';
  if (panel)    panel.style.transform = 'translateX(100%)';
  setTimeout(function() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 300);
}

// ── Permissions logic ─────────────────────────────────────────────────────────
function auModToggle(modId) {
  var chk = document.getElementById('au-chk-' + modId);
  if (!chk) return;
  var enabled = chk.checked;
  AU_ROLES.forEach(function(r) {
    var rad = document.getElementById('au-rad-' + modId + '-' + r.val);
    if (!rad) return;
    rad.disabled = !enabled;
    rad.style.opacity = enabled ? '1' : '.3';
    if (!enabled) rad.checked = false;
  });
  if (enabled) {
    var anyChecked = AU_ROLES.some(function(r) {
      var rad = document.getElementById('au-rad-' + modId + '-' + r.val);
      return rad && rad.checked;
    });
    if (!anyChecked) {
      var def = document.getElementById('au-rad-' + modId + '-viewer');
      if (def) def.checked = true;
    }
  }
}

function auSetAll(role) {
  AU_MODULES.forEach(function(m) {
    var chk = document.getElementById('au-chk-' + m.id);
    if (!chk) return;
    if (!role) {
      chk.checked = false; auModToggle(m.id);
    } else {
      chk.checked = true; auModToggle(m.id);
      var rad = document.getElementById('au-rad-' + m.id + '-' + role);
      if (rad) rad.checked = true;
    }
  });
}

function auGetPermissions() {
  var mp = {};
  AU_MODULES.forEach(function(m) {
    var chk = document.getElementById('au-chk-' + m.id);
    if (!chk || !chk.checked) return;
    AU_ROLES.forEach(function(r) {
      var rad = document.getElementById('au-rad-' + m.id + '-' + r.val);
      if (rad && rad.checked) mp[m.id] = r.val;
    });
  });
  return mp;
}

// ── Save ──────────────────────────────────────────────────────────────────────
function auSave() {
  var first  = (document.getElementById('au-f-first').value  || '').trim();
  var last   = (document.getElementById('au-f-last').value   || '').trim();
  var email  = (document.getElementById('au-f-email').value  || '').trim();
  var pwEl   = document.getElementById('au-f-pw');
  var pw     = pwEl ? (pwEl.value || '').trim() : '';
  var errEl  = document.getElementById('au-drawer-err');

  var inviteMode = _auInviteMode;

  if (!first || !last || !email) {
    errEl.textContent = 'First name, last name and email are required.';
    errEl.style.display = 'block'; return;
  }
  if (_auEditId === null && !inviteMode && !pw) {
    errEl.textContent = 'Password is required, or choose "Send invite email".';
    errEl.style.display = 'block'; return;
  }
  errEl.style.display = 'none';

  var payload = { firstName: first, lastName: last, email: email, modulePermissions: auGetPermissions() };
  if (pw && !inviteMode) payload.password = pw;
  if (_auEditId !== null) payload.id = _auEditId;

  var btn = document.getElementById('au-save-btn');

  function _doSave() {
    if (btn) { btn.disabled = true; btn.textContent = inviteMode ? 'Sending invite…' : 'Saving…'; }

    fetch('/api/neon/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      if (!res.ok) throw new Error(res.error || 'Save failed');
      if (!inviteMode) { auCloseDrawer(); auLoad(); return; }
      return fetch('/api/neon/users', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', userId: res.id })
      })
      .then(function(r) { return r.json(); })
      .then(function(inv) {
        if (!inv.ok) throw new Error(inv.error || 'Invite email failed');
        auCloseDrawer(); auLoad();
      });
    })
    .catch(function(e) {
      if (errEl) { errEl.textContent = e.message; errEl.style.display = 'block'; }
      if (btn) { btn.disabled = false; btn.textContent = 'Save'; }
    });
  }

  if (!inviteMode) { _doSave(); return; }

  // Confirmation before sending invite
  var confirm_ = typeof snxConfirm === 'function' ? snxConfirm : function(msg, cb) { if (window.confirm(msg.replace(/<[^>]+>/g, ''))) cb(); };
  var confirmMsg = _auEditId === null
    ? 'Send an invite email to <strong>' + _auEsc(email) + '</strong>?<br/><span style="font-size:11px;color:var(--muted)">They\'ll receive a link to set their own password.</span>'
    : 'Send a password reset email to <strong>' + _auEsc(email) + '</strong>?<br/><span style="font-size:11px;color:var(--muted)">They\'ll receive a link to choose a new password.</span>';
  confirm_(confirmMsg, _doSave);
}

// ── Delete ────────────────────────────────────────────────────────────────────
function auDelete(id) {
  var u = _auUsers.filter(function(x) { return x.id === id; })[0];
  if (!u) return;
  var name = ((u.firstName || '') + ' ' + (u.lastName || '')).trim();
  var confirm_ = typeof snxConfirm === 'function' ? snxConfirm : function(msg, cb) { if (window.confirm(msg.replace(/<[^>]+>/g, ''))) cb(); };
  confirm_('Delete <strong>' + _auEsc(name) + '</strong>? This cannot be undone.', function() {
    fetch('/api/neon/users', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id })
    })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      if (!res.ok) throw new Error(res.error || 'Delete failed');
      auLoad();
    })
    .catch(function(e) { alert('Delete failed: ' + e.message); });
  });
}

// ── Util ──────────────────────────────────────────────────────────────────────
function _auEsc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
