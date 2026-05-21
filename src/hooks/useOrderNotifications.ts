import { useEffect, useRef, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const NOTIFICATION_MESSAGES: Record<string, { he: string; en: string; th: string }> = {
  preparing: {
    he: 'במטבח כבר מכינים את ההזמנה שלך 👨‍🍳',
    en: 'Your order is being prepared in the kitchen 👨‍🍳',
    th: 'ออเดอร์ของคุณกำลังเตรียมในครัว 👨‍🍳',
  },
  served: {
    he: 'ההזמנה שלך מוכנה! בתיאבון 🍽️',
    en: 'Your order is ready! Bon appétit 🍽️',
    th: 'ออเดอร์พร้อมแล้ว! ทานให้อร่อย 🍽️',
  },
  paid: {
    he: 'תודה שסעדתם אצלנו! נשמח לביקורת ⭐',
    en: 'Thank you for dining with us! We\'d love a review ⭐',
    th: 'ขอบคุณที่มาทานกับเรา! รีวิวให้เราด้วยนะ ⭐',
  },
}

const GOOGLE_REVIEW_URL = 'https://search.google.com/local/writereview?placeid=ChIJ88nAUgmWAjER09Qwva2f6Sg'

// Use a simple event target to notify the hook when the order ID changes
const orderEvents = new EventTarget()

export function setActiveOrder(orderId: string) {
  sessionStorage.setItem('jasmine-active-order', orderId)
  orderEvents.dispatchEvent(new CustomEvent('order-change', { detail: orderId }))
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

function subscribeToOrder(orderId: string) {
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

  return channel
}

export function useOrderNotifications() {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const startListening = useCallback((orderId: string) => {
    // Clean up previous subscription
    if (channelRef.current) {
      channelRef.current.unsubscribe()
      channelRef.current = null
    }

    requestNotificationPermission()
    channelRef.current = subscribeToOrder(orderId)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return

    // Check if there's already an active order at mount time
    const existingOrderId = sessionStorage.getItem('jasmine-active-order')
    if (existingOrderId) {
      startListening(existingOrderId)
    }

    // Listen for new orders set via setActiveOrder()
    const handleOrderChange = (e: Event) => {
      const orderId = (e as CustomEvent).detail
      if (orderId) {
        startListening(orderId)
      }
    }

    orderEvents.addEventListener('order-change', handleOrderChange)

    return () => {
      orderEvents.removeEventListener('order-change', handleOrderChange)
      if (channelRef.current) {
        channelRef.current.unsubscribe()
      }
    }
  }, [startListening])
}
