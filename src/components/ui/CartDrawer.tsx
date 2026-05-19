import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCartStore } from '../../stores/cartStore'
import { useNavigate } from 'react-router-dom'
import { callEdgeFunction } from '../../lib/supabase'
import { queueOrder } from '../../lib/offline-queue'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

function getItemName(item: { nameHe: string; nameEn: string; nameTh: string }, lang: string) {
  if (lang === 'he') return item.nameHe
  if (lang === 'th') return item.nameTh
  return item.nameEn
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { items, updateQuantity, removeItem, getTotal, tableNumber, orderNotes, setNotes } =
    useCartStore()

  const total = getTotal()
  const drawerRef = useRef<HTMLDivElement>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return
    const drawer = drawerRef.current
    if (!drawer) return
    const focusable = drawer.querySelectorAll<HTMLElement>('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])')
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()
    const trap = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', trap)
    return () => document.removeEventListener('keydown', trap)
  }, [isOpen, onClose])

  const handleSubmit = async () => {
    if (items.length === 0 || submitting) return
    setSubmitting(true)
    setError('')

    const orderData = {
      table_number: tableNumber,
      items: items.map((i) => ({
        dish_id: i.dishId,
        quantity: i.quantity,
        notes: '',
      })),
      notes: orderNotes,
      created_by: 'customer',
    }

    try {
      if (!navigator.onLine) {
        await queueOrder(orderData)
        onClose()
        navigate('/order-confirmation', { state: { orderId: 'offline-' + Date.now(), total: getTotal() } })
        return
      }
      const result = await callEdgeFunction('submit-order', orderData)
      onClose()
      navigate('/order-confirmation', { state: { orderId: result.order_id, total: result.total } })
    } catch (err) {
      if (!navigator.onLine || (err instanceof TypeError && err.message.includes('fetch'))) {
        try {
          await queueOrder(orderData)
          onClose()
          navigate('/order-confirmation', { state: { orderId: 'offline-' + Date.now(), total: getTotal() } })
          return
        } catch {}
      }
      setError(err instanceof Error ? err.message : t('common.error'))
    }
    setSubmitting(false)
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40" style={{ backgroundColor: 'oklch(0 0 0 / 0.6)' }} onClick={onClose} />
      )}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('cart.title')}
        className={`fixed inset-x-0 bottom-0 z-50 rounded-t-3xl transition-transform duration-300 max-h-[85vh] flex flex-col ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          backgroundColor: 'oklch(0.16 0.008 60)',
          borderTop: '1px solid oklch(0.75 0.14 60 / 0.2)',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          className="flex items-center justify-between p-5"
          style={{ borderBottom: '1px solid oklch(0.28 0.008 60)' }}
        >
          <h2 className="text-lg font-bold" style={{ color: 'var(--gold)' }}>
            {t('cart.title')} {tableNumber && `· ${t('cart.table')} ${tableNumber}`}
          </h2>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center text-2xl rounded-xl transition-colors"
            style={{ color: 'var(--text-muted)' }}
            aria-label={t('common.close')}
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', marginBottom: 12 }}>
                <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('cart.empty')}</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.dishId}
                className="flex items-center gap-3 rounded-2xl p-4"
                style={{ backgroundColor: 'oklch(0.20 0.008 60)' }}
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {getItemName(item, i18n.language)}
                  </h4>
                  <span className="text-sm font-medium" style={{ color: 'var(--gold)' }}>
                    ฿{item.price * item.quantity}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.dishId, item.quantity - 1)}
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-sm transition-all active:scale-95"
                    style={{ backgroundColor: 'oklch(0.26 0.008 60)', color: 'var(--text-primary)' }}
                    aria-label={t('cart.removeItem')}
                  >
                    -
                  </button>
                  <span className="text-sm font-bold w-6 text-center" style={{ color: 'var(--text-primary)' }} aria-live="polite">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.dishId, item.quantity + 1)}
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-sm transition-all active:scale-95"
                    style={{ backgroundColor: 'oklch(0.26 0.008 60)', color: 'var(--text-primary)' }}
                    aria-label={`${t('cart.quantity')} +1`}
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(item.dishId)}
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-sm ms-1 transition-all active:scale-95"
                    style={{ backgroundColor: 'oklch(0.35 0.12 25 / 0.2)', color: 'oklch(0.65 0.15 25)' }}
                    aria-label={t('common.delete')}
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))
          )}

          {items.length > 0 && (
            <textarea
              value={orderNotes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('cart.notesPlaceholder')}
              className="w-full rounded-2xl p-4 text-sm resize-none h-20 transition-all"
              style={{
                backgroundColor: 'oklch(0.20 0.008 60)',
                border: '1px solid oklch(0.28 0.008 60)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => e.target.style.borderColor = 'oklch(0.75 0.14 60 / 0.3)'}
              onBlur={(e) => e.target.style.borderColor = 'oklch(0.28 0.008 60)'}
            />
          )}
        </div>

        {items.length > 0 && (
          <div className="p-5 space-y-4" style={{ borderTop: '1px solid oklch(0.28 0.008 60)' }}>
            <div className="flex justify-between text-lg font-bold">
              <span style={{ color: 'var(--text-primary)' }}>{t('cart.total')}</span>
              <span style={{ color: 'var(--gold)' }}>฿{total}</span>
            </div>
            {error && (
              <p className="text-sm text-center" style={{ color: 'oklch(0.65 0.15 25)' }}>{error}</p>
            )}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, oklch(0.72 0.14 60), oklch(0.78 0.12 60))',
                color: 'oklch(0.15 0.012 60)',
              }}
            >
              {submitting ? t('common.loading') : t('cart.submit')}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
