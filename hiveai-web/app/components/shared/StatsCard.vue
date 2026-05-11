<template>
  <div class="card p-4 sm:p-6">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ title }}</p>
        <p class="mt-1 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{{ value }}</p>
        <p v-if="subtitle" class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ subtitle }}</p>
      </div>
      <div :class="iconBgClass" class="p-3 rounded-xl">
        <i :class="icon" class="text-lg"></i>
      </div>
    </div>
    <div v-if="change !== undefined" class="mt-3 flex items-center text-sm">
      <span :class="change >= 0 ? 'text-green-600' : 'text-red-600'" class="font-medium">
        {{ change >= 0 ? '+' : '' }}{{ change }}%
      </span>
      <span class="ml-1 text-gray-500 dark:text-gray-400">vs last period</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  value: string | number
  subtitle?: string
  icon?: string
  iconBgClass?: string
  change?: number
}

withDefaults(defineProps<Props>(), {
  icon: 'pi pi-chart-bar',
  iconBgClass: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
})
</script>
