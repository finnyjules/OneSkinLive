# PDP Full CSS Rewrite + Lenis Smooth Scrolling

**Date:** 2026-03-03
**Figma:** https://www.figma.com/design/ANSGe81Nx8Q6phAC9BQjyZ/Oneskin-%E2%80%A2-Website-2026?node-id=1391-2505&m=dev

## Goal

Rewrite all CSS for the product detail page (PDP) from scratch to match the Figma design pixel-perfectly. Add Lenis smooth scrolling library for buttery page scroll.

## Approach

- **Full CSS rewrite** — all section CSS files rewritten from scratch using existing design tokens
- **HTML preserved** — Liquid templates and Shopify schemas remain unchanged (minor wrapper tweaks only)
- **JS preserved** — all 4 existing component scripts stay as-is
- **Lenis added** — smooth scrolling for the full page, native scroll preserved for horizontal carousels

## Architecture

### Lenis Integration

- Add Lenis via CDN in `theme.liquid` (`<script>` tag + optional CSS)
- New file: `assets/lenis-init.js` — initializes Lenis, wires RAF loop
- `html` styles updated: `height: auto`, Lenis-compatible overflow
- Horizontal scroll containers get `data-lenis-prevent` to keep native scroll behavior

### CSS File Structure

All CSS rewritten from scratch per section. Each file loaded conditionally in its Liquid section:

| File | Section |
|---|---|
| `base.css` | Design tokens, font-faces, reset, shared utilities |
| `section-header.css` | Sticky nav, backdrop blur |
| `section-product-hero.css` | 2-col grid, gallery, product info, purchase card, certifications, accordion |
| `section-cross-sell.css` | "Use it with" product carousel |
| `section-shade-compare.css` | Warm background, model photo carousel, shade swatches |
| `section-science-placeholder.css` | TBD placeholder section |
| `section-key-ingredients.css` | Background image, floating ingredient cards |
| `section-clinical-results.css` | Before/after cards, stat carousel |
| `section-skincare-routine.css` | Background image, glass-morphism step cards |
| `section-faq-questions.css` | Scattered pill question bubbles |
| `section-reviews.css` | Rating summary, photo review carousel |
| `section-lifestyle-hero.css` | Full-width lifestyle image |

### Design Token System (Preserved)

```css
:root {
  --color-primary: #cfede1;
  --color-primary-dark: #246048;
  --color-accent-green: #49a480;
  --color-bg: #ffffff;
  --color-text: #000000;
  --color-muted: #808080;
  --color-muted-light: #adadad;
  --color-border: #e1e1e1;
  --color-surface: #f8f8f8;
  --color-surface-light: #f6f5f5;
  --color-surface-green: #f3fbf8;
  --color-warm: #dfaf8e;
  --font-sans: 'PP Neue Montreal', Arial, Helvetica, sans-serif;
  --font-serif: 'Test Martina Plantijn', Georgia, 'Times New Roman', serif;
  --container-max: 1440px;
  --container-padding: 48px;
  --section-gap: 64px;
  --content-max: 1295px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 100px;
  --shadow-sm: 0px 4px 16px rgba(0, 0, 0, 0.1);
  --shadow-md: 0px 8px 16px rgba(0, 0, 0, 0.25);
  --shadow-lg: 0px 16px 16px rgba(0, 0, 0, 0.25);
  --shadow-card: 0px 4px 32px rgba(0, 0, 0, 0.1);
}
```

## Section Details

### 1. Header (60px)
- Sticky, `backdrop-filter: blur(10px)`
- Gradient: white to 80% transparent white
- Logo centered, nav links left, account/cart right
- Cart badge: `--color-primary` circle with count

### 2. Product Hero (Two-Column)
- **Left (613px):** Sticky image gallery grid (2-col sub-grid below main image). Main image: square aspect ratio. Thumbnails: 304px square. Quote cards: `--color-surface-green` background, serif italic font.
- **Right (1fr):** Title 32px/500, rating 32px right-aligned with star row. Short description + review count row. Adjective pills (12px/500, `--color-surface-light`, `--radius-full`). Shade selector with 40px circle swatches. Bullet list (14px/400, 0.56px tracking, 21px line-height).
- **Purchase Card:** Green gradient background (`--color-green-overlay-start` to `--color-green-overlay-end`). Three radio options (monthly/bimonthly/one-time). Selected state: `--color-primary` bg + 2px border. Recommended badge: white pill, 10px text. Subscription reasons list. Gift with purchase: product thumbnail + name/size + strikethrough price/"Free". CTA: full-width black button, 48px height, 20px text with strikethrough + bold price. Free shipping note below CTA.
- **Certifications:** 3 badges in row with icons (40px height, 80% opacity) + 12px text.
- **Accordion:** Items with title (20px/500) + flex line separator + "+" icon. Line is 1px, `opacity: 0.2`. Expand/collapse with max-height transition.

### 3. Cross-sell ("Use it with")
- Section header: title + line + carousel nav arrows (32px circle buttons)
- Horizontal carousel of product cards
- Each card: product image with shadow, title 20px, description 12px, star rating, outline CTA button "ADD TO CART $70"
- Dot navigation below

### 4. Shade Compare (553px)
- `--color-warm` (#dfaf8e) background, rounded-lg
- Background model image covering section
- Header: "Compare shades" 24px white + carousel nav
- Horizontal carousel of model photos (328px wide, 388px tall, rounded-sm)
- Bottom: shade swatches + current shade label + model name caption in white
- Dot navigation

### 5. Science Placeholder (553px)
- Section header: "Science section" 24px
- Link: "Learn more about our science"
- Large "TBD" text centered (400px, opacity 20%)

### 6. Key Ingredients (553px)
- `--color-surface` background, rounded-lg
- Background molecule/science image
- Header: "Key ingredients" 24px + "See all ingredients" link
- 5 floating ingredient cards at staggered positions
- Each card: glass-morphism shadow, ingredient name 32px/500, description 12px

### 7. Clinical Results
- Header: "Clinically-validated results" 24px + carousel nav
- Horizontal carousel of result cards (535px wide, 385px tall)
- Each card: green gradient border, stat "96%" in `--color-accent-green` 40px, description 14px/500
- Before/after split layout with overlapping circle crops
- Week labels as pills
- Dot navigation

### 8. Skincare Routine (694px)
- `--color-surface` background, rounded-lg
- Background model image (right side)
- Header: "The OneSkin routine" 24px
- 4 step cards stacked vertically (left side, 335px wide)
- Active card: frosted glass (`rgba(207,237,225,0.6)` mix-blend-screen), 2px white border
- Inactive cards: `rgba(255,255,255,0.4)` background
- Each card: product image + step number + title 24px + description 12px + "See [PRODUCT]" link

### 9. FAQ Questions
- Header: "Questions" 24px
- Scattered pill-style question bubbles
- Each pill: `rgba(207,237,225,0.2)` bg, `--color-primary` border, rounded-lg, shadow
- Spark icon (16px) + question text (20px/500)
- "Powered by" attribution with logo at bottom right

### 10. Reviews
- Header: "LOREM IPSUM REVIEW" 24px
- Left column: "Average score" label, "4.7/5" large text (48px), star rating (20px), "out of 4,110 reviews"
- Horizontal photo review carousel (center card 370px, side cards 319px)
- Cards: rounded-lg, shadow
- Dot navigation

### 11. Lifestyle Hero (815px)
- Full-width image spanning content width (1297px)
- Object-fit cover

## Responsive Strategy

Desktop-first (1440px), matching Figma exactly. Then:

- **1200px:** Grid relaxes to fluid proportions, gallery unsticks
- **768px:** Single column stack. Carousels become touch-swipeable. Purchase card and accordion full-width. Gallery becomes vertical scroll.

## Files Changed

- `layout/theme.liquid` — add Lenis script tags
- `assets/lenis-init.js` — new file
- `assets/base.css` — rewrite (keep tokens + font-faces)
- `assets/section-product-hero.css` — full rewrite
- `sections/*.liquid` — add per-section CSS link tags where missing
- New CSS files for each section that lacks its own file

## Files NOT Changed

- `templates/product.pdp.json`
- `config/settings_schema.json`
- `locales/en.default.json`
- `assets/component-*.js` (all 4 JS files)
- `snippets/*.liquid` (HTML structure preserved)
