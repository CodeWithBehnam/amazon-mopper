# Amazon Mopper - Chrome Extension Brainstorm

**Date:** 2026-02-04
**Status:** Ready for Planning

## What We're Building

A Chrome extension that enhances Amazon's shopping experience by adding informative overlay badges with a Neobrutalism design aesthetic. The extension declutters Amazon pages and surfaces key purchasing insights.

### Core Features

| Feature | Behavior |
|---------|----------|
| **Discount Badge** | Show "X% OFF" calculated from "Was: £X" strikethrough prices |
| **Best Value Border** | Highlight products with lowest price-per-unit on the page |
| **Delivery Countdown** | Append "(X days)" to Amazon's delivery dates |
| **Price Rounding** | Display £19.99 as "~£20" for quick mental math |
| **Prime Icon Removal** | Hide Prime badges to reduce visual clutter |
| **Truncated Titles** | Smart truncation to ~50 chars with "..." |

### Scope

- **Target:** All Amazon marketplaces (*.amazon.* pattern)
- **Pages:** Search results, product pages, cart, deals, everywhere
- **Style:** Neobrutalism overlay badges only (non-invasive to Amazon's layout)
- **Settings:** Feature toggles in popup (on/off per feature)

## Why This Approach

### Architecture: Content Script + Shadow DOM

**Chosen over:**
- Vanilla JS (CSS conflict risk, harder maintenance)
- Popup-centric (poor UX, requires clicking)

**Reasons:**
1. **Shadow DOM isolation** - Our neobrutalist styles won't clash with Amazon's CSS
2. **React components** - Reusable badges across all page types
3. **Vite + Bun** - Fast development with HMR, matches your preferred stack
4. **Maintainability** - Component structure scales as features grow

### Data Strategy: Parse Amazon's Own Data

No external APIs needed. We extract:
- "Was" prices from strikethrough elements
- Price-per-unit from Amazon's existing display
- Delivery dates from delivery estimate elements

This keeps the extension lightweight and avoids API costs/rate limits.

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Price history source | Amazon's "Was" prices | No external API dependency |
| Border highlight logic | Lowest price-per-unit | Most useful comparison metric |
| Price-per-unit fallback | Total price comparison | Always have a comparison metric |
| Description handling | Smart truncation (~50 chars) | Simple, no AI dependency |
| Style application | Overlay badges only | Non-invasive, less breakage risk |
| Delivery format | Keep date + add "(X days)" | Most informative |
| Page scope | All Amazon pages | Consistent experience |
| Marketplace scope | All Amazon sites (*.amazon.*) | Dynamic currency detection |
| Settings | Feature toggles in popup | Simple on/off, stored in chrome.storage.sync |

## Technical Implementation

### DOM Selection Strategy (Hybrid Approach)

Priority order for finding product elements:
1. **Data attributes** - `data-asin`, `data-component-type` (most stable)
2. **Semantic HTML** - `article`, `section` with product-like content
3. **CSS class fallbacks** - Multiple selectors tried in sequence
4. **Text pattern matching** - For prices, delivery dates

```typescript
// Example selector chain
const PRODUCT_SELECTORS = [
  '[data-asin]:not([data-asin=""])',
  '[data-component-type="s-search-result"]',
  '.s-result-item',
  '.sg-col-inner'
];
```

### Dynamic Content Handling

**MutationObserver + Debounce Pattern:**

```typescript
const observer = new MutationObserver(
  debounce((mutations) => {
    const newProducts = findUnprocessedProducts();
    newProducts.forEach(enhance);
  }, 100)
);

observer.observe(document.body, {
  childList: true,
  subtree: true
});
```

### Currency Detection

Parse currency from page rather than hardcoding:

```typescript
// Extract currency symbol from first price found
const priceEl = document.querySelector('.a-price-symbol');
const currency = priceEl?.textContent || '£'; // fallback
```

### Settings Storage

```typescript
// chrome.storage.sync - persists across devices
interface Settings {
  showDiscountBadge: boolean;
  showBestValueBorder: boolean;
  showDeliveryCountdown: boolean;
  roundPrices: boolean;
  hidePrimeIcons: boolean;
  truncateTitles: boolean;
}
```

## Tech Stack

```
├── bun              # Package manager & runtime
├── vite             # Build tool with HMR
├── react            # UI components
├── typescript       # Type safety
├── tailwindcss      # Styling (neobrutalism utilities)
└── @crxjs/vite-plugin  # Chrome extension Vite integration
```

## Neobrutalism Design Tokens

**Style:** Subtle neobrutalism - noticeable but not overwhelming on Amazon's dense UI

```css
/* Borders */
--border-width: 2px;
--border-color: #000000;
--border-radius: 0;           /* Sharp corners */

/* Shadows */
--shadow-offset: 2px;
--shadow: 2px 2px 0 #000000;  /* Subtle offset shadow */

/* Primary Colors (Classic Neo Palette) */
--color-red: #FF0000;         /* Alerts, high discounts */
--color-yellow: #FFFF00;      /* Discounts, warnings */
--color-blue: #0000FF;        /* Info, delivery */
--color-black: #000000;       /* Borders, text */
--color-white: #FFFFFF;       /* Backgrounds */

/* Badge-Specific Colors */
--badge-discount-bg: #FFFF00;  /* Yellow for deals */
--badge-best-value-bg: #00FF00; /* Green for best price */
--badge-delivery-bg: #FFFFFF;  /* White for delivery */

/* Typography */
--font-family: system-ui, -apple-system, sans-serif;
--font-weight: 700;            /* Bold */
--font-size-badge: 11px;
--font-size-price: 14px;
--text-transform: uppercase;
```

### Badge Visual Spec

```
┌──────────────────┐
│ 🔥 25% OFF      │  ← 2px black border
└──────────────────┘  ← 2px offset shadow (down-right)
   ↑
Yellow background (#FFFF00)
Black bold text (11px, uppercase)
Padding: 4px 8px
```

## Resolved Questions

| Question | Resolution |
|----------|------------|
| Multi-marketplace support? | ✅ All Amazon sites via `*.amazon.*` pattern |
| Settings panel? | ✅ Feature toggles in popup |
| Price-per-unit fallback? | ✅ Fall back to total price comparison |
| DOM selector stability? | ✅ Hybrid approach with fallback chain |
| Dynamic content handling? | ✅ MutationObserver + debounce |

## Badge Design

| Element | Decision |
|---------|----------|
| Icons | Emoji (🔥 deals, ⭐ best value, 📦 delivery) |
| Position | Top-left corner of product cards |
| Stack order | Discount badge on top, then best value, then delivery |

**Badge examples:**
```
┌─────────────────────────────┐
│ 🔥 25% OFF                  │
│ ⭐ BEST VALUE               │
├─────────────────────────────┤
│                             │
│    [Product Image]          │
│                             │
├─────────────────────────────┤
│ Product Title Here...       │
│ ~£20 (was £25)              │
│ 📦 Arrives Feb 10 (6 days)  │
└─────────────────────────────┘
```

## Out of Scope (YAGNI)

- Price history tracking/storage
- Price drop notifications
- Wishlist integration
- Cross-site price comparison
- AI-powered summaries

## Next Steps

Run `/workflows:plan` to create the implementation plan.
