import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import type { Shift } from '../../lib/types'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function EmployeeSchedule() {
  const { t } = useTranslation()

  const { data: shifts = [], isLoading } = useQuery({
    queryKey: ['my-shifts'],
    queryFn: async (): Promise<Shift[]> => {
      if (!isSupabaseConfigured) return []
      const today = new Date()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      const endOfNextWeek = new Date(startOfWeek)
      endOfNextWeek.setDate(startOfWeek.getDate() + 13)

      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .gte('date', startOfWeek.toISOString().split('T')[0])
        .lte('date', endOfNextWeek.toISOString().split('T')[0])
        .order('date')
      if (error) throw error
      return data
    },
  })

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>

  const shiftTypeColors: Record<string, string> = {
    morning: 'bg-blue-50 text-blue-600',
    evening: 'bg-purple-50 text-purple-600',
    full: 'bg-green-50 text-green-700',
    custom: 'bg-amber-50 text-amber-700',
    off: 'bg-gray-100 text-gray-500',
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl mb-4" style={{ color: 'var(--accent)' }}>{t('employee.myShifts')}</h2>

      {shifts.length === 0 ? (
        <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>{t('common.noResults')}</p>
      ) : (
        <div className="space-y-2">
          {shifts.map((shift) => {
            const date = new Date(shift.date)
            const dayName = DAYS[date.getDay()]
            const dateStr = date.toLocaleDateString()
            return (
              <div key={shift.id} className="flex items-center justify-between p-3 rounded-2xl" style={{ backgroundColor: 'white', border: '1px solid oklch(0.93 0.004 255)', boxShadow: '0 1px 4px oklch(0.20 0.02 60 / 0.06)' }}>
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{dayName} {dateStr}</p>
                  {shift.shift_type === 'custom' && shift.custom_start && shift.custom_end && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{shift.custom_start} - {shift.custom_end}</p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-medium ${shiftTypeColors[shift.shift_type] || ''}`}>
                  {t(`schedule.${shift.shift_type === 'full' ? 'fullDay' : shift.shift_type}`)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
