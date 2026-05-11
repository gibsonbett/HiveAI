<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Client Dashboard</h1>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your annotation projects</p>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <SharedStatsCard title="Total Projects" :value="stats.total" icon="pi pi-folder" />
      <SharedStatsCard
        title="Active"
        :value="stats.active"
        icon="pi pi-play"
        icon-bg-class="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
      />
      <SharedStatsCard
        title="Completed"
        :value="stats.completed"
        icon="pi pi-check-circle"
        icon-bg-class="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
      />
      <SharedStatsCard
        title="Tasks Done"
        :value="stats.tasksDone"
        icon="pi pi-list-check"
        icon-bg-class="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
      />
    </div>

    <!-- Recent Projects -->
    <div class="mt-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Projects</h2>
        <NuxtLink to="/dashboard/client/create-project" class="btn-primary text-sm">
          <i class="pi pi-plus mr-1"></i> New Project
        </NuxtLink>
      </div>

      <SharedSkeletonLoader v-if="loading" type="card" />
      <SharedEmptyState
        v-else-if="!projects.length"
        title="No projects yet"
        message="Create your first annotation project"
        action-label="Create Project"
        @action="navigateTo('/dashboard/client/create-project')"
      />
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NuxtLink
          v-for="project in projects"
          :key="project._id"
          :to="`/dashboard/client/project-${project._id}`"
          class="card p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between mb-2">
            <SharedStatusBadge :status="project.status" />
            <span class="text-xs text-gray-500 dark:text-gray-400">{{ project.taskType }}</span>
          </div>
          <p class="font-medium text-gray-900 dark:text-white">{{ project.title }}</p>
          <div class="mt-3">
            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{{ project.completedTasks || 0 }}/{{ project.totalTasks || 0 }}</span>
            </div>
            <div class="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-indigo-600 rounded-full transition-all"
                :style="{ width: `${project.totalTasks ? ((project.completedTasks || 0) / project.totalTasks * 100) : 0}%` }"
              ></div>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '~/types/task'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { get, loading } = useApi()

const stats = ref({ total: 0, active: 0, completed: 0, tasksDone: 0 })
const projects = ref<Project[]>([])

onMounted(async () => {
  try {
    const [statsRes, projRes] = await Promise.all([
      get<any>('/projects/stats'),
      get<Project[]>('/projects', { limit: 6 }),
    ])
    if (statsRes.data) stats.value = { ...stats.value, ...statsRes.data }
    if (projRes.data) projects.value = projRes.data
  } catch {
    // defaults
  }
})
</script>
