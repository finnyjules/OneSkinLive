// Account sticky nav — mobile drawer toggle.
// Desktop layout is pure CSS (sticky aside). Below 1024px, the nav collapses
// behind a single-button trigger that expands the panel inline. Tapping a nav
// item closes the panel so navigation feels snappy on touch.

(function () {
  const nav = document.querySelector('[data-account-nav]');
  if (!nav) return;

  const trigger = nav.querySelector('[data-account-nav-trigger]');
  const panel = nav.querySelector('[data-account-nav-panel]');
  if (!trigger || !panel) return;

  const setOpen = (isOpen) => {
    nav.classList.toggle('is-open', isOpen);
    trigger.setAttribute('aria-expanded', String(isOpen));
  };

  setOpen(false);

  trigger.addEventListener('click', () => {
    const next = !nav.classList.contains('is-open');
    setOpen(next);
  });

  // Close on item tap (mobile only — on desktop the panel is always open).
  panel.querySelectorAll('a, button').forEach((el) => {
    el.addEventListener('click', () => {
      if (window.matchMedia('(max-width: 1023px)').matches) {
        setOpen(false);
      }
    });
  });

  // Close when the viewport grows past the breakpoint so we don't carry an
  // accidental "is-open" state into desktop layout.
  const mq = window.matchMedia('(min-width: 1024px)');
  const onChange = () => {
    if (mq.matches) setOpen(false);
  };
  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', onChange);
  } else if (typeof mq.addListener === 'function') {
    mq.addListener(onChange);
  }

  // ESC closes on mobile.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) setOpen(false);
  });
})();
