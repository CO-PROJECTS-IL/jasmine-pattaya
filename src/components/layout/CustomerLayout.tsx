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
    <div className="min-h-screen" style={{ backgroundColor: 'oklch(0.12 0.005 85)' }}>
      <InstallPrompt />
      <header
        className="sticky top-0 z-30 gold-border-glow backdrop-blur-md"
        style={{ backgroundColor: 'oklch(0.14 0.005 85 / 0.92)' }}
      >
        <div className="flex items-center justify-between px-4 py-3.5 max-w-lg mx-auto">
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--gold)' }}>
            {t('common.appName')}
          </h1>
          <LanguageSwitcher />
        </div>
      </header>

      <OfflineBanner />
      <main className="pb-20 max-w-2xl mx-auto animate-fade-in">{children}</main>
      <BottomNav />
    </div>
  )
}
