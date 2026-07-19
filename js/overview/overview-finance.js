// overview-finance.js — Finance tab

function ovxFinanceLoad() {
  var body = document.getElementById('ovx-body');
  if (!body) return;
  body.innerHTML = _ovxComingSoonHtml('finance');
}
