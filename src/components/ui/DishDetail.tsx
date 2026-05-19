import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Dish } from '../../lib/types'

interface DishDetailProps {
  dish: Dish | null
  onClose: () => void
  onAddToCart: (dish: Dish, quantity: number) => void
}

function getDishName(dish: Dish, lang: string) {
  if (lang === 'he') return dish.name_he
  if (lang === 'th') return dish.name_th
  return dish.name_en
}

function getDishDescription(dish: Dish, lang: string) {
  if (lang === 'he') return dish.description_he
  return dish.description_en
}

export default function DishDetail({ dish, onClose, onAddToCart }: DishDetailProps) {
  const { i18n, t } = useTranslation()
  const [quantity, setQuantity] = useState(1)

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
      <div className="absolute inset-0" style={{ backgroundColor: 'oklch(0 0 0 / 0.8)' }} onClick={onClose} />
      <div
        className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl z-10 max-h-[90vh] overflow-y-auto animate-slide-up"
        style={{
          backgroundColor: 'oklch(0.16 0.005 85)',
          border: '1px solid oklch(0.28 0.005 85)',
        }}
      >
        {dish.image_url ? (
          <div className="relative aspect-[16/10] overflow-hidden rounded-t-3xl sm:rounded-t-3xl">
            <img
              src={dish.image_url}
              alt={name}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, oklch(0.16 0.005 85) 0%, transparent 50%)' }}
            />
            <button
              onClick={onClose}
              className="absolute top-3 end-3 w-9 h-9 rounded-xl flex items-center justify-center text-xl backdrop-blur-md"
              style={{ backgroundColor: 'oklch(0 0 0 / 0.5)', color: 'var(--text-primary)' }}
            >
              &times;
            </button>
            {dish.is_kosher && (
              <span
                className="absolute top-3 start-3 text-sm font-semibold px-3 py-1 rounded-lg"
                style={{ backgroundColor: 'oklch(0.55 0.15 145 / 0.9)', color: 'oklch(0.98 0 0)' }}
              >
                {t('menu.kosher')}
              </span>
            )}
          </div>
        ) : (
          <div className="flex justify-end p-4">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
              style={{ backgroundColor: 'oklch(0.22 0.005 85)', color: 'var(--text-primary)' }}
            >
              &times;
            </button>
          </div>
        )}

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--gold)' }}>{name}</h2>
          {desc && <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>}

          <div className="text-xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>
            {dish.price > 0 ? `฿${dish.price}` : t('menu.askPrice')}
          </div>

          <div className="flex items-center justify-center gap-8 mb-8">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-12 h-12 rounded-2xl text-xl flex items-center justify-center transition-all duration-200 active:scale-90"
              style={{ backgroundColor: 'oklch(0.22 0.005 85)', color: 'var(--text-primary)' }}
            >
              -
            </button>
            <span className="text-3xl font-bold w-10 text-center" style={{ color: 'var(--text-primary)' }}>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-12 h-12 rounded-2xl text-xl flex items-center justify-center transition-all duration-200 active:scale-90"
              style={{ backgroundColor: 'oklch(0.22 0.005 85)', color: 'var(--text-primary)' }}
            >
              +
            </button>
          </div>

          <button
            onClick={handleAdd}
            disabled={dish.price === 0}
            className="w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, oklch(0.72 0.12 85), oklch(0.78 0.10 85))',
              color: 'oklch(0.15 0.01 85)',
            }}
          >
            {t('menu.addToCart')} · ฿{dish.price * quantity}
          </button>
        </div>
      </div>
    </div>
  )
}
