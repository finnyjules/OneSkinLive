// Scroll-driven parallax. Translates configured images vertically based on
// their parent section's progress through the viewport. Uses
// requestAnimationFrame so we only update once per repaint, not per scroll
// event.

(function () {
  // Each entry: section selector, image selector inside that section,
  // and a `range` (% of image height) — positive numbers reverse the
  // direction so the image moves down as the section scrolls up.
  const TARGETS = [
    { section: '.hero-benefits',  image: '.hero-benefits__bg-image',  range: 20 },
    { section: '.key-ingredients', image: '.key-ingredients__media img', range: -16 },
  ];

  const items = TARGETS
    .map((t) => {
      const section = document.querySelector(t.section);
      const image = section?.querySelector(t.image);
      return section && image ? { section, image, range: t.range } : null;
    })
    .filter(Boolean);

  if (!items.length) return;

  let ticking = false;

  function update() {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    items.forEach((item) => {
      const rect = item.section.getBoundingClientRect();

      if (rect.bottom < -200 || rect.top > vh + 200) return;

      // Progress: 0 when section's top is at viewport bottom (just
      // entering), 1 when section's bottom is at viewport top (just
      // leaving).
      const total = vh + rect.height;
      const traveled = vh - rect.top;
      const progress = Math.min(1, Math.max(0, traveled / total));

      const translate = item.range / 2 - progress * item.range;
      item.image.style.transform = `translate3d(0, ${translate.toFixed(2)}%, 0)`;
    });
    ticking = false;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
