import { useTranslation } from 'react-i18next'
import { useCartStore } from '../../stores/cartStore'
import { useNavigate } from 'react-router-dom'

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

  const handleSubmit = () => {
    onClose()
    navigate('/order-confirmation')
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40" style={{ backgroundColor: 'oklch(0 0 0 / 0.6)' }} onClick={onClose} />
      )}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 rounded-t-3xl transition-transform duration-300 max-h-[85vh] flex flex-col ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          backgroundColor: 'oklch(0.16 0.005 85)',
          borderTop: '1px solid oklch(0.75 0.12 85 / 0.2)',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          className="flex items-center justify-between p-5"
          style={{ borderBottom: '1px solid oklch(0.28 0.005 85)' }}
        >
          <h2 className="text-lg font-bold" style={{ color: 'var(--gold)' }}>
            {t('cart.title')} {tableNumber && `· ${t('cart.table')} ${tableNumber}`}
          </h2>
          <button
            onClick={onClose}
            className="text-2xl transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <p className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>{t('cart.empty')}</p>
          ) : (
            items.map((item) => (
              <div
                key={item.dishId}
                className="flex items-center gap-3 rounded-2xl p-4"
                style={{ backgroundColor: 'oklch(0.20 0.005 85)' }}
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
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all active:scale-90"
                    style={{ backgroundColor: 'oklch(0.26 0.005 85)', color: 'var(--text-primary)' }}
                  >
                    -
                  </button>
                  <span className="text-sm font-bold w-5 text-center" style={{ color: 'var(--text-primary)' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.dishId, item.quantity + 1)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all active:scale-90"
                    style={{ backgroundColor: 'oklch(0.26 0.005 85)', color: 'var(--text-primary)' }}
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(item.dishId)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm ms-1 transition-all active:scale-90"
                    style={{ backgroundColor: 'oklch(0.35 0.12 25 / 0.2)', color: 'oklch(0.65 0.15 25)' }}
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
              className="w-full rounded-2xl p-4 text-sm resize-none h-20 focus:outline-none transition-all"
              style={{
                backgroundColor: 'oklch(0.20 0.005 85)',
                border: '1px solid oklch(0.28 0.005 85)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => e.target.style.borderColor = 'oklch(0.75 0.12 85 / 0.3)'}
              onBlur={(e) => e.target.style.borderColor = 'oklch(0.28 0.005 85)'}
            />
          )}
        </div>

        {items.length > 0 && (
          <div className="p-5 space-y-4" style={{ borderTop: '1px solid oklch(0.28 0.005 85)' }}>
            <div className="flex justify-between text-lg font-bold">
              <span style={{ color: 'var(--text-primary)' }}>{t('cart.total')}</span>
              <span style={{ color: 'var(--gold)' }}>฿{total}</span>
            </div>
            <button
              onClick={handleSubmit}
              className="w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, oklch(0.72 0.12 85), oklch(0.78 0.10 85))',
                color: 'oklch(0.15 0.01 85)',
              }}
            >
              {t('cart.submit')}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
