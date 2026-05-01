// Fade text and content blocks in as they scroll into view.
// Skips the product-hero area at the top of the page since it's above the
// fold and should be visible immediately on load. Uses IntersectionObserver
// (not a scroll listener) so it scales cheaply to many elements.

(function () {
  const selectors = [
    '.hero-benefits__headline',
    '.hero-benefits__list',
    '.timeline__headline',
    '.timeline__step',
    '.timeline__step-list li',
    '.clinical__headline',
    '.clinical__stat',
    '.science-module__media',
    '.science-module__headline',
    '.science-module__body',
    '.science-module__link',
    '.faqs__headline',
    '.faqs__item',
    '.upsell__header',
    '.upsell__card',
    '.protocol__headline',
    '.protocol__card',
    '.lifestyle__card',
    '.lifestyle__stat'
  ];

  const elements = document.querySelectorAll(selectors.join(', '));
  if (!elements.length) return;

  // Stagger siblings within the same parent so groups (e.g. timeline steps,
  // stat columns) cascade rather than landing at the same instant.
  const groupCount = new Map();
  elements.forEach((el) => {
    el.classList.add('fade-in');
    const parent = el.parentElement;
    const idx = groupCount.get(parent) || 0;
    if (idx > 0 && idx <= 10) {
      el.style.transitionDelay = `${idx * 70}ms`;
    }
    groupCount.set(parent, idx + 1);
  });

  // Honor reduced-motion: mark everything visible immediately.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

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

  elements.forEach((el) => observer.observe(el));
})();
