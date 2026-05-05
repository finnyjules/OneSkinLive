// Sticky quickbuy bar wiring for body PDP.
// Shows the bar once the main ADD TO CART button has scrolled out of view,
// hides it when it returns. Two-way syncs the dropdown selection with the
// purchase-widget radios so the user's choice carries between them.

(function () {
  const bar = document.querySelector('[data-sticky-bar]');
  const trigger = document.querySelector('.purchase-widget__cta');
  if (!bar || !trigger) return;

  // ---- Show/hide on scroll (IntersectionObserver) ----
  // Only show the bar when the CTA has scrolled ABOVE the viewport top —
  // we don't want to show it on initial load while the CTA is still below
  // the fold (not yet visible).
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const scrolledPast =
          !entry.isIntersecting && entry.boundingClientRect.top < 0;
        if (scrolledPast) {
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
  // Two-tier price fallback (used by body / face / lipmask): one sub price
  // for monthly+bimonthly, one onetime price.
  const priceSub = bar.dataset.priceSub || '90';
  const priceOnetime = bar.dataset.priceOnetime || '105';
  // Default labels when an option button has no text (legacy fallback).
  const TYPE_LABEL = {
    monthly: 'Monthly delivery',
    bimonthly: '2-month delivery',
    onetime: 'One-time purchase',
  };

  function setCtaPrice(type) {
    if (!cta) return;
    // If the option button declares its own price, use that directly. Lets
    // pages with three tiers (e.g. hair: 1/3/6-month supply) drive the CTA
    // without sticking to the sub/onetime two-tier model.
    const optionButton = bar.querySelector(`[data-sticky-option="${type}"]`);
    const optionPrice = optionButton?.getAttribute('data-option-price');
    const optionStrike = optionButton?.getAttribute('data-option-strike');
    if (optionPrice) {
      if (optionStrike) {
        cta.innerHTML = `ADD TO CART&nbsp;&nbsp;&nbsp;&nbsp;<s>$${optionStrike}</s>&nbsp;&nbsp;<strong>$${optionPrice}</strong>`;
      } else {
        cta.innerHTML = `ADD TO CART&nbsp;&nbsp;&nbsp;&nbsp;<strong>$${optionPrice}</strong>`;
      }
      return;
    }
    // Two-tier fallback.
    if (type === 'onetime') {
      cta.innerHTML = `ADD TO CART&nbsp;&nbsp;&nbsp;&nbsp;<strong>$${priceOnetime}</strong>`;
    } else {
      cta.innerHTML = `ADD TO CART&nbsp;&nbsp;&nbsp;&nbsp;<s>$${priceOnetime}</s>&nbsp;&nbsp;<strong>$${priceSub}</strong>`;
    }
  }

  function setActiveOption(type) {
    options.forEach((o) => {
      o.classList.toggle(
        'sticky-bar__dropdown-option--active',
        o.getAttribute('data-sticky-option') === type
      );
    });
    if (label) {
      // Prefer the active dropdown option's actual text — lets each page
      // declare its own labels in HTML (e.g. "1-month supply") without
      // touching this script.
      const activeBtn = bar.querySelector(`[data-sticky-option="${type}"]`);
      label.textContent = activeBtn?.textContent.trim() || TYPE_LABEL[type] || type;
    }
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
