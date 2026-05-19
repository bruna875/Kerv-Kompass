// app.js — navigation, routing, events, init

// ── Global driver color system ─────────────────────────────────────────────
// Deterministic hash → consistent color for every driver name everywhere
var KERV_DRIVER_PALETTE = [
  '#6366F1', // indigo
  '#06B6D4', // cyan
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#EC4899', // pink
  '#8B5CF6', // violet
  '#14B8A6', // teal
  '#F97316', // orange
  '#3B82F6', // blue
  '#84CC16', // lime
  '#A855F7'  // purple
];

function kervDriverColor(name) {
  if (!name || name === '—') return '#8E8E93';
  var h = 0;
  for (var i = 0; i < name.length; i++) { h = (h * 31 + name.charCodeAt(i)) >>> 0; }
  return KERV_DRIVER_PALETTE[h % KERV_DRIVER_PALETTE.length];
}

// ── App state ──
var activeId  = 'overview';
var collapsed = false;

// ── Auth state ──────────────────────────────────────────────────────────────
var _kervToken = null;
var _kervUser  = null; // { userId, email, firstName, lastName, permissions, superAdmin }
var _kervDashboards = []; // sprint dashboards loaded from DB

// Check if current user can access a module at a given level ('viewer'|'editor')
function _kervCan(moduleId, level) {
  if (!_kervUser) return false;
  if (_kervUser.superAdmin) return true;
  var perm = _kervUser.permissions && _kervUser.permissions[moduleId];
  if (!perm) return false;
  if (level === 'editor') return perm === 'editor';
  return true;
}

// Auto-inject Bearer token on every /api/ fetch call
(function() {
  var _orig = window.fetch.bind(window);
  window.fetch = function(url, opts) {
    if (_kervToken && typeof url === 'string' && url.startsWith('/api/')) {
      opts = opts || {};
      opts.headers = Object.assign({}, opts.headers || {}, { 'Authorization': 'Bearer ' + _kervToken });
    }
    return _orig(url, opts);
  };
})();

// ── Nav config ──
var NAV_CONFIG = [
  {
    section: '',
    noHeader: true,
    items: [
      { id: 'overview', label: 'Overview', icon: ico.overview }
    ]
  },
  {
    section: 'Product',
    items: [
      { id: 'roadmap-neon',      label: 'Product Roadmap', icon: ico.roadmap  },
      { id: 'teamcapacity-neon', label: 'Team Capacity',   icon: ico.capacity }
    ]
  },
];

// ── Pages map ──
var PAGES = {
  'overview':          renderOverview,
  'roadmap-neon':      renderRoadmapNeon,
  'teamcapacity-neon': renderTeamCapacityNeon,
  'settings-neon':     renderSettingsNeon,
  'admin-users':       renderAdminUsers
};

// ── Nav ──

// Sections collapsed by default (by section label)
var navCollapsed = {};

function toggleNavSection(section) {
  navCollapsed[section] = !navCollapsed[section];
  buildNav();
}

function buildNav() {
  document.getElementById('nav').innerHTML = NAV_CONFIG.map(function(sec) {
    var items = sec.items.map(function(item) {
      var act      = item.id === activeId;
      var childAct = item.children && item.children.some(function(c) { return c.id === activeId; });
      var open     = act || childAct;
      var divider  = item.dividerBefore ? '<div style="height:1px;background:var(--border);margin:4px 12px"></div>' : '';

      // Hide items the user has no permission for (superAdmin sees all)
      if (_kervUser && !_kervUser.superAdmin) {
        if (!(_kervUser.permissions && _kervUser.permissions[item.id])) return '';
      }

      if (item.disabled) {
        return divider + '<div class="nitem" style="opacity:.45;cursor:default;pointer-events:none">'
          + '<div class="nico">' + item.icon + '</div>'
          + '<span class="nlabel">' + item.label + '</span>'
          + '<span class="nsoon" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:var(--subtle);color:var(--muted);font-size:8px;font-weight:700;padding:2px 6px;border-radius:10px;letter-spacing:.4px;white-space:nowrap">Soon</span>'
          + '</div>';
      }

      var html = divider
        + '<div class="nitem' + (act ? ' act' : '') + '" data-page="' + item.id + '" data-label="' + item.label + '">'
        + (act ? '<div class="nbar"></div>' : '')
        + '<div class="nico">' + item.icon + '</div>'
        + '<span class="nlabel">' + item.label + '</span>'
        + '</div>';

      // Accordion children – shown when parent or a child is active
      if (item.children && open) {
        html += '<div class="nchildren">' + item.children.map(function(child) {
          var cact = child.id === activeId;
          return '<div class="nitem nchild' + (cact ? ' act' : '') + '" data-page="' + child.id + '" data-label="' + child.label + '">'
            + (cact ? '<div class="nbar"></div>' : '')
            + '<div class="nico" style="color:var(--faint)">' + (child.icon || '') + '</div>'
            + '<span class="nlabel">' + child.label + '</span>'
            + '</div>';
        }).join('') + '</div>';
      }

      return html;
    }).join('');

    // Inject sprint dashboard nav items into Product section
    if (sec.section === 'Product') {
      var canManage = _kervUser && (_kervUser.superAdmin || (_kervUser.permissions && _kervUser.permissions['settings-neon'] === 'editor'));
      var sprintItems = _kervDashboards.filter(function(d) {
        if (!_kervUser) return false;
        if (_kervUser.superAdmin) return true;
        // settings editors manage dashboards → see all
        if (_kervUser.permissions && _kervUser.permissions['settings-neon'] === 'editor') return true;
        return !!(_kervUser.permissions && _kervUser.permissions['sprint-db-' + d.id]);
      });

      // Divider + section label
      items += '<div style="height:1px;background:var(--border);margin:4px 12px"></div>'
        + '<div style="padding:6px 16px 2px;font-size:9px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:var(--faint)">Sprint Analysis</div>';

      // Dashboard items (above Add button)
      sprintItems.forEach(function(d) {
        var pid = 'sprint-db-' + d.id;
        var act = pid === activeId;
        items += '<div class="nitem' + (act ? ' act' : '') + '" data-page="' + pid + '" data-label="' + d.name + '">'
          + (act ? '<div class="nbar"></div>' : '')
          + '<div class="nico">' + ico.sprint + '</div>'
          + '<span class="nlabel">' + d.name + '</span>'
          + '</div>';
      });

      // Add Sprint Dashboard button
      if (canManage) {
        items += '<div onclick="_sdOpenAddModal()" style="margin:2px 12px;padding:4px 10px;border:none;cursor:pointer;display:flex;align-items:center;gap:6px;transition:opacity .15s;border-radius:6px" onmouseenter="this.style.opacity=\'.65\'" onmouseleave="this.style.opacity=\'1\'">'
          + '<svg width="11" height="11" viewBox="0 0 14 14" fill="none" style="flex-shrink:0;color:var(--accent)"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
          + '<span style="font-size:11px;font-weight:500;color:var(--accent);letter-spacing:.1px">Add Sprint Dashboard</span>'
          + '</div>';
      }

      // Divider + Product Ideas (Soon)
      items += '<div style="height:1px;background:var(--border);margin:4px 12px"></div>'
        + '<div class="nitem" style="opacity:.45;cursor:default;pointer-events:none">'
        + '<div class="nico">' + ico.ideas + '</div>'
        + '<span class="nlabel">Product Req / Ideas</span>'
        + '<span class="nsoon" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:var(--subtle);color:var(--muted);font-size:8px;font-weight:700;padding:2px 6px;border-radius:10px;letter-spacing:.4px;white-space:nowrap">Soon</span>'
        + '</div>';
    }

    // Sections with noHeader render items directly (no toggle header)
    if (sec.noHeader) {
      return '<div style="padding-bottom:4px">' + items + '</div>';
    }

    var col = !!navCollapsed[sec.section];
    var chevron = col
      ? '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      : '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 6.5l3-3 3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var header = '<div class="seclabel seclabel--toggle" onclick="toggleNavSection(\'' + sec.section.replace(/'/g, "\\'") + '\')">'
      + '<span>' + sec.section + '</span>'
      + '<span class="seclabel-chevron">' + chevron + '</span>'
      + '</div>';
    return '<div>' + header + (col ? '' : items) + '</div>';
  }).join('');
}

function setPage(id, label, noPush) {
  activeId = id;
  // close admin dropdown if open
  var adminDd = document.getElementById('adminDd');
  if (adminDd) adminDd.classList.remove('open');
  var content = document.getElementById('content');

  if (id.startsWith('sprint-db-')) {
    var _sdDbId = parseInt(id.replace('sprint-db-', ''), 10);
    content.innerHTML = '<div id="content-bc" class="content-bc">' + label + '</div>' + renderSprintDashboard(_sdDbId);
    buildNav();
    setTimeout(function() { initSprintDashboard(_sdDbId); }, 50);
    if (!noPush) {
      var _sdDashForSlug = null;
      for (var _sdi = 0; _sdi < _kervDashboards.length; _sdi++) {
        if (_kervDashboards[_sdi].id === _sdDbId) { _sdDashForSlug = _kervDashboards[_sdi]; break; }
      }
      var _sdSlugUrl = _sdDashForSlug
        ? _sdDashForSlug.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        : String(_sdDbId);
      history.pushState({ id: id, label: label }, '', '/sprint-' + _sdSlugUrl);
    }
    return;
  }

  var pageHtml = PAGES[id] ? PAGES[id]() : '<div class="ptitle">' + label + '</div>';
  content.innerHTML = (id === 'overview' ? '' : '<div id="content-bc" class="content-bc">' + label + '</div>') + pageHtml;
  buildNav();
  if (id === 'overview')      setTimeout(ovxLoad, 0);
  if (id === 'roadmap-neon')  setTimeout(rnxGanttTooltipInit, 50);
  if (id === 'admin-users')   setTimeout(auLoad, 0);
  if (!noPush) history.pushState({ id: id, label: label }, '', '/' + id);
}

// ── URL routing helpers ──

// Returns the first nav item the current user has permission to access
function _kervFirstAccessiblePage() {
  if (!_kervUser || _kervUser.superAdmin) return NAV_CONFIG[0].items[0];
  var found = null;
  NAV_CONFIG.forEach(function(sec) {
    sec.items.forEach(function(item) {
      if (found || item.disabled) return;
      if (_kervUser.permissions && _kervUser.permissions[item.id]) found = item;
    });
  });
  return found || NAV_CONFIG[0].items[0];
}

function pageFromPath() {
  var path = location.pathname.replace(/^\//, '').replace(/\/$/, '') || 'overview';

  // Handle slug-based sprint URLs: /sprint-xts-team → sprint-db-{id}
  if (path.startsWith('sprint-') && !path.startsWith('sprint-db-')) {
    var slug = path.replace(/^sprint-/, '');
    for (var si = 0; si < (_kervDashboards || []).length; si++) {
      var sd = _kervDashboards[si];
      var sdSlug = sd.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (sdSlug === slug) return { id: 'sprint-db-' + sd.id, label: sd.name };
    }
  }
  // Handle direct sprint-db-{id} paths (fallback)
  if (path.startsWith('sprint-db-')) {
    var dbId = parseInt(path.replace('sprint-db-', ''), 10);
    for (var di = 0; di < (_kervDashboards || []).length; di++) {
      if (_kervDashboards[di].id === dbId) return { id: path, label: _kervDashboards[di].name };
    }
  }

  // find matching nav item (including children)
  var found = null;
  NAV_CONFIG.forEach(function(sec) {
    sec.items.forEach(function(item) {
      if (item.id === path) found = item;
      if (item.children) item.children.forEach(function(c) { if (c.id === path) found = c; });
    });
  });
  // default fallback: Overview
  if (!found) {
    NAV_CONFIG.forEach(function(sec) {
      sec.items.forEach(function(item) {
        if (item.id === 'overview') found = item;
      });
    });
  }
  return found || NAV_CONFIG[0].items[0];
}

window.addEventListener('popstate', function(e) {
  if (e.state && e.state.id) {
    setPage(e.state.id, e.state.label, true);
  } else {
    var item = pageFromPath();
    setPage(item.id, item.label, true);
  }
});

// ── Event delegation ──

document.addEventListener('click', function(e) {
  var ni = e.target.closest('[data-page]');
  if (ni) { setPage(ni.dataset.page, ni.dataset.label); return; }
});

// ── Sidebar toggle ──

function toggleSb() {
  collapsed = !collapsed;
  document.getElementById('sb').classList.toggle('col', collapsed);
  document.getElementById('togico').innerHTML = collapsed
    ? '<path d="M4 2l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
    : '<path d="M6 2L3 5l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';
}

// ── Sprint Dashboards loader ──────────────────────────────────────────────────

function _kervLoadDashboards(cb) {
  fetch('/api/neon/lookup?t=sprint-dashboards')
    .then(function(r) { return r.json(); })
    .then(function(rows) {
      _kervDashboards = Array.isArray(rows) ? rows : [];
      _sdSyncAuModules();
      buildNav();
      if (cb) cb();
    })
    .catch(function() { _kervDashboards = []; if (cb) cb(); });
}

function _sdSyncAuModules() {
  if (typeof AU_MODULES === 'undefined') return;
  // Remove old sprint-db entries
  for (var i = AU_MODULES.length - 1; i >= 0; i--) {
    if (String(AU_MODULES[i].id).indexOf('sprint-db-') === 0) AU_MODULES.splice(i, 1);
  }
  // Find insert position (after teamcapacity-neon)
  var idx = -1;
  for (var j = 0; j < AU_MODULES.length; j++) {
    if (AU_MODULES[j].id === 'teamcapacity-neon') { idx = j; break; }
  }
  if (idx === -1) idx = AU_MODULES.length - 1;
  var items = _kervDashboards.map(function(d) {
    return { id: 'sprint-db-' + d.id, label: d.name + ' (Sprint)' };
  });
  AU_MODULES.splice.apply(AU_MODULES, [idx + 1, 0].concat(items));
}

// ── Login / Logout ──

function _applySession(data, instant) {
  _kervToken = data.token;
  _kervUser  = {
    userId:      data.userId,
    email:       data.email      || '',
    firstName:   data.firstName  || '',
    lastName:    data.lastName   || '',
    permissions: data.permissions || {},
    superAdmin:  !!data.superAdmin
  };
  localStorage.setItem('kerv_token', _kervToken);
  localStorage.setItem('kerv_user',  JSON.stringify(_kervUser));

  var authEl = document.getElementById('auth');
  if (instant) {
    authEl.style.display = 'none';
  } else {
    authEl.classList.add('gone');
    setTimeout(function() { authEl.style.display = 'none'; }, 300);
  }
  document.getElementById('app').classList.add('show');

  var name     = (_kervUser.firstName || '').trim() || (_kervUser.email || '').split('@')[0];
  var initials = ((_kervUser.firstName || ' ')[0] + (_kervUser.lastName || ' ')[0]).toUpperCase().trim();
  document.getElementById('un').textContent = name;
  document.getElementById('av').textContent = initials || name.slice(0, 2).toUpperCase();
  var uroleEl = document.getElementById('urole');
  if (uroleEl) uroleEl.textContent = _kervUser.email || '';

  // Show admin button only if user can manage users
  var adminBtn = document.getElementById('adminBtn');
  if (adminBtn) {
    adminBtn.style.display = (_kervUser.superAdmin || _kervUser.permissions['admin-users']) ? '' : 'none';
  }

  // Set data-attributes on body for CSS-based viewer mode
  var perms = _kervUser.permissions || {};
  document.body.setAttribute('data-roadmap-role',  _kervUser.superAdmin ? 'editor' : (perms['roadmap-neon']      || 'none'));
  document.body.setAttribute('data-capacity-role', _kervUser.superAdmin ? 'editor' : (perms['teamcapacity-neon'] || 'none'));

  _kervLoadDashboards(function() {
    var startItem = pageFromPath();
    // If user has no permission for the URL-resolved page, land on their first accessible page
    if (_kervUser && !_kervUser.superAdmin) {
      var startPerms = _kervUser.permissions || {};
      if (!startPerms[startItem.id] && !startItem.id.startsWith('sprint-db-')) {
        startItem = _kervFirstAccessiblePage();
      }
    }
    activeId = startItem.id;
    buildNav();
    setPage(startItem.id, startItem.label, true);
  });
}

function login() {
  var email = document.getElementById('em').value.trim();
  var pw    = document.getElementById('pw').value;
  var errEl = document.getElementById('err');
  var btn   = document.getElementById('loginBtn');
  errEl.textContent = '';
  btn.disabled = true; btn.textContent = 'Signing in…';

  fetch('/api/neon/users', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ action: 'login', email: email, password: pw })
  })
  .then(function(r) { return r.json(); })
  .then(function(res) {
    btn.disabled = false; btn.textContent = 'Sign in';
    if (!res.ok) throw new Error(res.error || 'Invalid credentials');
    _applySession(res);
  })
  .catch(function(e) {
    btn.disabled = false; btn.textContent = 'Sign in';
    errEl.textContent = e.message;
  });
}

function logout() {
  _kervToken = null; _kervUser = null;
  localStorage.removeItem('kerv_token');
  localStorage.removeItem('kerv_user');
  document.getElementById('app').classList.remove('show');
  var authEl = document.getElementById('auth');
  authEl.style.display = 'flex';
  setTimeout(function() { authEl.classList.remove('gone'); }, 10);
  document.getElementById('pw').value = '';
  document.getElementById('err').textContent = '';
}

// ── Admin topbar dropdown ──

function toggleAdminDd() {
  var dd = document.getElementById('adminDd');
  var willOpen = !dd.classList.contains('open');
  dd.classList.toggle('open', willOpen);
  if (willOpen) {
    setTimeout(function() {
      document.addEventListener('click', function _closeAdminDd(e) {
        if (!e.target.closest('.tb-admin-wrap')) {
          dd.classList.remove('open');
          document.removeEventListener('click', _closeAdminDd);
        }
      });
    }, 0);
  }
}

// ── Init ──

var m = new Date().getMonth(), y = new Date().getFullYear();
document.getElementById('qbadge').textContent = 'Q' + (m < 3 ? 1 : m < 6 ? 2 : m < 9 ? 3 : 4) + ' ' + y;
document.getElementById('loginBtn').addEventListener('click', login);
document.getElementById('logoutBtn').addEventListener('click', logout);
document.getElementById('tog').addEventListener('click', toggleSb);
document.getElementById('pw').addEventListener('keydown', function(e) { if (e.key === 'Enter') login(); });
document.getElementById('em').addEventListener('keydown', function(e) { if (e.key === 'Enter') login(); });

// Restore session from localStorage (or show login screen)
(function() {
  var stored     = localStorage.getItem('kerv_token');
  var storedUser = localStorage.getItem('kerv_user');
  if (stored && storedUser) {
    try {
      var parts   = stored.split('.');
      var payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (!payload.exp || Date.now() < payload.exp) {
        var u = JSON.parse(storedUser);
        _applySession(Object.assign({ token: stored }, u), true /*instant*/);

        // Silently refresh permissions from server in case admin changed them
        fetch('/api/neon/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + stored },
          body: JSON.stringify({ action: 'me' })
        })
        .then(function(r) { return r.json(); })
        .then(function(res) {
          if (!res.ok) return;
          // Check if permissions actually changed before re-applying
          var oldPerms = JSON.stringify((_kervUser && _kervUser.permissions) || {});
          var newPerms = JSON.stringify(res.permissions || {});
          if (oldPerms !== newPerms) {
            _applySession(Object.assign({ token: stored }, res));
            // Rebuild nav and re-render current page so new permissions take effect immediately
            if (typeof buildNav === 'function') buildNav();
            var curId = typeof activeId !== 'undefined' ? activeId : null;
            if (curId && typeof setPage === 'function') {
              // find the label from nav config
              var curLabel = curId;
              if (typeof NAV_CONFIG !== 'undefined') {
                NAV_CONFIG.forEach(function(sec) {
                  sec.items.forEach(function(item) {
                    if (item.id === curId) curLabel = item.label;
                    if (item.children) item.children.forEach(function(c) { if (c.id === curId) curLabel = c.label; });
                  });
                });
              }
              setPage(curId, curLabel, true /*noPush*/);
            }
          }
        })
        .catch(function() { /* non-fatal — keep cached session */ });

        return;
      }
    } catch(e) {}
    localStorage.removeItem('kerv_token');
    localStorage.removeItem('kerv_user');
  }
  // No valid session — show login
  document.getElementById('auth').style.display = 'flex';
})();
