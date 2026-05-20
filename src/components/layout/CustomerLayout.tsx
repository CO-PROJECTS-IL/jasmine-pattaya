import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../ui/LanguageSwitcher'
import OfflineBanner from '../ui/OfflineBanner'
import BottomNav from '../ui/BottomNav'
import InstallPrompt from '../ui/InstallPrompt'
import ErrorBoundary from '../ui/ErrorBoundary'

interface CustomerLayoutProps {
  children: ReactNode
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-white">
      <InstallPrompt />
      <header
        className="sticky top-0 z-30 bg-white"
        style={{
          boxShadow: '0 1px 3px oklch(0.20 0.02 60 / 0.06)',
          borderBottom: '1px solid oklch(0.92 0.005 255)',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
          <h1
            className="text-lg font-black tracking-tight uppercase"
            style={{
              color: 'var(--accent)',
              letterSpacing: '0.08em',
              fontFamily: "'Frank Ruhl Libre', serif",
            }}
          >
            {t('common.appName')}
          </h1>
          <LanguageSwitcher />
        </div>
      </header>

      <OfflineBanner />
      <main className="pb-20 animate-page-in">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <BottomNav />
    </div>
  )
}
