/**
 * Shade Selector Component
 * Updates selected shade, variant, and product image
 */
(function () {
  document.querySelectorAll('[data-shade-selector]').forEach(function (selector) {
    var swatches = selector.querySelectorAll('.shade-swatch');
    var nameDisplay = selector.querySelector('[data-shade-name-display]');

    swatches.forEach(function (swatch) {
      swatch.addEventListener('click', function () {
        // Deselect all
        swatches.forEach(function (s) {
          s.classList.remove('shade-swatch--selected');
        });

        // Select clicked
        swatch.classList.add('shade-swatch--selected');

        // Update shade name display
        var shadeName = swatch.getAttribute('data-shade-name');
        if (nameDisplay && shadeName) {
          nameDisplay.textContent = shadeName;
        }

        // Update variant if Shopify variant ID is present
        var variantId = swatch.getAttribute('data-variant-id');
        if (variantId) {
          // Update URL without reload
          var url = new URL(window.location);
          url.searchParams.set('variant', variantId);
          window.history.replaceState({}, '', url);

          // Dispatch custom event
          selector.dispatchEvent(new CustomEvent('variant-changed', {
            detail: { variantId: variantId, shadeName: shadeName },
            bubbles: true
          }));
        }
      });
    });
  });
})();
