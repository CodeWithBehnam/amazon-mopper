import { Badge } from './Badge'

interface DiscountBadgeProps {
  discountPercent: number
}

export function DiscountBadge({ discountPercent }: DiscountBadgeProps) {
  return (
    <Badge
      emoji="🔥"
      text={`${discountPercent}% OFF`}
      variant="discount"
    />
  )
}
