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
        style={{ backgroundColor: 'oklch(0.03 0.008 60 / 0.85)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-lg rounded-t-2xl sm:rounded-2xl z-10 max-h-[90vh] overflow-y-auto animate-slide-up"
        style={{
          backgroundColor: 'oklch(0.12 0.008 60)',
          border: '1px solid oklch(0.22 0.01 60)',
          boxShadow: '0 -8px 40px oklch(0 0 0 / 0.6)',
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
              style={{ background: 'linear-gradient(to top, oklch(0.12 0.008 60) 0%, oklch(0.12 0.008 60 / 0.3) 40%, transparent 70%)' }}
            />
            <button
              onClick={onClose}
              className="absolute top-3 end-3 w-8 h-8 rounded-lg flex items-center justify-center text-lg"
              style={{
                backgroundColor: 'oklch(0.08 0.008 60 / 0.7)',
                color: 'oklch(0.80 0.012 60)',
                backdropFilter: 'blur(8px)',
              }}
            >
              &times;
            </button>
            {dish.is_kosher && (
              <span
                className="absolute top-3 start-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md"
                style={{ backgroundColor: 'oklch(0.45 0.12 145 / 0.9)', color: 'oklch(0.95 0 0)' }}
              >
                {t('menu.kosher')}
              </span>
            )}
          </div>
        ) : (
          <div className="flex justify-end p-4">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
              style={{ backgroundColor: 'oklch(0.18 0.008 60)', color: 'oklch(0.60 0.015 60)' }}
            >
              &times;
            </button>
          </div>
        )}

        <div className="p-5 sm:p-6">
          <h2
            className="text-xl font-black mb-1.5"
            style={{ color: 'oklch(0.97 0.008 60)', letterSpacing: '-0.01em' }}
          >
            {name}
          </h2>
          {desc && (
            <p className="text-sm mb-5 leading-relaxed" style={{ color: 'oklch(0.50 0.012 60)' }}>
              {desc}
            </p>
          )}

          <div className="text-lg font-bold mb-8" style={{ color: 'var(--gold)' }}>
            {dish.price > 0 ? `฿${dish.price}` : t('menu.askPrice')}
          </div>

          <div className="flex items-center justify-center gap-6 mb-8">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-11 h-11 rounded-xl text-lg flex items-center justify-center transition-all duration-200 active:scale-90"
              style={{ backgroundColor: 'oklch(0.18 0.008 60)', color: 'oklch(0.70 0.012 60)' }}
            >
              -
            </button>
            <span className="text-2xl font-black w-8 text-center" style={{ color: 'oklch(0.95 0.008 60)' }}>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-11 h-11 rounded-xl text-lg flex items-center justify-center transition-all duration-200 active:scale-90"
              style={{ backgroundColor: 'oklch(0.18 0.008 60)', color: 'oklch(0.70 0.012 60)' }}
            >
              +
            </button>
          </div>

          <button
            onClick={handleAdd}
            disabled={dish.price === 0}
            className="w-full py-3.5 rounded-xl font-bold text-base tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            style={{
              backgroundColor: 'oklch(0.75 0.14 60)',
              color: 'oklch(0.10 0.012 60)',
            }}
          >
            {t('menu.addToCart')} · ฿{dish.price * quantity}
          </button>
        </div>
      </div>
    </div>
  )
}
