// sdt-content-form.js — SDT New Content Form prototype

function renderSdtContentForm() {
  setTimeout(sdtInit, 0);
  return `
<div class="ptitle">SDT – New Content Form</div>
<div class="psub" style="margin-bottom:20px">Select a process to get started</div>

<div style="display:grid;grid-template-columns:220px 1fr;gap:16px;align-items:start">

  <!-- ── Left: sidebar nav ── -->
  <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:6px;position:sticky;top:0;align-self:start;">
    <div class="sdt-nav-item sdt-nav-item--act" id="sdt-nav-manual"   onclick="sdtNav('manual')">
      <div class="sdt-nav-num">1</div>
      <div>
        <div class="sdt-nav-label">Enhanced Manual</div>
        <div class="sdt-nav-sub">process</div>
      </div>
    </div>
    <div class="sdt-nav-item" id="sdt-nav-selfserve" onclick="sdtNav('selfserve')">
      <div class="sdt-nav-num">2</div>
      <div>
        <div class="sdt-nav-label">Partially Automated</div>
        <div class="sdt-nav-sub">process</div>
      </div>
    </div>
    <div class="sdt-nav-item" id="sdt-nav-realtime" onclick="sdtNav('realtime')">
      <div class="sdt-nav-num">3</div>
      <div>
        <div class="sdt-nav-label">Real-time Analysis</div>
        <div class="sdt-nav-sub">process</div>
      </div>
    </div>
    <div style="height:1px;background:var(--border);margin:4px 6px"></div>
    <div class="sdt-nav-item" id="sdt-nav-taxonomy" onclick="sdtNav('taxonomy')">
      <div class="sdt-nav-num">4</div>
      <div>
        <div class="sdt-nav-label">Taxonomy Explorer v1</div>
        <div class="sdt-nav-sub">integration</div>
      </div>
    </div>
    <div class="sdt-nav-item" id="sdt-nav-taxonomy2" onclick="sdtNav('taxonomy2')">
      <div class="sdt-nav-num">5</div>
      <div>
        <div class="sdt-nav-label">Taxonomy Explorer v2</div>
        <div class="sdt-nav-sub">integration</div>
      </div>
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
          <button class="cs-request-btn" onclick="csOpenModal()">
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
      <div class="sdt-panel-title">Taxonomy Explorer v1</div>
      <div class="sdt-panel-sub">Prototype coming soon.</div>
    </div>
    <div id="sdt-panel-taxonomy2" style="display:none">
      <div class="sdt-panel-title">Taxonomy Explorer v2</div>
      <div class="sdt-panel-sub">Prototype coming soon.</div>
    </div>
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

// ── Request New Content Modal (3-step) ────────────────────────────────────
var csCurrentStep = 1;

function csOpenModal() {
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
    +   '<div class="cs-step" id="cs-step-ind-2"><div class="cs-step-circle"><span>2</span></div><div class="cs-step-label">Ads</div></div>'
    +   '<div class="cs-step-line"></div>'
    +   '<div class="cs-step" id="cs-step-ind-3"><div class="cs-step-circle"><span>3</span></div><div class="cs-step-label">Delivery</div></div>'
    + '</div>'

    // ── Step 1 body ──
    + '<div class="cs-modal-body" id="cs-step-body-1">'

    +   '<div class="cs-field"><div class="cs-field-row"><label class="cs-label">Requestor</label><span class="cs-field-note">Comes from the account</span></div>'
    +   '<input class="cs-input cs-input--disabled" type="text" value="Marika Roque" disabled></div>'

    +   '<div class="cs-field"><label class="cs-label">Client Name</label>'
    +   '<input class="cs-input" type="text" placeholder="e.g. Nike, Unilever…"></div>'

    +   '<div class="cs-field"><label class="cs-label">Content Name</label>'
    +   '<input class="cs-input" type="text" placeholder="e.g. Below Deck S5E3…"></div>'

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

    // ── Step 2 body (placeholder) ──
    + '<div class="cs-modal-body" id="cs-step-body-2" style="display:none">'
    +   '<div style="padding:40px 0;text-align:center;color:var(--muted);font-size:13px">Step 2 — Ads coming soon</div>'
    + '</div>'

    // ── Step 3 body (placeholder) ──
    + '<div class="cs-modal-body" id="cs-step-body-3" style="display:none">'
    +   '<div style="padding:40px 0;text-align:center;color:var(--muted);font-size:13px">Step 3 — Delivery coming soon</div>'
    + '</div>'

    // Footer
    + '<div class="cs-modal-footer">'
    +   '<button class="cs-btn-secondary" id="cs-modal-back-btn" style="display:none;margin-right:auto" onclick="csPrevStep()">← Back</button>'
    +   '<button class="cs-btn-secondary" onclick="csCloseModal()">Cancel</button>'
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
  } else if (csCurrentStep === 2) {
    csCurrentStep = 3;
    csUpdateModalStepper();
  } else if (csCurrentStep === 3) {
    csCloseModal();
    setTimeout(csOpenSuccessModal, 220);
  }
}

function csPrevStep() {
  if (csCurrentStep > 1) {
    csCurrentStep--;
    csUpdateModalStepper();
  }
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
  if (backBtn) backBtn.style.display = csCurrentStep > 1 ? '' : 'none';
  if (nextBtn) nextBtn.textContent   = csCurrentStep === 3 ? 'Submit Request' : 'Next';
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
  csSelectedId3 = id;
  csRender3();
}

function csRender3() {
  var grid = document.getElementById('cs-grid3');
  if (!grid) return;
  var shows = CS_SHOWS.filter(function(s) {
    return csActiveFilter3 === 'all' || s.category === csActiveFilter3;
  });
  grid.innerHTML = shows.map(function(s) {
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

// ── Navigation ────────────────────────────────────────────────────────────
var sdtActive = 'manual';

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
  csActiveFilter  = 'all'; csSelectedId  = 3;
  csActiveFilter2 = 'all'; csSelectedId2 = 3;
  csActiveFilter3 = 'all'; csSelectedId3 = 3;
  sdtInjectStyles();
  csRender();  csRenderProcess();
  csRender2(); csRenderProcess2();
  csRender3(); csRenderProcess3();
}

// ── Styles ────────────────────────────────────────────────────────────────
function sdtInjectStyles() {
  if (document.getElementById('sdt-styles')) return;
  var s = document.createElement('style');
  s.id = 'sdt-styles';
  s.textContent = `
    .sdt-nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: background .13s;
      margin-bottom: 2px;
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
