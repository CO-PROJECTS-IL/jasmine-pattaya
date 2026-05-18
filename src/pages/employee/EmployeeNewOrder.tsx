import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMenu } from '../../hooks/useMenu'
import { useFridayStatus } from '../../hooks/useFridayStatus'
import { useSettings } from '../../hooks/useSettings'
import { useCartStore } from '../../stores/cartStore'
import { callEdgeFunction } from '../../lib/supabase'
import type { Dish } from '../../lib/types'

export default function EmployeeNewOrder() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { data: settings } = useSettings()
  const { categories, dishes, getDishesByCategory } = useMenu()
  const { isFridayMenuActive } = useFridayStatus()
  const { items, addItem, removeItem, updateQuantity, clear, getTotal, setCreatedBy } = useCartStore()

  const [selectedTable, setSelectedTable] = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const tableCount = settings?.table_count || 30
  const langKey = i18n.language === 'he' ? 'name_he' : i18n.language === 'th' ? 'name_th' : 'name_en'

  if (!selectedTable) {
    return (
      <div className="max-w-lg mx-auto">
        <h2 className="text-xl text-[#c9a84c] mb-4 text-center">{t('employee.selectTable')}</h2>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: tableCount }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setSelectedTable(num)}
              className="py-3 bg-[#121212] border border-white/10 rounded-lg text-white text-lg hover:bg-[#c9a84c]/20 hover:border-[#c9a84c]/30 transition-colors"
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const handleAdd = (dish: Dish) => {
    setCreatedBy('employee')
    addItem({
      dishId: dish.id,
      nameHe: dish.name_he,
      nameEn: dish.name_en,
      nameTh: dish.name_th,
      price: dish.price,
    })
  }

  const handleSubmit = async () => {
    if (items.length === 0) return
    setSubmitting(true)
    try {
      await callEdgeFunction('submit-order', {
        table_number: selectedTable,
        items: items.map((i) => ({
          dish_id: i.dishId,
          quantity: i.quantity,
          notes: i.notes,
        })),
        created_by: 'employee',
      })
      clear()
      navigate('/employee')
    } catch (err) {
      console.error(err)
    }
    setSubmitting(false)
  }

  const currentCategory = activeCategory || categories[0]?.id
  const currentDishes = currentCategory ? getDishesByCategory(currentCategory) : dishes

  return (
    <div className="max-w-lg mx-auto pb-32">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl text-[#c9a84c]">
          {t('cart.table')} #{selectedTable}
        </h2>
        <button onClick={() => setSelectedTable(null)} className="text-gray-400 text-sm hover:text-white">
          {t('employee.selectTable')}
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm transition-colors ${
              currentCategory === cat.id
                ? 'bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/30'
                : 'bg-white/5 text-gray-400 border border-transparent'
            }`}
          >
            {(cat as any)[langKey]}
          </button>
        ))}
      </div>

      {/* Dishes */}
      <div className="space-y-2 mb-4">
        {currentDishes.map((dish) => (
          <div key={dish.id} className="flex items-center justify-between p-3 bg-[#121212] border border-white/5 rounded-xl">
            <div>
              <p className="text-white text-sm">{(dish as any)[langKey]}</p>
              <p className="text-[#c9a84c] text-sm">{dish.price}฿</p>
            </div>
            <button
              onClick={() => handleAdd(dish)}
              className="px-3 py-1 bg-[#c9a84c]/20 text-[#c9a84c] rounded-lg text-sm hover:bg-[#c9a84c]/30"
            >
              +
            </button>
          </div>
        ))}
      </div>

      {/* Cart summary */}
      {items.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-[#121212] border-t border-[#c9a84c]/20 p-4 z-40">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400">{items.length} {t('cart.quantity')}</span>
              <span className="text-[#c9a84c] font-bold">{getTotal()}฿</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clear}
                className="flex-1 py-2 bg-white/5 text-gray-400 rounded-lg text-sm"
              >
                {t('cart.clear')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-2 py-2 bg-[#c9a84c] text-black rounded-lg font-medium disabled:opacity-50"
              >
                {submitting ? t('common.loading') : t('cart.submit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
