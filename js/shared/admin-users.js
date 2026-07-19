// admin-users.js — User & Permissions management UI
// Fully rebuilt with UI Kit components (UI.*). Business logic unchanged.

// ── SVG constants ─────────────────────────────────────────────────────────────
var _AU_SVG_EDIT   = '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';
var _AU_SVG_TRASH  = '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.8 7.5A1 1 0 004.8 12.5h4.4a1 1 0 001-.9L11 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var _AU_SVG_PLUS   = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
var _AU_SVG_CAMERA = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';
var _AU_SVG_SEND   = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
var _AU_SVG_USER   = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

// ── Module registry ───────────────────────────────────────────────────────────
var AU_MODULES = [
  // Company OKRs
  { id: 'company-okrs',        label: 'Company OKRs',               section: 'Company OKRs'   },
  // Overview + tab sub-items
  { id: 'overview',            label: 'Overview',                   section: 'Overview'       },
  { id: 'overview-okrs',       label: 'Company OKRs',               parent: 'overview'        },
  { id: 'overview-product',    label: 'Product & Tech',             parent: 'overview'        },
  { id: 'overview-sales',      label: 'Revenue',                    parent: 'overview'        },
  { id: 'overview-finance',    label: 'Finance',                    parent: 'overview'        },
  { id: 'overview-operations', label: 'Operations',                 parent: 'overview'        },
  { id: 'overview-hr',         label: 'HR',                         parent: 'overview'        },
  // Product & Tech
  { id: 'roadmap-neon',        label: 'Product Roadmap',            section: 'Product & Tech' },
  { id: 'settings-neon',       label: 'Assumptions',                parent: 'roadmap-neon'    },
  { id: 'teamcapacity-neon',   label: 'Team Capacity',              section: 'Product & Tech' },
  { id: 'product-ideas',       label: 'Product Req / Ideas',        section: 'Product & Tech' },
  // Administration
  { id: 'admin-users',         label: 'Admin — User & Permissions', section: 'Administration' }
];

// Fixed section order (mirrors sidebar + overview)
var AU_SECTIONS_ORDER = [
  'Overview',
  'Company OKRs',
  'Product & Tech',
  'Revenue',
  'Finance',
  'Operations',
  'HR',
  'Administration'
];

// Sections that actually have modules (used to split permissionTable vs "soon")
var AU_ACTIVE_SECTIONS = ['Overview', 'Company OKRs', 'Product & Tech', 'Administration'];

// Returns AU_MODULES + dynamically injected sprint dashboards (deduplicated)
function _auAllModules() {
  var mods = AU_MODULES.slice();
  var existingIds = mods.map(function(m) { return m.id; });
  if (typeof _kervDashboards !== 'undefined') {
    _kervDashboards.forEach(function(d) {
      var pid = 'sprint-db-' + d.id;
      if (existingIds.indexOf(pid) === -1) {
        mods.push({ id: pid, label: d.name, section: 'Product & Tech' });
        existingIds.push(pid);
      }
    });
  }
  return mods;
}

var AU_TEAMS = ['Product', 'Tech', 'Design', 'Operations', 'Sales', 'Strategy', 'People & Culture', 'Marketing', 'Finance'];

// Two roles — order determines left→right column order in the table
var AU_ROLES = [
  { val: 'viewer', label: 'Viewer', color: '#6366F1', bg: 'rgba(99,102,241,.10)'  },
  { val: 'editor', label: 'Admin',  color: 'var(--accent)', bg: 'rgba(237,0,94,.10)' }
];

// ── Derive section from module definition ─────────────────────────────────────
function _auModuleSection(modId) {
  var all = _auAllModules();
  var m = all.filter(function(x) { return x.id === modId; })[0];
  if (m && m.section) return m.section;
  if (modId && modId.indexOf('sprint-db-') === 0) return 'Product & Tech';
  return 'General';
}

// ── State ─────────────────────────────────────────────────────────────────────
var _auUsers       = [];
var _auEditId      = null;
var _auSearchQuery = '';

// ── Render shell ──────────────────────────────────────────────────────────────
function renderAdminUsers() {
  return '<div id="au-root"></div>';
}

function auLoad() {
  _auSearchQuery = '';
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
      if (root) root.innerHTML = UI.alertBanner('error', 'Failed to load', e.message);
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

function auSearchFilter() {
  var inp = document.getElementById('au-search');
  _auSearchQuery = inp ? inp.value.toLowerCase().trim() : '';
  var q = _auSearchQuery;
  var filtered = q
    ? _auUsers.filter(function(u) {
        var full = ((u.firstName || '') + ' ' + (u.lastName || '')).toLowerCase();
        return full.indexOf(q) !== -1
          || (u.email       || '').toLowerCase().indexOf(q) !== -1
          || (u.department  || '').toLowerCase().indexOf(q) !== -1
          || (u.jobTitle    || '').toLowerCase().indexOf(q) !== -1;
      })
    : _auUsers;

  var empty = filtered.length === 0
    ? '<tr><td colspan="5" style="text-align:center;padding:48px 0;color:var(--faint);font-size:13px">'
        + (q ? 'No users matching "' + _auEsc(q) + '"' : 'No users yet — add the first one')
        + '</td></tr>'
    : '';
  var tbody = document.getElementById('au-tbody');
  if (tbody) tbody.innerHTML = filtered.map(auRowHtml).join('') || empty;

  var badge = document.getElementById('au-count');
  if (badge) {
    badge.textContent = q
      ? filtered.length + ' of ' + _auUsers.length
      : _auUsers.length + (filtered.length === 1 ? ' user' : ' users');
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
function _auCanEdit() {
  if (typeof _kervUser !== 'undefined' && _kervUser && _kervUser.superAdmin) return true;
  return typeof _kervCan === 'function' && _kervCan('admin-users', 'editor');
}

function auPageHtml() {
  var isEditor = _auCanEdit();
  var q        = _auSearchQuery;
  var filtered = q
    ? _auUsers.filter(function(u) {
        var full = ((u.firstName || '') + ' ' + (u.lastName || '')).toLowerCase();
        return full.indexOf(q) !== -1
          || (u.email      || '').toLowerCase().indexOf(q) !== -1
          || (u.department || '').toLowerCase().indexOf(q) !== -1
          || (u.jobTitle   || '').toLowerCase().indexOf(q) !== -1;
      })
    : _auUsers;

  var rows  = filtered.map(auRowHtml).join('');
  var empty = '<tr><td colspan="5" style="text-align:center;padding:48px 0;color:var(--faint);font-size:13px">'
    + (q ? 'No users matching "' + _auEsc(q) + '"' : 'No users yet — add the first one')
    + '</td></tr>';

  var countText = q
    ? filtered.length + ' of ' + _auUsers.length
    : _auUsers.length + (_auUsers.length === 1 ? ' user' : ' users');

  // ── Page header ─────────────────────────────────────────────────────────────
  var addBtn = isEditor
    ? UI.btnPrimary(
        '<span style="display:inline-flex;align-items:center;gap:6px">' + _AU_SVG_PLUS + 'Add User</span>',
        'auOpenDrawer(null)'
      )
    : '';

  var header = UI.pageHeader({
    title:      'User & Permissions',
    subtitle:   'Each user has an independent role per module',
    titleRight: addBtn,
    mb:         '20px'
  });

  // ── Search bar — UI.searchBar() ─────────────────────────────────────────────
  var searchBar =
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">'
    + '<div style="flex:1;max-width:360px">'
    +   UI.searchBar('au-search', 'Search by name, email, department…', 'auSearchFilter()', _auSearchQuery)
    + '</div>'
    + '<span id="au-count" style="font-size:12px;color:var(--faint);white-space:nowrap">' + countText + '</span>'
    + '</div>';

  // ── Table ────────────────────────────────────────────────────────────────────
  var COLS = [
    { label: 'Name',               width: '220px' },
    { label: 'Department'                         },
    { label: 'Job Title'                          },
    { label: 'Module Permissions'                 },
    { label: '',                   width: '72px'  }
  ];

  return header + searchBar + UI.table(COLS, rows || empty, 'au-tbody');
}

// ── Row ───────────────────────────────────────────────────────────────────────
function auRowHtml(u) {
  var mp = u.modulePermissions || {};
  var counts = { editor: 0, viewer: 0 };
  Object.values(mp).forEach(function(r) {
    var normalized = (r === 'admin' || r === 'team_member') ? 'editor' : r;
    if (counts[normalized] !== undefined) counts[normalized]++;
  });
  var total = counts.editor + counts.viewer;

  // Permission summary — UI.badge()
  var summary = total === 0
    ? '<span style="font-size:11px;color:var(--faint)">No access</span>'
    : [
        counts.editor ? UI.badge('Admin ×' + counts.editor, 'var(--accent)', 'rgba(237,0,94,.08)') : '',
        counts.viewer ? UI.badge('Viewer ×' + counts.viewer, '#6366F1', 'rgba(99,102,241,.08)') : ''
      ].filter(Boolean).join(' ');

  // Avatar — UI.avatarCell() with photo fallback
  var fullName = ((u.firstName || '') + ' ' + (u.lastName || '')).trim() || '?';
  var avatarHtml = u.photoUrl
    ? '<div style="display:flex;align-items:center;gap:10px">'
        + '<img src="' + _auEsc(u.photoUrl) + '" style="width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0" onerror="this.style.display=\'none\'">'
        + '<div>'
        +   '<div style="font-size:13px;font-weight:500;color:var(--text)">' + _auEsc(fullName) + '</div>'
        +   '<div style="font-size:11px;color:var(--muted);margin-top:1px">' + _auEsc(u.email || '') + '</div>'
        + '</div>'
        + '</div>'
    : UI.avatarCell(fullName, u.email || '');

  // Department — UI.deptChip() or dash
  var deptHtml = u.department
    ? UI.deptChip(u.department)
    : '<span style="font-size:11px;color:var(--faint)">—</span>';

  // Job title
  var jobHtml = u.jobTitle
    ? '<span style="font-size:12px;color:var(--muted)">' + _auEsc(u.jobTitle) + '</span>'
    : '<span style="font-size:11px;color:var(--faint)">—</span>';

  var isEditor = _auCanEdit();
  var rowStyle = 'border-bottom:1px solid var(--border)' + (isEditor ? ';cursor:pointer' : '');
  var rowEvts  = isEditor
    ? ' onclick="auOpenDrawer(' + u.id + ')"'
      + ' onmouseenter="this.style.background=\'var(--subtle)\'" onmouseleave="this.style.background=\'\'"'
    : '';

  // Action buttons — UI.btnIcon()
  var actions = isEditor
    ? UI.btnIcon('event.stopPropagation();auOpenDrawer(' + u.id + ')', 'Edit',   _AU_SVG_EDIT,  'var(--muted)', 'var(--accent)', 'rgba(237,0,94,.08)')
      + UI.btnIcon('event.stopPropagation();auDelete('   + u.id + ')', 'Delete', _AU_SVG_TRASH, 'var(--faint)', '#E5243B',       '#FFF0F0')
    : '';

  return '<tr' + rowEvts + ' style="' + rowStyle + ';transition:background .1s">'
    + '<td style="padding:10px 16px">' + avatarHtml + '</td>'
    + '<td style="padding:10px 16px">' + deptHtml + '</td>'
    + '<td style="padding:10px 16px">' + jobHtml + '</td>'
    + '<td style="padding:10px 16px"><div style="display:flex;gap:5px;flex-wrap:wrap">' + summary + '</div></td>'
    + '<td style="padding:12px 16px;text-align:right;white-space:nowrap">' + actions + '</td>'
    + '</tr>';
}

// ── Password visibility toggle ────────────────────────────────────────────────
function auTogglePw() {
  var inp = document.getElementById('au-f-pw');
  var ico = document.getElementById('au-pw-eye-ico');
  if (!inp) return;
  var show = inp.type === 'password';
  inp.setAttribute('type', show ? 'text' : 'password');
  if (ico) ico.innerHTML = show
    ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>'
    : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
}

// ── Invite toggle ─────────────────────────────────────────────────────────────
var _auInviteMode = false;

function auToggleInvite() {
  var email = ((document.getElementById('au-f-email') || {}).value || '').trim();
  var first = ((document.getElementById('au-f-first') || {}).value || '').trim();
  var last  = ((document.getElementById('au-f-last')  || {}).value || '').trim();
  if (!email) { alert('Please fill in the email field first.'); return; }

  var name = (first + ' ' + last).trim() || email;
  var isNew = _auEditId === null;
  var title = isNew ? 'Send invite email' : 'Send password reset email';
  var msg   = isNew
    ? 'Send a password setup link to <strong style="color:var(--text)">' + _auEsc(name) + '</strong> (<span style="color:var(--accent)">' + _auEsc(email) + '</span>)?<br/><span style="font-size:11px;color:var(--muted)">They\'ll receive a link to set their own password. Expires in 72 hours.</span>'
    : 'Send a password reset link to <strong style="color:var(--text)">' + _auEsc(name) + '</strong> (<span style="color:var(--accent)">' + _auEsc(email) + '</span>)?<br/><span style="font-size:11px;color:var(--muted)">They\'ll receive a link to choose a new password. Expires in 72 hours.</span>';

  _auInviteMode = true;
  window._auInviteDoSave = function() { _auInviteMode = true; auSave(); };

  UI.openModal({
    id: 'au-invite-confirm-modal',
    title: title,
    closeFn: 'UI.closeModal(\'au-invite-confirm-modal\');_auInviteMode=false',
    width: '400px',
    bodyHtml: '<p style="font-size:13px;color:var(--muted);line-height:1.6;margin:0">' + msg + '</p>',
    footerRight:
      UI.btnCancel('Cancel', 'UI.closeModal(\'au-invite-confirm-modal\');_auInviteMode=false')
      + UI.btnPrimary('Send email', 'UI.closeModal(\'au-invite-confirm-modal\');if(window._auInviteDoSave)window._auInviteDoSave()')
  });
}

// ── Drawer form ───────────────────────────────────────────────────────────────
function _auFormHtml(isNew, u) {
  var allMods   = _auAllModules();
  var mpCurrent = (u && u.modulePermissions) || {};

  // ── Build permissionTable sections ──────────────────────────────────────────
  var radioLabels = AU_ROLES.map(function(r) { return { val: r.val, label: r.label }; });

  var ptSections = AU_ACTIVE_SECTIONS.map(function(sec) {
    var items = allMods.filter(function(m) {
      return !m.parent && _auModuleSection(m.id) === sec;
    });
    var rows = items.map(function(m) {
      var roleRaw = mpCurrent[m.id];
      if (roleRaw === 'admin' || roleRaw === 'team_member') roleRaw = 'editor';
      var children = allMods.filter(function(c) { return c.parent === m.id; });
      return {
        id:         'aupt-' + m.id,
        label:      m.label,
        checked:    !!roleRaw,
        radioValue: roleRaw || '',
        onCheckFn:  'auModToggle(\'' + m.id + '\')',
        sub: children.map(function(c) {
          var cRaw = mpCurrent[c.id];
          if (cRaw === 'admin' || cRaw === 'team_member') cRaw = 'editor';
          return {
            id:         'aupt-' + c.id,
            label:      c.label,
            checked:    !!cRaw,
            radioValue: cRaw || '',
            onCheckFn:  'auModToggle(\'' + c.id + '\')'
          };
        })
      };
    });
    return { label: sec, rows: rows };
  }).filter(function(s) { return s.rows.length > 0; });

  // "Coming soon" sections (no modules yet)
  var soonSections = AU_SECTIONS_ORDER.filter(function(s) {
    return AU_ACTIVE_SECTIONS.indexOf(s) === -1;
  });
  var soonBadge = soonSections.map(function(s) {
    return '<span style="font-size:10px;font-weight:600;color:var(--faint);background:var(--border);'
      + 'border-radius:4px;padding:2px 7px;letter-spacing:.3px">' + _auEsc(s) + '</span>';
  }).join(' ');

  var inviteBtnTitle = isNew ? 'Send invite email instead' : 'Send password reset email';
  var inviteInfoText = isNew
    ? 'Invite email will be sent — user sets their own password (link expires in 72 h)'
    : 'Password reset email will be sent — user sets a new password (link expires in 72 h)';

  // Department select — UI.customSelect()
  var teamOpts = [{ val: '', label: '— No function —' }].concat(
    AU_TEAMS.map(function(t) { return { val: t, label: t }; })
  );
  var currentDept = (u && u.department) ? u.department : '';
  var teamSelect  = UI.customSelect('au-f-team', teamOpts, currentDept);

  var ROW = 'display:grid;grid-template-columns:1fr 1fr 36px;gap:10px;align-items:flex-end;margin-bottom:14px';

  return ''
    // Error banner — top of form so it's always visible
    + '<div id="au-drawer-err" style="display:none;margin-bottom:14px"></div>'

    // Hidden photo input
    + '<input type="hidden" id="au-f-photo">'

    // Row 1: First Name | Last Name | Camera btn
    + '<div style="' + ROW + '">'
    +   '<div><label style="' + UI.LB + '">First Name</label>'
    +   '<input id="au-f-first" type="text" placeholder="Alice" autocomplete="off" style="' + UI.IF + ';height:36px;box-sizing:border-box"></div>'
    +   '<div><label style="' + UI.LB + '">Last Name</label>'
    +   '<input id="au-f-last" type="text" placeholder="Smith" autocomplete="off" style="' + UI.IF + ';height:36px;box-sizing:border-box"></div>'
    +   '<div id="au-photo-btn-wrap">'
    +   '<button type="button" id="au-photo-btn" onclick="_auOpenPhotoModal()" title="Set profile photo" '
    +   'style="width:36px;height:36px;flex-shrink:0;border:1px solid var(--border-md);border-radius:7px;background:var(--surface);color:var(--muted);cursor:pointer;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:0;transition:all .15s" '
    +   'onmouseenter="if(!document.getElementById(\'au-f-photo\').value)this.style.borderColor=\'var(--accent)\';this.style.color=\'var(--accent)\'" '
    +   'onmouseleave="if(!document.getElementById(\'au-f-photo\').value)this.style.borderColor=\'var(--border-md)\';this.style.color=\'var(--muted)\'">'
    +   '<span id="au-photo-btn-ico">' + _AU_SVG_CAMERA + '</span>'
    +   '</button>'
    +   '</div>'
    + '</div>'

    // Row 2: Department | Job Title | spacer
    + '<div style="' + ROW + '">'
    +   '<div><label style="' + UI.LB + '">Department</label>' + teamSelect + '</div>'
    +   '<div><label style="' + UI.LB + '">Job Title</label>'
    +   '<input id="au-f-jobtitle" type="text" placeholder="e.g. Product Manager" autocomplete="off" style="' + UI.IF + ';height:36px;box-sizing:border-box"></div>'
    +   '<div style="width:36px"></div>'
    + '</div>'

    // Row 3: Email | Password | Invite btn
    + '<div style="' + ROW + ';margin-bottom:8px">'
    +   '<div><label style="' + UI.LB + '">Email</label>'
    +   '<input id="au-f-email" type="email" placeholder="alice@kerv.ai" autocomplete="off" style="' + UI.IF + ';height:36px;box-sizing:border-box"></div>'
    +   '<div><label style="' + UI.LB + '">'
    +     (isNew ? 'Password' : 'Password <span style="font-weight:400;font-size:10px;color:var(--faint)">(blank = keep)</span>')
    +   '</label>'
    +   '<div style="position:relative">'
    +     '<input id="au-f-pw" type="password" placeholder="••••••••" autocomplete="new-password" style="' + UI.IF + ';height:36px;box-sizing:border-box;padding-right:34px">'
    +     '<button type="button" onclick="auTogglePw()" title="Show/hide" '
    +     'style="position:absolute;right:0;top:0;bottom:0;width:34px;background:none;border:none;cursor:pointer;color:var(--muted);display:flex;align-items:center;justify-content:center;padding:0;transition:color .12s" '
    +     'onmouseenter="this.style.color=\'var(--text)\'" onmouseleave="this.style.color=\'var(--muted)\'">'
    +       '<svg id="au-pw-eye-ico" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
    +     '</button>'
    +   '</div></div>'
    +   '<button type="button" id="au-invite-btn" onclick="auToggleInvite()" title="' + inviteBtnTitle + '" '
    +   'style="width:36px;height:36px;flex-shrink:0;border:1px solid var(--border-md);border-radius:7px;background:var(--surface);color:var(--muted);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s" '
    +   'onmouseenter="if(!this.classList.contains(\'au-inv-active\'))this.style.borderColor=\'var(--border)\'" '
    +   'onmouseleave="if(!this.classList.contains(\'au-inv-active\'))this.style.borderColor=\'var(--border-md)\'">'
    +     _AU_SVG_SEND
    +   '</button>'
    + '</div>'

    // Invite info banner (hidden by default)
    + '<div id="au-invite-info" style="display:none;margin-bottom:18px">'
    +   UI.alertBanner('info', '', inviteInfoText)
    + '</div>'

    + '<div style="margin-bottom:6px"></div>'

    // ── Module Permissions ───────────────────────────────────────────────────
    + '<div style="border-top:1px solid var(--border);padding-top:18px">'
    +   '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">'
    +     '<div style="font-size:13px;font-weight:600;color:var(--text);letter-spacing:-.2px">Module Permissions</div>'
    +     '<div style="display:flex;align-items:center;gap:2px">'
    +       AU_ROLES.map(function(r) {
              return '<button type="button" onclick="auSetAll(\'' + r.val + '\')" '
                + 'style="font-size:11px;color:' + r.color + ';background:none;border:none;cursor:pointer;'
                + 'padding:3px 7px;font-family:inherit;border-radius:4px;transition:background .1s" '
                + 'onmouseenter="this.style.background=\'' + r.bg + '\'" onmouseleave="this.style.background=\'none\'">All ' + r.label + '</button>';
            }).join('<span style="color:var(--border-md);font-size:10px">·</span>')
    +       '<span style="color:var(--border-md);font-size:10px">·</span>'
    +       '<button type="button" onclick="auSetAll(\'\')" style="font-size:11px;color:var(--muted);background:none;border:none;cursor:pointer;padding:3px 7px;font-family:inherit;border-radius:4px;transition:background .1s" onmouseenter="this.style.background=\'var(--subtle)\'" onmouseleave="this.style.background=\'none\'">Clear</button>'
    +     '</div>'
    +   '</div>'
    // UI.permissionTable — all active sections
    +   UI.permissionTable(ptSections, radioLabels)
    // "Coming soon" sections
    + (soonBadge
        ? '<div style="margin-top:12px;display:flex;align-items:center;gap:6px;flex-wrap:wrap">'
          + '<span style="font-size:10px;color:var(--faint)">Coming soon:</span>'
          + soonBadge
          + '</div>'
        : '')
    + '</div>';
}

// ── Photo modal ───────────────────────────────────────────────────────────────
function _auOpenPhotoModal() {
  var currentUrl = ((document.getElementById('au-f-photo') || {}).value || '');
  var previewHtml = currentUrl
    ? '<img src="' + _auEsc(currentUrl) + '" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\'">'
    : _AU_SVG_USER;

  UI.openModal({
    id:        'au-photo-modal',
    width:     '360px',
    title:     'Profile photo',
    subtitle:  'Paste a public image URL',
    closeFn:   'auClosePhotoModal',
    bodyHtml:
      '<div style="display:flex;gap:10px;align-items:center">'
      + '<div id="au-photo-preview" style="width:52px;height:52px;border-radius:50%;background:var(--subtle);'
      + 'flex-shrink:0;overflow:hidden;display:flex;align-items:center;justify-content:center;border:1px solid var(--border)">'
      + previewHtml + '</div>'
      + '<input id="au-photo-url-inp" type="url" placeholder="https://..." value="' + _auEsc(currentUrl) + '" '
      + 'style="' + UI.IF + ';height:36px;box-sizing:border-box;background:var(--bg)" '
      + 'onfocus="this.style.borderColor=\'var(--accent)\'" onblur="this.style.borderColor=\'var(--border-md)\'" '
      + 'oninput="_auPhotoPreview(this.value)">'
      + '</div>',
    footerRight: UI.btnCancel('Cancel', 'auClosePhotoModal()') + UI.btnPrimary('Apply', '_auApplyPhoto()')
  });
  setTimeout(function() { var inp = document.getElementById('au-photo-url-inp'); if (inp) inp.focus(); }, 100);
}

function auClosePhotoModal() {
  UI.closeModal('au-photo-modal');
}

function _auPhotoPreview(url) {
  var prev = document.getElementById('au-photo-preview');
  if (!prev) return;
  prev.innerHTML = url
    ? '<img src="' + url + '" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\'">'
    : _AU_SVG_USER;
}

function _auApplyPhoto() {
  var url    = ((document.getElementById('au-photo-url-inp') || {}).value || '').trim();
  var hidden = document.getElementById('au-f-photo');
  if (hidden) hidden.value = url;
  var btn = document.getElementById('au-photo-btn');
  if (btn && url) {
    btn.innerHTML         = '<img src="' + url + '" style="width:100%;height:100%;object-fit:cover;border-radius:6px" onerror="this.style.display=\'none\'">';
    btn.style.borderColor = 'var(--accent)';
  } else if (btn) {
    btn.innerHTML         = '<span id="au-photo-btn-ico">' + _AU_SVG_CAMERA + '</span>';
    btn.style.borderColor = 'var(--border-md)';
  }
  auClosePhotoModal();
}

// ── Open drawer ───────────────────────────────────────────────────────────────
function auOpenDrawer(id) {
  _auInviteMode = false;
  _auEditId     = id;
  var isNew     = id === null;
  var u         = isNew ? null : (_auUsers.filter(function(x) { return x.id === id; })[0] || null);

  var drawerTitle = isNew ? 'Add User'
    : 'Edit User' + (u ? ' — ' + _auEsc((u.firstName || '') + ' ' + (u.lastName || '')) : '');

  UI.openDrawer({
    id:          'au-drawer-overlay',
    title:       drawerTitle,
    subtitle:    'Set name, email and per-module access',
    closeFn:     'auCloseDrawer',
    width:       '680px',
    bodyHtml:    _auFormHtml(isNew, u),
    footerRight: UI.btnCancel('Cancel', 'auCloseDrawer()') + UI.btnPrimary('Save', 'auSave()', 'au-save-btn')
  });

  // Populate text fields + photo (permissionTable already pre-renders checked state)
  if (!isNew && u) {
    var fFirst    = document.getElementById('au-f-first');
    var fLast     = document.getElementById('au-f-last');
    var fEmail    = document.getElementById('au-f-email');
    var fJobTitle = document.getElementById('au-f-jobtitle');
    var fPhoto    = document.getElementById('au-f-photo');
    if (fFirst)    fFirst.value    = u.firstName || '';
    if (fLast)     fLast.value     = u.lastName  || '';
    if (fEmail)    fEmail.value    = u.email     || '';
    if (fJobTitle) fJobTitle.value = u.jobTitle  || '';
    if (fPhoto)    fPhoto.value    = u.photoUrl  || '';

    if (u.photoUrl) {
      var btn = document.getElementById('au-photo-btn');
      if (btn) {
        btn.innerHTML         = '<img src="' + u.photoUrl + '" style="width:100%;height:100%;object-fit:cover;border-radius:6px" onerror="this.style.display=\'none\'">';
        btn.style.borderColor = 'var(--accent)';
      }
    }

    // Enable/disable radio columns based on pre-rendered checked state
    var mp = u.modulePermissions || {};
    Object.keys(mp).forEach(function(modId) {
      var chk = document.getElementById('aupt-' + modId + '-chk');
      if (chk && chk.checked) auModToggle(modId);
    });
  }
}

// ── Close drawer ──────────────────────────────────────────────────────────────
function auCloseDrawer() {
  UI.closeDrawer('au-drawer-overlay');
}

// ── Permissions logic ─────────────────────────────────────────────────────────

// Called by checkbox onchange in permissionTable
function auModToggle(modId) {
  var chk = document.getElementById('aupt-' + modId + '-chk');
  if (!chk) return;
  var enabled = chk.checked;
  var rads    = document.querySelectorAll('input[name="aupt-' + modId + '-perm"]');
  rads.forEach(function(r) {
    r.disabled      = !enabled;
    r.style.opacity = enabled ? '1' : '.35';
    if (!enabled) r.checked = false;
  });
  // Also handle sub-row checkboxes (children of this module)
  var allMods  = _auAllModules();
  var children = allMods.filter(function(c) { return c.parent === modId; });
  children.forEach(function(c) {
    var subChk = document.getElementById('aupt-' + c.id + '-chk');
    if (subChk) {
      subChk.disabled      = !enabled;
      subChk.style.opacity = enabled ? '1' : '.35';
      if (!enabled) {
        subChk.checked = false;
        var subRads = document.querySelectorAll('input[name="aupt-' + c.id + '-perm"]');
        subRads.forEach(function(r) { r.disabled = true; r.style.opacity = '.35'; r.checked = false; });
      }
    }
  });
  // Default to viewer when first enabling
  if (enabled) {
    var anyChecked = !!document.querySelector('input[name="aupt-' + modId + '-perm"]:checked');
    if (!anyChecked) {
      var defRad = document.querySelector('input[name="aupt-' + modId + '-perm"][value="viewer"]');
      if (defRad) defRad.checked = true;
    }
  }
}

function auSetAll(role) {
  _auAllModules().forEach(function(m) {
    var chk = document.getElementById('aupt-' + m.id + '-chk');
    if (!chk) return;
    if (!role) {
      chk.checked = false; auModToggle(m.id);
    } else {
      chk.checked = true; auModToggle(m.id);
      var rad = document.querySelector('input[name="aupt-' + m.id + '-perm"][value="' + role + '"]');
      if (rad) rad.checked = true;
    }
  });
}

function auGetPermissions() {
  var mp = {};
  _auAllModules().forEach(function(m) {
    var chk = document.getElementById('aupt-' + m.id + '-chk');
    if (!chk || !chk.checked) return;
    var rad = document.querySelector('input[name="aupt-' + m.id + '-perm"]:checked');
    if (rad) mp[m.id] = rad.value;
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

  function _showErr(msg) {
    if (!errEl) return;
    errEl.innerHTML     = UI.alertBanner('error', '', msg);
    errEl.style.display = '';
  }

  if (!first || !last || !email) {
    _showErr('First name, last name and email are required.'); return;
  }
  if (_auEditId === null && !inviteMode && !pw) {
    _showErr('Password is required, or choose "Send invite email".'); return;
  }
  if (errEl) errEl.style.display = 'none';

  var department = ((document.getElementById('au-f-team')     || {}).value || '').trim();
  var jobTitle   = ((document.getElementById('au-f-jobtitle') || {}).value || '').trim();
  var photoUrl   = ((document.getElementById('au-f-photo')    || {}).value || '').trim();

  var payload = { firstName: first, lastName: last, email: email, department: department, jobTitle: jobTitle, photoUrl: photoUrl, modulePermissions: auGetPermissions() };
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
      _showErr(e.message);
      if (btn) { btn.disabled = false; btn.textContent = 'Save'; }
    });
  }

  if (!inviteMode) { _doSave(); return; }

  var confirmMsg = _auEditId === null
    ? 'Send a password setup link to <strong style="color:var(--text)">' + _auEsc(email) + '</strong>?<br/><span style="font-size:11px;color:var(--muted)">They\'ll receive an email with a link to set their own password. The link expires in 72 hours.</span>'
    : 'Send a password reset link to <strong style="color:var(--text)">' + _auEsc(email) + '</strong>?<br/><span style="font-size:11px;color:var(--muted)">They\'ll receive an email with a link to choose a new password. The link expires in 72 hours.</span>';
  window._auInviteDoSave = _doSave;
  UI.openModal({
    id: 'au-invite-confirm-modal',
    title: _auEditId === null ? 'Send invite email' : 'Send reset email',
    closeFn: 'UI.closeModal(\'au-invite-confirm-modal\')',
    width: '400px',
    bodyHtml: '<p style="font-size:13px;color:var(--muted);line-height:1.6;margin:0">' + confirmMsg + '</p>'
      + '<div id="au-invite-confirm-err" style="margin-top:10px;font-size:12px;color:#E5243B"></div>',
    footerRight:
      UI.btnCancel('Cancel', 'UI.closeModal(\'au-invite-confirm-modal\')')
      + UI.btnPrimary('Send email', 'UI.closeModal(\'au-invite-confirm-modal\');if(window._auInviteDoSave)window._auInviteDoSave()')
  });
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

// ── Send invite email ─────────────────────────────────────────────────────────
function auSendInvite(id) {
  var u = _auUsers.filter(function(x) { return x.id === id; })[0];
  if (!u) return;
  var email = u.email || '';
  var name  = ((u.firstName || '') + ' ' + (u.lastName || '')).trim() || email;

  UI.openModal({
    id: 'au-send-invite-modal',
    title: 'Send invite email',
    closeFn: 'UI.closeModal(\'au-send-invite-modal\')',
    width: '380px',
    bodyHtml:
      '<p style="font-size:13px;color:var(--muted);line-height:1.6;margin:0">'
      + 'Send a password setup link to <strong style="color:var(--text)">' + _auEsc(name) + '</strong>'
      + ' (<span style="color:var(--accent)">' + _auEsc(email) + '</span>)?<br/><br/>'
      + '<span style="font-size:11px">They\'ll receive a link to set their own password. The link expires in 72 hours.</span>'
      + '</p>'
      + '<div id="au-send-invite-err" style="margin-top:10px;font-size:12px;color:#E5243B"></div>',
    footerRight:
      UI.btnCancel('Cancel', 'UI.closeModal(\'au-send-invite-modal\')')
      + UI.btnPrimary('Send email', 'auSendInviteConfirm(' + id + ')')
  });
}

function auSendInviteConfirm(id) {
  var errEl = document.getElementById('au-send-invite-err');
  var btn   = document.querySelector('#au-send-invite-modal button[onclick*="auSendInviteConfirm"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
  fetch('/api/neon/users', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'send', userId: id })
  })
  .then(function(r) { return r.json(); })
  .then(function(res) {
    if (!res.ok) throw new Error(res.error || 'Failed to send email');
    UI.closeModal('au-send-invite-modal');
  })
  .catch(function(e) {
    if (errEl) errEl.textContent = e.message;
    if (btn) { btn.disabled = false; btn.textContent = 'Send email'; }
  });
}

// ── Util ──────────────────────────────────────────────────────────────────────
function _auEsc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
