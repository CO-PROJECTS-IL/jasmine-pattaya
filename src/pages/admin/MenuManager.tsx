import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useMenu } from '../../hooks/useMenu'

export default function MenuManager() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { categories, dishes, getDishesByCategory } = useMenu()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [availability, setAvailability] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {}
    dishes.forEach((d) => (map[d.id] = d.available))
    return map
  })

  const filteredDishes = (activeCategory ? getDishesByCategory(activeCategory) : dishes).filter(
    (d) => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return (
        d.nameHe.includes(q) ||
        d.nameEn.toLowerCase().includes(q) ||
        d.nameTh.toLowerCase().includes(q)
      )
    }
  )

  const toggleAvailability = (dishId: string) => {
    setAvailability((prev) => ({ ...prev, [dishId]: !prev[dishId] }))
  }

  const getName = (d: { nameHe: string; nameEn: string; nameTh: string }) =>
    i18n.language === 'he' ? d.nameHe : i18n.language === 'th' ? d.nameTh : d.nameEn

  const getCategoryName = (catId: string) => {
    const cat = categories.find((c) => c.id === catId)
    return cat ? getName(cat) : ''
  }

  return (
    <div className="overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl text-[#c9a84c] font-bold">{t('admin.menuManage')}</h1>
        <button
          onClick={() => navigate('/admin/menu/new')}
          className="bg-[#c9a84c] text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#d4b96a] transition-colors"
        >
          + {t('menuManage.addDish')}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('common.search') + '...'}
          className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]"
        />
        <select
          value={activeCategory ?? ''}
          onChange={(e) => setActiveCategory(e.target.value || null)}
          className="bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]"
        >
          <option value="">— {t('menuManage.category')} —</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {getName(cat)}
            </option>
          ))}
        </select>
      </div>

      <div className="text-sm text-gray-400 mb-3">
        {filteredDishes.length} {t('kitchen.items')}
      </div>

      <div className="bg-[#1a1a1a] rounded-xl border border-white/5 overflow-hidden">
        {filteredDishes.map((dish) => (
          <div
            key={dish.id}
            className="flex items-center gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors"
          >
            {dish.imageUrl ? (
              <img
                src={dish.imageUrl}
                alt=""
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-[#121212] flex items-center justify-center flex-shrink-0">
                <span className="text-gray-600 text-xs">🍽</span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-white text-sm font-medium truncate">{getName(dish)}</p>
                {dish.kosher && (
                  <span className="text-[10px] text-green-400 flex-shrink-0">✓ {t('menu.kosher')}</span>
                )}
              </div>
              <p className="text-gray-500 text-xs">{getCategoryName(dish.categoryId)}</p>
            </div>

            <span className="text-[#c9a84c] text-sm font-medium flex-shrink-0 w-16 text-center">
              {dish.price > 0 ? `฿${dish.price}` : t('menu.askPrice')}
            </span>

            <button
              onClick={() => toggleAvailability(dish.id)}
              className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${
                availability[dish.id] ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  availability[dish.id] ? 'start-5' : 'start-0.5'
                }`}
              />
            </button>

            <button
              onClick={() => navigate(`/admin/menu/${dish.id}`)}
              className="text-sm text-[#c9a84c] hover:text-[#d4b96a] flex-shrink-0 hidden sm:block"
            >
              {t('menuManage.editDish')}
            </button>
          </div>
        ))}

        {filteredDishes.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-500">{t('common.noResults')}</div>
        )}
      </div>
    </div>
  )
}
