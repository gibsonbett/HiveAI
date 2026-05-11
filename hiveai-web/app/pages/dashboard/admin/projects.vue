<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">All Projects</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">Monitor all platform projects</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="mt-6 card p-4 flex flex-col sm:flex-row gap-3">
      <select v-model="statusFilter" @change="fetchProjects" class="input-field sm:w-40">
        <option value="">All Status</option>
        <option value="draft">Draft</option>
        <option value="active">Active</option>
        <option value="paused">Paused</option>
        <option value="completed">Completed</option>
        <option value="archived">Archived</option>
      </select>
      <select v-model="typeFilter" @change="fetchProjects" class="input-field sm:w-48">
        <option value="">All Types</option>
        <option value="text_classification">Text Classification</option>
        <option value="image_annotation">Image Annotation</option>
        <option value="rlhf_comparison">RLHF Comparison</option>
        <option value="audio_transcription">Audio Transcription</option>
        <option value="video_annotation">Video Annotation</option>
        <option value="ai_evaluation">AI Evaluation</option>
      </select>
    </div>

    <!-- Projects Table -->
    <div class="mt-4 card overflow-hidden">
      <SharedSkeletonLoader v-if="loading" type="table" :rows="5" class="p-4" />
      <SharedEmptyState v-else-if="!projects.length" title="No projects found" message="Try adjusting your filters" icon="pi pi-folder" />
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Title</th>
              <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">Client</th>
              <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Type</th>
              <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">Progress</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr v-for="project in projects" :key="project._id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td class="px-4 py-3">
                <p class="font-medium text-gray-900 dark:text-white">{{ project.title }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{{ project.description }}</p>
              </td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell">
                {{ getClientName(project) }}
              </td>
              <td class="px-4 py-3"><SharedStatusBadge :status="project.taskType" /></td>
              <td class="px-4 py-3"><SharedStatusBadge :status="project.status" /></td>
              <td class="px-4 py-3 hidden md:table-cell">
                <div class="flex items-center gap-2">
                  <div class="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-indigo-600 rounded-full"
                      :style="{ width: `${project.totalTasks ? ((project.completedTasks || 0) / project.totalTasks * 100) : 0}%` }"
                    ></div>
                  </div>
                  <span class="text-xs text-gray-500">{{ project.completedTasks || 0 }}/{{ project.totalTasks || 0 }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800">
        <p class="text-sm text-gray-500 dark:text-gray-400">Page {{ page }} of {{ totalPages }}</p>
        <div class="flex gap-2">
          <button @click="page > 1 && (page--, fetchProjects())" :disabled="page <= 1" class="btn-secondary text-sm py-1.5 px-3">Previous</button>
          <button @click="page < totalPages && (page++, fetchProjects())" :disabled="page >= totalPages" class="btn-secondary text-sm py-1.5 px-3">Next</button>
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
const statusFilter = ref('')
const typeFilter = ref('')
const page = ref(1)
const totalPages = ref(0)

const getClientName = (project: Project) => {
  if (typeof project.clientId === 'object') {
    return `${project.clientId.firstName} ${project.clientId.lastName}`
  }
  return '-'
}

const fetchProjects = async () => {
  try {
    const params: Record<string, unknown> = { page: page.value, limit: 20 }
    if (statusFilter.value) params.status = statusFilter.value
    if (typeFilter.value) params.taskType = typeFilter.value

    const response = await get<Project[]>('/projects', params)
    projects.value = response.data || []
    totalPages.value = response.meta?.totalPages || 0
  } catch {
    // empty
  }
}

onMounted(fetchProjects)
</script>
