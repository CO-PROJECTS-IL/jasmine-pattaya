import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/layout/AdminLayout'
import type { ExpenseRecurring, ExpenseOnetime, ExpenseFrequency } from '../../lib/types'
import { EXPENSE_CATEGORIES } from '../../lib/constants'

type Tab = 'recurring' | 'onetime'

const FREQUENCIES: ExpenseFrequency[] = ['daily', 'weekly', 'monthly', 'yearly']

const inputClass =
  'w-full bg-[#121212] border border-[#c9a84c]/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]'
const labelClass = 'block text-xs text-gray-500 mb-1'

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
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl text-[#c9a84c]">{t('expenses.title')}</h1>
        <button
          onClick={tab === 'recurring' ? openAddRecurring : openAddOnetime}
          className="px-4 py-2 bg-[#c9a84c] text-black rounded-lg text-sm font-medium hover:bg-[#d4b96a] transition-colors"
        >
          + {t('expenses.add')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-5">
        {(['recurring', 'onetime'] as Tab[]).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2 text-sm font-medium transition-colors ${
              tab === key
                ? 'text-[#c9a84c] border-b-2 border-[#c9a84c]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t(`expenses.${key}`)}
          </button>
        ))}
      </div>

      {/* ── Recurring tab ── */}
      {tab === 'recurring' && (
        <>
          {recurring.length === 0 ? (
            <p className="text-center text-gray-500 py-12">{t('expenses.noRecurring')}</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#c9a84c]/20">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#121212] text-gray-400 text-xs">
                    <th className="text-start px-4 py-3">{t('expenses.name')}</th>
                    <th className="text-start px-4 py-3">{t('expenses.amount')}</th>
                    <th className="text-start px-4 py-3">{t('expenses.frequency')}</th>
                    <th className="text-start px-4 py-3">{t('expenses.startDate')}</th>
                    <th className="text-center px-4 py-3">{t('expenses.active')}</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {recurring.map((exp) => (
                    <tr
                      key={exp.id}
                      className="border-t border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3 text-white">{exp.name}</td>
                      <td className="px-4 py-3 text-[#c9a84c] font-medium">
                        ฿{exp.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-300">{t(`expenses.freq_${exp.frequency}`) || exp.frequency}</td>
                      <td className="px-4 py-3 text-gray-400">{exp.start_date}</td>
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
                            className="text-[#c9a84c] hover:text-[#d4b96a] text-xs"
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
                                className="text-gray-500 hover:text-gray-300 text-xs"
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
            <p className="text-center text-gray-500 py-12">{t('expenses.noOnetime')}</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#c9a84c]/20">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#121212] text-gray-400 text-xs">
                    <th className="text-start px-4 py-3">{t('expenses.name')}</th>
                    <th className="text-start px-4 py-3">{t('expenses.amount')}</th>
                    <th className="text-start px-4 py-3">{t('expenses.date')}</th>
                    <th className="text-start px-4 py-3">{t('expenses.category')}</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {onetime.map((exp) => (
                    <tr
                      key={exp.id}
                      className="border-t border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3 text-white">{exp.name}</td>
                      <td className="px-4 py-3 text-[#c9a84c] font-medium">
                        ฿{exp.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-400">{exp.date}</td>
                      <td className="px-4 py-3 text-gray-300">{exp.category}</td>
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
                              className="text-gray-500 hover:text-gray-300 text-xs"
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
          <div className="bg-[#1a1a1a] border border-[#c9a84c]/20 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg text-[#c9a84c] font-bold mb-4">
              {editingRecurring ? t('expenses.edit') : t('expenses.add')} — {t('expenses.recurring')}
            </h2>

            <div className="space-y-3">
              <div>
                <label className={labelClass}>{t('expenses.name')}</label>
                <input
                  value={recurringForm.name}
                  onChange={(e) => setRecurringForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>{t('expenses.amount')} (฿)</label>
                <input
                  type="number"
                  min="0"
                  value={recurringForm.amount}
                  onChange={(e) => setRecurringForm((f) => ({ ...f, amount: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>{t('expenses.frequency')}</label>
                <select
                  value={recurringForm.frequency}
                  onChange={(e) =>
                    setRecurringForm((f) => ({ ...f, frequency: e.target.value as ExpenseFrequency }))
                  }
                  className={inputClass}
                >
                  {FREQUENCIES.map((freq) => (
                    <option key={freq} value={freq}>
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>{t('expenses.category')}</label>
                <select
                  value={recurringForm.category}
                  onChange={(e) => setRecurringForm((f) => ({ ...f, category: e.target.value }))}
                  className={inputClass}
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>{t('expenses.startDate')}</label>
                <input
                  type="date"
                  value={recurringForm.start_date}
                  onChange={(e) => setRecurringForm((f) => ({ ...f, start_date: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveRecurring}
                disabled={saving || !recurringForm.name}
                className="bg-[#c9a84c] text-black px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#d4b96a] transition-colors disabled:opacity-50"
              >
                {saving ? '...' : t('expenses.add')}
              </button>
              <button
                onClick={() => setShowRecurringModal(false)}
                className="text-gray-400 hover:text-white text-sm"
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
          <div className="bg-[#1a1a1a] border border-[#c9a84c]/20 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg text-[#c9a84c] font-bold mb-4">
              {t('expenses.add')} — {t('expenses.onetime')}
            </h2>

            <div className="space-y-3">
              <div>
                <label className={labelClass}>{t('expenses.name')}</label>
                <input
                  value={onetimeForm.name}
                  onChange={(e) => setOnetimeForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>{t('expenses.amount')} (฿)</label>
                <input
                  type="number"
                  min="0"
                  value={onetimeForm.amount}
                  onChange={(e) => setOnetimeForm((f) => ({ ...f, amount: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>{t('expenses.date')}</label>
                <input
                  type="date"
                  value={onetimeForm.date}
                  onChange={(e) => setOnetimeForm((f) => ({ ...f, date: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>{t('expenses.category')}</label>
                <select
                  value={onetimeForm.category}
                  onChange={(e) => setOnetimeForm((f) => ({ ...f, category: e.target.value }))}
                  className={inputClass}
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
                className="bg-[#c9a84c] text-black px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#d4b96a] transition-colors disabled:opacity-50"
              >
                {saving ? '...' : t('expenses.add')}
              </button>
              <button
                onClick={() => setShowOnetimeModal(false)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
