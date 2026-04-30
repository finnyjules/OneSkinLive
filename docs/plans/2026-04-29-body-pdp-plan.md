# /body/ PDP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a static `body.html` PDP for OS-01 BODY MOISTURIZER from the Figma design at file `ttnXSyu0hen75971OQWakO`, node `253:4555`, with body-isolated CSS in `assets/body/`.

**Architecture:** Single self-contained HTML file (`body.html`) at the repo root, sibling to `index.html`. CSS split per-section into `assets/body/section-*.css` plus `assets/body/base.css` for tokens. No reuse of existing `assets/section-*.css` or `assets/base.css` — those reflect the outdated FACE styling. All 35 image assets already in `assets/images/body/`.

**Tech Stack:** HTML, CSS (vanilla, custom properties), minimal JS for accordions/carousels (reuse `assets/component-*.js` only where they're not styling-coupled). Static file served by `npx serve` on port 3010 (config in `.claude/launch.json`). Verified via Claude Preview MCP.

**Design doc:** [docs/plans/2026-04-29-body-pdp-design.md](2026-04-29-body-pdp-design.md)

---

## Pre-flight: project conventions

- **Indent:** 2 spaces (matches `index.html`).
- **Class naming:** BEM-ish dashes. Use `.section-name__element--modifier`, no Tailwind.
- **Design tokens:** Custom properties on `:root` in `assets/body/base.css`. Pull token names and values from the Figma design context per section, NOT from the FACE `index.html`.
- **Image refs:** `assets/images/body/imgImage.png` etc. (filenames are already on disk).
- **Verification:** After each section, use Claude Preview MCP — `preview_start` (once, at the beginning), `preview_eval` to navigate to `/body.html`, `preview_snapshot` for structure, `preview_screenshot` for visual proof, `preview_console_logs` for errors. Compare against the Figma screenshot.
- **Skipped image:** `assets/images/body/imgFrame451.png` is malformed and crashed the previous session. Don't pass it to `Read`. If layout requires inspecting it, use `file` or `xxd` on the bytes via Bash.
- **Commits:** Confirm with the user before committing — the plan lists commit steps but the executing session should ask "OK to commit Section X?" before running them.

---

## Task 1: Scaffold `body.html` and `assets/body/` directory

**Files:**
- Create: `body.html`
- Create: `assets/body/base.css`
- Create: `assets/body/section-product-hero.css` (empty)
- Create: `assets/body/section-purchase-widget.css` (empty)
- Create: `assets/body/section-details-accordion.css` (empty)
- Create: `assets/body/section-bento-benefits.css` (empty)
- Create: `assets/body/section-timeline.css` (empty)
- Create: `assets/body/section-clinical-stats.css` (empty)
- Create: `assets/body/section-science-module.css` (empty)
- Create: `assets/body/section-faqs.css` (empty)
- Create: `assets/body/section-lifestyle-footer.css` (empty)

**Step 1.1: Pull Figma root context for global tokens**

Call `mcp__figma__get_design_context` with `nodeId=253:4555`, `fileKey=ttnXSyu0hen75971OQWakO`, `excludeScreenshot=true` (already done — output cached at `.../tool-results/mcp-figma-get_design_context-1777517549629.txt`). Extract token defs from the file's intro text (block 3 of the JSON array) — look for "These styles are contained in the design".

**Step 1.2: Write `assets/body/base.css`**

Tokens identified so far from Figma response:
- White: `#FFFFFF`
- Black: `#000000`
- Light Viridian: `#DCE5DF`
- Body 1/Medium: `PP Neue Montreal`, Medium, 14px, weight 500, line-height 1.3
- (More tokens to be discovered per-section as we go — add to `base.css` then.)

Initial content:
```css
:root {
  --color-white: #ffffff;
  --color-black: #000000;
  --color-viridian-light: #dce5df;

  --font-sans: 'PP Neue Montreal', 'DM Sans', system-ui, sans-serif;
  --font-serif: 'OTT Neuf', 'Playfair Display', Georgia, serif;

  --container-max: 1440px;
  --container-padding: 48px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-font-smoothing: antialiased; }
body {
  font-family: var(--font-sans);
  color: var(--color-black);
  background: var(--color-white);
  line-height: 1.3;
  overflow-x: hidden;
}
img { max-width: 100%; height: auto; display: block; }
a { color: inherit; text-decoration: none; }
button { font-family: inherit; cursor: pointer; border: none; background: none; padding: 0; }
ul, ol { list-style: none; }
```

**Step 1.3: Write `body.html` skeleton**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>OneSkin — OS-01 BODY MOISTURIZER</title>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:ital@1&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="assets/body/base.css">
  <link rel="stylesheet" href="assets/body/section-product-hero.css">
  <link rel="stylesheet" href="assets/body/section-purchase-widget.css">
  <link rel="stylesheet" href="assets/body/section-details-accordion.css">
  <link rel="stylesheet" href="assets/body/section-bento-benefits.css">
  <link rel="stylesheet" href="assets/body/section-timeline.css">
  <link rel="stylesheet" href="assets/body/section-clinical-stats.css">
  <link rel="stylesheet" href="assets/body/section-science-module.css">
  <link rel="stylesheet" href="assets/body/section-faqs.css">
  <link rel="stylesheet" href="assets/body/section-lifestyle-footer.css">
</head>
<body>
  <!-- Sections will be added in subsequent tasks -->
</body>
</html>
```

**Step 1.4: Touch all empty CSS files** so the `<link>` tags don't 404.

```bash
touch assets/body/section-product-hero.css \
      assets/body/section-purchase-widget.css \
      assets/body/section-details-accordion.css \
      assets/body/section-bento-benefits.css \
      assets/body/section-timeline.css \
      assets/body/section-clinical-stats.css \
      assets/body/section-science-module.css \
      assets/body/section-faqs.css \
      assets/body/section-lifestyle-footer.css
```

**Step 1.5: Verify scaffold loads**

```
mcp__Claude_Preview__preview_start name="dev"
mcp__Claude_Preview__preview_eval code="window.location.href = '/body.html'"
mcp__Claude_Preview__preview_console_logs
```
Expected: empty page, no 404s in network, no console errors.

**Step 1.6: Commit (after user OK)**

```bash
git add body.html assets/body/
git commit -m "scaffold body.html and assets/body/ for OS-01 BODY PDP"
```

---

## Task 2: Header

**Files:**
- Modify: `body.html` (insert header markup)
- Create: `assets/body/section-header.css` (add to `<link>` tags in `body.html`)

**Step 2.1: Pull Figma context for header**

Header is at the top of node `253:4556`. From cached Figma response: nav (Shop / Mission / Learn) on left at `left-[10px] top-[10px]`, OS Wordmark center (`-translate-x-1/2 left-1/2`), Account + Cart right at `left-[1161px]`. Wordmark sub-asset is `OsWordmark` SVG component — present as inline SVG.

If more detail needed, call `mcp__figma__get_design_context` with `nodeId=253:4556`, `excludeScreenshot=false`.

**Step 2.2: Write the header markup in `body.html`**

```html
<header class="header">
  <div class="header__inner">
    <nav class="header__nav">
      <a href="#" class="header__nav-link">Shop</a>
      <a href="#" class="header__nav-link">Mission</a>
      <a href="#" class="header__nav-link">Learn</a>
    </nav>
    <a href="/" class="header__logo" aria-label="OneSkin">
      <!-- Inline OS Wordmark SVG (paste from Figma export's OsWordmark component) -->
    </a>
    <div class="header__actions">
      <a href="#" class="header__nav-link">Account</a>
      <button class="header__cart" aria-label="Cart">
        <!-- Cart icon SVG -->
        <span class="header__cart-count">0</span>
      </button>
    </div>
  </div>
</header>
```

**Step 2.3: Write `assets/body/section-header.css`**

Match the Figma:
- 60px height
- Gradient background `linear-gradient(to bottom, #fff, rgba(255,255,255,0.8))`
- 48px horizontal padding
- Nav 48px gap, 16px Arial regular text
- Wordmark absolute-center
- Sticky positioning

(Exact values to be filled when implementing — read the Figma sub-node first.)

**Step 2.4: Add `<link>` for `section-header.css` to `body.html`**

**Step 2.5: Verify in preview**

```
mcp__Claude_Preview__preview_eval code="window.location.reload()"
mcp__Claude_Preview__preview_screenshot
mcp__Claude_Preview__preview_inspect selector=".header"
```
Compare screenshot to Figma. Confirm 60px height, centered wordmark, no console errors.

**Step 2.6: Commit (after user OK)**

```bash
git add body.html assets/body/section-header.css
git commit -m "add header section to body PDP"
```

---

## Task 3: Product Hero (Section A)

**Files:**
- Modify: `body.html`
- Modify: `assets/body/section-product-hero.css`

**Step 3.1: Pull Figma context for the hero block**

Hero container is `258:6055` (at `top-[90px]`, contains gallery + info side-by-side). Sub-nodes:
- Gallery column `258:6053` (613px wide)
- Info column `254:5744` (flex-1)

Call `mcp__figma__get_design_context` with `nodeId=258:6055`. Large response — request specific sub-nodes if it exceeds limits.

**Step 3.2: Implement gallery (left column)**

Layout per Figma:
- Main image (aspect-ratio 1, full-width 613px) — `imgImage.png` + `imgImage1.png` overlay
- Below: 4-thumb wrap-flex grid, each 304×304px, 6/5px gap — `imgImage63.png`, `imgImage64.png`, `imgImage65.png`, `imgImage66.png`
- Border-radius 4px on each

**Step 3.3: Implement info (right column)**

Sub-blocks per Figma:
- A1 Product Name "BODY MOISTURIZER" — `OTT Neuf Regular`, 32px, tracking 1.28px, with `OS01_Peptide_Logo_Black 1` mini-logo above
- Star rating + review count (`imgFrame155.png`)
- A2 One-line description
- A3 Adjectives row (3 items separated by Vector divider)
- A4 Benefit one-liners
- "Best Seller" badge (absolute-positioned at `top-[115px] left-[584px]`)

**Step 3.4: Write CSS in `section-product-hero.css`**

Use grid `613px 1fr` with 80px gap, padding 90px on top, 70px left.

**Step 3.5: Verify in preview**

```
mcp__Claude_Preview__preview_eval code="window.location.reload()"
mcp__Claude_Preview__preview_screenshot
mcp__Claude_Preview__preview_snapshot
```
Compare 613px gallery width, "BODY MOISTURIZER" headline, 4-thumb grid alignment.

**Step 3.6: Commit (after user OK)**

```bash
git add body.html assets/body/section-product-hero.css
git commit -m "add product hero section to body PDP"
```

---

## Task 4: Purchase Subscription Widget (Section B)

**Files:** `body.html`, `assets/body/section-purchase-widget.css`

**Step 4.1: Get Figma context** for SECTION B node (search by `data-name="SECTION B - Purchase Subscription Widget"` — the node ID is in the cached Figma response; grep for it).

**Step 4.2: Implement markup** — radio group (Core / Refill / Core+Refill), B1 "Reasons to subscribe" 3-item list, B2 "Extra benefit", certifications row (Cruelty Free, Non-Comedogenic, etc.), Add to Cart CTA.

**Step 4.3: Write CSS** to match.

**Step 4.4: Verify** — radio interaction works (click each variant, snapshot to confirm state change), CTA visible, no console errors.

**Step 4.5: Commit.**

---

## Task 5: Details Accordion (Section C)

**Files:** `body.html`, `assets/body/section-details-accordion.css`

**Step 5.1:** Find SECTION C node (`data-name="SECTION C - Details Accordion"`). Get Figma context.

**Step 5.2:** Markup — collapsed sections list, each row with title + chevron.

**Step 5.3:** CSS — match Figma. Reuse `assets/component-accordion.js` if its API is markup-driven and doesn't depend on FACE-specific classes (read the file first; if coupled, copy to `assets/body/component-accordion.js`).

**Step 5.4:** Verify — click each row, snapshot to confirm expand/collapse.

**Step 5.5:** Commit.

---

## Task 6: Bento Benefits (Section E) — "What BODY users report"

**Files:** `body.html`, `assets/body/section-bento-benefits.css`

**Step 6.1:** Figma — heading at `260:6816` ("What BODY users report"), bento layout below. Get context for the parent `258:6058` (E1 region).

**Step 6.2:** Markup — section title + image-card bento grid using the SectionEHeroBenefits images (`imgSectionEHeroBenefits1/2/3.png` + `imgSectionEHeroBenefits.png`).

**Step 6.3:** CSS bento grid — match Figma proportions.

**Step 6.4:** Verify — screenshot, compare bento layout to Figma.

**Step 6.5:** Commit.

---

## Task 7: Timeline (Section F)

**Files:** `body.html`, `assets/body/section-timeline.css`

**Step 7.1:** Get Figma context for F1 region. Headline "Timeline headline" (24 chars max).

**Step 7.2:** Markup — headline + ordered timeline cards. Use `imgRectangle341.png` through `imgRectangle346.png` for card imagery.

**Step 7.3:** CSS — match Figma.

**Step 7.4:** Verify.

**Step 7.5:** Commit.

---

## Task 8: Clinical B/A (Section G)

**Files:** `body.html`, `assets/body/section-clinical-stats.css`

**Step 8.1:** Get Figma context for G2 region (B/A result).

**Step 8.2:** Markup — landscape B/A imagery + stat metrics (3+ data points, "B/A result, 50 chars max excluding metric").

**Step 8.3:** CSS.

**Step 8.4:** Verify.

**Step 8.5:** Commit.

---

## Task 9: OS-01 Science Module (Section I)

**Files:** `body.html`, `assets/body/section-science-module.css`

**Step 9.1:** Get Figma context for I1 region. Module header (32 chars max), I2 content, I3 link to OS-01 Science page (24 chars max).

**Step 9.2:** Markup — header + content + link.

**Step 9.3:** CSS.

**Step 9.4:** Verify.

**Step 9.5:** Commit.

---

## Task 10: FAQs (Section K)

**Files:** `body.html`, `assets/body/section-faqs.css`

**Step 10.1:** Get Figma context for K2/K3 nodes (`254:5909`, `254:5919`, `254:5923`, `254:5928` are mentioned as Q/A pairs in cached Figma response).

**Step 10.2:** Markup — accordion list of Q/A pairs.

**Step 10.3:** CSS — match Figma.

**Step 10.4:** Verify — click each Q to expand A, snapshot.

**Step 10.5:** Commit.

---

## Task 11: Lifestyle hero + footer

**Files:** `body.html`, `assets/body/section-lifestyle-footer.css`

**Step 11.1:** Bottom of Figma (`top-[7037px]` lifestyle image carousel `260:6819`, `top-[7585px]` footer cards `260:6880`, `top-[7658px]` big lifestyle image `253:4890`).

**Step 11.2:** Markup — image carousel row + big lifestyle image + footer.

**Step 11.3:** CSS.

**Step 11.4:** Verify — full-page screenshot, scroll through entire page.

**Step 11.5:** Commit.

---

## Task 12: Final review

**Step 12.1: Full-page screenshot at 1440px**

```
mcp__Claude_Preview__preview_resize width=1440 height=900
mcp__Claude_Preview__preview_eval code="window.scrollTo(0, 0)"
mcp__Claude_Preview__preview_screenshot
```

**Step 12.2: Console check**

```
mcp__Claude_Preview__preview_console_logs
```
Expected: no errors, no 404s.

**Step 12.3: Network check**

```
mcp__Claude_Preview__preview_network
```
Expected: all images and CSS files load 200.

**Step 12.4: Compare to Figma screenshot**

Get a fresh Figma screenshot of the full page (`mcp__figma__get_screenshot nodeId=253:4555 fileKey=ttnXSyu0hen75971OQWakO`) and place side-by-side with `body.html` screenshot. Note any deltas.

**Step 12.5: Decision point**

Either:
- Deltas are minor → fix inline and commit a "polish" commit.
- Deltas are significant → spawn a polish task (use `/polish` skill or `superpowers:requesting-code-review`).

---

## Out of scope (do not implement in this plan)

- Liquid theme migration (`templates/product.body.json`, `sections/body-*.liquid`)
- Mobile/responsive
- Updating FACE PDP to match new design system

## Done criteria

- `body.html` renders without console errors at 1440px desktop
- All 10 sections present, top-to-bottom matching Figma order
- Visual comparison to Figma frame `253:4555` shows no major deltas (spacing, typography, colors within token system)
- All commits pass pre-commit hooks (if any)
