// Before/after carousel for the clinical section. One pair shown at a
// time; arrow buttons cycle the active pair. Buttons disable at the ends
// (no wrap-around).

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
      p.classList.toggle('clinical__pair--active', i === index);
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
