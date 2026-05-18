import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Order, OrderStatus, OrderItem } from '../../lib/types'

interface OrderCardProps {
  order: Order
  onUpdateStatus: (orderId: string, status: OrderStatus) => void
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'border-red-500',
  preparing: 'border-amber-500',
  ready: 'border-green-500',
  served: 'border-blue-500',
  paid: 'border-gray-500',
}

const STATUS_BG: Record<OrderStatus, string> = {
  new: 'bg-red-500/10',
  preparing: 'bg-amber-500/10',
  ready: 'bg-green-500/10',
  served: 'bg-blue-500/10',
  paid: 'bg-gray-500/10',
}

function getMinutesAgo(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
}

function getNextStatus(current: OrderStatus): OrderStatus | null {
  const flow: OrderStatus[] = ['new', 'preparing', 'ready', 'served', 'paid']
  const idx = flow.indexOf(current)
  return idx < flow.length - 1 ? flow[idx + 1] : null
}

export default function OrderCard({ order, onUpdateStatus }: OrderCardProps) {
  const { t } = useTranslation()
  const [minutesAgo, setMinutesAgo] = useState(getMinutesAgo(order.created_at))

  useEffect(() => {
    const interval = setInterval(() => {
      setMinutesAgo(getMinutesAgo(order.created_at))
    }, 30000)
    return () => clearInterval(interval)
  }, [order.created_at])

  const nextStatus = getNextStatus(order.status)
  const isPulsing = order.status === 'new' && minutesAgo >= 10

  const statusLabels: Record<OrderStatus, string> = {
    new: t('status.new'),
    preparing: t('status.preparing'),
    ready: t('status.ready'),
    served: t('status.served'),
    paid: t('status.paid'),
  }

  const buttonLabels: Record<string, string> = {
    preparing: t('kitchen.markPreparing'),
    ready: t('kitchen.markReady'),
    served: t('status.served'),
    paid: t('status.paid'),
  }

  return (
    <div
      className={`rounded-xl border-2 ${STATUS_COLORS[order.status]} ${STATUS_BG[order.status]} p-4 ${
        isPulsing ? 'animate-pulse' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">
            {t('kitchen.table')} {order.table_number}
          </span>
          <span className="text-sm text-gray-400">
            {minutesAgo} {t('kitchen.minutesAgo')}
          </span>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          order.status === 'new' ? 'bg-red-500 text-white' :
          order.status === 'preparing' ? 'bg-amber-500 text-black' :
          order.status === 'ready' ? 'bg-green-500 text-black' :
          'bg-gray-600 text-white'
        }`}>
          {statusLabels[order.status]}
        </span>
      </div>

      <div className="space-y-1 mb-3">
        {(order.items || []).map((item: OrderItem) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-white">
              {item.quantity}x{' '}
              {item.dish_id}
            </span>
          </div>
        ))}
      </div>

      {order.notes && (
        <div className="text-sm text-amber-400 bg-amber-900/20 rounded-lg p-2 mb-3">
          {t('kitchen.notes')}: {order.notes}
        </div>
      )}

      {nextStatus && nextStatus !== 'paid' && (
        <button
          onClick={() => onUpdateStatus(order.id, nextStatus)}
          className={`w-full py-2 rounded-lg font-bold text-sm transition-colors ${
            nextStatus === 'preparing'
              ? 'bg-amber-500 text-black hover:bg-amber-400'
              : nextStatus === 'ready'
              ? 'bg-green-500 text-black hover:bg-green-400'
              : 'bg-blue-500 text-white hover:bg-blue-400'
          }`}
        >
          {buttonLabels[nextStatus]}
        </button>
      )}
    </div>
  )
}
