// overview.js — Overview shell: header + tab navigation

var _ovxActiveTab = 'product';

var _OVX_TABS = [
  { id: 'product', label: 'Product & Tech' },
  { id: 'okrs',    label: 'OKRs' },
  { id: 'finance', label: 'Finance' },
  { id: 'sales',   label: 'Sales' }
];

// Returns the list of tabs visible to the current user.
// SuperAdmin → all tabs. Others → only tabs with an explicit sub-module permission.
function _ovxVisibleTabs() {
  if (typeof _kervUser === 'undefined' || !_kervUser) return _OVX_TABS;
  if (_kervUser.superAdmin) return _OVX_TABS;
  var perms = _kervUser.permissions || {};
  return _OVX_TABS.filter(function(t) { return !!perms['overview-' + t.id]; });
}

function renderOverview() {
  var visibleTabs = _ovxVisibleTabs();
  // If current active tab is no longer visible, fall back to first visible
  if (!visibleTabs.some(function(t) { return t.id === _ovxActiveTab; })) {
    _ovxActiveTab = visibleTabs.length ? visibleTabs[0].id : 'product';
  }
  return '<div id="ovx-root">'
    + '<div style="margin-bottom:4px">'
    +   '<div style="font-size:22px;font-weight:600;color:var(--text);letter-spacing:-.3px">Welcome to KERV Team Dashboard</div>'
    +   '<div id="ovx-subtitle" style="font-size:13px;color:var(--muted);margin-top:3px">Product &amp; Tech Overview</div>'
    + '</div>'
    + _ovxTabBarHtml(_ovxActiveTab)
    + '<div id="ovx-tab-content">'
    +   '<div id="ovx-body">' + (typeof _KERV_LOADER_HTML !== 'undefined' ? _KERV_LOADER_HTML : '') + '</div>'
    + '</div>'
    + '</div>';
}

function _ovxTabBarHtml(activeTab) {
  var visibleTabs = _ovxVisibleTabs();
  return '<div id="ovx-tab-bar" style="display:flex;gap:0;border-bottom:1px solid var(--border);margin-top:16px;margin-bottom:0">'
    + visibleTabs.map(function(t) {
        var active = t.id === (activeTab || _ovxActiveTab);
        return '<button onclick="ovxSwitchTab(\'' + t.id + '\')" id="ovx-tab-btn-' + t.id + '"'
          + ' style="font-size:13px;font-weight:' + (active ? '600' : '400') + ';'
          + 'color:' + (active ? 'var(--text)' : 'var(--muted)') + ';'
          + 'background:none;border:none;border-bottom:2px solid ' + (active ? 'var(--accent)' : 'transparent') + ';'
          + 'padding:8px 16px;cursor:pointer;margin-bottom:-1px;transition:color .15s,border-color .15s;font-family:inherit">'
          + t.label + '</button>';
      }).join('')
    + '</div>';
}

var _OVX_SUBTITLES = {
  product: 'Product & Tech Overview',
  okrs:    'OKRs Overview',
  finance: 'Finance Overview',
  sales:   'Sales Overview'
};

function ovxSwitchTab(tab) {
  _ovxActiveTab = tab;

  // Update subtitle
  var sub = document.getElementById('ovx-subtitle');
  if (sub) sub.textContent = _OVX_SUBTITLES[tab] || '';

  // Update tab button styles
  _ovxVisibleTabs().forEach(function(t) {
    var btn = document.getElementById('ovx-tab-btn-' + t.id);
    if (!btn) return;
    var active = t.id === tab;
    btn.style.fontWeight   = active ? '600' : '400';
    btn.style.color        = active ? 'var(--text)' : 'var(--muted)';
    btn.style.borderBottom = '2px solid ' + (active ? 'var(--accent)' : 'transparent');
  });

  var content = document.getElementById('ovx-tab-content');
  if (!content) return;

  if (tab === 'product') {
    content.innerHTML = '<div id="ovx-body">'
      + (typeof _KERV_LOADER_HTML !== 'undefined' ? _KERV_LOADER_HTML : '') + '</div>';
    if (typeof ovxLoad === 'function') ovxLoad();
  } else {
    var labels = { okrs: 'OKRs', finance: 'Finance', sales: 'Sales' };
    content.innerHTML =
      '<div style="padding:80px 0;text-align:center">'
      + '<div style="font-size:36px;margin-bottom:16px">🚧</div>'
      + '<div style="font-size:16px;font-weight:600;color:var(--text);margin-bottom:6px">' + labels[tab] + '</div>'
      + '<div style="font-size:13px;color:var(--muted)">Coming soon</div>'
      + '</div>';
  }
}
