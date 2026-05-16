// capacity-calculations.js
// Pure calculation functions for team capacity planning.
// No DOM access, no global state — all inputs passed as parameters.
// Used by settings-neon.js (Teams & Capacity tab) and any future capacity UI.

// ── Assumption helpers ─────────────────────────────────────────────────────

// Find an assumption by partial name match in an assumptions array.
// Returns { value: number, unit: string } or a zero default.
function capGetAsm(assumptions, namePart) {
  var lc = namePart.toLowerCase();
  var a = (assumptions || []).filter(function(x) {
    return x.name.toLowerCase().indexOf(lc) !== -1;
  })[0];
  return a
    ? { value: parseFloat(a.value) || 0, unit: a.unit || 'days' }
    : { value: 0, unit: 'days' };
}

// Convert an assumption to a 0–1 RoB fraction.
//   unit === 'percent' → value / 100   (e.g. 20 → 0.20)
//   otherwise          → value as-is   (e.g. 0.20 → 0.20)
function capRoBFrac(asm) {
  if (!asm || !asm.value) return 0;
  return asm.unit === 'percent' ? asm.value / 100 : asm.value;
}

// Format a RoB assumption as a readable string (e.g. "20%" or "—").
function capFmtRoB(asm) {
  if (!asm || !asm.value) return '—';
  if (asm.unit === 'percent') return asm.value + '%';
  return (asm.value * 100).toFixed(0) + '%';
}

// ── Budget data helpers ────────────────────────────────────────────────────

// Get a team's FTE value for a given quarter and discipline.
// budgets shape: { [teamName]: { [quarter]: { engineering, product, design } } }
function capGetBudget(budgets, teamName, quarter, disc) {
  var b = budgets && budgets[teamName];
  return (b && b[quarter]) ? (b[quarter][disc] || 0) : 0;
}

// ── Core capacity formula ──────────────────────────────────────────────────

// Available working days for one discipline in one quarter.
//   fte      : number of full-time equivalents
//   workDays : working days in the quarter (from assumptions)
//   rob      : run-of-business fraction 0–1 (time NOT available for initiatives)
// Returns available days rounded to 1 decimal, or null if inputs are missing.
function capBudgetDays(fte, workDays, rob) {
  if (!fte || !workDays) return null;
  var days = fte * workDays * (1 - (rob || 0));
  return Math.round(days * 10) / 10; // 1 decimal precision
}

// ── Convenience: compute all disciplines for one team / quarter ────────────

// Returns { engineering, product, design } available days, or null per field.
// assumptions: snxData.assumptions array
// budgets    : snxData.budgets object
function capTeamQuarter(assumptions, budgets, teamName, quarter) {
  var workDays = capGetAsm(assumptions, 'working days per quarter').value || 0;

  var engFTE = capGetBudget(budgets, teamName, quarter, 'engineering');
  var prdFTE = capGetBudget(budgets, teamName, quarter, 'product');
  var desFTE = capGetBudget(budgets, teamName, quarter, 'design');

  var engRoB = capRoBFrac(capGetAsm(assumptions, 'engineers run'));
  var prdRoB = capRoBFrac(capGetAsm(assumptions, 'pms run'));
  var desRoB = capRoBFrac(capGetAsm(assumptions, 'designers run'));

  return {
    engineering: capBudgetDays(engFTE, workDays, engRoB),
    product:     capBudgetDays(prdFTE, workDays, prdRoB),
    design:      capBudgetDays(desFTE, workDays, desRoB)
  };
}

// ── Tooltip formulas (display strings) ────────────────────────────────────

var CAP_FORMULAS = {
  engineering: 'Eng FTE × Working Days × (1 − Eng RoB)',
  product:     'Product FTE × Working Days × (1 − PM RoB)',
  design:      'Design FTE × Working Days × (1 − Design RoB)'
};
