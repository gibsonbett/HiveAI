<template>
  <span :class="colorClass" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize">
    {{ label || status }}
  </span>
</template>

<script setup lang="ts">
import { STATUS_COLORS } from '~/utils/constants'

interface Props {
  status: string
  label?: string
}

const props = defineProps<Props>()

const colorClass = computed(() => {
  return STATUS_COLORS[props.status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
})
</script>
