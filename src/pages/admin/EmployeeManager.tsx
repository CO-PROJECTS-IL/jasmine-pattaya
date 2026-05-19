import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import type { Employee } from '../../lib/types'

export default function EmployeeManager() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: async (): Promise<Employee[]> => {
      if (!isSupabaseConfigured) return []
      const { data, error } = await supabase.from('employees').select('*').order('full_name')
      if (error) throw error
      return data
    },
  })

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl" style={{ color: 'var(--gold)' }}>{t('adminHome.employees')}</h1>
        <button
          onClick={() => navigate('/admin/employees/new')}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: 'var(--gold)', color: 'var(--dark)' }}
        >
          {t('employees.addEmployee')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {employees.map((emp) => (
          <div
            key={emp.id}
            onClick={() => navigate(`/admin/employees/${emp.id}`)}
            className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-colors"
            style={{ backgroundColor: 'var(--dark-light)', border: '1px solid oklch(0.25 0.008 60)' }}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ backgroundColor: 'oklch(0.75 0.14 60 / 0.2)', color: 'var(--gold)' }}>
              {emp.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{emp.full_name}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t(`employees.${emp.role}` as any)} • {emp.pay_rate}฿/{emp.pay_type === 'hourly' ? t('employees.hourly') : t('employees.daily')}</p>
            </div>
            <div className="flex items-center gap-1">
              <span className={`px-2 py-0.5 rounded text-[10px] ${emp.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {emp.is_active ? t('employees.active') : t('employees.inactive')}
              </span>
            </div>
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              {emp.phone && (
                <>
                  <a href={`https://wa.me/${emp.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener" className="w-11 h-11 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center text-xs" aria-label="WhatsApp">W</a>
                  <a href={`tel:${emp.phone}`} className="w-11 h-11 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-sm" aria-label="Call">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </a>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
