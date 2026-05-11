<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <button @click="$router.back()" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
        <i class="pi pi-arrow-left"></i>
      </button>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Create Project</h1>
    </div>

    <form @submit.prevent="handleSubmit" class="max-w-2xl space-y-6">
      <div class="card p-4 sm:p-6 space-y-4">
        <div>
          <label class="label">Project Name</label>
          <input v-model="form.title" type="text" class="input-field" placeholder="e.g. Sentiment Analysis Dataset" required />
        </div>

        <div>
          <label class="label">Description</label>
          <textarea v-model="form.description" class="input-field min-h-[80px]" placeholder="Describe the project goals..."></textarea>
        </div>

        <div>
          <label class="label">Task Type</label>
          <select v-model="form.taskType" class="input-field" required>
            <option value="" disabled>Select type</option>
            <option value="text_classification">Text Classification</option>
            <option value="image_annotation">Image Annotation</option>
            <option value="rlhf_comparison">RLHF Comparison</option>
            <option value="audio_transcription">Audio Transcription</option>
            <option value="video_annotation">Video Annotation</option>
            <option value="ai_evaluation">AI Evaluation</option>
          </select>
        </div>

        <div>
          <label class="label">Categories / Labels</label>
          <div class="flex gap-2">
            <input
              v-model="newCategory"
              type="text"
              class="input-field flex-1"
              placeholder="Add a category..."
              @keydown.enter.prevent="addCategory"
            />
            <button type="button" @click="addCategory" class="btn-secondary text-sm px-3">Add</button>
          </div>
          <div class="flex flex-wrap gap-2 mt-2">
            <span
              v-for="(cat, i) in form.categories"
              :key="i"
              class="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm"
            >
              {{ cat }}
              <button type="button" @click="form.categories.splice(i, 1)" class="hover:text-red-500">
                <i class="pi pi-times text-xs"></i>
              </button>
            </span>
          </div>
        </div>

        <div>
          <label class="label">Instructions for Workers</label>
          <textarea v-model="form.instructions" class="input-field min-h-[100px]" placeholder="Provide detailed instructions for annotators..."></textarea>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="label">Budget ($)</label>
            <input v-model.number="form.budget" type="number" step="0.01" min="0" class="input-field" placeholder="1000" required />
          </div>
          <div>
            <label class="label">Payout per Task ($)</label>
            <input v-model.number="form.payoutPerTask" type="number" step="0.01" min="0" class="input-field" placeholder="0.10" required />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="label">Quality Threshold (%)</label>
            <input v-model.number="form.qualityThreshold" type="number" min="0" max="100" class="input-field" placeholder="80" />
          </div>
        </div>

        <div>
          <label class="label">Data File (JSON/CSV)</label>
          <input
            type="file"
            accept=".json,.csv"
            @change="handleFile"
            class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/30 dark:file:text-indigo-300 hover:file:bg-indigo-100"
          />
        </div>
      </div>

      <div v-if="error" class="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
        {{ error }}
      </div>

      <div class="flex justify-end gap-3">
        <button type="button" @click="$router.back()" class="btn-secondary">Cancel</button>
        <button type="submit" :disabled="submitting" class="btn-primary">
          <span v-if="submitting" class="flex items-center gap-2">
            <i class="pi pi-spin pi-spinner"></i> Creating...
          </span>
          <span v-else>Create Project</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const router = useRouter()
const { post } = useApi()
const toast = useToast()

const form = reactive({
  title: '',
  description: '',
  taskType: '',
  categories: [] as string[],
  instructions: '',
  budget: 0,
  payoutPerTask: 0.1,
  qualityThreshold: 80,
})

const newCategory = ref('')
const dataFile = ref<File | null>(null)
const submitting = ref(false)
const error = ref('')

const addCategory = () => {
  const val = newCategory.value.trim()
  if (val && !form.categories.includes(val)) {
    form.categories.push(val)
  }
  newCategory.value = ''
}

const handleFile = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files?.length) {
    dataFile.value = target.files[0] ?? null
  }
}

const handleSubmit = async () => {
  error.value = ''
  submitting.value = true

  try {
    await post('/projects', {
      title: form.title,
      description: form.description,
      taskType: form.taskType,
      budget: form.budget,
      payoutPerTask: form.payoutPerTask,
      qualityThreshold: form.qualityThreshold,
      settings: {
        categories: form.categories,
        instructions: form.instructions,
      },
    })
    toast.success('Project created!')
    router.push('/dashboard/client/projects')
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Failed to create project'
  } finally {
    submitting.value = false
  }
}
</script>
