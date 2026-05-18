import { create } from 'zustand'
import { callEdgeFunction, isSupabaseConfigured } from '../lib/supabase'

type Role = 'guest' | 'kitchen' | 'admin'

interface AuthState {
  role: Role
  validatePin: (pin: string, role: 'kitchen' | 'admin') => Promise<boolean>
  logout: () => void
}

const DEV_PIN = '1234'

export const useAuthStore = create<AuthState>()((set) => ({
  role: (sessionStorage.getItem('jasmine-role') as Role) || 'guest',

  validatePin: async (pin: string, role: 'kitchen' | 'admin') => {
    let valid = false
    if (!isSupabaseConfigured) {
      valid = pin === DEV_PIN
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
