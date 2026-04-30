// Counter animation for the clinical stat numbers (93%, +41%, -23%).
// Each stat ticks from 0 to its target with an ease-out cubic when it
// first enters the viewport, then stops being observed. Honors
// prefers-reduced-motion.

(function () {
  const els = document.querySelectorAll('.clinical__stat-number');
  if (!els.length) return;

  const items = [];
  els.forEach((el) => {
    const text = el.textContent.trim();
    // Capture optional sign (+, -, ASCII or unicode minus), digits, optional %.
    const match = text.match(/^([+\-−]?)(\d+)(%?)$/);
    if (!match) return;
    const item = {
      el,
      prefix: match[1] || '',
      target: parseInt(match[2], 10),
      suffix: match[3] || '',
    };
    items.push(item);
    // Reset to 0 so the counter starts visibly empty.
    el.textContent = `${item.prefix}0${item.suffix}`;
  });

  if (!items.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    items.forEach((it) => {
      it.el.textContent = `${it.prefix}${it.target}${it.suffix}`;
    });
    return;
  }

  const DURATION = 1400;
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function tick(item) {
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / DURATION);
      const value = Math.round(easeOutCubic(t) * item.target);
      item.el.textContent = `${item.prefix}${value}${item.suffix}`;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const item = items.find((i) => i.el === entry.target);
        if (item) tick(item);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  items.forEach((it) => observer.observe(it.el));
})();
