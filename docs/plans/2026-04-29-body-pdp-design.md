# /body/ PDP — Design Doc

**Date:** 2026-04-29
**Source:** Figma file `ttnXSyu0hen75971OQWakO` (Compass-Version), node `253:4555`
**Output file:** `body.html` (sibling to `index.html`)

## Goal

Build a new product detail page for the OS-01 BODY MOISTURIZER, matching the Figma source. Sibling pattern to the existing FACE PDP at `index.html`, but with isolated CSS so it tracks the latest design system rather than inheriting outdated FACE styles.

## Scope

Strict spec match — only what's in the Figma. No shade-compare, cross-sell, key-ingredients-standalone, skincare-routine, or reviews sections (those exist on FACE but aren't drawn for body).

## File layout

```
body.html                                     ← new, sibling to index.html
assets/body/                                  ← new directory
  base.css                                    ← body-specific tokens
  section-product-hero.css
  section-purchase-widget.css
  section-details-accordion.css
  section-bento-benefits.css
  section-timeline.css
  section-clinical-stats.css
  section-science-module.css
  section-faqs.css
  section-lifestyle-footer.css
assets/images/body/                           ← already populated (35 PNGs)
```

Existing `assets/section-*.css` files are not reused. The current FACE PDP CSS is outdated relative to the Figma source of truth.

## Sections (top-to-bottom)

| # | Section | Figma annotation | Content notes |
|---|---|---|---|
| 1 | Header | — | Wordmark center, nav (Shop/Mission/Learn) left, Account + Cart right |
| 2 | Product Hero | A1–A4 | "BODY MOISTURIZER" title, main hero image + 4×304px thumbs grid, adjectives row, benefit one-liners |
| 3 | Purchase Subscription Widget | B1–B2 | Subscription radio buttons (Core / Refill / Core+Refill), reasons-to-subscribe, certifications, Add to Cart CTA |
| 4 | Details Accordion | C | Collapsed sections (ingredients, how to use, etc.) |
| 5 | Bento Benefits | E1 | "What BODY users report" — headline + image-card bento grid |
| 6 | Timeline | F1 | Timeline headline + ordered cards |
| 7 | Clinical B/A | G2 | Before/after landscape imagery + clinical-stat metrics |
| 8 | OS-01 Science Module | I1–I3 | Module header, content, link to Science page |
| 9 | FAQs | K2–K3 | Q/A accordion pairs |
| 10 | Lifestyle hero + footer | — (bottom of page) | Lifestyle imagery row, big lifestyle image, footer |

## Asset strategy

- Use the 35 PNGs already in `assets/images/body/` (downloaded in the prior session).
- Skip `imgFrame451.png` for direct visual inspection — it crashed the prior session's image-read loop. Inspect by header bytes if needed.
- No re-downloads from Figma.

## Working order

1. Scaffold `body.html` with `<head>`, font links, and stylesheet links to `assets/body/*.css` (all empty initially).
2. Build sections top-to-bottom (Header → Product Hero → Purchase Widget → … → Lifestyle/Footer).
3. After each section, verify in browser preview before moving on.
4. Use the Figma design context (`get_design_context` for sub-nodes) to look up specific section internals when implementing — don't inspect every PNG.

## Out of scope

- Liquid theme integration (`templates/product.body.json`, `sections/body-*.liquid`) — this design covers the static `body.html` only. Liquid migration would be a separate effort.
- Updating FACE PDP to the new design system — separate effort.
- Mobile/responsive variants — Figma frame is 1440px desktop only. Responsive will be addressed once the desktop layout is approved.

## Risks

- The Figma export was 140 KB; section detail will need targeted `get_design_context` calls per sub-node rather than re-fetching the whole frame.
- "Outdated FACE CSS" is asserted by user feedback; if patterns end up identical between FACE and BODY, the duplication is intentional and accepted.
