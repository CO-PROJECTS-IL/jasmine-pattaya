import { useTranslation } from 'react-i18next'

const MOCK_STATS = {
  todayOrders: 23,
  todayRevenue: 8540,
  avgOrder: 371,
  byStatus: { new: 3, preparing: 5, ready: 2, served: 8, paid: 5 },
}

const REVENUE_DAYS = [
  { day: 'ראשון', amount: 5200 },
  { day: 'שני', amount: 7100 },
  { day: 'שלישי', amount: 6300 },
  { day: 'רביעי', amount: 8900 },
  { day: 'חמישי', amount: 9200 },
  { day: 'שישי', amount: 12400 },
  { day: 'שבת', amount: 8540 },
]

function StatCard({ label, value, prefix }: { label: string; value: number; prefix?: string }) {
  return (
    <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-[#c9a84c]">
        {prefix}{value.toLocaleString()}
      </p>
    </div>
  )
}

function MiniBar({ data }: { data: typeof REVENUE_DAYS }) {
  const max = Math.max(...data.map((d) => d.amount))
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d) => (
        <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-[#c9a84c] rounded-t"
            style={{ height: `${(d.amount / max) * 100}%` }}
          />
          <span className="text-[10px] text-gray-500">{d.day}</span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="text-2xl text-[#c9a84c] font-bold mb-6">{t('admin.dashboard')}</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <StatCard label={t('dashboard.todayOrders')} value={MOCK_STATS.todayOrders} />
        <StatCard label={t('dashboard.todayRevenue')} value={MOCK_STATS.todayRevenue} prefix="฿" />
        <StatCard label={t('dashboard.avgOrder')} value={MOCK_STATS.avgOrder} prefix="฿" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
          <h3 className="text-sm text-gray-400 mb-3">{t('dashboard.ordersByStatus')}</h3>
          <div className="space-y-2">
            {Object.entries(MOCK_STATS.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm text-white">{t(`status.${status}`)}</span>
                <span className="text-sm text-[#c9a84c] font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
          <h3 className="text-sm text-gray-400 mb-3">{t('dashboard.revenueChart')}</h3>
          <MiniBar data={REVENUE_DAYS} />
        </div>
      </div>
    </div>
  )
}
