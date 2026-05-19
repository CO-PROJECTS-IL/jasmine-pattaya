import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function OfflineBanner() {
  const { t } = useTranslation()
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const goOffline = () => setIsOffline(true)
    const goOnline = () => setIsOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div
      className="px-4 py-2 text-center text-sm"
      style={{
        backgroundColor: 'oklch(0.75 0.12 85 / 0.1)',
        borderBottom: '1px solid oklch(0.75 0.12 85 / 0.3)',
        color: 'var(--gold)',
      }}
    >
      {t('common.offline')}
    </div>
  )
}
