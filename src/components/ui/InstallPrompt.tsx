import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const { t } = useTranslation()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('jasmine-install-dismissed') === 'true'
  )

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!deferredPrompt || dismissed) return null

  const handleInstall = async () => {
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('jasmine-install-dismissed', 'true')
    setDismissed(true)
  }

  return (
    <div
      className="fixed top-0 inset-x-0 z-50 px-4 py-3 flex items-center justify-between gap-3"
      style={{
        background: 'linear-gradient(to bottom, var(--dark-lighter), var(--dark-light))',
        borderBottom: '1px solid oklch(0.75 0.14 60 / 0.3)',
      }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{t('common.installHint')}</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={handleInstall}
          className="px-4 py-1.5 rounded-lg text-sm font-bold transition-colors"
          style={{ backgroundColor: 'var(--gold)', color: 'var(--dark)' }}
        >
          {t('common.install')}
        </button>
        <button
          onClick={handleDismiss}
          className="text-xl leading-none px-1"
          style={{ color: 'var(--text-muted)' }}
        >
          &times;
        </button>
      </div>
    </div>
  )
}
