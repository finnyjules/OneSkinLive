// Module 02 — 12-week journey grid.
// Wires the "Upload photo" action on the current-week cell to a hidden file
// input. On selection, fill the cell with the chosen image as a preview and
// surface a confirmation toast.

(function () {
  const cells = document.querySelectorAll('[data-journey-cell]');
  if (!cells.length) return;

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
        cell.style.backgroundImage = `url(${url})`;
        cell.classList.add('journey__cell--filled');
        // Hide the upload control once a photo lives in the cell.
        btn.style.display = 'none';
        showToast(`Photo uploaded for week ${week}`);
      });
      document.body.appendChild(input);
      input.click();
      // Clean up after the picker closes (works whether or not a file is chosen).
      setTimeout(() => input.remove(), 0);
    });
  });
})();
