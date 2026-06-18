// product-ideas.js — Product Requests / Ideas module (internal SPA)

// ── State ────────────────────────────────────────────────────────────────────
var piRequests = [];
var piFilter   = 'pending'; // 'pending' | 'parked' | 'all'
var piOpenId   = null;  // currently expanded accordion item id

// ── Priority display map ─────────────────────────────────────────────────────
var PI_PRIORITY = {
  'critical':     { label: 'Critical',     color: '#EF4444', bg: 'rgba(239,68,68,.1)'   },
  'high':         { label: 'High',         color: '#F97316', bg: 'rgba(249,115,22,.1)'  },
  'medium':       { label: 'Medium',       color: '#EAB308', bg: 'rgba(234,179,8,.1)'   },
  'low':          { label: 'Low',          color: '#3B82F6', bg: 'rgba(59,130,246,.1)'  },
  'nice-to-have': { label: 'Nice to have', color: '#6B6B63', bg: 'rgba(107,107,99,.1)'  }
};

// ── Render shell ─────────────────────────────────────────────────────────────
function renderProductIdeas() {
  return '<div id="pi-root"></div>';
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function _piFormatDate(iso) {
  if (!iso) return '';
  try {
    var d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch(e) { return iso; }
}

function _piStatusBadge(status) {
  if (status === 'parked') {
    return '<span style="display:inline-block;padding:2px 8px;border-radius:12px;background:rgba(107,107,99,.1);color:#6B6B63;font-size:10px;font-weight:500">Parked</span>';
  }
  return '<span style="display:inline-block;padding:2px 8px;border-radius:12px;background:rgba(234,179,8,.12);color:#B45309;font-size:10px;font-weight:500">Pending</span>';
}

function _piEsc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Convert to Initiative action ──────────────────────────────────────────────
function piPromoteToBacklog(reqId) {
  var req = null;
  for (var i = 0; i < piRequests.length; i++) {
    if (piRequests[i].id === reqId) { req = piRequests[i]; break; }
  }
  if (!req) return;

  window._piPromoteReqId              = req.id;
  window._piNavigateToBacklogAfterSave = true;

  // Ensure the modal is on body and ref data is loaded — no page navigation
  if (typeof rnxLoadRefDataForModal !== 'function') return;
  rnxLoadRefDataForModal(function() {
    if (typeof rnxOpenModal !== 'function') return;
    rnxOpenModal(null);
    setTimeout(function() {
      var titleEl = document.getElementById('rnxi-title');
      if (titleEl) titleEl.value = req.title || '';
      if (typeof rnxMddSet === 'function') {
        rnxMddSet('rnxi-quarter', 'Backlog');
        if (req.team)  rnxMddSet('rnxi-team',  req.team);
        if (req.theme) rnxMddSet('rnxi-theme', req.theme);
      }
    }, 50);
  });
}

// Called from roadmap save hook after an initiative is saved
function piMarkPromoted(reqId, initiativeId) {
  var token = window._kervToken || localStorage.getItem('kerv_token');
  fetch('/api/neon/requests', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': token ? 'Bearer ' + token : '' },
    body: JSON.stringify({ action: 'pr-promote', id: reqId, initiative_id: initiativeId })
  })
  .then(function(r) { return r.json(); })
  .then(function(res) {
    if (res.ok) {
      for (var i = 0; i < piRequests.length; i++) {
        if (piRequests[i].id === reqId) {
          piRequests[i].status = 'promoted_to_initiative';
          piRequests[i].promotedInitiativeId = initiativeId;
          break;
        }
      }
      // After save, navigate to roadmap Backlog tab
      if (window._piNavigateToBacklogAfterSave) {
        window._piNavigateToBacklogAfterSave = false;
        var navItem = document.querySelector('[data-page="roadmap-neon"]');
        if (navItem) navItem.click();
        setTimeout(function() {
          var backlogTab = document.querySelector('[data-rnxtab="backlog"]');
          if (backlogTab) backlogTab.click();
        }, 600);
      }
    }
  })
  .catch(function() { /* silent */ });
}

// Called after a Jira story is created successfully
function piMarkPromotedStory(reqId) {
  var token = window._kervToken || localStorage.getItem('kerv_token');
  fetch('/api/neon/requests', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': token ? 'Bearer ' + token : '' },
    body: JSON.stringify({ action: 'pr-promote-story', id: reqId })
  })
  .then(function(r) { return r.json(); })
  .then(function(res) {
    if (res.ok) {
      for (var i = 0; i < piRequests.length; i++) {
        if (piRequests[i].id === reqId) { piRequests[i].status = 'promoted_to_story'; break; }
      }
      piOpenId = null;
      _piRender();
    }
  })
  .catch(function() { /* silent */ });
}

// ── Park a request ───────────────────────────────────────────────────────────
function piParkRequest(reqId, btn) {
  if (btn) { btn.disabled = true; btn.textContent = 'Parking…'; }
  var token = window._kervToken || localStorage.getItem('kerv_token');
  fetch('/api/neon/requests', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': token ? 'Bearer ' + token : '' },
    body: JSON.stringify({ action: 'pr-park', id: reqId })
  })
  .then(function(r) { return r.json(); })
  .then(function(res) {
    if (res.ok) {
      for (var i = 0; i < piRequests.length; i++) {
        if (piRequests[i].id === reqId) { piRequests[i].status = 'parked'; break; }
      }
      piOpenId = null;
      _piRender();
    } else {
      if (btn) { btn.disabled = false; btn.textContent = 'Park'; }
    }
  })
  .catch(function() { if (btn) { btn.disabled = false; btn.textContent = 'Park'; } });
}

// ── Restore to pending ────────────────────────────────────────────────────────
function piRestorePending(reqId, btn) {
  if (btn) { btn.disabled = true; btn.textContent = 'Restoring…'; }
  var token = window._kervToken || localStorage.getItem('kerv_token');
  fetch('/api/neon/requests', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': token ? 'Bearer ' + token : '' },
    body: JSON.stringify({ action: 'pr-pending', id: reqId })
  })
  .then(function(r) { return r.json(); })
  .then(function(res) {
    if (res.ok) {
      for (var i = 0; i < piRequests.length; i++) {
        if (piRequests[i].id === reqId) { piRequests[i].status = 'pending'; break; }
      }
      piOpenId = null;
      _piRender();
    } else {
      if (btn) { btn.disabled = false; btn.textContent = 'Back to Pending'; }
    }
  })
  .catch(function() { if (btn) { btn.disabled = false; btn.textContent = 'Back to Pending'; } });
}

// ── Convert to Jira Story ─────────────────────────────────────────────────────
var _piJiraReqId       = null;
var _piJiraProjList    = [];
var _piJiraEpicList    = [];
var _piJiraSelProj     = '';
var _piJiraSelEpicKey  = '';
var _piJiraSelEpicName = '';

function _piJiraBuildProjPanel(projects) {
  if (!projects || !projects.length) {
    return '<div style="padding:10px 14px;font-size:12px;color:var(--muted)">No projects found</div>';
  }
  return projects.map(function(p) {
    var selected = (_piJiraSelProj === p.jira_id);
    return '<div onclick="piSelectJiraProj(\'' + _piEsc(p.jira_id) + '\', \'' + _piEsc(p.team_name || p.jira_id) + '\')" '
      + 'style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 12px;cursor:pointer;border-radius:6px;transition:background .1s" '
      + 'onmouseenter="this.style.background=\'rgba(0,107,228,.06)\'" onmouseleave="this.style.background=\'\'">'
      + '<span style="font-size:12px;color:var(--text)">'
      +   '<span style="color:#006BE4;font-weight:600">' + _piEsc(p.jira_id) + '</span>'
      +   '&nbsp;' + _piEsc(p.team_name || p.jira_id)
      + '</span>'
      + (selected ? '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" style="flex-shrink:0"><path d="M2 6.5l3.5 3.5 5.5-6" stroke="#006BE4" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '')
      + '</div>';
  }).join('');
}

function _piJiraBuildEpicPanel(epics, filter) {
  var f = (filter || '').toLowerCase();
  var shown = epics.filter(function(e) {
    if (e.statusCategory === 'done') return false;
    if (!f) return true;
    return (e.key || '').toLowerCase().indexOf(f) !== -1 || (e.summary || '').toLowerCase().indexOf(f) !== -1;
  });
  if (!shown.length) {
    return '<div style="padding:10px 14px;font-size:12px;color:var(--muted)">No epics found</div>';
  }
  return shown.map(function(e) {
    var selected = (_piJiraSelEpicKey === e.key);
    var sc = e.statusCategory || 'new';
    var scColor = sc === 'done' ? '#10B981' : sc === 'indeterminate' ? '#F59E0B' : '#9CA3AF';
    return '<div onclick="piSelectJiraEpic(\'' + _piEsc(e.key) + '\', \'' + _piEsc((e.summary || e.key).replace(/'/g, "\\'")) + '\')" '
      + 'style="display:flex;align-items:center;gap:8px;padding:8px 12px;cursor:pointer;border-radius:6px;transition:background .1s" '
      + 'onmouseenter="this.style.background=\'rgba(0,107,228,.06)\'" onmouseleave="this.style.background=\'\'">'
      + '<span style="font-size:12px;color:var(--text);flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'
      +   '<span style="color:#006BE4;font-weight:600">' + _piEsc(e.key) + '</span>'
      +   '&nbsp;' + _piEsc(e.summary || e.key)
      + '</span>'
      + '<span style="font-size:11px;color:' + scColor + ';white-space:nowrap;flex-shrink:0">' + _piEsc(e.status || '') + '</span>'
      + (selected ? '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" style="flex-shrink:0"><path d="M2 6.5l3.5 3.5 5.5-6" stroke="#006BE4" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '')
      + '</div>';
  }).join('');
}

function _piJiraSetDdStyle(btnId, open) {
  var btn = document.getElementById(btnId);
  if (!btn) return;
  btn.style.borderColor = open ? '#006BE4' : 'var(--border-md)';
  btn.style.boxShadow   = open ? '0 0 0 3px rgba(0,107,228,.12)' : 'none';
}

function piToggleJiraProjDd() {
  var panel = document.getElementById('pi-jira-proj-panel');
  if (!panel) return;
  var open = panel.style.display !== 'none';
  var ePanel = document.getElementById('pi-jira-epic-panel');
  if (ePanel) ePanel.style.display = 'none';
  _piJiraSetDdStyle('pi-jira-epic-btn', false);
  panel.style.display = open ? 'none' : 'block';
  _piJiraSetDdStyle('pi-jira-proj-btn', !open);
}

function piToggleJiraEpicDd() {
  var panel = document.getElementById('pi-jira-epic-panel');
  if (!panel) return;
  var open = panel.style.display !== 'none';
  var pPanel = document.getElementById('pi-jira-proj-panel');
  if (pPanel) pPanel.style.display = 'none';
  _piJiraSetDdStyle('pi-jira-proj-btn', false);
  panel.style.display = open ? 'none' : 'block';
  _piJiraSetDdStyle('pi-jira-epic-btn', !open);
  if (!open) {
    var fi = document.getElementById('pi-jira-epic-filter');
    if (fi) { fi.value = ''; setTimeout(function() { fi.focus(); }, 50); }
    var ep = document.getElementById('pi-jira-epic-opts');
    if (ep) ep.innerHTML = _piJiraBuildEpicPanel(_piJiraEpicList, '');
  }
}

function piSelectJiraProj(jiraId, name) {
  _piJiraSelProj     = jiraId;
  _piJiraSelEpicKey  = '';
  _piJiraSelEpicName = '';
  _piJiraEpicList    = [];

  var btn = document.getElementById('pi-jira-proj-btn');
  if (btn) {
    btn.querySelector('.pi-jira-dd-label').textContent = name;
    _piJiraSetDdStyle('pi-jira-proj-btn', false);
  }
  var panel = document.getElementById('pi-jira-proj-panel');
  if (panel) panel.style.display = 'none';

  var opts = document.getElementById('pi-jira-proj-opts');
  if (opts) opts.innerHTML = _piJiraBuildProjPanel(_piJiraProjList);

  var epicBtn   = document.getElementById('pi-jira-epic-btn');
  var epicLabel = epicBtn ? epicBtn.querySelector('.pi-jira-dd-label') : null;
  if (epicLabel) epicLabel.textContent = 'Loading epics…';
  var epicOpts = document.getElementById('pi-jira-epic-opts');
  if (epicOpts) epicOpts.innerHTML = '<div style="padding:10px 14px;font-size:12px;color:var(--muted)">Loading…</div>';

  fetch('/api/jira/issues?project=' + encodeURIComponent(jiraId) + '&type=Epic')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      _piJiraEpicList = (data && Array.isArray(data.epics)) ? data.epics : [];
      if (epicLabel) epicLabel.textContent = _piJiraEpicList.length ? 'Select Epic (optional)' : 'No epics found';
      if (epicOpts)  epicOpts.innerHTML = _piJiraBuildEpicPanel(_piJiraEpicList, '');
    })
    .catch(function() {
      _piJiraEpicList = [];
      if (epicLabel) epicLabel.textContent = 'Failed to load epics';
    });
}

function piSelectJiraEpic(key, name) {
  if (_piJiraSelEpicKey === key) {
    _piJiraSelEpicKey  = '';
    _piJiraSelEpicName = '';
  } else {
    _piJiraSelEpicKey  = key;
    _piJiraSelEpicName = name;
  }
  var epicBtn   = document.getElementById('pi-jira-epic-btn');
  var epicLabel = epicBtn ? epicBtn.querySelector('.pi-jira-dd-label') : null;
  if (epicLabel) epicLabel.textContent = _piJiraSelEpicKey ? _piJiraSelEpicName : 'Select Epic (optional)';
  var panel = document.getElementById('pi-jira-epic-panel');
  if (panel) panel.style.display = 'none';
  _piJiraSetDdStyle('pi-jira-epic-btn', false);
  var opts = document.getElementById('pi-jira-epic-opts');
  if (opts) opts.innerHTML = _piJiraBuildEpicPanel(_piJiraEpicList, '');
}

function piFilterJiraEpics() {
  var fi   = document.getElementById('pi-jira-epic-filter');
  var opts = document.getElementById('pi-jira-epic-opts');
  if (!fi || !opts) return;
  opts.innerHTML = _piJiraBuildEpicPanel(_piJiraEpicList, fi.value);
}

function piOpenJiraModal(reqId) {
  var req = null;
  for (var i = 0; i < piRequests.length; i++) {
    if (piRequests[i].id === reqId) { req = piRequests[i]; break; }
  }
  if (!req) return;
  _piJiraReqId       = reqId;
  _piJiraSelProj     = '';
  _piJiraSelEpicKey  = '';
  _piJiraSelEpicName = '';
  _piJiraEpicList    = [];

  var existing = document.getElementById('pi-jira-modal');
  if (existing) existing.remove();

  _piJiraProjList = (typeof _rnxJiraProjects !== 'undefined' && _rnxJiraProjects.length)
    ? _rnxJiraProjects : [];

  var labelStyle = 'display:block;font-size:11px;font-weight:500;color:var(--muted);margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px';
  var inputStyle = 'width:100%;box-sizing:border-box;padding:7px 10px;font-size:13px;border:1px solid var(--border-md);border-radius:6px;background:var(--surface);color:var(--text);outline:none;font-family:inherit';
  var ddBtnBase  = 'width:100%;display:flex;align-items:center;justify-content:space-between;gap:6px;padding:7px 10px;font-size:12px;font-family:inherit;border:1px solid var(--border-md);border-radius:6px;background:var(--surface);color:var(--text);cursor:pointer;transition:border-color .15s,box-shadow .15s;text-align:left';
  var ddPanelBase = 'display:none;position:absolute;top:calc(100% + 4px);left:0;right:0;background:var(--surface);border:1px solid var(--border);border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.12);z-index:10001;padding:4px';
  var chevron = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" style="flex-shrink:0;opacity:.5"><path d="M2 3.5l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var jiraPath = 'M11.53,2a4.37,4.37,0,0,0,4.35,4.35h1.78v1.7A4.35,4.35,0,0,0,22,12.4V2.84A.85.85,0,0,0,21.16,2H11.53M6.77,6.8a4.36,4.36,0,0,0,4.34,4.34h1.8v1.72a4.36,4.36,0,0,0,4.34,4.34V7.63a.84.84,0,0,0-.83-.83H6.77M2,11.6a4.34,4.34,0,0,0,4.35,4.34H8.13v1.72A4.36,4.36,0,0,0,12.47,22V12.43a.85.85,0,0,0-.84-.84H2Z';
  var jiraSvg16 = '<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="white"><rect width="24" height="24" fill="none"/><path d="' + jiraPath + '"/></svg>';
  var jiraSvg13 = '<svg width="13" height="13" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="white"><rect width="24" height="24" fill="none"/><path d="' + jiraPath + '"/></svg>';

  var projLabel = _piJiraProjList.length ? 'Select Project' : 'No projects configured';

  var modal = document.createElement('div');
  modal.id = 'pi-jira-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:9999;padding:24px';

  modal.innerHTML =
    '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;width:100%;max-width:480px;box-shadow:0 8px 32px rgba(0,0,0,.18);overflow:visible">'

    // Header
    + '<div style="display:flex;align-items:center;justify-content:space-between;padding:18px 24px;border-bottom:1px solid var(--border)">'
    +   '<div style="display:flex;align-items:center;gap:10px">'
    +     '<div style="width:28px;height:28px;border-radius:6px;background:#006BE4;display:flex;align-items:center;justify-content:center;flex-shrink:0">' + jiraSvg16 + '</div>'
    +     '<div style="font-size:15px;font-weight:600;color:var(--text)">Convert to Jira Story</div>'
    +   '</div>'
    +   '<button onclick="piCloseJiraModal()" style="background:none;border:none;cursor:pointer;color:var(--muted);padding:4px;border-radius:4px;line-height:0">'
    +     '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    +   '</button>'
    + '</div>'

    // Body
    + '<div style="padding:20px 24px;display:flex;flex-direction:column;gap:14px">'

    // Jira Project
    +   '<div style="position:relative">'
    +     '<label style="' + labelStyle + '">Jira Project</label>'
    +     '<button id="pi-jira-proj-btn" onclick="piToggleJiraProjDd()" style="' + ddBtnBase + '">'
    +       '<span class="pi-jira-dd-label" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + projLabel + '</span>'
    +       chevron
    +     '</button>'
    +     '<div id="pi-jira-proj-panel" style="' + ddPanelBase + '">'
    +       '<div id="pi-jira-proj-opts">' + _piJiraBuildProjPanel(_piJiraProjList) + '</div>'
    +     '</div>'
    +   '</div>'

    // Epic
    +   '<div style="position:relative">'
    +     '<label style="' + labelStyle + '">Epic <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--faint)">(optional)</span></label>'
    +     '<button id="pi-jira-epic-btn" onclick="piToggleJiraEpicDd()" style="' + ddBtnBase + '">'
    +       '<span class="pi-jira-dd-label" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Select Epic (optional)</span>'
    +       chevron
    +     '</button>'
    +     '<div id="pi-jira-epic-panel" style="' + ddPanelBase + '">'
    +       '<div style="padding:4px 4px 2px">'
    +         '<input id="pi-jira-epic-filter" type="text" placeholder="Filter epics…" oninput="piFilterJiraEpics()" '
    +           'onfocus="this.style.borderColor=\'#006BE4\';this.style.boxShadow=\'0 0 0 3px rgba(0,107,228,.12)\'" '
    +           'onblur="this.style.borderColor=\'var(--border-md)\';this.style.boxShadow=\'none\'" '
    +           'style="width:100%;box-sizing:border-box;padding:6px 10px;font-size:12px;font-family:inherit;border:1px solid var(--border-md);border-radius:6px;background:var(--bg);color:var(--text);outline:none;margin-bottom:2px;transition:border-color .15s,box-shadow .15s">'
    +       '</div>'
    +       '<div id="pi-jira-epic-opts" style="max-height:160px;overflow-y:auto">'
    +         '<div style="padding:10px 14px;font-size:12px;color:var(--muted)">Select a project first</div>'
    +       '</div>'
    +     '</div>'
    +   '</div>'

    // Story Title
    +   '<div><label style="' + labelStyle + '">Story Title</label>'
    +     '<input id="pi-jira-title" type="text" value="' + _piEsc(req.title || '') + '" style="' + inputStyle + '" />'
    +   '</div>'

    // Description
    +   '<div><label style="' + labelStyle + '">Description</label>'
    +     '<textarea id="pi-jira-desc" rows="4" style="' + inputStyle + ';resize:vertical;line-height:1.5">' + _piEsc(req.description || '') + '</textarea>'
    +   '</div>'

    +   '<div id="pi-jira-err" style="display:none;font-size:12px;color:#EF4444;padding:6px 10px;background:rgba(239,68,68,.08);border-radius:6px"></div>'

    + '</div>'

    // Footer
    + '<div style="display:flex;justify-content:flex-end;gap:8px;padding:14px 24px;border-top:1px solid var(--border)">'
    +   '<button onclick="piCloseJiraModal()" style="padding:7px 16px;font-size:12px;font-weight:500;font-family:inherit;border:1px solid var(--border-md);border-radius:7px;background:var(--surface);color:var(--text);cursor:pointer">Cancel</button>'
    +   '<button id="pi-jira-submit-btn" onclick="piSubmitJiraStory()" style="padding:7px 16px;font-size:12px;font-weight:500;font-family:inherit;border:none;border-radius:7px;background:#006BE4;color:#fff;cursor:pointer;display:flex;align-items:center;gap:6px;transition:opacity .12s" onmouseenter="this.style.opacity=\'.85\'" onmouseleave="this.style.opacity=\'1\'">'
    +     jiraSvg13 + 'Create Story'
    +   '</button>'
    + '</div>'

    + '</div>';

  modal.addEventListener('click', function(e) {
    if (e.target === modal) { piCloseJiraModal(); return; }
    var pPanel = document.getElementById('pi-jira-proj-panel');
    var ePanel = document.getElementById('pi-jira-epic-panel');
    if (pPanel && pPanel.style.display !== 'none') {
      var projBtn = document.getElementById('pi-jira-proj-btn');
      if (!pPanel.contains(e.target) && projBtn && !projBtn.contains(e.target)) {
        pPanel.style.display = 'none';
        _piJiraSetDdStyle('pi-jira-proj-btn', false);
      }
    }
    if (ePanel && ePanel.style.display !== 'none') {
      var epicBtn = document.getElementById('pi-jira-epic-btn');
      if (!ePanel.contains(e.target) && epicBtn && !epicBtn.contains(e.target)) {
        ePanel.style.display = 'none';
        _piJiraSetDdStyle('pi-jira-epic-btn', false);
      }
    }
  });

  document.body.appendChild(modal);

  // Fetch projects if not yet loaded
  if (!_piJiraProjList.length) {
    fetch('/api/neon/jira-projects')
      .then(function(r) { return r.json(); })
      .then(function(rows) {
        if (!Array.isArray(rows) || !rows.length) return;
        _piJiraProjList = rows;
        var opts = document.getElementById('pi-jira-proj-opts');
        var btn  = document.getElementById('pi-jira-proj-btn');
        if (opts) opts.innerHTML = _piJiraBuildProjPanel(_piJiraProjList);
        if (btn)  btn.querySelector('.pi-jira-dd-label').textContent = 'Select Project';
      })
      .catch(function() {});
  }
}

function piCloseJiraModal() {
  var m = document.getElementById('pi-jira-modal');
  if (m) m.remove();
  _piJiraReqId       = null;
  _piJiraSelProj     = '';
  _piJiraSelEpicKey  = '';
  _piJiraSelEpicName = '';
}

function piSubmitJiraStory() {
  var btn   = document.getElementById('pi-jira-submit-btn');
  var errEl = document.getElementById('pi-jira-err');
  var title = (document.getElementById('pi-jira-title') || {}).value || '';
  var desc  = (document.getElementById('pi-jira-desc')  || {}).value || '';

  errEl.style.display = 'none';

  if (!title.trim()) {
    errEl.textContent = 'Story title is required.';
    errEl.style.display = 'block';
    return;
  }
  if (!_piJiraSelProj) {
    errEl.textContent = 'Please select a Jira project.';
    errEl.style.display = 'block';
    return;
  }

  if (btn) { btn.disabled = true; btn.textContent = 'Creating…'; }

  var payload = {
    title:       title.trim(),
    description: desc.trim() || undefined,
    type:        'Story',
    project:     _piJiraSelProj
  };
  if (_piJiraSelEpicKey) payload.parentKey = _piJiraSelEpicKey;

  fetch('/api/jira/issue', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload)
  })
  .then(function(r) { return r.json(); })
  .then(function(res) {
    if (!res.ok) throw new Error(res.error || 'Jira API error');
    var reqId = _piJiraReqId;
    // Show success state inside the modal
    var inner = document.querySelector('#pi-jira-modal > div');
    if (inner) {
      inner.innerHTML =
        '<div style="padding:40px 32px;text-align:center">'
        + '<div style="width:48px;height:48px;border-radius:50%;background:rgba(0,107,228,.1);display:flex;align-items:center;justify-content:center;margin:0 auto 16px">'
        +   '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="#006BE4" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        + '</div>'
        + '<div style="font-size:15px;font-weight:600;color:var(--text);margin-bottom:6px">Story created!</div>'
        + '<div style="font-size:12px;color:var(--muted);margin-bottom:4px">Jira story <strong style="color:#006BE4">' + (res.key || '') + '</strong> has been created successfully.</div>'
        + '<div style="font-size:12px;color:var(--faint);margin-bottom:24px">The request has been marked as promoted.</div>'
        + '<button onclick="piCloseJiraModal()" style="padding:7px 20px;font-size:12px;font-weight:500;font-family:inherit;border:none;border-radius:7px;background:#006BE4;color:#fff;cursor:pointer;transition:opacity .12s" onmouseenter="this.style.opacity=\'.85\'" onmouseleave="this.style.opacity=\'1\'">Done</button>'
        + '</div>';
    }
    if (reqId) piMarkPromotedStory(reqId);
  })
  .catch(function(e) {
    errEl.textContent = e.message || 'Failed to create Jira story.';
    errEl.style.display = 'block';
    var jiraPath2 = 'M11.53,2a4.37,4.37,0,0,0,4.35,4.35h1.78v1.7A4.35,4.35,0,0,0,22,12.4V2.84A.85.85,0,0,0,21.16,2H11.53M6.77,6.8a4.36,4.36,0,0,0,4.34,4.34h1.8v1.72a4.36,4.36,0,0,0,4.34,4.34V7.63a.84.84,0,0,0-.83-.83H6.77M2,11.6a4.34,4.34,0,0,0,4.35,4.34H8.13v1.72A4.36,4.36,0,0,0,12.47,22V12.43a.85.85,0,0,0-.84-.84H2Z';
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="white"><rect width="24" height="24" fill="none"/><path d="' + jiraPath2 + '"/></svg> Create Story';
    }
  });
}

// ── Add Request modal ─────────────────────────────────────────────────────────
var _piAddReqTeams  = [];
var _piAddReqThemes = [];
var _piAddSelPri    = 'medium';
var _piAddSelTeam   = '';
var _piAddSelTheme  = '';

var _PI_PRI_OPTS = [
  { val: 'critical',     label: 'Critical',     color: '#EF4444' },
  { val: 'high',         label: 'High',         color: '#F97316' },
  { val: 'medium',       label: 'Medium',       color: '#EAB308' },
  { val: 'low',          label: 'Low',          color: '#3B82F6' },
  { val: 'nice-to-have', label: 'Nice to have', color: '#6B7280' }
];

function _piAddDdBtnStyle(open) {
  return 'width:100%;display:flex;align-items:center;justify-content:space-between;gap:6px;padding:7px 10px;'
    + 'font-size:12px;font-family:inherit;border:1px solid ' + (open ? 'var(--accent)' : 'var(--border-md)') + ';'
    + 'border-radius:6px;background:var(--surface);color:var(--text);cursor:pointer;text-align:left;'
    + (open ? 'box-shadow:0 0 0 3px rgba(236,72,153,.1)' : '');
}

function _piAddChevron() {
  return '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" style="flex-shrink:0;opacity:.5"><path d="M2 3.5l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

function _piAddCheckmark() {
  return '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" style="flex-shrink:0"><path d="M2 6.5l3.5 3.5 5.5-6" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

function _piAddBuildPriOpts() {
  return _PI_PRI_OPTS.map(function(p) {
    var sel = _piAddSelPri === p.val;
    return '<div onclick="piAddSelectPri(\'' + p.val + '\', \'' + p.label + '\')" '
      + 'style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 12px;cursor:pointer;border-radius:5px;transition:background .1s" '
      + 'onmouseenter="this.style.background=\'var(--subtle)\'" onmouseleave="this.style.background=\'\'">'
      + '<span style="display:flex;align-items:center;gap:7px;font-size:12px;color:var(--text)">'
      +   '<span style="width:7px;height:7px;border-radius:50%;background:' + p.color + ';flex-shrink:0"></span>'
      +   p.label
      + '</span>'
      + (sel ? _piAddCheckmark() : '')
      + '</div>';
  }).join('');
}

function _piAddBuildListOpts(field, items) {
  var selVal = field === 'team' ? _piAddSelTeam : _piAddSelTheme;
  var rows = '<div onclick="piAddSelectList(\'' + field + '\', \'\', \'None\')" '
    + 'style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 12px;cursor:pointer;border-radius:5px;transition:background .1s" '
    + 'onmouseenter="this.style.background=\'var(--subtle)\'" onmouseleave="this.style.background=\'\'">'
    + '<span style="font-size:12px;color:var(--muted)">None</span>'
    + (selVal === '' ? _piAddCheckmark() : '')
    + '</div>';
  rows += items.map(function(t) {
    var sel = selVal === t.name;
    return '<div onclick="piAddSelectList(\'' + field + '\', \'' + _piEsc(t.name) + '\', \'' + _piEsc(t.name) + '\')" '
      + 'style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 12px;cursor:pointer;border-radius:5px;transition:background .1s" '
      + 'onmouseenter="this.style.background=\'var(--subtle)\'" onmouseleave="this.style.background=\'\'">'
      + '<span style="font-size:12px;color:var(--text)">' + _piEsc(t.name) + '</span>'
      + (sel ? _piAddCheckmark() : '')
      + '</div>';
  }).join('');
  return rows;
}

function _piAddToggleDd(field) {
  var allFields = ['pri', 'team', 'theme'];
  allFields.forEach(function(f) {
    var panel = document.getElementById('pi-add-' + f + '-panel');
    var btn   = document.getElementById('pi-add-' + f + '-btn');
    if (f === field) {
      var isOpen = panel && panel.style.display !== 'none';
      if (!isOpen && btn && panel) {
        // Position using fixed coords so overflow:auto doesn't clip it
        var rect = btn.getBoundingClientRect();
        panel.style.position = 'fixed';
        panel.style.top      = (rect.bottom + 4) + 'px';
        panel.style.left     = rect.left + 'px';
        panel.style.width    = rect.width + 'px';
        panel.style.right    = 'auto';
        panel.style.display  = 'block';
        if (btn) btn.style.cssText = _piAddDdBtnStyle(true);
      } else {
        if (panel) panel.style.display = 'none';
        if (btn)   btn.style.cssText = _piAddDdBtnStyle(false);
      }
    } else {
      if (panel) panel.style.display = 'none';
      if (btn)   btn.style.cssText = _piAddDdBtnStyle(false);
    }
  });
}

function piAddSelectPri(val, label) {
  _piAddSelPri = val;
  var pri = _PI_PRI_OPTS.find(function(p) { return p.val === val; }) || _PI_PRI_OPTS[2];
  var btn = document.getElementById('pi-add-pri-btn');
  if (btn) {
    btn.querySelector('.pi-add-dd-label').innerHTML =
      '<span style="display:inline-flex;align-items:center;gap:6px">'
      + '<span style="width:7px;height:7px;border-radius:50%;background:' + pri.color + ';flex-shrink:0;display:inline-block"></span>'
      + label + '</span>';
    btn.style.cssText = _piAddDdBtnStyle(false);
  }
  var panel = document.getElementById('pi-add-pri-panel');
  if (panel) { panel.style.display = 'none'; panel.querySelector('.pi-add-dd-opts').innerHTML = _piAddBuildPriOpts(); }
}

function piAddSelectList(field, val, label) {
  if (field === 'team')  _piAddSelTeam  = val;
  if (field === 'theme') _piAddSelTheme = val;
  var btn = document.getElementById('pi-add-' + field + '-btn');
  if (btn) {
    btn.querySelector('.pi-add-dd-label').textContent = label || 'None';
    btn.querySelector('.pi-add-dd-label').style.color = val ? 'var(--text)' : 'var(--muted)';
    btn.style.cssText = _piAddDdBtnStyle(false);
  }
  var panel = document.getElementById('pi-add-' + field + '-panel');
  var items = field === 'team' ? _piAddReqTeams : _piAddReqThemes;
  if (panel) { panel.style.display = 'none'; panel.querySelector('.pi-add-dd-opts').innerHTML = _piAddBuildListOpts(field, items); }
}

function _piAddDdHtml(field, label, labelText) {
  var panelStyle = 'display:none;background:var(--surface);'
    + 'border:1px solid var(--border);border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.12);z-index:10010;padding:4px;max-height:220px;overflow-y:auto';
  var LB = 'display:block;font-size:11px;font-weight:500;color:var(--muted);margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px';
  return '<div style="position:relative">'
    + '<label style="' + LB + '">' + labelText + '</label>'
    + '<button id="pi-add-' + field + '-btn" type="button" onclick="_piAddToggleDd(\'' + field + '\')" style="' + _piAddDdBtnStyle(false) + '">'
    +   '<span class="pi-add-dd-label" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted)">' + label + '</span>'
    +   _piAddChevron()
    + '</button>'
    + '<div id="pi-add-' + field + '-panel" style="' + panelStyle + '">'
    +   '<div class="pi-add-dd-opts"></div>'
    + '</div>'
    + '</div>';
}

function piOpenAddModal() {
  // Reset state
  _piAddSelPri   = 'medium';
  _piAddSelTeam  = '';
  _piAddSelTheme = '';

  var existing = document.getElementById('pi-add-modal');
  if (existing) existing.remove();

  var LB = 'display:block;font-size:11px;font-weight:500;color:var(--muted);margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px';
  var inp = 'width:100%;box-sizing:border-box;padding:7px 10px;font-size:13px;border:1px solid var(--border-md);border-radius:6px;background:var(--surface);color:var(--text);outline:none;font-family:inherit;transition:border-color .15s,box-shadow .15s';
  var foc = 'onfocus="this.style.borderColor=\'var(--accent)\';this.style.boxShadow=\'0 0 0 3px rgba(236,72,153,.1)\'" onblur="this.style.borderColor=\'var(--border-md)\';this.style.boxShadow=\'none\'"';
  var bulb = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="color:var(--accent)"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>';

  var modal = document.createElement('div');
  modal.id = 'pi-add-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:9999;padding:24px';

  modal.innerHTML =
    '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;width:100%;max-width:520px;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,.18)">'

    // Header
    + '<div style="display:flex;align-items:center;justify-content:space-between;padding:18px 24px;border-bottom:1px solid var(--border);flex-shrink:0">'
    +   '<div style="display:flex;align-items:center;gap:8px">'
    +     bulb
    +     '<span style="font-size:15px;font-weight:600;color:var(--text)">Add Request / Idea</span>'
    +   '</div>'
    +   '<button onclick="piCloseAddModal()" style="background:none;border:none;cursor:pointer;color:var(--muted);padding:4px;border-radius:4px;line-height:0">'
    +     '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    +   '</button>'
    + '</div>'

    // Body
    + '<div style="padding:20px 24px;display:flex;flex-direction:column;gap:14px;overflow-y:auto">'

    // Title
    +   '<div><label style="' + LB + '">Title <span style="color:#EF4444">*</span></label>'
    +     '<input id="pi-add-title" type="text" placeholder="Describe the request or idea..." ' + foc + ' style="' + inp + '" />'
    +   '</div>'

    // Description
    +   '<div><label style="' + LB + '">Description</label>'
    +     '<textarea id="pi-add-desc" rows="3" placeholder="More context, user problem, expected outcome..." ' + foc + ' style="' + inp + ';resize:vertical;line-height:1.5"></textarea>'
    +   '</div>'

    // Priority + Team + Theme (custom dropdowns)
    +   '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">'
    +     _piAddDdHtml('pri',   'Medium', 'Priority')
    +     _piAddDdHtml('team',  'None',   'Team')
    +     _piAddDdHtml('theme', 'None',   'Theme')
    +   '</div>'

    // Notes
    +   '<div><label style="' + LB + '">Notes <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--faint)">(internal)</span></label>'
    +     '<textarea id="pi-add-notes" rows="2" placeholder="Internal notes, links, references..." ' + foc + ' style="' + inp + ';resize:vertical;line-height:1.5"></textarea>'
    +   '</div>'

    // Divider
    +   '<div style="height:1px;background:var(--border)"></div>'

    // Submitted by
    +   '<div style="font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;margin-bottom:-6px">Submitted by</div>'
    +   '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'
    +     '<div><label style="' + LB + '">Name <span style="color:#EF4444">*</span></label>'
    +       '<input id="pi-add-name" type="text" placeholder="Full name" ' + foc + ' style="' + inp + '" />'
    +     '</div>'
    +     '<div><label style="' + LB + '">Email</label>'
    +       '<input id="pi-add-email" type="email" placeholder="email@company.com" ' + foc + ' style="' + inp + '" />'
    +     '</div>'
    +   '</div>'

    +   '<div id="pi-add-err" style="display:none;font-size:12px;color:#EF4444;padding:6px 10px;background:rgba(239,68,68,.08);border-radius:6px"></div>'
    + '</div>'

    // Footer
    + '<div style="display:flex;justify-content:flex-end;gap:8px;padding:14px 24px;border-top:1px solid var(--border);flex-shrink:0">'
    +   '<button onclick="piCloseAddModal()" style="padding:7px 16px;font-size:12px;font-weight:500;font-family:inherit;border:1px solid var(--border-md);border-radius:7px;background:var(--surface);color:var(--text);cursor:pointer">Cancel</button>'
    +   '<button id="pi-add-submit-btn" onclick="piSubmitAddRequest()" style="padding:7px 16px;font-size:12px;font-weight:500;font-family:inherit;border:1px solid var(--border-md);border-radius:7px;background:var(--surface);color:var(--text);cursor:pointer;transition:background .12s" onmouseenter="this.style.background=\'var(--subtle)\'" onmouseleave="this.style.background=\'var(--surface)\'">Submit Request</button>'
    + '</div>'
    + '</div>';

  // Close dropdowns on outside click
  modal.addEventListener('click', function(e) {
    if (e.target === modal) { piCloseAddModal(); return; }
    ['pri','team','theme'].forEach(function(f) {
      var panel = document.getElementById('pi-add-' + f + '-panel');
      var btn   = document.getElementById('pi-add-' + f + '-btn');
      if (panel && panel.style.display !== 'none' && btn && !btn.contains(e.target) && !panel.contains(e.target)) {
        panel.style.display = 'none';
        btn.style.cssText = _piAddDdBtnStyle(false);
      }
    });
  });

  document.body.appendChild(modal);

  // Populate dropdown options
  document.getElementById('pi-add-pri-panel').querySelector('.pi-add-dd-opts').innerHTML = _piAddBuildPriOpts();
  document.getElementById('pi-add-team-panel').querySelector('.pi-add-dd-opts').innerHTML = _piAddBuildListOpts('team', _piAddReqTeams);
  document.getElementById('pi-add-theme-panel').querySelector('.pi-add-dd-opts').innerHTML = _piAddBuildListOpts('theme', _piAddReqThemes);

  // Set default priority display
  var priBtn = document.getElementById('pi-add-pri-btn');
  if (priBtn) priBtn.querySelector('.pi-add-dd-label').innerHTML =
    '<span style="display:inline-flex;align-items:center;gap:6px">'
    + '<span style="width:7px;height:7px;border-radius:50%;background:#EAB308;flex-shrink:0;display:inline-block"></span>'
    + 'Medium</span>';

  // Pre-fill name/email from logged-in user
  if (window._kervUser) {
    var nameEl  = document.getElementById('pi-add-name');
    var emailEl = document.getElementById('pi-add-email');
    var fullName = [window._kervUser.first_name, window._kervUser.last_name].filter(Boolean).join(' ');
    if (nameEl  && fullName)               nameEl.value  = fullName;
    if (emailEl && window._kervUser.email) emailEl.value = window._kervUser.email;
  }

  setTimeout(function() {
    var t = document.getElementById('pi-add-title');
    if (t) t.focus();
  }, 50);
}

function piCloseAddModal() {
  var m = document.getElementById('pi-add-modal');
  if (m) m.remove();
}

function piSubmitAddRequest() {
  var btn   = document.getElementById('pi-add-submit-btn');
  var errEl = document.getElementById('pi-add-err');
  var title = (document.getElementById('pi-add-title') || {}).value || '';
  var desc  = (document.getElementById('pi-add-desc')  || {}).value || '';
  var name  = (document.getElementById('pi-add-name')  || {}).value || '';
  var email = (document.getElementById('pi-add-email') || {}).value || '';
  var notes = (document.getElementById('pi-add-notes') || {}).value || '';

  errEl.style.display = 'none';
  if (!title.trim()) {
    errEl.textContent = 'Title is required.';
    errEl.style.display = 'block';
    document.getElementById('pi-add-title').focus();
    return;
  }
  if (!name.trim()) {
    errEl.textContent = 'Name is required.';
    errEl.style.display = 'block';
    document.getElementById('pi-add-name').focus();
    return;
  }

  if (btn) { btn.disabled = true; btn.textContent = 'Submitting...'; }

  fetch('/api/neon/requests', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      action:          'pr-submit',
      title:           title.trim(),
      description:     desc.trim()  || undefined,
      requester_name:  name.trim(),
      requester_email: email.trim() || undefined,
      priority:        _piAddSelPri,
      team:            _piAddSelTeam  || undefined,
      theme:           _piAddSelTheme || undefined,
      notes:           notes.trim()  || undefined
    })
  })
  .then(function(r) { return r.json(); })
  .then(function(res) {
    if (!res.ok) throw new Error(res.error || 'Failed to submit');
    piCloseAddModal();
    piLoad();
  })
  .catch(function(e) {
    errEl.textContent = e.message || 'Failed to submit request.';
    errEl.style.display = 'block';
    if (btn) { btn.disabled = false; btn.textContent = 'Submit Request'; }
  });
}

// Preload teams/themes for the add modal
function _piLoadRefData(cb) {
  if (_piAddReqTeams.length || _piAddReqThemes.length) { if (cb) cb(); return; }
  fetch('/api/neon/requests?action=lookup')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      _piAddReqTeams  = Array.isArray(data.teams)  ? data.teams  : [];
      _piAddReqThemes = Array.isArray(data.themes) ? data.themes : [];
      if (cb) cb();
    })
    .catch(function() { if (cb) cb(); });
}

function piOpenAddModalWithData() {
  _piLoadRefData(piOpenAddModal);
}

// ── Archive confirmation modal ────────────────────────────────────────────────
function piConfirmArchive(reqId, title) {
  // Remove any existing modal
  var existing = document.getElementById('pi-archive-modal');
  if (existing) existing.remove();

  var modal = document.createElement('div');
  modal.id = 'pi-archive-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:9999';
  modal.innerHTML = '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:28px 28px 24px;max-width:400px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,.18)">'
    + '<div style="font-size:15px;font-weight:600;color:var(--text);margin-bottom:8px">Archive this request?</div>'
    + '<div style="font-size:13px;color:var(--muted);line-height:1.55;margin-bottom:24px">'
    + '"' + _piEsc(title) + '" will be archived and no longer visible in the list.'
    + '</div>'
    + '<div style="display:flex;justify-content:flex-end;gap:8px">'
    + '<button onclick="document.getElementById(\'pi-archive-modal\').remove()" '
    + 'style="padding:7px 16px;font-size:12px;font-weight:500;font-family:inherit;border:1px solid var(--border-md);border-radius:7px;background:var(--surface);color:var(--text);cursor:pointer">Cancel</button>'
    + '<button id="pi-archive-confirm-btn" onclick="piDoArchive(' + reqId + ')" '
    + 'style="padding:7px 16px;font-size:12px;font-weight:500;font-family:inherit;border:1px solid transparent;border-radius:7px;background:#EF4444;color:#fff;cursor:pointer">Archive</button>'
    + '</div>'
    + '</div>';
  // Close on backdrop click
  modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

function piDoArchive(reqId) {
  var btn = document.getElementById('pi-archive-confirm-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Archiving…'; }
  var token = window._kervToken || localStorage.getItem('kerv_token');
  fetch('/api/neon/requests', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': token ? 'Bearer ' + token : '' },
    body: JSON.stringify({ action: 'pr-archive', id: reqId })
  })
  .then(function(r) { return r.json(); })
  .then(function(res) {
    var modal = document.getElementById('pi-archive-modal');
    if (modal) modal.remove();
    if (res.ok) {
      for (var i = 0; i < piRequests.length; i++) {
        if (piRequests[i].id === reqId) { piRequests[i].status = 'archived'; break; }
      }
      piOpenId = null;
      _piRender();
    }
  })
  .catch(function() {
    var modal = document.getElementById('pi-archive-modal');
    if (modal) modal.remove();
  });
}

// ── Toggle accordion ──────────────────────────────────────────────────────────
function piToggleAccordion(id) {
  piOpenId = (piOpenId === id) ? null : id;
  _piRender();
}

// ── Build single accordion item data ─────────────────────────────────────────
function _piMakeAccordionItem(req) {
  var isOpen  = piOpenId === req.id;
  var canEdit = typeof _kervCan === 'function' && (
    _kervCan('product-ideas', 'editor') ||
    _kervCan('roadmap-neon', 'editor') ||
    (window._kervUser && window._kervUser.superAdmin)
  );
  var pri = PI_PRIORITY[req.priority] || PI_PRIORITY['medium'];

  // meta: submitter · date · team/theme
  var metaParts = [];
  if (req.requesterName) metaParts.push(_piEsc(req.requesterName));
  if (req.createdAt)     metaParts.push(_piFormatDate(req.createdAt));
  var tagsArr = [];
  if (req.team)  tagsArr.push(_piEsc(req.team));
  if (req.theme) tagsArr.push(_piEsc(req.theme));
  if (tagsArr.length) metaParts.push(tagsArr.join(' · '));

  // right slot: priority dot + label + status badge
  var right = '<span style="display:inline-flex;align-items:center;gap:5px;white-space:nowrap">'
    + '<span style="width:7px;height:7px;border-radius:50%;background:' + pri.color + ';flex-shrink:0;display:inline-block"></span>'
    + '<span style="font-size:11px;font-weight:500;color:' + pri.color + '">' + pri.label + '</span>'
    + '</span>'
    + _piStatusBadge(req.status);

  // expanded body
  var body = '';

  if (req.description) {
    body += '<div style="margin-bottom:12px">'
      + '<div style="font-size:10px;font-weight:600;color:var(--faint);text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px">Description</div>'
      + '<div style="font-size:12px;color:var(--text);line-height:1.6;white-space:pre-wrap">' + _piEsc(req.description) + '</div>'
      + '</div>';
  }

  if (req.notes) {
    body += '<div style="margin-bottom:12px">'
      + '<div style="font-size:10px;font-weight:600;color:var(--faint);text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px">Notes</div>'
      + '<div style="font-size:12px;color:var(--muted);line-height:1.6;white-space:pre-wrap">' + _piEsc(req.notes) + '</div>'
      + '</div>';
  }

  body += '<div style="height:1px;background:var(--border);margin-bottom:10px"></div>';
  var submittedBy = '<span style="font-size:11px;color:var(--faint)">Submitted by <strong style="color:var(--muted);font-weight:500">' + _piEsc(req.requesterName || '') + '</strong>';
  if (req.requesterEmail) submittedBy += ' (' + _piEsc(req.requesterEmail) + ')';
  if (req.createdAt)      submittedBy += ' &mdash; ' + _piFormatDate(req.createdAt);
  submittedBy += '</span>';
  body += '<div style="margin-bottom:10px">' + submittedBy + '</div>';

  if (canEdit) {
    var titleForModal = (req.title || '').replace(/'/g, "\\'").substring(0, 80);
    var JIRA_ICO = '<svg width="11" height="11" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" style="vertical-align:-1px;margin-right:4px"><rect width="24" height="24" fill="none"/><path d="M11.53,2a4.37,4.37,0,0,0,4.35,4.35h1.78v1.7A4.35,4.35,0,0,0,22,12.4V2.84A.85.85,0,0,0,21.16,2H11.53M6.77,6.8a4.36,4.36,0,0,0,4.34,4.34h1.8v1.72a4.36,4.36,0,0,0,4.34,4.34V7.63a.84.84,0,0,0-.83-.83H6.77M2,11.6a4.34,4.34,0,0,0,4.35,4.34H8.13v1.72A4.36,4.36,0,0,0,12.47,22V12.43a.85.85,0,0,0-.84-.84H2Z"/></svg>';

    body += '<div style="display:flex;align-items:center;gap:8px;margin-top:14px;padding-top:12px;border-top:1px solid var(--border)">';

    if (req.status === 'pending') {
      body += '<button onclick="piPromoteToBacklog(' + req.id + ')" '
        + 'style="padding:5px 13px;font-size:11px;font-weight:500;font-family:inherit;border:1px solid var(--accent);border-radius:6px;background:var(--accent);color:#fff;cursor:pointer;transition:opacity .12s" '
        + 'onmouseenter="this.style.opacity=\'.85\'" onmouseleave="this.style.opacity=\'1\'">Convert to Initiative</button>';
      body += '<button onclick="piOpenJiraModal(' + req.id + ')" '
        + 'style="padding:5px 13px;font-size:11px;font-weight:500;font-family:inherit;border:none;border-radius:6px;background:#006BE4;color:#fff;cursor:pointer;display:inline-flex;align-items:center;transition:opacity .12s" '
        + 'onmouseenter="this.style.opacity=\'.85\'" onmouseleave="this.style.opacity=\'1\'">' + JIRA_ICO + 'Convert to Jira Story</button>';
      body += UI.btnSlim('Park', 'piParkRequest(' + req.id + ', this)');
    }

    if (req.status === 'parked') {
      body += '<button onclick="piPromoteToBacklog(' + req.id + ')" '
        + 'style="padding:5px 13px;font-size:11px;font-weight:500;font-family:inherit;border:1px solid var(--accent);border-radius:6px;background:var(--accent);color:#fff;cursor:pointer;transition:opacity .12s" '
        + 'onmouseenter="this.style.opacity=\'.85\'" onmouseleave="this.style.opacity=\'1\'">Convert to Initiative</button>';
      body += '<button onclick="piOpenJiraModal(' + req.id + ')" '
        + 'style="padding:5px 13px;font-size:11px;font-weight:500;font-family:inherit;border:none;border-radius:6px;background:#006BE4;color:#fff;cursor:pointer;display:inline-flex;align-items:center;transition:opacity .12s" '
        + 'onmouseenter="this.style.opacity=\'.85\'" onmouseleave="this.style.opacity=\'1\'">' + JIRA_ICO + 'Convert to Jira Story</button>';
      body += UI.btnSlim('Back to Pending', 'piRestorePending(' + req.id + ', this)');
    }

    // Archive icon — danger, pushed to far right
    body += '<button onclick="piConfirmArchive(' + req.id + ', \'' + titleForModal + '\')" title="Archive" '
      + 'style="margin-left:auto;padding:5px 7px;font-size:11px;font-family:inherit;border:1px solid #EF4444;border-radius:6px;background:var(--surface);color:#EF4444;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .12s" '
      + 'onmouseenter="this.style.background=\'rgba(239,68,68,.1)\'" onmouseleave="this.style.background=\'var(--surface)\'"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg></button>';

    body += '</div>';
  }

  return {
    id:    req.id,
    title: req.title,
    open:  isOpen,
    meta:  metaParts.join('<span style="margin:0 5px;opacity:.4">·</span>'),
    right: right,
    body:  body
  };
}

// ── Main render ───────────────────────────────────────────────────────────────
var _PI_TABS = [
  { id: 'pending', label: 'Pending' },
  { id: 'parked',  label: 'Parked'  },
  { id: 'all',     label: 'All'     }
];

function _piRender() {
  var root = document.getElementById('pi-root');
  if (!root) return;

  // Always exclude promoted + archived items
  function _piIsHidden(r) {
    return r.status === 'promoted_to_initiative'
        || r.status === 'promoted_to_story'
        || r.status === 'promoted_to_backlog'  // legacy rows
        || r.status === 'archived';
  }

  var filtered = piRequests.filter(function(r) {
    if (_piIsHidden(r)) return false;
    if (piFilter === 'all') return true;
    return r.status === piFilter;
  });

  var visible = piRequests.filter(function(r) { return !_piIsHidden(r); });

  // ── Header ────────────────────────────────────────────────────────────────
  var LINK_ICO = '<svg width="11" height="11" viewBox="0 0 16 16" fill="none" style="flex-shrink:0"><path d="M6.5 9.5a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5l-1 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M9.5 6.5a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5l1-1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
  var PLUS_ICO = '<svg width="11" height="11" viewBox="0 0 11 11" fill="none" style="flex-shrink:0"><path d="M5.5 1v9M1 5.5h9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  var countBadge = '<span style="display:inline-flex;align-items:center;justify-content:center;height:20px;padding:0 7px;border-radius:10px;font-size:11px;font-weight:600;line-height:1;background:var(--subtle);color:var(--accent);border:1px solid var(--border);vertical-align:middle;margin-left:4px">' + visible.length + '</span>';

  var html = UI.pageHeader({
    title:      'Product Requests ' + countBadge,
    titleRight: UI.btnSlim(LINK_ICO + ' Copy form link', 'piCopyFormLink(this)') + ' ' + UI.btnSlim(PLUS_ICO + ' Add Request / Idea', 'piOpenAddModalWithData()')
  });

  // ── Filter nav ────────────────────────────────────────────────────────────
  html += UI.pageNavBar({ tabs: _PI_TABS, activeTab: piFilter, onTabFn: 'piSetFilter', pillsId: 'pi-filter-pills' });

  // ── Accordion list ────────────────────────────────────────────────────────
  if (filtered.length === 0) {
    html += '<div style="text-align:center;padding:48px 24px;color:var(--muted)">'
      + '<div style="font-size:14px;font-weight:500;color:var(--text);margin-bottom:6px">No requests yet</div>'
      + '<div style="font-size:12px">' + (piFilter === 'all' ? 'Share the form link to start collecting product requests.' : 'No requests match this filter.') + '</div>'
      + '</div>';
  } else {
    html += UI.accordion(
      filtered.map(function(req) { return _piMakeAccordionItem(req); }),
      { toggleFn: 'piToggleAccordion' }
    );
  }

  root.innerHTML = html;
}

// ── Filter ────────────────────────────────────────────────────────────────────
function piSetFilter(f) {
  piFilter = f;
  piOpenId = null;
  _piRender();
}

// ── Copy form link ────────────────────────────────────────────────────────────
function piCopyFormLink(btn) {
  var url = location.origin + '/submit-product-request';
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(function() { _piShowCopied(btn); }).catch(function() { _piFallbackCopy(url, btn); });
  } else {
    _piFallbackCopy(url, btn);
  }
}

function _piFallbackCopy(text, btn) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); _piShowCopied(btn); } catch(e) {}
  document.body.removeChild(ta);
}

function _piShowCopied(btn) {
  var orig = btn.innerHTML;
  btn.innerHTML = '✓ Copied!';
  btn.style.color = '#10B981';
  setTimeout(function() { btn.innerHTML = orig; btn.style.color = ''; }, 2000);
}

// ── Load from API ─────────────────────────────────────────────────────────────
function piLoad() {
  var root = document.getElementById('pi-root');
  if (!root) return;

  root.innerHTML = '<div style="padding:32px 0;text-align:center;color:var(--muted);font-size:12px">Loading…</div>';

  var token = window._kervToken || localStorage.getItem('kerv_token');
  fetch('/api/neon/requests', {
    headers: token ? { 'Authorization': 'Bearer ' + token } : {}
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (Array.isArray(data)) {
      piRequests = data;
      _piRender();
    } else if (data.error === 'Access denied') {
      root.innerHTML = '<div style="padding:48px 24px;text-align:center;color:var(--muted);font-size:13px">You don\'t have access to this page. Contact your admin.</div>';
    } else {
      piRequests = [];
      _piRender();
    }
  })
  .catch(function(err) {
    if (root) root.innerHTML = '<div style="padding:32px 0;text-align:center;color:#EF4444;font-size:12px">Failed to load requests: ' + (err.message || 'Network error') + '</div>';
  });
}
