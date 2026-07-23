// modules-config.js — single source of truth for module ids/labels used by
// permission checks (admin-users.js) and navigation (app.js). Add a module
// here once; both consumers pick it up automatically.

var KERV_MODULES = [
  { id: 'overview',            label: 'Overview',                   section: 'Overview'       },
  { id: 'overview-okrs',       label: 'Company OKRs',               parent: 'overview'        },
  { id: 'overview-product',    label: 'Product & Tech',             parent: 'overview'        },
  { id: 'overview-sales',      label: 'Revenue',                    parent: 'overview'        },
  { id: 'overview-finance',    label: 'Finance',                    parent: 'overview'        },
  { id: 'overview-operations', label: 'Operations',                 parent: 'overview'        },
  { id: 'overview-hr',         label: 'HR',                         parent: 'overview'        },
  { id: 'company-okrs',        label: 'Company OKRs',               section: 'Company OKRs'   },
  { id: 'roadmap-neon',        label: 'Product Roadmap',            section: 'Product & Tech' },
  { id: 'settings-neon',       label: 'Assumptions',                parent: 'roadmap-neon'    },
  { id: 'teamcapacity-neon',   label: 'Team Capacity',              section: 'Product & Tech' },
  { id: 'product-ideas',       label: 'Product Req / Ideas',        section: 'Product & Tech' },
  { id: 'admin-users',         label: 'Admin — User & Permissions', section: 'Administration' }
];

function kervModuleLabel(id) {
  var m = KERV_MODULES.filter(function(x) { return x.id === id; })[0];
  return m ? m.label : id;
}
