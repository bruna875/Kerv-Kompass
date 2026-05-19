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
        <button class="tabitem"     id="tx-rtab-custom" onclick="txResTab('custom')">Taxonomies</button>
        <button class="tabitem"     id="tx-rtab-eps"    onclick="txResTab('eps')">Episodes &amp; Shows</button>
      </div>

      <!-- Tab: Moments -->
      <div id="tx-tab-cat">
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr>
              <th style="text-align:left;padding:9px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);border-bottom:1px solid var(--border)">Moment</th>
              <th style="text-align:right;padding:9px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);border-bottom:1px solid var(--border)">Score</th>
              <th style="text-align:right;padding:9px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);border-bottom:1px solid var(--border)">Inventory / PODs</th>
            </tr>
          </thead>
          <tbody id="tx-cat-body"></tbody>
        </table>
        <!-- Saved custom moments appear here -->
        <div id="tx-custom-saved-section" style="display:none;margin-top:20px">
          <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);padding:8px 12px 6px;border-top:1px solid var(--border)">Taxonomies</div>
          <table style="width:100%;border-collapse:collapse">
            <tbody id="tx-custom-saved-body"></tbody>
          </table>
        </div>
      </div>

      <!-- Tab: Taxonomies -->
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
          <div style="position:sticky;top:16px;display:flex;flex-direction:column;height:510px;gap:0">
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
  { name:'Family Dinner Time',     score:96, assets:312 },
  { name:'Grocery Shopping',       score:94, assets:278 },
  { name:'Healthy Eating',         score:92, assets:241 },
  { name:'Meal Prep & Cooking',    score:91, assets:198 },
  { name:'Fresh Produce',          score:89, assets:167 },
  { name:'Weekend BBQ',            score:87, assets:143 },
  { name:'Quick & Easy Meals',     score:85, assets:209 },
  { name:'Home Cooking',           score:83, assets:188 },
  { name:'Family Life',            score:82, assets:324 },
  { name:'Snack & Entertaining',   score:81, assets:154 },
  { name:'Budget Living',          score:80, assets:119 },
  { name:'Lifestyle & Wellness',   score:76, assets:231 },
  { name:'Food Discovery',         score:72, assets:142 },
  { name:'Kids & Family',          score:68, assets:287 },
  { name:'Community & Local',      score:61, assets:176 },
  { name:'Seasonal Celebrations',  score:55, assets:98  },
];

var TX_EPISODES = [
  { show:'The Pioneer Woman',                     episode:'S34E2 — Family Weeknight Dinners',   channel:'Food Network', match:97 },
  { show:'Grocery Store Showdown',                episode:'S2E5 — Best Value Haul Challenge',   channel:'Food Network', match:94 },
  { show:'Barefoot Contessa',                     episode:'S26E4 — Easy Entertaining at Home',  channel:'Food Network', match:91 },
  { show:'Tasty: Everyday Eats',                  channel:'BuzzFeed',     episode:'S3E8 — Budget Family Meals',          match:88 },
  { show:'MasterChef Family Edition',             episode:'S5E3 — Fresh Produce Cook-Off',      channel:'FOX',          match:84 },
  { show:'Healthy Appetite with Ellie Krieger',   episode:'S4E11 — Quick Weeknight Wholesome',  channel:'Food Network', match:80 },
  { show:'Guy\'s Grocery Games',                  episode:'S29E6 — Supermarket Sweep Remix',    channel:'Food Network', match:73 },
  { show:'America\'s Test Kitchen',               episode:'S24E7 — Pantry Staples Mastery',     channel:'PBS',          match:68 },
  { show:'Food52: Home Cooking',                  episode:'S1E9 — Seasonal Meal Prep Guide',    channel:'YouTube',      match:62 },
  { show:'Little Kitchen Academy',                episode:'S2E4 — Kids Healthy Snack Builds',   channel:'Netflix',      match:57 },
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
  return s >= 90 ? '#2EAD4B' : s >= 75 ? '#E5A100' : s >= 60 ? 'var(--accent)' : 'var(--faint)';
}

function txScoreBar(s) {
  var col = s >= 80 ? '#16a34a' : s >= 65 ? '#d97706' : 'var(--muted)';
  var bg  = s >= 80 ? '#f0fdf4' : s >= 65 ? '#fffbeb' : 'var(--bg)';
  var bd  = s >= 80 ? '#bbf7d0' : s >= 65 ? '#fde68a' : 'var(--border)';
  return '<span style="font-size:10px;font-weight:600;color:' + col + ';background:' + bg + ';border:1px solid ' + bd + ';border-radius:20px;padding:2px 8px;white-space:nowrap">' + s + '%</span>';
}

function txRenderCategories() {
  var tbody = document.getElementById('tx-cat-body');
  if (!tbody) return;
  tbody.innerHTML = TX_CATEGORIES.map(function(c, i) {
    var safeN = c.name.replace(/'/g, "\\'");
    return '<tr class="tx-cat-row" style="border-bottom:1px solid var(--border)">'
      + '<td style="padding:11px 12px;font-size:13px;color:var(--text)">'
      + '<div style="display:flex;align-items:center;gap:8px">'
      + '<span style="font-size:10px;font-weight:600;color:var(--faint);min-width:16px">#' + (i+1) + '</span>'
      + '<span>' + c.name + '</span>'
      + '<span class="tx-tax-breakdown-btn" onclick="txOpenMomentModal(\'' + safeN + '\',' + c.score + ',' + c.assets + ')">Show Taxonomies</span>'
      + '</div>'
      + '</td>'
      + '<td style="padding:11px 12px">' + txScoreBar(c.score) + '</td>'
      + '<td style="padding:11px 12px;text-align:right;font-size:12px;font-weight:500;color:var(--muted)">'
      + '<span class="tx-assets-link" onclick="txShowAssetsView(\'' + safeN + '\',' + c.score + ',' + c.assets + ')">' + c.assets.toLocaleString() + ' episodes&nbsp;<svg width="10" height="10" viewBox="0 0 10 10" fill="none" style="vertical-align:middle;opacity:.6"><path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'
      + '</td>'
      + '</tr>';
  }).join('');
}

// ── Assets drill-down ─────────────────────────────────────────────────────

var TX_ASSET_SHOWS = [
  { show: 'Red Bull Racing: Pit Stop Masters',   channel: 'Sports+',    seasons: 4, category: 'Entertainment',  daypart: 'Prime Time'  },
  { show: 'Trail Runners World Championship',    channel: 'Discovery',  seasons: 3, category: 'Reality',        daypart: 'Prime Time'  },
  { show: 'Urban Athletes: City Limits',         channel: 'MTV',        seasons: 3, category: 'Reality',        daypart: 'Early Fringe'},
  { show: 'Marathon World Series',               channel: 'Eurosport',  seasons: 6, category: 'Entertainment',  daypart: 'Daytime'     },
  { show: 'The Training Ground',                 channel: 'ESPN',       seasons: 2, category: 'Comedy',         daypart: 'Daytime'     },
  { show: 'Street Sports Collective',            channel: 'Vice',       seasons: 4, category: 'Reality',        daypart: 'Late Night'  },
  { show: 'Extreme Sports Weekly',               channel: 'Red Bull TV',seasons: 7, category: 'Entertainment',  daypart: 'Prime Time'  },
  { show: 'Champions League Highlights',         channel: 'BT Sport',   seasons: 5, category: 'News & Morning', daypart: 'Prime Time'  },
  { show: 'The Body Lab',                        channel: 'NatGeo',     seasons: 3, category: 'Comedy',         daypart: 'Early Fringe'},
  { show: 'Youth FC',                            channel: 'DAZN',       seasons: 5, category: 'Entertainment',  daypart: 'Daytime'     },
  { show: 'Adventure Racing Series',             channel: 'Discovery',  seasons: 2, category: 'News & Morning', daypart: 'Morning'     },
  { show: 'Speed & Precision',                   channel: 'ESPN',       seasons: 3, category: 'Comedy',         daypart: 'Morning'     },
];

function txGenAssets(name, count) {
  var seed = 0;
  for (var k = 0; k < name.length; k++) seed += name.charCodeAt(k);
  var max = Math.min(count, 24);
  var assets = [];
  for (var i = 0; i < max; i++) {
    var showIdx   = (seed + i * 7)  % TX_ASSET_SHOWS.length;
    var show      = TX_ASSET_SHOWS[showIdx];
    var season    = 1 + (seed * (i + 2) * 3)  % show.seasons;
    var episode   = 1 + (seed * (i + 5) * 11) % 13;
    var sceneNum  = 1 + (seed * (i + 3) * 7)  % 18;
    var tcMins    = 1 + (seed * (i + 4) * 13) % 42;
    var tcSecs    = (seed * (i + 6) * 17) % 60;
    var durSecs   = 20 + (seed * (i + 1) * 9)  % 100;
    var durM      = Math.floor(durSecs / 60);
    var durS      = durSecs % 60;
    var endSecs   = tcMins * 60 + tcSecs + durSecs;
    var endM      = Math.floor(endSecs / 60);
    var endS      = endSecs % 60;
    var conf      = 62 + (seed * (i + 4) * 19) % 37;
    var impNum    = (5 + (seed * (i + 8) * 13) % 45) / 10; // 0.5 – 4.9 M
    assets.push({
      show:    show.show,
      episode: 'S' + season + 'E' + String(episode).padStart(2, '0'),
      channel:  show.channel,
      category: show.category,
      daypart:  show.daypart,
      scene:   'Scene ' + sceneNum + ' (' + String(tcMins).padStart(2,'0') + ':' + String(tcSecs).padStart(2,'0')
               + ' – ' + String(endM).padStart(2,'0') + ':' + String(endS).padStart(2,'0') + ')',
      duration:  durM > 0 ? durM + ':' + String(durS).padStart(2,'0') : '0:' + String(durS).padStart(2,'0'),
      confidence: Math.min(conf, 98),
      impressionsNum: impNum,
      imgSeed: show.show.replace(/\s+/g,'') + i
    });
  }
  return assets;
}

var txDrillDownAllAssets = [];
var txDrillDownName      = '';

function txRefreshDrillDownTable() {
  var wrap = document.getElementById('tx-drill-table-wrap');
  if (!wrap) return;
  var TH = 'padding:9px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);border-bottom:1px solid var(--border);';

  var filtered = txDrillDownAllAssets.filter(function(a) {
    if (typeof inv2FilterChannels !== 'undefined' && inv2FilterChannels.length && inv2FilterChannels.indexOf(a.channel) < 0) return false;
    if (typeof inv2FilterDayparts !== 'undefined' && inv2FilterDayparts.length && inv2FilterDayparts.indexOf(a.daypart) < 0) return false;
    if (typeof inv2FilterScore    !== 'undefined' && inv2FilterScore > 0 && a.confidence < inv2FilterScore) return false;
    return true;
  });

  if (!filtered.length) {
    wrap.innerHTML = '<div style="padding:32px;text-align:center;font-size:12px;color:var(--faint)">No episodes match the current filters.</div>';
    return;
  }

  wrap.innerHTML =
    '<table style="width:100%;border-collapse:collapse"><thead><tr>'
    + '<th style="text-align:left;'  + TH + '">Program</th>'
    + '<th style="text-align:left;'  + TH + '">Channel</th>'
    + '<th style="text-align:left;'  + TH + '">Category</th>'
    + '<th style="text-align:left;'  + TH + '">Daypart</th>'
    + '<th style="text-align:left;'  + TH + '">Scene</th>'
    + '<th style="text-align:right;' + TH + '">Est. Impressions</th>'
    + '<th style="text-align:right;' + TH + '">Est. CPM</th>'
    + '<th style="text-align:right;' + TH + '">Confidence</th>'
    + '</tr></thead><tbody>'
    + filtered.map(function(a) {
        return '<tr style="border-bottom:1px solid var(--border-md)">'
          + '<td style="padding:10px 12px">'
          +   '<div style="display:flex;align-items:center;gap:10px">'
          +     '<div style="width:64px;height:36px;border-radius:5px;overflow:hidden;flex-shrink:0;background:var(--bg)">'
          +       '<img src="https://picsum.photos/seed/' + a.imgSeed + '/128/72" style="width:100%;height:100%;object-fit:cover" loading="lazy"/>'
          +     '</div>'
          +     '<div>'
          +       '<div style="font-size:12px;color:var(--text);font-weight:500;line-height:1.3">' + a.show + '</div>'
          +       '<div style="font-size:11px;color:var(--faint);margin-top:1px">' + a.episode + '</div>'
          +     '</div>'
          +   '</div>'
          + '</td>'
          + '<td style="padding:10px 12px;font-size:12px;color:var(--muted);white-space:nowrap">' + a.channel + '</td>'
          + '<td style="padding:10px 12px;font-size:12px;color:var(--muted);white-space:nowrap">' + (a.category || '—') + '</td>'
          + '<td style="padding:10px 12px;font-size:12px;color:var(--muted);white-space:nowrap">' + (a.daypart  || '—') + '</td>'
          + '<td style="padding:10px 12px;font-size:12px;color:var(--muted);white-space:nowrap">' + a.scene + '</td>'
          + '<td style="padding:10px 12px;text-align:right;font-size:12px;font-weight:600;color:var(--text);white-space:nowrap">' + (a.impressionsNum >= 1 ? a.impressionsNum.toFixed(1).replace(/\.0$/,'') + 'M' : Math.round(a.impressionsNum * 1000) + 'K') + '</td>'
          + '<td style="padding:10px 12px;text-align:right;font-size:12px;font-weight:600;color:var(--text);white-space:nowrap">$' + (a.daypart === 'Prime Time' ? 25 : a.daypart === 'Late Night' ? 18 : a.daypart === 'Early Fringe' ? 20 : a.daypart === 'Morning' ? 12 : 15) + '</td>'
          + '<td style="padding:10px 12px">' + txScoreBar(a.confidence) + '</td>'
          + '</tr>';
      }).join('')
    + '</tbody></table>';
}

function txShowAssetsView(name, score, assetsCount) {
  var container = document.getElementById('tx2-sub-content-moments');
  if (!container) return;

  txDrillDownName      = name;
  txDrillDownAllAssets = txGenAssets(name, assetsCount).sort(function(a, b) { return b.confidence - a.confidence; });

  // Reset any active filters when entering drill-down
  if (typeof inv2FilterChannels !== 'undefined') { inv2FilterChannels = []; inv2FilterCategories = []; inv2FilterDayparts = []; inv2FilterScore = 0; inv2FilterPanelOpen = false; }

  container.style.overflow      = 'visible'; // must NOT clip the absolute filter panel
  container.style.display       = 'flex';
  container.style.flexDirection = 'column';
  container.style.position      = 'relative';

  container.innerHTML =
    // Single top bar: back breadcrumb + spacer + filter chips + filter btn + media plan btn
    '<div style="display:flex;align-items:center;gap:8px;padding-bottom:12px;border-bottom:1px solid var(--border);margin-bottom:12px;flex-shrink:0;min-width:0">'
    +   '<span class="tx-bc-link" onclick="txBackToMoments()" style="display:flex;align-items:center;gap:4px;flex-shrink:0">'
    +     '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8 2.5L4.5 6.5 8 10.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +     'Moments'
    +   '</span>'
    +   '<span style="font-size:11px;color:var(--faint);flex-shrink:0">›</span>'
    +   '<span style="font-size:12px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + name + '</span>'
    +   '<span style="font-size:11px;color:var(--faint);flex-shrink:0;white-space:nowrap">(' + assetsCount.toLocaleString() + ')</span>'
    +   '<div style="flex:1;min-width:0"></div>'
    +   '<div id="inv-filter-chips" style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;"></div>'
    +   '<button id="inv-filter-btn" onclick="inv2ToggleFilterPanel()" style="display:flex;align-items:center;gap:6px;padding:5px 10px;border:1px solid var(--border);border-radius:7px;background:var(--surface);color:var(--muted);cursor:pointer;font-size:12px;flex-shrink:0;position:relative;white-space:nowrap">'
    +     '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
    +     'Filters'
    +     '<span id="inv-filter-badge" style="display:none;position:absolute;top:-5px;right:-5px;width:16px;height:16px;background:var(--accent);color:#fff;border-radius:50%;font-size:9px;font-weight:700;align-items:center;justify-content:center">0</span>'
    +   '</button>'
    +   '<button id="inv-mp-btn" class="inv-view-btn" onclick="inv2ToggleMediaPlan()" title="Media Plan" style="flex-shrink:0">'
    +     '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M4 5h6M4 7.5h4M4 10h3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>'
    +   '</button>'
    + '</div>'
    // Filter panel — position:absolute relative to container (which has position:relative)
    + '<div id="inv-drill-filter-panel" style="display:none;position:absolute;top:52px;right:0;width:256px;z-index:200;background:var(--surface);border:1px solid var(--border-md);border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.13);padding:16px;flex-direction:column;max-height:calc(100% - 60px);overflow:hidden"></div>'
    // Table
    + '<div id="tx-drill-table-wrap" style="flex:1;overflow-y:auto;min-height:0"></div>';

  if (typeof inv2UpdateFilterBar === 'function') inv2UpdateFilterBar();
  txRefreshDrillDownTable();
  if (typeof inv2RenderMediaPlan === 'function') inv2RenderMediaPlan();
}

function txBackToMoments() {
  txDrillDownAllAssets = [];
  txDrillDownName = '';
  // In Media Planner v2, go back to the card grid instead of the old table
  if (typeof activeId !== 'undefined' && activeId === 'media-planner-v2') {
    if (typeof mp2RenderMoments === 'function') mp2RenderMoments();
    return;
  }

  var container = document.getElementById('tx2-sub-content-moments');
  if (!container) return;

  container.style.overflowY     = '';
  container.style.display       = 'flex';
  container.style.flexDirection = 'column';

  var isInventoryV2 = typeof activeId !== 'undefined' && activeId === 'media-planner';
  var TH = 'padding:9px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);border-bottom:1px solid var(--border);';
  var cartBtn = isInventoryV2
    ? '<div style="display:flex;align-items:center;justify-content:flex-end;padding-bottom:10px;flex-shrink:0">'
      + '<button id="inv-mp-btn" class="inv-view-btn" onclick="invToggleMediaPlan()" title="Media Plan">'
      + '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="2" width="13" height="12" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M5 6h6M5 9h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>'
      + '</button></div>'
    : '';

  container.innerHTML =
    cartBtn
    + '<div style="overflow-y:auto;flex:1;min-height:0">'
    + '<table style="width:100%;border-collapse:collapse"><thead><tr>'
    + '<th style="text-align:left;'  + TH + '">Moment</th>'
    + '<th style="text-align:right;' + TH + '">Score</th>'
    + '<th style="text-align:right;' + TH + '">Inventory / PODs</th>'
    + '</tr></thead><tbody id="tx-cat-body"></tbody></table>'
    + '</div>';

  txRenderCategories();
  if (typeof invRenderMediaPlan === 'function') invRenderMediaPlan();
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

// ── Taxonomies data ───────────────────────────────────────────────────
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

// ── Taxonomies functions ──────────────────────────────────────────────

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
    { taxonomy:'Emotion > Positive',               category:'Warmth',          score:94 },
    { taxonomy:'Emotion > Positive',               category:'Comfort',         score:89 },
    { taxonomy:'Emotion > Social',                 category:'Togetherness',    score:83 },
    { taxonomy:'Emotion > Motivational',           category:'Nourishment',     score:76 },
    { taxonomy:'Emotion > Positive',               category:'Pride',           score:70 },
    { taxonomy:'Emotion > Sensory',                category:'Appetite',        score:63 },
  ],
  location: [
    { taxonomy:'Location > Domestic > Interior',   category:'Kitchen',         score:96 },
    { taxonomy:'Location > Domestic > Interior',   category:'Dining Room',     score:88 },
    { taxonomy:'Location > Retail > Grocery',      category:'Supermarket',     score:83 },
    { taxonomy:'Location > Domestic > Exterior',   category:'Backyard',        score:72 },
    { taxonomy:'Location > Retail > Market',       category:'Farmers Market',  score:65 },
  ],
  objects: [
    { taxonomy:'Objects > Food > Fresh',           category:'Fruit & Veg',     score:95 },
    { taxonomy:'Objects > Kitchenware > Cookware', category:'Pots & Pans',     score:88 },
    { taxonomy:'Objects > Food > Packaged',        category:'Grocery Products',score:82 },
    { taxonomy:'Objects > Kitchenware > Utensils', category:'Knives & Tools',  score:74 },
    { taxonomy:'Objects > Packaging > Retail',     category:'Shopping Cart',   score:67 },
  ],
  sentiment: [
    { taxonomy:'Sentiment > Positive > Wholesome',    category:'Wholesome',    score:95 },
    { taxonomy:'Sentiment > Positive > Warm',         category:'Warm & Cosy',  score:90 },
    { taxonomy:'Sentiment > Positive > Reassuring',   category:'Trusted',      score:84 },
    { taxonomy:'Sentiment > Positive > Aspirational', category:'Aspirational', score:75 },
    { taxonomy:'Sentiment > Neutral > Informative',   category:'Informative',  score:60 },
  ],
  iab: [
    { taxonomy:'IAB8 > Food & Drink',              category:'Grocery & Food',     score:97 },
    { taxonomy:'IAB8 > Food & Drink > Cooking',    category:'Home Cooking',       score:93 },
    { taxonomy:'IAB8 > Food & Drink > Healthy',    category:'Healthy Eating',     score:86 },
    { taxonomy:'IAB25 > Family & Parenting',       category:'Family Life',        score:78 },
    { taxonomy:'IAB9 > Hobbies > Home & Garden',   category:'Home & Kitchen',     score:70 },
    { taxonomy:'IAB7 > Health > Nutrition',        category:'Nutrition',          score:62 },
  ],
  brandsafety: [
    { taxonomy:'Brand Safety > Safe',              category:'Family Friendly',    score:100 },
    { taxonomy:'Brand Safety > Safe > Positive',   category:'Positive Messaging', score:100 },
    { taxonomy:'Brand Safety > Safe > Language',   category:'Clean Language',     score:98  },
    { taxonomy:'Brand Safety > Safe > Food',       category:'Food Safe',          score:97  },
    { taxonomy:'Brand Safety > Safe > Violence',   category:'Non-Violent',        score:96  },
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
    .tx-tax-breakdown-btn {
      font-size: 10px; color: var(--faint); cursor: pointer;
      transition: color .15s; white-space: nowrap;
    }
    .tx-tax-breakdown-btn:hover { color: var(--accent); }

    .tx-assets-link {
      cursor: pointer; transition: color .15s;
    }
    .tx-assets-link:hover { color: var(--accent); }

    .tx-bc-link {
      font-size: 12px; color: var(--muted); cursor: pointer; transition: color .15s;
    }
    .tx-bc-link:hover { color: var(--accent); }

    /* Taxonomies – taxonomy tab nav */
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


// ── Taxonomy Explorer: module-level state & self-contained flow ────────────

var tsTaxStep      = 'upload';
var tsTaxInputType = 'video';
var tsTaxFileName  = '';

var TS_LIBRARY = [
  { type:'video', name:'below-deck-s12e03.mp4',        date:'2 May 2025',   moments:14, taxonomies:38 },
  { type:'video', name:'parks-and-rec-s04e11.mp4',     date:'29 Apr 2025',  moments:9,  taxonomies:22 },
  { type:'doc',   name:'Q1-content-brief.pdf',         date:'25 Apr 2025',  moments:6,  taxonomies:17 },
  { type:'text',  name:'Campaign brief — Spring 2025', date:'18 Apr 2025',  moments:4,  taxonomies:11 },
  { type:'video', name:'yellowstone-s05e08.mp4',       date:'11 Apr 2025',  moments:21, taxonomies:54 },
  { type:'doc',   name:'Brand-safety-guidelines.docx', date:'3 Apr 2025',   moments:3,  taxonomies:9  },
];

function tsShowUpload() {
  tsTaxStep = 'upload';
  var ca = document.getElementById('tx2-content-area');
  if (!ca) return;

  var pgname = document.getElementById('content-bc');
  if (pgname) pgname.textContent = 'Taxonomy Explorer';

  function typeIcon(t) {
    return t === 'video'
      ? '<svg width="13" height="13" viewBox="0 0 32 32" fill="none"><rect x="2" y="6" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M22 13l8-5v16l-8-5V13z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'
      : t === 'doc'
      ? '<svg width="13" height="13" viewBox="0 0 32 32" fill="none"><path d="M6 4h14l6 6v18a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" stroke-width="1.8"/><path d="M20 4v6h6M10 14h12M10 18h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
      : '<svg width="13" height="13" viewBox="0 0 32 32" fill="none"><path d="M4 8h24M4 14h18M4 20h24M4 26h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  }

  var libraryRows = TS_LIBRARY.map(function(item, i) {
    return '<div class="tx2-lib-row" onclick="tsLibLoad(' + i + ')">'
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

  ca.innerHTML =
    '<div style="display:flex;gap:0;min-height:400px">'
    + '<div style="width:300px;flex-shrink:0;padding-right:24px;border-right:1px solid var(--border)">'
    +   '<div style="margin-bottom:32px">'
    +     '<div style="font-size:14px;font-weight:600;color:var(--text);letter-spacing:-.2px;margin-bottom:3px">New Analysis</div>'
    +     '<div style="font-size:12px;color:var(--muted)">Choose an input type</div>'
    +   '</div>'
    +   '<div style="display:flex;gap:2px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:3px;margin-bottom:16px">'
    +     '<div class="tx2-seg tx2-seg--act" id="tx2-opt-video" onclick="tsSelectInput(\'video\')">'
    +       '<svg width="13" height="13" viewBox="0 0 32 32" fill="none"><rect x="2" y="6" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M22 13l8-5v16l-8-5V13z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'
    +       '<span>Video</span>'
    +     '</div>'
    +     '<div class="tx2-seg" id="tx2-opt-brief" onclick="tsSelectInput(\'brief\')">'
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
    +   '<button class="cs-btn-primary" style="width:100%;height:38px;font-size:13px" onclick="tsAnalyze()">Start Analysis</button>'
    + '</div>'
    + '<div style="flex:1;min-width:0;padding-left:24px;display:flex;flex-direction:column">'
    +   '<div style="display:flex;gap:0;border-bottom:1px solid var(--border);margin-bottom:18px;flex-shrink:0">'
    +     '<div class="tx2-home-tab tx2-home-tab--act">Previous Analyses</div>'
    +   '</div>'
    +   '<div style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:0">'
    +     libraryRows
    +   '</div>'
    + '</div>'
    + '</div>';
}

function tsSelectInput(type) {
  ['video', 'brief'].forEach(function(t) {
    var el = document.getElementById('tx2-opt-' + t);
    if (el) el.className = 'tx2-seg' + (t === type ? ' tx2-seg--act' : '');
  });
  var area = document.getElementById('tx2-input-area');
  if (!area) return;
  if (type === 'video') {
    tsTaxInputType = 'video';
    area.innerHTML =
      '<div class="tx2-upload-zone" onclick="document.getElementById(\'tx2-file-input-video\').click()">'
      + '<input type="file" id="tx2-file-input-video" style="display:none" accept="video/*">'
      + '<svg width="28" height="28" viewBox="0 0 32 32" fill="none" style="color:var(--faint)"><rect x="2" y="6" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.6"/><path d="M22 13l8-5v16l-8-5V13z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
      + '<div style="font-size:13px;font-weight:500;color:var(--text);margin-top:6px">Drop video file here</div>'
      + '<div style="font-size:11px;color:var(--faint);margin-top:2px">MP4, MOV, AVI — up to 2 GB</div>'
      + '</div>';
  } else {
    tsTaxInputType = 'text';
    area.innerHTML = tsBriefHtml();
  }
}

function tsBriefHtml() {
  return '<div style="border:1px solid var(--border-md);border-radius:8px;overflow:hidden;background:var(--surface)">'
    + '<textarea id="tx2-text-input" placeholder="Paste or type your brief here. The AI will analyse topics, sentiments, moments and taxonomy classifications…" style="width:100%;box-sizing:border-box;min-height:160px;resize:none;border:none;outline:none;padding:10px 12px;font-size:13px;font-family:inherit;color:var(--text);background:transparent;display:block"></textarea>'
    + '<div style="height:1px;background:var(--border)"></div>'
    + '<label for="tx2-file-input-doc" id="tx2-brief-upload-label" style="display:flex;align-items:center;gap:7px;padding:8px 12px;cursor:pointer;color:var(--muted);font-size:12px;transition:background .13s,color .13s;border-radius:0 0 8px 8px" onmouseenter="this.style.background=\'var(--bg)\';this.style.color=\'var(--text)\'" onmouseleave="this.style.background=\'\';this.style.color=\'var(--muted)\'">'
    +   '<svg width="13" height="13" viewBox="0 0 32 32" fill="none"><path d="M6 4h14l6 6v18a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" stroke-width="1.8"/><path d="M20 4v6h6M10 14h12M10 18h12M10 22h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
    +   '<span id="tx2-brief-file-label">Upload Doc or PDF</span>'
    + '</label>'
    + '<input type="file" id="tx2-file-input-doc" style="display:none" accept=".pdf,.doc,.docx" onchange="var n=this.files[0]?this.files[0].name:\'\';document.getElementById(\'tx2-brief-file-label\').textContent=n||\'Upload Doc or PDF\';tsTaxInputType=n?\'doc\':\'text\'">'
    + '</div>';
}

function tsAnalyze() {
  var ca = document.getElementById('tx2-content-area');
  if (!ca) return;
  tsTaxStep = 'progress';

  if (tsTaxInputType === 'text') {
    var ta = document.getElementById('tx2-text-input');
    var raw = ta ? ta.value.trim() : '';
    tsTaxFileName = raw.length ? (raw.slice(0, 42) + (raw.length > 42 ? '…' : '')) : 'Free text input';
  } else {
    var fi = document.getElementById('tx2-file-input-' + tsTaxInputType);
    tsTaxFileName = (fi && fi.files && fi.files[0]) ? fi.files[0].name
      : (tsTaxInputType === 'video' ? 'video-file.mp4' : 'document.pdf');
  }

  var progressSteps = ['Analyzing metadata…','Detecting scenes & objects…','Classifying moments…','Building taxonomy map…','Matching episodes & shows…'];
  var frames = ['https://picsum.photos/seed/kervscene1/640/360','https://picsum.photos/seed/kervscene2/640/360','https://picsum.photos/seed/kervscene3/640/360','https://picsum.photos/seed/kervscene4/640/360','https://picsum.photos/seed/kervscene5/640/360'];

  ca.innerHTML =
    '<div style="max-width:520px;margin:0 auto">'
    + '<div style="margin-bottom:14px">'
    +   '<div style="font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.6px;color:var(--faint);margin-bottom:3px">Scanning video</div>'
    +   '<div style="font-size:15px;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + tsTaxFileName + '</div>'
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
    if (pct >= 100) { clearInterval(interval); if (scanLine) scanLine.style.display = 'none'; setTimeout(tsShowResults, 600); }
  }, 40);
}

function tsShowResults() {
  tsTaxStep = 'results';
  var ca = document.getElementById('tx2-content-area');
  if (!ca) return;

  var TH = 'padding:9px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);border-bottom:1px solid var(--border)';
  var fileIcon = tsTaxInputType === 'video'
    ? '<svg width="12" height="12" viewBox="0 0 32 32" fill="none"><rect x="2" y="6" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M22 13l8-5v16l-8-5V13z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'
    : tsTaxInputType === 'doc'
    ? '<svg width="12" height="12" viewBox="0 0 32 32" fill="none"><path d="M6 4h14l6 6v18a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" stroke-width="1.8"/><path d="M20 4v6h6M10 14h12M10 18h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
    : '<svg width="12" height="12" viewBox="0 0 32 32" fill="none"><path d="M4 8h24M4 14h18M4 20h24M4 26h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  var typeLabel = tsTaxInputType === 'video' ? 'Video' : tsTaxInputType === 'doc' ? 'Document' : 'Text';

  var pgname = document.getElementById('content-bc');
  if (pgname) pgname.innerHTML =
    '<span style="font-weight:400;opacity:.55;cursor:pointer" onclick="tsShowUpload()">Taxonomy Explorer</span>'
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
    +     '<div style="font-size:12px;font-weight:600;color:var(--text);word-break:break-word;line-height:1.4;margin-bottom:6px">' + tsTaxFileName + '</div>'
    +     '<div style="display:flex;align-items:center;gap:5px;margin-bottom:10px">'
    +       '<span style="font-size:10px;color:var(--muted);display:flex;align-items:center;gap:3px">' + fileIcon + ' ' + typeLabel + '</span>'
    +     '</div>'
    +     '<span style="font-size:10px;font-weight:600;color:#16a34a;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:20px;padding:3px 9px">Completed</span>'
    +   '</div>'
    +   '<div style="display:flex;flex-direction:column;gap:0">'
    +     '<div><div style="font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);margin-bottom:2px">Moments</div><div style="font-size:18px;font-weight:700;color:var(--text)">10</div></div>'
    +     '<div><div style="font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);margin-bottom:2px">Taxonomies</div><div style="font-size:18px;font-weight:700;color:var(--text)">28</div></div>'
    +   '</div>'
    + '</div>'
    + '<div style="flex:1;min-width:0;display:flex;gap:16px;height:100%;overflow:hidden">'
    +   '<div style="flex:1;min-width:0;display:flex;flex-direction:column;height:100%;overflow:hidden">'
    +   '<div class="cs-dv-tabnav" style="margin-bottom:16px;flex-shrink:0">'
    +     '<button class="cs-dv-tab cs-dv-tab--act" id="tx2-sub-tab-moments"    onclick="tsSubTab(\'moments\')">Moments</button>'
    +     '<button class="cs-dv-tab"                 id="tx2-sub-tab-taxonomies" onclick="tsSubTab(\'taxonomies\')">Taxonomies</button>'
    +     '<button class="cs-dv-tab"                 id="tx2-sub-tab-episodes"   onclick="tsSubTab(\'episodes\')">Episodes &amp; Shows</button>'
    +   '</div>'
    +   '<div id="tx2-sub-content-moments" style="display:flex;flex:1;min-height:0;flex-direction:column">'
    +     '<div style="overflow-y:auto;flex:1;min-height:0">'
    +       '<table style="width:100%;border-collapse:collapse"><thead><tr>'
    +         '<th style="text-align:left;'  + TH + '">Moment</th>'
    +         '<th style="text-align:right;' + TH + '">Score</th>'
    +         '<th style="text-align:right;' + TH + '">Inventory / PODs</th>'
    +       '</tr></thead><tbody id="tx-cat-body"></tbody></table>'
    +     '</div>'
    +   '</div>'
    +   '<div id="tx2-sub-content-taxonomies" style="display:none;flex:1;min-height:0">'
    +     '<div style="display:grid;grid-template-columns:1fr 240px;gap:16px;height:100%;width:100%">'
    +       '<div style="min-width:0;overflow-y:auto">'
    +         '<div class="tx-ctabs-nav">'
    +           '<div class="tx-ctab tx-ctab--act" id="tx-ctab-emotion"     onclick="txCustomTab(\'emotion\')">Emotion</div>'
    +           '<div class="tx-ctab"              id="tx-ctab-location"    onclick="txCustomTab(\'location\')">Location</div>'
    +           '<div class="tx-ctab"              id="tx-ctab-objects"     onclick="txCustomTab(\'objects\')">Objects</div>'
    +           '<div class="tx-ctab"              id="tx-ctab-sentiment"   onclick="txCustomTab(\'sentiment\')">Sentiment</div>'
    +           '<div class="tx-ctab"              id="tx-ctab-iab"         onclick="txCustomTab(\'iab\')">IAB</div>'
    +           '<div class="tx-ctab"              id="tx-ctab-brandsafety" onclick="txCustomTab(\'brandsafety\')">Brand Safety</div>'
    +         '</div>'
    +         '<div id="tx-ctab-table"></div>'
    +         '<div id="tx-ctab-pagination"></div>'
    +       '</div>'
    +       '<div style="display:flex;flex-direction:column;height:100%;gap:0">'
    +         '<div class="tx-chips-panel" id="tx-chips-panel" style="flex:1;overflow-y:auto;min-height:0">'
    +           '<div class="tx-chips-title">Selected Taxonomies</div>'
    +           '<div class="tx-chips-empty" id="tx-chips-empty">Select taxonomies from the table</div>'
    +           '<div id="tx-chips-content" style="display:none"></div>'
    +         '</div>'
    +         '<div class="tx-save-panel">'
    +           '<div class="tx-save-label">Save as Moment</div>'
    +           '<input class="tx-moment-input" id="tx-moment-name" type="text" placeholder="Name this moment…">'
    +           '<button class="tx-save-btn" onclick="txSaveMoment()">'
    +             '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 2h8l2 2v8a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" stroke-width="1.5"/><path d="M5 13V8h4v5M4 2v3h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
    +             ' Save Moment'
    +           '</button>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +   '</div>'
    +   '<div id="tx2-sub-content-episodes" style="display:none;flex:1;overflow-y:auto;min-height:0">'
    +     '<table style="width:100%;border-collapse:collapse"><thead><tr>'
    +       '<th style="text-align:left;'  + TH + '">Show / Episode</th>'
    +       '<th style="text-align:left;'  + TH + '">Channel</th>'
    +       '<th style="text-align:right;' + TH + '">Match</th>'
    +     '</tr></thead><tbody id="tx-eps-body"></tbody></table>'
    +   '</div>'
    +   '</div>'
    + '</div>'
    + '</div>';

  if (typeof txInjectStyles === 'function') txInjectStyles();
  txCustomSelections = [];
  txRenderCategories();
}

function tsSubTab(tab) {
  ['moments', 'taxonomies', 'episodes'].forEach(function(t) {
    var btn = document.getElementById('tx2-sub-tab-' + t);
    var pnl = document.getElementById('tx2-sub-content-' + t);
    if (btn) btn.className = 'cs-dv-tab' + (t === tab ? ' cs-dv-tab--act' : '');
    if (pnl) pnl.style.display = t === tab ? 'flex' : 'none';
  });
  if (tab === 'moments')    { txCustomSelections = []; txRenderCategories(); }
  if (tab === 'taxonomies') { txCustomActiveTab = 'emotion'; txCustomCurrentPage = 1; txCustomRenderTable(); txRenderChips(); }
  if (tab === 'episodes')   txRenderEpisodes();
}

function tsLibLoad(idx) {
  var item = TS_LIBRARY[idx];
  if (!item) return;
  tsTaxInputType = item.type === 'video' ? 'video' : item.type === 'doc' ? 'doc' : 'text';
  tsTaxFileName  = item.name;
  tsShowResults();
}

// ── Taxonomy Explorer (showcase) entry point ────────────────────────────────

function renderTaxonomyShowcase() {
  setTimeout(function() {
    tsTaxStep = 'upload'; tsTaxInputType = 'video'; tsTaxFileName = '';
    sdtInjectStyles();
    tsShowUpload();
  }, 0);
  return `
<div class="ptitle">Taxonomy Explorer</div>
<div class="psub" style="margin-bottom:24px">Upload a video or brief and let KervSDT analyse moments, metadata and taxonomy classifications</div>
<div id="sdt-panel-taxonomy2">
  <div class="cs-card" style="padding:32px">
    <div id="tx2-content-area"></div>
  </div>
</div>`;
}

