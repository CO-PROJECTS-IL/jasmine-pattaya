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
        <div className="bg-[#c9a84c] text-[#080808] text-center py-2 px-4 font-semibold text-sm">
          {t('menu.fridayMenuActive')}
        </div>
      )}

      {isFridayMenuActive ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3">
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
          <div className="sticky top-0 z-20 bg-[#080808] border-b border-white/5">
            <CategoryTabs
              categories={categories}
              activeId={activeCategory}
              onSelect={setActiveCategory}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3">
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
            <p className="text-gray-500 text-center py-12">{t('menu.emptyCategory')}</p>
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
          className="fixed bottom-20 end-4 z-30 w-14 h-14 rounded-full bg-[#c9a84c] text-black flex items-center justify-center shadow-lg shadow-[#c9a84c]/20 hover:bg-[#d4b96a] transition-colors animate-pulse-gold"
        >
          <span className="text-xl">🛒</span>
          <span className="absolute -top-1 -end-1 w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">
            {cartCount}
          </span>
        </button>
      )}
    </div>
  )
}
