import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    sidebarOpen: false,
    darkMode: false,
  }),

  actions: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    closeSidebar() {
      this.sidebarOpen = false
    },
    toggleDarkMode() {
      this.darkMode = !this.darkMode
      this.applyDarkMode()
    },
    applyDarkMode() {
      if (import.meta.client) {
        document.documentElement.classList.toggle('dark', this.darkMode)
        localStorage.setItem('darkMode', String(this.darkMode))
      }
    },
    initDarkMode() {
      if (import.meta.client) {
        const saved = localStorage.getItem('darkMode')
        if (saved !== null) {
          this.darkMode = saved === 'true'
        } else {
          this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
        }
        this.applyDarkMode()
      }
    },
  },
})
