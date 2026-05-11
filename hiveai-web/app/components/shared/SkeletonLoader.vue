<template>
  <div class="animate-pulse">
    <div v-if="type === 'card'" class="card p-6 space-y-4">
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
    </div>
    <div v-else-if="type === 'table'" class="space-y-3">
      <div v-for="i in rows" :key="i" class="flex gap-4">
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </div>
    </div>
    <div v-else class="space-y-3">
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'card' | 'table' | 'text'
  rows?: number
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  rows: 5,
})
</script>
