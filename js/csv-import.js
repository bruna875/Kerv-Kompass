// csv-import.js — CSV upload, parsing, column mapping, preview and import
// Depends on: roadmap-neon.js (rnxLoadAndRender, rnxCurrentQ, rnxRefData)
// All globals prefixed _RNX_CSV_ (constants) or rnxCsv* / rnx*Csv* (functions)

// ── Constants ──────────────────────────────────────────────────────────────

var _RNX_CSV_HEADERS    = ['quarter','title','driver','team','theme','productOwner','techLead','link'];
var _RNX_CSV_SAMPLE_ROW = ['Q3 2025','Improve checkout conversion','Revenue Generating','Engineering','Growth','Alice Rossi','Marco Bianchi','https://notion.so/example'];

var _RNX_CSV_APP_FIELDS = [
  { key: 'quarter',      label: 'Quarter',       required: true,  hints: ['quarter','period','sprint','q'] },
  { key: 'title',        label: 'Title',          required: true,  hints: ['title','initiative','name','feature','item','description'] },
  { key: 'driver',       label: 'Driver',         required: false, hints: ['driver','type','category','pillar'] },
  { key: 'team',         label: 'Team',           required: false, hints: ['team','squad','group'] },
  { key: 'theme',        label: 'Theme',          required: false, hints: ['theme','workstream','area'] },
  { key: 'productowner', label: 'Product Owner',  required: false, hints: ['owner','po','product'] },
  { key: 'techlead',     label: 'Tech Lead',      required: false, hints: ['lead','tech','engineer','eng'] },
  { key: 'link',         label: 'Link',           required: false, hints: ['link','url','jira','ticket','notion'] }
];

// ── Modal open / close ─────────────────────────────────────────────────────

function rnxTriggerCsvUpload() {
  if (document.getElementById('rnx-csv-modal-overlay')) return;

  var overlay = document.createElement('div');
  overlay.id = 'rnx-csv-modal-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center';

  overlay.innerHTML =
    '<div style="background:var(--surface);border-radius:14px;padding:0;width:100%;max-width:440px;box-shadow:0 8px 40px rgba(0,0,0,.18);overflow:hidden">'

    // header
    + '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border)">'
    +   '<span style="font-size:14px;font-weight:600;color:var(--text)">Import CSV</span>'
    +   '<button onclick="rnxCloseCsvModal()" style="background:none;border:none;cursor:pointer;color:var(--muted);padding:2px;line-height:1;font-size:18px;font-family:inherit">×</button>'
    + '</div>'

    // body
    + '<div style="padding:20px">'

    // drop zone
    +   '<div id="rnx-csv-dropzone"'
    +     ' onclick="document.getElementById(\'rnx-csv-file-inp\').click()"'
    +     ' ondragover="event.preventDefault();this.style.borderColor=\'var(--accent)\';this.style.background=\'rgba(237,0,94,.04)\'"'
    +     ' ondragleave="this.style.borderColor=\'var(--border-md)\';this.style.background=\'transparent\'"'
    +     ' ondrop="event.preventDefault();this.style.borderColor=\'var(--border-md)\';this.style.background=\'transparent\';rnxHandleCsvUpload(event.dataTransfer.files[0])"'
    +     ' style="border:2px dashed var(--border-md);border-radius:10px;padding:32px 20px;text-align:center;cursor:pointer;transition:border-color .15s,background .15s">'
    +     '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" style="color:var(--muted);margin-bottom:10px"><path d="M12 15V3M8 7l4-4 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    +     '<div style="font-size:13px;font-weight:500;color:var(--text);margin-bottom:4px">Drag your CSV here</div>'
    +     '<div style="font-size:12px;color:var(--muted)">or click to browse</div>'
    +   '</div>'
    +   '<input type="file" id="rnx-csv-file-inp" accept=".csv" style="display:none" onchange="rnxHandleCsvUpload(this.files[0])">'

    // status
    +   '<div id="rnx-csv-status" style="min-height:18px;margin-top:12px;font-size:12px;color:var(--muted);text-align:center"></div>'

    // footer
    +   '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">'
    +     '<button onclick="rnxDownloadCsvSample()" style="display:flex;align-items:center;gap:5px;background:none;border:none;cursor:pointer;font-size:12px;color:var(--muted);font-family:inherit;padding:0;transition:color .15s" onmouseenter="this.style.color=\'var(--accent)\'" onmouseleave="this.style.color=\'var(--muted)\'">'
    +       '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 8l3 3 3-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 13h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    +       'Download sample CSV'
    +     '</button>'
    +     '<button onclick="rnxCloseCsvModal()" style="padding:7px 16px;font-size:13px;font-family:inherit;border:1px solid var(--border-md);border-radius:6px;background:var(--surface);color:var(--text);cursor:pointer">Cancel</button>'
    +   '</div>'

    + '</div>'
    + '</div>';

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) rnxCloseCsvModal();
  });

  document.body.appendChild(overlay);
}

function rnxCloseCsvModal() {
  var el = document.getElementById('rnx-csv-modal-overlay');
  if (el) el.remove();
}

function rnxDownloadCsvSample() {
  var rows = [_RNX_CSV_HEADERS, _RNX_CSV_SAMPLE_ROW];
  var csv = rows.map(function(r) {
    return r.map(function(c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(',');
  }).join('\r\n');
  var blob = new Blob([csv], { type: 'text/csv' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'initiatives_sample.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

// ── CSV parsing ────────────────────────────────────────────────────────────

function rnxParseCsvText(text) {
  var lines = text.split(/\r?\n/).filter(function(l) { return l.trim(); });
  if (lines.length < 2) return { headers: [], rows: [] };

  function parseRow(line) {
    var cells = [], cur = '', inQ = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (inQ) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') inQ = false;
        else cur += ch;
      } else {
        if (ch === '"') inQ = true;
        else if (ch === ',') { cells.push(cur.trim()); cur = ''; }
        else cur += ch;
      }
    }
    cells.push(cur.trim());
    return cells;
  }

  var headers = parseRow(lines[0]).map(function(h) { return h.trim(); });
  var rows = [];
  for (var i = 1; i < lines.length; i++) {
    var cells = parseRow(lines[i]);
    if (cells.every(function(c) { return !c; })) continue;
    var obj = {};
    headers.forEach(function(h, idx) { obj[h] = (cells[idx] || '').trim(); });
    rows.push(obj);
  }
  return { headers: headers, rows: rows };
}

function rnxCsvFuzzyMatch(val, list, key) {
  if (!val) return { value: '', ok: true };
  var lc = val.toLowerCase();
  // 1. exact
  var m = list.filter(function(x) { return (x[key] || '').toLowerCase() === lc; })[0];
  if (m) return { value: m[key], ok: true };
  // 2. DB value starts with input
  m = list.filter(function(x) { return (x[key] || '').toLowerCase().indexOf(lc) === 0; })[0];
  if (m) return { value: m[key], ok: true };
  // 3. DB value contains input
  m = list.filter(function(x) { return (x[key] || '').toLowerCase().indexOf(lc) !== -1; })[0];
  if (m) return { value: m[key], ok: true };
  // 4. input contains DB value
  m = list.filter(function(x) { return lc.indexOf((x[key] || '').toLowerCase()) !== -1; })[0];
  if (m) return { value: m[key], ok: true };
  // 5. every word of input appears in DB value
  var words = lc.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    m = list.filter(function(x) {
      var v = (x[key] || '').toLowerCase();
      return words.every(function(w) { return v.indexOf(w) !== -1; });
    })[0];
    if (m) return { value: m[key], ok: true };
  }
  return { value: val, ok: false };
}

function rnxParseQuarter(raw) {
  if (!raw) return { q: '', year: new Date().getFullYear() };
  var s = raw.trim();
  var m = s.match(/^(\d{4})[-\/\s]?(Q[1-4]|Backlog)$/i);
  if (m) return { q: m[2].toUpperCase().replace('BACKLOG','Backlog'), year: parseInt(m[1]) };
  m = s.match(/^(Q[1-4]|Backlog)[-\/\s]?(\d{4})?$/i);
  if (m) return { q: m[1].toUpperCase().replace('BACKLOG','Backlog'), year: m[2] ? parseInt(m[2]) : new Date().getFullYear() };
  if (/backlog/i.test(s)) return { q: 'Backlog', year: new Date().getFullYear() };
  return { q: s, year: new Date().getFullYear() };
}

// Rows already have canonical keys (set by the mapping step)
function rnxMatchCsvRows(rows) {
  var drivers = rnxRefData.drivers || [];
  var teams   = rnxRefData.teams   || [];
  var themes  = rnxRefData.themes  || [];
  var members = rnxRefData.members || [];

  return rows.map(function(row) {
    var qp        = rnxParseQuarter(row.quarter || '');
    var quarter   = qp.q;
    var year      = qp.year;
    var quarterOk = !quarter || /^(Q[1-4]|Backlog)$/i.test(quarter);
    var title     = (row.title || '').trim();

    var driverM = rnxCsvFuzzyMatch(row.driver,       drivers, 'name');
    var teamM   = rnxCsvFuzzyMatch(row.team,         teams,   'name');
    var themeM  = rnxCsvFuzzyMatch(row.theme,        themes,  'name');
    var ownerM  = rnxCsvFuzzyMatch(row.productowner, members, 'name');
    var leadM   = rnxCsvFuzzyMatch(row.techlead,     members, 'name');

    return {
      quarter:      { value: quarter,       ok: quarterOk },
      year:         year,
      title:        { value: title,         ok: !!title   },
      driver:       driverM,
      team:         teamM,
      theme:        themeM,
      productOwner: ownerM,
      techLead:     leadM,
      link:         { value: row.link || '', ok: true      },
      rowOk:        quarterOk && !!title && driverM.ok && teamM.ok
    };
  });
}

// ── Column mapper UI ───────────────────────────────────────────────────────

function rnxCsvAutoSuggest(hints, headers) {
  for (var k = 0; k < hints.length; k++) {
    var kw = hints[k].toLowerCase();
    for (var i = 0; i < headers.length; i++) {
      if (headers[i].toLowerCase().indexOf(kw) !== -1) return headers[i];
    }
  }
  return '';
}

function rnxShowCsvColumnMapper(headers, rawRows) {
  var overlay = document.getElementById('rnx-csv-modal-overlay');
  if (!overlay) return;

  function ddOpts(suggested) {
    return '<option value="">— not mapped —</option>'
      + headers.map(function(h) {
          return '<option value="' + h + '"' + (h === suggested ? ' selected' : '') + '>' + h + '</option>';
        }).join('');
  }

  var SEL = 'width:100%;padding:5px 8px;font-size:12px;border:1px solid var(--border-md);border-radius:6px;background:var(--surface);color:var(--text);font-family:inherit;outline:none';

  var tableRows = _RNX_CSV_APP_FIELDS.map(function(f) {
    var suggested = rnxCsvAutoSuggest(f.hints, headers);
    return '<tr>'
      + '<td style="padding:7px 12px;font-size:12px;color:var(--text);white-space:nowrap;border-bottom:1px solid var(--border)">'
      +   f.label + (f.required ? '&thinsp;<span style="color:var(--accent);font-size:10px">*</span>' : '')
      + '</td>'
      + '<td style="padding:4px 12px;border-bottom:1px solid var(--border)">'
      +   '<select id="rnx-csv-map-' + f.key + '" style="' + SEL + '">' + ddOpts(suggested) + '</select>'
      + '</td>'
      + '</tr>';
  }).join('');

  overlay.querySelector('div').innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border)">'
    +   '<div>'
    +     '<div style="font-size:14px;font-weight:600;color:var(--text)">Map columns</div>'
    +     '<div style="font-size:11px;color:var(--muted);margin-top:2px">' + rawRows.length + ' rows — match each app field to a CSV column</div>'
    +   '</div>'
    +   '<button onclick="rnxCloseCsvModal()" style="background:none;border:none;cursor:pointer;color:var(--muted);font-size:18px;font-family:inherit;line-height:1;padding:2px">×</button>'
    + '</div>'
    + '<div style="padding:20px">'
    +   '<table style="width:100%;border-collapse:collapse">'
    +     '<thead><tr style="background:var(--bg)">'
    +       '<th style="padding:6px 12px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:var(--faint);text-align:left;border-bottom:1px solid var(--border);width:40%">App field</th>'
    +       '<th style="padding:6px 12px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:var(--faint);text-align:left;border-bottom:1px solid var(--border)">CSV column</th>'
    +     '</tr></thead>'
    +     '<tbody>' + tableRows + '</tbody>'
    +   '</table>'
    +   '<div style="display:flex;align-items:center;justify-content:flex-end;gap:8px;margin-top:20px;padding-top:16px;border-top:1px solid var(--border)">'
    +     '<button onclick="rnxCloseCsvModal()" style="padding:7px 16px;font-size:13px;font-family:inherit;border:1px solid var(--border-md);border-radius:6px;background:var(--surface);color:var(--text);cursor:pointer">Cancel</button>'
    +     '<button onclick="rnxConfirmCsvMapping()" style="padding:7px 16px;font-size:13px;font-weight:500;font-family:inherit;border:none;border-radius:6px;background:var(--accent);color:#fff;cursor:pointer">Preview →</button>'
    +   '</div>'
    + '</div>';

  overlay.querySelector('div').style.maxWidth = '500px';
  overlay._csvRawRows = rawRows;
}

function rnxConfirmCsvMapping() {
  var overlay = document.getElementById('rnx-csv-modal-overlay');
  if (!overlay) return;
  var rawRows = overlay._csvRawRows || [];

  var mapping = {};
  _RNX_CSV_APP_FIELDS.forEach(function(f) {
    var el = document.getElementById('rnx-csv-map-' + f.key);
    mapping[f.key] = el ? el.value : '';
  });

  var normalised = rawRows.map(function(row) {
    var obj = {};
    _RNX_CSV_APP_FIELDS.forEach(function(f) {
      obj[f.key] = mapping[f.key] ? (row[mapping[f.key]] || '') : '';
    });
    return obj;
  });

  var matched = rnxMatchCsvRows(normalised);
  rnxShowCsvPreview(matched);
}

function rnxHandleCsvUpload(file) {
  if (!file) return;
  var status = document.getElementById('rnx-csv-status');
  if (status) status.textContent = 'Reading file…';
  var reader = new FileReader();
  reader.onload = function(e) {
    var parsed = rnxParseCsvText(e.target.result);
    if (!parsed.rows.length) {
      if (status) status.textContent = 'No data rows found.';
      return;
    }
    rnxShowCsvColumnMapper(parsed.headers, parsed.rows);
  };
  reader.onerror = function() {
    if (status) { status.textContent = 'Error reading file.'; status.style.color = '#C0392B'; }
  };
  reader.readAsText(file);
}

// ── Preview modal ──────────────────────────────────────────────────────────

function rnxShowCsvPreview(rows) {
  var overlay = document.getElementById('rnx-csv-modal-overlay');
  if (!overlay) return;

  var okCount  = rows.filter(function(r) { return r.rowOk; }).length;
  var errCount = rows.length - okCount;

  function cell(f) {
    var ok  = f.ok;
    var val = f.value || '—';
    var col = ok ? 'var(--text)' : '#ea580c';
    var bg  = ok ? 'transparent' : 'rgba(234,88,12,.07)';
    return '<td style="padding:4px 8px;font-size:11px;white-space:nowrap;color:' + col + ';background:' + bg + ';border-bottom:1px solid var(--border)">' + val + '</td>';
  }

  var thead = '<tr style="background:var(--bg)">'
    + ['Quarter','Title','Driver','Team','Theme','Product Owner','Tech Lead','Link'].map(function(h) {
        return '<th style="padding:5px 8px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:var(--faint);text-align:left;white-space:nowrap;border-bottom:1px solid var(--border)">' + h + '</th>';
      }).join('')
    + '</tr>';

  var tbody = rows.map(function(r) {
    return '<tr>'
      + cell(r.quarter) + cell(r.title) + cell(r.driver) + cell(r.team)
      + cell(r.theme) + cell(r.productOwner) + cell(r.techLead) + cell(r.link)
      + '</tr>';
  }).join('');

  var summary = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;font-size:12px">'
    + '<span style="color:#16a34a;font-weight:500">✓ ' + okCount + ' ready</span>'
    + (errCount ? '<span style="color:#ea580c;font-weight:500">⚠ ' + errCount + ' with warnings</span>' : '')
    + '<span style="color:var(--faint);margin-left:auto">Orange = no match found — will be imported as-is</span>'
    + '</div>';

  var tableHtml = '<div style="overflow-x:auto;border:1px solid var(--border);border-radius:8px;max-height:320px;overflow-y:auto">'
    + '<table style="width:100%;border-collapse:collapse"><thead>' + thead + '</thead><tbody>' + tbody + '</tbody></table>'
    + '</div>';

  var footer = '<div style="display:flex;align-items:center;justify-content:flex-end;gap:8px;margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">'
    + '<button onclick="rnxCloseCsvModal()" style="padding:7px 16px;font-size:13px;font-family:inherit;border:1px solid var(--border-md);border-radius:6px;background:var(--surface);color:var(--text);cursor:pointer">Cancel</button>'
    + '<button onclick="rnxImportCsvRows()" style="padding:7px 16px;font-size:13px;font-weight:500;font-family:inherit;border:none;border-radius:6px;background:var(--accent);color:#fff;cursor:pointer">Import ' + rows.length + ' initiative' + (rows.length !== 1 ? 's' : '') + '</button>'
    + '</div>';

  overlay.querySelector('div').innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border)">'
    +   '<span style="font-size:14px;font-weight:600;color:var(--text)">Preview import</span>'
    +   '<button onclick="rnxCloseCsvModal()" style="background:none;border:none;cursor:pointer;color:var(--muted);padding:2px;line-height:1;font-size:18px;font-family:inherit">×</button>'
    + '</div>'
    + '<div style="padding:20px">'
    + summary + tableHtml + footer
    + '</div>';

  overlay.querySelector('div').style.maxWidth = '860px';
  overlay._csvRows = rows;
}

// ── Import ─────────────────────────────────────────────────────────────────

function rnxImportCsvRows() {
  var overlay = document.getElementById('rnx-csv-modal-overlay');
  var rows = overlay && overlay._csvRows;
  if (!rows || !rows.length) return;

  var btn = overlay.querySelector('button[onclick="rnxImportCsvRows()"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Importing…'; }

  var q = rnxCurrentQ();

  var promises = rows.map(function(r) {
    var body = {
      quarter:        r.quarter.value      || q,
      title:          r.title.value        || '',
      driver:         r.driver.value       || '',
      team:           r.team.value         || '',
      theme:          r.theme.value        || '',
      productOwner:   r.productOwner.value || '',
      techLead:       r.techLead.value     || '',
      link:           r.link.value         || '',
      year:           r.year               || new Date().getFullYear(),
      deliveryStatus: 'not-started',
      sortOrder:      0
    };
    return fetch('/api/neon/initiatives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  });

  Promise.all(promises)
    .then(function() {
      rnxCloseCsvModal();
      rnxLoadAndRender();
    })
    .catch(function(err) {
      if (btn) { btn.disabled = false; btn.textContent = 'Retry'; }
      console.error('[CSV import]', err);
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// KEY RESULTS CSV IMPORT
// Depends on: company-okrs.js (_cokrData, _cokrMembers, COKR_TABS_CONFIG,
//             cokrLoad, _cokrGetAuthHeader)
// All globals prefixed _COKR_CSV_ (constants) or cokrCsv* / cokr*Csv* (fns)
// ═══════════════════════════════════════════════════════════════════════════

// ── Constants ──────────────────────────────────────────────────────────────

var _COKR_CSV_HEADERS = ['objective','title','department','owner','type','goal','year'];

var _COKR_CSV_SAMPLE_ROWS = [
  ['Grow revenue to €5M ARR','Reach 500 paying customers','Sales','Alice Rossi','number','500','2025'],
  ['Grow revenue to €5M ARR','Increase MRR by 20% each quarter','Product & Tech','Marco Bianchi','percent','80','2025'],
  ['Build a world-class team','Complete onboarding for all new hires','People','Giulia Ferri','yn','','2025']
];

var _COKR_CSV_APP_FIELDS = [
  { key: 'objective',   label: 'Objective',   required: true,  hints: ['objective','goal','okr','obj'] },
  { key: 'title',       label: 'Title',        required: true,  hints: ['title','key result','kr','name','description'] },
  { key: 'department',  label: 'Department',   required: false, hints: ['department','team','dept','squad','group'] },
  { key: 'owner',       label: 'Owner',        required: false, hints: ['owner','assignee','responsible','person'] },
  { key: 'type',        label: 'Type',         required: false, hints: ['type','metric','format','unit'] },
  { key: 'goal',        label: 'Goal Value',   required: false, hints: ['goal','target','value','number'] },
  { key: 'year',        label: 'Year',         required: false, hints: ['year','period','fy'] }
];

var _COKR_CSV_VALID_TYPES = ['percent','number','yn','days','hrs','mts'];

// ── Modal open / close ─────────────────────────────────────────────────────

function cokrTriggerCsvUpload() {
  if (document.getElementById('cokr-csv-modal-overlay')) return;

  var overlay = document.createElement('div');
  overlay.id = 'cokr-csv-modal-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center';

  overlay.innerHTML =
    '<div style="background:var(--surface);border-radius:14px;padding:0;width:100%;max-width:440px;box-shadow:0 8px 40px rgba(0,0,0,.18);overflow:hidden">'

    // header
    + '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border)">'
    +   '<span style="font-size:14px;font-weight:600;color:var(--text)">Import Key Results</span>'
    +   '<button onclick="cokrCloseCsvModal()" style="background:none;border:none;cursor:pointer;color:var(--muted);padding:2px;line-height:1;font-size:18px;font-family:inherit">×</button>'
    + '</div>'

    // body
    + '<div style="padding:20px">'

    // drop zone
    +   '<div id="cokr-csv-dropzone"'
    +     ' onclick="document.getElementById(\'cokr-csv-file-inp\').click()"'
    +     ' ondragover="event.preventDefault();this.style.borderColor=\'var(--accent)\';this.style.background=\'rgba(237,0,94,.04)\'"'
    +     ' ondragleave="this.style.borderColor=\'var(--border-md)\';this.style.background=\'transparent\'"'
    +     ' ondrop="event.preventDefault();this.style.borderColor=\'var(--border-md)\';this.style.background=\'transparent\';cokrHandleCsvUpload(event.dataTransfer.files[0])"'
    +     ' style="border:2px dashed var(--border-md);border-radius:10px;padding:32px 20px;text-align:center;cursor:pointer;transition:border-color .15s,background .15s">'
    +     '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" style="color:var(--muted);margin-bottom:10px"><path d="M12 15V3M8 7l4-4 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    +     '<div style="font-size:13px;font-weight:500;color:var(--text);margin-bottom:4px">Drag your CSV here</div>'
    +     '<div style="font-size:12px;color:var(--muted)">or click to browse</div>'
    +   '</div>'
    +   '<input type="file" id="cokr-csv-file-inp" accept=".csv" style="display:none" onchange="cokrHandleCsvUpload(this.files[0])">'

    // status
    +   '<div id="cokr-csv-status" style="min-height:18px;margin-top:12px;font-size:12px;color:var(--muted);text-align:center"></div>'

    // footer
    +   '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">'
    +     '<button onclick="cokrDownloadKrCsvSample()" style="display:flex;align-items:center;gap:5px;background:none;border:none;cursor:pointer;font-size:12px;color:var(--muted);font-family:inherit;padding:0;transition:color .15s" onmouseenter="this.style.color=\'var(--accent)\'" onmouseleave="this.style.color=\'var(--muted)\'">'
    +       '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 8l3 3 3-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 13h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    +       'Download sample CSV'
    +     '</button>'
    +     '<button onclick="cokrCloseCsvModal()" style="padding:7px 16px;font-size:13px;font-family:inherit;border:1px solid var(--border-md);border-radius:6px;background:var(--surface);color:var(--text);cursor:pointer">Cancel</button>'
    +   '</div>'

    + '</div>'
    + '</div>';

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) cokrCloseCsvModal();
  });

  document.body.appendChild(overlay);
}

function cokrCloseCsvModal() {
  var el = document.getElementById('cokr-csv-modal-overlay');
  if (el) el.remove();
}

function cokrDownloadKrCsvSample() {
  var rows = [_COKR_CSV_HEADERS].concat(_COKR_CSV_SAMPLE_ROWS);
  var csv = rows.map(function(r) {
    return r.map(function(c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(',');
  }).join('\r\n');
  var blob = new Blob([csv], { type: 'text/csv' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'key_results_sample.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

// ── Matching helpers ───────────────────────────────────────────────────────

function _cokrCsvMatchObjective(val) {
  if (!val) return { value: '', ok: false };
  var objs = (_cokrData && _cokrData.objectives) ? _cokrData.objectives : [];
  // map to { name: obj.title, id: obj.id }
  var list = objs.map(function(o) { return { name: o.title, id: o.id }; });
  var lc = val.toLowerCase();
  var m;
  // exact
  m = list.filter(function(x) { return x.name.toLowerCase() === lc; })[0];
  if (m) return { value: m.name, id: m.id, ok: true };
  // starts with
  m = list.filter(function(x) { return x.name.toLowerCase().indexOf(lc) === 0; })[0];
  if (m) return { value: m.name, id: m.id, ok: true };
  // contains
  m = list.filter(function(x) { return x.name.toLowerCase().indexOf(lc) !== -1; })[0];
  if (m) return { value: m.name, id: m.id, ok: true };
  // val contains obj
  m = list.filter(function(x) { return lc.indexOf(x.name.toLowerCase()) !== -1; })[0];
  if (m) return { value: m.name, id: m.id, ok: true };
  // word match
  var words = lc.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    m = list.filter(function(x) {
      var v = x.name.toLowerCase();
      return words.every(function(w) { return v.indexOf(w) !== -1; });
    })[0];
    if (m) return { value: m.name, id: m.id, ok: true };
  }
  return { value: val, id: null, ok: false };
}

function _cokrCsvMatchDept(val) {
  if (!val) return { value: '', ok: true }; // dept is optional
  var lc = val.toLowerCase();
  // check against tab labels and individual dept names
  var allTabs = (typeof COKR_TABS_CONFIG !== 'undefined') ? COKR_TABS_CONFIG : [];
  var m;
  // match tab label
  m = allTabs.filter(function(t) { return t.label.toLowerCase() === lc; })[0];
  if (m) return { value: m.label, ok: true };
  m = allTabs.filter(function(t) { return t.label.toLowerCase().indexOf(lc) !== -1 || lc.indexOf(t.label.toLowerCase()) !== -1; })[0];
  if (m) return { value: m.label, ok: true };
  // match individual dept strings inside tab.depts
  var allDepts = [];
  allTabs.forEach(function(t) { (t.depts || []).forEach(function(d) { allDepts.push({ name: d }); }); });
  var dm = rnxCsvFuzzyMatch(val, allDepts, 'name');
  if (dm.ok) return { value: dm.value, ok: true };
  return { value: val, ok: false };
}

function _cokrCsvMatchType(val) {
  if (!val) return { value: 'percent', ok: true };
  var lc = val.toLowerCase().trim();
  // direct match
  if (_COKR_CSV_VALID_TYPES.indexOf(lc) !== -1) return { value: lc, ok: true };
  // aliases
  var aliases = { '%': 'percent', 'percentage': 'percent', 'day': 'days', 'hour': 'hrs', 'hours': 'hrs',
    'month': 'mts', 'months': 'mts', 'yes/no': 'yn', 'yesno': 'yn', 'boolean': 'yn', 'bool': 'yn',
    'num': 'number', 'count': 'number', 'euro': 'number', '€': 'number', '$': 'number' };
  if (aliases[lc]) return { value: aliases[lc], ok: true };
  // partial
  var m = _COKR_CSV_VALID_TYPES.filter(function(t) { return lc.indexOf(t) !== -1 || t.indexOf(lc) !== -1; })[0];
  if (m) return { value: m, ok: true };
  return { value: 'percent', ok: false };
}

function _cokrCsvMatchOwner(val) {
  if (!val) return { value: '', ok: true };
  var members = (typeof _cokrMembers !== 'undefined' && _cokrMembers) ? _cokrMembers : [];
  var list = members.map(function(m) { return { name: (m.first_name || '') + (m.last_name ? ' ' + m.last_name : '') }; });
  var result = rnxCsvFuzzyMatch(val, list, 'name');
  return result;
}

// ── Matching rows ──────────────────────────────────────────────────────────

function cokrMatchKrRows(rows) {
  return rows.map(function(row) {
    var objM  = _cokrCsvMatchObjective(row.objective);
    var deptM = _cokrCsvMatchDept(row.department);
    var typeM = _cokrCsvMatchType(row.type);
    var ownrM = _cokrCsvMatchOwner(row.owner);
    var title = (row.title || '').trim();

    var goalRaw = (row.goal || '').trim();
    var goalVal = goalRaw !== '' && !isNaN(parseFloat(goalRaw)) ? parseFloat(goalRaw) : null;

    var yearRaw = (row.year || '').trim();
    var year    = yearRaw && !isNaN(parseInt(yearRaw)) ? parseInt(yearRaw) : null;

    return {
      objective:  objM,
      title:      { value: title, ok: !!title },
      department: deptM,
      owner:      ownrM,
      type:       typeM,
      goal:       { value: goalRaw, ok: true },
      year:       { value: yearRaw, ok: true },
      // internals
      _objectiveId: objM.id,
      _goalVal:     goalVal,
      _year:        year,
      rowOk:        objM.ok && !!title
    };
  });
}

// ── Column mapper UI ───────────────────────────────────────────────────────

function _cokrCsvAutoSuggest(hints, headers) {
  for (var k = 0; k < hints.length; k++) {
    var kw = hints[k].toLowerCase();
    for (var i = 0; i < headers.length; i++) {
      if (headers[i].toLowerCase().indexOf(kw) !== -1) return headers[i];
    }
  }
  return '';
}

function cokrShowKrColumnMapper(headers, rawRows) {
  var overlay = document.getElementById('cokr-csv-modal-overlay');
  if (!overlay) return;

  function ddOpts(suggested) {
    return '<option value="">— not mapped —</option>'
      + headers.map(function(h) {
          return '<option value="' + h + '"' + (h === suggested ? ' selected' : '') + '>' + h + '</option>';
        }).join('');
  }

  var SEL = 'width:100%;padding:5px 8px;font-size:12px;border:1px solid var(--border-md);border-radius:6px;background:var(--surface);color:var(--text);font-family:inherit;outline:none';

  var tableRows = _COKR_CSV_APP_FIELDS.map(function(f) {
    var suggested = _cokrCsvAutoSuggest(f.hints, headers);
    return '<tr>'
      + '<td style="padding:7px 12px;font-size:12px;color:var(--text);white-space:nowrap;border-bottom:1px solid var(--border)">'
      +   f.label + (f.required ? '&thinsp;<span style="color:var(--accent);font-size:10px">*</span>' : '')
      + '</td>'
      + '<td style="padding:4px 12px;border-bottom:1px solid var(--border)">'
      +   '<select id="cokr-csv-map-' + f.key + '" style="' + SEL + '">' + ddOpts(suggested) + '</select>'
      + '</td>'
      + '</tr>';
  }).join('');

  overlay.querySelector('div').innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border)">'
    +   '<div>'
    +     '<div style="font-size:14px;font-weight:600;color:var(--text)">Map columns</div>'
    +     '<div style="font-size:11px;color:var(--muted);margin-top:2px">' + rawRows.length + ' rows — match each app field to a CSV column</div>'
    +   '</div>'
    +   '<button onclick="cokrCloseCsvModal()" style="background:none;border:none;cursor:pointer;color:var(--muted);font-size:18px;font-family:inherit;line-height:1;padding:2px">×</button>'
    + '</div>'
    + '<div style="padding:20px">'
    +   '<table style="width:100%;border-collapse:collapse">'
    +     '<thead><tr style="background:var(--bg)">'
    +       '<th style="padding:6px 12px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:var(--faint);text-align:left;border-bottom:1px solid var(--border);width:40%">App field</th>'
    +       '<th style="padding:6px 12px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:var(--faint);text-align:left;border-bottom:1px solid var(--border)">CSV column</th>'
    +     '</tr></thead>'
    +     '<tbody>' + tableRows + '</tbody>'
    +   '</table>'
    +   '<div style="display:flex;align-items:center;justify-content:flex-end;gap:8px;margin-top:20px;padding-top:16px;border-top:1px solid var(--border)">'
    +     '<button onclick="cokrCloseCsvModal()" style="padding:7px 16px;font-size:13px;font-family:inherit;border:1px solid var(--border-md);border-radius:6px;background:var(--surface);color:var(--text);cursor:pointer">Cancel</button>'
    +     '<button onclick="cokrConfirmKrMapping()" style="padding:7px 16px;font-size:13px;font-weight:500;font-family:inherit;border:none;border-radius:6px;background:var(--accent);color:#fff;cursor:pointer">Preview →</button>'
    +   '</div>'
    + '</div>';

  overlay.querySelector('div').style.maxWidth = '500px';
  overlay._cokrCsvRawRows = rawRows;
}

function cokrConfirmKrMapping() {
  var overlay = document.getElementById('cokr-csv-modal-overlay');
  if (!overlay) return;
  var rawRows = overlay._cokrCsvRawRows || [];

  var mapping = {};
  _COKR_CSV_APP_FIELDS.forEach(function(f) {
    var el = document.getElementById('cokr-csv-map-' + f.key);
    mapping[f.key] = el ? el.value : '';
  });

  var normalised = rawRows.map(function(row) {
    var obj = {};
    _COKR_CSV_APP_FIELDS.forEach(function(f) {
      obj[f.key] = mapping[f.key] ? (row[mapping[f.key]] || '') : '';
    });
    return obj;
  });

  var matched = cokrMatchKrRows(normalised);
  cokrShowKrPreview(matched);
}

function cokrHandleCsvUpload(file) {
  if (!file) return;
  var status = document.getElementById('cokr-csv-status');
  if (status) status.textContent = 'Reading file…';
  var reader = new FileReader();
  reader.onload = function(e) {
    var parsed = rnxParseCsvText(e.target.result);
    if (!parsed.rows.length) {
      if (status) status.textContent = 'No data rows found.';
      return;
    }
    cokrShowKrColumnMapper(parsed.headers, parsed.rows);
  };
  reader.onerror = function() {
    if (status) { status.textContent = 'Error reading file.'; status.style.color = '#C0392B'; }
  };
  reader.readAsText(file);
}

// ── Preview modal ──────────────────────────────────────────────────────────

function cokrShowKrPreview(rows) {
  var overlay = document.getElementById('cokr-csv-modal-overlay');
  if (!overlay) return;

  var okCount  = rows.filter(function(r) { return r.rowOk; }).length;
  var errCount = rows.length - okCount;

  function cell(f) {
    var ok  = f.ok;
    var val = (f.value !== undefined && f.value !== null && f.value !== '') ? f.value : '—';
    var col = ok ? 'var(--text)' : '#ea580c';
    var bg  = ok ? 'transparent' : 'rgba(234,88,12,.07)';
    return '<td style="padding:4px 8px;font-size:11px;white-space:nowrap;color:' + col + ';background:' + bg + ';border-bottom:1px solid var(--border)">' + val + '</td>';
  }

  var thead = '<tr style="background:var(--bg)">'
    + ['Objective','Title','Department','Owner','Type','Goal','Year'].map(function(h) {
        return '<th style="padding:5px 8px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:var(--faint);text-align:left;white-space:nowrap;border-bottom:1px solid var(--border)">' + h + '</th>';
      }).join('')
    + '</tr>';

  var tbody = rows.map(function(r) {
    return '<tr>'
      + cell(r.objective) + cell(r.title) + cell(r.department)
      + cell(r.owner) + cell(r.type) + cell(r.goal) + cell(r.year)
      + '</tr>';
  }).join('');

  var summary = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;font-size:12px">'
    + '<span style="color:#16a34a;font-weight:500">✓ ' + okCount + ' ready</span>'
    + (errCount ? '<span style="color:#ea580c;font-weight:500">⚠ ' + errCount + ' with warnings</span>' : '')
    + '<span style="color:var(--faint);margin-left:auto">Orange = no match found — will be imported as-is</span>'
    + '</div>';

  var tableHtml = '<div style="overflow-x:auto;border:1px solid var(--border);border-radius:8px;max-height:320px;overflow-y:auto">'
    + '<table style="width:100%;border-collapse:collapse"><thead>' + thead + '</thead><tbody>' + tbody + '</tbody></table>'
    + '</div>';

  var footer = '<div style="display:flex;align-items:center;justify-content:flex-end;gap:8px;margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">'
    + '<button onclick="cokrCloseCsvModal()" style="padding:7px 16px;font-size:13px;font-family:inherit;border:1px solid var(--border-md);border-radius:6px;background:var(--surface);color:var(--text);cursor:pointer">Cancel</button>'
    + '<button onclick="cokrImportKrRows()" style="padding:7px 16px;font-size:13px;font-weight:500;font-family:inherit;border:none;border-radius:6px;background:var(--accent);color:#fff;cursor:pointer">Import ' + rows.length + ' Key Result' + (rows.length !== 1 ? 's' : '') + '</button>'
    + '</div>';

  overlay.querySelector('div').innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border)">'
    +   '<span style="font-size:14px;font-weight:600;color:var(--text)">Preview import</span>'
    +   '<button onclick="cokrCloseCsvModal()" style="background:none;border:none;cursor:pointer;color:var(--muted);padding:2px;line-height:1;font-size:18px;font-family:inherit">×</button>'
    + '</div>'
    + '<div style="padding:20px">'
    + summary + tableHtml + footer
    + '</div>';

  overlay.querySelector('div').style.maxWidth = '860px';
  overlay._cokrCsvRows = rows;
}

// ── Import ─────────────────────────────────────────────────────────────────

function cokrImportKrRows() {
  var overlay = document.getElementById('cokr-csv-modal-overlay');
  var rows = overlay && overlay._cokrCsvRows;
  if (!rows || !rows.length) return;

  var btn = overlay.querySelector('button[onclick="cokrImportKrRows()"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Importing…'; }

  var currentYear = (typeof _cokrYear !== 'undefined' && _cokrYear) ? _cokrYear : new Date().getFullYear();

  var promises = rows.map(function(r, idx) {
    var body = {
      action:       'save-kr',
      objectiveId:  r._objectiveId,
      title:        r.title.value   || '',
      department:   (r.department.value && r.department.value !== '') ? r.department.value : null,
      owner:        r.owner.value   || '',
      type:         r.type.value    || 'percent',
      goalValue:    r._goalVal,
      currentValue: 0,
      year:         r._year || currentYear,
      sortOrder:    idx
    };
    return fetch('/api/neon/okrs', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body)
    }).then(function(res) { return res.json(); });
  });

  Promise.all(promises)
    .then(function() {
      cokrCloseCsvModal();
      if (typeof cokrLoad === 'function') cokrLoad();
    })
    .catch(function(err) {
      if (btn) { btn.disabled = false; btn.textContent = 'Retry'; }
      console.error('[KR CSV import]', err);
    });
}
