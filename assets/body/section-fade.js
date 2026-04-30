// Background-color fade for the OS-01 Peptide (science-module) section.
// As the section scrolls in from the bottom, its background color
// interpolates from white (#FFFFFF) to off-white (#F4F4F2). Held at
// off-white once the section is in/past the viewport.

(function () {
  const section = document.querySelector('.science-module');
  const target = section?.querySelector('.science-module__copy');
  if (!section || !target) return;

  const FROM = [255, 255, 255]; // #FFFFFF
  const TO   = [244, 244, 242]; // #F4F4F2

  let ticking = false;

  function update() {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;

    // Skip work when far above the viewport — keep the off-white color it
    // already settled on so we don't overwrite each frame for nothing.
    if (rect.bottom < -100) {
      ticking = false;
      return;
    }

    // Fade window: section.top from `vh` (just entering) down to vh/2
    // (halfway up the viewport). Past that, bg stays off-white.
    const enter = vh;
    const settle = vh * 0.5;
    let t = (enter - rect.top) / (enter - settle);
    t = Math.min(1, Math.max(0, t));

    const r = Math.round(FROM[0] + (TO[0] - FROM[0]) * t);
    const g = Math.round(FROM[1] + (TO[1] - FROM[1]) * t);
    const b = Math.round(FROM[2] + (TO[2] - FROM[2]) * t);
    target.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;

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
