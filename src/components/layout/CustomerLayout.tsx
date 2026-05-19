import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../ui/LanguageSwitcher'
import OfflineBanner from '../ui/OfflineBanner'
import BottomNav from '../ui/BottomNav'
import InstallPrompt from '../ui/InstallPrompt'

interface CustomerLayoutProps {
  children: ReactNode
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'oklch(0.08 0.008 60)' }}>
      <InstallPrompt />
      <header
        className="sticky top-0 z-30"
        style={{
          backgroundColor: 'oklch(0.08 0.008 60 / 0.95)',
          backdropFilter: 'blur(20px) saturate(1.2)',
          borderBottom: '1px solid oklch(0.20 0.01 60 / 0.5)',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
          <h1
            className="text-lg font-black tracking-tight uppercase"
            style={{
              color: 'var(--gold)',
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
      <main className="pb-20 animate-page-in">{children}</main>
      <BottomNav />
    </div>
  )
}
