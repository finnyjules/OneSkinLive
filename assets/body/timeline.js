// Timeline progress fill: as the user scrolls, the vertical fill line
// grows from the first dot down to the last. Progress is anchored to the
// dot positions, not the section bounds — so the line is empty when the
// first dot is below the trigger line (viewport center) and fully drawn
// when the last dot reaches it.

(function () {
  const steps = document.querySelectorAll('.timeline__step');
  const track = document.querySelector('.timeline__track');
  const fill = document.querySelector('.timeline__track-fill');
  if (steps.length < 2 || !track || !fill) return;

  const first = steps[0];
  const last = steps[steps.length - 1];

  // Center of the dot relative to its step's top edge — the ::before
  // sits at top: 9px and is 10px tall.
  const DOT_CENTER_OFFSET = 14;

  function layoutTrack() {
    // All offsets are relative to .timeline__steps (the positioned parent).
    const top = first.offsetTop + DOT_CENTER_OFFSET;
    const height = last.offsetTop - first.offsetTop;
    track.style.top = `${top}px`;
    track.style.height = `${height}px`;
  }

  let ticking = false;
  function update() {
    const firstRect = first.getBoundingClientRect();
    const lastRect = last.getBoundingClientRect();
    const triggerY = window.innerHeight / 2;

    const firstDotY = firstRect.top + DOT_CENTER_OFFSET;
    const lastDotY = lastRect.top + DOT_CENTER_OFFSET;
    const range = lastDotY - firstDotY;

    let progress = 0;
    if (range > 0) {
      progress = (triggerY - firstDotY) / range;
      progress = Math.min(1, Math.max(0, progress));
    }

    fill.style.transform = `scaleY(${progress.toFixed(4)})`;
    ticking = false;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  function onResize() {
    layoutTrack();
    onScroll();
  }

  layoutTrack();
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
})();
