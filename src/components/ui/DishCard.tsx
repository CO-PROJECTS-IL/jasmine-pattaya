import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Dish } from '../../lib/types'

interface DishCardProps {
  dish: Dish
  index?: number
  onSelect: (dish: Dish) => void
  onQuickAdd: (dish: Dish) => void
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

export default function DishCard({ dish, index = 0, onSelect, onQuickAdd }: DishCardProps) {
  const { i18n, t } = useTranslation()
  const [added, setAdded] = useState(false)
  const name = getDishName(dish, i18n.language)
  const desc = getDishDescription(dish, i18n.language)

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (dish.price === 0) return
    onQuickAdd(dish)
    setAdded(true)
    setTimeout(() => setAdded(false), 600)
  }

  return (
    <div
      className="rounded-2xl overflow-hidden cursor-pointer group animate-card-in"
      style={{
        backgroundColor: 'oklch(0.16 0.005 85)',
        border: '1px solid oklch(0.25 0.008 85)',
        boxShadow: '0 2px 8px oklch(0 0 0 / 0.3)',
        animationDelay: `${index * 60}ms`,
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s, box-shadow 0.3s',
      }}
      onClick={() => onSelect(dish)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.borderColor = 'oklch(0.75 0.12 85 / 0.3)'
        e.currentTarget.style.boxShadow = '0 12px 32px oklch(0 0 0 / 0.4), 0 0 0 1px oklch(0.75 0.12 85 / 0.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'oklch(0.25 0.008 85)'
        e.currentTarget.style.boxShadow = '0 2px 8px oklch(0 0 0 / 0.3)'
      }}
    >
      {dish.image_url ? (
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={dish.image_url}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(to top, oklch(0.10 0.005 85 / 0.6), transparent 50%)' }}
          />
          {dish.is_kosher && (
            <span
              className="absolute top-2.5 start-2.5 text-xs font-semibold px-2.5 py-1 rounded-lg"
              style={{ backgroundColor: 'oklch(0.55 0.15 145 / 0.9)', color: 'oklch(0.98 0 0)' }}
            >
              {t('menu.kosher')}
            </span>
          )}
        </div>
      ) : (
        <div
          className="relative aspect-[4/3] flex flex-col items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, oklch(0.14 0.008 85), oklch(0.18 0.01 60))',
          }}
        >
          <svg className="w-12 h-12" style={{ color: 'oklch(0.35 0.03 85)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12" />
          </svg>
          {dish.is_kosher && (
            <span
              className="absolute top-2.5 start-2.5 text-xs font-semibold px-2.5 py-1 rounded-lg"
              style={{ backgroundColor: 'oklch(0.55 0.15 145 / 0.9)', color: 'oklch(0.98 0 0)' }}
            >
              {t('menu.kosher')}
            </span>
          )}
        </div>
      )}

      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-sm leading-snug mb-0.5 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
          {name}
        </h3>
        {desc && (
          <p className="text-xs line-clamp-2 mb-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-base font-bold" style={{ color: 'var(--gold)' }}>
            {dish.price > 0 ? `฿${dish.price}` : t('menu.askPrice')}
          </span>
          <button
            onClick={handleQuickAdd}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold active:scale-90"
            style={{
              background: added
                ? 'oklch(0.55 0.15 145)'
                : 'linear-gradient(135deg, oklch(0.72 0.12 85), oklch(0.78 0.10 85))',
              color: added ? 'oklch(0.98 0 0)' : 'oklch(0.15 0.01 85)',
              transition: 'background 0.3s, transform 0.15s',
              boxShadow: '0 2px 8px oklch(0.75 0.12 85 / 0.2)',
            }}
            aria-label={t('menu.addToCart')}
          >
            {added ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              '+'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
