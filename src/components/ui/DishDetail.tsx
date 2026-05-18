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
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#121212] rounded-t-2xl sm:rounded-2xl z-10 max-h-[90vh] overflow-y-auto">
        {dish.image_url ? (
          <div className="relative aspect-[16/10] overflow-hidden rounded-t-2xl">
            <img
              src={dish.image_url}
              alt={name}
              className="w-full h-full object-cover"
            />
            <button
              onClick={onClose}
              className="absolute top-3 end-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center text-xl"
            >
              &times;
            </button>
            {dish.is_kosher && (
              <span className="absolute top-3 start-3 bg-green-600 text-white text-sm px-3 py-1 rounded-full">
                {t('menu.kosher')}
              </span>
            )}
          </div>
        ) : (
          <div className="flex justify-end p-3">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-xl"
            >
              &times;
            </button>
          </div>
        )}

        <div className="p-5">
          <h2 className="text-2xl text-[#c9a84c] font-bold mb-1">{name}</h2>
          {desc && <p className="text-gray-400 text-sm mb-4">{desc}</p>}

          <div className="text-xl font-semibold text-white mb-6">
            {dish.price > 0 ? `฿${dish.price}` : t('menu.askPrice')}
          </div>

          <div className="flex items-center justify-center gap-6 mb-6">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-full bg-[#1a1a1a] text-white text-xl flex items-center justify-center hover:bg-[#2a2a2a]"
            >
              -
            </button>
            <span className="text-2xl font-bold text-white w-8 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-full bg-[#1a1a1a] text-white text-xl flex items-center justify-center hover:bg-[#2a2a2a]"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAdd}
            disabled={dish.price === 0}
            className="w-full py-3 rounded-xl bg-[#c9a84c] text-black font-bold text-lg hover:bg-[#d4b96a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('menu.addToCart')} · ฿{dish.price * quantity}
          </button>
        </div>
      </div>
    </div>
  )
}
