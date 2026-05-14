# Account Orders — redesign

Date: 2026-05-14
Page: `/account-orders` (`account-orders.html`)

## Why

The current page is a tidy, evenly-weighted list. Mobbin references (Walmart, Amazon, Dollar Shave Club, Hims, Faire, Urban Outfitters) make two things obvious:

1. **The in-transit order is the highest-value thing on this page when it exists**, and our current treatment buries it as a small uppercase pill ("IN TRANSIT · ARRIVES MAY 6"). Walmart and Amazon make arrival the hero.
2. **Every state-of-order earns its own layout** — Dollar Shave Club uses a colored status header, Hims uses a status chip on top, Faire surfaces explanation copy. Today every OneSkin row looks identical regardless of whether it's actively shipping, delivered, or cancelled.

Account home already has a beautiful "Arriving soon" component with a shipment timeline. The redesign extends that same visual language into orders, then reworks the list below it into compact, state-aware cards.

## Direction

A combination of two patterns:

- **A. State-aware cards.** Each history row adapts layout and primary CTA to its status.
- **B. Active order on top.** In-transit / out-for-delivery / processing orders get promoted out of the list into a hero block reusing the account-home "Arriving soon" pattern.

## Architecture

```
Page header  (eyebrow / title / subtitle — unchanged)
↓
Active shipments  (only when ≥1 active order)
  • Hero card per active order
  • Sorted by arrival date ascending
  • Stacked, no carousel
↓
History list  (state-aware compact cards, chronological)
↓
Empty state  (only when there is nothing at all)
```

### What's gone

- **Filter chips** (All / Subscription / One-time). With active orders promoted out of the list, the remainder is essentially chronological and the type pill on each card already communicates the distinction. With four demo orders the chips were essentially decorative; with many orders, search + date range are the right tools (deferred — see "Out of scope").
- **Track package link in history rows.** If tracking is still relevant, the order is still active and lives in the hero block.

## Hero card (active shipments)

Reuse the account-home "Arriving soon" component literally. Same eyebrow / big date headline / order subline / four-step timeline rail / item thumb strip / OTP-only subscribe nudge / primary "Track package" CTA. Same component, same CSS — consistency across pages, lower implementation cost, no relearning for the customer.

```
┌──────────────────────────────────────────────────────────┐
│ Arriving Tuesday                                         │
│ May 6                                                    │
│ Order #OS-14392 · Placed May 2                           │
│                                                          │
│ ●───────●─ ─ ─ ─ ○─ ─ ─ ─ ○                              │
│ Ordered  Shipped   Out for     Delivered                 │
│                    delivery                              │
│                              [ Track package → ]         │
├──────────────────────────────────────────────────────────┤
│ [img][img][img]  3 items · $215.00                  ⌄    │
├──────────────────────────────────────────────────────────┤
│ Make it a routine — save 15% on every shipment.          │
│                                  [ Subscribe & save → ]  │
└──────────────────────────────────────────────────────────┘
```

The subscribe nudge appears on **one-time active orders only**, and is removed from history cards entirely. The in-transit moment is the right time to offer conversion; a three-month-old delivered order is too late.

## History cards (state-aware)

Same card shell, three variants. Each picks **one** primary CTA suited to the state.

### Delivered (one-time)

```
┌──────────────────────────────────────────────────────────┐
│ #OS-13987  ·  March 10, 2026  ·  One-time       $63.00   │
├──────────────────────────────────────────────────────────┤
│ [img] OS-01 LIP MASK    Qty 1                            │
│ [img] OS-01 LIP SPF     Qty 1                            │
│ ● Delivered · March 14                                   │
├──────────────────────────────────────────────────────────┤
│ [ Reorder ]   View invoice                               │
└──────────────────────────────────────────────────────────┘
```

Primary = **Reorder**. Obvious next action on a finished one-time.

### Delivered (subscription renewal)

```
┌──────────────────────────────────────────────────────────┐
│ #OS-14201  ·  Apr 18, 2026  ·  ● Subscription   $79.00   │
├──────────────────────────────────────────────────────────┤
│ [img] OS-01 FACE        Qty 1 · 2-month delivery         │
│ ● Delivered · April 22                                   │
├──────────────────────────────────────────────────────────┤
│ [ Manage subscription ]   View invoice                   │
└──────────────────────────────────────────────────────────┘
```

Primary = **Manage subscription**. Reorder is wrong here — the subscription will renew automatically; the real intent is pause / change cadence / swap product.

### Cancelled

```
┌──────────────────────────────────────────────────────────┐
│ #OS-14555  ·  April 1, 2026  ·  One-time      $90.00     │
├──────────────────────────────────────────────────────────┤
│ [img] OS-01 BODY        Qty 1                            │
│ ● Cancelled · April 2                                    │
│   We couldn't charge your card. You weren't charged.     │
├──────────────────────────────────────────────────────────┤
│ [ Reorder ]   View invoice                               │
└──────────────────────────────────────────────────────────┘
```

Primary = **Reorder** (try again). Explanation copy beneath the status pill softens an otherwise cold "Cancelled" badge.

## Density and visual adjustments

- Item thumbs shrink **56px → 44px** in history cards. Keeps the page from looking front-heavy after the hero.
- The current meta separator (3px circles) is removed. The type pill provides enough rhythm.
- Hero retains larger thumbs to match account-home.

## Edge cases

| Case | Behavior |
|---|---|
| No active orders | Hero section omitted; history list starts directly under the page header |
| Only active orders | History list and empty state both omitted |
| Multiple active orders | Stacked heroes, sorted by arrival date ascending |
| Subscription renewal currently in transit | Promotes to hero. Subscribe nudge does **not** appear (already a subscription) |
| Order has no items | Not designed for — should not occur |

## Responsive

- Hero: full-width within the account-main column at all breakpoints. Already known to work from account-home.
- History card: meta row wraps on narrow widths; primary CTA full-width on mobile; thumbs stay at 44px.
- Account nav: existing mobile collapse pattern unchanged.

## Out of scope (v2 candidates)

- Search box and date-range filter. Needed when orders accumulate; not needed at the demo's four-order scale.
- Per-item reorder (Dollar Shave Club pattern). Order-level reorder is simpler and covers the common case.
- "Action required" tab (Faire pattern). Real value only emerges if we have nudges to surface — payment failed, recommended swap, etc.
- Returns / refunded / partial-delivery states. Not currently modeled in the prototype.

## Files involved

- `account-orders.html` — restructure markup into active-shipments + history sections; remove filter chip markup
- `assets/account/orders.css` — new hero variant (or shared module styles); state-aware history card variants; density adjustments
- `assets/account/orders.js` — remove filter logic; keep Reorder toast; ensure hero items strip expansion works
- `assets/account/module-03-drop.css` — referenced/reused for the hero shipment block (no edits expected unless tokens differ)
- `assets/account/state-toggle.js` — extend demo controls so the page can be previewed with and without active orders

## Success criteria

1. With one active order, the page leads with a shipment hero matching the account-home pattern.
2. Past orders display state-appropriate primary actions (Reorder / Manage subscription / Reorder).
3. Filter chips and per-row track links no longer exist.
4. Cancelled orders carry an explanation line beneath the status.
5. The demo state toggle can switch the page between "active + history", "history only", and "active only" views.
