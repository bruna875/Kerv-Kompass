// kanban-analysis.js — Kanban flow metrics factory
// Usage: var myTeam = createKanbanAnalysis({ id: 'ka-xts', teamName: 'XTS Team', subtitle: 'Kanban flow & cycle time', projectKey: 'XTS' });
// Then:  myTeam.render()  →  HTML string
//        myTeam.init()    →  loads Jira data + renders charts

var _kaInstances = {};
function _ka(id) { return _kaInstances[id]; }

function createKanbanAnalysis(config) {
  // config: { id, teamName, subtitle, projectKey }
  var id = config.id;

  var _c    = "_ka('" + id + "').";
  var _card = 'background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:16px';
  var _sec  = 'font-size:13px;font-weight:600;color:var(--text);letter-spacing:-.2px;margin-bottom:12px';
  function _p(s) { return id + '-' + s; }
  function _esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  // ── State ──
  var kData        = null;  // full API response
  var charts       = {};
  var pinnedLinks  = [];

  // ── Pin system (identical to sprint-analysis) ─────────────────────────────

  function loadPins(cb) {
    fetch('/api/neon/pinned-links?pageId=' + encodeURIComponent(id))
      .then(function(r) { return r.json(); })
      .then(function(rows) { pinnedLinks = Array.isArray(rows) ? rows : []; if (cb) cb(); })
      .catch(function() { pinnedLinks = []; if (cb) cb(); });
  }

  function _refreshPinDd() {
    var dd = document.getElementById(_p('pin-dd'));
    if (dd) dd.remove();
    loadPins(function() { _renderPinDd(); });
  }

  function togglePinDd() {
    var existing = document.getElementById(_p('pin-dd'));
    if (existing) { existing.remove(); return; }
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
    var PIN_LINK_SVG = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;opacity:.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
    var EDIT_SVG  = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var TRASH_SVG = '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.8 7.5A1 1 0 004.8 12.5h4.4a1 1 0 001-.9L11 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var linksHtml = '<div style="padding:2px 12px 6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--faint)">Pinned Links</div>';
    if (pinnedLinks.length) {
      pinnedLinks.forEach(function(link) {
        linksHtml += '<div style="display:flex;align-items:center;gap:4px;padding:5px 10px 5px 12px;min-height:34px">'
          + '<a href="' + _esc(link.url) + '" target="_blank" rel="noopener noreferrer" style="flex:1;min-width:0;display:flex;align-items:center;gap:7px;font-size:13px;color:var(--text);text-decoration:none;overflow:hidden" onmouseenter="this.style.color=\'var(--accent)\'" onmouseleave="this.style.color=\'var(--text)\'">'
          +   PIN_LINK_SVG + '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _esc(link.label) + '</span></a>'
          + '<button onclick="event.stopPropagation();_ka(\'' + id + '\').openPinModal(\'' + link.id + '\')" title="Edit" style="width:26px;height:26px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;border:none;border-radius:5px;background:none;color:var(--faint);cursor:pointer" onmouseenter="this.style.background=\'var(--subtle)\';this.style.color=\'var(--text)\'" onmouseleave="this.style.background=\'none\';this.style.color=\'var(--faint)\'">' + EDIT_SVG + '</button>'
          + '<button onclick="event.stopPropagation();_ka(\'' + id + '\').deletePinLink(\'' + link.id + '\')" title="Delete" style="width:26px;height:26px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;border:none;border-radius:5px;background:none;color:var(--faint);cursor:pointer" onmouseenter="this.style.background=\'#FFF0F0\';this.style.color=\'#E5243B\'" onmouseleave="this.style.background=\'none\';this.style.color=\'var(--faint)\'">' + TRASH_SVG + '</button>'
          + '</div>';
      });
    } else {
      linksHtml += '<div style="padding:4px 12px 8px;font-size:12px;color:var(--faint)">No pinned links yet</div>';
    }
    linksHtml += '<div style="height:1px;background:var(--border);margin:4px 0"></div>'
      + '<div onclick="_ka(\'' + id + '\').openPinModal(null);var d=document.getElementById(\'' + _p('pin-dd') + '\');if(d)d.remove()" style="padding:8px 14px;font-size:13px;color:var(--accent);cursor:pointer;font-weight:500;display:flex;align-items:center;gap:6px" onmouseenter="this.style.background=\'var(--subtle)\'" onmouseleave="this.style.background=\'none\'">'
      + '<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>Add new link</div>';
    dd.innerHTML = linksHtml;
    document.body.appendChild(dd);
    setTimeout(function() {
      document.addEventListener('click', function _close(e) {
        var ddEl = document.getElementById(_p('pin-dd'));
        if (!ddEl) { document.removeEventListener('click', _close); return; }
        if (!ddEl.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
          ddEl.remove(); document.removeEventListener('click', _close);
        }
      });
    }, 0);
  }

  function openPinModal(linkIdOrNull) {
    var link = linkIdOrNull ? pinnedLinks.filter(function(l) { return String(l.id) === String(linkIdOrNull); })[0] : null;
    var existing = document.getElementById(_p('pin-modal'));
    if (existing) existing.remove();
    var IF  = 'width:100%;box-sizing:border-box;padding:8px 10px;font-size:13px;border:1px solid var(--border-md);border-radius:8px;outline:none;font-family:inherit;color:var(--text)';
    var IF_F = 'onfocus="this.style.borderColor=\'var(--accent)\';this.style.boxShadow=\'0 0 0 3px rgba(237,0,94,.08)\'"';
    var IF_B = 'onblur="this.style.borderColor=\'var(--border-md)\';this.style.boxShadow=\'none\'"';
    var LB  = 'font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);display:block;margin-bottom:5px';
    var overlay = document.createElement('div');
    overlay.id = _p('pin-modal');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0);transition:background .18s';
    var card = document.createElement('div');
    card.style.cssText = 'background:#fff;border-radius:14px;padding:22px 22px 18px;width:380px;max-width:90vw;box-shadow:0 8px 40px rgba(0,0,0,.18);transform:scale(.95);opacity:0;transition:transform .18s,opacity .18s;font-family:inherit';
    card.innerHTML = '<div style="font-size:14px;font-weight:600;color:var(--text);margin-bottom:18px">' + (link ? 'Edit link' : 'Add new link') + '</div>'
      + '<div style="margin-bottom:12px"><label style="' + LB + '">Label</label><input id="' + _p('pin-lbl') + '" type="text" value="' + (link ? _esc(link.label) : '') + '" placeholder="e.g. Kanban Board" style="' + IF + '" ' + IF_F + ' ' + IF_B + '></div>'
      + '<div style="margin-bottom:18px"><label style="' + LB + '">URL</label><input id="' + _p('pin-url') + '" type="url" value="' + (link ? _esc(link.url) : '') + '" placeholder="https://…" style="' + IF + '" ' + IF_F + ' ' + IF_B + '></div>'
      + '<div id="' + _p('pin-err') + '" style="font-size:12px;color:#E5243B;margin-bottom:10px;display:none"></div>'
      + '<div style="display:flex;justify-content:flex-end;gap:8px">'
      +   '<button id="' + _p('pin-cancel') + '" style="height:34px;padding:0 16px;font-size:13px;font-weight:500;font-family:inherit;border:1px solid var(--border-md);border-radius:8px;background:#fff;color:var(--muted);cursor:pointer">Cancel</button>'
      +   '<button id="' + _p('pin-save') + '" style="height:34px;padding:0 16px;font-size:13px;font-weight:500;font-family:inherit;border:none;border-radius:8px;background:var(--accent);color:#fff;cursor:pointer;transition:opacity .12s" onmouseenter="this.style.opacity=\'.85\'" onmouseleave="this.style.opacity=\'1\'">' + (link ? 'Save changes' : 'Add link') + '</button>'
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
      var lbl = (document.getElementById(_p('pin-lbl')).value || '').trim();
      var urlVal = (document.getElementById(_p('pin-url')).value || '').trim();
      var errEl = document.getElementById(_p('pin-err')); var saveBtn = document.getElementById(_p('pin-save'));
      if (!lbl || !urlVal) { if (errEl) { errEl.textContent = 'Both fields are required.'; errEl.style.display = 'block'; } return; }
      if (errEl) errEl.style.display = 'none';
      if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Saving…'; }
      var payload = link ? { action: 'pin-update', id: link.id, label: lbl, url: urlVal } : { action: 'pin-create', pageId: id, label: lbl, url: urlVal };
      fetch('/api/neon/pinned-links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function(r) { return r.json(); })
        .then(function(res) {
          if (!res.ok) throw new Error(res.error || 'Save failed');
          loadPins(function() { closeModal(); setTimeout(function() { togglePinDd(); }, 220); });
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
      if (el) el.addEventListener('keydown', function(e) { if (e.key === 'Enter') doSave(); if (e.key === 'Escape') closeModal(); });
    });
  }

  function deletePinLink(linkId) {
    var link = pinnedLinks.filter(function(l) { return String(l.id) === String(linkId); })[0];
    var label = link ? link.label : 'this link';
    var existing = document.getElementById(_p('pin-confirm'));
    if (existing) existing.remove();
    var overlay = document.createElement('div');
    overlay.id = _p('pin-confirm');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:10001;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0);transition:background .18s';
    var card = document.createElement('div');
    card.style.cssText = 'background:#fff;border-radius:14px;padding:22px 22px 18px;width:320px;max-width:90vw;box-shadow:0 8px 40px rgba(0,0,0,.18);transform:scale(.95);opacity:0;transition:transform .18s,opacity .18s;font-family:inherit';
    card.innerHTML = '<div style="font-size:14px;font-weight:600;color:var(--text);margin-bottom:8px">Delete link</div>'
      + '<div style="font-size:13px;color:var(--muted);margin-bottom:20px">Remove <strong style="color:var(--text)">' + _esc(label) + '</strong>? This can\'t be undone.</div>'
      + '<div style="display:flex;justify-content:flex-end;gap:8px">'
      +   '<button id="' + _p('pc-cancel') + '" style="height:34px;padding:0 16px;font-size:13px;font-weight:500;font-family:inherit;border:1px solid var(--border-md);border-radius:8px;background:#fff;color:var(--muted);cursor:pointer">Cancel</button>'
      +   '<button id="' + _p('pc-ok') + '" style="height:34px;padding:0 16px;font-size:13px;font-weight:500;font-family:inherit;border:none;border-radius:8px;background:#E5243B;color:#fff;cursor:pointer">Delete</button>'
      + '</div>';
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    requestAnimationFrame(function() { requestAnimationFrame(function() {
      overlay.style.background = 'rgba(0,0,0,.32)';
      card.style.transform = 'scale(1)'; card.style.opacity = '1';
      var ok = document.getElementById(_p('pc-ok')); if (ok) ok.focus();
    }); });
    function closeConfirm() {
      overlay.style.background = 'rgba(0,0,0,0)'; card.style.transform = 'scale(.95)'; card.style.opacity = '0';
      setTimeout(function() { if (overlay.parentNode) overlay.remove(); }, 180);
    }
    overlay.addEventListener('click', function(e) { if (e.target === overlay) closeConfirm(); });
    document.getElementById(_p('pc-cancel')).onclick = closeConfirm;
    document.getElementById(_p('pc-ok')).onclick = function() {
      closeConfirm();
      fetch('/api/neon/pinned-links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'pin-delete', id: linkId }) })
        .then(function() { pinnedLinks = pinnedLinks.filter(function(l) { return String(l.id) !== String(linkId); }); _refreshPinDd(); });
    };
  }

  // ── Colours ───────────────────────────────────────────────────────────────

  var TYPE_COLORS = { Story: '#6366F1', Bug: '#EF4444', Task: '#3B82F6', Spike: '#F59E0B', Epic: '#8B5CF6' };

  // ── Shared chart defaults ─────────────────────────────────────────────────

  function chartOpts(extra) {
    return Object.assign({
      responsive: true,
      animation: { duration: 400 },
      plugins: { legend: { display: false }, tooltip: { bodyFont: { family: 'inherit', size: 11 }, titleFont: { family: 'inherit', size: 11 }, padding: 8, cornerRadius: 8 } }
    }, extra || {});
  }

  // ── Stat card ─────────────────────────────────────────────────────────────

  function statMini(label, value, sub, color) {
    return '<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px 12px">'
      + '<div style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);margin-bottom:4px">' + label + '</div>'
      + '<div style="font-size:18px;font-weight:700;color:' + color + ';letter-spacing:-.5px;line-height:1;margin-bottom:3px">' + value + '</div>'
      + '<div style="font-size:9px;color:var(--muted);line-height:1.3">' + sub + '</div>'
      + '</div>';
  }

  // ── Shell HTML ────────────────────────────────────────────────────────────

  function shell() {
    var BOARD_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="11" rx="1"/></svg>';
    return ''
      // ── Page header ──
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">'
      +   '<div style="display:flex;align-items:center;gap:10px">'
      +     '<div style="width:36px;height:36px;border-radius:8px;background:rgba(99,102,241,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#6366F1">' + BOARD_ICON + '</div>'
      +     '<div>'
      +       '<div style="font-size:20px;font-weight:600;color:var(--text);letter-spacing:-.3px">' + _esc(config.teamName) + '</div>'
      +       '<div style="display:flex;align-items:center;gap:8px;margin-top:1px">'
      +         '<div style="font-size:12px;color:var(--muted)">' + _esc(config.subtitle) + '</div>'
      +         '<span style="font-size:10px;font-weight:600;letter-spacing:.3px;color:#10B981;background:rgba(16,185,129,.1);border-radius:20px;padding:2px 8px">Kanban</span>'
      +       '</div>'
      +     '</div>'
      +   '</div>'
      +   '<div style="display:flex;align-items:center;gap:8px">'
      +     '<button id="' + _p('pin-btn') + '" onclick="_ka(\'' + id + '\').togglePinDd()" title="Pinned links"'
      +       ' style="width:34px;height:34px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border-md);border-radius:8px;background:var(--surface);color:var(--muted);cursor:pointer;transition:border-color .15s,color .15s;flex-shrink:0"'
      +       ' onmouseenter="this.style.borderColor=\'var(--accent)\';this.style.color=\'var(--accent)\'"'
      +       ' onmouseleave="this.style.borderColor=\'var(--border-md)\';this.style.color=\'var(--muted)\'">'
      +       '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.638 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v3.417"/><path d="M14.62 18.8A2.25 2.25 0 1 1 18 15.836a2.25 2.25 0 1 1 3.38 2.966l-2.626 2.856a.998.998 0 0 1-1.507 0z"/></svg>'
      +     '</button>'
      +   '</div>'
      + '</div>'

      // ══ SECTION: Flow Overview ══
      + '<div style="' + _sec + '">Flow Overview</div>'

      // ── 4 stat cards + throughput chart ──
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px" id="' + _p('stats') + '"></div>'

      // ── Throughput + WIP distribution ──
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">'
      +   '<div style="' + _card + '">'
      +     '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:2px">Throughput</div>'
      +     '<div style="font-size:10px;color:var(--muted);margin-bottom:10px">Tickets completed per week</div>'
      +     '<canvas id="' + _p('throughput-chart') + '" height="100"></canvas>'
      +   '</div>'
      +   '<div style="' + _card + '">'
      +     '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:2px">WIP by Stage</div>'
      +     '<div style="font-size:10px;color:var(--muted);margin-bottom:10px">Current open tickets per stage</div>'
      +     '<div id="' + _p('wip-bars') + '"></div>'
      +   '</div>'
      + '</div>'

      // ══ SECTION: Cycle Time ══
      + '<div style="' + _sec + '">Cycle Time <span style="font-size:10px;font-weight:400;color:var(--muted)">(creation → done, last 8 weeks)</span></div>'

      + '<div style="display:grid;grid-template-columns:1fr 220px;gap:12px;margin-bottom:12px">'
      +   '<div style="' + _card + '">'
      +     '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:2px">Cycle Time Distribution</div>'
      +     '<div style="font-size:10px;color:var(--muted);margin-bottom:10px">How long tickets take to complete</div>'
      +     '<canvas id="' + _p('ct-chart') + '" height="100"></canvas>'
      +   '</div>'
      +   '<div style="display:flex;flex-direction:column;gap:8px">'
      +     '<div id="' + _p('ct-stats') + '" style="display:flex;flex-direction:column;gap:8px"></div>'
      +     '<div style="' + _card + ';flex:1">'
      +       '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:10px">Type Mix (WIP)</div>'
      +       '<canvas id="' + _p('type-chart') + '" height="120"></canvas>'
      +       '<div id="' + _p('type-legend') + '" style="margin-top:10px"></div>'
      +     '</div>'
      +   '</div>'
      + '</div>'

      // ══ SECTION: Aging WIP ══
      + '<div style="' + _sec + '">Aging WIP</div>'

      // Aging summary bar
      + '<div id="' + _p('aging-bar') + '" style="margin-bottom:12px"></div>'

      // Ticket table
      + '<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:32px">'
      +   '<div style="padding:12px 16px 10px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">'
      +     '<div style="font-size:12px;font-weight:600;color:var(--text)">Open tickets — oldest first</div>'
      +     '<span id="' + _p('wip-count') + '" style="font-size:11px;color:var(--muted)"></span>'
      +   '</div>'
      +   '<div id="' + _p('wip-table') + '"></div>'
      + '</div>';
  }

  // ── Jira loading ──────────────────────────────────────────────────────────

  function loadFromJira() {
    var statsEl = document.getElementById(_p('stats'));
    if (statsEl) {
      statsEl.innerHTML = '<div style="grid-column:1/-1;padding:20px;text-align:center;font-size:12px;color:var(--muted)">'
        + '<span style="display:inline-block;width:14px;height:14px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:ld-spin .7s linear infinite;vertical-align:middle;margin-right:8px"></span>'
        + 'Loading Kanban data from Jira…</div>';
    }

    // Kanban metrics are served by the sprints endpoint (merged to stay within Vercel's 12-function limit)
    fetch('/api/jira/sprints?project=' + encodeURIComponent(config.projectKey))
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (!data.ok) throw new Error(data.error || 'Jira API error');
        if (!data.kanban) throw new Error('No Kanban metrics in response — board may be Scrum');
        kData = data.kanban;
        renderAll();
      })
      .catch(function(e) {
        console.error('[ka:' + id + '] load failed:', e.message);
        var errEl = document.getElementById(_p('stats'));
        if (errEl) {
          errEl.innerHTML = '<div style="grid-column:1/-1;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;max-width:480px">'
            + '<div style="font-size:13px;font-weight:600;color:#EF4444;margin-bottom:6px">Could not load Jira data</div>'
            + '<div style="font-size:12px;color:var(--muted);font-family:monospace">' + _esc(e.message) + '</div>'
            + '</div>';
        }
      });
  }

  // ── Render orchestrator ───────────────────────────────────────────────────

  function renderAll() {
    if (!kData) return;
    renderStats();
    renderThroughputChart();
    renderWipBars();
    renderCycleTimeChart();
    renderCtStats();
    renderTypeChart();
    renderAgingBar();
    renderWipTable();
  }

  // ── Stats cards ───────────────────────────────────────────────────────────

  function renderStats() {
    var el = document.getElementById(_p('stats'));
    if (!el) return;

    // Throughput trend
    var t7   = kData.last7Throughput;
    var p7   = kData.prev7Throughput;
    var tDelta = p7 > 0 ? Math.round((t7 - p7) / p7 * 100) : null;
    var tDeltaHtml = tDelta !== null
      ? '<span style="color:' + (tDelta >= 0 ? '#10B981' : '#EF4444') + '">' + (tDelta >= 0 ? '▲' : '▼') + ' ' + Math.abs(tDelta) + '% vs prev week</span>'
      : 'last 7 days';

    // Blocked color
    var blocked = kData.blockedCount;
    var bColor = blocked === 0 ? '#10B981' : blocked <= 2 ? '#F59E0B' : '#EF4444';

    // Cycle time color
    var avg = kData.avgCycleTime;
    var ctColor = avg === null ? '#9CA3AF' : avg <= 5 ? '#10B981' : avg <= 12 ? '#F59E0B' : '#EF4444';

    el.innerHTML = ''
      + statMini('WIP', kData.wipCount, 'tickets currently open', '#6366F1')
      + statMini('Throughput · 7d', t7 + ' tickets', tDeltaHtml, t7 > 0 ? '#10B981' : '#9CA3AF')
      + statMini('Avg Cycle Time', avg !== null ? avg + 'd' : '—', 'creation → done', ctColor)
      + statMini('Aging >14d', blocked, blocked === 0 ? 'No stale tickets' : 'tickets stale in stage', bColor);
  }

  // ── Throughput chart ──────────────────────────────────────────────────────

  function renderThroughputChart() {
    if (charts.throughput) { charts.throughput.destroy(); delete charts.throughput; }
    var canvas = document.getElementById(_p('throughput-chart'));
    if (!canvas || !kData) return;

    var weeks  = kData.throughputWeeks || [];
    var labels = weeks.map(function(w) { return w.label; });
    var counts = weeks.map(function(w) { return w.count; });
    var avg    = counts.length ? counts.reduce(function(a, b) { return a + b; }, 0) / counts.length : 0;

    charts.throughput = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Tickets done',
            data: counts,
            backgroundColor: counts.map(function(c) {
              return c >= avg * 1.2 ? 'rgba(16,185,129,.75)' : c < avg * 0.6 ? 'rgba(239,68,68,.65)' : 'rgba(99,102,241,.65)';
            }),
            borderRadius: 4,
            borderWidth: 0
          },
          {
            type: 'line',
            label: 'Avg',
            data: counts.map(function() { return Math.round(avg * 10) / 10; }),
            borderColor: 'rgba(245,158,11,.8)',
            borderWidth: 1.5,
            borderDash: [5, 4],
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: chartOpts({
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: function(ctx) { return ' ' + ctx.raw + ' tickets'; } } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 9, family: 'inherit' } }, border: { display: false } },
          y: { grid: { color: 'rgba(0,0,0,.05)' }, ticks: { font: { size: 10, family: 'inherit' }, stepSize: 1, precision: 0 }, border: { display: false }, beginAtZero: true }
        }
      })
    });
  }

  // ── WIP by stage bars ─────────────────────────────────────────────────────

  function renderWipBars() {
    var el = document.getElementById(_p('wip-bars'));
    if (!el || !kData) return;

    var stages = [
      { key: 'todo',      label: 'To Do',       color: '#9CA3AF' },
      { key: 'inprogress',label: 'In Progress',  color: '#6366F1' },
      { key: 'review',    label: 'In Review',    color: '#F59E0B' }
    ];
    var total = kData.wipCount || 1;
    var byStatus = kData.wipByStatus || {};

    el.innerHTML = stages.map(function(s) {
      var count = byStatus[s.key] || 0;
      var pct   = Math.round(count / total * 100);
      return '<div style="margin-bottom:14px">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">'
        +   '<span style="font-size:11px;color:var(--muted)">' + s.label + '</span>'
        +   '<span style="font-size:11px;font-weight:600;color:var(--text)">' + count + ' <span style="color:var(--faint);font-weight:400">(' + pct + '%)</span></span>'
        + '</div>'
        + '<div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden">'
        +   '<div style="height:100%;width:' + pct + '%;background:' + s.color + ';border-radius:3px;transition:width .4s"></div>'
        + '</div>'
        + '</div>';
    }).join('');
  }

  // ── Cycle time histogram ──────────────────────────────────────────────────

  function renderCycleTimeChart() {
    if (charts.ct) { charts.ct.destroy(); delete charts.ct; }
    var canvas = document.getElementById(_p('ct-chart'));
    if (!canvas || !kData) return;

    var hist   = kData.ctHistogram || [];
    var labels = hist.map(function(b) { return b.label; });
    var counts = hist.map(function(b) { return b.count; });
    var maxC   = Math.max.apply(null, counts) || 1;

    charts.ct = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Tickets',
          data: counts,
          backgroundColor: counts.map(function(c, i) {
            // Color by bucket position: fast=green, slow=red
            var ratio = i / (labels.length - 1);
            if (ratio < 0.35) return 'rgba(16,185,129,.7)';
            if (ratio < 0.65) return 'rgba(245,158,11,.7)';
            return 'rgba(239,68,68,.7)';
          }),
          borderRadius: 4,
          borderWidth: 0
        }]
      },
      options: chartOpts({
        plugins: { tooltip: { callbacks: { label: function(ctx) { return ' ' + ctx.raw + ' tickets'; } } } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 9, family: 'inherit' } }, border: { display: false } },
          y: { grid: { color: 'rgba(0,0,0,.05)' }, ticks: { font: { size: 10, family: 'inherit' }, stepSize: 1, precision: 0 }, border: { display: false }, beginAtZero: true }
        }
      })
    });
  }

  // ── Cycle time stat cards ─────────────────────────────────────────────────

  function renderCtStats() {
    var el = document.getElementById(_p('ct-stats'));
    if (!el || !kData) return;

    function ctColor(d) { return d === null ? '#9CA3AF' : d <= 5 ? '#10B981' : d <= 12 ? '#F59E0B' : '#EF4444'; }

    el.innerHTML = ''
      + statMini('Avg Cycle Time',    kData.avgCycleTime    !== null ? kData.avgCycleTime    + 'd' : '—', 'mean creation→done', ctColor(kData.avgCycleTime))
      + statMini('Median',            kData.medianCycleTime !== null ? kData.medianCycleTime + 'd' : '—', '50th percentile', ctColor(kData.medianCycleTime))
      + statMini('85th Percentile',   kData.p85CycleTime    !== null ? kData.p85CycleTime    + 'd' : '—', 'SLA reference point', ctColor(kData.p85CycleTime));
  }

  // ── Ticket type donut ─────────────────────────────────────────────────────

  function renderTypeChart() {
    if (charts.type) { charts.type.destroy(); delete charts.type; }
    var canvas = document.getElementById(_p('type-chart'));
    var legEl  = document.getElementById(_p('type-legend'));
    if (!canvas || !kData) return;

    var mix    = kData.typeMix || {};
    var order  = ['Story', 'Bug', 'Task', 'Spike', 'Epic'];
    var labels = order.filter(function(k) { return (mix[k] || 0) > 0; });
    var data   = labels.map(function(k) { return mix[k] || 0; });
    var colors = labels.map(function(k) { return TYPE_COLORS[k] || '#9CA3AF'; });
    var total  = data.reduce(function(a, v) { return a + v; }, 0);

    if (!total) {
      if (legEl) legEl.innerHTML = '<div style="font-size:11px;color:var(--faint)">No WIP data</div>';
      return;
    }

    charts.type = new Chart(canvas.getContext('2d'), {
      type: 'doughnut',
      data: { labels: labels, datasets: [{ data: data, backgroundColor: colors, borderWidth: 2, borderColor: '#fff', hoverOffset: 4 }] },
      options: { responsive: true, cutout: '68%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(ctx) { return ' ' + ctx.label + ': ' + ctx.raw; } } } } }
    });

    if (legEl) {
      legEl.innerHTML = labels.map(function(l, i) {
        return '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">'
          + '<div style="display:flex;align-items:center;gap:5px"><span style="width:7px;height:7px;border-radius:2px;background:' + colors[i] + ';flex-shrink:0"></span><span style="font-size:10px;color:var(--text)">' + l + '</span></div>'
          + '<span style="font-size:10px;font-weight:600;color:var(--text)">' + data[i] + '</span>'
          + '</div>';
      }).join('');
    }
  }

  // ── Aging summary bar ─────────────────────────────────────────────────────

  function renderAgingBar() {
    var el = document.getElementById(_p('aging-bar'));
    if (!el || !kData) return;

    var b = kData.agingBuckets || { fresh: 0, normal: 0, stale: 0, blocked: 0 };
    var total = (b.fresh + b.normal + b.stale + b.blocked) || 1;

    var segments = [
      { label: '0-2d', count: b.fresh,   color: '#10B981' },
      { label: '3-7d', count: b.normal,  color: '#6366F1' },
      { label: '8-14d',count: b.stale,   color: '#F59E0B' },
      { label: '>14d', count: b.blocked, color: '#EF4444' }
    ];

    var bar = segments.map(function(s) {
      var pct = Math.round(s.count / total * 100);
      return pct > 0
        ? '<div title="' + s.label + ': ' + s.count + ' tickets" style="height:100%;width:' + pct + '%;background:' + s.color + ';transition:width .4s;display:flex;align-items:center;justify-content:center">'
        +   (pct > 8 ? '<span style="font-size:9px;font-weight:700;color:#fff">' + s.count + '</span>' : '')
        + '</div>' : '';
    }).join('');

    var legend = segments.map(function(s) {
      return '<div style="display:flex;align-items:center;gap:4px">'
        + '<span style="width:8px;height:8px;border-radius:2px;background:' + s.color + ';flex-shrink:0"></span>'
        + '<span style="font-size:10px;color:var(--muted)">' + s.label + ' · <strong style="color:var(--text)">' + s.count + '</strong></span>'
        + '</div>';
    }).join('');

    el.innerHTML = '<div style="height:20px;border-radius:6px;overflow:hidden;display:flex;margin-bottom:8px">' + bar + '</div>'
      + '<div style="display:flex;gap:16px;flex-wrap:wrap">' + legend + '</div>';
  }

  // ── WIP ticket table ──────────────────────────────────────────────────────

  function renderWipTable() {
    var el  = document.getElementById(_p('wip-table'));
    var cnt = document.getElementById(_p('wip-count'));
    if (!el || !kData) return;

    var items = kData.wipItems || [];
    if (cnt) cnt.textContent = items.length + ' ticket' + (items.length !== 1 ? 's' : '');

    if (!items.length) {
      el.innerHTML = '<div style="padding:24px;text-align:center;font-size:13px;color:var(--muted)">No open tickets — great!</div>';
      return;
    }

    function ageColor(days) {
      if (days <= 2)  return '#10B981';
      if (days <= 7)  return '#6366F1';
      if (days <= 14) return '#F59E0B';
      return '#EF4444';
    }
    function ageBg(days) {
      if (days <= 2)  return '#F0FDF4';
      if (days <= 7)  return 'rgba(99,102,241,.07)';
      if (days <= 14) return '#FFFBEB';
      return '#FEF2F2';
    }

    el.innerHTML = ''
      + '<div style="display:grid;grid-template-columns:90px 1fr 110px 70px 120px 90px 90px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);padding:8px 20px;border-bottom:1px solid var(--border)">'
      +   '<div>ID</div><div>Title</div><div>Assignee</div><div>Type</div><div>Status</div><div style="text-align:right">In stage</div><div style="text-align:right">Total age</div>'
      + '</div>'
      + items.slice(0, 40).map(function(t) {
          var tc = TYPE_COLORS[t.type] || '#9CA3AF';
          var ac = ageColor(t.ageInStage);
          var ab = ageBg(t.ageInStage);
          return '<div style="display:grid;grid-template-columns:90px 1fr 110px 70px 120px 90px 90px;align-items:center;padding:9px 20px;border-bottom:1px solid var(--border);font-size:12px;transition:background .1s" onmouseenter="this.style.background=\'var(--subtle)\'" onmouseleave="this.style.background=\'\'">'
            + '<div style="font-size:11px;font-weight:600;color:#6366F1;font-family:monospace">' + _esc(t.key) + '</div>'
            + '<div style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:var(--text);padding-right:12px" title="' + _esc(t.title) + '">' + _esc(t.title) + '</div>'
            + '<div style="display:flex;align-items:center;gap:5px">'
            +   '<span style="width:20px;height:20px;border-radius:50%;background:var(--border);display:inline-flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:var(--text);flex-shrink:0">' + _esc(t.initials) + '</span>'
            +   '<span style="font-size:11px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _esc(t.assignee.split(' ')[0]) + '</span>'
            + '</div>'
            + '<div><span style="font-size:10px;font-weight:600;color:' + tc + ';background:' + tc + '18;border-radius:10px;padding:2px 7px">' + _esc(t.type) + '</span></div>'
            + '<div style="font-size:11px;color:var(--muted);overflow:hidden;white-space:nowrap;text-overflow:ellipsis">' + _esc(t.status) + '</div>'
            + '<div style="text-align:right"><span style="font-size:11px;font-weight:700;color:' + ac + ';background:' + ab + ';border-radius:6px;padding:2px 7px">' + t.ageInStage + 'd</span></div>'
            + '<div style="text-align:right;font-size:11px;color:var(--muted)">' + t.totalAge + 'd</div>'
            + '</div>';
        }).join('');
  }

  // ── Public API ────────────────────────────────────────────────────────────

  function render() {
    return '<div id="' + _p('root') + '">' + shell() + '</div>';
  }

  function init() {
    loadPins(function() { loadFromJira(); });
  }

  var instance = {
    render:         render,
    init:           init,
    togglePinDd:    togglePinDd,
    openPinModal:   openPinModal,
    deletePinLink:  deletePinLink
  };

  _kaInstances[id] = instance;
  return instance;
}
