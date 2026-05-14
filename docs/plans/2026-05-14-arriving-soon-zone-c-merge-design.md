# "Arriving soon" — fold Zone C into Zone A + tint Zone D — design

## Context

Iteration on the four-zone "Arriving soon" card. The card today reads:

```
Zone A — eyebrow + date (left) | 4-step timeline (right)
Zone B — items thumbs + summary + Show items toggle
Zone C — Order # link (left) + Track package button (right)
Zone D — Subscribe nudge (cream surface)
```

Two changes:

1. **Fold Zone C into Zone A.** The order link and Track package button each glue under their respective columns — order link under "May 6", Track package under the timeline. Zone C disappears; the card becomes a three-zone surface (combined A / items / nudge).
2. **Tint Zone D light viridian** so the subscription upsell reads as a visually distinct section, not as just-another-row on the cream surface.

## New zone structure

```
Zone A — Moment + Timeline + tracking footer (two columns, each with its own stack)
Zone B — Items
Zone D — Subscribe nudge (now on --color-viridian-light)
```

### Zone A — combined

Two columns inside `<header class="subscription__order-moment">`:

**Left column** (`.subscription__order-moment-text`):
- `Arriving Tuesday` eyebrow (unchanged)
- `May 6` headline (unchanged)
- `Order #OS-14392 · Placed May 2` link, ~13px ink-2 with the existing underline treatment

**Right column** (new wrapper `.subscription__order-moment-progress`):
- The 4-step `<ol class="subscription__order-steps">` (unchanged content)
- The delay note `<p data-shipment-note hidden>` (hidden by default, revealed when `data-shipment-state="delayed"`)
- The pending tracking line `<span data-tracking-pending hidden>` (revealed when `data-shipment-state="ordered"`)
- The Track package button `<a data-track-link>`, right-aligned

Column gap: 40px desktop (same as today). Vertical alignment switches from `center` to `flex-start` so the order link / Track package row sits below its element rather than floating mid-card.

Right column gap (internal): 12px between timeline and Track package row.

### Zone B — items

Unchanged in markup and CSS.

### Zone D — Subscribe nudge, now tinted

- Background: `var(--color-viridian-light)` (`#dce5df`).
- Text color, button colors: unchanged. (`--color-ink` text + black primary button.)
- The hairline between Zone B and Zone D becomes implicit at the color edge — the existing `border-top` rule still applies but reads as a subtle tone divider; drop the top border to keep the edge clean (the color shift carries the division).

Mobile padding unchanged.

## Mobile (≤600px)

- Zone A still stacks via `flex-direction: column` (existing rule). Left text column on top, right progress column below.
- Track package button stays right-aligned within its column.
- Order link sits below the date in the headline group.
- Zone D color tint applies identically.

## Edge cases

- **Pre-ship (`?ship=ordered`)** — Track package hides, pending tracking line shows in its place (existing behavior preserved by selectors targeting `data-tracking-pending` / `data-track-link`).
- **Delayed (`?ship=delayed`)** — delay note line appears at the top of the right column above Track package, in amber. Existing rule `.subscription__order[data-shipment-state="delayed"] [data-shipment-note] { display: block; }` still targets correctly because the note moved with its parent.
- **Subscription card variants** (`?state=face`, `?state=hair`) — unaffected because all changes are scoped through `:has(.subscription__order-steps)` (already in place) or inside the OTP-only markup.

## Files touched

- [account.html](../../account.html) — inside the OTP block:
  - Move the order link from Zone C into `.subscription__order-moment-text`.
  - Wrap `<ol class="subscription__order-steps">` + delay note + pending line + Track package button in a new `.subscription__order-moment-progress` div.
  - Delete the now-empty `<section class="subscription__order-tracking-zone">`.
- [assets/account/module-subscription.css](../../assets/account/module-subscription.css):
  - Switch `.subscription__order-moment:has(.subscription__order-steps)` from `align-items: center` to `align-items: flex-start`.
  - Add `.subscription__order-moment-progress` layout rule (flex column, right-aligned items, 12px gap).
  - Drop the standalone `.subscription__order-tracking-zone` padding rule (zone no longer exists).
  - Drop the `.subscription__order-progress-note:not([hidden]) + .subscription__order-progress-meta { margin-top: 12px; }` rule (the meta row is gone; the right column's gap handles spacing).
  - Add `.subscription__order-nudge { background: var(--color-viridian-light); }`.
  - Drop the `border-top` between the nudge and the previous zone (the color edge is the divider now).

## Verification

1. `/account.html?state=otp` — confirm Zone A shows headline + order link stacked on the left, timeline + Track package stacked on the right; Zone D has a light viridian background.
2. Cycle `?ship=ordered`, `?ship=out-for-delivery`, `?ship=delayed` — confirm Track package hides / pending line shows, third dot active, delay note + amber dot.
3. Resize to 600px and 375px — confirm Zone A stacks correctly, Track package stays right-aligned, Zone D tint reads cleanly at small widths.
4. `?state=face` and `?state=hair` — confirm the active-subscription card is unaffected.

## Out of scope

- Any items-zone or timeline-step copy changes.
- Renaming `.subscription__order-progress-note` (it lives in the progress column now but the name still scans; renaming would touch JS hooks for marginal gain — YAGNI).
- Tinting any other zone.
