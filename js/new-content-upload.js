// new-content-upload.js — New Content Upload page

function renderSdtContentForm() {
  setTimeout(sdtInit, 0);
  return `
<div class="ptitle">New Content Upload</div>
<div class="psub" style="margin-bottom:20px">Select a process to get started</div>

<div id="sdt-grid" style="display:grid;grid-template-columns:220px 1fr;gap:16px;align-items:start">

  <!-- ── Left: sidebar nav ── -->
  <div class="sdt-sb" id="sdt-sb" style="position:sticky;top:0;align-self:start;">

    <div class="sdt-nav-item sdt-nav-item--act" id="sdt-nav-manual" onclick="sdtNav('manual')">
      <div class="sdt-nav-num">1</div>
      <div class="sdt-nav-text"><div class="sdt-nav-label">Enhanced Manual</div><div class="sdt-nav-sub">process</div></div>
    </div>

    <div class="sdt-nav-item" id="sdt-nav-realtime" onclick="sdtNav('realtime')">
      <div class="sdt-nav-num">2</div>
      <div class="sdt-nav-text"><div class="sdt-nav-label">Real-time Analysis</div><div class="sdt-nav-sub">process</div></div>
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
  </div>

</div>`;
}

var csActiveFilter  = 'all';
var csSelectedId    = 3;
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
    // Start processing only if bar not already at 100%
    var _pb = document.getElementById('cs-proc-bar');
    if (!_pb || _pb.style.width !== '100%') setTimeout(csStartProcessing, 80);
  } else if (csCurrentStep === 2) {
    csCurrentStep = 3;
    csUpdateModalStepper();
    setTimeout(csRenderAdItems, 0);
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
  if (backBtn) backBtn.style.display = csCurrentStep > 1 ? '' : 'none';
  if (nextBtn) nextBtn.textContent   = csCurrentStep === 3 ? 'Submit' : 'Next';
}
// ── Step 3: Ad Items list ─────────────────────────────────────────────────

var CS_AD_TYPES = ['CTV - Sync', 'CTV - LBar', 'CTV - Impulse', 'CTV - CTA Pause', 'CTV - Organic Pause', 'CTV - Pause Ad'];
var csAdItems = [];

var TH_AD = 'font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;padding:0 10px 8px 10px;border-bottom:1px solid var(--border-md);white-space:nowrap;';
var TD_AD = 'padding:6px 10px;vertical-align:middle;';

function csStep3Html() {
  csAdItems = [
  ];
  return '<label class="cs-label" style="display:block;margin-bottom:4px">Ad Assets</label>'
    + '<div style="background:var(--bg);border-radius:12px;padding:12px">'
    +   '<div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;overflow:hidden">'
    +     '<table id="cs-ad-items-list" style="width:100%;border-collapse:collapse">'
    +     '<thead><tr>'
    +     '<th style="' + TH_AD + 'text-align:left;padding-top:12px">Ad Type</th>'
    +     '<th style="' + TH_AD + 'text-align:left;padding-top:12px">Ad Asset</th>'
    +     '<th style="' + TH_AD + 'text-align:left;padding-top:12px">Timestamp</th>'
    +     '<th style="' + TH_AD + 'padding-top:12px"></th>'
    +     '</tr></thead>'
    +     '<tbody id="cs-ad-items-tbody"></tbody>'
    +     '<tfoot><tr>'
    +     '<td colspan="4" style="padding:4px 10px 8px">'
    +       '<button onclick="csAddAdItem()" style="display:flex;align-items:center;gap:5px;height:26px;padding:0 4px;border:none;background:none;color:var(--muted);font-size:12px;font-weight:500;cursor:pointer;font-family:inherit" onmouseenter="this.style.color=\'var(--text)\'" onmouseleave="this.style.color=\'var(--muted)\'">'
    +         '<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    +         'Add Ad'
    +       '</button>'
    +     '</td>'
    +     '</tr></tfoot>'
    +   '</table>'
    +   '</div>'
    + '</div>'
    + '<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border-md)">'
    +   '<label class="cs-label" style="display:block;margin-bottom:6px">Desired delivery date</label>'
    +   '<div style="display:flex;gap:10px;align-items:flex-start">'
    +     '<input type="date" class="cs-input" id="cs-delivery-date" style="width:160px;flex-shrink:0">'
    +     '<input type="text" class="cs-input" placeholder="Notes…" style="flex:1">'
    +   '</div>'
    + '</div>';
}

function csAdItemHtml(idx) {
  var item = csAdItems[idx];
  var typeOpts = CS_AD_TYPES.map(function(t) {
    return '<option value="' + t + '"' + (item.type === t ? ' selected' : '') + '>' + t + '</option>';
  }).join('');

  var assetCell =
    '<div style="display:flex;align-items:center;gap:6px">'
    + '<div class="cs-ads-toggle" style="flex-shrink:0;margin:0">'
    +   '<div class="cs-ads-btn' + (item.tab === 'upload' ? ' cs-ads-btn--act' : '') + '" onclick="csAdItemTab(' + idx + ',\'upload\')" style="padding:0 7px;height:28px;line-height:28px;font-size:11px">Upload</div>'
    +   '<div class="cs-ads-btn' + (item.tab === 'link'   ? ' cs-ads-btn--act' : '') + '" onclick="csAdItemTab(' + idx + ',\'link\')"   style="padding:0 7px;height:28px;line-height:28px;font-size:11px">Link</div>'
    +   '<div class="cs-ads-btn' + (item.tab === 'desc'   ? ' cs-ads-btn--act' : '') + '" onclick="csAdItemTab(' + idx + ',\'desc\')"   style="padding:0 7px;height:28px;line-height:28px;font-size:11px">Desc</div>'
    + '</div>'
    + (item.tab === 'upload'
        ? (item.value
            ? '<label style="display:flex;align-items:center;gap:5px;cursor:pointer;color:var(--text);font-size:12px;min-width:0;overflow:hidden">'
              + '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;color:#2EAD4B"><path d="M4 10l4 4 8-8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
              + '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + item.value + '</span>'
              + '<input type="file" style="display:none">'
              + '</label>'
            : '<label style="display:flex;align-items:center;gap:5px;cursor:pointer;color:var(--muted);font-size:12px;white-space:nowrap">'
              + '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 11V3M5 6l3-3 3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 13h12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>'
              + '<span>Upload file</span>'
              + '<input type="file" style="display:none">'
              + '</label>')
        : item.tab === 'link'
        ? '<input type="url" placeholder="https://ad-url.com…" value="' + (item.value || '') + '" oninput="csAdItems[' + idx + '].value=this.value" style="flex:1;min-width:120px;background:none;border:none;outline:none;font-family:inherit;font-size:12px;color:var(--text);padding:0">'
        : '<input type="text" placeholder="Describe the ad…" value="' + (item.value || '').replace(/"/g, '&quot;') + '" oninput="csAdItems[' + idx + '].value=this.value" style="flex:1;min-width:120px;background:none;border:none;outline:none;font-family:inherit;font-size:12px;color:var(--text);padding:0">')
    + '</div>';

  var inputBase = 'background:none;border:none;outline:none;font-family:inherit;font-size:12px;color:var(--text);width:100%;cursor:pointer;padding:0;';
  return '<tr style="border-bottom:1px solid var(--border)">'
    + '<td style="' + TD_AD + 'width:160px"><select onchange="csAdItems[' + idx + '].type=this.value" style="' + inputBase + '">' + typeOpts + '</select></td>'
    + '<td style="' + TD_AD + '">' + assetCell + '</td>'
    + '<td style="' + TD_AD + 'width:100px;cursor:pointer" onclick="this.querySelector(\'input[type=time]\').showPicker()">'
    +   '<label style="display:flex;align-items:center;gap:5px;cursor:pointer;color:' + (item.ts ? 'var(--text)' : 'var(--muted)') + ';font-size:12px;pointer-events:none">'
    +     '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" style="flex-shrink:0"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.4"/><path d="M8 5v3.5l2 1.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +     '<span>' + (item.ts || 'Set time') + '</span>'
    +   '</label>'
    +   '<input type="time" value="' + (item.ts || '') + '" onchange="csAdItems[' + idx + '].ts=this.value;csRenderAdItems()" style="position:absolute;opacity:0;width:0;height:0;pointer-events:none">'
    + '</td>'
    + '<td style="' + TD_AD + 'width:32px;text-align:center"><button onclick="csRemoveAdItem(' + idx + ')" style="background:none;border:none;cursor:pointer;color:var(--faint);font-size:16px;line-height:1;padding:0" onmouseenter="this.style.color=\'#ef4444\'" onmouseleave="this.style.color=\'var(--faint)\'">×</button></td>'
    + '</tr>';
}

function csRenderAdItems() {
  var tbody = document.getElementById('cs-ad-items-tbody');
  if (!tbody) return;
  if (csAdItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;font-size:12px;color:var(--faint)">No ad placements added yet.</td></tr>';
  } else {
    tbody.innerHTML = csAdItems.map(function(_, i) { return csAdItemHtml(i); }).join('');
  }
}

function csAddAdItem() {
  csAdItems.push({ ts: '', type: CS_AD_TYPES[0], tab: 'upload' });
  csRenderAdItems();
}

function csRemoveAdItem(idx) {
  csAdItems.splice(idx, 1);
  csRenderAdItems();
}

function csAdItemTab(idx, tab) {
  csAdItems[idx].tab = tab;
  csRenderAdItems();
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
  'linear-gradient(145deg,#BAE6FD,#7DD3FC)',
  'linear-gradient(145deg,#BBF7D0,#86EFAC)',
  'linear-gradient(145deg,#FEF08A,#FDE047)',
  'linear-gradient(145deg,#DDD6FE,#C4B5FD)',
  'linear-gradient(145deg,#99F6E4,#5EEAD4)',
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
  csNewItems3._justAdded = true;
  csSelectedId3 = newId;

  csCloseModal();

  // Show ads confirmation modal if there are ad items
  if (csAdItems.length > 0) {
    csShowAdsConfirm(newId);
    return;
  }

  csRenderNewItem(newId);
}

function csRenderNewItem(newId) {
  // Render to whichever grid is currently in the DOM
  if (document.getElementById('cs-grid5')) {
    csTx2Render();
    csNewItems3._justAdded = false;
    csBumpNewThumb(newId);
  } else if (document.getElementById('cs-grid3')) {
    csRender3();
    csNewItems3._justAdded = false;
    csBumpNewThumb(newId);
  }
}

function csBumpNewThumb(id) {
  setTimeout(function() {
    var el = document.querySelector('[data-new-thumb="' + id + '"]');
    if (!el) return;
    el.classList.remove('cs-thumb--bump');
    void el.offsetWidth; // force reflow to restart animation
    el.classList.add('cs-thumb--bump');
    el.addEventListener('animationend', function() { el.classList.remove('cs-thumb--bump'); }, { once: true });
  }, 50);
}

function csShowAdsConfirm(newId) {
  var overlay = document.createElement('div');
  overlay.id = 'cs-ads-confirm-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1100;display:flex;align-items:center;justify-content:center';

  var ticketNum = 'KERV-' + (1000 + Math.floor(Math.random() * 9000));
  var slaDate = new Date();
  slaDate.setDate(slaDate.getDate() + 5);
  var slaStr = slaDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  overlay.innerHTML =
    '<div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:28px 28px 24px;width:380px;box-shadow:0 8px 32px rgba(0,0,0,.18);font-family:inherit">'
    + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">'
    +   '<div style="width:36px;height:36px;border-radius:50%;background:rgba(46,173,75,.12);display:flex;align-items:center;justify-content:center;flex-shrink:0">'
    +     '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 9l4 4 6-7" stroke="#2EAD4B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +   '</div>'
    +   '<div>'
    +     '<div style="font-size:14px;font-weight:600;color:var(--text)">Request submitted</div>'
    +     '<div style="font-size:12px;color:var(--muted);margin-top:1px">Ad assets will be processed by the team</div>'
    +   '</div>'
    + '</div>'
    + '<div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:14px 16px;display:flex;flex-direction:column;gap:10px;margin-bottom:20px">'
    +   '<div style="display:flex;align-items:center;justify-content:space-between">'
    +     '<span style="font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.04em">Jira Ticket</span>'
    +     '<a href="https://kerv.atlassian.net/browse/' + ticketNum + '" target="_blank" style="font-size:12px;font-weight:600;color:var(--accent);text-decoration:none;display:flex;align-items:center;gap:4px">'
    +       ticketNum
    +       '<svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 10L10 2M10 2H5M10 2v5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +     '</a>'
    +   '</div>'
    +   '<div style="height:1px;background:var(--border)"></div>'
    +   '<div style="display:flex;align-items:center;justify-content:space-between">'
    +     '<span style="font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.04em">Estimated delivery</span>'
    +     '<span style="font-size:12px;font-weight:500;color:var(--text)">' + slaStr + ' <span style="color:var(--muted);font-weight:400">(5 business days)</span></span>'
    +   '</div>'
    + '</div>'
    + '<button onclick="document.getElementById(\'cs-ads-confirm-overlay\').remove();csRenderNewItem(' + newId + ')" style="width:100%;height:36px;background:var(--accent);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">Done</button>'
    + '</div>';

  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) { overlay.remove(); csRenderNewItem(newId); }
  });
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

// ── Panel 2 (Real-time Analysis) helpers ─────────────────────────────────

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

function csRender3() {
  var grid = document.getElementById('cs-grid3');
  if (!grid) return;
  var shows = CS_SHOWS.filter(function(s) {
    return csActiveFilter3 === 'all' || s.category === csActiveFilter3;
  });

  // New items always shown (no category filter)
  var newestId = csNewItems3.length > 0 ? csNewItems3[0].id : null;
  var newHtml = csNewItems3.map(function(s) {
    var sel = s.id === csSelectedId3;
    var isNewest = s.id === newestId && csNewItems3._justAdded;
    return '<div class="cs-thumb' + (sel ? ' cs-thumb--sel' : '') + '" data-new-thumb="' + s.id + '" onclick="csSelect3(' + s.id + ')">'
      + '<div class="cs-poster" style="background:' + s.grad + '">'
      + '<span class="cs-poster-initials" style="color:rgba(0,0,0,.35)">' + s.initials + '</span>'
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
  ['manual','realtime'].forEach(function(k) {
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
  csActiveFilter  = 'all'; csSelectedId  = 3;
  csActiveFilter3 = 'all'; csSelectedId3 = 3;
  sdtInjectStyles();
  csRender();  csRenderProcess();
  csRender3(); csRenderProcess3();
}

