// Order History — filter chips toggle visibility of rows by data-order-type.
// Pure visual filtering for the prototype; the live implementation would query
// Shopify's order endpoint with the same chip state.

(function () {
  const filters = document.querySelectorAll('[data-order-filter]');
  const rows = document.querySelectorAll('[data-order-row]');
  const empty = document.querySelector('[data-order-empty]');
  if (!filters.length || !rows.length) return;

  const apply = (which) => {
    let shown = 0;
    rows.forEach((row) => {
      const type = row.dataset.orderType;
      const matches = which === 'all' || type === which;
      row.classList.toggle('is-hidden', !matches);
      if (matches) shown += 1;
    });
    empty?.classList.toggle('is-shown', shown === 0);
  };

  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      filters.forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
      apply(btn.dataset.orderFilter);
    });
  });

  // Reorder buttons → simple toast.
  function showToast(message) {
    let toast = document.querySelector('.copy-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'copy-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toast.__timer);
    toast.__timer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }

  document.querySelectorAll('[data-order-reorder]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Reordered — items added to your cart');
    });
  });
})();
