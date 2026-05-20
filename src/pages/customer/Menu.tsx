import { useState, useCallback, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useMenu } from '../../hooks/useMenu'
import { useCartStore } from '../../stores/cartStore'
import { useActiveSpecialMenu } from '../../hooks/useActiveSpecialMenu'
import { getDishName } from '../../lib/dish-utils'
import { enhanceDishImage } from '../../lib/image-utils'
import DishCard from '../../components/ui/DishCard'
import DishDetail from '../../components/ui/DishDetail'
import DishCardSkeleton from '../../components/ui/DishCardSkeleton'
import CartDrawer from '../../components/ui/CartDrawer'
import CartToast from '../../components/ui/CartToast'
import ImageLightbox from '../../components/ui/ImageLightbox'
import type { Dish, Category } from '../../lib/types'

function getCategoryName(cat: Category, lang: string) {
  if (lang === 'he') return cat.name_he
  if (lang === 'th') return cat.name_th
  return cat.name_en
}

export default function Menu() {
  const { t, i18n } = useTranslation()
  const { categories, getDishesByCategory, isLoading } = useMenu()
  const addItem = useCartStore((s) => s.addItem)
  const cartItems = useCartStore((s) => s.items)
  const { activeMenu } = useActiveSpecialMenu()

  const [selectedDish, setSelectedDish] = useState<Dish | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [toastDish, setToastDish] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [lightboxAlt, setLightboxAlt] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)

  // Memoize category thumbnails — compute once, not per render
  const categoryThumbnails = useMemo(() => {
    const map: Record<string, string | null> = {}
    for (const cat of categories) {
      const dishes = getDishesByCategory(cat.id)
      const withImage = dishes.find((d) => d.image_url)
      map[cat.id] = withImage?.image_url || null
    }
    return map
  }, [categories, getDishesByCategory])

  // Memoize dishes per category to avoid duplicate filtering
  const dishesByCategory = useMemo(() => {
    const map: Record<string, Dish[]> = {}
    for (const cat of categories) {
      map[cat.id] = getDishesByCategory(cat.id)
    }
    return map
  }, [categories, getDishesByCategory])

  const showToast = useCallback((dish: Dish) => {
    setToastDish(getDishName(dish, i18n.language))
    setToastVisible(true)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 600)
  }, [i18n.language])

  const handleQuickAdd = (dish: Dish) => {
    if (dish.price === 0) return
    addItem({
      dishId: dish.id,
      nameHe: dish.name_he,
      nameEn: dish.name_en,
      nameTh: dish.name_th,
      price: dish.price,
    })
    showToast(dish)
  }

  const handleAddFromDetail = (dish: Dish, quantity: number) => {
    addItem({
      dishId: dish.id,
      nameHe: dish.name_he,
      nameEn: dish.name_en,
      nameTh: dish.name_th,
      price: dish.price,
      quantity,
    })
    showToast(dish)
  }

  const handleImageZoom = (src: string, alt: string) => {
    setLightboxSrc(src)
    setLightboxAlt(alt)
  }

  // Filter dishes by active category or show all
  const visibleCategories = activeCategory
    ? categories.filter((c) => c.id === activeCategory)
    : categories

  const scrollCategories = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = 200
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="pb-24" style={{ maxWidth: '1024px', marginInline: 'auto' }}>
      {activeMenu && (
        <div
          className="text-center py-2.5 px-4 font-bold text-xs uppercase tracking-widest"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'oklch(0.995 0.002 255)',
            letterSpacing: '0.12em',
          }}
        >
          {activeMenu.name_he}
        </div>
      )}

      {activeMenu ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-4 pt-4">
          {activeMenu.menuItems.map((item) => (
            <DishCard
              key={item.id}
              dish={{ ...item.dish!, price: item.override_price ?? item.dish!.price }}
              onSelect={setSelectedDish}
              onQuickAdd={handleQuickAdd}
              onImageZoom={handleImageZoom}
            />
          ))}
        </div>
      ) : isLoading ? (
        <>
          {/* Skeleton for category circles */}
          <div className="px-4 pt-5 pb-2">
            <div className="flex gap-5 overflow-hidden">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div className="w-16 h-16 rounded-full animate-shimmer" />
                  <div className="h-3 w-12 rounded animate-shimmer" />
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-4 pt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <DishCardSkeleton key={i} />
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Category circles */}
          <div className="relative px-2 pt-5 pb-3">
            {/* Scroll arrows — 44px touch target */}
            <button
              onClick={() => scrollCategories('right')}
              aria-label={i18n.language === 'he' ? 'גלול קטגוריות ימינה' : 'Scroll categories right'}
              className="absolute start-0 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full flex items-center justify-center focus-visible:outline-none focus-visible:ring-2"
              style={{
                backgroundColor: 'oklch(0.995 0.002 255)',
                boxShadow: '0 2px 8px oklch(0.20 0.02 60 / 0.15)',
                '--tw-ring-color': 'var(--accent)',
              } as React.CSSProperties}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="oklch(0.35 0.02 255)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={() => scrollCategories('left')}
              aria-label={i18n.language === 'he' ? 'גלול קטגוריות שמאלה' : 'Scroll categories left'}
              className="absolute end-0 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full flex items-center justify-center focus-visible:outline-none focus-visible:ring-2"
              style={{
                backgroundColor: 'oklch(0.995 0.002 255)',
                boxShadow: '0 2px 8px oklch(0.20 0.02 60 / 0.15)',
                '--tw-ring-color': 'var(--accent)',
              } as React.CSSProperties}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="oklch(0.35 0.02 255)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <div
              ref={scrollRef}
              role="tablist"
              aria-label={i18n.language === 'he' ? 'קטגוריות' : 'Categories'}
              className="flex gap-4 overflow-x-auto px-6 scrollbar-hide"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {/* "All" tab */}
              <button
                role="tab"
                aria-selected={!activeCategory}
                tabIndex={!activeCategory ? 0 : -1}
                onClick={() => setActiveCategory(null)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 group focus-visible:outline-none"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-200"
                  style={{
                    backgroundColor: !activeCategory ? 'oklch(0.45 0.16 255 / 0.1)' : 'oklch(0.96 0.003 255)',
                    border: !activeCategory ? '2.5px solid var(--accent)' : '2.5px solid transparent',
                    outline: 'none',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={!activeCategory ? 'var(--accent)' : 'oklch(0.55 0.01 255)'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </div>
                <span
                  className="text-xs font-medium text-center leading-tight"
                  style={{
                    color: !activeCategory ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: !activeCategory ? 700 : 500,
                  }}
                >
                  {t('menu.all', 'הכל')}
                </span>
              </button>

              {categories.map((cat) => {
                const imgUrl = categoryThumbnails[cat.id]
                const isActive = activeCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    role="tab"
                    aria-selected={isActive}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActiveCategory(isActive ? null : cat.id)}
                    className="flex flex-col items-center gap-1.5 flex-shrink-0 group focus-visible:outline-none"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <div
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden transition-all duration-200"
                      style={{
                        border: isActive ? '2.5px solid var(--accent)' : '2.5px solid transparent',
                        boxShadow: isActive ? '0 0 0 2px oklch(0.45 0.16 255 / 0.15)' : 'none',
                      }}
                    >
                      {imgUrl ? (
                        <img
                          src={enhanceDishImage(imgUrl, 160)}
                          alt={getCategoryName(cat, i18n.language)}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: 'oklch(0.95 0.004 255)' }}
                        >
                          <svg className="w-7 h-7" style={{ color: 'oklch(0.75 0.008 255)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <span
                      className="text-xs text-center leading-tight max-w-[72px]"
                      style={{
                        color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                        fontWeight: isActive ? 700 : 500,
                      }}
                    >
                      {getCategoryName(cat, i18n.language)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px mx-4" style={{ backgroundColor: 'oklch(0.92 0.005 255)' }} />

          {/* Dishes */}
          <div className="space-y-8 pt-4">
            {visibleCategories.map((cat) => {
              const dishes = dishesByCategory[cat.id] || []
              if (dishes.length === 0) return null

              return (
                <section key={cat.id} aria-label={getCategoryName(cat, i18n.language)}>
                  {/* Category header */}
                  <div className="flex items-center gap-3 px-5 mb-3">
                    <h2
                      className="text-xl font-bold"
                      style={{
                        color: 'var(--text-primary)',
                        fontFamily: "'Frank Ruhl Libre', serif",
                      }}
                    >
                      {getCategoryName(cat, i18n.language)}
                    </h2>
                    <div
                      className="flex-1 h-px"
                      style={{ backgroundColor: 'oklch(0.92 0.005 255)' }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {dishes.length}
                    </span>
                  </div>

                  {/* Dishes grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 px-4">
                    {dishes.map((dish) => (
                      <DishCard
                        key={dish.id}
                        dish={dish}
                        onSelect={setSelectedDish}
                        onQuickAdd={handleQuickAdd}
                        onImageZoom={handleImageZoom}
                      />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        </>
      )}

      <DishDetail
        dish={selectedDish}
        onClose={() => setSelectedDish(null)}
        onAddToCart={handleAddFromDetail}
      />

      <ImageLightbox
        src={lightboxSrc}
        alt={lightboxAlt}
        onClose={() => setLightboxSrc(null)}
      />

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <CartToast
        visible={toastVisible}
        dishName={toastDish}
        onHide={() => setToastVisible(false)}
      />

      {cartCount > 0 && !cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          aria-label={`${t('cart.openCart', 'פתח עגלה')} — ${cartCount} ${t('cart.items')}`}
          className={`fixed bottom-20 end-4 z-30 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-90 animate-fab-in focus-visible:outline-none focus-visible:ring-2${justAdded ? ' animate-pulse-accent' : ''}`}
          style={{
            backgroundColor: 'var(--accent)',
            color: 'oklch(0.995 0.002 255)',
            boxShadow: '0 4px 20px oklch(0.45 0.16 255 / 0.3)',
            '--tw-ring-color': 'var(--accent)',
          } as React.CSSProperties}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          <span
            className={`absolute -top-1.5 -end-1.5 w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold${justAdded ? ' animate-scale-check' : ''}`}
            style={{ backgroundColor: 'oklch(0.55 0.22 25)', color: 'oklch(0.995 0.002 255)' }}
          >
            {cartCount}
          </span>
        </button>
      )}
    </div>
  )
}
