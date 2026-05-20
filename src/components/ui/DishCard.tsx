import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getDishName, getDishDescription } from '../../lib/dish-utils'
import { enhanceDishImage } from '../../lib/image-utils'
import type { Dish } from '../../lib/types'

interface DishCardProps {
  dish: Dish
  onSelect: (dish: Dish) => void
  onQuickAdd: (dish: Dish) => void
  onImageZoom: (src: string, alt: string) => void
}

export default function DishCard({ dish, onSelect, onQuickAdd, onImageZoom }: DishCardProps) {
  const { i18n, t } = useTranslation()
  const [added, setAdded] = useState(false)
  const name = getDishName(dish, i18n.language)
  const desc = getDishDescription(dish, i18n.language)

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (dish.price === 0 || added) return
    onQuickAdd(dish)
    setAdded(true)
    setTimeout(() => setAdded(false), 600)
  }

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (dish.image_url) {
      onImageZoom(dish.image_url, name)
    }
  }

  return (
    <div
      className="flex gap-4 px-4 py-4 cursor-pointer group"
      style={{
        borderBottom: '1px solid oklch(0.95 0.002 255)',
        transition: 'background-color 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'oklch(0.98 0.002 255)' }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
      onClick={() => onSelect(dish)}
    >
      {/* Text content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3
          className="text-[15px] leading-snug line-clamp-1 mb-0.5"
          style={{
            color: 'var(--text-primary)',
            fontFamily: "'Frank Ruhl Libre', serif",
            fontWeight: 700,
          }}
        >
          {name}
        </h3>
        {desc && (
          <p
            className="text-xs leading-relaxed line-clamp-2 mb-1.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            {desc}
          </p>
        )}
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--accent)' }}
          >
            {dish.price > 0 ? `฿${dish.price}` : t('menu.askPrice')}
          </span>
          {dish.is_kosher && (
            <span
              className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: 'oklch(0.55 0.14 150 / 0.1)',
                color: 'oklch(0.42 0.12 150)',
              }}
            >
              {t('menu.kosher')}
            </span>
          )}
        </div>
      </div>

      {/* Circular image */}
      <div
        className="shrink-0 w-[72px] h-[72px] rounded-full overflow-hidden relative self-center"
        onClick={handleImageClick}
        style={{ boxShadow: '0 1px 4px oklch(0.20 0.02 60 / 0.08)' }}
      >
        {dish.image_url ? (
          <img
            src={enhanceDishImage(dish.image_url, 200)}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: 'oklch(0.95 0.004 255)' }}
          >
            <svg className="w-7 h-7" style={{ color: 'oklch(0.80 0.008 255)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12" />
            </svg>
          </div>
        )}
      </div>

      {/* Quick add button */}
      <div className="shrink-0 flex items-center">
        <button
          onClick={handleQuickAdd}
          disabled={dish.price === 0}
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: added
              ? 'oklch(0.50 0.14 150)'
              : dish.price === 0
                ? 'oklch(0.92 0.005 255)'
                : 'var(--accent)',
            color: added ? 'white' : dish.price === 0 ? 'oklch(0.70 0.008 255)' : 'white',
            transition: 'background 0.2s, transform 0.15s',
          }}
          aria-label={dish.price === 0 ? t('menu.askPrice') : t('menu.addToCart')}
        >
          {added ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            '+'
          )}
        </button>
      </div>
    </div>
  )
}
