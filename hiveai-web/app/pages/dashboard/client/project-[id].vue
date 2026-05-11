<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <button @click="$router.back()" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
        <i class="pi pi-arrow-left"></i>
      </button>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Project Details</h1>
    </div>

    <SharedSkeletonLoader v-if="loading" type="card" />

    <div v-else-if="!project" class="mt-8">
      <SharedEmptyState title="Project not found" icon="pi pi-exclamation-circle" />
    </div>

    <div v-else class="space-y-6">
      <!-- Header -->
      <div class="card p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ project.title }}</h2>
              <SharedStatusBadge :status="project.status" />
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ project.description }}</p>
          </div>
          <SharedStatusBadge :status="project.taskType" :label="project.taskType" />
        </div>

        <!-- Progress -->
        <div class="mt-6">
          <div class="flex items-center justify-between text-sm mb-2">
            <span class="text-gray-500 dark:text-gray-400">Overall Progress</span>
            <span class="font-medium text-gray-900 dark:text-white">
              {{ project.completedTasks || 0 }}/{{ project.totalTasks || 0 }} tasks
            </span>
          </div>
          <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full bg-indigo-600 rounded-full transition-all"
              :style="{ width: `${progressPercent}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SharedStatsCard title="Total Tasks" :value="project.totalTasks || 0" icon="pi pi-list" />
        <SharedStatsCard title="Completed" :value="project.completedTasks || 0" icon="pi pi-check" icon-bg-class="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" />
        <SharedStatsCard title="In Review" :value="tasksInReview" icon="pi pi-eye" icon-bg-class="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" />
        <SharedStatsCard title="Accuracy" :value="`${avgAccuracy}%`" icon="pi pi-chart-line" icon-bg-class="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
      </div>

      <!-- Tasks list -->
      <div class="card overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <h3 class="font-semibold text-gray-900 dark:text-white">Tasks</h3>
        </div>
        <SharedEmptyState v-if="!tasks.length" title="No tasks generated yet" />
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">#</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">Worker</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">Submitted</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
              <tr v-for="(task, index) in tasks" :key="task._id">
                <td class="px-4 py-3 text-gray-900 dark:text-white">{{ index + 1 }}</td>
                <td class="px-4 py-3"><SharedStatusBadge :status="task.status" /></td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell">{{ formatAssignee(task.assignedTo) }}</td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell">{{ task.submittedAt ? new Date(task.submittedAt).toLocaleDateString() : '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Project, Task } from '~/types/task'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const route = useRoute()
const { get, loading } = useApi()

const projectId = computed(() => {
  const id = route.params.id
  return Array.isArray(id) ? id[0] : id
})

const project = ref<Project | null>(null)
const tasks = ref<Task[]>([])

const tasksInReview = computed(() => tasks.value.filter(t => t.status === 'under_review').length)

const avgAccuracy = computed(() => {
  const scored = tasks.value.filter(t => typeof t.qualityScore === 'number')
  if (!scored.length) return 0
  const total = scored.reduce((sum, t) => sum + (t.qualityScore ?? 0), 0)
  return Math.round(total / scored.length)
})

const progressPercent = computed(() => {
  if (!project.value || !project.value.totalTasks) return 0
  return Math.round(((project.value.completedTasks || 0) / project.value.totalTasks) * 100)
})

const formatAssignee = (assignedTo: Task['assignedTo']) => {
  if (!assignedTo) return '-'
  if (typeof assignedTo === 'string') return assignedTo
  return `${assignedTo.firstName} ${assignedTo.lastName}`
}

onMounted(async () => {
  try {
    const [projRes, taskRes] = await Promise.all([
      get<Project>(`/projects/${projectId.value}`),
      get<Task[]>('/tasks', { projectId: projectId.value, limit: 50 }),
    ])
    project.value = projRes.data || null
    tasks.value = taskRes.data || []
  } catch {
    project.value = null
  }
})
</script>
