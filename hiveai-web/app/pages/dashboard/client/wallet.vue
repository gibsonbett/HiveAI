<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Wallet & Deposits</h1>

    <!-- Balance Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      <SharedStatsCard
        title="Wallet Balance"
        :value="`KES ${wallet.walletBalance?.toLocaleString() || '0'}`"
        icon="pi pi-wallet"
        color="indigo"
      />
      <SharedStatsCard
        title="Pending Balance"
        :value="`KES ${wallet.pendingBalance?.toLocaleString() || '0'}`"
        icon="pi pi-clock"
        color="yellow"
      />
    </div>

    <!-- Deposit Form -->
    <div class="card p-4 sm:p-6 mb-8">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Deposit via M-Pesa</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Fund your wallet to pay for projects and tasks.</p>
      <SharedTipTool message="Use a reachable phone number. STK confirmation can take a few seconds before the wallet updates." />

      <form @submit.prevent="handleDeposit" class="space-y-4 max-w-md">
        <div>
          <label class="label">Phone Number</label>
          <input
            v-model="depositForm.phoneNumber"
            type="tel"
            class="input-field"
            placeholder="0712345678"
            required
          />
        </div>
        <div>
          <label class="label">Amount (KES)</label>
          <input
            v-model.number="depositForm.amount"
            type="number"
            class="input-field"
            placeholder="1000"
            min="10"
            required
          />
        </div>
        <button type="submit" :disabled="depositing" class="btn-primary w-full sm:w-auto">
          <span v-if="depositing" class="flex items-center gap-2">
            <i class="pi pi-spin pi-spinner"></i> Processing...
          </span>
          <span v-else><i class="pi pi-money-bill mr-1"></i> Deposit</span>
        </button>
      </form>
    </div>

    <!-- Transaction History -->
    <div class="card p-4 sm:p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transaction History</h2>

      <SharedSkeletonLoader v-if="loading" type="table" />

      <SharedEmptyState
        v-else-if="!transactions.length"
        title="No transactions yet"
        message="Your deposit history will appear here"
        icon="pi pi-money-bill"
      />

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <th class="pb-2 font-medium">Date</th>
              <th class="pb-2 font-medium">Type</th>
              <th class="pb-2 font-medium">Amount</th>
              <th class="pb-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="tx in transactions"
              :key="tx._id"
              class="border-b border-gray-100 dark:border-gray-800"
            >
              <td class="py-3 text-gray-700 dark:text-gray-300">
                {{ new Date(tx.createdAt).toLocaleDateString() }}
              </td>
              <td class="py-3">
                <span class="capitalize text-gray-700 dark:text-gray-300">{{ tx.type }}</span>
              </td>
              <td class="py-3 font-medium" :class="tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'">
                {{ tx.type === 'deposit' ? '+' : '-' }}KES {{ tx.amount.toLocaleString() }}
              </td>
              <td class="py-3">
                <SharedStatusBadge :status="tx.status" />
              </td>
            </tr>
          </tbody>
        </table>
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

const wallet = ref({ walletBalance: 0, pendingBalance: 0 })
const transactions = ref<any[]>([])
const depositing = ref(false)
const depositForm = ref({ phoneNumber: '', amount: null as number | null })
const loadErrorShown = ref(false)

const getErrorMessage = (error: unknown, fallback: string) => {
  const err = error as { response?: { data?: { message?: string } }; message?: string }
  return err?.response?.data?.message || err?.message || fallback
}

const fetchWallet = async () => {
  try {
    const res = await get<any>('/payments/wallet')
    wallet.value = res.data || { walletBalance: 0, pendingBalance: 0 }
  } catch (error) {
    if (!loadErrorShown.value) {
      toast.error(getErrorMessage(error, 'Failed to load wallet information'))
      loadErrorShown.value = true
    }
  }
}

const fetchTransactions = async () => {
  try {
    const res = await get<any[]>('/payments/transactions')
    transactions.value = res.data || []
  } catch (error) {
    if (!loadErrorShown.value) {
      toast.error(getErrorMessage(error, 'Failed to load transactions'))
      loadErrorShown.value = true
    }
  }
}

const handleDeposit = async () => {
  if (!depositForm.value.amount || depositForm.value.amount < 10) {
    toast.error('Minimum deposit is KES 10')
    return
  }
  if (!depositForm.value.phoneNumber) {
    toast.error('Phone number is required')
    return
  }

  depositing.value = true
  try {
    await post('/payments/deposit', {
      amount: depositForm.value.amount,
      phoneNumber: depositForm.value.phoneNumber,
    })
    toast.success('STK Push sent! Check your phone to confirm.')
    depositForm.value = { phoneNumber: '', amount: null }
    // Refresh after a delay
    setTimeout(() => {
      fetchWallet()
      fetchTransactions()
    }, 5000)
  } catch (error) {
    toast.error(getErrorMessage(error, 'Failed to initiate deposit'))
  } finally {
    depositing.value = false
  }
}

onMounted(() => {
  fetchWallet()
  fetchTransactions()
})
</script>
