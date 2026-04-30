// taxonomy-explorer.js — Taxonomy Explorer prototype

function renderTaxonomyExplorer() {
  setTimeout(txInit, 0);
  return `
<div class="ptitle">Taxonomy Explorer</div>
<div class="psub" style="margin-bottom:20px">Analyze an ad to find the best-matching content in your inventory</div>

<div style="display:grid;grid-template-columns:340px 1fr;gap:16px;align-items:start">

  <!-- ── LEFT: Input panel ── -->
  <div class="tx-panel">

    <!-- Input type tabs -->
    <div class="tx-type-tabs">
      <div class="tx-type-tab tx-type-tab--act" id="tx-t-video" onclick="txTab('video')">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M11 7l4-2v6l-4-2V7z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>
        Video
      </div>
      <div class="tx-type-tab" id="tx-t-doc" onclick="txTab('doc')">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="2" y="1" width="10" height="13" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
        Doc / PDF
      </div>
      <div class="tx-type-tab" id="tx-t-text" onclick="txTab('text')">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
        Brief
      </div>
    </div>

    <!-- Video upload -->
    <div id="tx-panel-video" class="tx-input-area">
      <div class="tx-dropzone" onclick="document.getElementById('tx-file-video').click()">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="2" y="6" width="18" height="16" rx="2.5" stroke="currentColor" stroke-width="1.6" opacity=".3"/><path d="M20 11.5l6-3v11l-6-3v-5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" opacity=".3"/><path d="M10 14v-4M10 10l-2 2M10 10l2 2" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <div class="tx-drop-title">Drop video here</div>
        <div class="tx-drop-sub">MP4, MOV up to 500 MB</div>
        <input type="file" id="tx-file-video" accept="video/*" style="display:none" onchange="txFileReady(this.files[0].name)">
      </div>
      <div id="tx-video-name" style="display:none" class="tx-file-chosen"></div>
    </div>

    <!-- Doc upload -->
    <div id="tx-panel-doc" class="tx-input-area" style="display:none">
      <div class="tx-dropzone" onclick="document.getElementById('tx-file-doc').click()">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="4" y="2" width="18" height="24" rx="2.5" stroke="currentColor" stroke-width="1.6" opacity=".3"/><path d="M9 9h10M9 14h10M9 19h7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity=".5"/><path d="M14 7v-4M14 3l-2 2M14 3l2 2" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <div class="tx-drop-title">Drop file here</div>
        <div class="tx-drop-sub">PDF, DOC, DOCX up to 50 MB</div>
        <input type="file" id="tx-file-doc" accept=".pdf,.doc,.docx" style="display:none" onchange="txFileReady(this.files[0].name)">
      </div>
      <div id="tx-doc-name" style="display:none" class="tx-file-chosen"></div>
    </div>

    <!-- Free text -->
    <div id="tx-panel-text" class="tx-input-area" style="display:none">
      <textarea id="tx-brief" class="tx-textarea" placeholder="Describe the ad campaign — product, audience, mood, key themes, messages…"></textarea>
    </div>

    <!-- Analyze button -->
    <button class="tx-analyze-btn" id="tx-analyze-btn" onclick="txAnalyze()">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5"/><path d="M11 11l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      Analyze
    </button>

    <!-- Progress bar (hidden until analysis) -->
    <div id="tx-progress-wrap" style="display:none;margin-top:14px">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px">
        <span id="tx-progress-label" style="font-size:11px;color:var(--muted)">Analyzing…</span>
        <span id="tx-progress-pct" style="font-size:11px;font-weight:500;color:var(--accent)">0%</span>
      </div>
      <div class="tx-progress-track">
        <div class="tx-progress-fill" id="tx-progress-fill" style="width:0%"></div>
      </div>
      <div id="tx-progress-step" style="font-size:11px;color:var(--faint);margin-top:6px"></div>
    </div>

  </div>

  <!-- ── RIGHT: Results panel ── -->
  <div class="tx-panel" id="tx-results-panel">
    <div id="tx-results-empty" style="padding:48px 24px;text-align:center;color:var(--faint);font-size:13px">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style="margin:0 auto 12px;display:block;opacity:.3"><circle cx="17" cy="17" r="12" stroke="currentColor" stroke-width="1.5"/><path d="M17 11v6l4 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      Run an analysis to see matching content
    </div>

    <div id="tx-results-content" style="display:none">
      <div class="tabnav" style="margin-bottom:16px">
        <button class="tabitem act" id="tx-rtab-cat" onclick="txResTab('cat')">Categories</button>
        <button class="tabitem" id="tx-rtab-eps" onclick="txResTab('eps')">Episodes &amp; Shows</button>
      </div>

      <!-- Tab: Categories -->
      <div id="tx-tab-cat">
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr>
              <th style="text-align:left;padding:9px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);border-bottom:1px solid var(--border)">Category</th>
              <th style="text-align:right;padding:9px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);border-bottom:1px solid var(--border)">Score</th>
              <th style="text-align:right;padding:9px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);border-bottom:1px solid var(--border)">Assets</th>
            </tr>
          </thead>
          <tbody id="tx-cat-body"></tbody>
        </table>
      </div>

      <!-- Tab: Episodes -->
      <div id="tx-tab-eps" style="display:none">
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr>
              <th style="text-align:left;padding:9px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);border-bottom:1px solid var(--border)">Show / Episode</th>
              <th style="text-align:left;padding:9px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);border-bottom:1px solid var(--border)">Channel</th>
              <th style="text-align:right;padding:9px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);border-bottom:1px solid var(--border)">Match</th>
            </tr>
          </thead>
          <tbody id="tx-eps-body"></tbody>
        </table>
      </div>
    </div>
  </div>

</div>`;
}

// ── State ─────────────────────────────────────────────────────────────────
var txActiveTab   = 'video';
var txActiveResTab = 'cat';
var txReady       = false;

var TX_CATEGORIES = [
  { name:'Adrenaline & Action',  score:97, assets:214 },
  { name:'Running & Athletics',  score:94, assets:189 },
  { name:'Urban Lifestyle',      score:91, assets:156 },
  { name:'Motivation & Mindset', score:88, assets:302 },
  { name:'Endurance Sports',     score:85, assets:143 },
  { name:'Youth Culture',        score:79, assets:97  },
  { name:'Outdoor & Nature',     score:72, assets:211 },
  { name:'Performance & Tech',   score:68, assets:88  },
  { name:'Team Sports',          score:61, assets:174 },
  { name:'Extreme Sports',       score:55, assets:62  },
];

var TX_EPISODES = [
  { show:'Red Bull Racing: Pit Stop Masters',     episode:'S3E7 — High-Speed Sequences',        channel:'Sports+',      match:97 },
  { show:'Trail Runners World Championship',      episode:'S1E4 — Mountain Sprint Final',        channel:'Discovery',    match:94 },
  { show:'Urban Athletes: City Limits',           episode:'S2E4 — Rooftop Parkour',             channel:'MTV',          match:91 },
  { show:'Marathon World Series: Tokyo',          episode:'S5E2 — Final 2km Push',              channel:'Eurosport',    match:88 },
  { show:'The Training Ground',                   episode:'S1E1 — Pre-Season Conditioning',     channel:'ESPN',         match:84 },
  { show:'Street Sports Collective',              episode:'S3E11 — Night Run NYC',              channel:'Vice',         match:80 },
  { show:'Extreme Sports Weekly',                 episode:'S7E3 — Base Jump Compilation',       channel:'Red Bull TV',  match:73 },
  { show:'Champions League Highlights',           episode:'Atletico Madrid Counter-Attack Reel',channel:'BT Sport',     match:68 },
  { show:'The Body Lab',                          episode:'S2E6 — Biomechanics of Speed',       channel:'NatGeo',       match:62 },
  { show:'Youth FC',                              episode:'S4E9 — Under-17 Sprint Drills',      channel:'DAZN',         match:57 },
];

var TX_STEPS = [
  'Transcribing audio…',
  'Extracting visual scenes…',
  'Detecting objects & actions…',
  'Building semantic map…',
  'Matching content inventory…',
  'Scoring alignment…',
];

// ── Init & tabs ───────────────────────────────────────────────────────────
function txInit() {
  txInjectStyles();
}

function txTab(tab) {
  txActiveTab = tab;
  ['video','doc','text'].forEach(function(t) {
    document.getElementById('tx-panel-' + t).style.display = t === tab ? '' : 'none';
    var el = document.getElementById('tx-t-' + t);
    el.className = 'tx-type-tab' + (t === tab ? ' tx-type-tab--act' : '');
  });
}

function txFileReady(name) {
  txReady = true;
  ['video','doc'].forEach(function(t) {
    var el = document.getElementById('tx-' + t + '-name');
    if (el) { el.textContent = '📎 ' + name; el.style.display = 'block'; }
  });
}

function txResTab(tab) {
  txActiveResTab = tab;
  ['cat','eps'].forEach(function(t) {
    document.getElementById('tx-tab-' + t).style.display = t === tab ? '' : 'none';
    var btn = document.getElementById('tx-rtab-' + t);
    btn.className = 'tabitem' + (t === tab ? ' act' : '');
  });
}

// ── Analysis ──────────────────────────────────────────────────────────────
function txAnalyze() {
  var btn = document.getElementById('tx-analyze-btn');
  var pw  = document.getElementById('tx-progress-wrap');
  if (btn) btn.disabled = true;
  if (pw)  pw.style.display = 'block';

  var fill  = document.getElementById('tx-progress-fill');
  var pct   = document.getElementById('tx-progress-pct');
  var label = document.getElementById('tx-progress-label');
  var step  = document.getElementById('tx-progress-step');

  var totalSteps = TX_STEPS.length;
  var current    = 0;
  var pctVal     = 0;

  function tick() {
    if (current >= totalSteps) {
      pctVal = 100;
      fill.style.width  = '100%';
      pct.textContent   = '100%';
      label.textContent = 'Analysis complete';
      step.textContent  = '';
      setTimeout(txShowResults, 400);
      return;
    }
    var target = Math.round(((current + 1) / totalSteps) * 100);
    step.textContent = TX_STEPS[current];
    animatePct(pctVal, target, fill, pct, function() {
      pctVal = target;
      current++;
      setTimeout(tick, 300);
    });
  }
  tick();
}

function animatePct(from, to, fill, pct, cb) {
  var duration = 480;
  var start    = null;
  function frame(ts) {
    if (!start) start = ts;
    var p   = Math.min((ts - start) / duration, 1);
    var val = Math.round(from + (to - from) * p);
    fill.style.width  = val + '%';
    pct.textContent   = val + '%';
    if (p < 1) requestAnimationFrame(frame);
    else cb();
  }
  requestAnimationFrame(frame);
}

// ── Render results ────────────────────────────────────────────────────────
function txShowResults() {
  document.getElementById('tx-results-empty').style.display   = 'none';
  document.getElementById('tx-results-content').style.display = 'block';
  txRenderCategories();
  txRenderEpisodes();
}

function txScoreColor(s) {
  return s >= 90 ? '#2EAD4B' : s >= 75 ? 'var(--accent)' : s >= 60 ? '#E5A100' : 'var(--faint)';
}

function txScoreBar(s) {
  var c = txScoreColor(s);
  return '<div style="display:flex;align-items:center;gap:8px;justify-content:flex-end">'
    + '<div style="width:60px;height:4px;background:var(--bg);border-radius:4px;overflow:hidden">'
    + '<div style="width:' + s + '%;height:100%;background:' + c + ';border-radius:4px"></div></div>'
    + '<span style="font-size:12px;font-weight:500;color:' + c + ';min-width:32px;text-align:right">' + s + '</span>'
    + '</div>';
}

function txRenderCategories() {
  var tbody = document.getElementById('tx-cat-body');
  if (!tbody) return;
  tbody.innerHTML = TX_CATEGORIES.map(function(c, i) {
    return '<tr style="border-bottom:1px solid var(--border)">'
      + '<td style="padding:11px 12px;font-size:13px;color:var(--text);display:flex;align-items:center;gap:8px">'
      + '<span style="font-size:10px;font-weight:600;color:var(--faint);min-width:16px">#' + (i+1) + '</span>'
      + c.name + '</td>'
      + '<td style="padding:11px 12px">' + txScoreBar(c.score) + '</td>'
      + '<td style="padding:11px 12px;text-align:right;font-size:12px;font-weight:500;color:var(--muted)">' + c.assets.toLocaleString() + '</td>'
      + '</tr>';
  }).join('');
}

function txRenderEpisodes() {
  var tbody = document.getElementById('tx-eps-body');
  if (!tbody) return;
  tbody.innerHTML = TX_EPISODES.map(function(e, i) {
    return '<tr style="border-bottom:1px solid var(--border)">'
      + '<td style="padding:11px 12px">'
      + '<div style="font-size:13px;font-weight:500;color:var(--text)">' + e.show + '</div>'
      + '<div style="font-size:11px;color:var(--faint);margin-top:2px">' + e.episode + '</div>'
      + '</td>'
      + '<td style="padding:11px 12px;font-size:12px;color:var(--muted);white-space:nowrap">' + e.channel + '</td>'
      + '<td style="padding:11px 12px">' + txScoreBar(e.match) + '</td>'
      + '</tr>';
  }).join('');
}

// ── Styles ────────────────────────────────────────────────────────────────
function txInjectStyles() {
  if (document.getElementById('tx-styles')) return;
  var s = document.createElement('style');
  s.id = 'tx-styles';
  s.textContent = `
    .tx-panel {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
    }
    .tx-type-tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 14px;
      background: var(--bg);
      border-radius: 8px;
      padding: 3px;
    }
    .tx-type-tab {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      height: 30px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      color: var(--muted);
      cursor: pointer;
      transition: all .15s;
      user-select: none;
    }
    .tx-type-tab--act {
      background: var(--surface);
      color: var(--text);
      box-shadow: 0 1px 4px rgba(0,0,0,.08);
    }
    .tx-input-area { margin-bottom: 12px; }
    .tx-dropzone {
      border: 1.5px dashed var(--border-md);
      border-radius: 10px;
      padding: 28px 16px;
      text-align: center;
      cursor: pointer;
      transition: border-color .15s, background .15s;
    }
    .tx-dropzone:hover { border-color: var(--accent); background: var(--subtle); }
    .tx-drop-title { font-size: 13px; font-weight: 500; color: var(--text); margin: 8px 0 4px; }
    .tx-drop-sub   { font-size: 11px; color: var(--faint); }
    .tx-file-chosen {
      margin-top: 8px;
      font-size: 12px;
      color: var(--muted);
      background: var(--bg);
      border-radius: 6px;
      padding: 7px 10px;
    }
    .tx-textarea {
      width: 100%;
      min-height: 140px;
      border: 1px solid var(--border-md);
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 13px;
      font-family: inherit;
      color: var(--text);
      resize: vertical;
      outline: none;
      transition: border .15s;
      background: var(--surface);
    }
    .tx-textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(237,0,94,.1); }
    .tx-analyze-btn {
      width: 100%;
      height: 38px;
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      transition: opacity .15s;
    }
    .tx-analyze-btn:hover    { opacity: .88; }
    .tx-analyze-btn:disabled { opacity: .45; cursor: default; }
    .tx-progress-track {
      height: 6px;
      background: var(--bg);
      border-radius: 4px;
      overflow: hidden;
    }
    .tx-progress-fill {
      height: 100%;
      background: var(--accent);
      border-radius: 4px;
      transition: width .1s linear;
    }
  `;
  document.head.appendChild(s);
}
