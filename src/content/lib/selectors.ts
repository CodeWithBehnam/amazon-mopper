// DOM selector chains with fallbacks for Amazon's frequently changing DOM

// Product container selectors (ordered by stability)
export const PRODUCT_SELECTORS = [
  '[data-asin]:not([data-asin=""])',
  '[data-component-type="s-search-result"]',
  '.s-result-item[data-asin]',
  '.sg-col-inner',
  '[data-cel-widget*="MAIN-SEARCH"]',
]

// Price selectors
export const PRICE_SELECTORS = {
  // Current price
  current: [
    '.a-price .a-offscreen',
    '.a-price-whole',
    '.a-color-price',
    '.a-text-price .a-offscreen',
    '[data-a-color="price"] .a-offscreen',
  ],
  // "Was" / strikethrough price
  was: [
    '.a-text-strike',
    '.a-price[data-a-strike="true"] .a-offscreen',
    '.basisPrice .a-offscreen',
    '.a-text-price[data-a-strike="true"] .a-offscreen',
  ],
  // Price per unit
  perUnit: [
    '.a-price[data-a-size="mini"] .a-offscreen',
    '.a-size-small.a-color-secondary',
    '[data-a-size="mini"] .a-offscreen',
  ],
}

// Delivery date selectors - ordered by specificity
export const DELIVERY_SELECTORS = [
  // Search results page selectors
  '[data-csa-c-delivery-time]',
  '[data-csa-c-delivery-price]',
  '.a-row.a-size-base.a-color-secondary.s-align-children-center',
  // Product page selectors
  '#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE',
  '#delivery-message',
  '#deliveryMessageMirId',
  '.a-color-success.a-text-bold',
]

// Prime icon selectors
export const PRIME_SELECTORS = [
  '.a-icon-prime',
  '[data-component-type="s-product-image"] .a-icon-prime',
  '.s-prime',
  '.aok-relative .a-icon-prime',
  'i.a-icon-prime',
]

// Product title selectors
export const TITLE_SELECTORS = [
  '.a-size-medium.a-color-base.a-text-normal',
  '.a-size-base-plus.a-color-base.a-text-normal',
  'h2 a span',
  '.a-link-normal .a-text-normal',
  '[data-cy="title-recipe"] h2 span',
]

// Delivery clutter selectors - text to hide below price
// These match the container rows with savings/delivery text
export const DELIVERY_CLUTTER_SELECTORS = [
  // "Save X% on any..." savings promotion text
  '.a-row .a-size-base.a-color-secondary:not(.mopper-delivery-badge)',
  // Delivery text rows
  '.a-row.a-size-base.a-color-secondary',
  // Free delivery message containers
  '[data-cy="delivery-recipe"]',
  // Generic delivery area rows
  '.a-row.s-align-children-center',
]

// Text patterns that identify delivery clutter lines to hide
export const DELIVERY_CLUTTER_PATTERNS = [
  /save\s+\d+%/i,
  /^(?:\s*)?tomorrow\s*$/i,
  /free\s+delivery/i,
  /fastest\s+delivery/i,
]

// Product image container (for badge positioning)
export const IMAGE_CONTAINER_SELECTORS = [
  '.s-image-square-aspect',
  '.s-product-image-container',
  '.a-section.aok-relative',
  '[data-component-type="s-product-image"]',
]

/**
 * Try multiple selectors and return the first match
 */
export function querySelector(
  parent: Element | Document,
  selectors: string[]
): Element | null {
  for (const selector of selectors) {
    try {
      const element = parent.querySelector(selector)
      if (element) return element
    } catch {
      // Selector might be invalid, continue to next
      continue
    }
  }
  return null
}

/**
 * Try multiple selectors and return all matches
 */
export function querySelectorAll(
  parent: Element | Document,
  selectors: string[]
): Element[] {
  const results = new Set<Element>()
  for (const selector of selectors) {
    try {
      const elements = parent.querySelectorAll(selector)
      elements.forEach((el) => results.add(el))
    } catch {
      continue
    }
  }
  return Array.from(results)
}

/**
 * Find all product elements on the page
 */
export function findProducts(): HTMLElement[] {
  const products = querySelectorAll(document, PRODUCT_SELECTORS)
  return products.filter(
    (el): el is HTMLElement => el instanceof HTMLElement
  )
}

/**
 * Check if an element is a valid product container
 */
export function isProductElement(element: Element): boolean {
  // Must have data-asin or match product patterns
  if (element instanceof HTMLElement && element.dataset.asin) {
    return element.dataset.asin.length > 0
  }
  return PRODUCT_SELECTORS.some((selector) => {
    try {
      return element.matches(selector)
    } catch {
      return false
    }
  })
}
