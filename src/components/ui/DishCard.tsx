import { useTranslation } from 'react-i18next'
import type { Dish } from '../../lib/constants'

interface DishCardProps {
  dish: Dish
  onSelect: (dish: Dish) => void
  onQuickAdd: (dish: Dish) => void
}

function getDishName(dish: Dish, lang: string) {
  if (lang === 'he') return dish.nameHe
  if (lang === 'th') return dish.nameTh
  return dish.nameEn
}

function getDishDescription(dish: Dish, lang: string) {
  if (lang === 'he') return dish.descriptionHe
  return dish.descriptionEn
}

export default function DishCard({ dish, onSelect, onQuickAdd }: DishCardProps) {
  const { i18n, t } = useTranslation()
  const name = getDishName(dish, i18n.language)
  const desc = getDishDescription(dish, i18n.language)

  return (
    <div
      className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/5 hover:border-[#c9a84c]/30 transition-all cursor-pointer group"
      onClick={() => onSelect(dish)}
    >
      {dish.imageUrl ? (
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={dish.imageUrl}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {dish.kosher && (
            <span className="absolute top-2 start-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
              {t('menu.kosher')}
            </span>
          )}
        </div>
      ) : (
        <div className="relative aspect-[4/3] bg-[#121212] flex items-center justify-center">
          <span className="text-4xl opacity-20">🍽</span>
          {dish.kosher && (
            <span className="absolute top-2 start-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
              {t('menu.kosher')}
            </span>
          )}
        </div>
      )}

      <div className="p-3">
        <h3 className="font-medium text-white text-sm leading-tight mb-1 line-clamp-2">
          {name}
        </h3>
        {desc && (
          <p className="text-gray-500 text-xs line-clamp-2 mb-2">{desc}</p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-[#c9a84c] font-semibold">
            {dish.price > 0 ? `฿${dish.price}` : t('menu.askPrice')}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onQuickAdd(dish)
            }}
            className="w-8 h-8 rounded-full bg-[#c9a84c] text-black flex items-center justify-center text-lg font-bold hover:bg-[#d4b96a] transition-colors"
            aria-label={t('menu.addToCart')}
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}
