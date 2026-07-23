// overview.js — Overview shell: header + tab navigation

var _ovxActiveTab = 'product';

var _OVX_TABS = [
  { id: 'okrs',           label: 'Company OKRs'     },
  { id: 'product',        label: 'Product & Tech',  dividerBefore: true }
];

function ovxLoad() {
  var loaders = {
    'okrs':           typeof ovxOkrsLoad     === 'function' ? ovxOkrsLoad     : null,
    'product':        typeof ovxProductLoad  === 'function' ? ovxProductLoad  : null,
    'finance':        typeof ovxFinanceLoad  === 'function' ? ovxFinanceLoad  : null,
    'sales':          typeof ovxRevenueLoad  === 'function' ? ovxRevenueLoad  : null,
    'people-culture': typeof ovxHrLoad       === 'function' ? ovxHrLoad       : null
  };
  var loader = loaders[_ovxActiveTab];
  if (loader) {
    loader();
  } else {
    var content = document.getElementById('ovx-tab-content');
    if (content) content.innerHTML = _ovxComingSoonHtml(_ovxActiveTab);
  }
}

function _ovxComingSoonHtml(tab) {
  var labelMap = {
    okrs: 'Company OKRs', product: 'Product & Tech', finance: 'Finance',
    sales: 'Sales', strategy: 'Strategy', operations: 'Operations',
    'people-culture': 'People & Culture', marketing: 'Marketing'
  };
  return '<div style="padding:80px 0;text-align:center">'
    + '<div style="font-size:36px;margin-bottom:16px">🚧</div>'
    + '<div style="font-size:16px;font-weight:600;color:var(--text);margin-bottom:6px">' + (labelMap[tab] || tab) + '</div>'
    + '<div style="font-size:13px;color:var(--muted)">Coming soon</div>'
    + '</div>';
}

// All department tabs are always visible — permissions control content depth, not tab visibility.
function _ovxVisibleTabs() {
  return _OVX_TABS;
}

function renderOverview() {
  var visibleTabs = _ovxVisibleTabs();
  if (!visibleTabs.some(function(t) { return t.id === _ovxActiveTab; })) {
    _ovxActiveTab = visibleTabs.length ? visibleTabs[0].id : 'product';
  }
  return '<div id="ovx-root">'
    + '<div style="margin-bottom:4px">'
    +   '<div style="font-size:22px;font-weight:600;color:var(--text);letter-spacing:-.3px">Welcome to KERV Team Dashboard</div>'
    +   '<div id="ovx-subtitle" style="font-size:13px;color:var(--muted);margin-top:3px">' + (_OVX_SUBTITLES[_ovxActiveTab] || '') + '</div>'
    + '</div>'
    + '<div id="ovx-tab-bar" style="margin-top:16px;margin-bottom:0;overflow-x:auto;-webkit-overflow-scrolling:touch">'
    +   UI.pills(visibleTabs, _ovxActiveTab, 'ovxSwitchTab')
    + '</div>'
    + '<div id="ovx-tab-content">'
    +   '<div id="ovx-body">' + (typeof _KERV_LOADER_HTML !== 'undefined' ? _KERV_LOADER_HTML : '') + '</div>'
    + '</div>'
    + '</div>';
}

var _OVX_SUBTITLES = {
  okrs:             'Company OKRs Overview',
  product:          'Product & Tech Overview',
  finance:          'Finance Overview',
  sales:            'Sales Overview',
  strategy:         'Strategy Overview',
  operations:       'Operations Overview',
  'people-culture': 'People & Culture Overview',
  marketing:        'Marketing Overview'
};

function ovxSwitchTab(tab) {
  _ovxActiveTab = tab;

  // Update subtitle
  var sub = document.getElementById('ovx-subtitle');
  if (sub) sub.textContent = _OVX_SUBTITLES[tab] || '';

  // Re-render pills with new active state
  var bar = document.getElementById('ovx-tab-bar');
  if (bar) bar.innerHTML = UI.pills(_ovxVisibleTabs(), tab, 'ovxSwitchTab');

  var content = document.getElementById('ovx-tab-content');
  if (!content) return;
  content.innerHTML = '<div id="ovx-body">' + (typeof _KERV_LOADER_HTML !== 'undefined' ? _KERV_LOADER_HTML : '') + '</div>';
  ovxLoad();
}
