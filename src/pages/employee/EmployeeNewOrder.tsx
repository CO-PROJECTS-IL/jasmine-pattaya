import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMenu } from '../../hooks/useMenu'
import { useFridayStatus } from '../../hooks/useFridayStatus'
import { useSettings } from '../../hooks/useSettings'
import { useCartStore } from '../../stores/cartStore'
import { callEdgeFunction } from '../../lib/supabase'
import { useToast } from '../../hooks/useToast'
import Toast from '../../components/ui/Toast'
import type { Dish } from '../../lib/types'

export default function EmployeeNewOrder() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { toast, showToast } = useToast()
  const { data: settings } = useSettings()
  const { categories, dishes, getDishesByCategory } = useMenu()
  useFridayStatus()
  const { items, addItem, clear, getTotal, setCreatedBy } = useCartStore()

  const [selectedTable, setSelectedTable] = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const tableCount = settings?.table_count || 30
  const langKey = i18n.language === 'he' ? 'name_he' : i18n.language === 'th' ? 'name_th' : 'name_en'

  if (!selectedTable) {
    return (
      <div className="max-w-lg mx-auto">
        <h2 className="text-xl mb-4 text-center" style={{ color: 'var(--accent)' }}>{t('employee.selectTable')}</h2>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: tableCount }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setSelectedTable(num)}
              className="py-3 rounded-xl text-lg transition-colors"
              style={{
                backgroundColor: 'white',
                border: '1px solid oklch(0.93 0.004 255)',
                color: 'var(--text-primary)',
                boxShadow: '0 1px 2px oklch(0.20 0.02 60 / 0.06)',
              }}
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
      showToast('שגיאה בשליחת ההזמנה', 'error')
    }
    setSubmitting(false)
  }

  const currentCategory = activeCategory || categories[0]?.id
  const currentDishes = currentCategory ? getDishesByCategory(currentCategory) : dishes

  return (
    <div className="max-w-lg mx-auto pb-32">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl" style={{ color: 'var(--accent)' }}>
          {t('cart.table')} #{selectedTable}
        </h2>
        <button onClick={() => setSelectedTable(null)} className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {t('employee.selectTable')}
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className="whitespace-nowrap px-3 py-1.5 rounded-lg text-sm transition-colors"
            style={
              currentCategory === cat.id
                ? { backgroundColor: 'oklch(0.55 0.14 255 / 0.10)', color: 'var(--accent)', border: '1px solid oklch(0.55 0.14 255 / 0.25)' }
                : { backgroundColor: 'white', color: 'var(--text-muted)', border: '1px solid oklch(0.93 0.004 255)' }
            }
          >
            {(cat as any)[langKey]}
          </button>
        ))}
      </div>

      {/* Dishes */}
      <div className="space-y-2 mb-4">
        {currentDishes.map((dish) => (
          <div key={dish.id} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'white', border: '1px solid oklch(0.93 0.004 255)', boxShadow: '0 1px 2px oklch(0.20 0.02 60 / 0.06)' }}>
            <div>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{(dish as any)[langKey]}</p>
              <p className="text-sm" style={{ color: 'var(--accent)' }}>{dish.price}฿</p>
            </div>
            <button
              onClick={() => handleAdd(dish)}
              className="px-3 py-1 rounded-lg text-sm"
              style={{ backgroundColor: 'oklch(0.55 0.14 255 / 0.2)', color: 'var(--accent)' }}
            >
              +
            </button>
          </div>
        ))}
      </div>

      {/* Cart summary */}
      {items.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 p-4 z-40" style={{ backgroundColor: 'white', borderTop: '1px solid oklch(0.93 0.004 255)', boxShadow: '0 -2px 8px oklch(0.20 0.02 60 / 0.06)' }}>
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-3">
              <span style={{ color: 'var(--text-muted)' }}>{items.length} {t('cart.quantity')}</span>
              <span className="font-bold" style={{ color: 'var(--accent)' }}>{getTotal()}฿</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clear}
                className="flex-1 py-2 rounded-lg text-sm"
              style={{ backgroundColor: 'oklch(0.97 0.002 255)', border: '1px solid oklch(0.92 0.005 255)', color: 'var(--text-muted)' }}
              >
                {t('cart.clear')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-2 py-2 rounded-lg font-medium disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent)', color: 'white' }}
              >
                {submitting ? t('common.loading') : t('cart.submit')}
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
