# Account page — FAQ section (module 06) — design

## Context

The account page (`account.html`) currently ends with module 05 (referral
preview). Add a sixth module at the bottom — a collapsible FAQ section —
that answers the four most common support questions: returns, shipping
windows, missing-order help, subscription management.

## Approach

Reuse the existing `.faqs` accordion component (used on body / face PDPs).
Mount it as a normal account module so it inherits the page's vertical
rhythm.

- **Markup:** New `<section class="faqs account-module account-module--faq"
  data-account-module="06">` block immediately before `</main>`. Inside,
  the existing `.faqs__inner` two-column grid: 36px headline on the left,
  four `<details class="faqs__item">` rows on the right with plus/minus
  toggle icons.
- **CSS:** Link `assets/body/section-faqs.css` from `account.html`'s
  `<head>`. Precedent: account already links `assets/body/section-header.css`.
  Zero new CSS files, zero overrides.
- **First item open, rest collapsed** — matches the PDP convention.

## Content

Four questions, draft answers in brand voice (~2-3 sentences each):

1. **What is your returns policy?**
   > We offer a 60-day satisfaction guarantee on all orders. If OS-01 isn't
   > right for you, contact us within 60 days of delivery for a full refund
   > — no return shipment required.

2. **When will my order ship?**
   > Most orders ship within 1–2 business days, with delivery typically
   > arriving in 3–5 business days after that. Once your order ships you'll
   > get a tracking email, and you can follow it from this page under
   > Arriving soon.

3. **What do I do if I didn't receive my order?**
   > First, check the tracking link in your shipment email — packages
   > sometimes arrive a day after they're marked delivered. If it's still
   > missing after that, email us at help@oneskin.co with your order number
   > and we'll resend or refund.

4. **How do I manage my subscription?**
   > Open Manage subscription from your account home to change frequency,
   > swap products, skip a shipment, or pause anytime. Changes take effect
   > on your next scheduled shipment.

## Verification

- Reload `/account.html?state=otp`, scroll to the bottom — confirm the
  FAQ section renders below the referral preview with the four questions,
  the first answer expanded by default.
- Click each question — confirm expand/collapse with icon swap (minus ↔
  plus).
- Mobile (≤768px): the grid should collapse to one column per the
  existing `.faqs` mobile rule.

## Files touched

- `account.html` — append `<link>` to faqs CSS in `<head>`; append the
  new module 06 `<section>` before `</main>`.

## Out of scope

- Any change to existing FAQ styling.
- Hooking the email link to a real mailto (kept as plain text for now).
- Real CX support routing — that's covered by the "I have a problem"
  escape hatch.
