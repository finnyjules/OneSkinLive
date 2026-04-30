// Parallax for the hero-benefits section background.
// Translates the bg image between -10% and +10% of its height as the
// section progresses through the viewport. Uses requestAnimationFrame
// so we only update once per repaint instead of every scroll event.

(function () {
  const section = document.querySelector('.hero-benefits');
  const image = section?.querySelector('.hero-benefits__bg-image');
  if (!section || !image) return;

  const RANGE = 20; // total travel in % of image height (-10 to +10)

  let ticking = false;

  function update() {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;

    // Skip work when the section is well outside the viewport.
    if (rect.bottom < -200 || rect.top > vh + 200) {
      ticking = false;
      return;
    }

    // Progress: 0 when section's top is at viewport bottom (just entering),
    // 1 when section's bottom is at viewport top (just leaving).
    const total = vh + rect.height;
    const traveled = vh - rect.top;
    const progress = Math.min(1, Math.max(0, traveled / total));

    const translate = -RANGE / 2 + progress * RANGE;
    image.style.transform = `translate3d(0, ${translate.toFixed(2)}%, 0)`;

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
