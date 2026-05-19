// metadata-analysis.js — Metadata Analysis page + shared tx2 helpers

// ── Live Prototype: Metadata Analysis ────────────────────────────────────

function renderMetadataAnalysis() {
  setTimeout(function() {
    csActiveTx2Filter = 'all'; csSelectedTx2Id = 1;
    sdtInjectStyles();
    csTx2Render();
  }, 0);
  return `
<div class="ptitle">Metadata Analysis</div>
<div class="psub" style="margin-bottom:20px">Browse and analyse content metadata</div>
<div id="sdt-panel-taxonomy2">
  <div class="cs-card">
    <div class="cs-title" style="margin-bottom:16px">Content Selection</div>
    <div class="cs-toolbar">
      <div class="cs-filter-wrap">
        <div class="cs-filter-label">Category</div>
        <select class="cs-filter-select" onchange="csTx2Filter(this.value)">
          <option value="all">All</option>
          <option value="comedy">Comedy</option>
          <option value="drama">Drama</option>
          <option value="reality">Reality</option>
          <option value="documentary">Documentary</option>
        </select>
      </div>
      <button class="cs-request-btn" onclick="csOpenModalTaxonomy()">
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
        Scan New Content
      </button>
    </div>
    <div class="cs-grid" id="cs-grid5"></div>
  </div>
</div>`;
}

// ── Content Selection data ────────────────────────────────────────────────
var CS_SHOWS = [
  { id:1,  title:'Parks and Recreation',    category:'comedy',    grad:'linear-gradient(145deg,#D4820A,#A05E08)', initials:'PR' },
  { id:2,  title:'Yellowstone',             category:'drama',     grad:'linear-gradient(145deg,#4A3820,#2E2210)', initials:'YS' },
  { id:3,  title:'Below Deck',              category:'reality',   grad:'linear-gradient(145deg,#1A6FC4,#0D4A8A)', initials:'BD', badge:'Peacock Original' },
  { id:4,  title:'Everybody Loves Raymond', category:'comedy',    grad:'linear-gradient(145deg,#C44B1A,#8A2E0D)', initials:'EL' },
  { id:5,  title:'ted',                     category:'comedy',    grad:'linear-gradient(145deg,#2E8B57,#1A5C38)', initials:'te' },
  { id:6,  title:'Wolf Like Me',            category:'drama',     grad:'linear-gradient(145deg,#5A3080,#3A1A5A)', initials:'WL' },
  { id:7,  title:'A.P. Bio',               category:'comedy',    grad:'linear-gradient(145deg,#1A6FC4,#0D4080)', initials:'AP' },
  { id:8,  title:'Below Deck',              category:'reality',   grad:'linear-gradient(145deg,#1A6FC4,#0D4A8A)', initials:'BD', badge:'Peacock Original' },
  { id:9,  title:'Show Title',              category:'drama',     grad:'linear-gradient(145deg,#4A5568,#2D3748)', initials:'ST' },
  { id:10, title:'Show Title',              category:'comedy',    grad:'linear-gradient(145deg,#1A6FC4,#0D4080)', initials:'ST' },
];

// ── Request New Content Modal — 3-step (Taxonomy Explorer v1) ────────────
// NOTE: This modal includes the Enable Features block (4 checkboxes) in step 1.

function csOpenModalTaxonomy() {
  if (document.getElementById('cs-modal')) return;
  csCurrentStep = 1;
  var modal = document.createElement('div');
  modal.id = 'cs-modal';
  modal.className = 'cs-modal-overlay';
  modal.innerHTML =
    '<div class="cs-modal" onclick="event.stopPropagation()">'

    // Header
    + '<div class="cs-modal-header">'
    +   '<div><div class="cs-modal-title">Request New Content</div>'
    +   '<div class="cs-modal-sub">Fill in the details below to submit your request</div></div>'
    +   '<button class="cs-modal-close" onclick="csCloseModal()">'
    +     '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    +   '</button>'
    + '</div>'

    // Stepper
    + '<div class="cs-stepper">'
    +   '<div class="cs-step cs-step--act" id="cs-step-ind-1"><div class="cs-step-circle"><span>1</span></div><div class="cs-step-label">Content</div></div>'
    +   '<div class="cs-step-line"></div>'
    +   '<div class="cs-step" id="cs-step-ind-2"><div class="cs-step-circle"><span>2</span></div><div class="cs-step-label">Processing</div></div>'
    +   '<div class="cs-step-line"></div>'
    +   '<div class="cs-step" id="cs-step-ind-3"><div class="cs-step-circle"><span>3</span></div><div class="cs-step-label">Add Ads (optional)</div></div>'
    + '</div>'

    // ── Step 1 body ──
    + '<div class="cs-modal-body" id="cs-step-body-1">'

    +   '<div class="cs-field"><div class="cs-field-row"><label class="cs-label">Requestor</label><span class="cs-field-note">Comes from the account</span></div>'
    +   '<input class="cs-input cs-input--disabled" type="text" value="Marika Roque" disabled></div>'

    +   '<div class="cs-field"><label class="cs-label">Client Name</label>'
    +   '<input class="cs-input" type="text" placeholder="e.g. Nike, Unilever…"></div>'

    +   '<div class="cs-field"><label class="cs-label">Content Name</label>'
    +   '<input class="cs-input" id="cs-rt-content-name" type="text" placeholder="e.g. Below Deck S5E3…"></div>'


    +   '<div class="cs-field">'
    +     '<label class="cs-label">Enable Features</label>'
    +     '<div class="cs-features-grid">'
    +       '<label class="cs-feature-item"><input type="checkbox" class="cs-feature-cb"><span>Metadata analysis</span></label>'
    +       '<label class="cs-feature-item"><input type="checkbox" class="cs-feature-cb"><span>Moments analysis</span></label>'
    +       '<label class="cs-feature-item"><input type="checkbox" class="cs-feature-cb"><span>Taxonomy analysis</span></label>'
    +       '<label class="cs-feature-item"><input type="checkbox" class="cs-feature-cb"><span>Show / episodes analysis</span></label>'
    +     '</div>'
    +   '</div>'

    +   '<div class="cs-field">'
    +     '<div class="cs-field-row"><label class="cs-label">Content Upload <span class="cs-mandatory">*</span></label></div>'
    +     '<div class="cs-ads-toggle" style="margin-bottom:8px">'
    +       '<div class="cs-ads-btn cs-ads-btn--act" id="cs-content-upload-btn" onclick="csContentTab(\'upload\')">Upload</div>'
    +       '<div class="cs-ads-btn" id="cs-content-link-btn" onclick="csContentTab(\'link\')">Link</div>'
    +     '</div>'
    +     '<div id="cs-content-upload">'
    +       '<div class="cs-upload-area" id="cs-upload-label" onclick="csFakeUpload()">'
    +         '<div id="cs-upload-idle" style="display:flex;flex-direction:column;align-items:center;gap:6px">'
    +           '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" style="color:var(--muted)"><path d="M12 16V8m0 0-3 3m3-3 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" stroke-width="1.5"/></svg>'
    +           '<div class="cs-upload-text">Click to upload a video file</div>'
    +           '<div class="cs-upload-hint">MP4, MOV, AVI, MKV…</div>'
    +         '</div>'
    +         '<div id="cs-upload-chosen" style="display:none;align-items:center;gap:8px;justify-content:center">'
    +           '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="color:#2EAD4B;flex-shrink:0"><path d="M4 10l4 4 8-8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +           '<span id="cs-upload-filename" class="cs-upload-text" style="color:var(--text)"></span>'
    +           '<span class="cs-upload-hint" id="cs-upload-filesize"></span>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +     '<div id="cs-content-link" style="display:none">'
    +       '<input class="cs-input" id="cs-link-input" type="url" placeholder="https://…" style="width:100%;box-sizing:border-box">'
    +     '</div>'
    +   '</div>'

    + '</div>'

    // ── Step 2 body — Processing ──
    + '<div class="cs-modal-body" id="cs-step-body-2" style="display:none;gap:16px">'

    +   '<div class="cs-proc-preview">'
    +     '<div class="cs-proc-thumb">'
    +       '<div class="cs-proc-thumb-inner">'
    +         '<svg width="38" height="38" viewBox="0 0 24 24" fill="none" style="color:rgba(255,255,255,.55)"><rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" stroke-width="1.3"/><path d="M9 8.5l6 3.5-6 3.5V8.5z" fill="currentColor"/><path d="M2 8h2M20 8h2M2 16h2M20 16h2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>'
    +       '</div>'
    +     '</div>'
    +     '<div class="cs-proc-meta">'
    +       '<div style="display:flex;align-items:center;gap:6px">'
    +         '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" style="color:var(--muted);flex-shrink:0"><rect x="2" y="1" width="9" height="14" rx="2" stroke="currentColor" stroke-width="1.3"/><path d="M5 6h4M5 9h3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M11 1v4h4" stroke="currentColor" stroke-width="1.2"/><path d="M11 1l4 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +         '<span class="cs-proc-fname">sample_ad_creative.mp4</span>'
    +       '</div>'
    +       '<span class="cs-proc-fsize">47.3 MB &nbsp;·&nbsp; MP4 &nbsp;·&nbsp; HD 1080p</span>'
    +     '</div>'
    +   '</div>'

    +   '<div class="cs-proc-bar-section">'
    +     '<div class="cs-proc-bar-header">'
    +       '<span class="cs-proc-status-label" id="cs-proc-status-text">Preparing analysis…</span>'
    +       '<span class="cs-proc-pct-badge" id="cs-proc-pct">0%</span>'
    +     '</div>'
    +     '<div class="cs-proc-bar-track"><div class="cs-proc-bar-fill" id="cs-proc-bar" style="width:0%"></div></div>'
    +   '</div>'

    +   '<div class="cs-proc-log" id="cs-proc-log"></div>'

    +   '<div id="cs-proc-success" style="display:none">'
    +     '<div class="cs-proc-success-box">'
    +       '<svg width="20" height="20" viewBox="0 0 34 34" fill="none" style="flex-shrink:0"><circle cx="17" cy="17" r="16" fill="rgba(46,173,75,.12)" stroke="#2EAD4B" stroke-width="1.5"/><path d="M10 17l5 5 9-9" stroke="#2EAD4B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +       '<div>'
    +         '<div class="cs-proc-success-title">Analysis Complete</div>'
    +         '<div class="cs-proc-success-sub">Content processed. Taxonomy signals extracted and catalogued.</div>'
    +       '</div>'
    +     '</div>'
    +   '</div>'

    + '</div>'

    // ── Step 3 body — Add Ads ──
    + '<div class="cs-modal-body" id="cs-step-body-3" style="display:none">'
    +   csStep3Html()
    + '</div>'

    // Footer
    + '<div class="cs-modal-footer">'
    +   '<button class="cs-btn-secondary" id="cs-modal-back-btn" style="display:none;margin-right:auto" onclick="csPrevStep()">← Back</button>'
    +   ''
    +   '<button class="cs-btn-primary" id="cs-modal-next-btn" onclick="csNextStep()">Next</button>'
    + '</div>'

    + '</div>';

  modal.addEventListener('click', csCloseModal);
  document.body.appendChild(modal);
  // Hide Enable Features on Metadata Analysis page
  if (typeof activeId !== 'undefined' && activeId === 'metadata-analysis') {
    var featField = modal.querySelector('.cs-features-grid');
    if (featField && featField.parentElement) featField.parentElement.style.display = 'none';
  }
  setTimeout(function() { modal.classList.add('cs-modal-overlay--in'); }, 10);
}

// ── Process Flow ──────────────────────────────────────────────────────────
var WF_ACTORS = {
  sales:   { label:'Sales',         color:'#ED005E', bg:'rgba(237,0,94,.1)'   },
  product: { label:'Product / Tech', color:'#4F6CF7', bg:'rgba(79,108,247,.1)' },
  xts:     { label:'XTS',           color:'#0D9488', bg:'rgba(13,148,136,.1)' },
  auto:    { label:'Automated',     color:'#8B5CF6', bg:'rgba(139,92,246,.1)' },
};

var WF_STEPS = [
  {
    actors: ['sales'],
    title:  'New Content Request',
    desc:   'Sales Team (Marika, Ryan, etc.) requests new content via the Dashboard by compiling the Modal Form.'
  },
  {
    actors: ['auto'],
    title:  'Automated Notification',
    desc:   'The request is submitted to the Product Team via automated Jira Ticket + Email.'
  },
  {
    actors: ['product'],
    title:  'Data Package Production',
    desc:   'Product Team (Bruna + Grant + Ben) produces the Data Package: Original Content + JSONs; Ads Creation + JSONs.'
  },
  {
    actors: ['product'],
    title:  'Google Drive Storage',
    desc:   'The Data Package is stored on the Google Drive folder following the defined naming path / structure.'
  },
  {
    actors: ['product'],
    title:  'Delivery to XTS',
    desc:   'The Data Package is delivered to XTS.'
  },
  {
    actors: ['product','xts'],
    title:  'Upload Planning',
    desc:   'The upload is planned in a hybrid SCRUM / Kanban way, prioritised against ongoing development work and desired delivery date.'
  },
  {
    actors: ['product','sales'],
    title:  'SLA Returned',
    desc:   'An SLA is returned to the Sales Team.'
  },
  {
    actors: ['product','xts','sales'],
    title:  'Deploy & Notification',
    desc:   'New Data Package is deployed and the Sales Team is notified by Product.'
  },
];

function csBackToGrid() {
  var panelKey = csDetailViewPanel;
  if (panelKey === 'manual') {
    var panel = document.getElementById('sdt-panel-manual');
    if (!panel) return;
    panel.innerHTML =
      '<div class="cs-toggle-sticky"><div class="cs-view-toggle">'
      + '<div class="cs-view-btn cs-view-btn--act" id="cs-vbtn-mockup" onclick="csView(\'mockup\')">Mockup</div>'
      + '<div class="cs-view-btn" id="cs-vbtn-process" onclick="csView(\'process\')">Process</div>'
      + '</div></div>'
      + '<div id="cs-view-mockup">'
      + '<div class="cs-card"><div class="cs-title">Content Selection</div>'
      + '<div class="cs-toolbar"><div class="cs-filter-wrap"><div class="cs-filter-label">Category</div>'
      + '<select class="cs-filter-select" onchange="csFilter(this.value)">'
      + '<option value="all">All</option><option value="comedy">Comedy</option>'
      + '<option value="drama">Drama</option><option value="reality">Reality</option>'
      + '<option value="documentary">Documentary</option></select></div>'
      + '<button class="cs-request-btn" onclick="csOpenModal()">'
      + '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
      + ' Request New Content</button></div>'
      + '<div class="cs-grid" id="cs-grid"></div></div></div>'
      + '<div id="cs-view-process" style="display:none"><div id="cs-process-container"></div></div>';
    csRender();
    csRenderProcess();
  } else if (panelKey === 'taxonomy2') {
    if (typeof activeId !== 'undefined' && activeId === 'metadata-analysis') {
      // Metadata Analysis page: re-render the plain grid (no dashboard shell)
      var panel2 = document.getElementById('sdt-panel-taxonomy2');
      if (panel2) {
        panel2.innerHTML =
          '<div class="cs-card">'
          + '<div class="cs-toolbar"><div class="cs-filter-wrap"><div class="cs-filter-label">Category</div>'
          + '<select class="cs-filter-select" onchange="csTx2Filter(this.value)">'
          + '<option value="all">All</option><option value="comedy">Comedy</option>'
          + '<option value="drama">Drama</option><option value="reality">Reality</option>'
          + '<option value="documentary">Documentary</option></select></div>'
          + '<button class="cs-request-btn" onclick="csOpenModalTaxonomy()">'
          + '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
          + ' Add New Content</button></div>'
          + '<div class="cs-grid" id="cs-grid5"></div>'
          + '</div>';
        csTx2Render();
      }
      var pgname = document.getElementById('content-bc');
      if (pgname) pgname.textContent = 'Metadata Analysis';
    } else {
      // Dashboard shell stays — restore content area to "Metadata Analysis" tab
      csTx2NavTab('metadata');
    }
  } else {
    csBackToGrid3();
  }
}

// ── Detail view (NEW item) ────────────────────────────────────────────────

var csDetailPanels3 = { tax: true, prod: true, json: true };
var csDetailViewPanel = 'realtime'; // tracks which panel is currently showing the detail view

var CS_DETAIL_SCENES = [
  { scene: 2,  tax: 'IAB Taxonomy', badge: 'Real Estate Buying and Selling (0.80)', extra: 'Music Emotion:', extra2: 'Dreamy (0.95)' },
  { scene: 5,  tax: 'IAB Taxonomy', badge: 'Real Estate (0.85)',                   extra: 'Considered: Travel<br>Music Emotion:', extra2: 'Dreamy (0.99)' },
  { scene: 7,  tax: 'IAB Taxonomy', badge: 'Remodeling &amp; Construction (0.78)',  extra: 'Music Emotion:', extra2: 'Energizing, pump-up (0.90)' },
  { scene: 8,  tax: 'IAB Taxonomy', badge: 'Home &amp; Garden (0.82)',              extra: 'Music Emotion:', extra2: 'Happy (0.88)' },
  { scene: 11, tax: 'IAB Taxonomy', badge: 'DIY &amp; Home Improvement (0.91)',     extra: 'Music Emotion:', extra2: 'Motivating (0.92)' },
];

var CS_DETAIL_PRODUCTS = [
  { name: '8 ft. Fiberglass Step Ladder (12 ft. Reach Height) with 250 lb. Load Capacity Type I Duty Rating', detected: 'Ladder (90% confidence)', price: '$169.00', scene: 'Scene 7 – 00:30', emoji: '🪜' },
  { name: 'Adjustable Electricians Work Waist Tool Belt',                                                      detected: 'Belt (80% confidence)',   price: '$114.00', scene: 'Scene 7 – 00:30', emoji: '🔧' },
  { name: '5 ft. Yellow Fiberglass Step Ladder with 375 lb. Load Capacity Type IAA Duty Rating',               detected: 'Ladder (90% confidence)', price: '$89.00',  scene: 'Scene 9 – 01:14', emoji: '🪜' },
  { name: 'Professional 25 ft. Power Drill Driver Kit with Carrying Case',                                     detected: 'Tool (75% confidence)',    price: '$234.00', scene: 'Scene 11 – 02:03', emoji: '🔩' },
];

var CS_DETAIL_JSON = `{
  "video_id": "DHYH1_111H_RIDO111H_CL",
  "duration_in_seconds": 2655.061333,
  "aspect_ratio": "16:9",
  "video_metadata": {
    "garm_category": [
      {
        "id": "G7",
        "name": "Obscenity & Profanity",
        "risk_level": "Medium",
        "confidence": 0.85,
        "count": 1,
        "screen_time": 4.796,
        "screen_time_percentage": 0.0
      },
      {
        "id": "G14",
        "name": "Violence",
        "risk_level": "Medium",
        "confidence": 0.8,
        "count": 1,
        "screen_time": 1.668,
        "screen_time_percentage": 0.0
      }
    ],
    "iab_category": [
      { "id": "IAB1", "name": "Arts & Entertainment", "confidence": 0.92 },
      { "id": "IAB10", "name": "Home & Garden",        "confidence": 0.88 }
    ]
  }
}`;

function csShowDetailView(panelKey, item) {
  // For taxonomy2 the dashboard shell (topbar + sidebar) stays put;
  // we only swap out the content area.
  var isTax2 = panelKey === 'taxonomy2';

  var panelId = panelKey === 'manual'   ? 'sdt-panel-manual'
              : panelKey === 'taxonomy2' ? 'sdt-panel-taxonomy2'
              : 'sdt-panel-realtime';
  var panel = document.getElementById(panelId);
  if (!panel) return;

  // For taxonomy2 target only the inner content area
  var renderTarget = isTax2
    ? (document.getElementById('tx2-content-area') || panel)
    : panel;

  csDetailViewPanel = panelKey;
  csDetailPanels3 = { tax: true, prod: true, json: true };

  var txTabNav  = '';
  var metaOpen  = '';
  var metaClose = '';

  var TH = 'padding:9px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);border-bottom:1px solid var(--border)';
  var thumbSeed = 'kervshow' + (item ? (item.id || 1) : 1);

  // Build the shared detail view card HTML
  var detailCard =
    // ── Mockup / Process toggle — hidden for taxonomy2 ──
    (isTax2 ? '' :
      '<div class="cs-toggle-sticky">'
      + '<div class="cs-view-toggle">'
      +   '<div class="cs-view-btn cs-view-btn--act" id="cs-dv-vbtn-mockup" onclick="csDvToggleView(\'mockup\')">Mockup</div>'
      +   '<div class="cs-view-btn" id="cs-dv-vbtn-process" onclick="csDvToggleView(\'process\')">Process</div>'
      + '</div>'
      + '</div>'
    )

    // ── Mockup view wrapper (tax/tax2: no wrapper; others: wrapped for toggle) ──
    + (isTax2 ? '' : '<div id="cs-dv-view-mockup">')
    // tax2: plain div — no card border/padding (dashboard shell already provides the container)
    // others: full cs-card with border, bg and padding
    + (isTax2
        ? '<div style="display:flex;flex-direction:column;gap:14px">'
        : '<div class="cs-card" style="display:flex;flex-direction:column;gap:14px">'
      )

    // Top bar
    + '<div class="cs-dv-topbar">'
    +   '<button class="cs-dv-back" onclick="csBackToGrid()">'
    +     '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +     ' BACK TO CONTENT SELECTION'
    +   '</button>'
    +   '<span class="cs-dv-title" id="cs-dv-title">VOD: EXACT PRODUCT MATCH – SYNC L BAR</span>'
    +   '<button class="cs-dv-collapse">'
    +     '<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 6l5-4 5 4M3 10l5 4 5-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +   '</button>'
    + '</div>'

    // Tab nav (taxonomy only)
    + txTabNav

    // Open metadata content wrapper (taxonomy only)
    + metaOpen

    // Settings row
    + '<div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-end">'
    +   '<div class="cs-field"><label class="cs-label">Tier Selection</label>'
    +     '<select class="cs-dv-select" onchange="csDvUpdateTitle()" id="cs-dv-tier" style="min-width:170px">'
    +       '<option>Exact Product Match</option><option>Contextual Match</option><option>Audience Match</option>'
    +     '</select></div>'
    +   '<div class="cs-field"><label class="cs-label">Ad Playback Mode</label>'
    +     '<select class="cs-dv-select" onchange="csDvUpdateTitle()" id="cs-dv-mode" style="min-width:150px">'
    +       '<option>Sync L Bar</option><option>Pre-roll</option><option>Mid-roll</option><option>Overlay</option>'
    +     '</select></div>'
    + '</div>'

    // Main block — height fills viewport
    + '<div style="display:flex;border:1px solid var(--border);border-radius:8px;overflow:hidden;height:calc(100vh - ' + (isTax2 ? '320' : '380') + 'px);min-height:240px">'

    //   Video column: white bg, 16:9 photo at top (narrower in tax2 to fit without scroll)
    +   '<div style="width:' + (isTax2 ? '180' : '220') + 'px;flex-shrink:0;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column">'
    //     16:9 box with real photo + overlay
    +     '<div style="width:100%;position:relative;padding-top:56.25%;overflow:hidden;flex-shrink:0">'
    +       '<img src="https://picsum.photos/seed/homeremodel/440/248" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block" alt="">'
    //       dark gradient overlay (bottom) + play button
    +       '<div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.55) 0%,transparent 50%)">'
    +         '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">'
    +           '<div style="width:34px;height:34px;border-radius:50%;background:rgba(0,0,0,.35);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center">'
    +             '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" style="color:#fff;margin-left:2px"><path d="M4 3l9 5-9 5V3z" fill="currentColor"/></svg>'
    +           '</div>'
    +         '</div>'
    +         '<div style="position:absolute;bottom:0;left:0;right:0;display:flex;align-items:center;gap:5px;padding:5px 7px">'
    +           '<svg width="10" height="10" viewBox="0 0 16 16" fill="none" style="color:rgba(255,255,255,.85);flex-shrink:0"><path d="M4 3l9 5-9 5V3z" fill="currentColor"/></svg>'
    +           '<span style="font-size:9px;color:rgba(255,255,255,.7)">0:00</span>'
    +           '<div style="flex:1;height:2px;background:rgba(255,255,255,.25);border-radius:1px"><div style="width:1%;height:100%;background:var(--accent);border-radius:1px"></div></div>'
    +           '<span style="font-size:9px;color:rgba(255,255,255,.7)">44:15</span>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +   '</div>'

    //   Panels
    +   '<div style="display:flex;flex:1;overflow-x:auto;overflow-y:hidden" id="cs-dv-panels">'
    +     csDvTaxPanel() + csDvProdPanel() + csDvJsonPanel()
    +   '</div>'

    + '</div>'

    // Panel toggle bar (icons only)
    + '<div style="display:flex;justify-content:center;gap:6px">'
    +   '<button class="cs-dv-tog cs-dv-tog--act" id="cs-dvtog-tax"  onclick="csDvToggle(\'tax\')">'
    +     '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="13" cy="8" r="2" stroke="currentColor" stroke-width="1.2"/></svg>'
    +   '</button>'
    +   '<button class="cs-dv-tog cs-dv-tog--act" id="cs-dvtog-prod" onclick="csDvToggle(\'prod\')">'
    +     '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 3h2l2 7h6l2-5H6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8" cy="13" r="1" fill="currentColor"/><circle cx="12" cy="13" r="1" fill="currentColor"/></svg>'
    +   '</button>'
    +   '<button class="cs-dv-tog cs-dv-tog--act" id="cs-dvtog-json" onclick="csDvToggle(\'json\')">'
    +     '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M4 5c-1 0-2 .5-2 1.5v1c0 .8-.5 1.5-.5 1.5s.5.7.5 1.5v1C2 12.5 3 13 4 13M12 5c1 0 2 .5 2 1.5v1c0 .8.5 1.5.5 1.5s-.5.7-.5 1.5v1C14 12.5 13 13 12 13M9 4l-2 8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>'
    +   '</button>'
    + '</div>'

    + '</div>' // close cs-card
    + (isTax2 ? '' : '</div>') // close cs-dv-view-mockup

    // ── Process view — not shown for taxonomy2 ──
    + (isTax2 ? '' :
        '<div id="cs-dv-view-process" style="display:none">'
        + '<div id="cs-process-container3"></div>'
        + '</div>'
      );

  // Inject into the correct target
  renderTarget.innerHTML = detailCard;

  // Metadata Analysis page: update breadcrumb
  if (typeof activeId !== 'undefined' && activeId === 'metadata-analysis') {
    var pgname = document.getElementById('content-bc');
    if (pgname) pgname.innerHTML =
      '<span style="font-weight:400;opacity:.55;cursor:pointer" onclick="csBackToGrid()">Metadata Analysis</span>'
      + ' &nbsp;/&nbsp; ' + (item ? item.title : '');
  }

  if (!isTax2) csRenderProcess3();
  // Ensure taxonomy-explorer styles are available when viewing tab 4/5 detail
  if ((panelKey === 'taxonomy' || panelKey === 'taxonomy2') && typeof txInjectStyles === 'function') txInjectStyles();
}

function csDvToggleView(view) {
  ['mockup', 'process'].forEach(function(v) {
    var btn = document.getElementById('cs-dv-vbtn-' + v);
    var pnl = document.getElementById('cs-dv-view-' + v);
    if (btn) btn.className = 'cs-view-btn' + (v === view ? ' cs-view-btn--act' : '');
    if (pnl) pnl.style.display = v === view ? '' : 'none';
  });
}

function csDvTab(tab) {
  ['metadata', 'moments', 'taxonomies', 'episodes'].forEach(function(t) {
    var btn = document.getElementById('cs-dv-tab-' + t);
    if (btn) btn.className = 'cs-dv-tab' + (t === tab ? ' cs-dv-tab--act' : '');
  });

  // Metadata tab: show metadata panel, hide the sidebar+tabs wrapper
  var metaPanel = document.getElementById('cs-dv-tab-content-metadata');
  var wrap      = document.getElementById('cs-dv-tax-content-wrap');
  if (tab === 'metadata') {
    if (metaPanel) metaPanel.style.display = '';
    if (wrap)      wrap.style.display = 'none';
  } else {
    if (metaPanel) metaPanel.style.display = 'none';
    if (wrap)      wrap.style.display = 'flex';
    // Switch the inner panels
    ['moments', 'taxonomies', 'episodes'].forEach(function(t) {
      var content = document.getElementById('cs-dv-tab-content-' + t);
      if (content) content.style.display = t === tab ? '' : 'none';
    });
  }

  if (tab === 'moments')    { txCustomSelections = []; txRenderCategories(); }
  if (tab === 'taxonomies') { txCustomActiveTab = 'emotion'; txCustomCurrentPage = 1; txCustomRenderTable(); txRenderChips(); }
  if (tab === 'episodes')   txRenderEpisodes();
}

function csDvUpdateTitle() {
  var tier = document.getElementById('cs-dv-tier');
  var mode = document.getElementById('cs-dv-mode');
  var el   = document.getElementById('cs-dv-title');
  if (el && tier && mode) el.textContent = 'VOD: ' + tier.value.toUpperCase() + ' – ' + mode.value.toUpperCase();
}

function csDvTaxPanel() {
  return '<div class="cs-dv-panel" id="cs-dv-panel-tax">'
    + '<div class="cs-dv-panel-hd">'
    +   '<div style="display:flex;align-items:center;gap:7px"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="13" cy="8" r="2" stroke="currentColor" stroke-width="1.2"/></svg><span>Taxonomies</span></div>'
    +   '<div style="display:flex;gap:4px"><button class="cs-dv-panel-ico" title="Expand">⤢</button><button class="cs-dv-panel-ico cs-dv-panel-ico--red" onclick="csDvToggle(\'tax\')" title="Close">✕</button></div>'
    + '</div>'
    + '<div class="cs-dv-panel-sub">'
    +   '<select class="cs-dv-select" style="width:100%"><option>IAB Taxonomy</option><option>Brand Safety</option><option>Custom Moments</option></select>'
    + '</div>'
    + '<div class="cs-dv-panel-body">'
    + CS_DETAIL_SCENES.map(function(sc) {
        return '<div class="cs-dv-scene">'
          + '<div class="cs-dv-scene-num">Scene ' + sc.scene + '</div>'
          + '<div class="cs-dv-scene-tax">' + sc.tax + '</div>'
          + '<div class="cs-dv-scene-badge">' + sc.badge + '</div>'
          + '<div class="cs-dv-scene-meta">' + sc.extra + '</div>'
          + '<div class="cs-dv-scene-meta cs-dv-scene-meta--val">' + sc.extra2 + '</div>'
          + '</div>';
      }).join('')
    + '</div>'
    + '</div>';
}

function csDvProdPanel() {
  return '<div class="cs-dv-panel" id="cs-dv-panel-prod">'
    + '<div class="cs-dv-panel-hd">'
    +   '<div style="display:flex;align-items:center;gap:7px"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 3h2l2 7h6l2-5H6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8" cy="13" r="1" fill="currentColor"/><circle cx="12" cy="13" r="1" fill="currentColor"/></svg><span>Products</span></div>'
    +   '<div style="display:flex;gap:4px"><button class="cs-dv-panel-ico" title="Expand">⤢</button><button class="cs-dv-panel-ico cs-dv-panel-ico--red" onclick="csDvToggle(\'prod\')" title="Close">✕</button></div>'
    + '</div>'
    + '<div class="cs-dv-panel-body" style="padding-top:4px">'
    + CS_DETAIL_PRODUCTS.map(function(p) {
        return '<div class="cs-dv-product">'
          + '<div class="cs-dv-prod-img">' + p.emoji + '</div>'
          + '<div class="cs-dv-prod-info">'
          +   '<div class="cs-dv-prod-name">' + p.name + '</div>'
          +   '<div class="cs-dv-prod-det">Detected: ' + p.detected + '</div>'
          +   '<div class="cs-dv-prod-price">' + p.price + '</div>'
          +   '<div class="cs-dv-prod-scene">' + p.scene + '</div>'
          + '</div>'
          + '</div>';
      }).join('')
    + '</div>'
    + '</div>';
}

function csDvJsonPanel() {
  var html = CS_DETAIL_JSON
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"([^"]+)":/g, '<span class="cs-dv-json-key">"$1"</span>:')
    .replace(/:\s*"([^"]+)"/g, ': <span class="cs-dv-json-str">"$1"</span>')
    .replace(/:\s*(\d[\d.]*)/g, ': <span class="cs-dv-json-num">$1</span>');

  return '<div class="cs-dv-panel cs-dv-panel--dark cs-dv-panel--last" id="cs-dv-panel-json">'
    + '<div class="cs-dv-panel-hd cs-dv-panel-hd--dark">'
    +   '<div style="display:flex;align-items:center;gap:7px"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 5c-1 0-2 .5-2 1.5v1c0 .8-.5 1.5-.5 1.5s.5.7.5 1.5v1C2 12.5 3 13 4 13M12 5c1 0 2 .5 2 1.5v1c0 .8.5 1.5.5 1.5s-.5.7-.5 1.5v1C14 12.5 13 13 12 13M9 4l-2 8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg><span>{} JSON</span></div>'
    +   '<div style="display:flex;gap:4px">'
    +     '<button class="cs-dv-panel-ico cs-dv-panel-ico--dm" title="Expand">⤢</button>'
    +     '<button class="cs-dv-panel-ico cs-dv-panel-ico--dm" title="Download">⬇</button>'
    +     '<button class="cs-dv-panel-ico cs-dv-panel-ico--dm" onclick="csDvToggle(\'json\')" title="Close">✕</button>'
    +   '</div>'
    + '</div>'
    + '<div class="cs-dv-panel-body cs-dv-panel-body--dark">'
    +   '<pre class="cs-dv-json-pre">' + html + '</pre>'
    + '</div>'
    + '</div>';
}

function csDvToggle(key) {
  csDetailPanels3[key] = !csDetailPanels3[key];
  var panel = document.getElementById('cs-dv-panel-' + key);
  var tog   = document.getElementById('cs-dvtog-' + key);
  if (panel) panel.style.display = csDetailPanels3[key] ? '' : 'none';
  if (tog)   tog.classList.toggle('cs-dv-tog--act', csDetailPanels3[key]);
}

// ── Panel helpers (Taxonomy Explorer / Metadata Analysis) ───────────────

var csActiveTx2Filter  = 'all';
var csSelectedTx2Id    = 1;

function csTx2View(view) {
  ['mockup','process'].forEach(function(v) {
    var btn   = document.getElementById('cs-vbtn5-' + v);
    var panel = document.getElementById('cs-view5-' + v);
    if (btn)   btn.className       = 'cs-view-btn' + (v === view ? ' cs-view-btn--act' : '');
    if (panel) panel.style.display = v === view ? '' : 'none';
  });
}

function csTx2NavTab(tab) {
  // Update sidebar active state
  ['metadata', 'taxonomy'].forEach(function(t) {
    var el = document.getElementById('tx2-nav-' + t);
    if (el) el.className = 'tx2-nav-item' + (t === tab ? ' tx2-nav-item--act' : '');
  });

  var ca = document.getElementById('tx2-content-area');
  if (!ca) return;

  if (tab === 'metadata') {
    // Restore Content Selection grid
    ca.innerHTML =
        '<div class="cs-title" style="margin-bottom:16px">Content Selection</div>'
      + '<div class="cs-toolbar"><div class="cs-filter-wrap"><div class="cs-filter-label">Category</div>'
      + '<select class="cs-filter-select" onchange="csTx2Filter(this.value)">'
      + '<option value="all">All</option><option value="comedy">Comedy</option>'
      + '<option value="drama">Drama</option><option value="reality">Reality</option>'
      + '<option value="documentary">Documentary</option></select></div>'
      + '<button class="cs-request-btn" onclick="csOpenModalTaxonomy()">'
      + '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
      + ' Request New Content</button></div>'
      + '<div class="cs-grid" id="cs-grid5"></div>';
    csTx2Render();
  }
}
function csTx2Filter(val) {
  csActiveTx2Filter = val;
  csTx2Render();
}

function csTx2Select(id) {
  // New items (id >= 900)
  var newIt = csNewItems3.filter(function(s) { return s.id === id; })[0];
  if (newIt) {
    csShowDetailView('taxonomy2', {
      id: newIt.id, title: newIt.title, initials: newIt.initials, grad: newIt.grad,
      category: 'drama', badge: null
    });
    return;
  }
  if (id <= 3) {
    var it = CS_SHOWS.filter(function(s) { return s.id === id; })[0];
    if (it) { csShowDetailView('taxonomy2', it); return; }
  }
  csSelectedTx2Id = id;
  csTx2Render();
}

function csTx2Render() {
  var grid = document.getElementById('cs-grid5');
  if (!grid) return;
  var shows = CS_SHOWS.filter(function(s) {
    return csActiveTx2Filter === 'all' || s.category === csActiveTx2Filter;
  });
  var newHtml = csNewItems3.map(function(s) {
    var sel = s.id === csSelectedTx2Id;
    return '<div class="cs-thumb' + (sel ? ' cs-thumb--sel' : '') + '" data-new-thumb="' + s.id + '" onclick="csTx2Select(' + s.id + ')">'
      + '<div class="cs-poster" style="background:' + s.grad + '">'
      + '<span class="cs-poster-initials" style="color:rgba(0,0,0,.35)">' + s.initials + '</span>'
      + '<div class="cs-badge cs-badge--new">NEW</div>'
      + '</div>'
      + '<div class="cs-thumb-title">' + s.title + '</div>'
      + '</div>';
  }).join('');
  var existingHtml = shows.map(function(s) {
    var sel   = s.id === csSelectedTx2Id;
    var badge = s.badge ? '<div class="cs-badge">' + s.badge + '</div>' : '';
    return '<div class="cs-thumb' + (sel ? ' cs-thumb--sel' : '') + '" onclick="csTx2Select(' + s.id + ')">'
      + '<div class="cs-poster" style="background:' + s.grad + '">'
      + '<span class="cs-poster-initials">' + s.initials + '</span>'
      + badge
      + '</div>'
      + '<div class="cs-thumb-title">' + s.title + '</div>'
      + '</div>';
  }).join('');
  grid.innerHTML = newHtml + existingHtml;
}

function sdtInjectStyles() {
  if (document.getElementById('sdt-styles')) return;
  var s = document.createElement('style');
  s.id = 'sdt-styles';
  s.textContent = `
    .tx-bc-link { font-size:12px; color:var(--muted); cursor:pointer; transition:color .15s; }
    .tx-bc-link:hover { color:var(--accent); }

    /* Sidebar shell */
    .sdt-sb {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 6px;
      transition: width .2s;
    }
    .sdt-sb-divider {
      height: 1px;
      background: var(--border);
      margin: 4px 6px;
      transition: margin .2s;
    }
    .sdt-sb-tog {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 28px;
      margin-top: 4px;
      border-radius: 6px;
      cursor: pointer;
      color: var(--faint);
      transition: background .13s, color .13s;
    }
    .sdt-sb-tog:hover { background: var(--bg); color: var(--muted); }

    /* Nav items */
    .sdt-nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: background .13s;
      margin-bottom: 2px;
      overflow: hidden;
    }
    .sdt-nav-item:hover { background: var(--bg); }
    .sdt-nav-item--act  { background: var(--subtle); }
    .sdt-nav-item--act .sdt-nav-num   { background: var(--accent); color: #fff; }
    .sdt-nav-item--act .sdt-nav-label { color: var(--accent); }
    .sdt-nav-num {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--bg);
      color: var(--muted);
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background .13s, color .13s;
    }
    .sdt-nav-text {
      overflow: hidden;
      transition: opacity .15s, max-width .2s;
      max-width: 180px;
      white-space: nowrap;
    }
    .sdt-nav-label {
      font-size: 12px;
      font-weight: 500;
      color: var(--text);
      line-height: 1.3;
      transition: color .13s;
    }
    .sdt-nav-sub {
      font-size: 11px;
      color: var(--faint);
      line-height: 1.2;
    }

    /* Collapsed state */
    .sdt-sb--col .sdt-nav-item { padding: 10px 0; justify-content: center; gap: 0; }
    .sdt-sb--col .sdt-nav-text { opacity: 0; max-width: 0; }
    .sdt-sb--col .sdt-sb-divider { margin: 4px 8px; }

    .sdt-panel-title {
      font-size: 15px;
      font-weight: 500;
      letter-spacing: -.3px;
      margin-bottom: 6px;
    }
    .sdt-panel-sub {
      font-size: 13px;
      color: var(--muted);
    }

    /* Content Selection */
    .cs-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
    }
    .cs-toolbar {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 20px;
      gap: 12px;
    }
    .cs-request-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      height: 28px;
      padding: 0 10px;
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      white-space: nowrap;
      transition: opacity .15s;
      flex-shrink: 0;
    }
    .cs-request-btn:hover { opacity: .88; }
    .cs-view-toggle {
      display: flex;
      gap: 2px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 3px;
      width: fit-content;
    }
    .cs-view-btn {
      height: 28px;
      padding: 0 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      color: var(--muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: background .13s, color .13s;
      user-select: none;
    }
    .cs-view-btn:hover { color: var(--text); }
    .cs-view-btn--act {
      background: var(--bg);
      color: var(--text);
      box-shadow: 0 1px 3px rgba(0,0,0,.07);
    }

    /* Taxonomy v2 detail view: panels shrink to fit, no horizontal scroll */
    #tx2-content-area .cs-dv-panel { min-width: 0; }

    /* ── Taxonomy Explorer: Upload form ── */
    .tx2-upload-wrap {
      max-width: 540px;
      margin: 0 auto;
      padding: 8px 0 24px;
    }
    .tx2-opt-row {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    .tx2-opt {
      flex: 1;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 7px;
      padding: 9px 12px;
      border: 1.5px solid var(--border-md);
      border-radius: 8px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      color: var(--muted);
      transition: border-color .15s, background .15s, color .15s;
      user-select: none;
      white-space: nowrap;
    }
    .tx2-opt:hover { border-color: var(--accent); color: var(--text); background: var(--bg); }
    .tx2-opt--act  { border-color: var(--accent); color: var(--accent); background: rgba(237,0,94,.04); }
    .tx2-seg {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      height: 30px;
      padding: 0 10px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 11px;
      font-weight: 500;
      color: var(--muted);
      transition: background .13s, color .13s;
      user-select: none;
      white-space: nowrap;
    }
    .tx2-seg:hover { color: var(--text); }
    .tx2-seg--act  { background: var(--surface); color: var(--accent); box-shadow: 0 1px 3px rgba(0,0,0,.07); }
    .tx2-upload-zone {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      padding: 32px 20px;
      border: 1.5px dashed var(--border-md);
      border-radius: 10px;
      cursor: pointer;
      background: var(--bg);
      text-align: center;
      transition: border-color .15s, background .15s;
    }
    .tx2-upload-zone:hover { border-color: var(--accent); background: rgba(237,0,94,.025); }

    /* ── Taxonomy Explorer: Library ── */
    .tx2-home-tab {
      font-size: 12px; font-weight: 500; color: var(--muted);
      padding: 8px 12px 9px; cursor: pointer; border-bottom: 2px solid transparent;
      margin-bottom: -1px; transition: color .15s;
    }
    .tx2-home-tab:hover { color: var(--text); }
    .tx2-home-tab--act  { color: var(--text); border-bottom-color: var(--accent); }

    .tx2-lib-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 10px;
      border-radius: 8px;
      cursor: pointer;
      transition: background .13s;
      border-bottom: 1px solid var(--border);
    }
    .tx2-lib-row:last-child { border-bottom: none; }
    .tx2-lib-row:hover { background: var(--bg); }
    .tx2-lib-icon {
      width: 30px;
      height: 30px;
      border-radius: 7px;
      background: var(--bg);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--muted);
      flex-shrink: 0;
    }
    .tx2-lib-load-btn {
      height: 26px;
      padding: 0 12px;
      border: 1px solid var(--border-md);
      border-radius: 6px;
      background: var(--surface);
      font-size: 11px;
      font-weight: 500;
      font-family: inherit;
      color: var(--muted);
      cursor: pointer;
      transition: border-color .13s, color .13s, background .13s;
    }
    .tx2-lib-load-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(237,0,94,.04); }

    /* ── Taxonomy Explorer: Progress ── */
    .tx2-progress-wrap {
      max-width: 400px;
      margin: 60px auto 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      text-align: center;
    }
    .tx2-progress-icon { position: relative; width: 64px; height: 64px; }
    .tx2-progress-icon svg { width: 64px; height: 64px; }
    .tx2-progress-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
      letter-spacing: -.3px;
    }
    .tx2-progress-step {
      font-size: 12px;
      color: var(--muted);
      min-height: 18px;
      transition: opacity .2s;
    }
    .tx2-progress-track {
      width: 100%;
      height: 6px;
      background: var(--bg);
      border-radius: 99px;
      overflow: hidden;
      border: 1px solid var(--border);
    }
    .tx2-progress-fill {
      height: 100%;
      background: var(--accent);
      border-radius: 99px;
      transition: width .1s linear;
    }
    .tx2-progress-pct {
      font-size: 11px;
      font-weight: 600;
      color: var(--accent);
      letter-spacing: .3px;
    }

    /* Taxonomies sub-nav: override tabs → buttons (detail view + sidebar Taxonomy Explorer view) */
    #cs-dv-tab-content-taxonomies .tx-ctabs-nav,
    #tx2-sub-content-taxonomies .tx-ctabs-nav {
      gap: 6px;
      flex-wrap: wrap;
      border-bottom: none;
      padding-bottom: 0;
      margin-bottom: 12px;
    }
    #cs-dv-tab-content-taxonomies .tx-ctab,
    #tx2-sub-content-taxonomies .tx-ctab {
      border: none;
      border-radius: 6px;
      background: var(--bg);
      padding: 4px 10px;
      height: auto;
      font-size: 11px;
      font-weight: 500;
      color: var(--muted);
      cursor: pointer;
      transition: background .13s, color .13s;
      margin-bottom: 0;
    }
    #cs-dv-tab-content-taxonomies .tx-ctab:hover,
    #tx2-sub-content-taxonomies .tx-ctab:hover {
      background: var(--subtle);
      color: var(--accent);
    }
    #cs-dv-tab-content-taxonomies .tx-ctab--act,
    #tx2-sub-content-taxonomies .tx-ctab--act {
      background: var(--subtle);
      color: var(--accent);
    }

    /* Taxonomy v2 dashboard: topbar */
    .tx2-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 18px;
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
      background: var(--surface);
    }
    .tx2-topbar-brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .tx2-logo-mark {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 13px;
      font-weight: 700;
      color: #fff;
      letter-spacing: -.5px;
      line-height: 1;
    }
    .tx2-topbar-title {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: -.3px;
      color: var(--text);
    }
    .tx2-topbar-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tx2-icon-btn {
      position: relative;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background .13s, color .13s, border-color .13s;
    }
    .tx2-icon-btn:hover { background: var(--surface); color: var(--text); border-color: var(--border-md); }
    .tx2-notif-dot {
      position: absolute;
      top: 6px;
      right: 7px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--accent);
      border: 1.5px solid var(--bg);
    }

    /* Taxonomy v2 dashboard: sidebar */
    .tx2-sidebar {
      width: 200px;
      flex-shrink: 0;
      background: var(--surface);
      padding: 12px 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .tx2-sidebar-section {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .8px;
      color: var(--faint);
      padding: 4px 10px 8px;
    }

    /* Taxonomy v2 sidebar nav items */
    .tx2-nav-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 9px 12px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      color: var(--muted);
      cursor: pointer;
      transition: background .13s, color .13s;
    }
    .tx2-nav-item:hover { background: var(--bg); color: var(--text); }
    .tx2-nav-item--act  { background: var(--subtle); color: var(--accent); }

    /* Detail view tab nav (Taxonomy Explorer v1) */
    .cs-dv-tabnav {
      display: flex;
      gap: 2px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 2px;
    }
    .cs-dv-tab {
      height: 34px;
      padding: 0 16px;
      border: none;
      background: none;
      font-size: 13px;
      font-weight: 500;
      font-family: inherit;
      color: var(--muted);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      transition: color .13s, border-color .13s;
      white-space: nowrap;
    }
    .cs-dv-tab:hover { color: var(--text); }
    .cs-dv-tab--act  { color: var(--accent); border-bottom-color: var(--accent); }
    /* AI conversational params */
    .ai-trigger {
      display: inline; cursor: pointer; padding: 0 2px; border-radius: 2px;
      color: #bbb; font-weight: 500;
      text-decoration: underline dotted #bbb;
      text-underline-offset: 2px;
      transition: color .15s, background .15s, text-decoration-color .15s;
    }
    .ai-trigger:hover { color: #e11d8f; text-decoration-color: #e11d8f; background: #fdf2f8; }
    .ai-trigger--set  { color: #e11d8f; font-weight: 600; text-decoration: underline solid #e11d8f; text-underline-offset: 2px; }
    .ai-trigger--set:hover { background: #fdf2f8; }
    /* Dual range slider */
    .ai-range {
      position: absolute; width: 100%; height: 100%; top: 0; margin: 0; padding: 0;
      background: transparent; border: none; outline: none; pointer-events: none;
      -webkit-appearance: none; appearance: none;
    }
    .ai-range::-webkit-slider-thumb {
      -webkit-appearance: none; appearance: none; pointer-events: all;
      width: 16px; height: 16px; border-radius: 50%;
      background: #e11d8f; cursor: pointer;
      box-shadow: 0 1px 4px rgba(225,29,143,.35);
      border: 2px solid #fff;
    }
    .ai-range::-moz-range-thumb {
      pointer-events: all; width: 14px; height: 14px; border-radius: 50%;
      background: #e11d8f; cursor: pointer; border: 2px solid #fff;
      box-shadow: 0 1px 4px rgba(225,29,143,.35);
    }
    .ai-mode-btn {
      flex: 1; height: 26px; border: none; background: none;
      font-size: 11px; font-weight: 500; font-family: inherit;
      color: var(--muted); cursor: pointer; border-radius: 5px;
      transition: color .12s, background .12s; white-space: nowrap;
    }
    .ai-mode-btn:hover { color: var(--text); }
    .ai-mode-btn--act  { background: var(--surface); color: var(--text); box-shadow: 0 1px 3px rgba(0,0,0,.08); }
    .ai-check-pill {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 10px; border: 1px solid var(--border); border-radius: 20px;
      font-size: 11px; cursor: pointer; user-select: none; color: var(--muted);
      transition: border-color .12s, color .12s, background .12s;
    }
    .ai-check-pill input { display: none; }
    .ai-input {
      height: 30px; border: 1px solid var(--border-md); border-radius: 6px;
      padding: 0 9px; font-size: 12px; font-family: inherit;
      color: var(--text); background: var(--bg); outline: none; box-sizing: border-box;
    }
    .ai-input:focus { border-color: #e11d8f; }
    .cs-dv-tab--ai       { color: #c026d3; display: flex; align-items: center; gap: 5px; }
    .cs-dv-tab--ai:hover { color: #a21caf; }
    .cs-dv-tab--ai.cs-dv-tab--act { color: #c026d3; border-bottom-color: #c026d3; }

    /* Inventory filter panel */
    .inv-fp-acc { border-bottom: 1px solid var(--border); }
    .inv-fp-acc:last-child { border-bottom: none; }
    .inv-fp-acc-hdr {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 0; cursor: pointer;
      font-size: 12px; font-weight: 500; color: var(--text);
      user-select: none;
    }
    .inv-fp-acc-hdr:hover { color: var(--accent); }
    .inv-fp-chevron { transition: transform .18s; color: var(--faint); flex-shrink: 0; }
    .inv-fp-chevron.open { transform: rotate(180deg); }
    .inv-fp-search {
      width: 100%; box-sizing: border-box;
      padding: 6px 9px; margin-bottom: 8px;
      border: 1px solid var(--border); border-radius: 6px;
      background: var(--bg); color: var(--text); font-size: 11px;
      outline: none; font-family: inherit;
    }
    .inv-fp-search:focus { border-color: var(--accent); }
    .inv-fp-opt {
      display: flex; align-items: center; gap: 8px;
      padding: 5px 0; cursor: pointer; font-size: 12px; color: var(--text);
    }
    .inv-fp-opt input[type=checkbox] { accent-color: var(--accent); cursor: pointer; flex-shrink:0; }
    .inv-fp-opt:hover span { color: var(--accent); }

    /* Inventory cards */
    .inv-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
      transition: border-color .15s, box-shadow .15s;
    }
    .inv-card:hover { border-color: var(--border-md); box-shadow: 0 2px 8px rgba(0,0,0,.07); }
    .inv-item--sel.inv-card { border-color: var(--accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 18%, transparent); }
    tr.inv-item--sel td { background: color-mix(in srgb, var(--accent) 5%, transparent); }

    /* Inventory filter chips */
    .inv-chip {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 11px; color: var(--accent);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
      border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
      border-radius: 20px; padding: 3px 10px;
    }
    .inv-chip span { font-size: 14px; line-height: 1; opacity: .7; }
    .inv-chip span:hover { opacity: 1; }

    /* Inventory view toggle buttons */
    .inv-view-btn {
      display: flex; align-items: center; justify-content: center;
      width: 28px; height: 28px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--surface);
      color: var(--faint);
      cursor: pointer;
      transition: color .15s, border-color .15s, background .15s;
    }
    .inv-view-btn:hover { color: var(--muted); border-color: var(--border-md); }
    .inv-view-btn--act  { color: var(--accent); border-color: var(--accent); background: var(--bg); }

    /* Enable Features checkboxes */
    .cs-features-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
      margin-top: 8px;
    }
    .cs-feature-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--text);
      cursor: pointer;
      user-select: none;
    }
    .cs-feature-cb {
      width: 15px;
      height: 15px;
      flex-shrink: 0;
      accent-color: var(--accent);
      cursor: pointer;
    }

    /* Modal */
    .cs-modal-overlay {
      position: fixed; inset: 0;
      background: rgba(13,30,54,.45);
      z-index: 9999;
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity .2s;
      isolation: isolate;
    }
    .cs-modal-overlay--in { opacity: 1; }
    .cs-modal {
      background: var(--surface);
      border-radius: 14px;
      width: 720px;
      max-width: calc(100vw - 32px);
      max-height: calc(100vh - 64px);
      display: flex; flex-direction: column;
      box-shadow: 0 12px 48px rgba(0,0,0,.18);
      transform: translateY(8px); transition: transform .2s;
      position: relative; z-index: 10000;
    }
    .cs-modal-overlay--in .cs-modal { transform: translateY(0); }
    .cs-modal-header {
      padding: 20px 20px 16px;
      border-bottom: 1px solid var(--border);
      display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
      flex-shrink: 0;
    }
    .cs-modal-title { font-size: 16px; font-weight: 500; letter-spacing: -.3px; color: var(--text); }
    .cs-modal-sub   { font-size: 12px; color: var(--muted); margin-top: 2px; }
    .cs-modal-close {
      width: 28px; height: 28px; border-radius: 6px; border: none;
      background: none; cursor: pointer; color: var(--faint);
      display: flex; align-items: center; justify-content: center;
      transition: background .13s, color .13s; flex-shrink: 0;
    }
    .cs-modal-close:hover { background: var(--bg); color: var(--text); }
    .cs-modal-body {
      padding: 18px 20px;
      overflow-y: auto;
      display: flex; flex-direction: column; gap: 14px;
    }
    .cs-modal-footer {
      padding: 14px 20px;
      border-top: 1px solid var(--border);
      display: flex; justify-content: flex-end; gap: 8px;
      flex-shrink: 0;
    }
    .cs-field { display: flex; flex-direction: column; gap: 5px; }
    .cs-field-row { display: flex; align-items: center; justify-content: space-between; }
    .cs-label {
      font-size: 11px; font-weight: 500; text-transform: uppercase;
      letter-spacing: .4px; color: var(--muted);
    }
    .cs-mandatory { color: var(--accent); }
    .cs-field-note { font-size: 10px; color: var(--faint); font-style: italic; }
    .cs-input {
      height: 36px; border: 1px solid var(--border-md); border-radius: 8px;
      padding: 0 11px; font-size: 13px; font-family: inherit; color: var(--text);
      background: var(--surface); outline: none; transition: border .15s, box-shadow .15s;
    }
    .cs-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(237,0,94,.1); }
    .cs-input--disabled { background: var(--bg); color: var(--muted); cursor: not-allowed; }
    .cs-input--error { border-color: #E5243B !important; box-shadow: 0 0 0 3px rgba(229,36,59,.1) !important; }
    .cs-textarea {
      border: 1px solid var(--border-md); border-radius: 8px;
      padding: 9px 11px; font-size: 13px; font-family: inherit; color: var(--text);
      background: var(--surface); outline: none; resize: vertical; min-height: 80px;
      transition: border .15s, box-shadow .15s;
    }
    .cs-textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(237,0,94,.1); }
    .cs-ads-toggle {
      display: flex; gap: 3px;
      background: var(--bg); border-radius: 7px; padding: 3px; width: fit-content;
    }
    .cs-ads-btn {
      height: 26px; padding: 0 14px; border-radius: 5px;
      font-size: 11px; font-weight: 500; color: var(--muted);
      cursor: pointer; display: flex; align-items: center;
      transition: all .13s; user-select: none;
    }
    .cs-ads-btn--act { background: var(--surface); color: var(--text); box-shadow: 0 1px 3px rgba(0,0,0,.07); }
    .cs-btn-secondary {
      height: 34px; padding: 0 16px; background: none;
      border: 1px solid var(--border-md); border-radius: 8px;
      font-size: 13px; font-weight: 500; font-family: inherit;
      color: var(--muted); cursor: pointer; transition: border-color .13s, color .13s;
    }
    .cs-btn-secondary:hover { border-color: var(--text); color: var(--text); }
    .cs-btn-primary {
      height: 34px; padding: 0 18px; background: var(--accent);
      border: none; border-radius: 8px;
      font-size: 13px; font-weight: 500; font-family: inherit;
      color: #fff; cursor: pointer; transition: opacity .13s;
    }
    .cs-btn-primary:hover { opacity: .88; }

    /* Content upload area */
    .cs-upload-area {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 6px; padding: 20px 16px;
      border: 1.5px dashed var(--border-md); border-radius: 10px;
      cursor: pointer; transition: border-color .15s, background .15s;
      background: var(--bg); text-align: center;
    }
    .cs-upload-area:hover { border-color: var(--accent); background: rgba(237,0,94,.03); }
    .cs-upload-area--error { border-color: #E5243B; background: rgba(229,36,59,.04); }
    #cs-upload-chosen {
      display: flex; align-items: center; gap: 8px; justify-content: center;
    }
    .cs-upload-text { font-size: 12px; font-weight: 500; color: var(--muted); word-break: break-all; }
    .cs-upload-hint { font-size: 11px; color: var(--faint); }

    /* Toggle sticky wrapper */
    .cs-toggle-sticky {
      position: sticky;
      top: 0;
      z-index: 20;
      background: var(--bg);
      padding: 2px 0 12px;
      margin-bottom: 0;
    }

    /* Workflow */
    .wf-legend-sticky {
      position: sticky;
      top: 50px;
      z-index: 10;
      background: var(--bg);
      padding-bottom: 12px;
    }
    .wf-legend {
      display: flex; flex-wrap: wrap; gap: 16px;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 10px; padding: 12px 16px;
    }
    .wf-legend-item { display: flex; align-items: center; gap: 6px; }
    .wf-legend-dot  { width: 10px; height: 10px; border-radius: 50%; flex-shrink:0; }
    .wf-legend-name { font-size: 12px; }
    .wf-legend-members { font-size: 11px; color: var(--faint); }

    /* Horizontal scroll flowchart */
    .wf-scroll-outer {
      overflow-x: auto;
      padding-bottom: 12px;
    }
    .wf-scroll-outer::-webkit-scrollbar { height: 5px; }
    .wf-scroll-outer::-webkit-scrollbar-track { background: var(--bg); border-radius: 3px; }
    .wf-scroll-outer::-webkit-scrollbar-thumb { background: var(--border-md); border-radius: 3px; }
    .wf-row-h {
      display: flex;
      align-items: stretch;
    }
    .wf-node {
      width: 210px;
      flex-shrink: 0;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 10px; overflow: hidden;
      display: flex; flex-direction: column;
      transition: box-shadow .15s;
    }
    .wf-node:hover { box-shadow: 0 2px 14px rgba(0,0,0,.08); }
    .wf-node-bar { height: 5px; flex-shrink: 0; }
    .wf-node-body {
      padding: 12px 13px; display: flex; flex-direction: column;
      gap: 4px; flex: 1;
    }
    .wf-node-num { font-size: 9px; text-transform: uppercase; letter-spacing: .5px; color: var(--faint); }
    .wf-node-title { font-size: 12px; font-weight: 600; color: var(--text); line-height: 1.3; }
    .wf-node-desc { font-size: 11px; color: var(--muted); line-height: 1.45; flex: 1; }
    .wf-node-pills { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 6px; }
    .wf-pill {
      font-size: 9px; font-weight: 600; text-transform: uppercase;
      letter-spacing: .3px; padding: 2px 7px; border-radius: 20px;
    }
    .wf-arrow-h {
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; width: 28px;
    }
    .cs-title {
      font-size: 20px;
      font-weight: 500;
      letter-spacing: -.4px;
      color: var(--text);
      margin-bottom: 16px;
    }
    .cs-filter-row { margin-bottom: 20px; }
    .cs-filter-wrap {
      display: inline-flex;
      flex-direction: column;
      gap: 4px;
    }
    .cs-filter-label {
      font-size: 10px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: .5px;
      color: var(--accent);
    }
    .cs-filter-select {
      height: 34px;
      min-width: 140px;
      border: 1.5px solid var(--accent);
      border-radius: 7px;
      padding: 0 28px 0 10px;
      font-size: 13px;
      font-family: inherit;
      color: var(--text);
      background: var(--surface);
      outline: none;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23ED005E' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 9px center;
    }
    .cs-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
    }
    .cs-thumb {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      width: 80px;
    }
    .cs-poster {
      width: 80px;
      height: 108px;
      border-radius: 7px;
      overflow: hidden;
      position: relative;
      border: 2px solid transparent;
      transition: border-color .15s, transform .12s;
      background: var(--bg);
    }
    .cs-thumb:hover .cs-poster { transform: scale(1.03); }
    .cs-thumb--sel .cs-poster  { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(237,0,94,.2); }
    .cs-thumb-title {
      font-size: 11px;
      color: var(--text);
      text-align: center;
      line-height: 1.3;
      word-break: break-word;
    }
    .cs-poster-initials {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 600;
      color: rgba(255,255,255,.7);
      letter-spacing: 1px;
    }
    .cs-badge {
      position: absolute;
      top: 6px;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 7px;
      font-weight: 600;
      color: #fff;
      background: rgba(0,0,0,.5);
      padding: 2px 4px;
      letter-spacing: .4px;
      text-transform: uppercase;
    }
    .cs-badge--new {
      background: var(--accent);
      box-shadow: 0 1px 4px rgba(237,0,94,.4);
      animation: cs-badge-pop .3s ease;
    }
    @keyframes cs-badge-pop {
      from { transform: scale(.7); opacity: 0; }
      to   { transform: scale(1);  opacity: 1; }
    }
    .cs-thumb--bump {
      animation: cs-thumb-bump .5s cubic-bezier(.36,.07,.19,.97);
    }
    @keyframes cs-thumb-bump {
      0%   { transform: scale(1)    translateY(0);   opacity: .4; }
      30%  { transform: scale(1.12) translateY(-6px); opacity: 1; }
      55%  { transform: scale(.97)  translateY(1px);  opacity: 1; }
      75%  { transform: scale(1.04) translateY(-2px); opacity: 1; }
      100% { transform: scale(1)    translateY(0);   opacity: 1; }
    }

    /* ── Detail View ─────────────────────────────── */
    .cs-dv-topbar {
      display: flex;
      align-items: center;
      gap: 14px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }
    .cs-dv-back {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: none;
      border: none;
      font-size: 11px;
      font-weight: 600;
      color: var(--accent);
      cursor: pointer;
      padding: 0;
      white-space: nowrap;
      font-family: inherit;
      letter-spacing: .4px;
      text-transform: uppercase;
    }
    .cs-dv-back:hover { opacity: .75; }
    .cs-dv-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--text);
      letter-spacing: .3px;
      flex: 1;
      text-transform: uppercase;
    }
    .cs-dv-collapse {
      width: 26px; height: 26px;
      background: none; border: 1px solid var(--border);
      border-radius: 6px; cursor: pointer; color: var(--muted);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: background .13s;
    }
    .cs-dv-collapse:hover { background: var(--bg); }
    /* panels strip — flush, no gaps, clipped by outer border-radius */
    .cs-dv-panel {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 220px;
      overflow: hidden;
      border-right: 1px solid var(--border);
    }
    .cs-dv-panel--dark {
      background: #0f1623;
      border-right-color: #1e2a3a;
    }
    .cs-dv-panel--last { border-right: none; }
    .cs-dv-panel-hd {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 9px 12px;
      border-bottom: 1px solid var(--border);
      font-size: 12px;
      font-weight: 600;
      color: var(--text);
      flex-shrink: 0;
      background: var(--surface);
    }
    .cs-dv-panel-hd--dark {
      border-bottom-color: #1e2a3a;
      color: #e2e8f0;
      background: #0f1623;
    }
    .cs-dv-panel-sub {
      padding: 8px 12px;
      flex-shrink: 0;
      border-bottom: 1px solid var(--border);
      background: var(--surface);
    }
    .cs-dv-panel-body {
      flex: 1;
      overflow-y: auto;
      padding: 4px 0;
      background: var(--surface);
    }
    .cs-dv-panel-body::-webkit-scrollbar { width: 3px; }
    .cs-dv-panel-body::-webkit-scrollbar-thumb { background: var(--border-md); border-radius: 2px; }
    .cs-dv-panel-body--dark {
      padding: 12px;
      background: #0f1623;
    }
    .cs-dv-panel-ico {
      background: none; border: none; cursor: pointer;
      color: var(--accent); font-size: 12px; padding: 2px 3px;
      border-radius: 3px; line-height: 1;
      transition: background .12s;
    }
    .cs-dv-panel-ico:hover { background: rgba(237,0,94,.08); }
    .cs-dv-panel-ico--dm { color: #64748b; }
    .cs-dv-panel-ico--dm:hover { background: rgba(255,255,255,.07); color: #94a3b8; }
    .cs-dv-panel-ico--red { color: var(--accent); }
    .cs-dv-scene {
      padding: 9px 12px;
      border-bottom: 1px solid var(--border);
    }
    .cs-dv-scene:last-child { border-bottom: none; }
    .cs-dv-scene-num  { font-size: 10px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .4px; margin-bottom: 2px; }
    .cs-dv-scene-tax  { font-size: 11px; color: var(--muted); margin-bottom: 5px; }
    .cs-dv-scene-badge {
      display: inline-block;
      background: rgba(237,0,94,.07);
      color: var(--accent);
      border: 1px solid rgba(237,0,94,.15);
      font-size: 11px; font-weight: 500;
      padding: 2px 8px; border-radius: 20px;
      margin-bottom: 5px;
    }
    .cs-dv-scene-meta { font-size: 11px; color: var(--muted); line-height: 1.5; }
    .cs-dv-scene-meta--val { color: var(--text); font-weight: 500; }
    .cs-dv-product {
      display: flex;
      gap: 10px;
      padding: 9px 12px;
      border-bottom: 1px solid var(--border);
      align-items: flex-start;
    }
    .cs-dv-product:last-child { border-bottom: none; }
    .cs-dv-prod-img {
      width: 44px; height: 44px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; flex-shrink: 0;
    }
    .cs-dv-prod-info { flex: 1; min-width: 0; }
    .cs-dv-prod-name  { font-size: 11.5px; font-weight: 500; color: var(--text); line-height: 1.35; margin-bottom: 3px; }
    .cs-dv-prod-det   { font-size: 11px; color: var(--muted); margin-bottom: 3px; }
    .cs-dv-prod-price { font-size: 12px; font-weight: 600; color: var(--text); }
    .cs-dv-prod-scene { font-size: 11px; color: var(--muted); margin-top: 2px; }
    .cs-dv-json-pre {
      font-size: 11px;
      font-family: 'SF Mono', 'Fira Code', monospace;
      line-height: 1.65;
      color: #94a3b8;
      white-space: pre-wrap;
      word-break: break-word;
      margin: 0;
    }
    .cs-dv-json-key { color: #7dd3fc; }
    .cs-dv-json-str { color: #f9a8d4; }
    .cs-dv-json-num { color: #86efac; }
    /* Detail view select (neutral border, no accent) */
    .cs-dv-select {
      height: 34px;
      border: 1.5px solid var(--border-md);
      border-radius: 7px;
      padding: 0 28px 0 10px;
      font-size: 13px;
      font-family: inherit;
      color: var(--text);
      background: var(--surface);
      outline: none;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 9px center;
    }
    .cs-dv-select:focus { border-color: var(--border-md); box-shadow: 0 0 0 3px rgba(107,114,128,.1); }

    /* Toggle buttons: rounded square, subtle bg, no border */
    .cs-dv-tog {
      display: inline-flex;
      align-items: center;
      padding: 6px 14px;
      border-radius: 8px;
      border: none;
      background: none;
      color: var(--muted);
      cursor: pointer;
      font-family: inherit;
      transition: all .13s;
    }
    .cs-dv-tog:hover { background: var(--subtle); color: var(--accent); }
    .cs-dv-tog--act  { background: var(--subtle); color: var(--accent); }

    /* Processing step */
    .cs-proc-preview {
      display: flex;
      align-items: center;
      gap: 14px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px 14px;
    }
    .cs-proc-thumb {
      width: 80px;
      height: 52px;
      border-radius: 7px;
      background: linear-gradient(135deg, #1a1f2e 0%, #0d1220 50%, #1a2035 100%);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
    }
    .cs-proc-thumb::before,
    .cs-proc-thumb::after {
      content: '';
      position: absolute;
      top: 0; bottom: 0;
      width: 8px;
      background: repeating-linear-gradient(
        to bottom,
        rgba(255,255,255,.15) 0px,
        rgba(255,255,255,.15) 5px,
        transparent 5px,
        transparent 9px
      );
    }
    .cs-proc-thumb::before { left: 0; }
    .cs-proc-thumb::after  { right: 0; }
    .cs-proc-thumb-inner { position: relative; z-index: 1; }
    .cs-proc-meta {
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;
    }
    .cs-proc-fname {
      font-size: 12px;
      font-weight: 500;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cs-proc-fsize {
      font-size: 11px;
      color: var(--muted);
    }
    .cs-proc-bar-section {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }
    .cs-proc-bar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .cs-proc-status-label {
      font-size: 12px;
      color: var(--muted);
      font-style: italic;
      flex: 1;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cs-proc-pct-badge {
      font-size: 11px;
      font-weight: 600;
      color: var(--accent);
      flex-shrink: 0;
      transition: color .3s;
      min-width: 32px;
      text-align: right;
    }
    .cs-proc-bar-track {
      height: 5px;
      background: var(--border);
      border-radius: 99px;
      overflow: hidden;
    }
    .cs-proc-bar-fill {
      height: 100%;
      background: var(--accent);
      border-radius: 99px;
      transition: width .1s linear;
    }
    .cs-proc-log {
      display: flex;
      flex-direction: column;
      gap: 5px;
      max-height: 120px;
      overflow-y: auto;
      padding: 2px 0;
    }
    .cs-proc-log::-webkit-scrollbar { width: 3px; }
    .cs-proc-log::-webkit-scrollbar-thumb { background: var(--border-md); border-radius: 2px; }
    .cs-proc-log-line {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 11.5px;
      color: var(--muted);
      animation: cs-log-in .2s ease;
    }
    @keyframes cs-log-in {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .cs-proc-success-box {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      background: rgba(46,173,75,.06);
      border: 1px solid rgba(46,173,75,.25);
      border-radius: 8px;
      animation: cs-succ-in .35s ease;
    }
    @keyframes cs-succ-in {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .cs-proc-success-title {
      font-size: 12px;
      font-weight: 600;
      color: #2EAD4B;
    }
    .cs-proc-success-sub {
      font-size: 11px;
      color: var(--muted);
      line-height: 1.4;
      margin-top: 1px;
    }

    /* Stepper */
    .cs-stepper {
      display: flex;
      align-items: center;
      padding: 14px 20px;
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }
    .cs-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .cs-step-circle {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 1.5px solid var(--border-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      color: var(--muted);
      transition: all .2s;
    }
    .cs-step-label {
      font-size: 10px;
      font-weight: 500;
      color: var(--muted);
      white-space: nowrap;
    }
    .cs-step--act .cs-step-circle {
      background: var(--accent);
      border-color: var(--accent);
      color: #fff;
    }
    .cs-step--act .cs-step-label {
      color: var(--accent);
      font-weight: 600;
    }
    .cs-step--done .cs-step-circle {
      background: var(--accent);
      border-color: var(--accent);
      color: #fff;
    }
    .cs-step--done .cs-step-label {
      color: var(--accent);
    }
    .cs-step-line {
      flex: 1;
      height: 1.5px;
      background: var(--border);
      margin: 0 8px;
      margin-bottom: 18px;
    }

    /* Upload spinner */
    .cs-upload-spinner {
      width: 22px;
      height: 22px;
      border: 2px solid var(--border);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: cs-spin .7s linear infinite;
    }
    @keyframes cs-spin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(s);
}
