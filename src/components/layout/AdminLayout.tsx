import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../ui/LanguageSwitcher'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#080808]">
      <header className="sticky top-0 z-30 bg-[#121212] border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/admin')}
            className="text-[#c9a84c] text-sm hover:text-[#d4b96a] transition-colors"
          >
            ← {t('common.back')}
          </button>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="p-4 md:p-6 max-w-4xl mx-auto">{children}</main>
    </div>
  )
}
