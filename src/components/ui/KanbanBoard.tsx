import { useTranslation } from 'react-i18next'
import { useRealtimeOrders } from '../../hooks/useRealtimeOrders'
import { useSettings } from '../../hooks/useSettings'
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
  const { data: settings } = useSettings()
  const alertMinutes = settings?.order_alert_minutes ?? 15

  if (isLoading) return <div className="text-center text-gray-500 py-8">...</div>

  return (
    <div className="space-y-4 pb-4">
      {COLUMNS.map((col) => {
        const colOrders = getOrdersByStatus(col.status)
        const color = ORDER_STATUS_COLORS[col.status]
        if (colOrders.length === 0) return null
        return (
          <div key={col.status}>
            {/* Section header */}
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-2"
              style={{
                backgroundColor: 'white',
                border: '1px solid oklch(0.93 0.004 255)',
                borderInlineStart: `4px solid ${color}`,
              }}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{t(col.labelKey)}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: `${color}20`, color }}
              >
                {colOrders.length}
              </span>
            </div>
            {/* Order cards grid — fits screen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {colOrders.map((order) => (
                <OrderKanbanCard
                  key={order.id}
                  order={order}
                  onStatusChange={onStatusChange}
                  alertMinutes={alertMinutes}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
