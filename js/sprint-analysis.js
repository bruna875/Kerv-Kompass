// sprint-analysis.js — Generic sprint analysis factory
// Usage: var myTeam = createSprintAnalysis({ id: 'xts', teamName: 'XTS Team', subtitle: 'Sprint analytics & velocity tracking', projectKey: 'SDT' });
// Then:  myTeam.render()  →  HTML string
//        myTeam.init()    →  loads Jira data
// From onclick: _sa('xts').selectSprint(id) and _sa('xts').renderMemberTrend()

var _saInstances = {};
function _sa(id) { return _saInstances[id]; }

function createSprintAnalysis(config) {
  // config: { id, teamName, subtitle, projectKey }
  var id = config.id;

  // ── Closure helpers ──
  var _c    = "_sa('" + id + "').";        // onclick prefix: _c + "selectSprint(123)"
  var _card = 'background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:16px';
  var _sec  = 'font-size:13px;font-weight:600;color:var(--text);letter-spacing:-.2px;margin-bottom:12px';
  function _p(s) { return id + '-' + s; } // DOM id: _p('root') → 'xts-root'

  // ── State ──
  var sprints    = [];
  var capacity   = {};
  var tickets    = {};
  var selectedId = null;
  var charts     = {};
  var pinnedLinks = [];

  // ── Pin helpers ──
  function _esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function loadPins(cb) {
    fetch('/api/neon/lookup?pageId=' + encodeURIComponent(id))
      .then(function(r) { return r.json(); })
      .then(function(rows) { pinnedLinks = Array.isArray(rows) ? rows : []; if (cb) cb(); })
      .catch(function() { pinnedLinks = []; if (cb) cb(); });
  }

  // Reload from API then re-render dropdown
  function _refreshPinDd() {
    var dd = document.getElementById(_p('pin-dd'));
    if (dd) dd.remove();
    loadPins(function() { _renderPinDd(); });
  }

  function togglePinDd() {
    var existing = document.getElementById(_p('pin-dd'));
    if (existing) { existing.remove(); return; }
    // Reload from API on each open to stay fresh
    loadPins(function() { _renderPinDd(); });
  }

  function _renderPinDd() {
    var btn = document.getElementById(_p('pin-btn'));
    if (!btn) return;
    var rect = btn.getBoundingClientRect();

    var dd = document.createElement('div');
    dd.id = _p('pin-dd');
    dd.style.cssText = 'position:fixed;z-index:9000;background:var(--surface);border:1px solid var(--border-md);'
      + 'border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,.12);min-width:230px;padding:4px 0;'
      + 'top:' + (rect.bottom + 6) + 'px;right:' + (window.innerWidth - rect.right) + 'px';

    var PIN_LINK_SVG = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;opacity:.5">'
      + '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>'
      + '<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'
      + '</svg>';
    var EDIT_SVG = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none">'
      + '<path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>'
      + '</svg>';
    var TRASH_SVG = '<svg width="12" height="12" viewBox="0 0 14 14" fill="none">'
      + '<path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.8 7.5A1 1 0 004.8 12.5h4.4a1 1 0 001-.9L11 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>'
      + '</svg>';

    var linksHtml = '<div style="padding:2px 12px 6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--faint)">Pinned Links</div>';
    if (pinnedLinks.length) {
      pinnedLinks.forEach(function(link) {
        linksHtml +=
          '<div style="display:flex;align-items:center;gap:4px;padding:5px 10px 5px 12px;min-height:34px">'
          + '<a href="' + _esc(link.url) + '" target="_blank" rel="noopener noreferrer"'
          +   ' style="flex:1;min-width:0;display:flex;align-items:center;gap:7px;font-size:13px;color:var(--text);text-decoration:none;overflow:hidden"'
          +   ' onmouseenter="this.style.color=\'var(--accent)\'" onmouseleave="this.style.color=\'var(--text)\'">'
          +   PIN_LINK_SVG
          +   '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _esc(link.label) + '</span>'
          + '</a>'
          + '<button onclick="event.stopPropagation();_sa(\'' + id + '\').openPinModal(\'' + link.id + '\')" title="Edit"'
          +   ' style="width:26px;height:26px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;border:none;border-radius:5px;background:none;color:var(--faint);cursor:pointer"'
          +   ' onmouseenter="this.style.background=\'var(--subtle)\';this.style.color=\'var(--text)\'" onmouseleave="this.style.background=\'none\';this.style.color=\'var(--faint)\'">'
          +   EDIT_SVG + '</button>'
          + '<button onclick="event.stopPropagation();_sa(\'' + id + '\').deletePinLink(\'' + link.id + '\')" title="Delete"'
          +   ' style="width:26px;height:26px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;border:none;border-radius:5px;background:none;color:var(--faint);cursor:pointer"'
          +   ' onmouseenter="this.style.background=\'#FFF0F0\';this.style.color=\'#E5243B\'" onmouseleave="this.style.background=\'none\';this.style.color=\'var(--faint)\'">'
          +   TRASH_SVG + '</button>'
          + '</div>';
      });
    } else {
      linksHtml += '<div style="padding:4px 12px 8px;font-size:12px;color:var(--faint)">No pinned links yet</div>';
    }

    linksHtml += '<div style="height:1px;background:var(--border);margin:4px 0"></div>'
      + '<div onclick="_sa(\'' + id + '\').openPinModal(null);var d=document.getElementById(\'' + _p('pin-dd') + '\');if(d)d.remove()"'
      +   ' style="padding:8px 14px;font-size:13px;color:var(--accent);cursor:pointer;font-weight:500;display:flex;align-items:center;gap:6px"'
      +   ' onmouseenter="this.style.background=\'var(--subtle)\'" onmouseleave="this.style.background=\'none\'">'
      +   '<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
      +   'Add new link'
      + '</div>';

    dd.innerHTML = linksHtml;
    document.body.appendChild(dd);

    setTimeout(function() {
      document.addEventListener('click', function _closePinDd(e) {
        var ddEl = document.getElementById(_p('pin-dd'));
        if (!ddEl) { document.removeEventListener('click', _closePinDd); return; }
        if (!ddEl.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
          ddEl.remove();
          document.removeEventListener('click', _closePinDd);
        }
      });
    }, 0);
  }

  function openPinModal(linkIdOrNull) {
    var link = linkIdOrNull ? pinnedLinks.filter(function(l) { return String(l.id) === String(linkIdOrNull); })[0] : null;
    var existing = document.getElementById(_p('pin-modal'));
    if (existing) existing.remove();

    var IF = 'width:100%;box-sizing:border-box;padding:8px 10px;font-size:13px;border:1px solid var(--border-md);border-radius:8px;outline:none;font-family:inherit;color:var(--text)';
    var IF_F = 'onfocus="this.style.borderColor=\'var(--accent)\';this.style.boxShadow=\'0 0 0 3px rgba(237,0,94,.08)\'"';
    var IF_B = 'onblur="this.style.borderColor=\'var(--border-md)\';this.style.boxShadow=\'none\'"';
    var LB   = 'font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);display:block;margin-bottom:5px';

    var overlay = document.createElement('div');
    overlay.id = _p('pin-modal');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0);transition:background .18s';

    var card = document.createElement('div');
    card.id = _p('pin-card');
    card.style.cssText = 'background:#fff;border-radius:14px;padding:22px 22px 18px;width:380px;max-width:90vw;'
      + 'box-shadow:0 8px 40px rgba(0,0,0,.18);transform:scale(.95);opacity:0;transition:transform .18s,opacity .18s;font-family:inherit';

    card.innerHTML =
      '<div style="font-size:14px;font-weight:600;color:var(--text);margin-bottom:18px">' + (link ? 'Edit link' : 'Add new link') + '</div>'
      + '<div style="margin-bottom:12px"><label style="' + LB + '">Label</label>'
      +   '<input id="' + _p('pin-lbl') + '" type="text" value="' + (link ? _esc(link.label) : '') + '" placeholder="e.g. Sprint Board" style="' + IF + '" ' + IF_F + ' ' + IF_B + '>'
      + '</div>'
      + '<div style="margin-bottom:18px"><label style="' + LB + '">URL</label>'
      +   '<input id="' + _p('pin-url') + '" type="url" value="' + (link ? _esc(link.url) : '') + '" placeholder="https://…" style="' + IF + '" ' + IF_F + ' ' + IF_B + '>'
      + '</div>'
      + '<div id="' + _p('pin-err') + '" style="font-size:12px;color:#E5243B;margin-bottom:10px;display:none"></div>'
      + '<div style="display:flex;justify-content:flex-end;gap:8px">'
      +   '<button id="' + _p('pin-cancel') + '" style="height:34px;padding:0 16px;font-size:13px;font-weight:500;font-family:inherit;border:1px solid var(--border-md);border-radius:8px;background:#fff;color:var(--muted);cursor:pointer">Cancel</button>'
      +   '<button id="' + _p('pin-save') + '"   style="height:34px;padding:0 16px;font-size:13px;font-weight:500;font-family:inherit;border:none;border-radius:8px;background:var(--accent);color:#fff;cursor:pointer;transition:opacity .12s" onmouseenter="this.style.opacity=\'.85\'" onmouseleave="this.style.opacity=\'1\'">' + (link ? 'Save changes' : 'Add link') + '</button>'
      + '</div>';

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    requestAnimationFrame(function() { requestAnimationFrame(function() {
      overlay.style.background = 'rgba(0,0,0,.32)';
      card.style.transform = 'scale(1)'; card.style.opacity = '1';
      var first = document.getElementById(_p('pin-lbl'));
      if (first) { first.focus(); if (link) first.select(); }
    }); });

    function closeModal() {
      overlay.style.background = 'rgba(0,0,0,0)';
      card.style.transform = 'scale(.95)'; card.style.opacity = '0';
      setTimeout(function() { if (overlay.parentNode) overlay.remove(); }, 180);
    }

    function doSave() {
      var lbl   = (document.getElementById(_p('pin-lbl')).value || '').trim();
      var urlVal = (document.getElementById(_p('pin-url')).value || '').trim();
      var errEl = document.getElementById(_p('pin-err'));
      var saveBtn = document.getElementById(_p('pin-save'));
      if (!lbl || !urlVal) {
        if (errEl) { errEl.textContent = 'Both fields are required.'; errEl.style.display = 'block'; }
        return;
      }
      if (errEl) errEl.style.display = 'none';
      if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Saving…'; }

      var payload = link
        ? { action: 'pin-update', id: link.id, label: lbl, url: urlVal }
        : { action: 'pin-create', pageId: id, label: lbl, url: urlVal };

      fetch('/api/neon/lookup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (!res.ok) throw new Error(res.error || 'Save failed');
        return loadPins(function() {
          closeModal();
          setTimeout(function() { togglePinDd(); }, 220);
        });
      })
      .catch(function(e) {
        if (errEl) { errEl.textContent = e.message; errEl.style.display = 'block'; }
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = link ? 'Save changes' : 'Add link'; }
      });
    }

    overlay.addEventListener('click', function(e) { if (e.target === overlay) closeModal(); });
    document.getElementById(_p('pin-cancel')).onclick = closeModal;
    document.getElementById(_p('pin-save')).onclick   = doSave;
    [_p('pin-lbl'), _p('pin-url')].forEach(function(iid) {
      var el = document.getElementById(iid);
      if (el) el.addEventListener('keydown', function(e) {
        if (e.key === 'Enter')  doSave();
        if (e.key === 'Escape') closeModal();
      });
    });
  }

  function deletePinLink(linkId) {
    var link = pinnedLinks.filter(function(l) { return String(l.id) === String(linkId); })[0];
    var label = link ? link.label : 'this link';

    // Confirm dialog
    var existing = document.getElementById(_p('pin-confirm'));
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.id = _p('pin-confirm');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:10001;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0);transition:background .18s';

    var card = document.createElement('div');
    card.style.cssText = 'background:#fff;border-radius:14px;padding:22px 22px 18px;width:320px;max-width:90vw;'
      + 'box-shadow:0 8px 40px rgba(0,0,0,.18);transform:scale(.95);opacity:0;transition:transform .18s,opacity .18s;font-family:inherit';
    card.innerHTML =
      '<div style="font-size:14px;font-weight:600;color:var(--text);margin-bottom:8px">Delete link</div>'
      + '<div style="font-size:13px;color:var(--muted);margin-bottom:20px">Remove <strong style="color:var(--text)">' + _esc(label) + '</strong>? This can\'t be undone.</div>'
      + '<div style="display:flex;justify-content:flex-end;gap:8px">'
      +   '<button id="' + _p('pin-conf-cancel') + '" style="height:34px;padding:0 16px;font-size:13px;font-weight:500;font-family:inherit;border:1px solid var(--border-md);border-radius:8px;background:#fff;color:var(--muted);cursor:pointer">Cancel</button>'
      +   '<button id="' + _p('pin-conf-ok') + '" style="height:34px;padding:0 16px;font-size:13px;font-weight:500;font-family:inherit;border:none;border-radius:8px;background:#E5243B;color:#fff;cursor:pointer;transition:opacity .12s" onmouseenter="this.style.opacity=\'.85\'" onmouseleave="this.style.opacity=\'1\'">Delete</button>'
      + '</div>';

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    requestAnimationFrame(function() { requestAnimationFrame(function() {
      overlay.style.background = 'rgba(0,0,0,.32)';
      card.style.transform = 'scale(1)'; card.style.opacity = '1';
      var okBtn = document.getElementById(_p('pin-conf-ok'));
      if (okBtn) okBtn.focus();
    }); });

    function closeConfirm() {
      overlay.style.background = 'rgba(0,0,0,0)';
      card.style.transform = 'scale(.95)'; card.style.opacity = '0';
      setTimeout(function() { if (overlay.parentNode) overlay.remove(); }, 180);
    }

    overlay.addEventListener('click', function(e) { if (e.target === overlay) closeConfirm(); });
    document.getElementById(_p('pin-conf-cancel')).onclick = closeConfirm;
    document.getElementById(_p('pin-conf-ok')).onclick = function() {
      closeConfirm();
      fetch('/api/neon/lookup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pin-delete', id: linkId })
      }).then(function() {
        pinnedLinks = pinnedLinks.filter(function(l) { return String(l.id) !== String(linkId); });
        _refreshPinDd();
      });
    };
  }

  // ── Type/status config ──
  var TYPE_COLORS = { Story: '#6366F1', Bug: '#EF4444', Task: '#3B82F6', Spike: '#F59E0B', Epic: '#8B5CF6' };
  var STS_COLORS  = { done: '#10B981', 'in-progress': '#3B82F6', review: '#F59E0B', todo: '#9CA3AF' };
  var STS_LABELS  = { done: 'Done', 'in-progress': 'In progress', review: 'In review', todo: 'To Do' };

  // ── Jira data loading ──────────────────────────────────────────────────────

  function loadFromJira() {
    // Show loading placeholder in sprint strip
    var strip = document.getElementById(_p('strip'));
    if (strip) {
      strip.style.gridTemplateColumns = '1fr';
      strip.innerHTML = '<div style="padding:20px;text-align:center;font-size:12px;color:var(--muted)">'
        + '<span style="display:inline-block;width:14px;height:14px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:ld-spin .7s linear infinite;vertical-align:middle;margin-right:8px"></span>'
        + 'Loading sprint data from Jira…</div>';
    }

    fetch('/api/jira/sprints?project=' + config.projectKey)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (!data.ok) throw new Error(data.error || 'Jira API error');

        // Populate closure vars from Jira data
        sprints  = data.sprints || [];
        capacity = {};
        sprints.forEach(function(s) { capacity[s.id] = s.members || []; });
        tickets  = {};

        // Default selection: active sprint, or last one
        var active = sprints.filter(function(s) { return s.jiraState === 'active'; })[0];
        selectedId = active ? active.id : (sprints[sprints.length - 1] || {}).id;

        // Load tickets for selected sprint, then render everything
        loadSprintTickets(selectedId, function() {
          renderAll();
        });
      })
      .catch(function(e) {
        console.error('[' + id + '] Jira load failed:', e.message);
        var root = document.getElementById(_p('root'));
        if (root) root.innerHTML = ''
          + '<div style="padding:32px 0">'
          +   '<div style="font-size:22px;font-weight:600;color:var(--text);letter-spacing:-.3px;margin-bottom:8px">' + config.teamName + '</div>'
          +   '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;max-width:480px">'
          +     '<div style="font-size:13px;font-weight:600;color:#EF4444;margin-bottom:6px">Could not load Jira data</div>'
          +     '<div style="font-size:12px;color:var(--muted);font-family:monospace">' + e.message + '</div>'
          +   '</div>'
          + '</div>';
      });
  }

  // Load individual tickets for a sprint on demand; calls cb() when done
  function loadSprintTickets(sprintId, cb) {
    if (!sprintId) { if (cb) cb(); return; }
    if (tickets[sprintId] !== undefined) { if (cb) cb(); return; }

    fetch('/api/jira/issues?sprintId=' + sprintId)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        tickets[sprintId] = data.ok ? (data.issues || []) : [];
        if (cb) cb();
      })
      .catch(function() {
        tickets[sprintId] = [];
        if (cb) cb();
      });
  }

  function renderAll() {
    // Restore strip grid columns
    var strip = document.getElementById(_p('strip'));
    if (strip) strip.style.gridTemplateColumns = 'repeat(' + Math.min(sprints.length, 5) + ',1fr)';
    renderStrip();
    renderStats();
    renderVelocityChart();
    renderCompletionChart();
    renderBugChart();
    renderMemberTrend();
    renderTrendSummary();
    renderSummary();
    renderCapacity();
    renderTicketCharts();
    renderTicketTable();
  }

  function renderTrendSummary() {
    if (typeof renderInsightBox !== 'function' || typeof sprintTrendInsights !== 'function') return;
    renderInsightBox(_p('trend-insights'), 'Sprint Trend', sprintTrendInsights(sprints));
  }

  // ── Shell HTML (static skeleton) ──────────────────────────────────────────

  function shell() {
    return ''
      // ── Page header ──
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">'
      +   '<div>'
      +     '<div style="font-size:20px;font-weight:600;color:var(--text);letter-spacing:-.3px">' + config.teamName + '</div>'
      +     '<div style="font-size:12px;color:var(--muted);margin-top:2px">' + config.subtitle + '</div>'
      +   '</div>'
      +   '<div style="display:flex;align-items:center;gap:10px">'
      +     '<button id="' + _p('pin-btn') + '" onclick="_sa(\'' + id + '\').togglePinDd()" title="Pinned links"'
      +       ' style="width:34px;height:34px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border-md);border-radius:8px;background:var(--surface);color:var(--muted);cursor:pointer;transition:border-color .15s,color .15s,background .15s;flex-shrink:0"'
      +       ' onmouseenter="this.style.borderColor=\'var(--accent)\';this.style.color=\'var(--accent)\'"'
      +       ' onmouseleave="this.style.borderColor=\'var(--border-md)\';this.style.color=\'var(--muted)\'">'
      +       '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.638 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v3.417"/><path d="M14.62 18.8A2.25 2.25 0 1 1 18 15.836a2.25 2.25 0 1 1 3.38 2.966l-2.626 2.856a.998.998 0 0 1-1.507 0z"/></svg>'
      +     '</button>'
      +     '<div style="width:1px;height:20px;background:var(--border-md);flex-shrink:0"></div>'
      +     '<div id="' + _p('sprint-badge') + '"></div>'
      +   '</div>'
      + '</div>'

      // ══ SECTION: Sprint Trend ══
      + '<div style="' + _sec + '">Sprint Trend</div>'

      // ── Sprint Trend insights ──
      + '<div id="' + _p('trend-insights') + '" style="margin-bottom:16px"></div>'

      // ── Stats (2×2) + member trend + Velocity ──
      + '<div style="display:grid;grid-template-columns:460px 1fr;gap:12px;margin-bottom:12px">'
      +   '<div style="display:flex;flex-direction:column;gap:8px">'
      +     '<div id="' + _p('stats') + '" style="display:grid;grid-template-columns:1fr 1fr;gap:8px"></div>'
      +     '<div style="' + _card + ';padding:12px;flex:1">'
      +       '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
      +         '<span style="font-size:11px;font-weight:600;color:var(--text)">Points trend</span>'
      +         '<select id="' + _p('member-sel') + '" onchange="' + _c + 'renderMemberTrend()" style="font-size:11px;font-family:inherit;font-weight:500;border:1px solid var(--border-md);border-radius:7px;background:var(--surface);color:var(--text);padding:4px 8px;outline:none;cursor:pointer;transition:border-color .15s;-webkit-appearance:none;appearance:none;padding-right:24px;background-image:url(\'data:image/svg+xml,%3Csvg width=\'10\' height=\'6\' viewBox=\'0 0 10 6\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1l4 4 4-4\' stroke=\'%23A8A8A0\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E\');background-repeat:no-repeat;background-position:right 7px center"></select>'
      +       '</div>'
      +       '<canvas id="' + _p('member-trend-chart') + '" height="100"></canvas>'
      +     '</div>'
      +   '</div>'
      +   '<div style="' + _card + '">'
      +     '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:2px">Velocity</div>'
      +     '<div style="font-size:10px;color:var(--muted);margin-bottom:10px">Planned vs completed story points</div>'
      +     '<canvas id="' + _p('velocity-chart') + '" height="110"></canvas>'
      +   '</div>'
      + '</div>'

      // ── Completion Rate + Bug Trend ──
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">'
      +   '<div style="' + _card + '">'
      +     '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:2px">Completion Rate</div>'
      +     '<div style="font-size:10px;color:var(--muted);margin-bottom:10px">% of planned points delivered</div>'
      +     '<canvas id="' + _p('completion-chart') + '" height="100"></canvas>'
      +   '</div>'
      +   '<div style="' + _card + '">'
      +     '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:2px">Bug Trend</div>'
      +     '<div style="font-size:10px;color:var(--muted);margin-bottom:10px">Bugs introduced vs resolved</div>'
      +     '<canvas id="' + _p('bug-chart') + '" height="100"></canvas>'
      +   '</div>'
      + '</div>'

      // ══ SECTION: Key Metrics by Sprint ══
      + '<div style="' + _sec + '">Key Metrics by Sprint</div>'

      // ── Sprint selector strip ──
      + '<div id="' + _p('strip') + '" style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:12px"></div>'

      // ── Sprint summary ──
      + '<div id="' + _p('summary') + '" style="margin-bottom:20px"></div>'

      // ── Capacity + Ticket mix ──
      + '<div style="display:grid;grid-template-columns:1fr 220px;gap:12px;margin-bottom:12px;align-items:stretch">'
      +   '<div style="' + _card + ';display:flex;flex-direction:column">'
      +     '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:2px">Capacity — <span id="' + _p('cap-sprint-lbl') + '" style="color:var(--accent)"></span></div>'
      +     '<div style="font-size:10px;color:var(--muted);margin-bottom:12px">Story points assigned vs completed per engineer</div>'
      +     '<div id="' + _p('capacity-wrap') + '" style="position:relative;flex:1;min-height:80px"><canvas id="' + _p('capacity-chart') + '"></canvas></div>'
      +   '</div>'
      +   '<div style="' + _card + '">'
      +     '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:2px">Ticket mix — <span id="' + _p('tkt-sprint-lbl') + '" style="color:var(--accent)"></span></div>'
      +     '<div style="font-size:10px;color:var(--muted);margin-bottom:12px">By type</div>'
      +     '<canvas id="' + _p('ticket-type-chart') + '" height="140"></canvas>'
      +     '<div id="' + _p('ticket-type-legend') + '" style="margin-top:10px"></div>'
      +   '</div>'
      + '</div>'

      // ── Ticket table ──
      + '<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:32px">'
      +   '<div style="padding:12px 16px 10px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">'
      +     '<div style="font-size:12px;font-weight:600;color:var(--text)">Tickets — <span id="' + _p('tbl-sprint-lbl') + '" style="color:var(--accent)"></span></div>'
      +     '<span id="' + _p('tbl-count') + '" style="font-size:11px;color:var(--muted)"></span>'
      +   '</div>'
      +   '<div id="' + _p('ticket-table') + '"></div>'
      + '</div>';
  }

  // ── Sprint strip ──────────────────────────────────────────────────────────

  function renderStrip() {
    var el = document.getElementById(_p('strip'));
    if (!el) return;

    // Badge — show active sprint in header
    var activeSprint = sprints.filter(function(s) { return s.status === 'in-progress'; })[0];
    var badge = document.getElementById(_p('sprint-badge'));
    if (badge && activeSprint) {
      badge.innerHTML = '<div style="display:flex;align-items:center;gap:8px">'
        + '<span style="width:7px;height:7px;border-radius:50%;background:#10B981;flex-shrink:0"></span>'
        + '<span style="font-size:12px;font-weight:500;color:var(--text)">' + activeSprint.name + ' · In progress</span>'
        + '<span style="font-size:11px;color:var(--muted)">' + activeSprint.start + ' – ' + activeSprint.end + '</span>'
        + '</div>';
    }

    el.innerHTML = sprints.map(function(s) {
      var sel = s.id === selectedId;
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

      return '<div onclick="' + _c + 'selectSprint(' + s.id + ')" style="background:var(--surface);border:' + border + ';border-radius:10px;padding:12px 14px;cursor:pointer;transition:border-color .15s,box-shadow .15s;' + shadow + '">'
        + '<div style="font-size:11px;font-weight:600;color:var(--text);margin-bottom:1px">' + s.name + '</div>'
        + '<div style="font-size:10px;color:var(--muted);margin-bottom:8px">' + s.start + ' – ' + s.end + '</div>'
        + progressBar
        + valueLine
        + statusLabel
        + '</div>';
    }).join('');
  }

  // ── Right-column stats ────────────────────────────────────────────────────

  function renderStats() {
    var el = document.getElementById(_p('stats'));
    if (!el) return;

    var completed  = sprints.filter(function(s) { return s.status === 'completed'; });
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
    var last3carry = sprints.slice(-3).reduce(function(a, s) { return a + s.carryover; }, 0);
    var prev3carry = sprints.length > 3 ? sprints.slice(-6, -3).reduce(function(a, s) { return a + s.carryover; }, 0) : null;
    var carryDelta = prev3carry !== null ? last3carry - prev3carry : null;
    // Lower carryover = better → green when delta < 0
    var carryColor = last3carry === 0 ? '#10B981' : carryDelta === null ? (last3carry <= 5 ? '#10B981' : last3carry <= 12 ? '#F59E0B' : '#EF4444') : carryDelta < 0 ? '#10B981' : carryDelta > 0 ? '#EF4444' : '#9CA3AF';
    var carrySub   = carryDelta === null
      ? 'last 3 sprints'
      : '<span style="color:' + (carryDelta < 0 ? '#10B981' : carryDelta > 0 ? '#EF4444' : '#9CA3AF') + '">'
        + (carryDelta < 0 ? '▼ ' : carryDelta > 0 ? '▲ ' : '— ')
        + Math.abs(carryDelta) + ' vs prev 3</span>';

    el.innerHTML = statMini('Avg Velocity', avgVel + ' pts', '<span style="font-size:10px;color:' + deltaColor + '">' + deltaLabel + '</span>', '#6366F1')
      + statMini('Avg Completion', avgComp + '%', 'across last ' + completed.length + ' sprints', avgComp >= 90 ? '#10B981' : avgComp >= 75 ? '#F59E0B' : '#EF4444')
      + statMini('Predictability', predictability + '%', 'planned vs delivered ratio', predictability >= 85 ? '#10B981' : '#F59E0B')
      + statMini('Carryover · last 3', last3carry + ' tickets', carrySub, carryColor);
  }

  function statMini(label, value, sub, color) {
    return '<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px 12px">'
      + '<div style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);margin-bottom:4px">' + label + '</div>'
      + '<div style="font-size:18px;font-weight:700;color:' + color + ';letter-spacing:-.5px;line-height:1;margin-bottom:3px">' + value + '</div>'
      + '<div style="font-size:9px;color:var(--muted);line-height:1.3">' + sub + '</div>'
      + '</div>';
  }

  // ── Velocity chart ────────────────────────────────────────────────────────

  // Linear regression over an array of numbers → trend line values
  function linReg(data) {
    var n = data.length;
    if (n < 2) return data.slice();
    var sx = 0, sy = 0, sxy = 0, sx2 = 0;
    data.forEach(function(y, x) { sx += x; sy += y; sxy += x * y; sx2 += x * x; });
    var denom = n * sx2 - sx * sx;
    if (denom === 0) return data.map(function() { return Math.round(sy / n); });
    var m = (n * sxy - sx * sy) / denom;
    var b = (sy - m * sx) / n;
    return data.map(function(_, i) { return Math.round(m * i + b); });
  }

  function renderVelocityChart() {
    if (charts.velocity) { charts.velocity.destroy(); delete charts.velocity; }
    var canvas = document.getElementById(_p('velocity-chart'));
    if (!canvas) return;

    var plannedPts   = sprints.map(function(s) { return s.planned; });
    var completedPts = sprints.map(function(s) { return s.completed; });
    var trendPlanned   = linReg(plannedPts);
    var trendCompleted = linReg(completedPts);

    charts.velocity = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: sprints.map(function(s) { return s.name; }),
        datasets: [
          {
            label: 'Planned',
            data: plannedPts,
            backgroundColor: 'rgba(99,102,241,.25)',
            borderWidth: 0,
            borderRadius: 4,
            order: 2
          },
          {
            label: 'Completed',
            data: completedPts,
            backgroundColor: function(ctx) {
              var s = sprints[ctx.dataIndex];
              // In-progress sprints are incomplete by definition — always green
              if (s.status === 'in-progress') return 'rgba(16,185,129,.7)';
              var pct = s.planned > 0 ? s.completed / s.planned : 0;
              return pct >= 0.9 ? 'rgba(16,185,129,.7)' : pct >= 0.7 ? 'rgba(245,158,11,.7)' : 'rgba(239,68,68,.7)';
            },
            borderColor: 'transparent',
            borderRadius: 4,
            order: 2
          },
          {
            type: 'line',
            label: 'Trend (Planned)',
            data: trendPlanned,
            borderColor: 'rgba(99,102,241,.8)',
            borderWidth: 2,
            borderDash: [5, 4],
            pointRadius: 0,
            pointHoverRadius: 4,
            fill: false,
            tension: 0,
            order: 1
          },
          {
            type: 'line',
            label: 'Trend (Completed)',
            data: trendCompleted,
            borderColor: 'rgba(16,185,129,.8)',
            borderWidth: 2,
            borderDash: [5, 4],
            pointRadius: 0,
            pointHoverRadius: 4,
            fill: false,
            tension: 0,
            order: 1
          }
        ]
      },
      options: chartOpts({
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 8, font: { size: 10, family: 'inherit' }, padding: 10,
              generateLabels: function(chart) {
                var labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                labels.forEach(function(l) {
                  if (l.text === 'Completed')          { l.fillStyle = 'rgba(16,185,129,.7)';  l.strokeStyle = 'transparent'; }
                  if (l.text === 'Trend (Planned)')    { l.fillStyle = 'transparent'; l.strokeStyle = 'rgba(99,102,241,.8)';  l.lineDash = [5,4]; l.lineWidth = 2; }
                  if (l.text === 'Trend (Completed)')  { l.fillStyle = 'transparent'; l.strokeStyle = 'rgba(16,185,129,.8)';  l.lineDash = [5,4]; l.lineWidth = 2; }
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

  function renderCompletionChart() {
    if (charts.completion) { charts.completion.destroy(); delete charts.completion; }
    var canvas = document.getElementById(_p('completion-chart'));
    if (!canvas) return;

    var target = 85;
    var pcts   = sprints.map(function(s) { return Math.round(s.completed / s.planned * 100); });

    charts.completion = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: sprints.map(function(s) { return s.name; }),
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
            data: sprints.map(function() { return target; }),
            borderColor: 'rgba(245,158,11,.6)',
            borderWidth: 1.5,
            borderDash: [5, 4],
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: chartOpts({
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

  function renderBugChart() {
    if (charts.bug) { charts.bug.destroy(); delete charts.bug; }
    var canvas = document.getElementById(_p('bug-chart'));
    if (!canvas) return;

    charts.bug = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: sprints.map(function(s) { return s.name; }),
        datasets: [
          {
            label: 'Introduced',
            data: sprints.map(function(s) { return s.bugsIntroduced; }),
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
            data: sprints.map(function(s) { return s.bugsResolved; }),
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
      options: chartOpts({
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 10, family: 'inherit' }, padding: 10 } } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10, family: 'inherit' } }, border: { display: false } },
          y: { grid: { color: 'rgba(0,0,0,.05)' }, ticks: { font: { size: 10, family: 'inherit' }, stepSize: 1 }, border: { display: false }, beginAtZero: true }
        }
      })
    });
  }

  // ── Member ticket trend chart ─────────────────────────────────────────────

  function renderMemberTrend() {
    if (charts.memberTrend) { charts.memberTrend.destroy(); delete charts.memberTrend; }
    var canvas = document.getElementById(_p('member-trend-chart'));
    var sel    = document.getElementById(_p('member-sel'));
    if (!canvas || !sprints.length) return;

    // Build member list from all sprints
    var allMembers = [];
    sprints.forEach(function(s) {
      (capacity[s.id] || []).forEach(function(m) {
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
    var labels = sprints.map(function(s) { return s.name.replace(config.projectKey + ' ', ''); });

    var assigned  = sprints.map(function(s) {
      var ms = capacity[s.id] || [];
      if (member === 'All') return ms.reduce(function(a, m) { return a + (m.assigned || 0); }, 0);
      var m = ms.filter(function(x) { return x.name === member; })[0];
      return m ? (m.assigned || 0) : 0;
    });

    var closed = sprints.map(function(s) {
      var ms = capacity[s.id] || [];
      if (member === 'All') return ms.reduce(function(a, m) { return a + (m.completed || 0); }, 0);
      var m = ms.filter(function(x) { return x.name === member; })[0];
      return m ? (m.completed || 0) : 0;
    });

    charts.memberTrend = new Chart(canvas.getContext('2d'), {
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
      options: chartOpts({
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 7, font: { size: 9, family: 'inherit' }, padding: 8 } } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 9, family: 'inherit' } }, border: { display: false } },
          y: { grid: { color: 'rgba(0,0,0,.05)' }, ticks: { font: { size: 9, family: 'inherit' }, stepSize: 1, precision: 0 }, border: { display: false }, beginAtZero: true }
        }
      })
    });
  }

  // ── Ticket type + status charts ───────────────────────────────────────────

  function renderTicketCharts() {
    renderTicketType();
  }

  function renderTicketType() {
    if (charts.ticketType) { charts.ticketType.destroy(); delete charts.ticketType; }
    var canvas = document.getElementById(_p('ticket-type-chart'));
    var legEl  = document.getElementById(_p('ticket-type-legend'));
    var lbl    = document.getElementById(_p('tkt-sprint-lbl'));
    if (!canvas) return;

    var s = sprints.filter(function(x) { return x.id === selectedId; })[0];
    if (!s) return;
    if (lbl) lbl.textContent = s.name;

    var labels = ['Story', 'Bug', 'Task', 'Spike', 'Epic'];
    var data   = [s.tickets.story, s.tickets.bug, s.tickets.task, s.tickets.spike, s.tickets.epic || 0];
    var colors = ['#6366F1', '#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6'];
    var total  = data.reduce(function(a, v) { return a + v; }, 0);

    charts.ticketType = new Chart(canvas.getContext('2d'), {
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

  function renderCapacity() {
    if (charts.capacity) { charts.capacity.destroy(); delete charts.capacity; }
    var canvas = document.getElementById(_p('capacity-chart'));
    var lbl    = document.getElementById(_p('cap-sprint-lbl'));
    if (!canvas) return;

    var s = sprints.filter(function(x) { return x.id === selectedId; })[0];
    if (!s) return;
    if (lbl) lbl.textContent = s.name;

    var members  = capacity[selectedId] || [];
    var names    = members.map(function(m) { return m.name.split(' ')[0]; });
    var assigned = members.map(function(m) { return m.assigned; });
    var done     = members.map(function(m) { return m.completed; });

    charts.capacity = new Chart(canvas.getContext('2d'), {
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
      options: chartOpts({
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

  function renderTicketTable() {
    var el  = document.getElementById(_p('ticket-table'));
    var lbl = document.getElementById(_p('tbl-sprint-lbl'));
    var cnt = document.getElementById(_p('tbl-count'));
    if (!el) return;

    var sprintTickets = tickets[selectedId] || [];
    var sprint  = sprints.filter(function(x) { return x.id === selectedId; })[0];
    if (lbl && sprint) lbl.textContent = sprint.name;
    if (cnt) cnt.textContent = sprintTickets.length + ' ticket' + (sprintTickets.length !== 1 ? 's' : '');

    if (!sprintTickets.length) {
      el.innerHTML = '<div style="padding:24px;text-align:center;font-size:13px;color:var(--muted)">No ticket data for this sprint.</div>';
      return;
    }

    el.innerHTML = ''
      + '<div style="display:grid;grid-template-columns:88px 1fr 140px 70px 72px 40px 100px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);padding:8px 20px;border-bottom:1px solid var(--border)">'
      +   '<div>ID</div><div>Title</div><div>Epic</div><div>Type</div><div>Assignee</div><div style="text-align:center">Pts</div><div>Status</div>'
      + '</div>'
      + sprintTickets.map(function(t) {
          var tc = TYPE_COLORS[t.type] || '#9CA3AF';
          var sc = STS_COLORS[t.status] || '#9CA3AF';
          var sl = STS_LABELS[t.status] || t.status;
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
  // Logic lives in ai-insights.js; this is just the team-specific render call.

  function renderSummary() {
    var sprint = sprints.filter(function(s) { return s.id === selectedId; })[0];
    if (!sprint) { var el = document.getElementById(_p('summary')); if (el) el.innerHTML = ''; return; }
    var insights = sprintInsights(sprint, tickets[sprint.id], capacity[sprint.id]);
    renderInsightBox(_p('summary'), sprint.name, insights);
  }

  // ── PPTX export (thin wrapper — logic lives in js/sprint-pptx.js) ─────────

  function exportToPptx() {
    var sprint = sprints.filter(function(s) { return s.id === selectedId; })[0];
    if (!sprint) return;
    var sprintIdx = sprints.indexOf(sprint);
    var nextSprint = (sprintIdx >= 0 && sprintIdx < sprints.length - 1) ? sprints[sprintIdx + 1] : null;
    var btn = document.getElementById(_p('pptx-btn'));
    function doExport() {
      sprintPptxExport({
        teamName: config.teamName,
        sprint: sprint,
        nextSprint: nextSprint,
        sprints: sprints,
        tickets: tickets,
        selectedId: selectedId
      }, btn);
    }
    if (nextSprint && tickets[nextSprint.id] === undefined) {
      loadSprintTickets(nextSprint.id, doExport);
    } else {
      doExport();
    }
  }

  // ── Sprint selection ──────────────────────────────────────────────────────

  function selectSprint(sprintId) {
    selectedId = sprintId;
    renderStrip();
    renderTicketType();
    renderCapacity();
    renderSummary(); // render with whatever data is available now

    // Load tickets on-demand if not yet cached for this sprint
    if (tickets[sprintId] !== undefined) {
      renderTicketTable();
      renderSummary(); // re-render with epic data
    } else {
      var tbl = document.getElementById(_p('ticket-table'));
      if (tbl) tbl.innerHTML = '<div style="padding:20px;text-align:center;font-size:12px;color:var(--muted)">'
        + '<span style="display:inline-block;width:12px;height:12px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:ld-spin .7s linear infinite;vertical-align:middle;margin-right:6px"></span>'
        + 'Loading tickets…</div>';
      loadSprintTickets(sprintId, function() {
        renderTicketTable();
        renderSummary(); // re-render once epics are loaded
      });
    }
  }

  // ── Chart.js shared options ───────────────────────────────────────────────

  function chartOpts(extra) {
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

  // ── Public instance ──
  var inst = {
    render:            function() { return '<div id="' + _p('root') + '">' + shell() + '</div>'; },
    init:              function() { loadFromJira(); },
    selectSprint:      function(sprintId) { selectSprint(sprintId); },
    renderMemberTrend: function() { renderMemberTrend(); },
    togglePinDd:       function() { togglePinDd(); },
    openPinModal:      function(linkIdOrNull) { openPinModal(linkIdOrNull); },
    deletePinLink:     function(linkId) { deletePinLink(linkId); },
    exportToPptx:      function() { exportToPptx(); }
  };
  _saInstances[id] = inst;
  return inst;
}
