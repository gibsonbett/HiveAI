<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Task History</h1>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Your completed and reviewed tasks</p>

    <div class="mt-6">
      <SharedSkeletonLoader v-if="loading" type="table" :rows="8" />
      <SharedEmptyState v-else-if="!tasks.length" title="No history yet" message="Tasks you complete will appear here" />
      <div v-else class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Type</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">Project</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th class="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Earned</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
              <tr v-for="task in tasks" :key="task._id">
                <td class="px-4 py-3"><SharedStatusBadge :status="getTaskType(task)" /></td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell">{{ getProjectName(task) }}</td>
                <td class="px-4 py-3"><SharedStatusBadge :status="task.status" /></td>
                <td class="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">${{ (task.payoutAmount || 0).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800">
          <p class="text-sm text-gray-500">Page {{ page }} of {{ totalPages }}</p>
          <div class="flex gap-2">
            <button @click="page > 1 && (page--, fetchTasks())" :disabled="page <= 1" class="btn-secondary text-sm py-1.5 px-3">Previous</button>
            <button @click="page < totalPages && (page++, fetchTasks())" :disabled="page >= totalPages" class="btn-secondary text-sm py-1.5 px-3">Next</button>
          </div>
        </div>
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

const tasks = ref<Task[]>([])
const page = ref(1)
const totalPages = ref(0)

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
  return '-'
}

const fetchTasks = async () => {
  try {
    const response = await get<Task[]>('/tasks', { page: page.value, limit: 20 })
    tasks.value = response.data || []
    totalPages.value = response.meta?.totalPages || 0
  } catch {
    // empty
  }
}

onMounted(fetchTasks)
</script>
