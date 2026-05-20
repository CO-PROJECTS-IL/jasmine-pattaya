import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useMenu } from '../../hooks/useMenu'
import { useCartStore } from '../../stores/cartStore'
import { useActiveSpecialMenu } from '../../hooks/useActiveSpecialMenu'
import { getDishName } from '../../lib/dish-utils'
import CategoryTabs from '../../components/ui/CategoryTabs'
import DishCard from '../../components/ui/DishCard'
import DishDetail from '../../components/ui/DishDetail'
import DishCardSkeleton from '../../components/ui/DishCardSkeleton'
import CartDrawer from '../../components/ui/CartDrawer'
import CartToast from '../../components/ui/CartToast'
import ImageLightbox from '../../components/ui/ImageLightbox'
import type { Dish } from '../../lib/types'

export default function Menu() {
  const { t, i18n } = useTranslation()
  const { categories, getDishesByCategory, isLoading } = useMenu()
  const addItem = useCartStore((s) => s.addItem)
  const cartItems = useCartStore((s) => s.items)
  const { activeMenu } = useActiveSpecialMenu()

  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id)
    }
  }, [categories, activeCategory])
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [toastDish, setToastDish] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [lightboxAlt, setLightboxAlt] = useState('')

  const activeDishes = activeCategory ? getDishesByCategory(activeCategory) : []
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)

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

  return (
    <div className="pb-24" style={{ maxWidth: '1024px', marginInline: 'auto' }}>
      {activeMenu && (
        <div
          className="text-center py-2.5 px-4 font-bold text-xs uppercase tracking-widest"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'white',
            letterSpacing: '0.12em',
          }}
        >
          {activeMenu.name_he}
        </div>
      )}

      {activeMenu ? (
        <div className="dish-list px-4 sm:px-6 pt-4">
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
      ) : (
        <div className="flex">
          {/* Sidebar — visible on md+ */}
          <aside
            className="hidden md:block sticky top-[49px] self-start w-48 shrink-0 overflow-y-auto"
            style={{
              maxHeight: 'calc(100vh - 49px)',
              borderInlineEnd: '1px solid oklch(0.92 0.005 255)',
            }}
          >
            <CategoryTabs
              categories={categories}
              activeId={activeCategory}
              onSelect={setActiveCategory}
            />
          </aside>

          {/* Mobile horizontal tabs — visible below md */}
          <div
            className="md:hidden sticky top-[49px] z-20 w-full overflow-x-auto no-scrollbar"
            style={{
              backgroundColor: 'oklch(1 0 0 / 0.95)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid oklch(0.92 0.005 255 / 0.5)',
            }}
          >
            <div className="flex gap-1 px-4 py-1">
              {categories.map((cat) => {
                const isActive = cat.id === activeCategory
                const name = i18n.language === 'he' ? cat.name_he : i18n.language === 'th' ? cat.name_th : cat.name_en
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className="shrink-0 px-3 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-colors"
                    style={{
                      color: isActive ? 'var(--accent)' : 'oklch(0.55 0.01 255)',
                      backgroundColor: isActive ? 'oklch(0.45 0.16 255 / 0.08)' : 'transparent',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Dishes */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="px-4 sm:px-6 pt-4 space-y-0">
                {Array.from({ length: 6 }).map((_, i) => (
                  <DishCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <>
                <div key={activeCategory} className="dish-list px-4 sm:px-6 pt-4">
                  {activeDishes.map((dish) => (
                    <DishCard
                      key={dish.id}
                      dish={dish}
                      onSelect={setSelectedDish}
                      onQuickAdd={handleQuickAdd}
                      onImageZoom={handleImageZoom}
                    />
                  ))}
                </div>

                {activeDishes.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      {t('menu.emptyCategory')}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {t('menu.tryOtherCategory')}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
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
          className={`fixed bottom-20 end-4 z-30 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-90 animate-fab-in${justAdded ? ' animate-pulse-accent' : ''}`}
          style={{
            backgroundColor: 'var(--accent)',
            color: 'white',
            boxShadow: '0 4px 20px oklch(0.45 0.16 255 / 0.3)',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          <span
            className={`absolute -top-1.5 -end-1.5 w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold${justAdded ? ' animate-scale-check' : ''}`}
            style={{ backgroundColor: 'oklch(0.55 0.22 25)', color: 'white' }}
            aria-label={`${cartCount} ${t('cart.items')}`}
          >
            {cartCount}
          </span>
        </button>
      )}
    </div>
  )
}
