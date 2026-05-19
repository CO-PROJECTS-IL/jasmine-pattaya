import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured, callEdgeFunction } from '../../lib/supabase'
import { getNextFriday } from '../../lib/timezone'
import { useToast } from '../../hooks/useToast'
import Toast from '../../components/ui/Toast'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function FridayDinner() {
  const { t } = useTranslation()
  const { toast, showToast } = useToast()
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
      showToast('שגיאה בשליחת ההזמנה', 'error')
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="text-4xl mb-4">🕯️</div>
        <h2 className="text-2xl mb-2" style={{ color: 'var(--gold)' }}>{t('friday.bookingConfirmed')}</h2>
        <p style={{ color: 'var(--text-muted)' }}>{t('friday.guestName')}: {name}</p>
        <p style={{ color: 'var(--text-muted)' }}>{t('friday.numGuests')}: {guests}</p>
      </div>
    )
  }

  if (cancelled) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="text-4xl mb-4">🕯️</div>
        <h2 className="text-xl" style={{ color: 'var(--text-muted)' }}>{t('friday.cancelled')}</h2>
      </div>
    )
  }

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>

  if (menuItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="text-4xl mb-4">🕯️</div>
        <h2 className="text-xl" style={{ color: 'var(--text-muted)' }}>{t('friday.noMenu')}</h2>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      <h1 className="text-2xl mb-6 text-center" style={{ color: 'var(--gold)' }}>{t('friday.bookTitle')}</h1>

      <div className="space-y-3 mb-6">
        <input
          type="text"
          placeholder={t('friday.guestName')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl placeholder-gray-500"
          style={{ backgroundColor: 'var(--dark-lighter)', border: '1px solid oklch(0.30 0.005 85)', color: 'var(--text-primary)' }}
        />
        <input
          type="tel"
          placeholder={t('friday.guestPhone')}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-3 rounded-xl placeholder-gray-500"
          style={{ backgroundColor: 'var(--dark-lighter)', border: '1px solid oklch(0.30 0.005 85)', color: 'var(--text-primary)' }}
        />
        <div className="flex items-center gap-3">
          <label className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('friday.numGuests')}</label>
          <div className="flex items-center gap-2">
            <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-11 h-11 rounded-lg bg-white/10 active:scale-95 transition-all" style={{ color: 'var(--text-primary)' }} aria-label={`${t('friday.numGuests')} -1`}>-</button>
            <span className="w-8 text-center" style={{ color: 'var(--text-primary)' }}>{guests}</span>
            <button onClick={() => setGuests(guests + 1)} className="w-11 h-11 rounded-lg bg-white/10 active:scale-95 transition-all" style={{ color: 'var(--text-primary)' }} aria-label={`${t('friday.numGuests')} +1`}>+</button>
          </div>
        </div>
      </div>

      <h2 className="text-lg mb-3" style={{ color: 'var(--gold)' }}>{t('friday.selectDishes')}</h2>
      <div className="space-y-2 mb-6">
        {menuItems.map((item: any) => (
          <div key={item.id} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--dark-light)', border: '1px solid oklch(0.25 0.005 85)' }}>
            <div>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{item.dish?.name_he || item.dish?.name_en}</p>
              <p className="text-sm" style={{ color: 'var(--gold)' }}>{item.friday_price}฿</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.id, -1)}
                className="w-11 h-11 rounded-lg bg-white/10 text-sm active:scale-95 transition-all"
                style={{ color: 'var(--text-primary)' }}
                aria-label={t('cart.removeItem')}
              >-</button>
              <span className="w-6 text-center text-sm" style={{ color: 'var(--text-primary)' }}>{selectedItems[item.id] || 0}</span>
              <button
                onClick={() => updateQuantity(item.id, 1)}
                className="w-11 h-11 rounded-lg text-sm active:scale-95 transition-all"
                style={{ backgroundColor: 'oklch(0.75 0.12 85 / 0.2)', color: 'var(--gold)' }}
                aria-label={`${t('cart.quantity')} +1`}
              >+</button>
            </div>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div className="text-center mb-4">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('friday.totalPrice')}</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>{total}฿</p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting || !name || !phone || Object.keys(selectedItems).length === 0}
        className="w-full py-3 rounded-xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        style={{ backgroundColor: 'var(--gold)', color: 'var(--dark)' }}
      >
        {submitting ? t('common.loading') : t('friday.submitBooking')}
      </button>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
