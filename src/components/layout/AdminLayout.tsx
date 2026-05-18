import { type ReactNode, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../ui/LanguageSwitcher'
import OfflineBanner from '../ui/OfflineBanner'
import { useAuthStore } from '../../stores/authStore'

interface AdminLayoutProps {
  children: ReactNode
}

const NAV_ITEMS = [
  { to: '/admin/dashboard', labelKey: 'admin.dashboard' },
  { to: '/admin/menu', labelKey: 'admin.menuManage' },
  { to: '/admin/orders', labelKey: 'admin.orders' },
  { to: '/admin/events', labelKey: 'admin.events' },
  { to: '/admin/members', labelKey: 'admin.members' },
  { to: '/admin/settings', labelKey: 'admin.settings' },
  { to: '/admin/qrcodes', labelKey: 'QR Codes' },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const logout = useAuthStore((s) => s.logout)

  const navContent = (
    <>
      <div className="p-4 border-b border-[#c9a84c]/20">
        <h2 className="text-lg text-[#c9a84c] mb-3">{t('admin.title')}</h2>
        <LanguageSwitcher />
      </div>
      <nav className="flex flex-col p-2 gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#c9a84c]/20 text-[#c9a84c]'
                  : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
              }`
            }
          >
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto p-4">
        <button
          onClick={() => {
            logout()
            setMenuOpen(false)
          }}
          className="w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
        >
          {t('common.back')}
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#080808] flex">
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 bg-[#121212] border-e border-[#1a1a1a] min-h-screen">
        {navContent}
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <aside className="relative w-64 bg-[#121212] min-h-screen flex flex-col">
            {navContent}
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 min-h-screen">
        <header className="sticky top-0 z-30 bg-[#121212] border-b border-[#1a1a1a] md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="text-[#c9a84c] p-1"
              aria-label="Menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <h1 className="text-lg text-[#c9a84c]">{t('admin.title')}</h1>
            <div className="w-8" />
          </div>
        </header>
        <OfflineBanner />
        <main className="p-4 md:p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  )
}
