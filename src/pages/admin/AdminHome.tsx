import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../../components/ui/LanguageSwitcher'
import { useAuthStore } from '../../stores/authStore'
import type { ReactNode } from 'react'

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gold)' }}>
      {children}
    </svg>
  )
}

const BUTTONS: { key: string; icon: ReactNode; path: string }[] = [
  { key: 'dashboard', path: '/admin/dashboard', icon: <Icon><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></Icon> },
  { key: 'orders', path: '/admin/orders', icon: <Icon><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M9 12h6M9 16h6" /></Icon> },
  { key: 'menuManage', path: '/admin/menu', icon: <Icon><path d="M3 6h18M3 12h18M3 18h18" /><circle cx="19" cy="6" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="19" cy="18" r="1" /></Icon> },
  { key: 'employees', path: '/admin/employees', icon: <Icon><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Icon> },
  { key: 'schedule', path: '/admin/schedule', icon: <Icon><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></Icon> },
  { key: 'friday', path: '/admin/friday', icon: <Icon><path d="M9 2c0 0-2 3-2 5s1.5 3 2 3 2-1 2-3-2-5-2-5z" /><rect x="7" y="10" width="4" height="11" rx="1" /><path d="M17 5c0 0-2 3-2 5s1.5 3 2 3 2-1 2-3-2-5-2-5z" /><rect x="15" y="13" width="4" height="8" rx="1" /><line x1="3" y1="21" x2="21" y2="21" /></Icon> },
  { key: 'specialMenus', path: '/admin/special-menus', icon: <Icon><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 3v18" /><circle cx="15" cy="15" r="2" /></Icon> },
  { key: 'expenses', path: '/admin/expenses', icon: <Icon><path d="M2 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-8-2.5 3-5 5.24-5 8z" /><path d="M12 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-8-2.5 3-5 5.24-5 8z" /><path d="M7 3v4M17 3v4" /></Icon> },
  { key: 'reports', path: '/admin/reports', icon: <Icon><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></Icon> },
  { key: 'qrCodes', path: '/admin/qr-codes', icon: <Icon><rect x="2" y="2" width="6" height="6" rx="1" /><rect x="16" y="2" width="6" height="6" rx="1" /><rect x="2" y="16" width="6" height="6" rx="1" /><rect x="16" y="16" width="4" height="4" /><path d="M12 2h2v4h-2zM2 12h4v2H2zM12 12h2v2h-2zM20 12h2v2h-2zM12 18h2v4h-2z" /></Icon> },
  { key: 'settings', path: '/admin/settings', icon: <Icon><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></Icon> },
  { key: 'members', path: '/admin/members', icon: <Icon><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Icon> },
]

export default function AdminHome() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: 'var(--dark)' }}>
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl" style={{ color: 'var(--gold)' }}>{t('admin.title')}</h1>
          <LanguageSwitcher />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {BUTTONS.map((btn) => (
            <button
              key={btn.key}
              onClick={() => navigate(btn.path)}
              className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl hover:opacity-90 transition-all"
              style={{ backgroundColor: 'var(--dark-light)', border: '1px solid oklch(0.75 0.14 60 / 0.15)' }}
            >
              {btn.icon}
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t(`adminHome.${btn.key}`)}</span>
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
