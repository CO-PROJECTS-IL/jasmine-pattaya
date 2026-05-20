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
        className="px-5 py-3 rounded-2xl text-sm font-semibold animate-toast-in pointer-events-auto"
        style={{
          backgroundColor: 'var(--accent)',
          color: 'white',
          boxShadow: '0 8px 32px oklch(0.45 0.16 255 / 0.3)',
        }}
      >
        <span style={{ color: 'oklch(0.85 0.08 150)' }}>&#10003;</span>{' '}
        {dishName} {t('menu.addedToCart')}
      </div>
    </div>
  )
}
