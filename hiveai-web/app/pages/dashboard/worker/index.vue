<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Worker Dashboard</h1>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Your task overview</p>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <SharedStatsCard title="Available Tasks" :value="stats.available" icon="pi pi-list" />
      <SharedStatsCard
        title="Completed"
        :value="stats.completed"
        icon="pi pi-check"
        icon-bg-class="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
      />
      <SharedStatsCard
        title="Accuracy"
        :value="`${stats.accuracy}%`"
        icon="pi pi-chart-line"
        icon-bg-class="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
      />
      <SharedStatsCard
        title="Earnings"
        :value="`$${stats.earnings.toFixed(2)}`"
        icon="pi pi-wallet"
        icon-bg-class="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
      />
    </div>

    <!-- Available Tasks Preview -->
    <div class="mt-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Available Tasks</h2>
        <NuxtLink to="/dashboard/worker/tasks" class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
          View all <i class="pi pi-arrow-right text-xs"></i>
        </NuxtLink>
      </div>

      <SharedSkeletonLoader v-if="loading" type="card" />
      <SharedEmptyState v-else-if="!tasks.length" title="No tasks available" message="Check back soon for new tasks" icon="pi pi-inbox" />
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NuxtLink
          v-for="task in tasks"
          :key="task._id"
          :to="`/dashboard/worker/task-${task._id}`"
          class="card p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between mb-2">
            <SharedStatusBadge :status="getTaskType(task)" />
            <span class="text-xs text-gray-500 dark:text-gray-400">{{ task.priority }}</span>
          </div>
          <p class="font-medium text-gray-900 dark:text-white truncate">{{ getProjectName(task) }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ${{ (task.payoutAmount || 0).toFixed(2) }}
          </p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/types/task'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { get, loading } = useApi()

const stats = ref({
  available: 0,
  completed: 0,
  accuracy: 0,
  earnings: 0,
})
const tasks = ref<Task[]>([])

const getTaskType = (task: Task) => {
  if (typeof task.projectId === 'object' && task.projectId?.taskType) {
    return task.projectId.taskType
  }
  return 'task'
}

const getProjectName = (task: Task) => {
  if (typeof task.projectId === 'object' && task.projectId?.title) {
    return task.projectId.title
  }
  return 'Task'
}

onMounted(async () => {
  try {
    const [statsRes, tasksRes] = await Promise.all([
      get<any>('/tasks/worker/stats'),
      get<Task[]>('/tasks/available', { limit: 6 }),
    ])
    if (statsRes.data) {
      stats.value = {
        available: statsRes.data.available || 0,
        completed: statsRes.data.completed || 0,
        accuracy: 0,
        earnings: statsRes.data.earnings || 0,
      }
    }
    if (tasksRes.data) tasks.value = tasksRes.data

    // Get user profile for accuracy
    const profileRes = await get<any>('/users/me')
    if (profileRes.data) {
      stats.value.accuracy = profileRes.data.accuracyScore || 0
    }
  } catch {
    // defaults
  }
})
</script>
