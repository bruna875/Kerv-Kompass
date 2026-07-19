// settings-neon.js — Admin / Settings page
// All globals prefixed snx_

// ── State ──────────────────────────────────────────────────────────────────

var snxActiveTab      = 'teams';
var snxSelectedTeamId = null;
var snxData           = { teams: [], members: [], drivers: [], themes: [], assumptions: [], budgets: {}, jiraProjects: [] };
var snxMemberFilter     = { role: '', team: '' };
var snxAssumptionFilter = { category: '' };

// ── Constants ──────────────────────────────────────────────────────────────

var SNX_ROLES      = ['Product', 'Tech', 'Design', 'QA'];
var SNX_ROLE_ORDER = { Product: 0, Tech: 1, Design: 2, QA: 3 };
var SNX_CATEGORIES = ['Costs', 'Added Value', 'Financial', 'Resources', 'Others'];
var SNX_UNITS      = [{ val: 'dollar', label: '$ Dollar' }, { val: 'percent', label: '% Percent' }, { val: 'days', label: 'd Days' }, { val: 'number', label: '# Number' }];
var SNX_QUARTERS   = ['Q1', 'Q2', 'Q3', 'Q4'];
var SNX_DISCS      = [{ key: 'design', label: 'Design' }, { key: 'engineering', label: 'Engineering' }, { key: 'product', label: 'Product' }];

// Default teams always created if missing
var SNX_DEFAULT_TEAMS = ['Compliance & International', 'Overlay', 'VR', 'Live Stream', 'KERV One', 'Data & Analytics'];

var SNX_SAMPLES = {
  teams:   ['Commerce', 'Data', 'Platform'],
  drivers: ['Revenue Growth', 'Cost Reduction', 'Customer Experience', 'Operational Efficiency'],
  themes:  ['Personalisation', 'Automation', 'Data Platform', 'Commerce Optimisation'],
  members: [
    { name: 'Alice Martin', role: 'Product', pictureUrl: '' },
    { name: 'Bob Chen',     role: 'Tech',    pictureUrl: '' },
    { name: 'Sara Russo',   role: 'Design',  pictureUrl: '' }
  ]
};

// ── Style tokens (kept for table headers/cells — not inputs) ────────────────

var _S = {
  TH:   'font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);padding:7px 12px;text-align:left;border-bottom:1px solid var(--border);white-space:nowrap;background:var(--bg)',
  TD:   'padding:7px 12px;font-size:11px;color:var(--text);border-bottom:1px solid var(--border)',
  NUM:  'width:72px;box-sizing:border-box;padding:4px 6px;font-size:11px;text-align:right;border:1px solid var(--border-md);border-radius:6px;background:var(--surface);color:var(--text);outline:none;font-family:inherit'
};

// ── Input helpers ──────────────────────────────────────────────────────────

// Existing-row text input — auto-saves on blur
function _autoTI(id, val, placeholder, saveFn) {
  return UI.cellInput(id, val, placeholder, saveFn);
}

// Existing-row url input — auto-saves on blur
function _autoURL(id, val, placeholder, saveFn) {
  return UI.cellInput(id, val, placeholder, saveFn);
}

// ── Multi-team CSS + dropdown infrastructure ────────────────────────────────

var _dropReady = false;

function _dropSetup() {
  if (_dropReady) return;
  _dropReady = true;

  // Inject multi-team CSS only
  if (!document.getElementById('snx-drop-css')) {
    var s = document.createElement('style');
    s.id = 'snx-drop-css';
    s.textContent =
      '.snx-drop-wrap{position:relative;width:100%;box-sizing:border-box}' +
      '.snx-drop-btn{width:100%;display:flex;align-items:center;justify-content:space-between;gap:6px;' +
        'padding:5px 8px 5px 8px;font-size:11px;font-family:inherit;border-radius:6px;cursor:pointer;' +
        'text-align:left;background:transparent;border:1px solid transparent;color:var(--text);' +
        'transition:border-color .15s,background .15s,box-shadow .15s}' +
      '.snx-drop-btn:hover{border-color:var(--border-md);background:var(--surface)}' +
      '.snx-drop-btn.snx-open{border-color:var(--accent)!important;background:var(--surface)!important;' +
        'outline:none;box-shadow:0 0 0 3px rgba(237,0,94,.08)}' +
      '.snx-drop-btn-solid{border:1px solid var(--border-md)!important;background:var(--surface)!important}' +
      '.snx-drop-btn-solid.snx-open,.snx-drop-btn-solid:focus{border-color:var(--accent)!important;' +
        'box-shadow:0 0 0 3px rgba(237,0,94,.08)!important;outline:none}' +
      '.snx-drop-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
      '.snx-chev{flex-shrink:0;transition:transform .18s;color:var(--faint)}' +
      '.snx-open .snx-chev{transform:rotate(180deg)}' +
      '.snx-drop-panel{position:fixed;' +
        'background:var(--surface);border:1px solid var(--border-md);border-radius:8px;' +
        'box-shadow:0 4px 20px rgba(0,0,0,.12);z-index:9999;overflow-y:auto;overflow-x:hidden}' +
      '.snx-drop-opt{padding:6px 10px;font-size:11px;color:var(--text);cursor:pointer;' +
        'display:flex;align-items:center;justify-content:space-between;gap:8px;white-space:nowrap;' +
        'transition:background .1s}' +
      '.snx-drop-opt:hover{background:#F5F5F4}' +
      '.snx-drop-opt-sel{color:var(--accent);font-weight:500}' +
      '.snx-drop-opt-sel:hover{background:#FFF0F5}' +
      '.snx-mteam-opt{padding:6px 10px;font-size:11px;color:var(--text);cursor:pointer;' +
        'display:flex;align-items:center;gap:8px;white-space:nowrap;transition:background .1s}' +
      '.snx-mteam-opt:hover{background:#F5F5F4}' +
      '.snx-mteam-sel>span{color:var(--accent);font-weight:500}' +
      '.snx-drop-btn-multi{height:auto!important;min-height:30px;align-items:flex-start!important;padding-top:4px!important;padding-bottom:4px!important}' +
      '.snx-mteam-chips{display:flex;flex-wrap:wrap;gap:3px;flex:1;min-width:0;align-items:center}' +
      '.snx-mteam-chip{display:inline-block;padding:1px 7px;border-radius:4px;font-size:11px;font-weight:500;background:var(--subtle);color:var(--text);white-space:nowrap;line-height:1.6}';
    document.head.appendChild(s);
  }

  // Close on outside click or scroll
  function _closeAllDrops() {
    document.querySelectorAll('.snx-drop-panel').forEach(function(p) { p.style.display = 'none'; });
    document.querySelectorAll('.snx-drop-btn.snx-open').forEach(function(b) { b.classList.remove('snx-open'); });
  }
  document.addEventListener('click', function(e) {
    if (e.target.closest && (e.target.closest('.snx-drop-wrap') || e.target.closest('.snx-drop-panel'))) return;
    _closeAllDrops();
  }, true);
  document.addEventListener('scroll', _closeAllDrops, true);
}

// Toggle a dropdown open/closed (used by multi-team selector).
function snxToggleDrop(id) {
  var panel = document.getElementById(id + '-panel');
  var btn   = document.getElementById(id + '-btn');
  if (!panel || !btn) return;
  var isOpen = panel.style.display === 'block';
  // Close all open panels
  document.querySelectorAll('.snx-drop-panel').forEach(function(p) { p.style.display = 'none'; });
  document.querySelectorAll('.snx-drop-btn.snx-open').forEach(function(b) { b.classList.remove('snx-open'); });
  if (!isOpen) {
    // Move to body so it's outside any transform / overflow context
    if (panel.parentElement !== document.body) document.body.appendChild(panel);
    var rect = btn.getBoundingClientRect();
    // Render off-screen first to measure natural height before choosing direction
    panel.style.maxHeight = '';
    panel.style.top       = '-9999px';
    panel.style.left      = rect.left + 'px';
    panel.style.minWidth  = rect.width + 'px';
    panel.style.display   = 'block';
    var naturalH   = Math.min(panel.scrollHeight + 2, 300);
    var spaceBelow = window.innerHeight - rect.bottom - 8;
    var spaceAbove = rect.top - 8;
    if (spaceBelow >= naturalH || spaceBelow >= spaceAbove) {
      panel.style.top       = (rect.bottom + 4) + 'px';
      panel.style.maxHeight = Math.max(120, spaceBelow) + 'px';
    } else {
      var h = Math.min(naturalH, spaceAbove);
      panel.style.maxHeight = Math.max(120, h) + 'px';
      panel.style.top       = (rect.top - 4 - Math.min(naturalH, spaceAbove)) + 'px';
    }
    btn.classList.add('snx-open');
  }
}

// ── Multi-team selector ────────────────────────────────────────────────────

// Toggle one team checkbox; update hidden input + button label + visuals.
function snxToggleTeamOpt(fieldId, teamId) {
  var inp = document.getElementById(fieldId);
  if (!inp) return;
  var ids;
  try { ids = JSON.parse(inp.value) || []; } catch(e) { ids = []; }
  var idx = ids.indexOf(teamId);
  if (idx >= 0) ids.splice(idx, 1); else ids.push(teamId);
  inp.value = JSON.stringify(ids);
  // Rebuild chips in button
  var btn      = document.getElementById(fieldId + '-btn');
  var chipsEl  = btn ? btn.querySelector('.snx-mteam-chips') : null;
  if (chipsEl) {
    if (ids.length === 0) {
      chipsEl.innerHTML = '<span style="color:var(--faint);font-size:13px">— No team —</span>';
    } else {
      chipsEl.innerHTML = ids.map(function(tid) {
        var tx = snxData.teams.filter(function(x) { return x.id === tid; })[0];
        return tx ? '<span class="snx-mteam-chip">' + tx.name + '</span>' : '';
      }).join('');
    }
  }
  // Update checkbox visual
  var panel = document.getElementById(fieldId + '-panel');
  if (panel) {
    panel.querySelectorAll('.snx-mteam-opt').forEach(function(opt) {
      var tid = parseInt(opt.dataset.tid);
      var isSel = ids.indexOf(tid) >= 0;
      opt.classList.toggle('snx-mteam-sel', isSel);
      var box  = opt.querySelector('.snx-mteam-box');
      var tick = opt.querySelector('.snx-mteam-tick');
      if (box)  { box.style.background   = isSel ? 'var(--accent)' : '#fff'; box.style.borderColor = isSel ? 'var(--accent)' : 'var(--border-md)'; }
      if (tick) { tick.style.opacity = isSel ? '1' : '0'; }
    });
  }
}

// Build a multi-team dropdown. teams = snxData.teams, selectedIds = int[].
function _buildMultiTeamDrop(id, teams, selectedIds, saveFn, solid) {
  _dropSetup();
  selectedIds = Array.isArray(selectedIds) ? selectedIds : [];
  var _CHEV = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" class="snx-chev" style="flex-shrink:0;margin-top:3px">'
    + '<path d="M2 3.5l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var chipsInner;
  if (selectedIds.length === 0) {
    chipsInner = '<span style="color:var(--faint);font-size:13px">— No team —</span>';
  } else {
    chipsInner = selectedIds.map(function(tid) {
      var t0 = teams.filter(function(x) { return x.id === tid; })[0];
      return t0 ? '<span class="snx-mteam-chip">' + t0.name + '</span>' : '';
    }).join('');
  }
  var sf = saveFn ? ';' + saveFn : '';
  var optsHtml = teams.map(function(t) {
    var isSel = selectedIds.indexOf(t.id) >= 0;
    return '<div class="snx-mteam-opt' + (isSel ? ' snx-mteam-sel' : '') + '"'
      + ' data-tid="' + t.id + '"'
      + ' onclick="event.stopPropagation();snxToggleTeamOpt(\'' + id + '\',' + t.id + ')' + sf + '">'
      + '<div class="snx-mteam-box" style="width:14px;height:14px;border-radius:4px;flex-shrink:0;'
      +   'border:1.5px solid ' + (isSel ? 'var(--accent)' : 'var(--border-md)') + ';'
      +   'background:' + (isSel ? 'var(--accent)' : '#fff') + ';'
      +   'display:flex;align-items:center;justify-content:center">'
      +   '<svg class="snx-mteam-tick" width="9" height="9" viewBox="0 0 10 10" fill="none" style="opacity:' + (isSel ? '1' : '0') + '">'
      +     '<path d="M2 5l2.5 2.5L8 2" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'
      +   '</svg>'
      + '</div>'
      + '<span>' + t.name + '</span>'
      + '</div>';
  }).join('');
  var btnCls = 'snx-drop-btn snx-drop-btn-multi' + (solid ? ' snx-drop-btn-solid' : '');
  var valJson = JSON.stringify(selectedIds).replace(/"/g, '&quot;');
  return '<div class="snx-drop-wrap">'
    + '<input type="hidden" id="' + id + '" value="' + valJson + '">'
    + '<button type="button" id="' + id + '-btn" class="' + btnCls + '"'
    +   ' onclick="event.stopPropagation();snxToggleDrop(\'' + id + '\')">'
    +   '<span class="snx-mteam-chips">' + chipsInner + '</span>' + _CHEV
    + '</button>'
    + '<div class="snx-drop-panel" id="' + id + '-panel" style="display:none">' + optsHtml + '</div>'
    + '</div>';
}

function _autoMultiTeam(id, teams, selectedIds, saveFn) {
  return _buildMultiTeamDrop(id, teams, selectedIds, saveFn, false);
}

function _solidMultiTeam(id, teams, selectedIds) {
  return _buildMultiTeamDrop(id, teams, selectedIds, null, true);
}

// Existing-row number input — auto-saves on blur.
function _autoNUM(id, val, saveFn, extraStyle) {
  var fo = 'this.style.borderColor=\'var(--accent)\';this.style.boxShadow=\'0 0 0 3px rgba(237,0,94,.08)\'';
  var bl = 'this.style.borderColor=\'var(--border-md)\';this.style.boxShadow=\'none\';' + (saveFn || '');
  return '<input type="number" id="' + id + '" value="' + (val != null ? val : '') + '" placeholder="0" class="snx-ei"'
    + ' style="width:72px;box-sizing:border-box;padding:4px 6px;font-size:11px;text-align:right;'
    + 'border:1px solid var(--border-md);border-radius:6px;background:var(--surface);'
    + 'color:var(--text);outline:none;font-family:inherit' + (extraStyle ? ';' + extraStyle : '') + '"'
    + ' onfocus="' + fo + '" onblur="' + bl + '" />';
}

// ── Button helpers ─────────────────────────────────────────────────────────

var _TRASH_SVG = '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.8 7.5A1 1 0 004.8 12.5h4.4a1 1 0 001-.9L11 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function _trashBtn(onclick) {
  return UI.btnIcon(onclick, 'Delete', _TRASH_SVG, 'var(--faint)', '#E5243B', 'rgba(229,36,59,.08)');
}

var _CAMERA_SVG = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M1 5.5A1.5 1.5 0 012.5 4H4l1-2h6l1 2h1.5A1.5 1.5 0 0115 5.5v7A1.5 1.5 0 0113.5 14h-11A1.5 1.5 0 011 12.5v-7z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><circle cx="8" cy="9" r="2.2" stroke="currentColor" stroke-width="1.3"/></svg>';

function _picBtn(onclick, hasUrl) {
  return UI.btnIcon(onclick, hasUrl ? 'Edit photo URL' : 'Add photo URL', _CAMERA_SVG,
    hasUrl ? 'var(--accent)' : 'var(--faint)', 'var(--accent)', 'var(--subtle)');
}

// Save button — only for new-row additions
function _saveBtn(onclick) {
  return UI.btnPrimary('Add', onclick);
}

// ── Confirm dialog ─────────────────────────────────────────────────────────

function snxConfirm(message, onConfirm) {
  window._snxConfirmCb = onConfirm;
  UI.openModal({
    id: 'snx-confirm-modal',
    title: 'Confirm delete',
    closeFn: 'UI.closeModal(\'snx-confirm-modal\')',
    width: '380px',
    bodyHtml: '<p style="font-size:13px;color:var(--muted);line-height:1.55;margin:0">' + message + '</p>',
    footerRight:
      UI.btnCancel('Cancel', 'UI.closeModal(\'snx-confirm-modal\')')
      + UI.btnDanger('Delete', 'if(window._snxConfirmCb)window._snxConfirmCb();UI.closeModal(\'snx-confirm-modal\')')
  });
}

// ── Photo URL modal ────────────────────────────────────────────────────────

function snxOpenPicModal(memberId, currentUrl) {
  window._snxPicSave = function(url) {
    url = (url || '').trim();
    UI.closeModal('snx-pic-modal');
    if (memberId) {
      var m = snxData.members.filter(function(x) { return x.id === memberId; })[0];
      if (!m) return;
      m.pictureUrl = url;
      snxApi('/api/neon/team-members', 'POST', {
        id: memberId, name: m.name, title: m.title || '', role: m.role, pictureUrl: url,
        teamIds: m.teamIds || (m.teamId ? [m.teamId] : []), teamId: m.teamId || null
      }).then(function() { snxRefreshTab('members'); });
    } else {
      var hidden = document.getElementById('snx-m-new-pic');
      if (hidden) hidden.value = url;
      var btn = document.getElementById('snx-m-new-pic-btn');
      if (btn) btn.style.color = url ? 'var(--accent)' : 'var(--faint)';
    }
  };
  UI.openModal({
    id: 'snx-pic-modal',
    title: 'Photo URL',
    closeFn: 'UI.closeModal(\'snx-pic-modal\')',
    width: '400px',
    bodyHtml: UI.field('Photo URL', UI.input('snx-pic-inp', 'url', 'https://…', currentUrl || '')),
    footerRight:
      UI.btnCancel('Cancel', 'UI.closeModal(\'snx-pic-modal\')')
      + UI.btnPrimary('Save', 'window._snxPicSave&&window._snxPicSave(document.getElementById(\'snx-pic-inp\').value)')
  });
  setTimeout(function() {
    var inp = document.getElementById('snx-pic-inp');
    if (inp) {
      inp.focus(); inp.select();
      inp.onkeydown = function(e) {
        if (e.key === 'Enter')  { window._snxPicSave && window._snxPicSave(inp.value); }
        if (e.key === 'Escape') { UI.closeModal('snx-pic-modal'); }
      };
    }
  }, 120);
}

// Flash green border on an element to confirm save
function snxFlash(el) {
  if (!el) return;
  el.style.boxShadow = '0 0 0 3px rgba(30,126,52,.15)';
  setTimeout(function() { el.style.boxShadow = 'none'; }, 1200);
}

// ── Layout helpers ─────────────────────────────────────────────────────────

function _card(inner) {
  return '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden">' + inner + '</div>';
}

function _tbl(thead, tbody) {
  return '<table style="width:100%;border-collapse:collapse">'
    + '<thead>' + thead + '</thead>'
    + '<tbody>' + tbody + '</tbody>'
    + '</table>';
}

// Scrollable card: existing rows scroll, new row stays sticky at bottom, header stays sticky at top.
function _scrollCard(thead, bodyRows, newRow, tableMinWidth) {
  var tblStyle = 'border-collapse:collapse;width:100%' + (tableMinWidth ? ';min-width:' + tableMinWidth : '');
  return '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden">'
    + '<div style="overflow-y:auto;overflow-x:auto;max-height:calc(100vh - 175px)">'
    + '<table style="' + tblStyle + '">'
    + '<thead style="position:sticky;top:0;z-index:3">' + thead + '</thead>'
    + '<tbody>' + bodyRows + '</tbody>'
    + '<tfoot style="position:sticky;bottom:0;z-index:2;box-shadow:0 -1px 0 var(--border)">' + newRow + '</tfoot>'
    + '</table>'
    + '</div>'
    + '</div>';
}

// Filter header inner content — returns just the select element (no <th> wrapper)
// Used both by _filterTH (legacy) and by col.html in UI.tableScroll columns
function _filterTHContent(label, filterKey, opts, currentVal, changeFn) {
  var fn = changeFn || 'snxSetMemberFilter';
  var active = !!currentVal;
  var selStyle = 'font-size:10px;font-weight:600;letter-spacing:.4px;border:none;outline:none;cursor:pointer;font-family:inherit;'
    + 'background:transparent;padding:0;max-width:90px;'
    + (active ? 'color:var(--accent)' : 'color:var(--faint)');
  var options = '<option value="">All</option>'
    + opts.map(function(o) {
        var v = typeof o === 'string' ? o : o.val;
        var l = typeof o === 'string' ? o : o.label;
        return '<option value="' + v + '"' + (v === currentVal ? ' selected' : '') + '>' + l + '</option>';
      }).join('');
  return '<div style="display:flex;align-items:center;gap:5px">'
    + '<span>' + label + '</span>'
    + '<select style="' + selStyle + '" onchange="' + fn + '(\'' + filterKey + '\',this.value)">'
    + options + '</select>'
    + (active ? '<span style="width:5px;height:5px;border-radius:50%;background:var(--accent);flex-shrink:0;display:inline-block"></span>' : '')
    + '</div>';
}

// Filter header cell — native select kept intentionally (filter ≠ data entry)
function _filterTH(label, filterKey, opts, currentVal, changeFn) {
  return '<th style="' + _S.TH + '">' + _filterTHContent(label, filterKey, opts, currentVal, changeFn) + '</th>';
}

function _th() {
  return Array.from(arguments).map(function(l) {
    return '<th style="' + _S.TH + '">' + l + '</th>';
  }).join('');
}

// ── API ────────────────────────────────────────────────────────────────────

function snxApi(url, method, body) {
  var opts = { method: method || 'GET', headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  return fetch(url, opts).then(function(r) { return r.json(); });
}

// ── Load all + seed if empty ───────────────────────────────────────────────

function snxLoadAll(cb) {
  Promise.all([
    snxApi('/api/neon/lookup?t=teams'),
    snxApi('/api/neon/team-members'),
    snxApi('/api/neon/lookup?t=drivers'),
    snxApi('/api/neon/lookup?t=themes'),
    snxApi('/api/neon/assumptions'),
    snxApi('/api/neon/budget'),
    snxApi('/api/neon/jira-projects')
  ]).then(function(res) {
    snxData.teams        = Array.isArray(res[0]) ? res[0] : [];
    snxData.members      = Array.isArray(res[1]) ? res[1] : [];
    snxData.drivers      = Array.isArray(res[2]) ? res[2] : [];
    snxData.themes       = Array.isArray(res[3]) ? res[3] : [];
    snxData.assumptions  = Array.isArray(res[4]) ? res[4] : [];
    snxData.budgets      = (res[5] && typeof res[5] === 'object') ? res[5] : {};
    snxData.jiraProjects = Array.isArray(res[6]) ? res[6] : [];

    var isEmpty = !snxData.teams.length && !snxData.drivers.length && !snxData.themes.length && !snxData.members.length;
    if (isEmpty) {
      snxSeedSamples(cb);
    } else {
      if (cb) cb();
    }
  }).catch(function(err) { if (cb) cb(err); });
}

// Ensure the 6 canonical teams always exist
function snxEnsureDefaultTeams(cb) {
  var existing = snxData.teams.map(function(t) { return t.name.toLowerCase(); });
  var missing  = SNX_DEFAULT_TEAMS.filter(function(n) {
    return existing.indexOf(n.toLowerCase()) === -1;
  });
  if (!missing.length) { if (cb) cb(); return; }
  Promise.all(missing.map(function(n) {
    return snxApi('/api/neon/lookup', 'POST', { t: 'teams', name: n });
  })).then(function() {
    snxApi('/api/neon/lookup?t=teams').then(function(r) {
      snxData.teams = Array.isArray(r) ? r : [];
      if (cb) cb();
    });
  }).catch(function() { if (cb) cb(); });
}

function snxSeedSamples(cb) {
  var seeds = [];
  SNX_SAMPLES.teams.forEach(function(n)   { seeds.push(snxApi('/api/neon/lookup', 'POST', { t: 'teams',   name: n })); });
  SNX_SAMPLES.drivers.forEach(function(n) { seeds.push(snxApi('/api/neon/lookup', 'POST', { t: 'drivers', name: n })); });
  SNX_SAMPLES.themes.forEach(function(n)  { seeds.push(snxApi('/api/neon/lookup', 'POST', { t: 'themes',  name: n })); });
  SNX_SAMPLES.members.forEach(function(m) { seeds.push(snxApi('/api/neon/team-members', 'POST', m)); });
  Promise.all(seeds).then(function() {
    Promise.all([
      snxApi('/api/neon/lookup?t=teams'),
      snxApi('/api/neon/team-members'),
      snxApi('/api/neon/lookup?t=drivers'),
      snxApi('/api/neon/lookup?t=themes')
    ]).then(function(r) {
      snxData.teams   = Array.isArray(r[0]) ? r[0] : [];
      snxData.members = Array.isArray(r[1]) ? r[1] : [];
      snxData.drivers = Array.isArray(r[2]) ? r[2] : [];
      snxData.themes  = Array.isArray(r[3]) ? r[3] : [];
      if (cb) cb();
    });
  }).catch(function(e) { if (cb) cb(e); });
}

// ── Tab: Teams & Capacity ──────────────────────────────────────────────────

function snxBudgetVal(teamName, q, disc) {
  return capGetBudget(snxData.budgets, teamName, q, disc);
}

function snxGetAsm(namePart) {
  return capGetAsm(snxData.assumptions, namePart);
}

function snxRoBFrac(a) { return capRoBFrac(a); }
function snxFmtRoB(a)  { return capFmtRoB(a); }

// ── Chip navigation ────────────────────────────────────────────────────────

function snxTeamsChipsHtml() {
  var chips = snxData.teams.map(function(t) { return { id: t.id, label: t.name }; });
  return '<div id="snx-teams-nav" style="margin-bottom:16px">'
    + UI.chipsNavLg(chips, snxSelectedTeamId, 'snxSelectTeam', 'snxAddTeamCard', '+ Add team')
    + '</div>';
}

function snxTeamsHtml() {
  if (!snxData.teams.length) {
    return '<div style="padding:40px;text-align:center;font-size:13px;color:var(--faint)">No teams yet — click Add Team to create one.</div>'
      + snxNewTeamForm();
  }

  // Auto-select first team if nothing selected or selection no longer exists
  var ids = snxData.teams.map(function(t) { return t.id; });
  if (!snxSelectedTeamId || ids.indexOf(snxSelectedTeamId) === -1) {
    snxSelectedTeamId = snxData.teams[0].id;
  }

  var nav = snxTeamsChipsHtml()
    + snxNewTeamForm();

  var selectedTeam = snxData.teams.filter(function(t) { return t.id === snxSelectedTeamId; })[0];
  var tableArea = '<div id="snx-team-body">'
    + (selectedTeam ? snxTeamBudgetTable(selectedTeam) : '')
    + '</div>';

  return nav + tableArea;
}

function snxSelectTeam(id) {
  snxSelectedTeamId = typeof id === 'string' ? (parseInt(id, 10) || id) : id;
  var nav = document.getElementById('snx-teams-nav');
  if (nav) nav.outerHTML = snxTeamsChipsHtml();
  var body = document.getElementById('snx-team-body');
  var team = snxData.teams.filter(function(t) { return t.id === snxSelectedTeamId; })[0];
  if (body && team) body.innerHTML = snxTeamBudgetTable(team);
}

function snxNewTeamForm() {
  return '<div id="snx-new-team-card" class="snx-new-row" style="display:none;border:1px solid var(--accent);border-radius:12px;padding:14px 16px;background:var(--surface);margin-bottom:16px">'
    + '<div style="font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.4px;color:var(--faint);margin-bottom:10px">New team</div>'
    + '<div style="display:flex;align-items:center;gap:8px">'
    + UI.cellOutlinedInput('snx-new-team-name', '', 'Team name')
    + UI.btnPrimary('Add', 'snxSaveNewTeam()')
    + UI.btnCancel('Cancel', 'document.getElementById(\'snx-new-team-card\').style.display=\'none\';if(snxSelectedTeamId)snxSelectTeam(snxSelectedTeamId);')
    + '</div></div>';
}

function snxAddTeamCard() {
  var card = document.getElementById('snx-new-team-card');
  if (!card) return;
  card.style.display = 'block';
  // Clear body area below
  var body = document.getElementById('snx-team-body');
  if (body) body.innerHTML = '';
  // Re-render nav with no active chip
  var savedId = snxSelectedTeamId;
  snxSelectedTeamId = null;
  var nav = document.getElementById('snx-teams-nav');
  if (nav) nav.outerHTML = snxTeamsChipsHtml();
  snxSelectedTeamId = savedId;
  setTimeout(function() { var i = document.getElementById('snx-new-team-name'); if (i) i.focus(); }, 50);
}

function snxSaveNewTeam() {
  var inp = document.getElementById('snx-new-team-name');
  var name = inp ? inp.value.trim() : '';
  if (!name) return;
  snxApi('/api/neon/lookup', 'POST', { t: 'teams', name: name }).then(function(res) {
    if (res && res.id) snxSelectedTeamId = res.id;
    snxRefreshTab('teams');
  });
}

// ── Team budget table ──────────────────────────────────────────────────────

function snxTeamBudgetTable(t) {
  var TH  = 'padding:7px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);border-bottom:1px solid var(--border);background:var(--bg);text-align:right;white-space:nowrap';
  var THL = 'padding:7px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);border-bottom:1px solid var(--border);background:var(--bg);text-align:left;white-space:nowrap';
  var TD  = 'padding:7px 12px;font-size:11px;color:var(--text);border-bottom:1px solid var(--border);text-align:right';
  var TDL = 'padding:7px 12px;font-size:11px;color:var(--text);border-bottom:1px solid var(--border);text-align:left';
  var TDC = 'padding:7px 12px;font-size:11px;font-weight:500;color:#166534;border-bottom:1px solid var(--border);text-align:right;background:#F0FDF4';
  var TDCl= 'padding:7px 12px;font-size:11px;color:#166534;border-bottom:1px solid var(--border);text-align:left;background:#F0FDF4';
  var TDP = 'padding:4px 12px;font-size:11px;font-weight:500;color:#9A3412;border-bottom:1px solid var(--border);text-align:right;background:#FFF7ED';
  var TDPl= 'padding:4px 12px;font-size:11px;color:#9A3412;border-bottom:1px solid var(--border);text-align:left;background:#FFF7ED';

  // Assumption lookups
  var asmWD   = snxGetAsm('working days per quarter');
  var asmEngR = snxGetAsm('engineers run');
  var asmDesR = snxGetAsm('designers run');
  var asmPmR  = snxGetAsm('pms run');

  var workDays = asmWD.value || 0;
  var engRoB   = snxRoBFrac(asmEngR);
  var desRoB   = snxRoBFrac(asmDesR);
  var pmRoB    = snxRoBFrac(asmPmR);

  var noVal = '<span style="color:var(--faint)">—</span>';

  // Info icon SVG for tooltips
  var _INFO_SVG = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" style="color:var(--faint)">'
    + '<circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.4"/>'
    + '<path d="M8 7v5M8 5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>'
    + '</svg>';

  // Tooltip helper — info icon with hover popover
  function tip(formula) {
    return UI.tooltip(_INFO_SVG, formula, { pos: 'right' });
  }

  var saveFn = 'snxSaveTeamBudget(' + t.id + ',\'' + t.name.replace(/'/g, "\\'") + '\')';

  // FTE editable rows + budget calc rows — columns are Q1..Q4, rows are disciplines
  function fteRow(label, disc) {
    var cells = SNX_QUARTERS.map(function(q) {
      var iid = 'snx-bud-' + t.id + '-' + q + '-' + disc;
      return '<td style="' + TD + '">'
        + UI.cellOutlinedInput(iid, snxBudgetVal(t.name, q, disc) || '', '0', saveFn, 'FTE')
        + '</td>';
    }).join('');
    return '<tr onmouseenter="this.style.background=\'#FAFAF8\'" onmouseleave="this.style.background=\'\'">'
      + '<td style="' + TDL + '">' + label + '</td>' + cells + '</tr>';
  }

  function robPctRow(label, disc) {
    var cells = SNX_QUARTERS.map(function(q) {
      var iid = 'snx-bud-' + t.id + '-' + q + '-' + disc;
      return '<td style="' + TDP + '">'
        + UI.cellOutlinedInput(iid, snxBudgetVal(t.name, q, disc) || '', '0', saveFn, '%')
        + '</td>';
    }).join('');
    return '<tr>'
      + '<td style="' + TDPl + '">' + label + '</td>'
      + cells + '</tr>';
  }

  function calcRow(label, disc, rob, formula) {
    var cells = SNX_QUARTERS.map(function(q) {
      var fte = snxBudgetVal(t.name, q, disc);
      if (!fte || !workDays) return '<td style="' + TDC + '">' + noVal + '</td>';
      var robVal = typeof rob === 'function' ? rob(q) : rob;
      var v = fte * workDays * (1 - robVal);
      var s = Math.ceil(v).toString();
      return '<td style="' + TDC + '">' + s + 'd</td>';
    }).join('');
    return '<tr>'
      + '<td style="' + TDCl + '">' + label + tip(formula) + '</td>'
      + cells + '</tr>';
  }

  // ── Team header card ────────────────────────────────────────────────────
  var tNameEsc = (t.name || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  var tDescEsc = (t.description || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  var GI_BASE  = 'border:1px solid transparent;border-radius:4px;background:transparent;outline:none;font-family:inherit;box-sizing:border-box;transition:border-color .14s,background .14s';
  var GI_HOVER = 'this.style.borderColor=\'var(--border-md)\';this.style.background=\'var(--bg)\'';
  var GI_LEAVE = 'if(document.activeElement!==this){this.style.borderColor=\'transparent\';this.style.background=\'transparent\';this.style.boxShadow=\'none\'}';
  var GI_FOCUS = 'this.style.borderColor=\'var(--accent)\';this.style.background=\'var(--bg)\';this.style.boxShadow=\'0 0 0 3px rgba(237,0,94,.08)\'';
  var GI_BLUR  = 'this.style.borderColor=\'transparent\';this.style.background=\'transparent\';this.style.boxShadow=\'none\';';

  var teamHeader =
    '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding-bottom:16px;margin-bottom:20px;border-bottom:1px solid var(--border)">'
    + '<div style="flex:1;min-width:0">'
    +   '<input type="text" id="snx-tname-' + t.id + '" value="' + tNameEsc + '" placeholder="Team name" class="snx-ei"'
    +     ' style="' + GI_BASE + ';display:block;width:100%;max-width:400px;padding:2px 6px;margin-left:-6px;font-size:17px;font-weight:600;color:var(--text);margin-bottom:5px"'
    +     ' onmouseenter="' + GI_HOVER + '" onmouseleave="' + GI_LEAVE + '"'
    +     ' onfocus="' + GI_FOCUS + '" onblur="' + GI_BLUR + 'snxSaveTeamName(' + t.id + ')" />'
    +   '<input type="text" id="snx-tdesc-' + t.id + '" value="' + tDescEsc + '" placeholder="Add a description…" class="snx-ei"'
    +     ' style="' + GI_BASE + ';display:block;width:100%;max-width:560px;padding:2px 6px;margin-left:-6px;font-size:12px;color:var(--muted)"'
    +     ' onmouseenter="' + GI_HOVER + '" onmouseleave="' + GI_LEAVE + '"'
    +     ' onfocus="' + GI_FOCUS + '" onblur="' + GI_BLUR + 'snxSaveTeamDesc(' + t.id + ')" />'
    + '</div>'
    + '<div style="flex-shrink:0;padding-top:2px">' + _trashBtn('snxDeleteLookup(\'teams\',' + t.id + ')') + '</div>'
    + '</div>';

  // Table 1
  var capsCols = [
    { label: '', width: '320px' },
    { label: 'Q1', align: 'right' },
    { label: 'Q2', align: 'right' },
    { label: 'Q3', align: 'right' },
    { label: 'Q4', align: 'right' }
  ];
  var capsRows = fteRow('Engineering FTE', 'engineering')
    + robPctRow('Run of Business per Engineer (Operational support and meetings)', 'eng_rob_pct')
    + fteRow('Product FTE', 'product')
    + fteRow('Design FTE', 'design')
    + calcRow('Engineering — Budget x Quarter', 'engineering', function(q) {
        var pct = snxBudgetVal(t.name, q, 'eng_rob_pct');
        return pct ? pct / 100 : 0;
      }, CAP_FORMULAS.engineering)
    + calcRow('Product — Budget x Quarter', 'product', pmRoB, CAP_FORMULAS.product)
    + calcRow('Design — Budget x Quarter', 'design', desRoB, CAP_FORMULAS.design);

  var table1 =
    '<div style="margin-top:16px;background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden">'
    + '<div style="padding:10px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">'
    +   '<span style="font-size:12px;font-weight:600;color:var(--text)">Team Capacity</span>'
    +   '<span id="snx-bud-msg-' + t.id + '" style="font-size:11px;color:#1E7E34;opacity:0;transition:opacity .25s">✓ Saved</span>'
    + '</div>'
    + UI.tableScroll(capsCols, capsRows, 'snx-cap-tbody-' + t.id, 0, null, { tableLayout: 'fixed', inCard: true })
    + '</div>';

  // ── Team members section ────────────────────────────────────────────────
  var teamMembers = snxData.members.filter(function(m) {
    var mIds = m.teamIds && m.teamIds.length ? m.teamIds : (m.teamId ? [m.teamId] : []);
    return mIds.indexOf(t.id) >= 0;
  }).sort(function(a, b) {
    var ao = SNX_ROLE_ORDER[a.role] != null ? SNX_ROLE_ORDER[a.role] : 99;
    var bo = SNX_ROLE_ORDER[b.role] != null ? SNX_ROLE_ORDER[b.role] : 99;
    return ao - bo;
  });

  function _memberCard(m) {
    var opts = m.pictureUrl ? { imgSrc: m.pictureUrl, size: 26 } : { size: 26 };
    return UI.userTile(m.name || '?', m.role || '', m.title || null, opts);
  }

  var coreMembers   = teamMembers.filter(function(m) {
    var mIds = m.teamIds && m.teamIds.length ? m.teamIds : (m.teamId ? [m.teamId] : []);
    return mIds.length <= 1;
  });
  var sharedMembers = teamMembers.filter(function(m) {
    var mIds = m.teamIds && m.teamIds.length ? m.teamIds : (m.teamId ? [m.teamId] : []);
    return mIds.length > 1;
  });

  var coreGrid   = coreMembers.length
    ? '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">' + coreMembers.map(_memberCard).join('') + '</div>'
    : '<div style="font-size:11px;color:var(--faint);padding:4px 0">No dedicated members yet.</div>';

  var sharedSection = sharedMembers.length
    ? '<div style="margin-top:10px">'
      + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">'
      +   '<div style="flex:1;height:1px;background:var(--border)"></div>'
      +   '<span style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:var(--faint);white-space:nowrap">Shared Resources</span>'
      +   '<div style="flex:1;height:1px;background:var(--border)"></div>'
      + '</div>'
      + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">' + sharedMembers.map(_memberCard).join('') + '</div>'
      + '</div>'
    : '';

  var membersSection =
    '<div style="margin-top:16px;background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden">'
    + '<div style="padding:10px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">'
    +   '<span style="font-size:12px;font-weight:600;color:var(--text)">' + (t.name || 'Team') + ' — Team Members</span>'
    +   '<span style="font-size:11px;color:var(--faint)">' + teamMembers.length + ' member' + (teamMembers.length !== 1 ? 's' : '') + '</span>'
    + '</div>'
    + '<div style="padding:10px 14px">'
    + coreGrid
    + sharedSection
    + '</div>'
    + '</div>';

  return teamHeader + membersSection + table1;
}

function snxSaveTeamName(id) {
  var inp  = document.getElementById('snx-tname-' + id);
  var desc = document.getElementById('snx-tdesc-' + id);
  var name = inp ? inp.value.trim() : '';
  if (!name) return;
  var t = snxData.teams.filter(function(x) { return x.id === id; })[0];
  if (t) t.name = name;
  snxApi('/api/neon/lookup', 'POST', { t: 'teams', id: id, name: name, description: desc ? desc.value : (t && t.description) || '' }).then(function() {
    snxFlash(inp);
    snxNotifyCapacity();
  });
}

function snxSaveTeamDesc(id) {
  var inp  = document.getElementById('snx-tdesc-' + id);
  var nameInp = document.getElementById('snx-tname-' + id);
  var desc = inp ? inp.value : '';
  var t    = snxData.teams.filter(function(x) { return x.id === id; })[0];
  if (!t) return;
  t.description = desc;
  var name = nameInp ? nameInp.value.trim() : t.name;
  snxApi('/api/neon/lookup', 'POST', { t: 'teams', id: id, name: name, description: desc }).then(function() {
    snxFlash(inp);
  });
}

function snxSaveTeamBudget(teamId, teamName) {
  var nameInp = document.getElementById('snx-tname-' + teamId);
  var actualName = nameInp ? nameInp.value.trim() : teamName;
  var promises = SNX_QUARTERS.map(function(q) {
    var payload = { team: actualName, quarter: q, designDays: 0, engineeringDays: 0, productDays: 0, engRobPct: null };
    ['engineering', 'product', 'design'].forEach(function(d) {
      var el = document.getElementById('snx-bud-' + teamId + '-' + q + '-' + d);
      payload[d + 'Days'] = el ? (parseFloat(el.value) || 0) : 0;
    });
    var robEl = document.getElementById('snx-bud-' + teamId + '-' + q + '-eng_rob_pct');
    payload.engRobPct = robEl && robEl.value !== '' ? (parseFloat(robEl.value) || null) : null;
    return snxApi('/api/neon/budget', 'POST', payload);
  });
  Promise.all(promises).then(function() {
    snxApi('/api/neon/budget').then(function(r) {
      snxData.budgets = (r && typeof r === 'object') ? r : {};
      var body = document.getElementById('snx-team-body');
      var team = snxData.teams.filter(function(t) { return t.id === teamId; })[0];
      var nameInpNow = document.getElementById('snx-tname-' + teamId);
      if (team && nameInpNow && nameInpNow.value.trim()) team.name = nameInpNow.value.trim();
      if (body && team) body.innerHTML = snxTeamBudgetTable(team);
      var msg = document.getElementById('snx-bud-msg-' + teamId);
      if (msg) { msg.style.opacity = '1'; setTimeout(function() { msg.style.opacity = '0'; }, 1500); }
      snxNotifyCapacity();
    });
  }).catch(function(e) { alert('Save failed: ' + e.message); });
}

// ── Tab: Team Members ──────────────────────────────────────────────────────

function snxSetMemberFilter(field, val) {
  snxMemberFilter[field] = val;
  var body = document.getElementById('snx-tab-body');
  if (body) body.innerHTML = snxTabContent('members');
}

function snxSetAssumptionFilter(field, val) {
  snxAssumptionFilter[field] = val;
  var body = document.getElementById('snx-tab-body');
  if (body) body.innerHTML = snxTabContent('assumptions');
}

function snxMembersHtml() {
  var teamFilterOpts = snxData.teams.map(function(t) { return { val: String(t.id), label: t.name }; });

  // Apply filters
  var visible = snxData.members.filter(function(m) {
    if (snxMemberFilter.role && m.role !== snxMemberFilter.role) return false;
    if (snxMemberFilter.team) {
      var fTid = parseInt(snxMemberFilter.team);
      var mIds = m.teamIds && m.teamIds.length ? m.teamIds : (m.teamId ? [m.teamId] : []);
      if (mIds.indexOf(fTid) < 0) return false;
    }
    return true;
  });

  var rows = visible.map(function(m) {
    var sf = 'snxSaveMember(' + m.id + ')';

    if (m.userId) {
      // ── Linked to a user account — profile fields are read-only ──
      var linkedIcon = '<svg width="11" height="11" viewBox="0 0 14 14" fill="none" style="flex-shrink:0;opacity:.5"><path d="M10 2h2v2M12 2l-5 5M6 4H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      return '<tr onmouseenter="this.style.background=\'#FAFAF8\'" onmouseleave="this.style.background=\'\'">'
        + '<td style="' + _S.TD + ';padding:8px 12px;width:150px;min-width:120px">'
        +   UI.avatarCell(m.name, m.title || null)
        + '</td>'
        + '<td style="' + _S.TD + ';width:120px">'
        +   UI.deptChip(m.role)
        + '</td>'
        + '<td style="' + _S.TD + ';width:260px">'
        +   _autoMultiTeam('snx-m-team-' + m.id, snxData.teams, m.teamIds || (m.teamId ? [m.teamId] : []), sf)
        + '</td>'
        + '<td style="' + _S.TD + ';width:80px;text-align:right;white-space:nowrap">'
        +   '<span title="Profile managed in User &amp; Permissions" style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;color:var(--faint)">' + linkedIcon + '</span>'
        +   _trashBtn('snxDeleteMember(' + m.id + ')')
        + '</td></tr>';
    }

    // ── Unlinked — fully editable ──
    var n   = m.name || '?';
    var ini = n.split(/\s+/).map(function(w){return w[0]||'';}).join('').toUpperCase().slice(0,2);
    var av  = m.pictureUrl
      ? '<img src="' + m.pictureUrl + '" style="width:26px;height:26px;border-radius:50%;object-fit:cover;flex-shrink:0" onerror="this.style.display=\'none\'">'
      : '<div style="width:26px;height:26px;border-radius:50%;background:' + UI._avatarColor(n) + ';flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;color:#fff">' + ini + '</div>';

    return '<tr onmouseenter="this.style.background=\'#FAFAF8\'" onmouseleave="this.style.background=\'\'">'
      + '<td style="' + _S.TD + ';padding:8px 12px;width:150px;min-width:120px">'
      +   '<div style="display:flex;align-items:center;gap:10px">' + av
      +   UI.cellInput('snx-m-name-' + m.id, m.name, 'Full name', sf)
      +   '</div>'
      + '</td>'
      + '<td style="' + _S.TD + ';width:120px">'
      +   UI.cellSelect('snx-m-role-' + m.id, SNX_ROLES, m.role, sf)
      + '</td>'
      + '<td style="' + _S.TD + ';width:260px">'
      +   _autoMultiTeam('snx-m-team-' + m.id, snxData.teams, m.teamIds || (m.teamId ? [m.teamId] : []), sf)
      + '</td>'
      + '<td style="' + _S.TD + ';width:80px;text-align:right;white-space:nowrap">'
      +   _picBtn('snxOpenPicModal(' + m.id + ',\'' + (m.pictureUrl || '').replace(/'/g, "\\'") + '\')', !!m.pictureUrl)
      +   _trashBtn('snxDeleteMember(' + m.id + ')')
      + '</td></tr>';
  }).join('');

  if (!rows) rows = '<tr><td colspan="4" style="padding:32px;text-align:center;font-size:12px;color:var(--faint)">No members match the current filter.</td></tr>';

  var mCols = [
    { label: 'Name', width: '150px' },
    { label: 'Role', html: _filterTHContent('Role', 'role', SNX_ROLES, snxMemberFilter.role, 'snxSetMemberFilter'), width: '120px' },
    { label: 'Team', html: _filterTHContent('Team', 'team', teamFilterOpts, snxMemberFilter.team, 'snxSetMemberFilter'), width: '260px' },
    { label: '', width: '80px', align: 'right' }
  ];
  return UI.tableScroll(mCols, rows, 'snx-m-tbody');
}

function snxSaveMember(id) {
  var m = snxData.members.filter(function(x) { return x.id === id; })[0];
  var teamEl = document.getElementById('snx-m-team-' + id);
  var teamIds = [];
  try { teamIds = JSON.parse(teamEl ? teamEl.value : '[]') || []; } catch(e) { teamIds = []; }
  if (!teamIds.length && m) teamIds = m.teamIds && m.teamIds.length ? m.teamIds : (m.teamId ? [m.teamId] : []);
  var validTeamIds = (snxData.teams || []).map(function(t) { return t.id; });
  teamIds = teamIds.filter(function(tid) { return validTeamIds.indexOf(tid) >= 0; });
  if (m) { m.teamIds = teamIds; m.teamId = teamIds[0] || null; }

  if (m && m.userId) {
    snxApi('/api/neon/team-members', 'POST', {
      id: id, name: m.name, title: m.title || '', role: m.role || 'Product',
      pictureUrl: m.pictureUrl || '', teamIds: teamIds
    }).then(function(res) {
      if (res && res.error) console.error('snxSaveMember error:', res.error);
      snxNotifyCapacity();
    });
    return;
  }

  var nameEl  = document.getElementById('snx-m-name-'  + id);
  var titleEl = document.getElementById('snx-m-title-' + id);
  var roleEl  = document.getElementById('snx-m-role-'  + id);
  var name    = nameEl  ? nameEl.value.trim() : (m ? m.name : '');
  if (!name) return;
  var title   = titleEl ? titleEl.value.trim() : '';
  var role    = roleEl  ? roleEl.value : 'Product';
  var pic     = m ? (m.pictureUrl || '') : '';
  if (m) { m.name = name; m.title = title; m.role = role; m.teamIds = teamIds; m.teamId = teamIds[0] || null; }
  snxApi('/api/neon/team-members', 'POST', {
    id: id, name: name, title: title, role: role, pictureUrl: pic, teamIds: teamIds
  }).then(function(res) {
    if (res && res.error) console.error('snxSaveMember error:', res.error);
    snxNotifyCapacity();
  });
}

function snxAddMember() {
  var name = document.getElementById('snx-m-new-name').value.trim();
  if (!name) return;
  var teamEl  = document.getElementById('snx-m-new-team');
  var teamIds = [];
  try { teamIds = JSON.parse(teamEl ? teamEl.value : '[]') || []; } catch(e) { teamIds = []; }
  snxApi('/api/neon/team-members', 'POST', {
    name:       name,
    title:      (document.getElementById('snx-m-new-title') || {}).value.trim() || '',
    role:       document.getElementById('snx-m-new-role').value,
    pictureUrl: document.getElementById('snx-m-new-pic').value.trim(),
    teamIds:    teamIds
  }).then(function() { snxRefreshTab('members'); });
}

function snxDeleteMember(id) {
  var m = snxData.members.filter(function(x) { return x.id === id; })[0];
  if (!m) return;
  snxConfirm('Are you sure you want to delete <strong>' + (m.name || 'this member') + '</strong>? This action cannot be undone.', function() {
    snxApi('/api/neon/team-members', 'DELETE', { id: id }).then(function() { snxRefreshTab('members'); });
  });
}

// ── Tab: Drivers / Themes ──────────────────────────────────────────────────

function snxSimpleTableHtml(type, placeholder) {
  var items    = snxData[type] || [];
  var isDrivers = type === 'drivers';

  var rows = items.map(function(item) {
    var sf = 'snxSaveSimple(\'' + type + '\',' + item.id + ')';
    var tplCell = isDrivers
      ? '<td style="' + _S.TD + ';width:200px">'
        + UI.cellInput('snx-drivers-tpl-' + item.id, item.templateSlug || '', 'template_slug', sf)
        + '</td>'
      : '';
    return '<tr onmouseenter="this.style.background=\'#FAFAF8\'" onmouseleave="this.style.background=\'\'">'
      + '<td style="' + _S.TD + '">'
      +   UI.cellInput('snx-' + type + '-' + item.id, item.name, placeholder, sf)
      + '</td>'
      + tplCell
      + '<td style="' + _S.TD + ';text-align:right;width:44px">'
      +   _trashBtn('snxDeleteLookup(\'' + type + '\',' + item.id + ')')
      + '</td></tr>';
  }).join('');

  var tplNewCell = isDrivers
    ? '<td style="' + _S.TD + ';width:200px">'
      + UI.cellOutlinedInput('snx-drivers-new-tpl', '', 'template_slug')
      + '</td>'
    : '';

  var newRow = '<tr class="snx-new-row" style="background:var(--bg)">'
    + '<td style="' + _S.TD + '">'
    +   UI.cellOutlinedInput('snx-' + type + '-new', '', placeholder)
    + '</td>'
    + tplNewCell
    + '<td style="' + _S.TD + ';text-align:right">' + _saveBtn('snxAddSimple(\'' + type + '\')') + '</td>'
    + '</tr>';

  var sCols = isDrivers
    ? [{label:'Name'}, {label:'Template Slug', width:'200px'}, {label:'', width:'44px', align:'right'}]
    : [{label:'Name'}, {label:'', width:'44px', align:'right'}];
  return UI.tableScroll(sCols, rows, 'snx-' + type + '-tbody', 0, newRow);
}

function snxSaveSimple(type, id) {
  var inp = document.getElementById('snx-' + type + '-' + id);
  var name = inp ? inp.value.trim() : '';
  if (!name) return;
  var payload = { t: type, id: id, name: name };
  if (type === 'drivers') {
    var tplEl = document.getElementById('snx-drivers-tpl-' + id);
    if (tplEl) payload.templateSlug = tplEl.value;
  }
  snxApi('/api/neon/lookup', 'POST', payload).then(function() {
    var item = snxData[type].filter(function(x) { return x.id === id; })[0];
    if (item) {
      item.name = name;
      if (type === 'drivers' && payload.templateSlug !== undefined) item.templateSlug = payload.templateSlug;
    }
  });
}

function snxAddSimple(type) {
  var inp = document.getElementById('snx-' + type + '-new');
  var name = inp ? inp.value.trim() : '';
  if (!name) return;
  var payload = { t: type, name: name };
  if (type === 'drivers') {
    var tplEl = document.getElementById('snx-drivers-new-tpl');
    if (tplEl) payload.templateSlug = tplEl.value;
  }
  snxApi('/api/neon/lookup', 'POST', payload).then(function() { snxRefreshTab(type); });
}

function snxDeleteLookup(type, id) {
  var item = (snxData[type] || []).filter(function(x) { return x.id === id; })[0];
  var label = item ? item.name : 'this item';
  snxConfirm('Are you sure you want to delete <strong>' + label + '</strong>? This action cannot be undone.', function() {
    snxApi('/api/neon/lookup', 'DELETE', { t: type, id: id }).then(function(res) {
      if (res && res.error) { alert('Delete failed: ' + res.error); return; }
      snxRefreshTab(type);
    }).catch(function(e) { alert('Delete failed: ' + e.message); });
  });
}

// ── Tab: Assumptions ──────────────────────────────────────────────────────

function snxAssumptionsHtml() {
  var visible = snxData.assumptions.filter(function(a) {
    if (snxAssumptionFilter.category && (a.category || 'Others') !== snxAssumptionFilter.category) return false;
    return true;
  });

  var rows = visible.map(function(a) {
    var sf = 'snxSaveAssumption(' + a.id + ')';
    var displayVal = a.value != null ? parseFloat(parseFloat(a.value).toFixed(1)) : '';
    return '<tr onmouseenter="this.style.background=\'#FAFAF8\'" onmouseleave="this.style.background=\'\'">'
      + '<td style="' + _S.TD + ';width:160px">' + UI.cellSelect('snx-a-cat-'  + a.id, SNX_CATEGORIES, a.category || 'Others', sf) + '</td>'
      + '<td style="' + _S.TD + '">'             + UI.cellInput( 'snx-a-name-' + a.id, a.name, 'Assumption name', sf) + '</td>'
      + '<td style="' + _S.TD + ';width:150px">' + _autoNUM('snx-a-val-' + a.id, displayVal, sf, 'width:100%') + '</td>'
      + '<td style="' + _S.TD + ';width:130px">' + UI.cellSelect('snx-a-unit-' + a.id, SNX_UNITS, a.unit || 'dollar', sf) + '</td>'
      + '<td style="' + _S.TD + ';text-align:right;width:44px">' + _trashBtn('snxDeleteAssumption(' + a.id + ')') + '</td>'
      + '</tr>';
  }).join('');

  var newRow = '<tr class="snx-new-row" style="background:var(--bg)">'
    + '<td style="' + _S.TD + ';width:160px">'
    +   UI.cellOutlinedSelect('snx-a-new-cat', SNX_CATEGORIES.map(function(c){return{val:c,label:c};}), 'Others', null)
    + '</td>'
    + '<td style="' + _S.TD + '">'
    +   UI.cellOutlinedInput('snx-a-new-name', '', 'Assumption name')
    + '</td>'
    + '<td style="' + _S.TD + ';width:150px">'
    +   '<input type="number" id="snx-a-new-val" placeholder="0"'
    +   ' style="width:100%;box-sizing:border-box;padding:4px 8px;font-size:11px;'
    +   'border:1px solid var(--border-md);border-radius:6px;background:var(--surface);'
    +   'color:var(--text);outline:none;font-family:inherit"'
    +   ' onfocus="this.style.borderColor=\'var(--accent)\';this.style.boxShadow=\'0 0 0 3px rgba(237,0,94,.08)\'"'
    +   ' onblur="this.style.borderColor=\'var(--border-md)\';this.style.boxShadow=\'none\'" />'
    + '</td>'
    + '<td style="' + _S.TD + ';width:130px">'
    +   UI.cellOutlinedSelect('snx-a-new-unit', SNX_UNITS, 'dollar', null)
    + '</td>'
    + '<td style="' + _S.TD + ';text-align:right">' + _saveBtn('snxAddAssumption()') + '</td>'
    + '</tr>';

  var emptyMsg = snxAssumptionFilter.category
    ? 'No assumptions match the current filter. <a href="#" onclick="snxSetAssumptionFilter(\'category\',\'\');return false" style="color:var(--accent);text-decoration:none">Clear filter</a>'
    : 'No assumptions yet — use the row below to add one.';
  var empty = !rows ? '<tr><td colspan="5" style="padding:32px;text-align:center;font-size:12px;color:var(--faint)">' + emptyMsg + '</td></tr>' : '';

  var aCols = [
    { label: 'Category', html: _filterTHContent('Category', 'category', SNX_CATEGORIES, snxAssumptionFilter.category, 'snxSetAssumptionFilter'), width: '160px' },
    { label: 'Name' },
    { label: 'Value', width: '150px' },
    { label: 'Unit', width: '130px' },
    { label: '', width: '44px', align: 'right' }
  ];
  return UI.tableScroll(aCols, rows || empty, 'snx-a-tbody', 0, newRow);
}

function snxSaveAssumption(id) {
  var nameEl = document.getElementById('snx-a-name-' + id);
  var name = nameEl ? nameEl.value.trim() : '';
  if (!name) return;
  var valEl = document.getElementById('snx-a-val-' + id);
  snxApi('/api/neon/assumptions', 'POST', {
    id:       id,
    category: document.getElementById('snx-a-cat-'  + id).value,
    name:     name,
    value:    valEl && valEl.value !== '' ? parseFloat(valEl.value) : null,
    unit:     document.getElementById('snx-a-unit-' + id).value
  }).then(function() { snxNotifyCapacity(); });
}

function snxAddAssumption() {
  var name = document.getElementById('snx-a-new-name').value.trim();
  if (!name) return;
  var valEl = document.getElementById('snx-a-new-val');
  snxApi('/api/neon/assumptions', 'POST', {
    category: document.getElementById('snx-a-new-cat').value,
    name:     name,
    value:    valEl && valEl.value !== '' ? parseFloat(valEl.value) : null,
    unit:     document.getElementById('snx-a-new-unit').value
  }).then(function() { snxRefreshTab('assumptions'); });
}

function snxDeleteAssumption(id) {
  var a = snxData.assumptions.filter(function(x) { return x.id === id; })[0];
  var label = a ? a.name : 'this assumption';
  snxConfirm('Are you sure you want to delete <strong>' + label + '</strong>? This action cannot be undone.', function() {
    snxApi('/api/neon/assumptions', 'DELETE', { id: id }).then(function() { snxRefreshTab('assumptions'); });
  });
}

// ── Live-reload Team Capacity when settings change ─────────────────────────
function snxNotifyCapacity() {
  if (typeof activeId !== 'undefined' && activeId === 'teamcapacity-neon'
      && typeof cnxLoadAndRender === 'function') {
    cnxLoadAndRender();
  }
}

// ── Tab: Jira Projects ─────────────────────────────────────────────────────

function snxJiraProjectsHtml() {
  var items = snxData.jiraProjects || [];
  var _JP_OPTS = [{ val: 'scrum', label: 'Scrum' }, { val: 'kanban', label: 'Kanban' }];

  var rows = items.map(function(item) {
    var sf = 'snxSaveJiraProject(' + item.id + ')';
    return '<tr onmouseenter="this.style.background=\'#FAFAF8\'" onmouseleave="this.style.background=\'\'">'
      + '<td style="' + _S.TD + '">'
      +   UI.cellInput('snx-jp-jira-id-' + item.id, item.jira_id, 'e.g. SDT', sf)
      + '</td>'
      + '<td style="' + _S.TD + '">'
      +   UI.cellInput('snx-jp-team-name-' + item.id, item.team_name, 'e.g. Platform', sf)
      + '</td>'
      + '<td style="' + _S.TD + ';width:110px">'
      +   UI.cellSelect('snx-jp-type-' + item.id, _JP_OPTS, item.board_type || 'scrum', sf)
      + '</td>'
      + '<td style="' + _S.TD + ';text-align:right;width:44px">'
      +   _trashBtn('snxDeleteJiraProject(' + item.id + ')')
      + '</td></tr>';
  }).join('');

  var newRow = '<tr class="snx-new-row" style="background:var(--bg)">'
    + '<td style="' + _S.TD + '">'
    +   UI.cellOutlinedInput('snx-jp-new-jira-id', '', 'e.g. SDT')
    + '</td>'
    + '<td style="' + _S.TD + '">'
    +   UI.cellOutlinedInput('snx-jp-new-team-name', '', 'e.g. Platform')
    + '</td>'
    + '<td style="' + _S.TD + ';width:110px">'
    +   UI.cellOutlinedSelect('snx-jp-new-type', _JP_OPTS, 'scrum', null)
    + '</td>'
    + '<td style="' + _S.TD + ';text-align:right">' + _saveBtn('snxAddJiraProject()') + '</td>'
    + '</tr>';

  var jpCols = [{label:'Jira ID'}, {label:'Team Name'}, {label:'Type', width:'110px'}, {label:'', width:'44px', align:'right'}];
  return UI.tableScroll(jpCols, rows, 'snx-jp-tbody', 0, newRow);
}

function snxSaveJiraProject(id) {
  var jiraIdEl   = document.getElementById('snx-jp-jira-id-' + id);
  var teamNameEl = document.getElementById('snx-jp-team-name-' + id);
  var typeEl     = document.getElementById('snx-jp-type-' + id);
  var jiraId    = jiraIdEl   ? jiraIdEl.value.trim()   : '';
  var teamName  = teamNameEl ? teamNameEl.value.trim() : '';
  var boardType = typeEl     ? typeEl.value            : 'scrum';
  if (!jiraId || !teamName) return;
  snxApi('/api/neon/jira-projects', 'POST', { id: id, jira_id: jiraId, team_name: teamName, board_type: boardType }).then(function() {
    var item = (snxData.jiraProjects || []).filter(function(x) { return x.id === id; })[0];
    if (item) { item.jira_id = jiraId; item.team_name = teamName; item.board_type = boardType; }
  });
}

function snxAddJiraProject() {
  var jiraIdEl   = document.getElementById('snx-jp-new-jira-id');
  var teamNameEl = document.getElementById('snx-jp-new-team-name');
  var typeEl     = document.getElementById('snx-jp-new-type');
  var jiraId    = jiraIdEl   ? jiraIdEl.value.trim()   : '';
  var teamName  = teamNameEl ? teamNameEl.value.trim() : '';
  var boardType = typeEl     ? typeEl.value            : 'scrum';
  if (!jiraId || !teamName) return;
  snxApi('/api/neon/jira-projects', 'POST', { jira_id: jiraId, team_name: teamName, board_type: boardType }).then(function() {
    snxRefreshTab('jira-projects');
    _snxBustJiraCache();
  });
}

function snxDeleteJiraProject(id) {
  var item = (snxData.jiraProjects || []).filter(function(x) { return x.id === id; })[0];
  var label = item ? (item.jira_id + ' — ' + item.team_name) : 'this mapping';
  snxConfirm('Are you sure you want to delete <strong>' + label + '</strong>? This action cannot be undone.', function() {
    snxApi('/api/neon/jira-projects', 'DELETE', { id: id }).then(function(res) {
      if (res && res.error) { alert('Delete failed: ' + res.error); return; }
      snxRefreshTab('jira-projects');
      _snxBustJiraCache();
    }).catch(function(e) { alert('Delete failed: ' + e.message); });
  });
}

function _snxBustJiraCache() {
  if (typeof rnxLoadJiraProjects === 'function') rnxLoadJiraProjects();
  if (typeof _piJiraProjList !== 'undefined')    _piJiraProjList = [];
}

// ── Tab switcher + refresh ─────────────────────────────────────────────────

var SNX_TABS = [
  { id: 'teams',         label: 'Teams & Capacity' },
  { id: 'members',       label: 'Team Members'     },
  { id: 'drivers',       label: 'Drivers'          },
  { id: 'themes',        label: 'Themes'           },
  { id: 'assumptions',   label: 'Assumptions'      },
  { id: 'jira-projects', label: 'Jira Projects'    }
];

function snxTabContent(tab) {
  if (tab === 'teams')         return snxTeamsHtml();
  if (tab === 'members')       return snxMembersHtml();
  if (tab === 'drivers')       return snxSimpleTableHtml('drivers', 'e.g. Revenue Growth');
  if (tab === 'themes')        return snxSimpleTableHtml('themes',  'e.g. Personalisation');
  if (tab === 'assumptions')   return snxAssumptionsHtml();
  if (tab === 'jira-projects') return snxJiraProjectsHtml();
  return '';
}

// Remove any dropdown panels that were moved to body
function snxCleanupDrops() {
  document.querySelectorAll('body > .snx-drop-panel').forEach(function(p) { p.remove(); });
}

function snxSwitchTab(tab) {
  snxCleanupDrops();
  snxActiveTab = tab;
  var nav = document.getElementById('snx-nav');
  if (nav) nav.innerHTML = UI.drawerNav(SNX_TABS, tab, 'snxSwitchTab');
  var body = document.getElementById('snx-tab-body');
  if (body) body.innerHTML = snxTabContent(tab);
}

function snxRefreshTab(tab) {
  snxCleanupDrops();
  var fetches = [];
  if (tab === 'teams')       fetches = [
    snxApi('/api/neon/lookup?t=teams').then(function(r)  { snxData.teams       = Array.isArray(r) ? r : []; }),
    snxApi('/api/neon/budget').then(function(r)           { snxData.budgets     = (r && typeof r === 'object') ? r : {}; }),
    snxApi('/api/neon/assumptions').then(function(r)      { snxData.assumptions = Array.isArray(r) ? r : []; }),
    snxApi('/api/neon/team-members').then(function(r)     { snxData.members     = Array.isArray(r) ? r : []; })
  ];
  if (tab === 'members')     fetches = [snxApi('/api/neon/team-members').then(function(r)     { snxData.members     = Array.isArray(r) ? r : []; })];
  if (tab === 'drivers')     fetches = [snxApi('/api/neon/lookup?t=drivers').then(function(r) { snxData.drivers     = Array.isArray(r) ? r : []; })];
  if (tab === 'themes')      fetches = [snxApi('/api/neon/lookup?t=themes').then(function(r)  { snxData.themes      = Array.isArray(r) ? r : []; })];
  if (tab === 'assumptions')   fetches = [snxApi('/api/neon/assumptions').then(function(r)        { snxData.assumptions  = Array.isArray(r) ? r : []; })];
  if (tab === 'jira-projects') fetches = [snxApi('/api/neon/jira-projects').then(function(r)     { snxData.jiraProjects = Array.isArray(r) ? r : []; })];
  Promise.all(fetches).then(function() {
    if (snxActiveTab === tab) {
      var body = document.getElementById('snx-tab-body');
      if (body) body.innerHTML = snxTabContent(tab);
    }
  });
}

// ── Main render ────────────────────────────────────────────────────────────

function renderSettingsNeon() {
  var isViewer = typeof _kervCan === 'function' && !_kervCan('settings-neon', 'editor');
  var html =
    '<div id="snx-page"' + (isViewer ? ' class="snx-viewer"' : '') + '>'
    + UI.pageHeader({ title: 'Settings', subtitle: 'Manage reference data — click any cell to edit, changes save automatically', mb: '20px' })
    + '<div id="snx-nav">' + UI.drawerNav(SNX_TABS, snxActiveTab, 'snxSwitchTab') + '</div>'
    + '<div id="snx-loading">' + (typeof _KERV_LOADER_HTML !== 'undefined' ? _KERV_LOADER_HTML : '<div class="kerv-loader"><div class="kerv-loader-mark"><img src="https://res.cloudinary.com/dhfrgr4qd/image/upload/v1775830255/Kerv-Logo-1-1_bl2xdt.jpg" alt=""></div><div class="kerv-loader-text">Loading</div></div>') + '</div>'
    + '<div id="snx-tab-body" style="display:none"></div>'
    + '</div>';

  setTimeout(function() {
    snxLoadAll(function(err) {
      var loading = document.getElementById('snx-loading');
      var body    = document.getElementById('snx-tab-body');
      if (err) {
        if (loading) loading.innerHTML = '<span style="color:#C0392B">Failed to load: ' + err + '</span>';
        return;
      }
      if (loading) loading.style.display = 'none';
      if (body) {
        body.style.display = '';
        body.innerHTML = snxTabContent(snxActiveTab);
      }
    });
  }, 0);

  return html;
}
