import { useState, useCallback } from 'react'
import { isWithinRadius } from '../lib/geo'
import { useSettings } from './useSettings'

interface GeoState {
  checking: boolean
  within: boolean | null
  distance: number | null
  error: string | null
}

export function useGeolocation() {
  const { data: settings } = useSettings()
  const [state, setState] = useState<GeoState>({
    checking: false, within: null, distance: null, error: null,
  })

  const checkLocation = useCallback(async () => {
    if (!settings?.restaurant_lat || !settings?.restaurant_lng) {
      setState({ checking: false, within: true, distance: 0, error: null })
      return true
    }
    setState((s) => ({ ...s, checking: true, error: null }))
    try {
      const result = await isWithinRadius(
        settings.restaurant_lat,
        settings.restaurant_lng,
        settings.restaurant_radius
      )
      setState({
        checking: false,
        within: result.within,
        distance: Math.round(result.distance),
        error: null,
      })
      return result.within
    } catch (err) {
      setState({
        checking: false, within: false, distance: null,
        error: err instanceof Error ? err.message : 'Location error',
      })
      return false
    }
  }, [settings])

  return { ...state, checkLocation }
}
