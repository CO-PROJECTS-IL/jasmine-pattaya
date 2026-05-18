import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase, callEdgeFunction, isSupabaseConfigured } from '../../lib/supabase'
import { uploadImage } from '../../lib/cloudinary'
import type { Employee } from '../../lib/types'
import { EMPLOYEE_ROLES } from '../../lib/constants'

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isNew = id === 'new'
  const [saving, setSaving] = useState(false)
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    role: 'waiter',
    photo_url: '',
    pay_type: 'daily',
    pay_rate: 0,
    start_date: new Date().toISOString().split('T')[0],
    notes: '',
    vacation_days: 0,
    is_active: true,
  })

  useEffect(() => {
    const load = async () => {
      if (!isNew && id && isSupabaseConfigured) {
        const { data } = await supabase.from('employees').select('*').eq('id', id).single()
        if (data) {
          setEmployee(data)
          setForm({
            full_name: data.full_name || '',
            phone: data.phone || '',
            role: data.role || 'waiter',
            photo_url: data.photo_url || '',
            pay_type: data.pay_type || 'daily',
            pay_rate: data.pay_rate || 0,
            start_date: data.start_date || new Date().toISOString().split('T')[0],
            notes: data.notes || '',
            vacation_days: data.vacation_days || 0,
            is_active: data.is_active ?? true,
          })
        }
      }
    }
    load()
  }, [id, isNew])

  const update = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }))

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await uploadImage(file)
      update('photo_url', url)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await callEdgeFunction('admin-employees', {
        action: isNew ? 'create' : 'update',
        id: employee?.id,
        data: form,
      })
      navigate('/admin/employees')
    } catch (err) {
      console.error(err)
    }
    setSaving(false)
  }

  const handleManualCheckin = async () => {
    if (!employee) return
    try {
      await callEdgeFunction('manual-checkin', { employee_id: employee.id })
      alert(t('employees.manualCheckin') + ' ✓')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl text-[#c9a84c] mb-6">
        {isNew ? t('employees.addEmployee') : t('employees.editEmployee')}
      </h2>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#c9a84c]/20 flex items-center justify-center overflow-hidden">
            {form.photo_url ? (
              <img src={form.photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#c9a84c] text-2xl font-bold">{form.full_name.charAt(0) || '?'}</span>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="text-xs text-gray-400" />
        </div>

        <div>
          <label className="text-xs text-gray-400">{t('employees.fullName')}</label>
          <input type="text" value={form.full_name} onChange={(e) => update('full_name', e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:border-[#c9a84c] focus:outline-none" />
        </div>

        <div>
          <label className="text-xs text-gray-400">{t('employees.phone')}</label>
          <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:border-[#c9a84c] focus:outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400">{t('employees.role')}</label>
            <select value={form.role} onChange={(e) => update('role', e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:border-[#c9a84c] focus:outline-none">
              {EMPLOYEE_ROLES.map((r) => <option key={r} value={r}>{t(`employees.${r}` as any)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400">{t('employees.payType')}</label>
            <select value={form.pay_type} onChange={(e) => update('pay_type', e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:border-[#c9a84c] focus:outline-none">
              <option value="hourly">{t('employees.hourly')}</option>
              <option value="daily">{t('employees.daily')}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400">{t('employees.payRate')}</label>
            <input type="number" value={form.pay_rate} onChange={(e) => update('pay_rate', parseFloat(e.target.value) || 0)}
              className="w-full mt-1 px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:border-[#c9a84c] focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-gray-400">{t('employees.startDate')}</label>
            <input type="date" value={form.start_date} onChange={(e) => update('start_date', e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:border-[#c9a84c] focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400">{t('employees.vacationDays')}</label>
          <input type="number" value={form.vacation_days} onChange={(e) => update('vacation_days', parseInt(e.target.value) || 0)}
            className="w-full mt-1 px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:border-[#c9a84c] focus:outline-none" />
        </div>

        <div>
          <label className="text-xs text-gray-400">Notes</label>
          <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={2}
            className="w-full mt-1 px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:border-[#c9a84c] focus:outline-none resize-none" />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" checked={form.is_active} onChange={(e) => update('is_active', e.target.checked)} className="accent-[#c9a84c]" />
          {t('employees.active')}
        </label>

        {!isNew && (
          <button onClick={handleManualCheckin} className="w-full py-2 bg-blue-500/10 text-blue-400 rounded-lg text-sm hover:bg-blue-500/20">
            {t('employees.manualCheckin')}
          </button>
        )}

        <div className="flex gap-3 pt-4">
          <button onClick={() => navigate('/admin/employees')} className="flex-1 py-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10">{t('common.cancel')}</button>
          <button onClick={handleSave} disabled={saving || !form.full_name}
            className="flex-1 py-2 bg-[#c9a84c] text-black rounded-lg font-medium hover:bg-[#d4b96a] disabled:opacity-50">
            {saving ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
