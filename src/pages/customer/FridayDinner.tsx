import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured, callEdgeFunction } from '../../lib/supabase'
import { getNextFriday } from '../../lib/timezone'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function FridayDinner() {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [guests, setGuests] = useState(2)
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const nextFriday = getNextFriday()
  const fridayDateStr = nextFriday.toISOString().split('T')[0]

  const { data: cancelled } = useQuery({
    queryKey: ['friday-cancelled', fridayDateStr],
    queryFn: async () => {
      if (!isSupabaseConfigured) return false
      const { data } = await supabase
        .from('friday_cancelled_dates')
        .select('id')
        .eq('friday_date', fridayDateStr)
        .maybeSingle()
      return !!data
    },
  })

  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ['friday-menu-items'],
    queryFn: async () => {
      if (!isSupabaseConfigured) return []
      const { data, error } = await supabase
        .from('friday_menu')
        .select('*, dish:dishes(*)')
        .eq('is_active', true)
        .order('sort_order')
      if (error) throw error
      return data
    },
  })

  const updateQuantity = (menuId: string, delta: number) => {
    setSelectedItems((prev) => {
      const current = prev[menuId] || 0
      const next = Math.max(0, current + delta)
      if (next === 0) {
        const { [menuId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [menuId]: next }
    })
  }

  const total = menuItems.reduce((sum: number, item: any) => {
    const qty = selectedItems[item.id] || 0
    return sum + item.friday_price * qty
  }, 0)

  const handleSubmit = async () => {
    if (!name || !phone || Object.keys(selectedItems).length === 0) return
    setSubmitting(true)
    try {
      await callEdgeFunction('submit-friday-booking', {
        guest_name: name,
        guest_phone: phone,
        num_guests: guests,
        friday_date: fridayDateStr,
        items: Object.entries(selectedItems).map(([menuId, qty]) => ({
          friday_menu_id: menuId,
          quantity: qty,
        })),
      })
      setSubmitted(true)
    } catch (err) {
      console.error(err)
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="text-4xl mb-4">🕯️</div>
        <h2 className="text-2xl text-[#c9a84c] mb-2">{t('friday.bookingConfirmed')}</h2>
        <p className="text-gray-400">{t('friday.guestName')}: {name}</p>
        <p className="text-gray-400">{t('friday.numGuests')}: {guests}</p>
      </div>
    )
  }

  if (cancelled) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="text-4xl mb-4">🕯️</div>
        <h2 className="text-xl text-gray-400">{t('friday.cancelled')}</h2>
      </div>
    )
  }

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>

  if (menuItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="text-4xl mb-4">🕯️</div>
        <h2 className="text-xl text-gray-400">{t('friday.noMenu')}</h2>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      <h1 className="text-2xl text-[#c9a84c] mb-6 text-center">{t('friday.bookTitle')}</h1>

      <div className="space-y-3 mb-6">
        <input
          type="text"
          placeholder={t('friday.guestName')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#c9a84c] focus:outline-none"
        />
        <input
          type="tel"
          placeholder={t('friday.guestPhone')}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#c9a84c] focus:outline-none"
        />
        <div className="flex items-center gap-3">
          <label className="text-gray-400 text-sm">{t('friday.numGuests')}</label>
          <div className="flex items-center gap-2">
            <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-8 h-8 rounded-lg bg-white/10 text-white">-</button>
            <span className="text-white w-8 text-center">{guests}</span>
            <button onClick={() => setGuests(guests + 1)} className="w-8 h-8 rounded-lg bg-white/10 text-white">+</button>
          </div>
        </div>
      </div>

      <h2 className="text-lg text-[#c9a84c] mb-3">{t('friday.selectDishes')}</h2>
      <div className="space-y-2 mb-6">
        {menuItems.map((item: any) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-[#121212] border border-white/5 rounded-xl">
            <div>
              <p className="text-white text-sm">{item.dish?.name_he || item.dish?.name_en}</p>
              <p className="text-[#c9a84c] text-sm">{item.friday_price}฿</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.id, -1)}
                className="w-8 h-8 rounded-lg bg-white/10 text-white text-sm"
              >-</button>
              <span className="text-white w-6 text-center text-sm">{selectedItems[item.id] || 0}</span>
              <button
                onClick={() => updateQuantity(item.id, 1)}
                className="w-8 h-8 rounded-lg bg-[#c9a84c]/20 text-[#c9a84c] text-sm"
              >+</button>
            </div>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div className="text-center mb-4">
          <p className="text-gray-400 text-sm">{t('friday.totalPrice')}</p>
          <p className="text-2xl text-[#c9a84c] font-bold">{total}฿</p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting || !name || !phone || Object.keys(selectedItems).length === 0}
        className="w-full py-3 bg-[#c9a84c] text-[#080808] rounded-xl text-lg font-semibold hover:bg-[#d4b96a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? t('common.loading') : t('friday.submitBooking')}
      </button>
    </div>
  )
}
