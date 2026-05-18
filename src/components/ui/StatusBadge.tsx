import { useTranslation } from 'react-i18next'
import type { OrderStatus } from '../../lib/constants'

const STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'bg-red-600/20 text-red-400 border-red-600/30',
  preparing: 'bg-amber-600/20 text-amber-400 border-amber-600/30',
  ready: 'bg-green-600/20 text-green-400 border-green-600/30',
  served: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
  paid: 'bg-gray-600/20 text-gray-400 border-gray-600/30',
}

interface StatusBadgeProps {
  status: OrderStatus
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation()

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[status]}`}
    >
      {t(`status.${status}`)}
    </span>
  )
}
