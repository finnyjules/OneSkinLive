// CX support chat (demo).
// Opens via two triggers:
//   - [data-order-help]        — order-row "I have a problem" buttons.
//                                 Shows the "Reference: Order #..." line.
//   - [data-cx-chat-trigger]   — "Contact support" in the account nav.
//                                 Hides the reference line (no specific order).
//
// Closes via [data-cx-chat-close], Escape, or clicking the dismiss button.
// The live implementation would call out to the CX widget (Gorgias /
// Intercom / whichever is wired in).

(function () {
  const chat = document.querySelector('[data-cx-chat]');
  if (!chat) return;

  const chatClose = chat.querySelector('[data-cx-chat-close]');
  const reference = chat.querySelector('[data-cx-chat-reference]');
  let closeTimer = null;

  function open(opts = {}) {
    clearTimeout(closeTimer);
    if (reference) reference.hidden = opts.context !== 'order';
    chat.hidden = false;
    // Brief setTimeout so the [hidden] removal and the pre-open transform
    // commit before .is-open kicks in. (rAF is throttled when the tab is
    // hidden, which would block the open transition in some preview
    // environments.)
    setTimeout(() => chat.classList.add('is-open'), 16);
  }

  function close() {
    chat.classList.remove('is-open');
    // Match the CSS transition duration before re-hiding so the fade-out runs.
    closeTimer = setTimeout(() => { chat.hidden = true; }, 200);
  }

  document.querySelectorAll('[data-order-help]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      open({ context: 'order' });
    });
  });

  document.querySelectorAll('[data-cx-chat-trigger]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      open({ context: 'generic' });
    });
  });

  if (chatClose) {
    chatClose.addEventListener('click', close);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !chat.hidden) close();
  });
})();
