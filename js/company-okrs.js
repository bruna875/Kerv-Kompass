// company-okrs.js — Company OKRs page (global prefix: cokr)

// ── Constants ──────────────────────────────────────────────────────────────
var COKR_OBJ_COLORS = ['#6366F1', '#0EA5E9', '#2EAD4B'];
var COKR_OBJ_LIGHT  = ['rgba(99,102,241,.08)', 'rgba(14,165,233,.08)', 'rgba(46,173,75,.08)'];
var COKR_DEPARTMENTS = ['Product', 'Tech', 'Design', 'Operations', 'Sales', 'Strategy', 'People & Culture', 'Marketing', 'Finance'];
var COKR_MONTHS      = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
var COKR_MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Tab navigation — each entry maps to one or more departments
var COKR_TABS_CONFIG = [
  { id: 'product-tech',   label: 'Product & Tech',  depts: ['Product', 'Tech', 'Design'] },
  { id: 'finance',        label: 'Finance',          depts: ['Finance'] },
  { id: 'sales',          label: 'Sales',            depts: ['Sales'] },
  { id: 'strategy',       label: 'Strategy',         depts: ['Strategy'] },
  { id: 'operations',     label: 'Operations',       depts: ['Operations'] },
  { id: 'people-culture', label: 'People & Culture', depts: ['People & Culture'] },
  { id: 'marketing',      label: 'Marketing',        depts: ['Marketing'] }
];

var COKR_TYPES = [
  { val: 'percent', label: '% Percent', helper: '%'   },
  { val: 'number',  label: '# Number',  helper: '#'   },
  { val: 'yn',      label: 'Y / N',     helper: 'y/n' },
  { val: 'days',    label: 'Days',      helper: 'days' },
  { val: 'hrs',     label: 'Hours',     helper: 'hrs'  },
  { val: 'mts',     label: 'Months',    helper: 'mts'  }
];

function _cokrToggleSec(wrapperId, chevId) {
  var wrap = document.getElementById(wrapperId);
  var chev = document.getElementById(chevId);
  if (!wrap) return;
  var isOpen = wrap.style.display !== 'none';
  wrap.style.display = isOpen ? 'none' : '';
  if (chev) chev.style.transform = isOpen ? 'rotate(-90deg)' : 'rotate(0deg)';
}

function _cokrTypeHelper(type) {
  var t = COKR_TYPES.filter(function(x) { return x.val === type; })[0];
  return t ? t.helper : (type || '#');
}

// "Alessandro Garavaglia" → "Alessandro G."
function _cokrOwnerShort(fullName) {
  if (!fullName) return '—';
  var parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return parts[0] + ' ' + parts[parts.length - 1][0].toUpperCase() + '.';
}

// Avatar img or coloured initials circle
function _cokrOwnerAvatar(name, size) {
  size = size || 18;
  var m  = _cokrMembers.filter(function(x) { return x.name === name; })[0];
  var fs = Math.round(size * 0.44);
  if (m && m.pictureUrl) {
    return '<img src="' + _cokrEsc(m.pictureUrl) + '" style="width:' + size + 'px;height:' + size + 'px;'
      + 'border-radius:50%;object-fit:cover;flex-shrink:0">';
  }
  var parts = (name || '').trim().split(/\s+/);
  var ini   = ((parts[0] || '')[0] || '') + ((parts.length > 1 ? parts[parts.length - 1][0] : '') || '');
  ini = ini.toUpperCase();
  var bg = (UI && UI._avatarColor) ? UI._avatarColor(name) : '#6366F1';
  return '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:' + bg + ';'
    + 'display:inline-flex;align-items:center;justify-content:center;font-size:' + fs + 'px;'
    + 'font-weight:600;color:#fff;flex-shrink:0">' + ini + '</div>';
}

// Full chip: avatar + "Nome C." — used in dropdown html and read-only cells
function _cokrOwnerChip(name, size) {
  if (!name) return '<span style="color:var(--faint)">—</span>';
  return '<div style="display:inline-flex;align-items:center;gap:6px">'
    + _cokrOwnerAvatar(name, size || 18)
    + '<span style="font-size:12px;color:var(--text)">' + _cokrEsc(_cokrOwnerShort(name)) + '</span>'
    + '</div>';
}

// ── Shared SVG icons ───────────────────────────────────────────────────────
var _COKR_SVG_EDIT   = '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';
var _COKR_SVG_DELETE = '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.8 7.5A1 1 0 004.8 12.5h4.4a1 1 0 001-.9L11 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var _COKR_SVG_ARCHIVE = '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><rect x="1" y="1.5" width="12" height="2.5" rx=".8" stroke="currentColor" stroke-width="1.3"/><path d="M2.5 4v7.2a.8.8 0 00.8.8h5.4M11.5 4v5.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M5.5 7h3M9 10l1.5 1.5L13 8.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var _COKR_SVG_CLOCK  = '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 1v6l3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.3"/></svg>';
var _COKR_SVG_PLUS   = '<svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
var _COKR_SVG_DD     = '<svg width="10" height="10" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// ── State ──────────────────────────────────────────────────────────────────
var _cokrYear           = new Date().getFullYear();
var _cokrData           = { objectives: [], keyResults: [] };
var _cokrMembers        = [];
var _cokrTab            = 'all';
var _cokrAvailableYears = [new Date().getFullYear()];

// ── Entry points ───────────────────────────────────────────────────────────

function renderCompanyOkrs() {
  return '<div id="cokr-root"></div>';
}

function cokrLoad() {
  var root = document.getElementById('cokr-root');
  if (root) root.innerHTML = typeof _KERV_LOADER_HTML !== 'undefined' ? _KERV_LOADER_HTML : '';
  Promise.all([
    fetch('/api/neon/okrs?year=' + _cokrYear).then(function(r) { return r.json(); }),
    fetch('/api/neon/users').then(function(r) { return r.json(); })
  ]).then(function(results) {
    _cokrData    = results[0];
    _cokrMembers = Array.isArray(results[1]) ? results[1].map(function(u) {
      return {
        name:       ((u.firstName || '') + ' ' + (u.lastName || '')).trim(),
        pictureUrl: u.photoUrl || '',
        department: u.department || ''
      };
    }).filter(function(u) { return u.name; }) : [];
    if (Array.isArray(_cokrData.availableYears) && _cokrData.availableYears.length > 0) {
      _cokrAvailableYears = _cokrData.availableYears;
    }
    cokrRender();
  }).catch(function(e) {
    var root = document.getElementById('cokr-root');
    if (root) root.innerHTML = UI.alertBanner ? UI.alertBanner('Failed to load OKRs: ' + e.message, 'error')
      : '<div style="color:#E5243B;padding:40px;font-size:13px">Failed to load OKRs: ' + e.message + '</div>';
  });
}

// ── Permission helper ──────────────────────────────────────────────────────

function _cokrCanEdit() {
  if (typeof _kervUser === 'undefined' || !_kervUser) return false;
  if (_kervUser.superAdmin) return true;
  return typeof _kervCan === 'function' && _kervCan('company-okrs', 'editor');
}

// ── Main render ────────────────────────────────────────────────────────────

function cokrRender() {
  var root = document.getElementById('cokr-root');
  if (!root) return;
  var objs    = _cokrData.objectives || [];
  var krs     = _cokrData.keyResults || [];
  var canEdit = _cokrCanEdit();

  // ── Add New dropdown ──
  var addNewBtn = canEdit
    ? '<div style="position:relative">'
    +   UI.btnPrimary(
          _COKR_SVG_PLUS + ' Add New &nbsp;' + _COKR_SVG_DD,
          'UI.ddToggle(\'cokr-add-dd\',\'cokr-add-btn\')',
          'cokr-add-btn'
        )
    +   UI.ddPanel('cokr-add-dd', [
          { label: 'Add New Objective', onclick: 'UI.ddToggle(\'cokr-add-dd\');cokrOpenObjModal(null)',
            svgHtml: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.3"/><path d="M8 5v6M5 8h6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>' },
          { label: 'Add New Key Result', onclick: 'UI.ddToggle(\'cokr-add-dd\');cokrOpenKrModal(null,null)',
            svgHtml: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>' },
          { label: 'Import Key Results', onclick: 'UI.ddToggle(\'cokr-add-dd\');cokrTriggerCsvUpload()',
            svgHtml: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 8l3 3 3-3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 13h12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>' }
        ])
    + '</div>'
    : '';

  // ── Page header ──
  var titleHtml = 'Company OKRs <span style="display:inline-flex;align-items:center;margin-left:8px;vertical-align:middle">'
    + UI.yearNav(_cokrYear, _cokrAvailableYears, 'cokrChangeYear') + '</span>';

  var html = UI.pageHeader({
    title: titleHtml,
    subtitle: 'Annual objectives and key results',
    titleRight: addNewBtn,
    mb: '20px'
  });

  // ── Department nav pills ──
  var allTabs = [
    { id: 'all',          label: 'All' },
    { id: 'company-wide', label: 'Company Wide', dividerBefore: true }
  ].concat(
    COKR_TABS_CONFIG.map(function(t) { return { id: t.id, label: t.label }; })
  );
  html += '<div style="margin-bottom:28px;overflow-x:auto;-webkit-overflow-scrolling:touch">'
    + UI.pills(allTabs, _cokrTab, 'cokrSetTab')
    + '</div>';

  // ── Company Wide tab ──
  if (_cokrTab === 'company-wide') {
    html += cokrRenderCompanyWideView(objs, krs, canEdit);
    root.innerHTML = html;
    return;
  }

  // ── Department tab ──
  if (_cokrTab !== 'all') {
    var tabCfg = COKR_TABS_CONFIG.filter(function(t) { return t.id === _cokrTab; })[0];
    if (tabCfg) html += cokrRenderDeptView(tabCfg, objs, krs, canEdit);
    root.innerHTML = html;
    return;
  }

  if (objs.length === 0) {
    html += '<div style="text-align:center;padding:80px 0;color:var(--faint);font-size:13px">'
      + (canEdit ? 'No objectives yet — add your first one above.' : 'No objectives for ' + _cokrYear + '.')
      + '</div>';
    root.innerHTML = html;
    return;
  }

  // ── Objectives ──
  objs.forEach(function(obj, oi) {
    var color   = COKR_OBJ_COLORS[oi % COKR_OBJ_COLORS.length];
    var lightBg = COKR_OBJ_LIGHT[oi % COKR_OBJ_LIGHT.length];
    var objKrs     = krs.filter(function(k) { return k.objective_id === obj.id; });
    var companyKrs = objKrs.filter(function(k) { return !k.department; });
    var teamNames  = [];
    objKrs.forEach(function(k) { if (k.department && teamNames.indexOf(k.department) === -1) teamNames.push(k.department); });
    teamNames.sort();

    var overallPct = 0;
    if (objKrs.length > 0) {
      var sum = 0;
      objKrs.forEach(function(k) { sum += cokrKrPct(k); });
      overallPct = Math.round(sum / objKrs.length);
    }

    html += '<div style="margin-bottom:24px;border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--surface)">';

    // Objective header
    html += UI.okrObjectiveHeader({
      index:      oi,
      color:      color,
      lightBg:    lightBg,
      title:      obj.title,
      description: obj.description || '',
      pct:        overallPct,
      ringLabel:  'overall',
      editBtn:    canEdit ? UI.btnIcon('cokrOpenObjModal(' + obj.id + ')', 'Edit objective', _COKR_SVG_EDIT) : ''
    });

    // Empty state
    if (objKrs.length === 0) {
      html += '<div style="padding:16px 24px;font-size:12px;color:var(--faint)">'
        + (canEdit ? 'No key results yet.' : 'No key results for this objective.') + '</div>';
    }

    // ── Company-wide KRs: editable table (same as dept tab) ──────────────────
    if (companyKrs.length > 0) {
      var compWrapId = 'cokr-all-comp-' + obj.id + '-wrap';
      var compChevId = 'cokr-chev-comp-' + obj.id;
      html += '<div onclick="_cokrToggleSec(\'' + compWrapId + '\',\'' + compChevId + '\')" '
        + 'style="background:' + lightBg + ';padding:7px 16px;font-size:10px;font-weight:500;'
        + 'text-transform:uppercase;letter-spacing:.6px;color:' + color + ';'
        + 'display:flex;align-items:center;justify-content:space-between;cursor:pointer;user-select:none">'
        + 'Company-wide'
        + '<span id="' + compChevId + '" style="display:flex;transition:transform .15s">'
        + _COKR_SVG_DD + '</span></div>';

      var compCols = [
        { label: 'Key Result', width: '220px' },
        { label: 'Owner',      width: '160px' },
        { label: 'Progress',   width: '180px' },
        { label: 'Type',       align: 'center', width: '62px' },
        { label: 'Goal',       align: 'center', width: '100px' }
      ];

      var compRows = companyKrs.map(function(kr) {
        var pct     = cokrKrPct(kr);
        var hasGoal = kr.goal_value !== null && kr.goal_value !== undefined && kr.goal_value !== '';
        var barHtml = '<div style="display:flex;align-items:center;gap:7px">'
          + '<div style="position:relative;flex:1;height:5px">'
          +   '<div style="position:absolute;inset:0;border-radius:3px;background:var(--border)"></div>'
          +   '<div style="position:absolute;top:0;left:0;height:100%;border-radius:3px;width:' + pct + '%;background:' + color + ';transition:width .3s"></div>'
          + '</div>'
          + '<span style="font-size:10px;font-weight:600;color:var(--muted);min-width:28px;text-align:right">' + pct + '%</span>'
          + '</div>';
        return UI.trReadOnly([
          UI.cellReadOnly(_cokrEsc(kr.title)),
          _cokrOwnerChip(kr.owner, 16),
          barHtml,
          UI.badge(_cokrTypeHelper(kr.type)),
          UI.cellReadOnly(hasGoal ? cokrFormatVal(kr, kr.goal_value) : '')
        ]);
      }).join('');

      html += UI.tableScroll(compCols, compRows, 'cokr-all-comp-' + obj.id, 0, null, { inCard: true });
    }

    // ── Per-team KRs: grouped by COKR_TABS_CONFIG (e.g. Product+Tech+Design → "Product & Tech") ──
    // Build groups: iterate COKR_TABS_CONFIG in order, collect matching KRs
    var coveredDepts = [];
    COKR_TABS_CONFIG.forEach(function(t) { coveredDepts = coveredDepts.concat(t.depts); });

    var renderedGroups = [];

    // 1. Tab-config groups (in sidebar order)
    COKR_TABS_CONFIG.forEach(function(tabCfg) {
      var groupKrs = objKrs.filter(function(k) { return k.department && tabCfg.depts.indexOf(k.department) !== -1; });
      if (groupKrs.length === 0) return;
      renderedGroups.push({ id: tabCfg.id, label: tabCfg.label, krs: groupKrs });
    });

    // 2. Orphan departments not covered by any tab config
    teamNames.forEach(function(dept) {
      if (coveredDepts.indexOf(dept) !== -1) return; // already grouped above
      var orphanKrs = objKrs.filter(function(k) { return k.department === dept; });
      if (orphanKrs.length === 0) return;
      renderedGroups.push({ id: _cokrTabId(dept), label: dept, krs: orphanKrs });
    });

    renderedGroups.forEach(function(group) {
      var team       = group.label;
      var teamKrs    = group.krs;
      var teamWrapId = 'cokr-all-team-' + obj.id + '-' + group.id + '-wrap';
      var teamChevId = 'cokr-chev-team-' + obj.id + '-' + group.id;
      html += '<div onclick="_cokrToggleSec(\'' + teamWrapId + '\',\'' + teamChevId + '\')" '
        + 'style="background:' + lightBg + ';padding:7px 16px;font-size:10px;font-weight:500;'
        + 'text-transform:uppercase;letter-spacing:.6px;color:' + color + ';'
        + 'display:flex;align-items:center;justify-content:space-between;cursor:pointer;user-select:none">'
        + _cokrEsc(team)
        + '<span id="' + teamChevId + '" style="display:flex;transition:transform .15s">'
        + _COKR_SVG_DD + '</span></div>';

      var teamCols = [
        { label: 'Key Result', width: '220px' },
        { label: 'Owner',      width: '160px' },
        { label: 'Progress',   width: '180px' },
        { label: 'Type',       align: 'center', width: '62px' },
        { label: 'Goal',       align: 'center', width: '100px' }
      ];

      var teamRows = teamKrs.map(function(kr) {
        var pct     = cokrKrPct(kr);
        var hasGoal = kr.goal_value !== null && kr.goal_value !== undefined && kr.goal_value !== '';

        var barHtml = '<div style="display:flex;align-items:center;gap:7px">'
          + '<div style="position:relative;flex:1;height:5px">'
          +   '<div style="position:absolute;inset:0;border-radius:3px;background:var(--border)"></div>'
          +   '<div style="position:absolute;top:0;left:0;height:100%;border-radius:3px;width:' + pct + '%;background:' + color + ';transition:width .3s"></div>'
          + '</div>'
          + '<span style="font-size:10px;font-weight:600;color:var(--muted);min-width:28px;text-align:right">' + pct + '%</span>'
          + '</div>';

        return UI.trReadOnly([
          UI.cellReadOnly(_cokrEsc(kr.title)),
          _cokrOwnerChip(kr.owner, 16),
          barHtml,
          UI.badge(_cokrTypeHelper(kr.type)),
          UI.cellReadOnly(hasGoal ? cokrFormatVal(kr, kr.goal_value) : '')
        ]);
      }).join('');

      html += UI.tableScroll(teamCols, teamRows, 'cokr-all-team-' + obj.id + '-' + group.id, 0, null, { inCard: true });
    });

    html += '</div>';
  });

  root.innerHTML = html;
}

// ── KR row helper ──────────────────────────────────────────────────────────

function cokrKrRow(kr, color, canEdit) {
  var pct    = cokrKrPct(kr);
  var hasGoal = kr.goal_value !== null && kr.goal_value !== undefined && kr.goal_value !== '';

  // Owner avatar
  var ownerHtml = '';
  if (kr.owner) {
    var m = _cokrMembers.filter(function(x) { return x.name === kr.owner; })[0];
    if (m && m.pictureUrl) {
      ownerHtml = '<img src="' + m.pictureUrl + '" title="' + _cokrEsc(kr.owner) + '" style="width:22px;height:22px;border-radius:50%;object-fit:cover;flex-shrink:0">';
    } else {
      var ini = kr.owner.split(' ').map(function(w) { return w[0] || ''; }).join('').toUpperCase().slice(0, 2);
      var bg  = UI._avatarColor ? UI._avatarColor(kr.owner) : 'var(--subtle)';
      ownerHtml = '<div title="' + _cokrEsc(kr.owner) + '" style="width:22px;height:22px;border-radius:50%;background:' + bg + ';display:inline-flex;align-items:center;justify-content:center;font-size:8px;font-weight:600;color:#fff;flex-shrink:0">' + ini + '</div>';
    }
  }

  var typeBadge = UI.badge(_cokrTypeHelper(kr.type));

  // Bar fills to goal (= 100%)
  var barHtml = '<div style="position:relative;flex-shrink:0;width:120px;height:6px">'
    + '<div style="position:absolute;inset:0;border-radius:3px;background:var(--border)"></div>'
    + '<div style="position:absolute;top:0;left:0;height:100%;border-radius:3px;width:' + pct + '%;background:' + color + ';transition:width .3s"></div>'
    + '</div>';

  var valHtml = '<div style="flex-shrink:0;min-width:96px;text-align:right">'
    + '<div style="font-size:11px;font-weight:600;color:var(--text)">'
    +   cokrFormatVal(kr, cokrCurrentVal(kr))
    +   (hasGoal ? '<span style="font-weight:400;color:var(--muted)"> / ' + cokrFormatVal(kr, kr.goal_value) + '</span>' : '')
    + '</div>'
    + '<div style="font-size:9px;color:var(--faint);margin-top:1px">' + pct + '%</div>'
    + '</div>';

  return '<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid var(--border)">'
    + '<div style="flex:1;min-width:0">'
    +   '<div style="font-size:12px;color:var(--text);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + _cokrEsc(kr.title) + '</div>'
    + '</div>'
    + '<div style="flex-shrink:0">' + ownerHtml + '</div>'
    + typeBadge
    + barHtml
    + valHtml
    + '<div style="flex-shrink:0;display:flex;gap:2px">'
    +   (canEdit ? UI.btnIcon('cokrOpenProgressModal(' + kr.id + ')', 'Update progress', _COKR_SVG_CLOCK) : '')
    +   (canEdit ? UI.btnIcon('cokrOpenKrModal(' + kr.id + ',' + kr.objective_id + ')', 'Edit KR', _COKR_SVG_EDIT) : '')
    +   (canEdit ? UI.btnIcon('cokrOpenArchiveModal(' + kr.id + ')', 'Archive KR', _COKR_SVG_ARCHIVE, 'var(--faint)', '#7C3AED', '#F5F3FF') : '')
    +   (canEdit ? UI.btnIcon('cokrDeleteKr(' + kr.id + ')', 'Delete KR', _COKR_SVG_DELETE, 'var(--faint)', '#E5243B', '#FFF0F0') : '')
    + '</div>'
    + '</div>';
}

// ── Value helpers ──────────────────────────────────────────────────────────

function cokrCurrentVal(kr) {
  for (var i = COKR_MONTHS.length - 1; i >= 0; i--) {
    var v = kr[COKR_MONTHS[i] + '_value'];
    if (v !== null && v !== undefined && v !== '') return parseFloat(v) || 0;
  }
  return parseFloat(kr.current_value) || 0;
}

function cokrKrPct(kr) {
  if (!kr.goal_value || parseFloat(kr.goal_value) === 0) return 0;
  var current = cokrCurrentVal(kr);
  return Math.min(100, Math.round(current / parseFloat(kr.goal_value) * 100));
}

function cokrFormatVal(kr, val) {
  var n = parseFloat(val);
  if (isNaN(n)) return '—';
  if (kr.type === 'percent') return Math.round(n) + '%';
  if (kr.type === 'yn')      return n > 0 ? 'Yes' : 'No';
  if (kr.type === 'days')    return n + ' d';
  if (kr.type === 'hrs')     return n + ' h';
  if (kr.type === 'mts')     return n + ' mo';
  // number (default)
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000)    return (n / 1000).toFixed(1) + 'K';
  return String(Math.round(n));
}

function cokrSetYear(y) {
  _cokrYear = y;
  _cokrTab  = 'all';
  cokrLoad();
}

function cokrChangeYear(dir) {
  var list = _cokrAvailableYears;
  var idx  = list.indexOf(_cokrYear);
  var next = idx + dir;
  if (next < 0 || next >= list.length) return;
  _cokrYear = list[next];
  _cokrTab  = 'all';
  cokrLoad();
}

function _cokrTabId(dept) {
  return dept.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function cokrSetTab(tab) {
  _cokrTab = tab;
  cokrRender();
}

// ── Department view ────────────────────────────────────────────────────────

function _cokrObjDepts(obj) {
  if (!obj || !obj.departments) return [];
  try { return JSON.parse(obj.departments); } catch(e) { return []; }
}

function _cokrObjInDept(obj, deptLabel) {
  var depts = _cokrObjDepts(obj);
  if (depts.length === 0) return true;
  return depts.indexOf(deptLabel) !== -1;
}

// True if the objective belongs to ANY of the given depts array
function _cokrObjInTab(obj, depts) {
  if (!depts || depts.length === 0) return true;
  var objDepts = _cokrObjDepts(obj);
  if (objDepts.length === 0) return true; // assigned to all depts
  return depts.some(function(d) { return objDepts.indexOf(d) !== -1; });
}

function cokrRenderDeptView(tabCfg, objs, krs, canEdit) {
  var depts    = tabCfg.depts;
  var tabLabel = tabCfg.label;
  var deptObjs = objs.filter(function(o) { return _cokrObjInTab(o, depts); });

  if (deptObjs.length === 0) {
    return '<div style="text-align:center;padding:80px 0;color:var(--faint);font-size:13px">'
      + (canEdit ? 'No objectives assigned to ' + _cokrEsc(tabLabel) + ' yet.' : 'No objectives for ' + _cokrYear + '.')
      + '</div>';
  }

  var html = '';

  deptObjs.forEach(function(obj, oi) {
    var globalIdx = objs.indexOf(obj);
    var colorIdx  = globalIdx >= 0 ? globalIdx : oi;
    var color   = COKR_OBJ_COLORS[colorIdx % COKR_OBJ_COLORS.length];
    var lightBg = COKR_OBJ_LIGHT[colorIdx % COKR_OBJ_LIGHT.length];
    var deptKrs = krs.filter(function(k) { return k.objective_id === obj.id && depts.indexOf(k.department) !== -1; });

    var pct = 0;
    if (deptKrs.length > 0) {
      var s = 0; deptKrs.forEach(function(k) { s += cokrKrPct(k); });
      pct = Math.round(s / deptKrs.length);
    }

    html += '<div style="margin-bottom:28px;border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--surface)">';

    // Objective header (compact, same style as All tab)
    html += UI.okrObjectiveHeader({
      index:      colorIdx,
      color:      color,
      lightBg:    lightBg,
      title:      obj.title,
      description: obj.description || '',
      pct:        pct,
      ringLabel:  tabLabel + ' progress',
      editBtn:    canEdit ? UI.btnIcon('cokrOpenObjModal(' + obj.id + ')', 'Edit objective', _COKR_SVG_EDIT) : ''
    });

    if (deptKrs.length > 0) {
      var deptCols = [
        { label: 'Key Result', width: '220px' },
        { label: 'Owner',      width: '160px' },
        { label: 'Progress',   width: '150px' },
        { label: 'Type',       align: 'center', width: '62px' },
        { label: 'Goal',       align: 'center', width: '100px' }
      ].concat(COKR_MONTH_LABELS.map(function(ml) {
        return { label: ml, align: 'center', width: '60px' };
      })).concat([
        { label: '',         width: '60px' }
      ]);
      // Register per-KR owner-pick handlers
      deptKrs.forEach(function(kr) {
        if (canEdit) {
          (function(krId) {
            window['_cokrOwner' + krId] = function() { cokrDeptBlur(krId, 'owner'); };
          })(kr.id);
        }
      });
      var deptRows = deptKrs.map(function(kr) { return cokrDeptKrRow(kr, color, canEdit, depts); }).join('');
      html += UI.tableScroll(deptCols, deptRows, 'cokr-dept-tbody-' + obj.id, 3, null, { inCard: true });
    } else {
      html += '<div style="padding:20px 28px;font-size:12px;color:var(--faint)">No key results for ' + _cokrEsc(tabLabel) + ' under this objective.</div>';
    }

    if (canEdit) {
      html += '<div style="padding:8px 12px;border-top:1px solid var(--border)">'
        + UI.btnSlim(_COKR_SVG_PLUS + ' Add Key Result', 'cokrOpenKrModal(null,' + obj.id + ')')
        + '</div>';
    }

    html += '</div>';
  });

  return html;
}

// ── Company Wide view ──────────────────────────────────────────────────────

function cokrRenderCompanyWideView(objs, krs, canEdit) {
  var html = '';

  objs.forEach(function(obj, oi) {
    var color   = COKR_OBJ_COLORS[oi % COKR_OBJ_COLORS.length];
    var lightBg = COKR_OBJ_LIGHT[oi % COKR_OBJ_LIGHT.length];
    var cwKrs   = krs.filter(function(k) { return k.objective_id === obj.id && !k.department; });

    var pct = 0;
    if (cwKrs.length > 0) {
      var s = 0; cwKrs.forEach(function(k) { s += cokrKrPct(k); });
      pct = Math.round(s / cwKrs.length);
    }

    html += '<div style="margin-bottom:28px;border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--surface)">';

    html += UI.okrObjectiveHeader({
      index:       oi,
      color:       color,
      lightBg:     lightBg,
      title:       obj.title,
      description: obj.description || '',
      pct:         pct,
      ringLabel:   'Company Wide progress',
      editBtn:     canEdit ? UI.btnIcon('cokrOpenObjModal(' + obj.id + ')', 'Edit objective', _COKR_SVG_EDIT) : ''
    });

    if (cwKrs.length > 0) {
      var cwCols = [
        { label: 'Key Result', width: '220px' },
        { label: 'Owner',      width: '160px' },
        { label: 'Progress',   width: '150px' },
        { label: 'Type',       align: 'center', width: '62px' },
        { label: 'Goal',       align: 'center', width: '100px' }
      ].concat(COKR_MONTH_LABELS.map(function(ml) {
        return { label: ml, align: 'center', width: '60px' };
      })).concat([{ label: '', width: '60px' }]);

      if (canEdit) {
        cwKrs.forEach(function(kr) {
          (function(krId) {
            window['_cokrOwner' + krId] = function() { cokrDeptBlur(krId, 'owner'); };
          })(kr.id);
        });
      }

      var cwRows = cwKrs.map(function(kr) { return cokrDeptKrRow(kr, color, canEdit, []); }).join('');
      html += UI.tableScroll(cwCols, cwRows, 'cokr-cw-tbody-' + obj.id, 3, null, { inCard: true });
    } else {
      html += '<div style="padding:20px 28px;font-size:12px;color:var(--faint)">No company-wide key results under this objective.</div>';
    }

    if (canEdit) {
      html += '<div style="padding:8px 12px;border-top:1px solid var(--border)">'
        + UI.btnSlim(_COKR_SVG_PLUS + ' Add Key Result', 'cokrOpenKrModal(null,' + obj.id + ')')
        + '</div>';
    }

    html += '</div>';
  });

  return html;
}

// ── Dept KR table row ──────────────────────────────────────────────────────

function cokrDeptKrRow(kr, color, canEdit, depts) {
  var pct      = cokrKrPct(kr);
  var hasGoal  = kr.goal_value !== null && kr.goal_value !== undefined && kr.goal_value !== '';
  var typeLabel = kr.type === 'dollar' ? '$' : kr.type === 'percent' ? '%' : '#';

  // Build owner options: members filtered by department, falling back to all members
  var filtered = _cokrMembers.filter(function(m) { return depts.indexOf(m.department) !== -1; });
  if (filtered.length === 0) filtered = _cokrMembers;
  function ownerOpt(name) {
    return { val: name, label: _cokrOwnerShort(name), html: _cokrOwnerChip(name, 16) };
  }
  var ownerOpts = [{ val: '', label: '—', html: '<span style="color:var(--faint)">—</span>' }].concat(
    filtered.map(function(m) { return ownerOpt(m.name); })
  );
  // Ensure current owner is always present even if from another dept
  if (kr.owner && !ownerOpts.some(function(o) { return o.val === kr.owner; })) {
    ownerOpts.push(ownerOpt(kr.owner));
  }

  var barHtml = '<div style="display:flex;align-items:center;gap:7px">'
    + '<div style="position:relative;flex:1;height:5px">'
    +   '<div style="position:absolute;inset:0;border-radius:3px;background:var(--border)"></div>'
    +   '<div id="cokr-dept-bar-' + kr.id + '" style="position:absolute;top:0;left:0;height:100%;border-radius:3px;width:' + pct + '%;background:' + color + ';transition:width .3s"></div>'
    + '</div>'
    + '<span id="cokr-dept-pct-' + kr.id + '" style="font-size:10px;font-weight:600;color:var(--muted);min-width:28px;text-align:right">' + pct + '%</span>'
    + '</div>';

  // Ghost number input helper (UI.cellInput is text-only; numbers need type="number")
  function ghostNum(field, val, center) {
    var GHN = 'width:100%;box-sizing:border-box;padding:2px 5px;font-size:11px;'
      + 'border:1px solid transparent;border-radius:4px;background:transparent;'
      + 'color:var(--text);outline:none;font-family:inherit;'
      + 'transition:border-color .12s,background .12s'
      + (center ? ';text-align:center' : '');
    var fo  = 'this.style.borderColor=\'var(--accent)\';this.style.background=\'var(--bg)\'';
    var bl  = 'this.style.borderColor=\'transparent\';this.style.background=\'transparent\';cokrDeptBlur(' + kr.id + ',\'' + field + '\')';
    var hov = 'if(document.activeElement!==this){this.style.borderColor=\'var(--border-md)\';this.style.background=\'var(--bg)\'}';
    var unH = 'if(document.activeElement!==this){this.style.borderColor=\'transparent\';this.style.background=\'transparent\'}';
    return '<input type="number" id="cokrd-' + kr.id + '-' + field + '" value="' + (val !== null && val !== undefined && val !== '' ? parseFloat(val) : '') + '" placeholder="—" '
      + 'style="' + GHN + '" onmouseenter="' + hov + '" onmouseleave="' + unH + '" onfocus="' + fo + '" onblur="' + bl + '">';
  }

  // Ghost Yes/No select — used when kr.type === 'yn'
  function ghostYn(field, val) {
    var curVal = (val !== null && val !== undefined && val !== '') ? (parseInt(val) ? '1' : '0') : '';
    var GHS = 'width:100%;box-sizing:border-box;padding:2px 5px;font-size:11px;'
      + 'border:1px solid transparent;border-radius:4px;background:transparent;'
      + 'color:var(--text);outline:none;font-family:inherit;cursor:pointer;'
      + 'text-align:center;transition:border-color .12s,background .12s';
    var bl  = 'cokrDeptBlur(' + kr.id + ',\'' + field + '\')';
    var hov = 'if(document.activeElement!==this){this.style.borderColor=\'var(--border-md)\';this.style.background=\'var(--bg)\'}';
    var unH = 'if(document.activeElement!==this){this.style.borderColor=\'transparent\';this.style.background=\'transparent\'}';
    return '<select id="cokrd-' + kr.id + '-' + field + '" onchange="' + bl + '" '
      + 'onmouseenter="' + hov + '" onmouseleave="' + unH + '" '
      + 'style="' + GHS + '">'
      + '<option value="">—</option>'
      + '<option value="1"' + (curVal === '1' ? ' selected' : '') + '>Yes</option>'
      + '<option value="0"' + (curVal === '0' ? ' selected' : '') + '>No</option>'
      + '</select>';
  }

  if (!canEdit) {
    return '<tr style="border-bottom:1px solid var(--border)">'
      + '<td style="padding:10px 14px;font-size:12px;color:var(--text);font-weight:500;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _cokrEsc(kr.title) + '</td>'
      + '<td style="padding:8px 14px">' + _cokrOwnerChip(kr.owner) + '</td>'
      + '<td style="padding:10px 14px">' + barHtml + '</td>'
      + '<td style="padding:10px 14px;text-align:center">' + UI.badge(_cokrTypeHelper(kr.type)) + '</td>'
      + '<td style="padding:10px 14px;text-align:center;font-size:12px;color:var(--muted)">' + (hasGoal ? _cokrEsc(cokrFormatVal(kr, kr.goal_value)) : '—') + '</td>'
      + COKR_MONTHS.map(function(m) {
          var mv = kr[m + '_value'];
          return '<td style="padding:10px 14px;text-align:center;font-size:12px;color:var(--text)">'
            + (mv !== null && mv !== undefined && mv !== '' ? cokrFormatVal(kr, mv) : '—') + '</td>';
        }).join('')
      + '<td></td>'
      + '</tr>';
  }

  return '<tr style="border-bottom:1px solid var(--border)">'
    + '<td style="padding:4px 8px 4px 10px;max-width:300px">'
    +   UI.cellInput('cokrd-' + kr.id + '-title', kr.title, '', "cokrDeptBlur(" + kr.id + ",'title')")
    + '</td>'
    + '<td style="padding:2px 8px">'
    +   UI.cellCustomSelect('cokrd-' + kr.id + '-owner', ownerOpts, kr.owner || '', '_cokrOwner' + kr.id)
    + '</td>'
    + '<td style="padding:4px 14px 4px 8px">' + barHtml + '</td>'
    + '<td style="padding:4px 8px;text-align:center">' + UI.badge(_cokrTypeHelper(kr.type)) + '</td>'
    + '<td style="padding:4px 8px">' + (kr.type === 'yn' ? ghostYn('goal_value', hasGoal ? kr.goal_value : '') : ghostNum('goal_value', hasGoal ? kr.goal_value : '', true)) + '</td>'
    + COKR_MONTHS.map(function(m) {
        return '<td style="padding:4px 8px">' + (kr.type === 'yn' ? ghostYn(m + '_value', kr[m + '_value']) : ghostNum(m + '_value', kr[m + '_value'], true)) + '</td>';
      }).join('')
    + '<td style="padding:4px 8px;text-align:right;white-space:nowrap">'
    +   UI.btnIcon('cokrOpenKrModal(' + kr.id + ',' + kr.objective_id + ')', 'Edit', _COKR_SVG_EDIT)
    +   UI.btnIcon('cokrOpenArchiveModal(' + kr.id + ')', 'Archive', _COKR_SVG_ARCHIVE, 'var(--faint)', '#7C3AED', '#F5F3FF')
    +   UI.btnIcon('cokrDeleteKr(' + kr.id + ')', 'Delete', _COKR_SVG_DELETE, 'var(--faint)', '#E5243B', '#FFF0F0')
    + '</td>'
    + '</tr>';
}

// ── Dept blur / save ───────────────────────────────────────────────────────

function cokrDeptBlur(krId, field) {
  var inp = document.getElementById('cokrd-' + krId + '-' + field);
  if (!inp) return;
  var raw = inp.value;
  var kr  = (_cokrData.keyResults || []).filter(function(k) { return k.id === krId; })[0];
  if (!kr) return;

  if (field === 'title')         kr.title         = raw;
  if (field === 'owner')         kr.owner         = raw;
  if (field === 'type')          kr.type          = raw;
  if (field === 'current_value') kr.current_value = parseFloat(raw) || 0;
  if (field === 'goal_value')    kr.goal_value    = (raw === '' || raw === null) ? null : parseFloat(raw);

  var monthMatch = field.match(/^([a-z]{3})_value$/);
  if (monthMatch && COKR_MONTHS.indexOf(monthMatch[1]) !== -1) {
    kr[field] = (raw === '' || raw === null) ? null : parseFloat(raw);
  }

  var pct   = cokrKrPct(kr);
  var bar   = document.getElementById('cokr-dept-bar-' + krId);
  var pctEl = document.getElementById('cokr-dept-pct-' + krId);
  if (bar)   bar.style.width = pct + '%';
  if (pctEl) pctEl.textContent = pct + '%';

  _cokrPost({
    action: 'save-kr', id: krId,
    objectiveId: kr.objective_id,
    title: kr.title, department: kr.department, owner: kr.owner, type: kr.type,
    goalValue:    (kr.goal_value !== null && kr.goal_value !== undefined && kr.goal_value !== '') ? parseFloat(kr.goal_value) : null,
    currentValue: parseFloat(kr.current_value) || 0,
    sortOrder: kr.sort_order || 0,
    janValue: kr.jan_value !== undefined ? kr.jan_value : null,
    febValue: kr.feb_value !== undefined ? kr.feb_value : null,
    marValue: kr.mar_value !== undefined ? kr.mar_value : null,
    aprValue: kr.apr_value !== undefined ? kr.apr_value : null,
    mayValue: kr.may_value !== undefined ? kr.may_value : null,
    junValue: kr.jun_value !== undefined ? kr.jun_value : null,
    julValue: kr.jul_value !== undefined ? kr.jul_value : null,
    augValue: kr.aug_value !== undefined ? kr.aug_value : null,
    sepValue: kr.sep_value !== undefined ? kr.sep_value : null,
    octValue: kr.oct_value !== undefined ? kr.oct_value : null,
    novValue: kr.nov_value !== undefined ? kr.nov_value : null,
    decValue: kr.dec_value !== undefined ? kr.dec_value : null
  }, function(err) { if (err) console.error('cokrDeptBlur save error:', err); });
}

// ── Escape helper ──────────────────────────────────────────────────────────

function _cokrEsc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── API helpers ────────────────────────────────────────────────────────────

function _cokrPost(body, cb) {
  fetch('/api/neon/okrs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  .then(function(r) { return r.json(); })
  .then(function(res) { cb(null, res); })
  .catch(function(e) { cb(e.message || 'Request failed', null); });
}

function _cokrDelete(body, cb) {
  fetch('/api/neon/okrs', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  .then(function(r) { return r.json(); })
  .then(function(res) { cb(null, res); })
  .catch(function(e) { cb(e.message || 'Request failed', null); });
}

// ── Drawer: Add / Edit Objective ───────────────────────────────────────────

function cokrOpenObjModal(id) {
  var isNew = id === null;
  var obj   = isNew ? null : (_cokrData.objectives || []).filter(function(o) { return o.id === id; })[0];

  // ── Year ──
  var curYear = obj ? (obj.year || _cokrYear) : _cokrYear;
  var yearOpts = [_cokrYear, _cokrYear + 1, _cokrYear + 2].map(function(y) {
    return { val: String(y), label: String(y) };
  });

  // ── Number (sort_order) ──
  var curNum = (obj && obj.sort_order != null) ? String(obj.sort_order) : '';

  // ── Department — single select mapped to tab ──
  var existingDepts = [];
  if (obj && obj.departments) {
    try { existingDepts = JSON.parse(obj.departments); } catch(e) {}
  }
  var curDeptId = '';
  if (existingDepts.length > 0) {
    var matchTab = COKR_TABS_CONFIG.filter(function(t) {
      return t.depts.some(function(d) { return existingDepts.indexOf(d) !== -1; });
    })[0];
    curDeptId = matchTab ? matchTab.id : '';
  }
  var deptOpts = [{ val: '', label: 'All departments' }].concat(
    COKR_TABS_CONFIG.map(function(t) { return { val: t.id, label: t.label }; })
  );

  var bodyHtml = ''
    + '<div id="cokr-obj-err" style="display:none;margin-bottom:14px"></div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">'
    +   '<div><label style="' + UI.LB + '">Year</label>'  + UI.customSelect('cokr-obj-year', yearOpts, String(curYear), '') + '</div>'
    +   '<div><label style="' + UI.LB + '">Number</label>' + UI.input('cokr-obj-num', 'number', 'e.g. 1', curNum) + '</div>'
    + '</div>'
    + UI.field('Title',       UI.input('cokr-obj-title', 'text', 'e.g. Drive sustainable growth', obj ? obj.title : ''), true)
    + UI.field('Description', UI.textarea('cokr-obj-desc', 'Optional context for this objective', obj ? (obj.description || '') : '', 3))
    + UI.field('Department',  UI.customSelect('cokr-obj-dept', deptOpts, curDeptId, ''));

  UI.openDrawer({
    id: 'cokr-obj-overlay',
    width: '440px',
    title: isNew ? 'Add Objective' : 'Edit Objective',
    subtitle: 'Set the objective title and description',
    closeFn: '_cokrCloseObjDrawer',
    bodyHtml: bodyHtml,
    footerLeft:  isNew ? '' : UI.btnDanger('Delete', 'cokrDeleteObj(' + id + ')'),
    footerRight: UI.btnCancel('Cancel', '_cokrCloseObjDrawer()')
      + UI.btnPrimary(isNew ? 'Add Objective' : 'Save Changes', '_cokrSaveObj(' + (id || 'null') + ')', 'cokr-obj-save')
  });

  setTimeout(function() {
    var t = document.getElementById('cokr-obj-title');
    if (t) t.focus();
  }, 320);
}

function _cokrCloseObjDrawer() { UI.closeDrawer('cokr-obj-overlay'); }

function _cokrSaveObj(id) {
  var title  = (document.getElementById('cokr-obj-title') || {}).value || '';
  var desc   = (document.getElementById('cokr-obj-desc')  || {}).value || '';
  var yearRaw = (document.getElementById('cokr-obj-year') || {}).value;
  var year   = yearRaw ? parseInt(yearRaw) : _cokrYear;
  var numRaw = (document.getElementById('cokr-obj-num')  || {}).value;
  var sortOrder = numRaw !== '' && numRaw !== undefined ? parseInt(numRaw) : 0;
  var deptId = (document.getElementById('cokr-obj-dept') || {}).value || '';
  var errEl  = document.getElementById('cokr-obj-err');

  if (!title.trim()) {
    if (errEl) { errEl.textContent = 'Title is required.'; errEl.style.display = ''; }
    return;
  }

  // Map tab id → depts array
  var departments = [];
  if (deptId) {
    var tab = COKR_TABS_CONFIG.filter(function(t) { return t.id === deptId; })[0];
    if (tab) departments = tab.depts;
  }

  var btn = document.getElementById('cokr-obj-save');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
  _cokrPost({
    action: 'save-objective',
    id: id || undefined,
    title: title.trim(),
    description: desc,
    year: year,
    sortOrder: sortOrder,
    departments: departments
  }, function(err) {
    if (err) {
      if (errEl) { errEl.textContent = err; errEl.style.display = ''; }
      if (btn) { btn.disabled = false; btn.textContent = id ? 'Save Changes' : 'Add Objective'; }
      return;
    }
    _cokrCloseObjDrawer();
    cokrLoad();
  });
}

function cokrDeleteObj(id) {
  if (!confirm('Delete this objective and all its key results? This cannot be undone.')) return;
  _cokrDelete({ type: 'objective', id: id }, function(err) {
    if (err) { alert('Error: ' + err); return; }
    _cokrCloseObjDrawer();
    cokrLoad();
  });
}

// ── Drawer: Add / Edit Key Result ──────────────────────────────────────────

function cokrOpenKrModal(id, objectiveId) {
  var isNew = id === null;
  var kr    = isNew ? null : (_cokrData.keyResults || []).filter(function(k) { return k.id === id; })[0];
  var objs  = _cokrData.objectives || [];

  var curType        = (kr && kr.type)       ? kr.type       : 'percent';
  var curYear        = (kr && kr.year)       ? kr.year       : _cokrYear;
  var curDept        = (kr && kr.department) ? kr.department : '';
  var curOwner       = kr ? (kr.owner || '') : '';
  var effectiveObjId = objectiveId || (kr ? kr.objective_id : (objs.length > 0 ? objs[0].id : null));

  // ── 1. Year ────────────────────────────────────────────────────────────────
  var yearOpts = [_cokrYear, _cokrYear + 1, _cokrYear + 2].map(function(y) {
    return { val: String(y), label: String(y) };
  });

  // ── 2. Objective — always custom select ───────────────────────────────────
  var objField = objs.length === 0
    ? '<div style="font-size:12px;color:var(--faint);padding:10px;border:1px solid var(--border-md);border-radius:7px">No objectives yet — add one first.</div>'
    : UI.customSelect('cokr-kr-objid',
        objs.map(function(o, i) { return { val: String(o.id), label: 'O' + (i + 1) + ' — ' + o.title }; }),
        String(effectiveObjId || ''), '');

  // ── 4. Department — unique values derived from users ──────────────────────
  var deptSet = {};
  _cokrMembers.forEach(function(m) { if (m.department) deptSet[m.department] = true; });
  var deptOpts = [{ val: '', label: 'Company-wide' }].concat(
    Object.keys(deptSet).sort().map(function(d) { return { val: d, label: d }; })
  );

  // ── 6. Type ────────────────────────────────────────────────────────────────
  var typeOpts = COKR_TYPES.map(function(t) { return { val: t.val, label: t.label }; });

  // ── 7. Goal — outlined input with reactive type-helper suffix ─────────────
  var goalField = '<div id="cokr-kr-goal-container">'
    + (curType === 'yn'
        ? _cokrGoalYnField(kr ? kr.goal_value : null)
        : _cokrGoalNumberField(kr ? kr.goal_value : null, curType))
    + '</div>';

  var bodyHtml = ''
    + UI.field('Year',       UI.customSelect('cokr-kr-year', yearOpts, String(curYear), ''))
    + UI.field('Objective',  objField, true)
    + UI.field('Title',      UI.input('cokr-kr-title', 'text', 'e.g. Reach $2M ARR', kr ? kr.title : ''), true)
    + UI.field('Department', UI.customSelect('cokr-kr-team', deptOpts, curDept, '_cokrKrDeptChange'))
    + UI.field('Owner', '<div id="cokr-kr-owner-field">'
        + UI.customSelect('cokr-kr-owner', _cokrKrOwnerOpts(curDept), curOwner, '')
        + '</div>')
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">'
    +   '<div><label style="' + UI.LB + '">Type</label>' + UI.customSelect('cokr-kr-type', typeOpts, curType, '_cokrKrTypeChange') + '</div>'
    +   '<div><label style="' + UI.LB + '">Goal</label>' + goalField + '</div>'
    + '</div>'
    + '<div id="cokr-kr-err" style="font-size:12px;color:#E5243B;margin-top:4px;display:none"></div>';

  UI.openDrawer({
    id: 'cokr-kr-overlay',
    width: '480px',
    title: isNew ? 'Add Key Result' : 'Edit Key Result',
    subtitle: 'Define what success looks like',
    closeFn: '_cokrCloseKrDrawer',
    bodyHtml: bodyHtml,
    footerLeft:  isNew ? '' : UI.btnDanger('Delete', 'cokrDeleteKr(' + id + ',true)'),
    footerRight: UI.btnCancel('Cancel', '_cokrCloseKrDrawer()')
      + UI.btnPrimary(isNew ? 'Add Key Result' : 'Save Changes',
          '_cokrSaveKr(' + (id || 'null') + ',' + (effectiveObjId || 'null') + ')',
          'cokr-kr-save')
  });

  setTimeout(function() {
    var t = document.getElementById('cokr-kr-title');
    if (t) t.focus();
  }, 320);
}

function _cokrCloseKrDrawer() { UI.closeDrawer('cokr-kr-overlay'); }

// Build owner options for a given department filter (or all if dept is empty)
function _cokrKrOwnerOpts(dept) {
  var filtered = dept
    ? _cokrMembers.filter(function(m) { return m.department === dept; })
    : _cokrMembers;
  if (filtered.length === 0) filtered = _cokrMembers;
  return [{ val: '', label: '—', html: '<span style="color:var(--faint)">—</span>' }].concat(
    filtered.map(function(m) {
      return { val: m.name, label: _cokrOwnerShort(m.name), html: _cokrOwnerChip(m.name, 18) };
    })
  );
}

// Called when Department changes — re-renders Owner dropdown filtered to that dept
function _cokrKrDeptChange(dept) {
  var wrap = document.getElementById('cokr-kr-owner-field');
  if (!wrap) return;
  wrap.innerHTML = UI.customSelect('cokr-kr-owner', _cokrKrOwnerOpts(dept), '', '');
}

// Called when Type changes — updates Goal helper suffix
// ── Goal field builders (shared by drawer + type-change swap) ─────────────

function _cokrGoalYnField(val) {
  var curVal = (val !== null && val !== undefined && val !== '') ? (parseInt(val) ? '1' : '0') : '1';
  var ynOpts = [
    { val: '1', label: 'Yes', html: '<span style="color:#16a34a;font-weight:500">Yes</span>' },
    { val: '0', label: 'No',  html: '<span style="color:#E5243B;font-weight:500">No</span>'  }
  ];
  return UI.customSelect('cokr-kr-goal-yn', ynOpts, curVal, '');
}

function _cokrGoalNumberField(val, type) {
  var goalFo = 'document.getElementById(\'cokr-kr-goal-wrap\').style.borderColor=\'var(--accent)\';'
    + 'document.getElementById(\'cokr-kr-goal-wrap\').style.boxShadow=\'0 0 0 3px rgba(237,0,94,.08)\'';
  var goalBl = 'document.getElementById(\'cokr-kr-goal-wrap\').style.borderColor=\'var(--border-md)\';'
    + 'document.getElementById(\'cokr-kr-goal-wrap\').style.boxShadow=\'none\'';
  return '<div id="cokr-kr-goal-wrap" style="display:inline-flex;align-items:center;width:100%;'
    + 'border:1px solid var(--border-md);border-radius:6px;background:var(--surface);'
    + 'overflow:hidden;transition:border-color .15s,box-shadow .15s">'
    + '<input type="number" id="cokr-kr-goal" placeholder="—" '
    + 'value="' + _cokrEsc(val !== null && val !== undefined ? String(val) : '') + '" '
    + 'style="flex:1;min-width:0;border:none;background:transparent;padding:6px 10px;'
    + 'font-size:13px;color:var(--text);outline:none;font-family:inherit" '
    + 'onfocus="' + goalFo + '" onblur="' + goalBl + '">'
    + '<span id="cokr-kr-goal-helper" style="padding:0 12px;font-size:12px;font-weight:500;'
    + 'color:var(--faint);border-left:1px solid var(--border);white-space:nowrap;'
    + 'align-self:stretch;display:flex;align-items:center">'
    + _cokrEsc(_cokrTypeHelper(type)) + '</span>'
    + '</div>';
}

function _cokrKrTypeChange(type) {
  var container = document.getElementById('cokr-kr-goal-container');
  if (!container) return;
  if (type === 'yn') {
    container.innerHTML = _cokrGoalYnField(null);
  } else {
    container.innerHTML = _cokrGoalNumberField('', type);
  }
}

function _cokrSaveKr(id, objectiveId) {
  var title   = (document.getElementById('cokr-kr-title')  || {}).value || '';
  var yearRaw = (document.getElementById('cokr-kr-year')   || {}).value;
  var year    = yearRaw ? parseInt(yearRaw) : _cokrYear;
  var dept    = (document.getElementById('cokr-kr-team')   || {}).value || '';
  var owner   = (document.getElementById('cokr-kr-owner')  || {}).value || '';
  var type    = (document.getElementById('cokr-kr-type')   || {}).value || 'percent';
  var goal;
  if (type === 'yn') {
    var ynGoalEl = document.getElementById('cokr-kr-goal-yn');
    var ynGoalRaw = ynGoalEl ? ynGoalEl.value : '';
    goal = ynGoalRaw !== '' ? parseInt(ynGoalRaw) : null;
  } else {
    var goalRaw = (document.getElementById('cokr-kr-goal') || {}).value;
    goal = goalRaw !== '' && goalRaw !== undefined ? parseFloat(goalRaw) : null;
  }
  var existingKr = id ? (_cokrData.keyResults || []).filter(function(k) { return k.id === id; })[0] : null;
  var current = existingKr ? (parseFloat(existingKr.current_value) || 0) : 0;
  var errEl   = document.getElementById('cokr-kr-err');

  var objIdEl       = document.getElementById('cokr-kr-objid');
  var resolvedObjId = objIdEl ? (parseInt(objIdEl.value) || null) : objectiveId;
  if (!resolvedObjId) resolvedObjId = objectiveId;

  if (!title.trim()) {
    if (errEl) { errEl.textContent = 'Title is required.'; errEl.style.display = ''; }
    return;
  }
  if (!resolvedObjId) {
    if (errEl) { errEl.textContent = 'Please select an objective.'; errEl.style.display = ''; }
    return;
  }

  var btn = document.getElementById('cokr-kr-save');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }

  _cokrPost({
    action: 'save-kr',
    id: id || undefined,
    objectiveId: resolvedObjId,
    title: title.trim(),
    year: year || null,
    department: dept.trim() || null,
    owner: owner.trim(),
    type: type,
    goalValue: goal,
    currentValue: current,
    sortOrder: 0
  }, function(err) {
    if (err) {
      if (errEl) { errEl.textContent = err; errEl.style.display = ''; }
      if (btn) { btn.disabled = false; btn.textContent = id ? 'Save Changes' : 'Add Key Result'; }
      return;
    }
    _cokrCloseKrDrawer();
    cokrLoad();
  });
}

function cokrDeleteKr(id, fromModal) {
  if (!confirm('Delete this key result? This cannot be undone.')) return;
  _cokrDelete({ type: 'kr', id: id }, function(err) {
    if (err) { alert('Error: ' + err); return; }
    if (fromModal) _cokrCloseKrDrawer();
    cokrLoad();
  });
}

// ── Modal: Archive Key Result ──────────────────────────────────────────────

function cokrOpenArchiveModal(id) {
  var kr = (_cokrData.keyResults || []).filter(function(k) { return k.id === id; })[0];
  if (!kr) return;

  var TOGGLE_BASE = 'display:inline-flex;align-items:center;gap:6px;padding:8px 18px;font-size:13px;font-weight:500;border-radius:8px;cursor:pointer;border:1.5px solid;transition:all .15s;font-family:inherit;';
  var bodyHtml = ''
    + '<div style="margin-bottom:16px">'
    +   '<div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);margin-bottom:10px">Archive as</div>'
    +   '<div style="display:flex;gap:8px">'
    +     '<button id="cokr-arc-achieved" onclick="_cokrArcToggle(\'achieved\')" style="' + TOGGLE_BASE + 'background:#F0FDF4;border-color:#16a34a;color:#16a34a">'
    +       '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 6-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +       'Achieved'
    +     '</button>'
    +     '<button id="cokr-arc-missed" onclick="_cokrArcToggle(\'missed\')" style="' + TOGGLE_BASE + 'background:var(--surface);border-color:var(--border-md);color:var(--muted)">'
    +       '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    +       'Missed'
    +     '</button>'
    +   '</div>'
    + '</div>'
    + UI.field('Note', UI.textarea('cokr-arc-note', 'Add details about this Key Result', '', 3));

  UI.openModal({
    id:          'cokr-arc-overlay',
    width:       '420px',
    title:       'Archive Key Result',
    subtitle:    _cokrEsc(kr.title),
    closeFn:     '_cokrCloseArcModal',
    bodyHtml:    bodyHtml,
    footerRight: UI.btnCancel('Cancel', '_cokrCloseArcModal()')
      + UI.btnPrimary('Archive', '_cokrSaveArchive(' + id + ')', 'cokr-arc-save')
  });
}

function _cokrArcToggle(val) {
  var achieved = document.getElementById('cokr-arc-achieved');
  var missed   = document.getElementById('cokr-arc-missed');
  if (!achieved || !missed) return;
  if (val === 'achieved') {
    achieved.style.background    = '#F0FDF4'; achieved.style.borderColor = '#16a34a'; achieved.style.color = '#16a34a';
    missed.style.background      = 'var(--surface)'; missed.style.borderColor = 'var(--border-md)'; missed.style.color = 'var(--muted)';
  } else {
    missed.style.background      = '#FEF2F2'; missed.style.borderColor = '#E5243B'; missed.style.color = '#E5243B';
    achieved.style.background    = 'var(--surface)'; achieved.style.borderColor = 'var(--border-md)'; achieved.style.color = 'var(--muted)';
  }
  document.getElementById('cokr-arc-overlay').dataset.arcVal = val;
}

function _cokrCloseArcModal() { UI.closeModal('cokr-arc-overlay'); }

function _cokrSaveArchive(id) {
  var overlay = document.getElementById('cokr-arc-overlay');
  var status  = (overlay && overlay.dataset.arcVal) || 'completed';
  var note    = (document.getElementById('cokr-arc-note') || {}).value || '';
  var btn     = document.getElementById('cokr-arc-save');
  if (btn) { btn.disabled = true; btn.textContent = 'Archiving…'; }
  _cokrPost({ action: 'archive-kr', id: id, status: status, note: note }, function(err) {
    if (err) {
      if (btn) { btn.disabled = false; btn.textContent = 'Archive'; }
      var errEl = document.getElementById('cokr-arc-overlay');
      if (errEl) errEl.querySelector && (errEl.querySelector('.cokr-arc-err') || document.createElement('div'));
      alert('Error: ' + err);
      return;
    }
    _cokrCloseArcModal();
    cokrLoad();
  });
}

// ── Modal: Quick progress update ───────────────────────────────────────────

function cokrOpenProgressModal(id) {
  var kr = (_cokrData.keyResults || []).filter(function(k) { return k.id === id; })[0];
  if (!kr) return;

  var isProgYn = kr.type === 'yn';
  var progField, progGoalHint;
  if (isProgYn) {
    var ynProgOpts = [
      { val: '1', label: 'Yes', html: '<span style="color:#16a34a;font-weight:500">Yes</span>' },
      { val: '0', label: 'No',  html: '<span style="color:#E5243B;font-weight:500">No</span>'  }
    ];
    var curProgYnVal = parseFloat(kr.current_value) > 0 ? '1' : '0';
    progField    = UI.customSelect('cokr-prog-yn', ynProgOpts, curProgYnVal, '');
    progGoalHint = '';
  } else {
    progField    = UI.input('cokr-prog-val', 'number', '', String(parseFloat(kr.current_value) || 0));
    progGoalHint = kr.goal_value != null ? '<div style="font-size:10px;color:var(--faint);margin-top:-8px;margin-bottom:14px">Goal: ' + cokrFormatVal(kr, kr.goal_value) + '</div>' : '';
  }

  var bodyHtml = ''
    + UI.field('Current Value', progField)
    + progGoalHint
    + '<div id="cokr-prog-err" style="font-size:12px;color:#E5243B;margin-top:4px;display:none"></div>';

  UI.openModal({
    id: 'cokr-prog-overlay',
    width: '360px',
    title: 'Update Progress',
    subtitle: _cokrEsc(kr.title),
    closeFn: '_cokrCloseProgModal',
    bodyHtml: bodyHtml,
    footerRight: UI.btnCancel('Cancel', '_cokrCloseProgModal()')
      + UI.btnPrimary('Save', '_cokrSaveProgress(' + id + ')', 'cokr-prog-save')
  });

  setTimeout(function() {
    var v = document.getElementById('cokr-prog-val');
    if (v) { v.focus(); v.select(); }
  }, 220);
}

function _cokrCloseProgModal() { UI.closeModal('cokr-prog-overlay'); }

function _cokrSaveProgress(id) {
  var ynEl  = document.getElementById('cokr-prog-yn');
  var numEl = document.getElementById('cokr-prog-val');
  var val   = ynEl ? (parseInt(ynEl.value) || 0) : (parseFloat((numEl || {}).value) || 0);
  var errEl = document.getElementById('cokr-prog-err');
  var btn   = document.getElementById('cokr-prog-save');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
  _cokrPost({
    action: 'update-progress',
    id: id,
    currentValue: val
  }, function(err) {
    if (err) {
      if (errEl) { errEl.textContent = err; errEl.style.display = ''; }
      if (btn) { btn.disabled = false; btn.textContent = 'Save'; }
      return;
    }
    _cokrCloseProgModal();
    cokrLoad();
  });
}
