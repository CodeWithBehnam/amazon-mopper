import { Badge } from './Badge'

interface BestValueBadgeProps {
  showBadge?: boolean
}

export function BestValueBadge({ showBadge = true }: BestValueBadgeProps) {
  if (!showBadge) return null

  return (
    <Badge
      emoji="⭐"
      text="BEST VALUE"
      variant="best-value"
    />
  )
}

/**
 * Apply best value border style to a product element
 */
export function applyBestValueBorder(element: HTMLElement): void {
  element.classList.add('mopper-best-value-border')
  element.style.outline = '3px solid #00FF00'
  element.style.outlineOffset = '-3px'
}

/**
 * Remove best value border style from a product element
 */
export function removeBestValueBorder(element: HTMLElement): void {
  element.classList.remove('mopper-best-value-border')
  element.style.outline = ''
  element.style.outlineOffset = ''
}
