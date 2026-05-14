# "Arriving soon" — fold Zone C into Zone A + tint Zone D — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Merge the OTP card's tracking row (Zone C) into the moment header (Zone A) so the order link sits under the date in the left column and the Track package button sits under the timeline in the right column; tint the subscribe nudge (Zone D) with `--color-viridian-light` to make the upsell read as a distinct section.

**Architecture:** Markup move only (no new components). Add a new right-column wrapper `<div class="subscription__order-moment-progress">` inside the existing `<header class="subscription__order-moment">` and move the timeline `<ol>`, the delay note, the pending line, and the Track package link into it. Move the order link `<a class="subscription__order-id">` into `<div class="subscription__order-moment-text">` as a third stacked element. Delete the now-empty Zone C `<section>`. CSS: switch the moment header's `align-items` from `center` to `flex-start`, add the new right-column flex rules, re-scope the Track package soft-button tint and the mobile align-self rule from `.subscription__order-progress-meta` to `.subscription__order-moment-progress`, drop the now-stale `.subscription__order-tracking-zone` padding entry and the `+meta` margin sibling rule, and tint `.subscription__order-nudge` while dropping its top border so the color edge carries the division.

**Tech Stack:** HTML, CSS (vanilla, custom properties), no JS changes. Static file served by `npx serve` on port 3010 (`.claude/launch.json` → `dev`). Server already running.

**Design doc:** [2026-05-14-arriving-soon-zone-c-merge-design.md](2026-05-14-arriving-soon-zone-c-merge-design.md)

---

## Pre-flight: project conventions

- **Indent:** 2 spaces.
- **Class naming:** BEM-ish dashes. Keep existing classes; add only `.subscription__order-moment-progress` (the new right-column wrapper). Do not rename `.subscription__order-progress-note` or `.subscription__order-id` — they live in a different parent now but the names still scan and JS hooks (`data-track-link`, `data-shipment-note`, `data-tracking-pending`) are what the state CSS keys on.
- **Tokens:** `--color-viridian-light` is `#dce5df` (from `assets/account/base.css:65`). Reuse it via the variable.
- **Verification:** Use Claude Preview MCP. Server already running on `:3010` with id stored in the previous chapter. List with `preview_list`. Navigate via `preview_eval` (`window.location.href = '/account.html?state=otp'`). Use the demo chip clicks or `setAttribute` on `[data-shipment-state]` to flip shipment states (URL params get stripped by the dev server's extensionless routing).
- **Commits:** Ask "OK to commit Task X?" before each commit step.

---

## Task 1: Restructure the OTP card markup

**Files:**
- Modify: `account.html` lines ~268–370 (the OTP block's `<article class="subscription__order">`)

**Step 1.1: Read the current OTP block to confirm boundaries.**

Read `account.html` lines 266–385. Confirm:
- Zone A header runs ~268–293, currently has `.subscription__order-moment-text` (eyebrow + date only) followed by `<ol class="subscription__order-steps">`.
- Zone C runs ~348–370, has the delay note, then `.subscription__order-progress-meta` containing order link + pending span + Track package link.

**Step 1.2: Move the order link into the left text column.**

Use Edit. Old string:

```html
              <header class="subscription__order-moment">
                <div class="subscription__order-moment-text">
                  <p class="subscription__order-eyebrow">Arriving Tuesday</p>
                  <p class="subscription__order-date">May 6</p>
                </div>
```

New string (append the link as a third line in the text column):

```html
              <header class="subscription__order-moment">
                <div class="subscription__order-moment-text">
                  <p class="subscription__order-eyebrow">Arriving Tuesday</p>
                  <p class="subscription__order-date">May 6</p>
                  <a href="/account-orders.html" class="subscription__order-id">
                    Order #OS-14392 · Placed May 2
                  </a>
                </div>
```

**Step 1.3: Wrap the timeline + tracking elements in the new right-column div.**

Use Edit. Old string — the existing `<ol>` followed by the rest of the Zone A header close + the entire Zone C `<section>`:

```html
                <ol class="subscription__order-steps" aria-label="Shipment progress">
                  <li class="subscription__order-step" data-state="done">
                    <span class="subscription__order-step-dot" aria-hidden="true"></span>
                    <span class="subscription__order-step-name">Ordered</span>
                  </li>
                  <li class="subscription__order-step" data-state="active">
                    <span class="subscription__order-step-dot" aria-hidden="true"></span>
                    <span class="subscription__order-step-name">Shipped</span>
                  </li>
                  <li class="subscription__order-step" data-state="future">
                    <span class="subscription__order-step-dot" aria-hidden="true"></span>
                    <span class="subscription__order-step-name">Out for delivery</span>
                  </li>
                  <li class="subscription__order-step" data-state="future">
                    <span class="subscription__order-step-dot" aria-hidden="true"></span>
                    <span class="subscription__order-step-name">Delivered</span>
                  </li>
                </ol>
              </header>
```

New string (wrap the `<ol>` in `.subscription__order-moment-progress` and append the moved-in tracking elements):

```html
                <div class="subscription__order-moment-progress">
                  <ol class="subscription__order-steps" aria-label="Shipment progress">
                    <li class="subscription__order-step" data-state="done">
                      <span class="subscription__order-step-dot" aria-hidden="true"></span>
                      <span class="subscription__order-step-name">Ordered</span>
                    </li>
                    <li class="subscription__order-step" data-state="active">
                      <span class="subscription__order-step-dot" aria-hidden="true"></span>
                      <span class="subscription__order-step-name">Shipped</span>
                    </li>
                    <li class="subscription__order-step" data-state="future">
                      <span class="subscription__order-step-dot" aria-hidden="true"></span>
                      <span class="subscription__order-step-name">Out for delivery</span>
                    </li>
                    <li class="subscription__order-step" data-state="future">
                      <span class="subscription__order-step-dot" aria-hidden="true"></span>
                      <span class="subscription__order-step-name">Delivered</span>
                    </li>
                  </ol>

                  <p class="subscription__order-progress-note" data-shipment-note hidden>
                    Carrier reported a delay · updated May 4
                  </p>

                  <span class="subscription__order-tracking-pending" data-tracking-pending hidden>
                    Tracking available when shipped
                  </span>

                  <a href="#" class="subscription__btn subscription__btn--soft" data-track-link>
                    Track package
                    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M3 7h8M8 4l3 3-3 3"/>
                    </svg>
                  </a>
                </div>
              </header>
```

**Step 1.4: Delete the now-empty Zone C section.**

Use Edit. Old string:

```html
              <!-- ZONE C — Tracking -->
              <section class="subscription__order-tracking-zone" aria-label="Tracking">
                <p class="subscription__order-progress-note" data-shipment-note hidden>
                  Carrier reported a delay · updated May 4
                </p>

                <div class="subscription__order-progress-meta">
                  <a href="/account-orders.html" class="subscription__order-id">
                    Order #OS-14392 · Placed May 2
                  </a>

                  <span class="subscription__order-tracking-pending" data-tracking-pending hidden>
                    Tracking available when shipped
                  </span>

                  <a href="#" class="subscription__btn subscription__btn--soft" data-track-link>
                    Track package
                    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M3 7h8M8 4l3 3-3 3"/>
                    </svg>
                  </a>
                </div>
              </section>

              <!-- ZONE D — Subscribe nudge -->
```

New string (drop the entire Zone C section, leave the Zone D comment):

```html
              <!-- ZONE D — Subscribe nudge -->
```

**Step 1.5: Verify markup loads without errors.**

- `preview_eval`: `window.location.href = '/account.html?state=otp'; 'navigated'`.
- `preview_eval`: `document.querySelector('.subscription__order').scrollIntoView({block:'start'}); window.scrollBy(0, -80); 'ok'`.
- `preview_console_logs` (level: error): expect zero entries.
- `preview_screenshot`: don't worry about visual yet — Track package + order link will render but with stale CSS positioning. Task 2 fixes alignment.

**Step 1.6: Confirm with the user before committing.**

Ask: "OK to commit Task 1 (markup restructure)?"

If yes:

```bash
git add account.html
git commit -m "restructure 'Arriving soon' card: fold Zone C into Zone A"
```

---

## Task 2: CSS — layout + nudge tint

**Files:**
- Modify: `assets/account/module-subscription.css`

**Step 2.1: Switch the moment header to `flex-start` alignment.**

Use Edit. Old string:

```css
.subscription__order-moment:has(.subscription__order-steps) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
}
```

New string:

```css
.subscription__order-moment:has(.subscription__order-steps) {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 40px;
}
```

**Step 2.2: Add the right-column wrapper rule.**

Use Edit. Find the existing block:

```css
.subscription__order-moment .subscription__order-steps {
  flex: 1 1 auto;
  max-width: 480px;
  min-width: 0;
}
```

Replace with:

```css
.subscription__order-moment-progress {
  flex: 1 1 auto;
  max-width: 480px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
}

.subscription__order-moment .subscription__order-steps {
  width: 100%;
}

.subscription__order-moment-progress .subscription__btn {
  align-self: flex-end;
}
```

**Step 2.3: Update the mobile rule inside the same `@media (max-width: 600px)` block to drop the now-stale `.subscription__order-steps max-width: none` (still useful, keep it) and ensure Track package stays right-aligned.**

Use Edit. Old string:

```css
@media (max-width: 600px) {
  .subscription__order-moment:has(.subscription__order-steps) {
    flex-direction: column;
    align-items: stretch;
    gap: 24px;
  }
  .subscription__order-moment .subscription__order-steps {
    max-width: none;
  }
}
```

New string (same content, plus a width override for the progress wrapper):

```css
@media (max-width: 600px) {
  .subscription__order-moment:has(.subscription__order-steps) {
    flex-direction: column;
    align-items: stretch;
    gap: 24px;
  }
  .subscription__order-moment-progress {
    max-width: none;
  }
}
```

**Step 2.4: Re-scope the Track package soft-button tint from the gone meta wrapper to the new progress wrapper.**

Use Edit. Old string:

```css
/* Track package button — light viridian wash to read as secondary to
   the primary "Subscribe & save" button in the nudge below. */
.subscription__order-progress-meta .subscription__btn--soft {
  background: var(--color-viridian-light);
}
```

New string:

```css
/* Track package button — light viridian wash to read as secondary to
   the primary "Subscribe & save" button in the nudge below. */
.subscription__order-moment-progress .subscription__btn--soft {
  background: var(--color-viridian-light);
}
```

**Step 2.5: Drop the `.subscription__order-progress-meta` flex row (the wrapper is gone) and its mobile counterpart, and drop the `.subscription__order-tracking-zone` padding entries (the zone is gone).**

Use Edit. Old string:

```css
.subscription__order-moment,
.subscription__order-items,
.subscription__order-tracking-zone,
.subscription__order-actions,
.subscription__order-nudge {
  padding: 24px 32px;
}

@media (max-width: 600px) {
  .subscription__order-moment,
  .subscription__order-items,
  .subscription__order-tracking-zone,
  .subscription__order-actions,
  .subscription__order-nudge {
    padding: 20px 20px;
  }
}
```

New string:

```css
.subscription__order-moment,
.subscription__order-items,
.subscription__order-actions,
.subscription__order-nudge {
  padding: 24px 32px;
}

@media (max-width: 600px) {
  .subscription__order-moment,
  .subscription__order-items,
  .subscription__order-actions,
  .subscription__order-nudge {
    padding: 20px 20px;
  }
}
```

**Step 2.6: Drop the now-stale `.subscription__order-progress-meta` flex row + sibling-margin rule + mobile column-flip.**

Use Edit. Old string:

```css
.subscription__order-progress-note:not([hidden]) + .subscription__order-progress-meta {
  margin-top: 12px;
}

/* Meta row */
.subscription__order-progress-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: var(--color-ink-2);
}
```

New string (delete both rules entirely):

```css
```

(Replace with an empty string — both rules go.)

Then find the mobile rule for the same meta wrapper. Old string:

```css
@media (max-width: 600px) {
  .subscription__order-progress-meta {
    align-items: flex-start;
    flex-direction: column;
  }
  .subscription__order-progress-meta .subscription__btn { align-self: flex-end; }
}
```

New string (delete entirely):

```css
```

**Step 2.7: Tint Zone D + drop its top border so the color edge is the divider.**

Use Edit. Old string:

```css
/* ============= Zone D — Subscribe nudge ============= */

.subscription__order-nudge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}
```

New string:

```css
/* ============= Zone D — Subscribe nudge ============= */

.subscription__order-nudge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  background: var(--color-viridian-light);
  border-top: 0;
}
```

(The `border-top: 0` overrides the global `.subscription__order > * + * { border-top: 1px solid var(--color-line-soft); }` for this last zone — the color shift carries the division.)

**Step 2.8: Verify in browser.**

Get the running server id:
- `preview_list` → use the `serverId` of the `dev` server (port 3010).

Then:
- `preview_eval`: `window.location.href = '/account.html?state=otp'; 'navigated'`
- `preview_eval`: `document.querySelector('.subscription__order').scrollIntoView({block:'start'}); window.scrollBy(0, -80); 'ok'`
- `preview_screenshot`. Expected: left column shows eyebrow / date / order link stacked; right column shows timeline / Track package (right-aligned, light viridian fill); Zone D below has light viridian background; Zone B (items) and the moment header remain on cream.
- `preview_inspect` on `.subscription__order-moment` with styles `["align-items", "justify-content"]`. Expected: `flex-start`, `space-between`.
- `preview_inspect` on `.subscription__order-nudge` with styles `["background-color", "border-top-width"]`. Expected: `rgb(220, 229, 223)`, `0px`.
- `preview_console_logs` (level: error): zero entries.

**Step 2.9: Confirm with the user before committing.**

Ask: "OK to commit Task 2 (CSS + nudge tint)?"

If yes:

```bash
git add assets/account/module-subscription.css
git commit -m "fold tracking into moment header; tint nudge light viridian"
```

---

## Task 3: Cross-state + responsive verification

**Files:** Verification only. Edit `assets/account/module-subscription.css` only if a regression surfaces.

**Step 3.1: Desktop — cycle through shipment states via direct attribute manipulation (URL params get stripped by serve).**

For each state, use `preview_eval` to set `data-shipment-state` + step states, then `preview_screenshot`. Expectations:

- `transit` (default): Shipped dot active, Track package visible (light viridian fill, right-aligned under timeline).
- `ordered`: Ordered dot active, Track package hidden, pending tracking line ("Tracking available when shipped") visible in its place under the timeline.
- `out-for-delivery`: third dot active, Track package visible.
- `delayed`: active dot turns amber, delay note ("Carrier reported a delay · updated May 4") appears between timeline and Track package, in amber.

Helper to switch state in the OTP block:

```js
(() => {
  const order = document.querySelector('[data-state-target="otp"] .subscription__order');
  const STATES = {
    ordered:           [0, 'active', 'future', 'future', 'future'],
    transit:           [1, 'done', 'active', 'future', 'future'],
    'out-for-delivery':[2, 'done', 'done', 'active', 'future'],
    delayed:           [1, 'done', 'active', 'future', 'future'],
  };
  const ship = 'transit'; // change this per call
  const [, ...steps] = STATES[ship];
  order.setAttribute('data-shipment-state', ship);
  order.querySelectorAll('.subscription__order-step').forEach((s, i) => s.setAttribute('data-state', steps[i]));
  return ship;
})()
```

**Step 3.2: Mobile (`preview_resize` → `mobile`, 375x812).**

- Reload, scroll to card, screenshot.
- Confirm Zone A stacks: left text group on top, right progress group below at full width.
- Confirm Track package stays right-aligned within its column.
- Confirm Zone D's light viridian background extends full card width.

**Step 3.3: Narrow viewport (`preview_resize` to 360x780).**

- Screenshot. Expect step labels wrap to two lines but no horizontal overflow. Order link and date wrap cleanly. Zone D nudge wraps its CTA below the text.

**Step 3.4: Subscription card variants (`?state=face`, `?state=hair`).**

The dev server strips query params, so set state via JS instead:

```js
(() => {
  const target = 'face'; // also test 'hair'
  document.querySelectorAll('[data-state-target]').forEach((el) => {
    const wants = (el.getAttribute('data-state-target') || '').trim().split(/\s+/);
    el.style.display = (wants.includes('all') || wants.includes(target)) ? '' : 'none';
  });
  document.body.setAttribute('data-state', target);
  return target;
})()
```

- Screenshot. Confirm the subscription card is untouched: moment header still stacked vertically (no flex two-column applied because of the `:has(.subscription__order-steps)` scope), no Zone D tint applied to the subscription card variants since they don't have a `.subscription__order-nudge` element of their own. (Verify by inspecting — if a subscription card DOES contain `.subscription__order-nudge` elsewhere, expect the tint there too; this is acceptable per design.)

**Step 3.5: Reset viewport.**

- `preview_resize` with `preset: desktop`.

**Step 3.6: If any tweaks needed, edit, re-verify, and confirm before committing.**

```bash
git add assets/account/module-subscription.css
git commit -m "polish merged Zone A at narrow viewports"
```

(Skip if no tweaks.)

---

## Done criteria

- Order link sits directly below "May 6" in the left column.
- Track package button sits directly below the 4-step timeline in the right column, right-aligned, with the light-viridian wash unchanged.
- The delay note and pending tracking line both render in the right column at the correct moments.
- Subscribe nudge (Zone D) has `--color-viridian-light` background and no top border (color edge is the divider).
- All four shipment states (`transit`, `ordered`, `out-for-delivery`, `delayed`) render correctly.
- Mobile (≤600px) stacks the moment header vertically; Track package stays right-aligned.
- Subscription card variants (`face`, `hair`) are unaffected.
- Zero console errors across any state.

## Out of scope

- Renaming `.subscription__order-progress-note`, `.subscription__order-id`, or other classes that survived the move.
- Any change to items zone, timeline step rules, or the active-subscription card.
- Real-data wiring — order id, dates, and tracking number are still hardcoded per demo behavior.
