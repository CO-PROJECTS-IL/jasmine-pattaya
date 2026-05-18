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
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[#c9a84c] font-bold text-lg">#{order.table_number}</span>
        <span className="text-gray-500 text-xs">{minutesAgo}m</span>
      </div>

      {order.items?.map((item) => (
        <div key={item.id} className="text-sm text-gray-300 flex justify-between">
          <span>{item.quantity}x {item.dish_id}</span>
          <span className="text-gray-500">{item.price_at_order}฿</span>
        </div>
      ))}

      {order.notes && (
        <p className="text-xs text-yellow-400/70 mt-1 italic">{order.notes}</p>
      )}

      <div className="flex gap-2 mt-3">
        {canRevert && (
          <button
            onClick={() => onStatusChange(order.id, ORDER_STATUSES[currentIndex - 1] as OrderStatus)}
            className="flex-1 py-1.5 text-xs bg-white/5 text-gray-400 rounded hover:bg-white/10 transition-colors"
          >
            ◀
          </button>
        )}
        {canAdvance && (
          <button
            onClick={() => onStatusChange(order.id, ORDER_STATUSES[currentIndex + 1] as OrderStatus)}
            className="flex-1 py-1.5 text-xs bg-[#c9a84c]/20 text-[#c9a84c] rounded hover:bg-[#c9a84c]/30 transition-colors font-medium"
          >
            ▶
          </button>
        )}
      </div>
    </div>
  )
}
