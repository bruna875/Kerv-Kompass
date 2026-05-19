// xts-team.js — Sprint Analysis, driven by jira_projects table
// 1 project  → normal view (current behaviour)
// 2+ projects → chips row at top to switch between projects

var _xtsProjects  = [];  // loaded from /api/neon/lookup?t=jira-projects
var _xtsInstances = {};  // { jira_id: saInstance }
var _xtsActive    = null;

// Return or create the createSprintAnalysis instance for a project
function _xtsInstance(proj) {
  var key = proj.jira_id;
  if (!_xtsInstances[key]) {
    var saId = 'xts' + proj.jira_id.toLowerCase().replace(/[^a-z0-9]/g, '');
    _xtsInstances[key] = createSprintAnalysis({
      id:         saId,
      teamName:   proj.team_name,
      subtitle:   'Sprint analytics & velocity tracking',
      projectKey: proj.jira_id
    });
  }
  return _xtsInstances[key];
}

// Render chips + analysis content for the given project
function _xtsRenderInner(proj) {
  _xtsActive = proj.jira_id;
  var outer = document.getElementById('xts-outer');
  if (!outer) return;

  var chipsHtml = '';
  if (_xtsProjects.length > 1) {
    chipsHtml = '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px">'
      + _xtsProjects.map(function(p) {
          var act = p.jira_id === proj.jira_id;
          return '<button onclick="_xtsSwitch(\'' + p.jira_id.replace(/'/g, "\\'") + '\')" style="'
            + 'display:inline-flex;align-items:center;gap:6px;'
            + 'padding:5px 14px;border-radius:20px;font-size:12px;font-weight:500;font-family:inherit;cursor:pointer;'
            + 'border:1.5px solid ' + (act ? 'var(--accent)' : 'var(--border-md)') + ';'
            + 'background:' + (act ? 'var(--accent)' : 'var(--surface)') + ';'
            + 'color:' + (act ? '#fff' : 'var(--muted)') + ';'
            + 'transition:all .15s">'
            + '<span style="font-weight:700;' + (act ? '' : 'color:var(--accent)') + '">' + p.jira_id + '</span>'
            + '<span style="' + (act ? 'opacity:.85' : '') + '">' + p.team_name + '</span>'
            + '</button>';
        }).join('')
      + '</div>';
  }

  var inst = _xtsInstance(proj);
  outer.innerHTML = chipsHtml + '<div id="xts-inner">' + inst.render() + '</div>';
  setTimeout(function() { inst.init(); }, 50);
}

// Public: switch to a different project chip
function _xtsSwitch(jiraId) {
  var proj = _xtsProjects.filter(function(p) { return p.jira_id === jiraId; })[0];
  if (!proj) return;
  _xtsRenderInner(proj);
}

// Public: render shell (called by app.js PAGES map)
function renderXtsTeam() {
  return '<div id="xts-outer"></div>';
}

// Public: init (called by app.js setPage after render)
function xtsInit() {
  fetch('/api/neon/lookup?t=jira-projects')
    .then(function(r) { return r.json(); })
    .then(function(rows) {
      _xtsProjects = (Array.isArray(rows) && rows.length)
        ? rows
        : [{ jira_id: 'SDT', team_name: 'XTS Team' }];
      _xtsRenderInner(_xtsProjects[0]);
    })
    .catch(function() {
      _xtsProjects = [{ jira_id: 'SDT', team_name: 'XTS Team' }];
      _xtsRenderInner(_xtsProjects[0]);
    });
}
