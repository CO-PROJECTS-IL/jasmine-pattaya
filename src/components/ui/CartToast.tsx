import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface CartToastProps {
  visible: boolean
  dishName: string
  onHide: () => void
}

export default function CartToast({ visible, dishName, onHide }: CartToastProps) {
  const { t } = useTranslation()

  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onHide, 2000)
    return () => clearTimeout(timer)
  }, [visible, onHide])

  if (!visible) return null

  return (
    <div
      className="fixed bottom-24 start-4 end-4 z-50 flex items-center justify-center pointer-events-none"
      style={{ maxWidth: '400px', marginInline: 'auto' }}
    >
      <div
        className="px-5 py-3 rounded-2xl text-sm font-semibold animate-slide-up pointer-events-auto"
        style={{
          backgroundColor: 'oklch(0.22 0.012 60 / 0.95)',
          color: 'var(--gold)',
          border: '1px solid oklch(0.75 0.14 60 / 0.15)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px oklch(0 0 0 / 0.4)',
        }}
      >
        <span style={{ color: 'oklch(0.55 0.15 145)' }}>&#10003;</span>{' '}
        {dishName} {t('menu.addedToCart')}
      </div>
    </div>
  )
}
