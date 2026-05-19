// overview-product.js — Product & Tech tab content

// ── Data fetch & render ────────────────────────────────────────────────────

function ovxLoad() {
  var root = document.getElementById('ovx-root');
  if (!root) return;

  // Reset quarter / year selection to current on each page load
  window._ovxSelQ    = ovxCurrentQLabel();
  window._ovxSelYear = new Date().getFullYear();

  Promise.all([
    fetch('/api/neon/initiatives').then(function(r) { return r.json(); }),
    fetch('/api/neon/team-members').then(function(r) { return r.json(); }),
    fetch('/api/neon/budget').then(function(r) { return r.json(); }),
    fetch('/api/neon/assumptions').then(function(r) { return r.json(); })
  ])
  .then(function(results) {
    var initiatives = (Array.isArray(results[0]) ? results[0] : []).map(function(i) {
      // Hydrate roi from roiInputs JSON (roi is not a DB column)
      var ri = {};
      try { if (i.roiInputs) ri = JSON.parse(i.roiInputs); } catch(e) {}
      i.roi = (ri.roi != null) ? ri.roi : null;
      return i;
    });
    var members     = Array.isArray(results[1]) ? results[1] : [];
    window._ovxBudgets     = (results[2] && typeof results[2] === 'object') ? results[2] : {};
    window._ovxAssumptions = Array.isArray(results[3]) ? results[3] : [];
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

var OVX_DRIVER_COLORS = ['#6366F1','#06B6D4','#10B981','#F59E0B','#EF4444','#EC4899','#8B5CF6','#14B8A6','#F97316','#84CC16','#A78BFA','#38BDF8'];

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

// ── Quarter navigator helpers ──────────────────────────────────────────────

// Normalize any quarter string to "Qn YYYY" (year-less entries get current year)
function ovxNormalizeQ(q) {
  if (!q || q === 'Backlog') return null;
  var m = q.match(/Q(\d)\s*(\d{4})?/i);
  if (!m) return null;
  var y = m[2] ? parseInt(m[2]) : new Date().getFullYear();
  return 'Q' + m[1] + ' ' + y;
}

// Numeric key for sorting: year*10 + quarter
function ovxQKey(label) {
  var m = label.match(/Q(\d)\s+(\d{4})/);
  return m ? parseInt(m[2]) * 10 + parseInt(m[1]) : 99999;
}

// Count initiatives matching a normalized "Qn YYYY" label
function ovxQCount(initiatives, label) {
  return initiatives.filter(function(i) {
    return ovxNormalizeQ(i.quarter || '') === label;
  }).length;
}

// Build the navigable quarter list:
//   - Sequential Q1→Q4 for every year from the earliest data quarter up to and
//     including the current quarter (no gaps, even if empty)
//   - Future quarters are appended only if they have data
function ovxAllQuarters(initiatives) {
  var currentLabel = ovxCurrentQLabel();
  var curKey = ovxQKey(currentLabel);

  // Normalize all data quarters
  var dataQs = {};
  initiatives.forEach(function(i) {
    var n = ovxNormalizeQ(i.quarter || '');
    if (n) dataQs[n] = true;
  });

  // Find earliest past/present quarter in data (≤ current)
  var earliestKey = curKey;
  Object.keys(dataQs).forEach(function(q) {
    var k = ovxQKey(q);
    if (k <= curKey && k < earliestKey) earliestKey = k;
  });

  // Build sequential list from earliest → current
  var list = [];
  var startYear = Math.floor(earliestKey / 10);
  var startQ    = earliestKey % 10;
  var y = startYear, qn = startQ;
  while (true) {
    var label = 'Q' + qn + ' ' + y;
    list.push(label);
    if (ovxQKey(label) >= curKey) break;
    qn++; if (qn > 4) { qn = 1; y++; }
  }

  // Append future quarters that have data, in order
  var future = Object.keys(dataQs).filter(function(q) {
    return ovxQKey(q) > curKey;
  }).sort(function(a, b) { return ovxQKey(a) - ovxQKey(b); });
  future.forEach(function(q) { list.push(q); });

  return list;
}

function ovxChangeQ(dir) {
  var qs  = ovxAllQuarters(window._ovxInits || []);
  var sel = window._ovxSelQ || ovxCurrentQLabel();
  var idx = qs.indexOf(sel);
  if (idx === -1) idx = qs.indexOf(ovxCurrentQLabel());
  var next = idx + dir;
  if (next < 0 || next >= qs.length) return;
  window._ovxSelQ = qs[next];
  ovxRender(window._ovxInits, window._ovxMembers);
}

// ── Year navigator helpers ─────────────────────────────────────────────────

function ovxAllYears(initiatives) {
  var years = {};
  initiatives.forEach(function(i) {
    var n = ovxNormalizeQ(i.quarter || '');
    if (!n) return;
    var m = n.match(/Q\d\s+(\d{4})/);
    if (m) years[parseInt(m[1])] = true;
  });
  var list = Object.keys(years).map(Number).sort();
  // Always include current year
  var cur = new Date().getFullYear();
  if (list.indexOf(cur) === -1) list.push(cur);
  return list.sort();
}

function ovxChangeYear(dir) {
  var years = ovxAllYears(window._ovxInits || []);
  var cur   = window._ovxSelYear || new Date().getFullYear();
  var idx   = years.indexOf(cur);
  var next  = idx + dir;
  if (next < 0 || next >= years.length) return;
  window._ovxSelYear = years[next];
  ovxRender(window._ovxInits, window._ovxMembers);
}

function ovxYearNav(year, hasPrev, hasNext) {
  function btn(dir, enabled) {
    var arrow = dir === -1 ? '&#8592;' : '&#8594;';
    var base  = 'width:22px;height:22px;border-radius:5px;border:1px solid var(--border);background:var(--surface);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:12px;line-height:1;color:var(--text)';
    var dis   = ';opacity:.3;cursor:default;pointer-events:none';
    return '<button type="button" onclick="ovxChangeYear(' + dir + ')" style="' + base + (enabled ? '' : dis) + '">' + arrow + '</button>';
  }
  return '<div style="display:inline-flex;align-items:center;gap:6px">'
    + btn(-1, hasPrev)
    + '<span style="font-size:11px;font-weight:600;color:var(--text);min-width:32px;text-align:center">' + year + '</span>'
    + btn(1, hasNext)
    + '</div>';
}

// ── Main render ────────────────────────────────────────────────────────────

function ovxRender(initiatives, members) {
  var body = document.getElementById('ovx-body');
  if (!body) return;

  // Persist data for quarter navigation
  window._ovxInits   = initiatives;
  window._ovxMembers = members;
  // Default to current quarter / year on first load
  if (!window._ovxSelQ)    window._ovxSelQ    = ovxCurrentQLabel();
  if (!window._ovxSelYear) window._ovxSelYear = new Date().getFullYear();

  // ── Selected quarter (navigable) ──
  var selQ = window._ovxSelQ;

  // Filter initiatives matching the selected quarter (normalized comparison)
  var qInits = initiatives.filter(function(i) {
    return ovxNormalizeQ(i.quarter || '') === selQ;
  });

  // Navigator state — allQs already encodes prev/next rules
  var allQs   = ovxAllQuarters(initiatives);
  var selIdx  = allQs.indexOf(selQ);
  if (selIdx === -1) selIdx = allQs.indexOf(ovxCurrentQLabel());
  var hasPrev = selIdx > 0;
  var hasNext = selIdx < allQs.length - 1;

  var qByDs = {};
  OVX_DS.forEach(function(d) { qByDs[d.val] = 0; });
  qInits.forEach(function(i) {
    var ds = i.deliveryStatus || 'not-started';
    if (qByDs[ds] !== undefined) qByDs[ds]++; else qByDs['not-started']++;
  });
  var qTotal    = qInits.length;
  var qDone     = qByDs['delivered'] || 0;
  var qPct      = qTotal ? Math.round(qDone / qTotal * 100) : 0;

  // ── Portfolio (filtered by selected year) ──
  var selYr    = window._ovxSelYear || new Date().getFullYear();
  var allYears = ovxAllYears(initiatives);
  var yrIdx    = allYears.indexOf(selYr);
  var yrHasPrev = yrIdx > 0;
  var yrHasNext = yrIdx < allYears.length - 1;

  var yrInits = initiatives.filter(function(i) {
    var n = ovxNormalizeQ(i.quarter || '');
    if (!n) return false;
    var m = n.match(/Q\d\s+(\d{4})/);
    return m && parseInt(m[1]) === selYr;
  });

  var total  = yrInits.length;
  var byDs   = {};
  OVX_DS.forEach(function(d) { byDs[d.val] = 0; });
  yrInits.forEach(function(i) {
    var ds = i.deliveryStatus || 'not-started';
    if (byDs[ds] !== undefined) byDs[ds]++; else byDs['not-started']++;
  });

  var qMap = {};
  // Always show all 4 quarters for the selected year, even if empty
  ['Q1','Q2','Q3','Q4'].forEach(function(q) { qMap[q + ' ' + selYr] = []; });
  yrInits.forEach(function(i) {
    var q = ovxNormalizeQ(i.quarter || '') || 'Backlog';
    if (!qMap[q]) qMap[q] = [];
    qMap[q].push(i);
  });
  var quarters = Object.keys(qMap).sort(function(a, b) { return ovxQSort(a) - ovxQSort(b); });

  var doneCount = byDs['delivered'] || 0;
  var pct = total ? Math.round(doneCount / total * 100) : 0;

  // ── Driver distribution for Portfolio View ──
  var allDrivers = [];
  yrInits.forEach(function(i) {
    var d = i.driver || '—';
    if (allDrivers.indexOf(d) === -1) allDrivers.push(d);
  });
  allDrivers.sort();
  var yearDriverMap = {};
  allDrivers.forEach(function(d) { yearDriverMap[d] = 0; });
  yrInits.forEach(function(i) { var d = i.driver || '—'; yearDriverMap[d] = (yearDriverMap[d] || 0) + 1; });
  var qDriverMaps = {};
  ['Q1','Q2','Q3','Q4'].forEach(function(q) {
    var qItems = qMap[q + ' ' + selYr] || [];
    var m = {}; allDrivers.forEach(function(d) { m[d] = 0; });
    qItems.forEach(function(i) { var d = i.driver || '—'; m[d] = (m[d] || 0) + 1; });
    qDriverMaps[q] = { map: m, count: qItems.length };
  });

  // ── Quick-nav cards ──
  var navCards = [
    { id: 'roadmap-neon',      label: 'Product Roadmap',               icon: ico.roadmap,  disabled: false },
    { id: 'teamcapacity-neon', label: 'Team Capacity',                 icon: ico.capacity, disabled: false },
    { id: null,                label: 'Submit Product Request',         icon: _ovxIdeaIcon, disabled: true },
    { id: null,                label: 'OKR',                           icon: _ovxOkrIcon,  disabled: true }
  ];

  // ── Capacity aggregation — reuse Team Capacity's exact functions ──
  var qCode = selQ.match(/Q\d/i) ? selQ.match(/Q\d/i)[0].toUpperCase() : null;
  var qYear = selQ.match(/\d{4}/) ? parseInt(selQ.match(/\d{4}/)[0]) : new Date().getFullYear();
  var usedEng = 0, usedPrd = 0, usedDes = 0;
  var budEng  = 0, budPrd  = 0, budDes  = 0;
  var hasCapData = false;
  if (qCode && typeof cnxCalc === 'function' && typeof cnxGetBudgetForQ === 'function') {
    // Temporarily set cnx globals so Team Capacity functions work with Overview's data
    var _prevInits = cnxInitiatives, _prevBudgets = cnxBudgets, _prevAsm = cnxAssumptions;
    cnxInitiatives = initiatives.filter(function(i) {
      return (parseInt(i.year) || new Date().getFullYear()) === qYear;
    });
    cnxBudgets     = window._ovxBudgets     || {};
    cnxAssumptions = window._ovxAssumptions || [];
    var capUsed   = cnxCalc(qCode);
    var capBudget = cnxGetBudgetForQ(qCode);
    // Restore
    cnxInitiatives = _prevInits; cnxBudgets = _prevBudgets; cnxAssumptions = _prevAsm;
    // Sum across teams WITH initiatives only — mirrors cnxRenderAllocation exactly
    Object.keys(capUsed).forEach(function(t) {
      usedEng += capUsed[t].engineering || 0;
      usedPrd += capUsed[t].product     || 0;
      usedDes += capUsed[t].design      || 0;
      var b = capBudget[t] || { engineering: 0, product: 0, design: 0 };
      budEng += b.engineering || 0;
      budPrd += b.product     || 0;
      budDes += b.design      || 0;
    });
    hasCapData = budEng > 0 || budPrd > 0 || budDes > 0;
  }

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
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;margin-top:36px">'
    +   '<span style="font-size:15px;font-weight:600;color:var(--text);letter-spacing:-.2px">' + selQ.replace(' ', ', ') + ' at a glance</span>'
    +   ovxQNav(selQ, hasPrev, hasNext)
    + '</div>'

    // ── Quarter at a Glance insights ──
    + '<div id="ovx-quarter-insights" style="margin-bottom:16px"></div>'

    + '<div style="display:grid;grid-template-columns:1fr 2fr 1fr;gap:16px;align-items:stretch">'

      // ── 1/4 Quarter progress ──
      + '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden">'
      +   '<div style="padding:12px 16px 8px;border-bottom:1px solid var(--border)">'
      +     '<span style="font-size:12px;font-weight:600;color:var(--text)">Quarter progress</span>'
      +   '</div>'
      +   '<div style="padding:16px">'

          // Big count
      +   '<div style="font-size:32px;font-weight:700;color:var(--text);line-height:1;letter-spacing:-1px">' + qTotal + '</div>'
      +   '<div style="font-size:11px;color:var(--muted);margin-top:3px;margin-bottom:14px">initiative' + (qTotal !== 1 ? 's' : '') + ' this quarter</div>'

          // Stacked progress bar
      +   '<div style="height:7px;border-radius:4px;overflow:hidden;display:flex;margin-bottom:4px;background:var(--border)">'
      +   (qTotal > 0
            ? OVX_DS.map(function(d) {
                var w = (qByDs[d.val] || 0) / qTotal * 100;
                return w > 0 ? '<div style="width:' + w + '%;background:' + d.color + ';height:100%;flex-shrink:0"></div>' : '';
              }).join('')
            : '')
      +   '</div>'
      +   '<div style="font-size:10px;color:var(--muted);margin-bottom:16px">' + qPct + '% delivered</div>'

          // Divider
      +   '<div style="height:1px;background:var(--border);margin-bottom:12px"></div>'

          // Status rows (only statuses with count > 0)
      +   OVX_DS.map(function(d) {
            var n = qByDs[d.val] || 0;
            return '<div style="display:flex;align-items:center;gap:7px;padding:3px 0">'
              + '<div style="width:7px;height:7px;border-radius:50%;background:' + d.color + ';flex-shrink:0;opacity:' + (n ? '1' : '.3') + '"></div>'
              + '<span style="font-size:11px;color:var(--muted);flex:1;opacity:' + (n ? '1' : '.4') + '">' + d.label + '</span>'
              + '<span style="font-size:11px;font-weight:600;color:var(--text);opacity:' + (n ? '1' : '.35') + '">' + n + '</span>'
              + '</div>';
          }).join('')

      + '</div>'
      + '</div>'

      // ── 2/4 Chart ──
      + '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;display:flex;flex-direction:column">'
      +   '<div style="padding:12px 16px 10px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px">'
      +     '<span id="ovx-chart-title" style="font-size:12px;font-weight:600;color:var(--text)">Initiatives by ' + (_ovxGroupKey === 'roi' ? 'ROI' : _ovxGroupKey.charAt(0).toUpperCase() + _ovxGroupKey.slice(1)) + '</span>'
      +     '<div style="margin-left:auto;display:flex;gap:5px">'
      +       ['team','theme','driver','roi'].map(function(k) {
                var lbl = k === 'roi' ? 'ROI' : k.charAt(0).toUpperCase() + k.slice(1);
                return '<button onclick="ovxSetGroupKey(\'' + k + '\')" id="ovx-gtab-' + k + '" style="font-size:10px;font-weight:600;padding:2px 9px;border-radius:5px;border:1px solid var(--border);cursor:pointer;background:' + (k === _ovxGroupKey ? 'var(--accent)' : 'var(--surface)') + ';color:' + (k === _ovxGroupKey ? '#fff' : 'var(--muted)') + '">' + lbl + '</button>';
              }).join('')
      +     '</div>'
      +   '</div>'
      +   '<div style="padding:12px 16px;flex:1;min-height:0"><canvas id="ovx-group-chart"></canvas></div>'
      + '</div>'

      // ── Right column: Team Capacity + Quick Access ──
      + '<div style="display:flex;flex-direction:column;gap:8px">'

        // Team Capacity
        + '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:10px 12px;flex:1;display:flex;flex-direction:column">'
        +   '<div style="margin-bottom:8px;flex-shrink:0">'
        +     '<span style="font-size:11px;font-weight:600;color:var(--text)">Team Capacity</span>'
        +   '</div>'
        +   '<div style="flex:1;display:flex;flex-direction:column;justify-content:space-evenly">'
        +   (hasCapData
              ? ['Engineering','Product','Design'].map(function(disc) {
                  var used = disc === 'Engineering' ? usedEng : disc === 'Product' ? usedPrd : usedDes;
                  var bud  = disc === 'Engineering' ? budEng  : disc === 'Product' ? budPrd  : budDes;
                  return ovxCapMiniBar(disc, used, bud);
                }).join('')
              : '<div style="font-size:11px;color:var(--faint);padding:4px 0">No budget set for this quarter.</div>')
        +   '</div>'
        + '</div>'

        // Quick Access — compact 2×2 tile grid
        + '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:10px 12px">'
        +   '<div style="font-size:11px;font-weight:600;color:var(--text);margin-bottom:8px">Quick access</div>'
        +   '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;align-items:stretch">'
        +   navCards.map(function(c) { return ovxNavTile(c); }).join('')
        +   '</div>'
        + '</div>'

      + '</div>'

    + '</div>'

    // ══ PORTFOLIO VIEW ════════════════════════════════════════════════════════
    + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;margin-top:36px">'
    +   '<span style="font-size:15px;font-weight:600;color:var(--text);letter-spacing:-.2px">Portfolio View</span>'
    +   ovxYearNav(selYr, yrHasPrev, yrHasNext)
    +   '<span style="font-size:11px;color:var(--muted)">' + total + ' initiative' + (total !== 1 ? 's' : '') + ' across ' + quarters.length + ' period' + (quarters.length !== 1 ? 's' : '') + '</span>'
    + '</div>'

    // ── Portfolio insights ──
    + '<div id="ovx-portfolio-insights" style="margin-bottom:16px"></div>'

    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:stretch">'

      // Quarterly breakdown
      + '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;display:flex;flex-direction:column">'
      +   '<div style="padding:16px 20px 12px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0">'
      +     '<span style="font-size:13px;font-weight:600;color:var(--text)">Initiatives by quarter</span>'
      +     '<span style="font-size:11px;color:var(--muted)">' + pct + '% overall done</span>'
      +   '</div>'
      +   '<div style="flex:1;display:flex;flex-direction:column;justify-content:space-evenly">'
      +     quarters.map(function(q) { return ovxQuarterRow(q, qMap[q], total); }).join('')
      +   '</div>'
      + '</div>'

      // Driver distribution card
      + '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;display:flex;flex-direction:column">'
      +   '<div style="padding:16px 20px 12px;border-bottom:1px solid var(--border);flex-shrink:0">'
      +     '<span style="font-size:13px;font-weight:600;color:var(--text)">By Driver</span>'
      +   '</div>'
      +   '<div style="padding:16px 20px;flex:1">'

      +   (allDrivers.length === 0
            ? '<div style="font-size:11px;color:var(--faint);text-align:center;padding:20px 0">No initiatives yet</div>'

            // Horizontal layout: big donut left | divider | 2×2 quarterly grid right
            : '<div style="display:flex;align-items:center;gap:0;width:100%">'

              // Left: year donut + legend
              + '<div style="flex:0 0 auto;display:flex;flex-direction:column;align-items:center;padding-right:20px">'
              +   '<div style="position:relative;width:130px;height:130px;margin-bottom:12px">'
              +     '<canvas id="ovx-driver-year" width="130" height="130"></canvas>'
              +     '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;line-height:1">'
              +       '<div style="font-size:24px;font-weight:700;color:var(--text)">' + total + '</div>'
              +       '<div style="font-size:9px;color:var(--muted);margin-top:2px">total</div>'
              +     '</div>'
              +   '</div>'
              +   '<div style="display:flex;flex-direction:column;align-items:flex-start;gap:4px">'
              +   allDrivers.map(function(d) {
                    var c = kervDriverColor(d);
                    return '<div style="display:flex;align-items:center;gap:5px">'
                      + '<div style="width:7px;height:7px;border-radius:50%;background:' + c + ';flex-shrink:0"></div>'
                      + '<span style="font-size:10px;color:var(--muted);white-space:nowrap">' + d + '</span>'
                      + '</div>';
                  }).join('')
              +   '</div>'
              + '</div>'

              // Vertical divider
              + '<div style="width:1px;background:var(--border);align-self:stretch;flex-shrink:0;margin:0 20px"></div>'

              // Right: 2×2 quarterly donuts
              + '<div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:14px">'
              + ['Q1','Q2','Q3','Q4'].map(function(q) {
                  var qd = qDriverMaps[q];
                  var isEmpty = qd.count === 0;
                  return '<div style="text-align:center">'
                    + '<div style="font-size:10px;font-weight:600;color:var(--muted);margin-bottom:6px">' + q + '</div>'
                    + (isEmpty
                        ? '<div style="width:80px;height:80px;margin:0 auto;border-radius:50%;border:7px solid var(--border);display:flex;align-items:center;justify-content:center"><span style="font-size:14px;color:var(--faint)">—</span></div>'
                        : '<div style="position:relative;width:80px;height:80px;margin:0 auto">'
                        +   '<canvas id="ovx-driver-' + q.toLowerCase() + '" width="80" height="80"></canvas>'
                        +   '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;line-height:1">'
                        +     '<div style="font-size:15px;font-weight:700;color:var(--text)">' + qd.count + '</div>'
                        +   '</div>'
                        + '</div>'
                      )
                    + '</div>';
                }).join('')
              + '</div>'

              + '</div>'
          )

      +   '</div>'   // close inner padding div
      + '</div>'     // close driver card

    + '</div>';

  // Save driver data for async chart rendering
  window._ovxDriverData = { allDrivers: allDrivers, yearDriverMap: yearDriverMap, qDriverMaps: qDriverMaps, total: total };

  // Render charts after DOM is ready
  setTimeout(function() {
    if (_ovxGroupKey === 'roi') ovxRenderRoiScatter(initiatives, selQ);
    else ovxRenderChart(_ovxGroupKey, initiatives, selQ);

    // Driver donuts
    var dd = window._ovxDriverData;
    if (dd && dd.allDrivers.length > 0) {
      var driverColors = dd.allDrivers.map(function(d) { return kervDriverColor(d); });
      ovxRenderDriverDonut('ovx-driver-year', dd.yearDriverMap, dd.allDrivers, driverColors);
      ['Q1','Q2','Q3','Q4'].forEach(function(q) {
        var qd = dd.qDriverMaps[q];
        if (qd && qd.count > 0) {
          ovxRenderDriverDonut('ovx-driver-' + q.toLowerCase(), qd.map, dd.allDrivers, driverColors);
        }
      });
    }

    // AI Insights
    if (typeof renderInsightBox === 'function' && typeof ovxQuarterInsights === 'function') {
      renderInsightBox('ovx-quarter-insights', selQ,
        ovxQuarterInsights(qInits, selQ, qPct, qByDs, qTotal, teamMap, teamNames, hasCapData, usedEng, usedPrd, usedDes, budEng, budPrd, budDes));
    }
    if (typeof renderInsightBox === 'function' && typeof ovxPortfolioInsights === 'function') {
      renderInsightBox('ovx-portfolio-insights', selYr + ' Portfolio',
        ovxPortfolioInsights(yrInits, selYr, quarters, qMap, byDs, pct, allDrivers, yearDriverMap));
    }
  }, 0);
}

// ── Component builders ─────────────────────────────────────────────────────

// ── Overview chart state ───────────────────────────────────────────────────
var _ovxGroupKey = 'team';

function ovxSetGroupKey(k) {
  _ovxGroupKey = k;
  ['team','theme','driver','roi'].forEach(function(key) {
    var btn = document.getElementById('ovx-gtab-' + key);
    if (!btn) return;
    btn.style.background = key === k ? 'var(--accent)' : 'var(--surface)';
    btn.style.color      = key === k ? '#fff' : 'var(--muted)';
  });
  var titleEl = document.getElementById('ovx-chart-title');
  if (titleEl) titleEl.textContent = 'Initiatives by ' + (k === 'roi' ? 'ROI' : k.charAt(0).toUpperCase() + k.slice(1));
  if (k === 'roi') ovxRenderRoiScatter(window._ovxInits || [], window._ovxSelQ);
  else ovxRenderChart(k, window._ovxInits || [], window._ovxSelQ);
}

function ovxRenderChart(key, allInits, selQ) {
  var canvas = document.getElementById('ovx-group-chart');
  if (!canvas || typeof Chart === 'undefined') return;

  // Filter to selected quarter (normalized)
  var subset = allInits.filter(function(i) {
    return ovxNormalizeQ(i.quarter || '') === selQ;
  });

  var groups = {};
  subset.forEach(function(i) {
    var k = (i[key] || '—').trim() || '—';
    if (!groups[k]) groups[k] = { 'not-started':0, 'on-track':0, 'at-risk':0, 'delayed':0, 'on-hold':0, 'delivered':0 };
    groups[k][i.deliveryStatus || 'not-started']++;
  });
  var labels = Object.keys(groups).sort();
  if (window._ovxChart) { window._ovxChart.destroy(); window._ovxChart = null; }
  window._ovxChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { label: 'On Track',    data: labels.map(function(k){return groups[k]['on-track'];   }), backgroundColor: '#2EAD4B', borderRadius: 0 },
        { label: 'At Risk',     data: labels.map(function(k){return groups[k]['at-risk'];    }), backgroundColor: '#E5A100', borderRadius: 0 },
        { label: 'Delayed',     data: labels.map(function(k){return groups[k]['delayed'];    }), backgroundColor: '#E5243B', borderRadius: 0 },
        { label: 'On Hold',     data: labels.map(function(k){return groups[k]['on-hold'];    }), backgroundColor: '#C2410C', borderRadius: 0 },
        { label: 'Delivered',   data: labels.map(function(k){return groups[k]['delivered'];  }), backgroundColor: '#1D4ED8', borderRadius: 0 },
        { label: 'Not Started', data: labels.map(function(k){return groups[k]['not-started'];}), backgroundColor: '#C8C8C8', borderRadius: 0 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 10, family: 'inherit' }, boxWidth: 10, padding: 10 } },
        tooltip: { callbacks: { title: function(items) { return items[0].label; } } }
      },
      scales: {
        x: { stacked: true, ticks: { font: { size: 10, family: 'inherit' }, maxRotation: 30 }, grid: { display: false } },
        y: { stacked: true, ticks: { font: { size: 10, family: 'inherit' }, stepSize: 1, precision: 0 }, grid: { color: 'rgba(0,0,0,.05)' }, border: { display: false } }
      }
    }
  });
}

function ovxRenderRoiScatter(allInits, selQ) {
  var canvas = document.getElementById('ovx-group-chart');
  if (!canvas || typeof Chart === 'undefined') return;

  // For ROI scatter use the full selected year (not just one quarter) — richer view
  var selYr = window._ovxSelYear || new Date().getFullYear();
  var subset = allInits.filter(function(i) {
    var n = ovxNormalizeQ(i.quarter || '');
    if (!n) return false;
    var m = n.match(/Q\d\s+(\d{4})/);
    return m && parseInt(m[1]) === selYr;
  });

  var drivers = [];
  subset.forEach(function(i) { if (i.driver && drivers.indexOf(i.driver) === -1) drivers.push(i.driver); });
  drivers.sort();

  var datasets = drivers.map(function(d) {
    var color = kervDriverColor(d);
    var pts = subset.filter(function(i) { return i.driver === d; }).map(function(i) {
      var av = parseFloat(i.addedValue), roi = parseFloat(i.roi);
      if (isNaN(av) || isNaN(roi)) return null;
      return { x: Math.round(roi * 100), y: av, label: i.title, quarter: i.quarter };
    }).filter(Boolean);
    return { label: d, data: pts, backgroundColor: color + '99', borderColor: color, pointRadius: 7, pointHoverRadius: 10 };
  });

  if (window._ovxChart) { window._ovxChart.destroy(); window._ovxChart = null; }
  window._ovxChart = new Chart(canvas, {
    type: 'scatter',
    data: { datasets: datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 6, boxHeight: 6, padding: 12, font: { size: 10, family: 'inherit' } } },
        tooltip: {
          callbacks: {
            title: function(items) { return items[0].raw.label; },
            label: function(c) { return 'ROI: ' + c.raw.x + '%  ·  Added Value: $' + c.raw.y + 'K'; },
            afterLabel: function(c) { return c.raw.quarter ? c.raw.quarter : ''; }
          }
        }
      },
      scales: {
        x: { title: { display: true, text: 'ROI %', font: { size: 10, family: 'inherit' } }, ticks: { font: { size: 10, family: 'inherit' }, callback: function(v) { return v + '%'; } }, grid: { color: 'rgba(0,0,0,.05)' } },
        y: { title: { display: true, text: 'Added Value ($K)', font: { size: 10, family: 'inherit' } }, ticks: { font: { size: 10, family: 'inherit' }, callback: function(v) { return '$' + v + 'K'; } }, grid: { color: 'rgba(0,0,0,.05)' }, border: { display: false } }
      },
      layout: { padding: 8 }
    }
  });
}

// External tooltip for driver donuts (avoids canvas-clipping issues on small charts)
function _ovxDriverTooltip(context) {
  var el = document.getElementById('ovx-driver-tip');
  if (!el) {
    el = document.createElement('div');
    el.id = 'ovx-driver-tip';
    el.style.cssText = 'position:fixed;background:rgba(20,20,20,.82);color:#fff;font-size:10px;font-family:inherit;line-height:1.4;padding:4px 8px;border-radius:5px;pointer-events:none;white-space:nowrap;z-index:9999;opacity:0;transition:opacity .1s';
    document.body.appendChild(el);
  }
  var tooltip = context.tooltip;
  if (!tooltip || tooltip.opacity === 0) { el.style.opacity = '0'; return; }
  var pts = tooltip.dataPoints || [];
  if (!pts.length || !pts[0].raw) { el.style.opacity = '0'; return; }
  el.textContent = pts[0].label + ': ' + pts[0].raw;
  var rect = context.chart.canvas.getBoundingClientRect();
  var x = rect.left + tooltip.caretX;
  var y = rect.top  + tooltip.caretY - 30;
  el.style.left    = x + 'px';
  el.style.top     = y + 'px';
  el.style.opacity = '1';
}

function ovxRenderDriverDonut(canvasId, driverMap, drivers, colors) {
  var canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === 'undefined') return;
  var existing = (typeof Chart.getChart === 'function') ? Chart.getChart(canvas) : null;
  if (existing) existing.destroy();
  var vals = drivers.map(function(d) { return driverMap[d] || 0; });
  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: drivers,
      datasets: [{
        data: vals,
        backgroundColor: colors,
        borderWidth: 1,
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--surface') || '#fff',
        hoverOffset: 3
      }]
    },
    options: {
      responsive: false,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false, external: _ovxDriverTooltip }
      },
      animation: { duration: 350 }
    }
  });
}

function ovxQNav(label, hasPrev, hasNext) {
  function btn(dir, enabled) {
    var arrow = dir === -1 ? '&#8592;' : '&#8594;';
    var base  = 'width:22px;height:22px;border-radius:5px;border:1px solid var(--border);background:var(--surface);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:12px;line-height:1;color:var(--text)';
    var dis   = ';opacity:.3;cursor:default;pointer-events:none';
    return '<button type="button" onclick="ovxChangeQ(' + dir + ')" style="' + base + (enabled ? '' : dis) + '">' + arrow + '</button>';
  }
  return '<div style="display:inline-flex;align-items:center;gap:6px">'
    + btn(-1, hasPrev)
    + '<span style="font-size:11px;font-weight:600;color:var(--text);min-width:56px;text-align:center">' + label + '</span>'
    + btn(1, hasNext)
    + '</div>';
}

// Compact team row for the left column (no stacked bar, just name + count + %)
function ovxTeamRow(name, dsByVal, isBold) {
  var total = OVX_DS.reduce(function(s, d) { return s + (dsByVal[d.val] || 0); }, 0);
  var done  = dsByVal['delivered'] || 0;
  var pct   = total ? Math.round(done / total * 100) : 0;
  var nameStyle = 'font-size:11px;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'
    + (isBold ? 'font-weight:700;color:var(--text)' : 'color:var(--muted)');
  return '<div style="display:flex;align-items:center;gap:8px;padding:5px 14px">'
    + '<span style="' + nameStyle + '">' + name + '</span>'
    + '<span style="font-size:11px;' + (isBold ? 'font-weight:700;' : '') + 'color:var(--muted);width:18px;text-align:right;flex-shrink:0">' + total + '</span>'
    + '<span style="font-size:10px;font-weight:' + (isBold ? '700' : '500') + ';width:28px;text-align:right;flex-shrink:0;color:' + (pct >= 75 ? '#2EAD4B' : pct >= 40 ? '#E5A100' : 'var(--muted)') + '">' + (total ? pct + '%' : '—') + '</span>'
    + '</div>';
}

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
  var done  = items.filter(function(i) { return i.deliveryStatus === 'delivered'; }).length;
  var pct   = count ? Math.round(done / count * 100) : 0;
  var isEmpty = count === 0;

  // Mini status dots
  var dots = OVX_DS.map(function(d) {
    var n = items.filter(function(i) { return (i.deliveryStatus || 'not-started') === d.val; }).length;
    return n ? '<span style="display:inline-flex;align-items:center;gap:3px;font-size:11px;color:var(--muted)">'
      + '<span style="width:6px;height:6px;border-radius:50%;background:' + d.color + ';flex-shrink:0"></span>'
      + n + '</span>' : '';
  }).filter(Boolean).join('<span style="color:var(--border);margin:0 2px">·</span>');

  return '<div style="display:flex;align-items:center;gap:12px;padding:9px 20px;border-bottom:1px solid var(--border-lt);cursor:pointer;transition:background .12s;opacity:' + (isEmpty ? '.45' : '1') + '" '
    + 'onmouseenter="this.style.background=\'var(--subtle)\'" onmouseleave="this.style.background=\'\'">'
    + '<div style="width:56px;font-size:12px;font-weight:600;color:var(--text);flex-shrink:0">' + quarter + '</div>'
    + '<div style="flex:1;min-width:0">'
    +   '<div style="height:5px;background:var(--border);border-radius:3px;overflow:hidden;margin-bottom:5px">'
    +     (count > 0 ? '<div style="height:100%;width:' + pct + '%;background:#10B981;border-radius:3px;transition:width .4s"></div>' : '')
    +   '</div>'
    +   '<div style="display:flex;gap:6px;flex-wrap:wrap">' + (isEmpty ? '<span style="font-size:11px;color:var(--faint)">No initiatives yet</span>' : dots) + '</div>'
    + '</div>'
    + '<div style="text-align:right;flex-shrink:0">'
    +   '<div style="font-size:13px;font-weight:600;color:' + (isEmpty ? 'var(--faint)' : 'var(--text)') + '">' + (isEmpty ? '—' : count) + '</div>'
    +   '<div style="font-size:10px;color:var(--muted)">' + (isEmpty ? '' : pct + '% done') + '</div>'
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

// ── Compact tile for Quick Access 2×2 grid ─────────────────────────────────
function ovxNavTile(c) {
  var disabled = !!c.disabled;
  var base = 'position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:10px 4px 8px;border-radius:8px;border:1px solid var(--border);text-align:center;transition:background .12s,border-color .12s;height:100%';
  var dis  = disabled ? ';opacity:.55;cursor:default' : ';cursor:pointer';
  var hover = disabled ? '' : ' onmouseenter="this.style.background=\'var(--subtle)\';this.style.borderColor=\'var(--border-md)\'" onmouseleave="this.style.background=\'\';this.style.borderColor=\'var(--border)\'"';
  var click = disabled ? '' : ' onclick="setPage(\'' + c.id + '\',\'' + c.label.replace(/'/g, "\\'") + '\')"';
  var badge = disabled
    ? '<div style="position:absolute;top:5px;right:5px;font-size:7px;font-weight:600;color:var(--muted);background:var(--subtle);border:1px solid var(--border);border-radius:4px;padding:1px 4px;line-height:1.4;letter-spacing:.2px">Soon</div>'
    : '';
  return '<div style="' + base + dis + '"' + hover + click + '>'
    + badge
    + '<span style="color:var(--accent);line-height:0">' + c.icon + '</span>'
    + '<div style="font-size:9px;font-weight:500;color:var(--text);line-height:1.3">' + c.label + '</div>'
    + '</div>';
}

// ── Mini capacity bar for Team Capacity card ────────────────────────────────
function ovxCapMiniBar(label, used, budget) {
  var pct  = budget > 0 ? Math.round(used / budget * 100) : 0;
  var over = budget > 0 && used > budget;
  var color = over ? '#E5243B' : pct >= 95 ? '#E5243B' : pct >= 80 ? '#E5A100' : '#2EAD4B';
  var barW  = Math.min(pct, 100); // bar capped at 100% visually; label shows real value
  return '<div>'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px">'
    +   '<span style="font-size:10px;color:var(--muted)">' + label + '</span>'
    +   '<span style="font-size:10px;font-weight:600;color:' + color + '">' + (budget > 0 ? pct + '%' : '—') + '</span>'
    + '</div>'
    + '<div style="height:4px;background:var(--border);border-radius:3px;overflow:hidden">'
    +   (budget > 0 ? '<div style="height:100%;width:' + barW + '%;background:' + color + ';border-radius:3px;transition:width .3s"></div>' : '')
    + '</div>'
    + '</div>';
}

var _ovxIdeaIcon = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2a4.5 4.5 0 0 1 2 8.5V12H6v-1.5A4.5 4.5 0 0 1 8 2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M6 13.5h4M7 15h2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';
var _ovxOkrIcon  = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="8" r=".8" fill="currentColor"/></svg>';

function ovxBarIcon()   { return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="9" width="2.5" height="5" rx=".5" fill="currentColor" opacity=".4"/><rect x="6.5" y="6" width="2.5" height="8" rx=".5" fill="currentColor" opacity=".6"/><rect x="11" y="3" width="2.5" height="11" rx=".5" fill="currentColor"/></svg>'; }
function ovxCheckIcon() { return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/><path d="M5 8l2.5 2.5L11 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
function ovxPlayIcon()  { return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/><path d="M6.5 5.5l4 2.5-4 2.5V5.5z" fill="currentColor"/></svg>'; }
function ovxPctIcon()   { return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 13L13 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="4.5" cy="4.5" r="2" stroke="currentColor" stroke-width="1.3"/><circle cx="11.5" cy="11.5" r="2" stroke="currentColor" stroke-width="1.3"/></svg>'; }
