import { useTranslation } from 'react-i18next'
import { useRealtimeOrders } from '../../hooks/useRealtimeOrders'
import { ORDER_STATUS_COLORS } from '../../lib/constants'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const { t } = useTranslation()
  const { orders } = useRealtimeOrders()

  const paidOrders = orders.filter((o) => o.status === 'paid')
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0)
  const avgOrder = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0

  const statusCounts = {
    new: orders.filter((o) => o.status === 'new').length,
    preparing: orders.filter((o) => o.status === 'preparing').length,
    served: orders.filter((o) => o.status === 'served').length,
    paid: paidOrders.length,
  }

  const hourlyData = Array.from({ length: 24 }, (_, h) => ({
    hour: `${h}:00`,
    orders: orders.filter((o) => new Date(o.created_at).getHours() === h).length,
  })).filter((d) => d.orders > 0)

  const cards = [
    { label: t('dashboard.todayOrders'), value: orders.length, color: '#c9a84c' },
    { label: t('dashboard.todayRevenue'), value: `${totalRevenue}฿`, color: '#22c55e' },
    { label: t('dashboard.avgOrder'), value: `${avgOrder}฿`, color: '#3b82f6' },
  ]

  return (
    <>
      <h1 className="text-xl mb-8" style={{ color: 'var(--gold)' }}>{t('adminHome.dashboard')}</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl p-4 text-center"
            style={{ backgroundColor: 'var(--dark)', border: '1px solid oklch(0.25 0.008 60)' }}
          >
            <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
            <p className="text-xl font-bold" style={{ color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2.5 mb-8 flex-wrap">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div
            key={status}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg"
            style={{ backgroundColor: `${ORDER_STATUS_COLORS[status]}20` }}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ORDER_STATUS_COLORS[status] }} />
            <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{t(`kanban.${status}`)}: {count}</span>
          </div>
        ))}
      </div>

      {hourlyData.length > 0 && (
        <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--dark)', border: '1px solid oklch(0.25 0.008 60)' }}>
          <h3 className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{t('dashboard.ordersChart')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="hour" tick={{ fill: '#888', fontSize: 10 }} />
              <YAxis tick={{ fill: '#888', fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }} />
              <Bar dataKey="orders" fill="#c9a84c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  )
}
