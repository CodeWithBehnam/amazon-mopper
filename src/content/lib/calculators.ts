/**
 * Calculate discount percentage from current and original prices
 * Returns null if discount is invalid or below minimum threshold
 */
export function calculateDiscount(
  currentPrice: number,
  wasPrice: number,
  minDiscount = 5,
  maxDiscount = 90
): number | null {
  if (currentPrice <= 0 || wasPrice <= 0) return null
  if (currentPrice >= wasPrice) return null // No discount or price increase

  const discount = ((wasPrice - currentPrice) / wasPrice) * 100

  // Below minimum threshold
  if (discount < minDiscount) return null

  // Cap at maximum (likely data error if higher)
  return Math.min(Math.round(discount), maxDiscount)
}

/**
 * Calculate days until a future date
 * Returns 0 for today, 1 for tomorrow, negative for past dates
 */
export function calculateDaysUntil(targetDate: Date): number {
  const now = new Date()
  // Reset time components for accurate day calculation
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())

  const diffTime = target.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Format days until delivery as human-readable text
 */
export function formatDaysUntil(days: number): string | null {
  if (days < 0) return null // Past date
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return `${days} days`
}

/**
 * Round a price to the nearest whole number
 * Returns the rounded price and whether a tilde should be shown
 */
export function roundPrice(price: number): { rounded: number; showTilde: boolean } {
  const rounded = Math.round(price)
  // Only show tilde if price was not already a whole number
  const showTilde = Math.abs(price - rounded) > 0.001

  return { rounded, showTilde }
}

/**
 * Format a rounded price with currency symbol
 */
export function formatRoundedPrice(price: number, currency: string): string {
  const { rounded, showTilde } = roundPrice(price)
  const tilde = showTilde ? '~' : ''
  return `${tilde}${currency}${rounded}`
}

/**
 * Truncate text at word boundary with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text

  // Find last space before maxLength
  const truncated = text.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  // If no space found or space is too early, just cut at maxLength
  if (lastSpace < maxLength * 0.5) {
    return truncated.trim() + '...'
  }

  return text.slice(0, lastSpace).trim() + '...'
}

/**
 * Find the best value product(s) from a list of prices
 * Returns indices of products with the lowest price
 */
export function findBestValueIndices(prices: (number | null)[]): number[] {
  const validPrices = prices
    .map((price, index) => ({ price, index }))
    .filter((item) => item.price !== null) as Array<{ price: number; index: number }>

  if (validPrices.length === 0) return []

  const minPrice = Math.min(...validPrices.map((p) => p.price))
  return validPrices
    .filter((p) => p.price === minPrice)
    .map((p) => p.index)
}
