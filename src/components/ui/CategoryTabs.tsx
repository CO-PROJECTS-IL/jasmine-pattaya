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
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [activeId])

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next = -1
    if (e.key === 'ArrowDown') {
      next = (index + 1) % categories.length
    } else if (e.key === 'ArrowUp') {
      next = (index - 1 + categories.length) % categories.length
    } else if (e.key === 'Home') {
      next = 0
    } else if (e.key === 'End') {
      next = categories.length - 1
    }
    if (next >= 0) {
      e.preventDefault()
      onSelect(categories[next].id)
    }
  }

  return (
    <nav
      role="tablist"
      aria-label={i18n.language === 'he' ? 'קטגוריות' : 'Categories'}
      className="flex flex-col gap-0.5 py-2"
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
            className="text-start px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg mx-2"
            style={{
              color: isActive ? 'var(--accent)' : 'oklch(0.50 0.01 255)',
              backgroundColor: isActive ? 'oklch(0.45 0.16 255 / 0.08)' : 'transparent',
              fontWeight: isActive ? 600 : 400,
              borderInlineEnd: isActive ? '3px solid var(--accent)' : '3px solid transparent',
            }}
          >
            {getCategoryName(cat, i18n.language)}
          </button>
        )
      })}
    </nav>
  )
}
