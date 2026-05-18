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
    <div className="min-h-screen bg-[#080808]">
      <InstallPrompt />
      <header className="sticky top-0 z-30 bg-[#121212] border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <h1 className="text-xl text-[#c9a84c]">{t('common.appName')}</h1>
          <LanguageSwitcher />
        </div>
      </header>

      <OfflineBanner />
      <main className="pb-20 max-w-2xl mx-auto animate-fade-in">{children}</main>
      <BottomNav />
    </div>
  )
}
