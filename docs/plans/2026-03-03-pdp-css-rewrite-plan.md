# PDP Full CSS Rewrite + Lenis Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite all CSS from scratch for the OneSkin product detail page to match the Figma design, and add Lenis smooth scrolling.

**Architecture:** Shopify Liquid theme with external CSS files per section, vanilla JS components, and Lenis for page-level smooth scrolling. Each section's inline `<style>` block gets extracted to a standalone `.css` file loaded via `stylesheet_tag`.

**Tech Stack:** Shopify Liquid, vanilla CSS with custom properties, vanilla JS, Lenis (CDN)

**Figma Reference:** https://www.figma.com/design/ANSGe81Nx8Q6phAC9BQjyZ/Oneskin-%E2%80%A2-Website-2026?node-id=1391-2505&m=dev

---

## Task 1: Add Lenis Smooth Scrolling

**Files:**
- Modify: `layout/theme.liquid`
- Create: `assets/lenis-init.js`

**Step 1: Create lenis-init.js**

Create `assets/lenis-init.js`:

```js
(function () {
  var lenis = new Lenis({
    duration: 1.2,
    easing: function (t) {
      return Math.min(1, 1.001 - Math.pow(2, -10 * t));
    },
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    touchMultiplier: 2,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  window.__lenis = lenis;
})();
```

**Step 2: Update theme.liquid**

In `layout/theme.liquid`, add before `</head>`:

```html
<link rel="stylesheet" href="https://unpkg.com/lenis@1.1.18/dist/lenis.css">
```

Add before `</body>`:

```html
<script src="https://unpkg.com/lenis@1.1.18/dist/lenis.min.js"></script>
{{ 'lenis-init.js' | asset_url | script_tag }}
```

**Step 3: Verify**

Open a product page in the browser. Page scroll should be smooth and fluid. Horizontal carousels should still scroll natively.

---

## Task 2: Rewrite base.css

**Files:**
- Modify: `assets/base.css`

**Step 1: Rewrite base.css**

Keep font-face declarations (lines 6-44) and design tokens (lines 47-85) exactly as they are. Rewrite everything after line 85:

Replace lines 87 onwards with:

```css
/* --- Reset --- */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html.lenis,
html.lenis body {
  height: auto;
}

.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}

.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}

html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-sans);
  font-weight: 400;
  color: var(--color-text);
  background: var(--color-bg);
  line-height: 1.5;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: none;
  padding: 0;
}

ul, ol {
  list-style: none;
}

/* --- Layout --- */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--container-padding);
}

.content-width {
  max-width: var(--content-max);
  margin: 0 auto;
}

/* --- Section Spacing --- */
main > section,
main > .shopify-section {
  margin-bottom: var(--section-gap);
}

/* --- Typography --- */
.font-sans { font-family: var(--font-sans); }
.font-serif { font-family: var(--font-serif); }
.text-light { font-weight: 300; }
.text-regular { font-weight: 400; }
.text-medium { font-weight: 500; }
.text-bold { font-weight: 700; }

.section-title {
  font-family: var(--font-sans);
  font-size: 24px;
  font-weight: 500;
}

.link-arrow {
  font-size: 12px;
  font-weight: 500;
  text-decoration: underline;
}

/* --- Buttons --- */
.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-text);
  color: var(--color-bg);
  border-radius: var(--radius-sm);
  padding: 12px 8px;
  font-family: var(--font-sans);
  font-size: 20px;
  font-weight: 400;
  width: 100%;
  height: 48px;
  transition: opacity 0.2s;
}

.btn-primary:hover {
  opacity: 0.85;
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0.5px solid var(--color-text);
  border-radius: var(--radius-sm);
  padding: 12px 8px;
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 400;
  text-transform: uppercase;
  transition: background 0.2s, color 0.2s;
}

.btn-outline:hover {
  background: var(--color-text);
  color: var(--color-bg);
}

/* --- Shared Components --- */
.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  background: var(--color-surface-light);
  font-size: 12px;
  font-weight: 500;
}

.price-strikethrough {
  text-decoration: line-through;
  color: var(--color-muted-light);
}

/* --- Carousel Controls --- */
.carousel-nav-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}

.carousel-nav-btn:hover {
  background: var(--color-surface-light);
}

.carousel-nav-btn svg {
  width: 14px;
  height: 14px;
}

.carousel-dots {
  display: flex;
  gap: 4px;
  justify-content: center;
  margin-top: 16px;
}

.carousel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #cacaca;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: background 0.2s;
}

.carousel-dot.active,
.carousel-dot.is-active {
  background: var(--color-text);
}

/* --- Star Rating --- */
.star-rating {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.star-rating svg {
  fill: var(--color-text);
}
```

**Step 2: Verify**

Page should load without broken layout. Design tokens should still apply. Lenis classes should be recognized.

---

## Task 3: Rewrite section-product-hero.css

**Files:**
- Modify: `assets/section-product-hero.css`

**Step 1: Rewrite the entire file**

Replace `assets/section-product-hero.css` with complete new CSS matching the Figma. Key specs from Figma:

- Layout: CSS Grid, `613px 1fr`, 80px gap
- Gallery: sticky at top 80px, 2-col sub-grid, 5px gap
- Main image: 613x613 square
- Thumbnails: 304x304 square
- Quote cards: `--color-surface-green` bg, 161px min-height, serif italic
- Info padding-top: 50px
- Title: 32px/500
- Rating: 32px right-aligned
- Stars: 18px, row
- Short desc: 16px/400
- Review count: 16px right-aligned
- Pills: 12px/500, `--color-surface-light`, gap 13px
- Shade selector: 40px swatches, 16px gap, label 16px/400
- Size text: 12px/500
- Shade guide link: 12px/500 underline
- Bullets: 14px/400, 0.56px tracking, 21px line-height, disc
- Purchase card: green gradient bg, 8px radius
  - Options: 8px gap, white bg + 0.5px border (default), primary bg + 2px border (selected)
  - Selected title: 700 weight, recommended badge 10px white pill
  - Reasons list: 12px/400, disc, 0.48px tracking
  - Price: 14px/700 right-aligned
  - Save: 14px/500
  - Gift: 14px/700 headline, 63px image, name 14px/500, size 12px
  - CTA: black bg, 48px height, 20px text, full width, strikethrough + bold price
  - Free shipping: 14px/500 center below CTA
- Certifications: flex row, 24px gap, icons 40px height 80% opacity, text 12px/500
- Accordion: title 20px/500, line separator flex-1 opacity 0.2, + icon 32px/300, expand animation max-height

Write the complete CSS:

```css
/* Product Hero */
.product-hero {
  padding: 40px var(--container-padding) 0;
  max-width: var(--container-max);
  margin: 0 auto;
}

.product-hero__layout {
  display: grid;
  grid-template-columns: 613px 1fr;
  gap: 80px;
  align-items: start;
}

/* Gallery */
.product-hero__gallery {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
  position: sticky;
  top: 80px;
}

.product-hero__image-main {
  grid-column: 1 / -1;
  border-radius: var(--radius-sm);
  overflow: hidden;
  aspect-ratio: 1;
}

.product-hero__image-main img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-hero__image-thumb {
  border-radius: var(--radius-sm);
  overflow: hidden;
  aspect-ratio: 1;
}

.product-hero__image-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-hero__quote-card {
  border-radius: var(--radius-sm);
  background: var(--color-surface-green);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  min-height: 161px;
}

.product-hero__quote-text {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 24px;
  color: var(--color-text);
  margin-bottom: 8px;
  line-height: 1.3;
}

.product-hero__quote-author {
  font-size: 14px;
  color: var(--color-text);
}

/* Product Info */
.product-hero__info {
  padding-top: 50px;
}

.product-hero__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.product-hero__title {
  font-size: 32px;
  font-weight: 500;
  line-height: 1.2;
}

.product-hero__rating-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
}

.product-hero__rating-number {
  font-size: 32px;
  font-weight: 500;
}

.product-hero__rating-stars-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.product-hero__subtitle {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 24px;
}

.product-hero__description-short {
  font-size: 16px;
  font-weight: 400;
}

.product-hero__review-count {
  font-size: 16px;
  font-weight: 400;
  flex-shrink: 0;
}

/* Pills */
.product-hero__pills {
  display: flex;
  gap: 13px;
  margin-bottom: 24px;
}

.product-hero__pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  background: var(--color-surface-light);
  font-size: 12px;
  font-weight: 500;
}

/* Shade Selector */
.product-hero__shade-selector {
  margin-bottom: 8px;
}

.product-hero__shade-row {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 8px;
}

.product-hero__shade-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.product-hero__shade-label {
  font-size: 16px;
  font-weight: 400;
}

.product-hero__shade-size {
  font-size: 12px;
  font-weight: 500;
}

.product-hero__shade-swatches {
  display: flex;
  gap: 0;
  align-items: center;
}

.shade-swatch {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid transparent;
  overflow: hidden;
  cursor: pointer;
  padding: 0;
  background: var(--color-primary);
  display: flex;
  align-items: start;
  flex-shrink: 0;
  transition: border-color 0.2s;
}

.shade-swatch--selected {
  border-color: var(--color-text);
}

.shade-swatch__color {
  display: block;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.product-hero__shade-guide {
  font-size: 12px;
  font-weight: 500;
  text-decoration: underline;
  display: inline-block;
  margin-bottom: 16px;
}

/* Bullets */
.product-hero__bullets {
  list-style: disc;
  padding-left: 21px;
  margin-bottom: 32px;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.56px;
  line-height: 21px;
}

.product-hero__bullets li {
  list-style: disc;
}

/* Purchase Options */
.product-hero__purchase {
  background: linear-gradient(
    to bottom,
    var(--color-green-overlay-start) 49%,
    var(--color-green-overlay-end)
  );
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: 24px;
}

.product-hero__purchase-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px 20px 0;
}

.purchase-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  border: 0.5px solid var(--color-text);
  cursor: pointer;
  transition: all 0.2s;
  gap: 4px;
}

.purchase-option--selected {
  background: var(--color-primary);
  border: 2px solid var(--color-text);
}

.purchase-option__left {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.purchase-option__title-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.purchase-option__title {
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
}

.purchase-option--selected .purchase-option__title {
  font-weight: 700;
}

.purchase-option__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  background: var(--color-bg);
  font-size: 10px;
  font-weight: 500;
}

.purchase-option__reasons {
  list-style: disc;
  padding-left: 18px;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.48px;
  line-height: 1.2;
}

.purchase-option__reasons li {
  list-style: disc;
}

.purchase-option__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  align-self: stretch;
  text-align: center;
}

.purchase-option__price {
  font-size: 14px;
  font-weight: 700;
}

.purchase-option__save {
  font-size: 14px;
  font-weight: 500;
}

.purchase-option__save strong {
  font-weight: 700;
}

/* Gift */
.product-hero__gift {
  padding: 0 20px 12px;
}

.product-hero__gift-headline {
  font-size: 14px;
  font-weight: 700;
  line-height: 21px;
  letter-spacing: 0.28px;
  margin-bottom: 8px;
}

.product-hero__gift-item {
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: var(--radius-sm);
  height: 60px;
}

.product-hero__gift-image {
  width: 63px;
  height: 63px;
  flex-shrink: 0;
}

.product-hero__gift-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-hero__gift-details {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-hero__gift-name {
  font-size: 14px;
  font-weight: 500;
}

.product-hero__gift-size {
  font-size: 12px;
  font-weight: 400;
}

.product-hero__gift-pricing {
  display: flex;
  gap: 5px;
  align-items: center;
  font-size: 14px;
}

/* CTA */
.product-hero__cta-area {
  padding: 9px 16px 18px;
}

.product-hero__add-to-cart {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-text);
  color: var(--color-bg);
  border: none;
  border-radius: var(--radius-sm);
  padding: 12px 8px;
  width: 100%;
  height: 48px;
  font-family: var(--font-sans);
  font-size: 20px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.product-hero__add-to-cart:hover {
  opacity: 0.85;
}

.product-hero__add-to-cart .price-strikethrough {
  color: var(--color-muted-light);
  text-decoration: line-through;
  font-weight: 400;
}

.product-hero__add-to-cart .price-current {
  font-weight: 700;
}

.product-hero__free-shipping {
  font-size: 14px;
  font-weight: 500;
  line-height: 21px;
  letter-spacing: 0.28px;
  text-align: center;
  margin-top: 10px;
}

/* Certifications */
.product-hero__certifications {
  display: flex;
  gap: 24px;
  align-items: center;
  padding: 16px 12px;
  margin-bottom: 16px;
}

.product-hero__cert {
  display: flex;
  gap: 12px;
  align-items: center;
}

.product-hero__cert-icon {
  height: 40px;
  opacity: 0.8;
  flex-shrink: 0;
}

.product-hero__cert-icon img {
  height: 100%;
  width: auto;
}

.product-hero__cert-text {
  font-size: 12px;
  font-weight: 500;
  line-height: 1.3;
}

/* Accordion */
.product-hero__accordion {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.accordion-item__header {
  display: flex;
  gap: 16px;
  align-items: center;
  width: 100%;
  padding: 8px 0;
  cursor: pointer;
  background: none;
  border: none;
  font-family: var(--font-sans);
  text-align: left;
}

.accordion-item__title {
  font-size: 20px;
  font-weight: 500;
  flex-shrink: 0;
}

.accordion-item__line {
  flex: 1;
  height: 1px;
  background: var(--color-text);
  opacity: 0.2;
}

.accordion-item__icon {
  font-size: 32px;
  font-weight: 300;
  line-height: 1;
  width: 12px;
  text-align: center;
  transition: transform 0.3s;
  flex-shrink: 0;
}

.accordion-item--open .accordion-item__icon {
  transform: rotate(45deg);
}

.accordion-item__content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.accordion-item--open .accordion-item__content {
  max-height: 500px;
}

.accordion-item__body {
  padding: 8px 0 16px;
  font-size: 14px;
  line-height: 1.6;
}

.accordion-item__separator {
  height: 1px;
  background: var(--color-text);
  opacity: 0.1;
}

/* Responsive */
@media (max-width: 1200px) {
  .product-hero__layout {
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }
}

@media (max-width: 768px) {
  .product-hero {
    padding: 20px 20px 0;
  }

  .product-hero__layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .product-hero__gallery {
    position: static;
  }

  .product-hero__header {
    flex-direction: column;
    gap: 8px;
  }

  .product-hero__rating-summary {
    align-items: flex-start;
    flex-direction: row;
    gap: 12px;
  }

  .product-hero__subtitle {
    flex-direction: column;
    gap: 4px;
  }

  .product-hero__certifications {
    flex-wrap: wrap;
  }
}
```

**Step 2: Verify**

Product hero should show 2-column layout with sticky gallery, purchase options card with green gradient, accordion sections.

---

## Task 4: Extract Header CSS

**Files:**
- Create: `assets/section-header.css`
- Modify: `sections/header.liquid`

**Step 1: Create section-header.css**

Create `assets/section-header.css` with the header styles. Use the same CSS from the current inline `<style>` block — it already matches the Figma:

```css
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(to bottom, rgba(255,255,255,1), rgba(255,255,255,0.8));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  height: 60px;
  padding: 0 var(--container-padding);
}

.header__inner {
  max-width: var(--container-max);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  position: relative;
}

.header__nav {
  display: flex;
  gap: 48px;
  align-items: center;
}

.header__nav-link {
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 400;
  color: var(--color-text);
  text-decoration: none;
  transition: opacity 0.2s;
}

.header__nav-link:hover {
  opacity: 0.6;
}

.header__logo {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 50%;
  margin-top: -7.5px;
}

.header__logo img,
.header__logo svg {
  width: 120px;
  height: 15px;
  display: block;
}

.header__actions {
  display: flex;
  gap: 48px;
  align-items: center;
}

.header__account {
  font-size: 16px;
  font-weight: 400;
}

.header__cart {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
}

.header__cart-count {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-primary);
  font-size: 12px;
  font-weight: 400;
}

@media (max-width: 768px) {
  .header__nav {
    display: none;
  }
  .header__actions {
    gap: 24px;
  }
}
```

**Step 2: Update header.liquid**

Remove the entire `<style>...</style>` block (lines 6-101) and replace it with:

```liquid
{{ 'section-header.css' | asset_url | stylesheet_tag }}
```

**Step 3: Verify**

Header should remain sticky with blur effect, logo centered, nav links left, cart right.

---

## Task 5: Extract Cross-Sell CSS

**Files:**
- Create: `assets/section-cross-sell.css`
- Modify: `sections/cross-sell.liquid`

**Step 1: Create section-cross-sell.css**

Create `assets/section-cross-sell.css` with the cross-sell styles from the inline block. CSS matches Figma already.

**Step 2: Update cross-sell.liquid**

Remove `<style>...</style>` block (lines 1-197). Add at top of file:

```liquid
{{ 'section-cross-sell.css' | asset_url | stylesheet_tag }}
```

Add `data-lenis-prevent` to the track div at line ~209:

```html
<div class="cross-sell__track" data-carousel-track="cross-sell" data-lenis-prevent>
```

**Step 3: Verify**

Cross-sell carousel should scroll horizontally. Lenis should not interfere.

---

## Task 6: Extract Shade Compare CSS

**Files:**
- Create: `assets/section-shade-compare.css`
- Modify: `sections/shade-compare.liquid`

**Step 1: Create section-shade-compare.css**

Extract the inline CSS from `shade-compare.liquid` (lines 1-207) into a new file.

**Step 2: Update shade-compare.liquid**

Remove `<style>` block. Add stylesheet_tag at top. Add `data-lenis-prevent` to track:

```html
<div class="shade-compare__track" data-carousel-track="shade-compare" data-lenis-prevent>
```

---

## Task 7: Extract Science Placeholder CSS

**Files:**
- Create: `assets/section-science-placeholder.css`
- Modify: `sections/science-placeholder.liquid`

**Step 1: Create section-science-placeholder.css**

Extract inline CSS from `science-placeholder.liquid` (lines 1-57).

**Step 2: Update science-placeholder.liquid**

Remove `<style>` block. Add stylesheet_tag at top.

---

## Task 8: Extract Key Ingredients CSS

**Files:**
- Create: `assets/section-key-ingredients.css`
- Modify: `sections/key-ingredients.liquid`

**Step 1: Create section-key-ingredients.css**

Extract inline CSS from `key-ingredients.liquid` (lines 6-114).

**Step 2: Update key-ingredients.liquid**

Remove `<style>` block. Add stylesheet_tag at top.

---

## Task 9: Extract Clinical Results CSS

**Files:**
- Create: `assets/section-clinical-results.css`
- Modify: `sections/clinical-results.liquid`

**Step 1: Create section-clinical-results.css**

Extract inline CSS from `clinical-results.liquid` (lines 1-201).

**Step 2: Update clinical-results.liquid**

Remove `<style>` block. Add stylesheet_tag at top. Add `data-lenis-prevent` to track:

```html
<div class="clinical-results__track" data-carousel-track="clinical-results" data-lenis-prevent>
```

---

## Task 10: Extract Skincare Routine CSS

**Files:**
- Create: `assets/section-skincare-routine.css`
- Modify: `sections/skincare-routine.liquid`

**Step 1: Create section-skincare-routine.css**

Extract inline CSS from `skincare-routine.liquid` (lines 6-133).

**Step 2: Update skincare-routine.liquid**

Remove `<style>` block. Add stylesheet_tag at top.

---

## Task 11: Extract FAQ Questions CSS

**Files:**
- Create: `assets/section-faq-questions.css`
- Modify: `sections/faq-questions.liquid`

**Step 1: Create section-faq-questions.css**

Extract inline CSS from `faq-questions.liquid` (lines 1-115).

**Step 2: Update faq-questions.liquid**

Remove `<style>` block. Add stylesheet_tag at top.

---

## Task 12: Extract Reviews CSS

**Files:**
- Create: `assets/section-reviews.css`
- Modify: `sections/reviews.liquid`

**Step 1: Create section-reviews.css**

Extract inline CSS from `reviews.liquid` (lines 6-163).

**Step 2: Update reviews.liquid**

Remove `<style>` block. Add stylesheet_tag at top. Add `data-lenis-prevent` to track:

```html
<div class="reviews-section__track" data-carousel-track="reviews" data-lenis-prevent>
```

---

## Task 13: Extract Lifestyle Hero CSS

**Files:**
- Create: `assets/section-lifestyle-hero.css`
- Modify: `sections/lifestyle-hero.liquid`

**Step 1: Create section-lifestyle-hero.css**

Extract inline CSS from `lifestyle-hero.liquid` (lines 1-36).

**Step 2: Update lifestyle-hero.liquid**

Remove `<style>` block. Add stylesheet_tag at top.

---

## Task 14: Extract Product Gallery CSS

**Files:**
- Create: `assets/section-product-gallery.css`
- Modify: `sections/product-gallery.liquid`

**Step 1: Create section-product-gallery.css**

Extract inline CSS from `product-gallery.liquid` (lines 6-66).

**Step 2: Update product-gallery.liquid**

Remove `<style>` block. Add stylesheet_tag at top.

---

## Task 15: Clean up theme.liquid conditional CSS loading

**Files:**
- Modify: `layout/theme.liquid`

**Step 1: Remove conditional product hero CSS from head**

In `layout/theme.liquid`, remove lines 16-18 (the conditional `section-product-hero.css` load):

```liquid
{%- if template.name == 'product' -%}
  {{ 'section-product-hero.css' | asset_url | stylesheet_tag }}
{%- endif -%}
```

This is no longer needed because `product-hero.liquid` already loads its own CSS via `stylesheet_tag` at the top of the section (line 6 of the original file).

**Step 2: Verify**

Load the product page. All sections should render correctly with their styles. No duplicate CSS loading.

---

## Summary of Files

**Created (new):**
- `assets/lenis-init.js`
- `assets/section-header.css`
- `assets/section-cross-sell.css`
- `assets/section-shade-compare.css`
- `assets/section-science-placeholder.css`
- `assets/section-key-ingredients.css`
- `assets/section-clinical-results.css`
- `assets/section-skincare-routine.css`
- `assets/section-faq-questions.css`
- `assets/section-reviews.css`
- `assets/section-lifestyle-hero.css`
- `assets/section-product-gallery.css`

**Modified:**
- `layout/theme.liquid` (Lenis CDN + cleanup)
- `assets/base.css` (rewritten from line 87 onwards)
- `assets/section-product-hero.css` (full rewrite)
- `sections/header.liquid` (extract styles)
- `sections/cross-sell.liquid` (extract styles + data-lenis-prevent)
- `sections/shade-compare.liquid` (extract styles + data-lenis-prevent)
- `sections/science-placeholder.liquid` (extract styles)
- `sections/key-ingredients.liquid` (extract styles)
- `sections/clinical-results.liquid` (extract styles + data-lenis-prevent)
- `sections/skincare-routine.liquid` (extract styles)
- `sections/faq-questions.liquid` (extract styles)
- `sections/reviews.liquid` (extract styles + data-lenis-prevent)
- `sections/lifestyle-hero.liquid` (extract styles)
- `sections/product-gallery.liquid` (extract styles)

**NOT changed:**
- All 4 JS files in `assets/`
- All 5 snippet files in `snippets/`
- `templates/product.pdp.json`
- `config/settings_schema.json`
- `locales/en.default.json`
