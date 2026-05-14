# "Arriving soon" — polish pass (right-edge timeline, ghost CTA, spacing) — design

## Context

Iteration on the merged Zone A. Three small adjustments to the OTP card's
moment+timeline header:

1. **Right-edge timeline.** The Delivered dot currently sits at ~75% of the
   right column's width because the timeline uses `grid-template-columns:
   repeat(4, 1fr)` with each dot at `align-items: flex-start` (left of its
   cell). The gap between the Delivered dot and the right edge of the card
   feels wasted.
2. **Ghost Track package CTA.** The light-viridian fill on the Track package
   button competes for attention with the primary Subscribe & save below.
   Demote it to a pure text link (viridian text + arrow, no fill, no border).
3. **Spacing between "May 6" and the order link.** The order link
   (`Order #OS-14392 · Placed May 2`) sits flush under the date because
   `.subscription__order-date` has `line-height: 1.05` and the link has no
   top margin. Add breathing room.

## Changes

### 1. Right-edge timeline

Push the Delivered dot (and its label) to the right edge of its grid cell so
it aligns with the right edge of the right column — directly above Track
package's right edge.

- Add `.subscription__order-step:last-child { align-items: flex-end; }` —
  the dot and label inside the last `<li>` hug the right of the cell.
- The connector `::before` going INTO Delivered needs `right` adjusted so it
  reaches the new dot position. Currently `right: calc(100% - 6px)` lands at
  `li_left + 6px` (dot center if the dot were at the cell's left edge). With
  the dot now at the cell's right edge, the dot center is at `li_right - 6px`.
  Override to `right: 6px` on the last child's `::before`.

### 2. Ghost Track package CTA

Add a new `.subscription__btn--ghost` modifier — transparent background, no
border, viridian text + arrow. Same hover affordance pattern as the existing
`.subscription__order-track-link` style (the underlined-style link family in
this file).

- New CSS:
  ```css
  .subscription__btn--ghost {
    background: transparent;
    color: var(--color-viridian);
    padding: 0;
  }
  .subscription__btn--ghost:hover {
    background: transparent;
    color: var(--color-ink);
  }
  ```
  (Override `.subscription__btn`'s default padding/bg.)
- HTML: change Track package's class from
  `subscription__btn subscription__btn--soft` to
  `subscription__btn subscription__btn--ghost`.

### 3. Spacing under "May 6"

- Add `margin-top: 12px` to `.subscription__order-id`. Keeps the link
  visually grouped with the headline but no longer crowded against it.

## Files touched

- [account.html](../../account.html) — one HTML attribute change (Track
  package button class).
- [assets/account/module-subscription.css](../../assets/account/module-subscription.css)
  — three CSS additions / overrides.

## Verification

1. `/account.html?state=otp` — confirm Delivered dot sits at the right edge
   of the timeline (visually under Track package's right edge), Track
   package renders as a pure viridian text link with arrow, and "May 6" /
   order link have visible breathing room between them.
2. Cycle `?ship=ordered` (Track package hidden, pending line shown — confirm
   layout doesn't shift), `?ship=delayed` (delay note above Track package),
   `?ship=out-for-delivery` (third dot active).
3. Mobile (375px): timeline + connector still spaced correctly with last dot
   at the right. Track package ghost CTA right-aligned.
4. Subscription card (`?state=face`): no impact — the rule changes target
   `.subscription__order-step:last-child` and `.subscription__btn--ghost`
   which only the OTP card uses.

## Out of scope

- Items zone, nudge zone, headline typography, dot pulse animation.
- Renaming `.subscription__btn--soft` (still used by the active-subscription
  card's Skip / Manage CTAs).
