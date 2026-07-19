// overview-okrs.js — Company OKRs visual dashboard

var _ovxOkrCharts = {};
var _ovxOkrData   = null;   // cached API response
var _ovxOkrFilter = 'all';  // active "Show by" chip

var _OVX_OKR_MONTHS       = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
var _OVX_OKR_MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var _OVX_OBJ_COLORS       = ['#6366F1','#0EA5E9','#2EAD4B'];
var _OVX_OBJ_FILLS        = ['rgba(99,102,241,.10)','rgba(14,165,233,.10)','rgba(46,173,75,.10)'];
var _OVX_OBJ_LIGHT        = ['rgba(99,102,241,.08)','rgba(14,165,233,.08)','rgba(46,173,75,.08)'];

// ── Load ───────────────────────────────────────────────────────────────────

function ovxOkrsLoad() {
  var body = document.getElementById('ovx-body');
  if (!body) return;
  body.innerHTML = typeof _KERV_LOADER_HTML !== 'undefined' ? _KERV_LOADER_HTML : '';

  _ovxOkrDestroyCharts();

  fetch('/api/neon/okrs?year=' + new Date().getFullYear())
    .then(function(r) { return r.json(); })
    .then(function(d) {
      _ovxOkrData   = d;
      _ovxOkrFilter = 'all';
      ovxOkrsRender(d);
    })
    .catch(function() {
      var b = document.getElementById('ovx-body');
      if (b) b.innerHTML = '<div style="color:#E5243B;padding:40px;font-size:13px">Failed to load OKRs.</div>';
    });
}

function _ovxOkrDestroyCharts() {
  Object.keys(_ovxOkrCharts).forEach(function(k) {
    try { if (_ovxOkrCharts[k]) _ovxOkrCharts[k].destroy(); } catch(e) {}
    delete _ovxOkrCharts[k];
  });
}

// ── KR helpers ─────────────────────────────────────────────────────────────

function _ovxKrCurrentVal(kr) {
  for (var i = _OVX_OKR_MONTHS.length - 1; i >= 0; i--) {
    var v = kr[_OVX_OKR_MONTHS[i] + '_value'];
    if (v !== null && v !== undefined && v !== '') return parseFloat(v) || 0;
  }
  return parseFloat(kr.current_value) || 0;
}

function _ovxKrPct(kr) {
  if (kr.type === 'yn') return parseFloat(kr.current_value) > 0 ? 100 : 0;
  var goal = parseFloat(kr.goal_value);
  if (!goal) return 0;
  return Math.min(100, Math.round(_ovxKrCurrentVal(kr) / goal * 100));
}

function _ovxKrMonthPct(kr, monthKey) {
  var mv = kr[monthKey + '_value'];
  if (mv === null || mv === undefined || mv === '') return null;
  if (kr.type === 'yn') return parseFloat(mv) > 0 ? 100 : 0;
  var goal = parseFloat(kr.goal_value);
  if (!goal) return null;
  return Math.min(100, Math.round(parseFloat(mv) / goal * 100));
}

function _ovxPctColor(pct) {
  return pct >= 70 ? '#16a34a' : pct >= 40 ? '#E5A100' : '#E5243B';
}

function _ovxEsc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Filter chip config (mirrors COKR_TABS_CONFIG) ─────────────────────────

function _ovxOkrFilterChips() {
  var chips = [{ id: 'all', label: 'All', depts: null }];
  if (typeof COKR_TABS_CONFIG !== 'undefined') {
    COKR_TABS_CONFIG.forEach(function(t) {
      chips.push({ id: t.id, label: t.label, depts: t.depts });
    });
  }
  return chips;
}

function _ovxOkrApplyFilter(krs, filterId) {
  if (!filterId || filterId === 'all') return krs;
  var chips = _ovxOkrFilterChips();
  var chip  = null;
  for (var i = 0; i < chips.length; i++) {
    if (chips[i].id === filterId) { chip = chips[i]; break; }
  }
  if (!chip || !chip.depts) return krs;
  return krs.filter(function(k) { return chip.depts.indexOf(k.department) !== -1; });
}

// ── "Show by" chip HTML ────────────────────────────────────────────────────

function _ovxOkrChipsHtml(activeId) {
  return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;flex-wrap:wrap">'
    + '<span style="font-size:11px;font-weight:500;color:var(--muted);flex-shrink:0;letter-spacing:.02em">Show by</span>'
    + '<div id="ovx-okr-chips">' + UI.chipsNavSm(_ovxOkrFilterChips(), activeId, 'ovxOkrSetFilter') + '</div>'
    + '</div>';
}

// ── Render (full page) ─────────────────────────────────────────────────────

function ovxOkrsRender(data) {
  var body = document.getElementById('ovx-body');
  if (!body) return;

  var objs = data.objectives || [];
  var krs  = data.keyResults  || [];

  if (objs.length === 0) {
    body.innerHTML = '<div style="text-align:center;padding:60px 0;color:var(--faint);font-size:13px">No OKRs for ' + new Date().getFullYear() + '.</div>';
    return;
  }

  // Objective scorecards always use ALL KRs (unfiltered)
  var objStats = _ovxOkrBuildStats(objs, krs);

  var html = '<div style="margin-top:20px">';

  // ① Objective cards (always unfiltered — top)
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-bottom:20px">';
  objStats.forEach(function(os, oi) {
    html += '<div style="background:var(--surface);border:1px solid var(--border);border-left:3px solid ' + os.color + ';border-radius:12px;padding:16px 18px">'
      + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">'
      +   '<span style="font-size:9px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:' + os.color + ';background:' + os.light + ';padding:2px 8px;border-radius:4px">O' + (oi+1) + '</span>'
      +   '<span style="font-size:11px;font-weight:600;color:var(--text);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _ovxEsc(os.obj.title) + '</span>'
      + '</div>'
      + '<div style="height:5px;border-radius:3px;background:var(--border);overflow:hidden;margin-bottom:7px">'
      +   '<div style="height:100%;width:' + os.pct + '%;background:' + os.color + ';border-radius:3px;transition:width .4s"></div>'
      + '</div>'
      + '<div style="display:flex;justify-content:space-between;align-items:center">'
      +   '<span style="font-size:10px;color:var(--muted)">' + os.krs.length + ' KR' + (os.krs.length !== 1 ? 's' : '') + '</span>'
      +   '<span style="font-size:13px;font-weight:700;color:' + os.color + '">' + os.pct + '%</span>'
      + '</div>'
      + '</div>';
  });
  html += '</div>';

  // ② "Show by" chips
  html += _ovxOkrChipsHtml(_ovxOkrFilter);

  // ③ Charts area (filtered)
  html += '<div id="ovx-okr-charts-area"></div>';

  html += '</div>';
  body.innerHTML = html;

  // Draw charts for the current filter
  _ovxOkrRenderCharts();
}

// ── Filter switch (called by chips) ───────────────────────────────────────

function ovxOkrSetFilter(id) {
  if (id === _ovxOkrFilter) return;
  _ovxOkrFilter = id;

  // Re-render chips via UI Kit to reflect new active state
  var container = document.getElementById('ovx-okr-chips');
  if (container) container.innerHTML = UI.chipsNavSm(_ovxOkrFilterChips(), id, 'ovxOkrSetFilter');

  _ovxOkrRenderCharts();
}

// ── Charts section (re-rendered on filter change) ─────────────────────────

function _ovxOkrRenderCharts() {
  var area = document.getElementById('ovx-okr-charts-area');
  if (!area || !_ovxOkrData) return;

  _ovxOkrDestroyCharts();

  var objs = _ovxOkrData.objectives || [];
  var allKrs = _ovxOkrData.keyResults || [];

  // Apply department filter to KRs
  var filteredKrs = _ovxOkrApplyFilter(allKrs, _ovxOkrFilter);

  // Build per-objective stats using filtered KRs
  var objStats = _ovxOkrBuildStats(objs, filteredKrs);

  // Remove objectives with no KRs after filter (keep layout clean)
  var activeStats = objStats.filter(function(os) { return os.krs.length > 0; });

  var curMonthIdx  = new Date().getMonth();
  var visMonths    = _OVX_OKR_MONTHS.slice(0, curMonthIdx + 1);
  var visMonthLbls = _OVX_OKR_MONTH_LABELS.slice(0, curMonthIdx + 1);

  var totalKrs = filteredKrs.length;
  var avgPct   = totalKrs > 0
    ? Math.round(filteredKrs.reduce(function(s, k) { return s + _ovxKrPct(k); }, 0) / totalKrs)
    : 0;

  // Flat KR list for horizontal bar (grouped by objective)
  var barItems = [];
  activeStats.forEach(function(os) {
    os.krs.forEach(function(kr) { barItems.push({ kr: kr, color: os.color, pct: _ovxKrPct(kr) }); });
  });

  // Shared card helpers
  var card = function(inner, extra) {
    return '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px' + (extra ? ';' + extra : '') + '">' + inner + '</div>';
  };
  var cardTitle = function(t, sub) {
    return '<div style="font-size:12px;font-weight:600;color:var(--text);letter-spacing:-.1px">' + t + '</div>'
      + (sub ? '<div style="font-size:11px;color:var(--muted);margin-top:2px;margin-bottom:16px">' + sub + '</div>' : '<div style="margin-bottom:16px"></div>');
  };

  var html = '';

  if (totalKrs === 0) {
    area.innerHTML = '<div style="text-align:center;padding:40px 0;color:var(--faint);font-size:13px">No key results for this filter.</div>';
    return;
  }

  // Donut (left 5fr) + Horizontal bar (right 7fr)
  html += '<div style="display:grid;grid-template-columns:5fr 7fr;gap:16px;margin-bottom:20px">';

  html += card(
    cardTitle('Overall Progress', 'Average completion per objective')
    + '<div style="position:relative;max-width:180px;margin:0 auto 20px">'
    +   '<canvas id="ovx-okr-donut"></canvas>'
    +   '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none">'
    +     '<span style="font-size:26px;font-weight:700;color:var(--text);line-height:1">' + avgPct + '%</span>'
    +     '<span style="font-size:9px;color:var(--muted);margin-top:2px;letter-spacing:.3px">COMPANY AVG</span>'
    +   '</div>'
    + '</div>'
    + '<div style="display:flex;flex-direction:column;gap:9px">'
    + activeStats.map(function(os, i) {
        return '<div style="display:flex;align-items:center;gap:8px">'
          + '<span style="width:8px;height:8px;border-radius:50%;background:' + os.color + ';flex-shrink:0"></span>'
          + '<span style="font-size:11px;color:var(--text);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">O' + (i+1) + ' — ' + _ovxEsc(os.obj.title) + '</span>'
          + '<span style="font-size:11px;font-weight:700;color:' + _ovxPctColor(os.pct) + ';flex-shrink:0">' + os.pct + '%</span>'
          + '</div>';
      }).join('')
    + '</div>'
  );

  var barH = Math.max(260, barItems.length * 30 + 50);
  html += card(
    cardTitle('Key Results Progress', 'Completion % per key result — colored by objective')
    + '<div style="position:relative;height:' + barH + 'px">'
    +   '<canvas id="ovx-okr-hbar" style="width:100%;height:100%"></canvas>'
    + '</div>'
  );

  html += '</div>'; // end 2-col grid

  // Line chart
  html += card(
    cardTitle('Monthly Progress Trend', 'Average completion per objective · ' + visMonthLbls[0] + ' → ' + visMonthLbls[visMonthLbls.length - 1])
    + '<div style="position:relative;height:220px">'
    +   '<canvas id="ovx-okr-line" style="width:100%;height:100%"></canvas>'
    + '</div>',
    'margin-bottom:20px'
  );

  area.innerHTML = html;

  requestAnimationFrame(function() {
    setTimeout(function() {
      _ovxDrawOkrDonut(activeStats);
      _ovxDrawOkrHbar(barItems);
      _ovxDrawOkrLine(activeStats, visMonths, visMonthLbls);
    }, 40);
  });
}

// ── Shared stats builder ───────────────────────────────────────────────────

function _ovxOkrBuildStats(objs, krs) {
  return objs.map(function(obj, oi) {
    var objKrs = krs.filter(function(k) { return k.objective_id === obj.id; });
    var pct = objKrs.length > 0
      ? Math.round(objKrs.reduce(function(s, k) { return s + _ovxKrPct(k); }, 0) / objKrs.length)
      : 0;
    return {
      obj:   obj,
      krs:   objKrs,
      pct:   pct,
      color: _OVX_OBJ_COLORS[oi % 3],
      fill:  _OVX_OBJ_FILLS[oi % 3],
      light: _OVX_OBJ_LIGHT[oi % 3]
    };
  });
}

// ── Chart renderers ────────────────────────────────────────────────────────

function _ovxDrawOkrDonut(objStats) {
  var canvas = document.getElementById('ovx-okr-donut');
  if (!canvas || !window.Chart) return;
  if (_ovxOkrCharts.donut) { try { _ovxOkrCharts.donut.destroy(); } catch(e) {} }

  _ovxOkrCharts.donut = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: objStats.map(function(os, i) { return 'O' + (i+1); }),
      datasets: [{
        data: objStats.map(function(os) { return Math.max(os.pct, 2); }),
        backgroundColor: objStats.map(function(os) { return os.color; }),
        borderColor: 'var(--surface)',
        borderWidth: 3,
        hoverOffset: 6
      }]
    },
    options: {
      cutout: '74%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(ctx) {
              return ' O' + (ctx.dataIndex + 1) + ': ' + objStats[ctx.dataIndex].pct + '%';
            }
          }
        }
      },
      animation: { duration: 700, easing: 'easeOutQuart' }
    }
  });
}

function _ovxDrawOkrHbar(barItems) {
  var canvas = document.getElementById('ovx-okr-hbar');
  if (!canvas || !window.Chart) return;
  if (_ovxOkrCharts.hbar) { try { _ovxOkrCharts.hbar.destroy(); } catch(e) {} }

  var isDark = document.documentElement.classList.contains('dark') ||
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  var tickColor = isDark ? '#999' : '#666';
  var gridColor = isDark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)';

  _ovxOkrCharts.hbar = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: barItems.map(function(item) {
        var t = item.kr.title || '';
        return t.length > 40 ? t.slice(0, 40) + '…' : t;
      }),
      datasets: [{
        data: barItems.map(function(item) { return item.pct; }),
        backgroundColor: barItems.map(function(item) {
          var h = item.color.replace('#','');
          var r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
          return 'rgba('+r+','+g+','+b+',.75)';
        }),
        borderColor: barItems.map(function(item) { return item.color; }),
        borderWidth: 1.5,
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y',
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(ctx) { return ' ' + ctx.parsed.x + '%'; }
          }
        }
      },
      scales: {
        x: {
          min: 0, max: 100,
          grid: { color: gridColor },
          ticks: {
            font: { size: 10 }, color: tickColor,
            callback: function(v) { return v + '%'; }
          },
          border: { display: false }
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 10 }, color: tickColor },
          border: { display: false }
        }
      },
      animation: { duration: 500 }
    }
  });
}

function _ovxDrawOkrLine(objStats, visMonths, visMonthLbls) {
  var canvas = document.getElementById('ovx-okr-line');
  if (!canvas || !window.Chart) return;
  if (_ovxOkrCharts.line) { try { _ovxOkrCharts.line.destroy(); } catch(e) {} }

  var isDark = document.documentElement.classList.contains('dark') ||
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  var tickColor = isDark ? '#999' : '#666';
  var gridColor = isDark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)';

  var datasets = objStats.map(function(os, oi) {
    var monthData = visMonths.map(function(m) {
      var vals = os.krs.map(function(kr) { return _ovxKrMonthPct(kr, m); })
                       .filter(function(v) { return v !== null; });
      return vals.length > 0
        ? Math.round(vals.reduce(function(a, b) { return a + b; }, 0) / vals.length)
        : null;
    });
    return {
      label: 'O' + (oi+1) + ' — ' + (os.obj.title.length > 28 ? os.obj.title.slice(0,28)+'…' : os.obj.title),
      data: monthData,
      borderColor: os.color,
      backgroundColor: os.fill,
      fill: true,
      tension: 0.38,
      pointRadius: 4,
      pointHoverRadius: 7,
      pointBackgroundColor: os.color,
      pointBorderColor: '#fff',
      pointBorderWidth: 1.5,
      borderWidth: 2.5,
      spanGaps: false
    };
  });

  _ovxOkrCharts.line = new Chart(canvas, {
    type: 'line',
    data: { labels: visMonthLbls, datasets: datasets },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: { font: { size: 10 }, color: tickColor, boxWidth: 10, padding: 16, usePointStyle: true }
        },
        tooltip: {
          callbacks: {
            label: function(ctx) {
              var v = ctx.parsed.y;
              return ' ' + ctx.dataset.label.split(' — ')[0] + ': ' + (v !== null ? v + '%' : '—');
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { font: { size: 10 }, color: tickColor },
          border: { display: false }
        },
        y: {
          min: 0, max: 100,
          grid: { color: gridColor },
          ticks: { font: { size: 10 }, color: tickColor, callback: function(v) { return v + '%'; } },
          border: { display: false }
        }
      },
      animation: { duration: 700, easing: 'easeOutQuart' }
    }
  });
}
