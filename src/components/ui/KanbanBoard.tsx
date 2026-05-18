import { useTranslation } from 'react-i18next'
import { useRealtimeOrders } from '../../hooks/useRealtimeOrders'
import { ORDER_STATUS_COLORS } from '../../lib/constants'
import OrderKanbanCard from './OrderKanbanCard'
import type { OrderStatus } from '../../lib/types'

const COLUMNS: { status: OrderStatus; labelKey: string }[] = [
  { status: 'new', labelKey: 'kanban.new' },
  { status: 'preparing', labelKey: 'kanban.preparing' },
  { status: 'served', labelKey: 'kanban.served' },
  { status: 'paid', labelKey: 'kanban.paid' },
]

interface KanbanBoardProps {
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void
}

export default function KanbanBoard({ onStatusChange }: KanbanBoardProps) {
  const { t } = useTranslation()
  const { isLoading, getOrdersByStatus } = useRealtimeOrders()

  if (isLoading) return <div className="text-center text-gray-500 py-8">...</div>

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 min-h-[60vh]">
      {COLUMNS.map((col) => {
        const colOrders = getOrdersByStatus(col.status)
        const color = ORDER_STATUS_COLORS[col.status]
        return (
          <div key={col.status} className="flex-shrink-0 w-72 flex flex-col">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-t-lg mb-2"
              style={{ backgroundColor: `${color}20`, borderBottom: `2px solid ${color}` }}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-sm font-medium text-white">{t(col.labelKey)}</span>
              <span className="text-xs text-gray-400 ml-auto">{colOrders.length}</span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto">
              {colOrders.map((order) => (
                <OrderKanbanCard
                  key={order.id}
                  order={order}
                  onStatusChange={onStatusChange}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
