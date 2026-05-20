import { useEffect, useRef } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const NOTIFICATION_MESSAGES: Record<string, { he: string; en: string; th: string }> = {
  preparing: {
    he: 'במטבח כבר מכינים את ההזמנה שלך 👨‍🍳',
    en: 'Your order is being prepared in the kitchen 👨‍🍳',
    th: 'ออเดอร์ของคุณกำลังเตรียมในครัว 👨‍🍳',
  },
  served: {
    he: 'בתיאבון! 🍽️',
    en: 'Bon appétit! 🍽️',
    th: 'ทานให้อร่อย! 🍽️',
  },
  paid: {
    he: 'תודה שסעדתם אצלנו! נשמח לביקורת ⭐',
    en: 'Thank you for dining with us! We\'d love a review ⭐',
    th: 'ขอบคุณที่มาทานกับเรา! รีวิวให้เราด้วยนะ ⭐',
  },
}

const GOOGLE_REVIEW_URL = 'https://search.google.com/local/writereview?placeid=ChIJExample'

function getStoredOrderId(): string | null {
  return sessionStorage.getItem('jasmine-active-order')
}

export function setActiveOrder(orderId: string) {
  sessionStorage.setItem('jasmine-active-order', orderId)
}

function clearActiveOrder() {
  sessionStorage.removeItem('jasmine-active-order')
}

function getLang(): string {
  const stored = localStorage.getItem('i18nextLng')
  if (stored === 'he' || stored === 'en' || stored === 'th') return stored
  return 'he'
}

async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

function showNotification(status: string) {
  const lang = getLang()
  const msg = NOTIFICATION_MESSAGES[status]
  if (!msg) return

  const langKey = lang as keyof typeof msg
  const body = msg[langKey] || msg.he

  if (Notification.permission === 'granted') {
    const n = new Notification('יסמין | Jasmine', {
      body,
      icon: '/jasmine-pattaya/icon-192.png',
      tag: `order-${status}`,
      requireInteraction: status === 'paid',
    })

    if (status === 'paid') {
      n.onclick = () => {
        window.open(GOOGLE_REVIEW_URL, '_blank')
        n.close()
      }
    }
  }
}

export function useOrderNotifications() {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    const orderId = getStoredOrderId()
    if (!orderId) return

    requestNotificationPermission()

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const newStatus = payload.new?.status
          if (newStatus && NOTIFICATION_MESSAGES[newStatus]) {
            showNotification(newStatus)
          }
          if (newStatus === 'paid') {
            clearActiveOrder()
            channel.unsubscribe()
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [])
}
