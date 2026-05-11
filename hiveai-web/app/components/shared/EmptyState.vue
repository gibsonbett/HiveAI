<template>
  <div class="text-center py-12">
    <i :class="icon" class="text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
    <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ title }}</h3>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ message }}</p>
    <div v-if="actionLabel" class="mt-4">
      <button @click="$emit('action')" class="btn-primary text-sm">{{ actionLabel }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  message?: string
  icon?: string
  actionLabel?: string
}

withDefaults(defineProps<Props>(), {
  title: 'No data',
  message: 'There is nothing to display yet.',
  icon: 'pi pi-inbox',
})

defineEmits<{ action: [] }>()
</script>
