<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Reviewer Dashboard</h1>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Review worker submissions</p>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <SharedStatsCard title="Queue" :value="stats.pending" icon="pi pi-inbox" />
      <SharedStatsCard
        title="Reviewed"
        :value="stats.reviewed"
        icon="pi pi-check-circle"
        icon-bg-class="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
      />
      <SharedStatsCard
        title="Approved"
        :value="stats.approved"
        icon="pi pi-thumbs-up"
        icon-bg-class="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
      />
      <SharedStatsCard
        title="Rejected"
        :value="stats.rejected"
        icon="pi pi-thumbs-down"
        icon-bg-class="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
      />
    </div>

    <div class="mt-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Pending Reviews</h2>
        <NuxtLink to="/dashboard/reviewer/queue" class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
          View all <i class="pi pi-arrow-right text-xs"></i>
        </NuxtLink>
      </div>

      <SharedSkeletonLoader v-if="loading" type="card" />
      <SharedEmptyState v-else-if="!reviews.length" title="Queue empty" message="No tasks pending review" />
      <div v-else class="space-y-3">
        <NuxtLink
          v-for="review in reviews"
          :key="review._id"
          :to="`/dashboard/reviewer/review-${review._id}`"
          class="card p-4 block hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between">
            <div>
              <SharedStatusBadge :status="getTaskType(review)" />
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ getProjectName(review) }}</p>
            </div>
            <i class="pi pi-chevron-right text-gray-400"></i>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { get, loading } = useApi()

const stats = ref({ pending: 0, reviewed: 0, approved: 0, rejected: 0 })
const reviews = ref<any[]>([])

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
  return 'Task review'
}

onMounted(async () => {
  try {
    const [statsRes, queueRes] = await Promise.all([
      get<any>('/reviews/stats'),
      get<any[]>('/reviews/queue', { limit: 5 }),
    ])
    if (statsRes.data) stats.value = { ...stats.value, ...statsRes.data }
    if (queueRes.data) reviews.value = queueRes.data
  } catch {
    // defaults
  }
})
</script>
