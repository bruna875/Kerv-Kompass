// sprint-pptx.js — End-of-sprint PPTX export logic
// Called from sprint-analysis.js via sprintPptxExport(data, btn)
// data: { teamName, sprint, nextSprint, sprints, tickets, selectedId }

// ── Template assets (base64 encoded from Kerv slide template) ──
var _PPTX_K_LOGO   = 'data:image/png;base64,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';
var _PPTX_GRAD_BG  = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAhQAAAE2CAYAAAA59gtFAAASlklEQVR4Xu3W569lZRnGYQQTxRJQjCUiiMIMDAMzz4woiAYU7L33LnYQECwogsI5Zx97jb232HvvHStqbDRRUBD1f9C917r3zN4P5y8w14dfcr8r77s+X3scvHPy31mH7Fwf2pQ2p0PTYWnL9O6sw9PWdETaNr0za/t0z6qFdqSd6Q7pqHTHdKfp+1lHp2N2jN05HZvuku661GTouOle7Ph0t3T3dEI6Md0j3XP6j1n3mu55927dJ9033S/dPz0gPTA9qPXg9JCFHlrLPSw9PD0iPbL1qPTo1mPSY2uyq8dNz7Me33rC9rEnpielJ2+fDD0lPXX6bbGnpacvdFLrGemZ0/eznjXds5493UPbxp6Tntt6Xjp5g07Ztj70/HRq67R0+rwjJ0MvSGekMzfohelFrRenl6SzjlwfemnrZfOOmAydvUEvT+ekc1uvaL0ynbd1ufPTytb1a7V6+GRorTVpradXpVe3XpNeu9DrWq9Pb9iyNvTGLZOl3pTe3HpLeuth89Z29bbpebG3p3e03nno2tjmsXeld2+eDL1ng96b3je9t9j7Ny33gfTBzWMfSh9OH9m03EcP2d3HWh9vfeLgsU+2PpU+ffuxz6TPzrvd7j530Njn0xdaX5x327EvpS+nr7S+mr622IFjXz9gdegb6ZvpW61vp+/cZrnvpu/tP/b9/dd29YP0w1sv96NbrS7143m3HPtJ+mm6IP3sFtfu5+kX824+9sv0q/TrdOHN0n5jv0m/3aDf7bcy9PvpHrrp2B/SH28y9qf0532Xu2ifsYtvvDJ0yY1Why5d6LIbjv0lXT7vBmN/TX/be2Xoir1Xh668/tjf0z+uN3bVvOuu7Orq9M+9xq7Za3XoX3uO/XvPlaH/XGd3ewAFUAAFUAAFUAAFUADFDqAACqAACqAACqAAip1AARRAARRAARRAARQJKIACKIACKIACKIACKBJQAAVQAAVQAAVQAAVQtIACKIACKIACKIACKIACKIACKIACKIACKIACKIACKIACKIACKIACKBJQAAVQAAVQAAVQFFAABVAABVAABVAARQEFUAAFUAAFUAAFUCSgAIqOCaAACqAACqBIQAEUQAEUQAEUQAEUQJGAAig6JoACKIACKIACKIAiAQVQAAVQAAVQAAVQAAVQAAVQAAVQAAVQAAVQAAVQAAVQAAVQAAVQJKAACqAACqAACqAooAAKoAAKoAAKoACKAgqgAAqgAAqgAAqgSEABFB0TQAEUQAEUQJGAAiiAAiiAAiiAAiiAIgEFUHRMAAVQAAVQAAVQAEUCCqAACqAACqAACqAACqAACqAACqAACqAACqAACqAACqAACqAACqBIQAEUQAEUQAEUQFFAARRAARRAARRAARQFFEABFEABFEABFECRgAIoOiaAAiiAAiiAIgEFUAAFUAAFUAAFUABFAgqg6JgACqAACqAACqAAigQUQAEUQAEUQAEUQAEUQAEUQAEUQAEUQAEUQAEUQAEUQAEUQAEUQJGAAiiAAiiAAiiAooACKIACKIACKIACKAoogAIogAIogAIogCIBBVB0TAAFUAAFUABFAgqgAAqgAAqgAAqgAIoEFEDRMQEUQAEUQAEUQAEUCSiAAiiAAiiAAiiAAiiAAiiAAiiAAiiAAiiAAiiAAiiAAiiAAiiAIgEFUAAFUAAFUABFAQVQAAVQAAVQAAVQFFAABVAABVAABVAARQIKoOiYAAqgAAqgAIoEFEABFEABFEABFEABFAkogKJjAiiAAiiAAiiAAigSUAAFUAAFUAAFUAAFUAAFUAAFUAAFUAAFUAAFUAAFUAAFUAAFUABFAgqgAAqgAAqgAIoCCqAACqAACqAACqAooAAKoAAKoAAKoACKBBRA0TEBFEABFEABFAkogAIogAIogAIogAIoElAARccEUAAFUAAFUAAFUCSgAAqgAAqgAAqgAAqgAAqgAAqgAAqgAAqgAAqgAAqgAAqgAAqgAIoEFEABFEABFEABFAUUQAEUQAEUQAEUQFFAARRAARRAARRAARQJKICiYwIogAIogAIoElAABVAABVAABVAABVAkoACKjgmgAAqgAAqgAAqgSEABFEABFEABFEABFEABFEABFEABFEABFEABFEABFEABFEABFEABFAkogAIogAIogAIoCiiAAiiAAiiAAiiAooACKIACKIACKIACKBJQAEXHBFAABVAABVAkoAAKoAAKoAAKoAAKoEhAARQdE0ABFEABFEABFECRgAIogAIogAIogAIogAIogAIogAIogAIogAIogAIogAIogAIogAIoElAABVAABVAABVAUUAAFUAAFUAAFUABFAQVQAAVQAAVQAAVQJKAAio4JoAAKoAAKoEhAARRAARRAARRAARRAkYACKDomgAIogAIogAIogCIBBVAABVAABVAABVAABVAABVAABVAABVAABVAABVAABVAABVAABVAkoAAKoAAKoAAKoCigAAqgAAqgAAqgAIoCCqAACqAACqAACqBIQAEUHRNAARRAARRAkYACKIACKIACKIACKIAiAQVQdEwABVAABVAABVAARQIKoAAKoAAKoAAKoAAKoAAKoAAKoAAKoAAKoAAKoAAKoAAKoAAKoEhAARRAARRAARRAUUABFEABFEABFEABFAUUQAEUQAEUQAEUQJGAAig6JoACKIACKIAiAQVQAAVQAAVQAAVQAEUCCqDomAAKoAAKoAAKoACKBBRAARRAARRAARRAARRAARRAARRAARRAARRAARRAARRAARRAARRAkYACKIACKIACKICigAIogAIogAIogAIoCiiAAiiAAiiAAiiAIgEFUHRMAAVQAAVQAEUCCqAACqAACqAACqAAigQUQNExARRAARRAARRAARQJKIACKIACKIACKIACKIACKIACKIACKIACKIACKIACKIACKIACKIAiAQVQAAVQAAVQAEUBBVAABVAABVAABVAUUAAFUAAFUAAFUABFAgqg6JgACqAACqAAigQUQAEUQAEUQAEUQAEUCSiAomMCKIACKIACKIACKBJQAAVQAAVQAAVQAAVQAAVQAAVQAAVQAAVQAAVQAAVQAAVQAAVQAEUCCqAACqAACqAAigIKoAAKoAAKoAAKoCigAAqgAAqgAAqgAIoEFEDRMQEUQAEUQAEUCSiAAiiAAiiAAiiAAigSUABFxwRQAAVQAAVQAAVQJKAACqAACqAACqAACqAACqAACqAACqAACqAACqAACqAACqAACqAAigQUQAEUQAEUQAEUBRRAARRAARRAARRAUUABFEABFEABFEABFAkogKJjAiiAAiiAAigSUAAFUAAFUAAFUAAFUCSgAIqOCaAACqAACqAACqBIQAEUQAEUQAEUQAEUQAEUQAEUQAEUQAEUQAEUQAEUQAEUQAEUQAEUCSiAAiiAAiiAAigKKIACKIACKIACKICigAIogAIogAIogAIoElAARccEUAAFUAAFUCSgAAqgAAqgAAqgAAqgSEABFB0TQAEUQAEUQAEUQJGAAiiAAiiAAiiAAiiAAiiAAiiAAiiAAiiAAiiAAiiAAiiAAiiAAigSUAAFUAAFUAAFUBRQAAVQAAVQAAVQAEUBBVAABVAABVAABVAkoACKjgmgAAqgAAqgSEABFEABFEABFEABFECRgAIoOiaAAiiAAiiAAiiAIgEFUAAFUAAFUAAFUAAFUAAFUAAFUAAFUAAFUAAFUAAFUAAFUAAFUCSgAAqgAAqgAAqgKKAACqAACqAACqAAigIKoAAKoAAKoAAKoEhAARQdE0ABFEABFECRgAIogAIogAIogAIogCIBBVB0TAAFUAAFUAAFUABFAgqgAAqgAAqgAAqgAAqgAAqgAAqgAAqgAAqgAAqgAAqgAAqgAAqgSEABFEABFEABFEBRQAEUQAEUQAEUQAEUBRRAARRAARRAARRAkYACKDomgAIogAIogCIBBVAABVAABVAABVAARQIKoOiYAAqgAAqgAAqgAIoEFEABFEABFEABFEABFEABFEABFEABFEABFEABFEABFEABFEABFECRgAIogAIogAIogKKAAiiAAiiAAiiAAigKKIACKIACKIACKIAiAQVQdEwABVAABVAARQIKoAAKoAAKoAAKoACKBBRA0TEBFEABFEABFEABFAkogAIogAIogAIogAIogAIogAIogAIogAIogAIogAIogAIogAIogCIBBVAABVAABVAARQEFUAAFUAAFUAAFUBRQAAVQAAVQAAVQAEUCCqDomAAKoAAKoACKBBRAARRAARRAARRAARQJKICiYwIogAIogAIogAIoElAABVAABVAABVAABVAABVAABVAABVAABVAABVAABVAABVAABVAARQIKoAAKoAAKoACKAgqgAAqgAAqgAAqgKKAACqAACqAACqAAigQUQNExARRAARRAARQJKIACKIACKIACKIACKBJQAEXHBFAABVAABVAABVAkoAAKoAAKoAAKoAAKoAAKoAAKoAAKoAAKoAAKoAAKoAAKoAAKoACKBBRAARRAARRAARQFFEABFEABFEABFEBRQAEUQAEUQAEUQAEUCSiAomMCKIACKIACKBJQAAVQAAVQAAVQAAVQJKAAio4JoAAKoAAKoAAKoEhAARRAARRAARRAARRAARRAARRAARRAARRAARRAARRAARRAARRAARQJKIACKIACKIACKAoogAIogAIogAIogKKAAiiAAiiAAiiAAigSUABFxwRQAAVQAAVQJKAACqAACqAACqAACqBIQAEUHRNAARRAARRAARRAkYACKIACKIACKIACKIACKIACKIACKIACKIACKIACKIACKIACKIACKBJQAAVQAAVQAAVQFFAABVAABVAABVAARQEFUAAFUAAFUAAFUCSgAIqOCaAACqAACqBIQAEUQAEUQAEUQAEUQJGAAig6JoACKIACKIACKIAiAQVQAAVQAAVQAAVQAAVQAAVQAAVQAAVQAAVQAAVQAAVQAAVQAAVQJKAACqAACqAACqAooAAKoAAKoAAKoACKAgqgAAqgAAqgAAqgSEABFB0TQAEUQAEUQJGAAiiAAiiAAiiAAiiAIgEFUHRMAAVQAAVQAAVQAEUCCqAACqAACqAACqAACqAACqAACqAACqAACqAACqAACqAACqAACqBIQAEUQAEUQAEUQFFAARRAARRAARRAARQFFEABFEABFEABFECRgAIoOiaAAiiAAiiAIgEFUAAFUAAFUAAFUABFAgqg6JgACqAACqAACqAAigQUQAEUQAEUQAEUQAEUQAEUQAEUQAEUQAEUQAEUQAEUQAEUQAEUQJGAAiiAAiiAAiiAooACKIACKIACKIACKAoogAIogAIogAIogCIBBVB0TAAFUAAFUABFAgqgAAqgAAqgAAqgAIoEFEDRMQEUQAEUQAEUQAEUCSiAAiiAAiiAAiiAAiiAAiiAAiiAAiiAAiiAAiiAAiiAAiiAAiiAIgEFUAAFUAAFUABFAQVQAAVQAAVQAAVQFFAABVAABVAABVAARQIKoOiYAAqgAAqgAIoEFEABFEABFEABFEABFAkogKJjAiiAAiiAAiiAAigSUAAFUAAFUAAFUAAFUAAFUAAFUAAFUAAFUAAFUAAFUAAFUAAFUABFAgqgAAqgAAqgAIoCCqAACqAACqAACqAooAAKoAAKoAAKoACKBBRA0TEBFEABFEABFAkogAIogAIogAIogAIoElAARccEUAAFUAAFUAAFUCSgAAqgAAqgAAqgAAqgAAqgAAqgAAqgAAqgAAqgAAqgAAqgAAqgAIoEFEABFEABFEABFAUUQAEUQAEUQAEUQFFAARRAARRAARRAARQJKICiYwIogAIogAIoElAABVAABVAABVAABVAkoACKjgmgAAqgAAqgAAqgSEABFEABFEABFEABFEABFEABFEABFEABFEABFEABFEABFEABFEABFAkogAIogAIogAIoCiiAAiiAAiiAAiiAooACKIACKIACKIACKBJQAEXHBFAABVAABVAkoAAKoAAKoAAKoAAKoEhAARQdE0ABFEABFEABFECRgAIogAIogAIogAIogAIogAIogAIogAIogAIogAIogAIogAIogAIoElAABVAABVAABVAUUAAFUAAFUAAFUABFAQVQAAVQAAVQAAVQJKAAio4JoAAKoAAKoEhAARRAARRAARRAARRAkYACKDomgAIogAIogAIogCIBBVAABVAABVAABVAABVAABVAABVAABVAABVAABVAABVAABVAABVAkoAAKoAAKoAAKoCigAAqgAAqgAAqgAIoCCqAACqAACqAACqBIQAEUHRNAARRAART/L6D4H44qXN0i4hluAAAAAElFTkSuQmCC';
var _PPTX_BTN_HTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M7 8h10M7 12h6"/></svg> Export PPT';

// ── Public entry point ────────────────────────────────────────────────────────
// Loads PptxGenJS on first use (lazy, ~250 KB), then builds and downloads the file.

function sprintPptxExport(data, btn) {
  function build() {
    if (btn) { btn.innerHTML = 'Generating…'; btn.disabled = true; }
    setTimeout(function() {
      try { _sprintPptxBuild(data, btn); }
      catch(e) {
        console.error('[sprint-pptx] build error:', e);
        _pptxRestoreBtn(btn);
        alert('Export failed: ' + (e.message || e));
      }
    }, 60);
  }

  if (typeof PptxGenJS !== 'undefined') { build(); return; }
  if (btn) { btn.innerHTML = 'Loading…'; btn.disabled = true; }
  var scr = document.createElement('script');
  scr.src = 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js';
  scr.onload  = function() { build(); };
  scr.onerror = function() {
    _pptxRestoreBtn(btn);
    alert('Could not load presentation library. Check your connection and try again.');
  };
  document.head.appendChild(scr);
}

function _pptxRestoreBtn(btn) {
  if (btn) { btn.innerHTML = _PPTX_BTN_HTML; btn.disabled = false; }
}

// ── Core builder ─────────────────────────────────────────────────────────────

function _sprintPptxBuild(data, btn) {
  var teamName   = data.teamName;
  var sprint     = data.sprint;
  var nextSprint = data.nextSprint;
  var allSprints = data.sprints;
  var tickets    = data.tickets;
  var selectedId = data.selectedId;

  var PINK = 'EB0084', DARK = '1E1E2E', GRAY = '64748B', FONT = 'IBM Plex Sans';
  var W = 10, H = 5.625;

  // ── Stats ──
  var doneSprs = allSprints.filter(function(s) { return s.status === 'completed'; });
  var avgVel   = doneSprs.length
    ? Math.round(doneSprs.reduce(function(a,s) { return a + s.completed; }, 0) / doneSprs.length)
    : sprint.completed;
  var compSprs = doneSprs.filter(function(s) { return s.planned > 0; });
  var avgComp  = compSprs.length
    ? Math.round(compSprs.reduce(function(a,s) { return a + (s.completed / s.planned * 100); }, 0) / compSprs.length)
    : (sprint.planned > 0 ? Math.round(sprint.completed / sprint.planned * 100) : 0);
  var pred     = Math.min(100, Math.round(avgComp * 0.95));
  var carry3   = allSprints.slice(-3).reduce(function(a,s) { return a + s.carryover; }, 0);

  var pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';

  // ── Helper: standard white content slide ──
  function cs(title) {
    var s = pptx.addSlide();
    s.background = { color: 'FFFFFF' };
    s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:W, h:0.07, fill:{ color:PINK }, line:{ color:PINK } });
    s.addImage({ data:_PPTX_K_LOGO, x:0.14, y:5.2, w:0.33, h:0.33 });
    s.addText(title, { x:0.45, y:0.12, w:9.1, h:0.6, fontSize:18, bold:true, color:DARK, fontFace:FONT });
    return s;
  }

  // ── Status helpers ──
  function sCol(st) { return st==='done'?'00AD64':st==='in-progress'?'F7CE0E':st==='review'?'F59E0B':'9CA3AF'; }
  function sLbl(st) { var m={done:'Done','in-progress':'In Progress',review:'In Review',todo:'To Do'}; return m[st]||st||'To Do'; }

  // ────────── SLIDE 1: Cover ──────────
  var s1 = pptx.addSlide();
  s1.addImage({ data:_PPTX_GRAD_BG, x:0, y:0, w:W, h:H });
  s1.addImage({ data:_PPTX_K_LOGO,  x:8.7, y:0.22, w:0.92, h:0.92 });
  s1.addText(teamName, { x:0.55, y:1.45, w:8.4, h:0.95, fontSize:44, bold:true, color:'FFFFFF', fontFace:FONT });
  s1.addText(sprint.name + ' — End of Sprint Demo', { x:0.55, y:2.45, w:8.4, h:0.55, fontSize:18, italic:true, color:'FFFFFF', fontFace:FONT });
  s1.addText((nextSprint ? nextSprint.name : 'Next Sprint') + ' Highlights', { x:0.55, y:3.0, w:8.4, h:0.55, fontSize:18, italic:true, color:'FFFFFF', fontFace:FONT });

  // ────────── SLIDE 2: Key Achievements ──────────
  var s2 = cs(sprint.name + ' — Key Achievements');
  [0.4, 3.47, 6.54].forEach(function(cx) {
    s2.addShape(pptx.ShapeType.rect, { x:cx, y:0.88, w:2.93, h:4.54, fill:{ color:'F8FAFC' }, line:{ color:'E2E8F0', pt:0.5 } });
    s2.addText('Highlight',   { x:cx+0.15, y:0.98,  w:2.65, h:0.25, fontSize:9,  bold:true, italic:true, color:PINK, fontFace:FONT });
    s2.addText('Lorem Ipsum', { x:cx+0.15, y:1.24,  w:2.65, h:0.38, fontSize:13, bold:true, color:DARK, fontFace:FONT });
    s2.addText('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace with sprint achievement details.',
      { x:cx+0.15, y:1.65, w:2.65, h:3.6, fontSize:10, color:GRAY, fontFace:FONT, valign:'top', wrap:true });
  });

  // ────────── SLIDE 3: Key Metrics ──────────
  var s3 = cs(sprint.name + ' — Key Metrics');

  var metrics = [
    { lbl:'AVG VELOCITY',   val:avgVel+' pts',    sub:'avg across completed sprints',    clr:'6366F1', x:0.4  },
    { lbl:'AVG COMPLETION', val:avgComp+'%',       sub:doneSprs.length+' sprints tracked', clr:avgComp>=90?'10B981':avgComp>=75?'F59E0B':'EF4444', x:2.73 },
    { lbl:'PREDICTABILITY', val:pred+'%',          sub:'planned vs delivered',            clr:pred>=85?'10B981':'F59E0B', x:5.07 },
    { lbl:'CARRYOVER · L3', val:carry3+' tickets', sub:'last 3 sprints total',      clr:carry3===0?'10B981':carry3<=5?'10B981':carry3<=12?'F59E0B':'EF4444', x:7.4 }
  ];
  metrics.forEach(function(m) {
    s3.addShape(pptx.ShapeType.rect, { x:m.x, y:0.88, w:2.22, h:1.45, fill:{ color:'F8FAFC' }, line:{ color:'E2E8F0', pt:0.5 } });
    s3.addText(m.lbl, { x:m.x+0.13, y:0.96, w:2.0, h:0.22, fontSize:7.5, bold:true, color:GRAY,  fontFace:FONT });
    s3.addText(m.val, { x:m.x+0.13, y:1.18, w:2.0, h:0.58, fontSize:24,  bold:true, color:m.clr, fontFace:FONT });
    s3.addText(m.sub, { x:m.x+0.13, y:1.80, w:2.0, h:0.45, fontSize:8,               color:GRAY,  fontFace:FONT });
  });

  var hdrRow = [[
    { text:'Sprint',       options:{ bold:true, italic:true, color:PINK, fill:{ color:'F3F3F3' }, fontSize:9, fontFace:FONT } },
    { text:'Planned',      options:{ bold:true, italic:true, color:PINK, fill:{ color:'F3F3F3' }, fontSize:9, fontFace:FONT, align:'center' } },
    { text:'Completed',    options:{ bold:true, italic:true, color:PINK, fill:{ color:'F3F3F3' }, fontSize:9, fontFace:FONT, align:'center' } },
    { text:'Completion %', options:{ bold:true, italic:true, color:PINK, fill:{ color:'F3F3F3' }, fontSize:9, fontFace:FONT, align:'center' } },
    { text:'Carryover',    options:{ bold:true, italic:true, color:PINK, fill:{ color:'F3F3F3' }, fontSize:9, fontFace:FONT, align:'center' } }
  ]];
  var histRows = hdrRow.concat(allSprints.slice(-8).map(function(s) {
    var pct = s.planned > 0 ? Math.round(s.completed / s.planned * 100) : 0;
    var sel = s.id === selectedId;
    var bg  = sel ? { color:'FFF0F8' } : { color:'FFFFFF' };
    return [
      { text:s.name,              options:{ fontSize:9, fontFace:FONT, color:sel?PINK:DARK, bold:sel, fill:bg } },
      { text:String(s.planned),   options:{ fontSize:9, fontFace:FONT, color:GRAY, align:'center', fill:bg } },
      { text:String(s.completed), options:{ fontSize:9, fontFace:FONT, color:DARK, bold:true, align:'center', fill:bg } },
      { text:pct+'%',             options:{ fontSize:9, fontFace:FONT, color:pct>=90?'10B981':pct>=70?'F59E0B':'EF4444', bold:true, align:'center', fill:bg } },
      { text:String(s.carryover), options:{ fontSize:9, fontFace:FONT, color:s.carryover===0?'10B981':s.carryover<=3?'F59E0B':'EF4444', bold:true, align:'center', fill:bg } }
    ];
  }));
  s3.addTable(histRows, { x:0.4, y:2.45, w:9.2, border:{ type:'solid', pt:0.5, color:'EFEFEF' }, rowH:0.3, colW:[3.6,1.3,1.3,1.7,1.3], fontFace:FONT, fontSize:9, valign:'middle' });

  // ────────── SLIDE 4: Demo ──────────
  var s4 = cs(sprint.name + ' — Demo');
  s4.addText('[Add demo screenshots or notes here]', { x:0.4, y:1.2, w:9.2, h:4.1, fontSize:14, color:'CBD5E1', fontFace:FONT, align:'center', valign:'middle', italic:true });

  // ────────── SLIDE 5: Next Sprint Plan ──────────
  var nn    = nextSprint ? nextSprint.name : 'Next Sprint';
  var s5    = cs(nn + ' — Plan (Product & Development)');
  var nTkts = nextSprint ? (tickets[nextSprint.id] || []) : [];

  var planHdr = [[
    { text:'Feature', options:{ bold:true, italic:true, color:PINK, fill:{ color:'F3F3F3' }, fontSize:9, fontFace:FONT } },
    { text:'Status',  options:{ bold:true, italic:true, color:PINK, fill:{ color:'F3F3F3' }, fontSize:9, fontFace:FONT, align:'center' } },
    { text:'Notes',   options:{ bold:true, italic:true, color:PINK, fill:{ color:'F3F3F3' }, fontSize:9, fontFace:FONT } }
  ]];
  var planData = nTkts.length > 0
    ? nTkts.slice(0, 20).map(function(t) {
        return [
          { text:t.title||t.id||'', options:{ fontSize:9, fontFace:FONT, color:DARK } },
          { text:sLbl(t.status),    options:{ fontSize:9, fontFace:FONT, color:sCol(t.status), bold:true, align:'center' } },
          { text:t.epic||'',        options:{ fontSize:9, fontFace:FONT, color:GRAY } }
        ];
      })
    : [[
        { text:'Tickets not yet loaded for this sprint', options:{ fontSize:9, fontFace:FONT, color:GRAY, italic:true } },
        { text:'', options:{} },
        { text:'', options:{} }
      ]];
  s5.addTable(planHdr.concat(planData), { x:0.4, y:0.88, w:9.2, border:{ type:'solid', pt:0.5, color:'EFEFEF' }, rowH:0.27, colW:[5.2,1.5,2.5], fontFace:FONT, fontSize:9, valign:'middle', autoPage:true, autoPageRepeatHeader:true });

  // ────────── SLIDE 6: Thank You ──────────
  var s6 = pptx.addSlide();
  s6.addImage({ data:_PPTX_GRAD_BG, x:0, y:0, w:W, h:H });
  s6.addText('Thank You!', { x:0, y:1.7, w:W, h:2.2, fontSize:64, bold:true, color:'FFFFFF', fontFace:FONT, align:'center' });
  s6.addImage({ data:_PPTX_K_LOGO, x:8.7, y:0.22, w:0.92, h:0.92 });

  // ── Save ──
  var fname = (teamName + ' - ' + sprint.name + ' - End of Sprint').replace(/[^a-zA-Z0-9 \-]/g, '').trim() + '.pptx';
  pptx.writeFile({ fileName: fname })
    .then(function()  { _pptxRestoreBtn(btn); })
    .catch(function(e){ console.error('[sprint-pptx] write error:', e); _pptxRestoreBtn(btn); alert('Export failed: ' + (e.message || e)); });
}
