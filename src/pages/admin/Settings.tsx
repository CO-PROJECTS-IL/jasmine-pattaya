import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const DAYS_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface DayHours {
  open: string
  close: string
  closed: boolean
}

const DEFAULT_HOURS: DayHours[] = [
  { open: '11:00', close: '23:00', closed: false },
  { open: '11:00', close: '23:00', closed: false },
  { open: '11:00', close: '23:00', closed: false },
  { open: '11:00', close: '23:00', closed: false },
  { open: '11:00', close: '23:00', closed: false },
  { open: '11:00', close: '00:00', closed: false },
  { open: '11:00', close: '23:00', closed: false },
]

export default function Settings() {
  const { t, i18n } = useTranslation()
  const [hours, setHours] = useState<DayHours[]>(DEFAULT_HOURS)
  const [adminPin, setAdminPin] = useState('')
  const [kitchenPin, setKitchenPin] = useState('')
  const [clubDiscount, setClubDiscount] = useState(10)
  const [saved, setSaved] = useState(false)

  const days = i18n.language === 'he' ? DAYS_HE : DAYS_EN

  const updateHours = (index: number, field: keyof DayHours, value: string | boolean) => {
    setHours((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <h1 className="text-2xl text-[#c9a84c] font-bold mb-6">{t('admin.settings')}</h1>

      <div className="max-w-2xl space-y-6">
        <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-4">
          <h2 className="text-sm text-gray-400 font-medium uppercase mb-4">{t('settings.openingHours')}</h2>
          <div className="space-y-2">
            {days.map((day, i) => (
              <div key={day} className="flex items-center gap-3">
                <span className="text-white text-sm w-16 flex-shrink-0">{day}</span>
                <label className="flex items-center gap-1.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={hours[i].closed}
                    onChange={(e) => updateHours(i, 'closed', e.target.checked)}
                    className="w-3.5 h-3.5 accent-red-500"
                  />
                  <span className="text-xs text-gray-500">סגור</span>
                </label>
                {!hours[i].closed && (
                  <>
                    <input
                      type="time"
                      value={hours[i].open}
                      onChange={(e) => updateHours(i, 'open', e.target.value)}
                      className="bg-[#121212] border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-[#c9a84c] w-28"
                    />
                    <span className="text-gray-500">—</span>
                    <input
                      type="time"
                      value={hours[i].close}
                      onChange={(e) => updateHours(i, 'close', e.target.value)}
                      className="bg-[#121212] border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-[#c9a84c] w-28"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-4">
          <h2 className="text-sm text-gray-400 font-medium uppercase mb-4">קודי גישה</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{t('settings.adminPin')}</label>
              <input
                type="password"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="••••"
                maxLength={4}
                className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-white text-sm text-center tracking-[0.5em] focus:outline-none focus:border-[#c9a84c]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{t('settings.kitchenPin')}</label>
              <input
                type="password"
                value={kitchenPin}
                onChange={(e) => setKitchenPin(e.target.value)}
                placeholder="••••"
                maxLength={4}
                className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-white text-sm text-center tracking-[0.5em] focus:outline-none focus:border-[#c9a84c]"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-4">
          <h2 className="text-sm text-gray-400 font-medium uppercase mb-4">{t('loyalty.title')}</h2>
          <div className="flex items-center gap-3">
            <label className="text-sm text-white">{t('settings.clubDiscount')}</label>
            <input
              type="number"
              value={clubDiscount}
              onChange={(e) => setClubDiscount(Number(e.target.value))}
              min={0}
              max={50}
              className="w-20 bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-white text-sm text-center focus:outline-none focus:border-[#c9a84c]"
            />
            <span className="text-gray-400 text-sm">%</span>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="bg-[#c9a84c] text-black px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-[#d4b96a] transition-colors"
        >
          {saved ? t('settings.saved') : t('settings.save')}
        </button>
      </div>
    </div>
  )
}
