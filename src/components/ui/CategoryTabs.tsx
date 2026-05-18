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
      className="flex gap-2 overflow-x-auto no-scrollbar py-2 px-1"
    >
      {categories.map((cat) => {
        const isActive = cat.id === activeId
        return (
          <button
            key={cat.id}
            ref={isActive ? activeRef : null}
            onClick={() => onSelect(cat.id)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              isActive
                ? 'bg-[#c9a84c] text-black'
                : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a2a]'
            }`}
          >
            {getCategoryName(cat, i18n.language)}
          </button>
        )
      })}
    </div>
  )
}
