<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Wallet</h1>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your earnings and withdrawals</p>

    <!-- Balance Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
      <div class="card p-5">
        <p class="text-sm text-gray-500 dark:text-gray-400">Available Balance</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          ${{ kesToUsd(wallet.walletBalance).toFixed(2) }}
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">(KES {{ wallet.walletBalance.toFixed(2) }})</p>
      </div>
      <div class="card p-5">
        <p class="text-sm text-gray-500 dark:text-gray-400">Pending Withdrawals</p>
        <p class="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
          ${{ kesToUsd(wallet.pendingBalance).toFixed(2) }}
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">(KES {{ wallet.pendingBalance.toFixed(2) }})</p>
      </div>
      <div class="card p-5">
        <p class="text-sm text-gray-500 dark:text-gray-400">Total Earned</p>
        <p class="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">${{ kesToUsd(totalEarned).toFixed(2) }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">(KES {{ totalEarned.toFixed(2) }})</p>
      </div>
    </div>

    <!-- Withdraw Form -->
    <div class="mt-8 card p-4 sm:p-6 max-w-lg">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Withdraw via M-Pesa</h2>
      <SharedTipTool message="Use your registered M-Pesa number. Amounts are shown in USD and converted to KES during payout." />

      <div
        v-if="!canWithdraw"
        class="mb-4 rounded-xl border border-amber-300/30 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700/40 dark:bg-amber-900/20 dark:text-amber-200"
      >
        Withdrawals are locked on the free and basic plans. Upgrade to Silver or above to unlock payouts.
        <button type="button" class="ml-2 underline font-medium" @click="showUpgradeModal = true">Upgrade now</button>
      </div>

      <form @submit.prevent="handleWithdraw" class="space-y-4">
        <div>
          <label class="label">Phone Number</label>
          <input
            v-model="withdrawForm.phoneNumber"
            type="tel"
            class="input-field"
            placeholder="0712345678"
            required
          />
        </div>
        <div>
          <label class="label">Amount (USD)</label>
          <input
            v-model.number="withdrawForm.amountUsd"
            type="number"
            min="1"
            :max="kesToUsd(wallet.walletBalance)"
            step="0.01"
            class="input-field"
            placeholder="1.00"
            required
          />
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Minimum: $1.00 (approx KES {{ usdToKes(1).toFixed(2) }})
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            You will receive approx KES {{ usdToKes(withdrawForm.amountUsd || 0).toFixed(2) }} at 1 USD = KES {{ kesPerUsd.toFixed(2) }}
          </p>
        </div>

        <div v-if="withdrawError" class="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
          {{ withdrawError }}
        </div>

        <button
          type="submit"
          :disabled="withdrawing || !canWithdraw || withdrawForm.amountUsd < 1 || usdToKes(withdrawForm.amountUsd) > wallet.walletBalance"
          class="btn-primary w-full"
        >
          <span v-if="withdrawing" class="flex items-center justify-center gap-2">
            <i class="pi pi-spin pi-spinner"></i> Processing...
          </span>
          <span v-else>Withdraw ${{ (withdrawForm.amountUsd || 0).toFixed(2) }}</span>
        </button>
      </form>
    </div>

    <!-- Transaction History -->
    <div class="mt-8">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transaction History</h2>

      <SharedSkeletonLoader v-if="loading" type="table" :rows="5" />
      <SharedEmptyState v-else-if="!transactions.length" title="No transactions" message="Your earnings and withdrawals will appear here" icon="pi pi-wallet" />
      <div v-else class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Type</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Description</th>
                <th class="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Amount</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
              <tr v-for="tx in transactions" :key="tx._id">
                <td class="px-4 py-3">
                  <span
                    :class="[
                      'inline-flex items-center gap-1 text-xs font-medium',
                      tx.type === 'earning' || tx.type === 'deposit' || tx.type === 'bonus'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    ]"
                  >
                    <i :class="tx.type === 'withdrawal' ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"></i>
                    {{ tx.type }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-400 truncate max-w-[200px]">{{ tx.description }}</td>
                <td class="px-4 py-3 text-right font-medium"
                  :class="tx.type === 'withdrawal' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'"
                >
                  {{ tx.type === 'withdrawal' ? '-' : '+' }}${{ kesToUsd(tx.amount).toFixed(2) }}
                  <span class="text-xs text-gray-500 dark:text-gray-400">(KES {{ tx.amount.toFixed(2) }})</span>
                </td>
                <td class="px-4 py-3"><SharedStatusBadge :status="tx.status" /></td>
                <td class="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs hidden sm:table-cell">
                  {{ new Date(tx.createdAt).toLocaleDateString() }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800">
          <p class="text-sm text-gray-500">Page {{ page }} of {{ totalPages }}</p>
          <div class="flex gap-2">
            <button @click="page > 1 && (page--, fetchTransactions())" :disabled="page <= 1" class="btn-secondary text-sm py-1.5 px-3">Previous</button>
            <button @click="page < totalPages && (page++, fetchTransactions())" :disabled="page >= totalPages" class="btn-secondary text-sm py-1.5 px-3">Next</button>
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
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { get, post, loading } = useApi()
const toast = useToast()

const wallet = ref({ walletBalance: 0, pendingBalance: 0 })
const totalEarned = ref(0)
const transactions = ref<any[]>([])
const page = ref(1)
const totalPages = ref(0)
const kesPerUsd = ref(129)
const canWithdraw = ref(false)
const showUpgradeModal = ref(false)

const withdrawForm = reactive({ phoneNumber: '', amountUsd: 1 })
const withdrawing = ref(false)
const withdrawError = ref('')
const loadErrorShown = ref(false)

const getErrorMessage = (error: unknown, fallback: string) => {
  const err = error as { response?: { data?: { message?: string } }; message?: string }
  return err?.response?.data?.message || err?.message || fallback
}

const kesToUsd = (amountKes: number) => {
  return kesPerUsd.value > 0 ? amountKes / kesPerUsd.value : 0
}

const usdToKes = (amountUsd: number) => {
  return amountUsd * kesPerUsd.value
}

const fetchWallet = async () => {
  try {
    const res = await get<any>('/payments/wallet')
    if (res.data) wallet.value = res.data
  } catch (error) {
    if (!loadErrorShown.value) {
      toast.error(getErrorMessage(error, 'Failed to load wallet information'))
      loadErrorShown.value = true
    }
  }
}

const fetchSubscription = async () => {
  try {
    const res = await get<any>('/payments/subscription')
    if (res.data) {
      kesPerUsd.value = res.data.kesPerUsd || kesPerUsd.value
      canWithdraw.value = res.data.status === 'active' && ['silver', 'gold', 'platinum', 'pro', 'elite'].includes(res.data.plan)
    }
  } catch {
    canWithdraw.value = false
  }
}

const fetchTransactions = async () => {
  try {
    const res = await get<any[]>('/payments/transactions', { page: page.value, limit: 20 })
    transactions.value = res.data || []
    totalPages.value = res.meta?.totalPages || 0

    // Calculate total earned from all earning transactions
    const earningTxs = transactions.value.filter(t => t.type === 'earning' && t.status === 'completed')
    totalEarned.value = earningTxs.reduce((sum, t) => sum + t.amount, 0)
  } catch (error) {
    if (!loadErrorShown.value) {
      toast.error(getErrorMessage(error, 'Failed to load transaction history'))
      loadErrorShown.value = true
    }
  }
}

const handleWithdraw = async () => {
  withdrawError.value = ''
  withdrawing.value = true
  try {
    await post('/payments/withdraw', {
      amountUsd: withdrawForm.amountUsd,
      phoneNumber: withdrawForm.phoneNumber,
    })
    toast.success('Withdrawal request submitted!')
    withdrawForm.amountUsd = 1
    withdrawForm.phoneNumber = ''
    await fetchWallet()
    await fetchTransactions()
  } catch (error) {
    withdrawError.value = getErrorMessage(error, 'Withdrawal failed')
    toast.error(withdrawError.value)
  } finally {
    withdrawing.value = false
  }
}

const handleUpgraded = async () => {
  await fetchSubscription()
}

onMounted(async () => {
  await Promise.all([fetchWallet(), fetchTransactions(), fetchSubscription()])
})
</script>
