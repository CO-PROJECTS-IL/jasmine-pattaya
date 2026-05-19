import { useRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getCategoryImage } from '../../lib/image-utils'
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
    const isRTL = i18n.language === 'he'
    let next = -1
    const forward = isRTL ? 'ArrowLeft' : 'ArrowRight'
    const backward = isRTL ? 'ArrowRight' : 'ArrowLeft'
    if (e.key === forward || e.key === 'ArrowDown') {
      next = (index + 1) % categories.length
    } else if (e.key === backward || e.key === 'ArrowUp') {
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
              ? 'linear-gradient(to left, transparent, oklch(0.08 0.008 60))'
              : 'linear-gradient(to right, oklch(0.08 0.008 60), transparent)',
          }}
        />
      )}
      {canScrollEnd && (
        <div
          className="absolute end-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
          style={{
            background: i18n.language === 'he'
              ? 'linear-gradient(to right, transparent, oklch(0.08 0.008 60))'
              : 'linear-gradient(to left, transparent, oklch(0.08 0.008 60))',
          }}
        />
      )}
      <div
        ref={scrollRef}
        role="tablist"
        aria-label={i18n.language === 'he' ? 'קטגוריות' : 'Categories'}
        className="flex gap-3 overflow-x-auto no-scrollbar py-4 px-4"
      >
        {categories.map((cat, index) => {
          const isActive = cat.id === activeId
          const img = getCategoryImage(cat.name_he)
          return (
            <button
              key={cat.id}
              ref={isActive ? activeRef : null}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onSelect(cat.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="shrink-0 flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-2xl text-[11px] font-bold whitespace-nowrap"
              style={{
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                minWidth: '68px',
                ...(isActive ? {
                  backgroundColor: 'oklch(0.16 0.012 60)',
                  color: 'oklch(0.75 0.14 60)',
                  boxShadow: 'inset 0 0 0 1.5px oklch(0.75 0.14 60 / 0.5)',
                } : {
                  backgroundColor: 'oklch(0.12 0.008 60)',
                  color: 'oklch(0.50 0.012 60)',
                }),
              }}
            >
              <div
                className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
                style={{
                  boxShadow: isActive ? '0 0 0 2px oklch(0.75 0.14 60 / 0.6)' : 'none',
                  transition: 'box-shadow 0.2s',
                }}
              >
                {img ? (
                  <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: 'oklch(0.18 0.012 60)' }}
                  >
                    <svg className="w-5 h-5 opacity-30" style={{ color: 'var(--gold)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12" />
                    </svg>
                  </div>
                )}
              </div>
              {getCategoryName(cat, i18n.language)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
