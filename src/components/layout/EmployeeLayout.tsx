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
      <div className="min-h-screen" style={{ backgroundColor: 'var(--dark)' }}>
        <OfflineBanner />
        <header className="sticky top-0 z-30" style={{ backgroundColor: 'var(--dark-light)', borderBottom: '1px solid oklch(0.25 0.005 85)' }}>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <NavLink
                to="/employee"
                end
                className="text-sm px-3 py-1.5 rounded-lg transition-colors"
                style={({ isActive }) => isActive
                  ? { backgroundColor: 'oklch(0.75 0.12 85 / 0.15)', color: 'var(--gold)' }
                  : { color: 'var(--text-muted)' }
                }
              >
                {t('employee.title')}
              </NavLink>
              <NavLink
                to="/employee/schedule"
                className="text-sm px-3 py-1.5 rounded-lg transition-colors"
                style={({ isActive }) => isActive
                  ? { backgroundColor: 'oklch(0.75 0.12 85 / 0.15)', color: 'var(--gold)' }
                  : { color: 'var(--text-muted)' }
                }
              >
                {t('employee.myShifts')}
              </NavLink>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <button
                onClick={() => { logout(); navigate('/') }}
                className="text-xs px-2 py-1 transition-colors"
                style={{ color: 'oklch(0.55 0.15 25 / 0.6)' }}
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
