// roi-templates.js
// ROI calculation templates — one per driver type.
// Each template defines:
//   slug        : unique key stored in drivers.template_slug
//   label       : display name
//   description : short explanation shown to the user
//   inputs      : array of input field definitions
//   calculate   : function(values) → { roi, addedValue, breakdown }
//
// "values" is a plain object { [input.key]: number }.
// The function must always return:
//   roi         : number (ratio, e.g. 2.5 = 250%)
//   addedValue  : number (absolute £/$ gain net of cost)
//   breakdown   : array of { label, value, unit } — shown as formula steps

// ── Template options (used in Settings → Drivers dropdown) ─────────────────

var ROI_TEMPLATE_OPTIONS = [
  { val: '',                   label: '— None —'              },
  { val: 'revenue_generating', label: 'Revenue Generating'    },
  { val: 'op_efficiency',      label: 'Operational Efficiency'},
  { val: 'enhancements',       label: 'Enhancements'          },
  { val: 'strategic',          label: 'Strategic'             },
  { val: 'tech_scaling',label: 'Tech Scaling'   },
  { val: 'tech_rd',            label: 'Tech R&D'              }
];

// ── Templates ──────────────────────────────────────────────────────────────

var ROI_TEMPLATES = {

  // ── Revenue Generating ────────────────────────────────────────────────────
  // Initiatives that directly increase revenue (new features, conversion uplift,
  // pricing changes, new monetisation streams).
  revenue_generating: {
    slug:        'revenue_generating',
    label:       'Revenue Generating',
    description: 'Initiatives that directly increase revenue through conversion uplift, higher ARPU or new monetisation streams.',
    customRender: function() { return rnxRoiRevGenBenefitsHtml() + rnxRoiCostsHtml() + rnxRoiRowHtml(); },
    inputs: [
      { key: 'monthly_active_users', label: 'Monthly Active Users',    unit: 'number',  placeholder: '500000', helper: 'MAU at the time of launch' },
      { key: 'arpu',                 label: 'Avg Revenue per User / mo',unit: 'dollar',  placeholder: '12',     helper: 'Current average monthly revenue per user' },
      { key: 'revenue_lift_pct',     label: 'Expected Revenue Lift',   unit: 'percent', placeholder: '5',      helper: 'Estimated % uplift in revenue per user or conversion rate' },
      { key: 'project_cost',         label: 'Total Project Cost',      unit: 'dollar',  placeholder: '150000', helper: 'Total cost to deliver the initiative' },
      { key: 'time_horizon_months',  label: 'Time Horizon (months)',   unit: 'number',  placeholder: '12',     helper: 'Months over which to measure the return' }
    ],
    calculate: function(v) {
      var monthlyGain = (v.monthly_active_users || 0) * (v.arpu || 0) * ((v.revenue_lift_pct || 0) / 100);
      var totalGain   = monthlyGain * (v.time_horizon_months || 12);
      var cost        = v.project_cost || 0;
      var addedValue  = totalGain - cost;
      var roi         = cost > 0 ? addedValue / cost : 0;
      return {
        roi: roi, addedValue: addedValue,
        breakdown: [
          { label: 'Monthly revenue gain',                                         value: monthlyGain.toFixed(2), unit: 'dollar' },
          { label: 'Total gain (' + (v.time_horizon_months || 12) + ' months)',    value: totalGain.toFixed(2),   unit: 'dollar' },
          { label: 'Project cost',                                                 value: cost.toFixed(2),        unit: 'dollar' },
          { label: 'Net added value',                                              value: addedValue.toFixed(2),  unit: 'dollar' }
        ]
      };
    }
  },

  // ── Operational Efficiency ────────────────────────────────────────────────
  // Initiatives that save team time or reduce operational costs through
  // automation, process improvements or tooling.
  op_efficiency: {
    slug:        'op_efficiency',
    label:       'Operational Efficiency',
    description: 'Initiatives that reduce operational costs or save team time through automation and process improvements.',
    customRender: function() { return rnxRoiOpEffBenefitsHtml() + rnxRoiCostsHtml() + rnxRoiOpEffRowHtml(); },
    inputs: [
      { key: 'hours_saved_per_week', label: 'Hours Saved / Week',      unit: 'number',  placeholder: '40',     helper: 'Total team hours saved each week' },
      { key: 'blended_hourly_rate',  label: 'Blended Hourly Rate',     unit: 'dollar',  placeholder: '75',     helper: 'Average fully-loaded cost per person per hour' },
      { key: 'annual_cost_reduction',label: 'Additional Annual Savings',unit: 'dollar', placeholder: '0',      helper: 'Any direct cost savings beyond time (tools, vendors, etc.)' },
      { key: 'project_cost',         label: 'Total Project Cost',      unit: 'dollar',  placeholder: '80000',  helper: 'Total cost to deliver the initiative' },
      { key: 'time_horizon_months',  label: 'Time Horizon (months)',   unit: 'number',  placeholder: '12',     helper: 'Months over which to measure the return' }
    ],
    calculate: function(v) {
      var weeksInPeriod = ((v.time_horizon_months || 12) * 52) / 12;
      var timeSaving    = (v.hours_saved_per_week || 0) * weeksInPeriod * (v.blended_hourly_rate || 0);
      var costSaving    = ((v.annual_cost_reduction || 0) / 12) * (v.time_horizon_months || 12);
      var totalGain     = timeSaving + costSaving;
      var cost          = v.project_cost || 0;
      var addedValue    = totalGain - cost;
      var roi           = cost > 0 ? addedValue / cost : 0;
      return {
        roi: roi, addedValue: addedValue,
        breakdown: [
          { label: 'Time saved (monetary value)',  value: timeSaving.toFixed(2),   unit: 'dollar' },
          { label: 'Direct cost savings',          value: costSaving.toFixed(2),   unit: 'dollar' },
          { label: 'Total gain',                   value: totalGain.toFixed(2),    unit: 'dollar' },
          { label: 'Project cost',                 value: cost.toFixed(2),         unit: 'dollar' },
          { label: 'Net added value',              value: addedValue.toFixed(2),   unit: 'dollar' }
        ]
      };
    }
  },

  // ── Enhancements ──────────────────────────────────────────────────────────
  enhancements: {
    slug:        'enhancements',
    label:       'Enhancements',
    description: 'Improvements to existing features that increase engagement, adoption or retention.',
    inputs: [],   // layout handled by customRender
    customRender: function(assumptions) { return rnxRoiEnhHtml(assumptions); },
    calculate: function(v) {
      var addedValue = v.product_revenue_last_year * ((v.contribution_to_revenue_growth || 0) / 100);
      var totalCost  = (v.eng_cost || 0) + (v.des_cost || 0) + (v.prd_cost || 0);
      var roi        = totalCost > 0 ? (addedValue - totalCost) / totalCost : 0;
      return {
        roi: roi,
        addedValue: addedValue - totalCost,
        breakdown: [
          { label: 'Added Value (Benefit)',      value: addedValue.toFixed(2), unit: 'dollar' },
          { label: 'Total Cost',                 value: totalCost.toFixed(2),  unit: 'dollar' },
          { label: 'Net',                        value: (addedValue - totalCost).toFixed(2), unit: 'dollar' }
        ]
      };
    }
  },

  // ── Strategic ─────────────────────────────────────────────────────────────
  // Initiatives with long-term competitive or market value that's harder to
  // directly monetise — market positioning, partnership enablement, compliance.
  strategic: {
    slug:        'strategic',
    label:       'Strategic',
    description: 'Initiatives with long-term competitive value — market positioning, partnership enablement or revenue protection.',
    customRender: function() { return rnxRoiStrategicBenefitsHtml() + rnxRoiCostsHtml() + rnxRoiRowHtml(); },
    inputs: [
      { key: 'revenue_at_risk',      label: 'Revenue at Risk',          unit: 'dollar',  placeholder: '2000000', helper: 'Annual revenue at risk if this initiative is not delivered' },
      { key: 'risk_mitigation_pct',  label: 'Risk Mitigation',          unit: 'percent', placeholder: '60',      helper: 'Estimated % of risk that this initiative mitigates' },
      { key: 'market_opportunity',   label: 'Market Opportunity',       unit: 'dollar',  placeholder: '500000',  helper: 'Additional annual revenue unlocked (new segment, partner, etc.)' },
      { key: 'project_cost',         label: 'Total Project Cost',       unit: 'dollar',  placeholder: '200000',  helper: 'Total cost to deliver the initiative' },
      { key: 'time_horizon_months',  label: 'Time Horizon (months)',    unit: 'number',  placeholder: '24',      helper: 'Months over which to measure the return' }
    ],
    calculate: function(v) {
      var protectedRevenue  = (v.revenue_at_risk || 0) * ((v.risk_mitigation_pct || 0) / 100) * ((v.time_horizon_months || 24) / 12);
      var opportunityValue  = (v.market_opportunity || 0) * ((v.time_horizon_months || 24) / 12);
      var totalGain         = protectedRevenue + opportunityValue;
      var cost              = v.project_cost || 0;
      var addedValue        = totalGain - cost;
      var roi               = cost > 0 ? addedValue / cost : 0;
      return {
        roi: roi, addedValue: addedValue,
        breakdown: [
          { label: 'Revenue protected',        value: protectedRevenue.toFixed(2),  unit: 'dollar' },
          { label: 'Opportunity value',         value: opportunityValue.toFixed(2),  unit: 'dollar' },
          { label: 'Total strategic value',     value: totalGain.toFixed(2),         unit: 'dollar' },
          { label: 'Project cost',              value: cost.toFixed(2),              unit: 'dollar' },
          { label: 'Net added value',           value: addedValue.toFixed(2),        unit: 'dollar' }
        ]
      };
    }
  },

  // ── Tech Scaling ───────────────────────────────────────────────────
  // Foundational work that reduces incidents, improves reliability, frees
  // engineering capacity and reduces long-term maintenance cost.
  tech_scaling: {
    slug:        'tech_scaling',
    label:       'Tech Scaling',
    description: 'Foundational work that improves reliability, reduces incidents and frees engineering capacity.',
    customRender: function() { return rnxRoiTechScalingBenefitsHtml() + rnxRoiCostsHtml() + rnxRoiOpEffRowHtml(); },
    inputs: [
      { key: 'annual_incident_cost', label: 'Annual Incident / Downtime Cost', unit: 'dollar',  placeholder: '300000', helper: 'Total annual cost of incidents, outages and firefighting' },
      { key: 'incident_reduction',   label: 'Incident Reduction',              unit: 'percent', placeholder: '50',     helper: 'Expected % reduction in incidents after delivery' },
      { key: 'eng_days_freed_qtr',   label: 'Engineering Days Freed / Quarter',unit: 'number',  placeholder: '30',     helper: 'Eng days freed from maintenance and firefighting per quarter' },
      { key: 'daily_eng_rate',       label: 'Avg Daily Engineering Rate',      unit: 'dollar',  placeholder: '600',    helper: 'Fully-loaded daily cost of one engineer' },
      { key: 'project_cost',         label: 'Total Project Cost',              unit: 'dollar',  placeholder: '120000', helper: 'Total cost to deliver the initiative' },
      { key: 'time_horizon_months',  label: 'Time Horizon (months)',           unit: 'number',  placeholder: '12',     helper: 'Months over which to measure the return' }
    ],
    calculate: function(v) {
      var incidentSaving = (v.annual_incident_cost || 0) * ((v.incident_reduction || 0) / 100) * ((v.time_horizon_months || 12) / 12);
      var quarters       = (v.time_horizon_months || 12) / 3;
      var capacityGain   = (v.eng_days_freed_qtr || 0) * quarters * (v.daily_eng_rate || 0);
      var totalGain      = incidentSaving + capacityGain;
      var cost           = v.project_cost || 0;
      var addedValue     = totalGain - cost;
      var roi            = cost > 0 ? addedValue / cost : 0;
      return {
        roi: roi, addedValue: addedValue,
        breakdown: [
          { label: 'Incident cost saved',        value: incidentSaving.toFixed(2),  unit: 'dollar' },
          { label: 'Capacity value unlocked',    value: capacityGain.toFixed(2),    unit: 'dollar' },
          { label: 'Total gain',                 value: totalGain.toFixed(2),       unit: 'dollar' },
          { label: 'Project cost',               value: cost.toFixed(2),            unit: 'dollar' },
          { label: 'Net added value',            value: addedValue.toFixed(2),      unit: 'dollar' }
        ]
      };
    }
  },

  // ── Tech R&D ──────────────────────────────────────────────────────────────
  // Exploratory research and prototyping with uncertain but potentially high
  // future value — weighted by probability of success.
  tech_rd: {
    slug:        'tech_rd',
    label:       'Tech R&D',
    description: 'Exploratory research with uncertain but potentially high future value, weighted by probability of success.',
    customRender: function() { return rnxRoiBenefitsPlaceholder() + rnxRoiCostsHtml() + rnxRoiRowHtml(); },
    inputs: [
      { key: 'potential_annual_rev',  label: 'Potential Annual Revenue',   unit: 'dollar',  placeholder: '5000000', helper: 'Annual revenue if the R&D leads to a successful product/feature' },
      { key: 'success_probability',   label: 'Probability of Success',     unit: 'percent', placeholder: '25',      helper: 'Realistic probability this R&D results in a shippable outcome' },
      { key: 'time_to_revenue_months',label: 'Time to Revenue (months)',   unit: 'number',  placeholder: '18',      helper: 'Months from now until revenue would be realised if successful' },
      { key: 'measurement_horizon',   label: 'Measurement Horizon (months)',unit: 'number', placeholder: '36',      helper: 'Total months over which to measure the expected return' },
      { key: 'project_cost',          label: 'Total Project Cost',         unit: 'dollar',  placeholder: '100000',  helper: 'Total cost of the R&D initiative' }
    ],
    calculate: function(v) {
      var horizon        = (v.measurement_horizon || 36) - (v.time_to_revenue_months || 18);
      var revenueMonths  = Math.max(0, horizon);
      var expectedRev    = (v.potential_annual_rev || 0) * ((v.success_probability || 0) / 100) * (revenueMonths / 12);
      var cost           = v.project_cost || 0;
      var addedValue     = expectedRev - cost;
      var roi            = cost > 0 ? addedValue / cost : 0;
      return {
        roi: roi, addedValue: addedValue,
        breakdown: [
          { label: 'Revenue-generating months',    value: revenueMonths.toFixed(0),  unit: 'months' },
          { label: 'Probability-weighted revenue', value: expectedRev.toFixed(2),    unit: 'dollar' },
          { label: 'Project cost',                 value: cost.toFixed(2),           unit: 'dollar' },
          { label: 'Net expected value',           value: addedValue.toFixed(2),     unit: 'dollar' }
        ]
      };
    }
  }

};

// ── Public helpers ─────────────────────────────────────────────────────────

function roiGetTemplate(slug) {
  return ROI_TEMPLATES[slug] || null;
}

function roiCalculate(slug, values) {
  var tpl = roiGetTemplate(slug);
  if (!tpl) return null;
  try { return tpl.calculate(values); } catch (e) { return null; }
}

function roiFmtPct(roi)      { return (roi * 100).toFixed(0) + '%'; }
function roiFmtMultiple(roi) { return (roi + 1).toFixed(1) + '×'; }

// ── ROI Calculator UI (Step 2 of Add Initiative modal) ─────────────────────

(function() {
  if (document.getElementById('rnx-roi-calc-css')) return;
  var s = document.createElement('style');
  s.id = 'rnx-roi-calc-css';
  s.textContent =
    // Generic field / section styles (used by non-custom templates)
    '.rnx-roi-section{margin-bottom:18px}' +
    '.rnx-roi-section-hd{display:flex;align-items:center;gap:8px;font-size:10px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:var(--muted);margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--border)}' +
    '.rnx-roi-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}' +
    '.rnx-roi-dot.benefit{background:#22c55e}' +
    '.rnx-roi-dot.cost{background:#f59e0b}' +
    '.rnx-roi-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 16px}' +
    '.rnx-roi-field{margin-bottom:12px}' +
    '.rnx-roi-lbl{display:block;font-size:11px;font-weight:500;color:var(--muted);margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px}' +
    '.rnx-roi-hint{font-size:10px;color:var(--muted);margin-top:3px;line-height:1.4;opacity:.8}' +
    '.rnx-roi-input-wrap{position:relative}' +
    '.rnx-roi-sym{position:absolute;left:9px;top:50%;transform:translateY(-50%);font-size:13px;color:var(--muted);pointer-events:none;line-height:1}' +
    '.rnx-roi-sym.suffix{left:auto;right:9px}' +
    '.rnx-roi-inp{width:100%;box-sizing:border-box;padding:7px 10px;font-size:13px;border:1px solid var(--border-md);border-radius:6px;background:var(--surface);color:var(--text);outline:none;font-family:inherit}' +
    '.rnx-roi-inp.has-prefix{padding-left:24px}' +
    '.rnx-roi-inp.has-suffix{padding-right:28px}' +
    '.rnx-roi-inp:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(237,0,94,.08)}' +
    '.rnx-roi-empty{text-align:center;padding:28px 0;color:var(--muted);font-size:13px;border:1px dashed var(--border-md);border-radius:8px}' +
    '.rnx-roi-ro{background:var(--bg)!important;border-color:transparent!important;color:var(--muted);cursor:default;pointer-events:none}' +
    '.rnx-roi-out-row{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);border-radius:8px;margin-top:4px;margin-bottom:16px}' +
    '.rnx-roi-out-lbl{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:var(--muted)}' +
    '.rnx-roi-out-val{font-size:16px;font-weight:700;color:#16a34a}' +
    '.rnx-roi-cost-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:0 12px;margin-bottom:10px;align-items:end}' +
    '.rnx-roi-total-row{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(237,0,94,.06);border:1px solid rgba(237,0,94,.15);border-radius:8px;margin-top:12px}' +
    '.rnx-roi-total-lbl{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:var(--accent)}' +
    '.rnx-roi-total-val{font-size:16px;font-weight:700;color:var(--accent)}' +

    // ── Compact table layout (Enhancements template) ───────────────────────
    // Card wrapper — identical to settings slide-in tables (_card helper)
    '.rnx-rt-wrap{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden}' +
    '.rnx-rt{width:100%;border-collapse:collapse}' +
    // Section header — exact match of _S.TH from settings-neon.js
    '.rnx-rt-sec{font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);padding:8px 12px;background:var(--bg);border-bottom:1px solid var(--border);text-align:left;white-space:nowrap}' +
    '.rnx-rt-sec-first{}' +
    // Column sub-headers (Development Costs / Other Costs) — same left indent as data rows
    '.rnx-rt-th{font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);padding:6px 12px;border-bottom:0.5px solid var(--border);text-align:left;white-space:nowrap;background:transparent}' +
    // Data rows — uniform height
    '.rnx-rt-td{padding:4px 12px;height:34px;border-bottom:0.5px solid var(--border);vertical-align:middle;color:var(--text)}' +
    '.rnx-rt-lbl{font-size:12px;color:var(--muted)}' +
    '.rnx-rt-val{font-size:12px;color:var(--faint);font-variant-numeric:tabular-nums}' +
    // Input wrapper
    '.rnx-rt-inp-wrap{position:relative;display:flex;align-items:center;width:100%}' +
    '.rnx-rt-sym{font-size:12px;color:var(--faint);position:absolute;left:7px;pointer-events:none;z-index:1}' +
    '.rnx-rt-sym.suf{left:auto;right:7px}' +
    '.rnx-rt-inp{width:100%;box-sizing:border-box;border:1px solid var(--border-md);border-radius:6px;background:var(--surface);padding:3px 8px;font-size:12px;color:var(--text);font-family:inherit;outline:none;text-align:right;height:26px}' +
    '.rnx-rt-inp.pfx{padding-left:17px;text-align:left}' +
    '.rnx-rt-inp.sfx{padding-right:17px}' +
    '.rnx-rt-inp:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(237,0,94,.08)}' +
    '.rnx-rt-inp::placeholder{color:var(--faint);opacity:.4}' +
    // T-shirt dropdown — very compact (override min-height:36px from base mdd CSS)
    '.rnx-rt .rnx-mdd-wrap{display:block}' +
    '.rnx-rt .rnx-mdd-btn{height:22px!important;min-height:0!important;padding:0 4px!important;font-size:11px;width:100%;min-width:unset;line-height:1}' +
    // Added Value output row — Indigo
    '.rnx-rt-out .rnx-rt-td{background:rgba(99,102,241,.07);border-bottom:none}' +
    '.rnx-rt-out .rnx-rt-lbl{color:#4f46e5;font-weight:600}' +
    '.rnx-rt-out .rnx-rt-val{color:#4f46e5;font-size:13px;font-weight:700}' +
    // Total Cost row — Orange / Peach
    '.rnx-rt-total .rnx-rt-td{background:rgba(249,115,22,.07);border-bottom:none}' +
    '.rnx-rt-total .rnx-rt-lbl{color:#ea580c;font-weight:600}' +
    '.rnx-rt-total .rnx-rt-val{color:#ea580c;font-size:13px;font-weight:700}' +
    // ROI row — standalone, green/red set dynamically by JS
    '.rnx-rt-roi-wrap{display:flex;align-items:center;justify-content:space-between;margin-top:16px;margin-bottom:0;padding:4px 12px;height:34px;background:var(--bg);border:1px solid var(--border);border-radius:12px;box-sizing:border-box;transition:background .2s}' +
    '.rnx-rt-roi-lbl{font-size:12px;font-weight:600;color:var(--muted)}' +
    '.rnx-rt-roi-val{font-size:13px;font-weight:700;font-variant-numeric:tabular-nums;color:var(--faint)}' +
    // Driver ↔ template separator
    '.rnx-rt-driver-sep{border:none;border-top:1px solid var(--border);margin:14px 0 16px}' +
    // Eye icon on ROI table cell
    '.rnx-roi-eye{transition:opacity .15s,color .15s}' +
    '.rnx-roi-eye:hover{opacity:1!important;color:var(--text)!important}' +
    // Benefits placeholder — matches app-wide loader style
    '.rnx-roi-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:36px 0;font-size:13px;color:var(--muted)}' +
    '@keyframes rnxRoiSpin{to{transform:rotate(360deg)}}';
  document.head.appendChild(s);
})();

function rnxRoiSelectDriver(driverName) {
  rnxMddSet('rnxi-driver', driverName);
  rnxModalStep2Data.driver = driverName;

  var area = document.getElementById('rnx-roi-template-area');
  if (!area) return;

  if (!driverName) {
    area.innerHTML = '<div class="rnx-roi-empty">Select a Driver to load the ROI template.</div>';
    return;
  }

  var driver = (rnxRefData.drivers || []).filter(function(d) { return d.name === driverName; })[0];
  var slug   = driver && (driver.templateSlug || driver.template_slug);

  if (!slug || !ROI_TEMPLATES[slug]) {
    area.innerHTML = '<div class="rnx-roi-empty">No ROI template configured for this driver yet.</div>';
    return;
  }

  rnxModalStep2Data.driverSlug = slug;
  area.innerHTML = rnxRoiRenderTemplate(slug);

  var tplForRestore = ROI_TEMPLATES[slug];
  if (tplForRestore && tplForRestore.customRender) {
    // Restore user inputs if editing an existing initiative
    if (rnxModalStep2Data.roiValues) {
      if (slug === 'revenue_generating') {
        if (typeof rnxRoiRevGenRestore      === 'function') rnxRoiRevGenRestore(rnxModalStep2Data.roiValues);
      } else if (slug === 'op_efficiency') {
        if (typeof rnxRoiOpEffRestore       === 'function') rnxRoiOpEffRestore(rnxModalStep2Data.roiValues);
      } else if (slug === 'tech_scaling') {
        if (typeof rnxRoiTechScalingRestore === 'function') rnxRoiTechScalingRestore(rnxModalStep2Data.roiValues);
      } else if (slug === 'strategic') {
        if (typeof rnxRoiStrategicRestore   === 'function') rnxRoiStrategicRestore(rnxModalStep2Data.roiValues);
      } else if (slug === 'enhancements') {
        if (typeof rnxRoiEnhRestore         === 'function') rnxRoiEnhRestore(rnxModalStep2Data.roiValues);
      }
    }
    // Always run calc for custom templates — populates assumption-driven outputs on first open too
    rnxRoiCalc();
  } else if (rnxModalStep2Data.roiValues) {
    rnxRoiRestoreValues(slug, rnxModalStep2Data.roiValues);
    rnxRoiLiveCalc(slug);
  }

  // Wire input listeners for generic templates (custom renders use oninput directly)
  var tpl = ROI_TEMPLATES[slug];
  if (tpl && !tpl.customRender) {
    area.querySelectorAll('.rnx-roi-inp').forEach(function(inp) {
      inp.addEventListener('input', function() { rnxRoiLiveCalc(slug); });
    });
  }
}

function rnxRoiRenderTemplate(slug) {
  var tpl = ROI_TEMPLATES[slug];
  if (!tpl) return '';

  // Templates with a custom layout delegate entirely to their render function
  if (typeof tpl.customRender === 'function') {
    return tpl.customRender(rnxRefData ? rnxRefData.assumptions : []);
  }

  // Generic two-section renderer
  var benefits = tpl.inputs.filter(function(i) { return i.section !== 'cost' && i.key !== 'project_cost'; });
  var costs    = tpl.inputs.filter(function(i) { return i.section === 'cost'  || i.key === 'project_cost'; });

  var html = '';
  if (benefits.length) html += rnxRoiSection('benefit', 'Benefits', benefits);
  if (costs.length)    html += rnxRoiSection('cost',    'Costs',    costs);
  return html;
}

function rnxRoiSection(type, title, inputs) {
  return '<div class="rnx-roi-section">'
    + '<div class="rnx-roi-section-hd">'
    +   '<span class="rnx-roi-dot ' + type + '"></span>'
    +   '<span>' + title + '</span>'
    + '</div>'
    + '<div class="rnx-roi-grid">'
    + inputs.map(rnxRoiFieldHtml).join('')
    + '</div>'
    + '</div>';
}

function rnxRoiFieldHtml(inp) {
  var isDollar = inp.unit === 'dollar';
  var isPct    = inp.unit === 'percent';
  var inputEl;

  if (isDollar) {
    inputEl = '<div class="rnx-roi-input-wrap">'
      + '<span class="rnx-roi-sym">$</span>'
      + '<input type="number" id="rnxroi-' + inp.key + '" class="rnx-roi-inp has-prefix"'
      + ' placeholder="' + (inp.placeholder || '') + '" min="0" step="any">'
      + '</div>';
  } else if (isPct) {
    inputEl = '<div class="rnx-roi-input-wrap">'
      + '<input type="number" id="rnxroi-' + inp.key + '" class="rnx-roi-inp has-suffix"'
      + ' placeholder="' + (inp.placeholder || '') + '" min="0" max="100" step="any">'
      + '<span class="rnx-roi-sym suffix">%</span>'
      + '</div>';
  } else {
    inputEl = '<input type="number" id="rnxroi-' + inp.key + '" class="rnx-roi-inp"'
      + ' placeholder="' + (inp.placeholder || '') + '" min="0" step="any">';
  }

  return '<div class="rnx-roi-field">'
    + '<label class="rnx-roi-lbl" for="rnxroi-' + inp.key + '">' + inp.label + '</label>'
    + inputEl
    + (inp.helper ? '<div class="rnx-roi-hint">' + inp.helper + '</div>' : '')
    + '</div>';
}

function rnxRoiLiveCalc(slug) {
  var tpl = ROI_TEMPLATES[slug];
  if (!tpl) return;
  var values = {};
  tpl.inputs.forEach(function(inp) {
    var el = document.getElementById('rnxroi-' + inp.key);
    if (el) values[inp.key] = parseFloat(el.value) || 0;
  });
  rnxModalStep2Data.roiValues = values;
  var result = roiCalculate(slug, values);
  if (result) {
    rnxModalStep2Data.roi        = result.roi;
    rnxModalStep2Data.addedValue = result.addedValue;
  }
}

function rnxRoiRestoreValues(slug, values) {
  var tpl = ROI_TEMPLATES[slug];
  if (!tpl || !values) return;
  tpl.inputs.forEach(function(inp) {
    var el = document.getElementById('rnxroi-' + inp.key);
    if (el && values[inp.key]) el.value = values[inp.key];
  });
}

function rnxRoiGetData() {
  var driverName = (document.getElementById('rnxi-driver') || {}).value || '';
  var driver     = (rnxRefData.drivers || []).filter(function(d) { return d.name === driverName; })[0];
  var slug       = driver && (driver.templateSlug || driver.template_slug);
  var tpl        = slug && ROI_TEMPLATES[slug];
  var values     = {};
  if (tpl) {
    tpl.inputs.forEach(function(inp) {
      var el = document.getElementById('rnxroi-' + inp.key);
      if (el) values[inp.key] = parseFloat(el.value) || 0;
    });
  }
  var result = tpl ? roiCalculate(slug, values) : null;
  return {
    driver:     driverName,
    roiValues:  values,
    roi:        result ? result.roi        : null,
    addedValue: result ? result.addedValue : null
  };
}

function rnxRoiBuildStep2(drivers) {
  var LB   = 'display:block;font-size:11px;font-weight:500;color:var(--muted);margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px';
  var GR   = 'margin-bottom:14px';
  var CHEV = '<svg class="rnx-mdd-chev" width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function esc(s) { return (s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }

  var driverOpts = '<div class="rnx-mdd-opt" data-val="" onclick="rnxRoiSelectDriver(\'\')">'
    + '<span class="rnx-mdd-text" style="color:var(--muted)">—</span></div>'
    + (drivers || []).map(function(d) {
        return '<div class="rnx-mdd-opt" data-val="' + esc(d.name) + '" onclick="rnxRoiSelectDriver(\'' + esc(d.name) + '\')">'
          + '<span class="rnx-mdd-text">' + d.name + '</span></div>';
      }).join('');

  return '<div id="rnx-modal-step-2" style="display:none">'
    + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">'
    +   '<label style="font-size:11px;font-weight:500;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;white-space:nowrap;flex-shrink:0">Driver</label>'
    +   '<div class="rnx-mdd-wrap" style="flex:1">'
    +     '<button type="button" class="rnx-mdd-btn" onclick="rnxMddToggle(\'rnxi-driver\')">'
    +       '<span class="rnx-mdd-label" id="rnxi-driver-label"><span class="rnx-mdd-text" style="color:var(--muted)">—</span></span>'
    +       CHEV
    +     '</button>'
    +     '<input type="hidden" id="rnxi-driver" value="">'
    +     '<div class="rnx-mdd-panel" id="rnxi-driver-panel">' + driverOpts + '</div>'
    +   '</div>'
    + '</div>'
    + '<hr class="rnx-rt-driver-sep">'
    + '<div id="rnx-roi-template-area">'
    +   '<div class="rnx-roi-empty">Select a Driver to load the ROI template.</div>'
    + '</div>'
    + '</div>';
}

// ── Shared ROI template helpers ────────────────────────────────────────────

var _ROI_TSHIRT = ['XS', 'S', 'M', 'L', 'XL'];
var _rnxRoiOtherCostIdx = 0;
var _ROI_CHEV = '<svg class="rnx-mdd-chev" width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

var _ROI_SAF_TIERS = [
  { val: 'T1', label: 'Tier 1: Game Changer',      pct: '10%' },
  { val: 'T2', label: 'Tier 2: Core Accelerator',  pct: '5%'  },
  { val: 'T3', label: 'Tier 3: Capability Builder', pct: '2%' },
  { val: 'T4', label: 'Tier 4: Tactical Enabler',  pct: '1%'  }
];

function _rnxSafDD(id) {
  var clear = '<div class="rnx-mdd-opt" data-val=""'
    + ' onclick="rnxMddSet(\'' + id + '\',\'\');rnxRoiCalc()">'
    + '<span class="rnx-mdd-text" style="color:var(--faint)">—</span></div>';
  var opts = clear + _ROI_SAF_TIERS.map(function(t) {
    return '<div class="rnx-mdd-opt" data-val="' + t.val + '"'
      + ' onclick="rnxMddSet(\'' + id + '\',\'' + t.val + '\');rnxRoiCalc()">'
      + '<span class="rnx-mdd-text">' + t.label + '</span>'
      + '<span style="font-size:10px;color:var(--faint);margin-left:4px">(' + t.pct + ')</span>'
      + '</div>';
  }).join('');
  return '<div class="rnx-mdd-wrap">'
    + '<button type="button" class="rnx-mdd-btn" onclick="rnxMddToggle(\'' + id + '\')" style="min-width:200px;justify-content:space-between">'
    +   '<span class="rnx-mdd-label" id="' + id + '-label"><span class="rnx-mdd-text" style="color:var(--faint)">—</span></span>'
    +   _ROI_CHEV
    + '</button>'
    + '<input type="hidden" id="' + id + '" value="">'
    + '<div class="rnx-mdd-panel" id="' + id + '-panel">' + opts + '</div>'
    + '</div>';
}

function _rnxTshirtDD(id) {
  var clear = '<div class="rnx-mdd-opt" data-val=""'
    + ' onclick="rnxMddSet(\'' + id + '\',\'\');rnxRoiCalc()">'
    + '<span class="rnx-mdd-text" style="color:var(--faint)">—</span></div>';
  var opts = clear + _ROI_TSHIRT.map(function(sz) {
    return '<div class="rnx-mdd-opt" data-val="' + sz + '"'
      + ' onclick="rnxMddSet(\'' + id + '\',\'' + sz + '\');rnxRoiCalc()">'
      + '<span class="rnx-mdd-text">' + sz + '</span></div>';
  }).join('');
  return '<div class="rnx-mdd-wrap">'
    + '<button type="button" class="rnx-mdd-btn" onclick="rnxMddToggle(\'' + id + '\')">'
    +   '<span class="rnx-mdd-label" id="' + id + '-label"><span class="rnx-mdd-text" style="color:var(--faint)">—</span></span>'
    +   _ROI_CHEV
    + '</button>'
    + '<input type="hidden" id="' + id + '" value="">'
    + '<div class="rnx-mdd-panel" id="' + id + '-panel">' + opts + '</div>'
    + '</div>';
}

function _rnxDollarInp(id, placeholder) {
  return '<div class="rnx-rt-inp-wrap">'
    + '<span class="rnx-rt-sym">$</span>'
    + '<input type="number" id="' + id + '" class="rnx-rt-inp pfx" placeholder="' + (placeholder||'') + '" min="0" step="any" oninput="rnxRoiCalc()">'
    + '</div>';
}

function _rnxPctInp(id, placeholder) {
  return '<div class="rnx-rt-inp-wrap">'
    + '<input type="number" id="' + id + '" class="rnx-rt-inp sfx" placeholder="' + (placeholder||'') + '" min="0" max="100" step="any" oninput="rnxRoiCalc()">'
    + '<span class="rnx-rt-sym suf">%</span>'
    + '</div>';
}

function _rnxRoSpan(id) {
  return '<span class="rnx-rt-val" id="' + id + '">—</span>';
}

// ── Shared Costs table (identical for all templates) ──────────────────────

function rnxRoiCostsHtml() {
  return '<div class="rnx-rt-wrap" style="margin-top:16px">'
    + '<table class="rnx-rt" cellspacing="0">'
    + '<colgroup><col><col style="width:70px"><col style="width:64px"><col style="width:180px"></colgroup>'
    + '<tr><td colspan="4" class="rnx-rt-sec rnx-rt-sec-first">Costs</td></tr>'
    + '<tr>'
    +   '<th class="rnx-rt-th">Development Costs</th>'
    +   '<th class="rnx-rt-th" style="text-align:center;padding-left:0;padding-right:4px">Size</th>'
    +   '<th class="rnx-rt-th" style="text-align:right">Days</th>'
    +   '<th class="rnx-rt-th" style="text-align:right">Cost</th>'
    + '</tr>'
    + '<tr>'
    +   '<td class="rnx-rt-td"><span class="rnx-rt-lbl">Engineering</span></td>'
    +   '<td class="rnx-rt-td" style="padding-left:0;padding-right:4px">' + _rnxTshirtDD('rnxroi-eng_size') + '</td>'
    +   '<td class="rnx-rt-td" style="text-align:right">' + _rnxRoSpan('rnxroi-eng_days') + '</td>'
    +   '<td class="rnx-rt-td" style="text-align:right">' + _rnxRoSpan('rnxroi-eng_cost') + '</td>'
    + '</tr>'
    + '<tr>'
    +   '<td class="rnx-rt-td"><span class="rnx-rt-lbl">Design</span></td>'
    +   '<td class="rnx-rt-td" style="padding-left:0;padding-right:4px">' + _rnxTshirtDD('rnxroi-des_size') + '</td>'
    +   '<td class="rnx-rt-td" style="text-align:right">' + _rnxRoSpan('rnxroi-des_days') + '</td>'
    +   '<td class="rnx-rt-td" style="text-align:right">' + _rnxRoSpan('rnxroi-des_cost') + '</td>'
    + '</tr>'
    + '<tr>'
    +   '<td class="rnx-rt-td"><span class="rnx-rt-lbl">Product</span></td>'
    +   '<td class="rnx-rt-td"></td>'
    +   '<td class="rnx-rt-td" style="text-align:right">' + _rnxRoSpan('rnxroi-prd_days') + '</td>'
    +   '<td class="rnx-rt-td" style="text-align:right">' + _rnxRoSpan('rnxroi-prd_cost') + '</td>'
    + '</tr>'
    + '<tr>'
    +   '<th class="rnx-rt-th" colspan="3">Other Costs</th>'
    +   '<th class="rnx-rt-th" style="text-align:right">'
    +     '<button type="button" onclick="rnxRoiEnhAddOtherCost()"'
    +       ' style="background:none;border:none;color:#ea580c;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;padding:0;letter-spacing:.1px">+ Add</button>'
    +   '</th>'
    + '</tr>'
    + '<tbody id="rnxroi-other_costs_body"></tbody>'
    + '<tr class="rnx-rt-total">'
    +   '<td class="rnx-rt-td" colspan="3"><span class="rnx-rt-lbl">Total Cost</span></td>'
    +   '<td class="rnx-rt-td" style="text-align:right;padding-right:12px">' + _rnxRoSpan('rnxroi-total_cost_out') + '</td>'
    + '</tr>'
    + '</table>'
    + '</div>';
}

// ── Shared ROI row ─────────────────────────────────────────────────────────

function rnxRoiRowHtml() {
  return '<div class="rnx-rt-roi-wrap">'
    + '<span class="rnx-rt-roi-lbl">ROI</span>'
    + '<span class="rnx-rt-roi-val" id="rnxroi-roi_out">—</span>'
    + '</div>';
}

// ── Operational Efficiency — dual ROI row (1Y + 3Y) ───────────────────────
function rnxRoiOpEffRowHtml() {
  return '<div style="margin-top:16px;border:1px solid var(--border);border-radius:12px;background:var(--bg);overflow:hidden;transition:background .2s">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 12px;height:34px">'
    +   '<span class="rnx-rt-roi-lbl">ROI — 1Y</span>'
    +   '<span class="rnx-rt-roi-val" id="rnxroi-roi_1y_out">—</span>'
    + '</div>'
    + '<div style="height:1px;background:var(--border);margin:0 12px"></div>'
    + '<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 12px;height:34px">'
    +   '<span class="rnx-rt-roi-lbl">ROI — 3Y</span>'
    +   '<span class="rnx-rt-roi-val" id="rnxroi-roi_3y_out">—</span>'
    + '</div>'
    + '</div>';
}

// ── Benefits placeholder (used by templates pending their Benefits section) ─

// ── Revenue Generating — Benefits block ───────────────────────────────────

function rnxRoiRevGenBenefitsHtml() {
  return '<div class="rnx-rt-wrap">'
    + '<table class="rnx-rt" cellspacing="0">'
    + '<colgroup><col><col style="width:180px"></colgroup>'
    + '<tr><td colspan="2" class="rnx-rt-sec rnx-rt-sec-first">Benefits</td></tr>'
    + '<tr>'
    +   '<td class="rnx-rt-td"><span class="rnx-rt-lbl">Additional Revenue (12 months forecast)</span></td>'
    +   '<td class="rnx-rt-td">' + _rnxDollarInp('rnxroi-additional_revenue_12m', '0') + '</td>'
    + '</tr>'
    + '</table>'
    + '</div>';
}

// ── Revenue Generating — live calculation ─────────────────────────────────

function rnxRoiRevGenCalc() {
  var asms = rnxRefData ? (rnxRefData.assumptions || []) : [];

  function getAsm(namePart) {
    var lc = namePart.toLowerCase();
    var a = asms.filter(function(x) { return x.name.toLowerCase().indexOf(lc) !== -1; })[0];
    return a ? (parseFloat(a.value) || 0) : 0;
  }

  function setSpan(id, val, isDollar) {
    var el = document.getElementById(id);
    if (!el) return;
    if (!val) { el.textContent = '—'; return; }
    el.textContent = isDollar
      ? '$' + Number(val).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
      : val;
  }

  // ── Benefits ────────────────────────────────────────────────────────────
  var addedValue = parseFloat((document.getElementById('rnxroi-additional_revenue_12m') || {}).value) || 0;

  // ── Engineering ─────────────────────────────────────────────────────────
  var engSize = ((document.getElementById('rnxroi-eng_size') || {}).value || '').toUpperCase();
  var engDays = 0;
  if (engSize) {
    var sz = engSize.toLowerCase();
    engDays = getAsm('engineering t-shirt sizing - ' + sz) || getAsm('engineering t-shirt ' + sz)
           || getAsm('eng t-shirt ' + sz) || getAsm('engineering ' + sz) || getAsm('t-shirt ' + sz);
  }
  var engRate = getAsm('daily cost per engineer') || getAsm('cost per engineer')
             || getAsm('engineering daily rate')  || getAsm('engineering daily');
  var engCost = engDays * engRate;
  setSpan('rnxroi-eng_days', engDays || null);
  setSpan('rnxroi-eng_cost', engCost || null, true);

  // ── Design ──────────────────────────────────────────────────────────────
  var desSize = ((document.getElementById('rnxroi-des_size') || {}).value || '').toUpperCase();
  var desDays = 0;
  if (desSize) {
    var dsz = desSize.toLowerCase();
    desDays = getAsm('design t-shirt sizing - ' + dsz) || getAsm('design t-shirt ' + dsz)
           || getAsm('des t-shirt ' + dsz) || getAsm('design ' + dsz) || getAsm('t-shirt ' + dsz);
  }
  var desRate = getAsm('daily cost per designer') || getAsm('cost per designer')
             || getAsm('design daily rate')       || getAsm('design daily');
  var desCost = desDays * desRate;
  setSpan('rnxroi-des_days', desDays || null);
  setSpan('rnxroi-des_cost', desCost || null, true);

  // ── Product ──────────────────────────────────────────────────────────────
  var engPmRatio = getAsm('ratio engineer:pm') || getAsm('ratio engineer pm')
                || getAsm('engineer:pm')        || getAsm('engineer pm ratio');
  var prdDays = (engPmRatio > 0 && engDays > 0) ? engDays / engPmRatio : 0;
  var prdRate = getAsm('daily cost per pm') || getAsm('daily cost per product manager')
             || getAsm('cost per pm')       || getAsm('product daily rate') || getAsm('product daily');
  var prdCost = prdDays * prdRate;
  setSpan('rnxroi-prd_days', prdDays ? Math.floor(prdDays) : null);
  setSpan('rnxroi-prd_cost', prdCost || null, true);

  // ── Other Costs ──────────────────────────────────────────────────────────
  var otherCost = 0;
  var ocBody = document.getElementById('rnxroi-other_costs_body');
  if (ocBody) {
    ocBody.querySelectorAll('input[type="number"]').forEach(function(inp) {
      otherCost += parseFloat(inp.value) || 0;
    });
  }

  // ── Total & ROI ──────────────────────────────────────────────────────────
  var totalCost = engCost + desCost + prdCost + otherCost;
  setSpan('rnxroi-total_cost_out', totalCost || null, true);

  var roiEl   = document.getElementById('rnxroi-roi_out');
  var roiWrap = roiEl && roiEl.closest('.rnx-rt-roi-wrap');
  if (roiEl) {
    if (totalCost > 0 && addedValue) {
      var roiPct = ((addedValue - totalCost) / totalCost * 100);
      roiEl.textContent = (roiPct > 0 ? '+' : '') + roiPct.toFixed(1) + '%';
      roiEl.style.color = roiPct >= 0 ? '#16a34a' : '#dc2626';
      if (roiWrap) { roiWrap.style.background = roiPct >= 0 ? 'rgba(34,197,94,.07)' : 'rgba(220,38,38,.07)'; }
    } else {
      roiEl.textContent = '—';
      roiEl.style.color = '';
      if (roiWrap) { roiWrap.style.background = ''; }
    }
  }

  // ── Persist ──────────────────────────────────────────────────────────────
  if (typeof rnxModalStep2Data !== 'undefined') {
    rnxModalStep2Data.addedValue = addedValue;
    rnxModalStep2Data.roi        = totalCost > 0 ? (addedValue - totalCost) / totalCost : 0;
    rnxModalStep2Data.roiValues  = {
      additional_revenue_12m: addedValue,
      eng_size: engSize,           des_size: desSize,
      eng_days: engDays,           des_days: desDays, prd_days: Math.floor(prdDays),
      eng_cost: engCost, des_cost: desCost, prd_cost: prdCost, other_cost: otherCost
    };
  }
}

// ── Revenue Generating — restore form from saved values ───────────────────

function rnxRoiRevGenRestore(values) {
  if (!values) return;
  var rev = document.getElementById('rnxroi-additional_revenue_12m');
  if (rev && values.additional_revenue_12m) rev.value = values.additional_revenue_12m;
  if (values.eng_size) rnxMddSet('rnxroi-eng_size', values.eng_size);
  if (values.des_size) rnxMddSet('rnxroi-des_size', values.des_size);
}

// ── Operational Efficiency — Benefits block ───────────────────────────────

function rnxRoiOpEffBenefitsHtml() {
  return '<div class="rnx-rt-wrap">'
    + '<table class="rnx-rt" cellspacing="0">'
    + '<colgroup><col><col style="width:70px"><col style="width:64px"><col style="width:180px"></colgroup>'
    + '<tr><td colspan="4" class="rnx-rt-sec rnx-rt-sec-first">Benefits</td></tr>'

    + '<tr>'
    +   '<th class="rnx-rt-th">Staff time saved</th>'
    +   '<th class="rnx-rt-th" style="text-align:center;padding-left:0;padding-right:4px"></th>'
    +   '<th class="rnx-rt-th"></th>'
    +   '<th class="rnx-rt-th" style="text-align:right">Saving</th>'
    + '</tr>'

    + '<tr>'
    +   '<td class="rnx-rt-td"><span class="rnx-rt-lbl">Weekly hours saved</span></td>'
    +   '<td class="rnx-rt-td" style="padding-left:0;padding-right:4px"><div class="rnx-rt-inp-wrap"><input type="number" id="rnxroi-weekly_hours_saved" class="rnx-rt-inp" style="text-align:center" placeholder="0" min="0" step="any" oninput="rnxRoiCalc()"></div></td>'
    +   '<td class="rnx-rt-td"><span class="rnx-rt-val" style="font-size:11px;white-space:nowrap">Weekly saving x employee</span></td>'
    +   '<td class="rnx-rt-td" style="text-align:right">' + _rnxRoSpan('rnxroi-weekly_saving_per_emp') + '</td>'
    + '</tr>'

    + '<tr>'
    +   '<td class="rnx-rt-td"><span class="rnx-rt-lbl">Employees impacted</span></td>'
    +   '<td class="rnx-rt-td" style="padding-left:0;padding-right:4px"><div class="rnx-rt-inp-wrap"><input type="number" id="rnxroi-employees_impacted" class="rnx-rt-inp" style="text-align:center" placeholder="0" min="0" step="any" oninput="rnxRoiCalc()"></div></td>'
    +   '<td class="rnx-rt-td"><span class="rnx-rt-val" style="font-size:11px;white-space:nowrap">Weekly saving totale</span></td>'
    +   '<td class="rnx-rt-td" style="text-align:right">' + _rnxRoSpan('rnxroi-weekly_saving_total') + '</td>'
    + '</tr>'

    + '<tr class="rnx-rt-out">'
    +   '<td class="rnx-rt-td" colspan="3"><span class="rnx-rt-lbl">Yearly savings</span></td>'
    +   '<td class="rnx-rt-td" style="text-align:right">' + _rnxRoSpan('rnxroi-yearly_savings') + '</td>'
    + '</tr>'

    + '<tr class="rnx-rt-out">'
    +   '<td class="rnx-rt-td" colspan="3"><span class="rnx-rt-lbl">3-Year savings</span></td>'
    +   '<td class="rnx-rt-td" style="text-align:right;padding-right:12px">' + _rnxRoSpan('rnxroi-three_y_savings') + '</td>'
    + '</tr>'

    + '</table>'
    + '</div>';
}

// ── Operational Efficiency — live calculation ─────────────────────────────

function rnxRoiOpEffCalc() {
  var asms = rnxRefData ? (rnxRefData.assumptions || []) : [];

  function getAsm(namePart) {
    var lc = namePart.toLowerCase();
    var a = asms.filter(function(x) { return x.name.toLowerCase().indexOf(lc) !== -1; })[0];
    return a ? (parseFloat(a.value) || 0) : 0;
  }

  function setSpan(id, val, isDollar) {
    var el = document.getElementById(id);
    if (!el) return;
    if (!val && val !== 0) { el.textContent = '—'; return; }
    el.textContent = isDollar
      ? '$' + Number(val).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
      : String(val);
  }

  // ── Benefits ────────────────────────────────────────────────────────────
  var weeklyHours  = parseFloat((document.getElementById('rnxroi-weekly_hours_saved')  || {}).value) || 0;
  var numEmployees = parseFloat((document.getElementById('rnxroi-employees_impacted')  || {}).value) || 0;

  var hourlyRate = getAsm('hourly cost for staff')
                || getAsm('hourly cost')
                || getAsm('hourly rate');

  var weeklyPerEmp  = weeklyHours * hourlyRate;
  var weeklyTotal   = weeklyPerEmp * numEmployees;
  var yearlySavings = weeklyTotal * 52;
  var threeYSavings = yearlySavings * 3;

  setSpan('rnxroi-weekly_saving_per_emp', weeklyPerEmp  || null, true);
  setSpan('rnxroi-weekly_saving_total',   weeklyTotal   || null, true);
  setSpan('rnxroi-yearly_savings',        yearlySavings || null, true);
  setSpan('rnxroi-three_y_savings',       threeYSavings || null, true);

  var addedValue = yearlySavings;

  // ── Engineering ─────────────────────────────────────────────────────────
  var engSize = ((document.getElementById('rnxroi-eng_size') || {}).value || '').toUpperCase();
  var engDays = 0;
  if (engSize) {
    var sz = engSize.toLowerCase();
    engDays = getAsm('engineering t-shirt sizing - ' + sz) || getAsm('engineering t-shirt ' + sz)
           || getAsm('eng t-shirt ' + sz) || getAsm('engineering ' + sz) || getAsm('t-shirt ' + sz);
  }
  var engRate = getAsm('daily cost per engineer') || getAsm('cost per engineer')
             || getAsm('engineering daily rate')  || getAsm('engineering daily');
  var engCost = engDays * engRate;
  setSpan('rnxroi-eng_days', engDays || null);
  setSpan('rnxroi-eng_cost', engCost || null, true);

  // ── Design ──────────────────────────────────────────────────────────────
  var desSize = ((document.getElementById('rnxroi-des_size') || {}).value || '').toUpperCase();
  var desDays = 0;
  if (desSize) {
    var dsz = desSize.toLowerCase();
    desDays = getAsm('design t-shirt sizing - ' + dsz) || getAsm('design t-shirt ' + dsz)
           || getAsm('des t-shirt ' + dsz) || getAsm('design ' + dsz) || getAsm('t-shirt ' + dsz);
  }
  var desRate = getAsm('daily cost per designer') || getAsm('cost per designer')
             || getAsm('design daily rate')       || getAsm('design daily');
  var desCost = desDays * desRate;
  setSpan('rnxroi-des_days', desDays || null);
  setSpan('rnxroi-des_cost', desCost || null, true);

  // ── Product ──────────────────────────────────────────────────────────────
  var engPmRatio = getAsm('ratio engineer:pm') || getAsm('ratio engineer pm')
                || getAsm('engineer:pm')        || getAsm('engineer pm ratio');
  var prdDays = (engPmRatio > 0 && engDays > 0) ? engDays / engPmRatio : 0;
  var prdRate = getAsm('daily cost per pm') || getAsm('daily cost per product manager')
             || getAsm('cost per pm')       || getAsm('product daily rate') || getAsm('product daily');
  var prdCost = prdDays * prdRate;
  setSpan('rnxroi-prd_days', prdDays ? Math.floor(prdDays) : null);
  setSpan('rnxroi-prd_cost', prdCost || null, true);

  // ── Other Costs ──────────────────────────────────────────────────────────
  var otherCost = 0;
  var ocBody = document.getElementById('rnxroi-other_costs_body');
  if (ocBody) {
    ocBody.querySelectorAll('input[type="number"]').forEach(function(inp) {
      otherCost += parseFloat(inp.value) || 0;
    });
  }

  // ── Total & ROI ──────────────────────────────────────────────────────────
  var totalCost = engCost + desCost + prdCost + otherCost;
  setSpan('rnxroi-total_cost_out', totalCost || null, true);

  function setRoiEl(elId, benefit) {
    var el = document.getElementById(elId);
    if (!el) return;
    if (totalCost > 0 && benefit) {
      var pct = ((benefit - totalCost) / totalCost * 100);
      el.textContent = (pct > 0 ? '+' : '') + pct.toFixed(1) + '%';
      el.style.color = pct >= 0 ? '#16a34a' : '#dc2626';
    } else {
      el.textContent = '—';
      el.style.color = '';
    }
  }

  setRoiEl('rnxroi-roi_1y_out', yearlySavings);
  setRoiEl('rnxroi-roi_3y_out', threeYSavings);

  // ── Persist (1Y as primary ROI for the table) ─────────────────────────────
  if (typeof rnxModalStep2Data !== 'undefined') {
    rnxModalStep2Data.addedValue = yearlySavings;
    rnxModalStep2Data.roi        = totalCost > 0 ? (yearlySavings - totalCost) / totalCost : 0;
    rnxModalStep2Data.roiValues  = {
      weekly_hours_saved:  weeklyHours,
      employees_impacted:  numEmployees,
      eng_size: engSize,           des_size: desSize,
      eng_days: engDays,           des_days: desDays, prd_days: Math.floor(prdDays),
      eng_cost: engCost, des_cost: desCost, prd_cost: prdCost, other_cost: otherCost
    };
  }
}

// ── Operational Efficiency — restore form from saved values ───────────────

function rnxRoiOpEffRestore(values) {
  if (!values) return;
  var wh  = document.getElementById('rnxroi-weekly_hours_saved');
  var emp = document.getElementById('rnxroi-employees_impacted');
  if (wh  && values.weekly_hours_saved)  wh.value  = values.weekly_hours_saved;
  if (emp && values.employees_impacted)  emp.value = values.employees_impacted;
  if (values.eng_size) rnxMddSet('rnxroi-eng_size', values.eng_size);
  if (values.des_size) rnxMddSet('rnxroi-des_size', values.des_size);
}

// ── Tech Scaling — Benefits (identical to OpEff, header = "Engineering time saved") ──

function rnxRoiTechScalingBenefitsHtml() {
  return '<div class="rnx-rt-wrap">'
    + '<table class="rnx-rt" cellspacing="0">'
    + '<colgroup><col><col style="width:70px"><col style="width:64px"><col style="width:180px"></colgroup>'
    + '<tr><td colspan="4" class="rnx-rt-sec rnx-rt-sec-first">Benefits</td></tr>'

    + '<tr>'
    +   '<th class="rnx-rt-th">Engineering time saved</th>'
    +   '<th class="rnx-rt-th" style="text-align:center;padding-left:0;padding-right:4px"></th>'
    +   '<th class="rnx-rt-th"></th>'
    +   '<th class="rnx-rt-th" style="text-align:right">Saving</th>'
    + '</tr>'

    + '<tr>'
    +   '<td class="rnx-rt-td"><span class="rnx-rt-lbl">Weekly hours saved</span></td>'
    +   '<td class="rnx-rt-td" style="padding-left:0;padding-right:4px"><div class="rnx-rt-inp-wrap"><input type="number" id="rnxroi-weekly_hours_saved" class="rnx-rt-inp" style="text-align:center" placeholder="0" min="0" step="any" oninput="rnxRoiCalc()"></div></td>'
    +   '<td class="rnx-rt-td"><span class="rnx-rt-val" style="font-size:11px;white-space:nowrap">Weekly saving x employee</span></td>'
    +   '<td class="rnx-rt-td" style="text-align:right">' + _rnxRoSpan('rnxroi-weekly_saving_per_emp') + '</td>'
    + '</tr>'

    + '<tr>'
    +   '<td class="rnx-rt-td"><span class="rnx-rt-lbl">Employees impacted</span></td>'
    +   '<td class="rnx-rt-td" style="padding-left:0;padding-right:4px"><div class="rnx-rt-inp-wrap"><input type="number" id="rnxroi-employees_impacted" class="rnx-rt-inp" style="text-align:center" placeholder="0" min="0" step="any" oninput="rnxRoiCalc()"></div></td>'
    +   '<td class="rnx-rt-td"><span class="rnx-rt-val" style="font-size:11px;white-space:nowrap">Weekly saving totale</span></td>'
    +   '<td class="rnx-rt-td" style="text-align:right">' + _rnxRoSpan('rnxroi-weekly_saving_total') + '</td>'
    + '</tr>'

    + '<tr class="rnx-rt-out">'
    +   '<td class="rnx-rt-td" colspan="3"><span class="rnx-rt-lbl">Yearly savings</span></td>'
    +   '<td class="rnx-rt-td" style="text-align:right">' + _rnxRoSpan('rnxroi-yearly_savings') + '</td>'
    + '</tr>'

    + '<tr class="rnx-rt-out">'
    +   '<td class="rnx-rt-td" colspan="3"><span class="rnx-rt-lbl">3-Year savings</span></td>'
    +   '<td class="rnx-rt-td" style="text-align:right;padding-right:12px">' + _rnxRoSpan('rnxroi-three_y_savings') + '</td>'
    + '</tr>'

    + '</table>'
    + '</div>';
}

function rnxRoiTechScalingCalc() {
  var asms = rnxRefData ? (rnxRefData.assumptions || []) : [];

  function getAsm(namePart) {
    var lc = namePart.toLowerCase();
    var a = asms.filter(function(x) { return x.name.toLowerCase().indexOf(lc) !== -1; })[0];
    return a ? (parseFloat(a.value) || 0) : 0;
  }

  function setSpan(id, val, isDollar) {
    var el = document.getElementById(id);
    if (!el) return;
    if (!val && val !== 0) { el.textContent = '—'; return; }
    el.textContent = isDollar
      ? '$' + Number(val).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
      : String(val);
  }

  // ── Benefits ────────────────────────────────────────────────────────────
  var weeklyHours  = parseFloat((document.getElementById('rnxroi-weekly_hours_saved') || {}).value) || 0;
  var numEmployees = parseFloat((document.getElementById('rnxroi-employees_impacted') || {}).value) || 0;

  var hourlyRate = getAsm('hourly cost for engineering')  // "[Tech Debt] - Hourly Cost for Engineering Roles…"
                || getAsm('hourly cost for engineer')
                || getAsm('engineering hourly');

  var weeklyPerEmp  = weeklyHours * hourlyRate;
  var weeklyTotal   = weeklyPerEmp * numEmployees;
  var yearlySavings = weeklyTotal * 52;
  var threeYSavings = yearlySavings * 3;

  setSpan('rnxroi-weekly_saving_per_emp', weeklyPerEmp  || null, true);
  setSpan('rnxroi-weekly_saving_total',   weeklyTotal   || null, true);
  setSpan('rnxroi-yearly_savings',        yearlySavings || null, true);
  setSpan('rnxroi-three_y_savings',       threeYSavings || null, true);

  var addedValue = yearlySavings;

  // ── Engineering ─────────────────────────────────────────────────────────
  var engSize = ((document.getElementById('rnxroi-eng_size') || {}).value || '').toUpperCase();
  var engDays = 0;
  if (engSize) {
    var sz = engSize.toLowerCase();
    engDays = getAsm('engineering t-shirt sizing - ' + sz) || getAsm('engineering t-shirt ' + sz)
           || getAsm('eng t-shirt ' + sz) || getAsm('engineering ' + sz) || getAsm('t-shirt ' + sz);
  }
  var engRate = getAsm('daily cost per engineer') || getAsm('cost per engineer')
             || getAsm('engineering daily rate')  || getAsm('engineering daily');
  var engCost = engDays * engRate;
  setSpan('rnxroi-eng_days', engDays || null);
  setSpan('rnxroi-eng_cost', engCost || null, true);

  // ── Design ──────────────────────────────────────────────────────────────
  var desSize = ((document.getElementById('rnxroi-des_size') || {}).value || '').toUpperCase();
  var desDays = 0;
  if (desSize) {
    var dsz = desSize.toLowerCase();
    desDays = getAsm('design t-shirt sizing - ' + dsz) || getAsm('design t-shirt ' + dsz)
           || getAsm('des t-shirt ' + dsz) || getAsm('design ' + dsz) || getAsm('t-shirt ' + dsz);
  }
  var desRate = getAsm('daily cost per designer') || getAsm('cost per designer')
             || getAsm('design daily rate')       || getAsm('design daily');
  var desCost = desDays * desRate;
  setSpan('rnxroi-des_days', desDays || null);
  setSpan('rnxroi-des_cost', desCost || null, true);

  // ── Product ──────────────────────────────────────────────────────────────
  var engPmRatio = getAsm('ratio engineer:pm') || getAsm('ratio engineer pm')
                || getAsm('engineer:pm')        || getAsm('engineer pm ratio');
  var prdDays = (engPmRatio > 0 && engDays > 0) ? engDays / engPmRatio : 0;
  var prdRate = getAsm('daily cost per pm') || getAsm('daily cost per product manager')
             || getAsm('cost per pm')       || getAsm('product daily rate') || getAsm('product daily');
  var prdCost = prdDays * prdRate;
  setSpan('rnxroi-prd_days', prdDays ? Math.floor(prdDays) : null);
  setSpan('rnxroi-prd_cost', prdCost || null, true);

  // ── Other Costs ──────────────────────────────────────────────────────────
  var otherCost = 0;
  var ocBody = document.getElementById('rnxroi-other_costs_body');
  if (ocBody) {
    ocBody.querySelectorAll('input[type="number"]').forEach(function(inp) {
      otherCost += parseFloat(inp.value) || 0;
    });
  }

  // ── Total & ROI ──────────────────────────────────────────────────────────
  var totalCost = engCost + desCost + prdCost + otherCost;
  setSpan('rnxroi-total_cost_out', totalCost || null, true);

  function setRoiEl(elId, benefit) {
    var el = document.getElementById(elId);
    if (!el) return;
    if (totalCost > 0 && benefit) {
      var pct = ((benefit - totalCost) / totalCost * 100);
      el.textContent = (pct > 0 ? '+' : '') + pct.toFixed(1) + '%';
      el.style.color = pct >= 0 ? '#16a34a' : '#dc2626';
    } else {
      el.textContent = '—';
      el.style.color = '';
    }
  }

  setRoiEl('rnxroi-roi_1y_out', yearlySavings);
  setRoiEl('rnxroi-roi_3y_out', threeYSavings);

  if (typeof rnxModalStep2Data !== 'undefined') {
    rnxModalStep2Data.addedValue = yearlySavings;
    rnxModalStep2Data.roi        = totalCost > 0 ? (yearlySavings - totalCost) / totalCost : 0;
    rnxModalStep2Data.roiValues  = {
      weekly_hours_saved:  weeklyHours,
      employees_impacted:  numEmployees,
      eng_size: engSize,           des_size: desSize,
      eng_days: engDays,           des_days: desDays, prd_days: Math.floor(prdDays),
      eng_cost: engCost, des_cost: desCost, prd_cost: prdCost, other_cost: otherCost
    };
  }
}

function rnxRoiTechScalingRestore(values) { rnxRoiOpEffRestore(values); }

function rnxRoiBenefitsPlaceholder() {
  return '<div class="rnx-rt-wrap">'
    + '<table class="rnx-rt" cellspacing="0">'
    + '<tr><td class="rnx-rt-sec rnx-rt-sec-first">Benefits</td></tr>'
    + '<tr><td class="rnx-rt-td" style="color:var(--faint);font-size:12px;font-style:italic;padding:14px 12px">'
    +   'Benefits template coming soon'
    + '</td></tr>'
    + '</table>'
    + '</div>';
}

// ── Strategic — Benefits block ────────────────────────────────────────────

function rnxRoiStrategicBenefitsHtml() {
  return '<div class="rnx-rt-wrap">'
    + '<table class="rnx-rt" cellspacing="0">'
    + '<colgroup><col><col style="width:70px"><col style="width:64px"><col style="width:180px"></colgroup>'
    + '<tr><td colspan="4" class="rnx-rt-sec rnx-rt-sec-first">Benefits</td></tr>'

    // Row 1: EBITDA + Confidence score (same row)
    + '<tr>'
    +   '<td class="rnx-rt-td" colspan="4">'
    +     '<div style="display:flex;align-items:center;gap:16px">'
    +       '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex:1;min-width:0">'
    +         '<span class="rnx-rt-lbl">EBITDA</span>'
    +         _rnxRoSpan('rnxroi-ebitda')
    +       '</div>'
    +       '<div style="width:1px;height:18px;background:var(--border);flex-shrink:0"></div>'
    +       '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex:1;min-width:0">'
    +         '<span class="rnx-rt-lbl" style="white-space:nowrap">Confidence score</span>'
    +         '<div style="width:100px">' + _rnxPctInp('rnxroi-confidence_score', '50') + '</div>'
    +       '</div>'
    +     '</div>'
    +   '</td>'
    + '</tr>'

    // SAF — Strategic Attribution Factor dropdown + computed % span
    + '<tr>'
    +   '<td class="rnx-rt-td" colspan="4">'
    +     '<div style="display:flex;align-items:center;gap:16px">'
    +       '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex:1;min-width:0">'
    +         '<div class="rnx-tip-wrap">'
    +           '<span class="rnx-rt-lbl" style="white-space:nowrap">Strategic Attribution Factor (SAF)</span>'
    +           '<svg style="margin-left:5px;flex-shrink:0;color:var(--faint)" width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M8 7v5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="4.5" r="0.75" fill="currentColor"/></svg>'
    +           '<div class="rnx-tip">'
    +             '<div style="margin-bottom:6px"><strong>Tier 1: Game Changer (10%)</strong> — Massive projects that transform the business model (e.g., full migration to SaaS).</div>'
    +             '<div style="margin-bottom:6px"><strong>Tier 2: Core Accelerator (5%)</strong> — High-impact initiatives focusing on key areas (e.g., core infrastructure automation).</div>'
    +             '<div style="margin-bottom:6px"><strong>Tier 3: Capability Builder (2%)</strong> — Unlocking new functionalities or technologies (e.g., integrating a new AI module).</div>'
    +             '<div><strong>Tier 4: Tactical Enabler (1%)</strong> — Small strategic enablers (e.g., advanced analytics tools for a specific team).</div>'
    +           '</div>'
    +         '</div>'
    +         _rnxRoSpan('rnxroi-saf')
    +       '</div>'
    +       '<div style="width:1px;height:18px;background:var(--border);flex-shrink:0"></div>'
    +       '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex:1;min-width:0">'
    +         '<span class="rnx-rt-lbl" style="white-space:nowrap;opacity:0">_</span>'
    +         _rnxSafDD('rnxroi-saf_tier')
    +       '</div>'
    +     '</div>'
    +   '</td>'
    + '</tr>'

    // Multiple — stessa struttura flex:1|divider|flex:1 di EBITDA
    + '<tr>'
    +   '<td class="rnx-rt-td" colspan="4">'
    +     '<div style="display:flex;align-items:center;gap:16px">'
    +       '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex:1;min-width:0">'
    +         '<span class="rnx-rt-lbl">Multiple</span>'
    +         '<div style="display:flex;align-items:center;gap:5px">'
    +           '<span style="font-size:10px;color:var(--faint);font-weight:500;white-space:nowrap">Actual</span>'
    +           _rnxRoSpan('rnxroi-multiple_actual')
    +         '</div>'
    +       '</div>'
    +       '<div style="width:1px;height:18px;background:var(--border);flex-shrink:0"></div>'
    +       '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex:1;min-width:0">'
    +         '<div style="display:flex;align-items:center;gap:5px">'
    +           '<span style="font-size:10px;color:var(--faint);font-weight:500;white-space:nowrap">Desired</span>'
    +           _rnxRoSpan('rnxroi-multiple_desired')
    +         '</div>'
    +         '<div style="width:1px;height:14px;background:var(--border);flex-shrink:0"></div>'
    +         '<div style="display:flex;align-items:center;gap:5px">'
    +           '<span style="font-size:10px;color:var(--faint);font-weight:500;white-space:nowrap">Project Δ</span>'
    +           _rnxRoSpan('rnxroi-multiple_gap')
    +         '</div>'
    +         '<div style="width:1px;height:14px;background:var(--border);flex-shrink:0"></div>'
    +         '<div style="display:flex;align-items:center;gap:5px">'
    +           '<span style="font-size:10px;color:var(--faint);font-weight:500;white-space:nowrap">Implied new</span>'
    +           _rnxRoSpan('rnxroi-multiple_adjusted')
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +   '</td>'
    + '</tr>'

    // Added Value — stessa struttura flex:1|divider|flex:1 di EBITDA
    + '<tr class="rnx-rt-out">'
    +   '<td class="rnx-rt-td" colspan="4">'
    +     '<div style="display:flex;align-items:center;gap:16px">'
    +       '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex:1;min-width:0">'
    +         '<span class="rnx-rt-lbl">Added Value</span>'
    +         '<div style="display:flex;align-items:center;gap:5px">'
    +           '<span style="font-size:10px;color:var(--faint);font-weight:500;white-space:nowrap">Market Cap Ante</span>'
    +           '<span id="rnxroi-market_cap_ante" style="font-size:10px;color:var(--faint);font-weight:500;font-variant-numeric:tabular-nums">—</span>'
    +         '</div>'
    +       '</div>'
    +       '<div style="width:1px;height:18px;background:rgba(99,102,241,.25);flex-shrink:0"></div>'
    +       '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex:1;min-width:0">'
    +         '<div style="display:flex;align-items:center;gap:5px">'
    +           '<span style="font-size:10px;color:var(--faint);font-weight:500;white-space:nowrap">Market Cap Post</span>'
    +           '<span id="rnxroi-market_cap_post" style="font-size:10px;color:var(--faint);font-weight:500;font-variant-numeric:tabular-nums">—</span>'
    +         '</div>'
    +         '<span class="rnx-rt-val" id="rnxroi-strategic_added_value">—</span>'
    +       '</div>'
    +     '</div>'
    +   '</td>'
    + '</tr>'

    + '</table>'
    + '</div>';
}

// ── Strategic — live calculation (stub — formulas TBD) ────────────────────

function rnxRoiStrategicCalc() {
  var asms = rnxRefData ? (rnxRefData.assumptions || []) : [];

  function getAsm(namePart) {
    var lc = namePart.toLowerCase();
    var a = asms.filter(function(x) { return x.name.toLowerCase().indexOf(lc) !== -1; })[0];
    return a ? (parseFloat(a.value) || 0) : 0;
  }

  function setSpan(id, val, isDollar) {
    var el = document.getElementById(id);
    if (!el) return;
    if (!val && val !== 0) { el.textContent = '—'; return; }
    el.textContent = isDollar
      ? '$' + Number(val).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
      : String(val);
  }

  // ── Benefits — all from assumptions / inputs ─────────────────────────────
  // EBITDA — read-only span, from assumptions
  var ebitda = getAsm('ebitda');
  setSpan('rnxroi-ebitda', ebitda || null, true);

  var confidenceScore = parseFloat((document.getElementById('rnxroi-confidence_score') || {}).value) || 0;

  // ── SAF — Strategic Attribution Factor (needed before multiples) ─────────
  var safTier = ((document.getElementById('rnxroi-saf_tier') || {}).value || '').toUpperCase();
  var safPct  = 0;
  if (safTier) {
    var tierNum = safTier.replace('T', '');
    safPct = getAsm('strategic attribution factor - tier ' + tierNum)
          || getAsm('saf - tier ' + tierNum)
          || getAsm('saf tier ' + tierNum);
  }
  var safEl = document.getElementById('rnxroi-saf');
  if (safEl) safEl.textContent = safPct ? safPct.toFixed(1) + '%' : '—';

  // ── Multiples — all from assumptions ─────────────────────────────────────
  var multipleActual  = getAsm('multiple - actual')  || getAsm('multiple actual')  || getAsm('actual multiple');
  var multipleDesired = getAsm('multiple - desired')  || getAsm('multiple desired') || getAsm('benchmark')    || getAsm('targeted');
  var rawGap          = (multipleActual || multipleDesired) ? +(multipleDesired - multipleActual).toFixed(4) : 0;
  // Project Δ = (Desired - Actual) × SAF × Confidence
  var projectDelta    = rawGap * (safPct / 100) * (confidenceScore / 100);
  // Implied new = Actual - Project Δ
  var impliedNew      = multipleActual - projectDelta;
  var marketCapAnte   = ebitda * multipleActual;
  var marketCapPost   = ebitda * impliedNew;
  var addedValue      = marketCapPost - marketCapAnte;

  function fmt1(v) { return v ? (+v).toFixed(1) : null; }
  function fmt2(v) { return v ? (+v).toFixed(2) : null; }
  setSpan('rnxroi-multiple_actual',   fmt1(multipleActual));
  setSpan('rnxroi-multiple_desired',  fmt1(multipleDesired));
  setSpan('rnxroi-multiple_gap',      fmt2(projectDelta));
  setSpan('rnxroi-multiple_adjusted', fmt2(impliedNew));
  setSpan('rnxroi-market_cap_ante',   marketCapAnte || null, true);
  setSpan('rnxroi-market_cap_post',   marketCapPost || null, true);

  // Apply SAF to attributed added value (raw delta × SAF%)
  var attributedValue = (safPct > 0 && addedValue) ? addedValue * (safPct / 100) : addedValue;
  setSpan('rnxroi-strategic_added_value', attributedValue || null, true);

  // ── Engineering ─────────────────────────────────────────────────────────
  var engSize = ((document.getElementById('rnxroi-eng_size') || {}).value || '').toUpperCase();
  var engDays = 0;
  if (engSize) {
    var sz = engSize.toLowerCase();
    engDays = getAsm('engineering t-shirt sizing - ' + sz) || getAsm('engineering t-shirt ' + sz)
           || getAsm('eng t-shirt ' + sz) || getAsm('engineering ' + sz) || getAsm('t-shirt ' + sz);
  }
  var engRate = getAsm('daily cost per engineer') || getAsm('cost per engineer')
             || getAsm('engineering daily rate')  || getAsm('engineering daily');
  var engCost = engDays * engRate;
  setSpan('rnxroi-eng_days', engDays || null);
  setSpan('rnxroi-eng_cost', engCost || null, true);

  // ── Design ──────────────────────────────────────────────────────────────
  var desSize = ((document.getElementById('rnxroi-des_size') || {}).value || '').toUpperCase();
  var desDays = 0;
  if (desSize) {
    var dsz = desSize.toLowerCase();
    desDays = getAsm('design t-shirt sizing - ' + dsz) || getAsm('design t-shirt ' + dsz)
           || getAsm('des t-shirt ' + dsz) || getAsm('design ' + dsz) || getAsm('t-shirt ' + dsz);
  }
  var desRate = getAsm('daily cost per designer') || getAsm('cost per designer')
             || getAsm('design daily rate')       || getAsm('design daily');
  var desCost = desDays * desRate;
  setSpan('rnxroi-des_days', desDays || null);
  setSpan('rnxroi-des_cost', desCost || null, true);

  // ── Product ──────────────────────────────────────────────────────────────
  var engPmRatio = getAsm('ratio engineer:pm') || getAsm('ratio engineer pm')
                || getAsm('engineer:pm')        || getAsm('engineer pm ratio');
  var prdDays = (engPmRatio > 0 && engDays > 0) ? engDays / engPmRatio : 0;
  var prdRate = getAsm('daily cost per pm') || getAsm('daily cost per product manager')
             || getAsm('cost per pm')       || getAsm('product daily rate') || getAsm('product daily');
  var prdCost = prdDays * prdRate;
  setSpan('rnxroi-prd_days', prdDays ? Math.floor(prdDays) : null);
  setSpan('rnxroi-prd_cost', prdCost || null, true);

  // ── Other Costs ──────────────────────────────────────────────────────────
  var otherCost = 0;
  var ocBody = document.getElementById('rnxroi-other_costs_body');
  if (ocBody) {
    ocBody.querySelectorAll('input[type="number"]').forEach(function(inp) {
      otherCost += parseFloat(inp.value) || 0;
    });
  }

  // ── Total & ROI ──────────────────────────────────────────────────────────
  var totalCost = engCost + desCost + prdCost + otherCost;
  setSpan('rnxroi-total_cost_out', totalCost || null, true);

  var roiEl   = document.getElementById('rnxroi-roi_out');
  var roiWrap = roiEl && roiEl.closest('.rnx-rt-roi-wrap');
  if (roiEl) {
    if (totalCost > 0 && addedValue) {
      var roiPct = ((addedValue - totalCost) / totalCost * 100);
      roiEl.textContent = (roiPct > 0 ? '+' : '') + roiPct.toFixed(1) + '%';
      roiEl.style.color = roiPct >= 0 ? '#16a34a' : '#dc2626';
      if (roiWrap) { roiWrap.style.background = roiPct >= 0 ? 'rgba(34,197,94,.07)' : 'rgba(220,38,38,.07)'; }
    } else {
      roiEl.textContent = '—';
      roiEl.style.color = '';
      if (roiWrap) { roiWrap.style.background = ''; }
    }
  }

  // ── Persist ──────────────────────────────────────────────────────────────
  if (typeof rnxModalStep2Data !== 'undefined') {
    rnxModalStep2Data.addedValue = addedValue;
    rnxModalStep2Data.roi        = totalCost > 0 ? (addedValue - totalCost) / totalCost : 0;
    rnxModalStep2Data.roiValues  = {
      ebitda:            ebitda,
      confidence_score:  confidenceScore,
      saf_tier:          safTier,
      eng_size: engSize,           des_size: desSize,
      eng_days: engDays,           des_days: desDays, prd_days: Math.floor(prdDays),
      eng_cost: engCost, des_cost: desCost, prd_cost: prdCost, other_cost: otherCost
    };
  }
}

// ── Strategic — restore form from saved values ────────────────────────────

function rnxRoiStrategicRestore(values) {
  if (!values) return;
  var conf = document.getElementById('rnxroi-confidence_score');
  if (conf && values.confidence_score) conf.value = values.confidence_score;
  if (values.saf_tier) rnxMddSet('rnxroi-saf_tier', values.saf_tier);
  if (values.eng_size) rnxMddSet('rnxroi-eng_size', values.eng_size);
  if (values.des_size) rnxMddSet('rnxroi-des_size', values.des_size);
}

// ── Enhancements template — HTML builder ───────────────────────────────────

function rnxRoiEnhHtml(assumptions) {
  _rnxRoiOtherCostIdx = 0;

  var benefits =
    '<div class="rnx-rt-wrap">'
    + '<table class="rnx-rt" cellspacing="0">'
    + '<colgroup><col><col style="width:180px"></colgroup>'
    + '<tr><td colspan="2" class="rnx-rt-sec rnx-rt-sec-first">Benefits</td></tr>'
    + '<tr>'
    +   '<td class="rnx-rt-td"><span class="rnx-rt-lbl">Product Revenue Last Year</span></td>'
    +   '<td class="rnx-rt-td">' + _rnxDollarInp('rnxroi-product_revenue_last_year', '1 000 000') + '</td>'
    + '</tr>'
    + '<tr>'
    +   '<td class="rnx-rt-td"><span class="rnx-rt-lbl">Contribution to Revenue Growth</span></td>'
    +   '<td class="rnx-rt-td">' + _rnxPctInp('rnxroi-contribution_to_revenue_growth', '5') + '</td>'
    + '</tr>'
    + '<tr class="rnx-rt-out">'
    +   '<td class="rnx-rt-td"><span class="rnx-rt-lbl">Added Value</span></td>'
    +   '<td class="rnx-rt-td" style="text-align:right;padding-right:12px">' + _rnxRoSpan('rnxroi-added_value_out') + '</td>'
    + '</tr>'
    + '</table>'
    + '</div>';

  return benefits + rnxRoiCostsHtml() + rnxRoiRowHtml();
}

// ── Other Costs row add / remove ───────────────────────────────────────────

function rnxRoiEnhAddOtherCost() {
  var body = document.getElementById('rnxroi-other_costs_body');
  if (!body) return;
  var idx = ++_rnxRoiOtherCostIdx;
  var tr = document.createElement('tr');
  tr.id = 'rnxroi-oc-row-' + idx;
  tr.innerHTML =
    '<td class="rnx-rt-td" colspan="3">'
    + '<div style="display:flex;align-items:center;gap:6px">'
    +   '<input type="text" class="rnx-rt-inp" style="flex:1;text-align:left"'
    +     ' placeholder="Cost description…" oninput="rnxRoiCalc()">'
    +   '<button type="button" onclick="rnxRoiEnhRemoveOtherCost(' + idx + ')"'
    +     ' style="flex-shrink:0;background:none;border:none;cursor:pointer;color:var(--faint);padding:2px;line-height:0;border-radius:4px" title="Remove">'
    +     '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
    +   '</button>'
    + '</div>'
    + '</td>'
    + '<td class="rnx-rt-td">'
    +   '<div class="rnx-rt-inp-wrap">'
    +     '<span class="rnx-rt-sym">$</span>'
    +     '<input type="number" id="rnxroi-oc-cost-' + idx + '" class="rnx-rt-inp pfx"'
    +       ' placeholder="0" min="0" step="any" oninput="rnxRoiCalc()">'
    +   '</div>'
    + '</td>';
  body.appendChild(tr);
  tr.querySelector('input[type="text"]').focus();
}

function rnxRoiEnhRemoveOtherCost(idx) {
  var row = document.getElementById('rnxroi-oc-row-' + idx);
  if (row && row.parentNode) row.parentNode.removeChild(row);
  rnxRoiCalc();
}

// ── Calc dispatcher — routes to the right calc based on active template ───────
function rnxRoiCalc() {
  var slug = (typeof rnxModalStep2Data !== 'undefined' && rnxModalStep2Data.driverSlug) || '';
  if (slug === 'revenue_generating') { rnxRoiRevGenCalc();        return; }
  if (slug === 'op_efficiency')      { rnxRoiOpEffCalc();         return; }
  if (slug === 'tech_scaling')       { rnxRoiTechScalingCalc();   return; }
  if (slug === 'strategic')          { rnxRoiStrategicCalc();     return; }
  rnxRoiEnhCalc();
}

// ── Enhancements (+ default costs-only) live calculation ───────────────────

function rnxRoiEnhCalc() {
  var asms = rnxRefData ? (rnxRefData.assumptions || []) : [];

  function getAsm(namePart) {
    var lc = namePart.toLowerCase();
    var a = asms.filter(function(x) { return x.name.toLowerCase().indexOf(lc) !== -1; })[0];
    return a ? (parseFloat(a.value) || 0) : 0;
  }

  // All readonly outputs are now <span> elements
  function setSpan(id, val, isDollar) {
    var el = document.getElementById(id);
    if (!el) return;
    if (!val) { el.textContent = '—'; return; }
    el.textContent = isDollar
      ? '$' + Number(val).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
      : val;
  }

  // ── Benefits ────────────────────────────────────────────────────────────
  var rev        = parseFloat((document.getElementById('rnxroi-product_revenue_last_year') || {}).value)      || 0;
  var growth     = parseFloat((document.getElementById('rnxroi-contribution_to_revenue_growth') || {}).value) || 0;
  var addedValue = rev * (growth / 100);
  setSpan('rnxroi-added_value_out', addedValue || null, true);

  // ── Engineering ─────────────────────────────────────────────────────────
  var engSize = ((document.getElementById('rnxroi-eng_size') || {}).value || '').toUpperCase();
  var engDays = 0;
  if (engSize) {
    var sz = engSize.toLowerCase();
    engDays = getAsm('engineering t-shirt sizing - ' + sz)  // "Engineering T-shirt Sizing - XS / ..."
           || getAsm('engineering t-shirt ' + sz)
           || getAsm('eng t-shirt ' + sz)
           || getAsm('engineering ' + sz)
           || getAsm('t-shirt ' + sz);
  }
  var engRate = getAsm('daily cost per engineer')   // "Daily cost per engineer x Initiative"
             || getAsm('cost per engineer')
             || getAsm('engineering daily rate')
             || getAsm('engineering daily');
  var engCost = engDays * engRate;
  setSpan('rnxroi-eng_days', engDays || null);
  setSpan('rnxroi-eng_cost', engCost || null, true);

  // ── Design ──────────────────────────────────────────────────────────────
  var desSize = ((document.getElementById('rnxroi-des_size') || {}).value || '').toUpperCase();
  var desDays = 0;
  if (desSize) {
    var dsz = desSize.toLowerCase();
    desDays = getAsm('design t-shirt sizing - ' + dsz)  // "Design T-shirt Sizing - XS / ..."
           || getAsm('design t-shirt ' + dsz)
           || getAsm('des t-shirt ' + dsz)
           || getAsm('design ' + dsz)
           || getAsm('t-shirt ' + dsz);
  }
  var desRate = getAsm('daily cost per designer')   // "Daily cost per designer x Initiative"
             || getAsm('cost per designer')
             || getAsm('design daily rate')
             || getAsm('design daily');
  var desCost = desDays * desRate;
  setSpan('rnxroi-des_days', desDays || null);
  setSpan('rnxroi-des_cost', desCost || null, true);

  // ── Product — days = engDays ÷ "Ratio Engineer:PM" assumption ──────────────
  var engPmRatio = getAsm('ratio engineer:pm')   // "Ratio Engineer:PM"
               || getAsm('ratio engineer pm')
               || getAsm('engineer:pm')
               || getAsm('engineer pm ratio');
  var prdDays = (engPmRatio > 0 && engDays > 0) ? engDays / engPmRatio : 0;
  var prdRate = getAsm('daily cost per pm')       // "Daily cost per PM x Initiative"
             || getAsm('daily cost per product manager')
             || getAsm('cost per pm')
             || getAsm('product daily rate')
             || getAsm('product daily');
  var prdCost = prdDays * prdRate;
  setSpan('rnxroi-prd_days', prdDays ? Math.floor(prdDays) : null);
  setSpan('rnxroi-prd_cost', prdCost || null, true);

  // ── Other Costs ──────────────────────────────────────────────────────────
  var otherCost = 0;
  var ocBody = document.getElementById('rnxroi-other_costs_body');
  if (ocBody) {
    ocBody.querySelectorAll('input[type="number"]').forEach(function(inp) {
      otherCost += parseFloat(inp.value) || 0;
    });
  }

  // ── Total ────────────────────────────────────────────────────────────────
  var totalCost = engCost + desCost + prdCost + otherCost;
  setSpan('rnxroi-total_cost_out', totalCost || null, true);

  // ── ROI ──────────────────────────────────────────────────────────────────
  var roiEl   = document.getElementById('rnxroi-roi_out');
  var roiWrap = roiEl && roiEl.closest('.rnx-rt-roi-wrap');
  if (roiEl) {
    if (totalCost > 0 && addedValue) {
      var roiPct = ((addedValue - totalCost) / totalCost * 100);
      roiEl.textContent = (roiPct > 0 ? '+' : '') + roiPct.toFixed(1) + '%';
      if (roiPct >= 0) {
        roiEl.style.color = '#16a34a';
        if (roiWrap) { roiWrap.style.background = 'rgba(34,197,94,.07)'; roiWrap.style.borderColor = ''; }
      } else {
        roiEl.style.color = '#dc2626';
        if (roiWrap) { roiWrap.style.background = 'rgba(220,38,38,.07)'; roiWrap.style.borderColor = ''; }
      }
    } else {
      roiEl.textContent = '—';
      roiEl.style.color = '';
      if (roiWrap) { roiWrap.style.background = ''; roiWrap.style.borderColor = ''; }
    }
  }

  // ── Persist to step-2 store + localStorage ──────────────────────────────────
  if (typeof rnxModalStep2Data !== 'undefined') {
    rnxModalStep2Data.addedValue = addedValue;
    rnxModalStep2Data.roi        = totalCost > 0 ? (addedValue - totalCost) / totalCost : 0;
    rnxModalStep2Data.roiValues  = {
      product_revenue_last_year:      rev,
      contribution_to_revenue_growth: growth,
      eng_size: engSize,           des_size: desSize,
      eng_days: engDays,           des_days: desDays, prd_days: Math.floor(prdDays),
      eng_cost: engCost, des_cost: desCost, prd_cost: prdCost,
      other_cost: otherCost
    };
  }
}

// ── Restore Enhancements form fields from stored roiValues ─────────────────
function rnxRoiEnhRestore(values) {
  if (!values) return;
  var rev = document.getElementById('rnxroi-product_revenue_last_year');
  var grw = document.getElementById('rnxroi-contribution_to_revenue_growth');
  if (rev && values.product_revenue_last_year) rev.value = values.product_revenue_last_year;
  if (grw && values.contribution_to_revenue_growth) grw.value = values.contribution_to_revenue_growth;
  if (values.eng_size) rnxMddSet('rnxroi-eng_size', values.eng_size);
  if (values.des_size) rnxMddSet('rnxroi-des_size', values.des_size);
}
