// overview.js — Landing dashboard

function renderOverview() {
  return '<div id="ovx-root" style="max-width:1100px">'
    + '<div style="margin-bottom:28px">'
    +   '<div style="font-size:22px;font-weight:600;color:var(--text);letter-spacing:-.3px">Overview</div>'
    +   '<div style="font-size:13px;color:var(--muted);margin-top:3px">Product team at a glance</div>'
    + '</div>'
    + '<div id="ovx-body" style="color:var(--muted);font-size:13px">Loading…</div>'
    + '</div>';
}

// ── Data fetch & render ────────────────────────────────────────────────────

function ovxLoad() {
  var root = document.getElementById('ovx-root');
  if (!root) return;

  Promise.all([
    fetch('/api/neon/initiatives').then(function(r) { return r.json(); }),
    fetch('/api/neon/team-members').then(function(r) { return r.json(); })
  ])
  .then(function(results) {
    var initiatives = Array.isArray(results[0]) ? results[0] : [];
    var members     = Array.isArray(results[1]) ? results[1] : [];
    ovxRender(initiatives, members);
  })
  .catch(function() {
    var body = document.getElementById('ovx-body');
    if (body) body.innerHTML = '<span style="color:#E5243B">Failed to load data.</span>';
  });
}

// ── Delivery status config ─────────────────────────────────────────────────

var OVX_DS = [
  { val: 'not-started', label: 'Not Started', color: '#8E8E93' },
  { val: 'on-track',    label: 'On Track',    color: '#2EAD4B' },
  { val: 'at-risk',     label: 'At Risk',     color: '#E5A100' },
  { val: 'delayed',     label: 'Delayed',     color: '#E5243B' },
  { val: 'on-hold',     label: 'On Hold',     color: '#C2410C' },
  { val: 'delivered',   label: 'Delivered',   color: '#1D4ED8' }
];

// ── Quarters sort order ────────────────────────────────────────────────────

function ovxQSort(q) {
  if (!q || q === 'Backlog') return 9999;
  var m = q.match(/Q(\d)\s*(\d{4})?/i);
  if (!m) return 9998;
  return (parseInt(m[2] || 0)) * 10 + parseInt(m[1]);
}

// ── Section header ─────────────────────────────────────────────────────────

function ovxSectionHeader(title, sub) {
  return '<div style="display:flex;align-items:baseline;gap:10px;margin-bottom:16px;margin-top:36px">'
    + '<span style="font-size:15px;font-weight:600;color:var(--text);letter-spacing:-.2px">' + title + '</span>'
    + (sub ? '<span style="font-size:11px;color:var(--muted)">' + sub + '</span>' : '')
    + '</div>';
}

// ── Detect current quarter label ────────────────────────────────────────────

function ovxCurrentQLabel() {
  var m = new Date().getMonth(); // 0-11
  var q = m < 3 ? 'Q1' : m < 6 ? 'Q2' : m < 9 ? 'Q3' : 'Q4';
  return q + ' ' + new Date().getFullYear();
}

// ── Main render ────────────────────────────────────────────────────────────

function ovxRender(initiatives, members) {
  var body = document.getElementById('ovx-body');
  if (!body) return;

  // ── Current quarter ──
  var curQLabel = ovxCurrentQLabel(); // e.g. "Q2 2026"
  var curQKey   = curQLabel.split(' ')[0]; // "Q2"
  var curYear   = parseInt(curQLabel.split(' ')[1]);

  var qInits = initiatives.filter(function(i) {
    var q = i.quarter || '';
    var m = q.match(/Q(\d)\s*(\d{4})?/i);
    if (!m) return false;
    var iqn  = parseInt(m[1]);
    var iyear = m[2] ? parseInt(m[2]) : curYear;
    return q.indexOf(curQKey) !== -1 && iyear === curYear;
  });

  var qByDs = {};
  OVX_DS.forEach(function(d) { qByDs[d.val] = 0; });
  qInits.forEach(function(i) {
    var ds = i.deliveryStatus || 'not-started';
    if (qByDs[ds] !== undefined) qByDs[ds]++; else qByDs['not-started']++;
  });
  var qTotal    = qInits.length;
  var qDone     = qByDs['delivered'] || 0;
  var qPct      = qTotal ? Math.round(qDone / qTotal * 100) : 0;

  // ── Portfolio ──
  var total  = initiatives.length;
  var byDs   = {};
  OVX_DS.forEach(function(d) { byDs[d.val] = 0; });
  initiatives.forEach(function(i) {
    var ds = i.deliveryStatus || 'not-started';
    if (byDs[ds] !== undefined) byDs[ds]++; else byDs['not-started']++;
  });

  var qMap = {};
  initiatives.forEach(function(i) {
    var q = i.quarter || 'Backlog';
    if (!qMap[q]) qMap[q] = [];
    qMap[q].push(i);
  });
  var quarters = Object.keys(qMap).sort(function(a, b) { return ovxQSort(a) - ovxQSort(b); });

  var doneCount = byDs['delivered'] || 0;
  var pct = total ? Math.round(doneCount / total * 100) : 0;

  // ── Quick-nav cards ──
  var navCards = [
    { id: 'roadmap-neon',      label: 'Product Roadmap',               icon: ico.roadmap,  disabled: false },
    { id: 'teamcapacity-neon', label: 'Team Capacity',                 icon: ico.capacity, disabled: false },
    { id: null,                label: 'Submit a Product Idea / Request', icon: _ovxIdeaIcon, disabled: true },
    { id: null,                label: 'OKR',                           icon: _ovxOkrIcon,  disabled: true }
  ];

  // ── Team breakdown for current quarter ──
  var teamMap = {};
  qInits.forEach(function(i) {
    var t = i.team || 'Unassigned';
    if (!teamMap[t]) teamMap[t] = {};
    OVX_DS.forEach(function(d) { if (!teamMap[t][d.val]) teamMap[t][d.val] = 0; });
    var ds = i.deliveryStatus || 'not-started';
    teamMap[t][ds] = (teamMap[t][ds] || 0) + 1;
  });
  var teamNames = Object.keys(teamMap).sort();

  body.innerHTML =

    // ══ THIS QUARTER AT A GLANCE ══════════════════════════════════════════════
    ovxSectionHeader('This quarter at a glance', curQLabel)

    + '<div style="display:grid;grid-template-columns:1fr 280px;gap:20px;align-items:start">'

      // ── Status breakdown by team ──
      + '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden">'
      +   '<div style="padding:14px 20px 10px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:16px">'
      +     '<span style="font-size:13px;font-weight:600;color:var(--text)">Status breakdown</span>'
      +     '<div style="display:flex;align-items:center;gap:10px;margin-left:auto">'
      +     OVX_DS.map(function(d) {
              return '<span style="display:flex;align-items:center;gap:4px;font-size:10px;color:var(--muted)">'
                + '<span style="width:8px;height:8px;border-radius:2px;background:' + d.color + ';flex-shrink:0"></span>'
                + d.label + '</span>';
            }).join('')
      +     '</div>'
      +   '</div>'
      +   '<div style="padding:8px 0">'
      +     teamNames.map(function(t) { return ovxTeamBar(t, teamMap[t]); }).join('')
      +     '<div style="height:1px;background:var(--border);margin:4px 0"></div>'
      +     ovxTeamBar('Total', qByDs, true)
      +   '</div>'
      + '</div>'

      // ── Quick nav ──
      + '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px 20px">'
      +   '<div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:12px">Quick access</div>'
      +   navCards.map(function(c) { return ovxNavCard(c); }).join('')
      + '</div>'

    + '</div>'

    // ══ PORTFOLIO VIEW ════════════════════════════════════════════════════════
    + ovxSectionHeader('Portfolio View', total + ' initiative' + (total !== 1 ? 's' : '') + ' across ' + quarters.length + ' period' + (quarters.length !== 1 ? 's' : ''))

    + '<div style="display:grid;grid-template-columns:1fr 380px;gap:20px;align-items:start">'

      // Quarterly breakdown
      + '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden">'
      +   '<div style="padding:16px 20px 12px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">'
      +     '<span style="font-size:13px;font-weight:600;color:var(--text)">Initiatives by quarter</span>'
      +     '<span style="font-size:11px;color:var(--muted)">' + pct + '% overall done</span>'
      +   '</div>'
      +   '<div style="padding:8px 0">'
      +     quarters.map(function(q) { return ovxQuarterRow(q, qMap[q], total); }).join('')
      +   '</div>'
      + '</div>'

      // Portfolio summary stats
      + '<div style="display:flex;flex-direction:column;gap:16px">'
      +   '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px 20px">'
      +     '<div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:14px">Portfolio status</div>'
      +     OVX_DS.map(function(d) { return ovxStatusRow(d, byDs[d.val] || 0, total); }).join('')
      +   '</div>'
      + '</div>'

    + '</div>';
}

// ── Component builders ─────────────────────────────────────────────────────

function ovxTeamBar(name, dsByVal, isBold) {
  var total = OVX_DS.reduce(function(s, d) { return s + (dsByVal[d.val] || 0); }, 0);
  var done  = dsByVal['delivered'] || 0;
  var pct   = total ? Math.round(done / total * 100) : 0;

  var segments = total > 0
    ? OVX_DS.map(function(d) {
        var n = dsByVal[d.val] || 0;
        if (!n) return '';
        var w = (n / total * 100).toFixed(1);
        return '<div title="' + d.label + ': ' + n + '" style="height:100%;width:' + w + '%;background:' + d.color + ';flex-shrink:0"></div>';
      }).join('')
    : '<div style="height:100%;width:100%;background:var(--border)"></div>';

  var labelStyle = isBold
    ? 'font-size:11px;font-weight:700;color:var(--text);width:120px;flex-shrink:0'
    : 'font-size:11px;color:var(--muted);width:120px;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis';

  return '<div style="display:flex;align-items:center;gap:12px;padding:7px 20px">'
    + '<span style="' + labelStyle + '" title="' + name + '">' + name + '</span>'
    + '<div style="flex:1;height:8px;border-radius:4px;overflow:hidden;display:flex;background:var(--border)">' + segments + '</div>'
    + '<span style="font-size:11px;color:var(--muted);width:24px;text-align:right;flex-shrink:0">' + total + '</span>'
    + '<span style="font-size:10px;font-weight:' + (isBold ? '700' : '500') + ';color:' + (pct >= 75 ? '#10B981' : pct >= 40 ? '#F59E0B' : 'var(--muted)') + ';width:32px;text-align:right;flex-shrink:0">' + (total ? pct + '%' : '—') + '</span>'
    + '</div>';
}

function ovxStatCard(label, value, color, iconSvg) {
  return '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px 20px">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
    +   '<span style="font-size:11px;font-weight:500;color:var(--muted);text-transform:uppercase;letter-spacing:.4px">' + label + '</span>'
    +   '<span style="color:' + color + ';opacity:.7">' + iconSvg + '</span>'
    + '</div>'
    + '<div style="font-size:26px;font-weight:600;color:var(--text);letter-spacing:-.5px">' + value + '</div>'
    + '</div>';
}

function ovxQuarterRow(quarter, items, totalAll) {
  var count = items.length;
  var done  = items.filter(function(i) { return i.deliveryStatus === 'done'; }).length;
  var pct   = count ? Math.round(done / count * 100) : 0;

  // Mini status dots
  var dots = OVX_DS.map(function(d) {
    var n = items.filter(function(i) { return (i.deliveryStatus || 'not-started') === d.val; }).length;
    return n ? '<span style="display:inline-flex;align-items:center;gap:3px;font-size:11px;color:var(--muted)">'
      + '<span style="width:6px;height:6px;border-radius:50%;background:' + d.color + ';flex-shrink:0"></span>'
      + n + '</span>' : '';
  }).filter(Boolean).join('<span style="color:var(--border);margin:0 2px">·</span>');

  return '<div style="display:flex;align-items:center;gap:12px;padding:9px 20px;border-bottom:1px solid var(--border-lt);cursor:pointer;transition:background .12s" '
    + 'onmouseenter="this.style.background=\'var(--subtle)\'" onmouseleave="this.style.background=\'\'">'
    + '<div style="width:56px;font-size:12px;font-weight:600;color:var(--text);flex-shrink:0">' + quarter + '</div>'
    + '<div style="flex:1;min-width:0">'
    +   '<div style="height:5px;background:var(--border);border-radius:3px;overflow:hidden;margin-bottom:5px">'
    +     '<div style="height:100%;width:' + pct + '%;background:#10B981;border-radius:3px;transition:width .4s"></div>'
    +   '</div>'
    +   '<div style="display:flex;gap:6px;flex-wrap:wrap">' + dots + '</div>'
    + '</div>'
    + '<div style="text-align:right;flex-shrink:0">'
    +   '<div style="font-size:13px;font-weight:600;color:var(--text)">' + count + '</div>'
    +   '<div style="font-size:10px;color:var(--muted)">' + pct + '% done</div>'
    + '</div>'
    + '</div>';
}

function ovxStatusRow(d, count, total) {
  var pct = total ? Math.round(count / total * 100) : 0;
  return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">'
    + '<span style="width:7px;height:7px;border-radius:50%;background:' + d.color + ';flex-shrink:0"></span>'
    + '<span style="font-size:12px;color:var(--text);flex:1">' + d.label + '</span>'
    + '<div style="width:80px;height:4px;background:var(--border);border-radius:2px;overflow:hidden">'
    +   '<div style="height:100%;width:' + pct + '%;background:' + d.color + ';border-radius:2px"></div>'
    + '</div>'
    + '<span style="font-size:12px;color:var(--muted);width:24px;text-align:right">' + count + '</span>'
    + '</div>';
}

function ovxNavCard(c) {
  var disabledStyle = c.disabled
    ? 'cursor:default;opacity:.55'
    : 'cursor:pointer';
  var hoverAttrs = c.disabled ? '' :
    ' onmouseenter="this.style.background=\'var(--subtle)\'" onmouseleave="this.style.background=\'\'"';
  var clickAttr = c.disabled ? '' :
    ' onclick="setPage(\'' + c.id + '\',\'' + c.label.replace(/'/g, "\\'") + '\')"';
  var rightIcon = c.disabled
    ? '<span style="margin-left:auto;font-size:10px;font-weight:500;color:var(--faint);white-space:nowrap">Coming Soon</span>'
    : '<svg style="margin-left:auto;color:var(--muted)" width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  return '<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;transition:background .12s;margin-bottom:4px;' + disabledStyle + '"'
    + clickAttr + hoverAttrs + '>'
    + '<span style="width:28px;height:28px;border-radius:7px;background:var(--subtle);display:flex;align-items:center;justify-content:center;color:var(--accent);flex-shrink:0">' + c.icon + '</span>'
    + '<div>'
    +   '<div style="font-size:12px;font-weight:500;color:var(--text)">' + c.label + '</div>'
    + '</div>'
    + rightIcon
    + '</div>';
}

// ── Micro icons ────────────────────────────────────────────────────────────

var _ovxIdeaIcon = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2a4.5 4.5 0 0 1 2 8.5V12H6v-1.5A4.5 4.5 0 0 1 8 2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M6 13.5h4M7 15h2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';
var _ovxOkrIcon  = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="8" r=".8" fill="currentColor"/></svg>';

function ovxBarIcon()   { return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="9" width="2.5" height="5" rx=".5" fill="currentColor" opacity=".4"/><rect x="6.5" y="6" width="2.5" height="8" rx=".5" fill="currentColor" opacity=".6"/><rect x="11" y="3" width="2.5" height="11" rx=".5" fill="currentColor"/></svg>'; }
function ovxCheckIcon() { return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/><path d="M5 8l2.5 2.5L11 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
function ovxPlayIcon()  { return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/><path d="M6.5 5.5l4 2.5-4 2.5V5.5z" fill="currentColor"/></svg>'; }
function ovxPctIcon()   { return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 13L13 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="4.5" cy="4.5" r="2" stroke="currentColor" stroke-width="1.3"/><circle cx="11.5" cy="11.5" r="2" stroke="currentColor" stroke-width="1.3"/></svg>'; }
