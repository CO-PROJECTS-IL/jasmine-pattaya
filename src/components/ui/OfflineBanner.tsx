import { useTranslation } from 'react-i18next'
import { useOffline } from '../../hooks/useOffline'

export default function OfflineBanner() {
  const { t } = useTranslation()
  const { isOnline } = useOffline()

  if (isOnline) return null

  return (
    <div
      className="px-4 py-2 text-center text-sm"
      style={{
        backgroundColor: 'oklch(0.75 0.14 60 / 0.1)',
        borderBottom: '1px solid oklch(0.75 0.14 60 / 0.3)',
        color: 'var(--gold)',
      }}
    >
      {t('common.offline')} — {t('common.orderQueued')}
    </div>
  )
}
