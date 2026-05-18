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
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center">
        <LoadingSpinner />
        <p className="text-gray-400 mt-4">{t('employee.locationRequired')}</p>
      </div>
    )
  }

  if (!within) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center p-6 text-center">
        <div className="text-4xl mb-4">📍</div>
        <h2 className="text-xl text-red-400 mb-2">{t('employee.outOfRange')}</h2>
        {distance !== null && (
          <p className="text-gray-500 text-sm mb-6">
            {distance}m away
          </p>
        )}
        {error && <p className="text-red-400/60 text-xs mb-4">{error}</p>}
        <button
          onClick={checkLocation}
          className="px-6 py-2 bg-[#c9a84c]/20 text-[#c9a84c] rounded-lg hover:bg-[#c9a84c]/30 transition-colors"
        >
          {t('common.confirm')}
        </button>
      </div>
    )
  }

  return <>{children}</>
}
