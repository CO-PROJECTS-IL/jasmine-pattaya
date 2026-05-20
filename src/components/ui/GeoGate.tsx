import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useGeolocation } from '../../hooks/useGeolocation'
import LoadingSpinner from './LoadingSpinner'

interface GeoGateProps {
  children: ReactNode
}

export default function GeoGate({ children }: GeoGateProps) {
  const { t } = useTranslation()
  const { checking, within, error, checkLocation } = useGeolocation()
  const [bypassed, setBypassed] = useState(false)

  useEffect(() => {
    checkLocation()
  }, [checkLocation])

  if (bypassed) return <>{children}</>

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--dark)' }}>
        <LoadingSpinner />
        <p className="mt-4" style={{ color: 'var(--text-muted)' }}>{t('employee.locationRequired')}</p>
      </div>
    )
  }

  if (!within) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: 'var(--dark)' }}>
        <div className="text-4xl mb-4">📍</div>
        <h2 className="text-xl text-red-400 mb-2">{t('employee.outOfRange')}</h2>
        {error && <p className="text-red-400/60 text-xs mb-4">{error}</p>}
        <div className="flex gap-3 mt-4">
          <button
            onClick={checkLocation}
            className="px-6 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: 'oklch(0.45 0.16 255 / 0.2)', color: 'var(--accent)' }}
          >
            {t('common.confirm')}
          </button>
          <button
            onClick={() => setBypassed(true)}
            className="px-6 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: 'oklch(0.25 0.008 255)', color: 'var(--text-muted)' }}
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
