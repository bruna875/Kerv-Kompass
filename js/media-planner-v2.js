// media-planner-v2.js — Media Planner (v2) page  (self-contained module)

var mp2TaxStep      = 'upload';
var mp2TaxInputType = 'video';
var mp2TaxFileName  = '';

function renderMediaPlannerV2() {
  setTimeout(function() {
    mp2TaxStep = 'upload'; mp2TaxInputType = 'video'; mp2TaxFileName = '';
    sdtInjectStyles();
    mp2InjectSliderStyles();
    mp2ShowUpload();
  }, 0);
  return `
<div class="ptitle">Media Planner (v2)</div>
<div class="psub" style="margin-bottom:24px">Upload an ad or brief to see recommendations on moments to engage your ideal audience</div>
<div id="sdt-panel-taxonomy2">
  <div class="cs-card" style="padding:32px">
    <div id="tx2-content-area"></div>
  </div>
</div>`;
}

function mp2ShowMediaPlanDetail(idx) {
  var plan = savedMediaPlansV2[idx];
  if (!plan) return;
  var ca = document.getElementById('tx2-content-area');
  if (!ca) return;

  mp2HomeTab = 'plans';

  var TH  = 'padding:9px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);border-bottom:1px solid var(--border);white-space:nowrap';
  var TOT = 'padding:10px 12px;font-size:12px;font-weight:600;color:var(--text);border-top:2px solid var(--border-md);background:var(--bg)';
  var DELBTN = 'border:none;background:none;cursor:pointer;color:var(--faint);padding:2px 6px;border-radius:5px;line-height:1;font-size:16px;transition:color .12s';
  var pencilSvg = '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var CPM_DT = { 'Prime Time': 25, 'Daytime': 15, 'Late Night': 18, 'Morning': 12, 'Early Fringe': 20 };

  // Build rows from plan.moments
  var allItems = (plan.moments || []).map(function(m, mi) {
    return {
      name:             m.name,
      channels:         Array.isArray(m.channels) ? m.channels : [],
      inventory:        m.inventory || 0,
      impressionsLabel: m.impressionsLabel || null,
      _cpm:             m.cpm || 0,
      _impNum:          m.impressionsNum || 0,
      _dollarsNum:      (m.impressionsNum || 0) * 1000 * (m.cpm || 0),
      type:             m.type || 'ads',
      _idx:             mi
    };
  });

  var totalImpNum     = allItems.reduce(function(s, it) { return s + it._impNum;     }, 0);
  var totalDollarsNum = allItems.reduce(function(s, it) { return s + it._dollarsNum; }, 0);
  var avgCpm          = totalImpNum > 0 ? Math.round(totalDollarsNum / (totalImpNum * 1000)) : 0;
  var fmtTotImp       = totalImpNum >= 1 ? totalImpNum.toFixed(1) + 'M' : totalImpNum > 0 ? Math.round(totalImpNum * 1000) + 'K' : '—';
  var fmtAvgCpm       = avgCpm > 0 ? '$' + avgCpm : '—';

  var tableRowsHtml = allItems.length === 0
    ? '<tr><td colspan="6" style="padding:32px;text-align:center;font-size:12px;color:var(--faint)">No moments in this plan.</td></tr>'
    : allItems.map(function(item) {
        var chansHtml = item.channels.length
          ? item.channels.map(function(c) {
              return '<span style="font-size:10px;font-weight:500;color:var(--muted);background:var(--bg);border:1px solid var(--border);border-radius:4px;padding:1px 6px;white-space:nowrap">' + c + '</span>';
            }).join(' ')
          : '<span style="color:var(--faint)">—</span>';
        var rowType = item.type || 'ads';
        var typeBadge = rowType === 'live'
          ? '<span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:600;background:#fef2f2;border:1px solid #fecaca;border-radius:20px;padding:2px 8px;color:#dc2626;white-space:nowrap"><span style="width:5px;height:5px;border-radius:50%;background:#ef4444;display:inline-block;box-shadow:0 0 4px #ef4444"></span>Live</span>'
          : rowType === 'organic'
          ? '<span style="font-size:10px;font-weight:600;background:#f0fdfa;border:1px solid #99f6e4;border-radius:20px;padding:2px 8px;color:#0f766e;white-space:nowrap">Organic Pause</span>'
          : '<span style="font-size:10px;font-weight:600;background:#eff6ff;border:1px solid #bfdbfe;border-radius:20px;padding:2px 8px;color:#1d4ed8;white-space:nowrap">Ads</span>';
        return '<tr style="border-bottom:1px solid var(--border)">'
          + '<td style="padding:10px 12px;font-size:12px;font-weight:500;color:var(--text)">' + item.name + '</td>'
          + '<td style="padding:10px 12px"><div style="display:flex;flex-wrap:wrap;gap:4px">' + chansHtml + '</div></td>'
          + '<td style="padding:10px 12px">' + typeBadge + '</td>'
          + '<td style="padding:10px 12px;font-size:12px;font-weight:500;color:var(--text);text-align:right;white-space:nowrap">' + (item.inventory || '—') + '</td>'
          + '<td style="padding:10px 12px;font-size:12px;font-weight:500;color:var(--text);text-align:right;white-space:nowrap">' + (item.impressionsLabel || '—') + '</td>'
          + '<td style="padding:10px 12px;font-size:12px;font-weight:600;color:var(--text);text-align:right;white-space:nowrap">' + (item._cpm > 0 ? '$' + item._cpm : '—') + '</td>'
          + '<td style="padding:6px 8px;text-align:center;width:32px">'
          +   '<button style="' + DELBTN + '" onclick="mp2DeletePlanItem(' + idx + ',' + item._idx + ')" onmouseenter="this.style.color=\'var(--accent)\'" onmouseleave="this.style.color=\'var(--faint)\'">×</button>'
          + '</td>'
          + '</tr>';
      }).join('');

  // Update breadcrumb
  var pgname = document.getElementById('content-bc');
  if (pgname) pgname.innerHTML =
    '<span style="font-weight:400;opacity:.55;cursor:pointer" onclick="mp2ShowUpload()">Media Planner (v2)</span>'
    + ' &nbsp;/&nbsp; ' + plan.name;

  ca.innerHTML =

    // Header
    '<div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:nowrap;margin-bottom:20px;gap:16px">'
    +   '<div style="min-width:0;flex:1">'
    // Inline-editable title
    +     '<div id="mp-title-wrap-' + idx + '">'
    +       '<div id="mp-title-display-' + idx + '" style="display:flex;align-items:center;gap:6px;cursor:pointer" onmouseenter="document.getElementById(\'mp-pencil-' + idx + '\').style.opacity=\'1\'" onmouseleave="document.getElementById(\'mp-pencil-' + idx + '\').style.opacity=\'0\'" onclick="mp2StartEditPlanName(' + idx + ')">'
    +         '<span style="font-size:18px;font-weight:600;color:var(--text);letter-spacing:-.3px">' + plan.name + '</span>'
    +         '<span id="mp-pencil-' + idx + '" style="opacity:0;transition:opacity .15s;color:var(--faint);display:flex;align-items:center">' + pencilSvg + '</span>'
    +       '</div>'
    +     '</div>'
    +     '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:4px">'
    +       '<span style="font-size:12px;color:var(--faint)">Created ' + plan.date + '</span>'
      + (plan.flightStart && plan.flightEnd
          ? '<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--faint)">'
          +   '<svg width="10" height="10" viewBox="0 0 12 12" fill="none" style="flex-shrink:0"><rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M1 5h10M4 1v2M8 1v2" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>'
          +   plan.flightStart + ' → ' + plan.flightEnd
          + '</span>'
          : '')
    +     '</div>'
    +   '</div>'
    +   '<div style="display:flex;align-items:center;gap:20px;flex:0 0 auto">'
    +     '<div style="text-align:right">'
    +       '<div style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);margin-bottom:2px">Moments</div>'
    +       '<div style="font-size:20px;font-weight:700;color:var(--text)">' + allItems.length + '</div>'
    +     '</div>'
    +     (totalImpNum > 0
          ? '<div style="text-align:right">'
          +   '<div style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);margin-bottom:2px">Est. Impressions</div>'
          +   '<div style="font-size:20px;font-weight:700;color:var(--text)">' + fmtTotImp + '</div>'
          + '</div>'
          : '')
    +     (avgCpm > 0
          ? '<div style="text-align:right">'
          +   '<div style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);margin-bottom:2px">Avg CPM</div>'
          +   '<div style="font-size:20px;font-weight:700;color:var(--accent)">' + fmtAvgCpm + '</div>'
          + '</div>'
          : '')
    +     '<button onclick="mp2DeleteMediaPlan(' + idx + ')" title="Delete plan" style="width:30px;height:30px;display:flex;align-items:center;justify-content:center;border:1px solid #fecaca;border-radius:7px;background:#fff5f5;color:#ef4444;cursor:pointer;padding:0">'
    +       '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.8 7.5A1 1 0 004.8 12.5h4.4a1 1 0 001-.9L11 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +     '</button>'
    +   '</div>'
    + '</div>'

    // Episodes table — scrollable
    + '<div style="overflow-y:auto;max-height:calc(100vh - 440px);border:1px solid var(--border);border-radius:10px">'
    +   '<table style="width:100%;border-collapse:collapse"><thead><tr style="background:var(--bg);position:sticky;top:0;z-index:1">'
    +     '<th style="text-align:left;' + TH + '">Moment</th>'
    +     '<th style="text-align:left;' + TH + '">Channels</th>'
    +     '<th style="text-align:left;' + TH + '">Type</th>'
    +     '<th style="text-align:right;' + TH + '">Inventory / PODs</th>'
    +     '<th style="text-align:right;' + TH + '">Est. Impressions</th>'
    +     '<th style="text-align:right;' + TH + '">Est. CPM</th>'
    +     '<th style="' + TH + ';width:40px"></th>'
    +   '</tr></thead>'
    +   '<tbody>' + tableRowsHtml + '</tbody>'
    +   '<tfoot style="position:sticky;bottom:0;z-index:1">'
    +     '<tr>'
    +       '<td style="' + TOT + '">Total</td>'
    +       '<td style="' + TOT + '"></td>'
    +       '<td style="' + TOT + '"></td>'
    +       '<td style="' + TOT + '"></td>'
    +       '<td style="' + TOT + ';text-align:right">' + fmtTotImp + '</td>'
    +       '<td style="' + TOT + ';text-align:right">' + fmtAvgCpm + '</td>'
    +       '<td style="' + TOT + '"></td>'
    +     '</tr>'
    +   '</tfoot>'
    +   '</table>'
    + '</div>'

    // Action buttons
    + '<div style="margin-top:14px;display:flex;flex-direction:column;gap:8px">'
    +   '<button onclick="mp2AddMoreMoments(' + idx + ')" style="width:100%;height:40px;display:flex;align-items:center;justify-content:center;gap:7px;border-radius:9px;border:1px solid var(--border-md);background:var(--surface);color:var(--text);font-size:13px;font-weight:500;cursor:pointer;font-family:inherit" onmouseenter="this.style.background=\'var(--bg)\'" onmouseleave="this.style.background=\'var(--surface)\'">'
    +     '<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    +     'Add more moments'
    +   '</button>'
    +   '<div style="display:flex;gap:8px">'
    +     '<button id="inv-export-btn-' + idx + '" onclick="mp2ExportInsertionOrder(' + idx + ',this)" style="flex:1;height:40px;display:flex;align-items:center;justify-content:center;gap:7px;border-radius:9px;border:none;background:var(--accent);color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">'
    +       '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3M2 10v1.5A1.5 1.5 0 003.5 13h7a1.5 1.5 0 001.5-1.5V10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +       'Export to IO'
    +     '</button>'
    +     '<button onclick="mp2ActivateDSP(' + idx + ')" style="flex:1;height:40px;display:flex;align-items:center;justify-content:center;gap:7px;border-radius:9px;border:none;background:#0f172a;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit" onmouseenter="this.style.background=\'#1e293b\'" onmouseleave="this.style.background=\'#0f172a\'">'
    +       '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="5" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4"/><rect x="9" y="2" width="5" height="12" rx="1.5" stroke="currentColor" stroke-width="1.4"/><circle cx="4.5" cy="11.5" r="1" fill="currentColor"/><circle cx="11.5" cy="11.5" r="1" fill="currentColor"/></svg>'
    +       'Activate via DSP'
    +     '</button>'
    +   '</div>'
    + '</div>';
}

function mp2ActivateDSP(idx) {
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
        return '<button onclick="mp2DSPPush(\'' + d.name + '\',this.closest(\'.dsp-overlay\'))" style="display:flex;align-items:center;gap:12px;height:48px;padding:0 14px;border-radius:10px;border:1px solid var(--border);background:var(--surface);cursor:pointer;font-family:inherit;text-align:left;transition:border-color .12s" onmouseenter="this.style.borderColor=\'' + d.color + '\'" onmouseleave="this.style.borderColor=\'var(--border)\'">'
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

var DSP_PARAMS_V2 = {
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

var DSP_COLORS_V2 = { 'DV360': '#4285F4', 'The Trade Desk': '#00C851', 'Xandr': '#FF6B35' };
var DSP_LOGOS_V2  = { 'DV360': 'G',       'The Trade Desk': 'T',       'Xandr': 'X' };

function mp2DSPPush(dspName, prevOverlay) {
  if (prevOverlay) prevOverlay.remove();

  var color  = DSP_COLORS_V2[dspName];
  var logo   = DSP_LOGOS_V2[dspName];
  var fields = DSP_PARAMS_V2[dspName] || [];
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
    +   '<button onclick="mp2DSPSubmit(\'' + dspName + '\',this)" style="flex:2;height:38px;border-radius:8px;border:none;background:' + color + ';color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:7px">'
    +     '<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +     'Push to ' + dspName
    +   '</button>'
    + '</div>'
    + '</div>';

  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

function mp2DSPSubmit(dspName, btn) {
  // Validate required fields
  var fields = DSP_PARAMS_V2[dspName] || [];
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

function mp2ExportInsertionOrder(idx, btn) {
  var plan = savedMediaPlansV2[idx];
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

function mp2EditMediaPlan(idx) {
  mp2ShowMediaPlanDetail(idx);
}

function mp2StartEditPlanName(idx) {
  var wrap = document.getElementById('mp-title-wrap-' + idx);
  if (!wrap) return;
  var plan = savedMediaPlansV2[idx];
  if (!plan) return;
  wrap.innerHTML =
    '<div style="display:flex;align-items:center;gap:6px">'
    + '<input id="mp-title-input-' + idx + '" type="text" value="' + plan.name.replace(/"/g, '&quot;') + '"'
    + ' style="font-size:18px;font-weight:600;color:var(--text);letter-spacing:-.3px;border:none;border-bottom:2px solid var(--accent);background:transparent;outline:none;padding:0;font-family:inherit;min-width:0;width:260px"'
    + ' onkeydown="if(event.key===\'Enter\')mp2SavePlanName(' + idx + ');if(event.key===\'Escape\')mp2ShowMediaPlanDetail(' + idx + ')">'
    + '<button onclick="mp2SavePlanName(' + idx + ')" style="height:26px;padding:0 10px;border-radius:6px;border:none;background:var(--accent);color:#fff;font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;flex-shrink:0">Save</button>'
    + '</div>';
  var input = document.getElementById('mp-title-input-' + idx);
  if (input) { input.focus(); input.select(); }
}

function mp2SavePlanName(idx) {
  var input = document.getElementById('mp-title-input-' + idx);
  if (!input) return;
  var newName = input.value.trim();
  if (newName && savedMediaPlansV2[idx]) savedMediaPlansV2[idx].name = newName;
  mp2ShowMediaPlanDetail(idx);
}

function mp2EditFlightDates(idx, pill) {
  // Remove any existing picker
  var existing = document.getElementById('mp-flight-picker');
  if (existing) { existing.remove(); return; }

  var plan = savedMediaPlansV2[idx];
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
    +   '<button onclick="mp2SaveFlightDates(' + idx + ')" style="flex:1;height:30px;border-radius:6px;border:none;background:var(--accent);color:#fff;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">Save</button>'
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

function mp2SaveFlightDates(idx) {
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
  if (savedMediaPlansV2[idx]) {
    savedMediaPlansV2[idx].flightStart = start;
    savedMediaPlansV2[idx].flightEnd   = end;
  }

  var picker = document.getElementById('mp-flight-picker');
  if (picker) picker.remove();

  // Update label in place without full re-render
  var label = document.getElementById('mp-flight-label-' + idx);
  if (label) label.textContent = start && end ? start + ' → ' + end : 'Set flight dates';
}

function mp2DeletePlanItem(planIdx, momentIdx) {
  var plan = savedMediaPlansV2[planIdx];
  if (!plan) return;
  plan.moments = plan.moments || [];
  plan.moments.splice(momentIdx, 1);
  mp2ShowMediaPlanDetail(planIdx);
}

function mp2AddMoreMoments(planIdx) {
  var plan = savedMediaPlansV2[planIdx];
  if (!plan) return;
  mp2ShowResults();
  invSelected = {};
  (plan.programs || []).forEach(function(p) { if (p.id) invSelected[p.id] = true; });
  inv2MediaPlanVisible = true;
  mp2SubTab('moments');
}

function mp2AddMoreToInventory(planIdx) {
  var plan = savedMediaPlansV2[planIdx];
  if (!plan) return;
  // Build the v2 results page (resets invSelected internally)
  mp2ShowResults();
  // Now populate the cart after the reset
  invSelected = {};
  (plan.programs || []).forEach(function(p) {
    if (p.id) invSelected[p.id] = true;
  });
  inv2MediaPlanVisible = true;
  // Switch to moments tab — mp2RenderMoments will pick up our state
  mp2SubTab('moments');
}

function mp2DeleteMediaPlan(idx) {
  var plan = savedMediaPlansV2[idx];
  if (!plan) return;
  if (!confirm('Delete "' + plan.name + '"? This cannot be undone.')) return;
  savedMediaPlansV2.splice(idx, 1);
  mp2ShowUpload();
}

function mp2ShowUpload() {
  mp2TaxStep = 'upload';
  var ca = document.getElementById('tx2-content-area');
  if (!ca) return;

  var pgname = document.getElementById('content-bc');
  if (pgname) pgname.textContent = 'Media Planner (v2)';

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
      + '</div>';
    var textArea =
        '<textarea class="cs-textarea" id="tx2-text-input" placeholder="Paste or type your text here. The AI will analyse topics, sentiments, moments and taxonomy classifications…" style="width:100%;box-sizing:border-box;min-height:160px;resize:vertical"></textarea>';
    return type === 'text' ? textArea : uploadZone;
  }

  function typeIcon(t) {
    return t === 'video'
      ? '<svg width="13" height="13" viewBox="0 0 32 32" fill="none"><rect x="2" y="6" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M22 13l8-5v16l-8-5V13z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'
      : t === 'doc'
      ? '<svg width="13" height="13" viewBox="0 0 32 32" fill="none"><path d="M6 4h14l6 6v18a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" stroke-width="1.8"/><path d="M20 4v6h6M10 14h12M10 18h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
      : '<svg width="13" height="13" viewBox="0 0 32 32" fill="none"><path d="M4 8h24M4 14h18M4 20h24M4 26h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  }

  var TX2_LIBRARY = [
    { type:'video', name:'kroger-ad.mp4',                date:'2 May 2025',   moments:14, taxonomies:38, lookback:'4 min',  flightStart:'1 Jun 2025',  flightEnd:'30 Jun 2025'  },
    { type:'video', name:'parks-and-rec-s04e11.mp4',     date:'29 Apr 2025',  moments:9,  taxonomies:22, lookback:'3 min',  flightStart:'15 May 2025', flightEnd:'15 Jun 2025'  },
    { type:'doc',   name:'Q1-content-brief.pdf',         date:'25 Apr 2025',  moments:6,  taxonomies:17, lookback:'2 min',  flightStart:'1 May 2025',  flightEnd:'31 May 2025'  },
    { type:'text',  name:'Campaign brief — Spring 2025', date:'18 Apr 2025',  moments:4,  taxonomies:11, lookback:'5 min',  flightStart:'1 Apr 2025',  flightEnd:'30 Apr 2025'  },
    { type:'video', name:'yellowstone-s05e08.mp4',       date:'11 Apr 2025',  moments:21, taxonomies:54, lookback:'4 min',  flightStart:'1 Jul 2025',  flightEnd:'31 Jul 2025'  },
    { type:'doc',   name:'Brand-safety-guidelines.docx', date:'3 Apr 2025',   moments:3,  taxonomies:9,  lookback:'90 sec', flightStart:'1 Jun 2025',  flightEnd:'15 Jun 2025'  },
  ];

  var libraryRows = TX2_LIBRARY.map(function(item, i) {
    return '<div class="tx2-lib-row" onclick="mp2LibLoad(' + i + ')">'
      + '<div class="tx2-lib-icon">' + typeIcon(item.type) + '</div>'
      + '<div style="flex:1;min-width:0">'
      +   '<div style="font-size:12px;font-weight:500;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + item.name + '</div>'
      +   '<div style="font-size:11px;color:var(--faint);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + item.date + ' &nbsp;·&nbsp; ' + item.moments + ' moments &nbsp;·&nbsp; ' + item.taxonomies + ' taxonomies</div>'
      + '</div>'
      + '<div style="display:flex;align-items:center;gap:8px;flex-shrink:0">'
      +   '<span style="font-size:10px;font-weight:600;color:#16a34a;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:20px;padding:2px 8px">Completed</span>'
      + '</div>'
      + '</div>';
  }).join('');

  var plansRows = savedMediaPlansV2.length === 0
    ? '<div style="padding:40px 0;text-align:center;color:var(--faint);font-size:12px">No saved media plans yet.<br>Build one with the AI planner and hit Save.</div>'
    : savedMediaPlansV2.map(function(mp, i) {
        var inputIco =
          mp.inputType === 'video'
            ? '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M11 7l4-2v6l-4-2V7z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>'
            : mp.inputType === 'document'
            ? '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 2h5l3 3v9a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M9 2v3h3M5 8h6M5 11h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>'
            : '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
        var momentsCount = mp.source === 'ai'
          ? (mp.moments || []).length
          : (mp.programs || []).length + (mp.episodes || []).length;
        var cpmStr = mp.avgCpm ? ' &nbsp;·&nbsp; Avg. CPM ' + mp.avgCpm : (mp.dollars ? ' &nbsp;·&nbsp; ' + mp.dollars : '');
        var flightStr = (mp.flightStart && mp.flightEnd) ? ' &nbsp;·&nbsp; ' + mp.flightStart + ' → ' + mp.flightEnd : '';

        // DSP badge
        var dspBadge = '';
        if (mp.dsp && mp.dsp.name) {
          var dspCol = DSP_COLORS_V2[mp.dsp.name] || 'var(--muted)';
          dspBadge = '<span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:600;color:var(--text);background:var(--bg);border:1px solid var(--border);border-radius:20px;padding:2px 8px;white-space:nowrap;flex-shrink:0">'
            + '<span style="width:6px;height:6px;border-radius:50%;background:' + dspCol + ';flex-shrink:0"></span>'
            + mp.dsp.name
            + '</span>';
        }

        // Status badge
        var statusBadge = '';
        if (mp.dsp && mp.dsp.status) {
          var st = mp.dsp.status;
          var stCol = st === 'active'  ? '#16a34a' : st === 'pending' ? '#d97706' : '#dc2626';
          var stBg  = st === 'active'  ? '#f0fdf4' : st === 'pending' ? '#fffbeb' : '#fef2f2';
          var stBd  = st === 'active'  ? '#bbf7d0' : st === 'pending' ? '#fde68a' : '#fecaca';
          var stTxt = st === 'active'  ? 'Live'    : st === 'pending' ? 'Pending' : 'Error';
          statusBadge = '<span style="font-size:10px;font-weight:600;color:' + stCol + ';background:' + stBg + ';border:1px solid ' + stBd + ';border-radius:20px;padding:2px 8px;white-space:nowrap;flex-shrink:0">' + stTxt + '</span>';
        }

        // Action buttons
        var IBTN = 'display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border:1px solid var(--border);border-radius:6px;background:transparent;cursor:pointer;color:var(--muted);transition:background .12s,color .12s;flex-shrink:0';
        var IHOV = 'onmouseenter="this.style.background=\'var(--bg)\';this.style.color=\'var(--text)\'" onmouseleave="this.style.background=\'transparent\';this.style.color=\'var(--muted)\'"';
        var IDELHOV = 'onmouseenter="this.style.background=\'#fef2f2\';this.style.color=\'#dc2626\';this.style.borderColor=\'#fecaca\'" onmouseleave="this.style.background=\'transparent\';this.style.color=\'var(--muted)\';this.style.borderColor=\'var(--border)\'"';
        var btnRefresh = '<button title="Refresh DSP" onclick="mp2RefreshDSP(' + i + ',event)" style="' + IBTN + '" ' + IHOV + '>'
          + '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>'
          + '</button>';
        var btnEdit = '<button title="Edit" onclick="mp2ShowMediaPlanDetail(' + i + ')" style="' + IBTN + '" ' + IHOV + '>'
          + '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          + '</button>';
        var btnDelete = '<button title="Delete" onclick="mp2DeletePlan(' + i + ',event)" style="' + IBTN + '" ' + IDELHOV + '>'
          + '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5 3.5V2.5h4v1M5.5 6v4M8.5 6v4M3 3.5l.7 8h6.6l.7-8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          + '</button>';

        return '<div class="tx2-lib-row" style="align-items:center;cursor:default">'
          + '<div class="tx2-lib-icon" style="flex-shrink:0;cursor:pointer" onclick="mp2ShowMediaPlanDetail(' + i + ')">' + inputIco + '</div>'
          + '<div style="flex:1;min-width:0;cursor:pointer" onclick="mp2ShowMediaPlanDetail(' + i + ')">'
          +   '<div style="font-size:12px;font-weight:500;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + mp.name + '</div>'
          +   '<div style="font-size:11px;color:var(--faint);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'
          +     mp.date
          +     (mp.author ? ' &nbsp;·&nbsp; ' + mp.author : '')
          +     flightStr
          +     (mp.impressions ? ' &nbsp;·&nbsp; ' + mp.impressions + ' imp.' : '')
          +     cpmStr
          +     ' &nbsp;·&nbsp; ' + momentsCount + ' moments'
          +   '</div>'
          + '</div>'
          + '<div style="display:flex;align-items:center;gap:6px;flex-shrink:0;padding-left:12px">'
          +   dspBadge
          +   statusBadge
          +   '<div style="width:1px;height:16px;background:var(--border);margin:0 2px"></div>'
          +   btnRefresh
          +   btnEdit
          +   btnDelete
          + '</div>'
          + '</div>';
      }).join('');

  ca.innerHTML =
    '<div style="display:flex;gap:0;min-height:400px">'

    // ── Left: New Plan ──
    + '<div style="width:300px;flex-shrink:0;padding-right:24px;border-right:1px solid var(--border)">'
    +   '<div style="margin-bottom:32px">'
    +     '<div style="font-size:14px;font-weight:600;color:var(--text);letter-spacing:-.2px;margin-bottom:3px">New Plan</div>'
    +     '<div style="font-size:12px;color:var(--muted)">Choose an input type</div>'
    +   '</div>'
    +   '<div style="display:flex;gap:2px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:3px;margin-bottom:16px">'
    +     '<div class="tx2-seg tx2-seg--act" id="tx2-opt-video" onclick="mp2SelectInput(\'video\')">'
    +       '<svg width="13" height="13" viewBox="0 0 32 32" fill="none"><rect x="2" y="6" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M22 13l8-5v16l-8-5V13z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'
    +       '<span>Video</span>'
    +     '</div>'
    +     '<div class="tx2-seg" id="tx2-opt-brief" onclick="mp2SelectInput(\'brief\')">'
    +       '<svg width="13" height="13" viewBox="0 0 32 32" fill="none"><path d="M4 8h24M4 14h18M4 20h24M4 26h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
    +       '<span>Brief</span>'
    +     '</div>'
    +   '</div>'
    +   '<div id="tx2-input-area" style="margin-bottom:16px">' + inputArea('video') + '</div>'
    +   '<div style="margin-bottom:12px">'
    +     '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px">'
    +       '<div style="display:flex;align-items:center;gap:4px">'
    +         '<span style="font-size:11px;font-weight:500;color:var(--text)">Lookback Window</span>'
    +         '<span style="position:relative;display:inline-flex;align-items:center" onmouseenter="this.querySelector(\'.mp2-lbw-tt\').style.display=\'block\'" onmouseleave="this.querySelector(\'.mp2-lbw-tt\').style.display=\'none\'">'
    +           '<svg width="12" height="12" viewBox="0 0 14 14" fill="none" style="color:var(--faint);cursor:default"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.2"/><path d="M7 6.5v3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="7" cy="5" r=".6" fill="currentColor"/></svg>'
    +           '<span class="mp2-lbw-tt" style="display:none;position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);width:220px;background:#1e293b;color:#e2e8f0;font-size:10px;line-height:1.5;padding:7px 10px;border-radius:7px;box-shadow:0 4px 16px rgba(0,0,0,.2);z-index:999;pointer-events:none">The lookback window indicates the time before an Ad Break used to qualify the scene as a Moment</span>'
    +         '</span>'
    +       '</div>'
    +       '<span id="mp2-lookback-label" style="font-size:11px;font-weight:600;color:var(--accent)">4 min</span>'
    +     '</div>'
    +     '<input type="range" id="mp2-lookback-slider" min="30" max="300" value="240" step="15"'
    +       ' oninput="mp2UpdateLookback(this.value)"'
    +       ' style="accent-color:var(--accent)">'
    +     '<div style="display:flex;justify-content:space-between;margin-top:1px">'
    +       '<span style="font-size:9px;color:var(--faint)">30 sec</span>'
    +       '<span style="font-size:9px;color:var(--faint)">5 min</span>'
    +     '</div>'
    +   '</div>'
    +   '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">'
    +     '<span style="font-size:11px;font-weight:500;color:var(--text)">Flight Dates</span>'
    +     '<button id="mp2-flight-pill" onclick="mp2OpenFlightPicker(this)" style="display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 10px;border:1px solid var(--border);border-radius:20px;background:var(--surface);color:var(--text);font-size:11px;font-family:inherit;cursor:pointer;white-space:nowrap;transition:border-color .15s" onmouseenter="this.style.borderColor=\'var(--accent)\'" onmouseleave="this.style.borderColor=\'var(--border)\'">'
    +       '<svg width="11" height="11" viewBox="0 0 12 12" fill="none" style="flex-shrink:0;color:var(--muted)"><rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M1 5h10M4 1v2M8 1v2" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>'
    +       '<span id="mp2-flight-pill-label" style="color:var(--faint)">' + mp2FlightPillLabel() + '</span>'
    +     '</button>'
    +   '</div>'
    +   '<button class="cs-btn-primary" style="width:100%;height:38px;font-size:13px" onclick="mp2Analyze()">Start Analysis</button>'
    + '</div>'

    // ── Right: tabs (Media Plans first, then Previous Analyses) ──
    + '<div style="flex:1;min-width:0;padding-left:24px;display:flex;flex-direction:column">'
    +   '<div style="display:flex;gap:0;border-bottom:1px solid var(--border);margin-bottom:18px;flex-shrink:0">'
    +     '<div id="tx2-plans-tab-btn" class="tx2-home-tab' + (mp2HomeTab === 'plans' ? ' tx2-home-tab--act' : '') + '" onclick="mp2SwitchHomeTab(\'plans\')">'
    +       'Media Plans'
    +     '</div>'
    +     '<div class="tx2-home-tab' + (mp2HomeTab === 'analyses' ? ' tx2-home-tab--act' : '') + '" onclick="mp2SwitchHomeTab(\'analyses\')">'
    +       'Previous Analyses'
    +     '</div>'
    +   '</div>'
    +   '<div id="tx2-home-panel-plans" style="flex:1;overflow-y:auto;' + (mp2HomeTab !== 'plans' ? 'display:none' : '') + '">'
    +     plansRows
    +   '</div>'
    +   '<div id="tx2-home-panel-analyses" style="flex:1;overflow-y:auto;flex-direction:column;gap:0;' + (mp2HomeTab !== 'analyses' ? 'display:none' : 'display:flex') + '">'
    +     libraryRows
    +   '</div>'
    + '</div>'

    + '</div>';

  setTimeout(function(){ mp2SliderFill(mp2LookbackSecs); }, 0);
}

function mp2LibLoad(idx) {
  var TX2_LIBRARY = [
    { type:'video', name:'kroger-ad.mp4' },
    { type:'video', name:'parks-and-rec-s04e11.mp4' },
    { type:'doc',   name:'Q1-content-brief.pdf' },
    { type:'text',  name:'Campaign brief — Spring 2025' },
    { type:'video', name:'yellowstone-s05e08.mp4' },
    { type:'doc',   name:'Brand-safety-guidelines.docx' },
  ];
  var item = TX2_LIBRARY[idx];
  if (!item) return;
  mp2TaxInputType = item.type;
  mp2TaxFileName  = item.name;
  mp2ShowResults();
}

function mp2SwitchHomeTab(tab) {
  mp2HomeTab = tab;
  var analyses = document.getElementById('tx2-home-panel-analyses');
  var plans    = document.getElementById('tx2-home-panel-plans');
  document.querySelectorAll('.tx2-home-tab').forEach(function(el) {
    el.classList.toggle('tx2-home-tab--act', el.getAttribute('onclick').indexOf("'" + tab + "'") >= 0);
  });
  if (analyses) analyses.style.display = tab === 'analyses' ? 'flex' : 'none';
  if (plans)    plans.style.display    = tab === 'plans'    ? ''     : 'none';
}

var mp2LookbackSecs = 240;

// ── Flight Dates picker state (New Analysis panel) ────────────────────────────
var mp2FlightDates = {
  start: '', end: '',
  viewMonth: new Date().getMonth(),
  viewYear:  new Date().getFullYear()
};

function mp2FlightPillLabel() {
  if (mp2FlightDates.start && mp2FlightDates.end) {
    var fmt = function(s) {
      return new Date(s + 'T00:00:00').toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
    };
    return fmt(mp2FlightDates.start) + ' → ' + fmt(mp2FlightDates.end);
  }
  return 'Select dates';
}

function mp2UpdateFlightPill() {
  var lbl = document.getElementById('mp2-flight-pill-label');
  if (!lbl) return;
  var set = mp2FlightDates.start && mp2FlightDates.end;
  lbl.textContent = mp2FlightPillLabel();
  lbl.style.color = set ? 'var(--text)' : 'var(--faint)';
}

function mp2OpenFlightPicker(triggerEl) {
  // Close any existing AI dropdown first
  var existing = document.getElementById('mp2-flight-dd');
  if (existing) { existing.remove(); return; }
  aiCloseDropdown();

  var dd = document.createElement('div');
  dd.id = 'mp2-flight-dd';
  dd.style.cssText = 'position:fixed;z-index:9999;background:var(--surface);border:1px solid var(--border-md);border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.14);padding:14px;width:294px;box-sizing:border-box';
  dd.innerHTML = mp2FlightDdContent();
  document.body.appendChild(dd);

  var rect = triggerEl.getBoundingClientRect();
  var vw   = window.innerWidth, vh = window.innerHeight;
  var ddH  = dd.scrollHeight, ddW = 294, GAP = 6;
  var top  = rect.bottom + GAP + ddH <= vh - 8 ? rect.bottom + GAP : rect.top - GAP - ddH;
  var left = Math.min(rect.left, vw - ddW - 8);
  if (left < 8) left = 8;
  dd.style.top  = Math.max(8, top) + 'px';
  dd.style.left = left + 'px';

  var close = function(e) {
    if (!dd.contains(e.target) && e.target !== triggerEl) {
      dd.remove();
      document.removeEventListener('mousedown', close);
    }
  };
  setTimeout(function() { document.addEventListener('mousedown', close); }, 0);
}

function mp2FlightDdContent() {
  var p = mp2FlightDates;
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var DAYS   = ['Mo','Tu','We','Th','Fr','Sa','Su'];
  var vm = p.viewMonth, vy = p.viewYear;
  var firstDay    = (new Date(vy, vm, 1).getDay() + 6) % 7;
  var daysInMonth = new Date(vy, vm + 1, 0).getDate();
  var daysInPrev  = new Date(vy, vm, 0).getDate();
  var today = new Date(); today.setHours(0,0,0,0);
  var startD = p.start ? new Date(p.start + 'T00:00:00') : null;
  var endD   = p.end   ? new Date(p.end   + 'T00:00:00') : null;
  function ds(y,m,d){ return y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0'); }
  var fmtDL  = function(s){ return new Date(s+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}); };
  var NBTN   = 'background:none;border:none;cursor:pointer;font-size:18px;color:var(--muted);padding:2px 8px;border-radius:5px;line-height:1';
  var html   = '<div style="width:270px">';

  // Status bar
  if (!p.start) {
    html += '<div style="font-size:11px;color:var(--muted);text-align:center;margin-bottom:10px;padding:6px 10px;background:var(--bg);border-radius:6px">Select a start date</div>';
  } else if (!p.end) {
    html += '<div style="font-size:11px;color:#e11d8f;font-weight:500;text-align:center;margin-bottom:10px;padding:6px 10px;background:#fdf2f8;border-radius:6px">'
      + fmtDL(p.start) + ' → now pick end date'
      + '</div>';
  } else {
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;padding:6px 10px;background:#fdf2f8;border-radius:6px">'
      + '<span style="font-size:11px;color:#e11d8f;font-weight:500">' + fmtDL(p.start) + ' – ' + fmtDL(p.end) + '</span>'
      + '<span onclick="event.stopPropagation();mp2FlightDates.start=\'\';mp2FlightDates.end=\'\';mp2UpdateFlightPill();var dd=document.getElementById(\'mp2-flight-dd\');if(dd)dd.innerHTML=mp2FlightDdContent()" style="font-size:11px;color:var(--muted);cursor:pointer;padding:1px 5px;border-radius:4px;border:1px solid var(--border)">Clear</span>'
      + '</div>';
  }

  // Nav header
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
    + '<button style="' + NBTN + '" onclick="event.stopPropagation();mp2FlightCalNav(-1)">‹</button>'
    + '<span style="font-size:13px;font-weight:600;color:var(--text)">' + MONTHS[vm] + ' ' + vy + '</span>'
    + '<button style="' + NBTN + '" onclick="event.stopPropagation();mp2FlightCalNav(1)">›</button>'
    + '</div>';

  // Day headers
  html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:2px">';
  DAYS.forEach(function(d){ html += '<div style="text-align:center;font-size:10px;font-weight:500;color:var(--faint);padding:3px 0">' + d + '</div>'; });
  html += '</div>';

  // Day grid
  html += '<div style="display:grid;grid-template-columns:repeat(7,1fr)">';
  function renderCell(dayNum, dStr, active) {
    if (!active) { html += '<div style="height:34px;display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--faint)">' + dayNum + '</div>'; return; }
    var cellD = new Date(dStr + 'T00:00:00');
    var isSt  = p.start === dStr, isEn = p.end === dStr;
    var inRng = startD && endD && cellD > startD && cellD < endD;
    var isTdy = cellD.getTime() === today.getTime();
    var wrapBg   = inRng ? '#fdf2f8' : (isSt && endD) ? 'linear-gradient(to right,transparent 50%,#fdf2f8 50%)' : (isEn && startD) ? 'linear-gradient(to left,transparent 50%,#fdf2f8 50%)' : 'transparent';
    var innerBg  = (isSt || isEn) ? '#e11d8f' : 'transparent';
    var innerCol = (isSt || isEn) ? '#fff' : isTdy ? '#e11d8f' : 'var(--text)';
    var fw       = (isTdy && !isSt && !isEn) ? '700' : '400';
    html += '<div style="background:' + wrapBg + ';padding:2px 0">'
      + '<div onclick="event.stopPropagation();mp2FlightCalPick(\'' + dStr + '\')" style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:12px;cursor:pointer;border-radius:50%;background:' + innerBg + ';color:' + innerCol + ';font-weight:' + fw + ';margin:0 auto">' + dayNum + '</div>'
      + '</div>';
  }
  for (var i = 0; i < firstDay; i++) { renderCell(daysInPrev - firstDay + 1 + i, '', false); }
  for (var d2 = 1; d2 <= daysInMonth; d2++) { renderCell(d2, ds(vy, vm, d2), true); }
  var rem = (firstDay + daysInMonth) % 7;
  if (rem > 0) for (var j = 1; j <= 7 - rem; j++) { renderCell(j, '', false); }
  html += '</div></div>';

  // OK button
  html += '<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px">'
    + '<button onclick="document.getElementById(\'mp2-flight-dd\').remove()" style="width:100%;height:30px;border-radius:7px;border:1px solid var(--border-md);background:var(--surface);color:var(--text);font-size:12px;font-weight:500;cursor:pointer;font-family:inherit">OK</button>'
    + '</div>';
  return html;
}

function mp2FlightCalNav(dir) {
  mp2FlightDates.viewMonth += dir;
  if (mp2FlightDates.viewMonth < 0)  { mp2FlightDates.viewMonth = 11; mp2FlightDates.viewYear--; }
  if (mp2FlightDates.viewMonth > 11) { mp2FlightDates.viewMonth = 0;  mp2FlightDates.viewYear++; }
  var dd = document.getElementById('mp2-flight-dd');
  if (dd) dd.innerHTML = mp2FlightDdContent();
}

function mp2FlightCalPick(dStr) {
  var p = mp2FlightDates;
  if (!p.start || (p.start && p.end)) {
    p.start = dStr; p.end = '';
  } else {
    if      (dStr < p.start)      { p.end = p.start; p.start = dStr; }
    else if (dStr === p.start)     { p.start = ''; p.end = ''; }
    else                           { p.end = dStr; }
  }
  mp2UpdateFlightPill();
  var dd = document.getElementById('mp2-flight-dd');
  if (dd) dd.innerHTML = mp2FlightDdContent();
}

function mp2InjectSliderStyles() {
  if (document.getElementById('mp2-slider-styles')) return;
  var s = document.createElement('style');
  s.id = 'mp2-slider-styles';
  s.textContent =
    '#mp2-lookback-slider{-webkit-appearance:none;appearance:none;outline:none;border:none;width:100%;height:4px;margin:4px 0;cursor:pointer;border-radius:2px}'
    + '#mp2-lookback-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:13px;height:13px;border-radius:50%;background:#ED005E;cursor:pointer;border:none;outline:none;box-shadow:0 0 0 2px rgba(237,0,94,.15)}'
    + '#mp2-lookback-slider::-moz-range-thumb{width:13px;height:13px;border-radius:50%;background:#ED005E;cursor:pointer;border:none;outline:none}'
    + '#mp2-lookback-slider::-moz-range-track{height:4px;background:#e2e8f0;border-radius:2px;border:none}'
    + '#mp2-lookback-slider::-moz-range-progress{height:4px;background:#ED005E;border-radius:2px}';
  document.head.appendChild(s);
}

function mp2SliderFill(val) {
  var el = document.getElementById('mp2-lookback-slider');
  if (!el) return;
  var pct = (val - 30) / (300 - 30) * 100;
  el.style.background = 'linear-gradient(to right,#ED005E 0%,#ED005E ' + pct + '%,#e2e8f0 ' + pct + '%,#e2e8f0 100%)';
}

function mp2UpdateLookback(val) {
  mp2LookbackSecs = parseInt(val);
  var label = document.getElementById('mp2-lookback-label');
  if (!label) return;
  var s = mp2LookbackSecs;
  var m = Math.floor(s / 60);
  var r = s % 60;
  label.textContent = m > 0 && r > 0 ? m + ' min ' + r + ' sec' : m > 0 ? m + ' min' : s + ' sec';
  mp2SliderFill(mp2LookbackSecs);
}

function mp2DeletePlan(idx, e) {
  if (e) e.stopPropagation();
  if (!confirm('Delete "' + savedMediaPlansV2[idx].name + '"?')) return;
  savedMediaPlansV2.splice(idx, 1);
  mp2ShowUpload();
}

function mp2RefreshDSP(idx, e) {
  if (e) e.stopPropagation();
  var mp = savedMediaPlansV2[idx];
  if (!mp || !mp.dsp) return;
  var btn = e && e.currentTarget;
  if (btn) {
    btn.style.color = 'var(--accent)';
    btn.style.borderColor = 'var(--accent)';
    var svg = btn.querySelector('svg');
    if (svg) { svg.style.transition = 'transform .6s'; svg.style.transform = 'rotate(360deg)'; }
    setTimeout(function() {
      if (svg) { svg.style.transition = 'none'; svg.style.transform = ''; }
      btn.style.color = 'var(--muted)';
      btn.style.borderColor = 'var(--border)';
    }, 650);
  }
}

// ── Media Planner v2: self-contained upload → analyze → results flow ─────────

function mp2SelectInput(type) {
  ['video', 'brief'].forEach(function(t) {
    var el = document.getElementById('tx2-opt-' + t);
    if (el) el.className = 'tx2-seg' + (t === type ? ' tx2-seg--act' : '');
  });
  var area = document.getElementById('tx2-input-area');
  if (!area) return;
  if (type === 'video') {
    mp2TaxInputType = 'video';
    area.innerHTML =
      '<div class="tx2-upload-zone" onclick="document.getElementById(\'tx2-file-input-video\').click()">'
      + '<input type="file" id="tx2-file-input-video" style="display:none" accept="video/*">'
      + '<svg width="28" height="28" viewBox="0 0 32 32" fill="none" style="color:var(--faint)"><rect x="2" y="6" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.6"/><path d="M22 13l8-5v16l-8-5V13z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
      + '<div style="font-size:13px;font-weight:500;color:var(--text);margin-top:6px">Drop video file here</div>'
      + '<div style="font-size:11px;color:var(--faint);margin-top:2px">MP4, MOV, AVI — up to 2 GB</div>'
      + '</div>';
  } else {
    mp2TaxInputType = 'text';
    area.innerHTML = mp2BriefHtml();
  }
}

function mp2BriefHtml() {
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
    +   ' onchange="var n=this.files[0]?this.files[0].name:\'\';document.getElementById(\'tx2-brief-file-label\').textContent=n||\'Upload Doc or PDF\';mp2TaxInputType=n?\'doc\':\'text\'">'
    + '</div>';
}

function mp2Analyze() {
  var ca = document.getElementById('tx2-content-area');
  if (!ca) return;
  mp2TaxStep = 'progress';

  if (mp2TaxInputType === 'text') {
    var ta = document.getElementById('tx2-text-input');
    var raw = ta ? ta.value.trim() : '';
    mp2TaxFileName = raw.length ? (raw.slice(0, 42) + (raw.length > 42 ? '…' : '')) : 'Free text input';
  } else {
    var fi = document.getElementById('tx2-file-input-' + mp2TaxInputType);
    mp2TaxFileName = (fi && fi.files && fi.files[0]) ? fi.files[0].name
      : (mp2TaxInputType === 'video' ? 'video-file.mp4' : 'document.pdf');
  }

  var typeLabel = mp2TaxInputType === 'video' ? 'video file'
               : mp2TaxInputType === 'doc'   ? 'document'
               : 'text input';

  var progressSteps = ['Analyzing metadata…','Detecting scenes & objects…','Classifying moments…','Building taxonomy map…','Matching episodes & shows…'];
  var frames = [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=640&h=360&fit=crop&q=80',
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=640&h=360&fit=crop&q=80',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=640&h=360&fit=crop&q=80',
    'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=640&h=360&fit=crop&q=80',
    'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=640&h=360&fit=crop&q=80',
  ];

  ca.innerHTML =
    '<div style="max-width:520px;margin:0 auto">'
    + '<div style="margin-bottom:14px">'
    +   '<div style="font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.6px;color:var(--faint);margin-bottom:3px">Scanning ' + typeLabel + '</div>'
    +   '<div style="font-size:15px;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + mp2TaxFileName + '</div>'
    + '</div>'
    + '<div style="position:relative;width:100%;padding-top:56.25%;border-radius:10px;overflow:hidden;background:#111;margin-bottom:14px">'
    +   '<img id="tx2-prog-frame" src="' + frames[0] + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:opacity .5s">'
    +   '<div id="tx2-scan-line" style="position:absolute;left:0;right:0;height:2px;top:0%;background:rgba(237,0,94,.7);box-shadow:0 0 10px 2px rgba(237,0,94,.35);transition:none"></div>'
    +   '<div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.65) 0%,transparent 55%);pointer-events:none">'
    +     '<div style="position:absolute;bottom:10px;left:12px;right:12px;display:flex;align-items:center;justify-content:space-between">'
    +       '<span id="tx2-prog-timecode" style="font-size:10px;color:rgba(255,255,255,.75);font-variant-numeric:tabular-nums;letter-spacing:.5px">00:00:00</span>'
    +       '<span id="tx2-prog-scene"    style="font-size:10px;color:rgba(255,255,255,.5)">Scene 1 / 5</span>'
    +     '</div>'
    +   '</div>'
    + '</div>'
    + '<div style="font-size:12px;color:var(--muted);margin-bottom:10px;min-height:18px" id="tx2-progress-label">' + progressSteps[0] + '</div>'
    + '<div class="tx2-progress-track" style="margin-bottom:7px"><div class="tx2-progress-fill" id="tx2-progress-bar" style="width:0%"></div></div>'
    + '<div style="font-size:11px;color:var(--faint);text-align:right" id="tx2-progress-pct">0%</div>'
    + '</div>';

  var pct = 0; var stepIdx = 0; var scanPct = 0; var frameIdx = 0;
  var interval = setInterval(function() {
    pct = Math.min(pct + 0.45, 100);
    scanPct = (scanPct + 3) % 100;
    var bar = document.getElementById('tx2-progress-bar');
    var label = document.getElementById('tx2-progress-label');
    var pctEl = document.getElementById('tx2-progress-pct');
    var scanLine = document.getElementById('tx2-scan-line');
    var timecode = document.getElementById('tx2-prog-timecode');
    var sceneLbl = document.getElementById('tx2-prog-scene');
    var frameEl = document.getElementById('tx2-prog-frame');
    if (bar) bar.style.width = pct + '%';
    if (pctEl) pctEl.textContent = Math.round(pct) + '%';
    if (scanLine) scanLine.style.top = scanPct + '%';
    var totalSec = Math.round((pct / 100) * 2655);
    var hh = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    var mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    var ss = String(totalSec % 60).padStart(2, '0');
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
    if (pct >= 100) {
      clearInterval(interval);
      if (scanLine) scanLine.style.display = 'none';
      setTimeout(mp2ShowResults, 600);
    }
  }, 40);
}

function mp2ShowResults() {
  mp2TaxStep = 'results';
  var ca = document.getElementById('tx2-content-area');
  if (!ca) return;
  var TH = 'padding:9px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);border-bottom:1px solid var(--border)';
  var fileIcon = mp2TaxInputType === 'video'
    ? '<svg width="12" height="12" viewBox="0 0 32 32" fill="none"><rect x="2" y="6" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M22 13l8-5v16l-8-5V13z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'
    : mp2TaxInputType === 'doc'
    ? '<svg width="12" height="12" viewBox="0 0 32 32" fill="none"><path d="M6 4h14l6 6v18a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" stroke-width="1.8"/><path d="M20 4v6h6M10 14h12M10 18h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
    : '<svg width="12" height="12" viewBox="0 0 32 32" fill="none"><path d="M4 8h24M4 14h18M4 20h24M4 26h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

  var pgname = document.getElementById('content-bc');
  if (pgname) pgname.innerHTML =
    '<span style="font-weight:400;opacity:.55;cursor:pointer" onclick="mp2ShowUpload()">Media Planner (v2)</span>'
    + ' &nbsp;/&nbsp; Analysis';

  var typeLabel = mp2TaxInputType === 'video' ? 'Video' : mp2TaxInputType === 'doc' ? 'Document' : 'Text';

  ca.innerHTML =
    '<div style="display:flex;gap:20px;align-items:start;height:calc(100vh - 260px);min-height:460px">'
    + '<div style="width:164px;flex-shrink:0;display:flex;flex-direction:column;gap:14px">'
    +   '<div>'
    +     '<div style="position:relative;width:100%;padding-top:56.25%;border-radius:8px;overflow:hidden;margin-bottom:10px">'
    +       '<img id="tx-thumb-img" src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=640&h=360&fit=crop&q=80" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;background:#e5e7eb">'
    +       '<div style="position:absolute;inset:0;background:rgba(0,0,0,.28);display:flex;align-items:center;justify-content:center">'
    +         '<div style="width:26px;height:26px;background:rgba(255,255,255,.9);border-radius:50%;display:flex;align-items:center;justify-content:center">'
    +           '<svg width="9" height="11" viewBox="0 0 11 13" fill="none"><path d="M1 1.5l9 5-9 5V1.5z" fill="#111" stroke="#111" stroke-width=".5" stroke-linejoin="round"/></svg>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +     '<div style="font-size:12px;font-weight:600;color:var(--text);word-break:break-word;line-height:1.4;margin-bottom:6px">kroger-ad.mp4</div>'
    +     '<div style="display:flex;align-items:center;gap:5px;margin-bottom:10px">'
    +       '<span style="font-size:10px;color:var(--muted);display:flex;align-items:center;gap:3px">' + fileIcon + ' ' + typeLabel + '</span>'
    +     '</div>'
    +   '</div>'
    +   '<div style="display:flex;flex-direction:column;gap:0">'
    + (function() {
        var adRow = function(label, val) {
          return '<div style="display:flex;justify-content:space-between;align-items:baseline;padding:4px 0;border-bottom:1px solid var(--border)">'
            + '<span style="font-size:10px;color:var(--faint);flex-shrink:0;margin-right:6px">' + label + '</span>'
            + '<span style="font-size:10px;font-weight:500;color:var(--text);text-align:right;word-break:break-all">' + val + '</span>'
            + '</div>';
        };
        var lbSecs = mp2LookbackSecs || 240;
        var lbLabel = lbSecs >= 60 ? Math.round(lbSecs / 60) + ' min' : lbSecs + ' sec';
        var fdLabel = (mp2FlightDates && mp2FlightDates.start && mp2FlightDates.end)
          ? (function(s,e){ return new Date(s+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) + ' → ' + new Date(e+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}); })(mp2FlightDates.start, mp2FlightDates.end)
          : '—';
        return adRow('Advertiser','Kroger') + adRow('Domain','kroger.com')
          + adRow('Language','English') + adRow('Duration','30s') + adRow('Format','MP4')
          + '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid var(--border)">'
          +   '<span style="font-size:10px;color:var(--faint);flex-shrink:0;margin-right:6px">IAB</span>'
          +   '<span style="display:flex;align-items:center;gap:5px;justify-content:flex-end;flex-wrap:wrap">'
          +     '<span style="font-size:10px;font-weight:500;color:var(--text);text-align:right">Grocery & Supermarket</span>'
          +     '<span style="font-size:9px;font-weight:600;color:#16a34a;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:20px;padding:1px 6px;white-space:nowrap">92%</span>'
          +   '</span>'
          + '</div>'
          + adRow('Lookback', lbLabel)
          + adRow('Flight Dates', fdLabel);
      })()
    +   '</div>'
    + '</div>'

    + '<div style="flex:1;min-width:0;display:flex;gap:16px;height:100%;overflow:hidden">'
    +   '<div style="flex:1;min-width:0;display:flex;flex-direction:column;height:100%;overflow:hidden">'
    +   '<div class="cs-dv-tabnav" style="margin-bottom:16px;flex-shrink:0">'
    +     '<button class="cs-dv-tab" id="tx2-sub-tab-ad-analysis" onclick="mp2SubTab(\'ad-analysis\')">Ad Analysis</button>'
    +     '<span style="width:1px;height:16px;background:var(--border);align-self:center;flex-shrink:0;margin:0 12px"></span>'
    +     '<button class="cs-dv-tab cs-dv-tab--act" id="tx2-sub-tab-moments" onclick="mp2SubTab(\'moments\')">Moments Match</button>'
    +     '<button class="cs-dv-tab cs-dv-tab--ai"  id="tx2-sub-tab-ai-media-plan" onclick="mp2SubTab(\'ai-media-plan\')">'
    +       '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M6 2L7.3 5.7 11 7 7.3 8.3 6 12 4.7 8.3 1 7 4.7 5.7Z"/><path d="M12.5 1L13.3 3.2 15.5 4 13.3 4.8 12.5 7 11.7 4.8 9.5 4 11.7 3.2Z" opacity=".65"/></svg>'
    +       'AI Media Plan'
    +     '</button>'
    +   '</div>'
    +   '<div id="tx2-sub-content-ad-analysis" style="display:none;flex:1;min-height:0;flex-direction:column">'
    +     '<div style="overflow-y:auto;flex:1;min-height:0">'
    +       '<table style="width:100%;border-collapse:collapse"><thead><tr>'
    +         '<th style="text-align:left;'  + TH + '">Moment</th>'
    +         '<th style="text-align:right;' + TH + '">Score</th>'
    +         '<th style="text-align:right;' + TH + '">Inventory / PODs</th>'
    +       '</tr></thead><tbody id="tx-cat-body"></tbody></table>'
    +     '</div>'
    +   '</div>'
    +   '<div id="tx2-sub-content-moments" style="display:flex;flex:1;min-height:0;flex-direction:column"></div>'
    +   '<div id="tx2-sub-content-ai-media-plan" style="display:none;flex:1;min-height:0;overflow:hidden;background:linear-gradient(160deg,#fef6fb 0%,var(--surface) 70%);border-radius:10px;margin-top:4px"></div>'
    +   '</div>'
    + '<div id="inv-media-plan" style="display:none;width:220px;flex-shrink:0;flex-direction:column;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:14px;overflow:hidden"></div>'
    + '</div>'
    + '</div>';

  if (typeof txInjectStyles === 'function') txInjectStyles();
  txCustomSelections = [];
  mp2SubTab('moments');
}

function mp2SubTab(tab) {
  ['ad-analysis', 'moments', 'ai-media-plan'].forEach(function(t) {
    var btn = document.getElementById('tx2-sub-tab-' + t);
    var pnl = document.getElementById('tx2-sub-content-' + t);
    if (btn) btn.className = 'cs-dv-tab' + (t === 'ai-media-plan' ? ' cs-dv-tab--ai' : '') + (t === tab ? ' cs-dv-tab--act' : '');
    if (pnl) pnl.style.display = t === tab ? 'flex' : 'none';
  });
  if (tab === 'ad-analysis')   { txRenderAdAnalysis(); }
  if (tab === 'moments')       { txCustomSelections = []; mp2RenderMoments(); }
  if (tab === 'ai-media-plan') {
    var aiPanel = document.getElementById('tx2-sub-content-ai-media-plan');
    if (aiPanel) {
      aiPanel.style.display = 'flex';
      aiPanel.style.flexDirection = 'column';
      if (!aiPanel.firstChild) csTx2BuildAIParamsPanel();
    }
  }
}

// ── Inventory Explorer v2: matched programs data + helpers ────────────────────

var INV_PROGRAMS_V2 = [
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

var savedMediaPlansV2     = [
  {
    name:        'Kroger — Fresh & Family Moments',
    date:        '9 May 2026',
    author:      'Bruna',
    inputType:   'video',
    flightStart: '2 Jun 2026',
    flightEnd:   '29 Jun 2026',
    dsp:         { name: 'DV360', status: 'active', pushedAt: '10 May 2026', refId: 'DV3-48821' },
    impressions: '14.3M',
    dollars:     '$341K',
    moments: [
      { name:'Family Dinner Time',   channels:['NBC','Fox','ABC','Food Network'],   inventory:312, impressionsNum:3.8, impressionsLabel:'3.8M', cpm:28, type:'ads'     },
      { name:'Grocery Shopping',     channels:['Food Network','NBC','CBS'],         inventory:278, impressionsNum:3.2, impressionsLabel:'3.2M', cpm:22, type:'organic' },
      { name:'Healthy Eating',       channels:['CBS','Fox','Discovery'],            inventory:241, impressionsNum:2.6, impressionsLabel:'2.6M', cpm:19, type:'live'    },
      { name:'Meal Prep & Cooking',  channels:['Food Network','PBS','Bravo'],       inventory:198, impressionsNum:2.9, impressionsLabel:'2.9M', cpm:24, type:'ads'     },
      { name:'Weekend BBQ',          channels:['Fox','ABC','NBC'],                  inventory:143, impressionsNum:1.8, impressionsLabel:'1.8M', cpm:31, type:'organic' }
    ]
  },
  {
    name:        'Spring Campaign — Comedy Block',
    date:        '1 May 2026',
    author:      'Bruna',
    inputType:   'document',
    flightStart: '12 May 2026',
    flightEnd:   '8 Jun 2026',
    dsp:         { name: 'The Trade Desk', status: 'pending', pushedAt: '2 May 2026', refId: 'TTD-73041' },
    impressions: '6.6M',
    dollars:     '$142K',
    moments: [
      { name:'Urban Lifestyle',      channels:['NBC','ABC','Fox','Peacock'],        inventory:156, impressionsNum:2.5, impressionsLabel:'2.5M', cpm:18 },
      { name:'Youth Culture',        channels:['Peacock','MTV','Bravo'],            inventory:97,  impressionsNum:2.1, impressionsLabel:'2.1M', cpm:17 },
      { name:'Championship Moments', channels:['ESPN','NBC','CBS'],                 inventory:198, impressionsNum:2.0, impressionsLabel:'2.0M', cpm:23 }
    ]
  },
  {
    name:        'Heineken — Late Night Sports',
    date:        '24 Apr 2026',
    author:      'Marika',
    inputType:   'text',
    flightStart: '5 May 2026',
    flightEnd:   '18 May 2026',
    dsp:         { name: 'Xandr', status: 'error', pushedAt: '25 Apr 2026', refId: 'XND-29104' },
    impressions: '6.7M',
    dollars:     '$153K',
    moments: [
      { name:'Sports Drama',         channels:['Paramount','NBC','Discovery'],      inventory:167, impressionsNum:2.8, impressionsLabel:'2.8M', cpm:21 },
      { name:'Endurance Sports',     channels:['ESPN','Discovery','Sports+'],       inventory:143, impressionsNum:2.2, impressionsLabel:'2.2M', cpm:20 },
      { name:'Peak Performance',     channels:['ESPN','NBC','Fox'],                 inventory:156, impressionsNum:1.7, impressionsLabel:'1.7M', cpm:22 }
    ]
  },
  {
    name:        'Spotify — Daytime Discovery',
    date:        '18 Apr 2026',
    author:      'Bruna',
    inputType:   'video',
    flightStart: '26 Apr 2026',
    flightEnd:   '31 May 2026',
    dsp:         null,
    impressions: '6.9M',
    dollars:     '$104K',
    moments: [
      { name:'Adventure Travel',     channels:['Discovery','NatGeo','NBC'],         inventory:178, impressionsNum:2.4, impressionsLabel:'2.4M', cpm:16 },
      { name:'Outdoor & Nature',     channels:['NatGeo','Discovery','PBS'],         inventory:211, impressionsNum:2.5, impressionsLabel:'2.5M', cpm:15 },
      { name:'Motivation & Mindset', channels:['NBC','ABC','Peacock','TNT'],        inventory:302, impressionsNum:2.0, impressionsLabel:'2.0M', cpm:17 }
    ]
  }
];
var mp2HomeTab        = 'plans';

// ── AI Media Plan params state ────────────────────────────────────────────────
var aiParams = {
  budget:      { noBudget: false, min: 0, max: 1000000, exact: '' },
  impressions: { noEstimate: false, min: 0, max: 10000000, exact: '' },
  daypart:     { mode: 'any', values: [] },
  channels:    { mode: 'any', values: [] },
  type:        { mode: 'any', values: [] },
  programs:    { mode: 'any', exact: '', min: '', max: '' },
  brand:       { mode: 'any', values: [] },
  score:       { mode: 'all', values: [] },
  dates:       { start: '', end: '', viewMonth: new Date().getMonth(), viewYear: new Date().getFullYear() }
};

// ── AI trigger helpers ─────────────────────────────────────────────────────

function aiTriggerText(param) {
  var p = aiParams[param];
  if (param === 'budget') {
    var BDG_MAX = 1000000;
    if (p.noBudget) return 'no budget';
    if (p.exact) return '$' + Number(p.exact).toLocaleString();
    var bMin = p.min, bMax = p.max;
    var hasRange = (bMin > 0 || bMax < BDG_MAX);
    if (!hasRange) return '…';
    if (bMin === bMax) return '$' + Number(bMin).toLocaleString();
    return '$' + Number(bMin).toLocaleString() + '–$' + Number(bMax).toLocaleString();
  }
  if (param === 'impressions') {
    var IMP_MAX = 10000000;
    function fmtImp(n) { return n >= 1000000 ? (n/1000000).toFixed(n%1000000===0?0:1)+'M' : n >= 1000 ? Math.round(n/1000)+'K' : String(n); }
    if (p.noEstimate) return 'no estimate';
    if (p.exact) return fmtImp(Number(p.exact));
    var iMin = p.min, iMax = p.max;
    var hasImpRange = (iMin > 0 || iMax < IMP_MAX);
    if (!hasImpRange) return '…';
    if (iMin === iMax) return fmtImp(iMin);
    return fmtImp(iMin) + '–' + fmtImp(iMax);
  }
  if (!p || p.mode === 'any') return '…';
  if (param === 'programs') {
    if (p.mode === 'exact' && p.exact) return p.exact + (parseInt(p.exact) > 1 ? ' shows' : ' show');
    if (p.mode === 'range' && (p.min || p.max)) return (p.min||'1') + '–' + (p.max||'∞') + ' shows';
  } else if (param === 'daypart') {
    if (p.mode === 'all') return 'All';
    if (p.mode === 'custom' && p.values.length > 0) return p.values.join(', ');
  } else if (param === 'channels') {
    if (p.mode === 'all') return 'All';
    if (p.mode === 'custom' && p.values.length > 0) return p.values.join(', ');
  } else if (param === 'type') {
    if (p.mode === 'all') return 'All';
    if (p.mode === 'custom' && p.values.length > 0) return p.values.join(', ');
  } else if (param === 'brand') {
    if (p.mode === 'all') return 'No Restrictions';
    if (p.mode === 'custom' && p.values.length > 0) return 'no ' + p.values.join(', ');
  } else if (param === 'score') {
    if (p.mode === 'all' || !p.values || p.values.length === 0) return '…';
    return p.values.join(', ');
  } else if (param === 'dates') {
    if (!p.start) return '…';
    var fmtD = function(s) { return new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month:'short', day:'numeric' }); };
    if (!p.end) return fmtD(p.start);
    return fmtD(p.start) + ' – ' + fmtD(p.end);
  }
  return '…';
}

var AI_PLACEHOLDERS = {
  budget:      'Select Budget',
  impressions: 'Select Number',
  daypart:     'Select Daypart',
  channels:    'Select Channels',
  type:        'Select Type',
  programs:    'Select Shows',
  brand:       'Select Brand Safety',
  score:       'Select Score',
  dates:       'Select Dates'
};

function aiTriggerHtml(param) {
  var val  = aiTriggerText(param);
  var set  = val !== '…';
  var label = set ? val : (AI_PLACEHOLDERS[param] || '…');
  return '<span class="ai-trigger' + (set ? ' ai-trigger--set' : '') + '" id="ai-trigger-' + param + '" onclick="aiOpenDropdown(\'' + param + '\',this)">' + label + '</span>';
}

function aiUpdateTrigger(param) {
  var el = document.getElementById('ai-trigger-' + param);
  if (!el) return;
  var val  = aiTriggerText(param);
  var set  = val !== '…';
  el.textContent = set ? val : (AI_PLACEHOLDERS[param] || '…');
  el.className   = 'ai-trigger' + (set ? ' ai-trigger--set' : '');
}

// ── AI dropdown ───────────────────────────────────────────────────────────────

function aiOpenDropdown(param, triggerEl) {
  aiCloseDropdown();
  var dd = document.getElementById('ai-global-dd');
  if (!dd) {
    dd = document.createElement('div');
    dd.id = 'ai-global-dd';
    document.body.appendChild(dd);
  }

  var ddW = param === 'dates' ? 294 : 260;
  dd.style.cssText = 'position:fixed;z-index:9999;background:var(--surface);border:1px solid var(--border-md);border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.14);padding:14px;width:' + ddW + 'px;box-sizing:border-box;visibility:hidden;display:block;overflow-y:auto';
  dd.innerHTML = aiDdContent(param);

  var rect = triggerEl.getBoundingClientRect();
  var vw   = window.innerWidth;
  var vh   = window.innerHeight;
  var ddH  = dd.scrollHeight;
  var GAP  = 6;

  // Vertical: prefer below, flip above if not enough room
  var top;
  if (rect.bottom + GAP + ddH <= vh - 8) {
    top = rect.bottom + GAP;
  } else if (rect.top - GAP - ddH >= 8) {
    top = rect.top - GAP - ddH;
  } else {
    // Constrain with max-height
    top = rect.bottom + GAP;
    dd.style.maxHeight = (vh - top - 8) + 'px';
  }

  // Horizontal: align to trigger left, clamp to viewport
  var left = rect.left;
  if (left + ddW > vw - 8) left = vw - ddW - 8;
  if (left < 8) left = 8;

  dd.style.top  = top + 'px';
  dd.style.left = left + 'px';
  dd.style.visibility = 'visible';

  setTimeout(function() { document.addEventListener('click', _aiDdOutside); }, 0);
}

function _aiDdOutside(e) {
  var dd = document.getElementById('ai-global-dd');
  if (dd && dd.style.display !== 'none' && !dd.contains(e.target) && !e.target.closest('.ai-trigger')) {
    aiCloseDropdown();
  }
}

function aiCloseDropdown() {
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.style.display = 'none';
  document.removeEventListener('click', _aiDdOutside);
}

function aiDdOkBtn() {
  return '<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px">'
    + '<button onclick="aiCloseDropdown()" style="width:100%;height:30px;border-radius:7px;border:1px solid var(--border-md);background:var(--surface);color:var(--text);font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;transition:background .12s" onmouseenter="this.style.background=\'var(--bg)\'" onmouseleave="this.style.background=\'var(--surface)\'">OK</button>'
    + '</div>';
}

function aiDdContent(param) {
  var p = aiParams[param];

  function modeSeg(opts) {
    return '<div style="display:flex;gap:2px;background:var(--bg);border:1px solid var(--border);border-radius:7px;padding:2px;margin-bottom:10px">'
      + opts.map(function(o) {
          var act = (param === 'daypart' || param === 'channels')
            ? (o.val === 'any' ? p.mode === 'any' : p.mode !== 'any' && p.dir === o.val)
            : p.mode === o.val;
          return '<button class="ai-mode-btn' + (act ? ' ai-mode-btn--act' : '') + '" onclick="aiDdDo(\'' + param + '\',\'' + o.val + '\')">' + o.label + '</button>';
        }).join('')
      + '</div>';
  }

  function checkPills(items) {
    return '<div style="display:flex;flex-wrap:wrap;gap:5px">'
      + items.map(function(v) {
          var chk = p.values.indexOf(v) >= 0;
          return '<label class="ai-check-pill"' + (chk ? ' style="border-color:#e11d8f;color:#e11d8f;background:#fdf2f8"' : '') + '>'
            + '<input type="checkbox" value="' + v + '"' + (chk ? ' checked' : '') + ' onchange="aiDdCheckItem(\'' + param + '\',this)">'
            + '<span>' + v + '</span></label>';
        }).join('')
      + '</div>';
  }

  if (param === 'budget') {
    var BDG_MAX = 1000000;
    var bMin = p.noBudget ? 0 : (p.min || 0);
    var bMax = p.noBudget ? BDG_MAX : (p.max || BDG_MAX);
    var minPct = bMin / BDG_MAX * 100;
    var maxPct = bMax / BDG_MAX * 100;
    var dis = p.noBudget ? 'opacity:.35;pointer-events:none;' : '';
    return '<div style="' + dis + '">'
      // Dual range slider
      + '<div style="position:relative;height:28px;margin-bottom:8px">'
      +   '<div style="position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);height:4px;background:var(--border);border-radius:2px">'
      +     '<div id="ai-bdg-track" style="position:absolute;height:100%;border-radius:2px;background:linear-gradient(90deg,#e11d8f,#f43f5e);left:' + minPct + '%;right:' + (100 - maxPct) + '%"></div>'
      +   '</div>'
      +   '<input type="range" id="ai-bdg-min" class="ai-range" min="0" max="' + BDG_MAX + '" step="10000" value="' + bMin + '" oninput="aiBudgetSlide(\'min\',this.value)">'
      +   '<input type="range" id="ai-bdg-max" class="ai-range" min="0" max="' + BDG_MAX + '" step="10000" value="' + bMax + '" oninput="aiBudgetSlide(\'max\',this.value)">'
      + '</div>'
      // Min / Max labels
      + '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:12px">'
      +   '<span id="ai-bdg-min-lbl">$' + Number(bMin).toLocaleString() + '</span>'
      +   '<span id="ai-bdg-max-lbl">$' + Number(bMax).toLocaleString() + '</span>'
      + '</div>'
      // Exact input
      + '<input type="number" id="ai-bdg-exact" class="ai-input" placeholder="Or enter exact budget…" value="' + (p.exact||'') + '" style="width:100%;box-sizing:border-box" oninput="aiBudgetExact(this.value)">'
      + '</div>'
      // No budget checkbox
      + '<label style="display:flex;align-items:center;gap:7px;margin-top:10px;cursor:pointer;font-size:12px;color:var(--muted);user-select:none">'
      +   '<input type="checkbox"' + (p.noBudget ? ' checked' : '') + ' style="accent-color:#e11d8f;width:13px;height:13px" onchange="aiParams.budget.noBudget=this.checked;aiUpdateTrigger(\'budget\');var dd=document.getElementById(\'ai-global-dd\');if(dd)dd.innerHTML=aiDdContent(\'budget\')">'
      +   "I don't have a budget"
      + '</label>'
      + aiDdOkBtn();
  }

  if (param === 'impressions') {
    var IMP_MAX = 10000000;
    function fmtImpLbl(n) { return n >= 1000000 ? (n/1000000).toFixed(n%1000000===0?0:1)+'M' : n >= 1000 ? Math.round(n/1000)+'K' : String(n); }
    var iMin = p.noEstimate ? 0 : (p.min || 0);
    var iMax = p.noEstimate ? IMP_MAX : (p.max || IMP_MAX);
    var iMinPct = iMin / IMP_MAX * 100;
    var iMaxPct = iMax / IMP_MAX * 100;
    var iDis = p.noEstimate ? 'opacity:.35;pointer-events:none;' : '';
    return '<div style="' + iDis + '">'
      + '<div style="position:relative;height:28px;margin-bottom:8px">'
      +   '<div style="position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);height:4px;background:var(--border);border-radius:2px">'
      +     '<div id="ai-imp-track" style="position:absolute;height:100%;border-radius:2px;background:linear-gradient(90deg,#e11d8f,#f43f5e);left:' + iMinPct + '%;right:' + (100 - iMaxPct) + '%"></div>'
      +   '</div>'
      +   '<input type="range" id="ai-imp-min" class="ai-range" min="0" max="' + IMP_MAX + '" step="100000" value="' + iMin + '" oninput="aiImprSlide(\'min\',this.value)">'
      +   '<input type="range" id="ai-imp-max" class="ai-range" min="0" max="' + IMP_MAX + '" step="100000" value="' + iMax + '" oninput="aiImprSlide(\'max\',this.value)">'
      + '</div>'
      + '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:12px">'
      +   '<span id="ai-imp-min-lbl">' + fmtImpLbl(iMin) + '</span>'
      +   '<span id="ai-imp-max-lbl">' + fmtImpLbl(iMax) + '</span>'
      + '</div>'
      + '<input type="number" id="ai-imp-exact" class="ai-input" placeholder="Or enter exact impressions…" value="' + (p.exact||'') + '" style="width:100%;box-sizing:border-box" oninput="aiImprExact(this.value)">'
      + '</div>'
      + '<label style="display:flex;align-items:center;gap:7px;margin-top:10px;cursor:pointer;font-size:12px;color:var(--muted);user-select:none">'
      +   '<input type="checkbox"' + (p.noEstimate ? ' checked' : '') + ' style="accent-color:#e11d8f;width:13px;height:13px" onchange="aiParams.impressions.noEstimate=this.checked;aiUpdateTrigger(\'impressions\');var dd=document.getElementById(\'ai-global-dd\');if(dd)dd.innerHTML=aiDdContent(\'impressions\')">'
      +   'No estimate impressions'
      + '</label>'
      + aiDdOkBtn();
  }

  if (param === 'programs') {
    return modeSeg([{val:'any',label:'Any'},{val:'exact',label:'Exact'},{val:'range',label:'Range'}])
      + (p.mode === 'exact'
        ? '<div style="display:flex;align-items:center;gap:6px">'
          + '<input type="number" class="ai-input" placeholder="e.g. 5" value="' + (p.exact||'') + '" style="width:90px" oninput="aiParams.programs.exact=this.value;aiUpdateTrigger(\'programs\')">'
          + '</div>'
        : p.mode === 'range'
        ? '<div style="display:flex;align-items:center;gap:5px">'
          + '<input type="number" class="ai-input" placeholder="Min" value="' + (p.min||'') + '" style="flex:1" oninput="aiParams.programs.min=this.value;aiUpdateTrigger(\'programs\')">'
          + '<span style="color:var(--faint)">—</span>'
          + '<input type="number" class="ai-input" placeholder="Max" value="' + (p.max||'') + '" style="flex:1" oninput="aiParams.programs.max=this.value;aiUpdateTrigger(\'programs\')">'
          + '</div>'
        : '')
      + aiDdOkBtn();
  }

  if (param === 'daypart') {
    var dpItems = ['Morning','Daytime','Early Fringe','Prime Time','Late Night'];
    var dpAllChecked = p.mode === 'all';
    var ROW = 'display:flex;align-items:center;gap:9px;padding:5px 2px;cursor:pointer;font-size:13px;color:var(--text);user-select:none;border-radius:5px;';
    return '<div style="display:flex;flex-direction:column">'
      + '<label style="' + ROW + 'font-weight:500;margin-bottom:2px">'
      +   '<input type="checkbox"' + (dpAllChecked ? ' checked' : '') + ' style="accent-color:#e11d8f;width:14px;height:14px;flex-shrink:0" onchange="aiDaypartAll()">'
      +   'All'
      + '</label>'
      + '<div style="height:1px;background:var(--border);margin:2px 0 4px"></div>'
      + dpItems.map(function(v) {
          var chk = p.values.indexOf(v) >= 0;
          return '<label style="' + ROW + '">'
            + '<input type="checkbox" value="' + v + '"' + (chk ? ' checked' : '') + ' style="accent-color:#e11d8f;width:14px;height:14px;flex-shrink:0" onchange="aiDaypartItem(\'' + v + '\',this.checked)">'
            + v
            + '</label>';
        }).join('')
      + '</div>'
      + aiDdOkBtn();
  }

  if (param === 'channels') {
    var chItems = INV_PROGRAMS.map(function(x){ return x.channel; }).filter(function(v,i,a){ return a.indexOf(v)===i; }).sort();
    var chAllChecked = p.mode === 'all';
    var CH_ROW = 'display:flex;align-items:center;gap:9px;padding:5px 2px;cursor:pointer;font-size:13px;color:var(--text);user-select:none;border-radius:5px;';
    return '<div style="display:flex;flex-direction:column">'
      + '<label style="' + CH_ROW + 'font-weight:500;margin-bottom:2px">'
      +   '<input type="checkbox"' + (chAllChecked ? ' checked' : '') + ' style="accent-color:#e11d8f;width:14px;height:14px;flex-shrink:0" onchange="aiChannelsAll()">'
      +   'All'
      + '</label>'
      + '<div style="height:1px;background:var(--border);margin:2px 0 4px"></div>'
      + chItems.map(function(v) {
          var chk = p.values.indexOf(v) >= 0;
          return '<label style="' + CH_ROW + '">'
            + '<input type="checkbox" value="' + v + '"' + (chk ? ' checked' : '') + ' style="accent-color:#e11d8f;width:14px;height:14px;flex-shrink:0" onchange="aiChannelsItem(\'' + v + '\',this.checked)">'
            + v
            + '</label>';
        }).join('')
      + '</div>'
      + aiDdOkBtn();
  }

  if (param === 'type') {
    var tyItems = ['Ads', 'Organic Pause', 'Live'];
    var tyAllChecked = p.mode === 'all';
    var TY_ROW = 'display:flex;align-items:center;gap:9px;padding:5px 2px;cursor:pointer;font-size:13px;color:var(--text);user-select:none;border-radius:5px;';
    return '<div style="display:flex;flex-direction:column">'
      + '<label style="' + TY_ROW + 'font-weight:500;margin-bottom:2px">'
      +   '<input type="checkbox"' + (tyAllChecked ? ' checked' : '') + ' style="accent-color:#e11d8f;width:14px;height:14px;flex-shrink:0" onchange="aiTypeAll()">'
      +   'All'
      + '</label>'
      + '<div style="height:1px;background:var(--border);margin:2px 0 4px"></div>'
      + tyItems.map(function(v) {
          var chk = p.values.indexOf(v) >= 0;
          return '<label style="' + TY_ROW + '">'
            + '<input type="checkbox" value="' + v + '"' + (chk ? ' checked' : '') + ' style="accent-color:#e11d8f;width:14px;height:14px;flex-shrink:0" onchange="aiTypeItem(\'' + v + '\',this.checked)">'
            + v
            + '</label>';
        }).join('')
      + '</div>'
      + aiDdOkBtn();
  }

  if (param === 'brand') {
    var brItems = ['Alcohol','Violence','Gambling','Drugs','Adult Content','Weapons','Political'];
    var brAllChecked = p.mode === 'all';
    var BR_ROW = 'display:flex;align-items:center;gap:9px;padding:5px 2px;cursor:pointer;font-size:13px;color:var(--text);user-select:none;border-radius:5px;';
    return '<div style="display:flex;flex-direction:column">'
      + '<label style="' + BR_ROW + 'font-weight:500;margin-bottom:2px">'
      +   '<input type="checkbox"' + (brAllChecked ? ' checked' : '') + ' style="accent-color:#e11d8f;width:14px;height:14px;flex-shrink:0" onchange="aiBrandAll()">'
      +   'No Restrictions'
      + '</label>'
      + '<div style="height:1px;background:var(--border);margin:2px 0 4px"></div>'
      + brItems.map(function(v) {
          var chk = p.values.indexOf(v) >= 0;
          return '<label style="' + BR_ROW + '">'
            + '<input type="checkbox" value="' + v + '"' + (chk ? ' checked' : '') + ' style="accent-color:#e11d8f;width:14px;height:14px;flex-shrink:0" onchange="aiBrandItem(\'' + v + '\',this.checked)">'
            + v
            + '</label>';
        }).join('')
      + '</div>'
      + aiDdOkBtn();
  }

  if (param === 'score') {
    var scItems = ['High', 'Standard'];
    var scAllChecked = p.mode === 'all' || !p.values || p.values.length === 0;
    var SC_ROW = 'display:flex;align-items:center;gap:9px;padding:5px 2px;cursor:pointer;font-size:13px;color:var(--text);user-select:none;border-radius:5px;';
    return '<div style="display:flex;flex-direction:column">'
      + '<label style="' + SC_ROW + 'font-weight:500;margin-bottom:2px">'
      +   '<input type="checkbox"' + (scAllChecked ? ' checked' : '') + ' style="accent-color:#e11d8f;width:14px;height:14px;flex-shrink:0" onchange="aiScoreAll()">'
      +   'All'
      + '</label>'
      + '<div style="height:1px;background:var(--border);margin:2px 0 4px"></div>'
      + scItems.map(function(v) {
          var chk = !scAllChecked && p.values.indexOf(v) >= 0;
          return '<label style="' + SC_ROW + '">'
            + '<input type="checkbox" value="' + v + '"' + (chk ? ' checked' : '') + ' style="accent-color:#e11d8f;width:14px;height:14px;flex-shrink:0" onchange="aiScoreItem(\'' + v + '\',this.checked)">'
            + v
            + '</label>';
        }).join('')
      + '</div>'
      + aiDdOkBtn();
  }
  if (param === 'dates') {
    var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var DAYS   = ['Mo','Tu','We','Th','Fr','Sa','Su'];
    var vm = p.viewMonth, vy = p.viewYear;
    var firstDay = (new Date(vy, vm, 1).getDay() + 6) % 7; // 0=Mon
    var daysInMonth = new Date(vy, vm + 1, 0).getDate();
    var daysInPrev  = new Date(vy, vm, 0).getDate();
    var today = new Date(); today.setHours(0,0,0,0);
    var startD = p.start ? new Date(p.start + 'T00:00:00') : null;
    var endD   = p.end   ? new Date(p.end   + 'T00:00:00') : null;
    function ds(y,m,d){ return y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0'); }
    var fmtDL = function(s) { return new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month:'short', day:'numeric' }); };
    var NBTN = 'background:none;border:none;cursor:pointer;font-size:18px;color:var(--muted);padding:2px 8px;border-radius:5px;line-height:1;pointer-events:all';
    var html = '<div style="width:270px">';

    // Status bar
    if (!p.start) {
      html += '<div style="font-size:11px;color:var(--muted);text-align:center;margin-bottom:10px;padding:6px 10px;background:var(--bg);border-radius:6px">Select a start date</div>';
    } else if (!p.end) {
      html += '<div style="font-size:11px;color:#e11d8f;font-weight:500;text-align:center;margin-bottom:10px;padding:6px 10px;background:#fdf2f8;border-radius:6px">'
        + fmtDL(p.start) + ' → now pick end date'
        + '</div>';
    } else {
      html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;padding:6px 10px;background:#fdf2f8;border-radius:6px">'
        + '<span style="font-size:11px;color:#e11d8f;font-weight:500">' + fmtDL(p.start) + ' – ' + fmtDL(p.end) + '</span>'
        + '<span onclick="event.stopPropagation();aiParams.dates.start=\'\';aiParams.dates.end=\'\';aiUpdateTrigger(\'dates\');var dd=document.getElementById(\'ai-global-dd\');if(dd)dd.innerHTML=aiDdContent(\'dates\')" style="font-size:11px;color:var(--muted);cursor:pointer;padding:1px 5px;border-radius:4px;border:1px solid var(--border)">Clear</span>'
        + '</div>';
    }

    // Nav header
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
      +   '<button style="' + NBTN + '" onclick="event.stopPropagation();aiCalNav(-1)">‹</button>'
      +   '<span style="font-size:13px;font-weight:600;color:var(--text)">' + MONTHS[vm] + ' ' + vy + '</span>'
      +   '<button style="' + NBTN + '" onclick="event.stopPropagation();aiCalNav(1)">›</button>'
      + '</div>';

    // Day-of-week headers
    html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:2px">';
    DAYS.forEach(function(d){ html += '<div style="text-align:center;font-size:10px;font-weight:500;color:var(--faint);padding:3px 0">' + d + '</div>'; });
    html += '</div>';

    // Day cells grid — no gap, use wrapper bg for range fill
    html += '<div style="display:grid;grid-template-columns:repeat(7,1fr)">';

    function renderCell(dayNum, dStr, active) {
      if (!active) {
        html += '<div style="height:34px;display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--faint)">' + dayNum + '</div>';
        return;
      }
      var cellD  = new Date(dStr + 'T00:00:00');
      var isSt   = p.start === dStr;
      var isEn   = p.end   === dStr;
      var inRng  = startD && endD && cellD > startD && cellD < endD;
      var isTdy  = cellD.getTime() === today.getTime();
      var colInRow = (html.split('grid-template-columns').length - 2) % 7; // rough col tracking

      // Outer wrapper background for range band
      var wrapBg = inRng ? '#fdf2f8'
        : (isSt && endD)  ? 'linear-gradient(to right, transparent 50%, #fdf2f8 50%)'
        : (isEn && startD) ? 'linear-gradient(to left, transparent 50%, #fdf2f8 50%)'
        : 'transparent';

      var innerBg  = (isSt || isEn) ? '#e11d8f' : 'transparent';
      var innerCol = (isSt || isEn) ? '#fff' : isTdy ? '#e11d8f' : 'var(--text)';
      var fw       = (isTdy && !isSt && !isEn) ? '700' : '400';

      html += '<div style="background:' + wrapBg + ';padding:2px 0">'
        + '<div onclick="event.stopPropagation();aiCalPick(\'' + dStr + '\')" style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:12px;cursor:pointer;border-radius:50%;background:' + innerBg + ';color:' + innerCol + ';font-weight:' + fw + ';margin:0 auto">' + dayNum + '</div>'
        + '</div>';
    }

    for (var i = 0; i < firstDay; i++) { renderCell(daysInPrev - firstDay + 1 + i, '', false); }
    for (var d3 = 1; d3 <= daysInMonth; d3++) { renderCell(d3, ds(vy, vm, d3), true); }
    var rem = (firstDay + daysInMonth) % 7;
    if (rem > 0) for (var j = 1; j <= 7 - rem; j++) { renderCell(j, '', false); }

    html += '</div></div>';
    return html + aiDdOkBtn();
  }
  return '';
}

function aiBudgetSlide(which, val) {
  var BDG_MAX = 1000000;
  val = parseInt(val) || 0;
  var p = aiParams.budget;
  if (which === 'min') {
    p.min = Math.min(val, p.max);
    var minEl = document.getElementById('ai-bdg-min');
    if (minEl) minEl.value = p.min;
  } else {
    p.max = Math.max(val, p.min);
    var maxEl = document.getElementById('ai-bdg-max');
    if (maxEl) maxEl.value = p.max;
  }
  p.exact = '';
  var exactEl = document.getElementById('ai-bdg-exact');
  if (exactEl) exactEl.value = '';
  var minPct = p.min / BDG_MAX * 100;
  var maxPct = p.max / BDG_MAX * 100;
  var track = document.getElementById('ai-bdg-track');
  if (track) { track.style.left = minPct + '%'; track.style.right = (100 - maxPct) + '%'; }
  var minLbl = document.getElementById('ai-bdg-min-lbl');
  if (minLbl) minLbl.textContent = '$' + Number(p.min).toLocaleString();
  var maxLbl = document.getElementById('ai-bdg-max-lbl');
  if (maxLbl) maxLbl.textContent = '$' + Number(p.max).toLocaleString();
  aiUpdateTrigger('budget');
}

function aiBudgetExact(val) {
  var BDG_MAX = 1000000;
  val = Math.min(Math.max(parseInt(val) || 0, 0), BDG_MAX);
  var p = aiParams.budget;
  p.exact = val;
  p.min = val;
  p.max = val;
  var minEl = document.getElementById('ai-bdg-min');
  var maxEl = document.getElementById('ai-bdg-max');
  if (minEl) minEl.value = val;
  if (maxEl) maxEl.value = val;
  var pct = val / BDG_MAX * 100;
  var track = document.getElementById('ai-bdg-track');
  if (track) { track.style.left = pct + '%'; track.style.right = (100 - pct) + '%'; }
  var minLbl = document.getElementById('ai-bdg-min-lbl');
  if (minLbl) minLbl.textContent = '$' + Number(val).toLocaleString();
  var maxLbl = document.getElementById('ai-bdg-max-lbl');
  if (maxLbl) maxLbl.textContent = '$' + Number(val).toLocaleString();
  aiUpdateTrigger('budget');
}

function aiImprSlide(which, val) {
  var IMP_MAX = 10000000;
  function fmt(n) { return n >= 1000000 ? (n/1000000).toFixed(n%1000000===0?0:1)+'M' : n >= 1000 ? Math.round(n/1000)+'K' : String(n); }
  val = parseInt(val) || 0;
  var p = aiParams.impressions;
  if (which === 'min') {
    p.min = Math.min(val, p.max);
    var minEl = document.getElementById('ai-imp-min');
    if (minEl) minEl.value = p.min;
  } else {
    p.max = Math.max(val, p.min);
    var maxEl = document.getElementById('ai-imp-max');
    if (maxEl) maxEl.value = p.max;
  }
  p.exact = '';
  var exactEl = document.getElementById('ai-imp-exact');
  if (exactEl) exactEl.value = '';
  var minPct = p.min / IMP_MAX * 100;
  var maxPct = p.max / IMP_MAX * 100;
  var track = document.getElementById('ai-imp-track');
  if (track) { track.style.left = minPct + '%'; track.style.right = (100 - maxPct) + '%'; }
  var minLbl = document.getElementById('ai-imp-min-lbl');
  if (minLbl) minLbl.textContent = fmt(p.min);
  var maxLbl = document.getElementById('ai-imp-max-lbl');
  if (maxLbl) maxLbl.textContent = fmt(p.max);
  aiUpdateTrigger('impressions');
}

function aiImprExact(val) {
  var IMP_MAX = 10000000;
  function fmt(n) { return n >= 1000000 ? (n/1000000).toFixed(n%1000000===0?0:1)+'M' : n >= 1000 ? Math.round(n/1000)+'K' : String(n); }
  val = Math.min(Math.max(parseInt(val) || 0, 0), IMP_MAX);
  var p = aiParams.impressions;
  p.exact = val; p.min = val; p.max = val;
  var minEl = document.getElementById('ai-imp-min');
  var maxEl = document.getElementById('ai-imp-max');
  if (minEl) minEl.value = val;
  if (maxEl) maxEl.value = val;
  var pct = val / IMP_MAX * 100;
  var track = document.getElementById('ai-imp-track');
  if (track) { track.style.left = pct + '%'; track.style.right = (100 - pct) + '%'; }
  var minLbl = document.getElementById('ai-imp-min-lbl');
  if (minLbl) minLbl.textContent = fmt(val);
  var maxLbl = document.getElementById('ai-imp-max-lbl');
  if (maxLbl) maxLbl.textContent = fmt(val);
  aiUpdateTrigger('impressions');
}

function aiCalNav(dir) {
  var p = aiParams.dates;
  p.viewMonth += dir;
  if (p.viewMonth < 0)  { p.viewMonth = 11; p.viewYear--; }
  if (p.viewMonth > 11) { p.viewMonth = 0;  p.viewYear++; }
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.innerHTML = aiDdContent('dates');
}

function aiCalPick(dStr) {
  var p = aiParams.dates;
  if (!p.start || (p.start && p.end)) {
    p.start = dStr; p.end = '';
  } else {
    if (dStr < p.start)      { p.end = p.start; p.start = dStr; }
    else if (dStr === p.start){ p.start = ''; p.end = ''; }
    else                      { p.end = dStr; }
  }
  aiUpdateTrigger('dates');
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.innerHTML = aiDdContent('dates');
}

function aiScoreSlide(which, val) {
  val = parseInt(val) || 0;
  var p = aiParams.score;
  if (which === 'min') {
    p.min = Math.min(val, p.max);
    var minEl = document.getElementById('ai-sc-min');
    if (minEl) minEl.value = p.min;
  } else {
    p.max = Math.max(val, p.min);
    var maxEl = document.getElementById('ai-sc-max');
    if (maxEl) maxEl.value = p.max;
  }
  var track = document.getElementById('ai-sc-track');
  if (track) { track.style.left = p.min + '%'; track.style.right = (100 - p.max) + '%'; }
  var minLbl = document.getElementById('ai-sc-min-lbl');
  if (minLbl) minLbl.textContent = p.min + '%';
  var maxLbl = document.getElementById('ai-sc-max-lbl');
  if (maxLbl) maxLbl.textContent = p.max + '%';
  aiUpdateTrigger('score');
}

function aiDaypartAll() {
  aiParams.daypart.mode = 'all';
  aiParams.daypart.values = [];
  aiUpdateTrigger('daypart');
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.innerHTML = aiDdContent('daypart');
}

function aiDaypartItem(val, checked) {
  var p = aiParams.daypart;
  if (checked) {
    if (p.values.indexOf(val) < 0) p.values.push(val);
  } else {
    p.values = p.values.filter(function(v) { return v !== val; });
  }
  p.mode = p.values.length > 0 ? 'custom' : 'any';
  aiUpdateTrigger('daypart');
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.innerHTML = aiDdContent('daypart');
}

function aiChannelsAll() {
  aiParams.channels.mode = 'all';
  aiParams.channels.values = [];
  aiUpdateTrigger('channels');
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.innerHTML = aiDdContent('channels');
}

function aiChannelsItem(val, checked) {
  var p = aiParams.channels;
  if (checked) {
    if (p.values.indexOf(val) < 0) p.values.push(val);
  } else {
    p.values = p.values.filter(function(v) { return v !== val; });
  }
  p.mode = p.values.length > 0 ? 'custom' : 'any';
  aiUpdateTrigger('channels');
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.innerHTML = aiDdContent('channels');
}

function aiTypeAll() {
  aiParams.type.mode = 'all';
  aiParams.type.values = [];
  aiUpdateTrigger('type');
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.innerHTML = aiDdContent('type');
}

function aiTypeItem(val, checked) {
  var p = aiParams.type;
  if (checked) {
    if (p.values.indexOf(val) < 0) p.values.push(val);
  } else {
    p.values = p.values.filter(function(v) { return v !== val; });
  }
  p.mode = p.values.length > 0 ? 'custom' : 'any';
  aiUpdateTrigger('type');
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.innerHTML = aiDdContent('type');
}

function aiBrandAll() {
  aiParams.brand.mode = 'all';
  aiParams.brand.values = [];
  aiUpdateTrigger('brand');
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.innerHTML = aiDdContent('brand');
}

function aiBrandItem(val, checked) {
  var p = aiParams.brand;
  if (checked) {
    if (p.values.indexOf(val) < 0) p.values.push(val);
  } else {
    p.values = p.values.filter(function(v) { return v !== val; });
  }
  p.mode = p.values.length > 0 ? 'custom' : 'any';
  aiUpdateTrigger('brand');
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.innerHTML = aiDdContent('brand');
}

function aiScoreAll() {
  aiParams.score.mode = 'all';
  aiParams.score.values = [];
  aiUpdateTrigger('score');
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.innerHTML = aiDdContent('score');
}

function aiScoreItem(val, checked) {
  var p = aiParams.score;
  if (checked) {
    if (p.values.indexOf(val) < 0) p.values.push(val);
  } else {
    p.values = p.values.filter(function(v) { return v !== val; });
  }
  p.mode = p.values.length > 0 ? 'custom' : 'all';
  aiUpdateTrigger('score');
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.innerHTML = aiDdContent('score');
}

function aiDdDo(param, val) {
  var p = aiParams[param];
  if (param === 'daypart' || param === 'channels') {
    if (val === 'any') { p.mode = 'any'; p.values = []; }
    else               { p.mode = 'set'; p.dir = val; }
  } else {
    p.mode = val;
  }
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.innerHTML = aiDdContent(param);
  aiUpdateTrigger(param);
}

function aiDdCheckItem(param, input) {
  var p   = aiParams[param];
  var val = input.value;
  if (input.checked) {
    if (p.values.indexOf(val) < 0) p.values.push(val);
    if (p.mode === 'any') { p.mode = (param === 'brand' ? 'custom' : 'set'); }
  } else {
    p.values = p.values.filter(function(v){ return v !== val; });
  }
  var label = input.closest('.ai-check-pill');
  if (label) {
    label.style.borderColor = input.checked ? '#e11d8f' : '';
    label.style.color       = input.checked ? '#e11d8f' : '';
    label.style.background  = input.checked ? '#fdf2f8' : '';
  }
  aiUpdateTrigger(param);
}

// ── AI params panel ───────────────────────────────────────────────────────────

function csTx2BuildAIParamsPanel() {
  var panel = document.getElementById('tx2-sub-content-ai-media-plan');
  if (!panel) return;
  panel.style.overflow = 'hidden';

  panel.innerHTML =
    '<div style="flex:1;overflow-y:auto;min-height:0;display:flex;align-items:center;justify-content:center;padding:16px 4px">'
    + '<div style="max-width:460px;width:100%;text-align:center">'

    // Visual header
    + '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;margin-bottom:32px">'
    +   '<div style="width:32px;height:32px;flex-shrink:0;border-radius:9px;background:linear-gradient(135deg,#e11d8f,#f43f5e);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(225,29,143,.28)">'
    +     '<svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><path d="M9 3L11.2 9.2 17.5 11.5 11.2 13.8 9 20 6.8 13.8 0.5 11.5 6.8 9.2Z"/><path d="M18.5 3L20 7 24 8.5 20 10 18.5 14 17 10 13 8.5 17 7Z" opacity=".75"/></svg>'
    +   '</div>'
    +   '<div>'
    +     '<div style="font-size:14px;font-weight:600;color:var(--text);margin-bottom:2px">AI Media Plan</div>'
    +     '<div style="font-size:11px;color:var(--muted);line-height:1.4">Describe what you need and the AI will find the best placements.</div>'
    +   '</div>'
    + '</div>'

    // Conversational sentence — free-flowing, centered, wraps naturally
    + '<div style="font-size:15px;line-height:2;color:var(--text);margin-bottom:32px">'
    +   'The budget for my media plan is ' + aiTriggerHtml('budget')
    +   ' and I want to deliver ' + aiTriggerHtml('impressions') + ' impressions. '
    +   'The Channels should be ' + aiTriggerHtml('channels')
    +   ' and the type ' + aiTriggerHtml('type') + '. '
    +   'My Brand Safety parameters are ' + aiTriggerHtml('brand') + '. '
    +   'Use ' + aiTriggerHtml('score') + ' Match Score. '
    +   'The ad will be on air on ' + aiTriggerHtml('dates') + '.'
    + '</div>'

    // Button — inside the same wrapper, same gap
    + '<div style="display:flex;justify-content:center">'
    +   '<button onclick="csTx2GenerateAIMediaPlan()" style="height:38px;padding:0 22px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border-radius:9px;border:none;background:linear-gradient(135deg,#e11d8f,#f43f5e);color:#fff;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;box-shadow:0 2px 8px rgba(225,29,143,.25)">'
    +     '<svg width="13" height="13" viewBox="0 0 16 16" fill="#fff"><path d="M6 1L7.3 4.7 11 6 7.3 7.3 6 11 4.7 7.3 1 6 4.7 4.7Z"/><path d="M12.5 0.5L13.3 2.7 15.5 3.5 13.3 4.3 12.5 6.5 11.7 4.3 9.5 3.5 11.7 2.7Z" opacity=".8"/></svg>'
    +     'Generate AI Plan'
    +   '</button>'
    + '</div>'

    + '</div>'  // max-width wrapper
    + '</div>';  // scroll area
}

var _aiSuggestions = [];

function aiRenderResultsPanel() {
  var panel = document.getElementById('tx2-sub-content-ai-media-plan');
  if (!panel) return;
  var sugg = _aiSuggestions;
  var TH = 'padding:9px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);border-bottom:1px solid var(--border);white-space:nowrap';
  var totalImpr   = sugg.reduce(function(s, r) { return s + parseFloat(r.impressions) * (r.impressions.indexOf('M') >= 0 ? 1000000 : 1000); }, 0);
  var fmtImpr = totalImpr >= 1000000 ? (totalImpr/1000000).toFixed(1) + 'M' : Math.round(totalImpr/1000) + 'K';
  var avgCpm = Math.round(sugg.reduce(function(s, r) { return s + parseInt(r.cpm.replace(/[^0-9]/g,'')); }, 0) / (sugg.length || 1));
  var TOT  = 'padding:10px 12px;font-size:12px;font-weight:600;color:var(--text);border-top:2px solid var(--border-md);background:var(--bg)';
  var DELBTN = 'border:none;background:none;cursor:pointer;color:var(--faint);padding:2px 6px;border-radius:5px;line-height:1;font-size:16px;transition:color .12s';

  panel.innerHTML =
    '<div style="display:flex;flex-direction:column;flex:1;min-height:0;padding:10px">'
    + '<div style="display:flex;flex-direction:column;flex:1;min-height:0;background:var(--surface);border-radius:10px;border:1px solid var(--border);padding:14px;overflow:hidden">'
    // Back link
    + '<div style="flex-shrink:0;margin-bottom:12px">'
    +   '<span class="tx-bc-link" onclick="csTx2BuildAIParamsPanel()" style="display:inline-flex;align-items:center;gap:4px;font-size:12px">'
    +     '<svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M8 2.5L4.5 6.5 8 10.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +     'Adjust parameters'
    +   '</span>'
    + '</div>'
    // Header
    + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-shrink:0">'
    +   '<div style="width:20px;height:20px;border-radius:6px;background:linear-gradient(135deg,#e11d8f,#f43f5e);display:flex;align-items:center;justify-content:center;flex-shrink:0">'
    +     '<svg width="11" height="11" viewBox="0 0 16 16" fill="#fff"><path d="M6 1L7.3 4.7 11 6 7.3 7.3 6 11 4.7 7.3 1 6 4.7 4.7Z"/><path d="M12.5 0.5L13.3 2.7 15.5 3.5 13.3 4.3 12.5 6.5 11.7 4.3 9.5 3.5 11.7 2.7Z" opacity=".8"/></svg>'
    +   '</div>'
    +   '<span style="font-size:13px;font-weight:600;color:var(--text)">AI-Suggested Placements</span>'
    + '</div>'
    + '<div style="font-size:11px;color:var(--muted);margin-bottom:14px;flex-shrink:0">Based on matched moments and audience fit from this analysis</div>'
    // Table
    + '<div style="overflow-y:auto;flex:1;min-height:0">'
    +   '<table style="width:100%;border-collapse:collapse">'
    +   '<thead><tr>'
    +     '<th style="text-align:left;'  + TH + '">Moment</th>'
    +     '<th style="text-align:left;'  + TH + '">Channels</th>'
    +     '<th style="text-align:left;'  + TH + '">Type</th>'
    +     '<th style="text-align:right;' + TH + '">Inventory / PODs</th>'
    +     '<th style="text-align:right;' + TH + '">Est. CPM</th>'
    +     '<th style="text-align:right;' + TH + '">Est. Impressions</th>'
    +     '<th style="' + TH + 'width:32px"></th>'
    +   '</tr></thead>'
    +   '<tbody>'
    +   sugg.map(function(s, idx) {
          var chansHtml = (s.channels || []).map(function(c) {
            return '<span style="font-size:10px;font-weight:500;color:var(--muted);background:var(--bg);border:1px solid var(--border);border-radius:4px;padding:1px 6px;white-space:nowrap">' + c + '</span>';
          }).join(' ');
          var rowType = s.type || 'ads';
          var typeBadge = rowType === 'live'
            ? '<span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:600;background:#fef2f2;border:1px solid #fecaca;border-radius:20px;padding:2px 8px;color:#dc2626;white-space:nowrap"><span style="width:5px;height:5px;border-radius:50%;background:#ef4444;display:inline-block;box-shadow:0 0 4px #ef4444"></span>Live</span>'
            : rowType === 'organic'
            ? '<span style="font-size:10px;font-weight:600;background:#f0fdfa;border:1px solid #99f6e4;border-radius:20px;padding:2px 8px;color:#0f766e;white-space:nowrap">Organic Pause</span>'
            : '<span style="font-size:10px;font-weight:600;background:#eff6ff;border:1px solid #bfdbfe;border-radius:20px;padding:2px 8px;color:#1d4ed8;white-space:nowrap">Ads</span>';
          return '<tr style="border-bottom:1px solid var(--border)">'
            + '<td style="padding:10px 12px;font-size:12px;font-weight:500;color:var(--text)">' + s.moment + '</td>'
            + '<td style="padding:10px 12px"><div style="display:flex;flex-wrap:wrap;gap:4px">' + chansHtml + '</div></td>'
            + '<td style="padding:10px 12px">' + typeBadge + '</td>'
            + '<td style="padding:10px 12px;font-size:12px;font-weight:500;color:var(--text);text-align:right">' + (s.inventory || '—') + '</td>'
            + '<td style="padding:10px 12px;font-size:12px;font-weight:500;color:var(--text);text-align:right">' + s.cpm + '</td>'
            + '<td style="padding:10px 12px;font-size:12px;font-weight:500;color:var(--text);text-align:right">' + s.impressions + '</td>'
            + '<td style="padding:6px 8px;text-align:center">'
            +   '<button style="' + DELBTN + '" onclick="aiDeleteSuggestion(' + idx + ')" onmouseenter="this.style.color=\'#e11d8f\'" onmouseleave="this.style.color=\'var(--faint)\'">×</button>'
            + '</td>'
            + '</tr>';
        }).join('')
    +   '</tbody>'
    +   '<tfoot style="position:sticky;bottom:0;z-index:1">'
    +     '<tr>'
    +       '<td style="' + TOT + '">Total</td>'
    +       '<td style="' + TOT + '"></td>'
    +       '<td style="' + TOT + '"></td>'
    +       '<td style="' + TOT + '"></td>'
    +       '<td style="' + TOT + ';text-align:right">Avg $' + avgCpm + '</td>'
    +       '<td style="' + TOT + ';text-align:right">' + fmtImpr + '</td>'
    +       '<td style="' + TOT + '"></td>'
    +     '</tr>'
    +   '</tfoot>'
    +   '</table>'
    + '</div>'
    // Bottom actions
    + '<div style="padding-top:12px;flex-shrink:0;display:flex;flex-direction:column;gap:8px">'
    +   '<button onclick="mp2SubTab(\'moments\')" style="height:34px;display:flex;align-items:center;justify-content:center;gap:6px;border-radius:8px;border:1px solid var(--border-md);background:var(--surface);color:var(--text);font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;transition:background .12s" onmouseenter="this.style.background=\'var(--bg)\'" onmouseleave="this.style.background=\'var(--surface)\'">'
    +     '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
    +     'Add more moments'
    +   '</button>'
    +   '<div style="display:flex;gap:8px;align-items:center">'
    +     '<input id="ai-plan-name" class="ai-input" placeholder="Media plan name…" style="flex:1;height:38px">'
    +     '<button onclick="aiSaveAIMediaPlan()" style="height:38px;padding:0 16px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border-radius:9px;border:none;background:linear-gradient(135deg,#e11d8f,#f43f5e);color:#fff;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;box-shadow:0 2px 8px rgba(225,29,143,.25);white-space:nowrap">'
    +       '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 2h8l2 2v8a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="#fff" stroke-width="1.4"/><path d="M5 13V8h4v5M4 2v3h5" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/></svg>'
    +       'Save as Media Plan'
    +     '</button>'
    +   '</div>'
    + '</div>'
    + '</div>'  // card
    + '</div>';  // padding wrapper
}

function aiDeleteSuggestion(idx) {
  _aiSuggestions.splice(idx, 1);
  aiRenderResultsPanel();
}

function aiSaveAIMediaPlan() {
  var nameInput = document.getElementById('ai-plan-name');
  var planName  = (nameInput && nameInput.value.trim()) || ('AI Media Plan ' + (savedMediaPlansV2.length + 1));
  var now       = new Date();
  var dateStr   = now.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][now.getMonth()] + ' ' + now.getFullYear();
  var AUTHORS   = ['Bruna', 'Marika', 'Ryan'];
  var author    = AUTHORS[Math.floor(Math.random() * AUTHORS.length)];
  var totalImpr = _aiSuggestions.reduce(function(s, r) { return s + parseFloat(r.impressions) * (r.impressions.indexOf('M') >= 0 ? 1000000 : 1000); }, 0);
  var fmtImpr   = totalImpr >= 1000000 ? (totalImpr/1000000).toFixed(1) + 'M' : Math.round(totalImpr/1000) + 'K';
  var avgCpm    = Math.round(_aiSuggestions.reduce(function(s, r) { return s + parseInt(r.cpm.replace(/[^0-9]/g,'')); }, 0) / (_aiSuggestions.length || 1));

  savedMediaPlansV2.push({
    name:        planName,
    date:        dateStr,
    author:      author,
    source:      'ai',
    inputType:   'text',
    moments:     _aiSuggestions.slice(),
    impressions: fmtImpr,
    avgCpm:      '$' + avgCpm,
    programs:    [],
    episodes:    []
  });

  var newIdx = savedMediaPlansV2.length - 1;

  // Go home, then switch to plans tab and highlight the new item
  mp2HomeTab = 'plans';
  mp2ShowUpload();
  setTimeout(function() {
    mp2RenderAIPlansPanel(newIdx);
    // Temporary counter badge on the Media Plans tab
    var tabBtn = document.getElementById('tx2-plans-tab-btn');
    if (tabBtn) {
      var badge = document.createElement('span');
      badge.id = 'tx2-plans-tab-badge';
      badge.style.cssText = 'font-size:10px;background:var(--accent);color:#fff;border-radius:20px;padding:1px 6px;margin-left:5px;transition:opacity .4s';
      badge.textContent = savedMediaPlansV2.length;
      tabBtn.appendChild(badge);
      setTimeout(function() {
        badge.style.opacity = '0';
        setTimeout(function() { if (badge.parentNode) badge.parentNode.removeChild(badge); }, 400);
      }, 3000);
    }
  }, 60);
}

function mp2RenderAIPlansPanel(highlightIdx) {
  var panel = document.getElementById('tx2-home-panel-plans');
  if (!panel) return;

  if (savedMediaPlansV2.length === 0) {
    panel.innerHTML = '<div style="padding:40px 0;text-align:center;color:var(--faint);font-size:12px">No saved media plans yet.</div>';
    return;
  }

  panel.innerHTML = savedMediaPlansV2.map(function(mp, i) {
    var isNew = (i === highlightIdx);
    var inputIco =
      mp.inputType === 'video'
        ? '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M11 7l4-2v6l-4-2V7z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>'
        : mp.inputType === 'document'
        ? '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 2h5l3 3v9a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M9 2v3h3M5 8h6M5 11h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>'
        : '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
    var momentsCount = mp.source === 'ai'
      ? (mp.moments || []).length
      : (mp.programs || []).length + (mp.episodes || []).length;
    var cpmStr = mp.avgCpm ? ' &nbsp;·&nbsp; Avg. CPM ' + mp.avgCpm : (mp.dollars ? ' &nbsp;·&nbsp; ' + mp.dollars : '');
    return '<div id="mp2-ai-plan-card-' + i + '" class="tx2-lib-row" onclick="mp2ShowMediaPlanDetail(' + i + ')" style="align-items:center;transition:background .4s,border-color .4s' + (isNew ? ';background:var(--accent-light);border-left:3px solid var(--accent)' : '') + '">'
      + '<div class="tx2-lib-icon" style="flex-shrink:0">' + inputIco + '</div>'
      + '<div style="flex:1;min-width:0">'
      +   '<div style="font-size:12px;font-weight:500;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + mp.name + '</div>'
      +   '<div style="font-size:11px;color:var(--faint);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'
      +     mp.date
      +     (mp.author ? ' &nbsp;·&nbsp; ' + mp.author : '')
      +     (mp.impressions ? ' &nbsp;·&nbsp; ' + mp.impressions + ' imp.' : '')
      +     cpmStr
      +     ' &nbsp;·&nbsp; Moments: ' + momentsCount
      +   '</div>'
      + '</div>'
      + (isNew ? '<span style="font-size:10px;font-weight:600;color:var(--accent);background:var(--accent-light);border:1px solid var(--accent-muted);border-radius:20px;padding:2px 8px;flex-shrink:0">New</span>' : '')
      + '</div>';
  }).join('');

  // Fade out highlight after 1.8s
  if (highlightIdx !== undefined) {
    setTimeout(function() {
      var card = document.getElementById('mp2-ai-plan-card-' + highlightIdx);
      if (card) {
        card.style.background = '';
        card.style.borderLeft = '';
        var badge = card.querySelector('span[style*="New"]');
        if (badge) badge.style.opacity = '0';
      }
    }, 1800);
  }
}

function aiAddMoreFromInventory() {
  // Match suggestions to INV_PROGRAMS by title prefix
  _aiSuggestions.forEach(function(s) {
    var showKey = s.show.split(' — ')[0].toLowerCase();
    INV_PROGRAMS.forEach(function(p) {
      if (p.title.toLowerCase().indexOf(showKey) === 0 || showKey.indexOf(p.title.split(' — ')[0].toLowerCase()) === 0) {
        invSelected[p.id] = true;
      }
    });
  });
  invMediaPlanVisible = true;
  mp2SubTab('moments');
}

function csTx2GenerateAIMediaPlan() {
  var panel = document.getElementById('tx2-sub-content-ai-media-plan');
  if (!panel) return;
  panel.innerHTML =
    '<div style="display:flex;flex-direction:column;flex:1;min-height:0;padding:10px">'
    + '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:14px;background:var(--surface);border-radius:10px;border:1px solid var(--border)">'
    + '<div style="width:36px;height:36px;border:3px solid var(--border);border-top-color:#e11d8f;border-radius:50%;animation:cs-spin .7s linear infinite"></div>'
    + '<div style="font-size:12px;color:var(--muted)">Generating your AI media plan…</div>'
    + '</div>'
    + '</div>';
  setTimeout(function() {
    _aiSuggestions = [
      { moment:'Family Dinner Time',   channels:['NBC', 'Fox', 'ABC'],       inventory:312, cpm:'$28',  impressions:'3.2M', type:'ads'     },
      { moment:'Grocery Shopping',     channels:['Food Network', 'NBC'],     inventory:278, cpm:'$22',  impressions:'2.8M', type:'organic' },
      { moment:'Healthy Eating',       channels:['CBS', 'Fox', 'Discovery'], inventory:241, cpm:'$19',  impressions:'2.1M', type:'live'    },
      { moment:'Meal Prep & Cooking',  channels:['Food Network', 'PBS'],     inventory:198, cpm:'$24',  impressions:'1.9M', type:'ads'     },
      { moment:'Weekend BBQ',          channels:['Fox', 'ABC', 'NBC'],       inventory:143, cpm:'$31',  impressions:'2.8M', type:'organic' },
    ];
    aiRenderResultsPanel();
  }, 1800);
}


var invCurrentView      = 'gallery';
var invSelected         = {};
var invSelectedEpisodes = {};   // keyed by epId, value: { show, episode, channel, scene, imgSeed }
var inv2FilterChannels   = [];
var inv2FilterCategories = [];
var inv2FilterDayparts   = [];
var inv2FilterScore      = 0;
var inv2FilterPanelOpen  = false;
var inv2MediaPlanVisible = false;
var inv2AccordionOpen    = { channel: false, category: false, daypart: false, score: true };

function inv2GetFiltered() {
  return INV_PROGRAMS_V2.filter(function(p) {
    if (inv2FilterChannels.length   > 0 && inv2FilterChannels.indexOf(p.channel)   < 0) return false;
    if (inv2FilterCategories.length > 0 && inv2FilterCategories.indexOf(p.category) < 0) return false;
    if (inv2FilterDayparts.length   > 0 && inv2FilterDayparts.indexOf(p.daypart)    < 0) return false;
    if (p.match < inv2FilterScore) return false;
    return true;
  });
}

// ── Filter panel ──

// Returns the correct filter panel element depending on context.
// In drill-down mode the panel has id="inv-drill-filter-panel" to avoid
// colliding with the inventory sub-tab's "inv-filter-panel" which lives in
// the same DOM tree and would otherwise be returned first by getElementById.
function inv2GetFilterPanel() {
  if (document.getElementById('tx-drill-table-wrap')) {
    return document.getElementById('inv-drill-filter-panel') || document.getElementById('inv-filter-panel');
  }
  return document.getElementById('inv-filter-panel');
}

function inv2ToggleFilterPanel() {
  if (inv2FilterPanelOpen) { inv2CloseFilterPanel(); } else { inv2OpenFilterPanel(); }
}

function inv2OpenFilterPanel() {
  inv2FilterPanelOpen = true;
  var panel = inv2GetFilterPanel();
  if (!panel) return;
  inv2BuildFilterPanel();
  var btn = document.getElementById('inv-filter-btn');

  // In drill-down mode, overflow on ancestors clips position:absolute panels.
  // Move the panel to document.body with position:fixed anchored to the button.
  if (document.getElementById('tx-drill-table-wrap')) {
    var r = btn ? btn.getBoundingClientRect() : { bottom: 60, right: window.innerWidth };
    panel.style.position = 'fixed';
    panel.style.top      = (r.bottom + 4) + 'px';
    panel.style.right    = (window.innerWidth - r.right) + 'px';
    panel.style.left     = 'auto';
    panel.style.maxHeight = (window.innerHeight - r.bottom - 20) + 'px';
    document.body.appendChild(panel);
  }

  panel.style.display = 'flex';
  setTimeout(function() {
    document.addEventListener('click', function _outside(e) {
      if (panel && !panel.contains(e.target) && btn && !btn.contains(e.target)) {
        inv2CloseFilterPanel();
        document.removeEventListener('click', _outside);
      }
    });
  }, 0);
}

function inv2CloseFilterPanel() {
  inv2FilterPanelOpen = false;
  var panel = inv2GetFilterPanel();
  if (panel) panel.style.display = 'none';
}

function inv2BuildFilterPanel() {
  var panel = inv2GetFilterPanel();
  if (!panel) return;
  var channels   = INV_PROGRAMS_V2.map(function(p){ return p.channel; }).filter(function(v,i,a){ return a.indexOf(v)===i; });
  var categories = INV_PROGRAMS_V2.map(function(p){ return p.category; }).filter(function(v,i,a){ return a.indexOf(v)===i; });
  var dayparts   = INV_PROGRAMS_V2.map(function(p){ return p.daypart; }).filter(function(v,i,a){ return a.indexOf(v)===i; });
  var totalActive = inv2FilterChannels.length + inv2FilterCategories.length + inv2FilterDayparts.length + (inv2FilterScore > 0 ? 1 : 0);

  function accSection(key, label, bodyHtml) {
    var open = !!inv2AccordionOpen[key];
    return '<div class="inv-fp-acc">'
      + '<div class="inv-fp-acc-hdr" onclick="inv2ToggleAccordion(\'' + key + '\')">'
      +   '<span>' + label + '</span>'
      +   '<svg class="inv-fp-chevron' + (open ? ' open' : '') + '" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      + '</div>'
      + '<div id="inv-fp-body-' + key + '" style="' + (open ? '' : 'display:none') + '">'
      +   bodyHtml
      + '</div>'
      + '</div>';
  }

  var channelBody =
    '<input class="inv-fp-search" placeholder="Search…" oninput="inv2FpSearch(this,\'channel\')">'
    + '<div id="inv-fp-opts-channel">'
    + channels.map(function(c) {
        return '<label class="inv-fp-opt"><input type="checkbox"' + (inv2FilterChannels.indexOf(c)>=0?' checked':'') + ' onchange="inv2ToggleFilterCheckbox(\'channel\',\'' + c + '\',this.checked)"><span>' + c + '</span></label>';
      }).join('')
    + '</div>';

  var categoryBody =
    '<input class="inv-fp-search" placeholder="Search…" oninput="inv2FpSearch(this,\'category\')">'
    + '<div id="inv-fp-opts-category">'
    + categories.map(function(c) {
        return '<label class="inv-fp-opt"><input type="checkbox"' + (inv2FilterCategories.indexOf(c)>=0?' checked':'') + ' onchange="inv2ToggleFilterCheckbox(\'category\',\'' + c + '\',this.checked)"><span>' + c + '</span></label>';
      }).join('')
    + '</div>';

  var daypartBody =
    '<div id="inv-fp-opts-daypart">'
    + dayparts.map(function(d) {
        return '<label class="inv-fp-opt"><input type="checkbox"' + (inv2FilterDayparts.indexOf(d)>=0?' checked':'') + ' onchange="inv2ToggleFilterCheckbox(\'daypart\',\'' + d + '\',this.checked)"><span>' + d + '</span></label>';
      }).join('')
    + '</div>';

  var scoreBody =
    '<div style="padding:4px 0 10px">'
    + '<div style="display:flex;justify-content:space-between;margin-bottom:10px">'
    +   '<span style="font-size:11px;color:var(--muted)">Minimum match score</span>'
    +   '<span id="inv-fp-score-val" style="font-size:11px;font-weight:600;color:var(--text)">' + (inv2FilterScore > 0 ? inv2FilterScore + '%' : '—') + '</span>'
    + '</div>'
    + '<input type="range" min="0" max="100" value="' + inv2FilterScore + '" style="width:100%;accent-color:var(--accent)" oninput="document.getElementById(\'inv-fp-score-val\').textContent=this.value>0?this.value+\'%\':\'—\'" onchange="inv2ToggleFilterCheckbox(\'score\',this.value,true)">'
    + '<div style="display:flex;justify-content:space-between;margin-top:4px"><span style="font-size:10px;color:var(--faint)">0%</span><span style="font-size:10px;color:var(--faint)">100%</span></div>'
    + '</div>';

  panel.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-shrink:0">'
    +   '<span style="font-size:13px;font-weight:600;color:var(--text)">Filters</span>'
    +   '<div style="display:flex;gap:10px;align-items:center">'
    +     (totalActive > 0 ? '<span style="font-size:11px;color:var(--faint);cursor:pointer" onclick="inv2ClearAllFilters()">Clear all</span>' : '')
    +     '<button onclick="inv2CloseFilterPanel()" style="background:none;border:none;cursor:pointer;color:var(--faint);font-size:20px;line-height:1;padding:0 2px">×</button>'
    +   '</div>'
    + '</div>'
    + '<div style="flex:1;overflow-y:auto;min-height:0">'
    +   accSection('channel',  'Channel',  channelBody)
    +   accSection('category', 'Category', categoryBody)
    +   accSection('daypart',  'Daypart',  daypartBody)
    +   accSection('score',    'Min Score', scoreBody)
    + '</div>';
}

function inv2ToggleAccordion(key) {
  inv2AccordionOpen[key] = !inv2AccordionOpen[key];
  var body = document.getElementById('inv-fp-body-' + key);
  if (body) {
    body.style.display = inv2AccordionOpen[key] ? '' : 'none';
    var hdr = body.previousElementSibling;
    if (hdr) {
      var chev = hdr.querySelector('.inv-fp-chevron');
      if (chev) chev.classList.toggle('open', inv2AccordionOpen[key]);
    }
  }
}

function inv2FpSearch(input, type) {
  var q = input.value.toLowerCase();
  var opts = document.querySelectorAll('#inv-fp-opts-' + type + ' .inv-fp-opt');
  opts.forEach(function(opt) {
    var txt = opt.querySelector('span').textContent.toLowerCase();
    opt.style.display = txt.indexOf(q) >= 0 ? '' : 'none';
  });
}

function inv2ToggleFilterCheckbox(type, val, checked) {
  if (type === 'channel') {
    if (checked && inv2FilterChannels.indexOf(val) < 0) inv2FilterChannels.push(val);
    else if (!checked) inv2FilterChannels = inv2FilterChannels.filter(function(v){ return v !== val; });
  } else if (type === 'category') {
    if (checked && inv2FilterCategories.indexOf(val) < 0) inv2FilterCategories.push(val);
    else if (!checked) inv2FilterCategories = inv2FilterCategories.filter(function(v){ return v !== val; });
  } else if (type === 'daypart') {
    if (checked && inv2FilterDayparts.indexOf(val) < 0) inv2FilterDayparts.push(val);
    else if (!checked) inv2FilterDayparts = inv2FilterDayparts.filter(function(v){ return v !== val; });
  } else if (type === 'score') {
    inv2FilterScore = parseInt(val) || 0;
  }
  inv2UpdateFilterBar();
  inv2RenderInventory();
}

function inv2RemoveFilterChip(type, val) {
  if (type === 'channel')  inv2FilterChannels   = inv2FilterChannels.filter(function(v){ return v !== val; });
  if (type === 'category') inv2FilterCategories = inv2FilterCategories.filter(function(v){ return v !== val; });
  if (type === 'daypart')  inv2FilterDayparts   = inv2FilterDayparts.filter(function(v){ return v !== val; });
  if (type === 'score')    inv2FilterScore      = 0;
  inv2UpdateFilterBar();
  inv2RenderInventory();
  if (inv2FilterPanelOpen) inv2BuildFilterPanel();
}

function inv2ClearAllFilters() {
  inv2FilterChannels = []; inv2FilterCategories = []; inv2FilterDayparts = []; inv2FilterScore = 0;
  inv2UpdateFilterBar();
  inv2RenderInventory();
  if (inv2FilterPanelOpen) inv2BuildFilterPanel();
}

function inv2UpdateFilterBar() {
  var totalActive = inv2FilterChannels.length + inv2FilterCategories.length + inv2FilterDayparts.length + (inv2FilterScore > 0 ? 1 : 0);
  var badge = document.getElementById('inv-filter-badge');
  if (badge) { badge.textContent = totalActive; badge.style.display = totalActive > 0 ? 'flex' : 'none'; }
  var chips = document.getElementById('inv-filter-chips');
  if (!chips) return;

  var allChips = []
    .concat(inv2FilterChannels.map(function(v)  { return { label: v,              action: 'inv2RemoveFilterChip(\'channel\',\'' + v + '\')' }; }))
    .concat(inv2FilterCategories.map(function(v) { return { label: v,              action: 'inv2RemoveFilterChip(\'category\',\'' + v + '\')' }; }))
    .concat(inv2FilterDayparts.map(function(v)   { return { label: v,              action: 'inv2RemoveFilterChip(\'daypart\',\'' + v + '\')' }; }))
    .concat(inv2FilterScore > 0                  ? [{ label: '≥' + inv2FilterScore + '%', action: 'inv2RemoveFilterChip(\'score\',\'\')' }] : []);

  var MAX = 3;
  var visible = allChips.slice(0, MAX);
  var overflow = allChips.length - visible.length;

  chips.innerHTML =
    visible.map(function(c) {
      return '<span class="inv-chip">' + c.label + ' <span onclick="' + c.action + '" style="cursor:pointer">×</span></span>';
    }).join('')
    + (overflow > 0 ? '<span class="inv-chip" style="cursor:default;color:var(--muted)">+' + overflow + ' more</span>' : '');
}

function inv2RenderFilters() {
  var wrap = document.getElementById('inv-filters-wrap');
  if (!wrap) return;
  wrap.innerHTML =
    // Left: filter button + chips
    '<button id="inv-filter-btn" onclick="inv2ToggleFilterPanel()" style="display:flex;align-items:center;gap:6px;padding:5px 10px;border:1px solid var(--border);border-radius:7px;background:var(--surface);color:var(--muted);cursor:pointer;font-size:12px;flex-shrink:0;position:relative">'
    +   '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
    +   'Filters'
    +   '<span id="inv-filter-badge" style="display:none;position:absolute;top:-5px;right:-5px;width:16px;height:16px;background:var(--accent);color:#fff;border-radius:50%;font-size:9px;font-weight:700;align-items:center;justify-content:center">0</span>'
    + '</button>'
    + '<div id="inv-filter-chips" style="display:flex;gap:5px;flex-wrap:wrap;align-items:center;flex:1"></div>'
    // Right: view toggles + media plan icon
    + '<div style="display:flex;gap:4px;flex-shrink:0">'
    +   '<button id="inv-view-gallery" class="inv-view-btn inv-view-btn--act" onclick="inv2ToggleView(\'gallery\')" title="Gallery view">'
    +     '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.4"/></svg>'
    +   '</button>'
    +   '<button id="inv-view-table" class="inv-view-btn" onclick="inv2ToggleView(\'table\')" title="Table view">'
    +     '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 3h12M1 7h12M1 11h12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
    +   '</button>'
    +   '<div style="width:1px;background:var(--border);margin:2px 2px"></div>'
    +   '<button id="inv-mp-btn" class="inv-view-btn" onclick="inv2ToggleMediaPlan()" title="Media Plan">'
    +     '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M4 5h6M4 7.5h4M4 10h3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>'
    +   '</button>'
    + '</div>';
}

function inv2ToggleView(mode) {
  invCurrentView = mode;
  var gBtn = document.getElementById('inv-view-gallery');
  var tBtn = document.getElementById('inv-view-table');
  if (gBtn) gBtn.className = 'inv-view-btn' + (mode === 'gallery' ? ' inv-view-btn--act' : '');
  if (tBtn) tBtn.className = 'inv-view-btn' + (mode === 'table'   ? ' inv-view-btn--act' : '');
  inv2RenderInventory();
}

function inv2ToggleMediaPlan() {
  inv2MediaPlanVisible = !inv2MediaPlanVisible;
  var mpBtn = document.getElementById('inv-mp-btn');
  if (mpBtn) mpBtn.className = 'inv-view-btn' + (inv2MediaPlanVisible ? ' inv-view-btn--act' : '');
  inv2RenderMediaPlan();
}

function inv2ToggleSelect(id) {
  if (invSelected[id]) { delete invSelected[id]; } else { invSelected[id] = true; }
  var el = document.getElementById('inv-item-' + id);
  if (el) el.classList.toggle('inv-item--sel', !!invSelected[id]);
  var cb = document.getElementById('inv-cb-' + id);
  if (cb) cb.checked = !!invSelected[id];
  // auto-open media plan on first selection
  var anySelected = Object.keys(invSelected).length > 0;
  if (anySelected && !inv2MediaPlanVisible) { inv2MediaPlanVisible = true; }
  inv2RenderMediaPlan();
}

function inv2ClearSelection() {
  invSelected = {};
  invSelectedEpisodes = {};
  document.querySelectorAll('.inv-item--sel').forEach(function(el){ el.classList.remove('inv-item--sel'); });
  document.querySelectorAll('[id^="inv-cb-"]').forEach(function(cb){ cb.checked = false; });
  document.querySelectorAll('[id^="inv-ep-cb-"]').forEach(function(cb){ cb.checked = false; });
  inv2RenderMediaPlan();
}

function inv2ToggleSelectEpisode(epId, show, episode, channel, scene, imgSeed, impressionsNum) {
  if (invSelectedEpisodes[epId]) {
    delete invSelectedEpisodes[epId];
  } else {
    invSelectedEpisodes[epId] = { show: show, episode: episode, channel: channel, scene: scene, imgSeed: imgSeed, impressionsNum: impressionsNum || 0 };
    if (!inv2MediaPlanVisible) inv2MediaPlanVisible = true;
  }
  var cb = document.getElementById('inv-ep-cb-' + epId);
  if (cb) cb.checked = !!invSelectedEpisodes[epId];
  inv2RenderMediaPlan();
}

function inv2RenderMediaPlan() {
  var panel = document.getElementById('inv-media-plan');
  if (!panel) return;
  // update mp button state
  var mpBtn = document.getElementById('inv-mp-btn');
  if (mpBtn) mpBtn.className = 'inv-view-btn' + (inv2MediaPlanVisible ? ' inv-view-btn--act' : '');
  if (!inv2MediaPlanVisible) { panel.style.display = 'none'; return; }
  panel.style.display = 'flex';
  var selPrograms = INV_PROGRAMS_V2.filter(function(p){ return invSelected[p.id]; });
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
    +   '<span style="font-size:10px;color:var(--faint);cursor:pointer;font-weight:400" onclick="inv2ClearSelection()">Clear all</span>'
    + '</div>'
    + '<div style="flex:1;overflow-y:auto;min-height:0;display:flex;flex-direction:column;gap:7px">'
    + selPrograms.map(function(p){
        var idx = INV_PROGRAMS_V2.indexOf(p);
        var seed = 'tvshow' + (idx + 1);
        var parts = p.title.split(' — ');
        var showName = parts[0];
        var epLabel  = parts[1] || '';
        var meta = [epLabel, p.impressionsLabel ? p.impressionsLabel + ' imp.' : '', inv2EstDollars(p.impressionsNum, p.daypart)].filter(Boolean).join(' · ');
        return '<div style="display:flex;gap:8px;align-items:center;padding:8px;background:var(--bg);border-radius:8px;border:1px solid var(--border)">'
          + '<div style="width:38px;height:22px;border-radius:3px;overflow:hidden;flex-shrink:0">'
          +   '<img src="https://picsum.photos/seed/' + seed + '/640/360" style="width:100%;height:100%;object-fit:cover">'
          + '</div>'
          + '<div style="flex:1;min-width:0">'
          +   '<div style="font-size:11px;font-weight:600;color:var(--text);line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + showName + '</div>'
          +   '<div style="font-size:10px;color:var(--faint);margin-top:1px">' + meta + '</div>'
          + '</div>'
          + '<span style="font-size:14px;color:var(--faint);cursor:pointer;flex-shrink:0;line-height:1" onclick="inv2ToggleSelect(' + p.id + ')">×</span>'
          + '</div>';
      }).join('')
    + selEpKeys.map(function(epId){
        var ep = invSelectedEpisodes[epId];
        var meta = [ep.episode, ep.channel, ep.impressionsNum ? inv2FmtDollars(ep.impressionsNum * 1000 * 20) : ''].filter(Boolean).join(' · ');
        return '<div style="display:flex;gap:8px;align-items:center;padding:8px;background:var(--bg);border-radius:8px;border:1px solid var(--border)">'
          + '<div style="width:38px;height:22px;border-radius:3px;overflow:hidden;flex-shrink:0">'
          +   '<img src="https://picsum.photos/seed/' + ep.imgSeed + '/128/72" style="width:100%;height:100%;object-fit:cover">'
          + '</div>'
          + '<div style="flex:1;min-width:0">'
          +   '<div style="font-size:11px;font-weight:600;color:var(--text);line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + ep.show + '</div>'
          +   '<div style="font-size:10px;color:var(--faint);margin-top:1px">' + meta + '</div>'
          + '</div>'
          + '<span style="font-size:14px;color:var(--faint);cursor:pointer;flex-shrink:0;line-height:1" onclick="inv2ToggleSelectEpisode(\'' + epId.replace(/'/g,"\\'") + '\')">×</span>'
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
          +   '<span style="font-size:12px;font-weight:700;color:var(--accent)">' + inv2FmtDollars(totalDollars) + '</span>'
          + '</div>'
        : '')
    + '</div>'
    // ── Save box ──
    + '<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:8px;flex-shrink:0">'
    +   '<div style="display:flex;gap:6px">'
    +     '<input id="inv-mp-save-name" type="text" placeholder="Plan name…"'
    +       ' style="flex:1;min-width:0;height:30px;border:1px solid var(--border-md);border-radius:6px;padding:0 9px;font-size:12px;font-family:inherit;color:var(--text);background:var(--bg);outline:none"/>'
    +     '<button onclick="inv2SaveMediaPlan()"'
    +       ' style="height:30px;padding:0 11px;border-radius:6px;border:none;background:var(--accent);color:#fff;font-size:12px;font-weight:500;cursor:pointer;flex-shrink:0;font-family:inherit">Save</button>'
    +   '</div>'
    + '</div>';
}

function inv2SaveMediaPlan() {
  var selPrograms = INV_PROGRAMS_V2.filter(function(p){ return invSelected[p.id]; });
  var selEpKeys   = Object.keys(invSelectedEpisodes);
  var totalItems  = selPrograms.length + selEpKeys.length;
  if (totalItems === 0) return;
  var nameInput = document.getElementById('inv-mp-save-name');
  var planName  = (nameInput && nameInput.value.trim()) || ('Media Plan ' + (savedMediaPlansV2.length + 1));
  var now       = new Date();
  var dateStr   = now.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][now.getMonth()] + ' ' + now.getFullYear();
  var CPM_MAP = { 'Prime Time': 25, 'Daytime': 15, 'Late Night': 18, 'Morning': 12, 'Early Fringe': 20 };
  var totalImp     = selPrograms.reduce(function(s,p){ return s + p.impressionsNum; }, 0)
                   + selEpKeys.reduce(function(s,k){ return s + (invSelectedEpisodes[k].impressionsNum || 0); }, 0);
  var totalDollars = selPrograms.reduce(function(s,p){ return s + p.impressionsNum * 1000 * (CPM_MAP[p.daypart] || 20); }, 0)
                   + selEpKeys.reduce(function(s,k){ return s + (invSelectedEpisodes[k].impressionsNum || 0) * 1000 * 20; }, 0);
  var unEl = document.getElementById('un');
  var author = unEl ? unEl.textContent.trim() : 'Product';
  savedMediaPlansV2.push({
    name:        planName,
    date:        dateStr,
    author:      author,
    programs:    selPrograms.map(function(p){ return { title: p.title.split(' — ')[0], channel: p.channel, impressionsLabel: p.impressionsLabel, id: p.id, impressionsNum: p.impressionsNum, daypart: p.daypart }; }),
    episodes:    selEpKeys.map(function(k){ return invSelectedEpisodes[k]; }),
    totalItems:  totalItems,
    impressions: totalImp > 0 ? (totalImp >= 1 ? totalImp.toFixed(1) + 'M' : Math.round(totalImp * 1000) + 'K') : null,
    dollars:     totalDollars > 0 ? inv2FmtDollars(totalDollars) : null
  });
  if (nameInput) nameInput.value = '';
  // Flash confirm
  var btn = document.querySelector('#inv-media-plan button[onclick="inv2SaveMediaPlan()"]');
  if (btn) { btn.textContent = '✓'; setTimeout(function(){ btn.textContent = 'Save'; }, 1200); }
}

function inv2ShowMomentsModal(id) {
  var prog = INV_PROGRAMS_V2.filter(function(p){ return p.id === id; })[0];
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

function inv2ScoreColor(s)  { return s >= 90 ? '#16a34a' : s >= 80 ? '#d97706' : s >= 70 ? 'var(--accent)' : 'var(--faint)'; }
function inv2ScoreBg(s)     { return s >= 90 ? '#f0fdf4' : s >= 80 ? '#fffbeb' : s >= 70 ? '#eff6ff' : '#f8f8f8'; }
function inv2ScoreBorder(s) { return s >= 90 ? '#bbf7d0' : s >= 80 ? '#fde68a' : s >= 70 ? '#bfdbfe' : '#e5e5e5'; }

function inv2FmtDollars(d) {
  if (d >= 1000000) return '$' + (d / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  return '$' + Math.round(d / 1000) + 'K';
}
function inv2EstDollars(impressionsNum, daypart) {
  var CPM = { 'Prime Time': 25, 'Daytime': 15, 'Late Night': 18, 'Morning': 12, 'Early Fringe': 20 };
  var cpm = CPM[daypart] || 20;
  return inv2FmtDollars(impressionsNum * 1000 * cpm);
}

function inv2RenderInventory() {
  if (document.getElementById('tx-drill-table-wrap')) {
    if (typeof txRefreshDrillDownTable === 'function') txRefreshDrillDownTable();
    return;
  }
  var wrap = document.getElementById('inv-content-wrap');
  if (!wrap) return;
  var progs = inv2GetFiltered();
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
          var idx  = INV_PROGRAMS_V2.indexOf(p);
          var seed = 'tvshow' + (idx + 1);
          var sel  = !!invSelected[p.id];
          var previewMoments = p.moments.slice(0, 2).map(function(m){
            return '<span style="font-size:10px;background:var(--bg);border:1px solid var(--border);border-radius:20px;padding:2px 7px;color:var(--muted)">' + m.label + '</span>';
          }).join('');
          return '<div id="inv-item-' + p.id + '" class="inv-card' + (sel ? ' inv-item--sel' : '') + '" onclick="inv2ToggleSelect(' + p.id + ')" style="cursor:pointer">'
            // thumbnail
            + '<div style="position:relative;width:100%;padding-top:56.25%">'
            +   '<img src="https://picsum.photos/seed/' + seed + '/640/360" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">'
            // checkbox top-left — stopPropagation to avoid double-firing with card onclick
            +   '<label onclick="event.stopPropagation()" style="position:absolute;top:8px;left:8px;z-index:2;cursor:pointer;width:18px;height:18px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.88);border-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,.2)">'
            +     '<input type="checkbox" id="inv-cb-' + p.id + '"' + (sel ? ' checked' : '') + ' onchange="inv2ToggleSelect(' + p.id + ')" style="width:13px;height:13px;accent-color:var(--accent);cursor:pointer;margin:0">'
            +   '</label>'
            // channel badge (shifted right to avoid checkbox overlap)
            +   '<div style="position:absolute;top:8px;left:34px;background:rgba(0,0,0,.62);border-radius:4px;padding:2px 7px;font-size:10px;font-weight:600;color:#fff;letter-spacing:.3px">' + p.channel + '</div>'
            +   '<div style="position:absolute;top:8px;right:8px;background:' + inv2ScoreBg(p.match) + ';border:1px solid ' + inv2ScoreBorder(p.match) + ';border-radius:20px;padding:2px 8px;font-size:10px;font-weight:700;color:' + inv2ScoreColor(p.match) + '">' + p.match + '% match</div>'
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
            +       '<div style="font-size:13px;font-weight:700;color:var(--text)">' + inv2EstDollars(p.impressionsNum, p.daypart) + '</div>'
            +     '</div>'
            +   '</div>'
            +   '<div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center">'
            +     previewMoments
            +     (p.moments.length > 2 ? '<span onclick="inv2ShowMomentsModal(' + p.id + ')" style="font-size:10px;color:var(--accent);cursor:pointer;white-space:nowrap">+' + (p.moments.length - 2) + ' more →</span>' : '')
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
          var idx  = INV_PROGRAMS_V2.indexOf(p);
          var seed = 'tvshow' + (idx + 1);
          var sel  = !!invSelected[p.id];
          var rowBg = sel ? 'background:color-mix(in srgb,var(--accent) 6%,transparent)' : '';
          return '<tr id="inv-item-' + p.id + '" class="' + (sel ? 'inv-item--sel' : '') + '" style="cursor:pointer;' + rowBg + '" onclick="inv2ToggleSelect(' + p.id + ')">'
            + '<td style="' + TD + ';padding-right:4px;width:28px" onclick="event.stopPropagation()">'
            +   '<input type="checkbox" id="inv-cb-' + p.id + '"' + (sel ? ' checked' : '') + ' onchange="inv2ToggleSelect(' + p.id + ')" style="cursor:pointer;accent-color:var(--accent)">'
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
            +   '<span style="font-size:11px;font-weight:700;color:' + inv2ScoreColor(p.match) + ';background:' + inv2ScoreBg(p.match) + ';border:1px solid ' + inv2ScoreBorder(p.match) + ';border-radius:20px;padding:3px 9px">' + p.match + '%</span>'
            + '</td>'
            + '<td style="' + TD + ';color:var(--muted);font-size:11px">' + p.scenes[0] + '</td>'
            + '<td style="' + TD + ';font-weight:600">' + p.impressionsLabel + '</td>'
            + '<td style="' + TD + ';font-weight:600">' + inv2EstDollars(p.impressionsNum, p.daypart) + '</td>'
            + '<td style="' + TD + '">'
            +   '<span onclick="event.stopPropagation();inv2ShowMomentsModal(' + p.id + ')" style="font-size:11px;color:var(--accent);cursor:pointer;white-space:nowrap">' + p.moments.length + ' moments →</span>'
            + '</td>'
            + '</tr>';
        }).join('')
      + '</tbody></table>';
  }
}

// ── By Moments: card grid (v2 only) ──────────────────────────────────────────

function mp2InjectMomentStyles() {
  if (document.getElementById('mp2-moment-styles')) return;
  var s = document.createElement('style');
  s.id = 'mp2-moment-styles';
  s.textContent = [
    '.mp2-mcard{background:var(--surface);border:1px solid var(--border);border-radius:10px;overflow:hidden;transition:border-color .15s,box-shadow .15s}',
    '.mp2-mcard:hover{border-color:var(--border-md);box-shadow:0 2px 8px rgba(0,0,0,.07)}',
    '.mp2-mBtn{flex:1;padding:5px 8px;font-size:11px;font-family:inherit;border:1px solid var(--border-md);border-radius:6px;background:var(--surface);color:var(--text-2);cursor:pointer;white-space:nowrap;transition:background .12s,color .12s}',
    '.mp2-mBtn:hover{background:var(--bg);color:var(--text)}',
    '.mp2-mBtn--magenta{border-color:transparent;color:var(--text-2);background:var(--bg);font-weight:500}',
    '.mp2-mBtn--magenta:hover{background:var(--bg);color:var(--accent);border-color:transparent}',
    '.mp2-mBtn--ico{flex:none;width:26px;height:26px;padding:0;display:flex;align-items:center;justify-content:center;border:1px solid var(--border-md);border-radius:6px;background:var(--surface);color:var(--faint);cursor:pointer;transition:background .12s,color .12s,border-color .12s}',
    '.mp2-mBtn--ico:hover{background:var(--bg);color:var(--text);border-color:var(--border-md)}',
    '.mp2-sec-hd{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;padding:2px 0 10px;display:flex;align-items:center;gap:7px}',
    '.mp2-mcard--sel{border-color:var(--accent) !important;box-shadow:0 0 0 2px rgba(237,0,94,.1) !important}',
    '.mp2-filter-btn{padding:4px 11px;font-size:11px;font-weight:500;font-family:inherit;border:1px solid var(--border-md);border-radius:20px;background:var(--bg);color:var(--text-2);cursor:pointer;transition:background .12s,color .12s,border-color .12s;line-height:1.4}',
    '.mp2-filter-btn:hover{background:var(--border-md);color:var(--text)}',
    '.mp2-filter-btn--act{background:var(--border-md);border-color:var(--border-md);color:var(--text);font-weight:600}',
    // skeleton shimmer
    '@keyframes mp2Shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}',
    '.mp2-skel{background:linear-gradient(90deg,var(--bg) 25%,var(--border) 50%,var(--bg) 75%);background-size:200% 100%;animation:mp2Shimmer 1.3s infinite linear;border-radius:4px}',
    // dual-range slider thumbs
    '.mp2-dual-range input[type=range]{pointer-events:none}',
    '.mp2-dual-range input[type=range]::-webkit-slider-thumb{pointer-events:all;-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:var(--accent);cursor:pointer;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.22);margin-top:-6px}',
    '.mp2-dual-range input[type=range]::-moz-range-thumb{pointer-events:all;width:14px;height:14px;border-radius:50%;background:var(--accent);cursor:pointer;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.22)}',
    '.mp2-dual-range input[type=range]::-webkit-slider-runnable-track{height:2px;background:transparent}',
    '.mp2-dual-range input[type=range]::-moz-range-track{height:2px;background:transparent}',
  ].join('');
  document.head.appendChild(s);
}

// ── Moment card deterministic attributes (used both for rendering and filtering) ─
function mp2MomentCardAttrs(c) {
  var seed = c.name.split('').reduce(function(a, ch) { return a + ch.charCodeAt(0); }, 0);
  var cpm  = 12 + ((c.score + seed) % 24);
  var ALL_CH = ['NBC','Fox','ABC','CBS','HBO','Peacock','Bravo','Discovery','ESPN','TNT','TBS','AMC'];
  var numCh  = 4 + (seed % 7);
  var channels = ALL_CH.slice().sort(function(a,b){ return ((seed*7+a.charCodeAt(0)*3)%13)-((seed*7+b.charCodeAt(0)*3)%13); }).slice(0, numCh);
  return {
    seed:     seed,
    cpm:      cpm,
    type:     seed % 2 === 0 ? 'Live' : 'VOD',
    platform: ['Roku','Vizio','Pluto'][seed % 3],
    channels: channels,
  };
}

function mp2RenderMoments() {
  mp2InjectMomentStyles();
  var momPanel = document.getElementById('tx2-sub-content-moments');
  if (!momPanel) return;

  momPanel.style.display       = 'flex';
  momPanel.style.flexDirection = 'column';
  momPanel.style.overflowY     = 'hidden';

  var selCount = Object.keys(mp2SelectedMoments).length;
  var segBase = 'border:none;padding:4px 12px;border-radius:16px;font-size:11px;font-weight:500;font-family:inherit;cursor:pointer;transition:background .12s,color .12s,box-shadow .12s;white-space:nowrap;line-height:1.4';
  var segAct  = segBase + ';background:var(--surface);color:var(--text);box-shadow:0 1px 3px rgba(0,0,0,.1)';
  var segOff  = segBase + ';background:transparent;color:var(--faint)';
  var mfActive = (mp2MfScore !== 'all' ? 1 : 0) + mp2MfChannels.length + (mp2MfCpmMin > 0 || mp2MfCpmMax < 50 ? 1 : 0) + mp2MfPlatforms.length;
  var headerHtml =
    '<div style="display:flex;align-items:center;gap:8px;padding-bottom:10px;flex-shrink:0;position:relative">'
    + '<div style="display:flex;background:var(--bg);border:1px solid var(--border);border-radius:20px;padding:2px;gap:0">'
    +   '<button style="' + (mp2MomentType === 'ads'     ? segAct : segOff) + '" onclick="mp2SetMomentType(\'ads\')">Ads</button>'
    +   '<button style="' + (mp2MomentType === 'organic' ? segAct : segOff) + '" onclick="mp2SetMomentType(\'organic\')">Organic Pause</button>'
    +   '<button style="' + (mp2MomentType === 'live'    ? segAct : segOff) + '" onclick="mp2SetMomentType(\'live\')">Live</button>'
    + '</div>'
    + '<div style="flex:1"></div>'
    + '<button id="mp2-mf-btn" onclick="mp2ToggleMfPanel()" style="display:flex;align-items:center;gap:5px;height:28px;padding:0 10px;border:1px solid ' + (mfActive > 0 ? 'var(--accent)' : 'var(--border-md,var(--border))') + ';border-radius:8px;background:' + (mfActive > 0 ? 'var(--accent-bg,#fdf2f8)' : 'var(--surface)') + ';color:' + (mfActive > 0 ? 'var(--accent)' : 'var(--muted)') + ';font-size:11px;font-weight:500;font-family:inherit;cursor:pointer;white-space:nowrap;transition:border-color .12s,background .12s;flex-shrink:0">'
    +   '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
    +   'Filters'
    +   (mfActive > 0 ? '<span style="background:var(--accent);color:#fff;border-radius:10px;padding:0 5px;font-size:9px;font-weight:700;min-width:14px;text-align:center;line-height:16px;display:inline-block">' + mfActive + '</span>' : '')
    + '</button>'
    + '<button id="mp2-moments-mp-btn" class="inv-view-btn' + (inv2MediaPlanVisible ? ' inv-view-btn--act' : '') + '" onclick="mp2ToggleMomentMediaPlan()" title="Media Plan" style="width:auto;padding:0 8px;gap:5px">'
    +   '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" style="flex-shrink:0"><rect x="1.5" y="2" width="11" height="10" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M4 5.5h6M4 7.5h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>'
    +   '<span id="mp2-mp-badge" style="font-size:11px;font-weight:600;display:' + (selCount > 0 ? 'inline' : 'none') + '">' + selCount + '</span>'
    + '</button>'
    + '</div>';

  momPanel.innerHTML = headerHtml + '<div id="mp2-moments-scroll" style="overflow-y:auto;flex:1;min-height:0"></div>';
  var scrollWrap = document.getElementById('mp2-moments-scroll');

  // Base pool by type: Live = top 6 (score ≥ 87), Ads = 10 (score ≥ 80), Organic = all 16
  var typeMinScore = mp2MomentType === 'live' ? 87 : mp2MomentType === 'ads' ? 80 : 0;
  var cats = TX_CATEGORIES.filter(function(c) {
    if (c.score < typeMinScore) return false;
    var a = mp2MomentCardAttrs(c);
    if (mp2MfScore === 'high'     && c.score <  80) return false;
    if (mp2MfScore === 'standard' && c.score >= 80) return false;
    if (mp2MfChannels.length > 0 && !mp2MfChannels.some(function(ch){ return a.channels.indexOf(ch) >= 0; })) return false;
    if (mp2MfCpmMin > 0  && a.cpm < mp2MfCpmMin)  return false;
    if (mp2MfCpmMax < 50 && a.cpm > mp2MfCpmMax)  return false;
    if (mp2MfTypes.length     > 0 && mp2MfTypes.indexOf(a.type) < 0)     return false;
    if (mp2MfPlatforms.length > 0 && mp2MfPlatforms.indexOf(a.platform) < 0) return false;
    return true;
  });

  var GRID = 'display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding-bottom:16px';

  var renderCard = function(c) {
    var safeN    = c.name.replace(/'/g, "\\'");
    var safeId   = c.name.replace(/[^a-zA-Z0-9]/g, '-');
    var imgId    = 'mp2-img-' + safeId;
    var attrs    = mp2MomentCardAttrs(c);
    var seed     = attrs.seed;
    var refined  = mp2RefinedStats[c.name];
    var dispInv  = refined ? refined.inventory : c.assets;
    // Type-specific CPM & impression multipliers
    var cpmMult  = mp2MomentType === 'live' ? 1.55 : mp2MomentType === 'organic' ? 0.68 : 1.0;
    var impMult  = mp2MomentType === 'live' ? 0.55 : mp2MomentType === 'organic' ? 1.45 : 1.0;
    var rawCpm   = attrs.cpm;
    var rawImpM  = 1.5 + ((seed * 3 + c.score * 7) % 85) / 10;
    var dispCpm  = refined ? refined.cpm  : Math.round(rawCpm * cpmMult);
    var dispImpM = refined ? refined.impM : (rawImpM * impMult).toFixed(1);
    var isHigh   = c.score >= 80;
    var badgeCol = isHigh ? '#16a34a' : '#d97706';
    var badgeBg  = isHigh ? '#f0fdf4' : '#fffbeb';
    var badgeBd  = isHigh ? '#bbf7d0' : '#fde68a';
    // Supply type badge
    var supplyBadge = mp2MomentType === 'live'
      ? '<span style="background:#fef2f2;border:1px solid #fecaca;border-radius:20px;padding:1px 7px;font-size:9px;font-weight:700;color:#dc2626;display:flex;align-items:center;gap:3px"><span style="width:5px;height:5px;border-radius:50%;background:#ef4444;flex-shrink:0;box-shadow:0 0 4px #ef4444"></span>Live</span>'
      : mp2MomentType === 'organic'
      ? '<span style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:20px;padding:1px 7px;font-size:9px;font-weight:700;color:#0f766e">Organic Pause</span>'
      : '<span style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:20px;padding:1px 7px;font-size:9px;font-weight:700;color:#1d4ed8">Ads</span>';
    var LABEL = 'font-size:9px;text-transform:uppercase;letter-spacing:.4px;color:var(--faint);margin-bottom:2px';
    var VALUE = 'font-size:12px;font-weight:700;color:var(--text)';

    // Deterministic channels per card (from shared attrs)
    var cardCh = attrs.channels;
    var visibleCh = cardCh.slice(0, 3);
    var extraCh   = cardCh.slice(3);
    var chHtml = visibleCh.map(function(ch){
      return '<span style="font-size:10px;color:var(--text);font-weight:500">' + ch + '</span>';
    }).join('<span style="color:var(--faint);font-size:10px;margin:0 1px">·</span>');
    if (extraCh.length) {
      var fullList = cardCh.map(function(ch){ return '<div style="font-size:11px;font-weight:500;color:var(--text);padding:2px 0">' + ch + '</div>'; }).join('');
      chHtml += '<span onclick="event.stopPropagation()" onmouseenter="this.querySelector(\'.mp2-ch-hover-tt\').style.display=\'block\'" onmouseleave="this.querySelector(\'.mp2-ch-hover-tt\').style.display=\'none\'" style="position:relative;display:inline-flex;align-items:center;margin-left:3px">'
        + '<span style="font-size:9px;font-weight:600;color:var(--muted);background:var(--bg);border:1px solid var(--border);border-radius:20px;padding:0px 5px;white-space:nowrap;cursor:default">+' + extraCh.length + '</span>'
        + '<span class="mp2-ch-hover-tt" style="display:none;position:absolute;bottom:calc(100% + 5px);left:50%;transform:translateX(-50%);background:var(--surface);border:1px solid var(--border-md);border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.13);padding:8px 12px;min-width:120px;z-index:9999;white-space:nowrap">'
        +   '<div style="font-size:9px;font-weight:600;color:var(--faint);text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px">Channels included</div>'
        +   fullList
        + '</span>'
        + '</span>';
    }

    var isSel = !!mp2SelectedMoments[c.name];
    return '<div id="mp2-mcard-' + safeId + '" class="mp2-mcard' + (isSel ? ' mp2-mcard--sel' : '') + '" onclick="mp2ToggleMomentCard(\'' + safeN + '\')" style="cursor:pointer">'
      // thumbnail
      + '<div style="position:relative;width:100%;padding-top:44%">'
      +   '<div id="' + imgId + '" style="position:absolute;inset:0;width:100%;height:100%;background-color:var(--border);display:flex;align-items:center;justify-content:center;overflow:hidden"><svg width="20" height="20" viewBox="0 0 16 16" fill="none" style="opacity:.25;flex-shrink:0"><rect x="1" y="4" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M11 7l4-2v6l-4-2V7z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg></div>'
      +   '<label onclick="event.stopPropagation()" style="position:absolute;top:6px;left:6px;z-index:2;cursor:pointer;width:16px;height:16px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.88);border-radius:3px;box-shadow:0 1px 3px rgba(0,0,0,.2)">'
      +     '<input type="checkbox" id="mp2-cb-' + safeId + '"' + (isSel ? ' checked' : '') + ' onchange="mp2ToggleMomentCard(\'' + safeN + '\')" style="width:11px;height:11px;accent-color:var(--accent);cursor:pointer;margin:0">'
      +   '</label>'
      +   '<div style="position:absolute;top:6px;right:6px;display:flex;align-items:center;gap:3px">'
      +     (refined ? '<span style="background:rgba(237,0,94,.9);color:#fff;border-radius:20px;padding:1px 7px;font-size:9px;font-weight:700">Refined</span>' : '')
      +     supplyBadge
      +     '<span style="background:' + badgeBg + ';border:1px solid ' + badgeBd + ';border-radius:20px;padding:1px 7px;font-size:9px;font-weight:700;color:' + badgeCol + '">' + (isHigh ? 'High' : 'Standard') + '</span>'
      +   '</div>'
      +   '<div style="position:absolute;bottom:0;left:0;right:0;height:28px;background:linear-gradient(to top,rgba(0,0,0,.4),transparent)"></div>'
      + '</div>'
      // body
      + '<div style="padding:9px 10px 11px;position:relative">'
      +   '<div style="font-size:11px;font-weight:600;color:var(--text);margin-bottom:8px;line-height:1.3">' + c.name + '</div>'
      +   '<div style="display:flex;flex-direction:column;gap:5px;margin-bottom:10px">'
      +     '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">'
      +       '<div><div style="' + LABEL + '">Est. Impr.</div><div id="mp2-kv-imp-' + safeId + '" style="' + VALUE + '">' + dispImpM + 'M</div></div>'
      +       '<div><div style="' + LABEL + '">CPM</div><div id="mp2-kv-cpm-' + safeId + '" style="' + VALUE + '">$' + dispCpm + '</div></div>'
      +       '<div><div style="' + LABEL + '">Inventory</div><div id="mp2-kv-inv-' + safeId + '" style="' + VALUE + '">' + dispInv.toLocaleString() + '</div></div>'
      +     '</div>'
      +     '<div>'
      +       '<div style="' + LABEL + '">Channels</div>'
      +       '<div style="display:flex;align-items:center;flex-wrap:nowrap;gap:2px;margin-top:1px;position:relative">' + chHtml + '</div>'
      +     '</div>'
      +   '</div>'
      +   (refined ? '<button class="mp2-kpi-reset-btn" onclick="event.stopPropagation();mp2ResetCard(\'' + safeN + '\')" title="Reset to original" style="position:absolute;top:8px;right:8px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg></button>' : '')
      +   '<div style="display:flex;align-items:center;gap:5px">'
      +     '<button class="mp2-mBtn mp2-mBtn--magenta" style="font-size:10px;padding:4px 8px;flex:1;display:flex;align-items:center;justify-content:center;gap:5px" onclick="event.stopPropagation();mp2OpenMomentModal(\'' + safeN + '\',' + c.score + ',' + c.assets + ')">'
      +       '<svg width="11" height="11" viewBox="0 0 16 16" fill="none" style="flex-shrink:0"><path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
      +       'Refine Taxonomies'
      +     '</button>'
      +     '<button class="mp2-mBtn--ico" title="Show examples" onclick="event.stopPropagation();mp2ShowExamples(\'' + safeN + '\',' + c.score + ',' + c.assets + ',this)">'
      +       '<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M11 7l4-2v6l-4-2V7z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>'
      +     '</button>'
      +   '</div>'
      + '</div>'
      + '</div>';
  };

  scrollWrap.innerHTML = '<div style="' + GRID + '">' + cats.map(renderCard).join('') + '</div>';

  mp2FetchMomentImages(cats);
  mp2RenderMomentsMediaPlan();
}

function mp2FetchMomentImages(categories) {
  categories.forEach(function(c) {
    var imgId = 'mp2-img-' + c.name.replace(/[^a-zA-Z0-9]/g, '-');
    var TV_QUERIES = {
      'Family Dinner Time':    'family dinner tv show scene',
      'Grocery Shopping':      'cooking show food network television host',
      'Healthy Eating':        'cooking show kitchen television chef healthy',
      'Meal Prep & Cooking':   'cooking show chef kitchen television',
      'Fresh Produce':         'cooking show vegetables chef television',
      'Weekend BBQ':           'outdoor cooking show bbq television',
      'Quick & Easy Meals':    'cooking show recipe television host',
      'Home Cooking':          'home cooking television show chef',
      'Family Life':           'family television sitcom show scene',
      'Snack & Entertaining':  'television show party entertaining scene',
      'Budget Living':         'reality tv show home lifestyle',
      'Lifestyle & Wellness':  'wellness lifestyle television show host',
      'Food Discovery':        'food travel television show chef',
      'Kids & Family':         'kids family television show scene',
      'Community & Local':     'community television show neighborhood',
      'Seasonal Celebrations': 'holiday television show celebration family'
    };
    var query = (TV_QUERIES[c.name] || c.name + ' television show scene');
    fetch('/api/unsplash?q=' + encodeURIComponent(query))
      .then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function(data) {
        if (!data.thumb) return;
        var el = document.getElementById(imgId);
        if (!el) return;
        var img = new Image();
        img.onload = function() {
          el.innerHTML = '<img src="' + data.thumb + '" style="width:100%;height:100%;object-fit:cover;display:block" />';
        };
        img.onerror = function() { /* keep placeholder */ };
        img.src = data.thumb;
      })
      .catch(function(e) { console.warn('mp2 img fetch failed for "' + c.name + '":', e); });
  });
}

function mp2ShowChannels(channels, btn) {
  document.querySelectorAll('.mp2-ch-tt').forEach(function(el) { el.remove(); });
  var tt = document.createElement('div');
  tt.className = 'mp2-ch-tt';
  tt.style.cssText = 'position:fixed;z-index:9999;background:var(--surface);border:1px solid var(--border-md);border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,.14);padding:12px 14px;min-width:160px;';
  tt.innerHTML = '<div style="font-size:10px;font-weight:600;color:var(--faint);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">All Channels</div>'
    + channels.map(function(ch) {
        return '<div style="font-size:12px;font-weight:500;color:var(--text);padding:3px 0">' + ch + '</div>';
      }).join('');
  tt.style.visibility = 'hidden';
  document.body.appendChild(tt);
  var r = btn.getBoundingClientRect();
  var ttH = tt.offsetHeight, ttW = tt.offsetWidth;
  tt.style.top  = (r.bottom + 6 + ttH > window.innerHeight ? r.top - ttH - 6 : r.bottom + 6) + 'px';
  tt.style.left = Math.max(8, Math.min(r.left, window.innerWidth - ttW - 8)) + 'px';
  tt.style.visibility = '';
  setTimeout(function() {
    document.addEventListener('click', function h() { tt.remove(); document.removeEventListener('click', h); });
  }, 0);
}

function mp2ShowExamples(momentName, score, assets, btn) {
  // Toggle: if this button already has the popup open, close it
  if (btn.dataset.ttOpen === '1') {
    document.querySelectorAll('.mp2-examples-tt').forEach(function(el) { el.remove(); });
    btn.dataset.ttOpen = '';
    return;
  }
  document.querySelectorAll('.mp2-examples-tt').forEach(function(el) { el.remove(); });
  document.querySelectorAll('[data-tt-open]').forEach(function(el) { el.dataset.ttOpen = ''; });
  btn.dataset.ttOpen = '1';

  // Deterministic relevance score per program based on moment name seed
  var seed = 0;
  for (var k = 0; k < momentName.length; k++) seed += momentName.charCodeAt(k);
  var top5 = INV_PROGRAMS_V2.map(function(p, i) {
    var s = 58 + ((seed * 7 + i * 31 + seed % (i + 3)) % 40);
    var showName = p.title.replace(/\s*[—–-]+\s*Ep\..*$/i, '').trim();
    return { title: showName, channel: p.channel, score: Math.min(s, 97) };
  }).sort(function(a, b) { return b.score - a.score; }).slice(0, 5);

  var ttLabel = function(s) { return s >= 80 ? 'High'    : 'Standard'; };
  var ttColor = function(s) { return s >= 80 ? '#16a34a' : '#d97706'; };
  var ttBg    = function(s) { return s >= 80 ? '#f0fdf4' : '#fffbeb'; };
  var ttBd    = function(s) { return s >= 80 ? '#bbf7d0' : '#fde68a'; };

  var tt = document.createElement('div');
  tt.className = 'mp2-examples-tt';
  tt.style.cssText = 'position:fixed;z-index:9999;background:var(--surface);border:1px solid var(--border-md);border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,.14);padding:14px;min-width:260px;max-width:320px;';
  tt.innerHTML =
    '<div style="display:flex;align-items:center;margin-bottom:10px">'
    +   '<span style="font-size:10px;font-weight:600;color:var(--faint);text-transform:uppercase;letter-spacing:.5px;flex:1">Top shows — ' + momentName + '</span>'
    +   '<button onclick="this.closest(\'.mp2-examples-tt\').remove();document.querySelectorAll(\'[data-tt-open]\').forEach(function(e){e.dataset.ttOpen=\'\';})" style="border:none;background:none;cursor:pointer;color:var(--faint);font-size:14px;line-height:1;padding:0 0 0 8px;display:flex;align-items:center" onmouseenter="this.style.color=\'var(--text)\'" onmouseleave="this.style.color=\'var(--faint)\'">×</button>'
    + '</div>'
    + top5.map(function(p, i) {
        return '<div style="display:flex;align-items:center;gap:10px;padding:7px 0;' + (i < 4 ? 'border-bottom:1px solid var(--border)' : '') + '">'
          + '<span style="font-size:10px;font-weight:600;color:var(--faint);min-width:14px">' + (i + 1) + '</span>'
          + '<div style="flex:1;min-width:0">'
          +   '<div style="font-size:12px;font-weight:500;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + p.title + '</div>'
          + '</div>'
          + '<span style="font-size:11px;font-weight:600;padding:1px 7px;border-radius:20px;background:' + ttBg(p.score) + ';color:' + ttColor(p.score) + ';border:1px solid ' + ttBd(p.score) + ';flex-shrink:0">' + ttLabel(p.score) + '</span>'
          + '</div>';
      }).join('')
    + '<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">'
    +   '<button onclick="this.closest(\'.mp2-examples-tt\').remove();txShowAssetsView(\'' + momentName.replace(/'/g, "\\'") + '\',' + score + ',' + assets + ')" style="width:100%;padding:7px 10px;font-size:11px;font-weight:500;font-family:inherit;border:1px solid var(--border-md);border-radius:7px;background:var(--bg);color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:background .12s" onmouseenter="this.style.background=\'var(--surface)\'" onmouseleave="this.style.background=\'var(--bg)\'">'
    +     '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3" width="13" height="9" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M5.5 12.5v1M10.5 12.5v1M3.5 13.5h9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M4.5 7.5h7M4.5 5.5h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity=".6"/></svg>'
    +     'See full inventory'
    +   '</button>'
    +   '<div style="margin-top:8px;font-size:9px;color:var(--faint);text-align:center;line-height:1.4">Example shows, not guaranteed</div>'
    + '</div>';

  var r = btn.getBoundingClientRect();
  // Append first (hidden) so we can measure height
  tt.style.visibility = 'hidden';
  document.body.appendChild(tt);
  var ttH = tt.offsetHeight;
  var ttW = tt.offsetWidth;
  // Vertical: open above if not enough space below
  var spaceBelow = window.innerHeight - r.bottom - 8;
  var spaceAbove = r.top - 8;
  if (spaceBelow >= ttH) {
    tt.style.top = (r.bottom + 6) + 'px';
  } else if (spaceAbove >= ttH) {
    tt.style.top = (r.top - ttH - 6) + 'px';
  } else {
    // Not enough space either way — pin to bottom of viewport with scroll
    tt.style.top = Math.max(8, window.innerHeight - ttH - 8) + 'px';
  }
  // Horizontal: keep inside viewport
  var left = Math.max(8, Math.min(r.left, window.innerWidth - ttW - 8));
  tt.style.left = left + 'px';
  tt.style.visibility = '';

  setTimeout(function() {
    document.addEventListener('click', function h() {
      tt.remove();
      btn.dataset.ttOpen = '';
      document.removeEventListener('click', h);
    });
  }, 0);
}

// ── Per-moment IAB taxonomy data ─────────────────────────────────────────────
var MP2_MOMENT_TAXONOMIES = {
  'Family Dinner Time': {
    emotion: [
      { taxonomy:'Emotion > Positive > Warmth',                 score:97 },
      { taxonomy:'Emotion > Social > Togetherness',             score:95 },
      { taxonomy:'Emotion > Positive > Comfort',                score:91 },
      { taxonomy:'Emotion > Social > Belonging',                score:87 },
      { taxonomy:'Emotion > Positive > Joy',                    score:83 },
      { taxonomy:'Emotion > Sensory > Appetite',                score:76 },
      { taxonomy:'Emotion > Calm > Contentment',                score:70 },
    ],
    location: [
      { taxonomy:'Location > Domestic > Interior > Dining Room', score:98 },
      { taxonomy:'Location > Domestic > Interior > Kitchen',    score:95 },
      { taxonomy:'Location > Domestic > Exterior > Garden',     score:72 },
      { taxonomy:'Location > Domestic > Interior > Living Room',score:68 },
      { taxonomy:'Location > Domestic > Interior > Open-Plan',  score:65 },
    ],
    objects: [
      { taxonomy:'Objects > Food > Prepared > Family Meal',     score:97 },
      { taxonomy:'Objects > Kitchenware > Tableware > Plates',  score:93 },
      { taxonomy:'Objects > Food > Fresh > Vegetables',         score:88 },
      { taxonomy:'Objects > Kitchenware > Cookware > Casserole',score:82 },
      { taxonomy:'Objects > Kitchenware > Utensils > Cutlery',  score:78 },
      { taxonomy:'Objects > Beverage > Non-Alcoholic > Water',  score:65 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Positive > Warm & Wholesome',     score:98 },
      { taxonomy:'Sentiment > Social > Family-Oriented',        score:96 },
      { taxonomy:'Sentiment > Positive > Comforting',           score:92 },
      { taxonomy:'Sentiment > Positive > Aspirational',         score:80 },
      { taxonomy:'Sentiment > Neutral > Everyday',              score:60 },
    ],
    iab: [
      { taxonomy:'IAB8 > Food & Drink > Cooking',               score:97 },
      { taxonomy:'IAB25 > Family & Parenting > Family Life',    score:96 },
      { taxonomy:'IAB8 > Food & Drink > Grocery & Supermarket', score:93 },
      { taxonomy:'IAB8 > Food & Drink > Healthy Eating',        score:85 },
      { taxonomy:'IAB9 > Home & Garden > Home Cooking',         score:80 },
      { taxonomy:'IAB7 > Health > Nutrition',                   score:70 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
      { taxonomy:'Brand Safety > Safe > Clean Language',        score:99 },
      { taxonomy:'Brand Safety > Safe > Food Safe',             score:99 },
    ],
  },
  'Grocery Shopping': {
    emotion: [
      { taxonomy:'Emotion > Positive > Anticipation',           score:88 },
      { taxonomy:'Emotion > Positive > Satisfaction',           score:85 },
      { taxonomy:'Emotion > Social > Comfort',                  score:80 },
      { taxonomy:'Emotion > Sensory > Appetite',                score:78 },
      { taxonomy:'Emotion > Positive > Excitement',             score:72 },
      { taxonomy:'Emotion > Positive > Pride',                  score:65 },
    ],
    location: [
      { taxonomy:'Location > Retail > Grocery > Supermarket',   score:99 },
      { taxonomy:'Location > Retail > Grocery > Fresh Produce Aisle', score:96 },
      { taxonomy:'Location > Retail > Grocery > Checkout',      score:88 },
      { taxonomy:'Location > Retail > Market > Farmers Market', score:75 },
      { taxonomy:'Location > Retail > Grocery > Parking Lot',   score:62 },
    ],
    objects: [
      { taxonomy:'Objects > Retail > Grocery > Shopping Cart',  score:97 },
      { taxonomy:'Objects > Food > Fresh > Produce',            score:95 },
      { taxonomy:'Objects > Food > Packaged > Branded Goods',   score:92 },
      { taxonomy:'Objects > Retail > Grocery > Shelving',       score:88 },
      { taxonomy:'Objects > Retail > Payment > Shopping Bag',   score:82 },
      { taxonomy:'Objects > Electronics > Mobile > Smartphone', score:65 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Positive > Convenient',           score:93 },
      { taxonomy:'Sentiment > Positive > Reassuring',           score:90 },
      { taxonomy:'Sentiment > Positive > Value-Driven',         score:87 },
      { taxonomy:'Sentiment > Social > Family-Oriented',        score:82 },
      { taxonomy:'Sentiment > Neutral > Everyday',              score:75 },
    ],
    iab: [
      { taxonomy:'IAB8 > Food & Drink > Grocery & Supermarket', score:99 },
      { taxonomy:'IAB8 > Food & Drink > Food Shopping',         score:97 },
      { taxonomy:'IAB8 > Food & Drink > Organic & Natural',     score:82 },
      { taxonomy:'IAB25 > Family & Parenting > Family Budget',  score:78 },
      { taxonomy:'IAB13 > Personal Finance > Budgeting',        score:70 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
      { taxonomy:'Brand Safety > Safe > Clean Language',        score:100 },
    ],
  },
  'Healthy Eating': {
    emotion: [
      { taxonomy:'Emotion > Positive > Vitality',               score:94 },
      { taxonomy:'Emotion > Positive > Pride',                  score:90 },
      { taxonomy:'Emotion > Motivational > Determination',      score:86 },
      { taxonomy:'Emotion > Positive > Satisfaction',           score:83 },
      { taxonomy:'Emotion > Positive > Hope',                   score:78 },
      { taxonomy:'Emotion > Sensory > Appetite',                score:72 },
    ],
    location: [
      { taxonomy:'Location > Domestic > Interior > Kitchen',    score:95 },
      { taxonomy:'Location > Domestic > Interior > Dining Area',score:88 },
      { taxonomy:'Location > Retail > Grocery > Fresh Aisle',   score:82 },
      { taxonomy:'Location > Outdoor > Garden > Vegetable Patch',score:68 },
      { taxonomy:'Location > Retail > Health Food > Store',     score:65 },
    ],
    objects: [
      { taxonomy:'Objects > Food > Fresh > Leafy Greens',       score:97 },
      { taxonomy:'Objects > Food > Fresh > Fruit',              score:95 },
      { taxonomy:'Objects > Food > Fresh > Vegetables',         score:94 },
      { taxonomy:'Objects > Food > Grains > Whole Grain',       score:85 },
      { taxonomy:'Objects > Kitchenware > Cookware > Steamer',  score:78 },
      { taxonomy:'Objects > Beverage > Smoothie',               score:72 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Positive > Healthy & Vibrant',    score:97 },
      { taxonomy:'Sentiment > Positive > Aspirational',         score:93 },
      { taxonomy:'Sentiment > Positive > Empowering',           score:89 },
      { taxonomy:'Sentiment > Positive > Wholesome',            score:87 },
      { taxonomy:'Sentiment > Neutral > Educational',           score:72 },
    ],
    iab: [
      { taxonomy:'IAB8 > Food & Drink > Healthy Eating',        score:99 },
      { taxonomy:'IAB7 > Health > Nutrition',                   score:97 },
      { taxonomy:'IAB8 > Food & Drink > Organic & Natural',     score:91 },
      { taxonomy:'IAB7 > Health > Wellness',                    score:88 },
      { taxonomy:'IAB8 > Food & Drink > Cooking',               score:82 },
      { taxonomy:'IAB25 > Family & Parenting > Family Health',  score:75 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Health-Positive',       score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
    ],
  },
  'Meal Prep & Cooking': {
    emotion: [
      { taxonomy:'Emotion > Positive > Creativity',             score:93 },
      { taxonomy:'Emotion > Positive > Satisfaction',           score:91 },
      { taxonomy:'Emotion > Positive > Pride',                  score:88 },
      { taxonomy:'Emotion > Sensory > Appetite',                score:85 },
      { taxonomy:'Emotion > Motivational > Focus',              score:80 },
      { taxonomy:'Emotion > Positive > Calm',                   score:72 },
    ],
    location: [
      { taxonomy:'Location > Domestic > Interior > Kitchen',    score:99 },
      { taxonomy:'Location > Domestic > Interior > Counter-top',score:95 },
      { taxonomy:'Location > Domestic > Interior > Pantry',     score:78 },
      { taxonomy:'Location > Retail > Grocery > Supermarket',   score:70 },
      { taxonomy:'Location > Domestic > Exterior > BBQ Area',   score:62 },
    ],
    objects: [
      { taxonomy:'Objects > Kitchenware > Cookware > Pots & Pans', score:98 },
      { taxonomy:'Objects > Kitchenware > Utensils > Chef Knife',  score:95 },
      { taxonomy:'Objects > Food > Fresh > Ingredients',           score:94 },
      { taxonomy:'Objects > Kitchenware > Appliance > Blender',    score:85 },
      { taxonomy:'Objects > Kitchenware > Appliance > Oven',       score:82 },
      { taxonomy:'Objects > Kitchenware > Storage > Meal Prep Container', score:76 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Positive > Skilled & Crafted',    score:95 },
      { taxonomy:'Sentiment > Positive > Wholesome',            score:93 },
      { taxonomy:'Sentiment > Positive > Satisfying',           score:90 },
      { taxonomy:'Sentiment > Positive > Inspiring',            score:82 },
      { taxonomy:'Sentiment > Neutral > Instructional',         score:76 },
    ],
    iab: [
      { taxonomy:'IAB8 > Food & Drink > Cooking',               score:99 },
      { taxonomy:'IAB8 > Food & Drink > Recipes',               score:97 },
      { taxonomy:'IAB8 > Food & Drink > Grocery & Supermarket', score:90 },
      { taxonomy:'IAB9 > Home & Garden > Cooking Techniques',   score:87 },
      { taxonomy:'IAB8 > Food & Drink > Healthy Eating',        score:82 },
      { taxonomy:'IAB25 > Family & Parenting > Home Skills',    score:72 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:99 },
      { taxonomy:'Brand Safety > Safe > Clean Language',        score:99 },
    ],
  },
  'Fresh Produce': {
    emotion: [
      { taxonomy:'Emotion > Sensory > Visual Appeal',           score:96 },
      { taxonomy:'Emotion > Positive > Freshness',              score:94 },
      { taxonomy:'Emotion > Sensory > Appetite',                score:90 },
      { taxonomy:'Emotion > Positive > Vitality',               score:86 },
      { taxonomy:'Emotion > Positive > Satisfaction',           score:80 },
      { taxonomy:'Emotion > Positive > Joy',                    score:72 },
    ],
    location: [
      { taxonomy:'Location > Retail > Grocery > Produce Section', score:98 },
      { taxonomy:'Location > Retail > Market > Farmers Market', score:94 },
      { taxonomy:'Location > Outdoor > Farm > Field',           score:85 },
      { taxonomy:'Location > Domestic > Interior > Kitchen',    score:80 },
      { taxonomy:'Location > Retail > Grocery > Organic Aisle', score:76 },
    ],
    objects: [
      { taxonomy:'Objects > Food > Fresh > Fruit',              score:99 },
      { taxonomy:'Objects > Food > Fresh > Vegetables',         score:99 },
      { taxonomy:'Objects > Food > Fresh > Leafy Greens',       score:96 },
      { taxonomy:'Objects > Food > Fresh > Herbs',              score:88 },
      { taxonomy:'Objects > Retail > Grocery > Display Basket', score:82 },
      { taxonomy:'Objects > Food > Organic > Produce',          score:78 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Positive > Fresh & Natural',      score:98 },
      { taxonomy:'Sentiment > Positive > Healthy',              score:96 },
      { taxonomy:'Sentiment > Positive > Vibrant',              score:93 },
      { taxonomy:'Sentiment > Positive > Authentic',            score:85 },
      { taxonomy:'Sentiment > Positive > Sustainable',          score:78 },
    ],
    iab: [
      { taxonomy:'IAB8 > Food & Drink > Grocery & Supermarket', score:98 },
      { taxonomy:'IAB8 > Food & Drink > Organic & Natural',     score:96 },
      { taxonomy:'IAB8 > Food & Drink > Healthy Eating',        score:93 },
      { taxonomy:'IAB7 > Health > Nutrition',                   score:87 },
      { taxonomy:'IAB6 > Environment > Sustainability',         score:75 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
      { taxonomy:'Brand Safety > Safe > Health-Positive',       score:100 },
    ],
  },
  'Weekend BBQ': {
    emotion: [
      { taxonomy:'Emotion > Positive > Joy',                    score:95 },
      { taxonomy:'Emotion > Social > Togetherness',             score:94 },
      { taxonomy:'Emotion > Social > Celebration',              score:90 },
      { taxonomy:'Emotion > Positive > Relaxation',             score:87 },
      { taxonomy:'Emotion > Sensory > Appetite',                score:84 },
      { taxonomy:'Emotion > Social > Belonging',                score:78 },
    ],
    location: [
      { taxonomy:'Location > Domestic > Exterior > Backyard',   score:98 },
      { taxonomy:'Location > Domestic > Exterior > Patio / Deck', score:95 },
      { taxonomy:'Location > Outdoor > Park > Picnic Area',     score:82 },
      { taxonomy:'Location > Domestic > Interior > Kitchen',    score:70 },
      { taxonomy:'Location > Outdoor > Beach > Coastal',        score:65 },
    ],
    objects: [
      { taxonomy:'Objects > Equipment > Outdoor > BBQ Grill',   score:99 },
      { taxonomy:'Objects > Food > Meat > Grilled',             score:97 },
      { taxonomy:'Objects > Food > Fresh > Corn & Vegetables',  score:90 },
      { taxonomy:'Objects > Kitchenware > Utensils > Tongs',    score:85 },
      { taxonomy:'Objects > Beverage > Soft Drink > Canned',    score:80 },
      { taxonomy:'Objects > Tableware > Outdoor > Paper Plates',score:74 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Social > Celebratory',            score:96 },
      { taxonomy:'Sentiment > Positive > Warm & Welcoming',     score:94 },
      { taxonomy:'Sentiment > Social > Family-Oriented',        score:91 },
      { taxonomy:'Sentiment > Positive > Relaxed',              score:88 },
      { taxonomy:'Sentiment > Positive > Fun',                  score:84 },
    ],
    iab: [
      { taxonomy:'IAB8 > Food & Drink > BBQ & Grilling',        score:99 },
      { taxonomy:'IAB8 > Food & Drink > Cooking',               score:94 },
      { taxonomy:'IAB25 > Family & Parenting > Family Life',    score:90 },
      { taxonomy:'IAB9 > Home & Garden > Outdoor Living',       score:85 },
      { taxonomy:'IAB8 > Food & Drink > Grocery & Supermarket', score:80 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
      { taxonomy:'Brand Safety > Safe > Clean Language',        score:99 },
    ],
  },
  'Quick & Easy Meals': {
    emotion: [
      { taxonomy:'Emotion > Positive > Relief',                 score:93 },
      { taxonomy:'Emotion > Positive > Satisfaction',           score:91 },
      { taxonomy:'Emotion > Positive > Confidence',             score:86 },
      { taxonomy:'Emotion > Sensory > Appetite',                score:83 },
      { taxonomy:'Emotion > Positive > Practicality',           score:80 },
      { taxonomy:'Emotion > Positive > Joy',                    score:72 },
    ],
    location: [
      { taxonomy:'Location > Domestic > Interior > Kitchen',    score:97 },
      { taxonomy:'Location > Domestic > Interior > Dining Area',score:88 },
      { taxonomy:'Location > Retail > Grocery > Supermarket',   score:78 },
      { taxonomy:'Location > Domestic > Interior > Pantry',     score:72 },
    ],
    objects: [
      { taxonomy:'Objects > Food > Packaged > Convenience Meal',score:95 },
      { taxonomy:'Objects > Kitchenware > Appliance > Microwave',score:90 },
      { taxonomy:'Objects > Food > Fresh > Ingredients',        score:87 },
      { taxonomy:'Objects > Kitchenware > Cookware > Pan',      score:84 },
      { taxonomy:'Objects > Kitchenware > Storage > Container', score:76 },
      { taxonomy:'Objects > Electronics > Mobile > Smartphone', score:65 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Positive > Convenient',           score:97 },
      { taxonomy:'Sentiment > Positive > Practical',            score:94 },
      { taxonomy:'Sentiment > Positive > Time-Saving',          score:92 },
      { taxonomy:'Sentiment > Positive > Satisfying',           score:87 },
      { taxonomy:'Sentiment > Neutral > Everyday',              score:78 },
    ],
    iab: [
      { taxonomy:'IAB8 > Food & Drink > Quick Meals & Recipes', score:98 },
      { taxonomy:'IAB8 > Food & Drink > Cooking',               score:93 },
      { taxonomy:'IAB8 > Food & Drink > Grocery & Supermarket', score:90 },
      { taxonomy:'IAB25 > Family & Parenting > Busy Parents',   score:85 },
      { taxonomy:'IAB8 > Food & Drink > Healthy Eating',        score:75 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
      { taxonomy:'Brand Safety > Safe > Clean Language',        score:100 },
    ],
  },
  'Home Cooking': {
    emotion: [
      { taxonomy:'Emotion > Positive > Creativity',             score:94 },
      { taxonomy:'Emotion > Positive > Pride',                  score:92 },
      { taxonomy:'Emotion > Positive > Nostalgia',              score:88 },
      { taxonomy:'Emotion > Sensory > Appetite',                score:85 },
      { taxonomy:'Emotion > Positive > Comfort',                score:83 },
      { taxonomy:'Emotion > Social > Warmth',                   score:78 },
    ],
    location: [
      { taxonomy:'Location > Domestic > Interior > Kitchen',    score:99 },
      { taxonomy:'Location > Domestic > Interior > Dining Room',score:85 },
      { taxonomy:'Location > Domestic > Interior > Open-Plan',  score:80 },
      { taxonomy:'Location > Domestic > Interior > Pantry',     score:70 },
    ],
    objects: [
      { taxonomy:'Objects > Kitchenware > Cookware > Pots & Pans', score:97 },
      { taxonomy:'Objects > Food > Fresh > Ingredients',        score:95 },
      { taxonomy:'Objects > Kitchenware > Utensils > Chef Knife', score:90 },
      { taxonomy:'Objects > Kitchenware > Appliance > Oven',    score:87 },
      { taxonomy:'Objects > Kitchenware > Tableware > Plates',  score:82 },
      { taxonomy:'Objects > Food > Pantry > Herbs & Spices',    score:76 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Positive > Homely',               score:97 },
      { taxonomy:'Sentiment > Positive > Comforting',           score:95 },
      { taxonomy:'Sentiment > Positive > Wholesome',            score:92 },
      { taxonomy:'Sentiment > Social > Family-Oriented',        score:86 },
      { taxonomy:'Sentiment > Positive > Nostalgic',            score:80 },
    ],
    iab: [
      { taxonomy:'IAB8 > Food & Drink > Cooking',               score:99 },
      { taxonomy:'IAB8 > Food & Drink > Recipes',               score:96 },
      { taxonomy:'IAB9 > Home & Garden > Kitchen',              score:90 },
      { taxonomy:'IAB8 > Food & Drink > Grocery & Supermarket', score:85 },
      { taxonomy:'IAB8 > Food & Drink > Healthy Eating',        score:78 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
      { taxonomy:'Brand Safety > Safe > Clean Language',        score:100 },
    ],
  },
  'Family Life': {
    emotion: [
      { taxonomy:'Emotion > Social > Togetherness',             score:97 },
      { taxonomy:'Emotion > Positive > Love',                   score:95 },
      { taxonomy:'Emotion > Positive > Joy',                    score:93 },
      { taxonomy:'Emotion > Positive > Warmth',                 score:90 },
      { taxonomy:'Emotion > Social > Belonging',                score:87 },
      { taxonomy:'Emotion > Positive > Pride',                  score:80 },
      { taxonomy:'Emotion > Positive > Nostalgia',              score:72 },
    ],
    location: [
      { taxonomy:'Location > Domestic > Interior > Living Room',score:95 },
      { taxonomy:'Location > Domestic > Interior > Kitchen',    score:93 },
      { taxonomy:'Location > Domestic > Interior > Dining Room',score:90 },
      { taxonomy:'Location > Domestic > Exterior > Backyard',   score:82 },
      { taxonomy:'Location > Retail > Grocery > Supermarket',   score:74 },
    ],
    objects: [
      { taxonomy:'Objects > Food > Prepared > Home Meal',       score:92 },
      { taxonomy:'Objects > Kitchenware > Tableware > Family Set', score:88 },
      { taxonomy:'Objects > People > Family > Multi-Generation',score:95 },
      { taxonomy:'Objects > Domestic > Furniture > Dining Table',score:85 },
      { taxonomy:'Objects > Retail > Grocery > Shopping Bag',   score:72 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Social > Family-Oriented',        score:99 },
      { taxonomy:'Sentiment > Positive > Warm & Wholesome',     score:97 },
      { taxonomy:'Sentiment > Social > Inclusive',              score:93 },
      { taxonomy:'Sentiment > Positive > Comforting',           score:90 },
      { taxonomy:'Sentiment > Positive > Trustworthy',          score:86 },
    ],
    iab: [
      { taxonomy:'IAB25 > Family & Parenting > Family Life',    score:99 },
      { taxonomy:'IAB8 > Food & Drink > Family Meals',          score:95 },
      { taxonomy:'IAB8 > Food & Drink > Grocery & Supermarket', score:90 },
      { taxonomy:'IAB25 > Family & Parenting > Parenting',      score:85 },
      { taxonomy:'IAB9 > Home & Garden > Home Life',            score:78 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
      { taxonomy:'Brand Safety > Safe > Clean Language',        score:100 },
    ],
  },
  'Snack & Entertaining': {
    emotion: [
      { taxonomy:'Emotion > Positive > Fun',                    score:94 },
      { taxonomy:'Emotion > Social > Celebration',              score:92 },
      { taxonomy:'Emotion > Sensory > Appetite',                score:90 },
      { taxonomy:'Emotion > Social > Togetherness',             score:86 },
      { taxonomy:'Emotion > Positive > Excitement',             score:82 },
      { taxonomy:'Emotion > Positive > Indulgence',             score:78 },
    ],
    location: [
      { taxonomy:'Location > Domestic > Interior > Living Room',score:95 },
      { taxonomy:'Location > Domestic > Interior > Kitchen',    score:90 },
      { taxonomy:'Location > Domestic > Interior > Dining Room',score:85 },
      { taxonomy:'Location > Domestic > Exterior > Patio',      score:78 },
      { taxonomy:'Location > Retail > Grocery > Snack Aisle',   score:72 },
    ],
    objects: [
      { taxonomy:'Objects > Food > Snacks > Chips & Crisps',    score:96 },
      { taxonomy:'Objects > Food > Snacks > Dips & Spreads',    score:92 },
      { taxonomy:'Objects > Beverage > Soft Drink > Sparkling', score:88 },
      { taxonomy:'Objects > Food > Snacks > Cheese & Crackers', score:85 },
      { taxonomy:'Objects > Kitchenware > Tableware > Serving Board', score:80 },
      { taxonomy:'Objects > Food > Snacks > Fruit Platter',     score:74 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Social > Celebratory',            score:95 },
      { taxonomy:'Sentiment > Positive > Fun & Playful',        score:93 },
      { taxonomy:'Sentiment > Social > Hospitable',             score:89 },
      { taxonomy:'Sentiment > Positive > Indulgent',            score:82 },
      { taxonomy:'Sentiment > Positive > Relaxed',              score:78 },
    ],
    iab: [
      { taxonomy:'IAB8 > Food & Drink > Snacks & Convenience',  score:98 },
      { taxonomy:'IAB8 > Food & Drink > Entertaining at Home',  score:95 },
      { taxonomy:'IAB8 > Food & Drink > Grocery & Supermarket', score:90 },
      { taxonomy:'IAB25 > Family & Parenting > Hosting',        score:82 },
      { taxonomy:'IAB8 > Food & Drink > Party Food',            score:78 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
      { taxonomy:'Brand Safety > Safe > Clean Language',        score:99 },
    ],
  },
  'Budget Living': {
    emotion: [
      { taxonomy:'Emotion > Positive > Empowerment',            score:92 },
      { taxonomy:'Emotion > Positive > Satisfaction',           score:90 },
      { taxonomy:'Emotion > Positive > Relief',                 score:88 },
      { taxonomy:'Emotion > Positive > Pride',                  score:84 },
      { taxonomy:'Emotion > Motivational > Practicality',       score:80 },
      { taxonomy:'Emotion > Positive > Confidence',             score:75 },
    ],
    location: [
      { taxonomy:'Location > Retail > Grocery > Supermarket',   score:96 },
      { taxonomy:'Location > Domestic > Interior > Kitchen',    score:90 },
      { taxonomy:'Location > Retail > Grocery > Sale Aisle',    score:86 },
      { taxonomy:'Location > Domestic > Interior > Pantry',     score:78 },
      { taxonomy:'Location > Retail > Market > Discount Market',score:70 },
    ],
    objects: [
      { taxonomy:'Objects > Food > Packaged > Value Range',     score:95 },
      { taxonomy:'Objects > Retail > Payment > Coupons',        score:90 },
      { taxonomy:'Objects > Food > Fresh > Seasonal Produce',   score:87 },
      { taxonomy:'Objects > Retail > Grocery > Price Tag',      score:82 },
      { taxonomy:'Objects > Electronics > Mobile > Grocery App',score:75 },
      { taxonomy:'Objects > Kitchenware > Storage > Containers',score:68 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Positive > Value-Driven',         score:97 },
      { taxonomy:'Sentiment > Positive > Empowering',           score:95 },
      { taxonomy:'Sentiment > Positive > Practical',            score:92 },
      { taxonomy:'Sentiment > Positive > Trustworthy',          score:86 },
      { taxonomy:'Sentiment > Neutral > Informative',           score:78 },
    ],
    iab: [
      { taxonomy:'IAB13 > Personal Finance > Budgeting',        score:97 },
      { taxonomy:'IAB8 > Food & Drink > Grocery & Supermarket', score:95 },
      { taxonomy:'IAB8 > Food & Drink > Budget Cooking',        score:92 },
      { taxonomy:'IAB25 > Family & Parenting > Family Budget',  score:88 },
      { taxonomy:'IAB8 > Food & Drink > Meal Planning',         score:83 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
      { taxonomy:'Brand Safety > Safe > Clean Language',        score:100 },
    ],
  },
  'Lifestyle & Wellness': {
    emotion: [
      { taxonomy:'Emotion > Positive > Vitality',               score:93 },
      { taxonomy:'Emotion > Calm > Serenity',                   score:90 },
      { taxonomy:'Emotion > Positive > Balance',                score:87 },
      { taxonomy:'Emotion > Positive > Hope',                   score:83 },
      { taxonomy:'Emotion > Positive > Confidence',             score:80 },
      { taxonomy:'Emotion > Motivational > Determination',      score:74 },
    ],
    location: [
      { taxonomy:'Location > Domestic > Interior > Kitchen',    score:88 },
      { taxonomy:'Location > Domestic > Interior > Home Gym',   score:82 },
      { taxonomy:'Location > Outdoor > Park > Walking Path',    score:79 },
      { taxonomy:'Location > Retail > Health Food > Store',     score:74 },
      { taxonomy:'Location > Domestic > Interior > Dining Area',score:70 },
    ],
    objects: [
      { taxonomy:'Objects > Food > Fresh > Superfoods',         score:94 },
      { taxonomy:'Objects > Food > Fresh > Vegetables',         score:92 },
      { taxonomy:'Objects > Beverage > Smoothie > Healthy',     score:88 },
      { taxonomy:'Objects > Kitchenware > Appliance > Blender', score:83 },
      { taxonomy:'Objects > Food > Packaged > Organic Range',   score:78 },
      { taxonomy:'Objects > Apparel > Athletic > Activewear',   score:70 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Positive > Balanced & Mindful',   score:95 },
      { taxonomy:'Sentiment > Positive > Inspirational',        score:92 },
      { taxonomy:'Sentiment > Positive > Healthy',              score:90 },
      { taxonomy:'Sentiment > Positive > Aspirational',         score:85 },
      { taxonomy:'Sentiment > Neutral > Educational',           score:74 },
    ],
    iab: [
      { taxonomy:'IAB7 > Health > Wellness',                    score:98 },
      { taxonomy:'IAB8 > Food & Drink > Healthy Eating',        score:96 },
      { taxonomy:'IAB7 > Health > Nutrition',                   score:92 },
      { taxonomy:'IAB9 > Fitness > Healthy Lifestyle',          score:88 },
      { taxonomy:'IAB8 > Food & Drink > Organic & Natural',     score:83 },
      { taxonomy:'IAB25 > Family & Parenting > Family Health',  score:76 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Health-Positive',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
    ],
  },
  'Food Discovery': {
    emotion: [
      { taxonomy:'Emotion > Positive > Curiosity',              score:95 },
      { taxonomy:'Emotion > Positive > Excitement',             score:92 },
      { taxonomy:'Emotion > Sensory > Appetite',                score:90 },
      { taxonomy:'Emotion > Positive > Surprise',               score:85 },
      { taxonomy:'Emotion > Positive > Joy',                    score:80 },
      { taxonomy:'Emotion > Positive > Adventurousness',        score:75 },
    ],
    location: [
      { taxonomy:'Location > Retail > Grocery > New Products Aisle', score:92 },
      { taxonomy:'Location > Retail > Market > Specialty Market', score:88 },
      { taxonomy:'Location > Domestic > Interior > Kitchen',    score:83 },
      { taxonomy:'Location > Retail > Grocery > World Foods',   score:78 },
      { taxonomy:'Location > Outdoor > Market > Street Food',   score:72 },
    ],
    objects: [
      { taxonomy:'Objects > Food > International > Global Cuisine', score:93 },
      { taxonomy:'Objects > Food > Specialty > Artisan Products', score:90 },
      { taxonomy:'Objects > Food > Fresh > Exotic Produce',     score:87 },
      { taxonomy:'Objects > Food > Packaged > New Products',    score:84 },
      { taxonomy:'Objects > Electronics > Mobile > Food App',   score:75 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Positive > Curious & Adventurous',score:96 },
      { taxonomy:'Sentiment > Positive > Exciting',             score:93 },
      { taxonomy:'Sentiment > Positive > Inspiring',            score:89 },
      { taxonomy:'Sentiment > Positive > Authentic',            score:83 },
      { taxonomy:'Sentiment > Neutral > Informative',           score:75 },
    ],
    iab: [
      { taxonomy:'IAB8 > Food & Drink > World Cuisine',         score:96 },
      { taxonomy:'IAB8 > Food & Drink > Food Trends',           score:94 },
      { taxonomy:'IAB8 > Food & Drink > Grocery & Supermarket', score:88 },
      { taxonomy:'IAB8 > Food & Drink > Specialty Foods',       score:85 },
      { taxonomy:'IAB9 > Arts & Entertainment > Food Culture',  score:78 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
      { taxonomy:'Brand Safety > Safe > Clean Language',        score:100 },
    ],
  },
  'Kids & Family': {
    emotion: [
      { taxonomy:'Emotion > Positive > Joy',                    score:97 },
      { taxonomy:'Emotion > Social > Togetherness',             score:95 },
      { taxonomy:'Emotion > Positive > Love',                   score:92 },
      { taxonomy:'Emotion > Positive > Playfulness',            score:89 },
      { taxonomy:'Emotion > Social > Belonging',                score:86 },
      { taxonomy:'Emotion > Positive > Wonder',                 score:80 },
    ],
    location: [
      { taxonomy:'Location > Domestic > Interior > Kitchen',    score:93 },
      { taxonomy:'Location > Domestic > Interior > Dining Room',score:92 },
      { taxonomy:'Location > Domestic > Exterior > Backyard',   score:85 },
      { taxonomy:'Location > Retail > Grocery > Supermarket',   score:80 },
      { taxonomy:'Location > Domestic > Interior > Living Room',score:78 },
    ],
    objects: [
      { taxonomy:'Objects > Food > Kids > Healthy Kids Meal',   score:97 },
      { taxonomy:'Objects > People > Children > School Age',    score:95 },
      { taxonomy:'Objects > Food > Fresh > Colourful Produce',  score:90 },
      { taxonomy:'Objects > Kitchenware > Kids > Child-Safe',   score:85 },
      { taxonomy:'Objects > Food > Snacks > Healthy Snacks',    score:82 },
      { taxonomy:'Objects > Food > Packaged > Kids Range',      score:76 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Social > Family-Oriented',        score:99 },
      { taxonomy:'Sentiment > Positive > Playful & Joyful',     score:97 },
      { taxonomy:'Sentiment > Positive > Wholesome',            score:95 },
      { taxonomy:'Sentiment > Social > Nurturing',              score:90 },
      { taxonomy:'Sentiment > Positive > Fun',                  score:86 },
    ],
    iab: [
      { taxonomy:'IAB25 > Family & Parenting > Children',       score:99 },
      { taxonomy:'IAB8 > Food & Drink > Kids Meals',            score:97 },
      { taxonomy:'IAB8 > Food & Drink > Grocery & Supermarket', score:90 },
      { taxonomy:'IAB25 > Family & Parenting > Family Life',    score:88 },
      { taxonomy:'IAB8 > Food & Drink > Healthy Kids Food',     score:85 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Child Safe',            score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
    ],
  },
  'Community & Local': {
    emotion: [
      { taxonomy:'Emotion > Social > Belonging',                score:93 },
      { taxonomy:'Emotion > Positive > Pride',                  score:91 },
      { taxonomy:'Emotion > Social > Togetherness',             score:88 },
      { taxonomy:'Emotion > Positive > Trust',                  score:85 },
      { taxonomy:'Emotion > Social > Connection',               score:82 },
      { taxonomy:'Emotion > Positive > Gratitude',              score:75 },
    ],
    location: [
      { taxonomy:'Location > Retail > Market > Local Market',   score:94 },
      { taxonomy:'Location > Retail > Grocery > Neighborhood Store', score:92 },
      { taxonomy:'Location > Community > Public > Local Square',score:85 },
      { taxonomy:'Location > Outdoor > Market > Street Market', score:80 },
      { taxonomy:'Location > Community > Event > Local Event',  score:74 },
    ],
    objects: [
      { taxonomy:'Objects > Food > Local > Artisan Products',   score:93 },
      { taxonomy:'Objects > Food > Fresh > Local Produce',      score:91 },
      { taxonomy:'Objects > People > Community > Neighbours',   score:88 },
      { taxonomy:'Objects > Retail > Signage > Local Brand',    score:82 },
      { taxonomy:'Objects > Food > Fresh > Seasonal & Regional',score:76 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Social > Community-Driven',       score:97 },
      { taxonomy:'Sentiment > Positive > Trustworthy',          score:95 },
      { taxonomy:'Sentiment > Positive > Authentic',            score:92 },
      { taxonomy:'Sentiment > Social > Inclusive',              score:88 },
      { taxonomy:'Sentiment > Positive > Proud',                score:83 },
    ],
    iab: [
      { taxonomy:'IAB8 > Food & Drink > Grocery & Supermarket', score:93 },
      { taxonomy:'IAB8 > Food & Drink > Local & Artisan',       score:91 },
      { taxonomy:'IAB10 > Community & Society > Local Community',score:88 },
      { taxonomy:'IAB8 > Food & Drink > Organic & Natural',     score:80 },
      { taxonomy:'IAB6 > Environment > Sustainability',         score:72 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
      { taxonomy:'Brand Safety > Safe > Clean Language',        score:100 },
    ],
  },
  'Seasonal Celebrations': {
    emotion: [
      { taxonomy:'Emotion > Social > Celebration',              score:96 },
      { taxonomy:'Emotion > Positive > Joy',                    score:95 },
      { taxonomy:'Emotion > Positive > Nostalgia',              score:91 },
      { taxonomy:'Emotion > Social > Togetherness',             score:89 },
      { taxonomy:'Emotion > Positive > Anticipation',           score:85 },
      { taxonomy:'Emotion > Positive > Warmth',                 score:82 },
    ],
    location: [
      { taxonomy:'Location > Domestic > Interior > Dining Room',score:95 },
      { taxonomy:'Location > Domestic > Interior > Kitchen',    score:92 },
      { taxonomy:'Location > Retail > Grocery > Seasonal Aisle',score:88 },
      { taxonomy:'Location > Domestic > Exterior > Garden',     score:80 },
      { taxonomy:'Location > Community > Event > Seasonal Event',score:72 },
    ],
    objects: [
      { taxonomy:'Objects > Food > Seasonal > Holiday Feast',   score:97 },
      { taxonomy:'Objects > Food > Baking > Seasonal Treats',   score:94 },
      { taxonomy:'Objects > Decor > Seasonal > Holiday Decor',  score:90 },
      { taxonomy:'Objects > Kitchenware > Tableware > Holiday Set', score:85 },
      { taxonomy:'Objects > Food > Fresh > Seasonal Produce',   score:82 },
      { taxonomy:'Objects > Food > Packaged > Seasonal Range',  score:76 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Social > Celebratory',            score:98 },
      { taxonomy:'Sentiment > Positive > Joyful & Festive',     score:96 },
      { taxonomy:'Sentiment > Social > Family-Oriented',        score:93 },
      { taxonomy:'Sentiment > Positive > Nostalgic',            score:88 },
      { taxonomy:'Sentiment > Positive > Warm & Welcoming',     score:85 },
    ],
    iab: [
      { taxonomy:'IAB8 > Food & Drink > Seasonal Cooking',      score:97 },
      { taxonomy:'IAB25 > Family & Parenting > Holidays',       score:96 },
      { taxonomy:'IAB8 > Food & Drink > Grocery & Supermarket', score:92 },
      { taxonomy:'IAB8 > Food & Drink > Entertaining at Home',  score:88 },
      { taxonomy:'IAB8 > Food & Drink > Baking',                score:84 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
      { taxonomy:'Brand Safety > Safe > Clean Language',        score:100 },
    ],
  },
};

function mp2GetMomentTaxonomy(momentName, tab) {
  var data = MP2_MOMENT_TAXONOMIES[momentName];
  if (data && data[tab]) return data[tab];
  // Fallback to global TX_MOMENT_DATA
  return TX_MOMENT_DATA[tab] || [];
}

// ── Refined stats store ───────────────────────────────────────────────────────
var mp2RefinedStats    = {}; // { momentName: { inventory, cpm, impM } }
var mp2SelectedMoments = {}; // { momentName: true }
var mp2MomentType      = 'ads';  // 'ads' | 'organic'

// ── Moments filter state ──────────────────────────────────────────────────────
var mp2MfScore         = 'all';  // 'all' | 'high' | 'standard'
var mp2MfChannels      = [];     // selected channel names; [] = all
var mp2MfCpmMin        = 0;
var mp2MfCpmMax        = 50;
var mp2MfTypes         = [];     // [] = all; items: 'Live','VOD'
var mp2MfPlatforms     = [];     // [] = all; items: 'Roku','Vizio','Pluto'
var mp2MfPanelOpen     = false;
var mp2MfAccOpen       = { score:true, channel:false, cpm:false, type:false, platform:false };

// ── Refine modal ──────────────────────────────────────────────────────────────
var mp2ModalRefinements = {}; // { 'tab::taxonomy': 'up'|'down' }
var mp2ModalCurrentTab  = 'emotion';
var mp2ModalName = '';

function mp2InjectRefineStyles() {
  if (document.getElementById('mp2-refine-styles')) return;
  var s = document.createElement('style');
  s.id = 'mp2-refine-styles';
  s.textContent = [
    '.mp2-ref-row{display:flex;align-items:center;gap:10px;padding:8px 16px;border-bottom:1px solid var(--border)}',
    '.mp2-ref-row:last-child{border-bottom:none}',
    '.mp2-ref-row:hover{background:var(--bg)}',
    '.mp2-thumb{width:26px;height:26px;border-radius:6px;border:1px solid var(--border-md);background:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;transition:background .12s,border-color .12s;flex-shrink:0;line-height:1}',
    '.mp2-thumb:hover{background:var(--bg)}',
    '.mp2-thumb--up.mp2-thumb--act{background:#f0fdf4;border-color:#86efac}',
    '.mp2-thumb--down.mp2-thumb--act{background:#fff1f2;border-color:#fca5a5}',
    '.mp2-rchip{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 6px 0 8px;border-radius:20px;font-size:11px;max-width:200px}',
    '.mp2-rchip--up{background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d}',
    '.mp2-rchip--down{background:#fff1f2;border:1px solid #fecaca;color:#b91c1c}',
    '.mp2-rchip-x{display:flex;align-items:center;justify-content:center;width:14px;height:14px;border:none;background:none;cursor:pointer;color:inherit;opacity:.6;padding:0;flex-shrink:0;border-radius:50%}',
    '.mp2-rchip-x:hover{opacity:1}',
    '.mp2-ref-section-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px}',
    '.mp2-ref-section-label--up{color:#15803d}',
    '.mp2-ref-section-label--down{color:#b91c1c}',
    '@keyframes mp2KpiFlash{0%{color:var(--accent);transform:scale(1.12)}60%{color:var(--accent)}100%{color:var(--text);transform:scale(1)}}',
    '@keyframes mp2KpiResetFlash{0%{opacity:1}40%{opacity:.2}100%{opacity:1}}',
    '.mp2-kpi-flash{animation:mp2KpiFlash .55s cubic-bezier(.22,1,.36,1) both}',
    '.mp2-kpi-reset-flash{animation:mp2KpiResetFlash .35s ease-in-out both}',
    '.mp2-kpi-reset-btn{flex-shrink:0;margin-left:6px;align-self:flex-end;margin-bottom:1px;width:20px;height:20px;border:none;background:none;cursor:pointer;color:var(--faint);display:flex;align-items:center;justify-content:center;border-radius:50%;transition:color .12s,background .12s;padding:0}',
    '.mp2-kpi-reset-btn:hover{color:var(--text);background:var(--bg)}',
    '.mp2-ch-wrap:hover .mp2-ch-hover-tt{display:block!important}',
  ].join('');
  document.head.appendChild(s);
}

function mp2OpenMomentModal(name, score, assets) {
  if (document.getElementById('tx-moment-modal')) return;
  mp2InjectRefineStyles();
  mp2ModalRefinements = {};
  mp2ModalCurrentTab  = 'emotion';
  mp2ModalName        = name;

  var tabsHtml = TX_MODAL_TABS.map(function(t) {
    return '<div class="tx-mtab' + (t.id === 'emotion' ? ' tx-mtab--act' : '') + '" id="tx-mtab-' + t.id + '" onclick="mp2RefineTab(\'' + t.id + '\')">' + t.label + '</div>';
  }).join('');

  var modal = document.createElement('div');
  modal.id = 'tx-moment-modal';
  modal.className = 'tx-modal-overlay';
  modal.innerHTML =
    '<div class="tx-modal" onclick="event.stopPropagation()" style="width:820px;max-width:calc(100vw - 32px)">'

    // Header
    + '<div class="tx-modal-header">'
    +   '<div>'
    +     '<div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);margin-bottom:3px">Refine Moment</div>'
    +     '<div class="tx-modal-title">' + name + '</div>'
    +   '</div>'
    +   '<button class="tx-modal-close" onclick="txCloseMomentModal()">'
    +     '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    +   '</button>'
    + '</div>'

    // Body — 2 columns, fixed height = 10 rows (~48px each) + tab nav (~42px)
    + '<div style="display:grid;grid-template-columns:1fr 220px;height:520px;overflow:hidden;border-bottom:1px solid var(--border)">'

    //   Left: tab nav + taxonomy list
    +   '<div style="display:flex;flex-direction:column;min-height:0;border-right:1px solid var(--border)">'
    +     '<div class="tx-mtabs-nav">' + tabsHtml + '</div>'
    +     '<div style="flex:1;overflow-y:auto;min-height:0" id="mp2-refine-body"></div>'
    +   '</div>'

    //   Right: refinements panel
    +   '<div style="display:flex;flex-direction:column;padding:14px;overflow-y:auto;gap:0">'
    +     '<div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);margin-bottom:10px">Your Refinements</div>'
    +     '<div id="mp2-refine-chips-empty" style="font-size:12px;color:var(--faint);text-align:center;padding:20px 0;line-height:1.7">Rate taxonomies<br>to refine this moment</div>'
    +     '<div id="mp2-refine-chips" style="display:none"></div>'
    +   '</div>'
    + '</div>'

    // Footer
    + '<div style="padding:12px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0">'
    +   '<button onclick="mp2ResetRefinements()" style="font-size:12px;font-family:inherit;border:none;background:none;color:var(--faint);cursor:pointer;padding:4px 8px;border-radius:6px;transition:color .12s" onmouseenter="this.style.color=\'var(--text)\'" onmouseleave="this.style.color=\'var(--faint)\'">Reset all</button>'
    +   '<button onclick="mp2SubmitRefinements(\'' + name.replace(/'/g, "\\'") + '\',' + score + ',' + assets + ')" style="height:34px;padding:0 18px;font-size:12px;font-weight:500;font-family:inherit;background:var(--accent);color:#fff;border:none;border-radius:8px;cursor:pointer;transition:opacity .13s" onmouseenter="this.style.opacity=\'.88\'" onmouseleave="this.style.opacity=\'1\'">Apply Refinement</button>'
    + '</div>'

    + '</div>';

  modal.addEventListener('click', txCloseMomentModal);
  document.body.appendChild(modal);
  setTimeout(function() {
    modal.classList.add('tx-modal-overlay--in');
    mp2RefineTab('emotion');
  }, 10);
}

function mp2RefineTab(tab) {
  mp2ModalCurrentTab = tab;
  TX_MODAL_TABS.forEach(function(t) {
    var el = document.getElementById('tx-mtab-' + t.id);
    if (el) el.className = 'tx-mtab' + (t.id === tab ? ' tx-mtab--act' : '');
  });
  var rows = mp2GetMomentTaxonomy(mp2ModalName, tab).slice().sort(function(a, b) { return b.score - a.score; });
  var body = document.getElementById('mp2-refine-body');
  if (!body) return;
  body.innerHTML = rows.map(function(r) {
    var key   = tab + '::' + r.taxonomy;
    var state = mp2ModalRefinements[key] || '';
    return '<div class="mp2-ref-row">'
      + '<div style="flex:1;min-width:0">'
      +   '<div style="font-size:12px;font-weight:500;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + r.taxonomy + '</div>'
      + '</div>'
      + '<div style="flex-shrink:0">' + (r.score >= 70 ? '<span style="background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;border-radius:20px;padding:1px 7px;font-size:9px;font-weight:700">High Match</span>' : '<span style="background:#fffbeb;border:1px solid #fde68a;color:#d97706;border-radius:20px;padding:1px 7px;font-size:9px;font-weight:700">Standard Match</span>') + '</div>'
      + '<button class="mp2-thumb mp2-thumb--up' + (state === 'up' ? ' mp2-thumb--act' : '') + '" onclick="mp2ToggleRefinement(\'' + tab + '\',\'' + r.taxonomy.replace(/'/g, "\\'") + '\',\'up\')" title="Boost"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg></button>'
      + '<button class="mp2-thumb mp2-thumb--down' + (state === 'down' ? ' mp2-thumb--act' : '') + '" onclick="mp2ToggleRefinement(\'' + tab + '\',\'' + r.taxonomy.replace(/'/g, "\\'") + '\',\'down\')" title="Exclude"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg></button>'
      + '</div>';
  }).join('');
}

function mp2ToggleRefinement(tab, taxonomy, dir) {
  var key = tab + '::' + taxonomy;
  mp2ModalRefinements[key] = (mp2ModalRefinements[key] === dir) ? '' : dir;
  mp2RefineTab(tab);
  mp2RenderRefineChips();
}

function mp2RenderRefineChips() {
  var empty   = document.getElementById('mp2-refine-chips-empty');
  var content = document.getElementById('mp2-refine-chips');
  if (!empty || !content) return;

  var ups   = [];
  var downs = [];
  Object.keys(mp2ModalRefinements).forEach(function(key) {
    var val = mp2ModalRefinements[key];
    if (!val) return;
    var parts    = key.split('::');
    var tab      = parts[0];
    var taxonomy = parts.slice(1).join('::');
    var segs     = taxonomy.split('>').map(function(s) { return s.trim(); });
    var chipLabel = segs.length > 1 ? segs[0] + ' › ' + segs[segs.length - 1] : segs[0];
    var entry    = { key: key, leaf: chipLabel };
    if (val === 'up')   ups.push(entry);
    else                downs.push(entry);
  });

  if (!ups.length && !downs.length) {
    empty.style.display   = '';
    content.style.display = 'none';
    content.innerHTML     = '';
    return;
  }
  empty.style.display   = 'none';
  content.style.display = '';

  var renderGroup = function(items, cls, sectionCls, icon) {
    if (!items.length) return '';
    return '<div style="margin-bottom:12px">'
      + '<div class="mp2-ref-section-label mp2-ref-section-label--' + sectionCls + '">' + icon + ' ' + (sectionCls === 'up' ? 'Boost' : 'Exclude') + '</div>'
      + '<div style="display:flex;flex-wrap:wrap;gap:5px">'
      + items.map(function(e) {
          return '<div class="mp2-rchip mp2-rchip--' + cls + '">'
            + '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + e.leaf + '</span>'
            + '<button class="mp2-rchip-x" onclick="mp2RemoveRefinement(\'' + e.key.replace(/'/g, "\\'") + '\')" title="Remove">'
            + '<svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1L1 7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>'
            + '</button>'
            + '</div>';
        }).join('')
      + '</div>'
      + '</div>';
  };

  var icoUp   = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>';
  var icoDn   = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>';
  content.innerHTML = renderGroup(ups, 'up', 'up', icoUp) + renderGroup(downs, 'down', 'down', icoDn);
}

function mp2RemoveRefinement(key) {
  delete mp2ModalRefinements[key];
  mp2RefineTab(mp2ModalCurrentTab);
  mp2RenderRefineChips();
}

function mp2ResetRefinements() {
  mp2ModalRefinements = {};
  mp2RefineTab(mp2ModalCurrentTab);
  mp2RenderRefineChips();
}

function mp2SubmitRefinements(name, score, assets) {
  var seed    = name.split('').reduce(function(a, ch) { return a + ch.charCodeAt(0); }, 0);
  var baseCpm = 12 + ((score + seed) % 24);
  var baseImp = 1.5 + ((seed * 3 + score * 7) % 85) / 10;

  var boosts   = Object.values(mp2ModalRefinements).filter(function(v) { return v === 'up'; }).length;
  var excludes = Object.values(mp2ModalRefinements).filter(function(v) { return v === 'down'; }).length;

  if (!boosts && !excludes) { txCloseMomentModal(); return; }

  var invFactor = 1 + boosts * 0.07 - excludes * 0.09;
  var cpmFactor = 1 - boosts * 0.025 + excludes * 0.04;
  var impFactor = 1 + boosts * 0.09  - excludes * 0.11;

  mp2RefinedStats[name] = {
    inventory: Math.round(assets * Math.max(invFactor, 0.1)),
    cpm:       Math.round(Math.max(baseCpm * cpmFactor, 5)),
    impM:      Math.max(baseImp * impFactor, 0.1).toFixed(1),
    boosts:    boosts,
    excludes:  excludes
  };

  txCloseMomentModal();
  mp2RenderMoments();
  // Animate updated KPI values
  var safeId = name.replace(/[^a-zA-Z0-9]/g, '-');
  setTimeout(function() {
    ['mp2-kv-inv-', 'mp2-kv-imp-', 'mp2-kv-cpm-'].forEach(function(prefix) {
      var el = document.getElementById(prefix + safeId);
      if (!el) return;
      el.classList.remove('mp2-kpi-flash');
      void el.offsetWidth; // force reflow to restart animation
      el.classList.add('mp2-kpi-flash');
    });
  }, 30);
}

function mp2SetMomentType(type) {
  if (mp2MomentType === type) return;
  mp2MomentType = type;

  // Update toggle button styles immediately (no wait for full re-render)
  var segBase = 'border:none;padding:4px 12px;border-radius:16px;font-size:11px;font-weight:500;font-family:inherit;cursor:pointer;transition:background .12s,color .12s,box-shadow .12s;white-space:nowrap;line-height:1.4';
  var segAct  = segBase + ';background:var(--surface);color:var(--text);box-shadow:0 1px 3px rgba(0,0,0,.1)';
  var segOff  = segBase + ';background:transparent;color:var(--faint)';
  ['ads','organic','live'].forEach(function(t) {
    var btn = document.querySelector('[onclick="mp2SetMomentType(\'' + t + '\')"]');
    if (btn) btn.style.cssText = t === type ? segAct : segOff;
  });

  // Show skeleton loader in scroll area
  var scrollWrap = document.getElementById('mp2-moments-scroll');
  if (scrollWrap) scrollWrap.innerHTML = mp2MomentSkeletonHtml(type);

  // After brief delay, full re-render with new supply
  setTimeout(mp2RenderMoments, 520);
}

function mp2MomentSkeletonHtml(type) {
  var n = type === 'live' ? 6 : type === 'ads' ? 10 : 16;
  var GRID = 'display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding-bottom:16px';
  var card =
    '<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;overflow:hidden">'
    + '<div style="width:100%;padding-top:44%;position:relative"><div class="mp2-skel" style="position:absolute;inset:0;border-radius:0"></div></div>'
    + '<div style="padding:9px 10px 11px">'
    +   '<div class="mp2-skel" style="height:11px;width:65%;margin-bottom:14px"></div>'
    +   '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px">'
    +     '<div class="mp2-skel" style="height:28px"></div>'
    +     '<div class="mp2-skel" style="height:28px"></div>'
    +     '<div class="mp2-skel" style="height:28px"></div>'
    +   '</div>'
    +   '<div class="mp2-skel" style="height:26px;border-radius:6px"></div>'
    + '</div>'
    + '</div>';
  var cards = '';
  for (var i = 0; i < n; i++) cards += card;
  return '<div style="' + GRID + '">' + cards + '</div>';
}

// ── Moments filter panel ──────────────────────────────────────────────────────
var MP2_MF_ALL_CHANNELS  = ['NBC','Fox','ABC','CBS','HBO','Peacock','Bravo','Discovery','ESPN','TNT','TBS','AMC'];
var MP2_MF_ALL_PLATFORMS = ['Roku','Vizio','Pluto'];

function mp2ToggleMfPanel() {
  if (mp2MfPanelOpen) { mp2CloseMfPanel(); } else { mp2OpenMfPanel(); }
}

function mp2OpenMfPanel() {
  mp2MfPanelOpen = true;
  var btn = document.getElementById('mp2-mf-btn');
  if (!btn) return;

  var existing = document.getElementById('mp2-mf-panel');
  if (existing) existing.remove();

  var panel = document.createElement('div');
  panel.id = 'mp2-mf-panel';
  panel.style.cssText = 'position:fixed;width:264px;background:var(--surface);border:1px solid var(--border-md,var(--border));border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,.14);padding:14px;z-index:9999;display:flex;flex-direction:column;max-height:520px;overflow:hidden';
  document.body.appendChild(panel);

  var r = btn.getBoundingClientRect();
  panel.style.top   = (r.bottom + 4) + 'px';
  panel.style.right = (window.innerWidth - r.right) + 'px';
  panel.style.left  = 'auto';
  panel.style.maxHeight = (window.innerHeight - r.bottom - 20) + 'px';

  mp2BuildMfPanel(panel);

  setTimeout(function() {
    document.addEventListener('click', function _mfOut(e) {
      var p = document.getElementById('mp2-mf-panel');
      var b = document.getElementById('mp2-mf-btn');
      if (p && !p.contains(e.target) && b && !b.contains(e.target)) {
        mp2CloseMfPanel();
        document.removeEventListener('click', _mfOut);
      }
    });
  }, 0);
}

function mp2CloseMfPanel() {
  mp2MfPanelOpen = false;
  var panel = document.getElementById('mp2-mf-panel');
  if (panel) panel.remove();
}

function mp2BuildMfPanel(panel) {
  if (!panel) panel = document.getElementById('mp2-mf-panel');
  if (!panel) return;

  var activeCount = (mp2MfScore !== 'all' ? 1 : 0) + mp2MfChannels.length + (mp2MfCpmMin > 0 || mp2MfCpmMax < 50 ? 1 : 0) + mp2MfPlatforms.length;

  function acc(key, label, bodyHtml) {
    var open = !!mp2MfAccOpen[key];
    return '<div style="border-bottom:1px solid var(--border)">'
      + '<div onclick="mp2ToggleMfAcc(\'' + key + '\')" style="display:flex;align-items:center;justify-content:space-between;padding:9px 0;cursor:pointer;user-select:none">'
      +   '<span style="font-size:11px;font-weight:600;color:var(--text)">' + label + '</span>'
      +   '<svg style="transform:rotate(' + (open ? '180' : '0') + 'deg);transition:transform .15s;flex-shrink:0" id="mp2-mf-chev-' + key + '" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      + '</div>'
      + '<div id="mp2-mf-body-' + key + '" style="' + (open ? 'padding-bottom:10px' : 'display:none') + '">'
      +   bodyHtml
      + '</div>'
      + '</div>';
  }

  // Match Score — radio group
  var scoreBody = ['all','high','standard'].map(function(v) {
    var lbl = v === 'all' ? 'All' : v === 'high' ? 'High Match' : 'Standard Match';
    return '<label style="display:flex;align-items:center;gap:7px;padding:3px 0;cursor:pointer;font-size:12px;color:var(--text)">'
      + '<input type="radio" name="mp2mfscore" value="' + v + '"' + (mp2MfScore === v ? ' checked' : '') + ' onchange="mp2MfSetScore(\'' + v + '\')" style="accent-color:var(--accent);cursor:pointer">'
      + lbl + '</label>';
  }).join('');

  // Channel — search + checkboxes
  var channelBody =
    '<input id="mp2-mf-ch-search" class="inv-fp-search" placeholder="Search…" oninput="mp2MfSearch(this,\'channel\')" style="margin-bottom:6px">'
    + '<div id="mp2-mf-opts-channel" style="max-height:120px;overflow-y:auto">'
    + '<label style="display:flex;align-items:center;gap:7px;padding:3px 0;cursor:pointer;font-size:12px;color:var(--text)">'
    +   '<input type="checkbox"' + (mp2MfChannels.length === 0 ? ' checked' : '') + ' onchange="mp2MfSetAllChannels()" style="accent-color:var(--accent);cursor:pointer">All</label>'
    + MP2_MF_ALL_CHANNELS.map(function(ch) {
        return '<label class="mp2-mf-ch-opt" style="display:flex;align-items:center;gap:7px;padding:3px 0;cursor:pointer;font-size:12px;color:var(--text)">'
          + '<input type="checkbox"' + (mp2MfChannels.indexOf(ch) >= 0 ? ' checked' : '') + ' onchange="mp2MfToggleCh(\'' + ch + '\',this.checked)" style="accent-color:var(--accent);cursor:pointer">'
          + ch + '</label>';
      }).join('')
    + '</div>';

  // CPM dual-thumb slider
  var pctMin = (mp2MfCpmMin / 50) * 100;
  var pctMax = (mp2MfCpmMax / 50) * 100;
  var cpmBody =
    '<div style="padding:4px 0 10px">'
    + '<div style="display:flex;justify-content:space-between;margin-bottom:14px">'
    +   '<span style="font-size:11px;color:var(--muted)">CPM Range</span>'
    +   '<span id="mp2-mf-cpm-label" style="font-size:11px;font-weight:600;color:var(--text)">$' + mp2MfCpmMin + ' – $' + mp2MfCpmMax + '</span>'
    + '</div>'
    + '<div class="mp2-dual-range" style="position:relative;height:18px;margin:0 2px">'
    +   '<div style="position:absolute;top:50%;left:0;right:0;height:2px;background:var(--border);border-radius:2px;transform:translateY(-50%);z-index:0"></div>'
    +   '<div id="mp2-cpm-fill" style="position:absolute;top:50%;left:' + pctMin + '%;width:' + (pctMax - pctMin) + '%;height:2px;background:var(--accent);border-radius:2px;transform:translateY(-50%);z-index:1;pointer-events:none"></div>'
    +   '<input id="mp2-cpm-min" type="range" min="0" max="50" value="' + mp2MfCpmMin + '" oninput="mp2MfDualSlider(\'min\',this.value)" onchange="mp2MfCpmCommit()" style="position:absolute;inset:0;width:100%;appearance:none;-webkit-appearance:none;background:transparent;margin:0;z-index:2;pointer-events:none">'
    +   '<input id="mp2-cpm-max" type="range" min="0" max="50" value="' + mp2MfCpmMax + '" oninput="mp2MfDualSlider(\'max\',this.value)" onchange="mp2MfCpmCommit()" style="position:absolute;inset:0;width:100%;appearance:none;-webkit-appearance:none;background:transparent;margin:0;z-index:2;pointer-events:none">'
    + '</div>'
    + '<div style="display:flex;justify-content:space-between;margin-top:6px"><span style="font-size:10px;color:var(--faint)">$0</span><span style="font-size:10px;color:var(--faint)">$50</span></div>'
    + '</div>';

  // Platform checkboxes
  var platformBody =
    '<div style="display:flex;flex-direction:column;gap:2px">'
    + '<label style="display:flex;align-items:center;gap:7px;padding:3px 0;cursor:pointer;font-size:12px;color:var(--text)">'
    +   '<input type="checkbox"' + (mp2MfPlatforms.length === 0 ? ' checked' : '') + ' onchange="mp2MfSetAllPlatforms()" style="accent-color:var(--accent);cursor:pointer">All</label>'
    + MP2_MF_ALL_PLATFORMS.map(function(p) {
        return '<label style="display:flex;align-items:center;gap:7px;padding:3px 0;cursor:pointer;font-size:12px;color:var(--text)">'
          + '<input type="checkbox"' + (mp2MfPlatforms.indexOf(p) >= 0 ? ' checked' : '') + ' onchange="mp2MfTogglePlatform(\'' + p + '\',this.checked)" style="accent-color:var(--accent);cursor:pointer">'
          + p + '</label>';
      }).join('')
    + '</div>';

  panel.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-shrink:0">'
    +   '<span style="font-size:13px;font-weight:600;color:var(--text)">Filters</span>'
    +   '<div style="display:flex;gap:10px;align-items:center">'
    +     (activeCount > 0 ? '<span style="font-size:11px;color:var(--faint);cursor:pointer" onclick="mp2MfClearAll()">Clear all</span>' : '')
    +     '<button onclick="mp2CloseMfPanel()" style="background:none;border:none;cursor:pointer;color:var(--faint);font-size:20px;line-height:1;padding:0 2px">×</button>'
    +   '</div>'
    + '</div>'
    + '<div style="flex:1;overflow-y:auto;min-height:0">'
    +   acc('score',    'Match Score', scoreBody)
    +   acc('channel',  'Channel',     channelBody)
    +   acc('cpm',      'CPM',         cpmBody)
    +   acc('platform', 'Platform',    platformBody)
    + '</div>';
}

function mp2ToggleMfAcc(key) {
  mp2MfAccOpen[key] = !mp2MfAccOpen[key];
  var body = document.getElementById('mp2-mf-body-' + key);
  var chev = document.getElementById('mp2-mf-chev-' + key);
  if (body) { body.style.display = mp2MfAccOpen[key] ? '' : 'none'; if (mp2MfAccOpen[key]) body.style.paddingBottom = '10px'; }
  if (chev) chev.style.transform = 'rotate(' + (mp2MfAccOpen[key] ? 180 : 0) + 'deg)';
}

function mp2MfSearch(input, type) {
  var q = input.value.toLowerCase();
  if (type === 'channel') {
    document.querySelectorAll('.mp2-mf-ch-opt').forEach(function(el) {
      el.style.display = el.querySelector('input').value.toLowerCase().indexOf(q) >= 0 || el.textContent.trim().toLowerCase().indexOf(q) >= 0 ? '' : 'none';
    });
  }
}

function mp2MfSetScore(val) {
  mp2MfScore = val;
  mp2RenderMoments();
  mp2BuildMfPanel();
}

function mp2MfToggleCh(ch, checked) {
  if (checked && mp2MfChannels.indexOf(ch) < 0) mp2MfChannels.push(ch);
  else if (!checked) mp2MfChannels = mp2MfChannels.filter(function(v){ return v !== ch; });
  mp2RenderMoments();
  mp2BuildMfPanel();
}
function mp2MfSetAllChannels() { mp2MfChannels = []; mp2RenderMoments(); mp2BuildMfPanel(); }

function mp2MfDualSlider(which, val) {
  val = parseInt(val) || 0;
  if (which === 'min') {
    mp2MfCpmMin = Math.min(val, mp2MfCpmMax);
    var inp = document.getElementById('mp2-cpm-min');
    if (inp) inp.value = mp2MfCpmMin;
  } else {
    mp2MfCpmMax = Math.max(val, mp2MfCpmMin);
    var inp = document.getElementById('mp2-cpm-max');
    if (inp) inp.value = mp2MfCpmMax;
  }
  var lbl  = document.getElementById('mp2-mf-cpm-label');
  var fill = document.getElementById('mp2-cpm-fill');
  if (lbl)  lbl.textContent = '$' + mp2MfCpmMin + ' – $' + mp2MfCpmMax;
  if (fill) { fill.style.left = (mp2MfCpmMin / 50 * 100) + '%'; fill.style.width = ((mp2MfCpmMax - mp2MfCpmMin) / 50 * 100) + '%'; }
}
function mp2MfCpmCommit() {
  mp2RenderMoments();
}

function mp2MfToggleType(t, checked) {
  if (checked && mp2MfTypes.indexOf(t) < 0) mp2MfTypes.push(t);
  else if (!checked) mp2MfTypes = mp2MfTypes.filter(function(v){ return v !== t; });
  mp2RenderMoments(); mp2BuildMfPanel();
}
function mp2MfSetAllTypes() { mp2MfTypes = []; mp2RenderMoments(); mp2BuildMfPanel(); }

function mp2MfTogglePlatform(p, checked) {
  if (checked && mp2MfPlatforms.indexOf(p) < 0) mp2MfPlatforms.push(p);
  else if (!checked) mp2MfPlatforms = mp2MfPlatforms.filter(function(v){ return v !== p; });
  mp2RenderMoments(); mp2BuildMfPanel();
}
function mp2MfSetAllPlatforms() { mp2MfPlatforms = []; mp2RenderMoments(); mp2BuildMfPanel(); }

function mp2MfClearAll() {
  mp2MfScore = 'all'; mp2MfChannels = []; mp2MfCpmMin = 0; mp2MfCpmMax = 50; mp2MfTypes = []; mp2MfPlatforms = [];
  mp2RenderMoments(); mp2BuildMfPanel();
}

function mp2ToggleMomentCard(name) {
  if (mp2SelectedMoments[name]) {
    delete mp2SelectedMoments[name];
  } else {
    mp2SelectedMoments[name] = true;
    if (!inv2MediaPlanVisible) inv2MediaPlanVisible = true;
  }
  var safeId = name.replace(/[^a-zA-Z0-9]/g, '-');
  var card = document.getElementById('mp2-mcard-' + safeId);
  if (card) card.classList.toggle('mp2-mcard--sel', !!mp2SelectedMoments[name]);
  var cb = document.getElementById('mp2-cb-' + safeId);
  if (cb) cb.checked = !!mp2SelectedMoments[name];
  mp2UpdateMomentMpBadge();
  mp2RenderMomentsMediaPlan();
}

function mp2UpdateMomentMpBadge() {
  var badge = document.getElementById('mp2-mp-badge');
  var count = Object.keys(mp2SelectedMoments).length;
  if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'inline' : 'none'; }
  var btn = document.getElementById('mp2-moments-mp-btn');
  if (btn) btn.className = 'inv-view-btn' + (inv2MediaPlanVisible ? ' inv-view-btn--act' : '');
}

function mp2ToggleMomentMediaPlan() {
  inv2MediaPlanVisible = !inv2MediaPlanVisible;
  mp2UpdateMomentMpBadge();
  mp2RenderMomentsMediaPlan();
}

function mp2RenderMomentsMediaPlan() {
  var panel = document.getElementById('inv-media-plan');
  if (!panel) return;
  mp2UpdateMomentMpBadge();
  if (!inv2MediaPlanVisible) { panel.style.display = 'none'; return; }
  panel.style.display = 'flex';
  var names = Object.keys(mp2SelectedMoments).filter(function(n) { return mp2SelectedMoments[n]; });
  if (names.length === 0) {
    panel.innerHTML =
      '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:12px;flex-shrink:0">Media Plan</div>'
      + '<div style="flex:1;display:flex;align-items:center;justify-content:center;text-align:center;color:var(--faint);font-size:12px;padding:20px">Click a moment card to add it to your media plan</div>';
    return;
  }
  var totalInv = 0; var totalImpM = 0;
  names.forEach(function(n) {
    var cat = TX_CATEGORIES.filter(function(c) { return c.name === n; })[0];
    if (!cat) return;
    var refined = mp2RefinedStats[n];
    var seed = n.split('').reduce(function(a, ch) { return a + ch.charCodeAt(0); }, 0);
    totalInv  += refined ? refined.inventory : cat.assets;
    totalImpM += refined ? parseFloat(refined.impM) : (1.5 + ((seed * 3 + cat.score * 7) % 85) / 10);
  });
  panel.innerHTML =
    '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0">'
    + '<span>Media Plan <span style="font-size:10px;background:var(--accent);color:#fff;border-radius:20px;padding:1px 7px;margin-left:4px">' + names.length + '</span></span>'
    + '<span style="font-size:10px;color:var(--faint);cursor:pointer;font-weight:400" onclick="mp2ClearMomentSelection()">Clear all</span>'
    + '</div>'
    + '<div style="flex:1;overflow-y:auto;min-height:0;display:flex;flex-direction:column;gap:7px">'
    + names.map(function(n) {
        var planImgId = 'mp2-plan-img-' + n.replace(/[^a-zA-Z0-9]/g, '-');
        var cat = TX_CATEGORIES.filter(function(c) { return c.name === n; })[0] || {};
        var refined = mp2RefinedStats[n];
        var seed = n.split('').reduce(function(a, ch) { return a + ch.charCodeAt(0); }, 0);
        var inv  = refined ? refined.inventory : (cat.assets || 0);
        var impM = refined ? refined.impM : (1.5 + ((seed * 3 + (cat.score || 0) * 7) % 85) / 10).toFixed(1);
        return '<div style="display:flex;gap:8px;align-items:center;padding:8px;background:var(--bg);border-radius:8px;border:1px solid var(--border)">'
          + '<div id="' + planImgId + '" style="width:38px;height:22px;border-radius:3px;overflow:hidden;flex-shrink:0;background:var(--border);display:flex;align-items:center;justify-content:center">'
          +   '<svg width="10" height="10" viewBox="0 0 16 16" fill="none" style="opacity:.3"><rect x="1" y="4" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M11 7l4-2v6l-4-2V7z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>'
          + '</div>'
          + '<div style="flex:1;min-width:0">'
          +   '<div style="font-size:11px;font-weight:600;color:var(--text);line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + n + '</div>'
          +   '<div style="font-size:10px;color:var(--faint);margin-top:1px">' + inv.toLocaleString() + ' inv · ' + impM + 'M imp</div>'
          + '</div>'
          + '<span style="font-size:14px;color:var(--faint);cursor:pointer;flex-shrink:0;line-height:1" onclick="mp2ToggleMomentCard(\'' + n.replace(/'/g, "\\'") + '\')">×</span>'
          + '</div>';
      }).join('')
    + '</div>'
    + '<div style="border-top:1px solid var(--border);padding-top:11px;margin-top:8px;flex-shrink:0">'
    + '<div style="display:flex;justify-content:space-between;margin-bottom:4px">'
    +   '<span style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint)">Total Moments</span>'
    +   '<span style="font-size:13px;font-weight:700;color:var(--text)">' + names.length + '</span>'
    + '</div>'
    + '<div style="display:flex;justify-content:space-between;margin-bottom:10px">'
    +   '<span style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint)">Est. Impressions</span>'
    +   '<span style="font-size:12px;font-weight:700;color:var(--text)">' + totalImpM.toFixed(1) + 'M</span>'
    + '</div>'
    + '<button onclick="inv2SaveMediaPlan()" style="width:100%;height:34px;font-size:12px;font-weight:600;font-family:inherit;background:var(--accent);color:#fff;border:none;border-radius:8px;cursor:pointer;transition:opacity .13s" onmouseenter="this.style.opacity=\'.88\'" onmouseleave="this.style.opacity=\'1\'">Save Media Plan</button>'
    + '</div>';
  // Fetch thumbnails for plan items async
  names.forEach(function(n) {
    var imgDiv = document.getElementById('mp2-plan-img-' + n.replace(/[^a-zA-Z0-9]/g, '-'));
    if (!imgDiv) return;
    fetch('/api/unsplash?q=' + encodeURIComponent(n + ' tv show'))
      .then(function(r) { if (!r.ok) throw new Error(); return r.json(); })
      .then(function(data) {
        if (!data.thumb) return;
        var imgDiv2 = document.getElementById('mp2-plan-img-' + n.replace(/[^a-zA-Z0-9]/g, '-'));
        if (!imgDiv2) return;
        var img = new Image();
        img.onload = function() {
          imgDiv2.innerHTML = '';
          var el = document.createElement('img');
          el.src = data.thumb; el.style.cssText = 'width:100%;height:100%;object-fit:cover';
          imgDiv2.appendChild(el);
        };
        img.src = data.thumb;
      }).catch(function() {});
  });
}

function mp2ClearMomentSelection() {
  mp2SelectedMoments = {};
  mp2RenderMoments();
}

function mp2ResetCard(name) {
  // Flash-out animation on current values, then re-render
  var safeId = name.replace(/[^a-zA-Z0-9]/g, '-');
  ['mp2-kv-inv-', 'mp2-kv-imp-', 'mp2-kv-cpm-'].forEach(function(prefix) {
    var el = document.getElementById(prefix + safeId);
    if (el) el.classList.add('mp2-kpi-reset-flash');
  });
  setTimeout(function() {
    delete mp2RefinedStats[name];
    mp2RenderMoments();
  }, 320);
}

// ── Ad Analysis (v2 only) ─────────────────────────────────────────────────────

var txAdAnalysisJsonOpen = false;
var txAdModalIabHtml     = '';
var txAdModalCompHtml    = '';
var txAdModalObjectsHtml = '';
var txAdModalJsonStr     = '';

var TX_AD_FRAMES = [
  { time: '00:02',
    img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=480&h=270&fit=crop&q=80',
    objects: [{ n:'Grocery Store', c:100 }, { n:'Supermarket', c:100 }, { n:'Shelf', c:99 }, { n:'Produce', c:99 }, { n:'Vegetables', c:98 }, { n:'Indoors', c:100 }],
    boxes: [{ t:5,l:2,w:35,h:88 }, { t:5,l:40,w:35,h:88 }, { t:8,l:6,w:28,h:42 }] },
  { time: '00:08',
    img: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=480&h=270&fit=crop&q=80',
    objects: [{ n:'Fruit', c:100 }, { n:'Produce', c:99 }, { n:'Food', c:100 }, { n:'Market', c:97 }, { n:'Grocery Store', c:96 }, { n:'Colorful', c:94 }],
    boxes: [{ t:10,l:4,w:40,h:78 }, { t:10,l:48,w:24,h:50 }, { t:12,l:74,w:22,h:48 }] },
  { time: '00:13',
    img: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=480&h=270&fit=crop&q=80',
    objects: [{ n:'Woman', c:100 }, { n:'Adult', c:100 }, { n:'Shopping Cart', c:99 }, { n:'Smile', c:100 }, { n:'Happy', c:100 }, { n:'Portrait', c:100 }, { n:'Face', c:100 }],
    boxes: [{ t:3,l:24,w:52,h:90 }, { t:3,l:28,w:40,h:48 }, { t:55,l:18,w:60,h:40 }] },
  { time: '00:18',
    img: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=480&h=270&fit=crop&q=80',
    objects: [{ n:'Chicken', c:100 }, { n:'Meat', c:100 }, { n:'Poultry', c:99 }, { n:'Raw Food', c:98 }, { n:'Grocery Store', c:96 }, { n:'Package', c:97 }],
    boxes: [{ t:10,l:5,w:38,h:70 }, { t:10,l:46,w:38,h:70 }, { t:12,l:8,w:30,h:32 }, { t:12,l:50,w:30,h:32 }] },
  { time: '00:22',
    img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=480&h=270&fit=crop&q=80',
    objects: [{ n:'Cooking', c:100 }, { n:'Kitchen', c:99 }, { n:'Knife', c:97 }, { n:'Cutting Board', c:96 }, { n:'Vegetables', c:98 }, { n:'Meal Prep', c:94 }],
    boxes: [{ t:30,l:8,w:60,h:62 }, { t:32,l:10,w:28,h:20 }, { t:28,l:42,w:20,h:28 }] },
  { time: '00:27',
    img: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=480&h=270&fit=crop&q=80',
    objects: [{ n:'Family', c:100 }, { n:'Woman', c:100 }, { n:'Man', c:99 }, { n:'Child', c:98 }, { n:'Food', c:100 }, { n:'Meal', c:97 }, { n:'Happy', c:100 } ],
    boxes: [{ t:5,l:5,w:28,h:85 }, { t:5,l:36,w:28,h:85 }, { t:5,l:66,w:28,h:85 }, { t:48,l:18,w:62,h:38 }] }
];

var TX_AD_DATA = {
  video_id: 'KROGER_30s',
  duration_in_seconds: 30.089,
  type: 'mp4',
  fps: 23.976,
  ad_approval_data: {
    advertiser: 'Kroger',
    adomain: 'kroger.com',
    primary_language: 'English',
    brand_safety_100: {},
    brand_safety_75: {}
  },
  video_metadata: {
    iab_taxonomy: [
      { id:'140', name:'Grocery & Supermarket', confidence:0.92, count:21, screen_time:24.1, screen_time_percentage:0.801 },
      { id:'142', name:'Food & Drink',           confidence:0.85, count:14, screen_time:17.6, screen_time_percentage:0.585 },
      { id:'143', name:'Cooking',                confidence:0.76, count:9,  screen_time:11.3, screen_time_percentage:0.376 }
    ],
    garm_category: [],
    sentiment_analysis: [
      { id:'S1', name:'Mostly Positive', confidence:0.94, count:17, screen_time:21.4, screen_time_percentage:0.711 },
      { id:'S3', name:'Neutral',         confidence:0.88, count:5,  screen_time:6.2,  screen_time_percentage:0.206 }
    ]
  },
  total_scenes: 6,
  Scenes: [
    { scene:0, startTimecode:'00:00:00.000', endTimecode:'00:00:04.000', lengthInSeconds:4,  iab_taxonomy:[], garm_category:[], audio_transcript:'' },
    { scene:1, startTimecode:'00:00:04.000', endTimecode:'00:00:09.000', lengthInSeconds:5,  iab_taxonomy:[{id:'140',name:'Grocery & Supermarket',confidence:0.94,considered:[]}], garm_category:[] },
    { scene:2, startTimecode:'00:00:09.000', endTimecode:'00:00:14.000', lengthInSeconds:5,  iab_taxonomy:[{id:'142',name:'Food & Drink',confidence:0.88,considered:['Cooking','Recipes']}], garm_category:[] },
    { scene:3, startTimecode:'00:00:14.000', endTimecode:'00:00:20.000', lengthInSeconds:6,  iab_taxonomy:[{id:'140',name:'Grocery & Supermarket',confidence:0.96,considered:[]}], garm_category:[] },
    { scene:4, startTimecode:'00:00:20.000', endTimecode:'00:00:25.000', lengthInSeconds:5,  iab_taxonomy:[{id:'143',name:'Cooking',confidence:0.79,considered:['Food & Drink','Recipes & Meal Ideas']}], garm_category:[] },
    { scene:5, startTimecode:'00:00:25.000', endTimecode:'00:00:30.089', lengthInSeconds:5,  iab_taxonomy:[{id:'140',name:'Grocery & Supermarket',confidence:0.91,considered:['Food & Drink']}], garm_category:[], audio_transcript:'Fresh for everyone. Only at Kroger.' }
  ],
  metadata: {
    logos: ['Kroger', 'Simple Truth'],
    object_labels: [
      {Name:'Supermarket',Confidence:1},{Name:'Grocery_Store',Confidence:1},
      {Name:'Shelf',Confidence:1},{Name:'Food',Confidence:1},
      {Name:'Person',Confidence:1},{Name:'Woman',Confidence:1},
      {Name:'Adult',Confidence:1},{Name:'Face',Confidence:1},
      {Name:'Smile',Confidence:1},{Name:'Happy',Confidence:1},
      {Name:'Indoors',Confidence:1},{Name:'Shopping_Cart',Confidence:0.99},
      {Name:'Produce',Confidence:0.99},{Name:'Vegetables',Confidence:0.99},
      {Name:'Fruit',Confidence:0.98},{Name:'Meat',Confidence:0.97},
      {Name:'Chicken',Confidence:0.96},{Name:'Dairy',Confidence:0.95},
      {Name:'Bread',Confidence:0.94},{Name:'Package',Confidence:0.99},
      {Name:'Man',Confidence:0.98},{Name:'Child',Confidence:0.97},
      {Name:'Family',Confidence:0.96},{Name:'Portrait',Confidence:1},
      {Name:'Glasses',Confidence:0.88},{Name:'Coat',Confidence:0.85},
      {Name:'Bag',Confidence:0.91},{Name:'Refrigerator',Confidence:0.93},
      {Name:'Freezer_Section',Confidence:0.87},{Name:'Kitchen',Confidence:0.90},
      {Name:'Cooking',Confidence:0.88},{Name:'Pot',Confidence:0.84},
      {Name:'Knife',Confidence:0.81},{Name:'Alcohol',Confidence:0.68},{Name:'Cutting_Board',Confidence:0.83},
      {Name:'Salad',Confidence:0.86},{Name:'Bowl',Confidence:0.89},
      {Name:'Plate',Confidence:0.91},{Name:'Beverage',Confidence:0.87},
      {Name:'Bottle',Confidence:0.85},{Name:'Can',Confidence:0.82},
      {Name:'Advertisement',Confidence:0.90},{Name:'Logo',Confidence:0.95},
      {Name:'Solo_Performance',Confidence:0.88},{Name:'Photography',Confidence:1},
      {Name:'Mobile_Phone',Confidence:0.76},{Name:'Credit_Card',Confidence:0.72},
      {Name:'Sitting',Confidence:0.84},{Name:'Standing',Confidence:0.91},
      {Name:'Black_Hair',Confidence:0.93},{Name:'Flower',Confidence:0.78}
    ]
  }
};

var TX_AD_SENSITIVE_LABELS = ['Dynamite','Weapon','Gun','Grenade','Smoke','Violence','Drugs','Knife','Alcohol'];

function txToggleAdAnalysisJson() {} // legacy — no-op

function txCopyAdJson() {
  var pre = document.getElementById('tx-ad-modal-json-pre');
  if (!pre) return;
  try { navigator.clipboard.writeText(pre.textContent); } catch(e) {}
  var btn = document.getElementById('tx-ad-modal-copy-btn');
  if (btn) { btn.textContent = 'Copied!'; setTimeout(function(){ btn.textContent = 'Copy'; }, 1500); }
}

function txOpenAdModal(type, panelType) {
  var existing = document.getElementById('tx-ad-modal');
  if (existing) existing.remove();
  var title   = type === 'iab' ? 'IAB Taxonomies' : type === 'objects' ? 'Objects Detected' : 'Ad Compliance';
  var content = type === 'iab' ? txAdModalIabHtml : type === 'objects' ? txAdModalObjectsHtml : txAdModalCompHtml;
  var showJson = panelType === 'json';
  var showOd   = panelType === 'objects';
  var MHEAD = 'display:flex;align-items:center;padding:10px 16px;border-bottom:1px solid var(--border);flex-shrink:0;gap:6px';
  var IBTN  = 'display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border:1px solid var(--border);border-radius:6px;background:transparent;cursor:pointer;color:var(--muted);transition:background .15s,color .15s';
  var overlay = document.createElement('div');
  overlay.id = 'tx-ad-modal';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9000;background:rgba(15,23,42,0.45);display:flex;align-items:center;justify-content:center';
  overlay.onclick = function(e) { if (e.target === overlay) txCloseAdModal(); };
  overlay.innerHTML =
    '<div style="background:#fff;border-radius:12px;width:960px;max-width:94vw;height:80vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.18);overflow:hidden">'
    + '<div style="' + MHEAD + '">'
    +   '<span style="font-size:13px;font-weight:600;color:var(--text)">' + title + '</span>'
    +   '<div style="flex:1"></div>'
    +   (type === 'objects'
        ? '<div style="display:flex;border:1px solid var(--border);border-radius:7px;overflow:hidden;margin-right:8px">'
          + '<button id="tx-ad-modal-od-btn" title="Object Detection" onclick="txToggleAdModalOd()" style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:26px;border:none;border-right:1px solid var(--border);cursor:pointer;transition:background .15s,color .15s;background:' + (showOd ? 'var(--bg)' : 'transparent') + ';color:' + (showOd ? 'var(--text)' : 'var(--muted)') + '" onmouseenter="this.style.background=\'var(--bg)\';this.style.color=\'var(--text)\'" onmouseleave="if(document.getElementById(\'tx-ad-modal-od\').style.display===\'none\'){this.style.background=\'transparent\';this.style.color=\'var(--muted)\'}">'
          + '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1.5 4V2H3.5M10.5 2H12.5V4M12.5 10V12H10.5M3.5 12H1.5V10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="7" cy="7" r="1.8" stroke="#d946ef" stroke-width="1.2"/></svg>'
          + '</button>'
          + '<button id="tx-ad-modal-json-btn" title="View JSON" onclick="txToggleAdModalJson()" style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:26px;border:none;cursor:pointer;transition:background .15s,color .15s;background:' + (showJson ? 'var(--bg)' : 'transparent') + ';color:' + (showJson ? 'var(--text)' : 'var(--muted)') + '" onmouseenter="this.style.background=\'var(--bg)\';this.style.color=\'var(--text)\'" onmouseleave="if(document.getElementById(\'tx-ad-modal-json\').style.display===\'none\'){this.style.background=\'transparent\';this.style.color=\'var(--muted)\'}">'
          + '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M4 4L1.5 7 4 10M10 4l2.5 3L10 10M7.5 2.5l-1 9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          + '</button>'
          + '</div>'
        : '<div style="display:flex;border:1px solid var(--border);border-radius:7px;overflow:hidden;margin-right:8px">'
          + '<button id="tx-ad-modal-json-btn" title="View JSON" onclick="txToggleAdModalJson()" style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:26px;border:none;cursor:pointer;transition:background .15s,color .15s;background:' + (showJson ? 'var(--bg)' : 'transparent') + ';color:' + (showJson ? 'var(--text)' : 'var(--muted)') + '" onmouseenter="this.style.background=\'var(--bg)\';this.style.color=\'var(--text)\'" onmouseleave="if(document.getElementById(\'tx-ad-modal-json\').style.display===\'none\'){this.style.background=\'transparent\';this.style.color=\'var(--muted)\'}">'
          + '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M4 4L1.5 7 4 10M10 4l2.5 3L10 10M7.5 2.5l-1 9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          + '</button>'
          + '</div>')
    +   '<button title="Close" onclick="txCloseAdModal()" style="' + IBTN + ';font-size:15px;font-family:inherit" onmouseenter="this.style.background=\'var(--bg)\'" onmouseleave="this.style.background=\'transparent\'">×</button>'
    + '</div>'
    + '<div style="display:flex;flex:1;min-height:0;overflow:hidden">'
    +   '<div style="flex:1;min-width:0;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:14px">' + content + '</div>'
    +   '<div id="tx-ad-modal-json" style="display:' + (showJson ? 'flex' : 'none') + ';flex-direction:column;width:300px;flex-shrink:0;background:#14161a;border-left:1px solid #2a2d35">'
    +     '<div style="display:flex;align-items:center;padding:9px 12px;border-bottom:1px solid #2a2d35;flex-shrink:0;gap:6px">'
    +       '<span style="font-size:11px;font-weight:600;color:#e2e4e9">JSON</span><div style="flex:1"></div>'
    +       '<button id="tx-ad-modal-copy-btn" onclick="txCopyAdJson()" style="border:1px solid #2a2d35;background:#1e2028;color:#8b8fa8;font-size:10px;font-family:inherit;border-radius:5px;padding:2px 8px;cursor:pointer">Copy</button>'
    +     '</div>'
    +     '<pre id="tx-ad-modal-json-pre" style="margin:0;padding:12px;font-size:10px;line-height:1.55;overflow:auto;flex:1;color:#c9d1d9;font-family:\'SF Mono\',\'Fira Code\',monospace;white-space:pre">' + txAdModalJsonStr.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</pre>'
    +   '</div>'
    +   '<div id="tx-ad-modal-od" style="display:' + (showOd ? 'flex' : 'none') + ';flex-direction:column;width:300px;flex-shrink:0;background:#14161a;border-left:1px solid #2a2d35">'
    +     '<div style="display:flex;align-items:center;padding:9px 12px;border-bottom:1px solid #2a2d35;flex-shrink:0;gap:6px">'
    +       '<svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M1.5 4V2H3.5M10.5 2H12.5V4M12.5 10V12H10.5M3.5 12H1.5V10" stroke="#d946ef" stroke-width="1.3" stroke-linecap="round"/><circle cx="7" cy="7" r="1.8" stroke="#d946ef" stroke-width="1.2"/></svg>'
    +       '<span style="font-size:11px;font-weight:600;color:#e2e4e9">Object Detection</span>'
    +     '</div>'
    +     '<div style="overflow-y:auto;flex:1;padding:12px">' + txBuildOdPanelHtml() + '</div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  document.body.appendChild(overlay);
}

function txCloseAdModal() {
  var m = document.getElementById('tx-ad-modal');
  if (m) m.remove();
}

function txToggleAdModalJson() {
  var jp  = document.getElementById('tx-ad-modal-json');
  var btn = document.getElementById('tx-ad-modal-json-btn');
  if (!jp) return;
  var open = jp.style.display !== 'none';
  var od = document.getElementById('tx-ad-modal-od');
  var odb = document.getElementById('tx-ad-modal-od-btn');
  if (od) { od.style.display = 'none'; }
  if (odb) { odb.style.background = 'transparent'; odb.style.color = 'var(--muted)'; odb.style.borderColor = 'var(--border)'; }
  jp.style.display = open ? 'none' : 'flex';
  if (btn) {
    btn.style.background  = open ? 'transparent' : 'var(--bg)';
    btn.style.color       = open ? 'var(--muted)' : 'var(--text)';
    btn.style.borderColor = open ? 'var(--border)' : 'var(--border-md)';
  }
}

function txToggleAdModalOd() {
  var od  = document.getElementById('tx-ad-modal-od');
  var btn = document.getElementById('tx-ad-modal-od-btn');
  if (!od) return;
  var open = od.style.display !== 'none';
  var jp  = document.getElementById('tx-ad-modal-json');
  var jpb = document.getElementById('tx-ad-modal-json-btn');
  if (jp) { jp.style.display = 'none'; }
  if (jpb) { jpb.style.background = 'transparent'; jpb.style.color = 'var(--muted)'; jpb.style.borderColor = 'var(--border)'; }
  od.style.display = open ? 'none' : 'flex';
  if (btn) {
    btn.style.background  = open ? 'transparent' : 'var(--bg)';
    btn.style.color       = open ? 'var(--muted)' : 'var(--text)';
    btn.style.borderColor = open ? 'var(--border)' : 'var(--border-md)';
  }
}

function txBuildOdPanelHtml() {
  var NEON = 'border:1.5px solid #d946ef;box-shadow:0 0 5px #d946ef,0 0 12px rgba(217,70,239,0.35);border-radius:3px;position:absolute;pointer-events:none';
  return TX_AD_FRAMES.map(function(f, i) {
    var boxesHtml = f.boxes.map(function(b) {
      return '<div style="' + NEON + ';top:' + b.t + '%;left:' + b.l + '%;width:' + b.w + '%;height:' + b.h + '%"></div>';
    }).join('');
    var objsHtml = f.objects.map(function(o) {
      var col = o.c >= 95 ? '#4ade80' : o.c >= 80 ? '#fbbf24' : '#94a3b8';
      return '<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid #2a2d35">'
        + '<span style="font-size:11px;color:#c9d1d9">' + o.n + '</span>'
        + '<span style="font-size:10px;font-weight:600;color:' + col + '">' + o.c + '%</span>'
        + '</div>';
    }).join('');
    return '<div style="margin-bottom:' + (i < TX_AD_FRAMES.length - 1 ? '16' : '0') + 'px">'
      + '<div style="position:relative;width:100%;padding-bottom:56.25%;background:#0a0c10;border-radius:6px;overflow:hidden;margin-bottom:8px">'
      +   '<img src="' + f.img + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.85" loading="lazy"/>'
      +   boxesHtml
      +   '<span style="position:absolute;bottom:5px;left:7px;font-size:10px;font-weight:600;color:#f8fafc;background:rgba(0,0,0,0.65);padding:1px 6px;border-radius:4px;font-family:monospace">' + f.time + '</span>'
      + '</div>'
      + objsHtml
      + '</div>';
  }).join('');
}

function txRenderAdAnalysis() {
  var panel = document.getElementById('tx2-sub-content-ad-analysis');
  if (!panel) return;
  var d    = TX_AD_DATA;
  var LSUB = 'font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);margin-bottom:6px';
  function secTitle(t) { return '<div style="' + LSUB + '">' + t + '</div>'; }
  function iabColor(conf) { return conf >= 0.85 ? '#16a34a' : conf >= 0.70 ? '#d97706' : 'var(--muted)'; }

  // ── IAB Taxonomies ──────────────────────────────────────────────────────────
  var aggHtml = '<div>'
    + secTitle('IAB Taxonomy')
    + '<div style="display:flex;flex-wrap:wrap;gap:6px">'
    + d.video_metadata.iab_taxonomy.slice(0, 3).map(function(cat) {
        var pct = Math.round(cat.confidence * 100);
        var col = iabColor(cat.confidence);
        var bg  = cat.confidence >= 0.85 ? '#f0fdf4' : cat.confidence >= 0.70 ? '#fffbeb' : 'var(--bg)';
        var bd  = cat.confidence >= 0.85 ? '#bbf7d0' : cat.confidence >= 0.70 ? '#fde68a' : 'var(--border)';
        return '<div style="display:flex;align-items:center;gap:6px;padding:5px 10px;background:' + bg + ';border:1px solid ' + bd + ';border-radius:7px">'
          + '<span style="font-size:11px;font-weight:500;color:var(--text)">' + cat.name + '</span>'
          + '<span style="font-size:10px;font-weight:600;color:' + col + '">' + pct + '%</span>'
          + '</div>';
      }).join('')
    + '</div></div>';

  var scenesWithIab = d.Scenes.filter(function(s) { return s.iab_taxonomy && s.iab_taxonomy.length > 0; });
  var scenesHtml = '<div>' + secTitle('Per Scene')
    + scenesWithIab.map(function(s) {
        var tc  = s.startTimecode.slice(0,8);
        var t   = s.iab_taxonomy[0];
        var pct = Math.round(t.confidence * 100);
        var col = iabColor(t.confidence);
        var bg  = t.confidence >= 0.85 ? '#f0fdf4' : t.confidence >= 0.70 ? '#fffbeb' : 'var(--bg)';
        var bd  = t.confidence >= 0.85 ? '#bbf7d0' : t.confidence >= 0.70 ? '#fde68a' : 'var(--border)';
        var consideredHtml = (t.considered && t.considered.length)
          ? '<div style="margin-top:3px;display:flex;align-items:center;flex-wrap:wrap;gap:3px">'
            + '<span style="font-size:9px;color:var(--faint)">Considered:</span>'
            + t.considered.map(function(c) { return '<span style="font-size:10px;color:var(--muted)">' + c + '</span>'; }).join('<span style="font-size:9px;color:var(--faint)">,</span>')
            + '</div>'
          : '';
        return '<div style="display:flex;align-items:flex-start;gap:8px;padding:7px 0;border-bottom:1px solid var(--border)">'
          + '<span style="font-size:10px;color:var(--faint);font-family:monospace;white-space:nowrap;min-width:52px;flex-shrink:0;padding-top:1px">' + tc + '</span>'
          + '<div style="min-width:0;flex:1">'
          +   '<div style="display:flex;align-items:baseline;gap:6px">'
          +     '<span style="font-size:11px;font-weight:500;color:var(--text)">' + t.name + '</span>'
          +     '<span style="font-size:10px;font-weight:600;color:' + col + ';background:' + bg + ';border:1px solid ' + bd + ';border-radius:20px;padding:1px 6px;white-space:nowrap">' + pct + '%</span>'
          +   '</div>'
          +   consideredHtml
          + '</div>'
          + '</div>';
      }).join('')
    + '</div>';

  var iabColHtml = aggHtml + scenesHtml;

  // ── Ad Compliance (logos + sensitive labels only) ───────────────────────────
  var logos        = (d.metadata && d.metadata.logos) || [];
  var allLabels    = (d.metadata && d.metadata.object_labels) || [];
  var sensitiveHit = allLabels.filter(function(l) { return TX_AD_SENSITIVE_LABELS.indexOf(l.Name) >= 0; });

  var logosHtml = '<div>' + secTitle('Detected Logos')
    + '<div style="display:flex;flex-wrap:wrap;gap:5px">'
    + (logos.length
        ? logos.map(function(l) {
            return '<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;background:var(--bg);border:1px solid var(--border-md);border-radius:20px;font-size:11px;font-weight:500;color:var(--text)">'
              + '<svg width="9" height="9" viewBox="0 0 10 10" fill="none"><rect x="1" y="1" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M3 5h4M3 7h2" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>'
              + l + '</span>';
          }).join('')
        : '<span style="font-size:11px;color:var(--faint)">None detected</span>')
    + '</div></div>';

  var sensitiveHtml = '<div>' + secTitle('Sensitive Labels')
    + (sensitiveHit.length
        ? '<div style="padding:10px 12px;background:#fffbeb;border:1px solid #fde68a;border-radius:9px">'
          + '<div style="display:flex;align-items:center;gap:5px;margin-bottom:6px">'
          +   '<svg width="12" height="12" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" fill="#d97706" opacity=".2"/><path d="M6.5 4v3.5" stroke="#d97706" stroke-width="1.4" stroke-linecap="round"/><circle cx="6.5" cy="9.5" r=".7" fill="#d97706"/></svg>'
          +   '<span style="font-size:11px;font-weight:600;color:#92400e">Review recommended</span>'
          + '</div>'
          + '<div style="font-size:10px;color:#92400e;margin-bottom:7px;line-height:1.5">May be false positives (tools/packaging misclassified).</div>'
          + '<div style="display:flex;flex-wrap:wrap;gap:4px">'
          + sensitiveHit.map(function(l) {
              return '<span style="padding:2px 8px;background:#fef3c7;border:1px solid #fde68a;border-radius:20px;font-size:11px;font-weight:500;color:#92400e">'
                + l.Name.replace(/_/g,' ') + ' <span style="opacity:.65">' + Math.round(l.Confidence*100) + '%</span></span>';
            }).join('')
          + '</div></div>'
        : '<div style="padding:9px 12px;background:var(--bg);border:1px solid var(--border);border-radius:9px;font-size:11px;color:var(--faint)">None detected</div>')
    + '</div>';

  var compColHtml = logosHtml + sensitiveHtml;

  // ── Objects Detected (grouped by confidence, grey chips) ───────────────────
  var objectLabels = allLabels.filter(function(l) { return TX_AD_SENSITIVE_LABELS.indexOf(l.Name) < 0; })
                              .sort(function(a,b) { return b.Confidence - a.Confidence; });

  var objGroups = {};
  objectLabels.forEach(function(l) {
    var pct = Math.round(l.Confidence * 100);
    if (!objGroups[pct]) objGroups[pct] = [];
    objGroups[pct].push(l.Name.replace(/_/g,' '));
  });
  var sortedObjPcts = Object.keys(objGroups).map(Number).sort(function(a,b){ return b-a; });
  var objectsHtml = sortedObjPcts.map(function(pct) {
    var badgeCol = pct >= 80 ? '#16a34a' : pct >= 10 ? '#d97706' : 'var(--muted)';
    var badgeBg  = pct >= 80 ? '#f0fdf4'  : pct >= 10 ? '#fffbeb'  : 'var(--bg)';
    var badgeBd  = pct >= 80 ? '#bbf7d0'  : pct >= 10 ? '#fde68a'  : 'var(--border)';
    var chipsHtml = objGroups[pct].map(function(name) {
      return '<span style="padding:2px 9px;background:var(--bg);border:1px solid var(--border);border-radius:20px;font-size:11px;color:var(--text);white-space:nowrap">' + name + '</span>';
    }).join('');
    return '<div style="padding:6px 0;border-bottom:1px solid var(--border)">'
      + '<span style="font-size:10px;font-weight:600;color:' + badgeCol + ';background:' + badgeBg + ';border:1px solid ' + badgeBd + ';border-radius:20px;padding:1px 7px;display:inline-block;margin-bottom:6px">' + pct + '%</span>'
      + '<div style="display:flex;flex-wrap:wrap;gap:4px">' + chipsHtml + '</div>'
      + '</div>';
  }).join('');

  // ── Modal data ──────────────────────────────────────────────────────────────
  txAdModalIabHtml     = iabColHtml;
  txAdModalCompHtml    = compTwoColHtml;
  txAdModalObjectsHtml = objectsHtml;
  txAdModalJsonStr     = JSON.stringify(TX_AD_DATA, null, 2);

  // ── Layout ──────────────────────────────────────────────────────────────────
  var PANEL = 'display:flex;flex-direction:column;background:#fff;border:1px solid var(--border);border-radius:10px;overflow:hidden';
  var PHEAD = 'display:flex;align-items:center;padding:9px 12px;border-bottom:1px solid var(--border);flex-shrink:0';
  var PBODY = 'flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:14px';
  var IBTN  = 'display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:1px solid var(--border);border-radius:5px;background:transparent;cursor:pointer;color:var(--muted);transition:background .15s,color .15s';
  var IBTNHOV = 'onmouseenter="this.style.background=\'var(--surface)\';this.style.color=\'var(--text)\'" onmouseleave="this.style.background=\'transparent\';this.style.color=\'var(--muted)\'"';

  function cardHeader(title, type) {
    return '<div style="' + PHEAD + '">'
      + '<span style="font-size:11px;font-weight:600;color:var(--text)">' + title + '</span>'
      + '<div style="flex:1"></div>'
      + '<button title="View JSON" onclick="txOpenAdModal(\'' + type + '\',\'json\')" style="' + IBTN + ';margin-right:4px" ' + IBTNHOV + '>'
      +   '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M4 4L1.5 7 4 10M10 4l2.5 3L10 10M7.5 2.5l-1 9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      + '</button>'
      + '<button title="Expand" onclick="txOpenAdModal(\'' + type + '\',null)" style="' + IBTN + '" ' + IBTNHOV + '>'
      +   '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1.5 5.5V2H5M9 2h3.5V5.5M12.5 8.5V12H9M5 12H1.5V8.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      + '</button>'
      + '</div>';
  }


  // ── Ad Compliance two-column content (rosy theme) ──────────────────────────
  var CTAG = 'display:inline-flex;align-items:center;gap:5px;padding:3px 9px;background:var(--bg);border:1px solid var(--border-md);border-radius:20px;font-size:11px;font-weight:500;color:var(--text)';
  var CLBL = 'font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);margin-bottom:4px;font-weight:600';
  var compTwoColHtml =
    '<div style="display:flex;gap:12px;align-items:flex-start">'
    // Logos column — narrow so chips stack
    + '<div style="width:130px;flex-shrink:0">'
    +   '<div style="' + CLBL + '">Detected Logos</div>'
    +   '<div style="display:flex;flex-direction:column;gap:4px">'
    +   (logos.length
        ? logos.map(function(l) {
            return '<span style="' + CTAG + '">'
              + '<svg width="9" height="9" viewBox="0 0 10 10" fill="none"><rect x="1" y="1" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M3 5h4M3 7h2" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>'
              + l + '</span>';
          }).join('')
        : '<span style="font-size:11px;color:var(--faint)">None detected</span>')
    +   '</div>'
    + '</div>'
    // Sensitive Labels column — flex:1, more space, no title
    + '<div style="flex:1;min-width:0">'
    +   (sensitiveHit.length
        ? '<div style="padding:6px 9px;background:#fff7ed;border:1px solid #fed7aa;border-radius:9px">'
          + '<div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">'
          +   '<svg width="12" height="12" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" fill="#ea580c" opacity=".18"/><path d="M6.5 4v3.5" stroke="#ea580c" stroke-width="1.4" stroke-linecap="round"/><circle cx="6.5" cy="9.5" r=".7" fill="#ea580c"/></svg>'
          +   '<span style="font-size:11px;font-weight:600;color:#9a3412">Review recommended sensitive labels</span>'
          + '</div>'
          + '<div style="font-size:10px;color:#c2410c;margin-bottom:4px;line-height:1.3">May be false positives in food/kitchen context.</div>'
          + '<div style="display:flex;flex-wrap:wrap;gap:4px">'
          + sensitiveHit.map(function(l) {
              return '<span style="padding:2px 8px;background:#ffedd5;border:1px solid #fed7aa;border-radius:20px;font-size:11px;font-weight:500;color:#9a3412">'
                + l.Name.replace(/_/g,' ') + ' <span style="opacity:.65">' + Math.round(l.Confidence*100) + '%</span></span>';
            }).join('')
          + '</div>'
          + '</div>'
        : '<div style="padding:6px 9px;background:var(--bg);border:1px solid var(--border);border-radius:9px;font-size:11px;color:var(--faint)">None detected</div>')
    + '</div>'
    + '</div>';

  var IBTN_C  = 'display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:1px solid #fda4af;border-radius:5px;background:transparent;cursor:pointer;color:#e11d48;transition:background .15s';
  var IBTNHOV_C = 'onmouseenter="this.style.background=\'#fff1f2\'" onmouseleave="this.style.background=\'transparent\'"';

  panel.innerHTML =
    // Outer: horizontal — left column (IAB+Objects+Compliance) | Highcharts
    '<div style="display:flex;gap:14px;flex:1;min-height:0;overflow:hidden">'

    // ── Left column: IAB top, Objects middle, Compliance bottom ─────────────
    + '<div style="display:flex;flex-direction:column;gap:14px;width:534px;flex-shrink:0;min-height:0;overflow:hidden">'

    +   '<div style="display:flex;gap:14px;flex:1;min-height:0;overflow:hidden">'

    +     '<div style="width:280px;flex-shrink:0;' + PANEL + '">'
    +       cardHeader('IAB Taxonomies', 'iab')
    +       '<div style="' + PBODY + '">' + iabColHtml + '</div>'
    +     '</div>'

    +     '<div style="flex:1;min-width:0;' + PANEL + '">'
    +       '<div style="' + PHEAD + '">'
    +         '<span style="font-size:11px;font-weight:600;color:var(--text)">Objects Detected</span>'
    +         '<span style="margin-left:6px;font-size:10px;color:var(--faint)">' + objectLabels.length + '</span>'
    +         '<div style="flex:1"></div>'
    +         '<button title="Object Detection" onclick="txOpenAdModal(\'objects\',\'objects\')" style="' + IBTN + ';margin-right:4px" ' + IBTNHOV + '>'
    +           '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1.5 4V2H3.5M10.5 2H12.5V4M12.5 10V12H10.5M3.5 12H1.5V10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="7" cy="7" r="1.8" stroke="#d946ef" stroke-width="1.2"/></svg>'
    +         '</button>'
    +         '<button title="Expand" onclick="txOpenAdModal(\'objects\',null)" style="' + IBTN + '" ' + IBTNHOV + '>'
    +           '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1.5 5.5V2H5M9 2h3.5V5.5M12.5 8.5V12H9M5 12H1.5V8.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +         '</button>'
    +       '</div>'
    +       '<div style="' + PBODY + ';gap:0">' + objectsHtml + '</div>'
    +     '</div>'

    +   '</div>'

    // Ad Compliance — full width of left column, compact height
    +   '<div style="flex-shrink:0;display:flex;flex-direction:column;background:#fff;border:1px solid var(--border);border-radius:10px;overflow:hidden">'
    +     '<div style="display:flex;align-items:center;padding:5px 10px;border-bottom:1px solid var(--border);flex-shrink:0">'
    +       '<svg width="11" height="11" viewBox="0 0 14 14" fill="none" style="margin-right:6px;flex-shrink:0"><path d="M7 1.5L1.5 4v3c0 3 2.5 5.2 5.5 6 3-.8 5.5-3 5.5-6V4L7 1.5z" stroke="var(--muted)" stroke-width="1.3" stroke-linejoin="round"/></svg>'
    +       '<span style="font-size:11px;font-weight:600;color:var(--text)">Ad Compliance</span>'
    +       '<div style="flex:1"></div>'
    +       '<button title="View JSON" onclick="txOpenAdModal(\'compliance\',\'json\')" style="' + IBTN + ';margin-right:4px" ' + IBTNHOV + '>'
    +         '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M4 4L1.5 7 4 10M10 4l2.5 3L10 10M7.5 2.5l-1 9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +       '</button>'
    +       '<button title="Expand" onclick="txOpenAdModal(\'compliance\',null)" style="' + IBTN + '" ' + IBTNHOV + '>'
    +         '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1.5 5.5V2H5M9 2h3.5V5.5M12.5 8.5V12H9M5 12H1.5V8.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +       '</button>'
    +     '</div>'
    +     '<div style="padding:7px 10px">' + compTwoColHtml + '</div>'
    +   '</div>'

    + '</div>'

    // ── Right: Highcharts — full height, unaffected ──────────────────────────
    + '<div style="flex:1;min-width:0;display:flex;flex-direction:column;background:#fff;border:1px solid var(--border);border-radius:10px;overflow:hidden">'
    +   '<div style="' + PHEAD + ';justify-content:space-between">'
    +     '<span style="font-size:11px;font-weight:600;color:var(--text)">Moments × IAB Relevance</span>'
    +     '<span style="font-size:10px;color:var(--faint)">hover for details</span>'
    +   '</div>'
    +   '<div id="tx-ad-bubble-chart" style="width:100%;flex:1"></div>'
    + '</div>'

    + '</div>';

  txLoadHighcharts(function() {
    var momentLabels = ['Grocery Haul','Family Dinner','Healthy Eating','Fresh Produce','Meal Prep','Weekend BBQ','Snack Time','Baking & Sweets','Beverages','Quick & Easy'];
    function bp(x, y, z, name) {
      var green = y >= 80;
      return { x:x, y:y, z:z, name:name,
        color: green ? 'rgba(34,197,94,0.55)' : 'rgba(234,179,8,0.55)',
        marker: { lineColor: green ? '#16a34a' : '#ca8a04', lineWidth:1.5 }
      };
    }
    var bubbleData = [
      bp(0,94,14,'Grocery & Supermarket'), bp(0,88,12,'Food & Drink'),        bp(0,82,11,'Family Meals'),
      bp(1,91,14,'Cooking'),               bp(1,86,13,'Food & Drink'),         bp(1,78,11,'Healthy Living'),
      bp(2,95,14,'Healthy Eating'),        bp(2,90,13,'Grocery & Supermarket'),bp(2,83,12,'Nutrition'),       bp(2,74,10,'Fitness'),
      bp(3,93,14,'Grocery & Supermarket'), bp(3,87,13,'Produce'),              bp(3,81,12,'Organic Food'),
      bp(4,89,13,'Cooking'),               bp(4,84,12,'Meal Planning'),        bp(4,76,11,'Food & Drink'),
      bp(5,85,13,'Outdoor Dining'),        bp(5,79,11,'Grilling'),             bp(5,68,10,'Summer Food'),
      bp(6,80,12,'Snacks'),                bp(6,72,10,'Beverages'),            bp(6,65,9,'Convenience Food'),
      bp(7,88,13,'Baking'),                bp(7,82,12,'Desserts'),             bp(7,70,10,'Cooking'),
      bp(8,92,14,'Beverages'),             bp(8,86,13,'Grocery & Supermarket'),bp(8,78,11,'Healthy Drinks'),
      bp(9,90,14,'Cooking'),               bp(9,83,12,'Food & Drink'),         bp(9,73,10,'Quick Meals')
    ];
    var container = document.getElementById('tx-ad-bubble-chart');
    if (!container) return;
    Highcharts.chart('tx-ad-bubble-chart', {
      chart: { type:'bubble', backgroundColor:'transparent', plotBorderWidth:0, height:null, margin:[10,20,72,14], animation:{duration:600}, style:{fontFamily:'inherit'} },
      title: { text:null }, legend:{enabled:false}, credits:{enabled:false}, exporting:{enabled:false},
      xAxis: { categories:momentLabels, gridLineWidth:1, gridLineColor:'#f1f5f9', lineWidth:0, tickLength:0, title:{text:null}, labels:{style:{fontSize:'9px',color:'#64748b'},rotation:-35,y:16} },
      yAxis: { min:55, max:100, gridLineWidth:1, gridLineColor:'#f1f5f9', title:{text:null}, labels:{enabled:false} },
      tooltip: {
        useHTML:true, backgroundColor:'#1e293b', borderColor:'#334155', borderRadius:8,
        style:{color:'#e2e8f0',fontSize:'11px'},
        formatter: function() {
          return '<div style="padding:2px 4px"><b style="color:#f8fafc">' + this.point.name + '</b><br/>'
            + '<span style="color:#94a3b8">Moment: </span><span>' + momentLabels[this.x] + '</span><br/>'
            + '<span style="color:#94a3b8">Relevance: </span><b style="color:' + (this.y >= 80 ? '#4ade80' : '#fbbf24') + '">' + (this.y >= 80 ? 'High' : 'Standard') + '</b></div>';
        }
      },
      plotOptions: { bubble: { minSize:5, maxSize:20, sizeBy:'width', marker:{fillOpacity:0.6,lineWidth:1.5}, states:{hover:{halo:{size:4}}}, dataLabels:{enabled:false} } },
      series: [{ name:'IAB Taxonomy', data:bubbleData, color:'#818cf8', marker:{lineColor:'#6366f1'} }]
    });
  });
}

function txLoadHighcharts(cb) {
  if (window.Highcharts) { cb(); return; }
  var s = document.createElement('script');
  s.src = 'https://code.highcharts.com/highcharts.js';
  s.onload = function() {
    var s2 = document.createElement('script');
    s2.src = 'https://code.highcharts.com/highcharts-more.js';
    s2.onload = cb;
    document.head.appendChild(s2);
  };
  document.head.appendChild(s);
}

