import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useMenu } from '../../hooks/useMenu'
import { callEdgeFunction } from '../../lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '../../hooks/useToast'
import Toast from '../../components/ui/Toast'
import type { Dish } from '../../lib/types'

export default function MenuManager() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast, showToast } = useToast()
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
      showToast('שגיאה במחיקת מנה', 'error')
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
      showToast('שגיאה בעדכון זמינות', 'error')
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
      showToast('שגיאה בשכפול מנה', 'error')
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
      showToast('שגיאה בהוספת קטגוריה', 'error')
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
      showToast('שגיאה במחיקת קטגוריה', 'error')
    }
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl" style={{ color: 'var(--gold)' }}>{t('adminHome.menuManage')}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCatForm(!showCatForm)}
            className="px-3 py-2 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            + קטגוריה
          </button>
          <button
            onClick={() => navigate('/admin/menu/new')}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: 'var(--gold)', color: 'var(--dark)' }}
          >
            {t('menuManage.addDish')}
          </button>
        </div>
      </div>

      {showCatForm && (
        <div className="mb-6 p-4 rounded-xl space-y-3" style={{ backgroundColor: 'var(--dark-light)', border: '1px solid oklch(0.30 0.005 85)' }}>
          <input
            type="text"
            placeholder="שם בעברית *"
            value={catName.he}
            onChange={(e) => setCatName((c) => ({ ...c, he: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ backgroundColor: 'var(--dark-lighter)', border: '1px solid oklch(0.30 0.005 85)', color: 'var(--text-primary)' }}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Name in English"
              value={catName.en}
              onChange={(e) => setCatName((c) => ({ ...c, en: e.target.value }))}
              className="px-3 py-2 rounded-lg text-sm"
              style={{ backgroundColor: 'var(--dark-lighter)', border: '1px solid oklch(0.30 0.005 85)', color: 'var(--text-primary)' }}
            />
            <input
              type="text"
              placeholder="ชื่อภาษาไทย"
              value={catName.th}
              onChange={(e) => setCatName((c) => ({ ...c, th: e.target.value }))}
              className="px-3 py-2 rounded-lg text-sm"
              style={{ backgroundColor: 'var(--dark-lighter)', border: '1px solid oklch(0.30 0.005 85)', color: 'var(--text-primary)' }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCatForm(false)}
              className="flex-1 py-2 bg-white/5 rounded-lg text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleAddCategory}
              disabled={!catName.he || savingCat}
              className="flex-1 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: 'var(--gold)', color: 'var(--dark)' }}
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
              <h2 className="text-sm uppercase tracking-wide" style={{ color: 'oklch(0.75 0.12 85 / 0.7)' }}>
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
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ backgroundColor: 'var(--dark-light)', border: '1px solid oklch(0.25 0.005 85)' }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {dish.image_url && (
                      <img src={dish.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    )}
                    <div className="min-w-0">
                      <p className={`text-sm truncate ${dish.is_available ? '' : 'line-through'}`} style={{ color: dish.is_available ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {(dish as any)[langKey]}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--gold)' }}>{dish.price}฿</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleAvailable(dish)}
                      className={`w-11 h-11 rounded-lg text-xs ${dish.is_available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                      aria-label={dish.is_available ? 'זמין' : 'לא זמין'}
                    >
                      {dish.is_available ? '✓' : '✕'}
                    </button>
                    <button
                      onClick={() => handleDuplicate(dish)}
                      className="w-11 h-11 rounded-lg bg-white/5 text-xs hover:bg-white/10"
                      style={{ color: 'var(--text-muted)' }}
                      aria-label="שכפל מנה"
                    >
                      ⧉
                    </button>
                    <button
                      onClick={() => navigate(`/admin/menu/${dish.id}`)}
                      className="w-11 h-11 rounded-lg bg-white/5 text-xs hover:bg-white/10"
                      style={{ color: 'var(--text-muted)' }}
                      aria-label="ערוך"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDeleteDish(dish.id)}
                      className="w-11 h-11 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20"
                      aria-label="מחק"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              {catDishes.length === 0 && (
                <p className="text-xs py-2 text-center" style={{ color: 'var(--text-muted)' }}>אין מנות בקטגוריה זו</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
