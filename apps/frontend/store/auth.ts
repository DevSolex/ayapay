import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import api from '@/lib/api'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
}

interface RegisterData {
  name: string
  email: string
  password: string
  role?: string
  companyName?: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/login', { email, password })
          localStorage.setItem('ayapay_token', data.data.token)
          set({ user: data.data.user, token: data.data.token })
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (registerData) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/register', registerData)
          localStorage.setItem('ayapay_token', data.data.token)
          set({ user: data.data.user, token: data.data.token })
        } finally {
          set({ isLoading: false })
        }
      },

      logout: () => {
        localStorage.removeItem('ayapay_token')
        set({ user: null, token: null })
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get('/auth/me')
          set({ user: data.data })
        } catch {
          set({ user: null, token: null })
        }
      },
    }),
    { name: 'ayapay-auth', partialize: (s) => ({ token: s.token, user: s.user }) }
  )
)
