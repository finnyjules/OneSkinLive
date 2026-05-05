// Fade content blocks in as they scroll into view (account variant).
// Mirrors /assets/body/fade-in.js but targets account-page selectors.
// Uses IntersectionObserver so it scales cheaply across all modules.

(function () {
  const selectors = [
    '.welcome__intro',
    '.welcome__status > div',
    '.journey__header',
    '.journey__step',
    '.journey__footer',
    '.drop',
    '.upsell-rail__header',
    '.upsell-rail__card',
    '.referral-preview',
    '.account-page-header',
    '.account-orders__row',
    '.referral-page__hero',
    '.referral-page__code-card',
    '.referral-page__share',
    '.referral-page__tracker',
    '.referral-page__terms',
  ];

  const elements = Array.from(document.querySelectorAll(selectors.join(', ')));
  if (!elements.length) return;

  // Skip the work entirely under reduced motion.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Split into above-fold (already visible at first paint, render immediately)
  // and below-fold (animate in on scroll). Above-fold elements never get the
  // .fade-in class so they paint instantly with no transition delay.
  const viewportH = window.innerHeight;
  const aboveFold = [];
  const belowFold = [];
  elements.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top < viewportH * 0.95) aboveFold.push(el);
    else belowFold.push(el);
  });

  if (!belowFold.length) return;

  // Stagger siblings within the same parent so groups (e.g. timeline steps)
  // cascade rather than landing at the same instant.
  const groupCount = new Map();
  belowFold.forEach((el) => {
    el.classList.add('fade-in');
    const parent = el.parentElement;
    const idx = groupCount.get(parent) || 0;
    if (idx > 0 && idx <= 10) {
      el.style.transitionDelay = `${idx * 70}ms`;
    }
    groupCount.set(parent, idx + 1);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px',
    }
  );

  belowFold.forEach((el) => observer.observe(el));
})();
