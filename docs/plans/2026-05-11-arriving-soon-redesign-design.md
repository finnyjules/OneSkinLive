# "Arriving soon" module redesign — design

## Context

The `Arriving soon` card on `account.html` (rendered for the `otp` state inside the Subscription module) currently reads as two stitched-together pieces: a cream order card and a viridian-soft "subscribe and save" block bolted on below. The arrival itself is information rather than a moment, the `IN TRANSIT` pill is small and easy to miss, and the upsell block's 22px headline competes with the arrival headline.

This redesign turns the card into a single warm surface with three responsibilities: communicate the arrival moment, show shipment progress, and softly nudge the customer toward subscription — without two-tone fills, competing headlines, or repeated benefit bullets.

Approach: **unified moment + progress + nudge** (chosen from a 3-way exploration).

## Card structure

A single card on `--color-cream-2` with `1px var(--color-line-soft)` border and `--radius-lg`. Four horizontal zones separated by `1px var(--color-line-soft)` dividers — no nested surface colors.

```
Zone A — Arrival moment (header)
Zone B — Items list (collapsible when 2+)
Zone C — Shipment progress (tracking centerpiece)
Zone D — Subscribe nudge (soft)
```

Outer card surface and section heading (`Arriving soon`) stay consistent with the active-subscription cards above.

### Zone A — Arrival moment

- Two-line headline: `Arriving Tuesday` (day name) / `May 6` (date), display weight, same scale as today's `subscription__card-frequency` (28px / 24px mobile).
- Meta line below: `Order #OS-14392 · Placed May 2`. 15px ink-2, separator dots match `subscription__card-meta-sep`.
- `· 3 items · $215.00` summary moves into Zone B; do not duplicate here.

### Zone B — Items

- **1 product:** single row, no toggle.
- **2+ products:** collapsed by default with a thumb cluster + summary + chevron toggle. Expanded shows one row per product.

**Collapsed summary row (whole row is the toggle):**
- Thumb cluster: side-by-side, 56px squares (40px on mobile), 8px gap. Show first 3, then a `+N` tile.
- Summary text: `3 items · $215.00`.
- Chevron right, rotates 180° when expanded.
- `aria-expanded`, `aria-controls` on the toggle button. Focus stays on the toggle when expanding.

**Expanded rows:**
- Each row: 56px thumb (cream pad), product name (500 weight, ink), `Qty N` sub-line (hidden when 1), price right-aligned.
- Thin `1px var(--color-line-soft)` dividers between rows.

**Animation:** content height + opacity transition, ~220ms ease. JS toggle on a class + `aria-expanded`; not `<details>`.

**No persistence.** Open state resets on reload — peek, not setting.

### Zone C — Shipment progress

A 4-step horizontal indicator. The active step is the only step drawing attention.

**Steps:** Ordered → Shipped → Out for delivery → Delivered. Each step has a dot, name (12px / 500 ink), date below (12px ink-3). Active step's date may read `Today` when same-day.

**Dot states:**
- Completed: 12px filled viridian
- Active: 12px filled viridian + soft 4px outer ring pulsing 0 → 8px, opacity 0.4 → 0, 2.4s ease-out infinite
- Future: 12px transparent with 1.5px ink-3 stroke

**Connectors:**
- Completed-to-completed and completed-to-active: 2px solid viridian
- Active-to-future and future-to-future: 2px dotted ink-3 (4px on / 4px off)

**Meta + CTA row below the steps:**
- `USPS · 1Z999AA10123456784` (13px ink-2) + 24px viridian copy icon. Click flashes "Copied" for ~1.4s.
- `Track package →` right-aligned viridian text link (same arrow-grow hover as `subscription__card-details`).

**Pre-ship variant:** the meta line replaces carrier + number with `Tracking available when shipped`. Track package link is hidden.

**What we're not doing:** no carrier logos, no map, no carrier-specific actions (Sign / Reschedule).

### Zone D — Subscribe nudge

Single-line prompt on the same cream surface. No nested fill, no headline, no bullet list.

- **Layout:** text left, CTA right, vertically centered. ~18–20px vertical padding (14px on mobile).
- **Text (1 product):** `Subscribe to save $13.50/shipment.` (15px ink, 400 weight).
- **Text (2+ products):** `Subscribe to save 15% on every shipment.` — % framing scales without per-item math.
- **CTA:** `Subscribe & save →` as a viridian text link with arrow-grow hover, **weight 500** (slightly heavier than `Track package` / `View details` to signal it's the primary action on this card without becoming a button).
- **Link target:** `/a/account/subscriptions` (Skio portal — matches `account-nav__item` pattern).

**Not doing:** benefit bullets (`15% off · Free shipping · Cancel anytime`), urgency framing, dismiss control.

## Shipment states

A `data-shipment-state` attribute on the card switches treatment.

| State | Headline | Active step | Tracking meta | Track package CTA |
|---|---|---|---|---|
| `ordered` (pre-ship) | `Arriving Friday` / `May 9` | Ordered (filled + pulsing) | `Tracking available when shipped` | Hidden |
| `transit` (main) | `Arriving Tuesday` / `May 6` | Shipped (filled + pulsing) | Carrier + number + copy | Visible (viridian) |
| `out-for-delivery` | `Arriving today` (optional `By 8 PM` subhead) | Out for delivery (filled + pulsing) | Same | Visible (ink, heavier) |
| `delayed` (overlay) | Same date + small amber `Delayed · now arriving May 8` chip beside it | Active step's dot and ring shift viridian → amber | Adds line: `Carrier reported a delay · updated May 4` | Unchanged |

**Out of scope for this redesign** (note for future work):
- **Delivered:** order leaves "Arriving soon" → lives in Order history. No celebration state on this card.
- **Failed delivery / returned:** escalation states with different CTAs (`Contact support`, `Resolve issue`).

## Multi-product behavior

- Multiple **separate shipments** → cards stack via existing `subscription__list` flex column with `gap: 14px`. Each card fully independent.
- Multiple **products in one shipment** → one card; Zone B's row list (collapsible) carries the products. Zones A, C, D wrap the whole shipment with a shared headline, shared tracking, and a single shared nudge.

Subscribe nudge stays card-level (not per-product). The CTA links to the subscription manager where the customer picks which items to subscribe — no per-row micro-actions.

## Mobile (≤600px)

| Zone | Mobile behavior |
|---|---|
| Card | Padding 28/32px → 22/20px (matches existing `subscription__card`) |
| A | Headline scale unchanged (already mobile-tuned). Meta wraps as one line |
| B (collapsed) | Thumb squares 56 → 40px, 6px gap. Summary stays on one line. Whole row is the tap target |
| B (expanded) | Thumb stays 56px; price right-aligned; Qty hides when 1 |
| C | 4 dots in `flex: 1` columns. Step name 12 → 11px, labels can wrap to two lines (`Out for / delivery`). Active pulse outer-ring travel halves so it doesn't bleed into neighbors |
| C meta | Wraps to two lines: tracking + copy on row 1, `Track package →` right-aligned on row 2 |
| D | Wraps to two lines: text on row 1, CTA right-aligned on row 2. Vertical padding 18 → 14px |

**Very narrow (<360px) fallback:** step labels truncate to first word (`Out for delivery` → `Out for`, date stays). Meta line allows `overflow-x: auto` so copy/track buttons remain visible.

## Files touched

- [account.html:215-276](account.html) — OTP state block (`data-state-target="otp"`): replace markup
- [assets/account/module-subscription.css](assets/account/module-subscription.css) — rework `.subscription__card--order` styles + add new zone/progress/nudge classes; remove `.subscription__order-status` (no longer used inline) and `.subscription__card-upsell*` (replaced by the in-surface nudge)
- New: `assets/account/module-subscription.js` — items collapse toggle + copy button feedback. Wire `data-shipment-state` switching for the demo

## Verification

1. Run dev server (already running at `:3010`); navigate to `/account.html?state=otp`.
2. Confirm the card visually matches the four-zone structure with no two-tone surfaces.
3. Toggle the items list (when seeded with 2+ products) and confirm smooth expand/collapse with correct `aria-expanded` state.
4. Click the copy button; confirm "Copied" feedback flashes ~1.4s.
5. Manually switch `data-shipment-state` on the card via devtools to verify `ordered`, `transit`, `out-for-delivery`, and `delayed` variants render correctly.
6. Resize to 375px and 360px viewports — confirm the layout adapts per the mobile rules and the progress dots don't collide.
7. Keyboard-only test the items toggle, copy button, and Subscribe & save link; confirm focus rings and tab order are sane.

## Open questions for implementation plan

- Where do the multi-product mock items come from? Hardcode 3 items in the OTP block, or add a small JS hook to switch between 1-item and 3-item demos via URL param?
- Should the demo-state switcher chip (bottom-left) gain a shipment-state segmented control too, so reviewers can flip through `ordered / transit / out-for-delivery / delayed`?
