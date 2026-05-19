import { useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useGeolocation } from '../../hooks/useGeolocation'
import LoadingSpinner from './LoadingSpinner'

interface GeoGateProps {
  children: ReactNode
}

export default function GeoGate({ children }: GeoGateProps) {
  const { t } = useTranslation()
  const { checking, within, distance, error, checkLocation } = useGeolocation()

  useEffect(() => {
    checkLocation()
  }, [checkLocation])

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
        {distance !== null && (
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            {distance}m away
          </p>
        )}
        {error && <p className="text-red-400/60 text-xs mb-4">{error}</p>}
        <button
          onClick={checkLocation}
          className="px-6 py-2 rounded-lg transition-colors"
          style={{ backgroundColor: 'oklch(0.75 0.12 85 / 0.2)', color: 'var(--gold)' }}
        >
          {t('common.confirm')}
        </button>
      </div>
    )
  }

  return <>{children}</>
}
