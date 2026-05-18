import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import AdminLayout from '../../components/layout/AdminLayout'
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
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl text-[#c9a84c]">{t('adminHome.employees')}</h1>
        <button
          onClick={() => navigate('/admin/employees/new')}
          className="px-4 py-2 bg-[#c9a84c] text-black rounded-lg text-sm font-medium hover:bg-[#d4b96a]"
        >
          {t('employees.addEmployee')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {employees.map((emp) => (
          <div
            key={emp.id}
            onClick={() => navigate(`/admin/employees/${emp.id}`)}
            className="flex items-center gap-3 p-4 bg-[#121212] border border-white/5 rounded-xl cursor-pointer hover:border-[#c9a84c]/20 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c] font-bold text-lg">
              {emp.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{emp.full_name}</p>
              <p className="text-gray-500 text-xs">{t(`employees.${emp.role}` as any)} • {emp.pay_rate}฿/{emp.pay_type === 'hourly' ? t('employees.hourly') : t('employees.daily')}</p>
            </div>
            <div className="flex items-center gap-1">
              <span className={`px-2 py-0.5 rounded text-[10px] ${emp.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {emp.is_active ? t('employees.active') : t('employees.inactive')}
              </span>
            </div>
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              {emp.phone && (
                <>
                  <a href={`https://wa.me/${emp.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener" className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center text-xs">W</a>
                  <a href={`tel:${emp.phone}`} className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs">📞</a>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
