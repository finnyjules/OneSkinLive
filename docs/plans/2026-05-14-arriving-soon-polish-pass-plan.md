# "Arriving soon" — polish pass Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Three small visual polish changes on the OTP card: push the Delivered dot to the right edge of the timeline, demote Track package to a pure text ghost CTA, add breathing room between "May 6" and the order link.

**Architecture:** All three are scoped CSS adjustments plus a single HTML class swap on the Track package link. No new components, no markup restructure. The right-edge timeline change is achieved by setting `align-items: flex-end` on the last `<li>` and overriding the connector pseudo-element's `right` so it lands on the new dot position. The ghost CTA is a new `.subscription__btn--ghost` modifier (transparent background, no padding, no height, just viridian text + arrow).

**Tech Stack:** HTML, CSS (vanilla, custom properties), no JS changes. Static file served by `npx serve` on port 3010 (`.claude/launch.json` → `dev`). Server already running.

**Design doc:** [2026-05-14-arriving-soon-polish-pass-design.md](2026-05-14-arriving-soon-polish-pass-design.md)

---

## Pre-flight: project conventions

- **Indent:** 2 spaces.
- **Class naming:** BEM-ish dashes. Add `.subscription__btn--ghost` as a new modifier alongside existing `--primary` / `--soft`.
- **Tokens:** Reuse `--color-viridian`, `--color-ink`.
- **Verification:** Use Claude Preview MCP. Server already running on `:3010` (id from `preview_list`). URL params get stripped, so flip shipment states via JS (`setAttribute` on `[data-shipment-state]`) for verification.
- **Commit:** Single commit at the end (one cohesive polish pass).

---

## Task 1: Apply all three polish changes

**Files:**
- Modify: `assets/account/module-subscription.css`
- Modify: `account.html`

### Step 1.1: Add the `.subscription__btn--ghost` modifier.

Open `assets/account/module-subscription.css`. Find the `.subscription__btn--soft:hover` rule (line ~69) and the comment block that follows (lines ~71-75). Use Edit. Old string:

```css
.subscription__btn--soft:hover { background: var(--color-viridian); color: var(--color-white); }

/* Inside the order card, soft buttons use the light-viridian wash so they
   read as secondary (clearly distinct from the ink primary). */
.subscription__order .subscription__btn--soft {
  background: var(--color-viridian-light);
}
```

New string (add `--ghost` rules after the `--soft` rules):

```css
.subscription__btn--soft:hover { background: var(--color-viridian); color: var(--color-white); }

/* Inside the order card, soft buttons use the light-viridian wash so they
   read as secondary (clearly distinct from the ink primary). */
.subscription__order .subscription__btn--soft {
  background: var(--color-viridian-light);
}

/* Ghost CTA — pure viridian text + arrow, no fill, no padding. Demotes the
   action visually so the primary (Subscribe & save) reads as the headline. */
.subscription__btn--ghost {
  background: transparent;
  color: var(--color-viridian);
  padding: 0;
  height: auto;
  font-weight: 500;
}

.subscription__btn--ghost:hover { color: var(--color-ink); }
```

### Step 1.2: Add `align-items: flex-end` for the last timeline step.

Same file. Find the `.subscription__order-step` rule (around line ~342). Use Edit. Old string:

```css
.subscription__order-step {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  position: relative;
  padding-right: 8px;
}
```

New string (append a `:last-child` override rule immediately after):

```css
.subscription__order-step {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  position: relative;
  padding-right: 8px;
}

/* Pin the final step (Delivered) to the right edge of its grid cell so it
   sits directly above Track package's right edge. */
.subscription__order-step:last-child {
  align-items: flex-end;
  padding-right: 0;
}
```

(`padding-right: 0` because the cell's 8px right padding is no longer needed when the dot/label hug the right edge.)

### Step 1.3: Adjust the connector going INTO the last step.

Same file. The connector `::before` on each `<li>` uses `right: calc(100% - 6px)` to land at "li's left edge + 6px" (= dot center if the dot is at flex-start). For the last `<li>`, the dot is now at the right edge, so the connector needs `right: 6px` (= li's right edge - 6px = new dot center).

Use Edit. Find the connector base rule (~line 369):

Old string:

```css
/* Active or future predecessor → dotted ink-3 connector. */
.subscription__order-step[data-state="future"] + .subscription__order-step::before,
.subscription__order-step[data-state="active"] + .subscription__order-step::before {
  background: transparent;
  border-top: 2px dotted var(--color-ink-3);
  height: 0;
}
```

New string (append the last-child override):

```css
/* Active or future predecessor → dotted ink-3 connector. */
.subscription__order-step[data-state="future"] + .subscription__order-step::before,
.subscription__order-step[data-state="active"] + .subscription__order-step::before {
  background: transparent;
  border-top: 2px dotted var(--color-ink-3);
  height: 0;
}

/* Last step's connector lands at the right-edge dot, not the cell's left. */
.subscription__order-step:last-child::before {
  right: 6px;
}
```

### Step 1.4: Add spacing between "May 6" and the order link.

Same file. Find the `.subscription__order-id` rule (around line ~457). Use Edit. Old string:

```css
.subscription__order-id {
  font-size: 13px;
  color: var(--color-ink-3);
  text-decoration: underline;
  text-decoration-color: var(--color-line);
  text-underline-offset: 3px;
  transition: color 0.18s ease, text-decoration-color 0.18s ease;
}
```

New string (add `margin-top` as the first declaration):

```css
.subscription__order-id {
  margin-top: 12px;
  font-size: 13px;
  color: var(--color-ink-3);
  text-decoration: underline;
  text-decoration-color: var(--color-line);
  text-underline-offset: 3px;
  transition: color 0.18s ease, text-decoration-color 0.18s ease;
}
```

### Step 1.5: Swap Track package's class in HTML.

Open `/Users/julien/Documents/OneSkinLive/account.html`. Find the Track package link in the OTP block (around line ~306). Use Edit. Old string:

```html
                  <a href="#" class="subscription__btn subscription__btn--soft" data-track-link>
                    Track package
```

New string:

```html
                  <a href="#" class="subscription__btn subscription__btn--ghost" data-track-link>
                    Track package
```

### Step 1.6: Verify in browser.

- `mcp__Claude_Preview__preview_list` → get serverId.
- `preview_eval`: `window.location.href = '/account.html?state=otp'; 'navigated'`
- `preview_eval`: `document.querySelector('.subscription__order').scrollIntoView({block:'start'}); window.scrollBy(0, -80); 'ok'`
- `preview_screenshot`. Expected:
  - Delivered dot at the right edge of the timeline, directly above Track package (visually).
  - Track package: viridian text + arrow, no fill, no border.
  - "Order #OS-14392 · Placed May 2" sits with breathing room below "May 6".
- Cycle the four shipment states via JS (`order.setAttribute('data-shipment-state', ...)` + update step `data-state`). Confirm:
  - `ordered`: pending tracking line renders, Track package hidden, last dot (Delivered) still at right edge.
  - `delayed`: delay note visible, amber active dot, Delivered at right.
  - `out-for-delivery`: third dot active, Delivered hollow at right edge.
- `preview_inspect` on `.subscription__btn--ghost`: `background-color: rgba(0,0,0,0)` (transparent), `padding: 0px`.
- `preview_console_logs` (level: error): zero entries.

### Step 1.7: Mobile.

- `preview_resize` to `mobile` (375x812).
- Reload, scroll to card, screenshot. Confirm:
  - Timeline still has Delivered at right edge.
  - Track package ghost CTA right-aligned below timeline.
  - Order link breathes under "May 6".

### Step 1.8: Subscriber card check.

- Reset to desktop. Flip to face state via JS (URL params get stripped).
- Screenshot. Confirm:
  - Subscriber card layout unaffected — moment header still stacks (block flow), order-id rule doesn't apply (subscriber card has no order-id link), Skip / Manage CTAs still use `--soft` styling (they have soft class, not ghost).

### Step 1.9: Commit.

```bash
git add account.html assets/account/module-subscription.css
git commit -m "$(cat <<'EOF'
polish 'Arriving soon': right-edge timeline, ghost Track CTA, more space under date

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Done criteria

- Delivered dot sits at the right edge of its grid cell (visually under Track package's right edge).
- Connector between Out-for-delivery and Delivered extends to the new dot position cleanly (still dotted ink-3 in transit state).
- Track package renders as pure viridian text + arrow, no fill.
- Visible spacing (~12px) between "May 6" baseline and the order link.
- All four shipment states render correctly; Track package visibility/state-conditional behavior unchanged.
- Subscriber-card variants (face / hair) unaffected.
- Zero console errors.

## Out of scope

- Hover animation on Track package (e.g., arrow translate-x). Only a color shift on hover.
- Renaming `.subscription__btn--soft`.
- Any changes to items zone or nudge zone.
