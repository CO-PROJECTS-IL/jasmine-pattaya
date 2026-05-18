import { useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Order } from '../lib/types'

async function fetchTodayOrders(): Promise<Order[]> {
  if (!isSupabaseConfigured) return []
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .gte('created_at', `${today}T00:00:00`)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export function useRealtimeOrders() {
  const queryClient = useQueryClient()
  const audioRef = useRef<AudioContext | null>(null)

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders-today'],
    queryFn: fetchTodayOrders,
    refetchInterval: 30000,
  })

  useEffect(() => {
    if (!isSupabaseConfigured) return

    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['orders-today'] })
          playNotificationSound()
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [queryClient])

  function playNotificationSound() {
    try {
      if (!audioRef.current) {
        audioRef.current = new AudioContext()
      }
      const ctx = audioRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 800
      gain.gain.value = 0.3
      osc.start()
      osc.stop(ctx.currentTime + 0.2)
    } catch {}
  }

  const getOrdersByStatus = (status: string) =>
    orders.filter((o) => o.status === status)

  return { orders, isLoading, getOrdersByStatus }
}
