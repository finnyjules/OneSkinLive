# "Arriving soon" redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the `Arriving soon` (OTP) card on `account.html` as a single unified card with four zones — arrival moment, collapsible items list, 4-step shipment progress, soft subscribe nudge — replacing the current stitched cream-card + viridian-soft upsell.

**Architecture:** Edits stay inside the OTP block of `account.html` and the styling lives in `assets/account/module-subscription.css`. New small JS file `assets/account/module-subscription.js` handles items collapse, copy-to-clipboard feedback, and shipment-state demo switching. No reuse of existing `.subscription__card-upsell*` or `.subscription__order-status` (removed); the new design lives on one cream surface with 1px dividers.

**Tech Stack:** HTML, CSS (vanilla, custom properties), small vanilla JS. Static file served by `npx serve` on port 3010 (config in `.claude/launch.json`). Verified via Claude Preview MCP.

**Design doc:** [docs/plans/2026-05-11-arriving-soon-redesign-design.md](2026-05-11-arriving-soon-redesign-design.md)

---

## Pre-flight: project conventions

- **Indent:** 2 spaces.
- **Class naming:** BEM-ish dashes. New classes live under `.subscription__order-*` (replacing the old `.subscription__card--order` block) — the section heading stays `Arriving soon`.
- **Design tokens:** Reuse existing tokens (`--color-viridian`, `--color-viridian-soft`, `--color-cream-2`, `--color-line-soft`, `--color-ink`, `--color-ink-2`, `--color-ink-3`, `--radius-lg`, `--radius-pill`, `--radius-sm`). For the amber delay treatment, reuse the warning colors already in `.subscription__order-status` (`#fff4e8` bg, `#b85c14` ink) before deleting that rule.
- **Verification:** Use Claude Preview MCP — `preview_eval` to navigate (`/account.html?state=otp`), `preview_snapshot` for structure, `preview_screenshot` for visual proof, `preview_console_logs` for errors. Server is already running; do not start a new one.
- **Reduced motion:** Wrap the pulse animation with `@media (prefers-reduced-motion: reduce)` to disable it.
- **Commits:** Confirm with the user before committing — the plan lists commit steps but the executing session should ask "OK to commit Task X?" before running them.

---

## Implementation decisions locked from design open questions

1. **Mock data:** Hardcode 3 items (`BODY MOISTURIZER`, `FACE SPF`, `EYE`) directly in the OTP block. Add a `?items=1` URL param branch that hides items #2 and #3 (`display: none` via a JS hook) so reviewers can preview the single-product variant.
2. **Shipment state switcher:** Extend the existing demo `state-switcher` chip in `state-toggle.js` with a second row of segmented controls for shipment state (`ordered / transit / out-for-delivery / delayed`). URL param `?ship=…`. Default `transit`.

---

## Task 1: Replace the OTP block markup in `account.html`

**Files:**
- Modify: `account.html` (replace lines ~215–276 — the `<div data-state-target="otp">…</div>` block)

**Step 1.1: Read the current OTP block to confirm exact boundaries.**

Read `account.html` lines 215–278. Confirm the block starts at `<!-- OTP -->` comment and ends just before `</section>` of the subscription module.

**Step 1.2: Replace the OTP block with the new structure.**

Use Edit. Old string is the entire OTP `<div data-state-target="otp">…</div>` block (from `<!-- OTP -->` through its closing `</div>`). New markup:

```html
      <!-- OTP — "Arriving soon" card -->
      <div data-state-target="otp">

        <h2 class="subscription__heading">Arriving soon</h2>

        <div class="subscription__list">
          <article class="subscription__order" data-shipment-state="transit" data-items-count="3">

            <!-- ZONE A — Arrival moment -->
            <header class="subscription__order-moment">
              <p class="subscription__order-eyebrow">Arriving Tuesday</p>
              <p class="subscription__order-date">May 6</p>
              <p class="subscription__order-meta">
                <span>Order #OS-14392</span>
                <span class="subscription__card-meta-sep" aria-hidden="true"></span>
                <span>Placed May 2</span>
              </p>
            </header>

            <!-- ZONE B — Items (collapsible when 2+) -->
            <section class="subscription__order-items" aria-label="Items in this shipment">
              <button
                type="button"
                class="subscription__order-items-summary"
                data-items-toggle
                aria-expanded="false"
                aria-controls="otp-items-list"
              >
                <span class="subscription__order-items-thumbs" aria-hidden="true">
                  <span class="subscription__order-items-thumb"><img src="assets/body/prod_body.png" alt=""></span>
                  <span class="subscription__order-items-thumb" data-multi-only><img src="assets/body/prod_face.png" alt=""></span>
                  <span class="subscription__order-items-thumb" data-multi-only><img src="assets/body/prod_prep.png" alt=""></span>
                </span>
                <span class="subscription__order-items-summary-text">
                  <span data-items-count-label>3 items</span>
                  <span class="subscription__card-meta-sep" aria-hidden="true"></span>
                  <span data-items-total-label>$215.00</span>
                </span>
                <span class="subscription__order-items-toggle-label" data-multi-only>
                  <span data-toggle-show>Show items</span>
                  <span data-toggle-hide hidden>Hide items</span>
                  <svg class="subscription__order-items-chevron" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M2 4.5l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </button>

              <ul class="subscription__order-items-list" id="otp-items-list" hidden>
                <li class="subscription__order-item">
                  <span class="subscription__order-item-thumb"><img src="assets/body/prod_body.png" alt=""></span>
                  <span class="subscription__order-item-body">
                    <span class="subscription__order-item-name">OS-01 BODY MOISTURIZER</span>
                  </span>
                  <span class="subscription__order-item-price">$90.00</span>
                </li>
                <li class="subscription__order-item" data-multi-only>
                  <span class="subscription__order-item-thumb"><img src="assets/body/prod_face.png" alt=""></span>
                  <span class="subscription__order-item-body">
                    <span class="subscription__order-item-name">OS-01 FACE SPF</span>
                  </span>
                  <span class="subscription__order-item-price">$75.00</span>
                </li>
                <li class="subscription__order-item" data-multi-only>
                  <span class="subscription__order-item-thumb"><img src="assets/body/prod_prep.png" alt=""></span>
                  <span class="subscription__order-item-body">
                    <span class="subscription__order-item-name">OS-01 EYE</span>
                  </span>
                  <span class="subscription__order-item-price">$50.00</span>
                </li>
              </ul>
            </section>

            <!-- ZONE C — Shipment progress -->
            <section class="subscription__order-progress" aria-label="Shipment progress">
              <ol class="subscription__order-steps">
                <li class="subscription__order-step" data-state="done">
                  <span class="subscription__order-step-dot" aria-hidden="true"></span>
                  <span class="subscription__order-step-name">Ordered</span>
                  <span class="subscription__order-step-date">May 2</span>
                </li>
                <li class="subscription__order-step" data-state="active">
                  <span class="subscription__order-step-dot" aria-hidden="true"></span>
                  <span class="subscription__order-step-name">Shipped</span>
                  <span class="subscription__order-step-date">May 3</span>
                </li>
                <li class="subscription__order-step" data-state="future">
                  <span class="subscription__order-step-dot" aria-hidden="true"></span>
                  <span class="subscription__order-step-name">Out for delivery</span>
                  <span class="subscription__order-step-date">Expected May 6</span>
                </li>
                <li class="subscription__order-step" data-state="future">
                  <span class="subscription__order-step-dot" aria-hidden="true"></span>
                  <span class="subscription__order-step-name">Delivered</span>
                  <span class="subscription__order-step-date">—</span>
                </li>
              </ol>

              <p class="subscription__order-progress-note" data-shipment-note hidden>
                Carrier reported a delay · updated May 4
              </p>

              <div class="subscription__order-progress-meta">
                <span class="subscription__order-tracking" data-tracking>
                  <span class="subscription__order-tracking-carrier">USPS</span>
                  <span class="subscription__card-meta-sep" aria-hidden="true"></span>
                  <span class="subscription__order-tracking-number" data-tracking-number>1Z999AA10123456784</span>
                  <button type="button" class="subscription__order-copy" data-copy-tracking aria-label="Copy tracking number">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <rect x="5" y="5" width="8" height="9" rx="1.5"/>
                      <path d="M3 11V3.5A1.5 1.5 0 014.5 2H11"/>
                    </svg>
                    <span class="subscription__order-copy-feedback" data-copy-feedback aria-live="polite"></span>
                  </button>
                </span>
                <span class="subscription__order-tracking-pending" data-tracking-pending hidden>
                  Tracking available when shipped
                </span>
                <a href="#" class="subscription__order-track-link" data-track-link>
                  Track package
                  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M3 7h8M8 4l3 3-3 3"/>
                  </svg>
                </a>
              </div>
            </section>

            <!-- ZONE D — Subscribe nudge -->
            <section class="subscription__order-nudge" aria-label="Subscribe to save">
              <p class="subscription__order-nudge-text" data-nudge-text>
                Subscribe to save 15% on every shipment.
              </p>
              <a href="/a/account/subscriptions" class="subscription__order-nudge-cta">
                Subscribe &amp; save
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M3 7h8M8 4l3 3-3 3"/>
                </svg>
              </a>
            </section>

          </article>
        </div>
      </div>
```

**Step 1.3: Add the new stylesheet + script imports in `<head>`.**

After the existing `<link rel="stylesheet" href="assets/account/module-subscription.css">` (line 12) leave as-is; the module's CSS stays in the same file. After the existing module scripts (around lines 18–23) add:

```html
  <script src="assets/account/module-subscription.js" defer></script>
```

(insert before the closing `</head>`).

**Step 1.4: Verify in browser.**

- `preview_eval`: navigate to `/account.html?state=otp`.
- `preview_snapshot`: confirm "Arriving Tuesday", "May 6", "3 items · $215.00", and step labels appear.
- `preview_console_logs`: confirm no errors (script will 404 until Task 5; expected).

**Step 1.5: Commit.**

```bash
git add account.html
git commit -m "restructure 'Arriving soon' card into 4-zone markup"
```

---

## Task 2: Rewrite base card + Zone A (arrival moment) styles

**Files:**
- Modify: `assets/account/module-subscription.css` (replace the `/* ============= Upcoming-order card (OTP) ============= */` block and below, through end of file — keep the active-subscription card rules untouched)

**Step 2.1: Read the current file to confirm where the deletable block starts.**

Read `assets/account/module-subscription.css` lines 166 to end. The deletable section starts at the comment `/* ============= Upcoming-order card (OTP) ============= */` (~line 166) and goes to end of file. Everything above (active subscription card) stays.

**Step 2.2: Replace from line 166 to end with the new card + Zone A rules.**

```css
/* ==========================================================================
   "Arriving soon" order card (OTP state)
   Single warm cream card with four zones (moment / items / progress / nudge)
   separated by hairline dividers. No nested surface colors.
   ========================================================================== */

.subscription__order {
  background: var(--color-cream-2);
  border: 1px solid var(--color-line-soft);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.subscription__order > * + * {
  border-top: 1px solid var(--color-line-soft);
}

.subscription__order-moment,
.subscription__order-items,
.subscription__order-progress,
.subscription__order-nudge {
  padding: 24px 32px;
}

@media (max-width: 600px) {
  .subscription__order-moment,
  .subscription__order-items,
  .subscription__order-progress,
  .subscription__order-nudge {
    padding: 20px 20px;
  }
}

/* ============= Zone A — Arrival moment ============= */

.subscription__order-eyebrow {
  font-family: var(--font-display-italic);
  font-size: 16px;
  color: var(--color-viridian);
  margin-bottom: 2px;
}

.subscription__order-date {
  font-size: 32px;
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.05;
  color: var(--color-ink);
}

@media (max-width: 600px) {
  .subscription__order-date { font-size: 26px; }
}

.subscription__order-meta {
  margin-top: 8px;
  font-size: 14px;
  color: var(--color-ink-2);
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
```

**Step 2.3: Verify in browser.**

- `preview_eval`: reload `/account.html?state=otp`.
- `preview_screenshot`: confirm the card is one warm surface with "Arriving Tuesday" eyebrow + "May 6" headline + meta. Zones B/C/D below it will be unstyled/raw at this point — that's expected.

**Step 2.4: Commit.**

```bash
git add assets/account/module-subscription.css
git commit -m "restyle 'Arriving soon' card base + Zone A (arrival moment)"
```

---

## Task 3: Zone B (items list with collapse) styles

**Files:**
- Modify: `assets/account/module-subscription.css` (append after Zone A rules)

**Step 3.1: Append Zone B rules.**

```css
/* ============= Zone B — Items list (collapsible when 2+) ============= */

.subscription__order-items-summary {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  background: none;
  border: 0;
  padding: 0;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  color: var(--color-ink);
}

.subscription__order-items-thumbs {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.subscription__order-items-thumb {
  width: 56px;
  height: 56px;
  background: var(--color-cream);
  overflow: hidden;
  display: inline-block;
}

.subscription__order-items-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

@media (max-width: 600px) {
  .subscription__order-items-thumb { width: 40px; height: 40px; }
  .subscription__order-items-thumbs { gap: 6px; }
}

.subscription__order-items-summary-text {
  flex: 1;
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: var(--color-ink-2);
}

.subscription__order-items-toggle-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-viridian);
  flex-shrink: 0;
}

.subscription__order-items-chevron {
  width: 12px;
  height: 12px;
  transition: transform 0.22s ease;
}

.subscription__order-items-summary[aria-expanded="true"] .subscription__order-items-chevron {
  transform: rotate(180deg);
}

/* When single-item: the toggle label is hidden via [data-multi-only] (see JS). */

.subscription__order-items-list {
  list-style: none;
  margin: 0;
  padding: 16px 0 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.subscription__order-items-list[hidden] { display: none; }

.subscription__order-item {
  display: grid;
  grid-template-columns: 56px 1fr auto;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
}

.subscription__order-item + .subscription__order-item {
  border-top: 1px solid var(--color-line-soft);
}

.subscription__order-item-thumb {
  width: 56px;
  height: 56px;
  background: var(--color-cream);
  overflow: hidden;
}

.subscription__order-item-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.subscription__order-item-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-ink);
}

.subscription__order-item-price {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-ink);
}
```

**Step 3.2: Verify in browser.**

- `preview_eval`: reload `/account.html?state=otp`.
- `preview_screenshot`: confirm the summary row shows 3 stacked thumbs + "3 items · $215.00" + "Show items ⌄" link, all on one line.
- `preview_eval` to manually unhide the list to spot-check expanded styling:
  ```js
  (() => { const el = document.getElementById('otp-items-list'); el.hidden = false; return 'ok'; })()
  ```
  `preview_screenshot` to confirm rows render correctly. Then reload to reset.

**Step 3.3: Commit.**

```bash
git add assets/account/module-subscription.css
git commit -m "style 'Arriving soon' items list with collapse affordance"
```

---

## Task 4: Zone C (shipment progress) styles

**Files:**
- Modify: `assets/account/module-subscription.css` (append)

**Step 4.1: Append Zone C rules.**

```css
/* ============= Zone C — Shipment progress ============= */

.subscription__order-steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  position: relative;
  gap: 0;
}

.subscription__order-step {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  position: relative;
  padding-right: 8px;
}

.subscription__order-step-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-viridian);
  position: relative;
  flex-shrink: 0;
  z-index: 1;
}

.subscription__order-step[data-state="future"] .subscription__order-step-dot {
  background: transparent;
  border: 1.5px solid var(--color-ink-3);
}

/* Connector line — drawn from the dot of step N to the dot of step N+1. */
.subscription__order-step + .subscription__order-step::before {
  content: '';
  position: absolute;
  left: -50%;
  right: 50%;
  top: 5px;          /* aligns vertically with the dot center (dot 12px, so center=6, dot top=top-of-step) */
  height: 2px;
  background: var(--color-viridian);
  z-index: 0;
}

/* Active or future neighbor → dotted ink-3. */
.subscription__order-step[data-state="future"] + .subscription__order-step::before,
.subscription__order-step[data-state="active"] + .subscription__order-step::before {
  background: transparent;
  border-top: 2px dotted var(--color-ink-3);
  height: 0;
}

.subscription__order-step-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-ink);
  line-height: 1.25;
}

.subscription__order-step-date {
  font-size: 12px;
  color: var(--color-ink-3);
  line-height: 1.25;
}

@media (max-width: 600px) {
  .subscription__order-step-name,
  .subscription__order-step-date { font-size: 11px; }
}

/* Active dot pulse */
.subscription__order-step[data-state="active"] .subscription__order-step-dot::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  border: 2px solid var(--color-viridian);
  opacity: 0.4;
  animation: subscription-order-pulse 2.4s ease-out infinite;
}

@keyframes subscription-order-pulse {
  0%   { transform: scale(1);   opacity: 0.4; }
  100% { transform: scale(1.8); opacity: 0;   }
}

@media (prefers-reduced-motion: reduce) {
  .subscription__order-step[data-state="active"] .subscription__order-step-dot::after {
    animation: none;
    opacity: 0.4;
  }
}

/* Delayed overlay — active step's dot + pulse turn amber */
.subscription__order[data-shipment-state="delayed"]
  .subscription__order-step[data-state="active"] .subscription__order-step-dot {
  background: #b85c14;
}

.subscription__order[data-shipment-state="delayed"]
  .subscription__order-step[data-state="active"] .subscription__order-step-dot::after {
  border-color: #b85c14;
}

/* Note line (delay) */
.subscription__order-progress-note {
  margin-top: 18px;
  font-size: 13px;
  color: #b85c14;
}

/* Meta row */
.subscription__order-progress-meta {
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: var(--color-ink-2);
}

.subscription__order-tracking,
.subscription__order-tracking-pending {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.subscription__order-tracking-number {
  font-variant-numeric: tabular-nums;
}

.subscription__order-copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  border: 0;
  color: var(--color-viridian);
  cursor: pointer;
  border-radius: var(--radius-sm);
  position: relative;
  transition: background 0.18s ease;
}

.subscription__order-copy:hover { background: rgba(0,0,0,0.04); }

.subscription__order-copy svg { width: 14px; height: 14px; }

.subscription__order-copy-feedback:not(:empty) {
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 8px;
  white-space: nowrap;
  color: var(--color-viridian);
  font-size: 12px;
  font-weight: 500;
}

.subscription__order-track-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 400;
  color: var(--color-viridian);
  transition: gap 0.18s ease;
}

.subscription__order-track-link:hover { gap: 10px; }
.subscription__order-track-link svg { width: 14px; height: 14px; }

@media (max-width: 600px) {
  .subscription__order-progress-meta {
    align-items: flex-start;
    flex-direction: column;
  }
  .subscription__order-track-link { align-self: flex-end; }
}

/* Pre-ship state: hide tracking number + track link, show pending line. */
.subscription__order[data-shipment-state="ordered"] [data-tracking],
.subscription__order[data-shipment-state="ordered"] [data-track-link] {
  display: none;
}

.subscription__order[data-shipment-state="ordered"] [data-tracking-pending] {
  display: inline-flex;
}

/* Out-for-delivery: emphasize Track package (ink, not viridian). */
.subscription__order[data-shipment-state="out-for-delivery"] .subscription__order-track-link {
  color: var(--color-ink);
  font-weight: 500;
}

/* Delayed: reveal note. */
.subscription__order[data-shipment-state="delayed"] [data-shipment-note] {
  display: block;
}
```

**Step 4.2: Verify in browser.**

- `preview_eval`: reload `/account.html?state=otp`.
- `preview_screenshot`: confirm 4 steps render with Shipped active (filled + pulsing ring), Out-for-delivery and Delivered as hollow ink-3 dots, and the dotted-line connector after Shipped.
- `preview_eval`: confirm the active step pulses by reading computed style (or just inspect visually via screenshot — the ring should be there).
- `preview_console_logs`: no errors.

**Step 4.3: Commit.**

```bash
git add assets/account/module-subscription.css
git commit -m "style 'Arriving soon' shipment-progress indicator + tracking meta"
```

---

## Task 5: Zone D (subscribe nudge) styles

**Files:**
- Modify: `assets/account/module-subscription.css` (append)

**Step 5.1: Append Zone D rules.**

```css
/* ============= Zone D — Subscribe nudge ============= */

.subscription__order-nudge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.subscription__order-nudge-text {
  font-size: 15px;
  color: var(--color-ink);
  margin: 0;
}

.subscription__order-nudge-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-viridian);
  transition: gap 0.18s ease;
}

.subscription__order-nudge-cta:hover { gap: 10px; }
.subscription__order-nudge-cta svg { width: 14px; height: 14px; }

@media (max-width: 600px) {
  .subscription__order-nudge { padding-top: 14px; padding-bottom: 14px; }
  .subscription__order-nudge-cta { align-self: flex-end; }
}
```

**Step 5.2: Verify in browser.**

- `preview_eval`: reload `/account.html?state=otp`.
- `preview_screenshot`: confirm the nudge sits below progress on the same cream surface, divided by a 1px line, with text left and CTA right.

**Step 5.3: Commit.**

```bash
git add assets/account/module-subscription.css
git commit -m "style 'Arriving soon' subscribe nudge"
```

---

## Task 6: JavaScript — items collapse + copy + state demo

**Files:**
- Create: `assets/account/module-subscription.js`

**Step 6.1: Create the file.**

```javascript
// Account "Arriving soon" order card behavior.
// - Toggle the items list (collapsed by default for 2+ items, no-op for 1).
// - Copy tracking number to clipboard with inline feedback.
// - Drive shipment-state demo from ?ship=... and items-count demo from ?items=...
// In production, the shipment-state and items count come from order data.

(function () {
  const order = document.querySelector('.subscription__order');
  if (!order) return;

  // ---- Shipment-state demo (URL param) ----
  const params = new URLSearchParams(window.location.search);
  const VALID_SHIP = new Set(['ordered', 'transit', 'out-for-delivery', 'delayed']);
  const ship = (params.get('ship') || '').toLowerCase();
  if (VALID_SHIP.has(ship)) {
    order.setAttribute('data-shipment-state', ship);

    // Recompute step states from the chosen shipment state. The latest
    // "done" step is the one before the new active step; everything after
    // is "future".
    const stepOrder = ['ordered', 'shipped', 'out-for-delivery', 'delivered'];
    const activeIndex = {
      'ordered': 0,
      'transit': 1,
      'out-for-delivery': 2,
      'delayed': 1,  // delayed overlay sits on the in-transit step by default
    }[ship];

    order.querySelectorAll('.subscription__order-step').forEach((step, i) => {
      if (i < activeIndex) step.setAttribute('data-state', 'done');
      else if (i === activeIndex) step.setAttribute('data-state', 'active');
      else step.setAttribute('data-state', 'future');
    });
  }

  // ---- Items count demo (URL param) ----
  const items = params.get('items');
  if (items === '1') {
    order.setAttribute('data-items-count', '1');
    order.querySelectorAll('[data-multi-only]').forEach((el) => { el.hidden = true; });
    const countLabel = order.querySelector('[data-items-count-label]');
    if (countLabel) countLabel.textContent = '1 item';
    const totalLabel = order.querySelector('[data-items-total-label]');
    if (totalLabel) totalLabel.textContent = '$90.00';
    const nudgeText = order.querySelector('[data-nudge-text]');
    if (nudgeText) nudgeText.textContent = 'Subscribe to save $13.50/shipment.';
  }

  // ---- Items toggle ----
  const toggle = order.querySelector('[data-items-toggle]');
  const list = order.querySelector('.subscription__order-items-list');
  const labelShow = order.querySelector('[data-toggle-show]');
  const labelHide = order.querySelector('[data-toggle-hide]');

  if (toggle && list && order.getAttribute('data-items-count') !== '1') {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      list.hidden = expanded;
      if (labelShow && labelHide) {
        labelShow.hidden = !expanded;
        labelHide.hidden = expanded;
      }
    });
  } else if (toggle && order.getAttribute('data-items-count') === '1') {
    // Single item: the summary row is decorative — disable the button.
    toggle.setAttribute('tabindex', '-1');
    toggle.style.cursor = 'default';
    toggle.addEventListener('click', (e) => e.preventDefault());
  }

  // ---- Copy tracking ----
  const copyBtn = order.querySelector('[data-copy-tracking]');
  const trackingNumber = order.querySelector('[data-tracking-number]');
  const feedback = order.querySelector('[data-copy-feedback]');
  if (copyBtn && trackingNumber && feedback) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(trackingNumber.textContent.trim());
        feedback.textContent = 'Copied';
        clearTimeout(copyBtn.__timer);
        copyBtn.__timer = setTimeout(() => { feedback.textContent = ''; }, 1400);
      } catch (_) {
        feedback.textContent = 'Press ⌘C';
      }
    });
  }
})();
```

**Step 6.2: Verify in browser.**

- `preview_eval`: reload `/account.html?state=otp`.
- `preview_eval`:
  ```js
  document.querySelector('[data-items-toggle]').click();
  document.getElementById('otp-items-list').hidden;
  ```
  Expected: `false` (list now visible). Click again → `true`.
- `preview_eval`:
  ```js
  document.querySelector('[data-copy-tracking]').click();
  document.querySelector('[data-copy-feedback]').textContent;
  ```
  Expected: `"Copied"` (or `"Press ⌘C"` if clipboard API unavailable in preview).
- `preview_eval`: navigate to `/account.html?state=otp&ship=ordered`. Confirm tracking number/track link hide and the pending line shows.
- `preview_eval`: navigate to `/account.html?state=otp&ship=out-for-delivery`. Confirm three dots are filled, last is hollow, and Track package is ink (not viridian).
- `preview_eval`: navigate to `/account.html?state=otp&ship=delayed`. Confirm the active dot is amber and the note line appears.
- `preview_eval`: navigate to `/account.html?state=otp&items=1`. Confirm only one item appears, summary reads `1 item · $90.00`, toggle label is hidden, and nudge copy changes to `$13.50/shipment`.
- `preview_console_logs`: no errors across all variants.

**Step 6.3: Commit.**

```bash
git add assets/account/module-subscription.js
git commit -m "wire 'Arriving soon' items toggle, copy tracking, and demo state switches"
```

---

## Task 7: Extend the demo state-switcher chip with shipment-state controls

**Files:**
- Modify: `assets/account/state-toggle.js` (after the chip is appended around line 59, add a second row of links for shipment state when the customer state is `otp`)

**Step 7.1: Read current state-toggle.js to identify the insertion point.**

Read `assets/account/state-toggle.js` lines 36–82. The chip is built inline and appended at line 59. Internal-link propagation happens after.

**Step 7.2: Inject a second row of segmented controls below the existing options.**

Find the `chip.innerHTML = \`…\`` block (line 41–48) and append a second segment group for shipment state, but only when the current customer state is `otp`. Replace the existing innerHTML assignment with:

```js
  const shipParam = (new URLSearchParams(window.location.search).get('ship') || 'transit').toLowerCase();

  chip.innerHTML = `
    <span class="state-switcher__label">Demo state</span>
    <div class="state-switcher__options" role="radiogroup">
      <a class="state-switcher__option" data-state-link="otp" href="?state=otp">OTP</a>
      <a class="state-switcher__option" data-state-link="face" href="?state=face">Face sub</a>
      <a class="state-switcher__option" data-state-link="hair" href="?state=hair">Hair sub</a>
    </div>
    ${state === 'otp' ? `
      <span class="state-switcher__divider" aria-hidden="true"></span>
      <div class="state-switcher__options" role="radiogroup" aria-label="Shipment state">
        <a class="state-switcher__option" data-ship-link="ordered" href="?state=otp&ship=ordered">Ordered</a>
        <a class="state-switcher__option" data-ship-link="transit" href="?state=otp&ship=transit">In transit</a>
        <a class="state-switcher__option" data-ship-link="out-for-delivery" href="?state=otp&ship=out-for-delivery">Out for delivery</a>
        <a class="state-switcher__option" data-ship-link="delayed" href="?state=otp&ship=delayed">Delayed</a>
      </div>
    ` : ''}
  `;
```

After the existing line that activates the current state link, add the equivalent for the shipment chip:

```js
  chip.querySelector(`[data-state-link="${state}"]`).classList.add('is-active');
  if (state === 'otp') {
    const shipEl = chip.querySelector(`[data-ship-link="${shipParam}"]`);
    if (shipEl) shipEl.classList.add('is-active');
  }
```

And update the internal-link propagation block (lines 65–80) to also carry the `ship` param. Replace the relevant body:

```js
  internalLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    if (href.startsWith('http') || href.startsWith('//')) return;
    if (href.startsWith('/a/')) return;
    try {
      const url = new URL(href, window.location.origin);
      url.searchParams.set('state', state);
      if (state === 'otp' && shipParam !== 'transit') {
        url.searchParams.set('ship', shipParam);
      }
      link.setAttribute('href', url.pathname + url.search);
    } catch (_) {}
  });
```

**Step 7.3: Add a small CSS rule for the divider (in `assets/account/base.css` or wherever `state-switcher` lives — grep first).**

```bash
grep -rn "state-switcher" assets/account/ assets/
```

Likely in `assets/account/base.css` or `assets/account/account.css`. Append:

```css
.state-switcher__divider {
  width: 1px;
  height: 16px;
  background: rgba(255,255,255,0.18);
  display: inline-block;
}
```

**Step 7.4: Verify in browser.**

- `preview_eval`: reload `/account.html?state=otp`.
- `preview_snapshot`: confirm chip now has two segmented control rows separated by a hairline divider, with `In transit` highlighted by default.
- Click each shipment-state link manually via `preview_eval` (`document.querySelector('[data-ship-link="delayed"]').click()`) and confirm the card adapts (active dot turns amber, note appears).
- Switch customer state to `face` and confirm the shipment-state row hides.

**Step 7.5: Commit.**

```bash
git add assets/account/state-toggle.js assets/account/<file-with-state-switcher-css>
git commit -m "add shipment-state segmented control to OTP demo chip"
```

---

## Task 8: Mobile + cross-state final pass

**Files:**
- Possibly modify: `assets/account/module-subscription.css` based on findings

**Step 8.1: Test at 600px.**

- `preview_resize` to 600x900.
- `preview_eval`: reload `/account.html?state=otp`.
- `preview_screenshot`. Check:
  - Card padding tighter, all four zones legible
  - Items summary on one line
  - Progress dots still spaced cleanly, labels can wrap to two lines
  - Track package link wraps below tracking number
  - Subscribe nudge wraps with CTA below text

**Step 8.2: Test at 375px.**

- `preview_resize` to 375x812.
- Cycle through each shipment state via `?ship=…` query and screenshot each.
- Note any collisions (labels overlapping, copy button cut off, etc.).

**Step 8.3: Test at 360px (narrow fallback).**

- `preview_resize` to 360x780.
- If step labels collide or overflow, add the `<360px` truncation rule per design:

```css
@media (max-width: 359px) {
  .subscription__order-step-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 64px;
  }
  .subscription__order-progress-meta { overflow-x: auto; }
}
```

**Step 8.4: Keyboard test.**

- `preview_eval`: focus the items toggle, press Enter, confirm it expands and `aria-expanded="true"`. Press Enter again to collapse.
- Tab to copy button, press Enter, confirm feedback shows.
- Tab to Subscribe & save link, confirm focus ring is visible (viridian outline).

**Step 8.5: Reset viewport to native.**

- `preview_resize` with `preset: desktop`.

**Step 8.6: Commit any tweaks.**

```bash
git add assets/account/module-subscription.css
git commit -m "mobile + a11y polish on 'Arriving soon' card"
```

(Skip if no tweaks were needed.)

---

## Task 9: Cleanup + final review

**Files:**
- Modify: `assets/account/module-subscription.css` (remove any unused selectors that survived from the old design)

**Step 9.1: Grep for orphaned selectors.**

```bash
grep -rn "subscription__card--order\|subscription__order-status\|subscription__card-upsell" assets/ *.html
```

Confirm none of these classes are referenced from HTML. If `module-subscription.css` still defines them, delete those rules.

**Step 9.2: Grep for `.subscription__upgrade*` rules (lines 259–362 of old file).**

If those are still in the file and unused by any HTML, delete them. (They appear to be for an older OTP upgrade hero that no longer exists in the markup.)

```bash
grep -rn "subscription__upgrade" assets/ *.html
```

Delete only if zero references outside the CSS itself.

**Step 9.3: Final smoke test.**

- `preview_eval`: reload `/account.html?state=otp` and screenshot each shipment state (`transit`, `ordered`, `out-for-delivery`, `delayed`) and item-count (`items=1`).
- `preview_console_logs`: zero errors across all variants.

**Step 9.4: Commit cleanup.**

```bash
git add assets/account/module-subscription.css
git commit -m "drop unused subscription CSS (old order card, upsell, upgrade hero)"
```

---

## Out of scope (do not implement in this plan)

- **Delivered state celebration card** — order moves to Order history after delivery.
- **Failed delivery / returned escalation states** — different CTAs (`Contact support`, `Resolve issue`). The new card structure can grow into this in a follow-up.
- **Real Skio API integration** — `data-shipment-state`, items, dates are still mocked.
- **Carrier logos** or **map preview** — explicitly excluded by design.

## Done criteria

- `Arriving soon` renders as a single warm card with four distinct zones separated by hairlines, no nested two-tone surface.
- Active step pulses (or is statically highlighted with `prefers-reduced-motion: reduce`).
- Items list collapses by default for 2+ items, expands cleanly with `aria-expanded` and chevron rotation.
- Copy button copies the tracking number and flashes "Copied" feedback.
- Four shipment states (`ordered / transit / out-for-delivery / delayed`) render correctly, switchable via URL or the demo chip.
- Single-item variant (`?items=1`) reads cleanly with no toggle affordance.
- 375px and 360px viewports render without overflow or collision; keyboard-only flow is functional.
- No console errors across all variants.
