/**
 * Accordion Component
 * Handles expand/collapse of accordion items
 */
(function () {
  document.querySelectorAll('[data-accordion]').forEach(function (accordion) {
    var triggers = accordion.querySelectorAll('[data-accordion-trigger]');

    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var item = trigger.closest('.accordion-item');
        var isOpen = item.classList.contains('accordion-item--open');
        var content = item.querySelector('[data-accordion-content]');

        // Close all other items in same accordion
        accordion.querySelectorAll('.accordion-item--open').forEach(function (openItem) {
          if (openItem !== item) {
            openItem.classList.remove('accordion-item--open');
            openItem.querySelector('[data-accordion-trigger]').setAttribute('aria-expanded', 'false');
            var openContent = openItem.querySelector('[data-accordion-content]');
            openContent.style.maxHeight = '0';
          }
        });

        // Toggle current item
        if (isOpen) {
          item.classList.remove('accordion-item--open');
          trigger.setAttribute('aria-expanded', 'false');
          content.style.maxHeight = '0';
        } else {
          item.classList.add('accordion-item--open');
          trigger.setAttribute('aria-expanded', 'true');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    });
  });
})();
