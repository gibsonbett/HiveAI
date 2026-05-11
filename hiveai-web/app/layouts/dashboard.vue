<template>
  <div class="min-h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-950">
    <!-- Mobile Header -->
    <header class="lg:hidden flex items-center justify-between px-3 py-2.5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      <button @click="uiStore.toggleSidebar()" class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
        <i class="pi pi-bars text-lg"></i>
      </button>
      <span class="font-bold text-sm text-teal-600 dark:text-teal-300">HiveAI</span>
      <div class="flex items-center gap-1.5">
        <button @click="uiStore.toggleDarkMode()" class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <i :class="uiStore.darkMode ? 'pi pi-sun' : 'pi pi-moon'" class="text-base"></i>
        </button>
        <NuxtLink to="/dashboard/notifications" class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 relative">
          <i class="pi pi-bell text-base"></i>
          <span v-if="unreadCount > 0" class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
        </NuxtLink>
      </div>
    </header>

    <!-- Sidebar Overlay (mobile) -->
    <div
      v-if="uiStore.sidebarOpen"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="uiStore.closeSidebar()"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed lg:sticky top-0 left-0 z-50 h-screen w-44 sm:w-52 lg:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-200',
        uiStore.sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center gap-2 px-3 py-4 lg:gap-3 lg:px-6 lg:py-5 border-b border-gray-200 dark:border-gray-800">
        <div class="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
          <div class="w-3.5 h-3.5 lg:w-4 lg:h-4 rounded bg-slate-900/90"></div>
        </div>
        <span class="font-bold text-base lg:text-lg text-gray-900 dark:text-white">HiveAI</span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-2 py-3 lg:px-3 lg:py-4 space-y-1 overflow-y-auto">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-2 lg:gap-3 px-2.5 lg:px-3 py-2 lg:py-2.5 rounded-lg text-xs lg:text-sm font-medium transition-colors"
          :class="isActive(item.to)
            ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'"
          @click="uiStore.closeSidebar()"
        >
          <i :class="item.icon" class="text-sm lg:text-base w-4 lg:w-5"></i>
          {{ item.label }}
        </NuxtLink>
      </nav>

      <!-- User Section -->
      <div class="px-2 py-3 lg:px-3 lg:py-4 border-t border-gray-200 dark:border-gray-800">
        <div class="flex items-center gap-2 lg:gap-3 px-2.5 lg:px-3 py-1.5 lg:py-2">
          <div class="w-7 h-7 lg:w-8 lg:h-8 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
            <span class="text-teal-600 dark:text-teal-300 text-xs lg:text-sm font-medium">
              {{ initials }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs lg:text-sm font-medium text-gray-900 dark:text-white truncate">{{ fullName }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 capitalize">{{ authStore.userRole }}</p>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-2 lg:gap-3 px-2.5 lg:px-3 py-2 lg:py-2.5 mt-1 rounded-lg text-xs lg:text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
        >
          <i class="pi pi-sign-out text-sm lg:text-base w-4 lg:w-5"></i>
          Logout
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 min-h-screen lg:min-h-0">
      <!-- Desktop Top Bar -->
      <header class="hidden lg:flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div></div>
        <div class="flex items-center gap-3">
          <button @click="uiStore.toggleDarkMode()" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <i :class="uiStore.darkMode ? 'pi pi-sun' : 'pi pi-moon'"></i>
          </button>
          <NuxtLink to="/dashboard/notifications" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 relative">
            <i class="pi pi-bell"></i>
            <span v-if="unreadCount > 0" class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
          </NuxtLink>
          <div class="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-700">
            <div class="w-8 h-8 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
              <span class="text-teal-600 dark:text-teal-300 text-xs font-medium">{{ initials }}</span>
            </div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ fullName }}</span>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <div class="p-4 sm:p-6">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'
import { SIDEBAR_ITEMS } from '~/utils/constants'

const authStore = useAuthStore()
const uiStore = useUiStore()
const route = useRoute()

// Activate real-time event listeners across all dashboard pages
const { unreadCount } = useRealtimeEvents()

const menuItems = computed(() => {
  const role = authStore.userRole || 'worker'
  return SIDEBAR_ITEMS[role] || []
})

const fullName = computed(() => authStore.fullName)
const initials = computed(() => {
  const user = authStore.user
  if (!user) return ''
  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
})

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const handleLogout = async () => {
  const { logout } = useAuth()
  await logout()
}
</script>
