// xts-team.js — Dynamic Sprint Dashboard system
// Supports multiple dashboards, each tied to one or more jira_projects entries.
// Dashboards are stored in sprint_dashboards DB table and loaded at login time.

// ── State ──────────────────────────────────────────────────────────────────────
var _sdInstances = {}; // cache keyed by dbId + '-' + jiraId

// ── Helpers ───────────────────────────────────────────────────────────────────

// Fetch jira projects: use global cache if available, else fetch from API
function _sdGetJiraProjects(cb) {
  if (typeof _rnxJiraProjects !== 'undefined' && Array.isArray(_rnxJiraProjects) && _rnxJiraProjects.length) {
    cb(_rnxJiraProjects);
    return;
  }
  fetch('/api/neon/lookup?t=jira-projects')
    .then(function(r) { return r.json(); })
    .then(function(rows) { cb(Array.isArray(rows) ? rows : []); })
    .catch(function() { cb([]); });
}

// Parse dash.project_keys JSON and map to {jira_id, team_name} objects
function _sdProjObjs(dash, jiraProjects) {
  var keys;
  try {
    keys = typeof dash.project_keys === 'string' ? JSON.parse(dash.project_keys) : (dash.project_keys || []);
  } catch(e) { keys = []; }
  if (!Array.isArray(keys) || keys.length === 0) return [];
  return keys.map(function(k) {
    var found = jiraProjects.filter(function(p) { return p.jira_id === k; })[0];
    return found || { jira_id: k, team_name: k };
  });
}

// Return or create a createSprintAnalysis instance, cached
function _sdSaInstance(dbId, proj) {
  var cacheKey = dbId + '-' + proj.jira_id;
  if (!_sdInstances[cacheKey]) {
    var saId = 'sd' + dbId + proj.jira_id.toLowerCase().replace(/[^a-z0-9]/g, '');
    _sdInstances[cacheKey] = createSprintAnalysis({
      id:         saId,
      teamName:   proj.team_name,
      subtitle:   'Sprint analytics & velocity tracking',
      projectKey: proj.jira_id
    });
  }
  return _sdInstances[cacheKey];
}

// ── Render / Init ─────────────────────────────────────────────────────────────

// Returns the outer shell HTML (called by setPage)
function renderSprintDashboard(dbId) {
  return '<div id="sd-outer-' + dbId + '"></div>';
}

// Called by setPage after render, finds dash, fetches jira projects, then renders inner
function initSprintDashboard(dbId) {
  var dash = null;
  if (typeof _kervDashboards !== 'undefined') {
    for (var i = 0; i < _kervDashboards.length; i++) {
      if (_kervDashboards[i].id === dbId) { dash = _kervDashboards[i]; break; }
    }
  }
  if (!dash) {
    var outer = document.getElementById('sd-outer-' + dbId);
    if (outer) outer.innerHTML = '<div style="padding:40px;color:var(--faint);font-size:13px">Dashboard not found.</div>';
    return;
  }
  _sdGetJiraProjects(function(jiraProjects) {
    var projObjs = _sdProjObjs(dash, jiraProjects);
    if (!projObjs.length) {
      var outer = document.getElementById('sd-outer-' + dbId);
      if (outer) outer.innerHTML = '<div style="padding:40px;color:var(--faint);font-size:13px">No projects configured. Click the edit button to add projects.</div>';
      return;
    }
    _sdRenderInner(dbId, projObjs, projObjs[0].jira_id);
  });
}

// Render top bar (chips + edit pencil) + SA instance
function _sdSlug(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function _sdRenderInner(dbId, projObjs, activeKey) {
  var outer = document.getElementById('sd-outer-' + dbId);
  if (!outer) return;

  var canManage = typeof _kervUser !== 'undefined' && _kervUser &&
    (_kervUser.superAdmin || (_kervUser.permissions && _kervUser.permissions['settings-neon'] === 'editor'));

  // Multi-project chips row (no edit button here — injected into SA header below)
  var topBar = '';
  if (projObjs.length > 1) {
    var chips = projObjs.map(function(p) {
      var act = p.jira_id === activeKey;
      return '<button onclick="_sdSwitch(' + dbId + ', \'' + p.jira_id.replace(/'/g, "\\'") + '\')" style="'
        + 'display:inline-flex;align-items:center;gap:6px;'
        + 'padding:5px 14px;border-radius:20px;font-size:12px;font-weight:500;font-family:inherit;cursor:pointer;'
        + 'border:1.5px solid ' + (act ? 'var(--accent)' : 'var(--border-md)') + ';'
        + 'background:' + (act ? 'var(--accent)' : 'var(--surface)') + ';'
        + 'color:' + (act ? '#fff' : 'var(--muted)') + ';'
        + 'transition:all .15s">'
        + '<span style="font-weight:700;' + (act ? '' : 'color:var(--accent)') + '">' + p.jira_id + '</span>'
        + '<span style="' + (act ? 'opacity:.85' : '') + '">' + p.team_name + '</span>'
        + '</button>';
    }).join('');
    topBar = '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:20px">' + chips + '</div>';
  }

  var activeProj = null;
  for (var i = 0; i < projObjs.length; i++) {
    if (projObjs[i].jira_id === activeKey) { activeProj = projObjs[i]; break; }
  }
  if (!activeProj) activeProj = projObjs[0];

  var inst = _sdSaInstance(dbId, activeProj);
  outer.innerHTML = topBar + '<div id="sd-inner-' + dbId + '">' + inst.render() + '</div>';

  // Inject small edit pencil next to the dashboard title
  if (canManage) {
    var titleEl = outer.querySelector('[style*="font-size:20px"]');
    if (titleEl && titleEl.parentNode) {
      // Wrap title + pencil in a flex row
      var wrapper = document.createElement('div');
      wrapper.style.cssText = 'display:flex;align-items:center;gap:6px';
      titleEl.parentNode.insertBefore(wrapper, titleEl);
      wrapper.appendChild(titleEl);
      var editEl = document.createElement('button');
      editEl.title = 'Edit dashboard';
      editEl.setAttribute('onclick', '_sdOpenEditModal(' + dbId + ')');
      editEl.style.cssText = 'padding:0;border:none;background:none;color:var(--faint);cursor:pointer;display:inline-flex;align-items:center;transition:color .15s;flex-shrink:0';
      editEl.setAttribute('onmouseenter', "this.style.color='var(--accent)'");
      editEl.setAttribute('onmouseleave', "this.style.color='var(--faint)'");
      editEl.innerHTML = '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';
      wrapper.appendChild(editEl);
    }
  }

  setTimeout(function() { inst.init(); }, 50);
}

// Switch to a different project chip
function _sdSwitch(dbId, jiraId) {
  var dash = null;
  if (typeof _kervDashboards !== 'undefined') {
    for (var i = 0; i < _kervDashboards.length; i++) {
      if (_kervDashboards[i].id === dbId) { dash = _kervDashboards[i]; break; }
    }
  }
  if (!dash) return;
  _sdGetJiraProjects(function(jiraProjects) {
    var projObjs = _sdProjObjs(dash, jiraProjects);
    _sdRenderInner(dbId, projObjs, jiraId);
  });
}

// ── Add / Edit / Delete Modal ─────────────────────────────────────────────────

function _sdOpenAddModal() {
  _sdBuildModal(null);
}

function _sdOpenEditModal(dbId) {
  var dash = null;
  if (typeof _kervDashboards !== 'undefined') {
    for (var i = 0; i < _kervDashboards.length; i++) {
      if (_kervDashboards[i].id === dbId) { dash = _kervDashboards[i]; break; }
    }
  }
  _sdBuildModal(dash);
}

function _sdBuildModal(dash) {
  var existing = document.getElementById('sd-modal-overlay');
  if (existing) existing.parentNode.removeChild(existing);

  var isNew = !dash;
  var dbId  = dash ? dash.id : null;

  var overlay = document.createElement('div');
  overlay.id = 'sd-modal-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.45)';
  overlay.onclick = function(e) { if (e.target === overlay) _sdCloseModal(); };

  var card = document.createElement('div');
  card.style.cssText = 'background:var(--surface);border-radius:14px;width:480px;max-width:94vw;max-height:90vh;overflow-y:auto;box-shadow:0 8px 48px rgba(0,0,0,.22);font-family:inherit';
  card.onclick = function(e) { e.stopPropagation(); };

  // We load jira projects to build checkboxes
  _sdGetJiraProjects(function(jiraProjects) {
    var currentKeys = [];
    if (dash) {
      try {
        currentKeys = typeof dash.project_keys === 'string' ? JSON.parse(dash.project_keys) : (dash.project_keys || []);
      } catch(e) { currentKeys = []; }
    }

    var projectsHtml;
    if (jiraProjects.length === 0) {
      projectsHtml = '<div style="margin-bottom:14px">'
        + '<label style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);display:block;margin-bottom:5px">Project Keys</label>'
        + '<input id="sd-modal-keys-text" type="text" placeholder="SDT, KERV, API (comma-separated)" value="' + currentKeys.join(', ') + '" style="width:100%;box-sizing:border-box;padding:8px 11px;font-size:13px;border:1px solid var(--border-md);border-radius:7px;background:var(--bg);color:var(--text);outline:none;font-family:inherit">'
        + '</div>';
    } else {
      var boxes = jiraProjects.map(function(p) {
        var checked = currentKeys.indexOf(p.jira_id) !== -1;
        return '<label style="display:flex;align-items:center;gap:8px;padding:7px 0;cursor:pointer;font-size:13px;color:var(--text);border-bottom:1px solid var(--border)">'
          + '<input type="checkbox" data-jira="' + p.jira_id + '" ' + (checked ? 'checked' : '') + ' style="width:14px;height:14px;accent-color:var(--accent);cursor:pointer;flex-shrink:0">'
          + '<span style="font-weight:600;color:var(--accent);min-width:60px">' + p.jira_id + '</span>'
          + '<span style="color:var(--muted)">' + p.team_name + '</span>'
          + '</label>';
      }).join('');
      projectsHtml = '<div style="margin-bottom:14px">'
        + '<label style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);display:block;margin-bottom:8px">Projects</label>'
        + '<div id="sd-modal-checkboxes">' + boxes + '</div>'
        + '</div>';
    }

    card.innerHTML = ''
      + '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">'
      +   '<div style="font-size:15px;font-weight:600;letter-spacing:-.3px;color:var(--text)">' + (isNew ? 'Add Sprint Dashboard' : 'Edit Sprint Dashboard') + '</div>'
      +   '<button onclick="_sdCloseModal()" style="width:30px;height:30px;border:1px solid var(--border-md);border-radius:7px;background:none;cursor:pointer;color:var(--muted);display:flex;align-items:center;justify-content:center;transition:all .15s" onmouseenter="this.style.borderColor=\'var(--accent)\';this.style.color=\'var(--accent)\'" onmouseleave="this.style.borderColor=\'var(--border-md)\';this.style.color=\'var(--muted)\'">'
      +     '<svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
      +   '</button>'
      + '</div>'
      + '<div style="padding:20px 24px">'
      +   '<div style="margin-bottom:14px">'
      +     '<label style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);display:block;margin-bottom:5px">Dashboard Name</label>'
      +     '<input id="sd-modal-name" type="text" placeholder="e.g. XTS Team" value="' + (dash ? (dash.name || '').replace(/"/g, '&quot;') : '') + '" style="width:100%;box-sizing:border-box;padding:8px 11px;font-size:13px;border:1px solid var(--border-md);border-radius:7px;background:var(--bg);color:var(--text);outline:none;font-family:inherit">'
      +   '</div>'
      +   projectsHtml
      +   '<div id="sd-modal-err" style="display:none;font-size:12px;color:#E5243B;margin-bottom:10px;padding:8px 10px;background:#FFF0F0;border-radius:6px"></div>'
      +   '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:4px">'
      +     (isNew ? '<div></div>' : '<button onclick="_sdDelete(' + dbId + ')" style="height:34px;padding:0 14px;background:none;border:1px solid #E5243B;border-radius:7px;font-size:13px;font-family:inherit;color:#E5243B;cursor:pointer;transition:all .15s" onmouseenter="this.style.background=\'#FFF0F0\'" onmouseleave="this.style.background=\'none\'">Delete</button>')
      +     '<div style="display:flex;gap:8px">'
      +       '<button onclick="_sdCloseModal()" style="height:34px;padding:0 16px;background:none;border:1px solid var(--border-md);border-radius:7px;font-size:13px;font-family:inherit;color:var(--muted);cursor:pointer">Cancel</button>'
      +       '<button id="sd-modal-save-btn" onclick="_sdSaveModal(' + dbId + ')" style="height:34px;padding:0 18px;background:var(--accent);color:#fff;border:none;border-radius:7px;font-size:13px;font-weight:500;font-family:inherit;cursor:pointer;transition:opacity .15s" onmouseenter="this.style.opacity=\'.85\'" onmouseleave="this.style.opacity=\'1\'">Save</button>'
      +     '</div>'
      +   '</div>'
      + '</div>';

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // Focus name input
    setTimeout(function() {
      var nameEl = document.getElementById('sd-modal-name');
      if (nameEl) nameEl.focus();
    }, 50);
  });
}

function _sdCloseModal() {
  var overlay = document.getElementById('sd-modal-overlay');
  if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
}

function _sdSaveModal(dbId) {
  var nameEl = document.getElementById('sd-modal-name');
  var errEl  = document.getElementById('sd-modal-err');
  var name   = nameEl ? nameEl.value.trim() : '';

  if (!name) {
    if (errEl) { errEl.textContent = 'Dashboard name is required.'; errEl.style.display = 'block'; }
    return;
  }

  // Collect project keys
  var keys = [];
  var keysTextEl = document.getElementById('sd-modal-keys-text');
  if (keysTextEl) {
    // text input mode (no jira projects loaded)
    keys = keysTextEl.value.split(',').map(function(k) { return k.trim(); }).filter(Boolean);
  } else {
    var checkboxes = document.querySelectorAll('#sd-modal-checkboxes input[type=checkbox]');
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) keys.push(checkboxes[i].getAttribute('data-jira'));
    }
  }

  if (keys.length === 0) {
    if (errEl) { errEl.textContent = 'Select at least one project.'; errEl.style.display = 'block'; }
    return;
  }

  _sdSave(dbId, name, keys);
}

function _sdSave(dbId, name, keys) {
  var btn    = document.getElementById('sd-modal-save-btn');
  var errEl  = document.getElementById('sd-modal-err');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }

  var payload = { t: 'sprint-dashboards', name: name, project_keys: keys };
  if (dbId) payload.id = dbId;

  fetch('/api/neon/lookup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(function(r) { return r.json(); })
  .then(function(res) {
    if (!res.ok) throw new Error(res.error || 'Save failed');
    var newId = res.id;
    _sdCloseModal();
    if (typeof _kervLoadDashboards === 'function') {
      _kervLoadDashboards(function() {
        if (typeof setPage === 'function') {
          var pid = 'sprint-db-' + newId;
          setPage(pid, name);
        }
      });
    }
  })
  .catch(function(e) {
    if (errEl) { errEl.textContent = e.message; errEl.style.display = 'block'; }
    if (btn) { btn.disabled = false; btn.textContent = 'Save'; }
  });
}

function _sdDelete(dbId) {
  var confirm_ = typeof snxConfirm === 'function'
    ? snxConfirm
    : function(msg, cb) { if (window.confirm(msg.replace(/<[^>]+>/g, ''))) cb(); };

  confirm_('Delete this sprint dashboard? This cannot be undone.', function() {
    fetch('/api/neon/lookup', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ t: 'sprint-dashboards', id: dbId })
    })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      if (!res.ok) throw new Error(res.error || 'Delete failed');
      _sdCloseModal();
      if (typeof _kervLoadDashboards === 'function') {
        _kervLoadDashboards(function() {
          if (typeof setPage === 'function') setPage('overview', 'Overview');
        });
      }
    })
    .catch(function(e) { alert('Delete failed: ' + e.message); });
  });
}
