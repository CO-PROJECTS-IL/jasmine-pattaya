import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import GeoGate from '../ui/GeoGate'
import LanguageSwitcher from '../ui/LanguageSwitcher'
import OfflineBanner from '../ui/OfflineBanner'
import { useAuthStore } from '../../stores/authStore'

export default function EmployeeLayout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  return (
    <GeoGate>
      <div className="min-h-screen bg-[#080808]">
        <OfflineBanner />
        <header className="sticky top-0 z-30 bg-[#121212] border-b border-white/5">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <NavLink
                to="/employee"
                end
                className={({ isActive }) =>
                  `text-sm px-3 py-1 rounded-lg transition-colors ${isActive ? 'bg-[#c9a84c]/20 text-[#c9a84c]' : 'text-gray-400 hover:text-white'}`
                }
              >
                {t('employee.title')}
              </NavLink>
              <NavLink
                to="/employee/schedule"
                className={({ isActive }) =>
                  `text-sm px-3 py-1 rounded-lg transition-colors ${isActive ? 'bg-[#c9a84c]/20 text-[#c9a84c]' : 'text-gray-400 hover:text-white'}`
                }
              >
                {t('employee.myShifts')}
              </NavLink>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <button
                onClick={() => { logout(); navigate('/') }}
                className="text-xs text-red-400/60 hover:text-red-400 px-2 py-1"
              >
                {t('common.back')}
              </button>
            </div>
          </div>
        </header>
        <main className="p-4 max-w-4xl mx-auto">
          <Outlet />
        </main>
      </div>
    </GeoGate>
  )
}
