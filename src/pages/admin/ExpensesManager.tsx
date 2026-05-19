import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import type { ExpenseRecurring, ExpenseOnetime, ExpenseFrequency } from '../../lib/types'
import { EXPENSE_CATEGORIES } from '../../lib/constants'

type Tab = 'recurring' | 'onetime'

const FREQUENCIES: ExpenseFrequency[] = ['daily', 'weekly', 'monthly', 'yearly']

const inputClass =
  'w-full rounded-lg px-3 py-2 text-sm'
const inputStyle = {
  backgroundColor: 'var(--dark-light)',
  border: '1px solid oklch(0.75 0.12 85 / 0.3)',
  color: 'var(--text-primary)',
}
const labelClass = 'block text-xs mb-1'
const labelStyle = { color: 'var(--text-muted)' }

/* ─── Recurring form state ─────────────────────────────── */
interface RecurringForm {
  name: string
  amount: string
  frequency: ExpenseFrequency
  category: string
  start_date: string
}

const emptyRecurring = (): RecurringForm => ({
  name: '',
  amount: '',
  frequency: 'monthly',
  category: EXPENSE_CATEGORIES[0],
  start_date: new Date().toISOString().slice(0, 10),
})

/* ─── One-time form state ──────────────────────────────── */
interface OnetimeForm {
  name: string
  amount: string
  date: string
  category: string
}

const emptyOnetime = (): OnetimeForm => ({
  name: '',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  category: EXPENSE_CATEGORIES[0],
})

export default function ExpensesManager() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('recurring')

  /* ── recurring state ── */
  const [recurring, setRecurring] = useState<ExpenseRecurring[]>([])
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [editingRecurring, setEditingRecurring] = useState<ExpenseRecurring | null>(null)
  const [recurringForm, setRecurringForm] = useState<RecurringForm>(emptyRecurring())

  /* ── onetime state ── */
  const [onetime, setOnetime] = useState<ExpenseOnetime[]>([])
  const [showOnetimeModal, setShowOnetimeModal] = useState(false)
  const [onetimeForm, setOnetimeForm] = useState<OnetimeForm>(emptyOnetime())

  /* ── shared ── */
  const [saving, setSaving] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  /* ── fetch on mount ── */
  useEffect(() => {
    async function fetchAll() {
      try {
        const [{ data: rec }, { data: one }] = await Promise.all([
          supabase.functions.invoke('admin-expenses', { body: { type: 'recurring', action: 'list' } }),
          supabase.functions.invoke('admin-expenses', { body: { type: 'onetime', action: 'list' } }),
        ])
        if (rec) setRecurring(rec)
        if (one) setOnetime(one)
      } catch {
        // edge function not yet deployed — start with empty lists
      }
    }
    fetchAll()
  }, [])

  /* ════════════════════════════════════════════════
     RECURRING CRUD
  ════════════════════════════════════════════════ */
  function openAddRecurring() {
    setEditingRecurring(null)
    setRecurringForm(emptyRecurring())
    setShowRecurringModal(true)
  }

  function openEditRecurring(exp: ExpenseRecurring) {
    setEditingRecurring(exp)
    setRecurringForm({
      name: exp.name,
      amount: String(exp.amount),
      frequency: exp.frequency,
      category: '',
      start_date: exp.start_date,
    })
    setShowRecurringModal(true)
  }

  async function saveRecurring() {
    const payload = {
      ...recurringForm,
      amount: parseFloat(recurringForm.amount) || 0,
    }
    setSaving(true)
    try {
      if (editingRecurring) {
        const { data } = await supabase.functions.invoke('admin-expenses', {
          body: { type: 'recurring', action: 'update', id: editingRecurring.id, ...payload },
        })
        if (data) {
          setRecurring((prev) => prev.map((r) => (r.id === editingRecurring.id ? data : r)))
        } else {
          // optimistic
          setRecurring((prev) =>
            prev.map((r) =>
              r.id === editingRecurring.id ? { ...r, ...payload } : r
            )
          )
        }
      } else {
        const { data } = await supabase.functions.invoke('admin-expenses', {
          body: { type: 'recurring', action: 'create', ...payload },
        })
        if (data) {
          setRecurring((prev) => [...prev, data])
        } else {
          // optimistic with temp id
          setRecurring((prev) => [
            ...prev,
            { id: `tmp-${Date.now()}`, is_active: true, ...payload } as ExpenseRecurring,
          ])
        }
      }
    } catch {
      // optimistic already done above if needed
    } finally {
      setSaving(false)
      setShowRecurringModal(false)
    }
  }

  async function toggleRecurring(exp: ExpenseRecurring) {
    const next = { ...exp, is_active: !exp.is_active }
    setRecurring((prev) => prev.map((r) => (r.id === exp.id ? next : r)))
    try {
      await supabase.functions.invoke('admin-expenses', {
        body: { type: 'recurring', action: 'update', id: exp.id, is_active: next.is_active },
      })
    } catch {
      // revert on failure
      setRecurring((prev) => prev.map((r) => (r.id === exp.id ? exp : r)))
    }
  }

  async function deleteRecurring(id: string) {
    setRecurring((prev) => prev.filter((r) => r.id !== id))
    setDeleteConfirmId(null)
    try {
      await supabase.functions.invoke('admin-expenses', {
        body: { type: 'recurring', action: 'delete', id },
      })
    } catch {
      // silently fail — already removed from UI
    }
  }

  /* ════════════════════════════════════════════════
     ONE-TIME CRUD
  ════════════════════════════════════════════════ */
  function openAddOnetime() {
    setOnetimeForm(emptyOnetime())
    setShowOnetimeModal(true)
  }

  async function saveOnetime() {
    const payload = {
      ...onetimeForm,
      amount: parseFloat(onetimeForm.amount) || 0,
    }
    setSaving(true)
    try {
      const { data } = await supabase.functions.invoke('admin-expenses', {
        body: { type: 'onetime', action: 'create', ...payload },
      })
      if (data) {
        setOnetime((prev) => [...prev, data])
      } else {
        setOnetime((prev) => [
          ...prev,
          { id: `tmp-${Date.now()}`, notes: '', ...payload } as ExpenseOnetime,
        ])
      }
    } catch {
      setOnetime((prev) => [
        ...prev,
        { id: `tmp-${Date.now()}`, notes: '', ...payload } as ExpenseOnetime,
      ])
    } finally {
      setSaving(false)
      setShowOnetimeModal(false)
    }
  }

  async function deleteOnetime(id: string) {
    setOnetime((prev) => prev.filter((o) => o.id !== id))
    setDeleteConfirmId(null)
    try {
      await supabase.functions.invoke('admin-expenses', {
        body: { type: 'onetime', action: 'delete', id },
      })
    } catch {
      // silently fail
    }
  }

  /* ════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════ */
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl" style={{ color: 'var(--gold)' }}>{t('expenses.title')}</h1>
        <button
          onClick={tab === 'recurring' ? openAddRecurring : openAddOnetime}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ backgroundColor: 'var(--gold)', color: 'var(--dark)' }}
        >
          + {t('expenses.add')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex mb-5" style={{ borderBottom: '1px solid oklch(0.30 0.005 85)' }}>
        {(['recurring', 'onetime'] as Tab[]).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="px-5 py-2 text-sm font-medium transition-colors"
            style={
              tab === key
                ? { color: 'var(--gold)', borderBottom: '2px solid var(--gold)' }
                : { color: 'var(--text-muted)' }
            }
          >
            {t(`expenses.${key}`)}
          </button>
        ))}
      </div>

      {/* ── Recurring tab ── */}
      {tab === 'recurring' && (
        <>
          {recurring.length === 0 ? (
            <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>{t('expenses.noRecurring')}</p>
          ) : (
            <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid oklch(0.75 0.12 85 / 0.2)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: 'var(--dark-light)' }}>
                    <th className="text-start px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{t('expenses.name')}</th>
                    <th className="text-start px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{t('expenses.amount')}</th>
                    <th className="text-start px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{t('expenses.frequency')}</th>
                    <th className="text-start px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{t('expenses.startDate')}</th>
                    <th className="text-center px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{t('expenses.active')}</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {recurring.map((exp) => (
                    <tr
                      key={exp.id}
                      className="hover:bg-white/5 transition-colors"
                      style={{ borderTop: '1px solid oklch(0.25 0.005 85)' }}
                    >
                      <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{exp.name}</td>
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--gold)' }}>
                        ฿{exp.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{t(`expenses.freq_${exp.frequency}`) || exp.frequency}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{exp.start_date}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleRecurring(exp)}
                          className={`w-10 h-5 rounded-full transition-colors relative inline-flex flex-shrink-0 ${
                            exp.is_active ? 'bg-green-500' : 'bg-gray-600'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                              exp.is_active ? 'translate-x-5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-3 justify-end">
                          <button
                            onClick={() => openEditRecurring(exp)}
                            className="text-xs"
                            style={{ color: 'var(--gold)' }}
                          >
                            {t('expenses.edit')}
                          </button>
                          {deleteConfirmId === exp.id ? (
                            <span className="flex gap-2 items-center">
                              <button
                                onClick={() => deleteRecurring(exp.id)}
                                className="text-red-400 hover:text-red-300 text-xs font-medium"
                              >
                                {t('expenses.confirmDelete')}
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="hover:text-gray-300 text-xs"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                ✕
                              </button>
                            </span>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(exp.id)}
                              className="text-red-500 hover:text-red-400 text-xs"
                            >
                              {t('expenses.delete')}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── One-time tab ── */}
      {tab === 'onetime' && (
        <>
          {onetime.length === 0 ? (
            <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>{t('expenses.noOnetime')}</p>
          ) : (
            <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid oklch(0.75 0.12 85 / 0.2)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: 'var(--dark-light)' }}>
                    <th className="text-start px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{t('expenses.name')}</th>
                    <th className="text-start px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{t('expenses.amount')}</th>
                    <th className="text-start px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{t('expenses.date')}</th>
                    <th className="text-start px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{t('expenses.category')}</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {onetime.map((exp) => (
                    <tr
                      key={exp.id}
                      className="hover:bg-white/5 transition-colors"
                      style={{ borderTop: '1px solid oklch(0.25 0.005 85)' }}
                    >
                      <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{exp.name}</td>
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--gold)' }}>
                        ฿{exp.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{exp.date}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{exp.category}</td>
                      <td className="px-4 py-3 text-end">
                        {deleteConfirmId === exp.id ? (
                          <span className="flex gap-2 items-center justify-end">
                            <button
                              onClick={() => deleteOnetime(exp.id)}
                              className="text-red-400 hover:text-red-300 text-xs font-medium"
                            >
                              {t('expenses.confirmDelete')}
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="hover:text-gray-300 text-xs"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              ✕
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(exp.id)}
                            className="text-red-500 hover:text-red-400 text-xs"
                          >
                            {t('expenses.delete')}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════
          RECURRING MODAL
      ══════════════════════════════════════════════ */}
      {showRecurringModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--dark-lighter)', border: '1px solid oklch(0.75 0.12 85 / 0.2)' }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--gold)' }}>
              {editingRecurring ? t('expenses.edit') : t('expenses.add')} — {t('expenses.recurring')}
            </h2>

            <div className="space-y-3">
              <div>
                <label htmlFor="input-recurring-name" className={labelClass} style={labelStyle}>{t('expenses.name')}</label>
                <input
                  id="input-recurring-name"
                  value={recurringForm.name}
                  onChange={(e) => setRecurringForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="input-recurring-amount" className={labelClass} style={labelStyle}>{t('expenses.amount')} (฿)</label>
                <input
                  id="input-recurring-amount"
                  type="number"
                  min="0"
                  value={recurringForm.amount}
                  onChange={(e) => setRecurringForm((f) => ({ ...f, amount: e.target.value }))}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="select-recurring-frequency" className={labelClass} style={labelStyle}>{t('expenses.frequency')}</label>
                <select
                  id="select-recurring-frequency"
                  value={recurringForm.frequency}
                  onChange={(e) =>
                    setRecurringForm((f) => ({ ...f, frequency: e.target.value as ExpenseFrequency }))
                  }
                  className={inputClass}
                  style={inputStyle}
                >
                  {FREQUENCIES.map((freq) => (
                    <option key={freq} value={freq}>
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="select-recurring-category" className={labelClass} style={labelStyle}>{t('expenses.category')}</label>
                <select
                  id="select-recurring-category"
                  value={recurringForm.category}
                  onChange={(e) => setRecurringForm((f) => ({ ...f, category: e.target.value }))}
                  className={inputClass}
                  style={inputStyle}
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="input-recurring-start-date" className={labelClass} style={labelStyle}>{t('expenses.startDate')}</label>
                <input
                  id="input-recurring-start-date"
                  type="date"
                  value={recurringForm.start_date}
                  onChange={(e) => setRecurringForm((f) => ({ ...f, start_date: e.target.value }))}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveRecurring}
                disabled={saving || !recurringForm.name}
                className="px-6 py-2 rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'var(--gold)', color: 'var(--dark)' }}
              >
                {saving ? '...' : t('expenses.add')}
              </button>
              <button
                onClick={() => setShowRecurringModal(false)}
                className="text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          ONE-TIME MODAL
      ══════════════════════════════════════════════ */}
      {showOnetimeModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--dark-lighter)', border: '1px solid oklch(0.75 0.12 85 / 0.2)' }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--gold)' }}>
              {t('expenses.add')} — {t('expenses.onetime')}
            </h2>

            <div className="space-y-3">
              <div>
                <label htmlFor="input-onetime-name" className={labelClass} style={labelStyle}>{t('expenses.name')}</label>
                <input
                  id="input-onetime-name"
                  value={onetimeForm.name}
                  onChange={(e) => setOnetimeForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="input-onetime-amount" className={labelClass} style={labelStyle}>{t('expenses.amount')} (฿)</label>
                <input
                  id="input-onetime-amount"
                  type="number"
                  min="0"
                  value={onetimeForm.amount}
                  onChange={(e) => setOnetimeForm((f) => ({ ...f, amount: e.target.value }))}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="input-onetime-date" className={labelClass} style={labelStyle}>{t('expenses.date')}</label>
                <input
                  id="input-onetime-date"
                  type="date"
                  value={onetimeForm.date}
                  onChange={(e) => setOnetimeForm((f) => ({ ...f, date: e.target.value }))}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="select-onetime-category" className={labelClass} style={labelStyle}>{t('expenses.category')}</label>
                <select
                  id="select-onetime-category"
                  value={onetimeForm.category}
                  onChange={(e) => setOnetimeForm((f) => ({ ...f, category: e.target.value }))}
                  className={inputClass}
                  style={inputStyle}
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveOnetime}
                disabled={saving || !onetimeForm.name}
                className="px-6 py-2 rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'var(--gold)', color: 'var(--dark)' }}
              >
                {saving ? '...' : t('expenses.add')}
              </button>
              <button
                onClick={() => setShowOnetimeModal(false)}
                className="text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
