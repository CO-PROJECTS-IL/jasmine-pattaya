import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { Order, OrderStatus } from '../../lib/constants'

const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-101', tableNumber: 3, status: 'new', totalAmount: 740, discountPercent: 0,
    notes: '', memberPhone: null,
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: 'i1', orderId: 'ord-101', dishId: 'd1', nameHe: 'שניצל הבית', nameEn: 'House Schnitzel', nameTh: 'ชนิทเซลบ้าน', price: 370, quantity: 2, notes: '' },
    ],
  },
  {
    id: 'ord-102', tableNumber: 7, status: 'preparing', totalAmount: 650, discountPercent: 0,
    notes: 'בלי בצל', memberPhone: '0501234567',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: 'i2', orderId: 'ord-102', dishId: 'd2', nameHe: 'שאוורמה עוף', nameEn: 'Chicken Shawarma', nameTh: 'ชาวาร์มาไก่', price: 380, quantity: 1, notes: '' },
      { id: 'i3', orderId: 'ord-102', dishId: 'd3', nameHe: 'חומוס טחינה', nameEn: 'Hummus Tahini', nameTh: 'ฮัมมัสทาฮินี', price: 180, quantity: 1, notes: '' },
    ],
  },
  {
    id: 'ord-103', tableNumber: 12, status: 'ready', totalAmount: 400, discountPercent: 10,
    notes: '', memberPhone: '0509876543',
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: 'i4', orderId: 'ord-103', dishId: 'd4', nameHe: 'קבב הבית', nameEn: 'House Kebab', nameTh: 'เคบับบ้าน', price: 400, quantity: 1, notes: '' },
    ],
  },
  {
    id: 'ord-104', tableNumber: 5, status: 'served', totalAmount: 440, discountPercent: 0,
    notes: '', memberPhone: null,
    createdAt: new Date(Date.now() - 40 * 60000).toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: 'i5', orderId: 'ord-104', dishId: 'd5', nameHe: 'בוקר ישראלית', nameEn: 'Israeli Breakfast', nameTh: 'อาหารเช้าอิสราเอล', price: 220, quantity: 2, notes: '' },
    ],
  },
  {
    id: 'ord-105', tableNumber: 1, status: 'paid', totalAmount: 560, discountPercent: 0,
    notes: '', memberPhone: null,
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: 'i6', orderId: 'ord-105', dishId: 'd6', nameHe: 'לאפה שאוורמה', nameEn: 'Shawarma Laffa', nameTh: 'ลาฟฟาชาวาร์มา', price: 280, quantity: 2, notes: '' },
    ],
  },
]

const STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'bg-red-500',
  preparing: 'bg-amber-500',
  ready: 'bg-green-500',
  served: 'bg-blue-500',
  paid: 'bg-gray-500',
}

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  new: 'preparing',
  preparing: 'ready',
  ready: 'served',
  served: 'paid',
  paid: null,
}

export default function OrdersManager() {
  const { t, i18n } = useTranslation()
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  const filteredOrders =
    statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter)

  const advanceStatus = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o
        const next = NEXT_STATUS[o.status]
        return next ? { ...o, status: next, updatedAt: new Date().toISOString() } : o
      })
    )
  }, [])

  const getItemName = (item: { nameHe: string; nameEn: string; nameTh: string }) =>
    i18n.language === 'he' ? item.nameHe : i18n.language === 'th' ? item.nameTh : item.nameEn

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString(i18n.language === 'he' ? 'he-IL' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const statuses: (OrderStatus | 'all')[] = ['all', 'new', 'preparing', 'ready', 'served', 'paid']

  return (
    <div>
      <h1 className="text-2xl text-[#c9a84c] font-bold mb-6">{t('admin.orders')}</h1>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === s
                ? 'bg-[#c9a84c] text-black'
                : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
            }`}
          >
            {s === 'all' ? `הכל (${orders.length})` : `${t(`status.${s}`)} (${orders.filter((o) => o.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-[#1a1a1a] rounded-xl border border-white/5 overflow-hidden">
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_COLORS[order.status]}`} />
              <span className="text-white font-medium text-sm w-20">
                {t('kitchen.table')} {order.tableNumber}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                order.status === 'new' ? 'bg-red-500/20 text-red-400' :
                order.status === 'preparing' ? 'bg-amber-500/20 text-amber-400' :
                order.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                order.status === 'served' ? 'bg-blue-500/20 text-blue-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {t(`status.${order.status}`)}
              </span>
              <span className="text-gray-500 text-xs">{formatTime(order.createdAt)}</span>
              <span className="text-[#c9a84c] font-medium text-sm me-auto">฿{order.totalAmount}</span>
              {order.memberPhone && (
                <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                  {t('nav.loyalty')}
                </span>
              )}
              <span className="text-gray-500 text-xs">{expandedOrder === order.id ? '▲' : '▼'}</span>
            </div>

            {expandedOrder === order.id && (
              <div className="px-4 pb-4 border-t border-white/5 pt-3">
                <div className="space-y-1 mb-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-300">
                        {item.quantity}x {getItemName(item)}
                      </span>
                      <span className="text-gray-400">฿{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {order.discountPercent > 0 && (
                  <div className="text-sm text-green-400 mb-2">
                    {t('cart.discount')}: {order.discountPercent}%
                  </div>
                )}

                {order.notes && (
                  <div className="text-sm text-amber-400 bg-amber-900/20 rounded-lg p-2 mb-3">
                    {t('kitchen.notes')}: {order.notes}
                  </div>
                )}

                {order.memberPhone && (
                  <div className="text-sm text-purple-300 mb-3">
                    {t('loyalty.phone')}: {order.memberPhone}
                  </div>
                )}

                {NEXT_STATUS[order.status] && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      advanceStatus(order.id)
                    }}
                    className="bg-[#c9a84c] text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#d4b96a] transition-colors"
                  >
                    → {t(`status.${NEXT_STATUS[order.status]!}`)}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center text-gray-500 py-12">{t('kitchen.noOrders')}</div>
        )}
      </div>
    </div>
  )
}
