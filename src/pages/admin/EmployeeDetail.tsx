import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase, callEdgeFunction, isSupabaseConfigured } from '../../lib/supabase'
import { uploadImage } from '../../lib/cloudinary'
import { useToast } from '../../hooks/useToast'
import Toast from '../../components/ui/Toast'
import type { Employee } from '../../lib/types'
import { EMPLOYEE_ROLES } from '../../lib/constants'

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { toast, showToast } = useToast()
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
      showToast('שגיאה בהעלאת תמונה', 'error')
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
      showToast('שגיאה בשמירה', 'error')
    }
    setSaving(false)
  }

  const handleManualCheckin = async () => {
    if (!employee) return
    try {
      await callEdgeFunction('manual-checkin', { employee_id: employee.id })
      alert(t('employees.manualCheckin') + ' ✓')
    } catch (err) {
      showToast('שגיאה בצ׳ק-אין', 'error')
    }
  }

  const inputStyle = {
    backgroundColor: 'var(--dark-lighter)',
    border: '1px solid oklch(0.30 0.005 85)',
    color: 'var(--text-primary)',
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl mb-6" style={{ color: 'var(--gold)' }}>
        {isNew ? t('employees.addEmployee') : t('employees.editEmployee')}
      </h2>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'oklch(0.75 0.12 85 / 0.2)' }}>
            {form.photo_url ? (
              <img src={form.photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>{form.full_name.charAt(0) || '?'}</span>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="text-xs" style={{ color: 'var(--text-muted)' }} />
        </div>

        <div>
          <label htmlFor="input-full-name" className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('employees.fullName')}</label>
          <input id="input-full-name" type="text" value={form.full_name} onChange={(e) => update('full_name', e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
            style={inputStyle} />
        </div>

        <div>
          <label htmlFor="input-phone" className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('employees.phone')}</label>
          <input id="input-phone" type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
            style={inputStyle} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="select-role" className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('employees.role')}</label>
            <select id="select-role" value={form.role} onChange={(e) => update('role', e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
              style={inputStyle}>
              {EMPLOYEE_ROLES.map((r) => <option key={r} value={r}>{t(`employees.${r}` as any)}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="select-pay-type" className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('employees.payType')}</label>
            <select id="select-pay-type" value={form.pay_type} onChange={(e) => update('pay_type', e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
              style={inputStyle}>
              <option value="hourly">{t('employees.hourly')}</option>
              <option value="daily">{t('employees.daily')}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="input-pay-rate" className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('employees.payRate')}</label>
            <input id="input-pay-rate" type="number" value={form.pay_rate} onChange={(e) => update('pay_rate', parseFloat(e.target.value) || 0)}
              className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
              style={inputStyle} />
          </div>
          <div>
            <label htmlFor="input-start-date" className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('employees.startDate')}</label>
            <input id="input-start-date" type="date" value={form.start_date} onChange={(e) => update('start_date', e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
              style={inputStyle} />
          </div>
        </div>

        <div>
          <label htmlFor="input-vacation-days" className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('employees.vacationDays')}</label>
          <input id="input-vacation-days" type="number" value={form.vacation_days} onChange={(e) => update('vacation_days', parseInt(e.target.value) || 0)}
            className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
            style={inputStyle} />
        </div>

        <div>
          <label htmlFor="input-notes" className="text-xs" style={{ color: 'var(--text-muted)' }}>Notes</label>
          <textarea id="input-notes" value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={2}
            className="w-full mt-1 px-3 py-2 rounded-lg text-sm resize-none"
            style={inputStyle} />
        </div>

        <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={form.is_active} onChange={(e) => update('is_active', e.target.checked)} style={{ accentColor: 'var(--gold)' }} />
          {t('employees.active')}
        </label>

        {!isNew && (
          <button onClick={handleManualCheckin} className="w-full py-2 bg-blue-500/10 text-blue-400 rounded-lg text-sm hover:bg-blue-500/20">
            {t('employees.manualCheckin')}
          </button>
        )}

        <div className="flex gap-3 pt-4">
          <button onClick={() => navigate('/admin/employees')} className="flex-1 py-2 bg-white/5 rounded-lg hover:bg-white/10" style={{ color: 'var(--text-muted)' }}>{t('common.cancel')}</button>
          <button onClick={handleSave} disabled={saving || !form.full_name}
            className="flex-1 py-2 rounded-lg font-medium disabled:opacity-50"
            style={{ backgroundColor: 'var(--gold)', color: 'var(--dark)' }}>
            {saving ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
