---
title: "feat: Amazon Mopper Chrome Extension"
type: feat
date: 2026-02-04
---

# ✨ Amazon Mopper Chrome Extension

## Overview

A Chrome extension that enhances Amazon's shopping experience by adding informative overlay badges with a Neobrutalism design aesthetic. The extension surfaces key purchasing insights (discounts, best value, delivery timing) while decluttering the page (removing Prime icons, truncating titles).

**Target:** All Amazon marketplaces (`*.amazon.*`)
**Architecture:** React + Vite + Shadow DOM content scripts
**Design:** Subtle Neobrutalism (2px borders, 2px offset shadows, primary colors)

## Problem Statement / Motivation

Amazon product pages are information-dense and cluttered:
- Discount percentages require mental math from strikethrough prices
- Price-per-unit comparisons require scanning multiple products
- Delivery dates require calculating days from calendar dates
- Prime badges add visual noise for non-Prime members
- Product titles are excessively long

**Goal:** Surface actionable insights at a glance while reducing visual clutter.

## Proposed Solution

Inject overlay badges via Shadow DOM content scripts that:
1. Calculate and display discount percentages from "Was" prices
2. Highlight best-value products by price-per-unit (or total price fallback)
3. Convert delivery dates to countdown format ("6 days")
4. Round prices for quick mental math (~£20)
5. Hide Prime iconography
6. Truncate long product titles

## Technical Approach

### Architecture

```
amazon-mopper/
├── src/
│   ├── content/              # Content script (injected into Amazon)
│   │   ├── index.tsx         # Entry point, Shadow DOM setup
│   │   ├── App.tsx           # Main React component
│   │   ├── components/
│   │   │   ├── Badge.tsx     # Reusable neobrutalist badge
│   │   │   ├── DiscountBadge.tsx
│   │   │   ├── BestValueBorder.tsx
│   │   │   └── DeliveryCountdown.tsx
│   │   ├── hooks/
│   │   │   ├── useSettings.ts
│   │   │   └── useMutationObserver.ts
│   │   ├── lib/
│   │   │   ├── selectors.ts  # DOM selector chains
│   │   │   ├── parsers.ts    # Price, date, unit parsing
│   │   │   ├── calculators.ts # Discount %, days until
│   │   │   └── debounce.ts
│   │   └── styles.css        # Neobrutalism tokens
│   ├── popup/                # Settings popup
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── Popup.tsx
│   ├── background/           # Service worker
│   │   └── index.ts
│   └── types/
│       └── settings.ts
├── public/
│   └── icons/
├── manifest.config.ts        # Dynamic manifest
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

### Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Build tool | @crxjs/vite-plugin@2.0.0-beta.26 | Fixes Chrome 130 CSP issues, HMR support |
| React plugin | @vitejs/plugin-react (not SWC) | HMR compatibility with CRXJS |
| Style isolation | Shadow DOM + `?inline` CSS | Prevents style conflicts with Amazon |
| Dynamic content | MutationObserver + 100ms debounce | Handles infinite scroll, AJAX nav |
| Settings storage | chrome.storage.sync | Cross-device persistence |
| CSS units | px only (not rem) | Rem breaks on sites with custom root font-size |

### DOM Selection Strategy (Hybrid)

```typescript
// src/content/lib/selectors.ts
export const PRODUCT_SELECTORS = [
  '[data-asin]:not([data-asin=""])',           // Most stable
  '[data-component-type="s-search-result"]',   // Search pages
  '.s-result-item[data-asin]',                 // Search fallback
  '.sg-col-inner',                             // Grid fallback
];

export const PRICE_SELECTORS = {
  current: ['.a-price .a-offscreen', '.a-price-whole', '.a-color-price'],
  was: ['.a-text-strike', '.a-price[data-a-strike] .a-offscreen', '.basisPrice .a-offscreen'],
  perUnit: ['.a-price[data-a-size="mini"]', '.a-size-small.a-color-secondary'],
};

export const DELIVERY_SELECTORS = [
  '#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE',
  '.a-text-bold[data-csa-c-delivery-time]',
  '[data-csa-c-type="element"][data-csa-c-content-id*="delivery"]',
];

export const PRIME_SELECTORS = [
  '.a-icon-prime',
  '[data-component-type="s-product-image"] .a-icon-prime',
  '.s-prime',
];
```

### Processing Pipeline

```typescript
// Pseudocode for content script flow
function processProduct(productEl: HTMLElement): void {
  if (productEl.dataset.mopperProcessed) return;

  const data = extractProductData(productEl);

  if (settings.showDiscountBadge && data.wasPrice && data.currentPrice) {
    const discount = calculateDiscount(data.currentPrice, data.wasPrice);
    if (discount >= 5) renderDiscountBadge(productEl, discount);
  }

  if (settings.showBestValueBorder) {
    markForBestValueComparison(productEl, data.pricePerUnit || data.currentPrice);
  }

  if (settings.showDeliveryCountdown && data.deliveryDate) {
    const days = calculateDaysUntil(data.deliveryDate);
    renderDeliveryCountdown(productEl, days, data.deliveryText);
  }

  if (settings.roundPrices && data.currentPrice) {
    renderRoundedPrice(productEl, roundPrice(data.currentPrice));
  }

  if (settings.hidePrimeIcons) {
    hidePrimeIcons(productEl);
  }

  if (settings.truncateTitles && data.title?.length > 50) {
    renderTruncatedTitle(productEl, truncate(data.title, 50));
  }

  productEl.dataset.mopperProcessed = 'true';
}
```

### Settings Interface

```typescript
// src/types/settings.ts
export interface Settings {
  showDiscountBadge: boolean;     // Default: true
  showBestValueBorder: boolean;   // Default: true
  showDeliveryCountdown: boolean; // Default: true
  roundPrices: boolean;           // Default: true
  hidePrimeIcons: boolean;        // Default: false (opt-in)
  truncateTitles: boolean;        // Default: true
}

export const DEFAULT_SETTINGS: Settings = {
  showDiscountBadge: true,
  showBestValueBorder: true,
  showDeliveryCountdown: true,
  roundPrices: true,
  hidePrimeIcons: false,  // Opt-in to avoid confusing Prime members
  truncateTitles: true,
};
```

### Neobrutalism Design Tokens

```css
/* src/content/styles.css */
:host {
  --border-width: 2px;
  --border-color: #000000;
  --border-radius: 0;
  --shadow: 2px 2px 0 #000000;

  --color-discount: #FFFF00;
  --color-best-value: #00FF00;
  --color-delivery: #FFFFFF;
  --color-red: #FF0000;

  --font-family: system-ui, -apple-system, sans-serif;
  --font-weight: 700;
  --font-size-badge: 11px;
}

.badge {
  position: absolute;
  top: 4px;
  left: 4px;
  padding: 4px 8px;
  border: var(--border-width) solid var(--border-color);
  box-shadow: var(--shadow);
  font-family: var(--font-family);
  font-weight: var(--font-weight);
  font-size: var(--font-size-badge);
  text-transform: uppercase;
  z-index: 100;
}
```

## Edge Case Decisions

| Scenario | Behavior |
|----------|----------|
| No "Was" price | Skip discount badge for that product |
| Discount < 5% | Don't show badge (too small to matter) |
| Discount > 90% | Show badge but cap display at 90% (data error likely) |
| Price increase (negative discount) | Don't show badge |
| Only 1 product on page | Still show "Best Value" if it qualifies |
| Tied best value | All tied products get border |
| No price-per-unit | Fall back to total price comparison |
| Mixed units (kg vs item) | Only compare products with matching units |
| Delivery date range ("Feb 10-15") | Use earliest date for countdown |
| "Delivery date pending" | Don't show countdown |
| Past delivery date | Don't show countdown |
| Already round price (£20.00) | Show "£20" (no tilde) |
| Price ending in .50 | Round to nearest (£19.50 → ~£20) |
| Title under 50 chars | Leave unchanged |

## Acceptance Criteria

### Functional Requirements

- [ ] Extension installs from Chrome Web Store (or loads unpacked)
- [ ] Badges appear on Amazon search results within 500ms of page load
- [ ] Badges appear on dynamically loaded products (infinite scroll)
- [ ] Settings persist across browser sessions and devices
- [ ] Toggling a setting immediately updates the page (no refresh needed)
- [ ] Works on amazon.com, amazon.co.uk, amazon.de, amazon.fr, amazon.jp

### Feature: Discount Badge
- [ ] Shows "🔥 X% OFF" for products with strikethrough prices
- [ ] Calculates percentage correctly: `((was - current) / was) * 100`
- [ ] Only shows when discount ≥ 5%
- [ ] Yellow background (#FFFF00), positioned top-left

### Feature: Best Value Border
- [ ] Adds green border to product(s) with lowest price-per-unit
- [ ] Falls back to total price when per-unit not available
- [ ] Shows "⭐ BEST VALUE" badge on bordered products
- [ ] Recalculates when new products load

### Feature: Delivery Countdown
- [ ] Shows "📦 X days" next to Amazon's delivery date
- [ ] Calculates days from current date to delivery date
- [ ] Handles various date formats across marketplaces
- [ ] Shows "Tomorrow" instead of "1 day"

### Feature: Price Rounding
- [ ] Displays "~£20" for £19.99
- [ ] Uses correct currency symbol from page
- [ ] Rounds to nearest whole number

### Feature: Prime Icon Removal
- [ ] Hides Prime delivery badges when enabled
- [ ] Does not affect other page functionality
- [ ] Default: OFF (opt-in feature)

### Feature: Title Truncation
- [ ] Truncates titles longer than 50 characters
- [ ] Adds "..." at word boundary
- [ ] Shows full title on hover (tooltip)

### Non-Functional Requirements

- [ ] Badge rendering < 50ms per product
- [ ] Total page overhead < 100ms
- [ ] Extension size < 500KB (excluding source maps)
- [ ] No external API calls (all processing local)
- [ ] No data collection or telemetry

## Success Metrics

| Metric | Target |
|--------|--------|
| Install success rate | >95% |
| Page load impact | <100ms added |
| Selector success rate | >90% products parsed |
| User settings saved | 100% persistence |

## Dependencies & Risks

### Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| @crxjs/vite-plugin | ^2.0.0-beta.26 | Chrome extension bundling |
| @vitejs/plugin-react | ^4.x | React HMR |
| react | ^18.x | UI components |
| typescript | ^5.x | Type safety |
| tailwindcss | ^3.x | Utility classes |
| bun | ^1.x | Package manager |

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Amazon DOM changes | High | Medium | Hybrid selector strategy with fallbacks |
| Chrome API changes | Low | High | Pin to stable manifest v3 APIs |
| CRXJS plugin issues | Medium | Medium | Monitor GitHub issues, have WXT as fallback |
| Style leakage | Low | Low | Shadow DOM isolation |

## Implementation Phases

### Phase 1: Project Setup & Infrastructure
- [x] Initialize project with Bun + Vite + React + TypeScript
- [x] Configure @crxjs/vite-plugin with manifest v3
- [x] Set up Shadow DOM content script injection
- [x] Implement chrome.storage.sync settings manager
- [x] Create settings popup with feature toggles

**Files:**
- `package.json`
- `vite.config.ts`
- `manifest.config.ts`
- `tailwind.config.ts`
- `tsconfig.json`
- `src/content/index.tsx`
- `src/popup/Popup.tsx`
- `src/types/settings.ts`

### Phase 2: Core Processing Engine
- [x] Implement DOM selector chains with fallbacks
- [x] Build price/date/unit parsers for multi-marketplace support
- [x] Create MutationObserver with debounced processing
- [x] Add product tracking (processed marker)

**Files:**
- `src/content/lib/selectors.ts`
- `src/content/lib/parsers.ts`
- `src/content/lib/calculators.ts`
- `src/content/hooks/useMutationObserver.ts`

### Phase 3: Feature Implementation
- [x] Discount badge component
- [x] Best value border + badge component
- [x] Delivery countdown component
- [x] Price rounding display
- [x] Prime icon hider
- [x] Title truncation with tooltip

**Files:**
- `src/content/components/Badge.tsx`
- `src/content/components/DiscountBadge.tsx`
- `src/content/components/BestValueBorder.tsx`
- `src/content/components/DeliveryCountdown.tsx`
- `src/content/App.tsx`

### Phase 4: Polish & Testing
- [ ] Test across 5+ marketplaces
- [ ] Performance profiling and optimization
- [ ] Edge case handling
- [x] Build production bundle
- [x] Create extension icons

**Files:**
- `public/icons/icon16.png`
- `public/icons/icon48.png`
- `public/icons/icon128.png`

## References & Research

### Internal References
- Brainstorm: `docs/brainstorms/2026-02-04-amazon-mopper-brainstorm.md`

### External References
- [@crxjs/vite-plugin Documentation](https://crxjs.dev)
- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)
- [Shadow DOM MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM)
- [MutationObserver Performance](https://developer.chrome.com/blog/detect-dom-changes-with-mutation-observers)

### Research Notes
- Use `@crxjs/vite-plugin@2.0.0-beta.26` to fix Chrome 130 CSP issues
- Use `@vitejs/plugin-react` (not SWC) for HMR compatibility
- Import CSS with `?inline` suffix for Shadow DOM injection
- TailwindCSS rem units break on sites with custom root font-size - use px
- Register service worker event listeners synchronously at top level
