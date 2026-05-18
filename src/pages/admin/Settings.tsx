import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../../hooks/useSettings'
import { supabase } from '../../lib/supabase'
import { getCurrentPosition } from '../../lib/geo'

// Inline SVG icons (no external dependency needed)
function IconEye() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}
function IconEyeOff() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}
function IconMapPin() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  )
}
function IconQrCode() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
      <rect x="14" y="14" width="3" height="3"/>
    </svg>
  )
}

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-[#c9a84c]' : 'bg-[#4a4a4a]'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#121212] rounded-xl p-5 border border-[#c9a84c]/10">
      <h2 className="text-[#c9a84c] text-lg font-semibold pb-3 mb-4 border-b border-[#c9a84c]/15">
        {title}
      </h2>
      {children}
    </div>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────
const inputCls =
  'bg-[#1a1a1a] border border-[#c9a84c]/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c9a84c] transition-colors'

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl font-semibold text-sm shadow-lg transition-all ${
        type === 'success'
          ? 'bg-green-700 text-white'
          : 'bg-red-700 text-white'
      }`}
    >
      {message}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Settings() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: settings } = useSettings()

  // PINs
  const [adminPin, setAdminPin] = useState('')
  const [employeePin, setEmployeePin] = useState('')
  const [showAdminPin, setShowAdminPin] = useState(false)
  const [showEmployeePin, setShowEmployeePin] = useState(false)

  // Location
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [radius, setRadius] = useState(50)
  const [locating, setLocating] = useState(false)

  // Tables
  const [tableCount, setTableCount] = useState(30)

  // Opening hours: Record<dayKey, { open, close }>
  const [openingHours, setOpeningHours] = useState<Record<string, { open: string; close: string }>>(
    Object.fromEntries(DAY_KEYS.map((d) => [d, { open: '11:00', close: '23:00' }]))
  )

  // Shifts
  const [morningStart, setMorningStart] = useState('10:00')
  const [morningEnd, setMorningEnd] = useState('16:00')
  const [eveningStart, setEveningStart] = useState('17:00')
  const [eveningEnd, setEveningEnd] = useState('23:00')

  // Friday
  const [fridayEnabled, setFridayEnabled] = useState(true)
  const [fridaySwitchTime, setFridaySwitchTime] = useState('14:00')
  const [fridayMaxGuests, setFridayMaxGuests] = useState<number>(50)

  // Employee settings
  const [showSalary, setShowSalary] = useState(true)

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [saving, setSaving] = useState(false)

  // ── Hydrate from settings ──────────────────────────────────────────────────
  useEffect(() => {
    if (!settings) return

    setAdminPin(settings.admin_pin_hash ?? '')
    setEmployeePin(settings.employee_pin_hash ?? '')
    setLat(settings.restaurant_lat)
    setLng(settings.restaurant_lng)
    setRadius(settings.restaurant_radius ?? 50)
    setTableCount(settings.table_count ?? 30)

    if (settings.opening_hours && Object.keys(settings.opening_hours).length > 0) {
      setOpeningHours(settings.opening_hours as Record<string, { open: string; close: string }>)
    }

    const sh = settings.shift_hours as Record<string, { start: string; end: string }> | undefined
    if (sh?.morning) {
      setMorningStart(sh.morning.start)
      setMorningEnd(sh.morning.end)
    }
    if (sh?.evening) {
      setEveningStart(sh.evening.start)
      setEveningEnd(sh.evening.end)
    }

    setFridayEnabled(settings.friday_enabled ?? true)
    setFridaySwitchTime(settings.friday_switch_time ?? '14:00')
    setFridayMaxGuests(settings.friday_max_guests ?? 50)
    setShowSalary(settings.show_employee_salary ?? true)
  }, [settings])

  // ── Helpers ────────────────────────────────────────────────────────────────
  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleSetLocation() {
    setLocating(true)
    try {
      const pos = await getCurrentPosition()
      setLat(pos.coords.latitude)
      setLng(pos.coords.longitude)
    } catch {
      showToast('Could not get location', 'error')
    } finally {
      setLocating(false)
    }
  }

  function updateOpeningHour(day: string, field: 'open' | 'close', value: string) {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const body = {
        admin_pin_hash: adminPin,
        employee_pin_hash: employeePin,
        restaurant_lat: lat,
        restaurant_lng: lng,
        restaurant_radius: radius,
        table_count: tableCount,
        opening_hours: openingHours,
        shift_hours: {
          morning: { start: morningStart, end: morningEnd },
          evening: { start: eveningStart, end: eveningEnd },
        },
        friday_enabled: fridayEnabled,
        friday_switch_time: fridaySwitchTime,
        friday_max_guests: fridayMaxGuests,
        show_employee_salary: showSalary,
      }

      const { error } = await supabase.functions.invoke('admin-settings', { body })
      if (error) throw error
      showToast(t('settings.saved'), 'success')
    } catch (err) {
      console.error(err)
      showToast(t('settings.error'), 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto pb-10">
      <h1 className="text-2xl text-[#c9a84c] font-bold mb-6">{t('settings.title')}</h1>

      <div className="space-y-4">

        {/* ── PINs ── */}
        <Section title={t('settings.pins')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Admin PIN */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">{t('settings.adminPin')}</label>
              <div className="relative">
                <input
                  type={showAdminPin ? 'text' : 'password'}
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  maxLength={4}
                  className={`${inputCls} w-full text-center tracking-[0.5em] pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPin((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#c9a84c]"
                >
                  {showAdminPin ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            {/* Employee PIN */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">{t('settings.employeePin')}</label>
              <div className="relative">
                <input
                  type={showEmployeePin ? 'text' : 'password'}
                  value={employeePin}
                  onChange={(e) => setEmployeePin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  maxLength={4}
                  className={`${inputCls} w-full text-center tracking-[0.5em] pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowEmployeePin((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#c9a84c]"
                >
                  {showEmployeePin ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>
          </div>
        </Section>

        {/* ── Location ── */}
        <Section title={t('settings.location')}>
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleSetLocation}
              disabled={locating}
              className="flex items-center gap-2 bg-[#1a1a1a] border border-[#c9a84c]/30 rounded-lg px-4 py-2 text-[#c9a84c] text-sm font-medium hover:border-[#c9a84c] transition-colors disabled:opacity-50"
            >
              <IconMapPin />
              {locating ? '…' : t('settings.setLocation')}
            </button>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500 block mb-1">{t('settings.latitude')}</span>
                <span className="text-white font-mono">
                  {lat !== null ? lat.toFixed(6) : '—'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">{t('settings.longitude')}</span>
                <span className="text-white font-mono">
                  {lng !== null ? lng.toFixed(6) : '—'}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                {t('settings.radius')} (m)
              </label>
              <input
                type="number"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                min={10}
                max={500}
                className={`${inputCls} w-32`}
              />
            </div>
          </div>
        </Section>

        {/* ── Tables ── */}
        <Section title={t('settings.tables')}>
          <div className="flex flex-wrap items-end gap-6">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">{t('settings.tableCount')}</label>
              <input
                type="number"
                value={tableCount}
                onChange={(e) => setTableCount(Number(e.target.value))}
                min={1}
                max={100}
                className={`${inputCls} w-24`}
              />
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/qr-codes')}
              className="flex items-center gap-2 text-sm text-[#c9a84c] border border-[#c9a84c]/30 rounded-lg px-4 py-2 hover:border-[#c9a84c] transition-colors"
            >
              <IconQrCode />
              {t('settings.generateQR')}
            </button>
          </div>
        </Section>

        {/* ── Opening Hours ── */}
        <Section title={t('settings.openingHours')}>
          <div className="space-y-2">
            {DAY_KEYS.map((day) => (
              <div key={day} className="flex items-center gap-3 flex-wrap">
                <span className="text-white text-sm w-24 flex-shrink-0">
                  {t(`settings.days.${day}`)}
                </span>
                <input
                  type="time"
                  value={openingHours[day]?.open ?? '11:00'}
                  onChange={(e) => updateOpeningHour(day, 'open', e.target.value)}
                  className={`${inputCls} w-32 text-sm`}
                />
                <span className="text-gray-500">—</span>
                <input
                  type="time"
                  value={openingHours[day]?.close ?? '23:00'}
                  onChange={(e) => updateOpeningHour(day, 'close', e.target.value)}
                  className={`${inputCls} w-32 text-sm`}
                />
              </div>
            ))}
          </div>
        </Section>

        {/* ── Shifts ── */}
        <Section title={t('settings.shifts')}>
          <div className="space-y-4">
            {/* Morning */}
            <div>
              <p className="text-sm text-gray-400 mb-2">{t('settings.morningShift')}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">{t('settings.start')}</label>
                  <input
                    type="time"
                    value={morningStart}
                    onChange={(e) => setMorningStart(e.target.value)}
                    className={`${inputCls} w-32 text-sm`}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">{t('settings.end')}</label>
                  <input
                    type="time"
                    value={morningEnd}
                    onChange={(e) => setMorningEnd(e.target.value)}
                    className={`${inputCls} w-32 text-sm`}
                  />
                </div>
              </div>
            </div>

            {/* Evening */}
            <div>
              <p className="text-sm text-gray-400 mb-2">{t('settings.eveningShift')}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">{t('settings.start')}</label>
                  <input
                    type="time"
                    value={eveningStart}
                    onChange={(e) => setEveningStart(e.target.value)}
                    className={`${inputCls} w-32 text-sm`}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">{t('settings.end')}</label>
                  <input
                    type="time"
                    value={eveningEnd}
                    onChange={(e) => setEveningEnd(e.target.value)}
                    className={`${inputCls} w-32 text-sm`}
                  />
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ── Friday Settings ── */}
        <Section title={t('settings.friday')}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">{t('settings.fridayEnabled')}</span>
              <Toggle checked={fridayEnabled} onChange={setFridayEnabled} />
            </div>

            <div className="flex items-end gap-6 flex-wrap">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">{t('settings.switchTime')}</label>
                <input
                  type="time"
                  value={fridaySwitchTime}
                  onChange={(e) => setFridaySwitchTime(e.target.value)}
                  disabled={!fridayEnabled}
                  className={`${inputCls} w-32 text-sm disabled:opacity-40`}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">{t('settings.maxGuests')}</label>
                <input
                  type="number"
                  value={fridayMaxGuests}
                  onChange={(e) => setFridayMaxGuests(Number(e.target.value))}
                  min={0}
                  disabled={!fridayEnabled}
                  className={`${inputCls} w-24 text-sm disabled:opacity-40`}
                />
              </div>
            </div>
          </div>
        </Section>

        {/* ── Employee Settings ── */}
        <Section title={t('settings.employeeSettings')}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white">{t('settings.showSalary')}</span>
            <Toggle checked={showSalary} onChange={setShowSalary} />
          </div>
        </Section>

        {/* ── Save Button ── */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#c9a84c] text-[#080808] rounded-xl py-3 font-semibold text-base hover:bg-[#d4b96a] transition-colors disabled:opacity-60"
        >
          {saving ? '…' : t('settings.save')}
        </button>
      </div>

      {/* ── Toast ── */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
