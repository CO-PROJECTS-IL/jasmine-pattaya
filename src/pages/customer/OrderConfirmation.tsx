import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../../stores/cartStore'

export default function OrderConfirmation() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { items, tableNumber, getTotal, clear } = useCartStore()

  const orderId = useMemo(() => `J-${Date.now().toString(36).toUpperCase()}`, [])
  const total = getTotal()

  useEffect(() => {
    if (items.length === 0) return
    const timer = setTimeout(() => clear(), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-slide-up">
      <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
        <span className="text-4xl text-green-400">✓</span>
      </div>
      <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--gold)' }}>
        {t('order.thankYou')}
      </h1>
      <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
        {t('order.orderNumber')}: <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{orderId}</span>
      </p>

      {tableNumber && (
        <p className="mb-2" style={{ color: 'var(--text-muted)' }}>
          {t('cart.table')} {tableNumber}
        </p>
      )}

      {total > 0 && (
        <div className="mb-8 text-center">
          <p className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>฿{total}</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{t('order.excludingService')}</p>
        </div>
      )}

      <div className="space-y-3 w-full max-w-xs">
        <button
          onClick={() => navigate('/menu')}
          className="w-full py-3 rounded-xl font-bold transition-colors"
          style={{ backgroundColor: 'var(--gold)', color: 'var(--dark)' }}
        >
          {t('order.newOrder')}
        </button>
      </div>
    </div>
  )
}
