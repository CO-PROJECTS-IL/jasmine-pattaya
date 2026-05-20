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
        background: 'oklch(0.98 0.005 255)',
        borderBottom: '1px solid oklch(0.88 0.02 255)',
        boxShadow: '0 2px 8px oklch(0.45 0.16 255 / 0.1)',
      }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'oklch(0.25 0.02 255)' }}>{t('common.installHint')}</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={handleInstall}
          className="px-4 py-1.5 rounded-lg text-sm font-bold transition-colors"
          style={{ backgroundColor: 'var(--accent)', color: 'white' }}
        >
          {t('common.install')}
        </button>
        <button
          onClick={handleDismiss}
          className="text-xl leading-none px-1"
          style={{ color: 'oklch(0.55 0.03 255)' }}
        >
          &times;
        </button>
      </div>
    </div>
  )
}
