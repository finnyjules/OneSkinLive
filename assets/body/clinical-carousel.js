// Before/after carousel for the clinical section. All pairs share the
// same grid cell. JS sets each photo's inline transform: the active pair
// sits at translateX(0), pairs to the left slide off to translateX(-100%),
// pairs to the right wait at translateX(100%). The after photo carries
// a transition-delay so it lags the before photo for a nice cascade.

(function () {
  const carousel = document.querySelector('[data-clinical-carousel]');
  const prev = document.querySelector('[data-clinical-prev]');
  const next = document.querySelector('[data-clinical-next]');
  const indicator = document.querySelector('[data-clinical-indicator]');
  if (!carousel || !prev || !next) return;

  const pairs = Array.from(carousel.querySelectorAll('.clinical__pair'));
  let index = pairs.findIndex((p) => p.classList.contains('clinical__pair--active'));
  if (index < 0) index = 0;

  // Apply per-photo transition-delay once so the after photo lags the
  // before by 90ms in either direction.
  pairs.forEach((p) => {
    const photos = p.querySelectorAll('.clinical__photo');
    if (photos[1]) photos[1].style.transitionDelay = '90ms';
  });

  function render() {
    pairs.forEach((p, i) => {
      const offset = i < index ? '-100%' : i === index ? '0' : '100%';
      p.classList.toggle('clinical__pair--active', i === index);
      p.querySelectorAll('.clinical__photo').forEach((photo) => {
        photo.style.transform = `translateX(${offset})`;
      });
    });
    if (indicator) indicator.textContent = `${index + 1} / ${pairs.length}`;
    prev.disabled = index === 0;
    next.disabled = index === pairs.length - 1;
  }

  prev.addEventListener('click', () => {
    if (index > 0) { index -= 1; render(); }
  });
  next.addEventListener('click', () => {
    if (index < pairs.length - 1) { index += 1; render(); }
  });

  render();
})();
