// sdt-sprint-analysis.js — XTS Team dashboard

// ── Data globals (populated from Jira API) ─────────────────────────────────

var XTS_SPRINTS  = [];   // [{id, name, start, end, status, planned, completed, ...}]
var XTS_CAPACITY = {};   // { [sprintId]: [{name, initials, role, capacity, assigned, completed, ticketsAssigned, ticketsCompleted}] }
var XTS_TICKETS  = {};   // { [sprintId]: [{id, title, type, pts, assignee, status}] } — loaded on demand

// ── State ──────────────────────────────────────────────────────────────────

var xtsSelectedId  = null;
var xtsCharts      = {};

// ── Entry point ────────────────────────────────────────────────────────────

function renderSdtSprintAnalysis() {
  return '<div id="xts-root">' + xtsShell() + '</div>';
}

function xtsInit() {
  xtsLoadFromJira();
}

// ── Jira data loading ──────────────────────────────────────────────────────

function xtsLoadFromJira() {
  // Show loading placeholder in sprint strip
  var strip = document.getElementById('xts-strip');
  if (strip) {
    strip.style.gridTemplateColumns = '1fr';
    strip.innerHTML = '<div style="padding:20px;text-align:center;font-size:12px;color:var(--muted)">'
      + '<span style="display:inline-block;width:14px;height:14px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:ld-spin .7s linear infinite;vertical-align:middle;margin-right:8px"></span>'
      + 'Loading sprint data from Jira…</div>';
  }

  fetch('/api/jira/sprints')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!data.ok) throw new Error(data.error || 'Jira API error');

      // Populate globals from Jira data
      XTS_SPRINTS  = data.sprints || [];
      XTS_CAPACITY = {};
      XTS_SPRINTS.forEach(function(s) { XTS_CAPACITY[s.id] = s.members || []; });
      XTS_TICKETS  = {};

      // Default selection: active sprint, or last one
      var active = XTS_SPRINTS.filter(function(s) { return s.jiraState === 'active'; })[0];
      xtsSelectedId = active ? active.id : (XTS_SPRINTS[XTS_SPRINTS.length - 1] || {}).id;

      // Load tickets for selected sprint, then render everything
      xtsLoadSprintTickets(xtsSelectedId, function() {
        xtsRenderAll();
      });
    })
    .catch(function(e) {
      console.error('[xts] Jira load failed:', e.message);
      var root = document.getElementById('xts-root');
      if (root) root.innerHTML = ''
        + '<div style="padding:32px 0">'
        +   '<div style="font-size:22px;font-weight:600;color:var(--text);letter-spacing:-.3px;margin-bottom:8px">XTS Team</div>'
        +   '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;max-width:480px">'
        +     '<div style="font-size:13px;font-weight:600;color:#EF4444;margin-bottom:6px">Could not load Jira data</div>'
        +     '<div style="font-size:12px;color:var(--muted);font-family:monospace">' + e.message + '</div>'
        +   '</div>'
        + '</div>';
    });
}

// Load individual tickets for a sprint on demand; calls cb() when done
function xtsLoadSprintTickets(sprintId, cb) {
  if (!sprintId) { if (cb) cb(); return; }
  if (XTS_TICKETS[sprintId] !== undefined) { if (cb) cb(); return; }

  fetch('/api/jira/issues?sprintId=' + sprintId)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      XTS_TICKETS[sprintId] = data.ok ? (data.issues || []) : [];
      if (cb) cb();
    })
    .catch(function() {
      XTS_TICKETS[sprintId] = [];
      if (cb) cb();
    });
}

function xtsRenderAll() {
  // Restore strip grid columns
  var strip = document.getElementById('xts-strip');
  if (strip) strip.style.gridTemplateColumns = 'repeat(' + Math.min(XTS_SPRINTS.length, 5) + ',1fr)';
  xtsRenderStrip();
  xtsRenderStats();
  xtsRenderVelocityChart();
  xtsRenderCompletionChart();
  xtsRenderBugChart();
  xtsRenderMemberTrend();
  xtsRenderTrendSummary();
  xtsRenderSummary();
  xtsRenderCapacity();
  xtsRenderTicketCharts();
  xtsRenderTicketTable();
}

function xtsRenderTrendSummary() {
  if (typeof renderInsightBox !== 'function' || typeof sprintTrendInsights !== 'function') return;
  renderInsightBox('xts-trend-insights', 'Sprint Trend', sprintTrendInsights(XTS_SPRINTS));
}

// ── Shell HTML (static skeleton) ──────────────────────────────────────────

var _XTS_CARD = 'background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:16px';
var _XTS_SEC  = 'font-size:13px;font-weight:600;color:var(--text);letter-spacing:-.2px;margin-bottom:12px';

function xtsShell() {
  return ''
    // ── Page header ──
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">'
    +   '<div>'
    +     '<div style="font-size:20px;font-weight:600;color:var(--text);letter-spacing:-.3px">XTS Team</div>'
    +     '<div style="font-size:12px;color:var(--muted);margin-top:2px">Sprint analytics & velocity tracking</div>'
    +   '</div>'
    +   '<div id="xts-sprint-badge"></div>'
    + '</div>'

    // ══ SECTION: Sprint Trend ══
    + '<div style="' + _XTS_SEC + '">Sprint Trend</div>'

    // ── Sprint Trend insights ──
    + '<div id="xts-trend-insights" style="margin-bottom:16px"></div>'

    // ── Stats (2×2) + member trend + Velocity ──
    + '<div style="display:grid;grid-template-columns:460px 1fr;gap:12px;margin-bottom:12px">'
    +   '<div style="display:flex;flex-direction:column;gap:8px">'
    +     '<div id="xts-stats" style="display:grid;grid-template-columns:1fr 1fr;gap:8px"></div>'
    +     '<div style="' + _XTS_CARD + ';padding:12px;flex:1">'
    +       '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
    +         '<span style="font-size:11px;font-weight:600;color:var(--text)">Points trend</span>'
    +         '<select id="xts-member-sel" onchange="xtsRenderMemberTrend()" style="font-size:10px;font-family:inherit;border:1px solid var(--border);border-radius:5px;background:var(--surface);color:var(--text);padding:2px 6px;outline:none;cursor:pointer"></select>'
    +       '</div>'
    +       '<canvas id="xts-member-trend-chart" height="100"></canvas>'
    +     '</div>'
    +   '</div>'
    +   '<div style="' + _XTS_CARD + '">'
    +     '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:2px">Velocity</div>'
    +     '<div style="font-size:10px;color:var(--muted);margin-bottom:10px">Planned vs completed story points</div>'
    +     '<canvas id="xts-velocity-chart" height="110"></canvas>'
    +   '</div>'
    + '</div>'

    // ── Completion Rate + Bug Trend ──
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">'
    +   '<div style="' + _XTS_CARD + '">'
    +     '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:2px">Completion Rate</div>'
    +     '<div style="font-size:10px;color:var(--muted);margin-bottom:10px">% of planned points delivered</div>'
    +     '<canvas id="xts-completion-chart" height="100"></canvas>'
    +   '</div>'
    +   '<div style="' + _XTS_CARD + '">'
    +     '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:2px">Bug Trend</div>'
    +     '<div style="font-size:10px;color:var(--muted);margin-bottom:10px">Bugs introduced vs resolved</div>'
    +     '<canvas id="xts-bug-chart" height="100"></canvas>'
    +   '</div>'
    + '</div>'

    // ══ SECTION: Key Metrics by Sprint ══
    + '<div style="' + _XTS_SEC + '">Key Metrics by Sprint</div>'

    // ── Sprint selector strip ──
    + '<div id="xts-strip" style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:12px"></div>'

    // ── Sprint summary ──
    + '<div id="xts-summary" style="margin-bottom:20px"></div>'

    // ── Capacity + Ticket mix ──
    + '<div style="display:grid;grid-template-columns:1fr 220px;gap:12px;margin-bottom:12px;align-items:stretch">'
    +   '<div style="' + _XTS_CARD + ';display:flex;flex-direction:column">'
    +     '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:2px">Capacity — <span id="xts-cap-sprint-lbl" style="color:var(--accent)"></span></div>'
    +     '<div style="font-size:10px;color:var(--muted);margin-bottom:12px">Story points assigned vs completed per engineer</div>'
    +     '<div id="xts-capacity-wrap" style="position:relative;flex:1;min-height:80px"><canvas id="xts-capacity-chart"></canvas></div>'
    +   '</div>'
    +   '<div style="' + _XTS_CARD + '">'
    +     '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:2px">Ticket mix — <span id="xts-tkt-sprint-lbl" style="color:var(--accent)"></span></div>'
    +     '<div style="font-size:10px;color:var(--muted);margin-bottom:12px">By type</div>'
    +     '<canvas id="xts-ticket-type-chart" height="140"></canvas>'
    +     '<div id="xts-ticket-type-legend" style="margin-top:10px"></div>'
    +   '</div>'
    + '</div>'

    // ── Ticket table ──
    + '<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:32px">'
    +   '<div style="padding:12px 16px 10px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">'
    +     '<div style="font-size:12px;font-weight:600;color:var(--text)">Tickets — <span id="xts-tbl-sprint-lbl" style="color:var(--accent)"></span></div>'
    +     '<span id="xts-tbl-count" style="font-size:11px;color:var(--muted)"></span>'
    +   '</div>'
    +   '<div id="xts-ticket-table"></div>'
    + '</div>';
}

// ── Sprint strip ──────────────────────────────────────────────────────────

function xtsRenderStrip() {
  var el = document.getElementById('xts-strip');
  if (!el) return;

  // Badge — show active sprint in header
  var activeSprint = XTS_SPRINTS.filter(function(s) { return s.status === 'in-progress'; })[0];
  var badge = document.getElementById('xts-sprint-badge');
  if (badge && activeSprint) {
    badge.innerHTML = '<div style="display:flex;align-items:center;gap:8px">'
      + '<span style="width:7px;height:7px;border-radius:50%;background:#10B981;flex-shrink:0"></span>'
      + '<span style="font-size:12px;font-weight:500;color:var(--text)">' + activeSprint.name + ' · In progress</span>'
      + '<span style="font-size:11px;color:var(--muted)">' + activeSprint.start + ' – ' + activeSprint.end + '</span>'
      + '</div>';
  }

  el.innerHTML = XTS_SPRINTS.map(function(s) {
    var sel = s.id === xtsSelectedId;
    var border = sel ? '2px solid var(--accent)' : '1px solid var(--border)';
    var shadow = sel ? 'box-shadow:0 0 0 3px rgba(99,102,241,.1);' : '';

    // ── Progress bar ──
    var progressBar;
    if (s.status === 'in-progress') {
      // Segmented: done (green) + wip (indigo) over gray background
      var total   = (s.byStatus.todo || 0) + (s.byStatus.inprogress || 0) + (s.byStatus.review || 0) + (s.byStatus.done || 0);
      var donePct = total > 0 ? Math.round(s.byStatus.done / total * 100) : 0;
      var wipPct  = total > 0 ? Math.round(((s.byStatus.inprogress || 0) + (s.byStatus.review || 0)) / total * 100) : 0;
      progressBar = '<div style="height:4px;background:var(--border);border-radius:2px;overflow:hidden;margin-bottom:6px">'
        + '<div style="height:100%;display:flex">'
        +   '<div style="width:' + donePct + '%;background:#10B981;transition:width .3s"></div>'
        +   '<div style="width:' + wipPct  + '%;background:#6366F1;transition:width .3s"></div>'
        + '</div></div>';
    } else if (s.status === 'future') {
      progressBar = '<div style="height:4px;background:var(--border);border-radius:2px;margin-bottom:6px"></div>';
    } else {
      var pct    = s.planned > 0 ? Math.round(s.completed / s.planned * 100) : 0;
      var color  = pct >= 90 ? '#10B981' : pct >= 70 ? '#F59E0B' : '#EF4444';
      progressBar = '<div style="height:4px;background:var(--border);border-radius:2px;overflow:hidden;margin-bottom:6px">'
        + '<div style="height:100%;width:' + pct + '%;background:' + color + ';border-radius:2px"></div>'
        + '</div>';
    }

    // ── Value line ──
    var valueLine;
    if (s.status === 'future') {
      valueLine = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">'
        + '<span style="font-size:16px;font-weight:700;color:var(--muted)">—</span>'
        + '<span style="font-size:10px;color:var(--muted)">' + s.planned + ' pts planned</span>'
        + '</div>';
    } else {
      valueLine = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">'
        + '<span style="font-size:16px;font-weight:700;color:var(--text)">' + s.completed + '</span>'
        + '<span style="font-size:10px;color:var(--muted)">/ ' + s.planned + ' pts</span>'
        + '</div>';
    }

    // ── Status badge ──
    var statusLabel;
    if (s.status === 'in-progress') {
      statusLabel = '<span style="font-size:10px;font-weight:500;color:#3B82F6;background:#EFF6FF;border-radius:20px;padding:1px 7px">In progress</span>';
    } else if (s.status === 'future') {
      statusLabel = '<span style="font-size:10px;font-weight:500;color:#9CA3AF;background:var(--subtle);border-radius:20px;padding:1px 7px">Upcoming</span>';
    } else {
      var pct2 = s.planned > 0 ? Math.round(s.completed / s.planned * 100) : 0;
      statusLabel = pct2 >= 90
        ? '<span style="font-size:10px;font-weight:500;color:#10B981;background:#F0FDF4;border-radius:20px;padding:1px 7px">Completed</span>'
        : '<span style="font-size:10px;font-weight:500;color:#F59E0B;background:#FFFBEB;border-radius:20px;padding:1px 7px">Partial</span>';
    }

    return '<div onclick="xtsSelectSprint(' + s.id + ')" style="background:var(--surface);border:' + border + ';border-radius:10px;padding:12px 14px;cursor:pointer;transition:border-color .15s,box-shadow .15s;' + shadow + '">'
      + '<div style="font-size:11px;font-weight:600;color:var(--text);margin-bottom:1px">' + s.name + '</div>'
      + '<div style="font-size:10px;color:var(--muted);margin-bottom:8px">' + s.start + ' – ' + s.end + '</div>'
      + progressBar
      + valueLine
      + statusLabel
      + '</div>';
  }).join('');
}

// ── Right-column stats ────────────────────────────────────────────────────

function xtsRenderStats() {
  var el = document.getElementById('xts-stats');
  if (!el) return;

  var completed  = XTS_SPRINTS.filter(function(s) { return s.status === 'completed'; });
  var avgVel     = completed.length ? Math.round(completed.reduce(function(a, s) { return a + s.completed; }, 0) / completed.length) : 0;
  var last       = completed[completed.length - 1];
  var prev       = completed.length > 1 ? completed[completed.length - 2] : null;
  var delta      = prev ? last.completed - prev.completed : 0;
  var deltaColor = delta > 0 ? '#10B981' : delta < 0 ? '#EF4444' : '#9CA3AF';
  var deltaLabel = (delta > 0 ? '▲ ' : delta < 0 ? '▼ ' : '') + Math.abs(delta) + ' pts vs prev';

  var compSprints = completed.filter(function(s) { return s.planned > 0; });
  var avgComp    = compSprints.length ? Math.round(compSprints.reduce(function(a, s) { return a + (s.completed / s.planned * 100); }, 0) / compSprints.length) : 0;
  var predictability = Math.min(100, Math.round(avgComp * 0.95));

  // Carryover: last 3 vs prev 3 sprints
  var last3carry = XTS_SPRINTS.slice(-3).reduce(function(a, s) { return a + s.carryover; }, 0);
  var prev3carry = XTS_SPRINTS.length > 3 ? XTS_SPRINTS.slice(-6, -3).reduce(function(a, s) { return a + s.carryover; }, 0) : null;
  var carryDelta = prev3carry !== null ? last3carry - prev3carry : null;
  // Lower carryover = better → green when delta < 0
  var carryColor = last3carry === 0 ? '#10B981' : carryDelta === null ? (last3carry <= 5 ? '#10B981' : last3carry <= 12 ? '#F59E0B' : '#EF4444') : carryDelta < 0 ? '#10B981' : carryDelta > 0 ? '#EF4444' : '#9CA3AF';
  var carrySub   = carryDelta === null
    ? 'last 3 sprints'
    : '<span style="color:' + (carryDelta < 0 ? '#10B981' : carryDelta > 0 ? '#EF4444' : '#9CA3AF') + '">'
      + (carryDelta < 0 ? '▼ ' : carryDelta > 0 ? '▲ ' : '— ')
      + Math.abs(carryDelta) + ' vs prev 3</span>';

  el.innerHTML = xtsStatMini('Avg Velocity', avgVel + ' pts', '<span style="font-size:10px;color:' + deltaColor + '">' + deltaLabel + '</span>', '#6366F1')
    + xtsStatMini('Avg Completion', avgComp + '%', 'across last ' + completed.length + ' sprints', avgComp >= 90 ? '#10B981' : avgComp >= 75 ? '#F59E0B' : '#EF4444')
    + xtsStatMini('Predictability', predictability + '%', 'planned vs delivered ratio', predictability >= 85 ? '#10B981' : '#F59E0B')
    + xtsStatMini('Carryover · last 3', last3carry + ' tickets', carrySub, carryColor);
}

function xtsStatMini(label, value, sub, color) {
  return '<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px 12px">'
    + '<div style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);margin-bottom:4px">' + label + '</div>'
    + '<div style="font-size:18px;font-weight:700;color:' + color + ';letter-spacing:-.5px;line-height:1;margin-bottom:3px">' + value + '</div>'
    + '<div style="font-size:9px;color:var(--muted);line-height:1.3">' + sub + '</div>'
    + '</div>';
}

// ── Velocity chart ────────────────────────────────────────────────────────

function xtsRenderVelocityChart() {
  if (xtsCharts.velocity) { xtsCharts.velocity.destroy(); delete xtsCharts.velocity; }
  var canvas = document.getElementById('xts-velocity-chart');
  if (!canvas) return;

  xtsCharts.velocity = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: XTS_SPRINTS.map(function(s) { return s.name; }),
      datasets: [
        {
          label: 'Planned',
          data: XTS_SPRINTS.map(function(s) { return s.planned; }),
          backgroundColor: 'rgba(99,102,241,.25)',
          borderWidth: 0,
          borderRadius: 4
        },
        {
          label: 'Completed',
          data: XTS_SPRINTS.map(function(s) { return s.completed; }),
          backgroundColor: function(ctx) {
            var s = XTS_SPRINTS[ctx.dataIndex];
            var pct = s.completed / s.planned;
            return pct >= 0.9 ? 'rgba(16,185,129,.7)' : pct >= 0.7 ? 'rgba(245,158,11,.7)' : 'rgba(239,68,68,.7)';
          },
          borderColor: 'transparent',
          borderRadius: 4
        }
      ]
    },
    options: xtsChartOpts({
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 8, font: { size: 10, family: 'inherit' }, padding: 10,
            generateLabels: function(chart) {
              var labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
              labels.forEach(function(l) {
                if (l.text === 'Completed') { l.fillStyle = 'rgba(16,185,129,.7)'; l.strokeStyle = 'transparent'; }
              });
              return labels;
            }
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10, family: 'inherit' } }, border: { display: false } },
        y: { grid: { color: 'rgba(0,0,0,.05)' }, ticks: { font: { size: 10, family: 'inherit' } }, border: { display: false }, beginAtZero: true }
      }
    })
  });
}

// ── Completion rate chart ─────────────────────────────────────────────────

function xtsRenderCompletionChart() {
  if (xtsCharts.completion) { xtsCharts.completion.destroy(); delete xtsCharts.completion; }
  var canvas = document.getElementById('xts-completion-chart');
  if (!canvas) return;

  var target = 85;
  var pcts   = XTS_SPRINTS.map(function(s) { return Math.round(s.completed / s.planned * 100); });

  xtsCharts.completion = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: XTS_SPRINTS.map(function(s) { return s.name; }),
      datasets: [
        {
          label: 'Completion %',
          data: pcts,
          borderColor: '#6366F1',
          backgroundColor: 'rgba(99,102,241,.08)',
          borderWidth: 2,
          pointRadius: 5,
          pointBackgroundColor: pcts.map(function(p) { return p >= target ? '#10B981' : '#EF4444'; }),
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: .35,
          fill: true
        },
        {
          label: 'Target (85%)',
          data: XTS_SPRINTS.map(function() { return target; }),
          borderColor: 'rgba(245,158,11,.6)',
          borderWidth: 1.5,
          borderDash: [5, 4],
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: xtsChartOpts({
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 10, family: 'inherit' }, padding: 10 } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10, family: 'inherit' } }, border: { display: false } },
        y: {
          grid: { color: 'rgba(0,0,0,.05)' },
          ticks: { font: { size: 10, family: 'inherit' }, callback: function(v) { return v + '%'; } },
          border: { display: false },
          min: 50, max: 110
        }
      }
    })
  });
}

// ── Bug trend chart ───────────────────────────────────────────────────────

function xtsRenderBugChart() {
  if (xtsCharts.bug) { xtsCharts.bug.destroy(); delete xtsCharts.bug; }
  var canvas = document.getElementById('xts-bug-chart');
  if (!canvas) return;

  xtsCharts.bug = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: XTS_SPRINTS.map(function(s) { return s.name; }),
      datasets: [
        {
          label: 'Introduced',
          data: XTS_SPRINTS.map(function(s) { return s.bugsIntroduced; }),
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239,68,68,.1)',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#EF4444',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: .35,
          fill: true
        },
        {
          label: 'Resolved',
          data: XTS_SPRINTS.map(function(s) { return s.bugsResolved; }),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16,185,129,.08)',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: .35,
          fill: true
        }
      ]
    },
    options: xtsChartOpts({
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 10, family: 'inherit' }, padding: 10 } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10, family: 'inherit' } }, border: { display: false } },
        y: { grid: { color: 'rgba(0,0,0,.05)' }, ticks: { font: { size: 10, family: 'inherit' }, stepSize: 1 }, border: { display: false }, beginAtZero: true }
      }
    })
  });
}

// ── Member ticket trend chart ─────────────────────────────────────────────

function xtsRenderMemberTrend() {
  if (xtsCharts.memberTrend) { xtsCharts.memberTrend.destroy(); delete xtsCharts.memberTrend; }
  var canvas = document.getElementById('xts-member-trend-chart');
  var sel    = document.getElementById('xts-member-sel');
  if (!canvas || !XTS_SPRINTS.length) return;

  // Build member list from all sprints
  var allMembers = [];
  XTS_SPRINTS.forEach(function(s) {
    (XTS_CAPACITY[s.id] || []).forEach(function(m) {
      if (m.name !== 'Unassigned' && allMembers.indexOf(m.name) === -1) allMembers.push(m.name);
    });
  });
  allMembers.sort();

  // Populate selector (only on first render)
  if (sel && sel.options.length === 0) {
    sel.innerHTML = '<option value="All">All members</option>'
      + allMembers.map(function(n) { return '<option value="' + n + '">' + n.split(' ')[0] + '</option>'; }).join('');
  }

  var member = sel ? sel.value : 'All';
  var labels = XTS_SPRINTS.map(function(s) { return s.name.replace('SDT ', ''); });

  var assigned  = XTS_SPRINTS.map(function(s) {
    var ms = XTS_CAPACITY[s.id] || [];
    if (member === 'All') return ms.reduce(function(a, m) { return a + (m.assigned || 0); }, 0);
    var m = ms.filter(function(x) { return x.name === member; })[0];
    return m ? (m.assigned || 0) : 0;
  });

  var closed = XTS_SPRINTS.map(function(s) {
    var ms = XTS_CAPACITY[s.id] || [];
    if (member === 'All') return ms.reduce(function(a, m) { return a + (m.completed || 0); }, 0);
    var m = ms.filter(function(x) { return x.name === member; })[0];
    return m ? (m.completed || 0) : 0;
  });

  xtsCharts.memberTrend = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Assigned pts',
          data: assigned,
          borderColor: '#6366F1',
          backgroundColor: 'rgba(99,102,241,.08)',
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: '#6366F1',
          pointBorderColor: '#fff',
          pointBorderWidth: 1.5,
          tension: .35,
          fill: true
        },
        {
          label: 'Completed pts',
          data: closed,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16,185,129,.06)',
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#fff',
          pointBorderWidth: 1.5,
          tension: .35,
          fill: true
        }
      ]
    },
    options: xtsChartOpts({
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 7, font: { size: 9, family: 'inherit' }, padding: 8 } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 9, family: 'inherit' } }, border: { display: false } },
        y: { grid: { color: 'rgba(0,0,0,.05)' }, ticks: { font: { size: 9, family: 'inherit' }, stepSize: 1, precision: 0 }, border: { display: false }, beginAtZero: true }
      }
    })
  });
}

// ── Ticket type + status charts ───────────────────────────────────────────

function xtsRenderTicketCharts() {
  xtsRenderTicketType();
}

function xtsRenderTicketType() {
  if (xtsCharts.ticketType) { xtsCharts.ticketType.destroy(); delete xtsCharts.ticketType; }
  var canvas = document.getElementById('xts-ticket-type-chart');
  var legEl  = document.getElementById('xts-ticket-type-legend');
  var lbl    = document.getElementById('xts-tkt-sprint-lbl');
  if (!canvas) return;

  var s = XTS_SPRINTS.filter(function(x) { return x.id === xtsSelectedId; })[0];
  if (!s) return;
  if (lbl) lbl.textContent = s.name;

  var labels = ['Story', 'Bug', 'Task', 'Spike', 'Epic'];
  var data   = [s.tickets.story, s.tickets.bug, s.tickets.task, s.tickets.spike, s.tickets.epic || 0];
  var colors = ['#6366F1', '#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6'];
  var total  = data.reduce(function(a, v) { return a + v; }, 0);

  xtsCharts.ticketType = new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: { labels: labels, datasets: [{ data: data, backgroundColor: colors, borderWidth: 2, borderColor: '#fff', hoverOffset: 4 }] },
    options: {
      responsive: true, cutout: '68%',
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(ctx) { return ' ' + ctx.label + ': ' + ctx.raw + ' tickets'; } } } }
    }
  });

  if (legEl) {
    legEl.innerHTML = labels.map(function(l, i) {
      return '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">'
        + '<div style="display:flex;align-items:center;gap:5px">'
        +   '<span style="width:7px;height:7px;border-radius:2px;background:' + colors[i] + ';flex-shrink:0"></span>'
        +   '<span style="font-size:10px;color:var(--text)">' + l + '</span>'
        + '</div>'
        + '<span style="font-size:10px;font-weight:600;color:var(--text)">' + data[i] + '</span>'
        + '</div>';
    }).join('');
  }
}


// ── Capacity chart ────────────────────────────────────────────────────────

function xtsRenderCapacity() {
  if (xtsCharts.capacity) { xtsCharts.capacity.destroy(); delete xtsCharts.capacity; }
  var canvas = document.getElementById('xts-capacity-chart');
  var lbl    = document.getElementById('xts-cap-sprint-lbl');
  if (!canvas) return;

  var s = XTS_SPRINTS.filter(function(x) { return x.id === xtsSelectedId; })[0];
  if (!s) return;
  if (lbl) lbl.textContent = s.name;

  var members  = XTS_CAPACITY[xtsSelectedId] || [];
  var names    = members.map(function(m) { return m.name.split(' ')[0]; });
  var assigned = members.map(function(m) { return m.assigned; });
  var done     = members.map(function(m) { return m.completed; });

  xtsCharts.capacity = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: names,
      datasets: [
        {
          label: 'Assigned',
          data: assigned,
          backgroundColor: 'rgba(99,102,241,.25)',
          borderWidth: 0,
          borderRadius: 4
        },
        {
          label: 'Completed',
          data: done,
          backgroundColor: 'rgba(16,185,129,.7)',
          borderColor: 'transparent',
          borderRadius: 4
        }
      ]
    },
    options: xtsChartOpts({
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 10, family: 'inherit' }, padding: 10 } } },
      scales: {
        x: { grid: { color: 'rgba(0,0,0,.05)' }, ticks: { font: { size: 10, family: 'inherit' } }, border: { display: false }, beginAtZero: true },
        y: { grid: { display: false }, ticks: { font: { size: 10, family: 'inherit' } }, border: { display: false } }
      }
    })
  });
}

// ── Ticket table ──────────────────────────────────────────────────────────

var XTS_TYPE_COLORS = { Story: '#6366F1', Bug: '#EF4444', Task: '#3B82F6', Spike: '#F59E0B', Epic: '#8B5CF6' };
var XTS_STS_COLORS  = { done: '#10B981', 'in-progress': '#3B82F6', review: '#F59E0B', todo: '#9CA3AF' };
var XTS_STS_LABELS  = { done: 'Done', 'in-progress': 'In progress', review: 'In review', todo: 'To Do' };

function xtsRenderTicketTable() {
  var el  = document.getElementById('xts-ticket-table');
  var lbl = document.getElementById('xts-tbl-sprint-lbl');
  var cnt = document.getElementById('xts-tbl-count');
  if (!el) return;

  var tickets = XTS_TICKETS[xtsSelectedId] || [];
  var sprint  = XTS_SPRINTS.filter(function(x) { return x.id === xtsSelectedId; })[0];
  if (lbl && sprint) lbl.textContent = sprint.name;
  if (cnt) cnt.textContent = tickets.length + ' ticket' + (tickets.length !== 1 ? 's' : '');

  if (!tickets.length) {
    el.innerHTML = '<div style="padding:24px;text-align:center;font-size:13px;color:var(--muted)">No ticket data for this sprint.</div>';
    return;
  }

  el.innerHTML = ''
    + '<div style="display:grid;grid-template-columns:88px 1fr 140px 70px 72px 40px 100px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);padding:8px 20px;border-bottom:1px solid var(--border)">'
    +   '<div>ID</div><div>Title</div><div>Epic</div><div>Type</div><div>Assignee</div><div style="text-align:center">Pts</div><div>Status</div>'
    + '</div>'
    + tickets.map(function(t) {
        var tc = XTS_TYPE_COLORS[t.type] || '#9CA3AF';
        var sc = XTS_STS_COLORS[t.status] || '#9CA3AF';
        var sl = XTS_STS_LABELS[t.status] || t.status;
        return '<div style="display:grid;grid-template-columns:88px 1fr 140px 70px 72px 40px 100px;align-items:center;padding:9px 20px;border-bottom:1px solid var(--border-lt);font-size:12px">'
          + '<div style="font-family:monospace;font-size:11px;color:var(--muted)">' + t.id + '</div>'
          + '<div style="color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:10px">' + t.title + '</div>'
          + '<div style="padding-right:8px;overflow:hidden">' + (t.epic ? '<span style="font-size:10px;font-weight:500;color:var(--accent);background:var(--accent-light);border-radius:4px;padding:2px 6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:inline-block;max-width:100%">' + t.epic + '</span>' : '<span style="color:var(--faint)">—</span>') + '</div>'
          + '<div><span style="font-size:10px;font-weight:500;padding:2px 7px;border-radius:20px;background:' + tc + '22;color:' + tc + '">' + t.type + '</span></div>'
          + '<div style="font-size:11px;color:var(--muted)">' + t.assignee.split(' ')[0] + '</div>'
          + '<div style="text-align:center;font-weight:600;color:var(--text)">' + t.pts + '</div>'
          + '<div><span style="font-size:10px;font-weight:500;padding:2px 7px;border-radius:20px;background:' + sc + '22;color:' + sc + '">' + sl + '</span></div>'
          + '</div>';
      }).join('');
}

// ── Sprint summary / highlights ───────────────────────────────────────────
// Logic lives in ai-insights.js; this is just the XTS-specific render call.

function xtsRenderSummary() {
  var sprint = XTS_SPRINTS.filter(function(s) { return s.id === xtsSelectedId; })[0];
  if (!sprint) { var el = document.getElementById('xts-summary'); if (el) el.innerHTML = ''; return; }
  var insights = sprintInsights(sprint, XTS_TICKETS[sprint.id], XTS_CAPACITY[sprint.id]);
  renderInsightBox('xts-summary', sprint.name, insights);
}

// ── Sprint selection ──────────────────────────────────────────────────────

function xtsSelectSprint(id) {
  xtsSelectedId = id;
  xtsRenderStrip();
  xtsRenderTicketType();
  xtsRenderCapacity();
  xtsRenderSummary(); // render with whatever data is available now

  // Load tickets on-demand if not yet cached for this sprint
  if (XTS_TICKETS[id] !== undefined) {
    xtsRenderTicketTable();
    xtsRenderSummary(); // re-render with epic data
  } else {
    var tbl = document.getElementById('xts-ticket-table');
    if (tbl) tbl.innerHTML = '<div style="padding:20px;text-align:center;font-size:12px;color:var(--muted)">'
      + '<span style="display:inline-block;width:12px;height:12px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:ld-spin .7s linear infinite;vertical-align:middle;margin-right:6px"></span>'
      + 'Loading tickets…</div>';
    xtsLoadSprintTickets(id, function() {
      xtsRenderTicketTable();
      xtsRenderSummary(); // re-render once epics are loaded
    });
  }
}

// ── Chart.js shared options ───────────────────────────────────────────────

function xtsChartOpts(extra) {
  var base = {
    responsive: true,
    animation: { duration: 300 },
    plugins: {
      tooltip: {
        bodyFont:  { family: 'inherit', size: 11 },
        titleFont: { family: 'inherit', size: 11 },
        padding: 8
      }
    }
  };
  if (!extra) return base;
  var result = Object.assign({}, base, extra);
  if (extra.plugins) result.plugins = Object.assign({}, base.plugins, extra.plugins);
  if (extra.plugins && extra.plugins.tooltip) result.plugins.tooltip = Object.assign({}, base.plugins.tooltip, extra.plugins.tooltip);
  return result;
}
