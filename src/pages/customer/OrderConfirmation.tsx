import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCartStore } from '../../stores/cartStore'

export default function OrderConfirmation() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { tableNumber, clear } = useCartStore()
  const [notifStatus, setNotifStatus] = useState<'idle' | 'granted' | 'denied'>('idle')

  const state = location.state as { orderId?: string; total?: number } | null
  const rawId = state?.orderId || ''
  const orderId = rawId ? `J-${rawId.slice(0, 8).toUpperCase()}` : '—'
  const total = state?.total || 0

  useEffect(() => {
    clear()
  }, [])

  useEffect(() => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'granted') {
      setNotifStatus('granted')
    } else if (Notification.permission === 'denied') {
      setNotifStatus('denied')
    }
  }, [])

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) return
    const result = await Notification.requestPermission()
    setNotifStatus(result === 'granted' ? 'granted' : 'denied')
  }

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

      {notifStatus === 'idle' && 'Notification' in window && (
        <button
          onClick={handleEnableNotifications}
          className="mb-6 px-5 py-3 rounded-xl text-sm font-medium transition-colors"
          style={{
            backgroundColor: 'oklch(0.75 0.14 60 / 0.15)',
            color: 'var(--gold)',
            border: '1px solid oklch(0.75 0.14 60 / 0.3)',
          }}
        >
          {t('order.enableNotifications')}
        </button>
      )}
      {notifStatus === 'granted' && (
        <p className="mb-6 text-xs" style={{ color: 'oklch(0.55 0.14 145)' }}>
          {t('order.notificationsEnabled')}
        </p>
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
