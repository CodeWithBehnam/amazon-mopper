import { type CSSProperties } from 'react'

export type BadgeVariant = 'discount' | 'best-value' | 'delivery'

interface BadgeProps {
  emoji: string
  text: string
  variant: BadgeVariant
  style?: CSSProperties
  className?: string
}

const VARIANT_STYLES: Record<BadgeVariant, CSSProperties> = {
  discount: {
    backgroundColor: '#FFFF00',
    color: '#000000',
  },
  'best-value': {
    backgroundColor: '#00FF00',
    color: '#000000',
  },
  delivery: {
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
}

export function Badge({ emoji, text, variant, style, className }: BadgeProps) {
  const variantStyle = VARIANT_STYLES[variant]

  return (
    <span
      className={`mopper-badge mopper-badge--${variant} ${className || ''}`}
      style={{
        ...variantStyle,
        ...style,
      }}
    >
      {emoji} {text}
    </span>
  )
}
