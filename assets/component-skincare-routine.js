(function () {
  'use strict';

  var section = document.querySelector('[data-section-id="skincare-routine"]');
  if (!section) return;

  var steps = section.querySelectorAll('.skincare-routine__step');
  var bgs   = section.querySelectorAll('.skincare-routine__bg');
  if (!steps.length || !bgs.length) return;

  // --- Card click: switch active step + background ---
  steps.forEach(function (step) {
    step.addEventListener('click', function () {
      var idx = step.getAttribute('data-step');

      steps.forEach(function (s) {
        s.classList.remove('skincare-routine__step--active');
      });

      bgs.forEach(function (bg) {
        bg.classList.remove('skincare-routine__bg--active');
        var vid = bg.querySelector('video');
        if (vid) vid.pause();
      });

      step.classList.add('skincare-routine__step--active');

      var targetBg = section.querySelector('.skincare-routine__bg[data-step="' + idx + '"]');
      if (targetBg) {
        targetBg.classList.add('skincare-routine__bg--active');
        var vid = targetBg.querySelector('video');
        if (vid) vid.play();
      }
    });
  });
})();
