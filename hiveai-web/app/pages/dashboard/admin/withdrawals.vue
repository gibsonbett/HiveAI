<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Pending Withdrawals</h1>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Review and approve worker withdrawal requests</p>

    <div class="mt-6">
      <SharedSkeletonLoader v-if="loading" type="table" :rows="5" />
      <SharedEmptyState v-else-if="!withdrawals.length" title="No pending withdrawals" message="All withdrawal requests have been processed" icon="pi pi-check-circle" />
      <div v-else class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Worker</th>
                <th class="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Amount</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">Phone</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">Date</th>
                <th class="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
              <tr v-for="w in withdrawals" :key="w._id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td class="px-4 py-3">
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ getUserName(w) }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ getUserEmail(w) }}</p>
                </td>
                <td class="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                  KES {{ w.amount.toFixed(2) }}
                </td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell">
                  {{ w.metadata?.phoneNumber || '-' }}
                </td>
                <td class="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs hidden sm:table-cell">
                  {{ new Date(w.createdAt).toLocaleDateString() }}
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="handleApprove(w._id)"
                      :disabled="processing === w._id"
                      class="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 transition-colors"
                    >
                      <i class="pi pi-check mr-1"></i> Approve
                    </button>
                    <button
                      @click="handleReject(w._id)"
                      :disabled="processing === w._id"
                      class="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"
                    >
                      <i class="pi pi-times mr-1"></i> Reject
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800">
          <p class="text-sm text-gray-500">Page {{ page }} of {{ totalPages }} ({{ total }} total)</p>
          <div class="flex gap-2">
            <button @click="page > 1 && (page--, fetch())" :disabled="page <= 1" class="btn-secondary text-sm py-1.5 px-3">Previous</button>
            <button @click="page < totalPages && (page++, fetch())" :disabled="page >= totalPages" class="btn-secondary text-sm py-1.5 px-3">Next</button>
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

const { get, post, loading } = useApi()
const toast = useToast()

const withdrawals = ref<any[]>([])
const page = ref(1)
const total = ref(0)
const totalPages = ref(0)
const processing = ref<string | null>(null)

const getUserName = (w: any) => {
  if (typeof w.userId === 'object') {
    return `${w.userId.firstName} ${w.userId.lastName}`
  }
  return '-'
}

const getUserEmail = (w: any) => {
  if (typeof w.userId === 'object') {
    return w.userId.email
  }
  return ''
}

const fetch = async () => {
  try {
    const res = await get<any[]>('/payments/withdrawals/pending', { page: page.value, limit: 20 })
    withdrawals.value = res.data || []
    total.value = res.meta?.total || 0
    totalPages.value = res.meta?.totalPages || 0
  } catch {
    toast.error('Failed to load withdrawals')
  }
}

const handleApprove = async (id: string) => {
  processing.value = id
  try {
    await post(`/payments/withdrawals/${id}/approve`)
    toast.success('Withdrawal approved')
    await fetch()
  } catch {
    toast.error('Failed to approve')
  } finally {
    processing.value = null
  }
}

const handleReject = async (id: string) => {
  processing.value = id
  try {
    await post(`/payments/withdrawals/${id}/reject`, { reason: 'Rejected by admin' })
    toast.success('Withdrawal rejected')
    await fetch()
  } catch {
    toast.error('Failed to reject')
  } finally {
    processing.value = null
  }
}

onMounted(fetch)
</script>
