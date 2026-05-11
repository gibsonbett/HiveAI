<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <button @click="$router.back()" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
        <i class="pi pi-arrow-left"></i>
      </button>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Review Task</h1>
    </div>

    <SharedSkeletonLoader v-if="loading" type="card" />

    <div v-else-if="!task" class="mt-8">
      <SharedEmptyState title="Task not found" icon="pi pi-exclamation-circle" />
    </div>

    <div v-else class="space-y-6">
      <!-- Task Content -->
      <div class="card p-4 sm:p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Task Content</h2>
        <div class="mb-2 text-xs text-gray-500 dark:text-gray-400">
          Type: <SharedStatusBadge :status="getTaskType(task)" />
        </div>
        <div v-if="task.inputData" class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
          <pre class="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{{ JSON.stringify(task.inputData, null, 2) }}</pre>
        </div>
      </div>

      <!-- Worker's Submission -->
      <div class="card p-4 sm:p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Worker's Response</h2>
        <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <pre class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ JSON.stringify(task.outputData, null, 2) }}</pre>
        </div>
      </div>

      <!-- Review Decision -->
      <div class="card p-4 sm:p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Review</h2>
        <SharedTipTool message="Use consistent scoring. Add specific feedback when rejecting or requesting revision to improve worker quality." />

        <div class="grid grid-cols-3 gap-3 mb-4">
          <button
            type="button"
            @click="decision = 'approved'"
            :class="[
              'p-4 rounded-lg border-2 text-center transition-all',
              decision === 'approved'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            ]"
          >
            <i class="pi pi-thumbs-up text-xl text-green-600 mb-1"></i>
            <p class="text-sm font-medium text-gray-900 dark:text-white">Approve</p>
          </button>
          <button
            type="button"
            @click="decision = 'needs_revision'"
            :class="[
              'p-4 rounded-lg border-2 text-center transition-all',
              decision === 'needs_revision'
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            ]"
          >
            <i class="pi pi-pencil text-xl text-amber-600 mb-1"></i>
            <p class="text-sm font-medium text-gray-900 dark:text-white">Revision</p>
          </button>
          <button
            type="button"
            @click="decision = 'rejected'"
            :class="[
              'p-4 rounded-lg border-2 text-center transition-all',
              decision === 'rejected'
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            ]"
          >
            <i class="pi pi-thumbs-down text-xl text-red-600 mb-1"></i>
            <p class="text-sm font-medium text-gray-900 dark:text-white">Reject</p>
          </button>
        </div>

        <div class="mb-4">
          <label class="label">Quality Score (0-100)</label>
          <input v-model.number="score" type="number" min="0" max="100" class="input-field" />
        </div>

        <div>
          <label class="label">Feedback (optional)</label>
          <textarea v-model="feedback" class="input-field min-h-[80px]" placeholder="Provide feedback for the worker..."></textarea>
        </div>

        <div v-if="decision === 'rejected'" class="mt-3">
          <label class="label">Rejection Reason</label>
          <select v-model="reason" class="input-field">
            <option value="">Select reason</option>
            <option value="incorrect">Incorrect annotation</option>
            <option value="incomplete">Incomplete work</option>
            <option value="low_quality">Low quality</option>
            <option value="spam">Spam / low effort</option>
          </select>
        </div>
      </div>

      <!-- Submit -->
      <div class="flex justify-end gap-3">
        <button @click="$router.back()" class="btn-secondary">Cancel</button>
        <button @click="handleSubmit" :disabled="!decision || submitting" class="btn-primary">
          <span v-if="submitting" class="flex items-center gap-2">
            <i class="pi pi-spin pi-spinner"></i> Submitting...
          </span>
          <span v-else>Submit Review</span>
        </button>
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

const route = useRoute()
const router = useRouter()
const { get, post, loading } = useApi()
const toast = useToast()

const taskId = computed(() => {
  const id = route.params.id
  return Array.isArray(id) ? id[0] : id
})

const task = ref<Task | null>(null)
const decision = ref<'approved' | 'rejected' | 'needs_revision' | ''>('')
const feedback = ref('')
const reason = ref('')
const score = ref(80)
const submitting = ref(false)

const getErrorMessage = (error: unknown, fallback: string) => {
  const err = error as { response?: { data?: { message?: string } }; message?: string }
  return err?.response?.data?.message || err?.message || fallback
}

const getTaskType = (t: Task) => {
  if (typeof t.projectId === 'object' && t.projectId?.taskType) {
    return t.projectId.taskType
  }
  return 'task'
}

onMounted(async () => {
  try {
    const res = await get<Task>(`/tasks/${taskId.value}`)
    task.value = res.data || null
  } catch (error) {
    toast.error(getErrorMessage(error, 'Failed to load task for review'))
    task.value = null
  }
})

const handleSubmit = async () => {
  if (!decision.value) return
  submitting.value = true
  try {
    await post('/reviews', {
      taskId: taskId.value,
      decision: decision.value,
      comments: feedback.value || undefined,
      score: score.value,
    })
    toast.success('Review submitted!')
    router.push('/dashboard/reviewer/queue')
  } catch (error) {
    toast.error(getErrorMessage(error, 'Failed to submit review'))
  } finally {
    submitting.value = false
  }
}
</script>
