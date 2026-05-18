import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useMenu } from '../../hooks/useMenu'

export default function DishEditor() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { categories, dishes } = useMenu()

  const existing = useMemo(() => (id && id !== 'new' ? dishes.find((d) => d.id === id) : null), [id, dishes])

  const [form, setForm] = useState({
    nameHe: existing?.nameHe ?? '',
    nameEn: existing?.nameEn ?? '',
    nameTh: existing?.nameTh ?? '',
    descriptionHe: existing?.descriptionHe ?? '',
    descriptionEn: existing?.descriptionEn ?? '',
    price: existing?.price ?? 0,
    categoryId: existing?.categoryId ?? categories[0]?.id ?? '',
    kosher: existing?.kosher ?? false,
    spicy: existing?.spicy ?? false,
    vegetarian: existing?.vegetarian ?? false,
    imageUrl: existing?.imageUrl ?? '',
  })

  const update = (key: string, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSave = () => {
    navigate('/admin/menu')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl text-[#c9a84c] font-bold">
          {existing ? t('menuManage.editDish') : t('menuManage.addDish')}
        </h1>
        <button
          onClick={() => navigate('/admin/menu')}
          className="text-gray-400 hover:text-white text-sm"
        >
          {t('common.back')}
        </button>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-4 space-y-4">
          <h2 className="text-sm text-gray-400 font-medium uppercase">{t('menuManage.dishName')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">עברית</label>
              <input
                value={form.nameHe}
                onChange={(e) => update('nameHe', e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">English</label>
              <input
                value={form.nameEn}
                onChange={(e) => update('nameEn', e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">ไทย</label>
              <input
                value={form.nameTh}
                onChange={(e) => update('nameTh', e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-4 space-y-4">
          <h2 className="text-sm text-gray-400 font-medium uppercase">{t('menuManage.description')}</h2>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">עברית</label>
            <textarea
              value={form.descriptionHe}
              onChange={(e) => update('descriptionHe', e.target.value)}
              rows={2}
              className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c] resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">English</label>
            <textarea
              value={form.descriptionEn}
              onChange={(e) => update('descriptionEn', e.target.value)}
              rows={2}
              className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c] resize-none"
            />
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-4 space-y-4">
          <h2 className="text-sm text-gray-400 font-medium uppercase">{t('menuManage.price')} & {t('menuManage.category')}</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{t('menuManage.price')} (฿)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => update('price', Number(e.target.value))}
                className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{t('menuManage.category')}</label>
              <select
                value={form.categoryId}
                onChange={(e) => update('categoryId', e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nameHe}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-4 space-y-4">
          <h2 className="text-sm text-gray-400 font-medium uppercase">{t('menuManage.image')}</h2>
          {form.imageUrl && (
            <img src={form.imageUrl} alt="" className="w-full max-w-xs rounded-xl object-cover aspect-[4/3]" />
          )}
          <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center">
            <p className="text-gray-500 text-sm">Cloudinary upload — {t('menu.comingSoon')}</p>
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-4">
          <div className="flex flex-wrap gap-6">
            {(['kosher', 'spicy', 'vegetarian'] as const).map((flag) => (
              <label key={flag} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[flag]}
                  onChange={(e) => update(flag, e.target.checked)}
                  className="w-4 h-4 rounded bg-[#121212] border-white/10 accent-[#c9a84c]"
                />
                <span className="text-sm text-white">{t(`menuManage.${flag}`)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="bg-[#c9a84c] text-black px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#d4b96a] transition-colors"
          >
            {t('menuManage.save')}
          </button>
          <button
            onClick={() => navigate('/admin/menu')}
            className="bg-[#1a1a1a] text-gray-400 px-6 py-2.5 rounded-lg text-sm hover:text-white transition-colors"
          >
            {t('common.cancel')}
          </button>
          {existing && (
            <button
              className="ms-auto text-red-400 hover:text-red-300 text-sm"
            >
              {t('menuManage.delete')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
