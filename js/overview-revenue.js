// overview-revenue.js — Revenue tab

function ovxRevenueLoad() {
  var body = document.getElementById('ovx-body');
  if (!body) return;
  body.innerHTML = _ovxComingSoonHtml('sales');
}
