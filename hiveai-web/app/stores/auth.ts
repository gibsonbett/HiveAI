import { defineStore } from 'pinia'
import type { User } from '~/types/user'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user || !!state.token,
    userRole: (state) => state.user?.role || null,
    fullName: (state) =>
      state.user ? `${state.user.firstName} ${state.user.lastName}` : '',
  },

  actions: {
    setUser(user: User) {
      this.user = user
    },
    setToken(token: string | null) {
      this.token = token
    },
    clearAuth() {
      this.user = null
      this.token = null
    },
  },

  persist: {
    pick: ['token'],
  },
})
