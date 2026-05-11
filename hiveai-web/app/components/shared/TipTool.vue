<template>
  <div class="inline-flex items-start gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-900/20 dark:text-indigo-300">
    <i class="pi pi-info-circle mt-0.5" :title="message"></i>
    <p>{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>
