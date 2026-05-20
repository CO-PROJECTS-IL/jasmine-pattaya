import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useCartStore } from '../../stores/cartStore'

type OrderStatus = 'new' | 'preparing' | 'ready' | 'served' | 'paid'

interface Dish {
  name_he: string
  name_en: string
  name_th: string
}

interface OrderItem {
  id: string
  dish_id: string
  quantity: number
  price_at_order: number
  notes: string | null
  dish: Dish | null
}

interface Order {
  id: string
  table_number: number
  status: OrderStatus
  total: number
  notes: string | null
  created_at: string
  items: OrderItem[]
}

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; border: string }> = {
  new:       { bg: 'oklch(0.55 0.22 25 / 0.1)',   text: 'oklch(0.50 0.18 25)',   border: 'oklch(0.55 0.18 25 / 0.25)' },
  preparing: { bg: 'oklch(0.70 0.14 80 / 0.12)',   text: 'oklch(0.45 0.12 80)',   border: 'oklch(0.60 0.14 80 / 0.25)' },
  ready:     { bg: 'oklch(0.55 0.14 150 / 0.1)',   text: 'oklch(0.42 0.12 150)',  border: 'oklch(0.55 0.14 150 / 0.25)' },
  served:    { bg: 'oklch(0.45 0.16 255 / 0.08)',   text: 'oklch(0.45 0.16 255)',  border: 'oklch(0.45 0.16 255 / 0.2)' },
  paid:      { bg: 'oklch(0.70 0.008 255 / 0.1)',   text: 'oklch(0.55 0.01 255)',  border: 'oklch(0.70 0.008 255 / 0.2)' },
}

function getDishName(dish: Dish | null, lang: string): string {
  if (!dish) return '—'
  if (lang === 'he') return dish.name_he
  if (lang === 'th') return dish.name_th
  return dish.name_en
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function OrderHistory() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const tableNumber = useCartStore((s) => s.tableNumber)

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!tableNumber) {
      setLoading(false)
      return
    }

    const fetchOrders = async () => {
      setLoading(true)
      setError('')
      try {
        if (!isSupabaseConfigured) throw new Error('Not configured')

        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)

        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('*, items:order_items(*, dish:dishes(name_he, name_en, name_th))')
          .eq('table_number', tableNumber)
          .gte('created_at', todayStart.toISOString())
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError
        setOrders((data as Order[]) || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : t('common.error'))
      }
      setLoading(false)
    }

    fetchOrders()
  }, [tableNumber, t])

  if (!tableNumber) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-slide-up">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
          style={{ backgroundColor: 'oklch(0.97 0.002 255)' }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <path d="M14 14h2v2h-2zM18 14h3M14 18h3M18 18h3M14 22h3" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          {t('orderHistory.noTable')}
        </h2>
        <button
          onClick={() => navigate('/')}
          className="mt-6 px-6 py-2 rounded-xl text-sm font-semibold"
          style={{ backgroundColor: 'var(--accent)', color: 'white' }}
        >
          {t('common.back')}
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-4 pb-6 animate-slide-up">
      <h1 className="text-2xl font-bold mb-1 text-center" style={{ color: 'var(--accent)' }}>
        {t('orderHistory.title')}
      </h1>
      <p className="text-center text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        {t('cart.table')} {tableNumber}
      </p>

      {error && (
        <p className="text-center text-sm mb-4" style={{ color: 'oklch(0.55 0.18 25)' }}>{error}</p>
      )}

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: 'oklch(0.97 0.002 255)' }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6M9 16h4" />
            </svg>
          </div>
          <p className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>
            {t('orderHistory.noOrders')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const colors = STATUS_COLORS[order.status] || STATUS_COLORS.new
            return (
              <div
                key={order.id}
                className="rounded-2xl p-4"
                style={{
                  backgroundColor: 'oklch(0.97 0.002 255)',
                  border: '1px solid oklch(0.92 0.005 255)',
                }}
              >
                {/* Order header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {t('orderHistory.orderAt')} {formatTime(order.created_at)}
                  </span>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: colors.bg,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    {t(`status.${order.status}`) || order.status}
                  </span>
                </div>

                {/* Items list */}
                <div className="space-y-1.5 mb-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="flex-shrink-0 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                          style={{ backgroundColor: 'oklch(0.45 0.16 255 / 0.1)', color: 'var(--accent)' }}
                        >
                          {item.quantity}
                        </span>
                        <span className="truncate" style={{ color: 'var(--text-primary)' }}>
                          {getDishName(item.dish, i18n.language)}
                        </span>
                      </div>
                      <span className="flex-shrink-0 ms-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                        ฿{(item.price_at_order * item.quantity).toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-px mb-3" style={{ backgroundColor: 'oklch(0.92 0.005 255)' }} />

                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {t('orderHistory.total')}
                  </span>
                  <span className="text-base font-bold" style={{ color: 'var(--accent)' }}>
                    ฿{order.total}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
