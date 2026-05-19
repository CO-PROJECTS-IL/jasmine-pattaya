import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { useMenu } from '../../hooks/useMenu'
import { useCartStore } from '../../stores/cartStore'
import { useFridayStatus } from '../../hooks/useFridayStatus'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import CategoryTabs from '../../components/ui/CategoryTabs'
import DishCard from '../../components/ui/DishCard'
import DishDetail from '../../components/ui/DishDetail'
import CartDrawer from '../../components/ui/CartDrawer'
import type { Dish } from '../../lib/types'

export default function Menu() {
  const { t } = useTranslation()
  const { categories, getDishesByCategory } = useMenu()
  const addItem = useCartStore((s) => s.addItem)
  const cartItems = useCartStore((s) => s.items)
  const { isFridayMenuActive } = useFridayStatus()

  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? null)
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null)
  const [cartOpen, setCartOpen] = useState(false)

  const activeDishes = activeCategory ? getDishesByCategory(activeCategory) : []
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)

  const { data: fridayItems = [] } = useQuery({
    queryKey: ['friday-menu'],
    queryFn: async () => {
      if (!isSupabaseConfigured) return []
      const { data, error } = await supabase
        .from('friday_menu')
        .select('*, dish:dishes(*)')
        .eq('is_active', true)
        .order('sort_order')
      if (error) throw error
      return data
    },
    enabled: isFridayMenuActive,
  })

  const handleQuickAdd = (dish: Dish) => {
    if (dish.price === 0) return
    addItem({
      dishId: dish.id,
      nameHe: dish.name_he,
      nameEn: dish.name_en,
      nameTh: dish.name_th,
      price: dish.price,
    })
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
  }

  return (
    <div className="pb-24">
      {isFridayMenuActive && (
        <div
          className="text-center py-2.5 px-4 font-bold text-sm"
          style={{
            background: 'linear-gradient(135deg, oklch(0.72 0.12 85), oklch(0.78 0.10 85))',
            color: 'oklch(0.15 0.01 85)',
          }}
        >
          {t('menu.fridayMenuActive')}
        </div>
      )}

      {isFridayMenuActive ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4">
          {fridayItems.map((item: any) => (
            <DishCard
              key={item.id}
              dish={{ ...item.dish, price: item.friday_price }}
              onSelect={setSelectedDish}
              onQuickAdd={handleQuickAdd}
            />
          ))}
        </div>
      ) : (
        <>
          <div
            className="sticky top-[52px] z-20 gold-border-glow"
            style={{ backgroundColor: 'oklch(0.12 0.005 85 / 0.95)', backdropFilter: 'blur(12px)' }}
          >
            <CategoryTabs
              categories={categories}
              activeId={activeCategory}
              onSelect={setActiveCategory}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4">
            {activeDishes.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                onSelect={setSelectedDish}
                onQuickAdd={handleQuickAdd}
              />
            ))}
          </div>

          {activeDishes.length === 0 && (
            <p className="text-center py-16 text-sm" style={{ color: 'var(--text-muted)' }}>
              {t('menu.emptyCategory')}
            </p>
          )}
        </>
      )}

      <DishDetail
        dish={selectedDish}
        onClose={() => setSelectedDish(null)}
        onAddToCart={handleAddFromDetail}
      />

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {cartCount > 0 && !cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-20 end-4 z-30 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 animate-pulse-gold active:scale-90"
          style={{
            background: 'linear-gradient(135deg, oklch(0.72 0.12 85), oklch(0.78 0.10 85))',
            color: 'oklch(0.15 0.01 85)',
            boxShadow: '0 4px 20px oklch(0.75 0.12 85 / 0.3)',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          <span
            className="absolute -top-1.5 -end-1.5 w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold"
            style={{ backgroundColor: 'oklch(0.55 0.22 25)', color: 'oklch(0.98 0 0)' }}
          >
            {cartCount}
          </span>
        </button>
      )}
    </div>
  )
}
