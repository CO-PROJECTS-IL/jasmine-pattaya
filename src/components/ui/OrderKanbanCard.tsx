import { useTranslation } from 'react-i18next'
import { ORDER_STATUSES, ORDER_STATUS_COLORS } from '../../lib/constants'
import type { Order, OrderStatus, OrderItem } from '../../lib/types'

function getDishName(item: OrderItem, lang: string): string {
  if (!item.dish) return item.dish_id.slice(0, 8)
  if (lang === 'he') return item.dish.name_he
  if (lang === 'th') return item.dish.name_th
  return item.dish.name_en
}

const NEXT_STATUS_LABELS: Record<string, { he: string; en: string; th: string }> = {
  preparing: { he: 'התחל הכנה', en: 'Start Preparing', th: 'เริ่มเตรียม' },
  served: { he: 'מוכן להגשה', en: 'Ready to Serve', th: 'พร้อมเสิร์ฟ' },
  paid: { he: 'שולם', en: 'Paid', th: 'ชำระแล้ว' },
}

const NEXT_STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  preparing: {
    bg: 'oklch(0.55 0.16 250 / 0.12)',
    text: 'oklch(0.40 0.16 250)',
    border: 'oklch(0.55 0.16 250 / 0.3)',
  },
  served: {
    bg: 'oklch(0.55 0.14 150 / 0.12)',
    text: 'oklch(0.38 0.14 150)',
    border: 'oklch(0.55 0.14 150 / 0.3)',
  },
  paid: {
    bg: 'oklch(0.55 0.12 80 / 0.12)',
    text: 'oklch(0.40 0.12 80)',
    border: 'oklch(0.55 0.12 80 / 0.3)',
  },
}

interface Props {
  order: Order
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void
}

export default function OrderKanbanCard({ order, onStatusChange }: Props) {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'he' | 'en' | 'th'
  const currentIndex = ORDER_STATUSES.indexOf(order.status as any)
  const canAdvance = currentIndex < ORDER_STATUSES.length - 1
  const canRevert = currentIndex > 0
  const nextStatus = canAdvance ? ORDER_STATUSES[currentIndex + 1] : null
  const prevStatus = canRevert ? ORDER_STATUSES[currentIndex - 1] : null

  const minutesAgo = Math.floor(
    (Date.now() - new Date(order.created_at).getTime()) / 60000
  )

  const statusColor = ORDER_STATUS_COLORS[order.status]

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: 'white',
        border: '1px solid oklch(0.93 0.004 255)',
        boxShadow: '0 1px 4px oklch(0.20 0.02 60 / 0.06)',
      }}
    >
      {/* Header */}
      <div
        className="flex justify-between items-center px-3.5 py-2.5"
        style={{ borderBottom: `2px solid ${statusColor}` }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
            #{order.table_number}
          </span>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{
            backgroundColor: minutesAgo > 15 ? 'oklch(0.55 0.18 25 / 0.12)' : 'oklch(0.95 0.003 255)',
            color: minutesAgo > 15 ? 'oklch(0.45 0.18 25)' : 'var(--text-muted)',
          }}
        >
          {minutesAgo} {lang === 'he' ? 'ד׳' : lang === 'th' ? 'นาที' : 'min'}
        </span>
      </div>

      {/* Items */}
      <div className="px-3.5 py-2.5 space-y-1">
        {order.items?.map((item) => (
          <div key={item.id} className="flex justify-between items-center text-sm">
            <span style={{ color: 'var(--text-primary)' }}>
              <span className="font-medium" style={{ color: 'var(--accent)' }}>{item.quantity}×</span>{' '}
              {getDishName(item, i18n.language)}
            </span>
            <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
              {item.price_at_order}฿
            </span>
          </div>
        ))}

        {order.notes && (
          <div
            className="mt-1.5 px-2.5 py-1.5 rounded-lg text-xs"
            style={{
              backgroundColor: 'oklch(0.55 0.14 80 / 0.08)',
              color: 'oklch(0.45 0.14 80)',
              border: '1px solid oklch(0.55 0.14 80 / 0.15)',
            }}
          >
            📝 {order.notes}
          </div>
        )}
      </div>

      {/* Actions */}
      {(canAdvance || canRevert) && (
        <div
          className="flex gap-2 px-3.5 py-2.5"
          style={{ borderTop: '1px solid oklch(0.95 0.003 255)' }}
        >
          {canRevert && prevStatus && (
            <button
              onClick={() => onStatusChange(order.id, prevStatus as OrderStatus)}
              className="px-3 py-2 text-xs rounded-lg transition-colors"
              style={{
                backgroundColor: 'oklch(0.97 0.002 255)',
                border: '1px solid oklch(0.92 0.005 255)',
                color: 'var(--text-muted)',
              }}
            >
              ← {lang === 'he' ? 'חזור' : lang === 'th' ? 'ย้อน' : 'Back'}
            </button>
          )}
          {canAdvance && nextStatus && (
            <button
              onClick={() => onStatusChange(order.id, nextStatus as OrderStatus)}
              className="flex-1 py-2.5 text-sm rounded-xl font-bold transition-colors"
              style={{
                backgroundColor: NEXT_STATUS_COLORS[nextStatus]?.bg || 'oklch(0.55 0.14 255 / 0.1)',
                border: `1px solid ${NEXT_STATUS_COLORS[nextStatus]?.border || 'oklch(0.55 0.14 255 / 0.25)'}`,
                color: NEXT_STATUS_COLORS[nextStatus]?.text || 'var(--accent)',
              }}
            >
              {NEXT_STATUS_LABELS[nextStatus]?.[lang] || nextStatus}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
