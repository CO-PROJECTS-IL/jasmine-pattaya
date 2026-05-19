import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured, callEdgeFunction } from '../../lib/supabase'
import { getNextFriday } from '../../lib/timezone'
import { useToast } from '../../hooks/useToast'
import Toast from '../../components/ui/Toast'

export default function FridayManager() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { toast, showToast } = useToast()
  const nextFriday = getNextFriday()
  const fridayStr = nextFriday.toISOString().split('T')[0]

  const { data: menuItems = [] } = useQuery({
    queryKey: ['friday-menu-admin'],
    queryFn: async () => {
      if (!isSupabaseConfigured) return []
      const { data, error } = await supabase.from('friday_menu').select('*, dish:dishes(*)').order('sort_order')
      if (error) throw error
      return data
    },
  })

  const { data: bookings = [] } = useQuery({
    queryKey: ['friday-bookings', fridayStr],
    queryFn: async () => {
      if (!isSupabaseConfigured) return []
      const { data, error } = await supabase
        .from('friday_bookings')
        .select('*, items:friday_booking_items(*)')
        .eq('friday_date', fridayStr)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })

  const { data: cancelledDates = [] } = useQuery({
    queryKey: ['friday-cancelled'],
    queryFn: async () => {
      if (!isSupabaseConfigured) return []
      const { data, error } = await supabase.from('friday_cancelled_dates').select('*').order('friday_date', { ascending: false })
      if (error) throw error
      return data
    },
  })

  const isCancelled = cancelledDates.some((c: any) => c.friday_date === fridayStr)

  const handleCancelFriday = async () => {
    try {
      await callEdgeFunction('admin-friday', { action: 'cancel_date', friday_date: fridayStr })
      queryClient.invalidateQueries({ queryKey: ['friday-cancelled'] })
    } catch (err) {
      showToast('שגיאה בעדכון', 'error')
    }
  }

  const handleBookingStatus = async (bookingId: string, status: string) => {
    try {
      await callEdgeFunction('admin-bookings', { action: 'update_status', id: bookingId, status })
      queryClient.invalidateQueries({ queryKey: ['friday-bookings'] })
    } catch (err) {
      showToast('שגיאה בעדכון פריט', 'error')
    }
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <h1 className="text-xl mb-6" style={{ color: 'var(--gold)' }}>{t('adminHome.friday')}</h1>

      {/* Cancel Section */}
      <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: 'var(--dark-light)', border: '1px solid oklch(0.25 0.008 60)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('friday.fridayMenu')}: {fridayStr}</p>
            {isCancelled && <p className="text-red-400 text-xs">{t('friday.cancelled')}</p>}
          </div>
          {!isCancelled && (
            <button onClick={handleCancelFriday} className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20">
              {t('common.cancel')}
            </button>
          )}
        </div>
      </div>

      {/* Friday Menu Items */}
      <h2 className="text-lg mb-3" style={{ color: 'var(--gold)' }}>{t('friday.fridayMenu')}</h2>
      <div className="space-y-2 mb-6">
        {menuItems.map((item: any) => (
          <div key={item.id} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--dark-light)', border: '1px solid oklch(0.25 0.008 60)' }}>
            <div>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{item.dish?.name_he || item.dish?.name_en}</p>
              <p className="text-sm" style={{ color: 'var(--gold)' }}>{item.friday_price}฿</p>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] ${item.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {item.is_active ? t('employees.active') : t('employees.inactive')}
            </span>
          </div>
        ))}
        {menuItems.length === 0 && <p className="text-center py-4" style={{ color: 'var(--text-muted)' }}>{t('friday.noMenu')}</p>}
      </div>

      {/* Bookings */}
      <h2 className="text-lg mb-3" style={{ color: 'var(--gold)' }}>{t('friday.bookTitle')}</h2>
      <div className="space-y-2">
        {bookings.map((booking: any) => (
          <div key={booking.id} className="p-4 rounded-xl" style={{ backgroundColor: 'var(--dark-light)', border: '1px solid oklch(0.25 0.008 60)' }}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{booking.guest_name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{booking.guest_phone} • {booking.num_guests} {t('friday.numGuests')}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] ${
                booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400'
                : booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400'
                : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {booking.status}
              </span>
            </div>
            {booking.notes && <p className="text-xs italic mb-2" style={{ color: 'var(--text-muted)' }}>{booking.notes}</p>}
            {booking.status === 'pending' && (
              <div className="flex gap-2">
                <button onClick={() => handleBookingStatus(booking.id, 'confirmed')}
                  className="flex-1 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs hover:bg-green-500/20">
                  {t('common.confirm')}
                </button>
                <button onClick={() => handleBookingStatus(booking.id, 'cancelled')}
                  className="flex-1 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs hover:bg-red-500/20">
                  {t('common.cancel')}
                </button>
              </div>
            )}
          </div>
        ))}
        {bookings.length === 0 && <p className="text-center py-4" style={{ color: 'var(--text-muted)' }}>{t('common.noResults')}</p>}
      </div>
    </>
  )
}
