import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/layout/AdminLayout'

type DateRange = 'today' | 'week' | 'month' | 'custom'

interface ReportData {
  revenue: number
  expenses: { employees: number; recurring: number; onetime: number }
  dailyRevenue: { date: string; amount: number }[]
  dailyProfit: { date: string; amount: number }[]
}

function getDateRange(range: DateRange, customStart?: string, customEnd?: string) {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

  if (range === 'today') {
    const today = fmt(now)
    return { start: today, end: today }
  }
  if (range === 'week') {
    const start = new Date(now)
    start.setDate(now.getDate() - now.getDay())
    return { start: fmt(start), end: fmt(now) }
  }
  if (range === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    return { start: fmt(start), end: fmt(now) }
  }
  return { start: customStart ?? fmt(now), end: customEnd ?? fmt(now) }
}

const PIE_COLORS = ['#c9a84c', '#f59e0b', '#ef4444']

export default function ReportsPage() {
  const { t } = useTranslation()
  const [range, setRange] = useState<DateRange>('month')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<ReportData>({
    revenue: 0,
    expenses: { employees: 0, recurring: 0, onetime: 0 },
    dailyRevenue: [],
    dailyProfit: [],
  })

  const fetchData = useCallback(async () => {
    const { start, end } = getDateRange(range, customStart, customEnd)
    setLoading(true)
    try {
      const { data } = await supabase.functions.invoke('admin-reports', {
        body: { start_date: start, end_date: end },
      })
      if (data) setReportData(data)
    } catch {
      // edge function not yet deployed — keep mock zeros
    } finally {
      setLoading(false)
    }
  }, [range, customStart, customEnd])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const totalExpenses =
    reportData.expenses.employees + reportData.expenses.recurring + reportData.expenses.onetime
  const netProfit = reportData.revenue - totalExpenses

  const pieData = [
    { name: t('reports.employeeCosts'), value: reportData.expenses.employees },
    { name: t('reports.recurringExpenses'), value: reportData.expenses.recurring },
    { name: t('reports.onetimeExpenses'), value: reportData.expenses.onetime },
  ]

  const inputClass =
    'bg-[#121212] border border-[#c9a84c]/30 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#c9a84c]'
  const rangeBtn = (key: DateRange, label: string) => (
    <button
      key={key}
      onClick={() => setRange(key)}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        range === key
          ? 'bg-[#c9a84c] text-black'
          : 'bg-[#121212] border border-[#c9a84c]/20 text-gray-400 hover:text-white'
      }`}
    >
      {label}
    </button>
  )

  return (
    <AdminLayout>
      <h1 className="text-xl text-[#c9a84c] mb-6">{t('reports.title')}</h1>

      {/* Date range filter */}
      <div className="flex flex-wrap gap-2 mb-6 items-center">
        {rangeBtn('today', t('reports.today'))}
        {rangeBtn('week', t('reports.thisWeek'))}
        {rangeBtn('month', t('reports.thisMonth'))}
        {rangeBtn('custom', t('reports.custom'))}

        {range === 'custom' && (
          <div className="flex gap-2 items-center ms-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className={inputClass}
            />
            <span className="text-gray-500">–</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className={inputClass}
            />
          </div>
        )}

        {loading && (
          <span className="text-xs text-gray-500 ms-2">...</span>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#121212] border border-[#c9a84c]/20 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-xs mb-1">{t('reports.revenue')}</p>
          <p className="text-xl font-bold text-green-400">฿{reportData.revenue.toLocaleString()}</p>
        </div>
        <div className="bg-[#121212] border border-[#c9a84c]/20 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-xs mb-1">{t('reports.expenses')}</p>
          <p className="text-xl font-bold text-red-400">฿{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-[#121212] border border-[#c9a84c]/20 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-xs mb-1">{t('reports.netProfit')}</p>
          <p
            className="text-xl font-bold"
            style={{ color: netProfit >= 0 ? '#c9a84c' : '#ef4444' }}
          >
            ฿{netProfit.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-4">
        {/* Revenue over time */}
        <div className="bg-[#121212] border border-[#c9a84c]/20 rounded-xl p-4">
          <h3 className="text-sm text-gray-400 mb-3">{t('reports.revenueOverTime')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={reportData.dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 10 }} />
              <YAxis tick={{ fill: '#888', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #c9a84c33', borderRadius: 8 }}
                labelStyle={{ color: '#c9a84c' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="amount" fill="#c9a84c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expenses by category + Profit trend side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Expenses by category — PieChart */}
          <div className="bg-[#121212] border border-[#c9a84c]/20 rounded-xl p-4">
            <h3 className="text-sm text-gray-400 mb-3">{t('reports.expensesByCategory')}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #c9a84c33', borderRadius: 8 }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => [`฿${value.toLocaleString()}`, '']}
                />
                <Legend
                  iconSize={10}
                  wrapperStyle={{ fontSize: 11, color: '#888' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Profit trend — LineChart */}
          <div className="bg-[#121212] border border-[#c9a84c]/20 rounded-xl p-4">
            <h3 className="text-sm text-gray-400 mb-3">{t('reports.profitTrend')}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={reportData.dailyProfit}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 10 }} />
                <YAxis tick={{ fill: '#888', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #c9a84c33', borderRadius: 8 }}
                  labelStyle={{ color: '#c9a84c' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#c9a84c"
                  strokeWidth={2}
                  dot={{ fill: '#c9a84c', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
