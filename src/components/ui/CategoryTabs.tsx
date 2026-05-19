import { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Category } from '../../lib/types'

interface CategoryTabsProps {
  categories: Category[]
  activeId: string | null
  onSelect: (id: string) => void
}

function getCategoryName(cat: Category, lang: string) {
  if (lang === 'he') return cat.name_he
  if (lang === 'th') return cat.name_th
  return cat.name_en
}

export default function CategoryTabs({ categories, activeId, onSelect }: CategoryTabsProps) {
  const { i18n } = useTranslation()
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current
      const el = activeRef.current
      const left = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2
      container.scrollTo({ left, behavior: 'smooth' })
    }
  }, [activeId])

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto no-scrollbar py-3 px-3"
    >
      {categories.map((cat) => {
        const isActive = cat.id === activeId
        return (
          <button
            key={cat.id}
            ref={isActive ? activeRef : null}
            onClick={() => onSelect(cat.id)}
            className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap"
            style={isActive ? {
              background: 'linear-gradient(135deg, oklch(0.72 0.12 85), oklch(0.78 0.10 85))',
              color: 'oklch(0.15 0.01 85)',
              boxShadow: '0 2px 12px oklch(0.75 0.12 85 / 0.25)',
            } : {
              backgroundColor: 'oklch(0.20 0.005 85)',
              color: 'oklch(0.70 0.01 85)',
              border: '1px solid oklch(0.28 0.005 85)',
            }}
          >
            {getCategoryName(cat, i18n.language)}
          </button>
        )
      })}
    </div>
  )
}
