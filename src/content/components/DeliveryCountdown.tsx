import { Badge } from './Badge'
import { formatDaysUntil } from '../lib/calculators'

interface DeliveryCountdownProps {
  days: number
}

export function DeliveryCountdown({ days }: DeliveryCountdownProps) {
  const text = formatDaysUntil(days)
  if (!text) return null

  return (
    <Badge
      emoji="📦"
      text={text}
      variant="delivery"
      style={{
        position: 'relative',
        display: 'inline-block',
        marginLeft: '8px',
        fontSize: '12px',
        verticalAlign: 'middle',
      }}
    />
  )
}
