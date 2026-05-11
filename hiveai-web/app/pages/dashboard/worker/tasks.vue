<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Available Tasks</h1>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Pick a task to start working</p>

    <!-- Filters -->
    <div class="mt-6 card p-4 flex flex-col sm:flex-row gap-3">
      <select v-model="typeFilter" @change="fetchTasks" class="input-field sm:w-40">
        <option value="">All Types</option>
        <option value="text_classification">Text Classification</option>
        <option value="image_annotation">Image Annotation</option>
        <option value="rlhf_comparison">RLHF Comparison</option>
        <option value="audio_transcription">Audio Transcription</option>
        <option value="video_annotation">Video Annotation</option>
        <option value="ai_evaluation">AI Evaluation</option>
      </select>
    </div>

    <!-- Tasks -->
    <div class="mt-4">
      <SharedSkeletonLoader v-if="loading" type="table" :rows="8" />
      <SharedEmptyState v-else-if="!tasks.length" title="No tasks available" message="Check back later for new tasks" />
      <div v-else class="space-y-3">
        <div
          v-for="(task, index) in tasks"
          :key="task._id"
          class="card p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
        >
          <div :class="['flex-1 min-w-0 transition', taskIsLocked(index) ? 'blur-[2px] opacity-65 pointer-events-none select-none' : '']">
            <div class="flex items-center gap-2 flex-wrap">
              <SharedStatusBadge :status="getTaskType(task)" />
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ task.priority }} priority</span>
            </div>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ getProjectName(task) }}</p>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              ${{ kesToUsd(task.payoutAmount || 0).toFixed(2) }}
              <span class="text-xs text-gray-500 dark:text-gray-400">(KES {{ (task.payoutAmount || 0).toFixed(2) }})</span>
            </span>
            <button
              type="button"
              class="text-sm py-1.5 px-4"
              :class="taskIsLocked(index) ? 'btn-secondary' : 'btn-primary'"
              @click="handleStartTask(task._id, index)"
            >
              {{ taskIsLocked(index) ? 'Upgrade to Unlock' : 'Start' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between mt-4">
        <p class="text-sm text-gray-500">Page {{ page }} of {{ totalPages }}</p>
        <div class="flex gap-2">
          <button @click="page > 1 && (page--, fetchTasks())" :disabled="page <= 1" class="btn-secondary text-sm py-1.5 px-3">Previous</button>
          <button @click="page < totalPages && (page++, fetchTasks())" :disabled="page >= totalPages" class="btn-secondary text-sm py-1.5 px-3">Next</button>
        </div>
      </div>
    </div>

    <SharedPlanUpgradeModal
      v-model="showUpgradeModal"
      @upgraded="handleUpgraded"
    />
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/types/task'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { get, loading } = useApi()
const authStore = useAuthStore()
const router = useRouter()

const tasks = ref<Task[]>([])
const typeFilter = ref('')
const page = ref(1)
const totalPages = ref(0)
const showUpgradeModal = ref(false)
const subscription = ref({
  status: 'inactive',
  trialUsageCount: 0,
  trialLimit: 3,
  unlockedItems: 3,
  kesPerUsd: 129,
})

const isSubscribed = computed(() => subscription.value.status === 'active')
const unlockedItems = computed(() => {
  if (isSubscribed.value) return Number.MAX_SAFE_INTEGER
  return Math.max(subscription.value.unlockedItems ?? 0, 0)
})

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
  return 'Annotation task'
}

const kesToUsd = (kesAmount: number) => {
  const rate = subscription.value.kesPerUsd || 129
  return rate > 0 ? kesAmount / rate : 0
}

const taskIsLocked = (index: number) => {
  if (authStore.user?.role !== 'worker') return false
  return !isSubscribed.value && index >= unlockedItems.value
}

const handleStartTask = (taskId: string, index: number) => {
  if (taskIsLocked(index)) {
    showUpgradeModal.value = true
    return
  }
  router.push(`/dashboard/worker/task-${taskId}`)
}

const fetchSubscription = async () => {
  try {
    const response = await get<any>('/payments/subscription')
    if (response.data) {
      subscription.value = {
        ...subscription.value,
        ...response.data,
      }
    }
  } catch {
    // empty
  }
}

const handleUpgraded = async () => {
  await fetchSubscription()
}

const fetchTasks = async () => {
  try {
    const params: Record<string, unknown> = { page: page.value, limit: 20 }
    if (typeFilter.value) params.type = typeFilter.value

    const response = await get<Task[]>('/tasks/available', params)
    tasks.value = response.data || []
    totalPages.value = response.meta?.totalPages || 0
  } catch {
    // empty
  }
}

onMounted(fetchTasks)
onMounted(fetchSubscription)
</script>
