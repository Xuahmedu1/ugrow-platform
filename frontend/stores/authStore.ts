import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/lib/types'

const API_URL = 'http://localhost:8000'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })

          const data = await response.json()

          if (!response.ok) {
            const msg = data.detail || 'Invalid email or password'
            set({ isLoading: false, error: msg })
            return false
          }

          // Save token
          localStorage.setItem('ugrow_token', data.access_token)

          set({
            user: data.user as User,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          return true

        } catch {
          set({
            isLoading: false,
            error: 'Cannot connect to server. Make sure the backend is running.',
          })
          return false
        }
      },

      logout: () => {
        localStorage.removeItem('ugrow_token')
        set({ user: null, isAuthenticated: false, error: null })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'ugrow-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)