// Sticky quickbuy bar wiring for body PDP.
// Shows the bar once the main ADD TO CART button has scrolled out of view,
// hides it when it returns. Two-way syncs the dropdown selection with the
// purchase-widget radios so the user's choice carries between them.

(function () {
  const bar = document.querySelector('[data-sticky-bar]');
  const trigger = document.querySelector('.purchase-widget__cta');
  if (!bar || !trigger) return;

  // ---- Show/hide on scroll (IntersectionObserver) ----
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          bar.classList.add('sticky-bar--visible');
        } else {
          bar.classList.remove('sticky-bar--visible');
        }
      });
    },
    { rootMargin: '-60px 0px 0px 0px' }
  );
  observer.observe(trigger);

  // ---- Dropdown toggle ----
  const dropdown = bar.querySelector('[data-sticky-dropdown]');
  const label = bar.querySelector('[data-sticky-dropdown-label]');
  const options = bar.querySelectorAll('[data-sticky-option]');
  const cta = bar.querySelector('.sticky-bar__cta');

  if (dropdown) {
    dropdown.addEventListener('click', (e) => {
      if (e.target.closest('[data-sticky-option]')) return;
      dropdown.classList.toggle('sticky-bar__frequency--open');
    });
  }

  document.addEventListener('click', (e) => {
    if (dropdown && !dropdown.contains(e.target)) {
      dropdown.classList.remove('sticky-bar__frequency--open');
    }
  });

  // ---- Label + price helpers ----
  const TYPE_LABEL = {
    monthly: 'Monthly delivery',
    bimonthly: '2-month delivery',
    onetime: 'One-time purchase',
  };

  function setCtaPrice(type) {
    if (!cta) return;
    if (type === 'onetime') {
      cta.innerHTML = 'ADD TO CART&nbsp;&nbsp;&nbsp;&nbsp;<strong>$105</strong>';
    } else {
      cta.innerHTML = 'ADD TO CART&nbsp;&nbsp;&nbsp;&nbsp;<s>$105</s>&nbsp;&nbsp;<strong>$90</strong>';
    }
  }

  function setActiveOption(type) {
    options.forEach((o) => {
      o.classList.toggle(
        'sticky-bar__dropdown-option--active',
        o.getAttribute('data-sticky-option') === type
      );
    });
    if (label) label.textContent = TYPE_LABEL[type] || type;
    setCtaPrice(type);
  }

  // ---- Sticky bar → main radios ----
  let syncing = false;
  options.forEach((opt) => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const type = opt.getAttribute('data-sticky-option');
      setActiveOption(type);
      dropdown?.classList.remove('sticky-bar__frequency--open');

      // Drive the corresponding radio in the purchase widget.
      syncing = true;
      const radio = document.querySelector(
        `input[name="subscription"][value="${type}"]`
      );
      if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
      }
      setTimeout(() => { syncing = false; }, 0);
    });
  });

  // ---- Main radios → sticky bar ----
  document
    .querySelectorAll('input[name="subscription"]')
    .forEach((radio) => {
      radio.addEventListener('change', () => {
        if (syncing || !radio.checked) return;
        setActiveOption(radio.value);
      });
    });

  // ---- Init from currently-checked radio ----
  const initial =
    document.querySelector('input[name="subscription"]:checked')?.value ||
    'bimonthly';
  setActiveOption(initial);
})();
