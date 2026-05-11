<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Platform overview and management</p>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <SharedStatsCard
        title="Total Users"
        :value="stats.totalUsers"
        icon="pi pi-users"
        icon-bg-class="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
      />
      <SharedStatsCard
        title="Active Workers"
        :value="stats.roleCounts?.worker || 0"
        icon="pi pi-briefcase"
        icon-bg-class="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
      />
      <SharedStatsCard
        title="Clients"
        :value="stats.roleCounts?.client || 0"
        icon="pi pi-building"
        icon-bg-class="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
      />
      <SharedStatsCard
        title="Reviewers"
        :value="stats.roleCounts?.reviewer || 0"
        icon="pi pi-check-circle"
        icon-bg-class="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
      />
    </div>

    <!-- Quick Actions -->
    <div class="mt-8">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NuxtLink to="/dashboard/admin/users" class="card p-4 hover:shadow-md transition-shadow flex items-center gap-3">
          <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <i class="pi pi-users text-blue-600 dark:text-blue-400"></i>
          </div>
          <div>
            <p class="font-medium text-gray-900 dark:text-white">Manage Users</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">View and manage user accounts</p>
          </div>
        </NuxtLink>
        <NuxtLink to="/dashboard/admin/projects" class="card p-4 hover:shadow-md transition-shadow flex items-center gap-3">
          <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <i class="pi pi-folder text-purple-600 dark:text-purple-400"></i>
          </div>
          <div>
            <p class="font-medium text-gray-900 dark:text-white">All Projects</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Monitor project activity</p>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Fraud Alerts -->
    <div class="mt-8 card p-4 sm:p-6">
      <div class="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Fraud Alerts</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">High-risk activity flags from trust and throttle checks.</p>
        </div>
        <SharedStatusBadge :status="fraudAlerts.length ? 'under_review' : 'approved'" :label="fraudAlerts.length ? `${fraudAlerts.length} open` : 'No open alerts'" />
      </div>

      <SharedTipTool message="Review high-risk events first. Consecutive flags and low trust scores indicate probable abuse patterns." />

      <SharedEmptyState
        v-if="!fraudAlerts.length"
        class="mt-4"
        title="No fraud alerts"
        message="No suspicious activity has been flagged recently."
        icon="pi pi-shield"
      />

      <div v-else class="mt-4 space-y-3">
        <div
          v-for="alert in fraudAlerts"
          :key="alert._id"
          class="rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-900/10 p-4"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-sm font-semibold text-red-700 dark:text-red-300">{{ alert.title }}</p>
              <p class="text-sm text-red-600/90 dark:text-red-300/90 mt-1">{{ alert.message }}</p>
            </div>
            <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{{ formatDate(alert.createdAt) }}</span>
          </div>
          <div class="mt-2 flex flex-wrap gap-2">
            <span
              v-for="flag in getRiskFlags(alert)"
              :key="`${alert._id}-${flag}`"
              class="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2.5 py-1 text-xs text-red-700 dark:text-red-300"
            >
              {{ flag }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface AdminFraudAlert {
  _id: string
  title: string
  message: string
  createdAt: string
  metadata?: Record<string, unknown>
}

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { get } = useApi()
const toast = useToast()

const stats = ref<any>({ totalUsers: 0, roleCounts: {} })
const fraudAlerts = ref<AdminFraudAlert[]>([])

const getErrorMessage = (error: unknown, fallback: string) => {
  const err = error as { response?: { data?: { message?: string } }; message?: string }
  return err?.response?.data?.message || err?.message || fallback
}

const getRiskFlags = (alert: AdminFraudAlert) => {
  const flags = alert.metadata?.riskFlags || alert.metadata?.flags
  return Array.isArray(flags) ? flags.map(String) : []
}

const formatDate = (value: string) => new Date(value).toLocaleString()

const fetchFraudAlerts = async () => {
  try {
    const response = await get<AdminFraudAlert[]>('/notifications/fraud-alerts', { page: 1, limit: 8 })
    fraudAlerts.value = response.data || []
  } catch (error) {
    toast.error(getErrorMessage(error, 'Failed to load fraud alerts'))
  }
}

onMounted(async () => {
  try {
    const response = await get<any>('/users/stats')
    if (response.data) stats.value = response.data
  } catch (error) {
    toast.error(getErrorMessage(error, 'Failed to load dashboard stats'))
    // Stats will show defaults
  }

  await fetchFraudAlerts()
})
</script>
