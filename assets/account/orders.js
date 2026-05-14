// Order history — Reorder button shows a toast.
// (The "I have a problem" buttons + CX chat panel are wired in cx-chat.js.)
// The live implementation would call Shopify's cart endpoint.

(function () {
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
