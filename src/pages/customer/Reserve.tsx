import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const TIME_SLOTS = [
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30',
]

const GUEST_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20]

export default function Reserve() {
  const { t } = useTranslation()
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [guests, setGuests] = useState(2)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const message = encodeURIComponent(
      `הזמנת שולחן - יסמין\n` +
      `שם: ${name}\n` +
      `תאריך: ${date}\n` +
      `שעה: ${time}\n` +
      `סועדים: ${guests}\n` +
      `טלפון: ${phone}`
    )
    window.open(`https://wa.me/66650799098?text=${message}`, '_blank')
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ backgroundColor: 'oklch(0.55 0.15 145 / 0.15)' }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="oklch(0.65 0.15 145)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--gold)' }}>{t('reserve.success')}</h2>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>{t('reserve.successMsg')}</p>
        <button
          onClick={() => {
            setSubmitted(false)
            setDate('')
            setTime('')
            setName('')
            setPhone('')
          }}
          className="px-8 py-3 rounded-2xl font-semibold transition-all active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, oklch(0.72 0.12 85), oklch(0.78 0.10 85))',
            color: 'oklch(0.15 0.01 85)',
          }}
        >
          {t('reserve.newReservation')}
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--gold)' }}>
        {t('reserve.title')}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            {t('reserve.date')}
          </label>
          <input
            type="date"
            required
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl text-sm focus:outline-none transition-all"
            style={{
              backgroundColor: 'oklch(0.18 0.005 85)',
              border: '1px solid oklch(0.28 0.005 85)',
              color: 'var(--text-primary)',
              colorScheme: 'dark',
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            {t('reserve.time')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setTime(slot)}
                className="py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95"
                style={
                  time === slot
                    ? {
                        background: 'linear-gradient(135deg, oklch(0.72 0.12 85), oklch(0.78 0.10 85))',
                        color: 'oklch(0.15 0.01 85)',
                      }
                    : {
                        backgroundColor: 'oklch(0.18 0.005 85)',
                        border: '1px solid oklch(0.28 0.005 85)',
                        color: 'var(--text-secondary)',
                      }
                }
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            {t('reserve.guests')}
          </label>
          <div className="flex flex-wrap gap-2">
            {GUEST_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setGuests(n)}
                className="w-12 h-12 rounded-xl text-sm font-semibold transition-all active:scale-95"
                style={
                  guests === n
                    ? {
                        background: 'linear-gradient(135deg, oklch(0.72 0.12 85), oklch(0.78 0.10 85))',
                        color: 'oklch(0.15 0.01 85)',
                      }
                    : {
                        backgroundColor: 'oklch(0.18 0.005 85)',
                        border: '1px solid oklch(0.28 0.005 85)',
                        color: 'var(--text-secondary)',
                      }
                }
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            {t('reserve.name')}
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl text-sm focus:outline-none transition-all"
            style={{
              backgroundColor: 'oklch(0.18 0.005 85)',
              border: '1px solid oklch(0.28 0.005 85)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            {t('reserve.phone')}
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl text-sm focus:outline-none transition-all"
            style={{
              backgroundColor: 'oklch(0.18 0.005 85)',
              border: '1px solid oklch(0.28 0.005 85)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={!date || !time || !name || !phone}
          className="w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, oklch(0.72 0.12 85), oklch(0.78 0.10 85))',
            color: 'oklch(0.15 0.01 85)',
          }}
        >
          {t('reserve.submit')}
        </button>
      </form>
    </div>
  )
}
