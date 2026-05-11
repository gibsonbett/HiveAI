<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-950/75" @click="close"></div>

      <div class="relative w-full max-w-4xl max-h-[90vh] rounded-2xl sm:rounded-3xl border border-white/10 bg-slate-950 text-white shadow-2xl flex flex-col">
        <div class="pointer-events-none absolute inset-0 rounded-2xl sm:rounded-3xl bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.28),transparent_55%),radial-gradient(circle_at_bottom_left,rgba(45,212,191,0.2),transparent_60%)]"></div>

        <div class="relative p-4 sm:p-6 lg:p-8 flex-shrink-0">
          <div class="flex items-start justify-between gap-3 sm:gap-4">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-amber-300">Upgrade Required</p>
              <h3 class="mt-2 text-lg sm:text-2xl font-semibold text-white">Unlock full access and withdrawals</h3>
              <p class="mt-2 text-xs sm:text-sm text-slate-300">
                Keep your workflow moving. Choose a plan to remove item limits and enable withdrawals.
              </p>
            </div>
            <button
              type="button"
              class="rounded-lg border border-white/20 px-2 sm:px-3 py-1 text-xs sm:text-sm text-slate-200 hover:bg-white/10 flex-shrink-0"
              @click="close"
            >
              Close
            </button>
          </div>
        </div>

        <div class="overflow-y-auto flex-grow relative">
          <div class="p-4 sm:p-6 lg:p-8">
            <div v-if="step === 'pick'" class="mt-4 sm:mt-6 grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
            <article
              v-for="plan in plans"
              :key="plan.id"
              :class="[
                'rounded-xl sm:rounded-2xl border p-3 sm:p-5 text-left transition-all',
                selectedPlanId === plan.id
                  ? 'border-amber-300 bg-amber-300/10 shadow-[0_0_0_1px_rgba(252,211,77,0.5)]'
                  : 'border-white/10 bg-white/5 hover:border-white/30'
              ]"
            >
              <div class="flex items-center justify-between gap-2">
                <p class="text-base sm:text-lg font-semibold">{{ plan.name }}</p>
                <span v-if="plan.isPopular" class="rounded-full bg-amber-300 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-slate-900 whitespace-nowrap flex-shrink-0">Most Popular</span>
              </div>
              <p class="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-300">{{ plan.subtitle }}</p>
              <p class="mt-3 sm:mt-4 text-2xl sm:text-3xl font-bold">
                ${{ plan.priceUsd.toFixed(2) }}
                <span class="text-xs sm:text-sm font-medium text-slate-300">/ month</span>
              </p>
              <p class="mt-1 text-[10px] sm:text-xs text-slate-400">(KES {{ plan.priceKes.toLocaleString() }} at 1 USD = KES {{ kesPerUsd.toFixed(2) }})</p>

              <ul class="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-slate-200">
                <li v-for="benefit in plan.benefits" :key="benefit" class="flex items-start gap-2">
                  <i class="pi pi-check text-emerald-300 mt-0.5 text-[10px] sm:text-xs flex-shrink-0"></i>
                  <span>{{ benefit }}</span>
                </li>
              </ul>

              <button
                type="button"
                class="mt-4 sm:mt-5 w-full rounded-lg sm:rounded-xl bg-amber-300 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-900 transition hover:bg-amber-200"
                @click="selectPlan(plan.id)"
              >
                Choose {{ plan.name }}
              </button>
            </article>
            </div>

            <div v-else-if="selectedPlan" class="mt-4 sm:mt-6 grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-[1.25fr_1fr]">
            <section class="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
              <p class="text-xs uppercase tracking-[0.18em] text-amber-300">Selected Plan</p>
              <h4 class="mt-2 text-lg sm:text-xl font-semibold">{{ selectedPlan.name }}</h4>
              <p class="mt-2 text-xs sm:text-sm text-slate-300">{{ selectedPlan.subtitle }}</p>
              <p class="mt-3 text-2xl sm:text-3xl font-bold">
                ${{ selectedPlan.priceUsd.toFixed(2) }}
                <span class="text-xs sm:text-sm font-medium text-slate-300">/ month</span>
              </p>
              <p class="mt-1 text-[10px] sm:text-xs text-slate-400">(KES {{ selectedPlan.priceKes.toLocaleString() }} at 1 USD = KES {{ kesPerUsd.toFixed(2) }})</p>

              <ul class="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-slate-200">
                <li v-for="benefit in selectedPlan.benefits" :key="benefit" class="flex items-start gap-2">
                  <i class="pi pi-check text-emerald-300 mt-0.5 text-[10px] sm:text-xs flex-shrink-0"></i>
                  <span>{{ benefit }}</span>
                </li>
              </ul>

              <button
                type="button"
                class="mt-4 sm:mt-5 rounded-lg sm:rounded-lg border border-white/20 px-3 py-1.5 text-xs sm:text-sm text-slate-200 hover:bg-white/10"
                @click="step = 'pick'"
              >
                Back to plans
              </button>
            </section>

            <form class="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5" @submit.prevent="startUpgrade">
              <label class="mb-2 block text-xs sm:text-sm text-slate-300">M-Pesa phone number</label>
              <input
                v-model="phoneNumber"
                type="tel"
                required
                placeholder="0712345678"
                class="w-full rounded-lg sm:rounded-xl border border-white/20 bg-slate-900 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:border-amber-300 focus:outline-none"
              />

              <div class="mt-3 sm:mt-4 rounded-lg sm:rounded-xl border border-white/10 bg-slate-900/70 p-3 text-xs sm:text-sm">
                <p class="text-slate-300">You are paying for</p>
                <p class="mt-1 font-semibold">{{ selectedPlan.name }} Plan</p>
                <p class="mt-1 text-slate-300">${{ selectedPlan.priceUsd.toFixed(2) }} (KES {{ selectedPlan.priceKes.toLocaleString() }})</p>
              </div>

              <button
                type="submit"
                :disabled="submitting || !selectedPlanId"
                class="mt-4 w-full rounded-lg sm:rounded-xl bg-amber-300 px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-900 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span v-if="submitting">Sending STK...</span>
                <span v-else>Pay via M-Pesa</span>
              </button>
            </form>
            </div>

            <form v-else class="mt-4 sm:mt-6 grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-[1fr_auto]" @submit.prevent="startUpgrade">
            <div>
              <label class="mb-2 block text-xs sm:text-sm text-slate-300">M-Pesa phone number</label>
              <input
                v-model="phoneNumber"
                type="tel"
                required
                placeholder="0712345678"
                class="w-full rounded-lg sm:rounded-xl border border-white/20 bg-slate-900 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:border-amber-300 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              :disabled="submitting || !selectedPlanId"
              class="self-end rounded-lg sm:rounded-xl bg-amber-300 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-900 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span v-if="submitting">Sending STK...</span>
              <span v-else>Pay via M-Pesa</span>
            </button>
            </form>
          </div>
        </div>

        <p class="mt-2 sm:mt-3 text-xs text-slate-400 p-4 sm:p-6 lg:p-8 flex-shrink-0 border-t border-white/10">
          We will trigger an STK prompt to your phone. Access updates automatically once payment is confirmed.
        </p>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue'

interface Plan {
  id: 'basic' | 'silver' | 'gold' | 'platinum'
  name: string
  subtitle: string
  priceUsd: number
  priceKes: number
  benefits: string[]
  isPopular?: boolean
}

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'upgraded'): void
}>()

const { get, post } = useApi()
const toast = useToast()

const fallbackPlans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    subtitle: 'Unlock full item access after trial',
    priceUsd: 30,
    priceKes: 3870,
    benefits: [
      'Unlimited access to available tasks',
      'Unlimited review queue visibility',
      'Priority support response within 48h',
    ],
  },
  {
    id: 'silver',
    name: 'Silver',
    subtitle: 'Full access + withdrawals enabled',
    priceUsd: 55,
    priceKes: 7095,
    benefits: [
      'Everything in Basic',
      'Withdrawals unlocked',
      'Faster payout processing window',
      'Priority support response within 24h',
    ],
    isPopular: true,
  },
  {
    id: 'gold',
    name: 'Gold',
    subtitle: 'Higher-tier access for heavy contributors',
    priceUsd: 85,
    priceKes: 10965,
    benefits: [
      'Everything in Silver',
      'Higher priority in task assignment pools',
      'Early access to new task batches',
      'Priority support response within 12h',
    ],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    subtitle: 'Top-tier plan with maximum access priority',
    priceUsd: 120,
    priceKes: 15480,
    benefits: [
      'Everything in Gold',
      'Top priority access across eligible projects',
      'Dedicated support queue',
      'Fastest payout processing lane',
    ],
  },
]

const plans = ref<Plan[]>([])
const kesPerUsd = ref(129)
const selectedPlanId = ref<'basic' | 'silver' | 'gold' | 'platinum'>('basic')
const step = ref<'pick' | 'pay'>('pick')
const phoneNumber = ref('')
const submitting = ref(false)

const selectedPlan = computed(() => plans.value.find((plan) => plan.id === selectedPlanId.value) || null)

const selectPlan = (planId: Plan['id']) => {
  selectedPlanId.value = planId
  step.value = 'pay'
}

const getErrorMessage = (error: unknown, fallback: string) => {
  const err = error as { response?: { data?: { message?: string } }; message?: string }
  return err?.response?.data?.message || err?.message || fallback
}

const fetchPlans = async () => {
  try {
    const response = await get<{ plans: Plan[]; kesPerUsd: number }>('/payments/plans')
    const apiPlans = response.data?.plans || []
    plans.value = apiPlans.length ? apiPlans : fallbackPlans
    kesPerUsd.value = response.data?.kesPerUsd || 129
    if (!apiPlans.length) {
      plans.value = fallbackPlans.map((plan) => ({
        ...plan,
        priceKes: Number((plan.priceUsd * kesPerUsd.value).toFixed(2)),
      }))
    }
    if (plans.value[0]?.id) {
      selectedPlanId.value = plans.value[0].id
    }
  } catch (error) {
    plans.value = fallbackPlans.map((plan) => ({
      ...plan,
      priceKes: Number((plan.priceUsd * kesPerUsd.value).toFixed(2)),
    }))
    toast.error(getErrorMessage(error, 'Failed to load plans from server, showing default plans'))
  }
}

const close = () => {
  emit('update:modelValue', false)
}

const startUpgrade = async () => {
  if (!selectedPlanId.value) return

  submitting.value = true
  try {
    await post('/payments/plans/upgrade', {
      planId: selectedPlanId.value,
      phoneNumber: phoneNumber.value,
    })
    toast.success('STK prompt sent. Complete payment on your phone.')
    emit('upgraded')
    close()
  } catch (error) {
    toast.error(getErrorMessage(error, 'Failed to start upgrade payment'))
  } finally {
    submitting.value = false
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      step.value = 'pick'
      fetchPlans()
    }
  },
  { immediate: true }
)
</script>
