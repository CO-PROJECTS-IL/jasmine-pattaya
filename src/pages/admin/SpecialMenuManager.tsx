import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured, callEdgeFunction } from '../../lib/supabase'
import { useMenu } from '../../hooks/useMenu'
import { useToast } from '../../hooks/useToast'
import Toast from '../../components/ui/Toast'
import type { SpecialMenu, SpecialMenuItem, Dish } from '../../lib/types'

const DAY_NAMES_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

export default function SpecialMenuManager() {
  const queryClient = useQueryClient()
  const { toast, showToast } = useToast()
  const { dishes } = useMenu()
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const { data: menus = [] } = useQuery({
    queryKey: ['special-menus-admin'],
    queryFn: async () => {
      if (!isSupabaseConfigured) return []
      const { data, error } = await supabase
        .from('special_menus')
        .select('*')
        .order('sort_order')
      if (error) throw error
      return data as SpecialMenu[]
    },
  })

  const selectedMenu = menus.find((m) => m.id === selectedMenuId)

  const { data: menuItems = [] } = useQuery({
    queryKey: ['special-menu-items-admin', selectedMenuId],
    queryFn: async () => {
      if (!isSupabaseConfigured || !selectedMenuId) return []
      const { data, error } = await supabase
        .from('special_menu_items')
        .select('*, dish:dishes(*)')
        .eq('special_menu_id', selectedMenuId)
        .order('sort_order')
      if (error) throw error
      return data as SpecialMenuItem[]
    },
    enabled: !!selectedMenuId,
  })

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['special-menus-admin'] })
    queryClient.invalidateQueries({ queryKey: ['special-menu-items-admin'] })
  }

  const handleToggleEnabled = async (menu: SpecialMenu) => {
    try {
      await callEdgeFunction('admin-special-menus', {
        action: 'update',
        id: menu.id,
        is_enabled: !menu.is_enabled,
      })
      refresh()
    } catch {
      showToast('שגיאה בעדכון', 'error')
    }
  }

  const handleDeleteMenu = async (menu: SpecialMenu) => {
    if (!confirm(`למחוק את "${menu.name_he}"?`)) return
    try {
      await callEdgeFunction('admin-special-menus', { action: 'delete', id: menu.id })
      if (selectedMenuId === menu.id) setSelectedMenuId(null)
      refresh()
    } catch {
      showToast('שגיאה במחיקה', 'error')
    }
  }

  const handleAddDish = async (dish: Dish) => {
    if (!selectedMenuId) return
    try {
      await callEdgeFunction('admin-special-menus', {
        action: 'upsert-item',
        special_menu_id: selectedMenuId,
        dish_id: dish.id,
        override_price: dish.price,
      })
      refresh()
    } catch {
      showToast('שגיאה בהוספת מנה', 'error')
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    try {
      await callEdgeFunction('admin-special-menus', { action: 'delete-item', id: itemId })
      refresh()
    } catch {
      showToast('שגיאה בהסרת מנה', 'error')
    }
  }

  const handleUpdatePrice = async (item: SpecialMenuItem, newPrice: number) => {
    try {
      await callEdgeFunction('admin-special-menus', {
        action: 'upsert-item',
        special_menu_id: item.special_menu_id,
        dish_id: item.dish_id,
        override_price: newPrice,
        sort_order: item.sort_order,
        is_active: item.is_active,
      })
      refresh()
    } catch {
      showToast('שגיאה בעדכון מחיר', 'error')
    }
  }

  const handleToggleItem = async (item: SpecialMenuItem) => {
    try {
      await callEdgeFunction('admin-special-menus', {
        action: 'upsert-item',
        special_menu_id: item.special_menu_id,
        dish_id: item.dish_id,
        override_price: item.override_price,
        sort_order: item.sort_order,
        is_active: !item.is_active,
      })
      refresh()
    } catch {
      showToast('שגיאה בעדכון', 'error')
    }
  }

  const existingDishIds = new Set(menuItems.map((i) => i.dish_id))
  const availableDishes = dishes.filter((d) => !existingDishIds.has(d.id))

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl" style={{ color: 'var(--gold)' }}>תפריטים מיוחדים</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ backgroundColor: 'var(--gold)', color: 'var(--dark)' }}
        >
          + תפריט חדש
        </button>
      </div>

      {showCreateForm && (
        <CreateMenuForm
          onSave={() => { setShowCreateForm(false); refresh() }}
          onCancel={() => setShowCreateForm(false)}
          showToast={showToast}
        />
      )}

      {/* Menu list */}
      <div className="space-y-2 mb-6">
        {menus.map((menu) => (
          <div
            key={menu.id}
            className="p-4 rounded-xl cursor-pointer transition-colors"
            style={{
              backgroundColor: selectedMenuId === menu.id ? 'oklch(0.14 0.015 60)' : 'var(--dark-light)',
              border: selectedMenuId === menu.id ? '1px solid oklch(0.75 0.14 60 / 0.5)' : '1px solid oklch(0.25 0.008 60)',
            }}
            onClick={() => setSelectedMenuId(menu.id === selectedMenuId ? null : menu.id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {menu.name_he}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {menu.schedule_type === 'recurring' && menu.day_of_week !== null
                    ? `כל יום ${DAY_NAMES_HE[menu.day_of_week]} מ-${menu.switch_time.slice(0, 5)}`
                    : menu.specific_date
                      ? `${menu.specific_date} מ-${menu.switch_time.slice(0, 5)}`
                      : ''}
                </p>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleToggleEnabled(menu)}
                  className={`px-2.5 py-1 rounded text-[10px] font-medium ${menu.is_enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                >
                  {menu.is_enabled ? 'פעיל' : 'מושבת'}
                </button>
                <button
                  onClick={() => handleDeleteMenu(menu)}
                  className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
        {menus.length === 0 && !showCreateForm && (
          <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            אין תפריטים מיוחדים. צור אחד חדש.
          </p>
        )}
      </div>

      {/* Selected menu items */}
      {selectedMenu && (
        <div>
          <h2 className="text-lg mb-3" style={{ color: 'var(--gold)' }}>
            מנות ב{selectedMenu.name_he}
          </h2>

          {/* Current items */}
          <div className="space-y-2 mb-6">
            {menuItems.map((item) => (
              <MenuItemRow
                key={item.id}
                item={item}
                onRemove={handleRemoveItem}
                onUpdatePrice={handleUpdatePrice}
                onToggle={handleToggleItem}
              />
            ))}
            {menuItems.length === 0 && (
              <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
                אין מנות. הוסף מנות מהרשימה למטה.
              </p>
            )}
          </div>

          {/* Add dish */}
          {availableDishes.length > 0 && (
            <>
              <h3 className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>הוסף מנה</h3>
              <div className="space-y-1.5 max-h-60 overflow-y-auto rounded-xl p-2" style={{ backgroundColor: 'var(--dark-light)' }}>
                {availableDishes.map((dish) => (
                  <div
                    key={dish.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                    onClick={() => handleAddDish(dish)}
                  >
                    <div className="flex items-center gap-2">
                      {dish.image_url && <img src={dish.image_url} alt="" className="w-8 h-8 rounded object-cover" />}
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{dish.name_he}</span>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--gold)' }}>{dish.price}฿</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function MenuItemRow({ item, onRemove, onUpdatePrice, onToggle }: {
  item: SpecialMenuItem
  onRemove: (id: string) => void
  onUpdatePrice: (item: SpecialMenuItem, price: number) => void
  onToggle: (item: SpecialMenuItem) => void
}) {
  const [editing, setEditing] = useState(false)
  const [price, setPrice] = useState(String(item.override_price ?? item.dish?.price ?? 0))

  const handleSavePrice = () => {
    const num = parseFloat(price)
    if (!isNaN(num) && num >= 0) {
      onUpdatePrice(item, num)
    }
    setEditing(false)
  }

  return (
    <div
      className="flex items-center justify-between p-3 rounded-xl"
      style={{ backgroundColor: 'var(--dark-light)', border: '1px solid oklch(0.25 0.008 60)' }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {item.dish?.image_url && (
          <img src={item.dish.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
        )}
        <div className="min-w-0">
          <p className={`text-sm truncate ${item.is_active ? '' : 'line-through'}`} style={{ color: item.is_active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {item.dish?.name_he}
          </p>
          {editing ? (
            <div className="flex items-center gap-1 mt-1">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-20 px-2 py-1 rounded text-xs"
                style={{ backgroundColor: 'var(--dark-lighter)', border: '1px solid oklch(0.30 0.008 60)', color: 'var(--text-primary)' }}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSavePrice()}
              />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>฿</span>
              <button onClick={handleSavePrice} className="text-green-400 text-xs px-1">✓</button>
            </div>
          ) : (
            <p
              className="text-xs cursor-pointer hover:underline"
              style={{ color: 'var(--gold)' }}
              onClick={() => setEditing(true)}
            >
              {item.override_price ?? item.dish?.price}฿
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onToggle(item)}
          className={`w-9 h-9 rounded-lg text-xs ${item.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
        >
          {item.is_active ? '✓' : '✕'}
        </button>
        <button
          onClick={() => onRemove(item.id)}
          className="w-9 h-9 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 flex items-center justify-center"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

function CreateMenuForm({ onSave, onCancel, showToast }: {
  onSave: () => void
  onCancel: () => void
  showToast: (msg: string, type: 'success' | 'error') => void
}) {
  const [nameHe, setNameHe] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [scheduleType, setScheduleType] = useState<'recurring' | 'specific_date'>('recurring')
  const [dayOfWeek, setDayOfWeek] = useState(5)
  const [specificDate, setSpecificDate] = useState('')
  const [switchTime, setSwitchTime] = useState('14:00')
  const [maxGuests, setMaxGuests] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!nameHe) return
    setSaving(true)
    try {
      await callEdgeFunction('admin-special-menus', {
        action: 'create',
        name_he: nameHe,
        name_en: nameEn,
        schedule_type: scheduleType,
        day_of_week: scheduleType === 'recurring' ? dayOfWeek : undefined,
        specific_date: scheduleType === 'specific_date' ? specificDate : undefined,
        switch_time: switchTime,
        max_guests: maxGuests ? parseInt(maxGuests) : undefined,
      })
      onSave()
    } catch {
      showToast('שגיאה ביצירת תפריט', 'error')
    }
    setSaving(false)
  }

  return (
    <div className="mb-6 p-4 rounded-xl space-y-3" style={{ backgroundColor: 'var(--dark-light)', border: '1px solid oklch(0.30 0.008 60)' }}>
      <input
        type="text"
        placeholder="שם התפריט בעברית *"
        value={nameHe}
        onChange={(e) => setNameHe(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm"
        style={{ backgroundColor: 'var(--dark-lighter)', border: '1px solid oklch(0.30 0.008 60)', color: 'var(--text-primary)' }}
      />
      <input
        type="text"
        placeholder="Menu name in English"
        value={nameEn}
        onChange={(e) => setNameEn(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm"
        style={{ backgroundColor: 'var(--dark-lighter)', border: '1px solid oklch(0.30 0.008 60)', color: 'var(--text-primary)' }}
      />

      {/* Schedule type */}
      <div className="flex gap-2">
        <button
          onClick={() => setScheduleType('recurring')}
          className={`flex-1 py-2 rounded-lg text-sm ${scheduleType === 'recurring' ? 'font-medium' : ''}`}
          style={{
            backgroundColor: scheduleType === 'recurring' ? 'oklch(0.75 0.14 60 / 0.2)' : 'var(--dark-lighter)',
            color: scheduleType === 'recurring' ? 'var(--gold)' : 'var(--text-muted)',
            border: `1px solid ${scheduleType === 'recurring' ? 'oklch(0.75 0.14 60 / 0.3)' : 'oklch(0.30 0.008 60)'}`,
          }}
        >
          חוזר כל שבוע
        </button>
        <button
          onClick={() => setScheduleType('specific_date')}
          className={`flex-1 py-2 rounded-lg text-sm ${scheduleType === 'specific_date' ? 'font-medium' : ''}`}
          style={{
            backgroundColor: scheduleType === 'specific_date' ? 'oklch(0.75 0.14 60 / 0.2)' : 'var(--dark-lighter)',
            color: scheduleType === 'specific_date' ? 'var(--gold)' : 'var(--text-muted)',
            border: `1px solid ${scheduleType === 'specific_date' ? 'oklch(0.75 0.14 60 / 0.3)' : 'oklch(0.30 0.008 60)'}`,
          }}
        >
          תאריך ספציפי
        </button>
      </div>

      {scheduleType === 'recurring' ? (
        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>יום בשבוע</label>
          <div className="flex gap-1 flex-wrap">
            {DAY_NAMES_HE.map((day, i) => (
              <button
                key={i}
                onClick={() => setDayOfWeek(i)}
                className="px-3 py-1.5 rounded-lg text-xs"
                style={{
                  backgroundColor: dayOfWeek === i ? 'oklch(0.75 0.14 60 / 0.2)' : 'var(--dark-lighter)',
                  color: dayOfWeek === i ? 'var(--gold)' : 'var(--text-muted)',
                  border: `1px solid ${dayOfWeek === i ? 'oklch(0.75 0.14 60 / 0.3)' : 'oklch(0.30 0.008 60)'}`,
                }}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>תאריך</label>
          <input
            type="date"
            value={specificDate}
            onChange={(e) => setSpecificDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ backgroundColor: 'var(--dark-lighter)', border: '1px solid oklch(0.30 0.008 60)', color: 'var(--text-primary)' }}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>שעת הפעלה</label>
          <input
            type="time"
            value={switchTime}
            onChange={(e) => setSwitchTime(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ backgroundColor: 'var(--dark-lighter)', border: '1px solid oklch(0.30 0.008 60)', color: 'var(--text-primary)' }}
          />
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>מקס' אורחים</label>
          <input
            type="number"
            value={maxGuests}
            onChange={(e) => setMaxGuests(e.target.value)}
            placeholder="ללא הגבלה"
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ backgroundColor: 'var(--dark-lighter)', border: '1px solid oklch(0.30 0.008 60)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2 bg-white/5 rounded-lg text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          ביטול
        </button>
        <button
          onClick={handleSave}
          disabled={!nameHe || saving || (scheduleType === 'specific_date' && !specificDate)}
          className="flex-1 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          style={{ backgroundColor: 'var(--gold)', color: 'var(--dark)' }}
        >
          {saving ? '...' : 'צור תפריט'}
        </button>
      </div>
    </div>
  )
}
