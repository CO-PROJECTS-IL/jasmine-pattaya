import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase, callEdgeFunction, isSupabaseConfigured } from '../../lib/supabase'
import { uploadImage } from '../../lib/cloudinary'
import type { Dish, Category } from '../../lib/types'

export default function DishEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isNew = id === 'new'
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [dish, setDish] = useState<Dish | null>(null)
  const [form, setForm] = useState({
    name_he: '',
    name_en: '',
    name_th: '',
    description_he: '',
    description_en: '',
    description_th: '',
    price: 0,
    category_id: '',
    image_url: '',
    is_kosher: false,
    is_spicy: false,
    is_vegetarian: false,
    is_available: true,
  })

  useEffect(() => {
    const load = async () => {
      if (!isSupabaseConfigured) return
      const { data: cats } = await supabase.from('categories').select('*').order('sort_order')
      if (cats) setCategories(cats)

      if (!isNew && id) {
        const { data } = await supabase.from('dishes').select('*').eq('id', id).single()
        if (data) {
          setDish(data)
          setForm({
            name_he: data.name_he || '',
            name_en: data.name_en || '',
            name_th: data.name_th || '',
            description_he: data.description_he || '',
            description_en: data.description_en || '',
            description_th: data.description_th || '',
            price: data.price || 0,
            category_id: data.category_id || '',
            image_url: data.image_url || '',
            is_kosher: data.is_kosher || false,
            is_spicy: data.is_spicy || false,
            is_vegetarian: data.is_vegetarian || false,
            is_available: data.is_available ?? true,
          })
        }
      } else if (cats && cats.length > 0) {
        setForm((f) => ({ ...f, category_id: cats[0].id }))
      }
    }
    load()
  }, [id, isNew])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await uploadImage(file)
      setForm((f) => ({ ...f, image_url: url }))
    } catch (err) {
      console.error(err)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await callEdgeFunction('admin-dishes', {
        action: isNew ? 'create' : 'update',
        id: dish?.id,
        data: form,
      })
      navigate('/admin/menu')
    } catch (err) {
      console.error(err)
    }
    setSaving(false)
  }

  const update = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }))

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl text-[#c9a84c] mb-6">
        {isNew ? t('menuManage.addDish') : t('menuManage.editDish')}
      </h2>

      <div className="space-y-4">
        {['he', 'en', 'th'].map((lang) => (
          <div key={lang}>
            <label className="text-xs text-gray-400 uppercase">{t('menuManage.dishName')} ({lang})</label>
            <input
              type="text"
              value={(form as any)[`name_${lang}`]}
              onChange={(e) => update(`name_${lang}`, e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:border-[#c9a84c] focus:outline-none"
            />
          </div>
        ))}

        {['he', 'en', 'th'].map((lang) => (
          <div key={`desc-${lang}`}>
            <label className="text-xs text-gray-400 uppercase">{t('menuManage.description')} ({lang})</label>
            <textarea
              value={(form as any)[`description_${lang}`]}
              onChange={(e) => update(`description_${lang}`, e.target.value)}
              rows={2}
              className="w-full mt-1 px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:border-[#c9a84c] focus:outline-none resize-none"
            />
          </div>
        ))}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400">{t('menuManage.price')}</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => update('price', parseFloat(e.target.value) || 0)}
              className="w-full mt-1 px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:border-[#c9a84c] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">{t('menuManage.category')}</label>
            <select
              value={form.category_id}
              onChange={(e) => update('category_id', e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:border-[#c9a84c] focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name_he}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400">{t('menuManage.image')}</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1 text-sm text-gray-400" />
          {form.image_url && <img src={form.image_url} alt="" className="mt-2 w-20 h-20 rounded-lg object-cover" />}
        </div>

        <div className="flex gap-4">
          {[
            { key: 'is_kosher', label: t('menuManage.kosher') },
            { key: 'is_spicy', label: t('menuManage.spicy') },
            { key: 'is_vegetarian', label: t('menuManage.vegetarian') },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={(form as any)[key]}
                onChange={(e) => update(key, e.target.checked)}
                className="accent-[#c9a84c]"
              />
              {label}
            </label>
          ))}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={() => navigate('/admin/menu')}
            className="flex-1 py-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.name_he}
            className="flex-1 py-2 bg-[#c9a84c] text-black rounded-lg font-medium hover:bg-[#d4b96a] disabled:opacity-50 transition-colors"
          >
            {saving ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
