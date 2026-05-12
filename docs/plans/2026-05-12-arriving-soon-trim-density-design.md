# "Arriving soon" — trim density (Approach 1) — design

## Context

Iteration on the side-by-side moment + timeline card built per
[2026-05-12-arriving-soon-moment-timeline-combine-design.md](2026-05-12-arriving-soon-moment-timeline-combine-design.md).

The card now has the right *shape* (date left, timeline right, items + tracking
+ nudge below), but the default state is dense: ~13 text elements compete for
attention even when nothing's wrong. Reference patterns on Mobbin (Apple
"Here's what's coming up", Apple order summary, Hims orders, Warby Parker
account home) all lean harder on **one calm moment + progressive disclosure**.

The hierarchy is already correct (32px date is the largest thing). The fix is
**reduction**, not retuning sizes.

## What changes

Four targeted trims, all inside the OTP card. Zone structure unchanged.

### 1. Timeline shows step names only — drop per-step dates

Today each of the 4 steps renders **name + date** (`Ordered / May 2`,
`Shipped / May 3`, `Out for delivery / Expected May 6`, `Delivered / —`).
That's 8 micro-labels under the dots.

The Zone A headline already communicates the expected arrival date. Past
step dates (`Shipped May 3`) are non-actionable history; future placeholders
(`Delivered —`) are noise.

Change: remove the `<span class="subscription__order-step-date">` line from
every step. Step labels read just `Ordered / Shipped / Out for delivery /
Delivered`. The active-dot pulse + amber-on-delayed behavior is unchanged.

### 2. Move order # + placed date out of the moment header

Today the left column of Zone A has eyebrow + date + a meta row of
`Order #OS-14392 · Placed May 2`. Useful info, but not headline-worthy.

Change: remove the `.subscription__order-meta` block from inside
`.subscription__order-moment-text`. Add a small order-details link in
Zone C next to *Track package* — `Order #OS-14392 · Placed May 2` rendered
as a muted 13px link pointing to `/account-orders.html` (the existing
order history page, linked from the account nav as "Order history").

### 3. Collapse the tracking row to a single CTA

Today Zone C surfaces three things side-by-side: the visible carrier name,
the full tracking number, a copy-tracking icon button, and the Track package
CTA. That's a lot of mechanism for the same job — "get me to the carrier."

Change:
- Remove the visible `USPS · 1Z999AA10123456784 [copy]` cluster from the
  default view.
- Keep **Track package →** as the primary action (generic CTA — no carrier
  name baked in, so the same string works whether the carrier is USPS,
  UPS, FedEx, or DHL).
- Move the "Copy tracking number" affordance behind a small secondary link
  (`Copy tracking number`) sitting next to the CTA. Clicking it copies
  the same number that's in `data-tracking-number` and shows the existing
  `data-copy-feedback` pulse.
- The pending state (`data-tracking-pending` — "Tracking available when
  shipped") replaces the CTA in pre-ship mode, same as today.
- The delay note (`data-shipment-note`) keeps its current prominence — it's
  exception communication and must stay loud.

### 4. Subscribe nudge — unchanged here, flagged for later

Zone D stays as-is in this pass. The card already earns its keep on
arrival-day information; the nudge is a separate concern. A follow-up
could conditionalize it (first OTP order only, or post-delivery instead of
in-transit), but that's out of scope for this iteration.

## Result

Default in-transit state goes from ~13 text elements to ~7:

```
Before                              After
─────────────────────              ─────────────────────
Arriving Tuesday                    Arriving Tuesday
May 6                               May 6
Order #OS-14392 · Placed May 2
Ordered · May 2                     Ordered
Shipped · May 3                     Shipped
Out for delivery · Expected May 6   Out for delivery
Delivered · —                       Delivered
3 items · $215.00                   3 items · $215.00
USPS · 1Z999AA10123456784 [copy]
Track package →                     Track package →   Copy tracking number
Make it a routine…                  Order #OS-14392 · Placed May 2
Subscribe & save                    Make it a routine…
                                    Subscribe & save
```

Same data, fewer simultaneous demands on the eye.

## Mobile (≤600px)

- Step labels stay 11px (existing rule). With dates removed, the timeline
  row is shorter and no longer needs the labels-wrap mitigation that today's
  CSS carries — verify nothing collapses awkwardly.
- Zone C row stacks the CTA + Copy link + order-details label vertically
  with 8px gap when the row would overflow. The existing flex-wrap on
  `.subscription__order-tracking-zone` should handle this; the order-details
  label gets `flex-basis: 100%` at ≤600px so it always wraps to its own line.

## Edge cases

- **Pre-ship (`?ship=ordered`)** — only Ordered dot active, others hollow.
  Tracking pending line replaces the CTA. The order-details label still
  shows under the (hidden) CTA row.
- **Delayed (`?ship=delayed`)** — active dot turns amber; the delay note
  appears above the CTA row (unchanged behavior). The CTA stays
  *Track package →* — the delay note is the exception channel.
- **Out-for-delivery / transit** — default flow above.
- **Single-item shipment** — Zone B's "Show items" toggle is already
  hidden when `data-items-count="1"`; no change.
- **Copy-tracking interaction** — the `data-copy-tracking` button moves
  to a text link but keeps its `aria-label` and `data-copy-feedback` pulse.
  Screen-reader behavior preserved.

## Files touched

- [account.html](../../account.html), inside the OTP block's
  `<article class="subscription__order">`:
  - Remove `<p class="subscription__order-meta">` (lines ~273–277) from the
    moment header.
  - Remove the four `<span class="subscription__order-step-date">` lines
    from the `<ol class="subscription__order-steps">` (~284, 289, 294, 299).
  - Restructure Zone C tracking row: drop the visible carrier+number+copy
    cluster; keep the pending span; keep the existing *Track package →* CTA
    (generic — no carrier name); add a sibling *Copy tracking number* text
    link; add the order-details link (`Order #OS-14392 · Placed May 2`,
    `href="/account-orders.html"`) as a third child of the row.

- [assets/account/module-subscription.css](../../assets/account/module-subscription.css):
  - Delete `.subscription__order-step-date` rule (~395–398) and its mobile
    sibling line in the 600px block (~402–404). Leave step-name rules
    intact.
  - Delete `.subscription__order-meta` rule (~192–200) — no longer used in
    this card. (Keep it if it's referenced elsewhere; grep first.)
  - Add styles for the new Zone C children:
    - `.subscription__order-copy-link` — 13px text link, ink-2,
      underline-on-hover, sits next to the CTA.
    - `.subscription__order-id` — 13px ink-3 link, underline-on-hover,
      sits on its own line at ≤600px, otherwise inline at the end of
      the row. Points to `/account-orders.html`.
  - Adjust `.subscription__order-tracking-zone` flex rules to lay out
    `[CTA] [Copy link] [Order id]` with `gap: 16px`, wrap on small.

- [assets/account/module-subscription.js](../../assets/account/module-subscription.js):
  - The copy-tracking handler currently targets `[data-copy-tracking]`; that
    selector stays the same on the new link element. No JS change required
    unless the click target was an `aria-label`-only icon — confirm during
    implementation and add visible focus styling if needed.

## Verification

1. `/account.html?state=otp` — top zone shows headline left, 4 dots with
   single-line names right. No per-step dates.
2. Below items: a single row with **Track package →** primary CTA,
   *Copy tracking number* secondary link, and `Order #OS-14392 · Placed May 2`
   as a muted link to `/account-orders.html`.
3. `?ship=ordered` — pending line replaces the CTA; copy link hidden;
   order-id link still visible.
4. `?ship=delayed` — amber active dot; delay note above the row; CTA still
   reads *Track package →*.
5. Click *Copy tracking number* — clipboard contains the
   `data-tracking-number` value; the existing feedback pulse fires.
6. Resize to 375px — CTA, copy link, and order-id stack vertically with
   visible focus rings reachable by keyboard.
7. Default state element count: confirm ~7 text elements visible (vs ~13
   before).

## Out of scope

- Zone D subscribe nudge changes (separate iteration).
- Items zone, active-subscription card above the OTP block.
- A per-order detail page. The label links to `/account-orders.html` (the
  list); we're not building a deep-link to a specific order in this pass.
- Replacing the dot stepper with a progress-bar metaphor (Approach 3 from
  brainstorming — rejected for this iteration).
- Status-pill + thumb-led card structure (Approach 2 — rejected).
