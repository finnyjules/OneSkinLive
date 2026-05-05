// Module 05 — Referral preview copy-to-clipboard.
// Same logic powers the Refer-a-Friend standalone page; both call into
// `assets/account/copy-helpers.js`-style helper kept inline for now.

(function () {
  function flashCopied(btn, fallbackLabel) {
    const originalHTML = btn.innerHTML;
    btn.classList.add('is-copied');
    btn.innerHTML = `<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5l3.5 3.5L13 5"/></svg>${fallbackLabel || 'Copied'}`;
    clearTimeout(btn.__copyTimer);
    btn.__copyTimer = setTimeout(() => {
      btn.classList.remove('is-copied');
      btn.innerHTML = originalHTML;
    }, 1800);
  }

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

  document.querySelectorAll('[data-copy-target]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const targetSel = btn.dataset.copyTarget;
      const valueAttr = btn.dataset.copyValue;
      const value = valueAttr || document.querySelector(targetSel)?.textContent?.trim() || '';
      if (!value) return;
      try {
        await navigator.clipboard.writeText(value);
      } catch (_) {
        // Older browsers / non-secure contexts: fall back to execCommand.
        const ta = document.createElement('textarea');
        ta.value = value;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (_) {}
        document.body.removeChild(ta);
      }
      flashCopied(btn, btn.dataset.copyLabel || 'Copied');
      if (btn.dataset.copyToast) showToast(btn.dataset.copyToast);
    });
  });
})();
