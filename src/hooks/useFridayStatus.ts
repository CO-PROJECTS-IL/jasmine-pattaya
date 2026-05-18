import { useMemo } from 'react'
import { useSettings } from './useSettings'
import { isFriday, isPastFridaySwitchTime } from '../lib/timezone'

export function useFridayStatus() {
  const { data: settings } = useSettings()

  return useMemo(() => {
    if (!settings?.friday_enabled) {
      return { isFridayMenuActive: false, isFridayDay: false }
    }
    const fridayDay = isFriday()
    const pastSwitch = isPastFridaySwitchTime(settings.friday_switch_time)
    return {
      isFridayMenuActive: fridayDay && pastSwitch,
      isFridayDay: fridayDay,
    }
  }, [settings])
}
