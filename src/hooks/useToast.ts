import { useState, useCallback } from 'react'

interface Toast {
  message: string
  type: 'success' | 'error'
}

export function useToast(duration = 3000) {
  const [toast, setToast] = useState<Toast | null>(null)

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' = 'error') => {
      setToast({ message, type })
      setTimeout(() => setToast(null), duration)
    },
    [duration]
  )

  return { toast, showToast }
}
