import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { callEdgeFunction, isSupabaseConfigured } from '../../lib/supabase'
import { useSettings } from '../../hooks/useSettings'
import { useToast } from '../../hooks/useToast'
import Toast from '../../components/ui/Toast'
import KanbanBoard from '../../components/ui/KanbanBoard'
import type { OrderStatus } from '../../lib/types'

export default function EmployeeDashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: settings } = useSettings()
  const { toast, showToast } = useToast()
  const [checkedIn, setCheckedIn] = useState(false)
  const [shiftStart, setShiftStart] = useState<Date | null>(null)
  const [elapsed, setElapsed] = useState('00:00:00')
  const [salary] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
        showToast('שגיאה בדיווח נוכחות', 'error')
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
        showToast('שגיאה בדיווח נוכחות', 'error')
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
      showToast('שגיאה בטעינת נתונים', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Check-in / Check-out */}
      <div className="rounded-xl p-6 text-center" style={{ backgroundColor: 'var(--dark-light)', border: '1px solid oklch(0.25 0.005 85)' }}>
        <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{t('employee.shiftTimer')}</p>
        <p className="text-4xl font-mono mb-4" style={{ color: 'var(--text-primary)' }}>{elapsed}</p>
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
        <div className="rounded-xl p-4 text-center" style={{ backgroundColor: 'var(--dark-light)', border: '1px solid oklch(0.25 0.005 85)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('employee.salary')}</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>{salary}฿</p>
        </div>
      )}

      {/* Quick Actions */}
      <button
        onClick={() => navigate('/employee/new-order')}
        className="w-full py-4 rounded-xl text-lg font-medium transition-colors"
        style={{ backgroundColor: 'oklch(0.75 0.12 85 / 0.1)', border: '1px solid oklch(0.75 0.12 85 / 0.3)', color: 'var(--gold)' }}
      >
        {t('employee.newOrder')}
      </button>

      {/* Kanban */}
      <KanbanBoard onStatusChange={handleStatusChange} />
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
