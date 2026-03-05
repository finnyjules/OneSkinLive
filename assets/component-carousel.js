/**
 * Generic Carousel Component
 * Works with any carousel that uses data-carousel-track, data-carousel-prev, data-carousel-next
 */
(function () {
  function initCarousel(trackId) {
    var track = document.querySelector('[data-carousel-track="' + trackId + '"]');
    if (!track) return;

    var prevBtn = document.querySelector('[data-carousel-prev="' + trackId + '"]');
    var nextBtn = document.querySelector('[data-carousel-next="' + trackId + '"]');
    var dots = document.querySelectorAll('[data-carousel-dot="' + trackId + '"]');
    var slides = track.children;

    if (slides.length === 0) return;

    var slideWidth = slides[0].offsetWidth + parseInt(getComputedStyle(track).gap || 0);
    var currentIndex = 0;

    function scrollToIndex(index) {
      var maxIndex = Math.max(0, slides.length - Math.floor(track.offsetWidth / slideWidth));
      currentIndex = Math.max(0, Math.min(index, maxIndex));
      track.scrollTo({
        left: currentIndex * slideWidth,
        behavior: 'smooth'
      });
      updateDots();
    }

    function updateDots() {
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === currentIndex);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        scrollToIndex(currentIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        scrollToIndex(currentIndex + 1);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        scrollToIndex(i);
      });
    });

    // Update on scroll
    var scrollTimeout;
    track.addEventListener('scroll', function () {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(function () {
        if (slideWidth > 0) {
          currentIndex = Math.round(track.scrollLeft / slideWidth);
          updateDots();
        }
      }, 100);
    });

    // Recalculate on resize
    window.addEventListener('resize', function () {
      slideWidth = slides[0].offsetWidth + parseInt(getComputedStyle(track).gap || 0);
    });

    updateDots();
  }

  // Auto-init all carousels on page
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-carousel-track]').forEach(function (track) {
      var id = track.getAttribute('data-carousel-track');
      if (id && id !== 'shade-compare') initCarousel(id);
    });
  });

  // Expose for manual init
  window.initCarousel = initCarousel;
})();
