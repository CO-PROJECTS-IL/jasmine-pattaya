import { useTranslation } from 'react-i18next'
import { ORDER_STATUSES } from '../../lib/constants'
import type { Order, OrderStatus } from '../../lib/types'

interface Props {
  order: Order
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void
}

export default function OrderKanbanCard({ order, onStatusChange }: Props) {
  useTranslation()
  const currentIndex = ORDER_STATUSES.indexOf(order.status as any)
  const canAdvance = currentIndex < ORDER_STATUSES.length - 1
  const canRevert = currentIndex > 0

  const minutesAgo = Math.floor(
    (Date.now() - new Date(order.created_at).getTime()) / 60000
  )

  return (
    <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--dark-lighter)', border: '1px solid oklch(0.30 0.005 85)' }}>
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-lg" style={{ color: 'var(--gold)' }}>#{order.table_number}</span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{minutesAgo}m</span>
      </div>

      {order.items?.map((item) => (
        <div key={item.id} className="text-sm flex justify-between" style={{ color: 'var(--text-secondary)' }}>
          <span>{item.quantity}x {item.dish_id}</span>
          <span style={{ color: 'var(--text-muted)' }}>{item.price_at_order}฿</span>
        </div>
      ))}

      {order.notes && (
        <p className="text-xs text-yellow-400/70 mt-1 italic">{order.notes}</p>
      )}

      <div className="flex gap-2 mt-3">
        {canRevert && (
          <button
            onClick={() => onStatusChange(order.id, ORDER_STATUSES[currentIndex - 1] as OrderStatus)}
            className="flex-1 py-1.5 text-xs bg-white/5 rounded hover:bg-white/10 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            ◀
          </button>
        )}
        {canAdvance && (
          <button
            onClick={() => onStatusChange(order.id, ORDER_STATUSES[currentIndex + 1] as OrderStatus)}
            className="flex-1 py-1.5 text-xs rounded font-medium transition-colors"
            style={{ backgroundColor: 'oklch(0.75 0.12 85 / 0.2)', color: 'var(--gold)' }}
          >
            ▶
          </button>
        )}
      </div>
    </div>
  )
}
