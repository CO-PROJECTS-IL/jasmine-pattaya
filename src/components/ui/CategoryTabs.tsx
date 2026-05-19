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

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      next = (index + 1) % categories.length
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      next = (index - 1 + categories.length) % categories.length
    } else if (e.key === 'Home') {
      next = 0
    } else if (e.key === 'End') {
      next = categories.length - 1
    }
    if (next >= 0) {
      e.preventDefault()
      onSelect(categories[next].id)
      const container = scrollRef.current
      if (container) {
        const buttons = container.querySelectorAll<HTMLButtonElement>('[role="tab"]')
        buttons[next]?.focus()
      }
    }
  }

  return (
    <div
      ref={scrollRef}
      role="tablist"
      aria-label={i18n.language === 'he' ? 'קטגוריות' : 'Categories'}
      className="flex gap-2 overflow-x-auto no-scrollbar py-3 px-3"
    >
      {categories.map((cat, index) => {
        const isActive = cat.id === activeId
        return (
          <button
            key={cat.id}
            ref={isActive ? activeRef : null}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSelect(cat.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap"
            style={isActive ? {
              backgroundColor: 'var(--gold)',
              color: 'oklch(0.15 0.01 85)',
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
