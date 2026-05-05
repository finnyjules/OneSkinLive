// Module 04 — Layer With Your Protocol upsell rail.
// - Arrow buttons page through the rail by one card width.
// - "Add to next order" CTAs flip into a confirmed state with a toast.

(function () {
  const rail = document.querySelector('[data-upsell-rail]');
  if (!rail) return;

  const track = rail.querySelector('[data-upsell-track]');
  const prev = rail.querySelector('[data-upsell-prev]');
  const next = rail.querySelector('[data-upsell-next]');

  const cardWidth = () => {
    const card = track.querySelector('.upsell-card');
    if (!card) return 240;
    const gap = parseFloat(getComputedStyle(track).columnGap || '16');
    return card.getBoundingClientRect().width + gap;
  };

  const updateNav = () => {
    if (!prev || !next) return;
    const max = track.scrollWidth - track.clientWidth - 1;
    prev.toggleAttribute('disabled', track.scrollLeft <= 0);
    next.toggleAttribute('disabled', track.scrollLeft >= max);
  };

  prev?.addEventListener('click', () => {
    track.scrollBy({ left: -cardWidth(), behavior: 'smooth' });
  });
  next?.addEventListener('click', () => {
    track.scrollBy({ left: cardWidth(), behavior: 'smooth' });
  });

  track.addEventListener('scroll', updateNav, { passive: true });
  window.addEventListener('resize', updateNav);
  updateNav();

  // "Add to next order" interaction (subscriber states).
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

  rail.querySelectorAll('[data-upsell-add]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const product = btn.dataset.upsellAdd || 'Item';
      btn.classList.add('upsell-card__cta--added');
      btn.textContent = 'Added';
      showToast(`${product} added to your next order`);
    });
  });
})();
