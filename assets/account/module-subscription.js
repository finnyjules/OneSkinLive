// Account "Arriving soon" order card behavior.
// - Toggle the items list (collapsed by default for 2+ items, no-op for 1).
// - Drive shipment-state demo from ?ship=... and items-count demo from ?items=...
// In production, the shipment-state and items count come from order data.

(function () {
  const order = document.querySelector('.subscription__order[data-shipment-state]');
  if (!order) return;

  // ---- Shipment-state demo (URL param) ----
  const params = new URLSearchParams(window.location.search);
  const VALID_SHIP = new Set(['ordered', 'transit', 'out-for-delivery', 'delayed']);
  const ship = (params.get('ship') || '').toLowerCase();
  if (VALID_SHIP.has(ship)) {
    order.setAttribute('data-shipment-state', ship);

    // Recompute step states from the chosen shipment state. The latest
    // "done" step is the one before the new active step; everything after
    // is "future".
    const activeIndex = {
      'ordered': 0,
      'transit': 1,
      'out-for-delivery': 2,
      'delayed': 1,
    }[ship];

    order.querySelectorAll('.subscription__order-step').forEach((step, i) => {
      if (i < activeIndex) step.setAttribute('data-state', 'done');
      else if (i === activeIndex) step.setAttribute('data-state', 'active');
      else step.setAttribute('data-state', 'future');
    });
  }

  // ---- Items count demo (URL param) ----
  const items = params.get('items');
  if (items === '1') {
    order.setAttribute('data-items-count', '1');
    order.querySelectorAll('[data-multi-only]').forEach((el) => { el.hidden = true; });
    const countLabel = order.querySelector('[data-items-count-label]');
    if (countLabel) countLabel.textContent = '1 item';
    const totalLabel = order.querySelector('[data-items-total-label]');
    if (totalLabel) totalLabel.textContent = '$90.00';
    const nudgeText = order.querySelector('[data-nudge-text]');
    if (nudgeText) nudgeText.textContent = 'Make it a routine — save $13.50/shipment.';
  }

  // ---- Items toggle ----
  const toggle = order.querySelector('[data-items-toggle]');
  const list = order.querySelector('.subscription__order-items-list');
  const labelShow = order.querySelector('[data-toggle-show]');
  const labelHide = order.querySelector('[data-toggle-hide]');

  if (toggle && list && order.getAttribute('data-items-count') !== '1') {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      list.hidden = expanded;
      if (labelShow && labelHide) {
        labelShow.hidden = !expanded;
        labelHide.hidden = expanded;
      }
    });
  } else if (toggle && order.getAttribute('data-items-count') === '1') {
    toggle.setAttribute('tabindex', '-1');
    toggle.style.cursor = 'default';
    toggle.addEventListener('click', (e) => e.preventDefault());
  }

})();
