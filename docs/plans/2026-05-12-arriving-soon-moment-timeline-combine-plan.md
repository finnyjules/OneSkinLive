# "Arriving soon" — combine moment + timeline (side-by-side) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the "Arriving soon" card's top zone a two-column layout — arrival headline on the left, horizontal 4-step timeline on the right — and split the old timeline-zone tracking row into its own zone below items.

**Architecture:** Markup move only (no new components): the `<ol class="subscription__order-steps">` relocates from inside `.subscription__order-progress` (Zone C) into `<header class="subscription__order-moment">` (Zone A). Zone C shrinks to just the tracking row + delay note. CSS turns `.subscription__order-moment` into a flex row with `align-items: center`, with a mobile stack rule below 600px. All existing `data-shipment-state` selectors keep working because they target the card root, not the zone wrapper.

**Tech Stack:** HTML, CSS (vanilla, custom properties), no JS changes. Static file served by `npx serve` on port 3010 (`.claude/launch.json` → `dev`). Verified via Claude Preview MCP — server already running.

**Design doc:** [2026-05-12-arriving-soon-moment-timeline-combine-design.md](2026-05-12-arriving-soon-moment-timeline-combine-design.md)

---

## Pre-flight: project conventions

- **Indent:** 2 spaces.
- **Class naming:** BEM-ish dashes. Keep existing class names; only restructure markup. Inside `.subscription__order-moment` add a wrapper `.subscription__order-moment-text` for the left column so the existing eyebrow/date/meta rules continue to target the same elements unchanged.
- **Design tokens:** Reuse `--color-line-soft`, `--color-viridian`, `--color-ink`, etc. No new tokens.
- **Verification:** Use Claude Preview MCP — `preview_eval` to navigate (`/account.html?state=otp`), `preview_screenshot` for visual proof, `preview_console_logs` for errors. Server already running on `:3010`; do not start a new one.
- **Commits:** Ask the user "OK to commit Task X?" before each commit step.

---

## Task 1: Restructure the OTP card markup

**Files:**
- Modify: `account.html` lines ~268–384 — the OTP block's `<article class="subscription__order">`

**Step 1.1: Read the current OTP article block to confirm boundaries.**

Read `account.html` lines 266–400. Confirm the OTP article runs from
`<article class="subscription__order" data-shipment-state="transit" data-items-count="3">` (line ~266) through its closing `</article>` (line ~399). Note the exact indentation (10 spaces for the `<article>` open tag in this file).

**Step 1.2: Edit Zone A — wrap the existing eyebrow/date/meta in a left-column div, then append the timeline `<ol>` as the right column.**

Use Edit. Old string is the current Zone A header block (4 lines + meta):

```html
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
```

New string:

```html
            <!-- ZONE A — Arrival moment + shipment timeline -->
            <header class="subscription__order-moment">
              <div class="subscription__order-moment-text">
                <p class="subscription__order-eyebrow">Arriving Tuesday</p>
                <p class="subscription__order-date">May 6</p>
                <p class="subscription__order-meta">
                  <span>Order #OS-14392</span>
                  <span class="subscription__card-meta-sep" aria-hidden="true"></span>
                  <span>Placed May 2</span>
                </p>
              </div>

              <ol class="subscription__order-steps" aria-label="Shipment progress">
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
            </header>
```

**Step 1.3: Edit Zone C — replace the old `<section class="subscription__order-progress">` with a slim tracking-only zone.**

The old Zone C contained the `<ol>` (now moved), the delay note, and a meta row. The delay note + meta row stay; the `<ol>` is gone. Rename the wrapping `<section>` to `.subscription__order-tracking-zone` to reflect its new purpose. Inside, keep the same internal structure for tracking — its inner selectors already exist (`.subscription__order-tracking`, `.subscription__order-tracking-pending`, `.subscription__order-track-link`-equivalent button, `.subscription__order-copy`).

Use Edit. Old string is the full Zone C section:

```html
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
                  <a href="#" class="subscription__btn subscription__btn--soft" data-track-link>
                    Track package
                    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M3 7h8M8 4l3 3-3 3"/>
                    </svg>
                  </a>
                </div>
              </section>
```

New string (delete the `<ol>` block, keep note + meta; rename wrapper):

```html
              <!-- ZONE C — Tracking -->
              <section class="subscription__order-tracking-zone" aria-label="Tracking">
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
                  <a href="#" class="subscription__btn subscription__btn--soft" data-track-link>
                    Track package
                    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M3 7h8M8 4l3 3-3 3"/>
                    </svg>
                  </a>
                </div>
              </section>
```

**Step 1.4: Verify markup loads with no errors.**

- `preview_eval`: `window.location.href = '/account.html?state=otp'; 'navigated'`.
- `preview_console_logs`: confirm no JS errors (the items-toggle and copy-tracking handlers still resolve since their hooks are unchanged).
- `preview_screenshot`: don't worry about visual yet — the timeline will currently render full-width inside the moment header, below the meta line. That's expected; CSS in Task 2 will fix it.

**Step 1.5: Confirm with the user before committing.**

Ask: "OK to commit Task 1 (markup restructure)?"

If yes:

```bash
git add account.html
git commit -m "restructure 'Arriving soon' card: move timeline into moment header"
```

---

## Task 2: CSS — two-column moment header + tracking zone padding

**Files:**
- Modify: `assets/account/module-subscription.css`

**Step 2.1: Read the current `.subscription__order-moment` rules to confirm scope of change.**

Read `assets/account/module-subscription.css` lines 130–170. The existing block has `.subscription__order-eyebrow`, `.subscription__order-date`, `.subscription__order-meta` — none of these target `.subscription__order-moment` directly with layout rules. We're free to add new flex rules to the wrapper without breaking the inner styles.

**Step 2.2: Add the new two-column moment header rules.**

Use Edit. Find the existing `.subscription__order-meta` rule (around line 160) and insert the new rules **immediately before** it (so the moment-header rules sit above the inner-element rules they wrap). Old string:

```css
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

New string (prepend new rules, keep `.subscription__order-meta` unchanged below):

```css
.subscription__order-moment {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
}

.subscription__order-moment-text {
  flex: 0 0 auto;
  min-width: 0;
}

.subscription__order-moment .subscription__order-steps {
  flex: 1 1 auto;
  max-width: 480px;
  min-width: 0;
}

@media (max-width: 600px) {
  .subscription__order-moment {
    flex-direction: column;
    align-items: stretch;
    gap: 24px;
  }
  .subscription__order-moment .subscription__order-steps {
    max-width: none;
  }
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

**Step 2.3: Update Zone C — keep the existing `.subscription__order-progress-meta` rules; just ensure the new `.subscription__order-tracking-zone` wrapper inherits the same padding as the other zones.**

Find the existing `.subscription__order-moment, .subscription__order-items, .subscription__order-progress, .subscription__order-nudge` rule (the zone-padding rule, near the top of the OTP CSS block). Use Edit. Old string:

```css
.subscription__order-moment,
.subscription__order-items,
.subscription__order-progress,
.subscription__order-nudge {
  padding: 24px 32px;
}
```

New string (swap `.subscription__order-progress` → `.subscription__order-tracking-zone`):

```css
.subscription__order-moment,
.subscription__order-items,
.subscription__order-tracking-zone,
.subscription__order-nudge {
  padding: 24px 32px;
}
```

Then find the matching mobile rule:

```css
@media (max-width: 600px) {
  .subscription__order-moment,
  .subscription__order-items,
  .subscription__order-progress,
  .subscription__order-nudge {
    padding: 20px 20px;
  }
}
```

Replace with:

```css
@media (max-width: 600px) {
  .subscription__order-moment,
  .subscription__order-items,
  .subscription__order-tracking-zone,
  .subscription__order-nudge {
    padding: 20px 20px;
  }
}
```

**Step 2.4: Drop the `margin-top: 18px` on `.subscription__order-progress-meta` (was spacing it from the dots above; now it sits at the top of the tracking zone, so the zone padding handles spacing).**

Find:

```css
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
```

Replace with:

```css
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

Same for `.subscription__order-progress-note` — drop its `margin-top: 18px` (it's now the first element in the tracking zone when delayed, and the zone's `padding-top` handles spacing). Find:

```css
/* Note line (delay) */
.subscription__order-progress-note {
  margin-top: 18px;
  font-size: 13px;
  color: #b85c14;
}
```

Replace with:

```css
/* Note line (delay) */
.subscription__order-progress-note {
  font-size: 13px;
  color: #b85c14;
}
```

When the note is visible (delayed state), add a margin-bottom so it doesn't crowd the meta row below. Add immediately after:

```css
.subscription__order-progress-note:not([hidden]) + .subscription__order-progress-meta {
  margin-top: 12px;
}
```

**Step 2.5: Verify in browser.**

- `preview_eval`: `window.location.reload(); 'reloading'`.
- `preview_screenshot`. Expected: header zone now shows headline on the left and the 4-step horizontal timeline on the right; tracking zone is its own band below items.
- `preview_inspect` on `.subscription__order-moment` to confirm `display: flex` and `align-items: center` resolved.

**Step 2.6: Confirm with the user before committing.**

Ask: "OK to commit Task 2 (CSS layout)?"

If yes:

```bash
git add assets/account/module-subscription.css
git commit -m "lay out 'Arriving soon' moment + timeline side-by-side"
```

---

## Task 3: Cross-state + responsive verification

**Files:** None edited unless issues surface — this task is verification only.

**Step 3.1: Desktop — cycle through shipment states.**

- `preview_resize` to `desktop` (1280×800).
- For each `?ship=<state>` (`transit`, `ordered`, `out-for-delivery`, `delayed`), `preview_eval` to navigate and `preview_screenshot`:
  - `transit` — Shipped dot pulses; tracking visible with carrier + number.
  - `ordered` — Ordered dot pulses; tracking zone shows the "Tracking available when shipped" pending line; Track package hidden.
  - `out-for-delivery` — third dot pulses; tracking unchanged.
  - `delayed` — active dot turns amber; the delay note appears in the tracking zone.
- `preview_console_logs` (`level: error`): expect zero entries.

**Step 3.2: Mobile — `preview_resize` to `mobile` (375×812). Reload `/account.html?state=otp`.**

- `preview_screenshot`. Expected: headline stacks above the timeline at full width; step labels wrap to two lines as before; tracking row stacks (number above the Track package button).

**Step 3.3: 360px narrow viewport.**

- `preview_resize` to 360×780.
- `preview_screenshot`. Confirm timeline still fits without overflow; step labels truncate gracefully (existing `<360px` rule from prior task still applies if present; otherwise note any collision and add ellipsis rules).

**Step 3.4: Keyboard pass.**

- `preview_eval`: tab through the card — items toggle, copy button, Track package, Subscribe & save. Confirm each receives a visible focus ring and the activation path still works.

**Step 3.5: Reset viewport.**

- `preview_resize` with `preset: desktop`.

**Step 3.6: If any tweaks needed, edit and re-verify, then ask the user before committing.**

Likely small fixes only — e.g. timeline `max-width` adjust, mobile gap. Commit message:

```bash
git add assets/account/module-subscription.css
git commit -m "polish 'Arriving soon' moment-timeline at narrow viewports"
```

(Skip if no tweaks needed.)

---

## Done criteria

- Top zone of the "Arriving soon" card renders as headline (left) + horizontal 4-step timeline (right) on desktop.
- Mobile (≤600px) stacks them vertically with no overflow.
- All four shipment states (`transit`, `ordered`, `out-for-delivery`, `delayed`) render correctly.
- Items zone, subscribe nudge, and copy/track interactions unchanged.
- No console errors across any state.

## Out of scope

- Any change to items zone, nudge zone, or the active-subscription card above.
- Renaming `.subscription__order-progress-meta` / `.subscription__order-progress-note` (they live in the tracking zone now but the names still read fine; renaming would touch JS hooks for marginal gain — YAGNI).
- Real-data wiring — timeline content + dates still hardcoded per existing demo behavior.
