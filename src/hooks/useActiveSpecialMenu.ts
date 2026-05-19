import { useQuery } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { isDayOfWeek, isPastSwitchTime, getTodayDateStr } from '../lib/timezone'
import type { SpecialMenu, SpecialMenuItem } from '../lib/types'

interface ActiveSpecialMenuResult {
  activeMenu: (SpecialMenu & { menuItems: SpecialMenuItem[] }) | null
  isLoading: boolean
}

export function useActiveSpecialMenu(): ActiveSpecialMenuResult {
  const { data: menus = [], isLoading: menusLoading } = useQuery({
    queryKey: ['special-menus'],
    queryFn: async () => {
      if (!isSupabaseConfigured) return []
      const { data, error } = await supabase
        .from('special_menus')
        .select('*')
        .eq('is_enabled', true)
        .order('sort_order')
      if (error) throw error
      return data as SpecialMenu[]
    },
  })

  const { data: cancelledDates = [] } = useQuery({
    queryKey: ['special-menu-cancelled'],
    queryFn: async () => {
      if (!isSupabaseConfigured) return []
      const { data, error } = await supabase
        .from('special_menu_cancelled_dates')
        .select('*')
      if (error) throw error
      return data
    },
    enabled: menus.length > 0,
  })

  const today = getTodayDateStr()
  const activeMenuDef = menus.find((menu) => {
    if (menu.schedule_type === 'recurring' && menu.day_of_week !== null) {
      if (!isDayOfWeek(menu.day_of_week)) return false
      if (!isPastSwitchTime(menu.switch_time)) return false
      const isCancelled = cancelledDates.some(
        (c: any) => c.special_menu_id === menu.id && c.cancelled_date === today
      )
      return !isCancelled
    }
    if (menu.schedule_type === 'specific_date' && menu.specific_date) {
      if (menu.specific_date !== today) return false
      return isPastSwitchTime(menu.switch_time)
    }
    return false
  })

  const { data: menuItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['special-menu-items', activeMenuDef?.id],
    queryFn: async () => {
      if (!isSupabaseConfigured || !activeMenuDef) return []
      const { data, error } = await supabase
        .from('special_menu_items')
        .select('*, dish:dishes(*)')
        .eq('special_menu_id', activeMenuDef.id)
        .eq('is_active', true)
        .order('sort_order')
      if (error) throw error
      return data as SpecialMenuItem[]
    },
    enabled: !!activeMenuDef,
  })

  if (!activeMenuDef) {
    return { activeMenu: null, isLoading: menusLoading }
  }

  return {
    activeMenu: { ...activeMenuDef, menuItems },
    isLoading: menusLoading || itemsLoading,
  }
}
