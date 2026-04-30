// Before/after carousel for the clinical section. Uses Web Animations
// API directly (instead of CSS transitions) so the slide animation fires
// reliably across browsers. The after photo lags the before photo by a
// small delay for a cascading slide.

(function () {
  const carousel = document.querySelector('[data-clinical-carousel]');
  const prev = document.querySelector('[data-clinical-prev]');
  const next = document.querySelector('[data-clinical-next]');
  const indicator = document.querySelector('[data-clinical-indicator]');
  if (!carousel || !prev || !next) return;

  const pairs = Array.from(carousel.querySelectorAll('.clinical__pair'));
  let index = pairs.findIndex((p) => p.classList.contains('clinical__pair--active'));
  if (index < 0) index = 0;

  const DURATION = 520;
  const STAGGER = 90;
  const EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

  // Track the last value applied to each photo so we can animate from
  // the right starting position.
  const photoState = new Map(); // element → 'left' | 'center' | 'right'

  function offsetFor(state) {
    if (state === 'left') return '-100%';
    if (state === 'right') return '100%';
    return '0%';
  }

  function applyState(photo, state, opts = {}) {
    const from = photoState.get(photo) ?? state;
    const to = state;
    photoState.set(photo, to);

    if (from === to && !opts.force) return;

    photo.animate(
      [
        { transform: `translateX(${offsetFor(from)})` },
        { transform: `translateX(${offsetFor(to)})` },
      ],
      {
        duration: DURATION,
        easing: EASING,
        delay: opts.delay || 0,
        fill: 'forwards',
      }
    );
  }

  function render() {
    pairs.forEach((p, i) => {
      const targetState = i < index ? 'left' : i === index ? 'center' : 'right';
      p.classList.toggle('clinical__pair--active', i === index);
      const photos = p.querySelectorAll('.clinical__photo');
      photos.forEach((photo, photoIdx) => {
        applyState(photo, targetState, { delay: photoIdx === 1 ? STAGGER : 0 });
      });
    });
    if (indicator) indicator.textContent = `${index + 1} / ${pairs.length}`;
    prev.disabled = index === 0;
    next.disabled = index === pairs.length - 1;
  }

  // Initial state: place pairs at their resting positions without
  // animating in.
  pairs.forEach((p, i) => {
    const state = i < index ? 'left' : i === index ? 'center' : 'right';
    p.classList.toggle('clinical__pair--active', i === index);
    p.querySelectorAll('.clinical__photo').forEach((photo) => {
      photoState.set(photo, state);
      photo.style.transform = `translateX(${offsetFor(state)})`;
    });
  });

  if (indicator) indicator.textContent = `${index + 1} / ${pairs.length}`;
  prev.disabled = index === 0;
  next.disabled = index === pairs.length - 1;

  prev.addEventListener('click', () => {
    if (index > 0) { index -= 1; render(); }
  });
  next.addEventListener('click', () => {
    if (index < pairs.length - 1) { index += 1; render(); }
  });
})();
