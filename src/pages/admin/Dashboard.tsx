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
    { label: t('dashboard.todayOrders'), value: orders.length, color: 'oklch(0.45 0.16 255)' },
    { label: t('dashboard.todayRevenue'), value: `${totalRevenue}฿`, color: 'oklch(0.45 0.14 150)' },
    { label: t('dashboard.avgOrder'), value: `${avgOrder}฿`, color: 'oklch(0.50 0.14 200)' },
  ]

  return (
    <>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl p-4 text-center bg-white"
            style={{
              boxShadow: '0 1px 4px oklch(0.20 0.02 60 / 0.06)',
              border: '1px solid oklch(0.93 0.004 255)',
            }}
          >
            <p className="text-[11px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
            <p className="text-xl font-bold" style={{ color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div
            key={status}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white"
            style={{
              boxShadow: '0 1px 3px oklch(0.20 0.02 60 / 0.04)',
              border: '1px solid oklch(0.93 0.004 255)',
            }}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ORDER_STATUS_COLORS[status] }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{t(`kanban.${status}`)}: {count}</span>
          </div>
        ))}
      </div>

      {hourlyData.length > 0 && (
        <div
          className="rounded-2xl p-5 bg-white"
          style={{
            boxShadow: '0 1px 4px oklch(0.20 0.02 60 / 0.06)',
            border: '1px solid oklch(0.93 0.004 255)',
          }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>{t('dashboard.ordersChart')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.005 255)" />
              <XAxis dataKey="hour" tick={{ fill: 'oklch(0.55 0.01 255)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'oklch(0.55 0.01 255)', fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid oklch(0.92 0.005 255)',
                  borderRadius: 12,
                  boxShadow: '0 4px 12px oklch(0.20 0.02 60 / 0.08)',
                }}
              />
              <Bar dataKey="orders" fill="oklch(0.45 0.16 255)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  )
}
