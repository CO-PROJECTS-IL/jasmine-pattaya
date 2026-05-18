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
    <div className="fixed top-0 inset-x-0 z-50 bg-gradient-to-b from-[#1a1a1a] to-[#121212] border-b border-[#c9a84c]/30 px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">{t('common.installHint')}</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={handleInstall}
          className="px-4 py-1.5 bg-[#c9a84c] text-[#080808] rounded-lg text-sm font-bold hover:bg-[#d4b96a] transition-colors"
        >
          {t('common.install')}
        </button>
        <button
          onClick={handleDismiss}
          className="text-gray-500 hover:text-white text-xl leading-none px-1"
        >
          &times;
        </button>
      </div>
    </div>
  )
}
