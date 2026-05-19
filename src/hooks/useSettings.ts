import { useQuery } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Settings } from '../lib/types'

const DEFAULT_SETTINGS: Settings = {
  admin_pin_hash: '1111',
  employee_pin_hash: '0000',
  restaurant_lat: null,
  restaurant_lng: null,
  restaurant_radius: 50,
  table_count: 30,
  opening_hours: {},
  shift_hours: {
    morning: { start: '10:00', end: '16:00' },
    evening: { start: '17:00', end: '23:00' },
  },
  friday_switch_time: '14:00',
  show_employee_salary: true,
  friday_max_guests: null,
  friday_enabled: true,
  loyalty_enabled: false,
}

async function fetchSettings(): Promise<Settings> {
  if (!isSupabaseConfigured) return DEFAULT_SETTINGS
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single()
  if (error) throw error
  return data
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    staleTime: 60 * 1000,
  })
}
