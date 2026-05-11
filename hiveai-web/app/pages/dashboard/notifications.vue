<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
      <button v-if="notifications.length" @click="markAllRead" class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
        Mark all read
      </button>
    </div>

    <SharedSkeletonLoader v-if="loading" type="table" :rows="6" />
    <SharedEmptyState v-else-if="!notifications.length" title="No notifications" message="You're all caught up!" icon="pi pi-bell" />
    <div v-else class="space-y-2">
      <div
        v-for="notif in notifications"
        :key="notif._id"
        @click="handleClick(notif)"
        :class="[
          'card p-4 cursor-pointer hover:shadow-md transition-shadow',
          !notif.read && 'border-l-4 border-l-indigo-500'
        ]"
      >
        <div class="flex items-start gap-3">
          <div :class="notifIconBg(notif.type)" class="p-2 rounded-lg flex-shrink-0">
            <i :class="notifIcon(notif.type)" class="text-sm"></i>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ notif.title }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ notif.message }}</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">{{ timeAgo(notif.createdAt) }}</p>
          </div>
        </div>
      </div>

      <div v-if="totalPages > 1" class="flex items-center justify-between mt-4">
        <p class="text-sm text-gray-500">Page {{ page }} of {{ totalPages }}</p>
        <div class="flex gap-2">
          <button @click="page > 1 && (page--, fetchNotifications())" :disabled="page <= 1" class="btn-secondary text-sm py-1.5 px-3">Previous</button>
          <button @click="page < totalPages && (page++, fetchNotifications())" :disabled="page >= totalPages" class="btn-secondary text-sm py-1.5 px-3">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Notification } from '~/types/task'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { get, patch, loading } = useApi()
const toast = useToast()

const notifications = ref<Notification[]>([])
const page = ref(1)
const totalPages = ref(0)

const fetchNotifications = async () => {
  try {
    const response = await get<Notification[]>('/notifications', { page: page.value, limit: 20 })
    notifications.value = response.data || []
    totalPages.value = response.meta?.totalPages || 0
  } catch {
    // empty
  }
}

const handleClick = async (notif: Notification) => {
  if (!notif.read) {
    try {
      await patch(`/notifications/${notif._id}/read`, {})
      notif.read = true
    } catch {
      // silent
    }
  }
  const link = getNotificationLink(notif)
  if (link) {
    navigateTo(link)
  }
}

const getNotificationLink = (notif: Notification) => {
  const metadata = notif.metadata
  if (!metadata || typeof metadata !== 'object') return null
  const link = (metadata as { link?: unknown }).link
  return typeof link === 'string' && link.length > 0 ? link : null
}

const markAllRead = async () => {
  try {
    await patch('/notifications/read-all', {})
    notifications.value.forEach(n => n.read = true)
    toast.success('All marked as read')
  } catch {
    toast.error('Failed to mark as read')
  }
}

const notifIcon = (type: string) => ({
  task_assigned: 'pi pi-briefcase',
  review_complete: 'pi pi-check-circle',
  project_update: 'pi pi-folder',
  system: 'pi pi-info-circle',
}[type] || 'pi pi-bell')

const notifIconBg = (type: string) => ({
  task_assigned: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  review_complete: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  project_update: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  system: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
}[type] || 'bg-gray-100 text-gray-600')

const timeAgo = (date: string) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

onMounted(fetchNotifications)
</script>
