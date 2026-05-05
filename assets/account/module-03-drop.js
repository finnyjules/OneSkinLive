// Module 03 — New Drop interactions.
// - "Add to next shipment" / "Add to cart": mock the Skio inline add by showing
//   a toast (the real wiring talks to the Skio API in a follow-up implementation).
// - SMS opt-in: validate phone format loosely and flip into a success state.

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

  document.querySelectorAll('[data-drop-add]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const message = btn.dataset.dropAdd === 'subscribe'
        ? 'Added to your next shipment'
        : 'Added to cart';
      showToast(message);
    });
  });

  const sms = document.querySelector('[data-drop-sms]');
  if (sms) {
    sms.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = sms.querySelector('input[type="tel"]');
      const value = (input?.value || '').replace(/[^\d]/g, '');
      if (value.length < 10) {
        input?.classList.add('is-error');
        input?.focus();
        return;
      }
      input?.classList.remove('is-error');
      sms.classList.add('is-success');
    });
    sms.querySelector('input[type="tel"]')?.addEventListener('input', (e) => {
      e.target.classList.remove('is-error');
    });
  }
})();
