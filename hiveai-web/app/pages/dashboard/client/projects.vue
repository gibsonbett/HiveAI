<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">My Projects</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">All your annotation projects</p>
      </div>
      <NuxtLink to="/dashboard/client/create-project" class="btn-primary text-sm">
        <i class="pi pi-plus mr-1"></i> New Project
      </NuxtLink>
    </div>

    <div class="mt-6">
      <SharedSkeletonLoader v-if="loading" type="table" :rows="6" />
      <SharedEmptyState
        v-else-if="!projects.length"
        title="No projects"
        message="Create your first annotation project to get started"
        action-label="Create Project"
        @action="navigateTo('/dashboard/client/create-project')"
      />
      <div v-else class="space-y-4">
        <NuxtLink
          v-for="project in projects"
          :key="project._id"
          :to="`/dashboard/client/project-${project._id}`"
          class="card p-4 sm:p-5 block hover:shadow-md transition-shadow"
        >
          <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="font-medium text-gray-900 dark:text-white">{{ project.title }}</h3>
                <SharedStatusBadge :status="project.status" />
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{{ project.description || 'No description' }}</p>
            </div>
            <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>{{ project.completedTasks || 0 }}/{{ project.totalTasks || 0 }} tasks</span>
              <span class="hidden sm:inline">{{ project.taskType }}</span>
            </div>
          </div>
        </NuxtLink>

        <div v-if="totalPages > 1" class="flex items-center justify-between">
          <p class="text-sm text-gray-500">Page {{ page }} of {{ totalPages }}</p>
          <div class="flex gap-2">
            <button @click="page > 1 && (page--, fetchProjects())" :disabled="page <= 1" class="btn-secondary text-sm py-1.5 px-3">Previous</button>
            <button @click="page < totalPages && (page++, fetchProjects())" :disabled="page >= totalPages" class="btn-secondary text-sm py-1.5 px-3">Next</button>
          </div>
        </div>
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

const projects = ref<Project[]>([])
const page = ref(1)
const totalPages = ref(0)

const fetchProjects = async () => {
  try {
    const response = await get<Project[]>('/projects', { page: page.value, limit: 20 })
    projects.value = response.data || []
    totalPages.value = response.meta?.totalPages || 0
  } catch {
    // empty
  }
}

onMounted(fetchProjects)
</script>
