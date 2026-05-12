# "Arriving soon" — trim density — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reduce the OTP ("Arriving soon") card's default in-transit state from ~13 visible text elements to ~7 by trimming the timeline, the moment header, and the tracking row — per the design at [2026-05-12-arriving-soon-trim-density-design.md](2026-05-12-arriving-soon-trim-density-design.md).

**Architecture:** Pure markup + CSS refactor with a small JS adjustment. No new components, no new states. The four trims are independent and committable on their own, ordered from safest to most touchy. The OTP card lives in `account.html` lines 260–401; styles in `assets/account/module-subscription.css`; behavior in `assets/account/module-subscription.js`.

**Tech Stack:** Static HTML prototype, vanilla CSS (BEM-ish), vanilla JS. Verification is in-browser at `account.html?state=otp&ship=...` — no test framework. Each task ends with a manual visual check + commit.

---

### Task 1: Drop per-step dates from the timeline

**Files:**
- Modify: `account.html:284, 289, 294, 299` — remove the four `<span class="subscription__order-step-date">…</span>` lines
- Modify: `assets/account/module-subscription.css:395–398` — delete the `.subscription__order-step-date` rule
- Modify: `assets/account/module-subscription.css:402–403` — delete the mobile rule for `.subscription__order-step-date` (leave `.subscription__order-step-name` intact)

**Step 1: Remove the four date spans in `account.html`**

Each of the four `<li class="subscription__order-step">` items has a trailing `<span class="subscription__order-step-date">…</span>`. Delete that span (one line per step) and the trailing whitespace, leaving just the dot + name.

The expected result for each step:

```html
<li class="subscription__order-step" data-state="done">
  <span class="subscription__order-step-dot" aria-hidden="true"></span>
  <span class="subscription__order-step-name">Ordered</span>
</li>
```

(Same pattern for Shipped / Out for delivery / Delivered.)

**Step 2: Remove the CSS rule for the now-unused class**

In `assets/account/module-subscription.css`, delete the block at ~395:

```css
.subscription__order-step-date {
  font-size: 12px;
  color: var(--color-ink-3);
  line-height: 1.25;
}
```

And in the `@media (max-width: 600px)` block at ~402, the rule currently reads:

```css
.subscription__order-step-name,
.subscription__order-step-date { font-size: 11px; }
```

Change to just:

```css
.subscription__order-step-name { font-size: 11px; }
```

**Step 3: Verify in browser**

Reload `account.html?state=otp`. Expected:
- Each of the 4 dots in Zone A's timeline has a single label below it (`Ordered`, `Shipped`, `Out for delivery`, `Delivered`).
- No second line of "May 2 / May 3 / Expected May 6 / —".
- The headline ("Arriving Tuesday / May 6") on the left is unchanged.
- Spacing under the dots looks balanced (no extra gap where the dates used to be — check vertical rhythm).

Also check `?ship=ordered`, `?ship=out-for-delivery`, `?ship=delayed` — every state should still pulse / amber / etc. correctly on the right dot.

Resize to 600px and 375px — timeline labels should not collide or wrap awkwardly.

**Step 4: Commit**

```bash
git add account.html assets/account/module-subscription.css
git commit -m "$(cat <<'EOF'
trim 'Arriving soon' timeline: drop per-step dates

Each timeline step now shows just its name (Ordered / Shipped / etc.).
The headline already communicates expected arrival; per-step dates were
redundant past info on completed steps and noise on future steps.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Remove the moment-header meta line (OTP card only)

**Files:**
- Modify: `account.html:273–277` — remove the `<p class="subscription__order-meta">` block inside the OTP card's `.subscription__order-moment-text`

**Important:** `.subscription__order-meta` is also used at `account.html:138` and `account.html:204` (the subscription card variant above the OTP block). **Do NOT touch those.** And **do NOT delete the CSS rule** at `module-subscription.css:192` — it's still in use elsewhere.

**Step 1: Remove the OTP card's meta block**

Inside the `<header class="subscription__order-moment">` (the one whose enclosing `<article>` has `data-shipment-state="transit"`), delete lines 273–277:

```html
<p class="subscription__order-meta">
  <span>Order #OS-14392</span>
  <span class="subscription__card-meta-sep" aria-hidden="true"></span>
  <span>Placed May 2</span>
</p>
```

The `<div class="subscription__order-moment-text">` now contains only the eyebrow + date.

**Step 2: Verify in browser**

Reload `account.html?state=otp`. Expected:
- Zone A left column shows only "Arriving Tuesday" + "May 6". No order # / placed date.
- The subscription card above the OTP block (the active subscription summary) still shows its meta line — unchanged.

**Step 3: Commit**

```bash
git add account.html
git commit -m "$(cat <<'EOF'
trim 'Arriving soon' moment header: drop order # / placed date

Order # and placed date will move to a small order-details link in the
tracking row (Task 3). The moment header now carries only the arrival
eyebrow + date, landing harder on the headline.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Restructure Zone C — single CTA + Copy link + Order details link

This is the meatiest task. We rewrite the tracking zone's `.subscription__order-progress-meta` row from three visible clusters (carrier+number+copy / pending span / Track package) down to one clean row: `[Track package CTA] [Copy tracking number link] [Order #… link]`.

**Files:**
- Modify: `account.html:358–386` — rewrite the contents of `<section class="subscription__order-tracking-zone">`
- Modify: `assets/account/module-subscription.css:467–516` — replace `.subscription__order-tracking` / `.subscription__order-tracking-number` / `.subscription__order-copy` styles with new `.subscription__order-copy-link` and `.subscription__order-id` styles
- Modify: `assets/account/module-subscription.css:527–529` — update the pre-ship hide rule
- Modify: `assets/account/module-subscription.js:71–85` — read tracking number from a `dataset` attribute instead of `[data-tracking-number]`'s `textContent`

**Step 1: Rewrite the markup**

Replace the entire body of `<section class="subscription__order-tracking-zone" aria-label="Tracking">` (account.html lines 358–386, between the opening `<section>` tag and its closing `</section>`) with:

```html
<p class="subscription__order-progress-note" data-shipment-note hidden>
  Carrier reported a delay · updated May 4
</p>

<div class="subscription__order-progress-meta">
  <a href="#" class="subscription__btn subscription__btn--soft" data-track-link>
    Track package
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M3 7h8M8 4l3 3-3 3"/>
    </svg>
  </a>

  <button
    type="button"
    class="subscription__order-copy-link"
    data-copy-tracking
    data-tracking-number="1Z999AA10123456784"
    aria-label="Copy tracking number"
  >
    <span>Copy tracking number</span>
    <span class="subscription__order-copy-feedback" data-copy-feedback aria-live="polite"></span>
  </button>

  <span class="subscription__order-tracking-pending" data-tracking-pending hidden>
    Tracking available when shipped
  </span>

  <a href="/account-orders.html" class="subscription__order-id">
    Order #OS-14392 · Placed May 2
  </a>
</div>
```

Notes:
- The hidden `data-shipment-note` block is unchanged.
- `[data-track-link]` keeps the same class + structure so existing button styling (light-viridian soft button) continues to work.
- The copy control becomes a text button, not an icon button. It keeps `[data-copy-tracking]`, gains `data-tracking-number="…"`, retains `aria-label`, and still contains the `[data-copy-feedback]` live region.
- `[data-tracking-pending]` is preserved verbatim (still hidden by default, still shown by the pre-ship CSS rule that the next step updates).
- The new `.subscription__order-id` is an anchor pointing to the existing order history page.

**Step 2: Update the CSS**

In `assets/account/module-subscription.css`, **delete** lines 467–516 (the entire block starting `.subscription__order-tracking {` through the end of the `.subscription__order-copy-feedback` rule). These styles target elements that no longer exist.

In their place, add:

```css
/* Zone C — tracking row text controls */

.subscription__order-copy-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  font-size: 13px;
  color: var(--color-ink-2);
  cursor: pointer;
  position: relative;
}

.subscription__order-copy-link > span:first-child {
  text-decoration: underline;
  text-decoration-color: rgba(0,0,0,0.18);
  text-underline-offset: 3px;
  transition: text-decoration-color 0.18s ease;
}

.subscription__order-copy-link:hover > span:first-child,
.subscription__order-copy-link:focus-visible > span:first-child {
  text-decoration-color: currentColor;
}

.subscription__order-copy-feedback:not(:empty) {
  color: var(--color-viridian);
  font-size: 12px;
  font-weight: 500;
}

.subscription__order-id {
  font-size: 13px;
  color: var(--color-ink-3);
  text-decoration: underline;
  text-decoration-color: rgba(0,0,0,0.12);
  text-underline-offset: 3px;
  transition: color 0.18s ease, text-decoration-color 0.18s ease;
  margin-left: auto;  /* push to the end of the row on wide */
}

.subscription__order-id:hover,
.subscription__order-id:focus-visible {
  color: var(--color-ink);
  text-decoration-color: currentColor;
}

@media (max-width: 600px) {
  .subscription__order-id {
    margin-left: 0;
    flex-basis: 100%;  /* drops to its own line under the CTA + copy link */
  }
}
```

Then **update the pre-ship hide rule** at lines 527–529. It currently reads:

```css
.subscription__order[data-shipment-state="ordered"] [data-tracking],
.subscription__order[data-shipment-state="ordered"] [data-track-link] {
  display: none;
}
```

`[data-tracking]` no longer exists in the markup. Replace the selector list with:

```css
.subscription__order[data-shipment-state="ordered"] [data-track-link],
.subscription__order[data-shipment-state="ordered"] [data-copy-tracking] {
  display: none;
}
```

(The pending span's reveal rule a few lines below should already use `[data-tracking-pending]` — verify it does and leave it unchanged.)

**Step 3: Update the JS to read the tracking number from a data attribute**

Open `assets/account/module-subscription.js`. The current copy handler (lines 70–85) reads:

```js
const copyBtn = order.querySelector('[data-copy-tracking]');
const trackingNumber = order.querySelector('[data-tracking-number]');
const feedback = order.querySelector('[data-copy-feedback]');
if (copyBtn && trackingNumber && feedback) {
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(trackingNumber.textContent.trim());
      ...
```

Replace with:

```js
const copyBtn = order.querySelector('[data-copy-tracking]');
const feedback = order.querySelector('[data-copy-feedback]');
if (copyBtn && feedback) {
  copyBtn.addEventListener('click', async () => {
    const number = (copyBtn.dataset.trackingNumber || '').trim();
    if (!number) return;
    try {
      await navigator.clipboard.writeText(number);
      feedback.textContent = 'Copied';
      clearTimeout(copyBtn.__timer);
      copyBtn.__timer = setTimeout(() => { feedback.textContent = ''; }, 1400);
    } catch (_) {
      feedback.textContent = 'Press ⌘C';
    }
  });
}
```

(The `[data-tracking-number]` query goes away — the number now lives on the button itself.)

**Step 4: Verify default state**

Reload `account.html?state=otp`. Expected:
- Zone C shows one row: `[Track package →] [Copy tracking number] … [Order #OS-14392 · Placed May 2]`.
- The order-id link sits at the far right on desktop (pushed by `margin-left: auto`).
- No carrier name, no visible tracking number.
- The Track package button still has its light-viridian wash.
- The order-id link has a subtle underline.

**Step 5: Verify pre-ship state**

Reload `account.html?state=otp&ship=ordered`. Expected:
- Track package CTA hidden.
- Copy tracking number link hidden.
- "Tracking available when shipped" pending line visible in its place.
- Order #OS-14392 · Placed May 2 link still visible.

**Step 6: Verify delayed state**

Reload `account.html?state=otp&ship=delayed`. Expected:
- Amber delay note "Carrier reported a delay · updated May 4" visible above the row.
- Track package CTA still reads "Track package" (no carrier name).
- Copy + Order #… still present.
- Active dot in the timeline shows amber overlay.

**Step 7: Verify the copy interaction**

Click "Copy tracking number".
Expected:
- Clipboard now contains `1Z999AA10123456784`. Verify by pasting somewhere.
- The inline feedback shows "Copied" in viridian for ~1.4 seconds, then clears.
- If clipboard access is denied (rare; usually only in non-HTTPS iframes), feedback shows "Press ⌘C".

**Step 8: Verify keyboard + mobile**

Tab through the card: Track package, Copy tracking number, Order #… should all receive a visible focus ring (the existing button focus + new `:focus-visible` underline darken should both show).

Resize to 375px. Expected: the order-id link drops to its own line under the CTA + copy link (via `flex-basis: 100%` mobile override). The CTA stays full-width-ish (existing mobile rule `.subscription__order-progress-meta .subscription__btn { align-self: flex-end; }` may need to be re-tested — if it looks off, the next task can adjust).

**Step 9: Commit**

```bash
git add account.html assets/account/module-subscription.css assets/account/module-subscription.js
git commit -m "$(cat <<'EOF'
collapse 'Arriving soon' tracking row to single CTA + secondary links

Replace the visible carrier+number+copy-icon cluster with:
- Track package CTA (unchanged, generic — no carrier name baked in)
- Copy tracking number text link (was an icon button)
- Order #… · Placed … link to /account-orders.html (was a meta line
  inside the moment header)

The tracking number moves from element textContent to a data attribute
on the copy button, so we can drop the visible number element entirely.
The pre-ship hide rule updates to target the new selectors.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Cross-state + density sanity pass

**Files:** none (verification only) — or small spacing tweaks to `assets/account/module-subscription.css` if any of the checks below fail.

**Step 1: Cycle every shipment state**

Visit each in turn and confirm the card reads correctly:

- `account.html?state=otp` (default, transit) — dot pulse on Shipped; all three Zone C links present.
- `account.html?state=otp&ship=ordered` — pending line replaces CTA + copy; order-id still present.
- `account.html?state=otp&ship=transit` — same as default.
- `account.html?state=otp&ship=out-for-delivery` — dot pulse on Out for delivery.
- `account.html?state=otp&ship=delayed` — amber dot + amber delay note above the row.

**Step 2: Item count variants**

- `account.html?state=otp&items=1` — Zone B collapses to a single item with no show/hide affordance; nudge text updates; rest of the card unchanged.
- Default (3 items) — Zone B toggle works.

**Step 3: Element count check**

Eyeball the default state and count visible text elements. Expected (excluding hidden states and SVGs):

1. "Arriving Tuesday"
2. "May 6"
3. Step names ×4 (Ordered, Shipped, Out for delivery, Delivered) — counted as one group, but each is its own label
4. Items thumb cluster summary line ("3 items · $215.00")
5. Items toggle label ("Show items")
6. "Track package"
7. "Copy tracking number"
8. "Order #OS-14392 · Placed May 2"
9. Nudge text ("Make it a routine — save 15% on every shipment.")
10. "Subscribe & save"

That's ~7 distinct text *moments* (the 4 step names read as one timeline gestalt; the nudge is its own zone). The before-state was ~13 distinct moments. ✓

**Step 4: Visual rhythm check**

Compare the trimmed card to the previous commits at `git show 01cbfd2:account.html` (the prior version) if you want a side-by-side feel. Look for:
- The moment header (Zone A) feels "settled" — no longer top-heavy from the lost meta row?
- Zone B (items) doesn't feel like it's floating because the row above shrank? If it does, consider tightening the divider padding (currently 24px / 32px from line 106).
- Zone C row alignment — is the order-id link visually anchored to the row, or does it look orphaned?

If any of the above feels off, adjust spacing in this task and commit as a polish pass:

```bash
git add assets/account/module-subscription.css
git commit -m "$(cat <<'EOF'
polish 'Arriving soon' card spacing after density trim

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

**Step 5: No-commit if nothing needs adjustment** — Task 4 is a check-and-confirm pass, not always a code change.

---

## Rollback

Each task is its own commit and is independently revertible. If Task 3 ships and reads poorly, `git revert <task-3-sha>` restores the prior tracking row while keeping Tasks 1 + 2's trims.

## Out of scope (do not touch)

- The active-subscription card above the OTP block (uses the same CSS file but different markup).
- Zone D (Subscribe & save nudge) — flagged in the design for a future iteration.
- Items zone — collapsible behavior unchanged.
- Adding a per-order detail page — the link points at the existing list view at `/account-orders.html`.
