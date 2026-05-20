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

  const handleDeleteCategory = async (catId: string, catNameStr: string) => {
    const catDishes = dishes.filter((d) => d.category_id === catId)
    const msg = catDishes.length > 0
      ? `מחיקת "${catNameStr}" תמחק גם ${catDishes.length} מנות. להמשיך?`
      : `למחוק את "${catNameStr}"?`
    if (!confirm(msg)) return
    try {
      await callEdgeFunction('admin-categories', { action: 'delete', id: catId })
      refresh()
    } catch (err) {
      showToast('שגיאה במחיקת קטגוריה', 'error')
    }
  }

  const inputStyle = {
    backgroundColor: 'oklch(0.97 0.002 255)',
    border: '1px solid oklch(0.92 0.005 255)',
    color: 'var(--text-primary)',
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <div className="flex items-center justify-between mb-5">
        <div />
        <div className="flex gap-2">
          <button
            onClick={() => setShowCatForm(!showCatForm)}
            className="px-3.5 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-black/5"
            style={{ color: 'var(--text-secondary)', border: '1px solid oklch(0.92 0.005 255)' }}
          >
            + קטגוריה
          </button>
          <button
            onClick={() => navigate('/admin/menu/new')}
            className="px-3.5 py-2 rounded-xl text-sm font-bold transition-colors"
            style={{ backgroundColor: 'var(--accent)', color: 'white' }}
          >
            {t('menuManage.addDish')}
          </button>
        </div>
      </div>

      {showCatForm && (
        <div
          className="mb-6 p-4 rounded-2xl space-y-3 bg-white"
          style={{
            boxShadow: '0 1px 4px oklch(0.20 0.02 60 / 0.06)',
            border: '1px solid oklch(0.93 0.004 255)',
          }}
        >
          <input
            type="text"
            placeholder="שם בעברית *"
            value={catName.he}
            onChange={(e) => setCatName((c) => ({ ...c, he: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl text-sm"
            style={inputStyle}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Name in English"
              value={catName.en}
              onChange={(e) => setCatName((c) => ({ ...c, en: e.target.value }))}
              className="px-3 py-2.5 rounded-xl text-sm"
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="ชื่อภาษาไทย"
              value={catName.th}
              onChange={(e) => setCatName((c) => ({ ...c, th: e.target.value }))}
              className="px-3 py-2.5 rounded-xl text-sm"
              style={inputStyle}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCatForm(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium hover:bg-black/5 transition-colors"
              style={{ color: 'var(--text-muted)', border: '1px solid oklch(0.92 0.005 255)' }}
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleAddCategory}
              disabled={!catName.he || savingCat}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-colors"
              style={{ backgroundColor: 'var(--accent)', color: 'white' }}
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
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
                {(cat as any)[langKey]} ({catDishes.length})
              </h2>
              <button
                onClick={() => handleDeleteCategory(cat.id, cat.name_he)}
                className="text-xs text-red-400/60 hover:text-red-500 px-2 py-1 transition-colors"
              >
                מחק קטגוריה
              </button>
            </div>
            <div
              className="rounded-2xl overflow-hidden bg-white"
              style={{
                boxShadow: '0 1px 4px oklch(0.20 0.02 60 / 0.06)',
                border: '1px solid oklch(0.93 0.004 255)',
              }}
            >
              {catDishes.map((dish, idx) => (
                <div
                  key={dish.id}
                  className="flex items-center justify-between p-3"
                  style={idx < catDishes.length - 1 ? { borderBottom: '1px solid oklch(0.95 0.003 255)' } : undefined}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {dish.image_url && (
                      <img src={dish.image_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
                    )}
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${dish.is_available ? '' : 'line-through'}`} style={{ color: dish.is_available ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {(dish as any)[langKey]}
                      </p>
                      <p className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>{dish.price}฿</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleAvailable(dish)}
                      className="w-10 h-10 rounded-xl text-xs font-bold flex items-center justify-center transition-colors"
                      style={
                        dish.is_available
                          ? { backgroundColor: 'oklch(0.55 0.14 150 / 0.1)', color: 'oklch(0.45 0.14 150)' }
                          : { backgroundColor: 'oklch(0.55 0.16 25 / 0.1)', color: 'oklch(0.50 0.16 25)' }
                      }
                      aria-label={dish.is_available ? 'זמין' : 'לא זמין'}
                    >
                      {dish.is_available ? '✓' : '✕'}
                    </button>
                    <button
                      onClick={() => handleDuplicate(dish)}
                      className="w-10 h-10 rounded-xl text-xs hover:bg-black/5 transition-colors flex items-center justify-center"
                      style={{ color: 'var(--text-muted)' }}
                      aria-label="שכפל מנה"
                    >
                      ⧉
                    </button>
                    <button
                      onClick={() => navigate(`/admin/menu/${dish.id}`)}
                      className="w-10 h-10 rounded-xl text-xs hover:bg-black/5 transition-colors flex items-center justify-center"
                      style={{ color: 'var(--text-muted)' }}
                      aria-label="ערוך"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDeleteDish(dish.id)}
                      className="w-10 h-10 rounded-xl text-xs hover:bg-red-50 transition-colors flex items-center justify-center"
                      style={{ color: 'oklch(0.55 0.16 25)' }}
                      aria-label="מחק"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              {catDishes.length === 0 && (
                <p className="text-xs py-4 text-center" style={{ color: 'var(--text-muted)' }}>אין מנות בקטגוריה זו</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
