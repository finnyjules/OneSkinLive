// Module 02 — 12-week horizontal protocol timeline.
// Two responsibilities:
//   1. Wire the "Upload photo" action on the current-week cell to a hidden
//      file input. On selection, fill the inner photo slot with the chosen
//      image and surface a confirmation toast.
//   2. Size and animate the horizontal rail: position it from the first to
//      the last dot, then fill it to the current week when the section
//      scrolls into view.

(function () {
  const cells = document.querySelectorAll('[data-journey-cell]');
  if (!cells.length) return;

  const cellList = Array.from(cells);
  const rail = document.querySelector('[data-journey-rail]');
  const railFill = document.querySelector('[data-journey-rail-fill]');

  // --- Toast ---------------------------------------------------------------
  function showToast(message) {
    let toast = document.querySelector('.copy-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'copy-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toast.__timer);
    toast.__timer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }

  // --- Upload behavior -----------------------------------------------------
  // The current cell's slot IS the upload button. On successful upload,
  // set the slot's background to the chosen photo and add the --filled
  // class — CSS handles hiding the description copy and the upload CTA
  // inside the slot. No need to manage individual element visibility.
  document.querySelectorAll('[data-journey-upload]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const cell = btn.closest('[data-journey-cell]');
      const week = cell?.dataset.journeyCell || 'this week';

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';
      input.addEventListener('change', () => {
        const file = input.files?.[0];
        if (!file || !cell) return;
        const url = URL.createObjectURL(file);
        btn.style.backgroundImage = `url(${url})`;
        btn.classList.add('journey__cell-slot--filled');
        cell.classList.add('journey__cell--filled');
        showToast(`Photo uploaded for week ${week}`);
      });
      document.body.appendChild(input);
      input.click();
      setTimeout(() => input.remove(), 0);
    });
  });

  // --- Rail layout + progress fill ----------------------------------------
  // The dot center sits ~5px inside each cell's left edge (the dot is 10px
  // wide and rendered at the start of its marker row). Position the rail
  // between the first and last dot; then animate the fill on view.
  if (rail && railFill && cellList.length >= 2) {
    const DOT_CENTER_OFFSET = 5;
    const first = cellList[0];
    const last = cellList[cellList.length - 1];

    function layoutRail() {
      const firstX = first.offsetLeft + DOT_CENTER_OFFSET;
      const lastX = last.offsetLeft + DOT_CENTER_OFFSET;
      rail.style.left = `${firstX}px`;
      rail.style.width = `${Math.max(0, lastX - firstX)}px`;
    }

    function targetProgress() {
      const currentCell = document.querySelector('.journey__cell--current');
      const lastIdx = cellList.length - 1;
      if (!currentCell || lastIdx <= 0) return 0;
      const currentIdx = cellList.indexOf(currentCell);
      return currentIdx / lastIdx;
    }

    function revealFill() {
      railFill.style.transform = `scaleX(${targetProgress().toFixed(4)})`;
    }

    layoutRail();
    window.addEventListener('resize', layoutRail);

    const target = document.querySelector('.journey');
    if ('IntersectionObserver' in window && target) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Defer a frame so the rail layout settles before transitioning.
            requestAnimationFrame(revealFill);
            io.disconnect();
          }
        });
      }, { threshold: 0.15 });
      io.observe(target);
    } else {
      revealFill();
    }
  }
})();
