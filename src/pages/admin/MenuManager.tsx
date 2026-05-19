import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useMenu } from '../../hooks/useMenu'
import { callEdgeFunction } from '../../lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import type { Dish } from '../../lib/types'

export default function MenuManager() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { categories, dishes } = useMenu()
  const [showCatForm, setShowCatForm] = useState(false)
  const [catName, setCatName] = useState({ he: '', en: '', th: '' })
  const [savingCat, setSavingCat] = useState(false)

  const langKey = i18n.language === 'he' ? 'name_he' : i18n.language === 'th' ? 'name_th' : 'name_en'

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] })
    queryClient.invalidateQueries({ queryKey: ['dishes'] })
  }

  const handleDeleteDish = async (dishId: string) => {
    if (!confirm(t('menuManage.confirmDelete'))) return
    try {
      await callEdgeFunction('admin-dishes', { action: 'delete', id: dishId })
      refresh()
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
      refresh()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDuplicate = async (dish: Dish) => {
    try {
      await callEdgeFunction('admin-dishes', {
        action: 'create',
        data: {
          name_he: dish.name_he,
          name_en: dish.name_en,
          name_th: dish.name_th,
          description_he: dish.description_he,
          description_en: dish.description_en,
          description_th: dish.description_th || '',
          price: dish.price,
          category_id: dish.category_id,
          image_url: dish.image_url || '',
          is_kosher: dish.is_kosher,
          is_spicy: dish.is_spicy,
          is_vegetarian: dish.is_vegetarian,
          is_available: dish.is_available,
        },
      })
      refresh()
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddCategory = async () => {
    if (!catName.he) return
    setSavingCat(true)
    try {
      await callEdgeFunction('admin-categories', {
        action: 'create',
        name_he: catName.he,
        name_en: catName.en || catName.he,
        name_th: catName.th || '',
        sort_order: categories.length,
      })
      setCatName({ he: '', en: '', th: '' })
      setShowCatForm(false)
      refresh()
    } catch (err) {
      console.error(err)
    }
    setSavingCat(false)
  }

  const handleDeleteCategory = async (catId: string, catName: string) => {
    const catDishes = dishes.filter((d) => d.category_id === catId)
    const msg = catDishes.length > 0
      ? `מחיקת "${catName}" תמחק גם ${catDishes.length} מנות. להמשיך?`
      : `למחוק את "${catName}"?`
    if (!confirm(msg)) return
    try {
      await callEdgeFunction('admin-categories', { action: 'delete', id: catId })
      refresh()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl text-[#c9a84c]">{t('adminHome.menuManage')}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCatForm(!showCatForm)}
            className="px-3 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10 transition-colors"
          >
            + קטגוריה
          </button>
          <button
            onClick={() => navigate('/admin/menu/new')}
            className="px-3 py-2 bg-[#c9a84c] text-black rounded-lg text-sm font-medium hover:bg-[#d4b96a] transition-colors"
          >
            {t('menuManage.addDish')}
          </button>
        </div>
      </div>

      {showCatForm && (
        <div className="mb-6 p-4 bg-[#121212] border border-white/10 rounded-xl space-y-3">
          <input
            type="text"
            placeholder="שם בעברית *"
            value={catName.he}
            onChange={(e) => setCatName((c) => ({ ...c, he: e.target.value }))}
            className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:border-[#c9a84c] focus:outline-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Name in English"
              value={catName.en}
              onChange={(e) => setCatName((c) => ({ ...c, en: e.target.value }))}
              className="px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:border-[#c9a84c] focus:outline-none"
            />
            <input
              type="text"
              placeholder="ชื่อภาษาไทย"
              value={catName.th}
              onChange={(e) => setCatName((c) => ({ ...c, th: e.target.value }))}
              className="px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:border-[#c9a84c] focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCatForm(false)}
              className="flex-1 py-2 bg-white/5 text-gray-400 rounded-lg text-sm"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleAddCategory}
              disabled={!catName.he || savingCat}
              className="flex-1 py-2 bg-[#c9a84c] text-black rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {savingCat ? '...' : t('common.save')}
            </button>
          </div>
        </div>
      )}

      {categories.map((cat) => {
        const catDishes = dishes.filter((d) => d.category_id === cat.id)
        return (
          <div key={cat.id} className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm text-[#c9a84c]/70 uppercase tracking-wide">
                {(cat as any)[langKey]} ({catDishes.length})
              </h2>
              <button
                onClick={() => handleDeleteCategory(cat.id, cat.name_he)}
                className="text-xs text-red-400/50 hover:text-red-400 px-2 py-1 transition-colors"
              >
                מחק קטגוריה
              </button>
            </div>
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
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleAvailable(dish)}
                      className={`w-8 h-8 rounded-lg text-xs ${dish.is_available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                      title={dish.is_available ? 'זמין' : 'לא זמין'}
                    >
                      {dish.is_available ? '✓' : '✕'}
                    </button>
                    <button
                      onClick={() => handleDuplicate(dish)}
                      className="w-8 h-8 rounded-lg bg-white/5 text-gray-400 text-xs hover:bg-white/10"
                      title="שכפל מנה"
                    >
                      ⧉
                    </button>
                    <button
                      onClick={() => navigate(`/admin/menu/${dish.id}`)}
                      className="w-8 h-8 rounded-lg bg-white/5 text-gray-400 text-xs hover:bg-white/10"
                      title="ערוך"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDeleteDish(dish.id)}
                      className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20"
                      title="מחק"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              {catDishes.length === 0 && (
                <p className="text-xs text-gray-600 py-2 text-center">אין מנות בקטגוריה זו</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
