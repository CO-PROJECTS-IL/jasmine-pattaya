import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../ui/LanguageSwitcher'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--dark)' }}>
      <header className="sticky top-0 z-30" style={{ backgroundColor: 'var(--dark-light)', borderBottom: '1px solid oklch(0.25 0.008 255)' }}>
        <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/admin')}
            className="text-sm transition-colors"
            style={{ color: 'var(--accent)' }}
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
