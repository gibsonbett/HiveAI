<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <button @click="$router.back()" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
        <i class="pi pi-arrow-left"></i>
      </button>
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Task</h1>
        <SharedStatusBadge v-if="task" :status="taskType" />
      </div>
    </div>

    <SharedSkeletonLoader v-if="loading" type="card" />

    <div v-else-if="!task" class="mt-8">
      <SharedEmptyState title="Task not found" message="This task may have been assigned to someone else" icon="pi pi-exclamation-circle" />
    </div>

    <div v-else class="space-y-6">
      <!-- Instructions -->
      <div class="card p-4 sm:p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Instructions</h2>
        <SharedTipTool message="Submit complete and accurate annotations. Very fast or empty submissions may be flagged for quality review." />
        <p class="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{{ taskInstructions }}</p>
      </div>

      <!-- Task Content -->
      <div class="card p-4 sm:p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Content</h2>

        <!-- Image annotation (bounding box) -->
        <AnnotationBoundingBoxTool
          v-if="taskType === 'image_annotation' && taskContent.imageUrl"
          :imageUrl="taskContent.imageUrl"
          :labels="taskContent.labels || ['object']"
          @update="(boxes) => { annotationData = { boxes } }"
        />

        <!-- Text classification with highlighting -->
        <AnnotationTextHighlighter
          v-else-if="taskType === 'text_classification' && taskContent.text"
          :text="taskContent.text"
          :entities="taskContent.entities || ['POSITIVE', 'NEGATIVE', 'NEUTRAL']"
          @update="(highlights) => { annotationData = { highlights } }"
        />

        <!-- RLHF comparison -->
        <AnnotationRlhfComparison
          v-else-if="taskType === 'rlhf_comparison' && taskContent.options?.length"
          :prompt="taskContent.text"
          :responses="taskContent.options"
          @update="(result) => { annotationData = { ...result } }"
        />

        <!-- Generic: text content display -->
        <div v-else-if="taskContent.text" class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
          {{ taskContent.text }}
        </div>

        <!-- Image content (non-annotation) -->
        <div v-if="taskContent.imageUrl && taskType !== 'image_annotation'" class="mt-3">
          <img :src="taskContent.imageUrl" alt="Task image" class="max-w-full rounded-lg" />
        </div>

        <!-- Options for simple classification/comparison (fallback) -->
        <div v-if="taskContent.options?.length && taskType !== 'rlhf_comparison'" class="mt-4 space-y-2">
          <label
            v-for="(option, index) in taskContent.options"
            :key="index"
            class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            :class="{ 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20': selectedOption === index }"
          >
            <input
              type="radio"
              :value="index"
              v-model="selectedOption"
              class="text-indigo-600"
            />
            <span class="text-sm text-gray-700 dark:text-gray-300">{{ option }}</span>
          </label>
        </div>

        <!-- Free text response -->
        <div v-if="taskType === 'ai_evaluation' || taskType === 'audio_transcription' || (!taskContent.options?.length && taskType !== 'image_annotation' && taskType !== 'text_classification' && taskType !== 'rlhf_comparison')" class="mt-4">
          <label class="label">Your Response</label>
          <textarea
            v-model="response"
            class="input-field min-h-[100px]"
            placeholder="Enter your annotation or response..."
          ></textarea>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3 justify-between">
        <button @click="handleSkip" :disabled="submitting" class="btn-secondary">
          <i class="pi pi-forward mr-1"></i> Skip
        </button>
        <button @click="handleSubmit" :disabled="submitting || (!response && selectedOption === null && !annotationData)" class="btn-primary">
          <span v-if="submitting" class="flex items-center gap-2">
            <i class="pi pi-spin pi-spinner"></i> Submitting...
          </span>
          <span v-else><i class="pi pi-check mr-1"></i> Submit</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task, TaskType } from '~/types/task'

interface TaskContent {
  imageUrl?: string
  text?: string
  options?: string[]
  labels?: string[]
  entities?: string[]
  instructions?: string
}

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
const selectedOption = ref<number | null>(null)
const response = ref('')
const annotationData = ref<unknown | null>(null)
const submitting = ref(false)

const getErrorMessage = (error: unknown, fallback: string) => {
  const err = error as { response?: { data?: { message?: string } }; message?: string }
  return err?.response?.data?.message || err?.message || fallback
}

const taskType = computed<TaskType>(() => {
  const project = task.value?.projectId
  if (project && typeof project !== 'string') return project.taskType
  return 'ai_evaluation'
})

const taskContent = computed<TaskContent>(() => {
  const raw = task.value?.inputData
  if (!raw || typeof raw !== 'object') return {}
  return raw as TaskContent
})

const taskInstructions = computed(() => taskContent.value.instructions || 'Complete the annotation task below.')

const fetchTask = async () => {
  try {
    const res = await get<Task>(`/tasks/${taskId.value}`)
    task.value = res.data || null

    // Auto-assign if task is pending
    if (task.value && task.value.status === 'pending') {
      await post(`/tasks/${taskId.value}/assign`)
      const updated = await get<Task>(`/tasks/${taskId.value}`)
      task.value = updated.data || null
    }
  } catch (error) {
    toast.error(getErrorMessage(error, 'Failed to load task'))
    task.value = null
  }
}

const handleSubmit = async () => {
  if (!task.value) return
  submitting.value = true
  try {
    const outputData: Record<string, unknown> = {}
    if (annotationData.value && typeof annotationData.value === 'object') {
      Object.assign(outputData, annotationData.value as Record<string, unknown>)
    }
    if (selectedOption.value !== null) {
      outputData.selectedOption = selectedOption.value
    }
    if (response.value) {
      outputData.response = response.value
    }
    await post(`/tasks/${taskId.value}/submit`, { outputData })
    toast.success('Task submitted!')
    router.push('/dashboard/worker/tasks')
  } catch (error) {
    toast.error(getErrorMessage(error, 'Failed to submit task'))
  } finally {
    submitting.value = false
  }
}

const handleSkip = async () => {
  if (!task.value) return
  submitting.value = true
  try {
    await post(`/tasks/${taskId.value}/skip`, {})
    toast.info('Task skipped')
    router.push('/dashboard/worker/tasks')
  } catch (error) {
    toast.error(getErrorMessage(error, 'Failed to skip task'))
  } finally {
    submitting.value = false
  }
}

onMounted(fetchTask)
</script>
