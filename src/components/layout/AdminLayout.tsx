import { type ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../ui/LanguageSwitcher'
import ErrorBoundary from '../ui/ErrorBoundary'

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'adminHome.dashboard',
  '/admin/orders': 'adminHome.orders',
  '/admin/menu': 'adminHome.menuManage',
  '/admin/employees': 'adminHome.employees',
  '/admin/schedule': 'adminHome.schedule',
  '/admin/friday': 'adminHome.friday',
  '/admin/expenses': 'adminHome.expenses',
  '/admin/reports': 'adminHome.reports',
  '/admin/qr-codes': 'adminHome.qrCodes',
  '/admin/settings': 'settings.title',
  '/admin/members': 'adminHome.members',
  '/admin/special-menus': 'adminHome.specialMenus',
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const titleKey = Object.entries(PAGE_TITLES).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'oklch(0.97 0.002 255)' }}>
      <header
        className="sticky top-0 z-30 bg-white"
        style={{
          borderBottom: '1px solid oklch(0.92 0.005 255)',
          boxShadow: '0 1px 3px oklch(0.20 0.02 60 / 0.04)',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-1.5 text-sm font-medium transition-colors rounded-lg px-2.5 py-1.5 hover:bg-black/5"
              style={{ color: 'var(--accent)' }}
              aria-label={t('common.back')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              {t('common.back')}
            </button>
            {titleKey && (
              <>
                <span style={{ color: 'oklch(0.80 0.008 255)' }}>|</span>
                <h1
                  className="text-base font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t(titleKey)}
                </h1>
              </>
            )}
          </div>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="p-4 md:p-6 max-w-5xl mx-auto animate-page-in">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </div>
  )
}
