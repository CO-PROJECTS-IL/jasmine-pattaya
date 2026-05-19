import { useState, useEffect, useCallback } from 'react'
import { flushQueue } from '../lib/offline-queue'
import { callEdgeFunction } from '../lib/supabase'

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  const flush = useCallback(async () => {
    if (!navigator.onLine) return 0
    return flushQueue(async (order) => {
      await callEdgeFunction('submit-order', order)
    })
  }, [])

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      flush()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [flush])

  return { isOnline, flush }
}
