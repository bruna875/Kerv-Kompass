// product-spec.js — KERV Team Platform product overview page

var PS_MODULES = [
  {
    id: 'overview',
    label: 'Overview',
    icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    description: 'A unified entry point that gives every team member an immediate read on where the company stands. The Overview consolidates product delivery, objectives, financial performance and sales activity into a single, role-filtered dashboard.',
    features: [
      {
        label: 'Product & Tech',
        description: 'Live snapshot of sprint progress, initiative delivery and team activity across all engineering and product squads.',
        soon: false
      },
      {
        label: 'OKRs',
        description: 'Objective and key result tracking aligned to company-level and team-level goals.',
        soon: true
      },
      {
        label: 'Finance',
        description: 'Budget vs actuals and key financial performance indicators for leadership visibility.',
        soon: true
      },
      {
        label: 'Sales',
        description: 'Pipeline status and revenue metrics surfaced for cross-functional awareness.',
        soon: true
      }
    ]
  },
  {
    id: 'roadmap',
    label: 'Product Roadmap',
    icon: '<path d="M3 3h18v18H3z" stroke="none" fill="none"/><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    description: 'A structured view of all product initiatives, mapped across quarters, teams and strategic themes. Designed to make planning decisions visible and keep delivery aligned to business priorities.',
    features: [
      {
        label: 'Quarter-based roadmap',
        description: 'Initiatives organised by quarter with a Gantt timeline for cross-team delivery visibility.',
        soon: false
      },
      {
        label: 'Driver & theme tagging',
        description: 'Each initiative can be tagged with a strategic driver and theme, enabling filtered views by business priority.',
        soon: false
      },
      {
        label: 'ROI calculator',
        description: 'Built-in estimation tool with configurable templates (cost saving, revenue growth, risk reduction) to quantify initiative value.',
        soon: false
      },
      {
        label: 'Team & status filters',
        description: 'Slice the roadmap by team, status, driver or theme for focused planning sessions.',
        soon: false
      },
      {
        label: 'CSV import',
        description: 'Bulk-load initiatives from a spreadsheet to accelerate onboarding and planning cycles.',
        soon: false
      }
    ],
    howItWorks: [
      'Create initiatives with a title, team, quarter, driver and status — either manually or via CSV import.',
      'The Gantt timeline auto-populates from initiative dates, giving an instant cross-team delivery view.',
      'Open the ROI calculator on any initiative to attach a quantified value estimate using one of the built-in templates.',
      'Use team, driver and theme filters to slice the roadmap for planning sessions or stakeholder reviews.'
    ]
  },
  {
    id: 'capacity',
    label: 'Team Capacity',
    icon: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    description: 'A planning layer that maps team member availability to sprint allocations, surfacing capacity gaps before they become delivery risks. Pairs with Assumptions to keep calculations grounded in up-to-date planning inputs.',
    features: [
      {
        label: 'Sprint capacity vs allocation',
        description: 'Per-team view comparing available capacity to current sprint commitments.',
        soon: false
      },
      {
        label: 'Individual availability tracking',
        description: 'Member-level entries with leave, part-time and focus-area adjustments.',
        soon: false
      },
      {
        label: 'Budget tracking',
        description: 'Team-level budget monitoring alongside capacity data for resource planning.',
        soon: false
      },
      {
        label: 'Assumptions integration',
        description: 'Capacity calculations draw from the shared Assumptions table, ensuring consistent planning variables across teams.',
        soon: false
      }
    ],
    howItWorks: [
      'Set up your teams, members and day budgets once in Assumptions Management — these feed all capacity calculations automatically.',
      'At the start of each sprint, enter each member\'s available days accounting for leave, part-time arrangements and focus areas.',
      'The module compares available capacity against sprint allocations and surfaces any gaps before the sprint begins.',
      'Budget tracking runs in parallel, giving team leads a combined view of time and spend against quarterly targets.'
    ]
  },
  {
    id: 'sprint',
    label: 'Sprint Analysis',
    icon: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    description: 'A sprint-by-sprint diagnostic tool that connects directly to Jira and surfaces velocity trends, completion rates and team performance metrics. Designed for team leads and product managers who need actionable data without leaving the platform.',
    features: [
      {
        label: 'Jira integration',
        description: 'Live pull of issues, sprints and story points from Jira. No manual exports needed.',
        soon: false
      },
      {
        label: 'Velocity chart',
        description: 'Historical velocity per sprint with visual indicators for healthy, at-risk and off-track delivery.',
        soon: false
      },
      {
        label: 'Sprint completion & carry-over',
        description: 'Completion rate and carry-over tracking per sprint to identify recurring patterns.',
        soon: false
      },
      {
        label: 'AI sprint insights',
        description: 'Automatically generated commentary on sprint health, highlights and areas of concern.',
        soon: false
      },
      {
        label: 'Pinned links',
        description: 'Team-scoped shortcut links pinned directly to the sprint view for quick access to relevant resources.',
        soon: false
      }
    ],
    howItWorks: [
      'Connect your Jira project once — Sprint Analysis pulls sprints, issues and story points live with no manual exports.',
      'Select a team and sprint to see velocity, completion rate, carry-over and epic distribution calculated automatically.',
      'AI insights run over the loaded data and surface patterns — delivery trends, workload imbalances, recurring issues — without any manual analysis.',
      'Use the velocity chart to review historical performance across the last 3–5 sprints and inform the next sprint commitment.'
    ]
  },
  {
    id: 'ai-insights',
    label: 'AI Insights',
    icon: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
    description: 'A rule-based insight engine embedded across the platform that automatically surfaces patterns, anomalies and signals from live data — without requiring any manual analysis. Insights appear contextually alongside the data they refer to.',
    features: [
      {
        label: 'Sprint insights',
        description: 'Analyses the active sprint in real time: story point delivery rate, epic distribution, member workload balance, bug hygiene and spike volume.',
        soon: false
      },
      {
        label: 'Sprint trend insights',
        description: 'Reads across the last 3–5 completed sprints to surface velocity direction, completion rate stability, rising carryover and bug volume trends.',
        soon: false
      },
      {
        label: 'Quarter insights',
        description: 'Evaluates initiative delivery for the selected quarter — completion rate, at-risk items, team concentration and driver coverage.',
        soon: false
      },
      {
        label: 'Portfolio insights',
        description: 'Analyses the full year view: ROI distribution across drivers, delivery momentum and any structural imbalances in the initiative mix.',
        soon: false
      }
    ]
  }
];

function psRender() {
  var root = document.getElementById('ps-root');
  if (!root) return;
  root.innerHTML = PS_MODULES.map(psModuleHtml).join('');
}

function psModuleHtml(m) {
  var features = m.features.map(function(f) {
    return '<li style="display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-bottom:1px solid #f1f5f9">'
      + '<span style="flex-shrink:0;margin-top:6px;width:6px;height:6px;border-radius:50%;background:' + (f.soon ? '#94a3b8' : '#ED005E') + '"></span>'
      + '<span>'
      +   '<span style="font-size:13px;font-weight:500;color:#1e293b">' + f.label + '</span>'
      +   (f.soon ? '<span style="margin-left:7px;font-size:10px;font-weight:600;letter-spacing:.4px;text-transform:uppercase;color:#94a3b8;background:#f1f5f9;padding:2px 7px;border-radius:4px">Coming Soon</span>' : '')
      +   '<span style="display:block;font-size:12px;color:#64748b;margin-top:2px;line-height:1.6">' + f.description + '</span>'
      + '</span>'
      + '</li>';
  }).join('');

  var howItWorksHtml = '';
  if (m.howItWorks && m.howItWorks.length) {
    var steps = m.howItWorks.map(function(step, i) {
      return '<li style="display:flex;gap:10px;align-items:flex-start' + (i < m.howItWorks.length - 1 ? ';margin-bottom:10px' : '') + '">'
        + '<span style="flex-shrink:0;margin-top:1px;width:18px;height:18px;border-radius:50%;background:#e2e8f0;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#64748b">' + (i + 1) + '</span>'
        + '<span style="font-size:12px;color:#475569;line-height:1.65">' + step + '</span>'
        + '</li>';
    }).join('');
    howItWorksHtml = '<div style="margin-top:20px;padding:16px 18px;background:#f8fafc;border-radius:10px;border:1px solid #f1f5f9">'
      + '<div style="font-size:10px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#94a3b8;margin-bottom:12px">How it works</div>'
      + '<ol style="list-style:none;padding:0;margin:0">' + steps + '</ol>'
      + '</div>';
  }

  var iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + m.icon + '</svg>';

  return '<div class="ps-module" style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:28px 32px;margin-bottom:20px;page-break-inside:avoid">'
    + '<div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:14px">'
    +   '<div style="flex-shrink:0;width:38px;height:38px;border-radius:10px;background:#fdf2f7;display:flex;align-items:center;justify-content:center;color:#ED005E">' + iconSvg + '</div>'
    +   '<div>'
    +     '<div style="font-size:16px;font-weight:600;color:#1e293b;letter-spacing:-.3px">' + m.label + '</div>'
    +     (m.isAdmin ? '<div style="margin-top:2px;font-size:10px;font-weight:600;letter-spacing:.4px;text-transform:uppercase;color:#94a3b8">Administration</div>' : '')
    +   '</div>'
    + '</div>'
    + '<p style="font-size:13px;color:#475569;line-height:1.7;margin:0 0 18px">' + m.description + '</p>'
    + '<div style="font-size:10px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#94a3b8;margin-bottom:6px">Key Features</div>'
    + '<ul style="list-style:none;padding:0;margin:0">' + features + '</ul>'
    + howItWorksHtml
    + '</div>';
}

// ── Support Tools ────────────────────────────────────────────────────────────

var PS_TOOLS = [
  {
    id: 'assumptions',
    label: 'Assumptions Management',
    icon: '<path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2z"/><path d="M7 7h.01"/>',
    description: 'A slide-out panel that centralises all the fixed values and planning assumptions that feed the rest of the platform. From day-rate costs and team budgets to strategic drivers and themes, Assumptions Management ensures every calculation across the platform draws from a single, editable source of truth.',
    features: [
      {
        label: 'Team Capacity',
        description: 'Set day budgets per team and discipline per quarter, feeding directly into the Team Capacity module.',
        soon: false
      },
      {
        label: 'Team Members',
        description: 'Manage the roster of people per team, with roles and availability used in capacity calculations.',
        soon: false
      },
      {
        label: 'Drivers',
        description: 'Define the strategic drivers used to classify and filter roadmap initiatives across the platform.',
        soon: false
      },
      {
        label: 'Teams',
        description: 'Configure the list of teams that appear across roadmap, capacity and sprint analysis views.',
        soon: false
      },
      {
        label: 'Assumptions',
        description: 'Maintain the fixed planning values — costs, rates, productivity factors — that feed ROI and budget calculations.',
        soon: false
      }
    ],
    howItWorks: [
      'Open Assumptions Management from the side panel — no page navigation needed, it overlays the current view.',
      'Set up Teams and Team Members first; these populate the rosters used in capacity calculations across the platform.',
      'Define Drivers to classify roadmap initiatives by strategic priority, then add Themes for further grouping.',
      'Update the Assumptions tab whenever planning inputs change — all dependent calculations across the platform reflect the new values immediately.'
    ]
  },
  {
    id: 'user-mgmt',
    label: 'User Management',
    icon: '<circle cx="6" cy="5" r="2.5"/><path d="M1.5 13c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4"/><path d="M11 7.5l1 1 2-2"/>',
    description: 'A role-based access control panel for administrators. Each user can be granted independent permissions per module — separating who can edit from who can only view — without any access spilling over between areas.',
    features: [
      {
        label: 'Per-module roles',
        description: 'Admin (full write) and Viewer (read-only) roles assigned independently per module.',
        soon: false
      },
      {
        label: 'Email invite flow',
        description: 'Invite new users by email with a time-limited secure link; no manual password sharing required.',
        soon: false
      },
      {
        label: 'Real-time permission propagation',
        description: 'Permission changes take effect on the next page load — no re-login required.',
        soon: false
      }
    ],
    howItWorks: [
      'Invite a new team member by entering their email — they receive a secure, time-limited link to set their password.',
      'Assign permissions per module independently: a user can be an Editor on the Roadmap but a Viewer on Sprint Analysis.',
      'Changes saved by an admin take effect on the user\'s next page load without requiring them to log out and back in.',
      'Viewer access lets users see data and reports for their permitted modules without any ability to create, edit or delete.'
    ]
  },
  {
    id: 'roi-calc',
    label: 'Standalone ROI Calculator',
    icon: '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="10" y2="18"/><line x1="14" y1="18" x2="16" y2="18"/>',
    description: 'A configurable ROI estimation tool available directly within each roadmap initiative. Supports multiple value templates so teams can consistently quantify the expected return of any piece of work before it is committed to the roadmap.',
    features: [
      {
        label: 'Multiple value templates',
        description: '<b>Revenue Generating</b> — measures the direct revenue impact over a 12-month forecast window. <b>Operational Efficiency</b> — converts staff time saved into monetary value using hourly cost assumptions. <b>Enhancement Attribution</b> — attributes a share of existing product revenue based on the initiative\'s estimated contribution to growth. <b>Strategic (Multiple Expansion)</b> — quantifies enterprise value creation through EBITDA multiple expansion, adjusted for execution risk via a Confidence Score. <b>Tech Scaling</b> — converts engineering time freed from maintenance into monetary value. <b>Tech R&amp;D</b> — coming soon.',
        soon: false
      },
      {
        label: 'Saved to initiative',
        description: 'ROI results are stored against the initiative and surfaced in table, Gantt and portfolio views.',
        soon: false
      },
      {
        label: 'Portfolio aggregation',
        description: 'Average ROI is rolled up across teams and quarters in the Portfolio View for leadership visibility.',
        soon: false
      }
    ],
    howItWorks: [
      'Open the ROI calculator from any initiative row in the Product Roadmap — it opens as an overlay without leaving the current view.',
      'Select the value template that best matches the initiative type: revenue growth, cost saving, risk reduction, strategic or technical.',
      'Fill in the template inputs — the calculator derives the estimated ROI value and confidence-adjusted return automatically.',
      'Save the result to the initiative; it appears in table and Gantt views and rolls up into the Portfolio average ROI.'
    ]
  },
  {
    id: 'csv-import',
    label: 'Roadmap Items CSV Import',
    icon: '<polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>',
    description: 'A bulk-import tool for loading roadmap initiatives from a spreadsheet. Designed to accelerate onboarding and make it easy to migrate existing planning data without manual entry.',
    features: [
      {
        label: 'CSV template',
        description: 'Downloadable template with all supported fields pre-mapped to the platform data model.',
        soon: false
      },
      {
        label: 'Field mapping',
        description: 'Supports title, team, driver, theme, quarter, status and added value columns.',
        soon: false
      },
      {
        label: 'Error handling',
        description: 'Invalid rows are flagged on import with actionable feedback rather than silently dropped.',
        soon: false
      }
    ]
  }
];

function psToolsRender() {
  var root = document.getElementById('ps-tools-root');
  if (!root) return;
  root.innerHTML = PS_TOOLS.map(function(t) { return psToolHtml(t); }).join('');
}

function psToolHtml(t) {
  var features = t.features.map(function(f) {
    return '<li style="display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-bottom:1px solid #f1f5f9">'
      + '<span style="flex-shrink:0;margin-top:6px;width:6px;height:6px;border-radius:50%;background:#6366F1"></span>'
      + '<span>'
      +   '<span style="font-size:13px;font-weight:500;color:#1e293b">' + f.label + '</span>'
      +   '<span style="display:block;font-size:12px;color:#64748b;margin-top:2px;line-height:1.6">' + f.description + '</span>'
      + '</span>'
      + '</li>';
  }).join('');

  var howItWorksHtml = '';
  if (t.howItWorks && t.howItWorks.length) {
    var steps = t.howItWorks.map(function(step, i) {
      return '<li style="display:flex;gap:10px;align-items:flex-start' + (i < t.howItWorks.length - 1 ? ';margin-bottom:10px' : '') + '">'
        + '<span style="flex-shrink:0;margin-top:1px;width:18px;height:18px;border-radius:50%;background:#e2e8f0;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#64748b">' + (i + 1) + '</span>'
        + '<span style="font-size:12px;color:#475569;line-height:1.65">' + step + '</span>'
        + '</li>';
    }).join('');
    howItWorksHtml = '<div style="margin-top:20px;padding:16px 18px;background:#f8fafc;border-radius:10px;border:1px solid #f1f5f9">'
      + '<div style="font-size:10px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#94a3b8;margin-bottom:12px">How it works</div>'
      + '<ol style="list-style:none;padding:0;margin:0">' + steps + '</ol>'
      + '</div>';
  }

  var iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + t.icon + '</svg>';

  return '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:28px 32px;margin-bottom:20px;page-break-inside:avoid">'
    + '<div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:14px">'
    +   '<div style="flex-shrink:0;width:38px;height:38px;border-radius:10px;background:#eef2ff;display:flex;align-items:center;justify-content:center;color:#6366F1">' + iconSvg + '</div>'
    +   '<div style="font-size:16px;font-weight:600;color:#1e293b;letter-spacing:-.3px;padding-top:9px">' + t.label + '</div>'
    + '</div>'
    + '<p style="font-size:13px;color:#475569;line-height:1.7;margin:0 0 18px">' + t.description + '</p>'
    + '<div style="font-size:10px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#94a3b8;margin-bottom:6px">Key Features</div>'
    + '<ul style="list-style:none;padding:0;margin:0">' + features + '</ul>'
    + howItWorksHtml
    + '</div>';
}
