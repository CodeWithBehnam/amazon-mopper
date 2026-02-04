import {
  querySelector,
  PRICE_SELECTORS,
  DELIVERY_SELECTORS,
  TITLE_SELECTORS,
} from './selectors'

export interface ProductData {
  currentPrice: number | null
  wasPrice: number | null
  pricePerUnit: number | null
  pricePerUnitText: string | null
  deliveryDate: Date | null
  deliveryText: string | null
  title: string | null
  currency: string
}

/**
 * Extract currency symbol from price text
 */
export function extractCurrency(text: string): string {
  // Common currency patterns
  const currencyMatch = text.match(/^([£$€¥₹]|R\$|kr|zł)/i)
  if (currencyMatch) return currencyMatch[1]

  // Check for currency at end (e.g., "10,00 €")
  const endMatch = text.match(/\s*([€$£¥₹])\s*$/)
  if (endMatch) return endMatch[1]

  return '£' // Default fallback
}

/**
 * Parse price from text, handling various formats
 */
export function parsePrice(text: string): number | null {
  if (!text) return null

  // Remove currency symbols and clean up
  let cleaned = text.replace(/[£$€¥₹]/g, '').trim()

  // Handle European format (1.234,56 or 1 234,56)
  if (/^\d{1,3}([.\s]\d{3})*(,\d{2})?$/.test(cleaned)) {
    cleaned = cleaned.replace(/[.\s]/g, '').replace(',', '.')
  } else {
    // Handle US/UK format (1,234.56)
    cleaned = cleaned.replace(/,/g, '')
  }

  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}

/**
 * Parse delivery date from various formats
 */
export function parseDeliveryDate(text: string): Date | null {
  if (!text) return null

  const now = new Date()
  const currentYear = now.getFullYear()

  // Handle "Tomorrow"
  if (/tomorrow/i.test(text)) {
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
  }

  // Handle "Today"
  if (/today/i.test(text)) {
    return now
  }

  // Handle relative days like "in 3 days"
  const relativeDaysMatch = text.match(/in\s+(\d+)\s+days?/i)
  if (relativeDaysMatch) {
    const days = parseInt(relativeDaysMatch[1], 10)
    const futureDate = new Date(now)
    futureDate.setDate(futureDate.getDate() + days)
    return futureDate
  }

  // Try to extract date patterns
  // Format: "Saturday, Feb 10" or "Feb 10" or "10 Feb"
  const monthNames = [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
  ]

  // Pattern: "Feb 10" or "February 10"
  const usFormat = text.match(/([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?/i)
  if (usFormat) {
    const monthStr = usFormat[1].toLowerCase().slice(0, 3)
    const monthIndex = monthNames.indexOf(monthStr)
    if (monthIndex !== -1) {
      const day = parseInt(usFormat[2], 10)
      const date = new Date(currentYear, monthIndex, day)
      // If date is in the past, assume next year
      if (date < now) {
        date.setFullYear(currentYear + 1)
      }
      return date
    }
  }

  // Pattern: "10 Feb" or "10 February"
  const euFormat = text.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)/i)
  if (euFormat) {
    const day = parseInt(euFormat[1], 10)
    const monthStr = euFormat[2].toLowerCase().slice(0, 3)
    const monthIndex = monthNames.indexOf(monthStr)
    if (monthIndex !== -1) {
      const date = new Date(currentYear, monthIndex, day)
      if (date < now) {
        date.setFullYear(currentYear + 1)
      }
      return date
    }
  }

  // Handle date ranges - take earliest date
  // Pattern: "Feb 10 - 15" or "Feb 10-15"
  const rangeMatch = text.match(/([a-z]+)\s+(\d{1,2})\s*[-–]\s*(\d{1,2})/i)
  if (rangeMatch) {
    const monthStr = rangeMatch[1].toLowerCase().slice(0, 3)
    const monthIndex = monthNames.indexOf(monthStr)
    if (monthIndex !== -1) {
      const startDay = parseInt(rangeMatch[2], 10)
      const date = new Date(currentYear, monthIndex, startDay)
      if (date < now) {
        date.setFullYear(currentYear + 1)
      }
      return date
    }
  }

  return null
}

/**
 * Parse price per unit text
 * Examples: "(£1.25/100ml)", "£0.50/unit", "(£5.00/kg)"
 */
export function parsePricePerUnit(text: string): { price: number; unit: string } | null {
  if (!text) return null

  // Pattern: £X.XX/unit or (£X.XX/unit)
  const match = text.match(/[£$€¥₹]?\s*([\d.,]+)\s*\/\s*(\w+)/i)
  if (match) {
    const price = parsePrice(match[1])
    if (price !== null) {
      return { price, unit: match[2].toLowerCase() }
    }
  }

  return null
}

/**
 * Extract all product data from a product element
 */
export function extractProductData(productEl: HTMLElement): ProductData {
  const data: ProductData = {
    currentPrice: null,
    wasPrice: null,
    pricePerUnit: null,
    pricePerUnitText: null,
    deliveryDate: null,
    deliveryText: null,
    title: null,
    currency: '£',
  }

  // Extract current price
  const currentPriceEl = querySelector(productEl, PRICE_SELECTORS.current)
  if (currentPriceEl?.textContent) {
    data.currency = extractCurrency(currentPriceEl.textContent)
    data.currentPrice = parsePrice(currentPriceEl.textContent)
  }

  // Extract "was" price
  const wasPriceEl = querySelector(productEl, PRICE_SELECTORS.was)
  if (wasPriceEl?.textContent) {
    data.wasPrice = parsePrice(wasPriceEl.textContent)
  }

  // Extract price per unit
  const perUnitEl = querySelector(productEl, PRICE_SELECTORS.perUnit)
  if (perUnitEl?.textContent) {
    data.pricePerUnitText = perUnitEl.textContent
    const parsed = parsePricePerUnit(perUnitEl.textContent)
    if (parsed) {
      data.pricePerUnit = parsed.price
    }
  }

  // Extract delivery date
  const deliveryEl = querySelector(productEl, DELIVERY_SELECTORS)
  if (deliveryEl?.textContent) {
    data.deliveryText = deliveryEl.textContent.trim()
    data.deliveryDate = parseDeliveryDate(deliveryEl.textContent)
  }

  // Extract title
  const titleEl = querySelector(productEl, TITLE_SELECTORS)
  if (titleEl?.textContent) {
    data.title = titleEl.textContent.trim()
  }

  return data
}
