// Order History — Reorder shows a toast; "I have a problem" opens a
// demo CX chat panel. The live implementation would call Shopify's cart
// endpoint and the CX widget (Gorgias / Intercom / whichever is wired in)
// respectively.

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

  // CX support chat (demo) — clicking "I have a problem" opens a fixed
  // bottom-right panel. Single instance shared by every history row.
  const chat = document.querySelector('[data-cx-chat]');
  const chatClose = document.querySelector('[data-cx-chat-close]');
  let chatCloseTimer = null;

  function openChat() {
    if (!chat) return;
    clearTimeout(chatCloseTimer);
    chat.hidden = false;
    // Brief setTimeout so the [hidden] removal and the pre-open transform
    // are committed before .is-open kicks the transition in. (rAF is
    // throttled when the tab is hidden, which would block the open state
    // in some testing/preview environments.)
    setTimeout(() => chat.classList.add('is-open'), 16);
  }

  function closeChat() {
    if (!chat) return;
    chat.classList.remove('is-open');
    // Match the CSS transition duration before re-hiding so the fade-out runs.
    chatCloseTimer = setTimeout(() => { chat.hidden = true; }, 200);
  }

  document.querySelectorAll('[data-order-help]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openChat();
    });
  });

  if (chatClose) {
    chatClose.addEventListener('click', closeChat);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chat && !chat.hidden) closeChat();
  });
})();
