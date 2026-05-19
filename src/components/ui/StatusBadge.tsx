import { useTranslation } from 'react-i18next'
import type { OrderStatus } from '../../lib/types'

const STATUS_CONFIG: Record<OrderStatus, { classes: string; icon: string }> = {
  new: { classes: 'bg-red-600/20 text-red-400 border-red-600/30', icon: '●' },
  preparing: { classes: 'bg-amber-600/20 text-amber-400 border-amber-600/30', icon: '◐' },
  ready: { classes: 'bg-green-600/20 text-green-400 border-green-600/30', icon: '✓' },
  served: { classes: 'bg-blue-600/20 text-blue-400 border-blue-600/30', icon: '→' },
  paid: { classes: 'bg-gray-600/20 text-gray-400 border-gray-600/30', icon: '✓✓' },
}

interface StatusBadgeProps {
  status: OrderStatus
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation()
  const { classes, icon } = STATUS_CONFIG[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${classes}`}
      role="status"
    >
      <span aria-hidden="true">{icon}</span>
      {t(`status.${status}`)}
    </span>
  )
}
