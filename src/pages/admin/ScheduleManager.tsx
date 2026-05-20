import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured, callEdgeFunction } from '../../lib/supabase'
import { useToast } from '../../hooks/useToast'
import Toast from '../../components/ui/Toast'
import type { Employee, Shift } from '../../lib/types'
import { SHIFT_TYPES } from '../../lib/constants'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const SHIFT_COLORS: Record<string, string> = {
  morning: 'bg-blue-500/30 text-blue-300',
  evening: 'bg-purple-500/30 text-purple-300',
  full: 'bg-green-500/30 text-green-300',
  custom: 'bg-yellow-500/30 text-yellow-300',
  off: 'bg-gray-500/20 text-gray-500',
}

export default function ScheduleManager() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { toast, showToast } = useToast()
  const [weekOffset, setWeekOffset] = useState(0)

  const weekStart = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay() + weekOffset * 7)
    d.setHours(0, 0, 0, 0)
    return d
  }, [weekOffset])

  const weekDates = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      return d
    }), [weekStart])

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-active'],
    queryFn: async (): Promise<Employee[]> => {
      if (!isSupabaseConfigured) return []
      const { data, error } = await supabase.from('employees').select('*').eq('is_active', true).order('full_name')
      if (error) throw error
      return data
    },
  })

  const { data: shifts = [] } = useQuery({
    queryKey: ['shifts', weekStart.toISOString()],
    queryFn: async (): Promise<Shift[]> => {
      if (!isSupabaseConfigured) return []
      const end = new Date(weekStart)
      end.setDate(end.getDate() + 6)
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .gte('date', weekStart.toISOString().split('T')[0])
        .lte('date', end.toISOString().split('T')[0])
      if (error) throw error
      return data
    },
  })

  const getShift = (empId: string, date: Date): Shift | undefined =>
    shifts.find((s) => s.employee_id === empId && s.date === date.toISOString().split('T')[0])

  const cycleShiftType = async (empId: string, date: Date) => {
    const current = getShift(empId, date)
    const currentType = current?.shift_type || 'off'
    const idx = SHIFT_TYPES.indexOf(currentType as any)
    const nextType = SHIFT_TYPES[(idx + 1) % SHIFT_TYPES.length]

    try {
      await callEdgeFunction('admin-schedule', {
        employee_id: empId,
        date: date.toISOString().split('T')[0],
        shift_type: nextType,
      })
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
    } catch (err) {
      showToast('שגיאה בשמירת תכנית', 'error')
    }
  }

  const copyPreviousWeek = async () => {
    const prevStart = new Date(weekStart)
    prevStart.setDate(prevStart.getDate() - 7)
    try {
      await callEdgeFunction('admin-schedule', {
        action: 'copy_week',
        source_start: prevStart.toISOString().split('T')[0],
        target_start: weekStart.toISOString().split('T')[0],
      })
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
    } catch (err) {
      showToast('שגיאה בהעתקת שבוע', 'error')
    }
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl" style={{ color: 'var(--accent)' }}>{t('schedule.title')}</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset((w) => w - 1)} className="px-3 py-1 bg-white/5 rounded-lg text-sm" style={{ color: 'var(--text-muted)' }}>◀</button>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
          </span>
          <button onClick={() => setWeekOffset((w) => w + 1)} className="px-3 py-1 bg-white/5 rounded-lg text-sm" style={{ color: 'var(--text-muted)' }}>▶</button>
        </div>
      </div>

      <button onClick={copyPreviousWeek} className="mb-4 px-4 py-2 bg-white/5 rounded-lg text-sm hover:bg-white/10" style={{ color: 'var(--text-muted)' }}>
        {t('schedule.copyWeek')}
      </button>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr>
              <th className="text-left text-xs pb-2 pr-3 w-32" style={{ color: 'var(--text-muted)' }}></th>
              {weekDates.map((d, i) => (
                <th key={i} className="text-center text-xs pb-2 px-1" style={{ color: 'var(--text-muted)' }}>
                  {DAYS[d.getDay()]}<br/>{d.getDate()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td className="text-sm py-1 pr-3 truncate" style={{ color: 'var(--text-primary)' }}>{emp.full_name}</td>
                {weekDates.map((date, i) => {
                  const shift = getShift(emp.id, date)
                  const type = shift?.shift_type || 'off'
                  return (
                    <td key={i} className="text-center py-1 px-1">
                      <button
                        onClick={() => cycleShiftType(emp.id, date)}
                        className={`w-full py-1.5 rounded text-[10px] font-medium ${SHIFT_COLORS[type] || SHIFT_COLORS.off}`}
                      >
                        {t(`schedule.${type === 'full' ? 'fullDay' : type}` as any)}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
