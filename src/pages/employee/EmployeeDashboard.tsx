import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { callEdgeFunction, isSupabaseConfigured } from '../../lib/supabase'
import { useSettings } from '../../hooks/useSettings'
import KanbanBoard from '../../components/ui/KanbanBoard'
import type { OrderStatus } from '../../lib/types'

export default function EmployeeDashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: settings } = useSettings()
  const [checkedIn, setCheckedIn] = useState(false)
  const [shiftStart, setShiftStart] = useState<Date | null>(null)
  const [elapsed, setElapsed] = useState('00:00:00')
  const [salary, setSalary] = useState<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!checkedIn || !shiftStart) return
    timerRef.current = setInterval(() => {
      const diff = Date.now() - shiftStart.getTime()
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0')
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0')
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0')
      setElapsed(`${h}:${m}:${s}`)
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [checkedIn, shiftStart])

  const handleCheckIn = async () => {
    if (isSupabaseConfigured) {
      try {
        await callEdgeFunction('employee-checkin', { action: 'check_in' })
      } catch (err) {
        console.error(err)
      }
    }
    setCheckedIn(true)
    setShiftStart(new Date())
  }

  const handleCheckOut = async () => {
    if (isSupabaseConfigured) {
      try {
        await callEdgeFunction('employee-checkin', { action: 'check_out' })
      } catch (err) {
        console.error(err)
      }
    }
    setCheckedIn(false)
    setShiftStart(null)
    setElapsed('00:00:00')
  }

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await callEdgeFunction('update-order-status', { orderId, status: newStatus })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Check-in / Check-out */}
      <div className="bg-[#121212] border border-white/5 rounded-xl p-6 text-center">
        <p className="text-gray-400 text-sm mb-1">{t('employee.shiftTimer')}</p>
        <p className="text-4xl text-white font-mono mb-4">{elapsed}</p>
        {!checkedIn ? (
          <button
            onClick={handleCheckIn}
            className="px-8 py-3 bg-green-600 text-white rounded-xl text-lg font-medium hover:bg-green-700 transition-colors"
          >
            {t('employee.checkIn')}
          </button>
        ) : (
          <button
            onClick={handleCheckOut}
            className="px-8 py-3 bg-red-600 text-white rounded-xl text-lg font-medium hover:bg-red-700 transition-colors"
          >
            {t('employee.checkOut')}
          </button>
        )}
      </div>

      {/* Salary */}
      {settings?.show_employee_salary && salary !== null && (
        <div className="bg-[#121212] border border-white/5 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-sm">{t('employee.salary')}</p>
          <p className="text-2xl text-[#c9a84c] font-bold">{salary}฿</p>
        </div>
      )}

      {/* Quick Actions */}
      <button
        onClick={() => navigate('/employee/new-order')}
        className="w-full py-4 bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-xl text-[#c9a84c] text-lg font-medium hover:bg-[#c9a84c]/20 transition-colors"
      >
        {t('employee.newOrder')}
      </button>

      {/* Kanban */}
      <KanbanBoard onStatusChange={handleStatusChange} />
    </div>
  )
}
