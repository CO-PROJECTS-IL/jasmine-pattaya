import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../../components/ui/LanguageSwitcher'
import { useAuthStore } from '../../stores/authStore'

const BUTTONS = [
  { key: 'dashboard', icon: '📊', path: '/admin/dashboard' },
  { key: 'orders', icon: '🍽️', path: '/admin/orders' },
  { key: 'menuManage', icon: '📋', path: '/admin/menu' },
  { key: 'employees', icon: '👥', path: '/admin/employees' },
  { key: 'schedule', icon: '📅', path: '/admin/schedule' },
  { key: 'friday', icon: '🕯️', path: '/admin/friday' },
  { key: 'reports', icon: '💰', path: '/admin/reports' },
  { key: 'settings', icon: '⚙️', path: '/admin/settings' },
]

export default function AdminHome() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  return (
    <div className="min-h-screen bg-[#080808] p-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl text-[#c9a84c]">{t('admin.title')}</h1>
          <LanguageSwitcher />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {BUTTONS.map((btn) => (
            <button
              key={btn.key}
              onClick={() => navigate(btn.path)}
              className="flex flex-col items-center justify-center gap-2 p-6 bg-[#121212] border border-[#c9a84c]/15 rounded-xl hover:bg-[#1a1a1a] hover:border-[#c9a84c]/30 transition-all"
            >
              <span className="text-3xl">{btn.icon}</span>
              <span className="text-sm text-gray-300">{t(`adminHome.${btn.key}`)}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => { logout(); navigate('/') }}
          className="w-full mt-8 py-3 text-sm text-red-400/60 hover:text-red-400 transition-colors"
        >
          {t('common.back')}
        </button>
      </div>
    </div>
  )
}
