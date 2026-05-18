import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Event } from '../../lib/constants'

const MOCK_EVENTS: Event[] = [
  {
    id: 'evt-1',
    titleHe: 'ערב יום העצמאות',
    titleEn: 'Independence Day Eve',
    titleTh: 'วันประกาศอิสรภาพ',
    descriptionHe: 'חגיגה ישראלית עם אוכל, מוזיקה ושמחה. תפריט מיוחד כולל שתייה.',
    descriptionEn: 'Israeli celebration with food, music and joy. Special menu including drinks.',
    descriptionTh: 'เทศกาลอิสราเอลกับอาหาร ดนตรี และความสุข เมนูพิเศษรวมเครื่องดื่ม',
    date: '2026-05-25',
    time: '19:00',
    pricePerPerson: 450,
    maxGuests: 60,
    imageUrl: null,
    active: true,
  },
  {
    id: 'evt-2',
    titleHe: 'ערב שישי מיוחד',
    titleEn: 'Special Friday Night',
    titleTh: 'คืนวันศุกร์พิเศษ',
    descriptionHe: 'ארוחת שישי עם תפריט מיוחד ויין. אווירה חמה ומשפחתית.',
    descriptionEn: 'Friday dinner with special menu and wine. Warm family atmosphere.',
    descriptionTh: 'อาหารค่ำวันศุกร์กับเมนูพิเศษและไวน์ บรรยากาศอบอุ่น',
    date: '2026-05-30',
    time: '18:30',
    pricePerPerson: 350,
    maxGuests: 40,
    imageUrl: null,
    active: true,
  },
]

interface BookingForm {
  eventId: string
  name: string
  phone: string
  email: string
  guests: number
  notes: string
}

export default function Events() {
  const { t, i18n } = useTranslation()
  const [bookingFor, setBookingFor] = useState<string | null>(null)
  const [form, setForm] = useState<BookingForm>({ eventId: '', name: '', phone: '', email: '', guests: 2, notes: '' })
  const [booked, setBooked] = useState(false)

  const events = MOCK_EVENTS.filter((e) => e.active)

  const getName = (e: Event) =>
    i18n.language === 'he' ? e.titleHe : i18n.language === 'th' ? e.titleTh : e.titleEn

  const getDesc = (e: Event) =>
    i18n.language === 'he' ? e.descriptionHe : i18n.language === 'th' ? e.descriptionTh : e.descriptionEn

  const handleBook = () => {
    if (!form.name.trim() || !form.phone.trim() || form.guests < 1) return
    setBooked(true)
    setBookingFor(null)
  }

  if (booked) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">✓</span>
        </div>
        <h2 className="text-2xl text-[#c9a84c] font-bold mb-2">{t('events.bookingConfirmed')}</h2>
        <p className="text-gray-400">{form.name} — {form.guests} {t('events.guests')}</p>
        <button
          onClick={() => setBooked(false)}
          className="mt-6 bg-[#1a1a1a] text-[#c9a84c] px-6 py-2 rounded-lg text-sm"
        >
          {t('common.back')}
        </button>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl text-[#c9a84c] font-bold mb-6">{t('events.title')}</h1>

      {events.length === 0 ? (
        <div className="text-center text-gray-500 py-12">{t('events.noEvents')}</div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="bg-[#1a1a1a] rounded-xl border border-white/5 overflow-hidden">
              <div className="bg-gradient-to-l from-[#c9a84c]/10 to-transparent p-4">
                <h3 className="text-xl text-white font-bold mb-1">{getName(event)}</h3>
                <p className="text-gray-400 text-sm">{getDesc(event)}</p>
              </div>
              <div className="px-4 pb-4">
                <div className="flex flex-wrap gap-4 text-sm py-3 border-b border-white/5 mb-3">
                  <span className="text-gray-400">
                    {t('events.date')}: <span className="text-white">{event.date}</span>
                  </span>
                  <span className="text-gray-400">
                    {t('events.time')}: <span className="text-white">{event.time}</span>
                  </span>
                  <span className="text-gray-400">
                    {t('events.pricePerPerson')}: <span className="text-[#c9a84c] font-bold">฿{event.pricePerPerson}</span>
                  </span>
                </div>
                <button
                  onClick={() => {
                    setBookingFor(event.id)
                    setForm({ ...form, eventId: event.id })
                  }}
                  className="w-full bg-[#c9a84c] text-black py-3 rounded-lg font-bold text-sm hover:bg-[#d4b96a] transition-colors"
                >
                  {t('events.bookNow')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {bookingFor && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
          <div className="bg-[#121212] rounded-t-2xl border-t border-white/10 p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg text-[#c9a84c] font-bold">{t('events.book')}</h2>
              <button onClick={() => setBookingFor(null)} className="text-gray-400 hover:text-white">
                {t('common.close')}
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{t('loyalty.name')} *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c9a84c]"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{t('loyalty.phone')} *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  dir="ltr"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c9a84c]"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{t('loyalty.email')}</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  dir="ltr"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c9a84c]"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{t('events.guests')} *</label>
                <input
                  type="number"
                  value={form.guests}
                  onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })}
                  min={1}
                  max={20}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c9a84c]"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{t('cart.notes')}</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c9a84c] resize-none"
                />
              </div>
              <button
                onClick={handleBook}
                disabled={!form.name.trim() || !form.phone.trim() || form.guests < 1}
                className="w-full bg-[#c9a84c] text-black py-3 rounded-lg font-bold text-sm hover:bg-[#d4b96a] transition-colors disabled:opacity-40"
              >
                {t('events.book')} — ฿{(events.find((e) => e.id === bookingFor)?.pricePerPerson ?? 0) * form.guests}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
