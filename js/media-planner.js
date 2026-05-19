// media-planner.js — Media Planner (v1) page

// ── Sub-tab switcher (owned by v1) ──────────────────────────────────────────

function csTx2SubTab(tab) {
  ['inventory', 'moments', 'ai-media-plan', 'taxonomies', 'episodes'].forEach(function(t) {
    var btn = document.getElementById('tx2-sub-tab-' + t);
    var pnl = document.getElementById('tx2-sub-content-' + t);
    if (btn) btn.className = 'cs-dv-tab' + (t === 'ai-media-plan' ? ' cs-dv-tab--ai' : '') + (t === tab ? ' cs-dv-tab--act' : '');
    if (pnl) pnl.style.display = t === tab ? 'flex' : 'none';
  });
  if (tab === 'inventory')    { invRenderFilters(); invRenderInventory(); }
  if (tab === 'moments')      { txCustomSelections = []; txRenderCategories(); }
  if (tab === 'taxonomies')   { txCustomActiveTab = 'emotion'; txCustomCurrentPage = 1; txCustomRenderTable(); txRenderChips(); }
  if (tab === 'episodes')     txRenderEpisodes();
  if (tab === 'ai-media-plan') {
    var aiPanel = document.getElementById('tx2-sub-content-ai-media-plan');
    if (aiPanel) {
      aiPanel.style.display = 'flex';
      aiPanel.style.flexDirection = 'column';
      if (!aiPanel.firstChild) csTx2BuildAIParamsPanel();
    }
  }
}

// ── Media Planner v1: module-level state & self-contained flow ──────────────

var mp1TaxStep      = 'upload';
var mp1TaxInputType = 'video';
var mp1TaxFileName  = '';

function mp1ShowUpload() {
  mp1TaxStep = 'upload';
  var ca = document.getElementById('tx2-content-area');
  if (!ca) return;

  var pgname = document.getElementById('content-bc');
  if (pgname) pgname.textContent = 'Media Planner (v1)';

  function typeIcon(t) {
    return t === 'video'
      ? '<svg width="13" height="13" viewBox="0 0 32 32" fill="none"><rect x="2" y="6" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M22 13l8-5v16l-8-5V13z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'
      : t === 'doc'
      ? '<svg width="13" height="13" viewBox="0 0 32 32" fill="none"><path d="M6 4h14l6 6v18a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" stroke-width="1.8"/><path d="M20 4v6h6M10 14h12M10 18h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
      : '<svg width="13" height="13" viewBox="0 0 32 32" fill="none"><path d="M4 8h24M4 14h18M4 20h24M4 26h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  }

  var MP1_LIBRARY = [
    { type:'video', name:'below-deck-s12e03.mp4',        date:'2 May 2025',   moments:14, taxonomies:38 },
    { type:'video', name:'parks-and-rec-s04e11.mp4',     date:'29 Apr 2025',  moments:9,  taxonomies:22 },
    { type:'doc',   name:'Q1-content-brief.pdf',         date:'25 Apr 2025',  moments:6,  taxonomies:17 },
    { type:'text',  name:'Campaign brief — Spring 2025', date:'18 Apr 2025',  moments:4,  taxonomies:11 },
    { type:'video', name:'yellowstone-s05e08.mp4',       date:'11 Apr 2025',  moments:21, taxonomies:54 },
    { type:'doc',   name:'Brand-safety-guidelines.docx', date:'3 Apr 2025',   moments:3,  taxonomies:9  },
  ];

  var libraryRows = MP1_LIBRARY.map(function(item, i) {
    return '<div class="tx2-lib-row" onclick="mp1LibLoad(' + i + ')">'
      + '<div class="tx2-lib-icon">' + typeIcon(item.type) + '</div>'
      + '<div style="flex:1;min-width:0">'
      +   '<div style="font-size:12px;font-weight:500;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + item.name + '</div>'
      +   '<div style="font-size:11px;color:var(--faint);margin-top:2px">' + item.date + ' &nbsp;·&nbsp; ' + item.moments + ' moments &nbsp;·&nbsp; ' + item.taxonomies + ' taxonomies</div>'
      + '</div>'
      + '<div style="display:flex;align-items:center;gap:8px;flex-shrink:0">'
      +   '<span style="font-size:10px;font-weight:600;color:#16a34a;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:20px;padding:2px 8px">Completed</span>'
      + '</div>'
      + '</div>';
  }).join('');

  var mediaPlansPanel = savedMediaPlans.length === 0
    ? '<div style="padding:40px 0;text-align:center;color:var(--faint);font-size:12px">No saved media plans yet.<br>Build one from the inventory and hit Save.</div>'
    : savedMediaPlans.map(function(mp, i) {
        var totalEp = (mp.programs || []).length + (mp.episodes || []).length;
        var dspBadge = '';
        if (mp.dsp) {
          var dspCfg = { active:{bg:'#dcfce7',color:'#15803d',dot:'#16a34a',label:'Active'}, pending:{bg:'#fef9c3',color:'#854d0e',dot:'#ca8a04',label:'Pending'}, error:{bg:'#fee2e2',color:'#b91c1c',dot:'#ef4444',label:'Error'} }[mp.dsp.status] || {bg:'#f3f4f6',color:'#6b7280',dot:'#9ca3af',label:mp.dsp.status};
          dspBadge = '<div style="display:flex;align-items:center;gap:5px;padding:3px 8px 3px 6px;border-radius:20px;background:' + dspCfg.bg + ';flex-shrink:0"><span style="width:6px;height:6px;border-radius:50%;background:' + dspCfg.dot + ';flex-shrink:0"></span><span style="font-size:10px;font-weight:600;color:' + dspCfg.color + ';white-space:nowrap">' + mp.dsp.name + ' · ' + dspCfg.label + '</span></div>';
        } else {
          dspBadge = '<div style="display:flex;align-items:center;gap:5px;padding:3px 8px 3px 6px;border-radius:20px;background:var(--bg);border:1px solid var(--border);flex-shrink:0"><span style="font-size:10px;font-weight:500;color:var(--faint);white-space:nowrap">Not pushed</span></div>';
        }
        var inputIco = mp.inputType === 'video'
          ? '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M11 7l4-2v6l-4-2V7z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>'
          : mp.inputType === 'document'
          ? '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 2h5l3 3v9a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M9 2v3h3M5 8h6M5 11h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>'
          : '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
        return '<div class="tx2-lib-row" onclick="csTx2ShowMediaPlanDetail(' + i + ')" style="align-items:center">'
          + '<div class="tx2-lib-icon" style="flex-shrink:0">' + inputIco + '</div>'
          + '<div style="flex:1;min-width:0">'
          +   '<div style="font-size:12px;font-weight:500;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + mp.name + '</div>'
          +   '<div style="font-size:11px;color:var(--faint);margin-top:2px">' + mp.date + (mp.author ? ' &nbsp;·&nbsp; ' + mp.author : '') + ' &nbsp;·&nbsp; ' + totalEp + ' items' + (mp.impressions ? ' &nbsp;·&nbsp; ' + mp.impressions + ' imp.' : '') + (mp.dollars ? ' &nbsp;·&nbsp; ' + mp.dollars : '') + (mp.flightStart && mp.flightEnd ? ' &nbsp;·&nbsp; <svg width="9" height="9" viewBox="0 0 12 12" fill="none" style="vertical-align:middle;margin-right:2px"><rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M1 5h10M4 1v2M8 1v2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>' + mp.flightStart + ' → ' + mp.flightEnd : '') + '</div>'
          + '</div>'
          + dspBadge
          + '<div style="display:flex;gap:4px;flex-shrink:0;margin-left:8px" onclick="event.stopPropagation()">'
          +   '<button onclick="csTx2EditMediaPlan(' + i + ')" title="Rename" style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:6px;background:var(--surface);color:var(--muted);cursor:pointer;padding:0"><svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
          +   '<button onclick="csTx2DeleteMediaPlan(' + i + ')" title="Delete" style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;border:1px solid #fecaca;border-radius:6px;background:#fff5f5;color:#ef4444;cursor:pointer;padding:0"><svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.8 7.5A1 1 0 004.8 12.5h4.4a1 1 0 001-.9L11 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
          + '</div>'
          + '</div>';
      }).join('');

  ca.innerHTML =
    '<div style="display:flex;gap:0;min-height:400px">'
    + '<div style="width:300px;flex-shrink:0;padding-right:24px;border-right:1px solid var(--border)">'
    +   '<div style="margin-bottom:32px">'
    +     '<div style="font-size:14px;font-weight:600;color:var(--text);letter-spacing:-.2px;margin-bottom:3px">New Analysis</div>'
    +     '<div style="font-size:12px;color:var(--muted)">Choose an input type</div>'
    +   '</div>'
    +   '<div style="display:flex;gap:2px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:3px;margin-bottom:16px">'
    +     '<div class="tx2-seg tx2-seg--act" id="tx2-opt-video" onclick="mp1SelectInput(\'video\')">'
    +       '<svg width="13" height="13" viewBox="0 0 32 32" fill="none"><rect x="2" y="6" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M22 13l8-5v16l-8-5V13z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'
    +       '<span>Video</span>'
    +     '</div>'
    +     '<div class="tx2-seg" id="tx2-opt-brief" onclick="mp1SelectInput(\'brief\')">'
    +       '<svg width="13" height="13" viewBox="0 0 32 32" fill="none"><path d="M4 8h24M4 14h18M4 20h24M4 26h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
    +       '<span>Brief</span>'
    +     '</div>'
    +   '</div>'
    +   '<div id="tx2-input-area" style="margin-bottom:16px">'
    +     '<div class="tx2-upload-zone" onclick="document.getElementById(\'tx2-file-input-video\').click()">'
    +       '<input type="file" id="tx2-file-input-video" style="display:none" accept="video/*">'
    +       '<svg width="28" height="28" viewBox="0 0 32 32" fill="none" style="color:var(--faint)"><rect x="2" y="6" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.6"/><path d="M22 13l8-5v16l-8-5V13z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
    +       '<div style="font-size:13px;font-weight:500;color:var(--text);margin-top:6px">Drop video file here</div>'
    +       '<div style="font-size:11px;color:var(--faint);margin-top:2px">MP4, MOV, AVI — up to 2 GB</div>'
    +     '</div>'
    +   '</div>'
    +   '<button class="cs-btn-primary" style="width:100%;height:38px;font-size:13px" onclick="mp1Analyze()">Start Analysis</button>'
    + '</div>'
    + '<div style="flex:1;min-width:0;padding-left:24px;display:flex;flex-direction:column">'
    +   '<div style="display:flex;gap:0;border-bottom:1px solid var(--border);margin-bottom:18px;flex-shrink:0">'
    +     '<div class="tx2-home-tab' + (csTx2HomeTab === 'analyses' ? ' tx2-home-tab--act' : '') + '" onclick="csTx2SwitchHomeTab(\'analyses\')">Previous Analyses</div>'
    +     '<div class="tx2-home-tab' + (csTx2HomeTab === 'plans' ? ' tx2-home-tab--act' : '') + '" onclick="csTx2SwitchHomeTab(\'plans\')">Media Plans</div>'
    +   '</div>'
    +   '<div id="tx2-home-panel-analyses" style="flex:1;overflow-y:auto;flex-direction:column;gap:0;' + (csTx2HomeTab !== 'analyses' ? 'display:none' : 'display:flex') + '">'
    +     libraryRows
    +   '</div>'
    +   '<div id="tx2-home-panel-plans" style="flex:1;overflow-y:auto;' + (csTx2HomeTab !== 'plans' ? 'display:none' : '') + '">'
    +     mediaPlansPanel
    +   '</div>'
    + '</div>'
    + '</div>';
}

function mp1SelectInput(type) {
  ['video', 'brief'].forEach(function(t) {
    var el = document.getElementById('tx2-opt-' + t);
    if (el) el.className = 'tx2-seg' + (t === type ? ' tx2-seg--act' : '');
  });
  var area = document.getElementById('tx2-input-area');
  if (!area) return;
  if (type === 'video') {
    mp1TaxInputType = 'video';
    area.innerHTML =
      '<div class="tx2-upload-zone" onclick="document.getElementById(\'tx2-file-input-video\').click()">'
      + '<input type="file" id="tx2-file-input-video" style="display:none" accept="video/*">'
      + '<svg width="28" height="28" viewBox="0 0 32 32" fill="none" style="color:var(--faint)"><rect x="2" y="6" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.6"/><path d="M22 13l8-5v16l-8-5V13z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
      + '<div style="font-size:13px;font-weight:500;color:var(--text);margin-top:6px">Drop video file here</div>'
      + '<div style="font-size:11px;color:var(--faint);margin-top:2px">MP4, MOV, AVI — up to 2 GB</div>'
      + '</div>';
  } else {
    mp1TaxInputType = 'text';
    area.innerHTML = mp1BriefHtml();
  }
}

function mp1BriefHtml() {
  return '<div style="border:1px solid var(--border-md);border-radius:8px;overflow:hidden;background:var(--surface)">'
    + '<textarea id="tx2-text-input" placeholder="Paste or type your brief here. The AI will analyse topics, sentiments, moments and taxonomy classifications…" style="width:100%;box-sizing:border-box;min-height:160px;resize:none;border:none;outline:none;padding:10px 12px;font-size:13px;font-family:inherit;color:var(--text);background:transparent;display:block"></textarea>'
    + '<div style="height:1px;background:var(--border)"></div>'
    + '<label for="tx2-file-input-doc" id="tx2-brief-upload-label" style="display:flex;align-items:center;gap:7px;padding:8px 12px;cursor:pointer;color:var(--muted);font-size:12px;transition:background .13s,color .13s;border-radius:0 0 8px 8px" onmouseenter="this.style.background=\'var(--bg)\';this.style.color=\'var(--text)\'" onmouseleave="this.style.background=\'\';this.style.color=\'var(--muted)\'">'
    +   '<svg width="13" height="13" viewBox="0 0 32 32" fill="none"><path d="M6 4h14l6 6v18a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" stroke-width="1.8"/><path d="M20 4v6h6M10 14h12M10 18h12M10 22h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
    +   '<span id="tx2-brief-file-label">Upload Doc or PDF</span>'
    + '</label>'
    + '<input type="file" id="tx2-file-input-doc" style="display:none" accept=".pdf,.doc,.docx" onchange="var n=this.files[0]?this.files[0].name:\'\';document.getElementById(\'tx2-brief-file-label\').textContent=n||\'Upload Doc or PDF\';mp1TaxInputType=n?\'doc\':\'text\'">'
    + '</div>';
}

function mp1Analyze() {
  var ca = document.getElementById('tx2-content-area');
  if (!ca) return;
  mp1TaxStep = 'progress';

  if (mp1TaxInputType === 'text') {
    var ta = document.getElementById('tx2-text-input');
    var raw = ta ? ta.value.trim() : '';
    mp1TaxFileName = raw.length ? (raw.slice(0, 42) + (raw.length > 42 ? '…' : '')) : 'Free text input';
  } else {
    var fi = document.getElementById('tx2-file-input-' + mp1TaxInputType);
    mp1TaxFileName = (fi && fi.files && fi.files[0]) ? fi.files[0].name
      : (mp1TaxInputType === 'video' ? 'video-file.mp4' : 'document.pdf');
  }

  var progressSteps = ['Analyzing metadata…','Detecting scenes & objects…','Classifying moments…','Building taxonomy map…','Matching episodes & shows…'];
  var frames = ['https://picsum.photos/seed/kervscene1/640/360','https://picsum.photos/seed/kervscene2/640/360','https://picsum.photos/seed/kervscene3/640/360','https://picsum.photos/seed/kervscene4/640/360','https://picsum.photos/seed/kervscene5/640/360'];

  ca.innerHTML =
    '<div style="max-width:520px;margin:0 auto">'
    + '<div style="margin-bottom:14px">'
    +   '<div style="font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.6px;color:var(--faint);margin-bottom:3px">Scanning video</div>'
    +   '<div style="font-size:15px;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + mp1TaxFileName + '</div>'
    + '</div>'
    + '<div style="position:relative;width:100%;padding-top:56.25%;border-radius:10px;overflow:hidden;background:#111;margin-bottom:14px">'
    +   '<img id="tx2-prog-frame" src="' + frames[0] + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:opacity .5s">'
    +   '<div id="tx2-scan-line" style="position:absolute;left:0;right:0;height:2px;top:0%;background:rgba(237,0,94,.7);box-shadow:0 0 10px 2px rgba(237,0,94,.35);transition:none"></div>'
    +   '<div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.65) 0%,transparent 55%);pointer-events:none">'
    +     '<div style="position:absolute;bottom:10px;left:12px;right:12px;display:flex;align-items:center;justify-content:space-between">'
    +       '<span id="tx2-prog-timecode" style="font-size:10px;color:rgba(255,255,255,.75);font-variant-numeric:tabular-nums;letter-spacing:.5px">00:00:00</span>'
    +       '<span id="tx2-prog-scene" style="font-size:10px;color:rgba(255,255,255,.5)">Scene 1 / 5</span>'
    +     '</div>'
    +   '</div>'
    + '</div>'
    + '<div style="font-size:12px;color:var(--muted);margin-bottom:10px;min-height:18px" id="tx2-progress-label">' + progressSteps[0] + '</div>'
    + '<div class="tx2-progress-track" style="margin-bottom:7px"><div class="tx2-progress-fill" id="tx2-progress-bar" style="width:0%"></div></div>'
    + '<div style="font-size:11px;color:var(--faint);text-align:right" id="tx2-progress-pct">0%</div>'
    + '</div>';

  var pct = 0, stepIdx = 0, scanPct = 0, frameIdx = 0;
  var interval = setInterval(function() {
    pct = Math.min(pct + 0.45, 100);
    scanPct = (scanPct + 3) % 100;
    var bar = document.getElementById('tx2-progress-bar'), label = document.getElementById('tx2-progress-label');
    var pctEl = document.getElementById('tx2-progress-pct'), scanLine = document.getElementById('tx2-scan-line');
    var timecode = document.getElementById('tx2-prog-timecode'), sceneLbl = document.getElementById('tx2-prog-scene');
    var frameEl = document.getElementById('tx2-prog-frame');
    if (bar) bar.style.width = pct + '%';
    if (pctEl) pctEl.textContent = Math.round(pct) + '%';
    if (scanLine) scanLine.style.top = scanPct + '%';
    var totalSec = Math.round((pct / 100) * 2655);
    var hh = String(Math.floor(totalSec / 3600)).padStart(2,'0'), mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2,'0'), ss = String(totalSec % 60).padStart(2,'0');
    if (timecode) timecode.textContent = hh + ':' + mm + ':' + ss;
    var newStep = Math.min(Math.floor(pct / 20), progressSteps.length - 1);
    if (newStep !== stepIdx) {
      stepIdx = newStep;
      if (label) label.textContent = progressSteps[stepIdx];
      var newFrameIdx = Math.min(newStep, frames.length - 1);
      if (frameEl && newFrameIdx !== frameIdx) {
        frameIdx = newFrameIdx;
        frameEl.style.opacity = '0';
        setTimeout(function() { if (frameEl) { frameEl.src = frames[frameIdx]; frameEl.style.opacity = '1'; } }, 250);
      }
      if (sceneLbl) sceneLbl.textContent = 'Scene ' + (newStep + 1) + ' / 5';
    }
    if (pct >= 100) { clearInterval(interval); if (scanLine) scanLine.style.display = 'none'; setTimeout(mp1ShowResults, 600); }
  }, 40);
}

function mp1ShowResults() {
  mp1TaxStep = 'results';
  var ca = document.getElementById('tx2-content-area');
  if (!ca) return;

  var TH = 'padding:9px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);border-bottom:1px solid var(--border)';
  var fileIcon = mp1TaxInputType === 'video'
    ? '<svg width="12" height="12" viewBox="0 0 32 32" fill="none"><rect x="2" y="6" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M22 13l8-5v16l-8-5V13z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'
    : mp1TaxInputType === 'doc'
    ? '<svg width="12" height="12" viewBox="0 0 32 32" fill="none"><path d="M6 4h14l6 6v18a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" stroke-width="1.8"/><path d="M20 4v6h6M10 14h12M10 18h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
    : '<svg width="12" height="12" viewBox="0 0 32 32" fill="none"><path d="M4 8h24M4 14h18M4 20h24M4 26h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  var typeLabel = mp1TaxInputType === 'video' ? 'Video' : mp1TaxInputType === 'doc' ? 'Document' : 'Text';

  var pgname = document.getElementById('content-bc');
  if (pgname) pgname.innerHTML =
    '<span style="font-weight:400;opacity:.55;cursor:pointer" onclick="mp1ShowUpload()">Media Planner (v1)</span>'
    + ' &nbsp;/&nbsp; Analysis';

  ca.innerHTML =
    '<div style="display:flex;gap:20px;align-items:start;height:calc(100vh - 260px);min-height:460px">'
    + '<div style="width:164px;flex-shrink:0;display:flex;flex-direction:column;gap:14px">'
    +   '<div>'
    +     '<div style="position:relative;width:100%;padding-top:56.25%;border-radius:8px;overflow:hidden;margin-bottom:10px">'
    +       '<img id="tx-thumb-img" src="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;background:#e5e7eb">'
    +       '<div style="position:absolute;inset:0;background:rgba(0,0,0,.28);display:flex;align-items:center;justify-content:center">'
    +         '<div style="width:26px;height:26px;background:rgba(255,255,255,.9);border-radius:50%;display:flex;align-items:center;justify-content:center">'
    +           '<svg width="9" height="11" viewBox="0 0 11 13" fill="none"><path d="M1 1.5l9 5-9 5V1.5z" fill="#111" stroke="#111" stroke-width=".5" stroke-linejoin="round"/></svg>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +     '<div style="font-size:12px;font-weight:600;color:var(--text);word-break:break-word;line-height:1.4;margin-bottom:6px">' + mp1TaxFileName + '</div>'
    +     '<div style="display:flex;align-items:center;gap:5px;margin-bottom:10px">'
    +       '<span style="font-size:10px;color:var(--muted);display:flex;align-items:center;gap:3px">' + fileIcon + ' ' + typeLabel + '</span>'
    +     '</div>'
    +   '</div>'
    +   '<div style="display:flex;flex-direction:column;gap:0">'
    +     '<div><div style="font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);margin-bottom:2px">Moments</div><div style="font-size:18px;font-weight:700;color:var(--text)">10</div></div>'
    +     '<div><div style="font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);margin-bottom:2px">Taxonomies</div><div style="font-size:18px;font-weight:700;color:var(--text)">28</div></div>'
    +   '</div>'
    + '</div>'
    + '<div style="flex:1;min-width:0;display:flex;gap:16px;height:100%;overflow:hidden">'
    +   '<div style="flex:1;min-width:0;display:flex;flex-direction:column;height:100%;overflow:hidden">'
    +   '<div class="cs-dv-tabnav" style="margin-bottom:16px;flex-shrink:0">'
    +     '<button class="cs-dv-tab cs-dv-tab--act" id="tx2-sub-tab-inventory"     onclick="csTx2SubTab(\'inventory\')">By Inventory</button>'
    +     '<button class="cs-dv-tab"                 id="tx2-sub-tab-moments"       onclick="csTx2SubTab(\'moments\')">By Moments</button>'
    +     '<button class="cs-dv-tab cs-dv-tab--ai"   id="tx2-sub-tab-ai-media-plan" onclick="csTx2SubTab(\'ai-media-plan\')">'
    +       '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M6 2L7.3 5.7 11 7 7.3 8.3 6 12 4.7 8.3 1 7 4.7 5.7Z"/><path d="M12.5 1L13.3 3.2 15.5 4 13.3 4.8 12.5 7 11.7 4.8 9.5 4 11.7 3.2Z" opacity=".65"/></svg>'
    +       'AI Media Plan'
    +     '</button>'
    +   '</div>'
    +   '<div id="tx2-sub-content-inventory" style="display:flex;flex:1;min-height:0;flex-direction:column;overflow:hidden">'
    +     '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-shrink:0" id="inv-filters-wrap"></div>'
    +     '<div id="inv-content-wrap" style="flex:1;overflow-y:auto;min-height:0"></div>'
    +   '</div>'
    +   '<div id="tx2-sub-content-moments" style="display:flex;flex:1;min-height:0;flex-direction:column">'
    +     '<div style="overflow-y:auto;flex:1;min-height:0">'
    +       '<table style="width:100%;border-collapse:collapse"><thead><tr>'
    +         '<th style="text-align:left;'  + TH + '">Moment</th>'
    +         '<th style="text-align:right;' + TH + '">Score</th>'
    +         '<th style="text-align:right;' + TH + '">Inventory</th>'
    +       '</tr></thead><tbody id="tx-cat-body"></tbody></table>'
    +     '</div>'
    +   '</div>'
    +   '<div id="tx2-sub-content-ai-media-plan" style="display:none;flex:1;min-height:0;overflow:hidden;background:linear-gradient(160deg,#fef6fb 0%,var(--surface) 70%);border-radius:10px;margin-top:4px"></div>'
    +   '</div>'
    +   '<div id="inv-media-plan" style="display:none;width:220px;flex-shrink:0;flex-direction:column;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:14px;overflow:hidden"></div>'
    + '</div>'
    + '</div>';

  if (typeof txInjectStyles === 'function') txInjectStyles();
  txCustomSelections = [];
  fetch('/api/unsplash?q=The+Home+Depot+store')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var img = document.getElementById('tx-thumb-img');
      if (img && data.url) img.src = data.url;
    })
    .catch(function() {});
  invRenderFilters();
  csTx2SubTab('inventory');
}

function mp1LibLoad(idx) {
  var MP1_LIBRARY = [
    { type:'video', name:'below-deck-s12e03.mp4' },
    { type:'video', name:'parks-and-rec-s04e11.mp4' },
    { type:'doc',   name:'Q1-content-brief.pdf' },
    { type:'text',  name:'Campaign brief — Spring 2025' },
    { type:'video', name:'yellowstone-s05e08.mp4' },
    { type:'doc',   name:'Brand-safety-guidelines.docx' },
  ];
  var item = MP1_LIBRARY[idx];
  if (!item) return;
  mp1TaxInputType = item.type;
  mp1TaxFileName  = item.name;
  mp1ShowResults();
}

// ── Media Planner v1 entry point ────────────────────────────────────────────

function renderInventoryExplorerV2() {
  setTimeout(function() {
    mp1TaxStep = 'upload'; mp1TaxInputType = 'video'; mp1TaxFileName = '';
    sdtInjectStyles();
    mp1ShowUpload();
  }, 0);
  return `
<div class="ptitle">Media Planner (v1)</div>
<div class="psub" style="margin-bottom:24px">Upload a video or brief and let KervSDT analyse moments, metadata and taxonomy classifications</div>
<div id="sdt-panel-taxonomy2">
  <div class="cs-card" style="padding:32px">
    <div id="tx2-content-area"></div>
  </div>
</div>`;
}

function csTx2ShowMediaPlanDetail(idx) {
  var plan = savedMediaPlans[idx];
  if (!plan) return;
  var ca = document.getElementById('tx2-content-area');
  if (!ca) return;

  csTx2HomeTab = 'plans';

  var TH  = 'padding:9px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);border-bottom:1px solid var(--border);white-space:nowrap';
  var TOT = 'padding:10px 12px;font-size:12px;font-weight:600;color:var(--text);border-top:2px solid var(--border-md);background:var(--bg)';
  var DELBTN = 'border:none;background:none;cursor:pointer;color:var(--faint);padding:2px 6px;border-radius:5px;line-height:1;font-size:16px;transition:color .12s';
  var pencilSvg = '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var CPM_DT = { 'Prime Time': 25, 'Daytime': 15, 'Late Night': 18, 'Morning': 12, 'Early Fringe': 20 };

  // Merge programs + episodes into a unified list with delete info
  var allItems = [];
  (plan.programs || []).forEach(function(p, pi) {
    var seed = p.seed || ('tvshow' + p.id);
    var impNum = p.impressionsNum || 0;
    var cpm    = CPM_DT[p.daypart] || 20;
    allItems.push({ imgSeed: seed, show: p.title, episode: null, channel: p.channel, scene: null, impressionsLabel: p.impressionsLabel || null, dollars: impNum > 0 ? invFmtDollars(impNum * 1000 * cpm) : null, _impNum: impNum, _dollarsNum: impNum * 1000 * cpm, _type: 'program', _idx: pi });
  });
  (plan.episodes || []).forEach(function(ep, ei) {
    var impNum = ep.impressionsNum || 0;
    allItems.push({ imgSeed: ep.imgSeed, show: ep.show, episode: ep.episode, channel: ep.channel, scene: ep.scene, impressionsLabel: null, dollars: impNum > 0 ? invFmtDollars(impNum * 1000 * 20) : null, _impNum: impNum, _dollarsNum: impNum * 1000 * 20, _type: 'episode', _idx: ei });
  });

  var totalImpNum  = allItems.reduce(function(s, item) { return s + (item._impNum || 0); }, 0);
  var totalDollarsNum = allItems.reduce(function(s, item) { return s + (item._dollarsNum || 0); }, 0);
  var fmtTotImp = totalImpNum >= 1 ? totalImpNum.toFixed(1) + 'M' : totalImpNum > 0 ? Math.round(totalImpNum * 1000) + 'K' : '—';

  var tableRowsHtml = allItems.length === 0
    ? '<tr><td colspan="5" style="padding:32px;text-align:center;font-size:12px;color:var(--faint)">No episodes in this plan.</td></tr>'
    : allItems.map(function(item) {
        return '<tr style="border-bottom:1px solid var(--border)">'
          + '<td style="padding:10px 12px">'
          +   '<div style="display:flex;align-items:center;gap:10px">'
          +     '<div style="width:56px;height:32px;border-radius:4px;overflow:hidden;flex-shrink:0;background:var(--bg)">'
          +       '<img src="https://picsum.photos/seed/' + item.imgSeed + '/128/72" style="width:100%;height:100%;object-fit:cover"/>'
          +     '</div>'
          +     '<div>'
          +       '<div style="font-size:12px;font-weight:500;color:var(--text);line-height:1.3">' + item.show + '</div>'
          +       (item.episode ? '<div style="font-size:11px;color:var(--faint);margin-top:1px">' + item.episode + '</div>' : '')
          +     '</div>'
          +   '</div>'
          + '</td>'
          + '<td style="padding:10px 12px;font-size:12px;color:var(--muted);white-space:nowrap">' + (item.channel || '—') + '</td>'
          + '<td style="padding:10px 12px;font-size:12px;color:var(--muted);white-space:nowrap">' + (item.scene || '—') + '</td>'
          + '<td style="padding:10px 12px;font-size:12px;font-weight:500;color:var(--text);text-align:right;white-space:nowrap">' + (item.impressionsLabel || '—') + '</td>'
          + '<td style="padding:10px 12px;font-size:12px;font-weight:600;color:var(--text);text-align:right;white-space:nowrap">' + (item.dollars || '—') + '</td>'
          + '<td style="padding:6px 8px;text-align:center;width:32px">'
          +   '<button style="' + DELBTN + '" onclick="csTx2DeletePlanItem(' + idx + ',\'' + item._type + '\',' + item._idx + ')" onmouseenter="this.style.color=\'var(--accent)\'" onmouseleave="this.style.color=\'var(--faint)\'">×</button>'
          + '</td>'
          + '</tr>';
      }).join('');

  // Update breadcrumb
  var pgname = document.getElementById('content-bc');
  if (pgname) pgname.innerHTML =
    '<span style="font-weight:400;opacity:.55;cursor:pointer" onclick="mp1ShowUpload()">Media Planner (v1)</span>'
    + ' &nbsp;/&nbsp; ' + plan.name;

  ca.innerHTML =

    // Header
    '<div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:nowrap;margin-bottom:20px;gap:16px">'
    +   '<div style="min-width:0;flex:1">'
    // Inline-editable title
    +     '<div id="mp-title-wrap-' + idx + '">'
    +       '<div id="mp-title-display-' + idx + '" style="display:flex;align-items:center;gap:6px;cursor:pointer" onmouseenter="document.getElementById(\'mp-pencil-' + idx + '\').style.opacity=\'1\'" onmouseleave="document.getElementById(\'mp-pencil-' + idx + '\').style.opacity=\'0\'" onclick="csTx2StartEditPlanName(' + idx + ')">'
    +         '<span style="font-size:18px;font-weight:600;color:var(--text);letter-spacing:-.3px">' + plan.name + '</span>'
    +         '<span id="mp-pencil-' + idx + '" style="opacity:0;transition:opacity .15s;color:var(--faint);display:flex;align-items:center">' + pencilSvg + '</span>'
    +       '</div>'
    +     '</div>'
    +     '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:4px">'
    +       '<span style="font-size:12px;color:var(--faint)">Created ' + plan.date + '</span>'
      + '<span id="mp-flight-pill-' + idx + '" onclick="csTx2EditFlightDates(' + idx + ',this)" style="display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:500;color:var(--text);background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:2px 8px;cursor:pointer;transition:border-color .12s" onmouseenter="this.style.borderColor=\'var(--accent)\'" onmouseleave="this.style.borderColor=\'var(--border)\'">'
      +   '<svg width="10" height="10" viewBox="0 0 12 12" fill="none" style="flex-shrink:0;color:var(--muted)"><rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M1 5h10M4 1v2M8 1v2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>'
      +   '<span id="mp-flight-label-' + idx + '">' + (plan.flightStart && plan.flightEnd ? plan.flightStart + ' → ' + plan.flightEnd : 'Set flight dates') + '</span>'
      + '</span>'
    +     '</div>'
    +   '</div>'
    +   '<div style="display:flex;align-items:center;gap:20px;flex:0 0 auto">'
    +     '<div style="text-align:right">'
    +       '<div style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);margin-bottom:2px">Episodes</div>'
    +       '<div style="font-size:20px;font-weight:700;color:var(--text)">' + allItems.length + '</div>'
    +     '</div>'
    +     (totalImpNum > 0
          ? '<div style="text-align:right">'
          +   '<div style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);margin-bottom:2px">Est. Impressions</div>'
          +   '<div style="font-size:20px;font-weight:700;color:var(--text)">' + fmtTotImp + '</div>'
          + '</div>'
          : '')
    +     (totalDollarsNum > 0
          ? '<div style="text-align:right">'
          +   '<div style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);margin-bottom:2px">Est. Dollars</div>'
          +   '<div style="font-size:20px;font-weight:700;color:var(--accent)">' + invFmtDollars(totalDollarsNum) + '</div>'
          + '</div>'
          : '')
    +     '<button onclick="csTx2DeleteMediaPlan(' + idx + ')" title="Delete plan" style="width:30px;height:30px;display:flex;align-items:center;justify-content:center;border:1px solid #fecaca;border-radius:7px;background:#fff5f5;color:#ef4444;cursor:pointer;padding:0">'
    +       '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.8 7.5A1 1 0 004.8 12.5h4.4a1 1 0 001-.9L11 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +     '</button>'
    +   '</div>'
    + '</div>'

    // Episodes table — scrollable
    + '<div style="overflow-y:auto;max-height:calc(100vh - 440px);border:1px solid var(--border);border-radius:10px">'
    +   '<table style="width:100%;border-collapse:collapse"><thead><tr style="background:var(--bg);position:sticky;top:0;z-index:1">'
    +     '<th style="text-align:left;' + TH + '">Episode</th>'
    +     '<th style="text-align:left;' + TH + '">Channel</th>'
    +     '<th style="text-align:left;' + TH + '">Scene</th>'
    +     '<th style="text-align:right;' + TH + '">Est. Impressions</th>'
    +     '<th style="text-align:right;' + TH + '">Est. Dollars</th>'
    +     '<th style="' + TH + ';width:40px"></th>'
    +   '</tr></thead>'
    +   '<tbody>' + tableRowsHtml
    +     '<tr>'
    +       '<td style="' + TOT + '">Total</td>'
    +       '<td style="' + TOT + '"></td>'
    +       '<td style="' + TOT + '"></td>'
    +       '<td style="' + TOT + ';text-align:right">' + fmtTotImp + '</td>'
    +       '<td style="' + TOT + ';text-align:right">' + (totalDollarsNum > 0 ? invFmtDollars(totalDollarsNum) : '—') + '</td>'
    +       '<td style="' + TOT + '"></td>'
    +     '</tr>'
    +   '</tbody>'
    +   '</table>'
    + '</div>'

    // Action buttons
    + '<div style="margin-top:14px;display:flex;flex-direction:column;gap:8px">'
    +   '<button onclick="csTx2AddMoreToInventory(' + idx + ')" style="width:100%;height:40px;display:flex;align-items:center;justify-content:center;gap:7px;border-radius:9px;border:1px solid var(--border-md);background:var(--surface);color:var(--text);font-size:13px;font-weight:500;cursor:pointer;font-family:inherit" onmouseenter="this.style.background=\'var(--bg)\'" onmouseleave="this.style.background=\'var(--surface)\'">'
    +     '<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    +     'Add more from Inventory'
    +   '</button>'
    +   '<div style="display:flex;gap:8px">'
    +     '<button id="inv-export-btn-' + idx + '" onclick="csTx2ExportInsertionOrder(' + idx + ',this)" style="flex:1;height:40px;display:flex;align-items:center;justify-content:center;gap:7px;border-radius:9px;border:none;background:var(--accent);color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">'
    +       '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3M2 10v1.5A1.5 1.5 0 003.5 13h7a1.5 1.5 0 001.5-1.5V10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +       'Export to IO'
    +     '</button>'
    +     '<button onclick="csTx2ActivateDSP(' + idx + ')" style="flex:1;height:40px;display:flex;align-items:center;justify-content:center;gap:7px;border-radius:9px;border:none;background:#0f172a;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit" onmouseenter="this.style.background=\'#1e293b\'" onmouseleave="this.style.background=\'#0f172a\'">'
    +       '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="5" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4"/><rect x="9" y="2" width="5" height="12" rx="1.5" stroke="currentColor" stroke-width="1.4"/><circle cx="4.5" cy="11.5" r="1" fill="currentColor"/><circle cx="11.5" cy="11.5" r="1" fill="currentColor"/></svg>'
    +       'Activate via DSP'
    +     '</button>'
    +   '</div>'
    + '</div>';
}

function csTx2ActivateDSP(idx) {
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1100;display:flex;align-items:center;justify-content:center';
  var dsps = [
    { name: 'DV360',          logo: 'G', color: '#4285F4' },
    { name: 'The Trade Desk', logo: 'T', color: '#00C851' },
    { name: 'Xandr',          logo: 'X', color: '#FF6B35' }
  ];
  overlay.innerHTML =
    '<div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:28px;width:360px;box-shadow:0 8px 32px rgba(0,0,0,.18);font-family:inherit">'
    + '<div style="font-size:15px;font-weight:600;color:var(--text);margin-bottom:4px">Activate via DSP</div>'
    + '<div style="font-size:12px;color:var(--muted);margin-bottom:20px">Select the DSP to push this media plan to</div>'
    + '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">'
    + dsps.map(function(d) {
        return '<button onclick="csTx2DSPPush(\'' + d.name + '\',this.closest(\'.dsp-overlay\'))" style="display:flex;align-items:center;gap:12px;height:48px;padding:0 14px;border-radius:10px;border:1px solid var(--border);background:var(--surface);cursor:pointer;font-family:inherit;text-align:left;transition:border-color .12s" onmouseenter="this.style.borderColor=\'' + d.color + '\'" onmouseleave="this.style.borderColor=\'var(--border)\'">'
          + '<div style="width:32px;height:32px;border-radius:8px;background:' + d.color + ';display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0">' + d.logo + '</div>'
          + '<div>'
          +   '<div style="font-size:13px;font-weight:500;color:var(--text)">' + d.name + '</div>'
          +   '<div style="font-size:11px;color:var(--muted)">Connect & push line items</div>'
          + '</div>'
          + '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="margin-left:auto;flex-shrink:0;color:var(--faint)"><path d="M5 3l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          + '</button>';
      }).join('')
    + '</div>'
    + '<button onclick="this.closest(\'div[style*=fixed]\').remove()" style="width:100%;height:36px;border-radius:8px;border:1px solid var(--border-md);background:none;color:var(--muted);font-size:13px;font-weight:500;cursor:pointer;font-family:inherit">Cancel</button>'
    + '</div>';
  overlay.classList.add('dsp-overlay');
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

var DSP_PARAMS = {
  'DV360': [
    { id: 'dv-advertiser', label: 'Advertiser ID',       placeholder: 'e.g. 123456789',     required: true },
    { id: 'dv-campaign',   label: 'Campaign ID',         placeholder: 'e.g. 987654321',     required: true },
    { id: 'dv-io-name',    label: 'Insertion Order Name',placeholder: 'e.g. Nike_Q3_CTV',   required: true },
    { id: 'dv-start',      label: 'Flight Start',        placeholder: '',  type: 'date',    required: true },
    { id: 'dv-end',        label: 'Flight End',          placeholder: '',  type: 'date',    required: true },
    { id: 'dv-budget',     label: 'Budget (USD)',        placeholder: 'e.g. 50000',         required: false }
  ],
  'The Trade Desk': [
    { id: 'ttd-advertiser',label: 'Advertiser ID',       placeholder: 'e.g. ttd_adv_001',   required: true },
    { id: 'ttd-campaign',  label: 'Campaign ID',         placeholder: 'e.g. ttd_camp_001',  required: true },
    { id: 'ttd-adgroup',   label: 'Ad Group Name',       placeholder: 'e.g. CTV_Moments_Q3',required: true },
    { id: 'ttd-start',     label: 'Flight Start',        placeholder: '',  type: 'date',    required: true },
    { id: 'ttd-end',       label: 'Flight End',          placeholder: '',  type: 'date',    required: true },
    { id: 'ttd-cpm',       label: 'Target CPM (USD)',    placeholder: 'e.g. 18',            required: false }
  ],
  'Xandr': [
    { id: 'xndr-member',   label: 'Member ID',           placeholder: 'e.g. 1234',          required: true },
    { id: 'xndr-advertiser',label:'Advertiser ID',       placeholder: 'e.g. 5678',          required: true },
    { id: 'xndr-order',    label: 'Order Name',          placeholder: 'e.g. Nike_CTV_2026', required: true },
    { id: 'xndr-start',    label: 'Flight Start',        placeholder: '',  type: 'date',    required: true },
    { id: 'xndr-end',      label: 'Flight End',          placeholder: '',  type: 'date',    required: true },
    { id: 'xndr-freq',     label: 'Frequency Cap',       placeholder: 'e.g. 3 per day',     required: false }
  ]
};

var DSP_COLORS = { 'DV360': '#4285F4', 'The Trade Desk': '#00C851', 'Xandr': '#FF6B35' };
var DSP_LOGOS  = { 'DV360': 'G',       'The Trade Desk': 'T',       'Xandr': 'X' };

function csTx2DSPPush(dspName, prevOverlay) {
  if (prevOverlay) prevOverlay.remove();

  var color  = DSP_COLORS[dspName];
  var logo   = DSP_LOGOS[dspName];
  var fields = DSP_PARAMS[dspName] || [];
  var INP    = 'width:100%;box-sizing:border-box;height:34px;padding:0 10px;border:1px solid var(--border);border-radius:7px;background:var(--surface);color:var(--text);font-size:12px;font-family:inherit;outline:none;';

  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1100;display:flex;align-items:center;justify-content:center';

  overlay.innerHTML =
    '<div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:28px;width:420px;box-shadow:0 8px 32px rgba(0,0,0,.18);font-family:inherit;max-height:90vh;overflow-y:auto">'

    // Header
    + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">'
    +   '<div style="width:36px;height:36px;border-radius:9px;background:' + color + ';display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;flex-shrink:0">' + logo + '</div>'
    +   '<div>'
    +     '<div style="font-size:14px;font-weight:600;color:var(--text)">' + dspName + '</div>'
    +     '<div style="font-size:11px;color:var(--muted)">Enter campaign parameters to push the plan</div>'
    +   '</div>'
    + '</div>'

    // Fields
    + '<div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px">'
    + fields.map(function(f) {
        var inputHtml = f.type === 'date'
          ? '<input id="dsp-field-' + f.id + '" type="date" style="' + INP + '">'
          : '<input id="dsp-field-' + f.id + '" type="text" placeholder="' + f.placeholder + '" style="' + INP + '">';
        return '<div>'
          + '<label style="display:block;font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px">'
          +   f.label + (f.required ? ' <span style="color:var(--accent)">*</span>' : ' <span style="color:var(--faint);font-weight:400;text-transform:none;letter-spacing:0">(optional)</span>')
          + '</label>'
          + inputHtml
          + '</div>';
      }).join('')
    + '</div>'

    // Actions
    + '<div style="display:flex;gap:8px">'
    +   '<button onclick="this.closest(\'div[style*=fixed]\').remove()" style="flex:1;height:38px;border-radius:8px;border:1px solid var(--border-md);background:none;color:var(--muted);font-size:13px;font-weight:500;cursor:pointer;font-family:inherit">Cancel</button>'
    +   '<button onclick="csTx2DSPSubmit(\'' + dspName + '\',this)" style="flex:2;height:38px;border-radius:8px;border:none;background:' + color + ';color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:7px">'
    +     '<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +     'Push to ' + dspName
    +   '</button>'
    + '</div>'
    + '</div>';

  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

function csTx2DSPSubmit(dspName, btn) {
  // Validate required fields
  var fields = DSP_PARAMS[dspName] || [];
  var missing = fields.filter(function(f) {
    if (!f.required) return false;
    var el = document.getElementById('dsp-field-' + f.id);
    return !el || !el.value.trim();
  });
  if (missing.length > 0) {
    missing.forEach(function(f) {
      var el = document.getElementById('dsp-field-' + f.id);
      if (el) { el.style.borderColor = 'var(--accent)'; el.focus(); }
    });
    return;
  }

  // Loading state
  var origHTML = btn.innerHTML;
  btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" style="animation:spin 1s linear infinite"><path d="M8 2a6 6 0 100 12A6 6 0 008 2z" stroke="currentColor" stroke-width="1.5" stroke-dasharray="20" stroke-dashoffset="10"/></svg> Pushing…';
  btn.disabled = true;

  setTimeout(function() {
    var overlay = btn.closest('div[style*="fixed"]');
    if (overlay) overlay.remove();

    // Success toast
    var refId = dspName.substring(0, 3).toUpperCase() + '-' + Math.floor(10000 + Math.random() * 90000);
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:1200;background:#0f172a;color:#fff;border-radius:10px;padding:14px 18px;font-size:13px;font-family:inherit;display:flex;align-items:center;gap:10px;box-shadow:0 4px 20px rgba(0,0,0,.25);animation:cs-badge-pop .25s ease;max-width:320px';
    toast.innerHTML =
      '<svg width="18" height="18" viewBox="0 0 16 16" fill="none" style="flex-shrink:0"><circle cx="8" cy="8" r="7" stroke="#2EAD4B" stroke-width="1.5"/><path d="M5 8.5l2 2 4-4" stroke="#2EAD4B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      + '<div>'
      +   '<div style="font-weight:600;margin-bottom:2px">Pushed to ' + dspName + '</div>'
      +   '<div style="font-size:11px;color:rgba(255,255,255,.6)">Reference ID: ' + refId + '</div>'
      + '</div>';
    document.body.appendChild(toast);
    setTimeout(function() {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity .3s';
      setTimeout(function() { toast.remove(); }, 300);
    }, 4000);
  }, 1600);
}

function csTx2ExportInsertionOrder(idx, btn) {
  var plan = savedMediaPlans[idx];
  if (!plan) return;
  if (!btn) return;
  var origHTML = btn.innerHTML;
  btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Exported!';
  btn.style.color = '#16a34a';
  btn.style.borderColor = '#bbf7d0';
  btn.style.background = '#f0fdf4';
  setTimeout(function() {
    if (btn) {
      btn.innerHTML = origHTML;
      btn.style.color = '';
      btn.style.borderColor = '';
      btn.style.background = '';
    }
  }, 1800);
}

function csTx2EditMediaPlan(idx) {
  csTx2ShowMediaPlanDetail(idx);
}

function csTx2StartEditPlanName(idx) {
  var wrap = document.getElementById('mp-title-wrap-' + idx);
  if (!wrap) return;
  var plan = savedMediaPlans[idx];
  if (!plan) return;
  wrap.innerHTML =
    '<div style="display:flex;align-items:center;gap:6px">'
    + '<input id="mp-title-input-' + idx + '" type="text" value="' + plan.name.replace(/"/g, '&quot;') + '"'
    + ' style="font-size:18px;font-weight:600;color:var(--text);letter-spacing:-.3px;border:none;border-bottom:2px solid var(--accent);background:transparent;outline:none;padding:0;font-family:inherit;min-width:0;width:260px"'
    + ' onkeydown="if(event.key===\'Enter\')csTx2SavePlanName(' + idx + ');if(event.key===\'Escape\')csTx2ShowMediaPlanDetail(' + idx + ')">'
    + '<button onclick="csTx2SavePlanName(' + idx + ')" style="height:26px;padding:0 10px;border-radius:6px;border:none;background:var(--accent);color:#fff;font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;flex-shrink:0">Save</button>'
    + '</div>';
  var input = document.getElementById('mp-title-input-' + idx);
  if (input) { input.focus(); input.select(); }
}

function csTx2SavePlanName(idx) {
  var input = document.getElementById('mp-title-input-' + idx);
  if (!input) return;
  var newName = input.value.trim();
  if (newName && savedMediaPlans[idx]) savedMediaPlans[idx].name = newName;
  csTx2ShowMediaPlanDetail(idx);
}

function csTx2EditFlightDates(idx, pill) {
  // Remove any existing picker
  var existing = document.getElementById('mp-flight-picker');
  if (existing) { existing.remove(); return; }

  var plan = savedMediaPlans[idx];
  var INP  = 'height:32px;padding:0 8px;border:1px solid var(--border);border-radius:7px;background:var(--surface);color:var(--text);font-size:12px;font-family:inherit;outline:none;box-sizing:border-box;width:100%';

  // Parse existing dates to yyyy-mm-dd for the input
  function toInputDate(label) {
    if (!label) return '';
    var months = { Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12' };
    var parts = label.trim().split(' ');
    if (parts.length === 3) return parts[2] + '-' + (months[parts[1]] || '01') + '-' + parts[0].padStart(2,'0');
    return '';
  }
  function fromInputDate(val) {
    if (!val) return '';
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var d = new Date(val + 'T00:00:00');
    if (isNaN(d)) return val;
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }

  var picker = document.createElement('div');
  picker.id = 'mp-flight-picker';

  var rect = pill.getBoundingClientRect();
  picker.style.cssText = 'position:fixed;z-index:500;background:var(--surface);border:1px solid var(--border-md);border-radius:10px;padding:14px;box-shadow:0 4px 20px rgba(0,0,0,.12);width:240px;font-family:inherit';
  picker.style.top  = (rect.bottom + 6) + 'px';
  picker.style.left = rect.left + 'px';

  picker.innerHTML =
    '<div style="font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:10px">Flight Dates</div>'
    + '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px">'
    +   '<div>'
    +     '<label style="display:block;font-size:11px;color:var(--muted);margin-bottom:3px">Start</label>'
    +     '<input id="mp-flight-start-' + idx + '" type="date" value="' + toInputDate(plan.flightStart) + '" style="' + INP + '">'
    +   '</div>'
    +   '<div>'
    +     '<label style="display:block;font-size:11px;color:var(--muted);margin-bottom:3px">End</label>'
    +     '<input id="mp-flight-end-' + idx + '" type="date" value="' + toInputDate(plan.flightEnd) + '" style="' + INP + '">'
    +   '</div>'
    + '</div>'
    + '<div style="display:flex;gap:6px">'
    +   '<button onclick="document.getElementById(\'mp-flight-picker\').remove()" style="flex:1;height:30px;border-radius:6px;border:1px solid var(--border-md);background:none;color:var(--muted);font-size:12px;cursor:pointer;font-family:inherit">Cancel</button>'
    +   '<button onclick="csTx2SaveFlightDates(' + idx + ')" style="flex:1;height:30px;border-radius:6px;border:none;background:var(--accent);color:#fff;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">Save</button>'
    + '</div>';

  document.body.appendChild(picker);

  // Close on outside click
  setTimeout(function() {
    document.addEventListener('click', function h(e) {
      if (!picker.contains(e.target) && e.target !== pill) {
        picker.remove();
        document.removeEventListener('click', h);
      }
    });
  }, 0);
}

function csTx2SaveFlightDates(idx) {
  var startEl = document.getElementById('mp-flight-start-' + idx);
  var endEl   = document.getElementById('mp-flight-end-'   + idx);
  if (!startEl || !endEl) return;

  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function fmt(val) {
    if (!val) return '';
    var d = new Date(val + 'T00:00:00');
    if (isNaN(d)) return '';
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }

  var start = fmt(startEl.value);
  var end   = fmt(endEl.value);
  if (savedMediaPlans[idx]) {
    savedMediaPlans[idx].flightStart = start;
    savedMediaPlans[idx].flightEnd   = end;
  }

  var picker = document.getElementById('mp-flight-picker');
  if (picker) picker.remove();

  // Update label in place without full re-render
  var label = document.getElementById('mp-flight-label-' + idx);
  if (label) label.textContent = start && end ? start + ' → ' + end : 'Set flight dates';
}

function csTx2DeletePlanItem(planIdx, type, itemIdx) {
  var plan = savedMediaPlans[planIdx];
  if (!plan) return;
  if (type === 'program') {
    plan.programs = plan.programs || [];
    plan.programs.splice(itemIdx, 1);
  } else {
    plan.episodes = plan.episodes || [];
    plan.episodes.splice(itemIdx, 1);
  }
  csTx2ShowMediaPlanDetail(planIdx);
}

function csTx2AddMoreToInventory(planIdx) {
  var plan = savedMediaPlans[planIdx];
  if (!plan) return;
  // Build the results page structure first (this resets invSelected internally)
  mp1ShowResults();
  // Now populate the cart after the reset
  invSelected = {};
  (plan.programs || []).forEach(function(p) {
    if (p.id) invSelected[p.id] = true;
  });
  invMediaPlanVisible = true;
  // Switch to inventory tab — invRenderInventory + invRenderMediaPlan will pick up our state
  csTx2SubTab('inventory');
}

function csTx2DeleteMediaPlan(idx) {
  var plan = savedMediaPlans[idx];
  if (!plan) return;
  if (!confirm('Delete "' + plan.name + '"? This cannot be undone.')) return;
  savedMediaPlans.splice(idx, 1);
  mp1ShowUpload();
}

// csTx2LibLoad kept as alias for any legacy callers
function csTx2LibLoad(idx) { mp1LibLoad(idx); }

function csTx2SwitchHomeTab(tab) {
  csTx2HomeTab = tab;
  var analyses = document.getElementById('tx2-home-panel-analyses');
  var plans    = document.getElementById('tx2-home-panel-plans');
  document.querySelectorAll('.tx2-home-tab').forEach(function(el) {
    el.classList.toggle('tx2-home-tab--act', el.getAttribute('onclick').indexOf("'" + tab + "'") >= 0);
  });
  if (analyses) analyses.style.display = tab === 'analyses' ? 'flex' : 'none';
  if (plans)    plans.style.display    = tab === 'plans'    ? ''     : 'none';
}
// ── Inventory Explorer v2: matched programs data + helpers ────────────────────

var INV_PROGRAMS = [
  { id:1, title:'Parks and Recreation — Ep. 4x12',   channel:'NBC', category:'Comedy',          daypart:'Prime Time',  match:96, scenes:['Scene 3 (00:14 – 1:02)','Scene 7 (04:38 – 5:10)'],  impressionsLabel:'3.2M', impressionsNum:3.2,
    moments:[{label:'Community Spirit',score:94},{label:'Joy & Laughter',score:88},{label:'Outdoor Life',score:82},{label:'Friendship',score:78},{label:'Celebration',score:74},{label:'Teamwork',score:71},{label:'Humor',score:68},{label:'Nostalgia',score:63},{label:'Public Service',score:59},{label:'Local Pride',score:54}] },
  { id:2, title:'MasterChef US — Ep. 6x08',          channel:'Fox', category:'Reality',          daypart:'Prime Time',  match:91, scenes:['Scene 5 (02:20 – 3:45)'],                            impressionsLabel:'4.8M', impressionsNum:4.8,
    moments:[{label:'Food & Cooking',score:97},{label:'Competition',score:91},{label:'Achievement',score:85},{label:'Tension',score:82},{label:'Skill & Craft',score:79},{label:'Ambition',score:74},{label:'Passion',score:70},{label:'Precision',score:66},{label:'Leadership',score:61}] },
  { id:3, title:'The Good Place — Ep. 2x06',         channel:'NBC', category:'Comedy',          daypart:'Early Fringe', match:88, scenes:['Scene 2 (00:30 – 1:18)','Scene 9 (18:44 – 19:20)'], impressionsLabel:'2.9M', impressionsNum:2.9,
    moments:[{label:'Warmth',score:90},{label:'Comedy',score:87},{label:'Friendship',score:84},{label:'Philosophy',score:77},{label:'Redemption',score:72},{label:'Surprise',score:68},{label:'Ethics',score:63},{label:'Growth',score:58}] },
  { id:4, title:"America's Got Talent — S17 Finale", channel:'NBC', category:'Reality',          daypart:'Prime Time',  match:84, scenes:['Scene 11 (38:05 – 39:30)'],                         impressionsLabel:'7.1M', impressionsNum:7.1,
    moments:[{label:'Inspiration',score:92},{label:'Emotion',score:89},{label:'Entertainment',score:85},{label:'Achievement',score:81},{label:'Surprise',score:77},{label:'Family',score:74},{label:'Drama',score:70},{label:'Hope',score:66},{label:'Talent',score:62},{label:'Celebration',score:58}] },
  { id:5, title:'Modern Family — Ep. 5x09',          channel:'ABC', category:'Comedy',          daypart:'Daytime',     match:81, scenes:['Scene 4 (07:12 – 8:00)'],                            impressionsLabel:'5.3M', impressionsNum:5.3,
    moments:[{label:'Family',score:94},{label:'Comedy',score:88},{label:'Everyday Life',score:83},{label:'Warmth',score:78},{label:'Parenting',score:74},{label:'Humor',score:70},{label:'Relationships',score:65},{label:'Home Life',score:60}] },
  { id:6, title:'The Tonight Show — Ep. 312',        channel:'NBC', category:'Entertainment',   daypart:'Late Night',  match:77, scenes:['Scene 1 (00:00 – 1:30)'],                            impressionsLabel:'3.6M', impressionsNum:3.6,
    moments:[{label:'Comedy',score:88},{label:'Live Entertainment',score:83},{label:'Pop Culture',score:78},{label:'Celebrity',score:73},{label:'Music',score:68},{label:'Humor',score:63},{label:'Late Night',score:58}] },
  { id:7, title:'Ellen DeGeneres Show — Ep. 1847',   channel:'CBS', category:'Entertainment',   daypart:'Daytime',     match:74, scenes:['Scene 6 (14:22 – 15:05)'],                           impressionsLabel:'2.8M', impressionsNum:2.8,
    moments:[{label:'Joy',score:90},{label:'Community',score:84},{label:'Lifestyle',score:79},{label:'Positivity',score:75},{label:'Surprise',score:70},{label:'Generosity',score:65},{label:'Fun',score:60}] },
  { id:8, title:'Good Morning America — 08 May',     channel:'ABC', category:'News & Morning',  daypart:'Morning',     match:71, scenes:['Scene 2 (09:15 – 10:00)'],                           impressionsLabel:'4.1M', impressionsNum:4.1,
    moments:[{label:'Morning Routine',score:82},{label:'Lifestyle',score:77},{label:'Positivity',score:73},{label:'News',score:68},{label:'Family',score:64},{label:'Health',score:59},{label:'Community',score:55}] }
];

var savedMediaPlans     = [
  {
    name:       'Nike Air Max — Prime Time Push',
    date:       '9 May 2026',
    author:     'Bruna',
    inputType:  'video',
    flightStart: '2 Jun 2026',
    flightEnd:   '29 Jun 2026',
    dsp:        { name: 'DV360', status: 'active', pushedAt: '10 May 2026', refId: 'DV3-48821' },
    programs: [
      { title:'Parks and Recreation', channel:'NBC',      impressionsLabel:'3.2M', id:1, seed:'tvshow1', impressionsNum:3.2, daypart:'Prime Time' },
      { title:'The Good Place',       channel:'NBC',      impressionsLabel:'2.8M', id:2, seed:'tvshow2', impressionsNum:2.8, daypart:'Prime Time' },
      { title:'Brooklyn Nine-Nine',   channel:'Fox',      impressionsLabel:'2.1M', id:4, seed:'tvshow4', impressionsNum:2.1, daypart:'Prime Time' },
      { title:'Abbott Elementary',    channel:'ABC',      impressionsLabel:'1.9M', id:5, seed:'tvshow5', impressionsNum:1.9, daypart:'Prime Time' }
    ],
    episodes: [
      { show:'Red Bull Racing: Pit Stop Masters',  episode:'S3E07', channel:'Sports+',  scene:'Scene 4 (02:14 – 03:08)',  imgSeed:'RedBullRacing:PitStopMasters0',  impressionsNum:1.5 },
      { show:'Trail Runners World Championship',   episode:'S1E04', channel:'Discovery',scene:'Scene 11 (18:42 – 19:25)', imgSeed:'TrailRunnersWorldChampionship1', impressionsNum:0.8 }
    ],
    totalItems:  6,
    impressions: '14.3M',
    dollars:     '$341K'
  },
  {
    name:       'Spring Campaign — Comedy Block',
    date:       '1 May 2026',
    author:     'Bruna',
    inputType:  'document',
    flightStart: '12 May 2026',
    flightEnd:   '8 Jun 2026',
    dsp:        { name: 'The Trade Desk', status: 'pending', pushedAt: '2 May 2026', refId: 'TTD-73041' },
    programs: [
      { title:'Ted',                  channel:'Peacock',  impressionsLabel:'2.5M', id:3, seed:'tvshow3', impressionsNum:2.5, daypart:'Prime Time' },
      { title:'Brooklyn Nine-Nine',   channel:'Fox',      impressionsLabel:'2.1M', id:4, seed:'tvshow4', impressionsNum:2.1, daypart:'Daytime' }
    ],
    episodes: [
      { show:'Below Deck',            episode:'S10E12',   channel:'Bravo',    scene:'Scene 2 (05:30 – 06:15)', imgSeed:'BelowDeck0',  impressionsNum:1.1 },
      { show:'Wolf Like Me',          episode:'S2E03',    channel:'Peacock',  scene:'Scene 7 (11:20 – 12:00)', imgSeed:'WolfLikeMe1', impressionsNum:0.9 }
    ],
    totalItems:  4,
    impressions: '6.6M',
    dollars:     '$142K'
  },
  {
    name:       'Heineken — Late Night Sports',
    date:       '24 Apr 2026',
    author:     'Marika',
    inputType:  'text',
    flightStart: '5 May 2026',
    flightEnd:   '18 May 2026',
    dsp:        { name: 'Xandr', status: 'error', pushedAt: '25 Apr 2026', refId: 'XND-29104' },
    programs: [
      { title:'Yellowstone',          channel:'Paramount',impressionsLabel:'4.1M', id:6, seed:'tvshow6', impressionsNum:4.1, daypart:'Late Night' },
      { title:'A.P. Bio',             channel:'NBC',      impressionsLabel:'1.4M', id:7, seed:'tvshow7', impressionsNum:1.4, daypart:'Late Night' }
    ],
    episodes: [
      { show:'Trail Runners World Championship', episode:'S1E09', channel:'Discovery', scene:'Scene 3 (08:10 – 09:00)', imgSeed:'TrailRunners2', impressionsNum:1.2 }
    ],
    totalItems:  3,
    impressions: '6.7M',
    dollars:     '$153K'
  },
  {
    name:       'Spotify — Daytime Discovery',
    date:       '18 Apr 2026',
    author:     'Bruna',
    inputType:  'video',
    flightStart: '26 Apr 2026',
    flightEnd:   '31 May 2026',
    dsp:        null,
    programs: [
      { title:'Parks and Recreation', channel:'NBC',      impressionsLabel:'3.2M', id:1, seed:'tvshow1', impressionsNum:3.2, daypart:'Daytime' },
      { title:'Wolf Like Me',         channel:'Peacock',  impressionsLabel:'2.0M', id:8, seed:'tvshow8', impressionsNum:2.0, daypart:'Daytime' },
      { title:'Below Deck',           channel:'Bravo',    impressionsLabel:'1.7M', id:9, seed:'tvshow9', impressionsNum:1.7, daypart:'Daytime' }
    ],
    episodes: [],
    totalItems:  3,
    impressions: '6.9M',
    dollars:     '$104K'
  }
];
var csTx2HomeTab        = 'analyses';

// ── AI Media Plan params state ────────────────────────────────────────────────
var aiParams = {
  budget:      { noBudget: false, min: 0, max: 1000000, exact: '' },
  impressions: { noEstimate: false, min: 0, max: 10000000, exact: '' },
  daypart:     { mode: 'any', values: [] },
  channels:    { mode: 'any', values: [] },
  programs:    { mode: 'any', exact: '', min: '', max: '' },
  brand:       { mode: 'any', values: [] },
  score:       { min: 0, max: 100 },
  dates:       { start: '', end: '', viewMonth: new Date().getMonth(), viewYear: new Date().getFullYear() }
};

var invCurrentView      = 'gallery';
var invSelected         = {};
var invSelectedEpisodes = {};   // keyed by epId, value: { show, episode, channel, scene, imgSeed }
var invFilterChannels   = [];
var invFilterCategories = [];
var invFilterDayparts   = [];
var invFilterScore      = 0;
var invFilterPanelOpen  = false;
var invMediaPlanVisible = false;
var invAccordionOpen    = { channel: false, category: false, daypart: false, score: true };

function invGetFiltered() {
  return INV_PROGRAMS.filter(function(p) {
    if (invFilterChannels.length   > 0 && invFilterChannels.indexOf(p.channel)   < 0) return false;
    if (invFilterCategories.length > 0 && invFilterCategories.indexOf(p.category) < 0) return false;
    if (invFilterDayparts.length   > 0 && invFilterDayparts.indexOf(p.daypart)    < 0) return false;
    if (p.match < invFilterScore) return false;
    return true;
  });
}

// ── Filter panel ──

function invToggleFilterPanel() {
  if (invFilterPanelOpen) { invCloseFilterPanel(); } else { invOpenFilterPanel(); }
}

function invOpenFilterPanel() {
  invFilterPanelOpen = true;
  var panel = document.getElementById('inv-filter-panel');
  if (!panel) return;
  invBuildFilterPanel();
  panel.style.display = 'flex';
  var btn = document.getElementById('inv-filter-btn');
  setTimeout(function() {
    document.addEventListener('click', function _outside(e) {
      if (panel && !panel.contains(e.target) && btn && !btn.contains(e.target)) {
        invCloseFilterPanel();
        document.removeEventListener('click', _outside);
      }
    });
  }, 0);
}

function invCloseFilterPanel() {
  invFilterPanelOpen = false;
  var panel = document.getElementById('inv-filter-panel');
  if (panel) panel.style.display = 'none';
}

function invBuildFilterPanel() {
  var panel = document.getElementById('inv-filter-panel');
  if (!panel) return;
  var channels   = INV_PROGRAMS.map(function(p){ return p.channel; }).filter(function(v,i,a){ return a.indexOf(v)===i; });
  var categories = INV_PROGRAMS.map(function(p){ return p.category; }).filter(function(v,i,a){ return a.indexOf(v)===i; });
  var dayparts   = INV_PROGRAMS.map(function(p){ return p.daypart; }).filter(function(v,i,a){ return a.indexOf(v)===i; });
  var totalActive = invFilterChannels.length + invFilterCategories.length + invFilterDayparts.length + (invFilterScore > 0 ? 1 : 0);

  function accSection(key, label, bodyHtml) {
    var open = !!invAccordionOpen[key];
    return '<div class="inv-fp-acc">'
      + '<div class="inv-fp-acc-hdr" onclick="invToggleAccordion(\'' + key + '\')">'
      +   '<span>' + label + '</span>'
      +   '<svg class="inv-fp-chevron' + (open ? ' open' : '') + '" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      + '</div>'
      + '<div id="inv-fp-body-' + key + '" style="' + (open ? '' : 'display:none') + '">'
      +   bodyHtml
      + '</div>'
      + '</div>';
  }

  var channelBody =
    '<input class="inv-fp-search" placeholder="Search…" oninput="invFpSearch(this,\'channel\')">'
    + '<div id="inv-fp-opts-channel">'
    + channels.map(function(c) {
        return '<label class="inv-fp-opt"><input type="checkbox"' + (invFilterChannels.indexOf(c)>=0?' checked':'') + ' onchange="invToggleFilterCheckbox(\'channel\',\'' + c + '\',this.checked)"><span>' + c + '</span></label>';
      }).join('')
    + '</div>';

  var categoryBody =
    '<input class="inv-fp-search" placeholder="Search…" oninput="invFpSearch(this,\'category\')">'
    + '<div id="inv-fp-opts-category">'
    + categories.map(function(c) {
        return '<label class="inv-fp-opt"><input type="checkbox"' + (invFilterCategories.indexOf(c)>=0?' checked':'') + ' onchange="invToggleFilterCheckbox(\'category\',\'' + c + '\',this.checked)"><span>' + c + '</span></label>';
      }).join('')
    + '</div>';

  var daypartBody =
    '<div id="inv-fp-opts-daypart">'
    + dayparts.map(function(d) {
        return '<label class="inv-fp-opt"><input type="checkbox"' + (invFilterDayparts.indexOf(d)>=0?' checked':'') + ' onchange="invToggleFilterCheckbox(\'daypart\',\'' + d + '\',this.checked)"><span>' + d + '</span></label>';
      }).join('')
    + '</div>';

  var scoreBody =
    '<div style="padding:4px 0 10px">'
    + '<div style="display:flex;justify-content:space-between;margin-bottom:10px">'
    +   '<span style="font-size:11px;color:var(--muted)">Minimum match score</span>'
    +   '<span id="inv-fp-score-val" style="font-size:11px;font-weight:600;color:var(--text)">' + (invFilterScore > 0 ? invFilterScore + '%' : '—') + '</span>'
    + '</div>'
    + '<input type="range" min="0" max="100" value="' + invFilterScore + '" style="width:100%;accent-color:var(--accent)" oninput="document.getElementById(\'inv-fp-score-val\').textContent=this.value>0?this.value+\'%\':\'—\'" onchange="invToggleFilterCheckbox(\'score\',this.value,true)">'
    + '<div style="display:flex;justify-content:space-between;margin-top:4px"><span style="font-size:10px;color:var(--faint)">0%</span><span style="font-size:10px;color:var(--faint)">100%</span></div>'
    + '</div>';

  panel.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-shrink:0">'
    +   '<span style="font-size:13px;font-weight:600;color:var(--text)">Filters</span>'
    +   '<div style="display:flex;gap:10px;align-items:center">'
    +     (totalActive > 0 ? '<span style="font-size:11px;color:var(--faint);cursor:pointer" onclick="invClearAllFilters()">Clear all</span>' : '')
    +     '<button onclick="invCloseFilterPanel()" style="background:none;border:none;cursor:pointer;color:var(--faint);font-size:20px;line-height:1;padding:0 2px">×</button>'
    +   '</div>'
    + '</div>'
    + '<div style="flex:1;overflow-y:auto;min-height:0">'
    +   accSection('channel',  'Channel',  channelBody)
    +   accSection('category', 'Category', categoryBody)
    +   accSection('daypart',  'Daypart',  daypartBody)
    +   accSection('score',    'Min Score', scoreBody)
    + '</div>';
}

function invToggleAccordion(key) {
  invAccordionOpen[key] = !invAccordionOpen[key];
  var body = document.getElementById('inv-fp-body-' + key);
  if (body) {
    body.style.display = invAccordionOpen[key] ? '' : 'none';
    var hdr = body.previousElementSibling;
    if (hdr) {
      var chev = hdr.querySelector('.inv-fp-chevron');
      if (chev) chev.classList.toggle('open', invAccordionOpen[key]);
    }
  }
}

function invFpSearch(input, type) {
  var q = input.value.toLowerCase();
  var opts = document.querySelectorAll('#inv-fp-opts-' + type + ' .inv-fp-opt');
  opts.forEach(function(opt) {
    var txt = opt.querySelector('span').textContent.toLowerCase();
    opt.style.display = txt.indexOf(q) >= 0 ? '' : 'none';
  });
}

function invToggleFilterCheckbox(type, val, checked) {
  if (type === 'channel') {
    if (checked && invFilterChannels.indexOf(val) < 0) invFilterChannels.push(val);
    else if (!checked) invFilterChannels = invFilterChannels.filter(function(v){ return v !== val; });
  } else if (type === 'category') {
    if (checked && invFilterCategories.indexOf(val) < 0) invFilterCategories.push(val);
    else if (!checked) invFilterCategories = invFilterCategories.filter(function(v){ return v !== val; });
  } else if (type === 'daypart') {
    if (checked && invFilterDayparts.indexOf(val) < 0) invFilterDayparts.push(val);
    else if (!checked) invFilterDayparts = invFilterDayparts.filter(function(v){ return v !== val; });
  } else if (type === 'score') {
    invFilterScore = parseInt(val) || 0;
  }
  invUpdateFilterBar();
  invRenderInventory();
}

function invRemoveFilterChip(type, val) {
  if (type === 'channel')  invFilterChannels   = invFilterChannels.filter(function(v){ return v !== val; });
  if (type === 'category') invFilterCategories = invFilterCategories.filter(function(v){ return v !== val; });
  if (type === 'daypart')  invFilterDayparts   = invFilterDayparts.filter(function(v){ return v !== val; });
  if (type === 'score')    invFilterScore      = 0;
  invUpdateFilterBar();
  invRenderInventory();
  if (invFilterPanelOpen) invBuildFilterPanel();
}

function invClearAllFilters() {
  invFilterChannels = []; invFilterCategories = []; invFilterDayparts = []; invFilterScore = 0;
  invUpdateFilterBar();
  invRenderInventory();
  if (invFilterPanelOpen) invBuildFilterPanel();
}

function invUpdateFilterBar() {
  var totalActive = invFilterChannels.length + invFilterCategories.length + invFilterDayparts.length + (invFilterScore > 0 ? 1 : 0);
  var badge = document.getElementById('inv-filter-badge');
  if (badge) { badge.textContent = totalActive; badge.style.display = totalActive > 0 ? 'flex' : 'none'; }
  var chips = document.getElementById('inv-filter-chips');
  if (!chips) return;
  chips.innerHTML =
    invFilterChannels.map(function(v) {
      return '<span class="inv-chip">' + v + ' <span onclick="invRemoveFilterChip(\'channel\',\'' + v + '\')" style="cursor:pointer">×</span></span>';
    }).join('')
    + invFilterCategories.map(function(v) {
      return '<span class="inv-chip">' + v + ' <span onclick="invRemoveFilterChip(\'category\',\'' + v + '\')" style="cursor:pointer">×</span></span>';
    }).join('')
    + invFilterDayparts.map(function(v) {
      return '<span class="inv-chip">' + v + ' <span onclick="invRemoveFilterChip(\'daypart\',\'' + v + '\')" style="cursor:pointer">×</span></span>';
    }).join('')
    + (invFilterScore > 0 ? '<span class="inv-chip">≥' + invFilterScore + '% <span onclick="invRemoveFilterChip(\'score\',\'\')" style="cursor:pointer">×</span></span>' : '');
}

function invRenderFilters() {
  var wrap = document.getElementById('inv-filters-wrap');
  if (!wrap) return;
  wrap.innerHTML =
    // Left: filter button + chips
    '<button id="inv-filter-btn" onclick="invToggleFilterPanel()" style="display:flex;align-items:center;gap:6px;padding:5px 10px;border:1px solid var(--border);border-radius:7px;background:var(--surface);color:var(--muted);cursor:pointer;font-size:12px;flex-shrink:0;position:relative">'
    +   '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
    +   'Filters'
    +   '<span id="inv-filter-badge" style="display:none;position:absolute;top:-5px;right:-5px;width:16px;height:16px;background:var(--accent);color:#fff;border-radius:50%;font-size:9px;font-weight:700;align-items:center;justify-content:center">0</span>'
    + '</button>'
    + '<div id="inv-filter-chips" style="display:flex;gap:5px;flex-wrap:wrap;align-items:center;flex:1"></div>'
    // Right: view toggles + media plan icon
    + '<div style="display:flex;gap:4px;flex-shrink:0">'
    +   '<button id="inv-view-gallery" class="inv-view-btn inv-view-btn--act" onclick="invToggleView(\'gallery\')" title="Gallery view">'
    +     '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.4"/></svg>'
    +   '</button>'
    +   '<button id="inv-view-table" class="inv-view-btn" onclick="invToggleView(\'table\')" title="Table view">'
    +     '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 3h12M1 7h12M1 11h12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
    +   '</button>'
    +   '<div style="width:1px;background:var(--border);margin:2px 2px"></div>'
    +   '<button id="inv-mp-btn" class="inv-view-btn" onclick="invToggleMediaPlan()" title="Media Plan">'
    +     '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M4 5h6M4 7.5h4M4 10h3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>'
    +   '</button>'
    + '</div>';
}

function invToggleView(mode) {
  invCurrentView = mode;
  var gBtn = document.getElementById('inv-view-gallery');
  var tBtn = document.getElementById('inv-view-table');
  if (gBtn) gBtn.className = 'inv-view-btn' + (mode === 'gallery' ? ' inv-view-btn--act' : '');
  if (tBtn) tBtn.className = 'inv-view-btn' + (mode === 'table'   ? ' inv-view-btn--act' : '');
  invRenderInventory();
}

function invToggleMediaPlan() {
  invMediaPlanVisible = !invMediaPlanVisible;
  var mpBtn = document.getElementById('inv-mp-btn');
  if (mpBtn) mpBtn.className = 'inv-view-btn' + (invMediaPlanVisible ? ' inv-view-btn--act' : '');
  invRenderMediaPlan();
}

function invToggleSelect(id) {
  if (invSelected[id]) { delete invSelected[id]; } else { invSelected[id] = true; }
  var el = document.getElementById('inv-item-' + id);
  if (el) el.classList.toggle('inv-item--sel', !!invSelected[id]);
  var cb = document.getElementById('inv-cb-' + id);
  if (cb) cb.checked = !!invSelected[id];
  // auto-open media plan on first selection
  var anySelected = Object.keys(invSelected).length > 0;
  if (anySelected && !invMediaPlanVisible) { invMediaPlanVisible = true; }
  invRenderMediaPlan();
}

function invClearSelection() {
  invSelected = {};
  invSelectedEpisodes = {};
  document.querySelectorAll('.inv-item--sel').forEach(function(el){ el.classList.remove('inv-item--sel'); });
  document.querySelectorAll('[id^="inv-cb-"]').forEach(function(cb){ cb.checked = false; });
  document.querySelectorAll('[id^="inv-ep-cb-"]').forEach(function(cb){ cb.checked = false; });
  invRenderMediaPlan();
}

function invToggleSelectEpisode(epId, show, episode, channel, scene, imgSeed, impressionsNum) {
  if (invSelectedEpisodes[epId]) {
    delete invSelectedEpisodes[epId];
  } else {
    invSelectedEpisodes[epId] = { show: show, episode: episode, channel: channel, scene: scene, imgSeed: imgSeed, impressionsNum: impressionsNum || 0 };
    if (!invMediaPlanVisible) invMediaPlanVisible = true;
  }
  var cb = document.getElementById('inv-ep-cb-' + epId);
  if (cb) cb.checked = !!invSelectedEpisodes[epId];
  invRenderMediaPlan();
}

function invRenderMediaPlan() {
  var panel = document.getElementById('inv-media-plan');
  if (!panel) return;
  // update mp button state
  var mpBtn = document.getElementById('inv-mp-btn');
  if (mpBtn) mpBtn.className = 'inv-view-btn' + (invMediaPlanVisible ? ' inv-view-btn--act' : '');
  if (!invMediaPlanVisible) { panel.style.display = 'none'; return; }
  panel.style.display = 'flex';
  var selPrograms = INV_PROGRAMS.filter(function(p){ return invSelected[p.id]; });
  var selEpKeys   = Object.keys(invSelectedEpisodes);
  var totalItems  = selPrograms.length + selEpKeys.length;
  if (totalItems === 0) {
    panel.innerHTML =
      '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:12px;flex-shrink:0">Media Plan</div>'
      + '<div style="flex:1;display:flex;align-items:center;justify-content:center;text-align:center;color:var(--faint);font-size:12px;padding:20px">Select shows or episodes to build your media plan</div>';
    return;
  }
  var totalImp = selPrograms.reduce(function(s,p){ return s + p.impressionsNum; }, 0)
              + selEpKeys.reduce(function(s,k){ return s + (invSelectedEpisodes[k].impressionsNum || 0); }, 0);
  var totalDollars = selPrograms.reduce(function(s,p){ return s + p.impressionsNum * 1000 * ({'Prime Time':25,'Daytime':15,'Late Night':18,'Morning':12,'Early Fringe':20}[p.daypart] || 20); }, 0)
                   + selEpKeys.reduce(function(s,k){ return s + (invSelectedEpisodes[k].impressionsNum || 0) * 1000 * 20; }, 0);
  panel.innerHTML =
    '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0">'
    +   '<span>Media Plan <span style="font-size:10px;background:var(--accent);color:#fff;border-radius:20px;padding:1px 7px;margin-left:4px">' + totalItems + '</span></span>'
    +   '<span style="font-size:10px;color:var(--faint);cursor:pointer;font-weight:400" onclick="invClearSelection()">Clear all</span>'
    + '</div>'
    + '<div style="flex:1;overflow-y:auto;min-height:0;display:flex;flex-direction:column;gap:7px">'
    + selPrograms.map(function(p){
        var idx = INV_PROGRAMS.indexOf(p);
        var seed = 'tvshow' + (idx + 1);
        var parts = p.title.split(' — ');
        var showName = parts[0];
        var epLabel  = parts[1] || '';
        var meta = [epLabel, p.impressionsLabel ? p.impressionsLabel + ' imp.' : '', invEstDollars(p.impressionsNum, p.daypart)].filter(Boolean).join(' · ');
        return '<div style="display:flex;gap:8px;align-items:center;padding:8px;background:var(--bg);border-radius:8px;border:1px solid var(--border)">'
          + '<div style="width:38px;height:22px;border-radius:3px;overflow:hidden;flex-shrink:0">'
          +   '<img src="https://picsum.photos/seed/' + seed + '/640/360" style="width:100%;height:100%;object-fit:cover">'
          + '</div>'
          + '<div style="flex:1;min-width:0">'
          +   '<div style="font-size:11px;font-weight:600;color:var(--text);line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + showName + '</div>'
          +   '<div style="font-size:10px;color:var(--faint);margin-top:1px">' + meta + '</div>'
          + '</div>'
          + '<span style="font-size:14px;color:var(--faint);cursor:pointer;flex-shrink:0;line-height:1" onclick="invToggleSelect(' + p.id + ')">×</span>'
          + '</div>';
      }).join('')
    + selEpKeys.map(function(epId){
        var ep = invSelectedEpisodes[epId];
        var meta = [ep.episode, ep.channel, ep.impressionsNum ? invFmtDollars(ep.impressionsNum * 1000 * 20) : ''].filter(Boolean).join(' · ');
        return '<div style="display:flex;gap:8px;align-items:center;padding:8px;background:var(--bg);border-radius:8px;border:1px solid var(--border)">'
          + '<div style="width:38px;height:22px;border-radius:3px;overflow:hidden;flex-shrink:0">'
          +   '<img src="https://picsum.photos/seed/' + ep.imgSeed + '/128/72" style="width:100%;height:100%;object-fit:cover">'
          + '</div>'
          + '<div style="flex:1;min-width:0">'
          +   '<div style="font-size:11px;font-weight:600;color:var(--text);line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + ep.show + '</div>'
          +   '<div style="font-size:10px;color:var(--faint);margin-top:1px">' + meta + '</div>'
          + '</div>'
          + '<span style="font-size:14px;color:var(--faint);cursor:pointer;flex-shrink:0;line-height:1" onclick="invToggleSelectEpisode(\'' + epId.replace(/'/g,"\\'") + '\')">×</span>'
          + '</div>';
      }).join('')
    + '</div>'
    + '<div style="border-top:1px solid var(--border);padding-top:11px;margin-top:8px;flex-shrink:0">'
    +   '<div style="display:flex;justify-content:space-between;margin-bottom:5px">'
    +     '<span style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint)">Total Items</span>'
    +     '<span style="font-size:13px;font-weight:700;color:var(--text)">' + totalItems + '</span>'
    +   '</div>'
    + (totalImp > 0
        ? '<div style="display:flex;justify-content:space-between;margin-bottom:4px">'
          +   '<span style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint)">Est. Impressions</span>'
          +   '<span style="font-size:12px;font-weight:700;color:var(--text)">' + (totalImp >= 1 ? totalImp.toFixed(1) + 'M' : Math.round(totalImp * 1000) + 'K') + '</span>'
          + '</div>'
        : '')
    + (totalDollars > 0
        ? '<div style="display:flex;justify-content:space-between">'
          +   '<span style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint)">Est. Dollars</span>'
          +   '<span style="font-size:12px;font-weight:700;color:var(--accent)">' + invFmtDollars(totalDollars) + '</span>'
          + '</div>'
        : '')
    + '</div>'
    // ── Save box ──
    + '<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:8px;flex-shrink:0">'
    +   '<div style="display:flex;gap:6px">'
    +     '<input id="inv-mp-save-name" type="text" placeholder="Plan name…"'
    +       ' style="flex:1;min-width:0;height:30px;border:1px solid var(--border-md);border-radius:6px;padding:0 9px;font-size:12px;font-family:inherit;color:var(--text);background:var(--bg);outline:none"/>'
    +     '<button onclick="invSaveMediaPlan()"'
    +       ' style="height:30px;padding:0 11px;border-radius:6px;border:none;background:var(--accent);color:#fff;font-size:12px;font-weight:500;cursor:pointer;flex-shrink:0;font-family:inherit">Save</button>'
    +   '</div>'
    + '</div>';
}

function invSaveMediaPlan() {
  var selPrograms = INV_PROGRAMS.filter(function(p){ return invSelected[p.id]; });
  var selEpKeys   = Object.keys(invSelectedEpisodes);
  var totalItems  = selPrograms.length + selEpKeys.length;
  if (totalItems === 0) return;
  var nameInput = document.getElementById('inv-mp-save-name');
  var planName  = (nameInput && nameInput.value.trim()) || ('Media Plan ' + (savedMediaPlans.length + 1));
  var now       = new Date();
  var dateStr   = now.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][now.getMonth()] + ' ' + now.getFullYear();
  var CPM_MAP = { 'Prime Time': 25, 'Daytime': 15, 'Late Night': 18, 'Morning': 12, 'Early Fringe': 20 };
  var totalImp     = selPrograms.reduce(function(s,p){ return s + p.impressionsNum; }, 0)
                   + selEpKeys.reduce(function(s,k){ return s + (invSelectedEpisodes[k].impressionsNum || 0); }, 0);
  var totalDollars = selPrograms.reduce(function(s,p){ return s + p.impressionsNum * 1000 * (CPM_MAP[p.daypart] || 20); }, 0)
                   + selEpKeys.reduce(function(s,k){ return s + (invSelectedEpisodes[k].impressionsNum || 0) * 1000 * 20; }, 0);
  var unEl = document.getElementById('un');
  var author = unEl ? unEl.textContent.trim() : 'Product';
  savedMediaPlans.push({
    name:        planName,
    date:        dateStr,
    author:      author,
    programs:    selPrograms.map(function(p){ return { title: p.title.split(' — ')[0], channel: p.channel, impressionsLabel: p.impressionsLabel, id: p.id, impressionsNum: p.impressionsNum, daypart: p.daypart }; }),
    episodes:    selEpKeys.map(function(k){ return invSelectedEpisodes[k]; }),
    totalItems:  totalItems,
    impressions: totalImp > 0 ? (totalImp >= 1 ? totalImp.toFixed(1) + 'M' : Math.round(totalImp * 1000) + 'K') : null,
    dollars:     totalDollars > 0 ? invFmtDollars(totalDollars) : null
  });
  if (nameInput) nameInput.value = '';
  // Flash confirm
  var btn = document.querySelector('#inv-media-plan button[onclick="invSaveMediaPlan()"]');
  if (btn) { btn.textContent = '✓'; setTimeout(function(){ btn.textContent = 'Save'; }, 1200); }
}

function invShowMomentsModal(id) {
  var prog = INV_PROGRAMS.filter(function(p){ return p.id === id; })[0];
  if (!prog) return;
  var modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:2000;display:flex;align-items:center;justify-content:center';
  modal.onclick = function(e){ if (e.target === modal) modal.remove(); };
  modal.innerHTML =
    '<div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:24px;width:460px;max-width:90vw;max-height:75vh;display:flex;flex-direction:column;box-shadow:0 8px 40px rgba(0,0,0,.18)">'
    + '<div style="display:flex;align-items:start;justify-content:space-between;margin-bottom:18px;flex-shrink:0">'
    +   '<div>'
    +     '<div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:2px">' + prog.title + '</div>'
    +     '<div style="font-size:11px;color:var(--faint)">' + prog.moments.length + ' matched moments</div>'
    +   '</div>'
    +   '<button onclick="this.closest(\'[style*=fixed]\').remove()" style="background:none;border:none;cursor:pointer;color:var(--faint);font-size:20px;line-height:1;padding:0 4px">×</button>'
    + '</div>'
    + '<div style="flex:1;overflow-y:auto;min-height:0;display:flex;flex-direction:column;gap:9px">'
    + prog.moments.map(function(m){
        var c = m.score >= 85 ? '#16a34a' : m.score >= 70 ? '#d97706' : 'var(--accent)';
        return '<div style="display:flex;align-items:center;gap:12px">'
          + '<div style="flex:1;font-size:12px;color:var(--text);font-weight:500">' + m.label + '</div>'
          + '<div style="width:110px;height:5px;background:var(--bg);border-radius:3px;overflow:hidden">'
          +   '<div style="height:100%;width:' + m.score + '%;background:' + c + ';border-radius:3px"></div>'
          + '</div>'
          + '<div style="font-size:12px;font-weight:600;color:' + c + ';min-width:28px;text-align:right">' + m.score + '</div>'
          + '</div>';
      }).join('')
    + '</div>'
    + '</div>';
  document.body.appendChild(modal);
}

function invScoreColor(s)  { return s >= 90 ? '#16a34a' : s >= 80 ? '#d97706' : s >= 70 ? 'var(--accent)' : 'var(--faint)'; }
function invScoreBg(s)     { return s >= 90 ? '#f0fdf4' : s >= 80 ? '#fffbeb' : s >= 70 ? '#eff6ff' : '#f8f8f8'; }
function invScoreBorder(s) { return s >= 90 ? '#bbf7d0' : s >= 80 ? '#fde68a' : s >= 70 ? '#bfdbfe' : '#e5e5e5'; }

function invFmtDollars(d) {
  if (d >= 1000000) return '$' + (d / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  return '$' + Math.round(d / 1000) + 'K';
}
function invEstDollars(impressionsNum, daypart) {
  var CPM = { 'Prime Time': 25, 'Daytime': 15, 'Late Night': 18, 'Morning': 12, 'Early Fringe': 20 };
  var cpm = CPM[daypart] || 20;
  return invFmtDollars(impressionsNum * 1000 * cpm);
}

function invRenderInventory() {
  var wrap = document.getElementById('inv-content-wrap');
  if (!wrap) return;
  var progs = invGetFiltered();
  var TH = 'padding:9px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);border-bottom:1px solid var(--border);text-align:left';
  var TD = 'padding:10px 12px;font-size:12px;color:var(--text);border-bottom:1px solid var(--border-md);vertical-align:middle';

  if (progs.length === 0) {
    wrap.innerHTML = '<div style="padding:40px;text-align:center;color:var(--faint);font-size:13px">No programs match the current filters.</div>';
    return;
  }

  if (invCurrentView === 'gallery') {
    wrap.innerHTML =
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding-bottom:8px">'
      + progs.map(function(p) {
          var idx  = INV_PROGRAMS.indexOf(p);
          var seed = 'tvshow' + (idx + 1);
          var sel  = !!invSelected[p.id];
          var previewMoments = p.moments.slice(0, 2).map(function(m){
            return '<span style="font-size:10px;background:var(--bg);border:1px solid var(--border);border-radius:20px;padding:2px 7px;color:var(--muted)">' + m.label + '</span>';
          }).join('');
          return '<div id="inv-item-' + p.id + '" class="inv-card' + (sel ? ' inv-item--sel' : '') + '" onclick="invToggleSelect(' + p.id + ')" style="cursor:pointer">'
            // thumbnail
            + '<div style="position:relative;width:100%;padding-top:56.25%">'
            +   '<img src="https://picsum.photos/seed/' + seed + '/640/360" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">'
            // checkbox top-left — stopPropagation to avoid double-firing with card onclick
            +   '<label onclick="event.stopPropagation()" style="position:absolute;top:8px;left:8px;z-index:2;cursor:pointer;width:18px;height:18px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.88);border-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,.2)">'
            +     '<input type="checkbox" id="inv-cb-' + p.id + '"' + (sel ? ' checked' : '') + ' onchange="invToggleSelect(' + p.id + ')" style="width:13px;height:13px;accent-color:var(--accent);cursor:pointer;margin:0">'
            +   '</label>'
            // channel badge (shifted right to avoid checkbox overlap)
            +   '<div style="position:absolute;top:8px;left:34px;background:rgba(0,0,0,.62);border-radius:4px;padding:2px 7px;font-size:10px;font-weight:600;color:#fff;letter-spacing:.3px">' + p.channel + '</div>'
            +   '<div style="position:absolute;top:8px;right:8px;background:' + invScoreBg(p.match) + ';border:1px solid ' + invScoreBorder(p.match) + ';border-radius:20px;padding:2px 8px;font-size:10px;font-weight:700;color:' + invScoreColor(p.match) + '">' + p.match + '% match</div>'
            +   '<div style="position:absolute;bottom:7px;left:7px;background:rgba(0,0,0,.55);border-radius:4px;padding:2px 8px;font-size:10px;color:rgba(255,255,255,.85)">' + p.category + '</div>'
            +   (sel ? '<div style="position:absolute;inset:0;border:2px solid var(--accent);border-radius:0;pointer-events:none"></div>' : '')
            + '</div>'
            // body
            + '<div style="padding:11px 12px 13px">'
            +   '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:9px;line-height:1.3">' + p.title + '</div>'
            +   '<div style="margin-bottom:8px">'
            +     '<div style="font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);margin-bottom:3px">Suggested Scene</div>'
            +     '<div style="font-size:11px;color:var(--muted);line-height:1.35">' + p.scenes[0] + '</div>'
            +   '</div>'
            +   '<div style="display:flex;gap:16px;margin-bottom:10px">'
            +     '<div>'
            +       '<div style="font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);margin-bottom:3px">Est. Impressions</div>'
            +       '<div style="font-size:13px;font-weight:700;color:var(--text)">' + p.impressionsLabel + '</div>'
            +     '</div>'
            +     '<div>'
            +       '<div style="font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);margin-bottom:3px">Est. Dollars</div>'
            +       '<div style="font-size:13px;font-weight:700;color:var(--text)">' + invEstDollars(p.impressionsNum, p.daypart) + '</div>'
            +     '</div>'
            +   '</div>'
            +   '<div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center">'
            +     previewMoments
            +     (p.moments.length > 2 ? '<span onclick="invShowMomentsModal(' + p.id + ')" style="font-size:10px;color:var(--accent);cursor:pointer;white-space:nowrap">+' + (p.moments.length - 2) + ' more →</span>' : '')
            +   '</div>'
            + '</div>'
            + '</div>';
        }).join('')
      + '</div>';
  } else {
    wrap.innerHTML =
      '<table style="width:100%;border-collapse:collapse">'
      + '<thead><tr>'
      +   '<th style="' + TH + ';width:28px;padding-right:0"></th>'
      +   '<th style="' + TH + '">Program</th>'
      +   '<th style="' + TH + '">Channel</th>'
      +   '<th style="' + TH + '">Category</th>'
      +   '<th style="' + TH + '">Match</th>'
      +   '<th style="' + TH + '">Suggested Scene</th>'
      +   '<th style="' + TH + '">Est. Impressions</th>'
      +   '<th style="' + TH + '">Est. Dollars</th>'
      +   '<th style="' + TH + '">Moments</th>'
      + '</tr></thead><tbody>'
      + progs.map(function(p) {
          var idx  = INV_PROGRAMS.indexOf(p);
          var seed = 'tvshow' + (idx + 1);
          var sel  = !!invSelected[p.id];
          var rowBg = sel ? 'background:color-mix(in srgb,var(--accent) 6%,transparent)' : '';
          return '<tr id="inv-item-' + p.id + '" class="' + (sel ? 'inv-item--sel' : '') + '" style="cursor:pointer;' + rowBg + '" onclick="invToggleSelect(' + p.id + ')">'
            + '<td style="' + TD + ';padding-right:4px;width:28px" onclick="event.stopPropagation()">'
            +   '<input type="checkbox" id="inv-cb-' + p.id + '"' + (sel ? ' checked' : '') + ' onchange="invToggleSelect(' + p.id + ')" style="cursor:pointer;accent-color:var(--accent)">'
            + '</td>'
            + '<td style="' + TD + '">'
            +   '<div style="display:flex;align-items:center;gap:9px">'
            +     '<div style="width:54px;height:30px;border-radius:4px;overflow:hidden;flex-shrink:0">'
            +       '<img src="https://picsum.photos/seed/' + seed + '/640/360" style="width:100%;height:100%;object-fit:cover">'
            +     '</div>'
            +     '<span style="font-weight:500">' + p.title + '</span>'
            +   '</div>'
            + '</td>'
            + '<td style="' + TD + ';color:var(--muted)">' + p.channel + '</td>'
            + '<td style="' + TD + ';color:var(--muted)">' + p.category + '</td>'
            + '<td style="' + TD + '">'
            +   '<span style="font-size:11px;font-weight:700;color:' + invScoreColor(p.match) + ';background:' + invScoreBg(p.match) + ';border:1px solid ' + invScoreBorder(p.match) + ';border-radius:20px;padding:3px 9px">' + p.match + '%</span>'
            + '</td>'
            + '<td style="' + TD + ';color:var(--muted);font-size:11px">' + p.scenes[0] + '</td>'
            + '<td style="' + TD + ';font-weight:600">' + p.impressionsLabel + '</td>'
            + '<td style="' + TD + ';font-weight:600">' + invEstDollars(p.impressionsNum, p.daypart) + '</td>'
            + '<td style="' + TD + '">'
            +   '<span onclick="event.stopPropagation();invShowMomentsModal(' + p.id + ')" style="font-size:11px;color:var(--accent);cursor:pointer;white-space:nowrap">' + p.moments.length + ' moments →</span>'
            + '</td>'
            + '</tr>';
        }).join('')
      + '</tbody></table>';
  }
}

