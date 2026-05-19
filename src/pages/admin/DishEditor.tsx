import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase, callEdgeFunction, isSupabaseConfigured } from '../../lib/supabase'
import { uploadImage } from '../../lib/cloudinary'
import { useToast } from '../../hooks/useToast'
import Toast from '../../components/ui/Toast'
import type { Dish, Category } from '../../lib/types'

export default function DishEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { toast, showToast } = useToast()
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
      showToast(t('menuManage.imageError'), 'error')
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
      showToast(t('menuManage.saveError'), 'error')
    }
    setSaving(false)
  }

  const update = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }))

  const inputStyle = {
    backgroundColor: 'var(--dark-lighter)',
    border: '1px solid oklch(0.30 0.008 60)',
    color: 'var(--text-primary)',
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl mb-6" style={{ color: 'var(--gold)' }}>
        {isNew ? t('menuManage.addDish') : t('menuManage.editDish')}
      </h2>

      <div className="space-y-4">
        {['he', 'en', 'th'].map((lang) => (
          <div key={lang}>
            <label htmlFor={`input-dish-name-${lang}`} className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>{t('menuManage.dishName')} ({lang})</label>
            <input
              id={`input-dish-name-${lang}`}
              type="text"
              value={(form as any)[`name_${lang}`]}
              onChange={(e) => update(`name_${lang}`, e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
              style={inputStyle}
            />
          </div>
        ))}

        {['he', 'en', 'th'].map((lang) => (
          <div key={`desc-${lang}`}>
            <label htmlFor={`input-dish-desc-${lang}`} className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>{t('menuManage.description')} ({lang})</label>
            <textarea
              id={`input-dish-desc-${lang}`}
              value={(form as any)[`description_${lang}`]}
              onChange={(e) => update(`description_${lang}`, e.target.value)}
              rows={2}
              className="w-full mt-1 px-3 py-2 rounded-lg text-sm resize-none"
              style={inputStyle}
            />
          </div>
        ))}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="input-dish-price" className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('menuManage.price')}</label>
            <input
              id="input-dish-price"
              type="number"
              value={form.price}
              onChange={(e) => update('price', parseFloat(e.target.value) || 0)}
              className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="select-dish-category" className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('menuManage.category')}</label>
            <select
              id="select-dish-category"
              value={form.category_id}
              onChange={(e) => update('category_id', e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
              style={inputStyle}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name_he}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="input-dish-image" className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('menuManage.image')}</label>
          <input id="input-dish-image" type="file" accept="image/*" onChange={handleImageUpload} className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }} />
          {form.image_url && <img src={form.image_url} alt="" className="mt-2 w-20 h-20 rounded-lg object-cover" />}
        </div>

        <div className="flex gap-4">
          {[
            { key: 'is_kosher', label: t('menuManage.kosher') },
            { key: 'is_spicy', label: t('menuManage.spicy') },
            { key: 'is_vegetarian', label: t('menuManage.vegetarian') },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={(form as any)[key]}
                onChange={(e) => update(key, e.target.checked)}
                style={{ accentColor: 'var(--gold)' }}
              />
              {label}
            </label>
          ))}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={() => navigate('/admin/menu')}
            className="flex-1 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.name_he}
            className="flex-1 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors"
            style={{ backgroundColor: 'var(--gold)', color: 'var(--dark)' }}
          >
            {saving ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
