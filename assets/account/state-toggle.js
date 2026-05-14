// Account customer-state toggle.
// On the live site this would be the result of a Skio API call on page load
// (subscriber? which product? OTP?). For the prototype we read ?state= from
// the URL and set <body data-state="..."> so module CSS/JS can branch on it.
//
// Accepted values: body | hair | otp. Default: otp.

(function () {
  const VALID_STATES = new Set(['face', 'hair', 'otp']);
  const VALID_VIEWS = new Set(['both', 'history', 'active']);
  const params = new URLSearchParams(window.location.search);
  const requested = (params.get('state') || '').toLowerCase();
  const state = VALID_STATES.has(requested) ? requested : 'otp';
  const requestedView = (params.get('view') || 'both').toLowerCase();
  const viewParam = VALID_VIEWS.has(requestedView) ? requestedView : 'both';
  const onOrdersPage = document.body.dataset.accountPage === 'orders';

  document.body.setAttribute('data-state', state);
  document.documentElement.setAttribute('data-state', state);

  // Convenience: expose for module scripts that want to react explicitly.
  window.__accountState = state;
  document.dispatchEvent(new CustomEvent('account:state', { detail: { state } }));

  // Hide non-matching state-targets via inline display so module CSS
  // (e.g. `.welcome__subscription { display: flex }`) doesn't fight with us.
  // `data-state-target` accepts a space-separated list; "all" is always shown.
  const applyVisibility = () => {
    document.querySelectorAll('[data-state-target]').forEach((el) => {
      const wants = (el.getAttribute('data-state-target') || '').trim().split(/\s+/);
      const show = wants.includes('all') || wants.includes(state);
      el.style.display = show ? '' : 'none';
    });
  };
  applyVisibility();

  if (onOrdersPage) {
    const activeSection = document.querySelector('[data-order-active]');
    const historySection = document.querySelector('.account-orders__history');
    if (activeSection) activeSection.hidden = (viewParam === 'history');
    if (historySection) historySection.hidden = (viewParam === 'active');
  }

  // Dev-only state switcher chip — appears in the bottom-left so reviewers
  // can hop between states without retyping URLs. Hidden in production by
  // setting body[data-account-prod] (left for future use).
  if (document.body.hasAttribute('data-account-prod')) return;

  const shipParam = (params.get('ship') || 'transit').toLowerCase();

  const chip = document.createElement('div');
  chip.className = 'state-switcher';
  chip.setAttribute('aria-label', 'Customer state (prototype only)');
  chip.innerHTML = `
    <span class="state-switcher__label">Demo state</span>
    <div class="state-switcher__options" role="radiogroup">
      <a class="state-switcher__option" data-state-link="otp" href="?state=otp">OTP</a>
      <a class="state-switcher__option" data-state-link="face" href="?state=face">Face sub</a>
      <a class="state-switcher__option" data-state-link="hair" href="?state=hair">Hair sub</a>
    </div>
    ${state === 'otp' ? `
      <span class="state-switcher__divider" aria-hidden="true"></span>
      <div class="state-switcher__options" role="radiogroup" aria-label="Shipment state">
        <a class="state-switcher__option" data-ship-link="ordered" href="?state=otp&ship=ordered">Ordered</a>
        <a class="state-switcher__option" data-ship-link="transit" href="?state=otp&ship=transit">In transit</a>
        <a class="state-switcher__option" data-ship-link="out-for-delivery" href="?state=otp&ship=out-for-delivery">Out for delivery</a>
        <a class="state-switcher__option" data-ship-link="delayed" href="?state=otp&ship=delayed">Delayed</a>
      </div>
    ` : ''}
    ${onOrdersPage ? `
      <span class="state-switcher__divider" aria-hidden="true"></span>
      <div class="state-switcher__options" role="radiogroup" aria-label="Orders view">
        <a class="state-switcher__option" data-view-link="both" href="?view=both">Active + History</a>
        <a class="state-switcher__option" data-view-link="history" href="?view=history">History only</a>
        <a class="state-switcher__option" data-view-link="active" href="?view=active">Active only</a>
      </div>
    ` : ''}
  `;
  chip.querySelector(`[data-state-link="${state}"]`).classList.add('is-active');
  if (state === 'otp') {
    const shipEl = chip.querySelector(`[data-ship-link="${shipParam}"]`);
    if (shipEl) shipEl.classList.add('is-active');
  }
  if (onOrdersPage) {
    const viewEl = chip.querySelector(`[data-view-link="${viewParam}"]`);
    if (viewEl) viewEl.classList.add('is-active');
  }

  // Preserve the rest of the URL when state-switching across pages.
  chip.querySelectorAll('[data-state-link]').forEach((link) => {
    const next = link.getAttribute('data-state-link');
    const url = new URL(window.location.href);
    url.searchParams.set('state', next);
    if (next !== 'otp') url.searchParams.delete('ship');
    if (viewParam !== 'both') url.searchParams.set('view', viewParam);
    link.setAttribute('href', url.pathname + url.search);
  });

  chip.querySelectorAll('[data-view-link]').forEach((link) => {
    const next = link.getAttribute('data-view-link');
    const url = new URL(window.location.href);
    url.searchParams.set('view', next);
    link.setAttribute('href', url.pathname + url.search);
  });

  document.body.appendChild(chip);

  // Propagate the current state through internal account links so reviewers
  // don't lose their selected variant when navigating between Account home,
  // Order history, and Refer a friend. External links (e.g. Skio portal)
  // are skipped.
  const internalLinks = document.querySelectorAll(
    '.account-nav__item, [data-account-link]'
  );
  internalLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    if (href.startsWith('http') || href.startsWith('//')) return;
    if (href.startsWith('/a/')) return; // Skio portal
    try {
      const url = new URL(href, window.location.origin);
      url.searchParams.set('state', state);
      if (state === 'otp' && shipParam !== 'transit') {
        url.searchParams.set('ship', shipParam);
      }
      if (viewParam !== 'both') url.searchParams.set('view', viewParam);
      link.setAttribute('href', url.pathname + url.search);
    } catch (_) {
      /* ignore unparseable */
    }
  });
})();
