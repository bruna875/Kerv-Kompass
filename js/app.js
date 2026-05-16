// app.js — navigation, routing, events, init

// ── App state ──
var activeId  = 'overview';
var collapsed = false;

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
    section: 'Roadmap & Product Dev',
    items: [
      { id: 'roadmap-neon',        label: 'Product Roadmap', icon: ico.roadmap  },
      { id: 'teamcapacity-neon',   label: 'Team Capacity',   icon: ico.capacity },
      { id: 'sdt-sprint-analysis', label: 'XTS Team',               icon: ico.sprint,    dividerBefore: true },
      { id: 'api-team',            label: 'API Team',               icon: ico.api,       disabled: true },
      { id: 'ads-team',            label: 'Ads Team',               icon: ico.ads,       disabled: true },
      { id: 'kervone-team',        label: 'KERV One Team',          icon: ico.kervone,   disabled: true },
      { id: 'shared-team',         label: 'Shared Serv. Team',      icon: ico.shared,    disabled: true },
      { id: 'reporting-team',      label: 'Reporting Team',         icon: ico.reporting, disabled: true },
      { id: 'product-ideas',       label: 'Product Requests / Ideas', icon: ico.ideas,   disabled: true, dividerBefore: true }
    ]
  },
  {
    section: 'Live Prototypes',
    items: [
      { id: 'metadata-analysis', label: 'Metadata Analysis',  icon: ico.metadata },
      { id: 'media-planner-v2',  label: 'Media Planner (v2)', icon: ico.showcase }
    ]
  },
  {
    section: 'Work in Progress',
    items: [
      { id: 'sdt-content-form',    label: 'New Content Upload',   icon: ico.sdtform },
      { id: 'taxonomy-showcase',   label: 'Taxonomy Explorer',    icon: ico.taxonomy },
      { id: 'media-planner',       label: 'Media Planner (v1)',   icon: ico.showcase }
    ]
  },
];

// ── Pages map ──
var PAGES = {
  'overview':            renderOverview,
  'roadmap-neon':        renderRoadmapNeon,
  'teamcapacity-neon':   renderTeamCapacityNeon,
  'settings-neon':       renderSettingsNeon,
  'sdt-content-form':    renderSdtContentForm,
  'taxonomy-explorer':   renderTaxonomyExplorer,
  'metadata-analysis':   renderMetadataAnalysis,
  'taxonomy-showcase':   renderTaxonomyShowcase,
  'media-planner':       renderInventoryExplorerV2,
  'media-planner-v2':    renderMediaPlannerV2,
  'sdt-sprint-analysis': renderSdtSprintAnalysis
};

// ── Nav ──

// Sections collapsed by default (by section label)
var navCollapsed = { 'Live Prototypes': true, 'Work in Progress': true, 'Administration': true };

function toggleNavSection(section) {
  navCollapsed[section] = !navCollapsed[section];
  buildNav();
}

function buildNav() {
  document.getElementById('nav').innerHTML = NAV_CONFIG.map(function(sec) {
    var items = sec.items.map(function(item) {
      var act     = item.id === activeId;
      var divider = item.dividerBefore ? '<div style="height:1px;background:var(--border);margin:4px 12px"></div>' : '';
      if (item.disabled) {
        return divider + '<div class="nitem" style="opacity:.4;cursor:default;pointer-events:none">'
          + '<div class="nico">' + item.icon + '</div>'
          + '<span class="nlabel">' + item.label + '</span>'
          + '<span style="margin-left:auto;font-size:9px;font-weight:600;color:var(--muted);letter-spacing:.3px;white-space:nowrap">Soon</span>'
          + '</div>';
      }
      return divider + '<div class="nitem' + (act ? ' act' : '') + '" data-page="' + item.id + '" data-label="' + item.label + '">'
        + (act ? '<div class="nbar"></div>' : '')
        + '<div class="nico">' + item.icon + '</div>'
        + '<span class="nlabel">' + item.label + '</span>'
        + '</div>';
    }).join('');

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
  var content = document.getElementById('content');
  var pageHtml = PAGES[id] ? PAGES[id]() : '<div class="ptitle">' + label + '</div>';
  content.innerHTML = '<div id="content-bc" class="content-bc">' + label + '</div>' + pageHtml;
  buildNav();
  if (id === 'overview')          setTimeout(ovxLoad, 0);
  if (id === 'roadmap-neon')      setTimeout(rnxGanttTooltipInit, 50);
  if (id === 'sdt-sprint-analysis') setTimeout(xtsInit, 50);
  if (!noPush) history.pushState({ id: id, label: label }, '', '/' + id);
}

// ── URL routing helpers ──

function pageFromPath() {
  var path = location.pathname.replace(/^\//, '').replace(/\/$/, '') || 'overview';
  // find matching nav item
  var found = null;
  NAV_CONFIG.forEach(function(sec) {
    sec.items.forEach(function(item) {
      if (item.id === path) found = item;
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

// ── Login / Logout ──

function login() {
  var e = document.getElementById('em').value.trim(), p = document.getElementById('pw').value;
  if (e === 'product@kerv.ai' && p === 'roadmap') {
    document.getElementById('auth').classList.add('gone');
    setTimeout(function() { document.getElementById('auth').style.display = 'none'; }, 300);
    document.getElementById('app').classList.add('show');
    var name = e.split('@')[0];
    document.getElementById('un').textContent = name.charAt(0).toUpperCase() + name.slice(1);
    document.getElementById('av').textContent = name.charAt(0).toUpperCase() + name.charAt(name.length > 1 ? 1 : 0).toUpperCase();
    var startItem = pageFromPath();
    activeId = startItem.id;
    buildNav();
    setPage(startItem.id, startItem.label, true);
  } else {
    document.getElementById('err').textContent = 'Invalid credentials.';
  }
}

function logout() {
  document.getElementById('app').classList.remove('show');
  document.getElementById('auth').style.display = 'flex';
  setTimeout(function() { document.getElementById('auth').classList.remove('gone'); }, 10);
  document.getElementById('pw').value = '';
  document.getElementById('err').textContent = '';
}

// ── Init ──

var m = new Date().getMonth(), y = new Date().getFullYear();
document.getElementById('qbadge').textContent = 'Q' + (m < 3 ? 1 : m < 6 ? 2 : m < 9 ? 3 : 4) + ' ' + y;
document.getElementById('loginBtn').addEventListener('click', login);
document.getElementById('logoutBtn').addEventListener('click', logout);
document.getElementById('tog').addEventListener('click', toggleSb);
document.getElementById('pw').addEventListener('keydown', function(e) { if (e.key === 'Enter') login(); });
document.getElementById('em').addEventListener('keydown', function(e) { if (e.key === 'Enter') login(); });

// Auto-login
document.getElementById('em').value = 'product@kerv.ai';
document.getElementById('pw').value = 'roadmap';
login();
