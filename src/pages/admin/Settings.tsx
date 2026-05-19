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
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
      style={{ backgroundColor: checked ? 'var(--gold)' : '#4a4a4a' }}
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
    <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--dark-light)', border: '1px solid oklch(0.75 0.14 60 / 0.1)' }}>
      <h2 className="text-lg font-semibold pb-3 mb-4" style={{ color: 'var(--gold)', borderBottom: '1px solid oklch(0.75 0.14 60 / 0.15)' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────
const inputCls =
  'rounded-lg px-3 py-2 transition-colors'
const inputStyle = {
  backgroundColor: 'var(--dark-lighter)',
  border: '1px solid oklch(0.75 0.14 60 / 0.3)',
  color: 'var(--text-primary)',
}

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

  // Loyalty
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(false)

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
    setLoyaltyEnabled(settings.loyalty_enabled ?? false)
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
        loyalty_enabled: loyaltyEnabled,
      }

      const { error } = await supabase.functions.invoke('admin-settings', { body })
      if (error) throw error
      showToast(t('settings.saved'), 'success')
    } catch (err) {
      showToast(t('settings.error'), 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto pb-10">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--gold)' }}>{t('settings.title')}</h1>

      <div className="space-y-4">

        {/* ── PINs ── */}
        <Section title={t('settings.pins')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Admin PIN */}
            <div>
              <label htmlFor="input-admin-pin" className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>{t('settings.adminPin')}</label>
              <div className="relative">
                <input
                  id="input-admin-pin"
                  type={showAdminPin ? 'text' : 'password'}
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  maxLength={4}
                  className={`${inputCls} w-full text-center tracking-[0.5em] pr-10`}
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPin((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showAdminPin ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            {/* Employee PIN */}
            <div>
              <label htmlFor="input-employee-pin" className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>{t('settings.employeePin')}</label>
              <div className="relative">
                <input
                  id="input-employee-pin"
                  type={showEmployeePin ? 'text' : 'password'}
                  value={employeePin}
                  onChange={(e) => setEmployeePin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  maxLength={4}
                  className={`${inputCls} w-full text-center tracking-[0.5em] pr-10`}
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowEmployeePin((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
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
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: 'var(--dark-lighter)', border: '1px solid oklch(0.75 0.14 60 / 0.3)', color: 'var(--gold)' }}
            >
              <IconMapPin />
              {locating ? '…' : t('settings.setLocation')}
            </button>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="block mb-1" style={{ color: 'var(--text-muted)' }}>{t('settings.latitude')}</span>
                <span className="font-mono" style={{ color: 'var(--text-primary)' }}>
                  {lat !== null ? lat.toFixed(6) : '—'}
                </span>
              </div>
              <div>
                <span className="block mb-1" style={{ color: 'var(--text-muted)' }}>{t('settings.longitude')}</span>
                <span className="font-mono" style={{ color: 'var(--text-primary)' }}>
                  {lng !== null ? lng.toFixed(6) : '—'}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="input-radius" className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>
                {t('settings.radius')} (m)
              </label>
              <input
                id="input-radius"
                type="number"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                min={10}
                max={500}
                className={`${inputCls} w-32`}
                style={inputStyle}
              />
            </div>
          </div>
        </Section>

        {/* ── Tables ── */}
        <Section title={t('settings.tables')}>
          <div className="flex flex-wrap items-end gap-6">
            <div>
              <label htmlFor="input-table-count" className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>{t('settings.tableCount')}</label>
              <input
                id="input-table-count"
                type="number"
                value={tableCount}
                onChange={(e) => setTableCount(Number(e.target.value))}
                min={1}
                max={100}
                className={`${inputCls} w-24`}
                style={inputStyle}
              />
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/qr-codes')}
              className="flex items-center gap-2 text-sm rounded-lg px-4 py-2 transition-colors"
              style={{ color: 'var(--gold)', border: '1px solid oklch(0.75 0.14 60 / 0.3)' }}
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
                <span className="text-sm w-24 flex-shrink-0" style={{ color: 'var(--text-primary)' }}>
                  {t(`settings.days.${day}`)}
                </span>
                <input
                  type="time"
                  value={openingHours[day]?.open ?? '11:00'}
                  onChange={(e) => updateOpeningHour(day, 'open', e.target.value)}
                  className={`${inputCls} w-32 text-sm`}
                  style={inputStyle}
                />
                <span style={{ color: 'var(--text-muted)' }}>—</span>
                <input
                  type="time"
                  value={openingHours[day]?.close ?? '23:00'}
                  onChange={(e) => updateOpeningHour(day, 'close', e.target.value)}
                  className={`${inputCls} w-32 text-sm`}
                  style={inputStyle}
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
              <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{t('settings.morningShift')}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <div>
                  <label htmlFor="input-morning-start" className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>{t('settings.start')}</label>
                  <input
                    id="input-morning-start"
                    type="time"
                    value={morningStart}
                    onChange={(e) => setMorningStart(e.target.value)}
                    className={`${inputCls} w-32 text-sm`}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label htmlFor="input-morning-end" className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>{t('settings.end')}</label>
                  <input
                    id="input-morning-end"
                    type="time"
                    value={morningEnd}
                    onChange={(e) => setMorningEnd(e.target.value)}
                    className={`${inputCls} w-32 text-sm`}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Evening */}
            <div>
              <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{t('settings.eveningShift')}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <div>
                  <label htmlFor="input-evening-start" className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>{t('settings.start')}</label>
                  <input
                    id="input-evening-start"
                    type="time"
                    value={eveningStart}
                    onChange={(e) => setEveningStart(e.target.value)}
                    className={`${inputCls} w-32 text-sm`}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label htmlFor="input-evening-end" className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>{t('settings.end')}</label>
                  <input
                    id="input-evening-end"
                    type="time"
                    value={eveningEnd}
                    onChange={(e) => setEveningEnd(e.target.value)}
                    className={`${inputCls} w-32 text-sm`}
                    style={inputStyle}
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
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('settings.fridayEnabled')}</span>
              <Toggle checked={fridayEnabled} onChange={setFridayEnabled} />
            </div>

            <div className="flex items-end gap-6 flex-wrap">
              <div>
                <label htmlFor="input-friday-switch-time" className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>{t('settings.switchTime')}</label>
                <input
                  id="input-friday-switch-time"
                  type="time"
                  value={fridaySwitchTime}
                  onChange={(e) => setFridaySwitchTime(e.target.value)}
                  disabled={!fridayEnabled}
                  className={`${inputCls} w-32 text-sm disabled:opacity-40`}
                  style={inputStyle}
                />
              </div>
              <div>
                <label htmlFor="input-friday-max-guests" className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>{t('settings.maxGuests')}</label>
                <input
                  id="input-friday-max-guests"
                  type="number"
                  value={fridayMaxGuests}
                  onChange={(e) => setFridayMaxGuests(Number(e.target.value))}
                  min={0}
                  disabled={!fridayEnabled}
                  className={`${inputCls} w-24 text-sm disabled:opacity-40`}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        </Section>

        {/* ── Loyalty Club ── */}
        <Section title={t('settings.loyaltyClub')}>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('settings.loyaltyEnabled')}</span>
            <Toggle checked={loyaltyEnabled} onChange={setLoyaltyEnabled} />
          </div>
        </Section>

        {/* ── Employee Settings ── */}
        <Section title={t('settings.employeeSettings')}>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('settings.showSalary')}</span>
            <Toggle checked={showSalary} onChange={setShowSalary} />
          </div>
        </Section>

        {/* ── Save Button ── */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-xl py-3 font-semibold text-base transition-colors disabled:opacity-60"
          style={{ backgroundColor: 'var(--gold)', color: 'var(--dark)' }}
        >
          {saving ? '…' : t('settings.save')}
        </button>
      </div>

      {/* ── Toast ── */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
