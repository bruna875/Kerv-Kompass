// capacity-neon.js — Independent Team Capacity module backed by Neon DB
// All globals prefixed cnx_ to avoid collisions with legacy capacity.js

// ── State ──────────────────────────────────────────────────────────────────

var cnxInitiatives    = [];
var cnxAllInitiatives = [];
var cnxSelYear        = new Date().getFullYear();
var cnxBudgets        = {};   // { team: { Q1: { engineering, product, design } } } — FTE values
var cnxAssumptions    = [];   // flat array from /api/neon/assumptions (global, no initiative_id)
var cnxMembers        = [];   // team members (for avatar photos)
var cnxActiveTab      = 'allocation';
var cnxQ              = null; // active quarter

// ── Module-scope constants for tab and quarter navigation ──────────────────

var CNX_TABS = [
  { id: 'allocation', label: 'Team Allocation' },
  { id: 'englead',    label: 'By Eng Lead'     },
  { id: 'prodlead',   label: 'By Prod Lead'    }
];

var CNX_Q_OPTS = [
  { id: 'Q1',  label: 'Q1'       },
  { id: 'Q2',  label: 'Q2'       },
  { id: 'Q3',  label: 'Q3'       },
  { id: 'Q4',  label: 'Q4'       },
  { id: 'all', label: 'All Year' }
];

// ── Colour maps (imported from roadmap-neon globals if available) ──────────
// Falls back to its own palette so this module is truly independent.

var CNX_PALETTE = ['#ED005E','#FF6B35','#FFB627','#06D6A0','#118AB2','#7B2D8E','#E84393','#00B4D8','#F72585','#4CC9F0','#FF477E','#3A86FF'];
var CNX_GREENS  = ['#7B2D8E','#9B59B6','#6C3483','#A569BD','#8E44AD','#BB8FCE','#5B2C6F','#D2B4DE','#4A235A','#7D3C98','#C39BD3','#6A1B9A'];
var cnxDriverColors = {}, cnxThemeColors = {};

function cnxBuildColorMaps() {
  var ds = [], ts = [];
  cnxInitiatives.forEach(function(i) {
    if (ds.indexOf(i.driver) === -1) ds.push(i.driver);
    if (ts.indexOf(i.theme)  === -1) ts.push(i.theme);
  });
  ds.sort(); ts.sort();
  cnxDriverColors = {}; cnxThemeColors = {};
  // driver colors: delegate to kervDriverColor() for consistency with Roadmap
  ds.forEach(function(d)    { cnxDriverColors[d] = typeof kervDriverColor === 'function' ? kervDriverColor(d) : CNX_PALETTE[ds.indexOf(d) % CNX_PALETTE.length]; });
  ts.forEach(function(t, i) { cnxThemeColors[t]  = CNX_GREENS[i  % CNX_GREENS.length]; });
}

// ── Helpers ────────────────────────────────────────────────────────────────

function cnxCurrentQ() {
  var m = new Date().getMonth();
  return 'Q' + (m < 3 ? 1 : m < 6 ? 2 : m < 9 ? 3 : 4);
}

function cnxRoiHtml(v) {
  if (!v && v !== 0) return '—';
  var n = parseFloat(String(v).replace(/[^0-9.-]/g, ''));
  if (isNaN(n)) return '—';
  var p = Math.round(n * 100);
  return '<span style="color:' + (p < 0 ? '#E5243B' : '#2EAD4B') + ';font-weight:500">' + p + '%</span>';
}

function cnxMemberAvatar(name, size) {
  size = size || 28;
  var m = cnxMembers.filter(function(x) { return x.name === name; })[0];
  if (m && m.pictureUrl) {
    return '<img src="' + m.pictureUrl + '" style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;object-fit:cover;flex-shrink:0">';
  }
  var initials = name ? name.split(' ').map(function(w){return w[0]||'';}).join('').toUpperCase().slice(0,2) : '?';
  return '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:var(--subtle);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:' + Math.round(size*0.38) + 'px;font-weight:600;color:var(--muted)">' + initials + '</div>';
}

// ── Budget helpers ─────────────────────────────────────────────────────────

function cnxGetBudget(team, q) {
  // Convert stored FTE values → available days using assumptions
  // capTeamQuarter lives in capacity-calculations.js
  if (typeof capTeamQuarter === 'function') {
    var c = capTeamQuarter(cnxAssumptions, cnxBudgets, team, q);
    return {
      design:      c.design      || 0,
      engineering: c.engineering || 0,
      product:     c.product     || 0
    };
  }
  // Fallback: raw FTE values (if calculations script not yet loaded)
  if (!cnxBudgets[team] || !cnxBudgets[team][q]) {
    return { design: 0, engineering: 0, product: 0 };
  }
  return cnxBudgets[team][q];
}

function cnxGetBudgetForQ(q) {
  // For 'all': sum all four quarters; for 'backlog': same as a single quarter with no budget
  if (q === 'all') {
    var merged = {};
    ['Q1','Q2','Q3','Q4'].forEach(function(qk) {
      Object.keys(cnxBudgets).forEach(function(team) {
        if (!merged[team]) merged[team] = { design: 0, engineering: 0, product: 0 };
        var b = cnxGetBudget(team, qk);
        merged[team].design      += b.design;
        merged[team].engineering += b.engineering;
        merged[team].product     += b.product;
      });
    });
    return merged;
  }
  if (q === 'backlog') return {};
  var result = {};
  Object.keys(cnxBudgets).forEach(function(team) {
    result[team] = cnxGetBudget(team, q);
  });
  return result;
}

// ── Capacity calculation ───────────────────────────────────────────────────

function cnxCalc(q) {
  var subset = q === 'all'
    ? cnxInitiatives.filter(function(i) { return i.quarter !== 'Backlog'; })
    : q === 'backlog'
    ? cnxInitiatives.filter(function(i) { return i.quarter === 'Backlog'; })
    : cnxInitiatives.filter(function(i) { return i.quarter === q; });

  var teams = {};
  subset.forEach(function(i) {
    var t = i.team || 'Unassigned';
    if (!teams[t]) teams[t] = { design: 0, engineering: 0, product: 0, initiatives: [] };
    var d = parseFloat(i.designDays)      || 0;
    var e = parseFloat(i.engineeringDays) || 0;
    var p = parseFloat(i.productDays)     || 0;
    teams[t].design      += d;
    teams[t].engineering += e;
    teams[t].product     += p;
    teams[t].initiatives.push({ title: i.title, design: d, engineering: e, product: p, total: d+e+p, driver: i.driver, theme: i.theme, techLead: i.techLead, productOwner: i.productOwner, roi: i.roi });
  });
  return teams;
}

// ── Bar + stats HTML ───────────────────────────────────────────────────────

function cnxBarHtml(used, budget) {
  if (budget <= 0) return '<div style="font-size:11px;color:var(--faint)">—</div>';
  var pct = Math.round(used / budget * 100);
  var over = used > budget;
  var color = pct > 95 ? '#E5243B' : pct >= 80 ? '#E5A100' : '#2EAD4B';

  if (over) {
    var budgetPct = Math.round(budget / used * 100);
    var overPct   = 100 - budgetPct;
    return '<div style="display:flex;align-items:center;gap:8px">'
      + '<div class="cap-bar-over" style="flex:1;position:relative">'
      +   '<div class="cap-bar-track" style="overflow:visible;position:relative">'
      +     '<div class="cap-bar-budget-line" style="left:' + budgetPct + '%"></div>'
      +     '<div class="cap-bar-budget-label" style="left:' + budgetPct + '%">budget</div>'
      +     '<div class="cap-bar-fill" style="width:100%;background:#E5243B"><span class="cap-bar-fill-text">' + pct + '%</span></div>'
      +   '</div>'
      +   '<div class="cap-bar-over-hatch" style="width:' + overPct + '%"></div>'
      + '</div>'
      + '<span class="cap-bar-over-badge">+' + Math.round(used - budget) + 'd</span>'
      + '</div>';
  }
  return '<div class="cap-bar-track"><div class="cap-bar-fill" style="width:' + pct + '%;background:' + color + '"><span class="cap-bar-fill-text">' + pct + '%</span></div></div>';
}

function cnxStatsHtml(used, budget) {
  var over = used > budget;
  return '<div class="cap-bar-stats">'
    + '<div class="cap-bar-stats-val" style="color:' + (over ? '#E5243B' : 'var(--text)') + '">' + Math.round(used) + 'd</div>'
    + '<div class="cap-bar-stats-of">of ' + Math.round(budget) + '</div>'
    + '</div>';
}

function cnxScorecardHtml(label, used, budget) {
  var pct   = budget > 0 ? Math.round(used / budget * 100) : 0;
  var color = pct > 95 ? '#E5243B' : pct >= 80 ? '#E5A100' : '#2EAD4B';
  return '<div class="cap-scorecard">'
    + '<div class="cap-scorecard-label">' + label + '</div>'
    + '<div class="cap-scorecard-val" style="color:' + color + '">' + pct + '%</div>'
    + '<div class="cap-scorecard-sub">' + Math.round(used) + 'd of ' + Math.round(budget) + 'd</div>'
    + '</div>';
}

// ── Team block ─────────────────────────────────────────────────────────────

function cnxTeamBlock(teamName, used, budget, inits, fte) {
  function fmtFte(n) { n = parseFloat(n) || 0; return n % 1 === 0 ? String(n) : parseFloat(n.toFixed(1)).toString(); }
  var totalUsed = used.design + used.engineering + used.product;

  function _avCellHtml(name) {
    if (!name) return '—';
    return '<div style="display:flex;align-items:center;gap:6px;overflow:hidden">'
      + cnxMemberAvatar(name, 22)
      + '<span style="font-size:11px;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + name.split(' ')[0] + '</span>'
      + '</div>';
  }

  var cols = [
    { label: 'Initiative',  width: '22%'                     },
    { label: 'Driver',      width: '15%'                     },
    { label: 'Theme',       width: '14%'                     },
    { label: 'Prod Lead',   width: '10%'                     },
    { label: 'Eng Lead',    width: '10%'                     },
    { label: 'Eng',         width: '6%',  align: 'right'    },
    { label: 'Prod',        width: '6%',  align: 'right'    },
    { label: 'Des',         width: '6%',  align: 'right'    },
    { label: 'Total',       width: '6%',  align: 'right'    },
    { label: 'ROI',         width: '5%',  align: 'right'    }
  ];

  var initRows = inits.map(function(ini) {
    return UI.trReadOnly([
      '<div style="font-weight:500;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + ini.title + '">' + ini.title + '</div>',
      UI.badge(ini.driver || '—', cnxDriverColors[ini.driver] || '#8E8E93', (cnxDriverColors[ini.driver] || '#8E8E93') + '18'),
      '<span style="color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block">' + (ini.theme || '—') + '</span>',
      _avCellHtml(ini.productOwner),
      _avCellHtml(ini.techLead),
      '<div style="text-align:right;color:var(--muted)">' + (ini.engineering ? Math.round(ini.engineering) + 'd' : '—') + '</div>',
      '<div style="text-align:right;color:var(--muted)">' + (ini.product     ? Math.round(ini.product)     + 'd' : '—') + '</div>',
      '<div style="text-align:right;color:var(--muted)">' + (ini.design      ? Math.round(ini.design)      + 'd' : '—') + '</div>',
      '<div style="text-align:right;font-weight:500;color:var(--text)">' + Math.round(ini.total) + 'd</div>',
      '<div style="text-align:right">' + cnxRoiHtml(ini.roi) + '</div>'
    ]);
  }).join('');

  var tableId  = 'cnx-team-tbl-' + teamName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  var initTable = UI.tableScroll(cols, initRows, tableId, 0, '', { inCard: true, tableLayout: 'fixed' });

  var fteLabel = fte
    ? [
        { n: fte.product,     l: 'Product' },
        { n: fte.engineering, l: 'Tech'    },
        { n: fte.design,      l: 'Design'  }
      ].map(function(x) { return fmtFte(x.n) + ' ' + x.l; }).join(' · ')
    : '';

  var robBadge = (fte && fte.eng_rob_pct != null)
    ? '<span style="font-size:10px;font-weight:400;color:#9A3412;background:#FFF7ED;border-radius:4px;padding:2px 6px;white-space:nowrap">Engineering Run of Business: ' + fte.eng_rob_pct + '%</span>'
    : '';

  var titleHtml = '<div style="display:flex;align-items:baseline;gap:8px">'
    + '<div style="font-size:14px;font-weight:600;color:var(--text)">' + teamName + '</div>'
    + (fteLabel ? '<span style="font-size:11px;color:var(--faint);font-weight:400">' + fteLabel + '</span>' : '')
    + '</div>';

  var headerRight = '<div style="display:flex;align-items:center;gap:8px">'
    + robBadge
    + '<span class="cap-team-meta">' + inits.length + ' initiative' + (inits.length !== 1 ? 's' : '') + ' · ' + Math.round(totalUsed) + ' days</span>'
    + '</div>';

  var barsHtml = '<div class="cap-team-body" style="padding:16px 20px 16px">'
    + '<div class="cap-bar-row"><div class="cap-bar-label">Engineering</div>' + cnxBarHtml(used.engineering, budget.engineering) + cnxStatsHtml(used.engineering, budget.engineering) + '</div>'
    + '<div class="cap-bar-row"><div class="cap-bar-label">Product</div>'     + cnxBarHtml(used.product,     budget.product)     + cnxStatsHtml(used.product,     budget.product)     + '</div>'
    + '<div class="cap-bar-row"><div class="cap-bar-label">Design</div>'      + cnxBarHtml(used.design,      budget.design)      + cnxStatsHtml(used.design,      budget.design)      + '</div>'
    + '</div>';

  var bodyHtml = barsHtml
    + '<div style="border-top:1px solid var(--border)">' + initTable + '</div>';

  return UI.cardHeader({
    titleHtml:   titleHtml,
    headerRight: headerRight,
    bodyHtml:    bodyHtml,
    padding:     '0',
    style:       'margin-bottom:16px'
  });
}

// ── Leader block ───────────────────────────────────────────────────────────

function cnxLeaderBlock(name, role, inits) {
  var total = 0;

  var cols = [
    { label: 'Initiative',  width: '25%'                    },
    { label: 'Team',        width: '11%'                    },
    { label: 'Driver',      width: '17%'                    },
    { label: 'Theme',       width: '17%'                    },
    { label: 'Eng',         width: '6%',  align: 'right'   },
    { label: 'Prod',        width: '6%',  align: 'right'   },
    { label: 'Des',         width: '6%',  align: 'right'   },
    { label: 'Total',       width: '7%',  align: 'right'   },
    { label: 'ROI',         width: '5%',  align: 'right'   }
  ];

  var initRows = inits.map(function(ini) {
    total += ini.total;
    return UI.trReadOnly([
      '<div style="font-weight:500;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + ini.title + '">' + ini.title + '</div>',
      '<span style="color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block">' + (ini.team || '—') + '</span>',
      UI.badge(ini.driver || '—', cnxDriverColors[ini.driver] || '#8E8E93', (cnxDriverColors[ini.driver] || '#8E8E93') + '18'),
      '<span style="color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block">' + (ini.theme || '—') + '</span>',
      '<div style="text-align:right;color:var(--muted)">' + (ini.engineering ? Math.round(ini.engineering) + 'd' : '—') + '</div>',
      '<div style="text-align:right;color:var(--muted)">' + (ini.product     ? Math.round(ini.product)     + 'd' : '—') + '</div>',
      '<div style="text-align:right;color:var(--muted)">' + (ini.design      ? Math.round(ini.design)      + 'd' : '—') + '</div>',
      '<div style="text-align:right;font-weight:500;color:var(--text)">' + Math.round(ini.total) + 'd</div>',
      '<div style="text-align:right">' + cnxRoiHtml(ini.roi) + '</div>'
    ]);
  }).join('');

  var m       = cnxMembers.filter(function(x) { return x.name === name; })[0];
  var imgSrc  = m && m.pictureUrl ? m.pictureUrl : null;
  var titleHtml   = UI.avatar(name, role, { size: 32, imgSrc: imgSrc });
  var headerRight = '<span class="cap-team-meta">' + inits.length + ' initiative' + (inits.length !== 1 ? 's' : '') + ' · ' + Math.round(total) + 'd total</span>';

  var tableId  = 'cnx-leader-tbl-' + name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  var tableHtml = UI.tableScroll(cols, initRows, tableId, 0, '', { inCard: true, tableLayout: 'fixed' });

  return UI.cardHeader({
    titleHtml:   titleHtml,
    headerRight: headerRight,
    bodyHtml:    tableHtml,
    padding:     '0',
    style:       'margin-bottom:16px'
  });
}

// ── Tab renders ────────────────────────────────────────────────────────────

function cnxRenderAllocation(q) {
  var teams   = cnxCalc(q);
  var budgets = cnxGetBudgetForQ(q);
  var teamNames = Object.keys(teams); teamNames.sort();

  var totD=0, totE=0, totP=0, budD=0, budE=0, budP=0;
  teamNames.forEach(function(t) {
    totD += teams[t].design;      totE += teams[t].engineering; totP += teams[t].product;
    var b = budgets[t] || { design:0, engineering:0, product:0 };
    budD += b.design; budE += b.engineering; budP += b.product;
  });

  var blocks = teamNames.map(function(t) {
    var b   = budgets[t] || { design:0, engineering:0, product:0 };
    var fte = (cnxBudgets[t] && cnxBudgets[t][q]) || { engineering:0, product:0, design:0 };
    return cnxTeamBlock(t, teams[t], b, teams[t].initiatives, fte);
  }).join('');

  if (!teamNames.length) blocks = '<div class="cap-empty">No initiatives for ' + q + '</div>';

  return '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:20px">'
    + cnxScorecardHtml('Total engineering', totE, budE)
    + cnxScorecardHtml('Total product',     totP, budP)
    + cnxScorecardHtml('Total design',      totD, budD)
    + '</div>'
    + blocks
    + '<div class="cap-legend">'
    +   '<span class="cap-legend-item"><span class="cap-legend-dot" style="background:#2EAD4B"></span>Under 80%</span>'
    +   '<span class="cap-legend-item"><span class="cap-legend-dot" style="background:#E5A100"></span>80–95%</span>'
    +   '<span class="cap-legend-item"><span class="cap-legend-dot" style="background:#E5243B"></span>Over 95%</span>'
    + '</div>';
}

function cnxRenderByEngLead(q) {
  var subset = q === 'all' ? cnxInitiatives.filter(function(i){return i.quarter!=='Backlog';})
    : q === 'backlog' ? cnxInitiatives.filter(function(i){return i.quarter==='Backlog';})
    : cnxInitiatives.filter(function(i){return i.quarter===q;});
  var leaders = {};
  subset.forEach(function(i) {
    var d=parseFloat(i.designDays)||0, e=parseFloat(i.engineeringDays)||0, p=parseFloat(i.productDays)||0;
    var ini = { title:i.title, design:d, engineering:e, product:p, total:d+e+p, driver:i.driver, theme:i.theme, team:i.team, roi:i.roi };
    if (i.techLead) { if (!leaders[i.techLead]) leaders[i.techLead]=[]; leaders[i.techLead].push(ini); }
  });
  var names = Object.keys(leaders); names.sort();
  if (!names.length) return '<div class="cap-empty">No initiatives</div>';
  return names.map(function(n) { return cnxLeaderBlock(n, 'Engineering Lead', leaders[n]); }).join('');
}

function cnxRenderByProdLead(q) {
  var subset = q === 'all' ? cnxInitiatives.filter(function(i){return i.quarter!=='Backlog';})
    : q === 'backlog' ? cnxInitiatives.filter(function(i){return i.quarter==='Backlog';})
    : cnxInitiatives.filter(function(i){return i.quarter===q;});
  var leaders = {};
  subset.forEach(function(i) {
    var d=parseFloat(i.designDays)||0, e=parseFloat(i.engineeringDays)||0, p=parseFloat(i.productDays)||0;
    var ini = { title:i.title, design:d, engineering:e, product:p, total:d+e+p, driver:i.driver, theme:i.theme, team:i.team, roi:i.roi };
    if (i.productOwner) { if (!leaders[i.productOwner]) leaders[i.productOwner]=[]; leaders[i.productOwner].push(ini); }
  });
  var names = Object.keys(leaders); names.sort();
  if (!names.length) return '<div class="cap-empty">No initiatives</div>';
  return names.map(function(n) { return cnxLeaderBlock(n, 'Product Lead', leaders[n]); }).join('');
}

// ── Budget modal ───────────────────────────────────────────────────────────

function cnxBudgetModalHtml() {
  return '<div id="cnx-budget-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:1000;align-items:flex-start;justify-content:center;padding:40px 16px;overflow-y:auto">'
    + '<div style="background:var(--surface);border:1px solid var(--border-md);border-radius:12px;width:100%;max-width:560px;box-shadow:0 8px 40px rgba(0,0,0,.18);padding:28px 28px 20px">'
    +   '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">'
    +     '<div style="font-size:15px;font-weight:600;color:var(--text)">Edit Team Budgets</div>'
    +     '<button onclick="cnxCloseBudgetModal()" style="background:none;border:none;cursor:pointer;color:var(--muted);padding:4px">'
    +       '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    +     '</button>'
    +   '</div>'
    +   '<div style="margin-bottom:14px">'
    +     '<label for="cnx-bud-quarter" style="' + UI.LB + '">Quarter</label>'
    +     '<select id="cnx-bud-quarter" onchange="cnxRefreshBudgetForm()" style="width:100%;height:36px;box-sizing:border-box;' + UI.IF + '">'
    +       ['Q1','Q2','Q3','Q4'].map(function(q) { return '<option value="'+q+'">'+q+'</option>'; }).join('')
    +     '</select>'
    +   '</div>'
    +   '<div id="cnx-bud-rows"></div>'
    +   '<div style="margin-bottom:14px">'
    +     '<div style="font-size:12px;color:var(--muted);margin-bottom:6px">Add new team</div>'
    +     '<div style="display:flex;gap:8px">'
    +       '<input id="cnx-bud-newteam" placeholder="Team name" style="flex:1;' + UI.IF + ';height:36px;box-sizing:border-box" />'
    +       UI.btnSecondary('Add', 'cnxAddBudgetRow()')
    +     '</div>'
    +   '</div>'
    +   '<div id="cnx-bud-err" style="font-size:12px;color:#E5243B;margin-bottom:10px;display:none"></div>'
    +   '<div style="display:flex;justify-content:flex-end;gap:10px;padding-top:8px;border-top:1px solid var(--border)">'
    +     UI.btnCancel('Cancel', 'cnxCloseBudgetModal()')
    +     UI.btnPrimary('Save Budgets', 'cnxSaveBudgets()', 'cnx-bud-save-btn')
    +   '</div>'
    + '</div></div>';
}

function cnxOpenBudgetModal() {
  var modal = document.getElementById('cnx-budget-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  var q = cnxQ || cnxCurrentQ();
  var sel = document.getElementById('cnx-bud-quarter');
  if (sel) sel.value = (['Q1','Q2','Q3','Q4'].indexOf(q) >= 0 ? q : 'Q1');
  cnxRefreshBudgetForm();
}

function cnxCloseBudgetModal() {
  var modal = document.getElementById('cnx-budget-modal');
  if (modal) modal.style.display = 'none';
}

function cnxRefreshBudgetForm() {
  var q   = document.getElementById('cnx-bud-quarter').value;
  var container = document.getElementById('cnx-bud-rows');
  if (!container) return;

  // Collect teams from initiatives + existing budgets
  var teams = [];
  cnxInitiatives.forEach(function(i) { if (i.team && teams.indexOf(i.team) === -1) teams.push(i.team); });
  Object.keys(cnxBudgets).forEach(function(t) { if (teams.indexOf(t) === -1) teams.push(t); });
  teams.sort();

  if (!teams.length) {
    container.innerHTML = '<div style="font-size:12px;color:var(--muted);margin-bottom:12px">No teams yet — add one below.</div>';
    return;
  }

  container.innerHTML = '<div style="display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:6px;margin-bottom:10px">'
    + '<div style="font-size:11px;font-weight:500;color:var(--faint);text-transform:uppercase;letter-spacing:.4px">Team</div>'
    + '<div style="font-size:11px;font-weight:500;color:var(--faint);text-transform:uppercase;letter-spacing:.4px;text-align:right">Engineering d</div>'
    + '<div style="font-size:11px;font-weight:500;color:var(--faint);text-transform:uppercase;letter-spacing:.4px;text-align:right">Product d</div>'
    + '<div style="font-size:11px;font-weight:500;color:var(--faint);text-transform:uppercase;letter-spacing:.4px;text-align:right">Design d</div>'
    + '</div>'
    + teams.map(function(t) {
        var b = cnxGetBudget(t, q);
        return '<div style="display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:6px;margin-bottom:8px;align-items:center">'
          + '<div style="font-size:12px;font-weight:500;color:var(--text)">' + t + '</div>'
          + '<input type="number" min="0" class="cnx-bud-input" data-team="'+t+'" data-disc="engineering"  value="'+(b.engineering || 0)+'" style="'+UI.IF+';text-align:right" />'
          + '<input type="number" min="0" class="cnx-bud-input" data-team="'+t+'" data-disc="product"      value="'+(b.product     || 0)+'" style="'+UI.IF+';text-align:right" />'
          + '<input type="number" min="0" class="cnx-bud-input" data-team="'+t+'" data-disc="design"       value="'+(b.design      || 0)+'" style="'+UI.IF+';text-align:right" />'
          + '</div>';
      }).join('');
}

function cnxAddBudgetRow() {
  var input = document.getElementById('cnx-bud-newteam');
  var name  = input ? input.value.trim() : '';
  if (!name) return;
  // Add team to initiatives temporarily so it shows in the form
  var q = document.getElementById('cnx-bud-quarter').value;
  if (!cnxBudgets[name]) cnxBudgets[name] = {};
  if (!cnxBudgets[name][q]) cnxBudgets[name][q] = { design:0, engineering:0, product:0 };
  if (input) input.value = '';
  cnxRefreshBudgetForm();
}

function cnxSaveBudgets() {
  var q = document.getElementById('cnx-bud-quarter').value;
  var inputs = document.querySelectorAll('.cnx-bud-input');
  var pending = [];
  var byTeam = {};
  inputs.forEach(function(inp) {
    var team = inp.dataset.team, disc = inp.dataset.disc;
    if (!byTeam[team]) byTeam[team] = { design:0, engineering:0, product:0 };
    byTeam[team][disc] = parseFloat(inp.value) || 0;
  });

  var teams = Object.keys(byTeam);
  if (!teams.length) { cnxCloseBudgetModal(); return; }

  var btn = document.getElementById('cnx-bud-save-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }

  var promises = teams.map(function(team) {
    return fetch('/api/neon/budget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        team:            team,
        quarter:         q,
        designDays:      byTeam[team].design,
        engineeringDays: byTeam[team].engineering,
        productDays:     byTeam[team].product
      })
    }).then(function(r) { return r.json(); });
  });

  Promise.all(promises)
    .then(function() {
      cnxCloseBudgetModal();
      cnxLoadAndRender();
    })
    .catch(function(e) {
      var err = document.getElementById('cnx-bud-err');
      if (err) { err.textContent = e.message; err.style.display = 'block'; }
      if (btn) { btn.disabled = false; btn.textContent = 'Save Budgets'; }
    });
}

// ── Content switch ─────────────────────────────────────────────────────────

function cnxSwitchQ(q) {
  cnxQ = q;
  var qEl = document.getElementById('cnx-qfilter');
  if (qEl) qEl.innerHTML = UI.chipsNavSm(CNX_Q_OPTS, q, 'cnxSwitchQ');
  cnxRerenderTabContent();
}

function cnxRerenderTabContent() {
  var q = cnxQ || cnxCurrentQ();
  var panels = { allocation: 'cnx-tab-allocation', englead: 'cnx-tab-englead', prodlead: 'cnx-tab-prodlead' };
  Object.keys(panels).forEach(function(tab) {
    var el = document.getElementById(panels[tab]);
    if (!el) return;
    if (tab === 'allocation') el.innerHTML = cnxRenderAllocation(q);
    else if (tab === 'englead') el.innerHTML = cnxRenderByEngLead(q);
    else if (tab === 'prodlead') el.innerHTML = cnxRenderByProdLead(q);
  });
}

function cnxSwitchTab(tab) {
  cnxActiveTab = tab;
  var pillsEl = document.getElementById('cnx-tabpills');
  if (pillsEl) pillsEl.innerHTML = UI.pills(CNX_TABS, tab, 'cnxSwitchTab');
  ['allocation','englead','prodlead'].forEach(function(t) {
    var el = document.getElementById('cnx-tab-' + t);
    if (el) el.style.display = t === tab ? '' : 'none';
  });
}

// ── API — load ─────────────────────────────────────────────────────────────

function cnxLoadAndRender() {
  var container = document.getElementById('cnx-content');
  if (!container) return;

  container.innerHTML = typeof _KERV_LOADER_HTML !== 'undefined' ? _KERV_LOADER_HTML : '<div class="kerv-loader"><div class="kerv-loader-mark"><img src="https://res.cloudinary.com/dhfrgr4qd/image/upload/v1775830255/Kerv-Logo-1-1_bl2xdt.jpg" alt=""></div><div class="kerv-loader-text">Loading</div></div>';

  Promise.all([
    fetch('/api/neon/initiatives').then(function(r) { return r.json(); }),
    fetch('/api/neon/budget').then(function(r) { return r.json(); }),
    fetch('/api/neon/assumptions').then(function(r) { return r.json(); }),
    fetch('/api/neon/team-members').then(function(r) { return r.json(); })
  ])
  .then(function(results) {
    cnxAllInitiatives = Array.isArray(results[0]) ? results[0] : [];
    cnxInitiatives    = cnxAllInitiatives.filter(function(i) {
      return (parseInt(i.year) || new Date().getFullYear()) === cnxSelYear;
    });
    cnxBudgets     = (results[1] && typeof results[1] === 'object' && !results[1].error) ? results[1] : {};
    // Keep only global assumptions (no initiative_id) for FTE→days conversion
    cnxAssumptions = Array.isArray(results[2])
      ? results[2].filter(function(a) { return !a.initiativeId; })
      : [];
    cnxMembers     = Array.isArray(results[3]) ? results[3] : [];
    cnxBuildColorMaps();
    if (!cnxQ) cnxQ = cnxCurrentQ();
    container.innerHTML = cnxBuildInner();
    var cnxYnEl = document.getElementById('cnx-year-nav');
    if (cnxYnEl) cnxYnEl.innerHTML = rnxBuildYearNav('cnx', cnxAllInitiatives, cnxSelYear);
  })
  .catch(function(err) {
    container.innerHTML = UI.alertBanner('error', 'Failed to load data', String(err));
  });
}

// ── Build inner HTML ───────────────────────────────────────────────────────

function cnxBuildInner() {
  var q = cnxQ || cnxCurrentQ();

  return UI.pageNavBar({
    tabs:       CNX_TABS,    activeTab:  cnxActiveTab, onTabFn:   'cnxSwitchTab', pillsId:   'cnx-tabpills',
    chips:      CNX_Q_OPTS,  activeChip: q,            onChipFn:  'cnxSwitchQ',   chipsId:   'cnx-qfilter'
  })
    + '<div id="cnx-tab-allocation" style="' + (cnxActiveTab==='allocation'?'':'display:none') + '">' + cnxRenderAllocation(q) + '</div>'
    + '<div id="cnx-tab-englead"    style="' + (cnxActiveTab==='englead'   ?'':'display:none') + '">' + cnxRenderByEngLead(q)  + '</div>'
    + '<div id="cnx-tab-prodlead"   style="' + (cnxActiveTab==='prodlead'  ?'':'display:none') + '">' + cnxRenderByProdLead(q) + '</div>'
    + cnxBudgetModalHtml();
}

// ── Main render ────────────────────────────────────────────────────────────

function cnxSetYear(y) {
  cnxSelYear     = y;
  cnxInitiatives = cnxAllInitiatives.filter(function(i) {
    return (parseInt(i.year) || new Date().getFullYear()) === cnxSelYear;
  });
  var container = document.getElementById('cnx-content');
  if (container) {
    container.innerHTML = cnxBuildInner();
  }
  var cnxYnEl = document.getElementById('cnx-year-nav');
  if (cnxYnEl) cnxYnEl.innerHTML = rnxBuildYearNav('cnx', cnxAllInitiatives, cnxSelYear);
}

function renderTeamCapacityNeon() {
  var canEdit   = typeof _kervCan === 'function' && _kervCan('roadmap-neon', 'editor');
  var canManage = typeof _kervCan === 'function' && (_kervCan('roadmap-neon', 'editor') || _kervCan('teamcapacity-neon', 'editor'));

  var PLUS_SVG     = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  var SETTINGS_SVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><circle cx="12" cy="4" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="14" cy="20" r="2"/></svg>';

  var addBtn      = UI.btnPrimary('<span style="display:inline-flex;align-items:center;gap:6px">' + PLUS_SVG + 'Add Initiative</span>', 'window._rnxPendingModal=null;setPage(\'roadmap-neon\',\'Product Roadmap\')');
  var settingsBtn = UI.btnIconBordered('rnxOpenSettings()', 'Settings', SETTINGS_SVG);
  var toolsMenu   = rnxToolsMenuHtml();

  var yearNavHtml = '<div id="cnx-year-nav" style="display:inline-flex"></div>';
  var rightHtml   = '<div style="display:flex;align-items:center;gap:8px">'
    + (canEdit ? addBtn : '')
    + toolsMenu
    + (canManage ? settingsBtn : '')
    + '</div>';

  var html = UI.pageHeaderWithYear({
    title:       'Team Capacity',
    yearNavHtml: yearNavHtml,
    subtitle:    'Capacity Budget utilization by team and discipline',
    titleRight:  rightHtml,
    mb:          '28px'
  })
  + '<div id="cnx-content"></div>';

  setTimeout(cnxLoadAndRender, 0);
  return html;
}
