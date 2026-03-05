/**
 * Purchase Options Component
 * Handles radio-style selection between subscription/one-time options
 */
(function () {
  document.querySelectorAll('[data-purchase-options]').forEach(function (container) {
    var options = container.querySelectorAll('[data-purchase-option]');

    // Lock the layout height so sticky gallery never jumps when content changes
    var layoutEl = container.closest('.product-hero__layout');
    if (layoutEl) {
      layoutEl.style.minHeight = layoutEl.offsetHeight + 'px';
    }

    options.forEach(function (option) {
      option.addEventListener('click', function () {
        // Deselect all
        options.forEach(function (opt) {
          opt.classList.remove('purchase-option--selected');
          opt.setAttribute('aria-checked', 'false');
          var radio = opt.querySelector('.purchase-option__radio');
          if (radio) radio.classList.remove('purchase-option__radio--checked');
        });

        // Select clicked
        option.classList.add('purchase-option--selected');
        option.setAttribute('aria-checked', 'true');
        var selectedRadio = option.querySelector('.purchase-option__radio');
        if (selectedRadio) selectedRadio.classList.add('purchase-option__radio--checked');

        // Get selected type
        var type = option.getAttribute('data-purchase-option');

        // Update CTA price with counter animation
        var priceEl = option.querySelector('.purchase-option__price');
        if (priceEl) {
          var targetPrice = parseInt(priceEl.textContent.replace(/[^0-9]/g, ''), 10);
          var ctaPrice = container.querySelector('.product-hero__add-to-cart .price-current');
          if (ctaPrice) {
            var currentPrice = parseInt(ctaPrice.textContent.replace(/[^0-9]/g, ''), 10);
            if (currentPrice !== targetPrice) {
              // Cancel any running animation
              if (container._priceAnim) clearInterval(container._priceAnim);
              var from = currentPrice;
              var to = targetPrice;
              var steps = 15;
              var stepDuration = 30;
              var step = 0;
              container._priceAnim = setInterval(function () {
                step++;
                // ease-out cubic
                var progress = step / steps;
                var eased = 1 - Math.pow(1 - progress, 3);
                var value = Math.round(from + (to - from) * eased);
                ctaPrice.textContent = '$' + value;
                if (step >= steps) {
                  clearInterval(container._priceAnim);
                  container._priceAnim = null;
                  ctaPrice.textContent = '$' + to;
                }
              }, stepDuration);
            }
          }
        }

        // Show/hide reasons list on selected option only
        options.forEach(function (opt) {
          var reasons = opt.querySelector('.purchase-option__reasons');
          if (reasons) {
            if (opt === option) {
              reasons.classList.add('purchase-option__reasons--visible');
            } else {
              reasons.classList.remove('purchase-option__reasons--visible');
            }
          }
        });

        // Hide strikethrough price for one-time purchase
        var strikePrice = container.querySelector('.product-hero__add-to-cart .price-strikethrough');
        if (strikePrice) {
          strikePrice.style.display = type === 'one-time' ? 'none' : '';
        }

        // Dispatch custom event for other components to listen to
        container.dispatchEvent(new CustomEvent('purchase-option-changed', {
          detail: { type: type },
          bubbles: true
        }));
      });

      // Keyboard support
      option.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          option.click();
        }
      });
    });
  });
})();
