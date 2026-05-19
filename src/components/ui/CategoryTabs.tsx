import { useRef, useEffect, useState } from 'react'
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
  const [canScrollStart, setCanScrollStart] = useState(false)
  const [canScrollEnd, setCanScrollEnd] = useState(false)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const isRTL = i18n.language === 'he'
    if (isRTL) {
      setCanScrollEnd(el.scrollLeft < -1)
      setCanScrollStart(el.scrollLeft > -(el.scrollWidth - el.clientWidth - 1))
    } else {
      setCanScrollStart(el.scrollLeft > 1)
      setCanScrollEnd(el.scrollLeft < el.scrollWidth - el.clientWidth - 1)
    }
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    return () => el.removeEventListener('scroll', checkScroll)
  }, [categories, i18n.language])

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
    <div className="relative">
      {canScrollStart && (
        <div
          className="absolute start-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
          style={{
            background: i18n.language === 'he'
              ? 'linear-gradient(to left, transparent, oklch(0.12 0.005 85 / 0.95))'
              : 'linear-gradient(to right, oklch(0.12 0.005 85 / 0.95), transparent)',
          }}
        />
      )}
      {canScrollEnd && (
        <div
          className="absolute end-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
          style={{
            background: i18n.language === 'he'
              ? 'linear-gradient(to right, transparent, oklch(0.12 0.005 85 / 0.95))'
              : 'linear-gradient(to left, transparent, oklch(0.12 0.005 85 / 0.95))',
          }}
        />
      )}
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
              className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap"
              style={{
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                ...(isActive ? {
                  backgroundColor: 'var(--gold)',
                  color: 'oklch(0.15 0.01 85)',
                  boxShadow: '0 2px 12px oklch(0.75 0.12 85 / 0.3)',
                } : {
                  backgroundColor: 'oklch(0.20 0.005 85)',
                  color: 'oklch(0.65 0.01 85)',
                  border: '1px solid oklch(0.28 0.005 85)',
                }),
              }}
            >
              {getCategoryName(cat, i18n.language)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
