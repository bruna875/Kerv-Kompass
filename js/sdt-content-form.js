// sdt-content-form.js — SDT New Content Form prototype

function renderSdtContentForm() {
  setTimeout(sdtInit, 0);
  return `
<div class="ptitle">SDT – New Content Form</div>
<div class="psub" style="margin-bottom:20px">Select a process to get started</div>

<div id="sdt-grid" style="display:grid;grid-template-columns:220px 1fr;gap:16px;align-items:start">

  <!-- ── Left: sidebar nav ── -->
  <div class="sdt-sb" id="sdt-sb" style="position:sticky;top:0;align-self:start;">

    <div class="sdt-nav-item sdt-nav-item--act" id="sdt-nav-manual" onclick="sdtNav('manual')">
      <div class="sdt-nav-num">1</div>
      <div class="sdt-nav-text"><div class="sdt-nav-label">Enhanced Manual</div><div class="sdt-nav-sub">process</div></div>
    </div>

    <div class="sdt-nav-item" id="sdt-nav-selfserve" onclick="sdtNav('selfserve')">
      <div class="sdt-nav-num">2</div>
      <div class="sdt-nav-text"><div class="sdt-nav-label">Partially Automated</div><div class="sdt-nav-sub">process</div></div>
    </div>

    <div class="sdt-nav-item" id="sdt-nav-realtime" onclick="sdtNav('realtime')">
      <div class="sdt-nav-num">3</div>
      <div class="sdt-nav-text"><div class="sdt-nav-label">Real-time Analysis</div><div class="sdt-nav-sub">process</div></div>
    </div>

    <div class="sdt-sb-divider"></div>

    <div class="sdt-nav-item" id="sdt-nav-taxonomy" onclick="sdtNav('taxonomy')">
      <div class="sdt-nav-num">4</div>
      <div class="sdt-nav-text"><div class="sdt-nav-label">Taxonomy Explorer v1</div><div class="sdt-nav-sub">integration</div></div>
    </div>

    <div class="sdt-nav-item" id="sdt-nav-taxonomy2" onclick="sdtNav('taxonomy2')">
      <div class="sdt-nav-num">5</div>
      <div class="sdt-nav-text"><div class="sdt-nav-label">Taxonomy Explorer v2</div><div class="sdt-nav-sub">integration</div></div>
    </div>

    <!-- toggle button -->
    <div class="sdt-sb-tog" onclick="sdtSbToggle()" title="Collapse sidebar">
      <svg id="sdt-sb-ico" width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M6 2L3 5l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

  </div>

  <!-- ── Right: content ── -->
  <div id="sdt-content-area" style="min-width:0">
    <div id="sdt-panel-manual">

      <!-- View toggle (sticky) -->
      <div class="cs-toggle-sticky">
        <div class="cs-view-toggle">
          <div class="cs-view-btn cs-view-btn--act" id="cs-vbtn-mockup" onclick="csView('mockup')">Mockup</div>
          <div class="cs-view-btn" id="cs-vbtn-process" onclick="csView('process')">Process</div>
        </div>
      </div>

      <!-- Mockup view -->
      <div id="cs-view-mockup">
      <!-- Content Selection card -->
      <div class="cs-card">
        <div class="cs-title">Content Selection</div>

        <div class="cs-toolbar">
          <div class="cs-filter-wrap">
            <div class="cs-filter-label">Category</div>
            <select class="cs-filter-select" onchange="csFilter(this.value)">
              <option value="all">All</option>
              <option value="comedy">Comedy</option>
              <option value="drama">Drama</option>
              <option value="reality">Reality</option>
              <option value="documentary">Documentary</option>
            </select>
          </div>
          <button class="cs-request-btn" onclick="csOpenModal()">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
            Request New Content
          </button>
        </div>

        <div class="cs-grid" id="cs-grid"></div>
      </div>
      </div><!-- end mockup view -->

      <!-- Process view -->
      <div id="cs-view-process" style="display:none">
        <div id="cs-process-container"></div>
      </div>

    </div>
    <div id="sdt-panel-selfserve" style="display:none">

      <!-- View toggle (sticky) -->
      <div class="cs-toggle-sticky">
        <div class="cs-view-toggle">
          <div class="cs-view-btn cs-view-btn--act" id="cs-vbtn2-mockup" onclick="csView2('mockup')">Mockup</div>
          <div class="cs-view-btn" id="cs-vbtn2-process" onclick="csView2('process')">Process</div>
        </div>
      </div>

      <!-- Mockup view -->
      <div id="cs-view2-mockup">
      <div class="cs-card">
        <div class="cs-title">Content Selection</div>

        <div class="cs-toolbar">
          <div class="cs-filter-wrap">
            <div class="cs-filter-label">Category</div>
            <select class="cs-filter-select" onchange="csFilter2(this.value)">
              <option value="all">All</option>
              <option value="comedy">Comedy</option>
              <option value="drama">Drama</option>
              <option value="reality">Reality</option>
              <option value="documentary">Documentary</option>
            </select>
          </div>
          <button class="cs-request-btn" onclick="csOpenModal()">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
            Request New Content
          </button>
        </div>

        <div class="cs-grid" id="cs-grid2"></div>
      </div>
      </div><!-- end mockup view 2 -->

      <!-- Process view -->
      <div id="cs-view2-process" style="display:none">
        <div id="cs-process-container2"></div>
      </div>

    </div>
    <div id="sdt-panel-realtime" style="display:none">

      <!-- View toggle (sticky) -->
      <div class="cs-toggle-sticky">
        <div class="cs-view-toggle">
          <div class="cs-view-btn cs-view-btn--act" id="cs-vbtn3-mockup" onclick="csView3('mockup')">Mockup</div>
          <div class="cs-view-btn" id="cs-vbtn3-process" onclick="csView3('process')">Process</div>
        </div>
      </div>

      <!-- Mockup view -->
      <div id="cs-view3-mockup">
      <div class="cs-card">
        <div class="cs-title">Content Selection</div>

        <div class="cs-toolbar">
          <div class="cs-filter-wrap">
            <div class="cs-filter-label">Category</div>
            <select class="cs-filter-select" onchange="csFilter3(this.value)">
              <option value="all">All</option>
              <option value="comedy">Comedy</option>
              <option value="drama">Drama</option>
              <option value="reality">Reality</option>
              <option value="documentary">Documentary</option>
            </select>
          </div>
          <button class="cs-request-btn" onclick="csOpenModalRealtime()">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
            Request New Content
          </button>
        </div>

        <div class="cs-grid" id="cs-grid3"></div>
      </div>
      </div><!-- end mockup view 3 -->

      <!-- Process view -->
      <div id="cs-view3-process" style="display:none">
        <div id="cs-process-container3"></div>
      </div>

    </div>
    <div id="sdt-panel-taxonomy" style="display:none">

      <!-- View toggle (sticky) -->
      <div class="cs-toggle-sticky">
        <div class="cs-view-toggle">
          <div class="cs-view-btn cs-view-btn--act" id="cs-vbtn4-mockup" onclick="csTxView('mockup')">Mockup</div>
          <div class="cs-view-btn" id="cs-vbtn4-process" onclick="csTxView('process')">Process</div>
        </div>
      </div>

      <!-- Mockup view -->
      <div id="cs-view4-mockup">
      <div class="cs-card">
        <div class="cs-title">Content Selection</div>

        <div class="cs-toolbar">
          <div class="cs-filter-wrap">
            <div class="cs-filter-label">Category</div>
            <select class="cs-filter-select" onchange="csTxFilter(this.value)">
              <option value="all">All</option>
              <option value="comedy">Comedy</option>
              <option value="drama">Drama</option>
              <option value="reality">Reality</option>
              <option value="documentary">Documentary</option>
            </select>
          </div>
          <button class="cs-request-btn" onclick="csOpenModalTaxonomy()">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
            Request New Content
          </button>
        </div>

        <div class="cs-grid" id="cs-grid4"></div>
      </div>
      </div><!-- end mockup view 4 -->

      <!-- Process view -->
      <div id="cs-view4-process" style="display:none">
        <div id="cs-process-container4"></div>
      </div>

    </div>
    <div id="sdt-panel-taxonomy2" style="display:none">
      <div class="cs-card" style="padding:0;display:flex;flex-direction:column;overflow:hidden">

        <!-- Dashboard topbar -->
        <div class="tx2-topbar">
          <div class="tx2-topbar-brand">
            <div class="tx2-logo-mark">K</div>
            <span class="tx2-topbar-title">KervSDT</span>
          </div>
          <div class="tx2-topbar-actions">
            <button class="tx2-icon-btn" title="Notifications">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a6 6 0 00-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 00-6-6z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                <path d="M8.5 16.5a1.5 1.5 0 003 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span class="tx2-notif-dot"></span>
            </button>
          </div>
        </div>

        <!-- Body: sidebar + content -->
        <div style="display:flex;flex:1;min-height:480px">

          <!-- Sidebar -->
          <div class="tx2-sidebar">
            <div class="tx2-sidebar-section">Navigation</div>
            <div class="tx2-nav-item tx2-nav-item--act" id="tx2-nav-metadata" onclick="csTx2NavTab('metadata')">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/></svg>
              Metadata Analysis
            </div>
            <div class="tx2-nav-item" id="tx2-nav-taxonomy" onclick="csTx2NavTab('taxonomy')">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="13" cy="8" r="2" stroke="currentColor" stroke-width="1.2"/></svg>
              Taxonomy Explorer
            </div>
          </div>

          <!-- Content area -->
          <div id="tx2-content-area" style="flex:1;min-width:0;padding:20px;border-left:1px solid var(--border)">
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
                Request New Content
              </button>
            </div>
            <div class="cs-grid" id="cs-grid5"></div>
          </div>

        </div>
      </div>
    </div>
  </div>

</div>`;
}

// ── Live Prototype: Taxonomy Explorer v1 ─────────────────────────────────

function renderTaxonomyV1() {
  setTimeout(function() {
    csActiveTxFilter = 'all'; csSelectedTxId = 1;
    sdtInjectStyles();
    csTxRender();
    csTxRenderProcess();
  }, 0);
  return `
<div class="ptitle">Taxonomy Explorer</div>
<div class="psub" style="margin-bottom:20px">v1 — Content analysis &amp; taxonomy tagging</div>

<div id="sdt-panel-taxonomy">
  <div class="cs-card">
    <div class="cs-title">Content Selection</div>
    <div class="cs-toolbar">
      <div class="cs-filter-wrap">
        <div class="cs-filter-label">Category</div>
        <select class="cs-filter-select" onchange="csTxFilter(this.value)">
          <option value="all">All</option>
          <option value="comedy">Comedy</option>
          <option value="drama">Drama</option>
          <option value="reality">Reality</option>
          <option value="documentary">Documentary</option>
        </select>
      </div>
      <button class="cs-request-btn" onclick="csOpenModalTaxonomy()">
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
        Request New Content
      </button>
    </div>
    <div class="cs-grid" id="cs-grid4"></div>
  </div>
</div>`;
}

// ── Live Prototype: Taxonomy Explorer v2 ─────────────────────────────────

function renderTaxonomyV2() {
  setTimeout(function() {
    csActiveTx2Filter = 'all'; csSelectedTx2Id = 1;
    csTx2TaxStep = 'upload'; csTx2TaxInputType = 'video'; csTx2TaxFileName = '';
    sdtInjectStyles();
    csTx2Render();
    csTx2RenderProcess();
  }, 0);
  return `
<div class="ptitle">Taxonomy Explorer</div>
<div class="psub" style="margin-bottom:20px">v2 — KervSDT integrated dashboard</div>

<div id="sdt-panel-taxonomy2">
  <div class="cs-card" style="padding:0;display:flex;flex-direction:column;overflow:hidden">

    <!-- Dashboard topbar -->
    <div class="tx2-topbar">
      <div class="tx2-topbar-brand">
        <div class="tx2-logo-mark">K</div>
        <span class="tx2-topbar-title">KervSDT</span>
      </div>
      <div class="tx2-topbar-actions">
        <button class="tx2-icon-btn" title="Notifications">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M10 2a6 6 0 00-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 00-6-6z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M8.5 16.5a1.5 1.5 0 003 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span class="tx2-notif-dot"></span>
        </button>
      </div>
    </div>

    <!-- Body: sidebar + content -->
    <div style="display:flex;flex:1;min-height:480px">

      <!-- Sidebar -->
      <div class="tx2-sidebar">
        <div class="tx2-sidebar-section">Navigation</div>
        <div class="tx2-nav-item tx2-nav-item--act" id="tx2-nav-metadata" onclick="csTx2NavTab('metadata')">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/></svg>
          Metadata Analysis
        </div>
        <div class="tx2-nav-item" id="tx2-nav-taxonomy" onclick="csTx2NavTab('taxonomy')">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="13" cy="8" r="2" stroke="currentColor" stroke-width="1.2"/></svg>
          Taxonomy Explorer
        </div>
      </div>

      <!-- Content area -->
      <div id="tx2-content-area" style="flex:1;min-width:0;padding:20px;border-left:1px solid var(--border)">
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
            Request New Content
          </button>
        </div>
        <div class="cs-grid" id="cs-grid5"></div>
      </div>

    </div>
  </div>
</div>`;
}

// ── Taxonomy Explorer Showcase ───────────────────────────────────────────

function renderTaxonomyShowcase() {
  setTimeout(function() {
    csTx2TaxStep = 'upload'; csTx2TaxInputType = 'video'; csTx2TaxFileName = '';
    sdtInjectStyles();
    csTx2TaxShowUpload();
    csTx2RenderProcess();
  }, 0);
  return `
<div class="ptitle">Taxonomy Explorer Showcase</div>
<div class="psub" style="margin-bottom:24px">Upload a video or brief and let KervSDT analyse moments, metadata and taxonomy classifications</div>
<div id="sdt-panel-taxonomy2">
  <div class="cs-card" style="padding:32px">
    <div id="tx2-content-area"></div>
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

var csActiveFilter  = 'all';
var csSelectedId    = 3;
var csActiveFilter2 = 'all';
var csSelectedId2   = 3;

// ── Request New Content Modal — single-step (Enhanced Manual & Partially Automated) ──

function csOpenModal() {
  if (document.getElementById('cs-modal')) return;
  var modal = document.createElement('div');
  modal.id = 'cs-modal';
  modal.className = 'cs-modal-overlay';
  modal.innerHTML = `
    <div class="cs-modal" onclick="event.stopPropagation()">

      <!-- Header -->
      <div class="cs-modal-header">
        <div>
          <div class="cs-modal-title">Request New Content</div>
          <div class="cs-modal-sub">Fill in the details below to submit your request</div>
        </div>
        <button class="cs-modal-close" onclick="csCloseModal()">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
        </button>
      </div>

      <!-- Body -->
      <div class="cs-modal-body">

        <div class="cs-field">
          <div class="cs-field-row">
            <label class="cs-label">Requestor</label>
            <span class="cs-field-note">Comes from the account</span>
          </div>
          <input class="cs-input cs-input--disabled" type="text" value="Marika Roque" disabled>
        </div>

        <div class="cs-field">
          <label class="cs-label">Client Name</label>
          <input class="cs-input" type="text" placeholder="e.g. Nike, Unilever…">
        </div>

        <div class="cs-field">
          <label class="cs-label">Content Name</label>
          <input class="cs-input" type="text" placeholder="e.g. Below Deck S5E3…">
        </div>

        <div class="cs-field">
          <div class="cs-field-row">
            <label class="cs-label">Content Upload <span class="cs-mandatory">*</span></label>
          </div>
          <div class="cs-ads-toggle" style="margin-bottom:8px">
            <div class="cs-ads-btn cs-ads-btn--act" id="cs-content-link-btn" onclick="csContentTab('link')">Link</div>
            <div class="cs-ads-btn" id="cs-content-upload-btn" onclick="csContentTab('upload')">Upload</div>
          </div>
          <div id="cs-content-link">
            <input class="cs-input" id="cs-link-input" type="url" placeholder="https://…" style="width:100%;box-sizing:border-box">
          </div>
          <div id="cs-content-upload" style="display:none">
            <label class="cs-upload-area" id="cs-upload-label">
              <input type="file" accept="video/*" id="cs-file-input" style="display:none" onchange="csFileChosen(this)">
              <div id="cs-upload-idle" style="display:flex;flex-direction:column;align-items:center;gap:6px">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style="color:var(--muted)"><path d="M12 16V8m0 0-3 3m3-3 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" stroke-width="1.5"/></svg>
                <div class="cs-upload-text">Click to select a video file</div>
                <div class="cs-upload-hint">MP4, MOV, AVI, MKV…</div>
              </div>
              <div id="cs-upload-chosen" style="display:none;align-items:center;gap:8px;justify-content:center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="color:#2EAD4B;flex-shrink:0"><path d="M4 10l4 4 8-8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span id="cs-upload-filename" class="cs-upload-text" style="color:var(--text)"></span>
                <span class="cs-upload-hint" id="cs-upload-filesize"></span>
              </div>
            </label>
          </div>
        </div>

        <div class="cs-field">
          <label class="cs-label">Ads Selection</label>
          <div class="cs-ads-toggle">
            <div class="cs-ads-btn cs-ads-btn--act" id="cs-ads-link-btn" onclick="csAdsTab('link')">Link</div>
            <div class="cs-ads-btn" id="cs-ads-desc-btn" onclick="csAdsTab('desc')">Description</div>
          </div>
          <div id="cs-ads-link">
            <input class="cs-input" type="url" placeholder="https://ad-url.com…" style="margin-top:8px;width:100%;box-sizing:border-box">
          </div>
          <div id="cs-ads-desc" style="display:none">
            <textarea class="cs-textarea" placeholder="Describe the ad — product, audience, key messages…" style="margin-top:8px;width:100%;min-height:100px"></textarea>
          </div>
        </div>

        <div class="cs-field">
          <label class="cs-label">Desired Delivery Date</label>
          <input class="cs-input" type="date">
        </div>

      </div>

      <!-- Footer -->
      <div class="cs-modal-footer">
        <button class="cs-btn-secondary" onclick="csCloseModal()">Cancel</button>
        <button class="cs-btn-primary" onclick="csSubmitModal()">Submit Request</button>
      </div>

    </div>
  `;
  modal.addEventListener('click', csCloseModal);
  document.body.appendChild(modal);
  setTimeout(function() { modal.classList.add('cs-modal-overlay--in'); }, 10);
}

function csFileChosen(input) {
  var file = input.files[0];
  if (!file) return;
  document.getElementById('cs-upload-idle').style.display   = 'none';
  document.getElementById('cs-upload-chosen').style.display = 'flex';
  document.getElementById('cs-upload-filename').textContent = file.name;
  document.getElementById('cs-upload-filesize').textContent = (file.size / 1024 / 1024).toFixed(1) + ' MB';
  var ul = document.getElementById('cs-upload-label');
  if (ul) ul.classList.remove('cs-upload-area--error');
}

function csSubmitModal() {
  var uploadMode = document.getElementById('cs-content-upload') &&
                   document.getElementById('cs-content-upload').style.display !== 'none';
  if (uploadMode) {
    var fi = document.getElementById('cs-file-input');
    if (!fi || !fi.files.length) {
      var ul = document.getElementById('cs-upload-label');
      if (ul) ul.classList.add('cs-upload-area--error');
      return;
    }
  } else {
    var link = document.getElementById('cs-link-input');
    if (!link || !link.value.trim()) {
      link.classList.add('cs-input--error');
      link.focus();
      return;
    }
  }
  csCloseModal();
  setTimeout(csOpenSuccessModal, 220);
}

// ── Request New Content Modal — 3-step (Real-time Analysis) ──────────────
var csCurrentStep = 1;

function csOpenModalRealtime() {
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
    +   '<div class="cs-step" id="cs-step-ind-3"><div class="cs-step-circle"><span>3</span></div><div class="cs-step-label">Add Ads</div></div>'
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

    // Video preview thumbnail
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

    // Progress bar section
    +   '<div class="cs-proc-bar-section">'
    +     '<div class="cs-proc-bar-header">'
    +       '<span class="cs-proc-status-label" id="cs-proc-status-text">Preparing analysis…</span>'
    +       '<span class="cs-proc-pct-badge" id="cs-proc-pct">0%</span>'
    +     '</div>'
    +     '<div class="cs-proc-bar-track"><div class="cs-proc-bar-fill" id="cs-proc-bar" style="width:0%"></div></div>'
    +   '</div>'

    // Processing log
    +   '<div class="cs-proc-log" id="cs-proc-log"></div>'

    // Success message (hidden until done)
    +   '<div id="cs-proc-success" style="display:none">'
    +     '<div class="cs-proc-success-box">'
    +       '<svg width="34" height="34" viewBox="0 0 34 34" fill="none"><circle cx="17" cy="17" r="16" fill="rgba(46,173,75,.12)" stroke="#2EAD4B" stroke-width="1.5"/><path d="M10 17l5 5 9-9" stroke="#2EAD4B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +       '<div class="cs-proc-success-title">Analysis Complete</div>'
    +       '<div class="cs-proc-success-sub">Content successfully processed. All taxonomy signals have been extracted and catalogued. Click Next to configure delivery.</div>'
    +     '</div>'
    +   '</div>'

    + '</div>'

    // ── Step 3 body — Add Ads ──
    + '<div class="cs-modal-body" id="cs-step-body-3" style="display:none">'

    +   '<div class="cs-field">'
    +     '<label class="cs-label">Ads Selection</label>'
    +     '<div class="cs-ads-toggle" style="margin-bottom:8px">'
    +       '<div class="cs-ads-btn cs-ads-btn--act" id="cs-rt-ads-link-btn" onclick="csRtAdsTab(\'link\')">Link</div>'
    +       '<div class="cs-ads-btn" id="cs-rt-ads-desc-btn" onclick="csRtAdsTab(\'desc\')">Description</div>'
    +     '</div>'
    +     '<div id="cs-rt-ads-link">'
    +       '<input class="cs-input" type="url" placeholder="https://ad-url.com…" style="width:100%;box-sizing:border-box">'
    +     '</div>'
    +     '<div id="cs-rt-ads-desc" style="display:none">'
    +       '<textarea class="cs-textarea" placeholder="Describe the ad — product, audience, key messages…" style="width:100%;min-height:100px"></textarea>'
    +     '</div>'
    +   '</div>'

    +   '<div class="cs-field">'
    +     '<label class="cs-label">Desired Delivery Date</label>'
    +     '<input class="cs-input" type="date" style="width:100%;box-sizing:border-box">'
    +   '</div>'

    + '</div>'

    // Footer
    + '<div class="cs-modal-footer">'
    +   '<button class="cs-btn-secondary" id="cs-modal-back-btn" style="display:none;margin-right:auto" onclick="csPrevStep()">← Back</button>'
    +   '<button class="cs-btn-secondary" id="cs-modal-skip-btn" style="display:none" onclick="csAddAndSubmit()">Submit without Ads</button>'
    +   '<button class="cs-btn-primary" id="cs-modal-next-btn" onclick="csNextStep()">Next</button>'
    + '</div>'

    + '</div>';

  modal.addEventListener('click', csCloseModal);
  document.body.appendChild(modal);
  setTimeout(function() { modal.classList.add('cs-modal-overlay--in'); }, 10);
}

function csCloseModal() {
  var modal = document.getElementById('cs-modal');
  if (!modal) return;
  modal.classList.remove('cs-modal-overlay--in');
  setTimeout(function() { modal.remove(); }, 200);
}

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
    +   '<div class="cs-step" id="cs-step-ind-3"><div class="cs-step-circle"><span>3</span></div><div class="cs-step-label">Add Ads</div></div>'
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
    +       '<svg width="34" height="34" viewBox="0 0 34 34" fill="none"><circle cx="17" cy="17" r="16" fill="rgba(46,173,75,.12)" stroke="#2EAD4B" stroke-width="1.5"/><path d="M10 17l5 5 9-9" stroke="#2EAD4B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +       '<div class="cs-proc-success-title">Analysis Complete</div>'
    +       '<div class="cs-proc-success-sub">Content successfully processed. All taxonomy signals have been extracted and catalogued. Click Next to configure delivery.</div>'
    +     '</div>'
    +   '</div>'

    + '</div>'

    // ── Step 3 body — Add Ads ──
    + '<div class="cs-modal-body" id="cs-step-body-3" style="display:none">'

    +   '<div class="cs-field">'
    +     '<label class="cs-label">Ads Selection</label>'
    +     '<div class="cs-ads-toggle" style="margin-bottom:8px">'
    +       '<div class="cs-ads-btn cs-ads-btn--act" id="cs-rt-ads-link-btn" onclick="csRtAdsTab(\'link\')">Link</div>'
    +       '<div class="cs-ads-btn" id="cs-rt-ads-desc-btn" onclick="csRtAdsTab(\'desc\')">Description</div>'
    +     '</div>'
    +     '<div id="cs-rt-ads-link">'
    +       '<input class="cs-input" type="url" placeholder="https://ad-url.com…" style="width:100%;box-sizing:border-box">'
    +     '</div>'
    +     '<div id="cs-rt-ads-desc" style="display:none">'
    +       '<textarea class="cs-textarea" placeholder="Describe the ad — product, audience, key messages…" style="width:100%;min-height:100px"></textarea>'
    +     '</div>'
    +   '</div>'

    +   '<div class="cs-field">'
    +     '<label class="cs-label">Desired Delivery Date</label>'
    +     '<input class="cs-input" type="date" style="width:100%;box-sizing:border-box">'
    +   '</div>'

    + '</div>'

    // Footer
    + '<div class="cs-modal-footer">'
    +   '<button class="cs-btn-secondary" id="cs-modal-back-btn" style="display:none;margin-right:auto" onclick="csPrevStep()">← Back</button>'
    +   '<button class="cs-btn-secondary" id="cs-modal-skip-btn" style="display:none" onclick="csAddAndSubmit()">Submit without Ads</button>'
    +   '<button class="cs-btn-primary" id="cs-modal-next-btn" onclick="csNextStep()">Next</button>'
    + '</div>'

    + '</div>';

  modal.addEventListener('click', csCloseModal);
  document.body.appendChild(modal);
  setTimeout(function() { modal.classList.add('cs-modal-overlay--in'); }, 10);
}

// ── Stepper navigation ────────────────────────────────────────────────────

function csNextStep() {
  if (csCurrentStep === 1) {
    // Validate Content Upload
    var uploadVisible = document.getElementById('cs-content-upload') &&
                        document.getElementById('cs-content-upload').style.display !== 'none';
    if (uploadVisible) {
      var chosen = document.getElementById('cs-upload-chosen');
      if (!chosen || chosen.style.display === 'none') {
        var ul = document.getElementById('cs-upload-label');
        if (ul) ul.classList.add('cs-upload-area--error');
        return;
      }
    } else {
      var link = document.getElementById('cs-link-input');
      if (!link || !link.value.trim()) {
        link.classList.add('cs-input--error');
        link.focus();
        return;
      }
    }
    csCurrentStep = 2;
    csUpdateModalStepper();
    // Start processing only if bar not already at 100%
    var _pb = document.getElementById('cs-proc-bar');
    if (!_pb || _pb.style.width !== '100%') setTimeout(csStartProcessing, 80);
  } else if (csCurrentStep === 2) {
    csCurrentStep = 3;
    csUpdateModalStepper();
  } else if (csCurrentStep === 3) {
    csAddAndSubmit();
  }
}

function csPrevStep() {
  if (csCurrentStep > 1) {
    csCurrentStep--;
    csUpdateModalStepper();
  }
}

// ── Processing animation ──────────────────────────────────────────────────

var PROC_STEPS = [
  { at:  5, msg: 'Uploading content to analysis pipeline' },
  { at: 15, msg: 'Extracting video metadata' },
  { at: 28, msg: 'Detecting scene boundaries' },
  { at: 42, msg: 'Running object recognition' },
  { at: 54, msg: 'Analyzing sentiment & tone' },
  { at: 66, msg: 'Mapping IAB content categories' },
  { at: 78, msg: 'Applying brand safety classification' },
  { at: 88, msg: 'Analyzing taxonomy signals' },
  { at: 96, msg: 'Generating analysis report' }
];

function csStartProcessing() {
  var backBtn = document.getElementById('cs-modal-back-btn');
  var nextBtn = document.getElementById('cs-modal-next-btn');
  if (backBtn) { backBtn.disabled = true; backBtn.style.opacity = '.35'; backBtn.style.pointerEvents = 'none'; }
  if (nextBtn) { nextBtn.disabled = true; nextBtn.style.opacity = '.35'; nextBtn.style.pointerEvents = 'none'; }

  var pct = 0;
  var stepIdx = 0;

  var iv = setInterval(function() {
    pct = Math.min(pct + Math.floor(Math.random() * 3 + 1), 100);

    var bar    = document.getElementById('cs-proc-bar');
    var pctEl  = document.getElementById('cs-proc-pct');
    var statEl = document.getElementById('cs-proc-status-text');
    var logEl  = document.getElementById('cs-proc-log');

    if (bar)   bar.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';

    // Emit log lines at each milestone
    while (stepIdx < PROC_STEPS.length && pct >= PROC_STEPS[stepIdx].at) {
      if (statEl) statEl.textContent = PROC_STEPS[stepIdx].msg + '…';
      if (logEl) {
        var line = document.createElement('div');
        line.className = 'cs-proc-log-line';
        line.innerHTML =
          '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="flex-shrink:0"><circle cx="6" cy="6" r="5.25" fill="rgba(46,173,75,.12)" stroke="#2EAD4B" stroke-width="1.2"/><path d="M3.5 6l1.8 1.8 3-3.3" stroke="#2EAD4B" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          + '<span>' + PROC_STEPS[stepIdx].msg + '</span>';
        logEl.appendChild(line);
        logEl.scrollTop = logEl.scrollHeight;
      }
      stepIdx++;
    }

    if (pct >= 100) {
      clearInterval(iv);
      if (statEl) statEl.textContent = 'Analysis complete';
      if (pctEl)  pctEl.style.color = '#2EAD4B';
      setTimeout(function() {
        var succ = document.getElementById('cs-proc-success');
        if (succ) { succ.style.display = ''; succ.classList.add('cs-proc-success--in'); }
        var bb = document.getElementById('cs-modal-back-btn');
        var nb = document.getElementById('cs-modal-next-btn');
        if (bb) { bb.disabled = false; bb.style.opacity = ''; bb.style.pointerEvents = ''; }
        if (nb) { nb.disabled = false; nb.style.opacity = ''; nb.style.pointerEvents = ''; }
      }, 350);
    }
  }, 65);
}

function csUpdateModalStepper() {
  var checkSvg = '<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  [1, 2, 3].forEach(function(n) {
    // body panels
    var body = document.getElementById('cs-step-body-' + n);
    if (body) body.style.display = n === csCurrentStep ? '' : 'none';
    // step indicators
    var ind = document.getElementById('cs-step-ind-' + n);
    if (!ind) return;
    ind.className = 'cs-step'
      + (n === csCurrentStep ? ' cs-step--act' : '')
      + (n < csCurrentStep   ? ' cs-step--done' : '');
    var circle = ind.querySelector('.cs-step-circle');
    if (circle) circle.innerHTML = n < csCurrentStep ? checkSvg : '<span>' + n + '</span>';
  });
  var backBtn = document.getElementById('cs-modal-back-btn');
  var nextBtn = document.getElementById('cs-modal-next-btn');
  var skipBtn = document.getElementById('cs-modal-skip-btn');
  if (backBtn) backBtn.style.display = csCurrentStep > 1 ? '' : 'none';
  if (skipBtn) skipBtn.style.display = csCurrentStep === 3 ? '' : 'none';
  if (nextBtn) nextBtn.textContent   = csCurrentStep === 3 ? 'Submit' : 'Next';
}

// ── Ads tab toggle for Real-time step 3 ──────────────────────────────────

function csRtAdsTab(tab) {
  document.getElementById('cs-rt-ads-link').style.display    = tab === 'link' ? '' : 'none';
  document.getElementById('cs-rt-ads-desc').style.display    = tab === 'desc' ? '' : 'none';
  document.getElementById('cs-rt-ads-link-btn').className = 'cs-ads-btn' + (tab === 'link' ? ' cs-ads-btn--act' : '');
  document.getElementById('cs-rt-ads-desc-btn').className = 'cs-ads-btn' + (tab === 'desc' ? ' cs-ads-btn--act' : '');
}

// ── Add new thumbnail + submit ────────────────────────────────────────────

var CS_NEW_GRADS = [
  'linear-gradient(145deg,#ED005E,#A0003E)',
  'linear-gradient(145deg,#7C3AED,#4C1D95)',
  'linear-gradient(145deg,#0EA5E9,#0369A1)',
  'linear-gradient(145deg,#10B981,#065F46)',
  'linear-gradient(145deg,#F59E0B,#92400E)',
];

function csAddAndSubmit() {
  // Read content name from step 1 field
  var nameEl = document.getElementById('cs-rt-content-name');
  var title  = (nameEl && nameEl.value.trim()) || 'New Content';

  // Build initials from first two words
  var words    = title.split(/\s+/);
  var initials = (words[0][0] + (words[1] ? words[1][0] : words[0][1] || '')).toUpperCase();

  var newId  = 900 + csNewItems3.length;
  var grad   = CS_NEW_GRADS[csNewItems3.length % CS_NEW_GRADS.length];

  csNewItems3.unshift({ id: newId, title: title, initials: initials, grad: grad });
  csSelectedId3 = newId;

  csCloseModal();
  csRender3();
}

// ── Fake upload ───────────────────────────────────────────────────────────

function csFakeUpload() {
  var idle   = document.getElementById('cs-upload-idle');
  var chosen = document.getElementById('cs-upload-chosen');
  var label  = document.getElementById('cs-upload-label');
  if (!idle || !chosen) return;
  if (chosen.style.display !== 'none') return; // already uploaded

  // Uploading state
  idle.innerHTML =
    '<div class="cs-upload-spinner"></div>'
    + '<div class="cs-upload-text" style="color:var(--accent)">Uploading…</div>'
    + '<div class="cs-upload-hint" id="cs-fake-pct">0%</div>';

  var pct = 0;
  var iv = setInterval(function() {
    pct = Math.min(pct + Math.floor(Math.random() * 18 + 8), 100);
    var el = document.getElementById('cs-fake-pct');
    if (el) el.textContent = pct + '%';
    if (pct >= 100) {
      clearInterval(iv);
      idle.style.display   = 'none';
      chosen.style.display = 'flex';
      document.getElementById('cs-upload-filename').textContent = 'sample_ad_creative.mp4';
      document.getElementById('cs-upload-filesize').textContent = '47.3 MB';
      if (label) label.classList.remove('cs-upload-area--error');
    }
  }, 130);
}

// ── Content / Ads tab toggles ─────────────────────────────────────────────

function csContentTab(tab) {
  document.getElementById('cs-content-link').style.display   = tab === 'link'   ? '' : 'none';
  document.getElementById('cs-content-upload').style.display = tab === 'upload' ? '' : 'none';
  document.getElementById('cs-content-link-btn').className   = 'cs-ads-btn' + (tab === 'link'   ? ' cs-ads-btn--act' : '');
  document.getElementById('cs-content-upload-btn').className = 'cs-ads-btn' + (tab === 'upload' ? ' cs-ads-btn--act' : '');
  var li = document.getElementById('cs-link-input');
  if (li) li.classList.remove('cs-input--error');
  var ul = document.getElementById('cs-upload-label');
  if (ul) ul.classList.remove('cs-upload-area--error');
}

function csAdsTab(tab) {
  document.getElementById('cs-ads-link').style.display    = tab === 'link' ? '' : 'none';
  document.getElementById('cs-ads-desc').style.display    = tab === 'desc' ? '' : 'none';
  document.getElementById('cs-ads-link-btn').className = 'cs-ads-btn' + (tab === 'link' ? ' cs-ads-btn--act' : '');
  document.getElementById('cs-ads-desc-btn').className = 'cs-ads-btn' + (tab === 'desc' ? ' cs-ads-btn--act' : '');
}

function csOpenSuccessModal() {
  var modal = document.createElement('div');
  modal.id = 'cs-success-modal';
  modal.className = 'cs-modal-overlay';
  modal.innerHTML = `
    <div class="cs-modal" style="width:420px" onclick="event.stopPropagation()">
      <div class="cs-modal-header" style="border-bottom:none;padding-bottom:8px">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:36px;height:36px;border-radius:50%;background:#E6F5EA;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 9l4 4 6-7" stroke="#2EAD4B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="cs-modal-title">Request correctly submitted</div>
        </div>
        <button class="cs-modal-close" onclick="csCloseSuccessModal()">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div class="cs-modal-body" style="gap:12px;padding-top:8px">
        <div style="background:var(--bg);border-radius:10px;padding:14px 16px;display:flex;flex-direction:column;gap:8px">
          <div style="font-size:13px;color:var(--text)">
            Track the progress at this Jira link:
            <a href="https://kerv.atlassian.net/browse/KERV-1234" target="_blank" style="color:var(--accent);font-weight:500;text-decoration:none;margin-left:4px">KERV-1234 ↗</a>
          </div>
          <div style="height:1px;background:var(--border)"></div>
          <div style="font-size:13px;color:var(--text)">
            <span style="font-weight:500">Estimated SLA:</span> 5 days
          </div>
          <div style="height:1px;background:var(--border)"></div>
          <div style="font-size:13px;color:var(--muted)">
            The Product team will reach out to confirm the delivery date.
          </div>
        </div>
      </div>
      <div class="cs-modal-footer">
        <button class="cs-btn-primary" onclick="csCloseSuccessModal()">Done</button>
      </div>
    </div>
  `;
  modal.addEventListener('click', csCloseSuccessModal);
  document.body.appendChild(modal);
  setTimeout(function() { modal.classList.add('cs-modal-overlay--in'); }, 10);
}

function csCloseSuccessModal() {
  var modal = document.getElementById('cs-success-modal');
  if (!modal) return;
  modal.classList.remove('cs-modal-overlay--in');
  setTimeout(function() { modal.remove(); }, 200);
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

function csRenderProcess() {
  var container = document.getElementById('cs-process-container');
  if (!container) return;

  // Legend (sticky wrapper injected separately so it sticks independently)
  var legendHtml = '<div class="wf-legend-sticky">'
    + '<div class="wf-legend">'
    + Object.values(WF_ACTORS).map(function(a) {
        var members = a.label === 'Sales' ? ' — Marika, Ryan…'
          : a.label === 'Product / Tech' ? ' — Bruna, Grant, Ben'
          : '';
        return '<div class="wf-legend-item">'
          + '<span class="wf-legend-dot" style="background:' + a.color + '"></span>'
          + '<span class="wf-legend-name" style="color:' + a.color + ';font-weight:500">' + a.label + '</span>'
          + (members ? '<span class="wf-legend-members">' + members + '</span>' : '')
          + '</div>';
      }).join('')
    + '</div>'
    + '</div>';

  function nodeHtml(step, i) {
    var actors = step.actors.map(function(k) { return WF_ACTORS[k]; });
    var barBg;
    if (actors.length === 1) {
      barBg = actors[0].color;
    } else {
      var pct = 100 / actors.length;
      var stops = actors.map(function(a, j) {
        return a.color + ' ' + (j * pct) + '%, ' + a.color + ' ' + ((j + 1) * pct) + '%';
      }).join(', ');
      barBg = 'linear-gradient(90deg,' + stops + ')';
    }
    var pillsHtml = actors.map(function(a) {
      return '<span class="wf-pill" style="color:' + a.color + ';background:' + a.bg + '">' + a.label + '</span>';
    }).join('');
    return '<div class="wf-node">'
      + '<div class="wf-node-bar" style="background:' + barBg + '"></div>'
      + '<div class="wf-node-body">'
      + '<div class="wf-node-num">Step ' + (i + 1) + '</div>'
      + '<div class="wf-node-title">' + step.title + '</div>'
      + '<div class="wf-node-desc">' + step.desc + '</div>'
      + '<div class="wf-node-pills">' + pillsHtml + '</div>'
      + '</div>'
      + '</div>';
  }

  var arrowRight = '<div class="wf-arrow-h">'
    + '<svg width="20" height="12" viewBox="0 0 20 12" fill="none">'
    + '<path d="M0 6h16M11 1l5 5-5 5" stroke="#D0CFC9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
    + '</svg></div>';

  // Single horizontally-scrollable row — all 8 steps
  var rowHtml = '<div class="wf-scroll-outer">'
    + '<div class="wf-row-h">'
    + WF_STEPS.map(function(s, i) {
        return nodeHtml(s, i) + (i < WF_STEPS.length - 1 ? arrowRight : '');
      }).join('')
    + '</div>'
    + '</div>';

  container.innerHTML = legendHtml + rowHtml;
}

function csView(view) {
  ['mockup','process'].forEach(function(v) {
    var btn = document.getElementById('cs-vbtn-' + v);
    var panel = document.getElementById('cs-view-' + v);
    if (btn) btn.className = 'cs-view-btn' + (v === view ? ' cs-view-btn--act' : '');
    if (panel) panel.style.display = v === view ? '' : 'none';
  });
}

function csFilter(val) {
  csActiveFilter = val;
  csRender();
}

function csSelect(id) {
  if (id <= 3) { var it = CS_SHOWS.filter(function(s){ return s.id===id; })[0]; if (it) { csShowDetailView('manual', it); return; } }
  csSelectedId = id;
  csRender();
}

function csRender() {
  var grid = document.getElementById('cs-grid');
  if (!grid) return;
  var shows = CS_SHOWS.filter(function(s) {
    return csActiveFilter === 'all' || s.category === csActiveFilter;
  });
  grid.innerHTML = shows.map(function(s) {
    var sel = s.id === csSelectedId;
    var badge = s.badge ? '<div class="cs-badge">' + s.badge + '</div>' : '';
    return '<div class="cs-thumb' + (sel ? ' cs-thumb--sel' : '') + '" onclick="csSelect(' + s.id + ')">'
      + '<div class="cs-poster" style="background:' + s.grad + '">'
      + '<span class="cs-poster-initials">' + s.initials + '</span>'
      + badge
      + '</div>'
      + '<div class="cs-thumb-title">' + s.title + '</div>'
      + '</div>';
  }).join('');
}

// ── Panel 2 (Partially Automated) helpers ────────────────────────────────

function csView2(view) {
  ['mockup','process'].forEach(function(v) {
    var btn   = document.getElementById('cs-vbtn2-' + v);
    var panel = document.getElementById('cs-view2-' + v);
    if (btn)   btn.className   = 'cs-view-btn' + (v === view ? ' cs-view-btn--act' : '');
    if (panel) panel.style.display = v === view ? '' : 'none';
  });
}

function csFilter2(val) {
  csActiveFilter2 = val;
  csRender2();
}

function csSelect2(id) {
  if (id <= 3) { var it = CS_SHOWS.filter(function(s){ return s.id===id; })[0]; if (it) { csShowDetailView('selfserve', it); return; } }
  csSelectedId2 = id;
  csRender2();
}

function csRender2() {
  var grid = document.getElementById('cs-grid2');
  if (!grid) return;
  var shows = CS_SHOWS.filter(function(s) {
    return csActiveFilter2 === 'all' || s.category === csActiveFilter2;
  });
  grid.innerHTML = shows.map(function(s) {
    var sel   = s.id === csSelectedId2;
    var badge = s.badge ? '<div class="cs-badge">' + s.badge + '</div>' : '';
    return '<div class="cs-thumb' + (sel ? ' cs-thumb--sel' : '') + '" onclick="csSelect2(' + s.id + ')">'
      + '<div class="cs-poster" style="background:' + s.grad + '">'
      + '<span class="cs-poster-initials">' + s.initials + '</span>'
      + badge
      + '</div>'
      + '<div class="cs-thumb-title">' + s.title + '</div>'
      + '</div>';
  }).join('');
}

function csRenderProcess2() {
  var container = document.getElementById('cs-process-container2');
  if (!container) return;

  var legendHtml = '<div class="wf-legend-sticky">'
    + '<div class="wf-legend">'
    + Object.values(WF_ACTORS).map(function(a) {
        var members = a.label === 'Sales' ? ' — Marika, Ryan…'
          : a.label === 'Product / Tech' ? ' — Bruna, Grant, Ben'
          : '';
        return '<div class="wf-legend-item">'
          + '<span class="wf-legend-dot" style="background:' + a.color + '"></span>'
          + '<span class="wf-legend-name" style="color:' + a.color + ';font-weight:500">' + a.label + '</span>'
          + (members ? '<span class="wf-legend-members">' + members + '</span>' : '')
          + '</div>';
      }).join('')
    + '</div>'
    + '</div>';

  function nodeHtml(step, i) {
    var actors = step.actors.map(function(k) { return WF_ACTORS[k]; });
    var barBg;
    if (actors.length === 1) {
      barBg = actors[0].color;
    } else {
      var pct = 100 / actors.length;
      var stops = actors.map(function(a, j) {
        return a.color + ' ' + (j * pct) + '%, ' + a.color + ' ' + ((j + 1) * pct) + '%';
      }).join(', ');
      barBg = 'linear-gradient(90deg,' + stops + ')';
    }
    var pillsHtml = actors.map(function(a) {
      return '<span class="wf-pill" style="color:' + a.color + ';background:' + a.bg + '">' + a.label + '</span>';
    }).join('');
    return '<div class="wf-node">'
      + '<div class="wf-node-bar" style="background:' + barBg + '"></div>'
      + '<div class="wf-node-body">'
      + '<div class="wf-node-num">Step ' + (i + 1) + '</div>'
      + '<div class="wf-node-title">' + step.title + '</div>'
      + '<div class="wf-node-desc">' + step.desc + '</div>'
      + '<div class="wf-node-pills">' + pillsHtml + '</div>'
      + '</div>'
      + '</div>';
  }

  var arrowRight = '<div class="wf-arrow-h">'
    + '<svg width="20" height="12" viewBox="0 0 20 12" fill="none">'
    + '<path d="M0 6h16M11 1l5 5-5 5" stroke="#D0CFC9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
    + '</svg></div>';

  var rowHtml = '<div class="wf-scroll-outer">'
    + '<div class="wf-row-h">'
    + WF_STEPS.map(function(s, i) {
        return nodeHtml(s, i) + (i < WF_STEPS.length - 1 ? arrowRight : '');
      }).join('')
    + '</div>'
    + '</div>';

  container.innerHTML = legendHtml + rowHtml;
}

// ── Panel 3 (Real-time Analysis) helpers ─────────────────────────────────

var csActiveFilter3 = 'all';
var csSelectedId3   = 3;
var csNewItems3     = [];

function csView3(view) {
  ['mockup','process'].forEach(function(v) {
    var btn   = document.getElementById('cs-vbtn3-' + v);
    var panel = document.getElementById('cs-view3-' + v);
    if (btn)   btn.className       = 'cs-view-btn' + (v === view ? ' cs-view-btn--act' : '');
    if (panel) panel.style.display = v === view ? '' : 'none';
  });
}

function csFilter3(val) {
  csActiveFilter3 = val;
  csRender3();
}

function csSelect3(id) {
  var newItem = csNewItems3.filter(function(i) { return i.id === id; })[0];
  if (newItem) { csShowDetailView('realtime', newItem); return; }
  if (id <= 3) { var it = CS_SHOWS.filter(function(s){ return s.id===id; })[0]; if (it) { csShowDetailView('realtime', it); return; } }
  csSelectedId3 = id;
  csRender3();
}

function csBackToGrid3() {
  var panel = document.getElementById('sdt-panel-realtime');
  if (!panel) return;
  // Restore the toggle + views
  panel.innerHTML =
    '<div class="cs-toggle-sticky">'
    + '<div class="cs-view-toggle">'
    +   '<div class="cs-view-btn cs-view-btn--act" id="cs-vbtn3-mockup" onclick="csView3(\'mockup\')">Mockup</div>'
    +   '<div class="cs-view-btn" id="cs-vbtn3-process" onclick="csView3(\'process\')">Process</div>'
    + '</div></div>'
    + '<div id="cs-view3-mockup">'
    +   '<div class="cs-card"><div class="cs-title">Content Selection</div>'
    +   '<div class="cs-toolbar"><div class="cs-filter-wrap"><div class="cs-filter-label">Category</div>'
    +   '<select class="cs-filter-select" onchange="csFilter3(this.value)">'
    +   '<option value="all">All</option><option value="comedy">Comedy</option>'
    +   '<option value="drama">Drama</option><option value="reality">Reality</option>'
    +   '<option value="documentary">Documentary</option></select></div>'
    +   '<button class="cs-request-btn" onclick="csOpenModalRealtime()">'
    +   '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    +   ' Request New Content</button></div>'
    +   '<div class="cs-grid" id="cs-grid3"></div></div></div>'
    + '<div id="cs-view3-process" style="display:none"><div id="cs-process-container3"></div></div>';
  csRender3();
  csRenderProcess3();
}

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
  } else if (panelKey === 'selfserve') {
    var panel = document.getElementById('sdt-panel-selfserve');
    if (!panel) return;
    panel.innerHTML =
      '<div class="cs-toggle-sticky"><div class="cs-view-toggle">'
      + '<div class="cs-view-btn cs-view-btn--act" id="cs-vbtn2-mockup" onclick="csView2(\'mockup\')">Mockup</div>'
      + '<div class="cs-view-btn" id="cs-vbtn2-process" onclick="csView2(\'process\')">Process</div>'
      + '</div></div>'
      + '<div id="cs-view2-mockup">'
      + '<div class="cs-card"><div class="cs-title">Content Selection</div>'
      + '<div class="cs-toolbar"><div class="cs-filter-wrap"><div class="cs-filter-label">Category</div>'
      + '<select class="cs-filter-select" onchange="csFilter2(this.value)">'
      + '<option value="all">All</option><option value="comedy">Comedy</option>'
      + '<option value="drama">Drama</option><option value="reality">Reality</option>'
      + '<option value="documentary">Documentary</option></select></div>'
      + '<button class="cs-request-btn" onclick="csOpenModal()">'
      + '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
      + ' Request New Content</button></div>'
      + '<div class="cs-grid" id="cs-grid2"></div></div></div>'
      + '<div id="cs-view2-process" style="display:none"><div id="cs-process-container2"></div></div>';
    csRender2();
    csRenderProcess2();
  } else if (panelKey === 'taxonomy') {
    var panel = document.getElementById('sdt-panel-taxonomy');
    if (!panel) return;
    panel.innerHTML =
      '<div class="cs-card"><div class="cs-title">Content Selection</div>'
      + '<div class="cs-toolbar"><div class="cs-filter-wrap"><div class="cs-filter-label">Category</div>'
      + '<select class="cs-filter-select" onchange="csTxFilter(this.value)">'
      + '<option value="all">All</option><option value="comedy">Comedy</option>'
      + '<option value="drama">Drama</option><option value="reality">Reality</option>'
      + '<option value="documentary">Documentary</option></select></div>'
      + '<button class="cs-request-btn" onclick="csOpenModalTaxonomy()">'
      + '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
      + ' Request New Content</button></div>'
      + '<div class="cs-grid" id="cs-grid4"></div></div>';
    csTxRender();
    csTxRenderProcess();
  } else if (panelKey === 'taxonomy2') {
    // Dashboard shell stays — restore content area and sidebar to "Metadata Analysis"
    csTx2NavTab('metadata');
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

  var panelId = panelKey === 'manual'    ? 'sdt-panel-manual'
              : panelKey === 'selfserve'  ? 'sdt-panel-selfserve'
              : panelKey === 'taxonomy'   ? 'sdt-panel-taxonomy'
              : panelKey === 'taxonomy2'  ? 'sdt-panel-taxonomy2'
              : 'sdt-panel-realtime';
  var panel = document.getElementById(panelId);
  if (!panel) return;

  // For taxonomy2 target only the inner content area
  var renderTarget = isTax2
    ? (document.getElementById('tx2-content-area') || panel)
    : panel;

  csDetailViewPanel = panelKey;
  csDetailPanels3 = { tax: true, prod: true, json: true };

  // Tab nav — only for Taxonomy Explorer v1 (panel 4)
  var isTaxPanel = panelKey === 'taxonomy';

  var txTabNav = isTaxPanel
    ? '<div class="cs-dv-tabnav">'
    +   '<button class="cs-dv-tab cs-dv-tab--act" id="cs-dv-tab-metadata"   onclick="csDvTab(\'metadata\')">Metadata</button>'
    +   '<button class="cs-dv-tab" id="cs-dv-tab-moments"                   onclick="csDvTab(\'moments\')">Moments</button>'
    +   '<button class="cs-dv-tab" id="cs-dv-tab-taxonomies"                onclick="csDvTab(\'taxonomies\')">Taxonomies</button>'
    +   '<button class="cs-dv-tab" id="cs-dv-tab-episodes"                  onclick="csDvTab(\'episodes\')">Episodes &amp; Shows</button>'
    + '</div>'
    : '';

  var metaOpen  = isTaxPanel ? '<div id="cs-dv-tab-content-metadata" style="display:flex;flex-direction:column;gap:14px">' : '';
  var metaClose = isTaxPanel ? '</div>' : '';

  var TH = 'padding:9px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);border-bottom:1px solid var(--border)';
  var txExtraContent = isTaxPanel

    // ── Moments ──
    ? '<div id="cs-dv-tab-content-moments" style="display:none;overflow-y:auto;max-height:calc(100vh - 320px)">'
    +   '<table style="width:100%;border-collapse:collapse"><thead><tr>'
    +     '<th style="text-align:left;'  + TH + '">Category</th>'
    +     '<th style="text-align:right;' + TH + '">Score</th>'
    +     '<th style="text-align:right;' + TH + '">Assets</th>'
    +   '</tr></thead><tbody id="tx-cat-body"></tbody></table>'
    + '</div>'

    // ── Taxonomies ──
    + '<div id="cs-dv-tab-content-taxonomies" style="display:none;overflow-y:auto;max-height:calc(100vh - 320px)">'
    +   '<div style="display:grid;grid-template-columns:1fr 256px;gap:16px;align-items:start">'
    +     '<div style="min-width:0">'
    +       '<div class="tx-ctabs-nav">'
    +         '<div class="tx-ctab tx-ctab--act" id="tx-ctab-emotion"     onclick="txCustomTab(\'emotion\')">Emotion</div>'
    +         '<div class="tx-ctab"              id="tx-ctab-location"    onclick="txCustomTab(\'location\')">Location</div>'
    +         '<div class="tx-ctab"              id="tx-ctab-objects"     onclick="txCustomTab(\'objects\')">Objects</div>'
    +         '<div class="tx-ctab"              id="tx-ctab-sentiment"   onclick="txCustomTab(\'sentiment\')">Sentiment</div>'
    +         '<div class="tx-ctab"              id="tx-ctab-iab"         onclick="txCustomTab(\'iab\')">IAB</div>'
    +         '<div class="tx-ctab"              id="tx-ctab-brandsafety" onclick="txCustomTab(\'brandsafety\')">Brand Safety</div>'
    +       '</div>'
    +       '<div id="tx-ctab-table"></div>'
    +       '<div id="tx-ctab-pagination"></div>'
    +     '</div>'
    +     '<div style="position:sticky;top:16px;display:flex;flex-direction:column;height:480px;gap:0">'
    +       '<div class="tx-chips-panel" id="tx-chips-panel">'
    +         '<div class="tx-chips-title">Selected Taxonomies</div>'
    +         '<div class="tx-chips-empty" id="tx-chips-empty">Select taxonomies from the table</div>'
    +         '<div id="tx-chips-content" style="display:none"></div>'
    +       '</div>'
    +       '<div class="tx-save-panel">'
    +         '<div class="tx-save-label">Save as Moment</div>'
    +         '<input class="tx-moment-input" id="tx-moment-name" type="text" placeholder="Name this moment…">'
    +         '<button class="tx-save-btn" onclick="txSaveMoment()">'
    +           '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 2h8l2 2v8a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" stroke-width="1.5"/><path d="M5 13V8h4v5M4 2v3h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
    +           ' Save Moment'
    +         '</button>'
    +       '</div>'
    +     '</div>'
    +   '</div>'
    + '</div>'

    // ── Episodes & Shows ──
    + '<div id="cs-dv-tab-content-episodes" style="display:none;overflow-y:auto;max-height:calc(100vh - 320px)">'
    +   '<table style="width:100%;border-collapse:collapse"><thead><tr>'
    +     '<th style="text-align:left;'  + TH + '">Show / Episode</th>'
    +     '<th style="text-align:left;'  + TH + '">Channel</th>'
    +     '<th style="text-align:right;' + TH + '">Match</th>'
    +   '</tr></thead><tbody id="tx-eps-body"></tbody></table>'
    + '</div>'

    : '';

  // Build the shared detail view card HTML
  var detailCard =
    // ── Mockup / Process toggle — hidden for taxonomy and taxonomy2 ──
    (isTax2 || isTaxPanel ? '' :
      '<div class="cs-toggle-sticky">'
      + '<div class="cs-view-toggle">'
      +   '<div class="cs-view-btn cs-view-btn--act" id="cs-dv-vbtn-mockup" onclick="csDvToggleView(\'mockup\')">Mockup</div>'
      +   '<div class="cs-view-btn" id="cs-dv-vbtn-process" onclick="csDvToggleView(\'process\')">Process</div>'
      + '</div>'
      + '</div>'
    )

    // ── Mockup view wrapper (tax/tax2: no wrapper; others: wrapped for toggle) ──
    + (isTax2 || isTaxPanel ? '' : '<div id="cs-dv-view-mockup">')
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

    // Close metadata wrapper + add other tab contents (taxonomy only)
    + metaClose
    + txExtraContent

    + '</div>' // close cs-card
    + (isTax2 || isTaxPanel ? '' : '</div>') // close cs-dv-view-mockup

    // ── Process view — not shown for taxonomy or taxonomy2 ──
    + (isTax2 || isTaxPanel ? '' :
        '<div id="cs-dv-view-process" style="display:none">'
        + '<div id="cs-process-container3"></div>'
        + '</div>'
      );

  // Inject into the correct target
  renderTarget.innerHTML = detailCard;

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
    var btn     = document.getElementById('cs-dv-tab-' + t);
    var content = document.getElementById('cs-dv-tab-content-' + t);
    if (btn)     btn.className = 'cs-dv-tab' + (t === tab ? ' cs-dv-tab--act' : '');
    if (content) content.style.display = t === tab ? '' : 'none';
  });
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

function csRender3() {
  var grid = document.getElementById('cs-grid3');
  if (!grid) return;
  var shows = CS_SHOWS.filter(function(s) {
    return csActiveFilter3 === 'all' || s.category === csActiveFilter3;
  });

  // New items always shown (no category filter)
  var newHtml = csNewItems3.map(function(s) {
    var sel = s.id === csSelectedId3;
    return '<div class="cs-thumb' + (sel ? ' cs-thumb--sel' : '') + '" onclick="csSelect3(' + s.id + ')">'
      + '<div class="cs-poster" style="background:' + s.grad + '">'
      + '<span class="cs-poster-initials">' + s.initials + '</span>'
      + '<div class="cs-badge cs-badge--new">NEW</div>'
      + '</div>'
      + '<div class="cs-thumb-title">' + s.title + '</div>'
      + '</div>';
  }).join('');

  var existingHtml = shows.map(function(s) {
    var sel   = s.id === csSelectedId3;
    var badge = s.badge ? '<div class="cs-badge">' + s.badge + '</div>' : '';
    return '<div class="cs-thumb' + (sel ? ' cs-thumb--sel' : '') + '" onclick="csSelect3(' + s.id + ')">'
      + '<div class="cs-poster" style="background:' + s.grad + '">'
      + '<span class="cs-poster-initials">' + s.initials + '</span>'
      + badge
      + '</div>'
      + '<div class="cs-thumb-title">' + s.title + '</div>'
      + '</div>';
  }).join('');

  grid.innerHTML = newHtml + existingHtml;
}

function csRenderProcess3() {
  var container = document.getElementById('cs-process-container3');
  if (!container) return;

  var legendHtml = '<div class="wf-legend-sticky">'
    + '<div class="wf-legend">'
    + Object.values(WF_ACTORS).map(function(a) {
        var members = a.label === 'Sales' ? ' — Marika, Ryan…'
          : a.label === 'Product / Tech' ? ' — Bruna, Grant, Ben'
          : '';
        return '<div class="wf-legend-item">'
          + '<span class="wf-legend-dot" style="background:' + a.color + '"></span>'
          + '<span class="wf-legend-name" style="color:' + a.color + ';font-weight:500">' + a.label + '</span>'
          + (members ? '<span class="wf-legend-members">' + members + '</span>' : '')
          + '</div>';
      }).join('')
    + '</div>'
    + '</div>';

  function nodeHtml(step, i) {
    var actors = step.actors.map(function(k) { return WF_ACTORS[k]; });
    var barBg;
    if (actors.length === 1) {
      barBg = actors[0].color;
    } else {
      var pct = 100 / actors.length;
      var stops = actors.map(function(a, j) {
        return a.color + ' ' + (j * pct) + '%, ' + a.color + ' ' + ((j + 1) * pct) + '%';
      }).join(', ');
      barBg = 'linear-gradient(90deg,' + stops + ')';
    }
    var pillsHtml = actors.map(function(a) {
      return '<span class="wf-pill" style="color:' + a.color + ';background:' + a.bg + '">' + a.label + '</span>';
    }).join('');
    return '<div class="wf-node">'
      + '<div class="wf-node-bar" style="background:' + barBg + '"></div>'
      + '<div class="wf-node-body">'
      + '<div class="wf-node-num">Step ' + (i + 1) + '</div>'
      + '<div class="wf-node-title">' + step.title + '</div>'
      + '<div class="wf-node-desc">' + step.desc + '</div>'
      + '<div class="wf-node-pills">' + pillsHtml + '</div>'
      + '</div>'
      + '</div>';
  }

  var arrowRight = '<div class="wf-arrow-h">'
    + '<svg width="20" height="12" viewBox="0 0 20 12" fill="none">'
    + '<path d="M0 6h16M11 1l5 5-5 5" stroke="#D0CFC9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
    + '</svg></div>';

  var rowHtml = '<div class="wf-scroll-outer">'
    + '<div class="wf-row-h">'
    + WF_STEPS.map(function(s, i) {
        return nodeHtml(s, i) + (i < WF_STEPS.length - 1 ? arrowRight : '');
      }).join('')
    + '</div>'
    + '</div>';

  container.innerHTML = legendHtml + rowHtml;
}

// ── Panel 4 (Taxonomy Explorer v1) helpers ───────────────────────────────

var csActiveTxFilter = 'all';
var csSelectedTxId   = 1;

function csTxView(view) {
  ['mockup','process'].forEach(function(v) {
    var btn   = document.getElementById('cs-vbtn4-' + v);
    var panel = document.getElementById('cs-view4-' + v);
    if (btn)   btn.className       = 'cs-view-btn' + (v === view ? ' cs-view-btn--act' : '');
    if (panel) panel.style.display = v === view ? '' : 'none';
  });
}

function csTxFilter(val) {
  csActiveTxFilter = val;
  csTxRender();
}

function csTxSelect(id) {
  if (id <= 3) {
    var it = CS_SHOWS.filter(function(s) { return s.id === id; })[0];
    if (it) { csShowDetailView('taxonomy', it); return; }
  }
  csSelectedTxId = id;
  csTxRender();
}

function csTxRender() {
  var grid = document.getElementById('cs-grid4');
  if (!grid) return;
  var shows = CS_SHOWS.filter(function(s) {
    return csActiveTxFilter === 'all' || s.category === csActiveTxFilter;
  });
  grid.innerHTML = shows.map(function(s) {
    var sel   = s.id === csSelectedTxId;
    var badge = s.badge ? '<div class="cs-badge">' + s.badge + '</div>' : '';
    return '<div class="cs-thumb' + (sel ? ' cs-thumb--sel' : '') + '" onclick="csTxSelect(' + s.id + ')">'
      + '<div class="cs-poster" style="background:' + s.grad + '">'
      + '<span class="cs-poster-initials">' + s.initials + '</span>'
      + badge
      + '</div>'
      + '<div class="cs-thumb-title">' + s.title + '</div>'
      + '</div>';
  }).join('');
}

function csTxRenderProcess() {
  var container = document.getElementById('cs-process-container4');
  if (!container) return;

  var legendHtml = '<div class="wf-legend-sticky">'
    + '<div class="wf-legend">'
    + Object.values(WF_ACTORS).map(function(a) {
        var members = a.label === 'Sales' ? ' — Marika, Ryan…'
          : a.label === 'Product / Tech' ? ' — Bruna, Grant, Ben'
          : '';
        return '<div class="wf-legend-item">'
          + '<span class="wf-legend-dot" style="background:' + a.color + '"></span>'
          + '<span class="wf-legend-name" style="color:' + a.color + ';font-weight:500">' + a.label + '</span>'
          + (members ? '<span class="wf-legend-members">' + members + '</span>' : '')
          + '</div>';
      }).join('')
    + '</div>'
    + '</div>';

  function nodeHtml(step, i) {
    var actors = step.actors.map(function(k) { return WF_ACTORS[k]; });
    var barBg;
    if (actors.length === 1) {
      barBg = actors[0].color;
    } else {
      var pct = 100 / actors.length;
      var stops = actors.map(function(a, j) {
        return a.color + ' ' + (j * pct) + '%, ' + a.color + ' ' + ((j + 1) * pct) + '%';
      }).join(', ');
      barBg = 'linear-gradient(90deg,' + stops + ')';
    }
    var pillsHtml = actors.map(function(a) {
      return '<span class="wf-pill" style="color:' + a.color + ';background:' + a.bg + '">' + a.label + '</span>';
    }).join('');
    return '<div class="wf-node">'
      + '<div class="wf-node-bar" style="background:' + barBg + '"></div>'
      + '<div class="wf-node-body">'
      + '<div class="wf-node-num">Step ' + (i + 1) + '</div>'
      + '<div class="wf-node-title">' + step.title + '</div>'
      + '<div class="wf-node-desc">' + step.desc + '</div>'
      + '<div class="wf-node-pills">' + pillsHtml + '</div>'
      + '</div>'
      + '</div>';
  }

  var arrowRight = '<div class="wf-arrow-h">'
    + '<svg width="20" height="12" viewBox="0 0 20 12" fill="none">'
    + '<path d="M0 6h16M11 1l5 5-5 5" stroke="#D0CFC9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
    + '</svg></div>';

  var rowHtml = '<div class="wf-scroll-outer">'
    + '<div class="wf-row-h">'
    + WF_STEPS.map(function(s, i) {
        return nodeHtml(s, i) + (i < WF_STEPS.length - 1 ? arrowRight : '');
      }).join('')
    + '</div>'
    + '</div>';

  container.innerHTML = legendHtml + rowHtml;
}

// ── Panel 5 (Taxonomy Explorer v2) helpers ───────────────────────────────

var csActiveTx2Filter  = 'all';
var csSelectedTx2Id    = 1;
var csTx2TaxStep       = 'upload'; // 'upload' | 'progress' | 'results'
var csTx2TaxInputType  = 'video';  // 'video' | 'doc' | 'text'
var csTx2TaxFileName   = '';       // display name shown in results header

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

  } else if (tab === 'taxonomy') {
    // Branch on current step
    if (csTx2TaxStep === 'results') {
      csTx2TaxShowResults();
    } else {
      csTx2TaxShowUpload();
    }
  }
}

// ── Taxonomy Explorer: Upload step ───────────────────────────────────────────

function csTx2TaxShowUpload() {
  csTx2TaxStep = 'upload';
  var ca = document.getElementById('tx2-content-area');
  if (!ca) return;

  function inputArea(type) {
    var uploadZone =
        '<div class="tx2-upload-zone" onclick="document.getElementById(\'tx2-file-input-' + type + '\').click()">'
      + '  <input type="file" id="tx2-file-input-' + type + '" style="display:none"'
      + (type === 'video' ? ' accept="video/*"' : ' accept=".pdf,.doc,.docx"') + '>'
      + '  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" style="color:var(--faint)">'
      + (type === 'video'
          ? '<rect x="2" y="6" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.6"/><path d="M22 13l8-5v16l-8-5V13z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>'
          : '<path d="M6 4h14l6 6v18a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" stroke-width="1.6"/><path d="M20 4v6h6M10 14h12M10 18h12M10 22h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>')
      + '  </svg>'
      + '  <div style="font-size:13px;font-weight:500;color:var(--text);margin-top:6px">'
      + (type === 'video' ? 'Drop video file here' : 'Drop PDF or document here')
      + '  </div>'
      + '  <div style="font-size:11px;color:var(--faint);margin-top:2px">'
      + (type === 'video' ? 'MP4, MOV, AVI — up to 2 GB' : 'PDF, DOCX, TXT — up to 50 MB')
      + '  </div>'
      + ''
      + '</div>';

    var textArea =
        '<textarea class="cs-textarea" id="tx2-text-input" placeholder="Paste or type your text here. The AI will analyse topics, sentiments, moments and taxonomy classifications…" style="width:100%;box-sizing:border-box;min-height:160px;resize:vertical"></textarea>';

    return type === 'text' ? textArea : uploadZone;
  }

  var TX2_LIBRARY = [
    { type:'video', name:'below-deck-s12e03.mp4',        date:'2 May 2025',   moments:14, taxonomies:38 },
    { type:'video', name:'parks-and-rec-s04e11.mp4',     date:'29 Apr 2025',  moments:9,  taxonomies:22 },
    { type:'doc',   name:'Q1-content-brief.pdf',         date:'25 Apr 2025',  moments:6,  taxonomies:17 },
    { type:'text',  name:'Campaign brief — Spring 2025', date:'18 Apr 2025',  moments:4,  taxonomies:11 },
    { type:'video', name:'yellowstone-s05e08.mp4',       date:'11 Apr 2025',  moments:21, taxonomies:54 },
    { type:'doc',   name:'Brand-safety-guidelines.docx', date:'3 Apr 2025',   moments:3,  taxonomies:9  },
  ];

  function typeIcon(t) {
    return t === 'video'
      ? '<svg width="13" height="13" viewBox="0 0 32 32" fill="none"><rect x="2" y="6" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M22 13l8-5v16l-8-5V13z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'
      : t === 'doc'
      ? '<svg width="13" height="13" viewBox="0 0 32 32" fill="none"><path d="M6 4h14l6 6v18a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" stroke-width="1.8"/><path d="M20 4v6h6M10 14h12M10 18h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
      : '<svg width="13" height="13" viewBox="0 0 32 32" fill="none"><path d="M4 8h24M4 14h18M4 20h24M4 26h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  }

  var libraryRows = TX2_LIBRARY.map(function(item, i) {
    return '<div class="tx2-lib-row" onclick="csTx2LibLoad(' + i + ')">'
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

    // ── Left: New Analysis ──
    + '<div style="width:300px;flex-shrink:0;padding-right:24px;border-right:1px solid var(--border)">'
    +   '<div style="margin-bottom:20px">'
    +     '<div style="font-size:14px;font-weight:600;color:var(--text);letter-spacing:-.2px;margin-bottom:3px">New Analysis</div>'
    +     '<div style="font-size:12px;color:var(--muted)">Choose an input type</div>'
    +   '</div>'

    // Option selector — horizontal segmented toggle (Video / Brief)
    +   '<div style="display:flex;gap:2px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:3px;margin-bottom:16px">'
    +     '<div class="tx2-seg tx2-seg--act" id="tx2-opt-video" onclick="csTx2TaxSelectInput(\'video\')">'
    +       '<svg width="13" height="13" viewBox="0 0 32 32" fill="none"><rect x="2" y="6" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M22 13l8-5v16l-8-5V13z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'
    +       '<span>Video</span>'
    +     '</div>'
    +     '<div class="tx2-seg" id="tx2-opt-brief" onclick="csTx2TaxSelectInput(\'brief\')">'
    +       '<svg width="13" height="13" viewBox="0 0 32 32" fill="none"><path d="M4 8h24M4 14h18M4 20h24M4 26h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
    +       '<span>Brief</span>'
    +     '</div>'
    +   '</div>'

    // Input area (video upload by default; brief shows sub-toggle)
    +   '<div id="tx2-input-area" style="margin-bottom:16px">' + inputArea('video') + '</div>'

    +   '<button class="cs-btn-primary" style="width:100%;height:38px;font-size:13px" onclick="csTx2TaxAnalyze()">Start Analysis</button>'
    + '</div>'

    // ── Right: Library ──
    + '<div style="flex:1;min-width:0;padding-left:24px;display:flex;flex-direction:column">'
    +   '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">'
    +     '<div>'
    +       '<div style="font-size:14px;font-weight:600;color:var(--text);letter-spacing:-.2px;margin-bottom:3px">Previous Analyses</div>'
    +       '<div style="font-size:12px;color:var(--muted)">' + TX2_LIBRARY.length + ' completed</div>'
    +     '</div>'
    +     '<div style="display:flex;gap:6px">'
    +       '<input type="text" placeholder="Search…" style="height:28px;border:1px solid var(--border-md);border-radius:6px;padding:0 10px;font-size:12px;font-family:inherit;color:var(--text);background:var(--surface);outline:none;width:140px">'
    +     '</div>'
    +   '</div>'
    +   '<div style="display:flex;flex-direction:column;gap:0;overflow-y:auto;flex:1">'
    +     libraryRows
    +   '</div>'
    + '</div>'

    + '</div>';
}

function csTx2LibLoad(idx) {
  var TX2_LIBRARY = [
    { type:'video', name:'below-deck-s12e03.mp4' },
    { type:'video', name:'parks-and-rec-s04e11.mp4' },
    { type:'doc',   name:'Q1-content-brief.pdf' },
    { type:'text',  name:'Campaign brief — Spring 2025' },
    { type:'video', name:'yellowstone-s05e08.mp4' },
    { type:'doc',   name:'Brand-safety-guidelines.docx' },
  ];
  var item = TX2_LIBRARY[idx];
  if (!item) return;
  csTx2TaxInputType = item.type;
  csTx2TaxFileName  = item.name;
  csTx2TaxShowResults();
}

function csTx2TaxSelectInput(type) {
  // type is 'video' or 'brief'
  ['video', 'brief'].forEach(function(t) {
    var el = document.getElementById('tx2-opt-' + t);
    if (el) el.className = 'tx2-seg' + (t === type ? ' tx2-seg--act' : '');
  });
  var area = document.getElementById('tx2-input-area');
  if (!area) return;

  if (type === 'video') {
    csTx2TaxInputType = 'video';
    area.innerHTML =
      '<div class="tx2-upload-zone" onclick="document.getElementById(\'tx2-file-input-video\').click()">'
      + '<input type="file" id="tx2-file-input-video" style="display:none" accept="video/*">'
      + '<svg width="28" height="28" viewBox="0 0 32 32" fill="none" style="color:var(--faint)"><rect x="2" y="6" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.6"/><path d="M22 13l8-5v16l-8-5V13z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
      + '<div style="font-size:13px;font-weight:500;color:var(--text);margin-top:6px">Drop video file here</div>'
      + '<div style="font-size:11px;color:var(--faint);margin-top:2px">MP4, MOV, AVI — up to 2 GB</div>'
      + '</div>';
  } else {
    // Brief: default to free text input, with sub-toggle
    csTx2TaxInputType = 'text';
    area.innerHTML = csTx2BriefHtml('text');
  }
}

function csTx2BriefHtml() {
  return '<div style="border:1px solid var(--border-md);border-radius:8px;overflow:hidden;background:var(--surface)">'
    + '<textarea id="tx2-text-input"'
    + ' placeholder="Paste or type your brief here. The AI will analyse topics, sentiments, moments and taxonomy classifications…"'
    + ' style="width:100%;box-sizing:border-box;min-height:160px;resize:none;border:none;outline:none;padding:10px 12px;font-size:13px;font-family:inherit;color:var(--text);background:transparent;display:block"></textarea>'
    + '<div style="height:1px;background:var(--border)"></div>'
    + '<label for="tx2-file-input-doc" id="tx2-brief-upload-label"'
    +   ' style="display:flex;align-items:center;gap:7px;padding:8px 12px;cursor:pointer;color:var(--muted);font-size:12px;transition:background .13s,color .13s;border-radius:0 0 8px 8px"'
    +   ' onmouseenter="this.style.background=\'var(--bg)\';this.style.color=\'var(--text)\'"'
    +   ' onmouseleave="this.style.background=\'\';this.style.color=\'var(--muted)\'">'
    +   '<svg width="13" height="13" viewBox="0 0 32 32" fill="none"><path d="M6 4h14l6 6v18a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" stroke-width="1.8"/><path d="M20 4v6h6M10 14h12M10 18h12M10 22h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
    +   '<span id="tx2-brief-file-label">Upload Doc or PDF</span>'
    + '</label>'
    + '<input type="file" id="tx2-file-input-doc" style="display:none" accept=".pdf,.doc,.docx"'
    +   ' onchange="var n=this.files[0]?this.files[0].name:\'\';document.getElementById(\'tx2-brief-file-label\').textContent=n||\'Upload Doc or PDF\';csTx2TaxInputType=n?\'doc\':\'text\'">'
    + '</div>';
}

function csTx2TaxAnalyze() {
  var ca = document.getElementById('tx2-content-area');
  if (!ca) return;
  csTx2TaxStep = 'progress';

  var typeLabel = csTx2TaxInputType === 'video' ? 'video file'
               : csTx2TaxInputType === 'doc'   ? 'document'
               : 'text input';

  // Capture display name from the actual input
  if (csTx2TaxInputType === 'text') {
    var ta = document.getElementById('tx2-text-input');
    var raw = ta ? ta.value.trim() : '';
    csTx2TaxFileName = raw.length ? (raw.slice(0, 42) + (raw.length > 42 ? '…' : '')) : 'Free text input';
  } else {
    var fi = document.getElementById('tx2-file-input-' + csTx2TaxInputType);
    csTx2TaxFileName = (fi && fi.files && fi.files[0]) ? fi.files[0].name
      : (csTx2TaxInputType === 'video' ? 'video-file.mp4' : 'document.pdf');
  }

  var progressSteps = [
    'Analyzing metadata…',
    'Detecting scenes & objects…',
    'Classifying moments…',
    'Building taxonomy map…',
    'Matching episodes & shows…'
  ];

  // Video frames (different Picsum images per scene)
  var frames = [
    'https://picsum.photos/seed/kervscene1/640/360',
    'https://picsum.photos/seed/kervscene2/640/360',
    'https://picsum.photos/seed/kervscene3/640/360',
    'https://picsum.photos/seed/kervscene4/640/360',
    'https://picsum.photos/seed/kervscene5/640/360',
  ];

  ca.innerHTML =
    '<div style="max-width:520px;margin:0 auto">'

    // 16:9 player
    + '<div style="position:relative;width:100%;padding-top:56.25%;border-radius:10px;overflow:hidden;background:#111;margin-bottom:14px">'
    +   '<img id="tx2-prog-frame" src="' + frames[0] + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:opacity .5s">'
    // scan line
    +   '<div id="tx2-scan-line" style="position:absolute;left:0;right:0;height:2px;top:0%;background:rgba(237,0,94,.7);box-shadow:0 0 10px 2px rgba(237,0,94,.35);transition:none"></div>'
    // bottom gradient + timecode
    +   '<div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.65) 0%,transparent 55%);pointer-events:none">'
    +     '<div style="position:absolute;bottom:10px;left:12px;right:12px;display:flex;align-items:center;justify-content:space-between">'
    +       '<span id="tx2-prog-timecode" style="font-size:10px;color:rgba(255,255,255,.75);font-variant-numeric:tabular-nums;letter-spacing:.5px">00:00:00</span>'
    +       '<span id="tx2-prog-scene"    style="font-size:10px;color:rgba(255,255,255,.5)">Scene 1 / 5</span>'
    +     '</div>'
    +   '</div>'
    + '</div>'

    // Status label
    + '<div style="font-size:12px;color:var(--muted);margin-bottom:10px;min-height:18px" id="tx2-progress-label">' + progressSteps[0] + '</div>'

    // Progress bar
    + '<div class="tx2-progress-track" style="margin-bottom:7px">'
    +   '<div class="tx2-progress-fill" id="tx2-progress-bar" style="width:0%"></div>'
    + '</div>'

    // Percentage
    + '<div style="font-size:11px;color:var(--faint);text-align:right" id="tx2-progress-pct">0%</div>'

    + '</div>';

  var pct      = 0;
  var stepIdx  = 0;
  var scanPct  = 0;
  var frameIdx = 0;

  var interval = setInterval(function() {
    pct     = Math.min(pct + 0.45, 100);
    scanPct = (scanPct + 3) % 100;

    var bar      = document.getElementById('tx2-progress-bar');
    var label    = document.getElementById('tx2-progress-label');
    var pctEl    = document.getElementById('tx2-progress-pct');
    var scanLine = document.getElementById('tx2-scan-line');
    var timecode = document.getElementById('tx2-prog-timecode');
    var sceneLbl = document.getElementById('tx2-prog-scene');
    var frameEl  = document.getElementById('tx2-prog-frame');

    if (bar)      bar.style.width = pct + '%';
    if (pctEl)    pctEl.textContent = Math.round(pct) + '%';
    if (scanLine) scanLine.style.top = scanPct + '%';

    // Timecode: simulate 44m15s video
    var totalSec = Math.round((pct / 100) * 2655);
    var hh = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    var mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    var ss = String(totalSec % 60).padStart(2, '0');
    if (timecode) timecode.textContent = hh + ':' + mm + ':' + ss;

    // Switch frame & step at 20% intervals
    var newStep = Math.min(Math.floor(pct / 20), progressSteps.length - 1);
    if (newStep !== stepIdx) {
      stepIdx = newStep;
      if (label) label.textContent = progressSteps[stepIdx];
      // Crossfade to next frame
      var newFrameIdx = Math.min(newStep, frames.length - 1);
      if (frameEl && newFrameIdx !== frameIdx) {
        frameIdx = newFrameIdx;
        frameEl.style.opacity = '0';
        setTimeout(function() {
          if (frameEl) { frameEl.src = frames[frameIdx]; frameEl.style.opacity = '1'; }
        }, 250);
      }
      if (sceneLbl) sceneLbl.textContent = 'Scene ' + (newStep + 1) + ' / 5';
    }

    if (pct >= 100) {
      clearInterval(interval);
      if (scanLine) scanLine.style.display = 'none';
      setTimeout(csTx2TaxShowResults, 600);
    }
  }, 40); // ~9s total
}

// ── Taxonomy Explorer: Results step (Moments / Taxonomies / Episodes) ─────────

function csTx2TaxShowResults() {
  csTx2TaxStep = 'results';
  var ca = document.getElementById('tx2-content-area');
  if (!ca) return;
  var TH = 'padding:9px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);border-bottom:1px solid var(--border)';
  var fileIcon = csTx2TaxInputType === 'video'
    ? '<svg width="12" height="12" viewBox="0 0 32 32" fill="none"><rect x="2" y="6" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M22 13l8-5v16l-8-5V13z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'
    : csTx2TaxInputType === 'doc'
    ? '<svg width="12" height="12" viewBox="0 0 32 32" fill="none"><path d="M6 4h14l6 6v18a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" stroke-width="1.8"/><path d="M20 4v6h6M10 14h12M10 18h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
    : '<svg width="12" height="12" viewBox="0 0 32 32" fill="none"><path d="M4 8h24M4 14h18M4 20h24M4 26h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

  ca.innerHTML =
    // Back button row + filename badge
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">'
    + '<button class="cs-dv-back" onclick="csTx2TaxShowUpload()">'
    +   '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +   ' BACK TO UPLOAD'
    + '</button>'
    + '<div style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--muted);background:var(--bg);border:1px solid var(--border);border-radius:20px;padding:3px 10px;max-width:240px;overflow:hidden">'
    +   '<span style="color:var(--faint);flex-shrink:0">' + fileIcon + '</span>'
    +   '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + csTx2TaxFileName + '</span>'
    + '</div>'
    + '</div>'

    // Sub-tab nav
    + '<div class="cs-dv-tabnav" style="margin-bottom:20px">'
    + '<button class="cs-dv-tab cs-dv-tab--act" id="tx2-sub-tab-moments"    onclick="csTx2SubTab(\'moments\')">Moments</button>'
    + '<button class="cs-dv-tab"                 id="tx2-sub-tab-taxonomies" onclick="csTx2SubTab(\'taxonomies\')">Taxonomies</button>'
    + '<button class="cs-dv-tab"                 id="tx2-sub-tab-episodes"   onclick="csTx2SubTab(\'episodes\')">Episodes &amp; Shows</button>'
    + '</div>'

    // ── Moments ──
    + '<div id="tx2-sub-content-moments" style="overflow-y:auto">'
    +   '<table style="width:100%;border-collapse:collapse"><thead><tr>'
    +     '<th style="text-align:left;'  + TH + '">Category</th>'
    +     '<th style="text-align:right;' + TH + '">Score</th>'
    +     '<th style="text-align:right;' + TH + '">Assets</th>'
    +   '</tr></thead><tbody id="tx-cat-body"></tbody></table>'
    + '</div>'

    // ── Taxonomies ──
    + '<div id="tx2-sub-content-taxonomies" style="display:none">'
    +   '<div style="display:grid;grid-template-columns:1fr 256px;gap:16px;align-items:start">'
    +     '<div style="min-width:0">'
    +       '<div class="tx-ctabs-nav">'
    +         '<div class="tx-ctab tx-ctab--act" id="tx-ctab-emotion"     onclick="txCustomTab(\'emotion\')">Emotion</div>'
    +         '<div class="tx-ctab"              id="tx-ctab-location"    onclick="txCustomTab(\'location\')">Location</div>'
    +         '<div class="tx-ctab"              id="tx-ctab-objects"     onclick="txCustomTab(\'objects\')">Objects</div>'
    +         '<div class="tx-ctab"              id="tx-ctab-sentiment"   onclick="txCustomTab(\'sentiment\')">Sentiment</div>'
    +         '<div class="tx-ctab"              id="tx-ctab-iab"         onclick="txCustomTab(\'iab\')">IAB</div>'
    +         '<div class="tx-ctab"              id="tx-ctab-brandsafety" onclick="txCustomTab(\'brandsafety\')">Brand Safety</div>'
    +       '</div>'
    +       '<div id="tx-ctab-table"></div>'
    +       '<div id="tx-ctab-pagination"></div>'
    +     '</div>'
    +     '<div style="display:flex;flex-direction:column;height:480px;gap:0">'
    +       '<div class="tx-chips-panel" id="tx-chips-panel">'
    +         '<div class="tx-chips-title">Selected Taxonomies</div>'
    +         '<div class="tx-chips-empty" id="tx-chips-empty">Select taxonomies from the table</div>'
    +         '<div id="tx-chips-content" style="display:none"></div>'
    +       '</div>'
    +       '<div class="tx-save-panel">'
    +         '<div class="tx-save-label">Save as Moment</div>'
    +         '<input class="tx-moment-input" id="tx-moment-name" type="text" placeholder="Name this moment…">'
    +         '<button class="tx-save-btn" onclick="txSaveMoment()">'
    +           '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 2h8l2 2v8a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" stroke-width="1.5"/><path d="M5 13V8h4v5M4 2v3h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
    +           ' Save Moment'
    +         '</button>'
    +       '</div>'
    +     '</div>'
    +   '</div>'
    + '</div>'

    // ── Episodes & Shows ──
    + '<div id="tx2-sub-content-episodes" style="display:none">'
    +   '<table style="width:100%;border-collapse:collapse"><thead><tr>'
    +     '<th style="text-align:left;'  + TH + '">Show / Episode</th>'
    +     '<th style="text-align:left;'  + TH + '">Channel</th>'
    +     '<th style="text-align:right;' + TH + '">Match</th>'
    +   '</tr></thead><tbody id="tx-eps-body"></tbody></table>'
    + '</div>';

  if (typeof txInjectStyles === 'function') txInjectStyles();
  txCustomSelections = [];
  txRenderCategories();
}

function csTx2SubTab(tab) {
  ['moments', 'taxonomies', 'episodes'].forEach(function(t) {
    var btn = document.getElementById('tx2-sub-tab-' + t);
    var pnl = document.getElementById('tx2-sub-content-' + t);
    if (btn) btn.className = 'cs-dv-tab' + (t === tab ? ' cs-dv-tab--act' : '');
    if (pnl) pnl.style.display = t === tab ? '' : 'none';
  });
  if (tab === 'moments')    { txCustomSelections = []; txRenderCategories(); }
  if (tab === 'taxonomies') { txCustomActiveTab = 'emotion'; txCustomCurrentPage = 1; txCustomRenderTable(); txRenderChips(); }
  if (tab === 'episodes')   txRenderEpisodes();
}

function csTx2Filter(val) {
  csActiveTx2Filter = val;
  csTx2Render();
}

function csTx2Select(id) {
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
  grid.innerHTML = shows.map(function(s) {
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
}

function csTx2RenderProcess() {
  var container = document.getElementById('cs-process-container5');
  if (!container) return;

  var legendHtml = '<div class="wf-legend-sticky">'
    + '<div class="wf-legend">'
    + Object.values(WF_ACTORS).map(function(a) {
        var members = a.label === 'Sales' ? ' — Marika, Ryan…'
          : a.label === 'Product / Tech' ? ' — Bruna, Grant, Ben'
          : '';
        return '<div class="wf-legend-item">'
          + '<span class="wf-legend-dot" style="background:' + a.color + '"></span>'
          + '<span class="wf-legend-name" style="color:' + a.color + ';font-weight:500">' + a.label + '</span>'
          + (members ? '<span class="wf-legend-members">' + members + '</span>' : '')
          + '</div>';
      }).join('')
    + '</div>'
    + '</div>';

  function nodeHtml(step, i) {
    var actors = step.actors.map(function(k) { return WF_ACTORS[k]; });
    var barBg;
    if (actors.length === 1) {
      barBg = actors[0].color;
    } else {
      var pct = 100 / actors.length;
      var stops = actors.map(function(a, j) {
        return a.color + ' ' + (j * pct) + '%, ' + a.color + ' ' + ((j + 1) * pct) + '%';
      }).join(', ');
      barBg = 'linear-gradient(90deg,' + stops + ')';
    }
    var pillsHtml = actors.map(function(a) {
      return '<span class="wf-pill" style="color:' + a.color + ';background:' + a.bg + '">' + a.label + '</span>';
    }).join('');
    return '<div class="wf-node">'
      + '<div class="wf-node-bar" style="background:' + barBg + '"></div>'
      + '<div class="wf-node-body">'
      + '<div class="wf-node-num">Step ' + (i + 1) + '</div>'
      + '<div class="wf-node-title">' + step.title + '</div>'
      + '<div class="wf-node-desc">' + step.desc + '</div>'
      + '<div class="wf-node-pills">' + pillsHtml + '</div>'
      + '</div>'
      + '</div>';
  }

  var arrowRight = '<div class="wf-arrow-h">'
    + '<svg width="20" height="12" viewBox="0 0 20 12" fill="none">'
    + '<path d="M0 6h16M11 1l5 5-5 5" stroke="#D0CFC9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
    + '</svg></div>';

  var rowHtml = '<div class="wf-scroll-outer">'
    + '<div class="wf-row-h">'
    + WF_STEPS.map(function(s, i) {
        return nodeHtml(s, i) + (i < WF_STEPS.length - 1 ? arrowRight : '');
      }).join('')
    + '</div>'
    + '</div>';

  container.innerHTML = legendHtml + rowHtml;
}

// ── Navigation ────────────────────────────────────────────────────────────
var sdtActive     = 'manual';
var sdtSbCol      = false;

function sdtSbToggle() {
  sdtSbCol = !sdtSbCol;
  var sb   = document.getElementById('sdt-sb');
  var grid = document.getElementById('sdt-grid');
  var ico  = document.getElementById('sdt-sb-ico');
  if (sb)   sb.classList.toggle('sdt-sb--col', sdtSbCol);
  if (grid) grid.style.gridTemplateColumns = sdtSbCol ? '44px 1fr' : '220px 1fr';
  if (ico)  ico.innerHTML = sdtSbCol
    ? '<path d="M4 2l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
    : '<path d="M6 2L3 5l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';
}

function sdtNav(id) {
  ['manual','selfserve','realtime','taxonomy','taxonomy2'].forEach(function(k) {
    var nav = document.getElementById('sdt-nav-' + k);
    var pan = document.getElementById('sdt-panel-' + k);
    if (nav) nav.className = 'sdt-nav-item' + (k === id ? ' sdt-nav-item--act' : '');
    if (pan) pan.style.display = k === id ? '' : 'none';
  });
  sdtActive = id;
}

function sdtInit() {
  // Reset state to match the freshly-rendered HTML
  sdtActive = 'manual';
  sdtSbCol  = false;
  csActiveFilter    = 'all'; csSelectedId    = 3;
  csActiveFilter2   = 'all'; csSelectedId2   = 3;
  csActiveFilter3   = 'all'; csSelectedId3   = 3;
  csActiveTxFilter  = 'all'; csSelectedTxId  = 1;
  csActiveTx2Filter = 'all'; csSelectedTx2Id = 1;
  csTx2TaxStep = 'upload'; csTx2TaxInputType = 'video'; csTx2TaxFileName = '';
  sdtInjectStyles();
  csRender();    csRenderProcess();
  csRender2();   csRenderProcess2();
  csRender3();   csRenderProcess3();
  csTxRender();  csTxRenderProcess();
  csTx2Render(); csTx2RenderProcess();
}

// ── Styles ────────────────────────────────────────────────────────────────
function sdtInjectStyles() {
  if (document.getElementById('sdt-styles')) return;
  var s = document.createElement('style');
  s.id = 'sdt-styles';
  s.textContent = `
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
      width: 480px;
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
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 20px 16px;
      background: rgba(46,173,75,.06);
      border: 1px solid rgba(46,173,75,.25);
      border-radius: 10px;
      text-align: center;
      animation: cs-succ-in .35s ease;
    }
    @keyframes cs-succ-in {
      from { opacity: 0; transform: scale(.97); }
      to   { opacity: 1; transform: scale(1); }
    }
    .cs-proc-success-title {
      font-size: 14px;
      font-weight: 600;
      color: #2EAD4B;
    }
    .cs-proc-success-sub {
      font-size: 12px;
      color: var(--muted);
      line-height: 1.5;
      max-width: 340px;
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
