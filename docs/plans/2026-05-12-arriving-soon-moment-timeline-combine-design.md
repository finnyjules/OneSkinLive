# "Arriving soon" — combine moment + timeline (side-by-side) — design

## Context

Iteration on the four-zone "Arriving soon" card built per
[2026-05-11-arriving-soon-redesign-design.md](2026-05-11-arriving-soon-redesign-design.md).
Today, the arrival headline (Zone A) sits on its own row, then items, then the
4-step horizontal timeline (Zone C, with tracking glued to it), then the
subscribe nudge. The user wants the arrival headline and the timeline to sit
**side-by-side** as one combined top zone — date left, timeline right —
because the two read as one thought ("when is it arriving, and where is it on
the way?").

## New zone structure

Same four-zone card with hairline dividers; content rearranges.

```
Zone A — Moment + Timeline (two columns: headline | horizontal 4-step timeline)
Zone B — Items (unchanged)
Zone C — Tracking row (carrier + number + copy + Track package, plus delay note)
Zone D — Subscribe nudge (unchanged)
```

### Zone A — Moment + Timeline

- Two-column flex row inside the existing `.subscription__order-moment` zone.
- **Left column:** the current eyebrow + headline + meta block, natural width
  (no fixed width).
- **Right column:** the existing `<ol class="subscription__order-steps">` moves
  here. `flex: 1`, capped at ~480px so it never feels stretched on wide cards.
- **Vertical alignment:** `align-items: center` — the dot row visually anchors
  to the middle of the headline stack.
- **Gap:** 40px desktop, collapses on mobile.

No change to the dot/connector/pulse rules. The timeline's delay overlay (amber
active dot when `data-shipment-state="delayed"`) still fires from the same
selector.

### Zone C — Tracking row

Becomes its own zone (was glued under the timeline before). Contents:

- `USPS · 1Z999AA10123456784 [copy]` (left) and `Track package →` button
  (right) — already structured this way today, just reparented.
- The `data-shipment-note` line (delay) stays here, rendered above the meta row
  when the shipment is `delayed`. Visually a small amber line that belongs with
  tracking, not with the dots.
- The `data-tracking-pending` line (`Tracking available when shipped`) keeps
  its current pre-ship behavior.

### Zones B and D

Unchanged in markup and styling.

## Mobile (≤600px)

- Top zone stacks vertically: headline on top, timeline below at full width.
  `flex-direction: column; align-items: stretch; gap: 24px`.
- Existing step-label wrap rules (`font-size: 11px`, etc.) still apply.
- All other zones unchanged.

## Edge cases

- **Pre-ship (`?ship=ordered`)** — timeline shows Ordered active, the others
  hollow. Tracking zone shows the "Tracking available when shipped" pending
  line; Track package hidden. No visual change vs today except the timeline
  now sits next to the headline.
- **Delayed (`?ship=delayed`)** — active step's dot turns amber; the delay
  note line appears inside the tracking zone.
- **Out-for-delivery / transit** — unchanged behavior.

## Files touched

- [account.html](../../account.html) — inside the OTP block's
  `<article class="subscription__order">`:
  - Move the `<ol class="subscription__order-steps">` from Zone C into the
    Zone A header (`<header class="subscription__order-moment">`).
  - Restructure Zone C to be just the tracking row + delay note (drop the
    `.subscription__order-progress` wrapper or repurpose it).
- [assets/account/module-subscription.css](../../assets/account/module-subscription.css)
  — turn `.subscription__order-moment` into a flex row; add mobile stack rule;
  remove the now-unused `margin-top` on the meta row inside the moment header
  (it now sits in the left column with its own stack).

## Verification

1. Reload `/account.html?state=otp` — confirm the top zone shows headline
   on the left and the horizontal 4-step timeline on the right, dot row
   roughly centered against the "May 6" headline.
2. Cycle through `?ship=ordered`, `?ship=out-for-delivery`, `?ship=delayed` —
   confirm timeline state changes still apply (pulsing dot, amber overlay)
   and the tracking zone shows the right line.
3. Resize to 600px and 375px — confirm the headline + timeline stack
   vertically and the timeline labels don't collide.
4. Keyboard pass: items toggle, copy tracking, Track package, Subscribe & save
   all still reachable and visibly focused.

## Out of scope

- Any change to the items zone, nudge zone, or the active-subscription card
  above the OTP block.
- Vertical timeline variant (explored and rejected — user picked horizontal).
