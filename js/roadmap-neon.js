// roadmap-neon.js — Independent Roadmap module backed by Neon DB
// All globals prefixed rnx_ to avoid collisions with legacy roadmap.js

// ── State ──────────────────────────────────────────────────────────────────

var rnxInitiatives  = [];
var rnxLoading      = false;
var rnxGanttGroup   = 'driver';
var rnxEditId       = null;  // null = new, number = editing

// Reference data loaded from Neon
var rnxRefData = { teams: [], members: [], drivers: [], themes: [] };

var rnxDeliveryOpts = [
  { val: 'not-started', label: 'Not Started', cls: 'ds-gray'   },
  { val: 'on-track',    label: 'On Track',    cls: 'ds-green'  },
  { val: 'at-risk',     label: 'At Risk',     cls: 'ds-yellow' },
  { val: 'delayed',     label: 'Delayed',     cls: 'ds-red'    },
  { val: 'on-hold',     label: 'On Hold',     cls: 'ds-orange' },
  { val: 'delivered',   label: 'Delivered',   cls: 'ds-blue'   }
];

var rnxConfidenceOpts = ['low', 'medium', 'high'];

// ── Colour palettes (same as legacy) ──────────────────────────────────────

var RNX_PALETTE = ['#ED005E','#FF6B35','#FFB627','#06D6A0','#118AB2','#7B2D8E','#E84393','#00B4D8','#F72585','#4CC9F0','#FF477E','#3A86FF'];
var RNX_GREENS  = ['#7B2D8E','#9B59B6','#6C3483','#A569BD','#8E44AD','#BB8FCE','#5B2C6F','#D2B4DE','#4A235A','#7D3C98','#C39BD3','#6A1B9A'];
var rnxDriverColors = {}, rnxThemeColors = {};

function rnxBuildColorMaps() {
  var ds = [], ts = [];
  rnxInitiatives.forEach(function(i) {
    if (ds.indexOf(i.driver) === -1) ds.push(i.driver);
    if (ts.indexOf(i.theme)  === -1) ts.push(i.theme);
  });
  ds.sort(); ts.sort();
  rnxDriverColors = {}; rnxThemeColors = {};
  ds.forEach(function(d, i) { rnxDriverColors[d] = RNX_PALETTE[i % RNX_PALETTE.length]; });
  ts.forEach(function(t, i) { rnxThemeColors[t]  = RNX_GREENS[i  % RNX_GREENS.length]; });
}

// ── Helpers ────────────────────────────────────────────────────────────────

function rnxCurrentQ() {
  var m = new Date().getMonth();
  return 'Q' + (m < 3 ? 1 : m < 6 ? 2 : m < 9 ? 3 : 4);
}

function rnxCurrentQLabel() {
  var m = new Date().getMonth(), y = new Date().getFullYear();
  return 'Q' + (m < 3 ? 1 : m < 6 ? 2 : m < 9 ? 3 : 4) + ' ' + y;
}

var RNX_QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

function rnxFmtDollar(v) {
  if (!v && v !== 0) return '—';
  var n = parseFloat(String(v).replace(/[^0-9.-]/g, ''));
  if (isNaN(n)) return '—';
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function rnxFmtAV(n) {
  if (!n && n !== 0) return '—';
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M';
  if (n >= 1000)    return '$' + (n / 1000).toFixed(2) + 'K';
  return '$' + n.toFixed(2);
}

function rnxRoiHtml(v) {
  if (!v && v !== 0) return '—';
  var n = parseFloat(String(v).replace(/[^0-9.-]/g, ''));
  if (isNaN(n)) return '—';
  var p = Math.round(n * 100);
  return '<span style="color:' + (p < 0 ? '#E5243B' : '#2EAD4B') + ';font-weight:500">' + p + '%</span>';
}

function rnxBadge(text, color) {
  return '<span class="badge" style="background:' + color + '18;color:' + color + '">' + text + '</span>';
}
function rnxDriverBadge(v) { return rnxBadge(v, rnxDriverColors[v] || '#8E8E93'); }
function rnxThemeBadge(v)  { return rnxBadge(v, rnxThemeColors[v]  || '#8E8E93'); }

function rnxDsHtml(ini) {
  var opt = rnxDeliveryOpts.filter(function(o) { return o.val === ini.deliveryStatus; })[0] || rnxDeliveryOpts[0];
  return '<span class="pill ds-pill ' + opt.cls + '" data-rnx-ds-id="' + ini.id + '">' + opt.label + '</span>';
}

// ── Donut SVG (same algorithm as legacy) ──────────────────────────────────

function rnxDonutSvg(slices, size) {
  size = size || 56;
  var r = size / 2 - 4, cx = size / 2, cy = size / 2, circ = 2 * Math.PI * r;
  var total = 0;
  slices.forEach(function(s) { total += s.v; });
  if (total === 0) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">'
      + '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#E8E6E0" stroke-width="6"/></svg>';
  }
  var offset = 0, paths = '';
  slices.forEach(function(s) {
    if (s.v <= 0) return;
    var pct = s.v / total, dash = pct * circ, gap = circ - dash;
    paths += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + s.c + '" stroke-width="6"'
      + ' stroke-dasharray="' + dash.toFixed(2) + ' ' + gap.toFixed(2) + '"'
      + ' stroke-dashoffset="' + (-offset).toFixed(2) + '"'
      + ' style="transform:rotate(-90deg);transform-origin:center"/>';
    offset += dash;
  });
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" style="flex-shrink:0">'
    + paths
    + '<text x="' + cx + '" y="' + cy + '" text-anchor="middle" dominant-baseline="central" style="font-size:13px;font-weight:500;fill:var(--text)">' + total + '</text>'
    + '</svg>';
}

// ── Scorecards ─────────────────────────────────────────────────────────────

function rnxScInitiativesFor(subset, label) {
  var ns = subset.filter(function(i) { return i.deliveryStatus === 'not-started'; }).length;
  var on = subset.filter(function(i) { return i.deliveryStatus === 'on-track';    }).length;
  var ar = subset.filter(function(i) { return i.deliveryStatus === 'at-risk';     }).length;
  var dl = subset.filter(function(i) { return i.deliveryStatus === 'delayed';     }).length;
  return '<div class="mcard" id="rnx-sc-init">'
    + '<div class="mlabel">Initiatives <span class="mlabel-sub">' + label + '</span></div>'
    + '<div class="mval">' + subset.length + '</div>'
    + '<div class="sc-badges">'
    + '<span class="sc-badge ds-gray">'   + ns + ' Not Started</span>'
    + '<span class="sc-badge ds-green">'  + on + ' On Track</span>'
    + '<span class="sc-badge ds-yellow">' + ar + ' At Risk</span>'
    + '<span class="sc-badge ds-red">'    + dl + ' Delayed</span>'
    + '</div></div>';
}

function rnxScGroupedFor(id, label, key, subset, qlabel) {
  var groups = {};
  subset.forEach(function(i) {
    var k = i[key];
    if (!groups[k]) groups[k] = { 'not-started': 0, 'on-track': 0, 'at-risk': 0, 'delayed': 0, count: 0 };
    groups[k][i.deliveryStatus]++;
    groups[k].count++;
  });
  var keys = Object.keys(groups); keys.sort();
  var colorMap = key === 'driver' ? rnxDriverColors : key === 'theme' ? rnxThemeColors : null;

  function getC(k, ki) {
    if (colorMap && colorMap[k]) return colorMap[k];
    if (key === 'team') return RNX_GREENS[ki % RNX_GREENS.length];
    return RNX_PALETTE[ki % RNX_PALETTE.length];
  }

  var donutSlices = keys.map(function(k, ki) { return { v: groups[k].count, c: getC(k, ki) }; });
  var rows = keys.map(function(k, ki) {
    var g = groups[k], pills = '';
    if (g['not-started'] > 0) pills += '<span class="mini-pill ds-gray">'   + g['not-started'] + '</span>';
    if (g['on-track']    > 0) pills += '<span class="mini-pill ds-green">'  + g['on-track']    + '</span>';
    if (g['at-risk']     > 0) pills += '<span class="mini-pill ds-yellow">' + g['at-risk']     + '</span>';
    if (g['delayed']     > 0) pills += '<span class="mini-pill ds-red">'    + g['delayed']     + '</span>';
    return '<div class="sc-legend-item">'
      + '<div class="sc-legend-left"><span class="sc-legend-dot" style="background:' + getC(k, ki) + '"></span><span class="sc-legend-name">' + k + '</span></div>'
      + '<div class="sc-legend-pills">' + pills + '</div></div>';
  }).join('');

  return '<div class="mcard" id="' + id + '">'
    + '<div class="mlabel">' + label + ' <span class="mlabel-sub">' + qlabel + '</span></div>'
    + '<div class="sc-donut-row"><div style="flex-shrink:0;display:flex;align-items:center;justify-content:center">' + rnxDonutSvg(donutSlices) + '</div>'
    + '<div class="sc-donut-legend">' + rows + '</div></div></div>';
}

function rnxScLeadCard(id, label, key, subset, qlabel) {
  var groups = {};
  subset.forEach(function(i) {
    var k = i[key] || '—';
    if (!groups[k]) groups[k] = { count: 0 };
    rnxDeliveryOpts.forEach(function(o) { if (!groups[k][o.val]) groups[k][o.val] = 0; });
    var ds = i.deliveryStatus || 'not-started';
    if (groups[k][ds] !== undefined) groups[k][ds]++; else groups[k][ds] = 1;
    groups[k].count++;
  });
  var keys = Object.keys(groups).sort(function(a, b) { return groups[b].count - groups[a].count; });

  var rows = keys.map(function(k) {
    var g = groups[k];
    var member = rnxRefData.members.filter(function(m) { return m.name === k; })[0];
    var av = (member && member.pictureUrl)
      ? '<img src="' + member.pictureUrl + '" style="width:22px;height:22px;border-radius:50%;object-fit:cover;flex-shrink:0">'
      : '<div style="width:22px;height:22px;border-radius:50%;background:var(--subtle);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;color:var(--muted);flex-shrink:0">'
        + (k !== '—' ? k.charAt(0).toUpperCase() : '?') + '</div>';
    var pills = '';
    rnxDeliveryOpts.forEach(function(o) { if (g[o.val] > 0) pills += '<span class="mini-pill ' + o.cls + '">' + g[o.val] + '</span>'; });
    return '<div class="sc-legend-item">'
      + '<div class="sc-legend-left" style="gap:7px">' + av + '<span class="sc-legend-name">' + k + '</span></div>'
      + '<div class="sc-legend-pills">' + pills + '</div></div>';
  }).join('');

  return '<div class="mcard" id="' + id + '">'
    + '<div class="mlabel">' + label + ' <span class="mlabel-sub">' + qlabel + '</span></div>'
    + (rows || '<div style="font-size:12px;color:var(--faint);padding:4px 0">—</div>')
    + '</div>';
}

function rnxRefreshCards(subset, label) {
  var sc = document.getElementById('rnx-sc-init');
  if (sc) sc.outerHTML = rnxScInitiativesFor(subset, label);
  [['rnx-sc-driver','By Driver','driver'],['rnx-sc-theme','By Theme','theme'],['rnx-sc-team','By Team','team']].forEach(function(t) {
    var el = document.getElementById(t[0]);
    if (el) el.outerHTML = rnxScGroupedFor(t[0], t[1], t[2], subset, label);
  });
}

// ── Filter bar ─────────────────────────────────────────────────────────────

function rnxFilterOptions(key) {
  var v = [];
  rnxInitiatives.forEach(function(i) { if (i[key] && v.indexOf(i[key]) === -1) v.push(i[key]); });
  v.sort();
  return v.map(function(x) { return '<option value="' + x + '">' + x + '</option>'; }).join('');
}

function rnxFilterBar(sfx) {
  sfx = sfx || '';
  var ds = rnxDeliveryOpts.map(function(o) { return '<option value="' + o.val + '">' + o.label + '</option>'; }).join('');
  return '<div class="filterbar">'
    + '<select id="rnxf-driver'  + sfx + '" data-rnxfilter="' + sfx + '"><option value="">All Drivers</option>'        + rnxFilterOptions('driver')       + '</select>'
    + '<select id="rnxf-team'    + sfx + '" data-rnxfilter="' + sfx + '"><option value="">All Teams</option>'          + rnxFilterOptions('team')         + '</select>'
    + '<select id="rnxf-theme'   + sfx + '" data-rnxfilter="' + sfx + '"><option value="">All Themes</option>'         + rnxFilterOptions('theme')        + '</select>'
    + '<select id="rnxf-po'      + sfx + '" data-rnxfilter="' + sfx + '"><option value="">All Product Owners</option>' + rnxFilterOptions('productOwner') + '</select>'
    + '<select id="rnxf-tl'      + sfx + '" data-rnxfilter="' + sfx + '"><option value="">All Tech Leads</option>'     + rnxFilterOptions('techLead')     + '</select>'
    + '<select id="rnxf-status'  + sfx + '" data-rnxfilter="' + sfx + '"><option value="">All Statuses</option>'       + ds                               + '</select>'
    + '<button class="filter-reset" data-rnxreset="' + sfx + '">Reset</button></div>';
}

function rnxApplyTableFilters() {
  var fd = document.getElementById('rnxf-driver'), ft = document.getElementById('rnxf-team'),
      fth = document.getElementById('rnxf-theme'), fpo = document.getElementById('rnxf-po'),
      ftl = document.getElementById('rnxf-tl'),   fs = document.getElementById('rnxf-status');
  document.querySelectorAll('#rnx-table-body tr').forEach(function(row) {
    var id = parseInt(row.dataset.id);
    var i = rnxInitiatives.filter(function(x) { return x.id === id; })[0];
    if (!i) { row.style.display = 'none'; return; }
    row.style.display =
      (!fd  || !fd.value  || i.driver       === fd.value)  &&
      (!ft  || !ft.value  || i.team         === ft.value)  &&
      (!fth || !fth.value || i.theme        === fth.value) &&
      (!fpo || !fpo.value || i.productOwner === fpo.value) &&
      (!ftl || !ftl.value || i.techLead     === ftl.value) &&
      (!fs  || !fs.value  || i.deliveryStatus === fs.value) ? '' : 'none';
  });
}

function rnxApplyKanbanFilters() {
  var fd = document.getElementById('rnxf-driverq'), ft = document.getElementById('rnxf-teamq'),
      fth = document.getElementById('rnxf-themeq'), fpo = document.getElementById('rnxf-poq'),
      ftl = document.getElementById('rnxf-tlq'),    fs = document.getElementById('rnxf-statusq');
  document.querySelectorAll('#rnx-kanban .kancard').forEach(function(card) {
    var id = parseInt(card.dataset.id);
    var i = rnxInitiatives.filter(function(x) { return x.id === id; })[0];
    if (!i) { card.style.display = 'none'; return; }
    card.style.display =
      (!fd  || !fd.value  || i.driver       === fd.value)  &&
      (!ft  || !ft.value  || i.team         === ft.value)  &&
      (!fth || !fth.value || i.theme        === fth.value) &&
      (!fpo || !fpo.value || i.productOwner === fpo.value) &&
      (!ftl || !ftl.value || i.techLead     === ftl.value) &&
      (!fs  || !fs.value  || i.deliveryStatus === fs.value) ? '' : 'none';
  });
}

// ── Quarter filter pill row ────────────────────────────────────────────────

function rnxQFilter(prefix, fn) {
  var cq = rnxCurrentQ();
  var opts = RNX_QUARTERS.concat(['all']);
  if (prefix === 'rnx-roi') opts.push('backlog');
  return '<div class="qfilter">' + opts.map(function(q) {
    var lbl = q === 'all' ? 'All' : q === 'backlog' ? 'Backlog' : q;
    return '<button id="' + prefix + '-btn-' + q + '" class="qfilter-btn' + (q === cq ? ' act' : '') + '"'
      + ' data-rnxqfn="' + fn + '" data-q="' + q + '">' + lbl + '</button>';
  }).join('') + '</div>';
}

function rnxSetQAct(prefix, q) {
  var opts = RNX_QUARTERS.concat(['all']);
  if (prefix === 'rnx-roi') opts.push('backlog');
  opts.forEach(function(b) {
    var el = document.getElementById(prefix + '-btn-' + b);
    if (el) el.classList.toggle('act', b === q);
  });
}

// ── Table view ─────────────────────────────────────────────────────────────

// ── Inline-editing styles (injected once) ─────────────────────────────────
(function() {
  if (document.getElementById('rnx-inline-css')) return;
  var s = document.createElement('style');
  s.id = 'rnx-inline-css';
  s.textContent =
    // Ghost text input
    '.rnx-ii{border:1px solid transparent;background:transparent;border-radius:4px;padding:2px 5px;font-family:inherit;font-size:11px;color:var(--text);outline:none;width:100%;box-sizing:border-box;transition:border-color .12s,background .12s}' +
    '.rnx-ii:hover{border-color:var(--border-md);background:var(--bg)}' +
    '.rnx-ii:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(237,0,94,.08)}' +
    // Styled native select (no OS chrome)
    '.rnx-is{border:1px solid transparent;background:transparent;border-radius:4px;padding:2px 20px 2px 5px;font-family:inherit;font-size:11px;color:var(--text);outline:none;width:100%;box-sizing:border-box;cursor:pointer;transition:border-color .12s,background .12s;appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg width=\'10\' height=\'6\' viewBox=\'0 0 10 6\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1l4 4 4-4\' stroke=\'%238E8E93\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 6px center}' +
    '.rnx-is:hover{border-color:var(--border-md);background-color:var(--bg)}' +
    '.rnx-is:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(237,0,94,.08);background-color:var(--bg)}' +
    // Avatar dropdown
    '.rnx-av-wrap{position:relative}' +
    '.rnx-av-btn{display:flex;align-items:center;gap:4px;border:1px solid transparent;background:transparent;border-radius:4px;padding:2px 20px 2px 4px;font-family:inherit;font-size:11px;color:var(--text);cursor:pointer;width:100%;text-align:left;transition:border-color .12s,background .12s;position:relative;min-height:22px}' +
    '.rnx-av-btn:hover{border-color:var(--border-md);background:var(--bg)}' +
    '.rnx-av-chev{position:absolute;right:5px;top:50%;transform:translateY(-50%);pointer-events:none;flex-shrink:0}' +
    '.rnx-av-panel{display:none;position:fixed;z-index:9000;min-width:150px;background:var(--surface);border:1px solid var(--border-md);border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,.12);padding:4px;overflow-y:auto}' +
    '.rnx-av-opt{display:flex;align-items:center;gap:6px;padding:5px 7px;border-radius:5px;cursor:pointer;font-size:11px;color:var(--text)}' +
    '.rnx-av-opt:hover{background:var(--bg)}' +
    '.rnx-av-opt.sel{background:var(--subtle);font-weight:500}' +
    '.rnx-av-avatar{width:18px;height:18px;border-radius:50%;object-fit:cover;flex-shrink:0}' +
    '.rnx-av-noavatar{width:18px;height:18px;border-radius:50%;background:var(--subtle);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;color:var(--muted)}' +
    // Title cell with link icon
    '.rnx-title-cell{position:relative;padding-right:26px!important}' +
    '.rnx-link-btn{position:absolute;right:3px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:3px;border-radius:4px;opacity:0;transition:opacity .15s,color .15s;color:var(--muted);line-height:0}' +
    '.rnx-link-btn.has-link{opacity:1;color:var(--accent)}' +
    '.rnx-title-cell:hover .rnx-link-btn{opacity:1}' +
    // ROI CTA
    '.rnx-roi-cta{background:none;border:1px dashed var(--border-md);border-radius:6px;padding:3px 8px;font-size:11px;font-weight:500;color:var(--accent);cursor:pointer;white-space:nowrap;transition:background .12s}' +
    '.rnx-roi-cta:hover{background:rgba(237,0,94,.06)}' +
    // Tighter table cells (scoped to roadmap table only)
    '.rnx-table td{padding:7px 10px;font-size:11px}' +
    '.rnx-table th{padding:7px 10px;font-size:10px}';
  document.head.appendChild(s);

  // Close avatar panels on outside click (registered once)
  document.addEventListener('click', function(e) {
    if (!e.target.closest || !e.target.closest('.rnx-av-wrap')) {
      document.querySelectorAll('.rnx-av-panel').forEach(function(p) { p.style.display = 'none'; });
    }
  }, true);
})();

var _RNX_CHEV = '<svg class="rnx-av-chev" width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="#8E8E93" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function rnxAvatarSel(fid, members, val, iid) {
  // members: array of {name, pictureUrl}
  var cur = members.filter(function(m) { return m.name === val; })[0];

  function avEl(m, size) {
    size = size || 18;
    if (m && m.pictureUrl) {
      return '<img src="' + m.pictureUrl + '" class="rnx-av-avatar" style="width:' + size + 'px;height:' + size + 'px">';
    }
    var initials = m && m.name ? m.name.charAt(0).toUpperCase() : '?';
    return '<div class="rnx-av-noavatar" style="width:' + size + 'px;height:' + size + 'px">' + initials + '</div>';
  }

  // Button label
  var btnLabel;
  if (val) {
    btnLabel = (cur ? avEl(cur, 16) : '') + '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + val + '</span>';
  } else {
    btnLabel = '<span style="color:var(--faint)">—</span>';
  }

  // Options
  var optsHtml = '<div class="rnx-av-opt" data-val="" onclick="rnxAvSel(this,\'' + iid + '\',\'' + fid + '\')">'
    + '<div class="rnx-av-noavatar">—</div><span>—</span></div>';

  // Orphan value (not in members list)
  if (val && !cur) {
    optsHtml += '<div class="rnx-av-opt sel" data-val="' + val.replace(/'/g,'&#39;').replace(/"/g,'&quot;') + '" onclick="rnxAvSel(this,\'' + iid + '\',\'' + fid + '\')">'
      + '<div class="rnx-av-noavatar">' + val.charAt(0).toUpperCase() + '</div>'
      + '<span>' + val + '</span></div>';
  }

  members.forEach(function(m) {
    var isSel = m.name === val;
    optsHtml += '<div class="rnx-av-opt' + (isSel ? ' sel' : '') + '" data-val="' + m.name.replace(/'/g,'&#39;').replace(/"/g,'&quot;') + '" onclick="rnxAvSel(this,\'' + iid + '\',\'' + fid + '\')">'
      + avEl(m, 18) + '<span>' + m.name + '</span></div>';
  });

  return '<div class="rnx-av-wrap" data-fid="' + fid + '">'
    + '<input type="hidden" id="' + fid + '" value="' + (val || '').replace(/"/g,'&quot;') + '">'
    + '<button type="button" class="rnx-av-btn" onclick="event.stopPropagation();rnxAvToggle(this.parentElement)">'
    +   btnLabel + _RNX_CHEV
    + '</button>'
    + '<div class="rnx-av-panel" id="rnx-ap-' + fid + '">' + optsHtml + '</div>'
    + '</div>';
}

function rnxAvToggle(wrap) {
  var fid   = wrap.dataset.fid;
  var panel = (fid && document.getElementById('rnx-ap-' + fid)) || wrap.querySelector('.rnx-av-panel');
  var btn   = wrap.querySelector('.rnx-av-btn');
  var isOpen = panel.style.display === 'block';
  // Close all panels
  document.querySelectorAll('.rnx-av-panel').forEach(function(p) { p.style.display = 'none'; });
  if (!isOpen) {
    // Move to body so it escapes overflow:hidden / CSS-transform stacking contexts
    if (panel.parentElement !== document.body) document.body.appendChild(panel);
    var rect = btn ? btn.getBoundingClientRect() : wrap.getBoundingClientRect();
    // Render off-screen to measure natural height before choosing direction
    panel.style.maxHeight = '';
    panel.style.top  = '-9999px';
    panel.style.left = rect.left + 'px';
    panel.style.minWidth = rect.width + 'px';
    panel.style.display = 'block';
    var naturalH   = Math.min(panel.scrollHeight + 2, 280);
    var spaceBelow = window.innerHeight - rect.bottom - 8;
    var spaceAbove = rect.top - 8;
    if (spaceBelow >= naturalH || spaceBelow >= spaceAbove) {
      panel.style.top       = (rect.bottom + 4) + 'px';
      panel.style.maxHeight = Math.max(100, spaceBelow) + 'px';
    } else {
      var h = Math.min(naturalH, spaceAbove);
      panel.style.maxHeight = Math.max(100, h) + 'px';
      panel.style.top       = (rect.top - 4 - Math.min(naturalH, spaceAbove)) + 'px';
    }
  }
}

function rnxAvSel(opt, iid, fid) {
  var val = opt.dataset.val;

  // Update hidden input
  var inp = document.getElementById(fid);
  if (inp) inp.value = val;

  // Find wrap via data-fid (panel may have been moved to body, so closest() won't work)
  var wrap = document.querySelector('.rnx-av-wrap[data-fid="' + fid + '"]');
  var btn  = wrap ? wrap.querySelector('.rnx-av-btn') : null;
  if (btn) {
    var img    = opt.querySelector('img');
    var nameEl = opt.querySelector('span');
    if (val) {
      btn.innerHTML = (img ? '<img src="' + img.src + '" class="rnx-av-avatar" style="width:16px;height:16px"> ' : '')
        + '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (nameEl ? nameEl.textContent : val) + '</span>'
        + _RNX_CHEV;
    } else {
      btn.innerHTML = '<span style="color:var(--faint)">—</span>' + _RNX_CHEV;
    }
  }

  // Mark selected in panel (panel is in body after first open)
  var panel = document.getElementById('rnx-ap-' + fid);
  if (panel) {
    panel.querySelectorAll('.rnx-av-opt').forEach(function(o) { o.classList.toggle('sel', o === opt); });
    panel.style.display = 'none';
  }

  // Save
  var id = parseInt(iid);
  if (id) rnxSaveInline(id);
}

// ── Generic custom dropdown (chips, plain, etc.) ──────────────────────────
// items: [{val, label, html}]  — html is rendered in both button and option list

function rnxCustomSel(fid, items, val, iid) {
  var curItem = items.filter(function(x) { return x.val === val; })[0];
  // Orphan value not in list
  if (val && !curItem) {
    curItem = { val: val, label: val, html: '<span style="font-size:11px">' + val + '</span>' };
  }
  var btnInner = curItem ? curItem.html : '<span style="color:var(--faint)">—</span>';

  var optsHtml = '<div class="rnx-av-opt" data-val="" onclick="rnxCustomSelOpt(this)">'
    + '<span style="color:var(--faint);font-size:11px">—</span></div>';
  items.forEach(function(item) {
    optsHtml += '<div class="rnx-av-opt' + (item.val === val ? ' sel' : '') + '"'
      + ' data-val="' + item.val.replace(/"/g,'&quot;') + '" onclick="rnxCustomSelOpt(this)">'
      + item.html + '</div>';
  });

  return '<div class="rnx-av-wrap" data-fid="' + fid + '" data-iid="' + iid + '">'
    + '<input type="hidden" id="' + fid + '" value="' + (val || '').replace(/"/g,'&quot;') + '">'
    + '<button type="button" class="rnx-av-btn" onclick="event.stopPropagation();rnxAvToggle(this.parentElement)">'
    +   btnInner + _RNX_CHEV
    + '</button>'
    + '<div class="rnx-av-panel" id="rnx-ap-' + fid + '">' + optsHtml + '</div>'
    + '</div>';
}

function rnxCustomSelOpt(opt) {
  // Panel has been moved to body — can't use closest('.rnx-av-wrap')
  var panel = opt.closest('.rnx-av-panel');
  if (!panel) return;
  var fid = panel.id.replace('rnx-ap-', '');
  var wrap = document.querySelector('.rnx-av-wrap[data-fid="' + fid + '"]');
  var iid  = wrap ? parseInt(wrap.dataset.iid) : 0;
  var val  = opt.dataset.val;

  // Update hidden input
  var inp = document.getElementById(fid);
  if (inp) inp.value = val;

  // Update button — reuse option's innerHTML as button content
  var btn = wrap ? wrap.querySelector('.rnx-av-btn') : null;
  if (btn) {
    btn.innerHTML = (val ? opt.innerHTML : '<span style="color:var(--faint)">—</span>') + _RNX_CHEV;
  }

  // Mark selected in panel (panel is in body)
  panel.querySelectorAll('.rnx-av-opt').forEach(function(o) { o.classList.toggle('sel', o === opt); });

  // Close
  panel.style.display = 'none';

  // Save
  if (iid) rnxSaveInline(iid);
}

function rnxTableRows(subset) {
  var poMbrs = rnxRefData.members.filter(function(m) { return m.role === 'Product'; });
  var tlMbrs = rnxRefData.members.filter(function(m) { return m.role === 'Tech'; });

  // Build item lists for each custom select type
  var qItems = RNX_QUARTERS.concat(['Backlog']).map(function(q) {
    return { val: q, label: q, html: '<span style="font-size:11px">' + q + '</span>' };
  });
  var tItems = rnxRefData.teams.map(function(t) {
    return { val: t.name, label: t.name, html: '<span style="font-size:11px">' + t.name + '</span>' };
  });
  var thItems = rnxRefData.themes.map(function(t) {
    return { val: t.name, label: t.name, html: '<span style="font-size:11px">' + t.name + '</span>' };
  });
  var dItems = rnxRefData.drivers.map(function(d) {
    var c = rnxDriverColors[d.name] || '#8E8E93';
    return { val: d.name, label: d.name,
      html: '<span class="badge" style="background:' + c + '18;color:' + c + ';font-size:11px">' + d.name + '</span>' };
  });
  var dsItems = rnxDeliveryOpts.map(function(o) {
    return { val: o.val, label: o.label,
      html: '<span class="pill ds-pill ' + o.cls + '" style="pointer-events:none">' + o.label + '</span>' };
  });

  function iinp(fid, val, id) {
    return '<input type="text" id="' + fid + '" value="' + (val||'').replace(/"/g,'&quot;') + '" class="rnx-ii" onblur="rnxSaveInline(' + id + ')" />';
  }

  var linkSvg = '<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M6.5 9.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5L7.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M9.5 6.5a3.5 3.5 0 00-5 0l-2 2a3.5 3.5 0 005 5l1-1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

  return subset.map(function(i) {
    var roiCell = (i.roi != null && String(i.roi) !== '')
      ? rnxRoiHtml(i.roi)
      : '<button class="rnx-roi-cta" onclick="rnxOpenRoiCalc(' + i.id + ')">Calculate est. ROI</button>';

    var linkBtn = '<button class="rnx-link-btn' + (i.link ? ' has-link' : '') + '" onclick="rnxOpenLinkModal(' + i.id + ')" title="' + (i.link ? 'Edit link' : 'Add link') + '">' + linkSvg + '</button>';

    return '<tr data-id="' + i.id + '">'
      + '<td style="min-width:80px">'   + rnxCustomSel('rnx-t-q-'  + i.id, qItems,  i.quarter,         i.id) + '</td>'
      + '<td style="min-width:280px" class="rnx-title-cell">' + iinp('rnx-t-ttl-' + i.id, i.title, i.id) + linkBtn + '</td>'
      + '<td style="min-width:150px">'  + rnxCustomSel('rnx-t-drv-' + i.id, dItems,  i.driver,          i.id) + '</td>'
      + '<td style="min-width:120px">'  + rnxCustomSel('rnx-t-tm-'  + i.id, tItems,  i.team,            i.id) + '</td>'
      + '<td style="min-width:140px">'  + rnxAvatarSel('rnx-t-po-'  + i.id, poMbrs,  i.productOwner,    i.id) + '</td>'
      + '<td style="min-width:140px">'  + rnxAvatarSel('rnx-t-tl-'  + i.id, tlMbrs,  i.techLead,        i.id) + '</td>'
      + '<td style="min-width:120px">'  + rnxCustomSel('rnx-t-th-'  + i.id, thItems, i.theme,           i.id) + '</td>'
      + '<td style="white-space:nowrap">' + roiCell + '</td>'
      + '<td style="min-width:130px">'  + rnxCustomSel('rnx-t-ds-'  + i.id, dsItems, i.deliveryStatus || 'not-started', i.id) + '</td>'
      + '<td style="white-space:nowrap">'
      +   '<button class="rnx-del-btn" data-rnxdel="' + i.id + '" title="Delete" style="background:none;border:none;cursor:pointer;padding:4px 6px;color:var(--muted);border-radius:4px">'
      +     '<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M6 4V3h4v1M5 4v8a1 1 0 001 1h4a1 1 0 001-1V4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      +   '</button>'
      + '</td>'
      + '</tr>';
  }).join('');
}

function rnxSaveInline(id) {
  var i = rnxInitiatives.filter(function(x) { return x.id === id; })[0];
  if (!i) return;
  function g(eid) { var el = document.getElementById(eid); return el ? el.value : null; }
  var title = g('rnx-t-ttl-' + id);
  if (title !== null && !title.trim()) return;
  var updated = {
    title:          title !== null ? title.trim() : i.title,
    quarter:        g('rnx-t-q-'   + id) || i.quarter,
    driver:         g('rnx-t-drv-' + id) !== null ? g('rnx-t-drv-' + id) : i.driver,
    team:           g('rnx-t-tm-'  + id) !== null ? g('rnx-t-tm-'  + id) : i.team,
    productOwner:   g('rnx-t-po-'  + id) !== null ? g('rnx-t-po-'  + id) : i.productOwner,
    techLead:       g('rnx-t-tl-'  + id) !== null ? g('rnx-t-tl-'  + id) : i.techLead,
    theme:          g('rnx-t-th-'  + id) !== null ? g('rnx-t-th-'  + id) : i.theme,
    deliveryStatus: g('rnx-t-ds-'  + id) || i.deliveryStatus,
  };
  Object.assign(i, updated);
  fetch('/api/neon/initiatives', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.assign({}, i, updated))
  })
  .then(function(r) { return r.json(); })
  .then(function(res) { if (!res.ok) console.error('rnxSaveInline:', res.error); })
  .catch(function(e) { console.error('rnxSaveInline:', e.message); });
}

// ── Link modal ────────────────────────────────────────────────────────────

function rnxOpenLinkModal(id) {
  var i = rnxInitiatives.filter(function(x) { return x.id === id; })[0];
  if (!i) return;

  var existing = document.getElementById('rnx-link-modal');
  if (existing) existing.remove();

  var IF = 'width:100%;box-sizing:border-box;padding:7px 10px;font-size:13px;border:1px solid var(--border-md);border-radius:6px;background:var(--surface);color:var(--text);outline:none';

  var visitBtn = i.link
    ? '<a href="' + i.link.replace(/"/g,'&quot;') + '" target="_blank" rel="noopener noreferrer"'
    +  ' style="padding:7px 14px;font-size:13px;border:1px solid var(--border-md);border-radius:6px;background:var(--surface);color:var(--text);cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:5px">'
    +  '<svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M6 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-3M10 2h4m0 0v4m0-4L8 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +  'Visit</a>'
    : '';

  var overlay = document.createElement('div');
  overlay.id = 'rnx-link-modal';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:2000;display:flex;align-items:center;justify-content:center;padding:40px 16px';

  overlay.innerHTML = '<div style="background:var(--surface);border:1px solid var(--border-md);border-radius:10px;width:100%;max-width:420px;box-shadow:0 8px 40px rgba(0,0,0,.18);padding:22px">'
    + '<div style="font-size:14px;font-weight:600;color:var(--text);margin-bottom:6px">Initiative Link</div>'
    + '<div style="font-size:12px;color:var(--muted);margin-bottom:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + i.title + '</div>'
    + '<input type="url" id="rnx-link-input-' + id + '" value="' + (i.link || '').replace(/"/g,'&quot;') + '"'
    + ' placeholder="https://..." style="' + IF + ';margin-bottom:14px"'
    + ' onkeydown="if(event.key===\'Enter\')rnxSaveLinkModal(' + id + ')" />'
    + '<div style="display:flex;justify-content:flex-end;gap:8px;align-items:center">'
    + visitBtn
    + '<button onclick="rnxSaveLinkModal(' + id + ')" style="padding:7px 18px;font-size:13px;border:none;border-radius:6px;background:var(--accent);color:#fff;cursor:pointer;font-weight:500">Save</button>'
    + '<button onclick="document.getElementById(\'rnx-link-modal\').remove()" style="padding:7px 14px;font-size:13px;border:1px solid var(--border-md);border-radius:6px;background:var(--surface);color:var(--text);cursor:pointer">Cancel</button>'
    + '</div>'
    + '</div>';

  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  setTimeout(function() {
    var inp = document.getElementById('rnx-link-input-' + id);
    if (inp) { inp.focus(); inp.select(); }
  }, 50);
}

function rnxSaveLinkModal(id) {
  var inp = document.getElementById('rnx-link-input-' + id);
  if (!inp) return;
  var link = inp.value.trim();
  var i = rnxInitiatives.filter(function(x) { return x.id === id; })[0];
  if (!i) return;
  i.link = link;
  fetch('/api/neon/initiatives', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.assign({}, i))
  })
  .then(function(r) { return r.json(); })
  .then(function(res) {
    if (!res.ok) throw new Error(res.error || 'Save failed');
    // Update link icon in the row
    var btn = document.querySelector('#rnx-table-body tr[data-id="' + id + '"] .rnx-link-btn');
    if (btn) {
      btn.classList.toggle('has-link', !!link);
      btn.title = link ? 'Edit link' : 'Add link';
    }
    var modal = document.getElementById('rnx-link-modal');
    if (modal) modal.remove();
  })
  .catch(function(e) { alert('Save failed: ' + e.message); });
}

// ── ROI Calculator modal ───────────────────────────────────────────────────

function rnxOpenRoiCalc(id) {
  var i = rnxInitiatives.filter(function(x) { return x.id === id; })[0];
  if (!i) return;

  // Find template slug from driver
  var driverObj = rnxRefData.drivers.filter(function(d) { return d.name === i.driver; })[0];
  var slug = driverObj && driverObj.templateSlug ? driverObj.templateSlug : '';
  var tpl  = slug ? roiGetTemplate(slug) : null;

  // Remove any existing modal
  var existing = document.getElementById('rnx-roi-modal');
  if (existing) existing.remove();

  var IF = 'width:100%;box-sizing:border-box;padding:7px 10px;font-size:13px;border:1px solid var(--border-md);border-radius:6px;background:var(--surface);color:var(--text);outline:none';
  var LB = 'display:block;font-size:11px;font-weight:500;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px';

  // Build inputs
  var inputsHtml = '';
  if (tpl) {
    tpl.inputs.forEach(function(inp) {
      var suffix = inp.unit === 'percent' ? ' (%)' : inp.unit === 'dollar' ? ' ($)' : '';
      inputsHtml += '<div style="margin-bottom:12px">'
        + '<label style="' + LB + '">' + inp.label + suffix + '</label>'
        + '<input type="number" id="rnx-rcalc-' + inp.key + '" placeholder="' + (inp.placeholder || '') + '"'
        + ' style="' + IF + '" />'
        + (inp.helper ? '<div style="font-size:11px;color:var(--faint);margin-top:3px">' + inp.helper + '</div>' : '')
        + '</div>';
    });
  } else {
    // Manual fallback
    inputsHtml = '<div style="margin-bottom:12px">'
      + '<label style="' + LB + '">ROI (decimal — e.g. 0.15 = 15%)</label>'
      + '<input type="number" id="rnx-rcalc-manual-roi" step="0.01" placeholder="0.15" style="' + IF + '" />'
      + '</div>'
      + '<div style="margin-bottom:12px">'
      + '<label style="' + LB + '">Added Value ($)</label>'
      + '<input type="number" id="rnx-rcalc-manual-av" placeholder="100000" style="' + IF + '" />'
      + '</div>';
  }

  var titleStr = tpl ? tpl.label + ' — ROI Calculator' : 'ROI Calculator';
  var descStr  = tpl ? tpl.description
    : (i.driver ? 'No ROI template is configured for the "' + i.driver + '" driver. Enter values manually.'
                : 'No driver assigned to this initiative. Enter values manually.');

  var idEsc   = String(id);
  var slugEsc = slug ? "'" + slug + "'" : 'null';

  var overlay = document.createElement('div');
  overlay.id = 'rnx-roi-modal';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:2000;display:flex;align-items:flex-start;justify-content:center;padding:40px 16px;overflow-y:auto';

  overlay.innerHTML = ''
    + '<div style="background:var(--surface);border:1px solid var(--border-md);border-radius:12px;width:100%;max-width:500px;box-shadow:0 8px 40px rgba(0,0,0,.18);padding:28px 28px 20px">'
    +   '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">'
    +     '<div style="font-size:15px;font-weight:600;color:var(--text)">' + titleStr + '</div>'
    +     '<button onclick="document.getElementById(\'rnx-roi-modal\').remove()" style="background:none;border:none;cursor:pointer;color:var(--muted);padding:4px">'
    +       '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    +     '</button>'
    +   '</div>'
    +   '<div style="font-size:12px;color:var(--muted);margin-bottom:16px">' + descStr + '</div>'
    +   '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:14px;padding:8px 10px;background:var(--bg);border-radius:6px;border:1px solid var(--border)">' + i.title + '</div>'
    +   inputsHtml
    +   '<div id="rnx-roi-breakdown-' + idEsc + '" style="display:none;margin:10px 0 18px;padding:14px;background:var(--bg);border:1px solid var(--border);border-radius:8px"></div>'
    +   '<div style="display:flex;justify-content:flex-end;gap:10px;padding-top:12px;border-top:1px solid var(--border)">'
    +     (tpl ? '<button onclick="rnxCalcRoi(' + idEsc + ',' + slugEsc + ')" style="padding:7px 16px;font-size:13px;border:1px solid var(--border-md);border-radius:6px;background:var(--surface);color:var(--text);cursor:pointer">Calculate</button>' : '')
    +     '<button onclick="rnxApplyRoi(' + idEsc + ',' + slugEsc + ')" style="padding:7px 18px;font-size:13px;border:none;border-radius:6px;background:var(--accent);color:#fff;cursor:pointer;font-weight:500">Apply</button>'
    +     '<button onclick="document.getElementById(\'rnx-roi-modal\').remove()" style="padding:7px 16px;font-size:13px;border:1px solid var(--border-md);border-radius:6px;background:var(--surface);color:var(--text);cursor:pointer">Cancel</button>'
    +   '</div>'
    + '</div>';

  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
}

function rnxCalcRoi(id, slug) {
  var tpl = roiGetTemplate(slug);
  if (!tpl) return;
  var values = {};
  tpl.inputs.forEach(function(inp) {
    var el = document.getElementById('rnx-rcalc-' + inp.key);
    values[inp.key] = el ? (parseFloat(el.value) || 0) : 0;
  });
  var result = roiCalculate(slug, values);
  if (!result) return;

  var bd = document.getElementById('rnx-roi-breakdown-' + id);
  if (!bd) return;

  var pct = Math.round(result.roi * 100);
  var c   = pct < 0 ? '#E5243B' : '#2EAD4B';

  function fmtVal(row) {
    var n = parseFloat(row.value);
    if (row.unit === 'dollar')   return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    if (row.unit === 'percent')  return n.toFixed(1) + '%';
    if (row.unit === 'months')   return n + ' mo';
    if (row.unit === 'users')    return n.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' users';
    return row.value;
  }

  var rows = result.breakdown.map(function(row) {
    return '<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border);font-size:12px">'
      + '<span style="color:var(--muted)">' + row.label + '</span>'
      + '<span style="font-weight:500;color:var(--text)">' + fmtVal(row) + '</span>'
      + '</div>';
  }).join('');

  bd.style.display = 'block';
  bd.innerHTML = rows
    + '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:12px">'
    +   '<span style="font-size:13px;font-weight:600;color:var(--text)">Estimated ROI</span>'
    +   '<span style="font-size:18px;font-weight:700;color:' + c + '">' + pct + '%</span>'
    + '</div>';

  // Store for Apply
  bd.dataset.roi = result.roi;
  bd.dataset.av  = result.addedValue;
}

function rnxApplyRoi(id, slug) {
  var roi, av;

  if (slug) {
    var bd = document.getElementById('rnx-roi-breakdown-' + id);
    if (!bd || bd.dataset.roi === undefined || bd.dataset.roi === '') {
      // Run calculate first
      rnxCalcRoi(id, slug);
      bd = document.getElementById('rnx-roi-breakdown-' + id);
    }
    if (!bd || bd.dataset.roi === undefined || bd.dataset.roi === '') {
      alert('Please click Calculate first.');
      return;
    }
    roi = parseFloat(bd.dataset.roi);
    av  = parseFloat(bd.dataset.av);
  } else {
    // Manual
    var roiEl = document.getElementById('rnx-rcalc-manual-roi');
    var avEl  = document.getElementById('rnx-rcalc-manual-av');
    roi = roiEl ? parseFloat(roiEl.value) : NaN;
    av  = avEl  ? parseFloat(avEl.value)  : NaN;
    if (isNaN(roi)) { alert('Please enter an ROI value.'); return; }
  }

  var i = rnxInitiatives.filter(function(x) { return x.id === id; })[0];
  if (!i) return;

  var patch = { roi: roi };
  if (!isNaN(av)) patch.addedValue = av;
  Object.assign(i, patch);

  fetch('/api/neon/initiatives', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.assign({}, i))
  })
  .then(function(r) { return r.json(); })
  .then(function(res) {
    if (!res.ok) throw new Error(res.error || 'Save failed');
    // Update ROI cell in DOM (column index 7: Q|Title|Driver|Team|PO|TL|Theme|ROI|Status|Del)
    var row = document.querySelector('#rnx-table-body tr[data-id="' + id + '"]');
    if (row) {
      var cells = row.querySelectorAll('td');
      if (cells[7]) cells[7].innerHTML = rnxRoiHtml(roi);
    }
    var modal = document.getElementById('rnx-roi-modal');
    if (modal) modal.remove();
  })
  .catch(function(e) { alert('Save failed: ' + e.message); });
}

function rnxSwitchTableQuarter(q) {
  var label  = q === 'all' ? 'All Year' : q;
  var subset = q === 'all' ? rnxInitiatives : rnxInitiatives.filter(function(i) { return i.quarter === q; });
  var tbody = document.getElementById('rnx-table-body');
  if (tbody) tbody.innerHTML = rnxTableRows(subset);
  rnxRefreshCards(subset, label);
  rnxSetQAct('rnx-tbl', q);
}

// ── Kanban ─────────────────────────────────────────────────────────────────

function rnxLeadAv(name) {
  if (!name) return '';
  var m = rnxRefData.members.filter(function(x) { return x.name === name; })[0];
  if (m && m.pictureUrl) {
    return '<img src="' + m.pictureUrl + '" style="width:16px;height:16px;border-radius:50%;object-fit:cover;flex-shrink:0;margin-right:4px;vertical-align:middle">';
  }
  return '<span style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;background:var(--subtle);font-size:8px;font-weight:600;color:var(--muted);flex-shrink:0;margin-right:4px;vertical-align:middle">' + name.charAt(0).toUpperCase() + '</span>';
}

function rnxKanbanHtml() {
  var quarters = RNX_QUARTERS.concat(['Backlog']);
  return quarters.map(function(q) {
    var items = rnxInitiatives.filter(function(i) { return i.quarter === q; });
    var cards = items.map(function(i) {
      var opt = rnxDeliveryOpts.filter(function(o) { return o.val === i.deliveryStatus; })[0] || rnxDeliveryOpts[0];
      return '<div class="kancard" data-id="' + i.id + '">'
        + '<div><span class="kancard-title">' + i.title + '</span>'
        + '<div class="kancard-tags">' + (i.theme || '') + (i.theme && i.team ? ' · ' : '') + (i.team || '') + '</div></div>'
        + '<div class="kancard-leads">'
        +   '<span class="kancard-lead-item">' + rnxLeadAv(i.productOwner) + '<span class="kancard-lead-label">PO</span> ' + (i.productOwner || '—') + '</span>'
        +   '<span class="kancard-lead-item">' + rnxLeadAv(i.techLead)     + '<span class="kancard-lead-label">TL</span> ' + (i.techLead    || '—') + '</span>'
        + '</div>'
        + '<div class="kancard-driver"><span class="kancard-lead-label">Driver</span> ' + (i.driver || '—') + '</div>'
        + '<div class="kancard-footer">'
        +   '<div data-rnx-ds-id="' + i.id + '">'
        +     '<span class="pill ds-pill ' + opt.cls + '">' + opt.label + '</span>'
        +   '</div>'
        +   '<div style="display:flex;gap:4px;align-items:center">'
        +     '<span style="font-size:11px;font-weight:500">' + rnxRoiHtml(i.roi) + '</span>'
        +     '<button class="rnx-edit-btn" data-rnxedit="' + i.id + '" title="Edit" style="background:none;border:none;cursor:pointer;padding:2px 4px;color:var(--muted);border-radius:4px">'
        +       '<svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M11.5 2.5l2 2-9 9H2.5v-2l9-9z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>'
        +     '</button>'
        +   '</div>'
        + '</div></div>';
    }).join('');
    return '<div class="kancol" data-kanq="' + q + '">'
      + '<div class="kancol-head"><span>' + q + '</span><span class="kancol-count">' + items.length + '</span></div>'
      + '<div class="kancol-body">'
      + (cards || '<div style="padding:8px;font-size:12px;color:var(--faint)">No initiatives</div>')
      + '</div></div>';
  }).join('');
}

function rnxSwitchKanbanQuarter(q) {
  document.querySelectorAll('#rnx-kanban .kancol').forEach(function(col) {
    var cq = col.dataset.kanq;
    col.style.display = (q === 'all' || cq === q) ? '' : 'none';
  });
  rnxSetQAct('rnx-kan', q);
}

// ── Quarterly progress bars ────────────────────────────────────────────────

function rnxQuarterlyBars() {
  var quarters = RNX_QUARTERS.concat(['Backlog']);
  return '<div class="qp-grid">' + quarters.map(function(q) {
    var items = rnxInitiatives.filter(function(i) { return i.quarter === q; });
    var total = items.length || 1;
    var ns = items.filter(function(i) { return i.deliveryStatus === 'not-started'; }).length;
    var on = items.filter(function(i) { return i.deliveryStatus === 'on-track';    }).length;
    var ar = items.filter(function(i) { return i.deliveryStatus === 'at-risk';     }).length;
    var dl = items.filter(function(i) { return i.deliveryStatus === 'delayed';     }).length;
    var avSum = 0;
    items.forEach(function(i) { var n = parseFloat(i.addedValue); if (!isNaN(n)) avSum += n; });
    var avLbl = avSum >= 1000000 ? '$' + (avSum/1000000).toFixed(1)+'M' : avSum >= 1000 ? '$'+(avSum/1000).toFixed(0)+'K' : avSum > 0 ? '$'+avSum.toFixed(0) : '—';
    var nsW = Math.round(ns/total*100), onW = Math.round(on/total*100), arW = Math.round(ar/total*100), dlW = Math.round(dl/total*100);
    var meta = (ns>0?ns+' not started · ':'')+(on>0?on+' on track · ':'')+(ar>0?ar+' at risk · ':'')+(dl>0?dl+' delayed':'');
    if (items.length===0) meta = 'No initiatives';
    var roiSum=0, roiCount=0;
    items.forEach(function(i) { var r=parseFloat(i.roi); if(!isNaN(r)){roiSum+=r;roiCount++;} });
    var roiPct = roiCount ? Math.round(roiSum/roiCount*100)+'%' : '—';
    return '<div class="qp-card">'
      + '<div class="qp-card-head"><span class="qp-card-q">' + q + '</span><span class="qp-card-count">' + items.length + '</span></div>'
      + '<div class="qp-card-bars"><div class="qp-bar-track">'
      + (nsW>0?'<div class="qp-bar-seg-gray"   style="flex:'+nsW+'"></div>':'')
      + (onW>0?'<div class="qp-bar-seg-green"  style="flex:'+onW+'"></div>':'')
      + (arW>0?'<div class="qp-bar-seg-yellow" style="flex:'+arW+'"></div>':'')
      + (dlW>0?'<div class="qp-bar-seg-red"    style="flex:'+dlW+'"></div>':'')
      + (items.length===0?'<div class="qp-bar-seg-empty" style="flex:1"></div>':'')
      + '</div><div class="qp-card-meta">'+meta+'</div></div>'
      + '<div class="qp-card-roi"><div class="qp-card-roi-label">Avg ROI</div><div class="qp-card-roi-val">'+roiPct+' <span class="qp-card-roi-sub">('+avLbl+')</span></div></div>'
      + '</div>';
  }).join('') + '</div>';
}

// ── Gantt ──────────────────────────────────────────────────────────────────

function rnxBuildGantt() {
  var cq = rnxCurrentQ();
  var gk = rnxGanttGroup;
  var statusColors = { 'on-track':'#2EAD4B','at-risk':'#E5A100','delayed':'#E5243B','not-started':'#8E8E93' };
  var statusLabels = { 'on-track':'On Track','at-risk':'At Risk','delayed':'Delayed','not-started':'Not Started' };

  var groups = {};
  rnxInitiatives.forEach(function(i) {
    if (i.quarter === 'Backlog') return;
    var g = gk === 'team' ? i.team : gk === 'theme' ? i.theme : i.driver;
    if (!g) g = 'Other';
    if (!groups[g]) groups[g] = [];
    groups[g].push(i);
  });
  var groupNames = Object.keys(groups); groupNames.sort();

  var toggle = '<div class="gantt-group-toggle">'
    + '<span class="gantt-group-label">Group by</span>'
    + ['driver','theme','team'].map(function(v) {
        var lbl = v === 'team' ? 'Team' : v === 'theme' ? 'Theme' : 'Driver';
        return '<button data-rnxganttgroup="' + v + '" class="gantt-group-btn' + (v === gk ? ' act' : '') + '">' + lbl + '</button>';
      }).join('')
    + '</div>';

  var legend = '<div class="gantt-legend">'
    + '<span class="gantt-legend-item"><span class="gantt-legend-dot" style="background:#2EAD4B"></span>On Track</span>'
    + '<span class="gantt-legend-item"><span class="gantt-legend-dot" style="background:#E5A100"></span>At Risk</span>'
    + '<span class="gantt-legend-item"><span class="gantt-legend-dot" style="background:#8E8E93"></span>Not Started</span>'
    + '<span class="gantt-legend-item"><span class="gantt-legend-dot" style="background:#E5243B"></span>Delayed</span>'
    + '</div>';

  var qHeaders = RNX_QUARTERS;
  var thead = '<thead><tr><th class="gantt-th-name"></th>'
    + qHeaders.map(function(q) {
        return '<th class="gantt-th' + (q === cq ? ' gantt-th-current' : '') + '">' + q + '</th>';
      }).join('')
    + '</tr></thead>';

  var subKeys   = { driver:['theme','team'],  theme:['driver','team'],  team:['driver','theme'] };
  var subLabels = { driver:['Theme','Team'],   theme:['Driver','Team'],  team:['Driver','Theme']  };
  var sk = subKeys[gk] || ['theme','team'], sl = subLabels[gk] || ['Theme','Team'];

  var barIdx = 0, rows = '';
  groupNames.forEach(function(gName) {
    rows += '<tr class="gantt-group-row"><td colspan="5">' + gName + '</td></tr>';
    groups[gName].forEach(function(i) {
      var c = statusColors[i.deliveryStatus] || '#8E8E93';
      var sLabel = statusLabels[i.deliveryStatus] || 'Not Started';
      var v1 = i[sk[0]] || '—', v2 = i[sk[1]] || '—';
      var nameCell = '<td class="gantt-name-cell">'
        + '<div class="gantt-name-title" title="' + i.title.replace(/"/g, '&quot;') + '">' + i.title + '</div>'
        + '<div class="gantt-name-meta">' + sl[0] + ': <span>' + v1 + '</span> · ' + sl[1] + ': <span>' + v2 + '</span></div></td>';

      var qCells = qHeaders.map(function(q) {
        var isCurrent = q === cq;
        if (i.quarter !== q) return '<td class="gantt-cell' + (isCurrent ? ' gantt-cell-current' : '') + '"></td>';
        var bid = 'rnxgbar-' + barIdx++;
        var roiF = rnxRoiHtml(i.roi).replace(/<[^>]+>/g, '') + '%'; // plain text for tooltip
        var avF  = rnxFmtDollar(i.addedValue);
        return '<td class="gantt-cell' + (isCurrent ? ' gantt-cell-current' : '') + '">'
          + '<div class="gantt-bar" id="' + bid + '" style="background:' + c + '"'
          + ' data-gtt="' + i.title.replace(/"/g,'&quot;') + '|' + (i.techLead||'') + '|' + (i.productOwner||'') + '|' + sLabel + '|' + (i.roi ? Math.round(parseFloat(i.roi)*100)+'%' : '—') + '|' + avF + '"></div></td>';
      }).join('');

      rows += '<tr>' + nameCell + qCells + '</tr>';
    });
  });

  return toggle + legend
    + '<div class="gantt-wrap">'
    + '<table class="gantt-table">' + thead + '<tbody>' + rows + '</tbody></table>'
    + '<div id="rnx-gantt-tooltip"></div>'
    + '</div>';
}

function rnxGanttTooltipInit() {
  var tooltip = document.getElementById('rnx-gantt-tooltip');
  if (!tooltip) return;
  document.querySelectorAll('#rnx-rt-gantt .gantt-bar').forEach(function(bar) {
    bar.addEventListener('mouseenter', function() {
      var d = bar.dataset.gtt; if (!d) return;
      var parts = d.split('|');
      tooltip.innerHTML = '<div class="gantt-tooltip-title">' + parts[0] + '</div>'
        + '<div class="gantt-tooltip-body">'
        + '<div><span class="gantt-tooltip-label">Eng Lead:</span> '  + (parts[1]||'—') + '</div>'
        + '<div><span class="gantt-tooltip-label">Prod Lead:</span> ' + (parts[2]||'—') + '</div>'
        + '<div><span class="gantt-tooltip-label">Status:</span> '    + (parts[3]||'—') + '</div>'
        + '<div><span class="gantt-tooltip-label">ROI:</span> '       + (parts[4]||'—') + '</div>'
        + '<div><span class="gantt-tooltip-label">Value:</span> '     + (parts[5]||'—') + '</div>'
        + '</div>';
      tooltip.style.display = 'block';
      var rect = bar.getBoundingClientRect();
      var wrap = bar.closest('.gantt-wrap');
      if (!wrap) return;
      var wrapRect = wrap.getBoundingClientRect();
      tooltip.style.left = (rect.left - wrapRect.left + rect.width/2 - 120) + 'px';
      tooltip.style.top  = (rect.top  - wrapRect.top  - tooltip.offsetHeight - 8) + 'px';
    });
    bar.addEventListener('mouseleave', function() { tooltip.style.display = 'none'; });
  });
}

// ── ROI chart ─────────────────────────────────────────────────────────────

function rnxRoiSubset(q) {
  if (q === 'all')     return rnxInitiatives.filter(function(i) { return i.quarter !== 'Backlog'; });
  if (q === 'backlog') return rnxInitiatives.filter(function(i) { return i.quarter === 'Backlog'; });
  return rnxInitiatives.filter(function(i) { return i.quarter === q; });
}

function rnxRoiCalcGroup(items) {
  var a=0, rs=0, rc=0;
  items.forEach(function(i) {
    var av = parseFloat(i.addedValue); if (!isNaN(av)) a += av;
    var r  = parseFloat(i.roi);        if (!isNaN(r))  { rs += r; rc++; }
  });
  return { count: items.length, av: a, roiAvg: rc ? rs/rc : NaN };
}

function rnxRenderScatter(q) {
  var subset = rnxRoiSubset(q);
  var drivers = [];
  subset.forEach(function(i) { if (i.driver && drivers.indexOf(i.driver) === -1) drivers.push(i.driver); });
  drivers.sort();
  var datasets = drivers.map(function(d) {
    var color = rnxDriverColors[d] || '#8E8E93';
    var pts = subset.filter(function(i){return i.driver===d;}).map(function(i) {
      var av = parseFloat(i.addedValue), roi = parseFloat(i.roi);
      if (isNaN(av)||isNaN(roi)) return null;
      return { x: Math.round(roi*100), y: av, label: i.title, techLead: i.techLead };
    }).filter(Boolean);
    return { label: d, data: pts, backgroundColor: color+'99', borderColor: color, pointRadius: 7, pointHoverRadius: 10 };
  });
  var canvas = document.getElementById('rnx-roi-canvas');
  if (!canvas || !window.Chart) return;
  if (window._rnxChart) window._rnxChart.destroy();
  window._rnxChart = new Chart(canvas, {
    type: 'scatter',
    data: { datasets: datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 6, boxHeight: 6, padding: 16, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            title: function(items) { return items[0].raw.label; },
            label: function(c) { return 'ROI: ' + c.raw.x + '%'; },
            afterLabel: function(c) { return 'Eng Lead: ' + (c.raw.techLead||'—'); }
          }
        }
      },
      scales: {
        x: { title: { display:true, text:'ROI %',         font:{size:11} }, ticks: { font:{size:11}, callback: function(v){return v+'%';} } },
        y: { title: { display:true, text:'Added Value ($K)', font:{size:11} }, ticks: { font:{size:11}, callback: function(v){return '$'+v+'K';} } }
      },
      layout: { padding: 10 }
    }
  });
}

function rnxRoiBarCard(subset, title, label, key) {
  var keys = [];
  subset.forEach(function(i) { if (i[key] && keys.indexOf(i[key]) === -1) keys.push(i[key]); });
  keys.sort();
  var colorMap = key === 'driver' ? rnxDriverColors : key === 'theme' ? rnxThemeColors : null;
  var rows = keys.map(function(k, ki) {
    var s = rnxRoiCalcGroup(subset.filter(function(i){return i[key]===k;}));
    var p = isNaN(s.roiAvg) ? 0 : Math.round(s.roiAvg*100);
    var tc = p < 0 ? '#E5243B' : '#2EAD4B';
    var kHtml = colorMap ? rnxBadge(k, colorMap[k]||'#8E8E93') : key === 'team' ? rnxBadge(k, RNX_GREENS[ki%RNX_GREENS.length]) : '<span style="font-size:12px;color:var(--text)">'+k+'</span>';
    return '<div class="roi-bar-row"><div>'+kHtml+'</div><div class="roi-bar-val">'+rnxFmtAV(s.av)+'</div><div class="roi-bar-pct" style="color:'+tc+'">'+p+'%</div></div>';
  }).join('');
  return '<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:16px">'
    + '<div class="roi-card-label" style="margin-bottom:14px">'+title+' &mdash; '+label+'</div>'
    + '<div class="roi-bar-header"><div></div><div style="min-width:80px">Added Value</div><div>Avg ROI</div></div>'
    + rows + '</div>';
}

function rnxRoiContent(q) {
  var label  = q === 'all' ? 'All Year' : q === 'backlog' ? 'Backlog' : q;
  var subset = rnxRoiSubset(q);
  var s = rnxRoiCalcGroup(subset);
  var p = isNaN(s.roiAvg) ? 0 : Math.round(s.roiAvg*100);
  var c = p < 0 ? '#E5243B' : 'var(--accent)';
  var overall = '<div class="roi-card">'
    + '<div class="roi-card-label">Overall ROI &mdash; '+label+'</div>'
    + '<div><div class="roi-card-big">'+s.count+'</div><div class="roi-card-small">initiatives</div></div>'
    + '<div class="roi-card-sep"></div>'
    + '<div><div class="roi-card-big">'+rnxFmtAV(s.av)+'</div><div class="roi-card-small">added value</div></div>'
    + '<div class="roi-card-sep"></div>'
    + '<div><div class="roi-card-big" style="color:'+c+'">'+p+'%</div><div class="roi-card-small">avg ROI</div></div>'
    + '</div>';
  var tableRows = subset.map(function(i) {
    return '<tr><td>'+i.quarter+'</td><td>'+i.title+'</td><td>'+rnxDriverBadge(i.driver)+'</td><td>'+(i.team||'—')+'</td><td>'+rnxThemeBadge(i.theme)+'</td><td>'+rnxFmtDollar(i.addedValue)+'</td><td>'+rnxRoiHtml(i.roi)+'</td></tr>';
  }).join('');
  var table = '<div class="twrap"><div class="thead-row">Initiatives</div>'
    + '<table><thead><tr><th>Quarter</th><th>Initiative</th><th>Driver</th><th>Team</th><th>Theme</th><th>Added Value</th><th>ROI</th></tr></thead>'
    + '<tbody>' + tableRows + '</tbody></table></div>';

  return '<div class="roi-chart-wrap"><div class="roi-chart-label">Added Value vs ROI &mdash; each point is an initiative &mdash; click legend to filter</div>'
    + '<div class="roi-chart-canvas"><canvas id="rnx-roi-canvas"></canvas></div></div>'
    + '<div class="roi-grid">'
    + overall
    + rnxRoiBarCard(subset, 'ROI by Driver', label, 'driver')
    + rnxRoiBarCard(subset, 'ROI by Theme',  label, 'theme')
    + rnxRoiBarCard(subset, 'ROI by Team',   label, 'team')
    + '</div>' + table;
}

function rnxSwitchROIQuarter(q) {
  var el = document.getElementById('rnx-roi-content');
  if (el) el.innerHTML = rnxRoiContent(q);
  setTimeout(function() { rnxRenderScatter(q); }, 50);
  rnxSetQAct('rnx-roi', q);
}

// ── CRUD Modal ─────────────────────────────────────────────────────────────

function rnxModalHtml() {
  var IF = 'width:100%;box-sizing:border-box;padding:7px 10px;font-size:13px;border:1px solid var(--border-md);border-radius:6px;background:var(--surface);color:var(--text);outline:none';
  var LB = 'display:block;font-size:11px;font-weight:500;color:var(--muted);margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px';
  var GR = 'margin-bottom:14px';

  // Build options from ref data (with fallback to empty)
  var qOpts = RNX_QUARTERS.concat(['Backlog']).map(function(q) {
    return '<option value="'+q+'">'+q+'</option>';
  }).join('');

  var teamOpts = '<option value="">—</option>'
    + rnxRefData.teams.map(function(t) { return '<option value="'+t.name+'">'+t.name+'</option>'; }).join('');

  var driverOpts = '<option value="">—</option>'
    + rnxRefData.drivers.map(function(d) { return '<option value="'+d.name+'">'+d.name+'</option>'; }).join('');

  var themeOpts = '<option value="">—</option>'
    + rnxRefData.themes.map(function(t) { return '<option value="'+t.name+'">'+t.name+'</option>'; }).join('');

  var poOpts = '<option value="">—</option>'
    + rnxRefData.members
        .filter(function(m) { return m.role === 'Product'; })
        .map(function(m) {
          var av = m.pictureUrl ? '<img src="'+m.pictureUrl+'" style="width:16px;height:16px;border-radius:50%;vertical-align:middle;margin-right:4px">' : '';
          return '<option value="'+m.name+'">'+m.name+'</option>';
        }).join('');

  var tlOpts = '<option value="">—</option>'
    + rnxRefData.members
        .filter(function(m) { return m.role === 'Tech'; })
        .map(function(m) { return '<option value="'+m.name+'">'+m.name+'</option>'; }).join('');

  var dsOpts = rnxDeliveryOpts.map(function(o) {
    return '<option value="'+o.val+'">'+o.label+'</option>';
  }).join('');

  var cfOpts = rnxConfidenceOpts.map(function(c) {
    return '<option value="'+c+'">'+c.charAt(0).toUpperCase()+c.slice(1)+'</option>';
  }).join('');

  function sel(id, label, opts) {
    return '<div style="'+GR+'"><label for="'+id+'" style="'+LB+'">'+label+'</label>'
      + '<select id="'+id+'" style="'+IF+'">'+opts+'</select></div>';
  }
  function inp(id, label, type) {
    return '<div style="'+GR+'"><label for="'+id+'" style="'+LB+'">'+label+'</label>'
      + '<input id="'+id+'" type="'+type+'" style="'+IF+'" /></div>';
  }

  return '<div id="rnx-modal-overlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:1000;align-items:flex-start;justify-content:center;padding:40px 16px;overflow-y:auto">'
    + '<div style="background:var(--surface);border:1px solid var(--border-md);border-radius:12px;width:100%;max-width:580px;box-shadow:0 8px 40px rgba(0,0,0,.18);padding:28px 28px 20px">'
    +   '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:22px">'
    +     '<div id="rnx-modal-title" style="font-size:15px;font-weight:600;color:var(--text)">Add Initiative</div>'
    +     '<button onclick="rnxCloseModal()" style="background:none;border:none;cursor:pointer;color:var(--muted);padding:4px">'
    +       '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    +     '</button>'
    +   '</div>'
    +   '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 16px">'
    +     '<div>' + inp('rnxi-title','Title *','text')                    + '</div>'
    +     '<div>' + sel('rnxi-quarter','Quarter',qOpts)                  + '</div>'
    +     '<div>' + sel('rnxi-driver','Driver',driverOpts)               + '</div>'
    +     '<div>' + sel('rnxi-team','Team',teamOpts)                     + '</div>'
    +     '<div>' + sel('rnxi-theme','Theme',themeOpts)                  + '</div>'
    +     '<div>' + sel('rnxi-po','Product Owner',poOpts)                + '</div>'
    +     '<div>' + sel('rnxi-tl','Tech Lead',tlOpts)                    + '</div>'
    +     '<div>' + sel('rnxi-status','Delivery Status',dsOpts)          + '</div>'
    +     '<div>' + inp('rnxi-av','Added Value ($)','number')            + '</div>'
    +     '<div>' + inp('rnxi-roi','ROI (e.g. 0.15 = 15%)','number')    + '</div>'
    +     '<div>' + inp('rnxi-design','Design Days','number')            + '</div>'
    +     '<div>' + inp('rnxi-eng','Engineering Days','number')          + '</div>'
    +     '<div>' + inp('rnxi-product','Product Days','number')          + '</div>'
    +     '<div>' + sel('rnxi-conf','Confidence',cfOpts)                 + '</div>'
    +   '</div>'
    +   '<div style="margin-bottom:14px"><label for="rnxi-link" style="'+LB+'">Link URL</label><input id="rnxi-link" type="url" style="'+IF+'" /></div>'
    +   '<div id="rnx-modal-err" style="font-size:12px;color:#E5243B;margin-bottom:10px;display:none"></div>'
    +   '<div style="display:flex;justify-content:flex-end;gap:10px;padding-top:8px;border-top:1px solid var(--border)">'
    +     '<button onclick="rnxCloseModal()" style="padding:7px 16px;font-size:13px;border:1px solid var(--border-md);border-radius:6px;background:var(--surface);color:var(--text);cursor:pointer">Cancel</button>'
    +     '<button id="rnx-modal-save-btn" onclick="rnxSaveInitiative()" style="padding:7px 18px;font-size:13px;border:none;border-radius:6px;background:var(--accent);color:#fff;cursor:pointer;font-weight:500">Save</button>'
    +   '</div>'
    + '</div></div>';
}

function rnxOpenModal(id) {
  var overlay = document.getElementById('rnx-modal-overlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  var err = document.getElementById('rnx-modal-err');
  if (err) { err.style.display = 'none'; err.textContent = ''; }

  if (id) {
    rnxEditId = id;
    var i = rnxInitiatives.filter(function(x) { return x.id === id; })[0];
    if (!i) return;
    document.getElementById('rnx-modal-title').textContent = 'Edit Initiative';
    document.getElementById('rnxi-title').value   = i.title          || '';
    document.getElementById('rnxi-quarter').value = i.quarter        || 'Backlog';
    document.getElementById('rnxi-driver').value  = i.driver         || '';
    document.getElementById('rnxi-team').value    = i.team           || '';
    document.getElementById('rnxi-theme').value   = i.theme          || '';
    document.getElementById('rnxi-po').value      = i.productOwner   || '';
    document.getElementById('rnxi-tl').value      = i.techLead       || '';
    document.getElementById('rnxi-status').value  = i.deliveryStatus || 'not-started';
    document.getElementById('rnxi-av').value      = (i.addedValue != null && i.addedValue !== '') ? i.addedValue : '';
    document.getElementById('rnxi-roi').value     = (i.roi        != null && i.roi !== '')        ? i.roi        : '';
    document.getElementById('rnxi-design').value  = i.designDays      || '';
    document.getElementById('rnxi-eng').value     = i.engineeringDays || '';
    document.getElementById('rnxi-product').value = i.productDays     || '';
    document.getElementById('rnxi-conf').value    = i.confidence      || 'medium';
    document.getElementById('rnxi-link').value    = i.link            || '';
  } else {
    rnxEditId = null;
    document.getElementById('rnx-modal-title').textContent = 'Add Initiative';
    ['rnxi-title','rnxi-av','rnxi-roi','rnxi-design','rnxi-eng','rnxi-product','rnxi-link'].forEach(function(id) {
      var el = document.getElementById(id); if (el) el.value = '';
    });
    ['rnxi-driver','rnxi-team','rnxi-theme','rnxi-po','rnxi-tl'].forEach(function(id) {
      var el = document.getElementById(id); if (el) el.selectedIndex = 0;
    });
    document.getElementById('rnxi-quarter').value = rnxCurrentQ();
    document.getElementById('rnxi-status').value  = 'not-started';
    document.getElementById('rnxi-conf').value    = 'medium';
  }
  setTimeout(function() { var t = document.getElementById('rnxi-title'); if(t) t.focus(); }, 50);
}

function rnxCloseModal() {
  var overlay = document.getElementById('rnx-modal-overlay');
  if (overlay) overlay.style.display = 'none';
  rnxEditId = null;
}

function rnxSaveInitiative() {
  var title = document.getElementById('rnxi-title').value.trim();
  if (!title) {
    var err = document.getElementById('rnx-modal-err');
    err.textContent = 'Title is required.';
    err.style.display = 'block';
    return;
  }
  var saveBtn = document.getElementById('rnx-modal-save-btn');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Saving…'; }

  var payload = {
    title:           title,
    quarter:         document.getElementById('rnxi-quarter').value || 'Backlog',
    driver:          document.getElementById('rnxi-driver').value.trim(),
    team:            document.getElementById('rnxi-team').value.trim(),
    theme:           document.getElementById('rnxi-theme').value.trim(),
    productOwner:    document.getElementById('rnxi-po').value.trim(),
    techLead:        document.getElementById('rnxi-tl').value.trim(),
    deliveryStatus:  document.getElementById('rnxi-status').value || 'not-started',
    confidence:      document.getElementById('rnxi-conf').value   || 'medium',
    link:            document.getElementById('rnxi-link').value.trim(),
    addedValue:      document.getElementById('rnxi-av').value      !== '' ? parseFloat(document.getElementById('rnxi-av').value)      : null,
    roi:             document.getElementById('rnxi-roi').value     !== '' ? parseFloat(document.getElementById('rnxi-roi').value)     : null,
    designDays:      document.getElementById('rnxi-design').value  !== '' ? parseFloat(document.getElementById('rnxi-design').value)  : 0,
    engineeringDays: document.getElementById('rnxi-eng').value     !== '' ? parseFloat(document.getElementById('rnxi-eng').value)     : 0,
    productDays:     document.getElementById('rnxi-product').value !== '' ? parseFloat(document.getElementById('rnxi-product').value) : 0
  };
  if (rnxEditId) payload.id = rnxEditId;

  fetch('/api/neon/initiatives', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(function(r) { return r.json(); })
  .then(function(res) {
    if (!res.ok) throw new Error(res.error || 'Save failed');
    rnxCloseModal();
    rnxLoadAndRender();
  })
  .catch(function(e) {
    var err = document.getElementById('rnx-modal-err');
    if (err) { err.textContent = e.message; err.style.display = 'block'; }
    if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save'; }
  });
}

function rnxDeleteInitiative(id) {
  var i = rnxInitiatives.filter(function(x) { return x.id === id; })[0];
  if (!i) return;
  if (!confirm('Delete "' + i.title + '"? This cannot be undone.')) return;
  fetch('/api/neon/initiatives', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: id })
  })
  .then(function(r) { return r.json(); })
  .then(function(res) {
    if (!res.ok) throw new Error(res.error || 'Delete failed');
    rnxLoadAndRender();
  })
  .catch(function(e) { alert('Delete failed: ' + e.message); });
}

// ── Status update (inline click) ──────────────────────────────────────────

function rnxUpdateStatus(id, val) {
  var i = rnxInitiatives.filter(function(x) { return x.id === id; })[0];
  if (!i) return;
  var opt = rnxDeliveryOpts.filter(function(o) { return o.val === val; })[0] || rnxDeliveryOpts[0];
  fetch('/api/neon/initiatives', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.assign({}, i, { deliveryStatus: val }))
  })
  .then(function(r) { return r.json(); })
  .then(function(res) {
    if (!res.ok) throw new Error(res.error || 'Save failed');
    i.deliveryStatus = val;
    // Update all DS pills for this id in DOM
    document.querySelectorAll('[data-rnx-ds-id="' + id + '"]').forEach(function(el) {
      el.className = (el.tagName === 'SPAN' ? 'pill ds-pill ' : 'pill ds-pill ') + opt.cls;
      el.textContent = opt.label;
    });
  })
  .catch(function(e) { console.warn('Status update failed', e); });
}

// ── API — load ─────────────────────────────────────────────────────────────

function rnxLoadAndRender() {
  var container = document.getElementById('rnx-content');
  if (!container) return;

  // Preserve active tab across reload
  var activeTab = 'gantt';
  var tabBtns = document.querySelectorAll('.rnx-tabitem.act');
  if (tabBtns.length > 0) activeTab = tabBtns[0].dataset.rnxtab || 'gantt';

  container.innerHTML = '<div style="padding:40px 32px;font-size:13px;color:var(--muted)">Loading…</div>';

  Promise.all([
    fetch('/api/neon/initiatives').then(function(r) { return r.json(); }),
    fetch('/api/neon/lookup?t=teams').then(function(r) { return r.json(); }),
    fetch('/api/neon/lookup?t=drivers').then(function(r) { return r.json(); }),
    fetch('/api/neon/lookup?t=themes').then(function(r) { return r.json(); }),
    fetch('/api/neon/team-members').then(function(r) { return r.json(); })
  ])
  .then(function(results) {
    rnxInitiatives       = Array.isArray(results[0]) ? results[0] : [];
    rnxRefData.teams     = Array.isArray(results[1]) ? results[1] : [];
    rnxRefData.drivers   = Array.isArray(results[2]) ? results[2] : [];
    rnxRefData.themes    = Array.isArray(results[3]) ? results[3] : [];
    rnxRefData.members   = Array.isArray(results[4]) ? results[4] : [];
    rnxBuildColorMaps();
    container.innerHTML = rnxBuildInner(activeTab);
    rnxInitEvents();
    if (activeTab === 'gantt') setTimeout(rnxGanttTooltipInit, 50);
    if (activeTab === 'roi')   setTimeout(function() { rnxRenderScatter(rnxCurrentQ()); }, 50);
  })
  .catch(function(err) {
    container.innerHTML = '<div style="padding:40px 32px;font-size:13px;color:#C0392B">Failed to load data.<br><br>' + err + '</div>';
  });
}

// ── Build inner HTML ───────────────────────────────────────────────────────

function rnxBuildInner(activeTab) {
  var cq     = rnxCurrentQ();
  var subset = rnxInitiatives.filter(function(i) { return i.quarter === cq; });

  function tab(id, label) {
    return '<button class="tabitem rnx-tabitem' + (id === activeTab ? ' act' : '') + '" data-rnxtab="' + id + '">' + label + '</button>';
  }

  var tableRows = rnxTableRows(subset);

  return '<div class="tabnav">'
    + tab('gantt',     'Gantt')
    + tab('table',     'Table View')
    + tab('quarterly', 'Quarterly')
    + tab('roi',       'By ROI')
    + '</div>'

    // ── Gantt ──
    + '<div id="rnx-rt-gantt" class="tabpanel' + (activeTab==='gantt'?' act':'') + '">'
    +   rnxBuildGantt()
    + '</div>'

    // ── Table ──
    + '<div id="rnx-rt-table" class="tabpanel' + (activeTab==='table'?' act':'') + '">'
    +   rnxQFilter('rnx-tbl', 'rnxSwitchTableQuarter')
    +   '<div class="cards">'
    +     rnxScInitiativesFor(subset, rnxCurrentQLabel())
    +     rnxScGroupedFor('rnx-sc-driver','By Driver',       'driver',        subset,rnxCurrentQLabel())
    +     rnxScGroupedFor('rnx-sc-theme', 'By Theme',        'theme',         subset,rnxCurrentQLabel())
    +     rnxScGroupedFor('rnx-sc-team',  'By Team',         'team',          subset,rnxCurrentQLabel())
    +   '</div>'
    +   '<div class="twrap">'
    +     '<div class="thead-row">Initiatives</div>'
    +     '<div style="padding:12px 18px 4px">' + rnxFilterBar() + '</div>'
    +     '<div style="overflow-x:auto">'
    +     '<table class="rnx-table" style="min-width:1100px"><thead><tr>'
    +       '<th>Quarter</th><th>Initiative</th><th>Driver</th><th>Team</th>'
    +       '<th>Product Owner</th><th>Tech Lead</th><th>Theme</th>'
    +       '<th>ROI</th><th>Status</th><th></th>'
    +     '</tr></thead>'
    +     '<tbody id="rnx-table-body">' + tableRows + '</tbody>'
    +     '</table>'
    +     '</div>'
    +   '</div>'
    + '</div>'

    // ── Quarterly ──
    + '<div id="rnx-rt-quarterly" class="tabpanel' + (activeTab==='quarterly'?' act':'') + '">'
    +   rnxQuarterlyBars()
    +   '<div style="margin-bottom:16px">' + rnxFilterBar('q') + '</div>'
    +   '<div class="kanban" id="rnx-kanban">' + rnxKanbanHtml() + '</div>'
    + '</div>'

    // ── ROI ──
    + '<div id="rnx-rt-roi" class="tabpanel' + (activeTab==='roi'?' act':'') + '">'
    +   rnxQFilter('rnx-roi','rnxSwitchROIQuarter')
    +   '<div id="rnx-roi-content">' + rnxRoiContent(cq) + '</div>'
    + '</div>';
}

// ── Event wiring (delegated, scoped to #content) ───────────────────────────

function rnxInitEvents() {
  // Tab switching
  document.querySelectorAll('.rnx-tabitem').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = btn.dataset.rnxtab;
      document.querySelectorAll('.rnx-tabitem').forEach(function(b) { b.classList.remove('act'); });
      btn.classList.add('act');
      ['gantt','table','quarterly','roi'].forEach(function(t) {
        var el = document.getElementById('rnx-rt-' + t);
        if (el) el.classList.toggle('act', t === id);
      });
      if (id === 'gantt') setTimeout(rnxGanttTooltipInit, 50);
      if (id === 'roi')   setTimeout(function() { rnxRenderScatter(rnxCurrentQ()); }, 50);
    });
  });

  // Gantt group toggle
  document.querySelectorAll('[data-rnxganttgroup]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      rnxGanttGroup = btn.dataset.rnxganttgroup;
      var panel = document.getElementById('rnx-rt-gantt');
      if (panel) { panel.innerHTML = rnxBuildGantt(); rnxGanttTooltipInit(); }
    });
  });

  // Q filter buttons
  document.querySelectorAll('[data-rnxqfn]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var fn = btn.dataset.rnxqfn, q = btn.dataset.q;
      if (fn === 'rnxSwitchTableQuarter')   rnxSwitchTableQuarter(q);
      else if (fn === 'rnxSwitchKanbanQuarter') rnxSwitchKanbanQuarter(q);
      else if (fn === 'rnxSwitchROIQuarter')    rnxSwitchROIQuarter(q);
    });
  });

  // Filter dropdowns
  document.querySelectorAll('[data-rnxfilter]').forEach(function(sel) {
    sel.addEventListener('change', function() {
      var sfx = sel.dataset.rnxfilter;
      if (sfx === 'q') rnxApplyKanbanFilters(); else rnxApplyTableFilters();
    });
  });

  // Filter reset
  document.querySelectorAll('[data-rnxreset]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var sfx = btn.dataset.rnxreset;
      if (sfx === 'q') {
        document.querySelectorAll('[data-rnxfilter="q"]').forEach(function(s) { s.value = ''; });
        document.querySelectorAll('#rnx-kanban .kancard').forEach(function(c) { c.style.display = ''; });
      } else {
        document.querySelectorAll('[data-rnxfilter=""]').forEach(function(s) { s.value = ''; });
        document.querySelectorAll('#rnx-table-body tr').forEach(function(r) { r.style.display = ''; });
      }
    });
  });

  // Edit buttons
  document.querySelectorAll('[data-rnxedit]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      rnxOpenModal(parseInt(btn.dataset.rnxedit));
    });
  });

  // Delete buttons
  document.querySelectorAll('[data-rnxdel]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      rnxDeleteInitiative(parseInt(btn.dataset.rnxdel));
    });
  });

  // Status pills (click to open dropdown)
  document.querySelectorAll('[data-rnx-ds-id]').forEach(function(pill) {
    pill.parentElement && pill.parentElement.addEventListener('click', function(e) {
      e.stopPropagation();
      var id = parseInt(pill.dataset.rnxDsId || pill.dataset.rnxdsid || pill.getAttribute('data-rnx-ds-id'));
      document.querySelectorAll('.rnx-status-menu').forEach(function(m) { m.remove(); });
      var menu = document.createElement('div');
      menu.className = 'rnx-status-menu status-menu';
      menu.style.cssText = 'position:fixed;z-index:1001;background:var(--surface);border:1px solid var(--border-md);border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.12);padding:4px;min-width:130px';
      rnxDeliveryOpts.forEach(function(o) {
        var item = document.createElement('div');
        item.style.cssText = 'padding:7px 10px;border-radius:6px;cursor:pointer;font-size:12px';
        item.innerHTML = '<span class="pill ' + o.cls + '" style="pointer-events:none">' + o.label + '</span>';
        item.onmouseenter = function() { item.style.background = 'var(--bg)'; };
        item.onmouseleave = function() { item.style.background = ''; };
        item.onclick = function(ev) { ev.stopPropagation(); rnxUpdateStatus(id, o.val); menu.remove(); };
        menu.appendChild(item);
      });
      var r = pill.getBoundingClientRect();
      menu.style.top  = (r.bottom + 4) + 'px';
      menu.style.left = r.left + 'px';
      document.body.appendChild(menu);
      setTimeout(function() {
        document.addEventListener('click', function h() { menu.remove(); document.removeEventListener('click', h); });
      }, 0);
    });
  });

  // Gantt tooltips
  rnxGanttTooltipInit();
}

// ── Main render (called by app.js PAGES map) ───────────────────────────────

function renderRoadmapNeon() {
  var html = '<div class="page-header">'
    + '<div>'
    +   '<div class="ptitle">Product Roadmap</div>'
    +   '<div class="psub">Quarterly initiatives and progress status — powered by Neon DB</div>'
    + '</div>'
    + '<div style="display:flex;align-items:center;gap:8px">'
    +   '<button onclick="rnxOpenModal(null)" style="display:flex;align-items:center;gap:6px;padding:7px 14px;font-size:13px;font-weight:500;border:none;border-radius:7px;background:var(--accent);color:#fff;cursor:pointer">'
    +     '<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
    +     'Add Initiative'
    +   '</button>'
    +   '<button onclick="rnxOpenSettings()" title="Settings"'
    +     ' style="width:34px;height:34px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border-md);border-radius:8px;background:var(--surface);color:var(--muted);cursor:pointer;transition:border-color .15s,color .15s"'
    +     ' onmouseenter="this.style.borderColor=\'var(--accent)\';this.style.color=\'var(--accent)\'"'
    +     ' onmouseleave="this.style.borderColor=\'var(--border-md)\';this.style.color=\'var(--muted)\'">'
    +     '<svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M16.2 12.5a1.5 1.5 0 00.3 1.65l.05.05a1.8 1.8 0 010 2.55 1.8 1.8 0 01-2.55 0l-.05-.05a1.5 1.5 0 00-1.65-.3 1.5 1.5 0 00-.91 1.37V18a1.8 1.8 0 01-3.6 0v-.08A1.5 1.5 0 007 16.55a1.5 1.5 0 00-1.65.3l-.05.05a1.8 1.8 0 01-2.55-2.55l.05-.05A1.5 1.5 0 003.1 12.65a1.5 1.5 0 00-1.37-.91H1.67a1.8 1.8 0 010-3.6h.08A1.5 1.5 0 003.45 7.3a1.5 1.5 0 00-.3-1.65l-.05-.05a1.8 1.8 0 012.55-2.55l.05.05A1.5 1.5 0 007 3.1a1.5 1.5 0 00.91-1.37V1.67a1.8 1.8 0 013.6 0v.08A1.5 1.5 0 0013 3.45a1.5 1.5 0 001.65-.3l.05-.05a1.8 1.8 0 012.55 2.55l-.05.05A1.5 1.5 0 0016.9 7.3a1.5 1.5 0 001.37.91H18.33a1.8 1.8 0 010 3.6h-.08a1.5 1.5 0 00-1.37.91l-.68-.22z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +   '</button>'
    + '</div>'
    + '</div>'
    + rnxModalHtml()
    + '<div id="rnx-content"></div>';

  setTimeout(rnxLoadAndRender, 0);
  return html;
}

// ── Settings drawer ────────────────────────────────────────────────────────

function rnxOpenSettings() {
  if (document.getElementById('rnx-settings-overlay')) return;

  var SNX_TABS_LOCAL = [
    { id: 'teams',       label: 'Teams & Capacity' },
    { id: 'members',     label: 'Team Members'     },
    { id: 'drivers',     label: 'Drivers'          },
    { id: 'themes',      label: 'Themes'           },
    { id: 'assumptions', label: 'Assumptions'      }
  ];

  // Backdrop
  var overlay = document.createElement('div');
  overlay.id = 'rnx-settings-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:600;display:flex;justify-content:flex-end;pointer-events:auto';

  var backdrop = document.createElement('div');
  backdrop.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0);transition:background .28s ease;cursor:pointer';
  backdrop.onclick = rnxCloseSettings;

  // Panel
  var panel = document.createElement('div');
  panel.style.cssText = [
    'position:relative',
    'width:1000px',
    'max-width:90vw',
    'height:100%',
    'background:#fff',
    'box-shadow:-6px 0 40px rgba(0,0,0,.13)',
    'display:flex',
    'flex-direction:column',
    'transform:translateX(100%)',
    'transition:transform .3s cubic-bezier(.4,0,.2,1)'
  ].join(';');

  // Panel header
  var activeTab = (typeof snxActiveTab !== 'undefined') ? snxActiveTab : 'teams';
  var panelHeader = '<div style="display:flex;align-items:center;justify-content:space-between;padding:18px 24px;border-bottom:1px solid var(--border);flex-shrink:0">'
    + '<div>'
    +   '<div style="font-size:15px;font-weight:500;letter-spacing:-.3px;color:var(--text)">Settings</div>'
    +   '<div style="font-size:12px;color:var(--faint);margin-top:1px">Click any cell to edit — changes save automatically</div>'
    + '</div>'
    + '<button onclick="rnxCloseSettings()"'
    +   ' style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border-md);border-radius:8px;background:none;cursor:pointer;color:var(--muted);transition:border-color .15s,color .15s;flex-shrink:0"'
    +   ' onmouseenter="this.style.borderColor=\'var(--accent)\';this.style.color=\'var(--accent)\'"'
    +   ' onmouseleave="this.style.borderColor=\'var(--border-md)\';this.style.color=\'var(--muted)\'">'
    +   '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    + '</button>'
    + '</div>';

  // Tab nav
  var tabNav = '<div style="display:flex;gap:2px;padding:10px 24px 0;background:var(--surface);border-bottom:1px solid var(--border);flex-shrink:0">'
    + SNX_TABS_LOCAL.map(function(t) {
        var act = t.id === activeTab;
        return '<button class="rnx-stab" data-tab="' + t.id + '"'
          + ' style="height:30px;padding:0 14px;border:none;font-size:12px;font-weight:500;font-family:inherit;cursor:pointer;border-radius:6px 6px 0 0;transition:background .15s,color .15s;'
          + 'background:' + (act ? 'var(--bg)' : 'transparent') + ';'
          + 'color:' + (act ? 'var(--text)' : 'var(--muted)') + '">'
          + t.label + '</button>';
      }).join('')
    + '</div>';

  // Content
  var content = '<div id="snx-tab-body" style="flex:1;overflow-y:auto;padding:24px">'
    + '<div style="display:flex;align-items:center;gap:10px;font-size:13px;color:var(--muted)">'
    +   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="animation:snxSpin 1s linear infinite"><circle cx="12" cy="12" r="9" stroke="var(--border-md)" stroke-width="2.5"/><path d="M12 3a9 9 0 019 9" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round"/></svg>'
    +   'Loading…'
    + '</div>'
    + '</div>'
    + '<style>@keyframes snxSpin{to{transform:rotate(360deg)}}</style>';

  panel.innerHTML = panelHeader + tabNav + content;
  overlay.appendChild(backdrop);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  // Animate in (double rAF to ensure paint before transition)
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      backdrop.style.background = 'rgba(0,0,0,.28)';
      panel.style.transform = 'translateX(0)';
    });
  });

  // Wire tab clicks
  panel.querySelectorAll('.rnx-stab').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var tab = btn.dataset.tab;
      if (typeof snxActiveTab !== 'undefined') snxActiveTab = tab;
      panel.querySelectorAll('.rnx-stab').forEach(function(b) {
        var a = b.dataset.tab === tab;
        b.style.background = a ? 'var(--bg)' : 'transparent';
        b.style.color       = a ? 'var(--text)' : 'var(--muted)';
      });
      var body = document.getElementById('snx-tab-body');
      if (body && typeof snxTabContent === 'function') body.innerHTML = snxTabContent(tab);
    });
  });

  // Load data, then render
  if (typeof snxLoadAll === 'function') {
    snxLoadAll(function(err) {
      var body = document.getElementById('snx-tab-body');
      if (!body) return;
      if (err) { body.innerHTML = '<span style="color:#C0392B;font-size:13px">Error loading settings: ' + err + '</span>'; return; }
      if (typeof snxTabContent === 'function') body.innerHTML = snxTabContent(activeTab);
    });
  }
}

function rnxCloseSettings() {
  var overlay = document.getElementById('rnx-settings-overlay');
  if (!overlay) return;
  if (typeof snxCleanupDrops === 'function') snxCleanupDrops();
  var backdrop = overlay.firstElementChild;
  var panel    = overlay.lastElementChild;
  if (backdrop) backdrop.style.background = 'rgba(0,0,0,0)';
  if (panel)    panel.style.transform = 'translateX(100%)';
  setTimeout(function() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 310);
}
