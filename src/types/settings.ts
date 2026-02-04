export interface Settings {
  showDiscountBadge: boolean
  showBestValueBorder: boolean
  showDeliveryCountdown: boolean
  roundPrices: boolean
  hidePrimeIcons: boolean
  truncateTitles: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  showDiscountBadge: true,
  showBestValueBorder: true,
  showDeliveryCountdown: true,
  roundPrices: true,
  hidePrimeIcons: false, // Opt-in to avoid confusing Prime members
  truncateTitles: true,
}

export const SETTING_LABELS: Record<keyof Settings, string> = {
  showDiscountBadge: 'Discount Badges',
  showBestValueBorder: 'Best Value Highlight',
  showDeliveryCountdown: 'Delivery Countdown',
  roundPrices: 'Round Prices',
  hidePrimeIcons: 'Hide Prime Icons',
  truncateTitles: 'Truncate Titles',
}

export const SETTING_DESCRIPTIONS: Record<keyof Settings, string> = {
  showDiscountBadge: 'Show percentage off from "Was" prices',
  showBestValueBorder: 'Highlight lowest price-per-unit products',
  showDeliveryCountdown: 'Show days until delivery',
  roundPrices: 'Display ~£20 instead of £19.99',
  hidePrimeIcons: 'Remove Prime delivery badges',
  truncateTitles: 'Shorten long product titles',
}
