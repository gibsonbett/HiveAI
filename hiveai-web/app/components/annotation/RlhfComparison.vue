<template>
  <div class="rlhf-comparison">
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
      Compare the two responses below and select which one is better, or rank them.
    </p>

    <!-- Prompt/Context -->
    <div v-if="prompt" class="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Prompt</p>
      <p class="text-sm text-gray-800 dark:text-gray-200">{{ prompt }}</p>
    </div>

    <!-- Side-by-side responses -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div
        v-for="(resp, idx) in responses"
        :key="idx"
        @click="selectResponse(idx)"
        class="relative p-4 rounded-lg border-2 cursor-pointer transition-all"
        :class="responseClass(idx)"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
            Response {{ String.fromCharCode(65 + idx) }}
          </span>
          <span
            v-if="selected === idx"
            class="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full"
          >
            Selected
          </span>
        </div>
        <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ resp }}</p>

        <!-- Quality scores -->
        <div v-if="selected === idx && showScoring" class="mt-4 space-y-3 border-t border-gray-200 dark:border-gray-700 pt-3">
          <div v-for="criterion in criteria" :key="criterion">
            <label class="text-xs font-medium text-gray-600 dark:text-gray-400">{{ criterion }}</label>
            <div class="flex items-center gap-1 mt-1">
              <button
                v-for="n in 5"
                :key="n"
                @click.stop="setScore(criterion, n)"
                class="w-7 h-7 rounded text-xs font-medium transition-colors"
                :class="(scores[criterion] || 0) >= n ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'"
              >
                {{ n }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tie option -->
    <div class="flex items-center gap-3 mb-4">
      <button
        @click="selectResponse(-1)"
        class="px-4 py-2 text-sm rounded-lg border transition-colors"
        :class="selected === -1 ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500 text-yellow-700 dark:text-yellow-400' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'"
      >
        Tie / Both equally good
      </button>
      <button
        @click="selectResponse(-2)"
        class="px-4 py-2 text-sm rounded-lg border transition-colors"
        :class="selected === -2 ? 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'"
      >
        Both bad
      </button>
    </div>

    <!-- Explanation -->
    <div>
      <label class="label">Explanation (optional)</label>
      <textarea
        v-model="explanation"
        class="input-field min-h-[80px]"
        placeholder="Why did you choose this response?"
        @input="emitUpdate"
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
interface RlhfResult {
  selected: number
  scores: Record<string, number>
  explanation: string
}

const props = withDefaults(defineProps<{
  prompt?: string
  responses: string[]
  showScoring?: boolean
  criteria?: string[]
}>(), {
  showScoring: true,
  criteria: () => ['Helpfulness', 'Accuracy', 'Safety', 'Clarity'],
})

const emit = defineEmits<{
  (e: 'update', result: RlhfResult): void
}>()

const selected = ref<number | null>(null)
const scores = ref<Record<string, number>>({})
const explanation = ref('')

const selectResponse = (idx: number) => {
  selected.value = idx
  emitUpdate()
}

const setScore = (criterion: string, value: number) => {
  scores.value[criterion] = value
  emitUpdate()
}

const responseClass = (idx: number) => {
  if (selected.value === idx) return 'border-green-500 bg-green-50 dark:bg-green-900/10'
  return 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
}

const emitUpdate = () => {
  if (selected.value === null) return
  emit('update', {
    selected: selected.value,
    scores: { ...scores.value },
    explanation: explanation.value,
  })
}
</script>
