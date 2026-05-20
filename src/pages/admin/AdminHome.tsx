import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../../components/ui/LanguageSwitcher'
import { useAuthStore } from '../../stores/authStore'
import type { ReactNode } from 'react'

interface NavItem {
  key: string
  path: string
  icon: ReactNode
  color: string
}

const ICON_SIZE = 22

const SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: 'adminHome.sectionOrders',
    items: [
      {
        key: 'orders', path: '/admin/orders', color: 'oklch(0.50 0.16 30)',
        icon: <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M9 12h6M9 16h6" /></svg>,
      },
      {
        key: 'dashboard', path: '/admin/dashboard', color: 'oklch(0.45 0.16 255)',
        icon: <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></svg>,
      },
    ],
  },
  {
    label: 'adminHome.sectionMenu',
    items: [
      {
        key: 'menuManage', path: '/admin/menu', color: 'oklch(0.50 0.14 150)',
        icon: <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h18M3 18h18" /><circle cx="19" cy="6" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="19" cy="18" r="1" /></svg>,
      },
      {
        key: 'friday', path: '/admin/friday', color: 'oklch(0.55 0.14 80)',
        icon: <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M9 2c0 0-2 3-2 5s1.5 3 2 3 2-1 2-3-2-5-2-5z" /><rect x="7" y="10" width="4" height="11" rx="1" /><path d="M17 5c0 0-2 3-2 5s1.5 3 2 3 2-1 2-3-2-5-2-5z" /><rect x="15" y="13" width="4" height="8" rx="1" /><line x1="3" y1="21" x2="21" y2="21" /></svg>,
      },
      {
        key: 'specialMenus', path: '/admin/special-menus', color: 'oklch(0.50 0.14 310)',
        icon: <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 3v18" /><circle cx="15" cy="15" r="2" /></svg>,
      },
    ],
  },
  {
    label: 'adminHome.sectionTeam',
    items: [
      {
        key: 'employees', path: '/admin/employees', color: 'oklch(0.50 0.14 200)',
        icon: <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
      },
      {
        key: 'schedule', path: '/admin/schedule', color: 'oklch(0.50 0.14 170)',
        icon: <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></svg>,
      },
    ],
  },
  {
    label: 'adminHome.sectionFinance',
    items: [
      {
        key: 'expenses', path: '/admin/expenses', color: 'oklch(0.50 0.16 30)',
        icon: <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M2 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-8-2.5 3-5 5.24-5 8z" /><path d="M12 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-8-2.5 3-5 5.24-5 8z" /><path d="M7 3v4M17 3v4" /></svg>,
      },
      {
        key: 'reports', path: '/admin/reports', color: 'oklch(0.50 0.14 150)',
        icon: <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
      },
    ],
  },
  {
    label: 'adminHome.sectionSettings',
    items: [
      {
        key: 'qrCodes', path: '/admin/qr-codes', color: 'oklch(0.45 0.12 255)',
        icon: <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="6" height="6" rx="1" /><rect x="16" y="2" width="6" height="6" rx="1" /><rect x="2" y="16" width="6" height="6" rx="1" /><rect x="16" y="16" width="4" height="4" /><path d="M12 2h2v4h-2zM2 12h4v2H2zM12 12h2v2h-2zM20 12h2v2h-2zM12 18h2v4h-2z" /></svg>,
      },
      {
        key: 'members', path: '/admin/members', color: 'oklch(0.50 0.14 340)',
        icon: <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
      },
      {
        key: 'settings', path: '/admin/settings', color: 'oklch(0.55 0.08 255)',
        icon: <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
      },
    ],
  },
]

export default function AdminHome() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'oklch(0.97 0.002 255)' }}
    >
      {/* Header */}
      <header
        className="bg-white"
        style={{
          borderBottom: '1px solid oklch(0.92 0.005 255)',
          boxShadow: '0 1px 3px oklch(0.20 0.02 60 / 0.04)',
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 max-w-lg mx-auto">
          <div>
            <h1
              className="text-xl font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('admin.title')}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Jasmine Pattaya
            </p>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-5 max-w-lg mx-auto animate-page-in">
        {SECTIONS.map((section, sIdx) => (
          <div key={sIdx} className="mb-5">
            <p
              className="text-[11px] font-semibold uppercase tracking-wider px-1 mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              {t(section.label)}
            </p>
            <div
              className="rounded-2xl overflow-hidden bg-white"
              style={{
                boxShadow: '0 1px 4px oklch(0.20 0.02 60 / 0.06)',
                border: '1px solid oklch(0.93 0.004 255)',
              }}
            >
              {section.items.map((item, idx) => (
                <button
                  key={item.key}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3.5 px-4 py-3.5 text-start transition-colors hover:bg-black/[0.02] active:bg-black/[0.04]"
                  style={
                    idx < section.items.length - 1
                      ? { borderBottom: '1px solid oklch(0.95 0.003 255)' }
                      : undefined
                  }
                >
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: item.color.replace(')', ' / 0.1)'), color: item.color }}
                  >
                    {item.icon}
                  </span>
                  <span
                    className="text-[15px] font-medium flex-1"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {t(`adminHome.${item.key}`)}
                  </span>
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ color: 'oklch(0.80 0.008 255)', transform: 'scaleX(-1)' }}
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button
          onClick={() => { logout(); navigate('/') }}
          className="w-full mt-4 mb-8 py-3 text-sm font-medium rounded-2xl transition-colors hover:bg-red-50"
          style={{
            color: 'oklch(0.55 0.16 25)',
            border: '1px solid oklch(0.90 0.02 25)',
          }}
        >
          {t('common.back')}
        </button>
      </div>
    </div>
  )
}
