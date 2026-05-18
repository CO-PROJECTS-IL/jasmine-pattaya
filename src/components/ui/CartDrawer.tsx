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
        <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      )}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 bg-[#121212] border-t border-[#c9a84c]/30 rounded-t-2xl transition-transform duration-300 max-h-[85vh] flex flex-col ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg text-[#c9a84c] font-bold">
            {t('cart.title')} {tableNumber && `· ${t('cart.table')} ${tableNumber}`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t('cart.empty')}</p>
          ) : (
            items.map((item) => (
              <div
                key={item.dishId}
                className="flex items-center gap-3 bg-[#1a1a1a] rounded-xl p-3"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-sm font-medium truncate">
                    {getItemName(item, i18n.language)}
                  </h4>
                  <span className="text-[#c9a84c] text-sm">
                    ฿{item.price * item.quantity}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.dishId, item.quantity - 1)}
                    className="w-7 h-7 rounded-full bg-[#2a2a2a] text-white flex items-center justify-center text-sm"
                  >
                    -
                  </button>
                  <span className="text-white text-sm w-5 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.dishId, item.quantity + 1)}
                    className="w-7 h-7 rounded-full bg-[#2a2a2a] text-white flex items-center justify-center text-sm"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(item.dishId)}
                    className="w-7 h-7 rounded-full bg-red-900/30 text-red-400 flex items-center justify-center text-sm ms-1"
                  >
                    ✕
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
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl p-3 text-white text-sm placeholder:text-gray-600 resize-none h-20 focus:outline-none focus:border-[#c9a84c]/50"
            />
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-white/10 space-y-3">
            <div className="flex justify-between text-lg font-bold">
              <span className="text-white">{t('cart.total')}</span>
              <span className="text-[#c9a84c]">฿{total}</span>
            </div>
            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-xl bg-[#c9a84c] text-black font-bold text-lg hover:bg-[#d4b96a] transition-colors"
            >
              {t('cart.submit')}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
