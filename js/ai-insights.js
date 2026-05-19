// ai-insights.js
// Centralised rule-based AI Insights logic.
// Each section has its own insights function; all share the generic renderer.
// To add a new section: write a xxxInsights() function, call renderInsightBox().

// ─────────────────────────────────────────────────────────────────────────────
// Generic renderer — shared by all sections
// Usage: renderInsightBox('container-id', 'Optional title', insights[])
// ─────────────────────────────────────────────────────────────────────────────

function renderInsightBox(containerId, title, insights) {
  var el = document.getElementById(containerId);
  if (!el) return;
  if (!insights || !insights.length) { el.innerHTML = ''; return; }

  el.innerHTML =
    '<div style="background:var(--accent-light);border:1px solid var(--accent-muted);border-left:3px solid var(--accent);border-radius:10px;padding:12px 16px">'
    + '<div style="display:flex;align-items:center;gap:7px;margin-bottom:9px">'
    +   '<span style="font-size:9px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:var(--accent);background:rgba(237,0,94,.1);padding:2px 8px;border-radius:20px">✦ AI Insights</span>'
    +   (title ? '<span style="font-size:11px;color:var(--muted)">· ' + title + '</span>' : '')
    + '</div>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:5px 20px">'
    + insights.map(function(ins) {
        return '<div style="display:flex;align-items:baseline;gap:7px;font-size:12px;color:var(--text);line-height:1.5">'
          + '<span style="flex-shrink:0;font-size:13px">' + ins.icon + '</span>'
          + '<span>' + ins.text + '</span>'
          + '</div>';
      }).join('')
    + '</div>'
    + '</div>';
}


// ─────────────────────────────────────────────────────────────────────────────
// Sprint highlights — single sprint (generic, reusable across any team tab)
// Input: sprint object, tickets[], members[] from that team's Jira data
// Called from any team's renderSummary() e.g. xtsRenderSummary()
// ─────────────────────────────────────────────────────────────────────────────

function sprintInsights(sprint, tickets, members) {
  var insights = [];
  var s = sprint.status; // 'in-progress' | 'completed' | 'future'

  // Epic coverage
  var epics = [];
  (tickets || []).forEach(function(t) {
    if (t.epic && epics.indexOf(t.epic) < 0) epics.push(t.epic);
  });
  if (epics.length) {
    var verb = s === 'future' ? 'will span' : s === 'in-progress' ? 'spans' : 'spanned';
    insights.push({ icon: '🎯', text: 'Work ' + verb + ' <strong>' + epics.length
      + ' epic' + (epics.length > 1 ? 's' : '') + '</strong>: ' + epics.join(', ') + '.' });
  }

  // Velocity / progress
  if (s === 'in-progress') {
    var total   = (sprint.byStatus.todo||0) + (sprint.byStatus.inprogress||0)
                + (sprint.byStatus.review||0) + (sprint.byStatus.done||0);
    var donePct = sprint.planned > 0 ? Math.round(sprint.completed / sprint.planned * 100) : 0;
    var wipPct  = total > 0 ? Math.round(((sprint.byStatus.inprogress||0) + (sprint.byStatus.review||0)) / total * 100) : 0;
    var track   = donePct >= 60 ? 'on track' : donePct >= 35 ? 'slightly behind pace' : 'in early stages';
    insights.push({ icon: '📊', text: '<strong>' + donePct + '%</strong> of story points delivered so far, '
      + wipPct + '% of tickets in progress or review. Sprint is <strong>' + track + '</strong>.' });
  } else if (s === 'completed') {
    var pct     = sprint.planned > 0 ? Math.round(sprint.completed / sprint.planned * 100) : 0;
    var verdict = pct >= 90 ? 'Strong delivery' : pct >= 75 ? 'Solid sprint'
                : pct >= 55 ? 'Partial delivery' : 'Challenging sprint';
    insights.push({ icon: '📊', text: '<strong>' + verdict + '</strong>: ' + sprint.completed
      + ' of ' + sprint.planned + ' points delivered (<strong>' + pct + '%</strong>).' });
    if (sprint.carryover > 0) {
      insights.push({ icon: '↩️', text: '<strong>' + sprint.carryover
        + ' ticket' + (sprint.carryover > 1 ? 's' : '') + '</strong> carried over to the next sprint.' });
    }
  } else {
    var ticketCount = (tickets || []).length
      || (sprint.tickets ? Object.values(sprint.tickets).reduce(function(a,v){return a+v;},0) : 0);
    if (sprint.planned > 0 || ticketCount > 0) {
      insights.push({ icon: '📋', text: 'Sprint planned with <strong>' + sprint.planned + ' story points</strong>'
        + (ticketCount > 0 ? ' across ' + ticketCount + ' tickets' : '') + '.' });
    }
  }

  // Team load
  var realMembers = (members || []).filter(function(m) {
    return m.name !== 'Unassigned' && m.assigned > 0;
  });
  if (realMembers.length) {
    var overloaded = realMembers.filter(function(m) {
      return m.capacity > 0 && m.assigned > m.capacity * 1.15;
    });
    var topLoad = realMembers.slice().sort(function(a,b){ return b.assigned - a.assigned; })[0];
    if (overloaded.length) {
      insights.push({ icon: '⚠️', text: overloaded.map(function(m){
        return '<strong>' + m.name.split(' ')[0] + '</strong>';
      }).join(', ') + (overloaded.length > 1 ? ' are' : ' is')
        + ' over capacity — worth reviewing priorities.' });
    } else if (topLoad && s !== 'future') {
      insights.push({ icon: '👤', text: '<strong>' + topLoad.name.split(' ')[0]
        + '</strong> carries the highest load: <strong>' + topLoad.assigned + ' pts</strong> assigned'
        + (topLoad.completed > 0 ? ', ' + topLoad.completed + ' completed' : '') + '.' });
    }
  }

  // Bug health
  if (sprint.bugsIntroduced > 0 || sprint.bugsResolved > 0) {
    if (sprint.bugsIntroduced > sprint.bugsResolved + 1) {
      insights.push({ icon: '🐛', text: '<strong>' + sprint.bugsIntroduced
        + ' bug' + (sprint.bugsIntroduced > 1 ? 's' : '') + '</strong> introduced vs '
        + sprint.bugsResolved + ' resolved — bug count growing.' });
    } else if (sprint.bugsResolved > 0 && sprint.bugsResolved >= sprint.bugsIntroduced) {
      insights.push({ icon: '✅', text: 'Good bug hygiene: <strong>' + sprint.bugsResolved
        + ' resolved</strong>'
        + (sprint.bugsIntroduced > 0 ? ', only ' + sprint.bugsIntroduced + ' new.' : '.') });
    }
  }

  // Ticket mix anomalies
  if (sprint.tickets) {
    var mixTotal = (sprint.tickets.story||0) + (sprint.tickets.bug||0)
                + (sprint.tickets.task||0) + (sprint.tickets.spike||0);
    if (mixTotal > 0 && (sprint.tickets.bug||0) / mixTotal > 0.4) {
      insights.push({ icon: '⚠️', text: '<strong>'
        + Math.round((sprint.tickets.bug||0) / mixTotal * 100)
        + '% of tickets are bugs</strong> — unusually high ratio.' });
    }
    if ((sprint.tickets.spike||0) > 0) {
      insights.push({ icon: '🔬', text: '<strong>' + sprint.tickets.spike
        + ' spike' + (sprint.tickets.spike > 1 ? 's' : '')
        + '</strong> — exploratory / research work in progress.' });
    }
  }

  return insights;
}


// ─────────────────────────────────────────────────────────────────────────────
// Sprint Trend highlights — cross-sprint analysis (generic, reusable across any team tab)
// Input: sprints[] array from that team's Jira data
// Called from any team's renderTrendSummary() e.g. xtsRenderTrendSummary()
// ─────────────────────────────────────────────────────────────────────────────

function sprintTrendInsights(sprints) {
  var insights = [];
  var completed = sprints.filter(function(s) { return s.status === 'completed'; });
  if (completed.length < 2) return insights;

  var last3 = completed.slice(-3);
  var prev3 = completed.length >= 6 ? completed.slice(-6, -3) : (completed.length >= 4 ? completed.slice(0, -3) : []);

  // Velocity trend
  var avgVelLast = last3.reduce(function(a,s){return a+s.completed;},0) / last3.length;
  if (prev3.length) {
    var avgVelPrev = prev3.reduce(function(a,s){return a+s.completed;},0) / prev3.length;
    var velDelta   = avgVelLast - avgVelPrev;
    var trend      = Math.abs(velDelta) < 3 ? 'stable' : velDelta > 0 ? 'improving' : 'declining';
    var velIcon    = trend === 'improving' ? '📈' : trend === 'declining' ? '📉' : '➡️';
    insights.push({ icon: velIcon, text: 'Velocity is <strong>' + trend + '</strong>: avg <strong>'
      + Math.round(avgVelLast) + ' pts/sprint</strong> over the last 3 vs '
      + Math.round(avgVelPrev) + ' pts previously.' });
  } else {
    insights.push({ icon: '📊', text: 'Average velocity over the last ' + last3.length
      + ' completed sprint' + (last3.length > 1 ? 's' : '') + ': <strong>'
      + Math.round(avgVelLast) + ' pts</strong>.' });
  }

  // Completion rate trend
  var compSprints = completed.filter(function(s){ return s.planned > 0; });
  if (compSprints.length >= 3) {
    var cLast = compSprints.slice(-3).map(function(s){ return s.completed / s.planned * 100; });
    var cPrev = compSprints.length >= 6 ? compSprints.slice(-6,-3).map(function(s){ return s.completed / s.planned * 100; }) : [];
    var avgCLast = cLast.reduce(function(a,v){return a+v;},0) / cLast.length;
    if (cPrev.length) {
      var avgCPrev = cPrev.reduce(function(a,v){return a+v;},0) / cPrev.length;
      var cDelta   = avgCLast - avgCPrev;
      if (Math.abs(cDelta) >= 5) {
        insights.push({ icon: cDelta > 0 ? '✅' : '⚠️',
          text: 'Completion rate <strong>' + (cDelta > 0 ? 'up ' : 'down ') + Math.abs(Math.round(cDelta)) + 'pp</strong>: '
          + Math.round(avgCLast) + '% avg over last 3 sprints vs ' + Math.round(avgCPrev) + '% prior period.' });
      } else {
        insights.push({ icon: '➡️', text: 'Completion rate is <strong>steady</strong> at ~'
          + Math.round(avgCLast) + '% over the last 3 sprints.' });
      }
    }
  }

  // Bug trend
  var last3bugs = last3.reduce(function(a,s){return a+(s.bugsIntroduced||0);},0);
  if (prev3.length) {
    var prev3bugs = prev3.reduce(function(a,s){return a+(s.bugsIntroduced||0);},0);
    if (last3bugs > prev3bugs + 2) {
      insights.push({ icon: '🐛', text: 'Bug volume <strong>increasing</strong>: '
        + last3bugs + ' bugs in last 3 sprints vs ' + prev3bugs + ' previously.' });
    } else if (prev3bugs > last3bugs + 2) {
      insights.push({ icon: '✅', text: 'Bug volume <strong>decreasing</strong>: '
        + last3bugs + ' bugs in last 3 sprints vs ' + prev3bugs + ' previously — quality improving.' });
    }
  }

  // Carryover trend
  var carry3 = last3.reduce(function(a,s){return a+(s.carryover||0);},0);
  if (prev3.length) {
    var carryPrev = prev3.reduce(function(a,s){return a+(s.carryover||0);},0);
    if (carry3 > carryPrev + 3) {
      insights.push({ icon: '↩️', text: 'Carryover <strong>rising</strong>: '
        + carry3 + ' tickets carried over in last 3 sprints vs ' + carryPrev + ' previously.' });
    } else if (carry3 === 0) {
      insights.push({ icon: '🏁', text: '<strong>Zero carryover</strong> across the last 3 sprints — excellent predictability.' });
    }
  }

  return insights;
}


// ─────────────────────────────────────────────────────────────────────────────
// Overview — Quarter at a Glance highlights
// Called from overview.js → ovxRender()
// ─────────────────────────────────────────────────────────────────────────────

function ovxQuarterInsights(qInits, selQ, qPct, qByDs, qTotal, teamMap, teamNames,
                             hasCapData, usedEng, usedPrd, usedDes, budEng, budPrd, budDes) {
  var insights = [];
  if (qTotal === 0) {
    insights.push({ icon: '📋', text: 'No initiatives planned for <strong>' + selQ + '</strong> yet.' });
    return insights;
  }

  var delivered   = qByDs['delivered']   || 0;
  var inProgress  = qByDs['in-progress'] || 0;
  var atRisk      = qByDs['at-risk']     || 0;

  // Delivery verdict
  if (qPct >= 80) {
    insights.push({ icon: '🎯', text: 'Strong quarter: <strong>' + qPct + '%</strong> delivered ('
      + delivered + ' of ' + qTotal + ' initiatives).' });
  } else if (qPct >= 50) {
    insights.push({ icon: '📊', text: '<strong>' + delivered + ' of ' + qTotal + '</strong> initiatives delivered ('
      + qPct + '%). <strong>' + inProgress + '</strong> still in flight.' });
  } else {
    insights.push({ icon: '⚠️', text: 'Delivery at <strong>' + qPct + '%</strong> — '
      + (qTotal - delivered) + ' initiatives still to land this quarter.' });
  }

  // At-risk
  if (atRisk > 0) {
    insights.push({ icon: '🚨', text: '<strong>' + atRisk + ' initiative'
      + (atRisk > 1 ? 's' : '') + ' at risk</strong> — needs immediate attention.' });
  }

  // Busiest team
  if (teamNames.length > 0) {
    var teamCounts = teamNames.map(function(t) {
      var count = Object.values(teamMap[t]).reduce(function(a,v){return a+v;},0);
      return { name: t, count: count };
    });
    teamCounts.sort(function(a,b){ return b.count - a.count; });
    var top = teamCounts[0];
    if (top.count > 0) {
      insights.push({ icon: '👥', text: '<strong>' + top.name + '</strong> is the most active team this quarter with '
        + top.count + ' initiative' + (top.count > 1 ? 's' : '') + '.' });
    }
  }

  // Capacity
  if (hasCapData) {
    var caps = [
      { name: 'Engineering', used: usedEng, bud: budEng },
      { name: 'Product',     used: usedPrd, bud: budPrd },
      { name: 'Design',      used: usedDes, bud: budDes }
    ].filter(function(c){ return c.bud > 0; });
    var over  = caps.filter(function(c){ return c.used > c.bud * 1.1; });
    var under = caps.filter(function(c){ return c.used < c.bud * 0.65; });
    if (over.length) {
      insights.push({ icon: '⚠️', text: over.map(function(c){
        return '<strong>' + c.name + '</strong>';
      }).join(', ') + (over.length > 1 ? ' are' : ' is') + ' over capacity this quarter.' });
    } else if (under.length) {
      insights.push({ icon: '💡', text: under.map(function(c){
        return '<strong>' + c.name + '</strong>';
      }).join(', ') + ' has capacity headroom — consider pulling in more work.' });
    }
  }

  return insights;
}


// ─────────────────────────────────────────────────────────────────────────────
// Overview — Portfolio View highlights
// Called from overview.js → ovxRender()
// ─────────────────────────────────────────────────────────────────────────────

function ovxPortfolioInsights(yrInits, selYr, quarters, qMap, byDs, pct, allDrivers, yearDriverMap) {
  var insights = [];
  var total = yrInits.length;
  if (total === 0) {
    insights.push({ icon: '📋', text: 'No initiatives recorded for <strong>' + selYr + '</strong> yet.' });
    return insights;
  }

  var doneCount = byDs['delivered'] || 0;

  // Overall year verdict
  if (pct >= 70) {
    insights.push({ icon: '🏆', text: '<strong>' + pct + '%</strong> delivery rate across ' + selYr
      + ' — ' + doneCount + ' of ' + total + ' initiatives delivered.' });
  } else {
    insights.push({ icon: '📊', text: '<strong>' + total + '</strong> initiatives across ' + selYr
      + ', with <strong>' + pct + '%</strong> delivered so far.' });
  }

  // Best quarter by completion %
  var qStats = quarters.map(function(q) {
    var items = qMap[q] || [];
    var done  = items.filter(function(i){ return (i.deliveryStatus||'') === 'delivered'; }).length;
    return { q: q, done: done, total: items.length,
             pct: items.length ? Math.round(done / items.length * 100) : 0 };
  }).filter(function(q){ return q.total > 0; });

  if (qStats.length > 1) {
    var byPct = qStats.slice().sort(function(a,b){ return b.pct - a.pct; });
    var best  = byPct[0];
    var qLabel = best.q.replace(' ' + selYr, '');
    insights.push({ icon: '🥇', text: '<strong>' + qLabel + '</strong> was the strongest quarter: '
      + best.pct + '% delivery (' + best.done + '/' + best.total + ').' });

    // Busiest quarter by volume
    var byVol   = qStats.slice().sort(function(a,b){ return b.total - a.total; });
    var busiest = byVol[0];
    if (busiest.q !== best.q) {
      insights.push({ icon: '📦', text: '<strong>' + busiest.q.replace(' ' + selYr,'') + '</strong> was the busiest quarter with '
        + busiest.total + ' initiative' + (busiest.total > 1 ? 's' : '') + '.' });
    }
  }

  // Dominant driver
  if (allDrivers.length > 0) {
    var sorted = allDrivers.slice().sort(function(a,b){
      return (yearDriverMap[b]||0) - (yearDriverMap[a]||0);
    });
    var topDriver = sorted[0];
    var topCount  = yearDriverMap[topDriver] || 0;
    if (topCount > 0) {
      insights.push({ icon: '🎯', text: '<strong>' + topDriver + '</strong> is the dominant driver: '
        + topCount + ' initiative' + (topCount > 1 ? 's' : '')
        + ' (' + Math.round(topCount / total * 100) + '% of portfolio).' });
    }
  }

  return insights;
}
