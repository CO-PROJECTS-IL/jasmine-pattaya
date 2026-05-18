import { create } from 'zustand'
import { callEdgeFunction, isSupabaseConfigured } from '../lib/supabase'
import type { UserRole } from '../lib/types'
import { DEFAULT_ADMIN_PIN, DEFAULT_EMPLOYEE_PIN } from '../lib/constants'

interface AuthState {
  role: UserRole
  validatePin: (pin: string, role: 'employee' | 'admin') => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  role: (sessionStorage.getItem('jasmine-role') as UserRole) || 'guest',

  validatePin: async (pin: string, role: 'employee' | 'admin') => {
    let valid = false
    if (!isSupabaseConfigured) {
      valid = role === 'admin' ? pin === DEFAULT_ADMIN_PIN : pin === DEFAULT_EMPLOYEE_PIN
    } else {
      try {
        const result = await callEdgeFunction('validate-pin', { pin, role })
        valid = result.valid
      } catch {
        valid = false
      }
    }
    if (valid) {
      sessionStorage.setItem('jasmine-role', role)
      set({ role })
    }
    return valid
  },

  logout: () => {
    sessionStorage.removeItem('jasmine-role')
    set({ role: 'guest' })
  },
}))
