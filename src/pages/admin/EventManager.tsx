import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Event } from '../../lib/constants'

const MOCK_EVENTS: Event[] = [
  {
    id: 'evt-1',
    titleHe: 'ערב יום העצמאות',
    titleEn: 'Independence Day Eve',
    titleTh: 'วันประกาศอิสรภาพ',
    descriptionHe: 'חגיגה ישראלית עם אוכל, מוזיקה ושמחה',
    descriptionEn: 'Israeli celebration with food, music and joy',
    descriptionTh: 'เทศกาลอิสราเอลกับอาหาร ดนตรี และความสุข',
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
    descriptionHe: 'ארוחת שישי עם תפריט מיוחד ויין',
    descriptionEn: 'Friday dinner with special menu and wine',
    descriptionTh: 'อาหารค่ำวันศุกร์กับเมนูพิเศษและไวน์',
    date: '2026-05-30',
    time: '18:30',
    pricePerPerson: 350,
    maxGuests: 40,
    imageUrl: null,
    active: true,
  },
]

export default function EventManager() {
  const { t, i18n } = useTranslation()
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  const getName = (e: Event) =>
    i18n.language === 'he' ? e.titleHe : i18n.language === 'th' ? e.titleTh : e.titleEn

  const getDesc = (e: Event) =>
    i18n.language === 'he' ? e.descriptionHe : i18n.language === 'th' ? e.descriptionTh : e.descriptionEn

  const toggleActive = (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, active: !e.active } : e))
    )
  }

  const deleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl text-[#c9a84c] font-bold">{t('admin.events')}</h1>
        <button
          onClick={() => {
            setEditingEvent(null)
            setShowForm(true)
          }}
          className="bg-[#c9a84c] text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#d4b96a] transition-colors"
        >
          + {t('events.title')}
        </button>
      </div>

      {events.length === 0 ? (
        <div className="text-center text-gray-500 py-12">{t('events.noEvents')}</div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className={`bg-[#1a1a1a] rounded-xl border p-4 ${
                event.active ? 'border-white/5' : 'border-white/5 opacity-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-white font-bold text-lg">{getName(event)}</h3>
                  <p className="text-gray-400 text-sm mt-1">{getDesc(event)}</p>
                </div>
                <button
                  onClick={() => toggleActive(event.id)}
                  className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${
                    event.active ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      event.active ? 'start-5' : 'start-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex flex-wrap gap-4 text-sm mb-3">
                <span className="text-gray-400">
                  {t('events.date')}: <span className="text-white">{event.date}</span>
                </span>
                <span className="text-gray-400">
                  {t('events.time')}: <span className="text-white">{event.time}</span>
                </span>
                <span className="text-gray-400">
                  {t('events.pricePerPerson')}: <span className="text-[#c9a84c]">฿{event.pricePerPerson}</span>
                </span>
                <span className="text-gray-400">
                  {t('events.guests')}: <span className="text-white">0/{event.maxGuests}</span>
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingEvent(event)
                    setShowForm(true)
                  }}
                  className="text-sm text-[#c9a84c] hover:text-[#d4b96a]"
                >
                  {t('menuManage.editDish')}
                </button>
                <button
                  onClick={() => deleteEvent(event.id)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] rounded-2xl border border-white/10 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl text-[#c9a84c] font-bold mb-4">
              {editingEvent ? t('menuManage.editDish') : t('events.title')}
            </h2>
            <div className="space-y-3">
              <input
                defaultValue={editingEvent?.titleHe ?? ''}
                placeholder="שם האירוע (עברית)"
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]"
              />
              <input
                defaultValue={editingEvent?.titleEn ?? ''}
                placeholder="Event title (English)"
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]"
              />
              <textarea
                defaultValue={editingEvent?.descriptionHe ?? ''}
                placeholder="תיאור (עברית)"
                rows={2}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c] resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  defaultValue={editingEvent?.date ?? ''}
                  className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]"
                />
                <input
                  type="time"
                  defaultValue={editingEvent?.time ?? ''}
                  className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">{t('events.pricePerPerson')} (฿)</label>
                  <input
                    type="number"
                    defaultValue={editingEvent?.pricePerPerson ?? 0}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">{t('events.guests')}</label>
                  <input
                    type="number"
                    defaultValue={editingEvent?.maxGuests ?? 40}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="bg-[#c9a84c] text-black px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#d4b96a] transition-colors"
              >
                {t('common.save')}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white text-sm"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
