<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Platform Analytics</h1>

    <!-- Overview Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <SharedStatsCard title="Total Users" :value="overview.totalUsers" icon="pi pi-users" color="indigo" />
      <SharedStatsCard title="Total Projects" :value="overview.totalProjects" icon="pi pi-folder" color="blue" />
      <SharedStatsCard title="Tasks Completed" :value="overview.completedTasks" icon="pi pi-check-circle" color="green" />
      <SharedStatsCard title="Revenue" :value="`KES ${(overview.totalRevenue || 0).toLocaleString()}`" icon="pi pi-money-bill" color="yellow" />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <SharedStatsCard title="Workers" :value="overview.totalWorkers" icon="pi pi-user" color="purple" />
      <SharedStatsCard title="Clients" :value="overview.totalClients" icon="pi pi-briefcase" color="cyan" />
      <SharedStatsCard title="Total Payouts" :value="`KES ${(overview.totalPayouts || 0).toLocaleString()}`" icon="pi pi-send" color="red" />
      <SharedStatsCard title="Approval Rate" :value="`${approvalRates.approvalRate || 0}%`" icon="pi pi-thumbs-up" color="green" />
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Task Completion Trend -->
      <div class="card p-4 sm:p-6">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Tasks Completed (30 days)</h3>
        <div class="h-48 flex items-end gap-1">
          <div
            v-for="(day, idx) in taskTrend"
            :key="idx"
            class="flex-1 bg-indigo-500 rounded-t transition-all hover:bg-indigo-600"
            :style="{ height: `${getBarHeight(day.completed, maxTasks)}%` }"
            :title="`${day.date}: ${day.completed} tasks`"
          ></div>
        </div>
        <div class="flex justify-between mt-2 text-xs text-gray-400">
          <span>{{ taskTrend[0]?.date || '' }}</span>
          <span>{{ taskTrend[taskTrend.length - 1]?.date || '' }}</span>
        </div>
      </div>

      <!-- Revenue Trend -->
      <div class="card p-4 sm:p-6">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Revenue (30 days)</h3>
        <div class="h-48 flex items-end gap-1">
          <div
            v-for="(day, idx) in revenueTrend"
            :key="idx"
            class="flex-1 bg-green-500 rounded-t transition-all hover:bg-green-600"
            :style="{ height: `${getBarHeight(day.revenue, maxRevenue)}%` }"
            :title="`${day.date}: KES ${day.revenue.toLocaleString()}`"
          ></div>
        </div>
        <div class="flex justify-between mt-2 text-xs text-gray-400">
          <span>{{ revenueTrend[0]?.date || '' }}</span>
          <span>{{ revenueTrend[revenueTrend.length - 1]?.date || '' }}</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Quality Score Trend -->
      <div class="card p-4 sm:p-6">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Avg Quality Score (30 days)</h3>
        <div class="h-48 flex items-end gap-1">
          <div
            v-for="(day, idx) in qualityTrend"
            :key="idx"
            class="flex-1 bg-purple-500 rounded-t transition-all hover:bg-purple-600"
            :style="{ height: `${day.avgScore}%` }"
            :title="`${day.date}: ${day.avgScore}% (${day.count} reviews)`"
          ></div>
        </div>
        <div class="flex justify-between mt-2 text-xs text-gray-400">
          <span>{{ qualityTrend[0]?.date || '' }}</span>
          <span>{{ qualityTrend[qualityTrend.length - 1]?.date || '' }}</span>
        </div>
      </div>

      <!-- New Users Trend -->
      <div class="card p-4 sm:p-6">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">New Users (30 days)</h3>
        <div class="h-48 flex items-end gap-1">
          <div
            v-for="(day, idx) in usersTrend"
            :key="idx"
            class="flex-1 bg-cyan-500 rounded-t transition-all hover:bg-cyan-600"
            :style="{ height: `${getBarHeight(day.count, maxUsers)}%` }"
            :title="`${day.date}: ${day.count} users`"
          ></div>
        </div>
        <div class="flex justify-between mt-2 text-xs text-gray-400">
          <span>{{ usersTrend[0]?.date || '' }}</span>
          <span>{{ usersTrend[usersTrend.length - 1]?.date || '' }}</span>
        </div>
      </div>
    </div>

    <!-- Approval Breakdown & Leaderboard -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Approval Rates -->
      <div class="card p-4 sm:p-6">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Review Decisions</h3>
        <div class="space-y-3">
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600 dark:text-gray-400">Approved</span>
              <span class="font-medium text-green-600">{{ approvalRates.approved }} ({{ approvalRates.approvalRate }}%)</span>
            </div>
            <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div class="h-full bg-green-500 rounded-full" :style="{ width: `${approvalRates.approvalRate}%` }"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600 dark:text-gray-400">Rejected</span>
              <span class="font-medium text-red-600">{{ approvalRates.rejected }} ({{ approvalRates.rejectionRate }}%)</span>
            </div>
            <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div class="h-full bg-red-500 rounded-full" :style="{ width: `${approvalRates.rejectionRate}%` }"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600 dark:text-gray-400">Needs Revision</span>
              <span class="font-medium text-yellow-600">{{ approvalRates.needsRevision }}</span>
            </div>
            <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div class="h-full bg-yellow-500 rounded-full" :style="{ width: `${approvalRates.total > 0 ? Math.round((approvalRates.needsRevision / approvalRates.total) * 100) : 0}%` }"></div>
            </div>
          </div>
        </div>
        <p class="mt-3 text-xs text-gray-500">Total reviews: {{ approvalRates.total }}</p>
      </div>

      <!-- Leaderboard -->
      <div class="card p-4 sm:p-6">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Top Workers</h3>
        <SharedEmptyState v-if="!leaderboard.length" title="No workers yet" icon="pi pi-users" />
        <div v-else class="space-y-2">
          <div
            v-for="(worker, idx) in leaderboard"
            :key="worker._id"
            class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div class="flex items-center gap-3">
              <span class="text-sm font-bold text-gray-400 w-6">{{ idx + 1 }}</span>
              <div>
                <p class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ worker.firstName }} {{ worker.lastName }}</p>
                <p class="text-xs text-gray-500">Trust: {{ worker.trustScore }}%</p>
              </div>
            </div>
            <span class="text-sm font-semibold text-indigo-600">{{ worker.accuracyScore }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Average Payout & Project Completion -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card p-4 sm:p-6">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Average Payout</h3>
        <p class="text-3xl font-bold text-gray-900 dark:text-white">KES {{ avgPayout.averagePayout?.toLocaleString() || '0' }}</p>
        <p class="text-xs text-gray-500 mt-1">Across {{ avgPayout.totalPayouts || 0 }} payouts</p>
      </div>

      <div class="card p-4 sm:p-6">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Project Completion</h3>
        <SharedEmptyState v-if="!projectRates.length" title="No projects" icon="pi pi-folder" />
        <div v-else class="space-y-2 max-h-48 overflow-y-auto">
          <div v-for="proj in projectRates" :key="proj._id" class="flex items-center justify-between">
            <span class="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[60%]">{{ proj.title }}</span>
            <div class="flex items-center gap-2">
              <div class="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div class="h-full bg-indigo-500 rounded-full" :style="{ width: `${Math.round(proj.completionRate)}%` }"></div>
              </div>
              <span class="text-xs text-gray-500 w-10 text-right">{{ Math.round(proj.completionRate) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { get } = useApi()

const overview = ref<any>({})
const taskTrend = ref<any[]>([])
const revenueTrend = ref<any[]>([])
const qualityTrend = ref<any[]>([])
const usersTrend = ref<any[]>([])
const approvalRates = ref<any>({})
const leaderboard = ref<any[]>([])
const avgPayout = ref<any>({})
const projectRates = ref<any[]>([])

const maxTasks = computed(() => Math.max(...taskTrend.value.map((d) => d.completed), 1))
const maxRevenue = computed(() => Math.max(...revenueTrend.value.map((d) => d.revenue), 1))
const maxUsers = computed(() => Math.max(...usersTrend.value.map((d) => d.count), 1))

const getBarHeight = (value: number, max: number) => Math.max((value / max) * 100, 2)

const fetchAll = async () => {
  const [ov, tt, rt, ar, lb, ap, qt, ut, pr] = await Promise.all([
    get<any>('/analytics/overview').catch(() => ({ data: {} })),
    get<any[]>('/analytics/tasks/trend').catch(() => ({ data: [] })),
    get<any[]>('/analytics/revenue/trend').catch(() => ({ data: [] })),
    get<any>('/analytics/approval-rates').catch(() => ({ data: {} })),
    get<any[]>('/analytics/leaderboard').catch(() => ({ data: [] })),
    get<any>('/analytics/average-payout').catch(() => ({ data: {} })),
    get<any[]>('/analytics/quality/trend').catch(() => ({ data: [] })),
    get<any[]>('/analytics/users/trend').catch(() => ({ data: [] })),
    get<any[]>('/analytics/projects/completion').catch(() => ({ data: [] })),
  ])

  overview.value = ov.data || {}
  taskTrend.value = tt.data || []
  revenueTrend.value = rt.data || []
  approvalRates.value = ar.data || {}
  leaderboard.value = lb.data || []
  avgPayout.value = ap.data || {}
  qualityTrend.value = qt.data || []
  usersTrend.value = ut.data || []
  projectRates.value = pr.data || []
}

onMounted(fetchAll)
</script>
