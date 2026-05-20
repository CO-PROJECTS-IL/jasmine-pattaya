import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getDishName, getDishDescription } from '../../lib/dish-utils'
import { enhanceDishImage } from '../../lib/image-utils'
import type { Dish } from '../../lib/types'

interface DishDetailProps {
  dish: Dish | null
  onClose: () => void
  onAddToCart: (dish: Dish, quantity: number) => void
}

export default function DishDetail({ dish, onClose, onAddToCart }: DishDetailProps) {
  const { i18n, t } = useTranslation()
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (!dish) return
    document.body.style.overflow = 'hidden'
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKey)
    }
  }, [dish, onClose])

  if (!dish) return null

  const name = getDishName(dish, i18n.language)
  const desc = getDishDescription(dish, i18n.language)

  const handleAdd = () => {
    onAddToCart(dish, quantity)
    setQuantity(1)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'oklch(0.20 0.01 255 / 0.5)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-lg rounded-t-2xl sm:rounded-2xl z-10 max-h-[90vh] overflow-y-auto animate-slide-up bg-white"
        style={{
          boxShadow: '0 -8px 40px oklch(0.20 0.02 60 / 0.15)',
        }}
      >
        {dish.image_url ? (
          <div className="relative aspect-[16/10] overflow-hidden rounded-t-2xl sm:rounded-t-2xl">
            <img
              src={enhanceDishImage(dish.image_url, 800)}
              alt={name}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, white 0%, oklch(1 0 0 / 0.3) 40%, transparent 70%)' }}
            />
            <button
              onClick={onClose}
              className="absolute top-3 end-3 w-8 h-8 rounded-full flex items-center justify-center text-lg"
              style={{
                backgroundColor: 'oklch(1 0 0 / 0.8)',
                color: 'oklch(0.40 0.01 255)',
                backdropFilter: 'blur(8px)',
              }}
            >
              &times;
            </button>
            {dish.is_kosher && (
              <span
                className="absolute top-3 start-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md"
                style={{ backgroundColor: 'oklch(0.55 0.14 150 / 0.9)', color: 'white' }}
              >
                {t('menu.kosher')}
              </span>
            )}
          </div>
        ) : (
          <div className="flex justify-end p-4">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
              style={{ backgroundColor: 'oklch(0.95 0.004 255)', color: 'oklch(0.55 0.01 255)' }}
            >
              &times;
            </button>
          </div>
        )}

        <div className="p-5 sm:p-6">
          <h2
            className="text-xl font-black mb-1.5"
            style={{
              color: 'var(--text-primary)',
              fontFamily: "'Frank Ruhl Libre', serif",
              letterSpacing: '-0.01em',
            }}
          >
            {name}
          </h2>
          {desc && (
            <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {desc}
            </p>
          )}

          <div className="text-lg font-bold mb-8" style={{ color: 'var(--accent)' }}>
            {dish.price > 0 ? `฿${dish.price}` : t('menu.askPrice')}
          </div>

          <div className="flex items-center justify-center gap-6 mb-8">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-11 h-11 rounded-full text-lg flex items-center justify-center transition-all duration-200 active:scale-90"
              style={{
                border: '1.5px solid oklch(0.92 0.005 255)',
                color: 'var(--text-secondary)',
                backgroundColor: 'white',
              }}
            >
              -
            </button>
            <span className="text-2xl font-black w-8 text-center" style={{ color: 'var(--text-primary)' }}>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-11 h-11 rounded-full text-lg flex items-center justify-center transition-all duration-200 active:scale-90"
              style={{
                border: '1.5px solid oklch(0.92 0.005 255)',
                color: 'var(--text-secondary)',
                backgroundColor: 'white',
              }}
            >
              +
            </button>
          </div>

          <button
            onClick={handleAdd}
            disabled={dish.price === 0}
            className="w-full py-3.5 rounded-xl font-bold text-base tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'white',
            }}
          >
            {t('menu.addToCart')} · ฿{dish.price * quantity}
          </button>
        </div>
      </div>
    </div>
  )
}
