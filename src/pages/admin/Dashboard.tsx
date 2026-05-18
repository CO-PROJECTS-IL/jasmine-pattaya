import { useTranslation } from 'react-i18next'
import { useRealtimeOrders } from '../../hooks/useRealtimeOrders'
import { ORDER_STATUS_COLORS } from '../../lib/constants'
import AdminLayout from '../../components/layout/AdminLayout'
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
    <AdminLayout>
      <h1 className="text-xl text-[#c9a84c] mb-6">{t('adminHome.dashboard')}</h1>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-[#121212] border border-white/5 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-xs mb-1">{card.label}</p>
            <p className="text-xl font-bold" style={{ color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div
            key={status}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: `${ORDER_STATUS_COLORS[status]}20` }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ORDER_STATUS_COLORS[status] }} />
            <span className="text-xs text-white">{t(`kanban.${status}`)}: {count}</span>
          </div>
        ))}
      </div>

      {hourlyData.length > 0 && (
        <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
          <h3 className="text-sm text-gray-400 mb-3">{t('dashboard.ordersChart')}</h3>
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
    </AdminLayout>
  )
}
