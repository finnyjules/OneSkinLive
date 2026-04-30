// Before/after carousel for the clinical section. All pairs share the
// same grid cell and slide horizontally — the previous pair slides out
// to the left while the next slides in from the right. Within each pair,
// the after photo lags the before photo by a small delay (set in CSS).

(function () {
  const carousel = document.querySelector('[data-clinical-carousel]');
  const prev = document.querySelector('[data-clinical-prev]');
  const next = document.querySelector('[data-clinical-next]');
  const indicator = document.querySelector('[data-clinical-indicator]');
  if (!carousel || !prev || !next) return;

  const pairs = Array.from(carousel.querySelectorAll('.clinical__pair'));
  let index = pairs.findIndex((p) => p.classList.contains('clinical__pair--active'));
  if (index < 0) index = 0;

  function render() {
    pairs.forEach((p, i) => {
      p.classList.remove('clinical__pair--active', 'clinical__pair--prev');
      if (i < index) p.classList.add('clinical__pair--prev');
      else if (i === index) p.classList.add('clinical__pair--active');
      // else: default state (translated to right, off-stage)
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
