# Account Orders Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Promote in-transit orders to a hero block reusing the account-home "Arriving soon" component, rework the history list into state-aware compact cards with one primary CTA per state, drop type filter chips and per-row track links.

**Architecture:** Reuse the `.subscription__order*` markup and styles from `account.html` for the active-shipment hero (link `module-subscription.css` + `module-subscription.js`). Restructure `account-orders.html` into two sections (`.account-orders__active` + `.account-orders__history`). Drive history card variants from a `data-order-state` attribute on each row. Strip filter logic from `orders.js`; keep the Reorder toast.

**Tech Stack:** Static HTML / vanilla CSS / vanilla JS prototype. No build step. Local dev server at `localhost:3010` serves `.html` files at extension-less URLs. No test suite — verification is visual via dev server + screenshots against the design doc.

**Reference design:** `docs/plans/2026-05-14-account-orders-redesign-design.md`

---

## Verification approach

This is a static prototype with no unit-test framework. For each task, "verification" means:

1. Save the file(s).
2. Reload `http://localhost:3010/account-orders` in the preview.
3. Compare against the corresponding section of the design doc.
4. Optionally screenshot with `preview_screenshot` and inspect.

If the dev server is not already running, start it via `mcp__Claude_Preview__preview_start` with name `dev`.

---

## Task 1: Add a cancelled order to the demo data

**Why first:** The cancelled card variant is part of the design but the current demo has no cancelled order. Adding it now means the variant becomes testable as soon as it's styled.

**Files:**
- Modify: `account-orders.html` (insert a new `<li>` between the existing rows in the `.account-orders__list` `<ol>`)

**Step 1: Open `account-orders.html`** and find the `<ol class="account-orders__list">` at line 102.

**Step 2: Insert a new `<li>` after the OS-13987 row (between roughly line 213 and 215).** Use this markup:

```html
          <li class="account-orders__row" data-order-row data-order-type="onetime" data-order-state="cancelled">
            <div class="account-orders__row-header">
              <p class="account-orders__row-meta">
                <strong>#OS-13802</strong>
                <span class="account-orders__row-meta-sep" aria-hidden="true"></span>
                <span>February 28, 2026</span>
                <span class="account-orders__row-meta-sep" aria-hidden="true"></span>
                <span class="account-pill">One-time</span>
              </p>
              <p class="account-orders__row-total">$90.00</p>
            </div>

            <div class="account-orders__row-body">
              <div class="account-orders__items">
                <div class="account-orders__item">
                  <div class="account-orders__item-thumb"><img src="assets/body/prod_body.png" alt=""></div>
                  <div class="account-orders__item-text">
                    <span class="account-orders__item-name">OS-01 BODY MOISTURIZER</span>
                    <span class="account-orders__item-detail">Qty 1 · 100 ml</span>
                  </div>
                </div>
              </div>
              <span class="account-orders__status account-orders__status--cancelled">Cancelled · February 28</span>
              <p class="account-orders__status-note">We couldn't charge your card. You weren't charged.</p>
            </div>

            <div class="account-orders__row-actions">
              <button type="button" class="btn btn--ghost btn--small" data-order-reorder>Reorder</button>
              <a href="#" class="account-orders__row-link">View invoice</a>
            </div>
          </li>
```

**Step 3: Update the filter count for "All" from 4 → 5 and "One-time" from 2 → 3.**

> Note: filter markup will be removed in Task 4. Skipping the count update is fine, but if you leave it, it'll briefly disagree with reality between Task 1 and Task 4.

**Step 4: Verify.** Reload `/account-orders` and confirm the new cancelled row renders. The status pill will look wrong (no `--cancelled` style yet, that's Task 6) — that's expected.

**Step 5: Commit.**

```bash
git add account-orders.html
git commit -m "demo: add cancelled order to account-orders fixture"
```

---

## Task 2: Add `data-order-state` to every history row

**Why:** Task 6's CSS will key state-aware variants off this attribute. Doing this in its own commit keeps the markup change and the styling change reviewable separately.

**Files:**
- Modify: `account-orders.html` — every `<li class="account-orders__row" ...>` element

**Step 1: For each row, add `data-order-state="<state>"` to the opening `<li>` tag.** Use these values:

| Order # | State |
|---|---|
| OS-14392 | `transit` |
| OS-14201 | `delivered` |
| OS-13987 | `delivered` |
| OS-13802 | `cancelled` *(already set in Task 1)* |
| OS-13654 | `delivered` |

**Step 2: Verify.** Reload `/account-orders`. No visual change yet.

```bash
git add account-orders.html
git commit -m "account-orders: tag each row with data-order-state"
```

---

## Task 3: Restructure HTML — split into active + history sections, remove filter chips

**Why:** The structural backbone for the redesign. Active orders need their own wrapper so the hero markup (Task 5) can replace them.

**Files:**
- Modify: `account-orders.html`

**Step 1: Remove the `.account-orders__filters` block entirely** (lines 90-100 of the current file). The whole `<div class="account-orders__filters" role="tablist" ...>...</div>` goes.

**Step 2: Wrap the `<ol class="account-orders__list">` in a `<section class="account-orders__history">` wrapper:**

```html
<section class="account-orders__history" aria-label="Past orders">
  <ol class="account-orders__list">
    ... existing history rows (not the OS-14392 in-transit one) ...
  </ol>

  <div class="account-orders__empty" data-order-empty>
    No past orders yet.
  </div>
</section>
```

**Step 3: Remove the OS-14392 in-transit `<li>` from the list entirely.** It will be replaced by the hero in Task 5. Lines roughly 104–143.

**Step 4: Insert an empty `<section class="account-orders__active" data-order-active>` placeholder *before* the `.account-orders__history` section.** Hero markup lands here in Task 5.

```html
<section class="account-orders__active" data-order-active aria-label="Active shipments">
  <!-- Hero blocks injected per active order (Task 5) -->
</section>
```

**Step 5: Update the empty-state copy** from `No orders match this filter yet.` to `No past orders yet.` (filters are gone).

**Step 6: Verify.** Reload `/account-orders`. The page should show:
- Header unchanged
- *No* filter chips
- *No* in-transit order (it's removed; hero not added yet)
- Four history rows (OS-14201, OS-13987, OS-13802, OS-13654)

```bash
git add account-orders.html
git commit -m "account-orders: split into active + history, remove filter chips"
```

---

## Task 4: JS — Remove filter logic, keep Reorder toast

**Why:** The filter markup is gone; the JS hooks would silently no-op, but leaving dead code is worse than removing it.

**Files:**
- Modify: `assets/account/orders.js`

**Step 1: Replace the file contents** with:

```javascript
// Order History — Reorder buttons show a confirmation toast.
// The live implementation would call Shopify's cart endpoint with
// the original line items.

(function () {
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

  document.querySelectorAll('[data-order-reorder]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Reordered — items added to your cart');
    });
  });
})();
```

**Step 2: Verify.** Reload `/account-orders`. Open DevTools console — no errors. Click any Reorder button — toast appears.

```bash
git add assets/account/orders.js
git commit -m "account-orders: drop filter logic, keep reorder toast"
```

---

## Task 5: HTML — Port the "Arriving soon" hero into the active section

**Why:** The structural piece of approach B — promote the in-transit order to a hero card matching the account-home pattern.

**Files:**
- Modify: `account-orders.html`

**Step 1: Add `<link rel="stylesheet" href="assets/account/module-subscription.css">` to the `<head>`** of `account-orders.html`, after the existing `account.css` link.

**Step 2: Add `<script src="assets/account/module-subscription.js" defer></script>`** before the closing `</head>`, alongside the existing script tags.

**Step 3: Inside the `<section class="account-orders__active">` placeholder added in Task 3**, insert the OS-14392 hero block. Port verbatim from `account.html:266-381` (the `<article class="subscription__order" data-shipment-state="transit" data-items-count="3">` element and all its children — Zone A header, Zone B items, Zone D nudge).

Two adjustments while pasting:
- Change `id="otp-items-list"` and `aria-controls="otp-items-list"` to `id="active-os14392-items-list"` and matching `aria-controls`, to avoid colliding with the same id on `account.html` if a future page ever embeds both.
- Make sure the `<a href="/account-orders.html" ...>Order #OS-14392 · Placed May 2</a>` becomes `<span class="subscription__order-id">Order #OS-14392 · Placed May 2</span>` — on the orders page itself, that link would be self-referential.

**Step 4: Verify.** Reload `/account-orders`. The hero should render full-width above the history list, with:
- Eyebrow "Arriving Tuesday" / big "May 6" / order subline
- Four-step timeline rail with the first two dots filled
- "Track package" soft button
- Collapsed items strip showing 3 thumbs + "3 items · $215.00"
- Subscribe & save nudge below

The history list below contains four rows (no in-transit one).

```bash
git add account-orders.html
git commit -m "account-orders: promote in-transit order to Arriving Soon hero"
```

---

## Task 6: CSS — Active/history section spacing, density tweaks, state-aware history cards

**Why:** Style the new structural pieces and the per-state card variants.

**Files:**
- Modify: `assets/account/orders.css`

**Step 1: Remove the `.account-orders__filters`, `.account-orders__filter`, and `.account-orders__filter-count` rules** (lines 11–57 of the current file).

**Step 2: At the top of the file (right after `.account-orders { ... }`) add section wrappers:**

```css
.account-orders__active {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.account-orders__active:empty {
  display: none;
}

.account-orders__history {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.account-orders__history-heading {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-ink-3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
```

> Note: the optional `<h2 class="account-orders__history-heading">Past orders</h2>` is not in the design doc. Skip the heading element in HTML if the design doesn't call for one; the style is still cheap to define for later use. **Default: don't render the heading.** Remove this rule if unused after Task 8.

**Step 3: Update thumb sizing** — change `.account-orders__item-thumb` width/height from `56px` to `44px`.

**Step 4: Remove separator dot styling** — delete the `.account-orders__row-meta-sep` rule. (HTML still emits them; they'll just collapse to zero-width inline spans.) Alternatively: remove the `<span class="account-orders__row-meta-sep">` from each row's markup. Either is fine; CSS removal is the lower-touch path.

**Step 5: Add the cancelled status variant + explanation note styles:**

```css
.account-orders__status--cancelled {
  background: #fdecec;
  color: #b32424;
}

.account-orders__status-note {
  font-size: 13px;
  color: var(--color-ink-2);
  line-height: 1.5;
  margin-top: 6px;
  max-width: 52ch;
}
```

> The `--cancelled` variant already exists in the current file (line 190). Confirm it's still there; if so, this step only adds `.account-orders__status-note`.

**Step 6: Remove the `.account-orders__skio-action` rules** (lines 201–230). The convert-to-subscription nudge no longer lives in history rows — it's in the hero only. (If the rules are still referenced elsewhere, leave them; if they only powered the now-removed inline block, delete.)

**Step 7: Add state-aware primary CTA hint via data-order-state.** Append:

```css
/* State-aware: the FIRST action in the row is the primary CTA.
   For subscription rows, swap the Reorder button for a "Manage subscription"
   link styled as a button — handled directly in HTML in Task 7. */
.account-orders__row[data-order-state="cancelled"] .account-orders__status {
  /* status already styled by --cancelled variant; no extra rules needed */
}
```

> The state-aware "primary CTA per state" rule is enforced in the HTML in Task 7 by reordering action elements and changing classes, not via CSS. This block is a placeholder for future hooks if needed.

**Step 8: Verify.** Reload `/account-orders`. Confirm:
- Hero still renders correctly (its styles come from `module-subscription.css`, not touched).
- History rows have smaller thumbs (44px).
- Cancelled row's status pill is reddish; explanation text reads beneath it.
- No filter chip block at the top.

```bash
git add assets/account/orders.css
git commit -m "account-orders: density tweaks and cancelled state variant"
```

---

## Task 7: HTML — Promote primary CTA per state in history rows

**Why:** Each card variant should lead with one CTA aligned to its state. Today, every footer has `[Reorder] · View invoice · Track package` regardless. We promote one action to primary and drop the rest.

**Files:**
- Modify: `account-orders.html`

**Step 1: For each delivered subscription row** (OS-14201, OS-13654), change the footer to:

```html
<div class="account-orders__row-actions">
  <a href="/a/account/subscriptions" class="btn btn--primary btn--small">Manage subscription</a>
  <a href="#" class="account-orders__row-link">View invoice</a>
</div>
```

The current `btn--ghost` Reorder is removed.

**Step 2: For each delivered one-time row** (OS-13987), change the footer to:

```html
<div class="account-orders__row-actions">
  <button type="button" class="btn btn--primary btn--small" data-order-reorder>Reorder</button>
  <a href="#" class="account-orders__row-link">View invoice</a>
</div>
```

The "Track package" link is removed (delivered orders don't need tracking).

**Step 3: For the cancelled row** (OS-13802), the footer is already correct from Task 1 (Reorder + View invoice). Promote the Reorder button class from `btn--ghost` to `btn--primary` for parity with delivered OTP:

```html
<button type="button" class="btn btn--primary btn--small" data-order-reorder>Reorder</button>
```

**Step 4: Verify.** Reload `/account-orders`. Each row has exactly one prominent button + one link. Subscription rows say "Manage subscription"; delivered one-time and cancelled say "Reorder"; no Track package links in the history.

```bash
git add account-orders.html
git commit -m "account-orders: one primary CTA per row state"
```

---

## Task 8: Demo state — Extend state-toggle to switch hero/history views

**Why:** The success criteria call for previewing the page in three states: active + history (default), history only, active only. The existing `state-toggle.js` already provides demo controls — extend it.

**Files:**
- Read: `assets/account/state-toggle.js` (to understand the existing API)
- Modify: `assets/account/state-toggle.js`
- Modify: `account-orders.html` (only if extra demo-control markup is needed)

**Step 1: Read `state-toggle.js`** to identify how existing demo controls register. The current toggle exposes a "Demo state" panel with OTP/Face sub/Hair sub and shipment-state options.

**Step 2: Add a third row of buttons** to the demo panel: `Active + History | History only | Active only`. When clicked:
- `Active + History` (default): both `.account-orders__active` and `.account-orders__history` render normally.
- `History only`: `.account-orders__active` gets `hidden` attribute.
- `Active only`: `.account-orders__history` gets `hidden` attribute; the empty state at the bottom does not appear.

Suggested API: `[data-state-target="orders-view"]` with values `"both" | "history" | "active"`, mirroring the existing `data-state-target` pattern.

**Step 3: Verify.** Reload `/account-orders`. Click each of the three view buttons:
- `History only`: hero disappears, history list remains.
- `Active only`: history list disappears, hero remains.
- `Active + History`: both visible (default state).

```bash
git add assets/account/state-toggle.js account-orders.html
git commit -m "account-orders: demo toggle for hero/history view"
```

---

## Task 9: Visual verification across breakpoints

**Why:** Confirm the redesign matches the design doc at both desktop and mobile widths.

**Files:** None modified.

**Step 1: Open the preview** at `http://localhost:3010/account-orders`.

**Step 2: Desktop (1440×900).** Use `preview_resize` with width 1440 / height 900. Screenshot. Confirm:
- Page header reads as before.
- Active shipments hero matches account-home's "Arriving soon" treatment.
- Four history rows below: OS-14201 (sub, delivered), OS-13987 (OTP, delivered), OS-13802 (OTP, cancelled with explanation), OS-13654 (sub, delivered).
- No filter chips. No per-row Track package link.

**Step 3: Mobile (375×812).** Use `preview_resize` with preset `mobile`. Screenshot. Confirm:
- Hero stacks (timeline rail and items collapse vertically — same behavior as account-home).
- History card meta row wraps; thumbs stay at 44px; primary CTA full-width or at least left-aligned.
- Account nav collapses to the mobile dropdown trigger.

**Step 4: Exercise demo toggles.** Cycle through `Active only` and `History only` views; confirm sections show/hide as expected.

**Step 5: Console check.** Confirm no JS errors in the console at any state.

**Step 6 (optional): Spawn a doc-update task** if anything in the design doc no longer matches reality after implementation.

```bash
# No commit required for verification; if any tweaks were needed, they
# get their own focused commit.
```

---

## Out of scope (do NOT implement)

The design doc lists these explicitly as deferred:

- Search box / date-range filter
- Per-item reorder (DSC-style)
- "Action required" tab
- Returns / refunded / partial-delivery states

If you find yourself reaching for these to "complete" the page, stop and re-read the design doc.

---

## Done when

1. `/account-orders` leads with a hero matching account-home's Arriving Soon component.
2. Filter chips are gone from HTML, CSS, and JS.
3. Past orders display one state-appropriate primary CTA (Reorder / Manage subscription / Reorder).
4. Cancelled order shows an explanation line beneath its status pill.
5. The demo state toggle can switch the page between active+history, history-only, and active-only views.
6. No console errors at any view state, on desktop and mobile.
