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
        <button class="tabitem act" id="tx-rtab-cat"    onclick="txResTab('cat')">Moments</button>
        <button class="tabitem"     id="tx-rtab-custom" onclick="txResTab('custom')">Custom Moments</button>
        <button class="tabitem"     id="tx-rtab-eps"    onclick="txResTab('eps')">Episodes &amp; Shows</button>
      </div>

      <!-- Tab: Moments -->
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
        <!-- Saved custom moments appear here -->
        <div id="tx-custom-saved-section" style="display:none;margin-top:20px">
          <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);padding:8px 12px 6px;border-top:1px solid var(--border)">Custom Moments</div>
          <table style="width:100%;border-collapse:collapse">
            <tbody id="tx-custom-saved-body"></tbody>
          </table>
        </div>
      </div>

      <!-- Tab: Custom Moments -->
      <div id="tx-tab-custom" style="display:none">
        <div style="display:grid;grid-template-columns:1fr 256px;gap:16px;align-items:start">

          <!-- Left: taxonomy browser -->
          <div style="min-width:0">
            <div class="tx-ctabs-nav">
              <div class="tx-ctab tx-ctab--act" id="tx-ctab-emotion"     onclick="txCustomTab('emotion')">Emotion</div>
              <div class="tx-ctab"              id="tx-ctab-location"    onclick="txCustomTab('location')">Location</div>
              <div class="tx-ctab"              id="tx-ctab-objects"     onclick="txCustomTab('objects')">Objects</div>
              <div class="tx-ctab"              id="tx-ctab-sentiment"   onclick="txCustomTab('sentiment')">Sentiment</div>
              <div class="tx-ctab"              id="tx-ctab-iab"         onclick="txCustomTab('iab')">IAB</div>
              <div class="tx-ctab"              id="tx-ctab-brandsafety" onclick="txCustomTab('brandsafety')">Brand Safety</div>
            </div>
            <div id="tx-ctab-table"></div>
            <div id="tx-ctab-pagination"></div>
          </div>

          <!-- Right: chips + save (sticky, fixed height, chips scroll) -->
          <div style="position:sticky;top:16px;display:flex;flex-direction:column;height:calc(100vh - 220px);gap:0">
            <div class="tx-chips-panel" id="tx-chips-panel">
              <div class="tx-chips-title">Selected Taxonomies</div>
              <div class="tx-chips-empty" id="tx-chips-empty">Select taxonomies from the table</div>
              <div id="tx-chips-content" style="display:none"></div>
            </div>
            <div class="tx-save-panel">
              <div class="tx-save-label">Save as Moment</div>
              <input class="tx-moment-input" id="tx-moment-name" type="text" placeholder="Name this moment…">
              <button class="tx-save-btn" id="tx-save-btn" onclick="txSaveMoment()">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 2h8l2 2v8a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" stroke-width="1.5"/><path d="M5 13V8h4v5M4 2v3h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                Save Moment
              </button>
            </div>
          </div>

        </div>
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
  txCustomRenderTable();
  txRenderChips();
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
  ['cat','custom','eps'].forEach(function(t) {
    document.getElementById('tx-tab-' + t).style.display = t === tab ? '' : 'none';
    var btn = document.getElementById('tx-rtab-' + t);
    if (btn) btn.className = 'tabitem' + (t === tab ? ' act' : '');
  });
  if (tab === 'custom') { txCustomRenderTable(); txRenderChips(); }
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
  txRenderMomentsCustomSection();
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
    var safeN = c.name.replace(/'/g, "\\'");
    return '<tr class="tx-cat-row" style="border-bottom:1px solid var(--border);cursor:pointer" onclick="txOpenMomentModal(\'' + safeN + '\',' + c.score + ',' + c.assets + ')">'
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

// ── Custom Moments data ───────────────────────────────────────────────────
var TX_CUSTOM_DATA = {
  emotion: [
    { taxonomy:'Emotion > High Arousal > Excitement',      score:94 },
    { taxonomy:'Emotion > Positive > Inspiration',         score:88 },
    { taxonomy:'Emotion > High Arousal > Thrill',          score:82 },
    { taxonomy:'Emotion > Motivational > Determination',   score:77 },
    { taxonomy:'Emotion > Positive > Pride',               score:71 },
    { taxonomy:'Emotion > Competitive > Challenge',        score:65 },
    { taxonomy:'Emotion > Positive > Joy',                 score:62 },
    { taxonomy:'Emotion > Social > Connection',            score:58 },
    { taxonomy:'Emotion > Nostalgic > Memory',             score:48 },
    { taxonomy:'Emotion > Calm > Relaxation',              score:42 },
    { taxonomy:'Emotion > Fear > Tension',                 score:35 },
    { taxonomy:'Emotion > Negative > Frustration',         score:28 },
  ],
  location: [
    { taxonomy:'Location > Urban > Exterior > City Streets',  score:91 },
    { taxonomy:'Location > Sports > Outdoor > Running Track', score:85 },
    { taxonomy:'Location > Natural > Mountain > Trail',       score:78 },
    { taxonomy:'Location > Urban > Interior > Gym',           score:72 },
    { taxonomy:'Location > Sports > Stadium > Arena',         score:64 },
    { taxonomy:'Location > Natural > Beach > Coastline',      score:58 },
    { taxonomy:'Location > Urban > Interior > Office',        score:52 },
    { taxonomy:'Location > Natural > Forest > Trail',         score:47 },
    { taxonomy:'Location > Indoor > Home > Living Room',      score:41 },
    { taxonomy:'Location > Transport > Road > Highway',       score:36 },
    { taxonomy:'Location > Indoor > Mall > Retail',           score:29 },
    { taxonomy:'Location > Outdoor > Rural > Countryside',    score:22 },
  ],
  objects: [
    { taxonomy:'Objects > Footwear > Sports > Running Shoes', score:96 },
    { taxonomy:'Objects > Apparel > Athletic > Sportswear',   score:90 },
    { taxonomy:'Objects > Electronics > Wearable > Watch',    score:83 },
    { taxonomy:'Objects > Equipment > Timing > Stopwatch',    score:74 },
    { taxonomy:'Objects > Vehicle > Bicycle > Road Bike',     score:68 },
    { taxonomy:'Objects > Nutrition > Drink > Sports Bottle', score:61 },
    { taxonomy:'Objects > Equipment > Training > Weights',    score:55 },
    { taxonomy:'Objects > Apparel > Headwear > Cap',          score:49 },
    { taxonomy:'Objects > Electronics > Audio > Earphones',   score:43 },
    { taxonomy:'Objects > Equipment > Safety > Helmet',       score:38 },
    { taxonomy:'Objects > Natural > Terrain > Asphalt',       score:31 },
    { taxonomy:'Objects > Apparel > Eyewear > Sunglasses',    score:25 },
  ],
  sentiment: [
    { taxonomy:'Sentiment > Positive > High Energy > Energetic',    score:93 },
    { taxonomy:'Sentiment > Positive > Aspirational > Ambitious',   score:87 },
    { taxonomy:'Sentiment > Competitive > Driven > Focused',        score:81 },
    { taxonomy:'Sentiment > Positive > Empowering > Motivating',    score:75 },
    { taxonomy:'Sentiment > Positive > Celebratory > Triumphant',   score:69 },
    { taxonomy:'Sentiment > Neutral > Informative > Educational',   score:58 },
    { taxonomy:'Sentiment > Positive > Playful > Fun',              score:52 },
    { taxonomy:'Sentiment > Neutral > Professional > Corporate',    score:44 },
    { taxonomy:'Sentiment > Positive > Romantic > Heartwarming',    score:38 },
    { taxonomy:'Sentiment > Negative > Tense > Stressful',          score:29 },
    { taxonomy:'Sentiment > Negative > Melancholic > Sad',          score:21 },
  ],
  iab: [
    { taxonomy:'IAB17 > Sports > Athletics',                        score:95 },
    { taxonomy:'IAB17 > Sports > Running and Jogging',              score:92 },
    { taxonomy:'IAB9 > Hobbies and Interests > Fitness',            score:86 },
    { taxonomy:'IAB17 > Sports > Extreme Sports',                   score:79 },
    { taxonomy:'IAB11 > Urban Lifestyle > Street Culture',          score:71 },
    { taxonomy:'IAB7 > Health and Fitness > Exercise',              score:66 },
    { taxonomy:'IAB17 > Sports > Team Sports',                      score:60 },
    { taxonomy:'IAB9 > Hobbies > Outdoor Recreation',               score:54 },
    { taxonomy:'IAB7 > Health > Nutrition',                         score:48 },
    { taxonomy:'IAB3 > Business > Advertising',                     score:41 },
    { taxonomy:'IAB1 > Entertainment > Music',                      score:35 },
    { taxonomy:'IAB14 > Society > Youth Culture',                   score:28 },
  ],
  brandsafety: [
    { taxonomy:'Brand Safety > Safe > Family Friendly',             score:100 },
    { taxonomy:'Brand Safety > Safe > Sports > Athletic',           score:100 },
    { taxonomy:'Brand Safety > Safe > Positive Messaging',          score:98  },
    { taxonomy:'Brand Safety > Safe > Language > Clean',            score:97  },
    { taxonomy:'Brand Safety > Safe > Violence-Free',               score:95  },
    { taxonomy:'Brand Safety > Safe > Drug-Free',                   score:95  },
    { taxonomy:'Brand Safety > Safe > Age-Appropriate',             score:93  },
    { taxonomy:'Brand Safety > Safe > Inclusivity',                 score:90  },
    { taxonomy:'Brand Safety > Caution > Competitive',              score:72  },
    { taxonomy:'Brand Safety > Caution > Intense Imagery',          score:65  },
    { taxonomy:'Brand Safety > Caution > Extreme Sports Risk',      score:58  },
    { taxonomy:'Brand Safety > Restricted > Violent Themes',        score:12  },
  ],
};

var txCustomActiveTab    = 'emotion';
var txCustomCurrentPage  = 1;
var txCustomSelections   = [];  // [{id, tab, taxonomy, score}]
var txSelCounter         = 0;
var txSavedCustomMoments = [];
var TX_ITEMS_PER_PAGE    = 10;

// ── Custom Moments functions ──────────────────────────────────────────────

function txCustomTab(tab) {
  txCustomActiveTab   = tab;
  txCustomCurrentPage = 1;
  TX_MODAL_TABS.forEach(function(t) {
    var el = document.getElementById('tx-ctab-' + t.id);
    if (el) el.className = 'tx-ctab' + (t.id === tab ? ' tx-ctab--act' : '');
  });
  txCustomRenderTable();
}

function txCustomRenderTable() {
  var tableEl = document.getElementById('tx-ctab-table');
  if (!tableEl) return;

  var rows = (TX_CUSTOM_DATA[txCustomActiveTab] || []).slice();
  rows.sort(function(a,b){ return b.score - a.score; });

  var total  = rows.length;
  var pages  = Math.max(1, Math.ceil(total / TX_ITEMS_PER_PAGE));
  txCustomCurrentPage = Math.min(txCustomCurrentPage, pages);
  var start  = (txCustomCurrentPage - 1) * TX_ITEMS_PER_PAGE;
  var paged  = rows.slice(start, start + TX_ITEMS_PER_PAGE);

  var isSel = function(taxonomy) {
    return txCustomSelections.some(function(s) {
      return s.tab === txCustomActiveTab && s.taxonomy === taxonomy;
    });
  };

  tableEl.innerHTML =
    '<table style="width:100%;border-collapse:collapse">'
    + '<thead><tr>'
    + '<th class="tx-th" style="width:32px">#</th>'
    + '<th class="tx-th">Taxonomy</th>'
    + '<th class="tx-th" style="text-align:right">Score</th>'
    + '<th class="tx-th" style="width:40px"></th>'
    + '</tr></thead><tbody>'
    + paged.map(function(r, i) {
        var rank = start + i + 1;
        var sel  = isSel(r.taxonomy);
        var safeT = r.taxonomy.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
        return '<tr class="tx-custom-row' + (sel ? ' tx-custom-row--sel' : '') + '" onclick="txCustomToggle(\'' + txCustomActiveTab + '\',\'' + safeT + '\',' + r.score + ')">'
          + '<td style="padding:10px 12px;font-size:10px;font-weight:600;color:var(--faint)">#' + rank + '</td>'
          + '<td style="padding:10px 12px;font-size:13px;color:var(--text)">' + r.taxonomy + '</td>'
          + '<td style="padding:10px 12px">' + txScoreBar(r.score) + '</td>'
          + '<td style="padding:10px 12px;text-align:center">'
          + '<div class="tx-check' + (sel ? ' tx-check--sel' : '') + '">'
          + (sel ? '<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '')
          + '</div></td>'
          + '</tr>';
      }).join('')
    + '</tbody></table>';

  // Pagination
  var pag = document.getElementById('tx-ctab-pagination');
  if (!pag) return;
  if (pages <= 1) { pag.innerHTML = ''; return; }
  pag.innerHTML =
    '<div class="tx-pag-row">'
    + '<button class="tx-pag-btn"' + (txCustomCurrentPage <= 1 ? ' disabled' : '') + ' onclick="txCustomPaginate(-1)">← Prev</button>'
    + '<span class="tx-pag-info">Page ' + txCustomCurrentPage + ' of ' + pages + '</span>'
    + '<button class="tx-pag-btn"' + (txCustomCurrentPage >= pages ? ' disabled' : '') + ' onclick="txCustomPaginate(1)">Next →</button>'
    + '</div>';
}

function txCustomToggle(tab, taxonomy, score) {
  var idx = -1;
  for (var i = 0; i < txCustomSelections.length; i++) {
    if (txCustomSelections[i].tab === tab && txCustomSelections[i].taxonomy === taxonomy) {
      idx = i; break;
    }
  }
  if (idx >= 0) {
    txCustomSelections.splice(idx, 1);
  } else {
    txCustomSelections.push({ id: txSelCounter++, tab: tab, taxonomy: taxonomy, score: score });
  }
  txCustomRenderTable();
  txRenderChips();
}

function txCustomPaginate(dir) {
  txCustomCurrentPage = Math.max(1, txCustomCurrentPage + dir);
  txCustomRenderTable();
}

function txRenderChips() {
  var empty   = document.getElementById('tx-chips-empty');
  var content = document.getElementById('tx-chips-content');
  if (!empty || !content) return;

  if (!txCustomSelections.length) {
    empty.style.display   = '';
    content.style.display = 'none';
    content.innerHTML     = '';
    return;
  }
  empty.style.display   = 'none';
  content.style.display = '';

  var groups = {};
  TX_MODAL_TABS.forEach(function(t) { groups[t.id] = []; });
  txCustomSelections.forEach(function(s) { groups[s.tab].push(s); });

  content.innerHTML = TX_MODAL_TABS
    .filter(function(t) { return groups[t.id].length > 0; })
    .map(function(t) {
      return '<div class="tx-chip-group">'
        + '<div class="tx-chip-group-label">' + t.label + '</div>'
        + '<div class="tx-chip-list">'
        + groups[t.id].map(function(s) {
            var parts   = s.taxonomy.split('>');
            var display = parts[parts.length - 1].trim();
            return '<div class="tx-chip">'
              + '<span class="tx-chip-text">' + display + '</span>'
              + '<button class="tx-chip-x" onclick="txRemoveChip(' + s.id + ');event.stopPropagation()">'
              + '<svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1L1 7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>'
              + '</button>'
              + '</div>';
          }).join('')
        + '</div></div>';
    }).join('');
}

function txRemoveChip(id) {
  txCustomSelections = txCustomSelections.filter(function(s) { return s.id !== id; });
  txCustomRenderTable();
  txRenderChips();
}

function txSaveMoment() {
  var nameInput = document.getElementById('tx-moment-name');
  var name = nameInput ? nameInput.value.trim() : '';
  if (!name) {
    if (nameInput) { nameInput.classList.add('tx-input--error'); nameInput.focus(); }
    return;
  }
  if (!txCustomSelections.length) {
    var panel = document.getElementById('tx-chips-panel');
    if (panel) {
      panel.style.outline = '2px solid #E5243B';
      setTimeout(function() { panel.style.outline = ''; }, 900);
    }
    return;
  }

  var avgScore = Math.round(
    txCustomSelections.reduce(function(sum, s) { return sum + s.score; }, 0) / txCustomSelections.length
  );

  txSavedCustomMoments.push({
    name:       name,
    selections: txCustomSelections.slice(),
    score:      avgScore,
    count:      txCustomSelections.length,
  });

  // Reset
  txCustomSelections = [];
  if (nameInput) { nameInput.value = ''; nameInput.classList.remove('tx-input--error'); }
  txCustomRenderTable();
  txRenderChips();
  txRenderMomentsCustomSection();

  // Success feedback on button
  var btn = document.getElementById('tx-save-btn');
  if (btn) {
    var orig = btn.innerHTML;
    btn.textContent   = '✓ Saved!';
    btn.style.background = '#2EAD4B';
    setTimeout(function() { btn.innerHTML = orig; btn.style.background = ''; }, 1800);
  }
}

function txRenderMomentsCustomSection() {
  var section = document.getElementById('tx-custom-saved-section');
  if (!section) return;
  if (!txSavedCustomMoments.length) { section.style.display = 'none'; return; }
  section.style.display = '';
  var body = document.getElementById('tx-custom-saved-body');
  if (!body) return;
  body.innerHTML = txSavedCustomMoments.map(function(m) {
    return '<tr class="tx-cat-row" style="border-bottom:1px solid var(--border)">'
      + '<td style="padding:11px 12px;font-size:13px;color:var(--text);display:flex;align-items:center;gap:8px">'
      + '<span style="font-size:11px;color:var(--accent)">★</span>'
      + m.name + '</td>'
      + '<td style="padding:11px 12px">' + txScoreBar(m.score) + '</td>'
      + '<td style="padding:11px 12px;text-align:right;font-size:12px;font-weight:500;color:var(--muted);white-space:nowrap">' + m.count + ' taxonomies</td>'
      + '</tr>';
  }).join('');
}

// ── Moment modal data ─────────────────────────────────────────────────────
var TX_MOMENT_DATA = {
  emotion: [
    { taxonomy:'Emotion > High Arousal',           category:'Excitement',      score:94 },
    { taxonomy:'Emotion > Positive',               category:'Inspiration',     score:88 },
    { taxonomy:'Emotion > High Arousal',           category:'Thrill',          score:82 },
    { taxonomy:'Emotion > Motivational',           category:'Determination',   score:77 },
    { taxonomy:'Emotion > Positive',               category:'Pride',           score:71 },
    { taxonomy:'Emotion > Competitive',            category:'Challenge',       score:65 },
  ],
  location: [
    { taxonomy:'Location > Urban > Exterior',      category:'City Streets',    score:91 },
    { taxonomy:'Location > Sports > Outdoor',      category:'Running Track',   score:85 },
    { taxonomy:'Location > Natural > Terrain',     category:'Mountain Path',   score:78 },
    { taxonomy:'Location > Urban > Interior',      category:'Gym / Fitness',   score:72 },
    { taxonomy:'Location > Sports > Stadium',      category:'Arena',           score:64 },
  ],
  objects: [
    { taxonomy:'Objects > Footwear > Sports',      category:'Running Shoes',   score:96 },
    { taxonomy:'Objects > Apparel > Athletic',     category:'Sportswear',      score:90 },
    { taxonomy:'Objects > Electronics > Wearable', category:'Smartwatch',      score:83 },
    { taxonomy:'Objects > Equipment > Timing',     category:'Stopwatch',       score:74 },
    { taxonomy:'Objects > Terrain > Surface',      category:'Asphalt Road',    score:67 },
  ],
  sentiment: [
    { taxonomy:'Sentiment > Positive > Energetic',    category:'High Energy',  score:93 },
    { taxonomy:'Sentiment > Positive > Aspirational', category:'Aspirational', score:87 },
    { taxonomy:'Sentiment > Competitive > Drive',     category:'Competitive',  score:81 },
    { taxonomy:'Sentiment > Positive > Empowering',   category:'Empowerment',  score:75 },
    { taxonomy:'Sentiment > Neutral > Informative',   category:'Informative',  score:58 },
  ],
  iab: [
    { taxonomy:'IAB17 > Sports',                   category:'Athletics',          score:95 },
    { taxonomy:'IAB17 > Sports > Running',         category:'Running & Jogging',  score:92 },
    { taxonomy:'IAB9 > Hobbies & Interests > Fitness', category:'Fitness & Workout', score:86 },
    { taxonomy:'IAB17 > Sports > Extreme',         category:'Action Sports',      score:79 },
    { taxonomy:'IAB11 > Urban Lifestyle',          category:'Street Culture',     score:71 },
    { taxonomy:'IAB7 > Health > Exercise',         category:'Exercise',           score:66 },
  ],
  brandsafety: [
    { taxonomy:'Brand Safety > Safe',              category:'Family Friendly',    score:100 },
    { taxonomy:'Brand Safety > Safe > Sports',     category:'Sports Content',     score:100 },
    { taxonomy:'Brand Safety > Safe > Positive',   category:'Positive Messaging', score:98  },
    { taxonomy:'Brand Safety > Safe > Language',   category:'Clean Language',     score:97  },
    { taxonomy:'Brand Safety > Safe > Violence',   category:'Non-Violent',        score:95  },
  ],
};

var txModalActiveTab  = 'emotion';
var TX_MODAL_TABS = [
  { id:'emotion',     label:'Emotion'      },
  { id:'location',    label:'Location'     },
  { id:'objects',     label:'Objects'      },
  { id:'sentiment',   label:'Sentiment'    },
  { id:'iab',         label:'IAB'          },
  { id:'brandsafety', label:'Brand Safety' },
];

// ── Moment modal ──────────────────────────────────────────────────────────
function txOpenMomentModal(name, score, assets) {
  if (document.getElementById('tx-moment-modal')) return;
  txModalActiveTab = 'emotion';

  var tabsHtml = TX_MODAL_TABS.map(function(t) {
    return '<div class="tx-mtab' + (t.id === 'emotion' ? ' tx-mtab--act' : '') + '" id="tx-mtab-' + t.id + '" onclick="txModalTab(\'' + t.id + '\')">' + t.label + '</div>';
  }).join('');

  var modal = document.createElement('div');
  modal.id = 'tx-moment-modal';
  modal.className = 'tx-modal-overlay';
  modal.innerHTML =
    '<div class="tx-modal" onclick="event.stopPropagation()">'
    + '<div class="tx-modal-header">'
    +   '<div>'
    +     '<div class="tx-modal-title">' + name + '</div>'
    +     '<div class="tx-modal-meta">'
    +       '<span class="tx-modal-badge" style="color:' + txScoreColor(score) + ';background:' + txScoreColor(score) + '1a">Score ' + score + '</span>'
    +       '<span class="tx-modal-dot"></span>'
    +       '<span style="font-size:12px;color:var(--muted)">' + assets.toLocaleString() + ' assets</span>'
    +     '</div>'
    +   '</div>'
    +   '<button class="tx-modal-close" onclick="txCloseMomentModal()">'
    +     '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    +   '</button>'
    + '</div>'
    + '<div class="tx-mtabs-nav">' + tabsHtml + '</div>'
    + '<div class="tx-modal-body" id="tx-modal-body"></div>'
    + '</div>';

  modal.addEventListener('click', txCloseMomentModal);
  document.body.appendChild(modal);
  setTimeout(function() {
    modal.classList.add('tx-modal-overlay--in');
    txModalTab('emotion');
  }, 10);
}

function txCloseMomentModal() {
  var modal = document.getElementById('tx-moment-modal');
  if (!modal) return;
  modal.classList.remove('tx-modal-overlay--in');
  setTimeout(function() { modal.remove(); }, 200);
}

function txModalTab(tab) {
  txModalActiveTab = tab;
  TX_MODAL_TABS.forEach(function(t) {
    var el = document.getElementById('tx-mtab-' + t.id);
    if (el) el.className = 'tx-mtab' + (t.id === tab ? ' tx-mtab--act' : '');
  });

  var rows = TX_MOMENT_DATA[tab] || [];
  var sorted = rows.slice().sort(function(a,b){ return b.score - a.score; });

  var body = document.getElementById('tx-modal-body');
  if (!body) return;
  body.innerHTML =
    '<div style="overflow-y:auto;max-height:340px">'
    + '<table style="width:100%;border-collapse:collapse">'
    + '<thead><tr>'
    + '<th class="tx-th" style="width:32px">#</th>'
    + '<th class="tx-th">Taxonomy</th>'
    + '<th class="tx-th" style="text-align:right;white-space:nowrap">Score</th>'
    + '</tr></thead>'
    + '<tbody>'
    + sorted.map(function(r, i) {
        return '<tr style="border-bottom:1px solid var(--border)">'
          + '<td style="padding:10px 12px;font-size:10px;font-weight:600;color:var(--faint)">#' + (i+1) + '</td>'
          + '<td style="padding:10px 12px;font-size:13px;color:var(--text)">' + r.taxonomy + '</td>'
          + '<td style="padding:10px 12px">' + txScoreBar(r.score) + '</td>'
          + '</tr>';
      }).join('')
    + '</tbody></table>'
    + '</div>';
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

    /* Clickable category rows */
    .tx-cat-row:hover { background: var(--bg); }

    /* Custom Moments – taxonomy tab nav */
    .tx-ctabs-nav {
      display: flex; overflow-x: auto; border-bottom: 1px solid var(--border); margin-bottom: 0;
    }
    .tx-ctabs-nav::-webkit-scrollbar { display: none; }
    .tx-ctab {
      padding: 9px 13px; font-size: 12px; font-weight: 500;
      color: var(--muted); cursor: pointer; white-space: nowrap;
      border-bottom: 2px solid transparent; margin-bottom: -1px;
      transition: color .13s, border-color .13s; user-select: none;
    }
    .tx-ctab:hover { color: var(--text); }
    .tx-ctab--act  { color: var(--accent); border-bottom-color: var(--accent); }

    /* Table rows */
    .tx-custom-row { cursor: pointer; transition: background .1s; }
    .tx-custom-row:hover { background: var(--bg); }
    .tx-custom-row--sel { background: rgba(237,0,94,.04); }

    /* Checkbox */
    .tx-check {
      width: 16px; height: 16px; border-radius: 4px;
      border: 1.5px solid var(--border-md);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto; transition: all .1s;
    }
    .tx-check--sel { background: var(--accent); border-color: var(--accent); color: #fff; }

    /* Pagination */
    .tx-pag-row {
      display: flex; align-items: center; justify-content: center;
      gap: 10px; padding: 10px 12px;
    }
    .tx-pag-btn {
      height: 28px; padding: 0 12px; border-radius: 6px;
      border: 1px solid var(--border-md); background: none;
      font-size: 11px; font-weight: 500; font-family: inherit;
      color: var(--text); cursor: pointer; transition: background .12s;
    }
    .tx-pag-btn:hover:not(:disabled) { background: var(--bg); }
    .tx-pag-btn:disabled { color: var(--faint); cursor: default; }
    .tx-pag-info { font-size: 11px; color: var(--muted); }

    /* Chips panel */
    .tx-chips-panel {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 10px 10px 0 0; padding: 12px 14px;
      flex: 1; min-height: 0; overflow-y: auto;
    }
    .tx-chips-title {
      font-size: 10px; font-weight: 600; text-transform: uppercase;
      letter-spacing: .5px; color: var(--faint); margin-bottom: 10px;
    }
    .tx-chips-empty {
      font-size: 12px; color: var(--faint); text-align: center; padding: 8px 0;
    }
    .tx-chip-group { margin-bottom: 10px; }
    .tx-chip-group:last-child { margin-bottom: 0; }
    .tx-chip-group-label {
      font-size: 10px; font-weight: 600; text-transform: uppercase;
      letter-spacing: .4px; color: var(--muted); margin-bottom: 6px;
    }
    .tx-chip-list { display: flex; flex-wrap: wrap; gap: 5px; }
    .tx-chip {
      display: inline-flex; align-items: center; gap: 4px;
      height: 24px; padding: 0 6px 0 10px;
      background: var(--subtle); border: 1px solid var(--border);
      border-radius: 20px; font-size: 11px; color: var(--text); max-width: 220px;
    }
    .tx-chip-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .tx-chip-x {
      display: flex; align-items: center; justify-content: center;
      width: 16px; height: 16px; border: none; background: none;
      cursor: pointer; color: var(--faint); padding: 0; flex-shrink: 0;
      border-radius: 50%; transition: background .1s, color .1s;
    }
    .tx-chip-x:hover { background: var(--border-md); color: var(--text); }

    /* Save panel */
    .tx-save-panel {
      display: flex; flex-direction: column; gap: 8px;
      flex-shrink: 0;
      background: var(--surface);
      border: 1px solid var(--border); border-top: none;
      border-radius: 0 0 10px 10px;
      padding: 12px 14px;
    }
    .tx-save-label {
      font-size: 10px; font-weight: 600; text-transform: uppercase;
      letter-spacing: .5px; color: var(--faint);
    }
    .tx-moment-input {
      height: 34px; border: 1px solid var(--border-md); border-radius: 8px;
      padding: 0 11px; font-size: 13px; font-family: inherit;
      color: var(--text); background: var(--surface); outline: none;
      transition: border .15s; width: 100%; box-sizing: border-box;
    }
    .tx-moment-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(237,0,94,.1); }
    .tx-input--error { border-color: #E5243B !important; box-shadow: 0 0 0 3px rgba(229,36,59,.1) !important; }
    .tx-save-btn {
      height: 34px; background: var(--accent); color: #fff;
      border: none; border-radius: 8px;
      font-size: 12px; font-weight: 500; font-family: inherit;
      cursor: pointer; display: flex; align-items: center;
      justify-content: center; gap: 6px; transition: opacity .13s, background .3s;
    }
    .tx-save-btn:hover { opacity: .88; }

    /* Moment modal */
    .tx-modal-overlay {
      position: fixed; inset: 0;
      background: rgba(13,30,54,.45);
      z-index: 9999;
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity .2s;
    }
    .tx-modal-overlay--in { opacity: 1; }
    .tx-modal {
      background: var(--surface);
      border-radius: 14px;
      width: 640px;
      max-width: calc(100vw - 32px);
      max-height: calc(100vh - 64px);
      display: flex; flex-direction: column;
      box-shadow: 0 12px 48px rgba(0,0,0,.18);
      transform: translateY(8px); transition: transform .2s;
      position: relative; z-index: 10000;
    }
    .tx-modal-overlay--in .tx-modal { transform: translateY(0); }
    .tx-modal-header {
      padding: 18px 20px 14px;
      border-bottom: 1px solid var(--border);
      display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
      flex-shrink: 0;
    }
    .tx-modal-title { font-size: 16px; font-weight: 500; letter-spacing: -.3px; color: var(--text); }
    .tx-modal-meta  { display: flex; align-items: center; gap: 8px; margin-top: 5px; }
    .tx-modal-badge {
      font-size: 11px; font-weight: 600; padding: 2px 8px;
      border-radius: 20px; letter-spacing: .2px;
    }
    .tx-modal-dot {
      width: 3px; height: 3px; border-radius: 50%;
      background: var(--faint); flex-shrink: 0;
    }
    .tx-modal-close {
      width: 28px; height: 28px; border-radius: 6px; border: none;
      background: none; cursor: pointer; color: var(--faint);
      display: flex; align-items: center; justify-content: center;
      transition: background .13s, color .13s; flex-shrink: 0;
    }
    .tx-modal-close:hover { background: var(--bg); color: var(--text); }
    .tx-mtabs-nav {
      display: flex; gap: 0;
      border-bottom: 1px solid var(--border);
      padding: 0 20px;
      flex-shrink: 0;
      overflow-x: auto;
    }
    .tx-mtabs-nav::-webkit-scrollbar { display: none; }
    .tx-mtab {
      padding: 10px 14px; font-size: 12px; font-weight: 500;
      color: var(--muted); cursor: pointer; white-space: nowrap;
      border-bottom: 2px solid transparent; margin-bottom: -1px;
      transition: color .13s, border-color .13s;
      user-select: none;
    }
    .tx-mtab:hover { color: var(--text); }
    .tx-mtab--act  { color: var(--accent); border-bottom-color: var(--accent); }
    .tx-modal-body {
      overflow-y: auto; flex: 1;
    }
    .tx-th {
      text-align: left; padding: 9px 12px;
      font-size: 10px; font-weight: 500; text-transform: uppercase;
      letter-spacing: .5px; color: var(--faint);
      border-bottom: 1px solid var(--border);
      background: var(--surface);
      position: sticky; top: 0; z-index: 1;
    }
  `;
  document.head.appendChild(s);
}
