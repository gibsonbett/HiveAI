<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Review Queue</h1>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Tasks awaiting your review</p>

    <div class="mt-6">
      <SharedSkeletonLoader v-if="loading" type="table" :rows="8" />
      <SharedEmptyState v-else-if="!reviews.length" title="Queue empty" message="No tasks pending review right now" />
      <div v-else class="space-y-3">
        <button
          v-for="(review, index) in reviews"
          :key="review._id"
          type="button"
          class="card p-4 block hover:shadow-md transition-shadow w-full text-left"
          @click="handleOpenReview(review._id, index)"
        >
          <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div :class="['flex-1 min-w-0 transition', reviewIsLocked(index) ? 'blur-[2px] opacity-65 pointer-events-none select-none' : '']">
              <div class="flex items-center gap-2 flex-wrap">
                <SharedStatusBadge :status="getTaskType(review)" />
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ getProjectName(review) }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="rounded-full px-2 py-0.5 text-xs font-medium"
                :class="reviewIsLocked(index) ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'"
              >
                {{ reviewIsLocked(index) ? 'Upgrade' : 'Open' }}
              </span>
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ new Date(review.createdAt).toLocaleDateString() }}
              </span>
              <i class="pi pi-chevron-right text-gray-400"></i>
            </div>
          </div>
        </button>

        <div v-if="totalPages > 1" class="flex items-center justify-between mt-4">
          <p class="text-sm text-gray-500">Page {{ page }} of {{ totalPages }}</p>
          <div class="flex gap-2">
            <button @click="page > 1 && (page--, fetchQueue())" :disabled="page <= 1" class="btn-secondary text-sm py-1.5 px-3">Previous</button>
            <button @click="page < totalPages && (page++, fetchQueue())" :disabled="page >= totalPages" class="btn-secondary text-sm py-1.5 px-3">Next</button>
          </div>
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
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { get, loading } = useApi()
const authStore = useAuthStore()
const router = useRouter()

const reviews = ref<any[]>([])
const page = ref(1)
const totalPages = ref(0)
const showUpgradeModal = ref(false)
const subscription = ref({
  status: 'inactive',
  trialUsageCount: 0,
  trialLimit: 3,
  unlockedItems: 3,
})

const isSubscribed = computed(() => subscription.value.status === 'active')
const unlockedItems = computed(() => {
  if (isSubscribed.value) return Number.MAX_SAFE_INTEGER
  return Math.max(subscription.value.unlockedItems ?? 0, 0)
})

const getTaskType = (task: any) => {
  if (typeof task.projectId === 'object' && task.projectId?.taskType) {
    return task.projectId.taskType
  }
  return 'review'
}

const getProjectName = (task: any) => {
  if (typeof task.projectId === 'object' && task.projectId?.title) {
    return task.projectId.title
  }
  return 'Pending review'
}

const reviewIsLocked = (index: number) => {
  if (authStore.user?.role !== 'reviewer') return false
  return !isSubscribed.value && index >= unlockedItems.value
}

const handleOpenReview = (reviewId: string, index: number) => {
  if (reviewIsLocked(index)) {
    showUpgradeModal.value = true
    return
  }
  router.push(`/dashboard/reviewer/review-${reviewId}`)
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

const fetchQueue = async () => {
  try {
    const response = await get<any[]>('/reviews/queue', { page: page.value, limit: 20 })
    reviews.value = response.data || []
    totalPages.value = response.meta?.totalPages || 0
  } catch {
    // empty
  }
}

onMounted(fetchQueue)
onMounted(fetchSubscription)
</script>
