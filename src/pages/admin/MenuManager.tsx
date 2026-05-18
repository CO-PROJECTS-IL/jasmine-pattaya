import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useMenu } from '../../hooks/useMenu'
import { callEdgeFunction } from '../../lib/supabase'
import AdminLayout from '../../components/layout/AdminLayout'
import type { Dish } from '../../lib/types'

export default function MenuManager() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { categories, dishes } = useMenu()

  const langKey = i18n.language === 'he' ? 'name_he' : i18n.language === 'th' ? 'name_th' : 'name_en'

  const handleDelete = async (dishId: string) => {
    if (!confirm(t('menuManage.confirmDelete'))) return
    try {
      await callEdgeFunction('admin-dishes', { action: 'delete', id: dishId })
      window.location.reload()
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleAvailable = async (dish: Dish) => {
    try {
      await callEdgeFunction('admin-dishes', {
        action: 'update',
        id: dish.id,
        data: { is_available: !dish.is_available },
      })
      window.location.reload()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl text-[#c9a84c]">{t('adminHome.menuManage')}</h1>
        <button
          onClick={() => navigate('/admin/menu/new')}
          className="px-4 py-2 bg-[#c9a84c] text-black rounded-lg text-sm font-medium hover:bg-[#d4b96a] transition-colors"
        >
          {t('menuManage.addDish')}
        </button>
      </div>

      {categories.map((cat) => {
        const catDishes = dishes.filter((d) => d.category_id === cat.id)
        if (catDishes.length === 0) return null
        return (
          <div key={cat.id} className="mb-6">
            <h2 className="text-sm text-[#c9a84c]/70 uppercase tracking-wide mb-2">
              {(cat as any)[langKey]}
            </h2>
            <div className="space-y-2">
              {catDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="flex items-center justify-between p-3 bg-[#121212] border border-white/5 rounded-xl"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {dish.image_url && (
                      <img src={dish.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    )}
                    <div className="min-w-0">
                      <p className={`text-sm truncate ${dish.is_available ? 'text-white' : 'text-gray-500 line-through'}`}>
                        {(dish as any)[langKey]}
                      </p>
                      <p className="text-xs text-[#c9a84c]">{dish.price}฿</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleAvailable(dish)}
                      className={`w-8 h-8 rounded-lg text-xs ${dish.is_available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                    >
                      {dish.is_available ? '✓' : '✕'}
                    </button>
                    <button
                      onClick={() => navigate(`/admin/menu/${dish.id}`)}
                      className="w-8 h-8 rounded-lg bg-white/5 text-gray-400 text-xs hover:bg-white/10"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDelete(dish.id)}
                      className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </AdminLayout>
  )
}
