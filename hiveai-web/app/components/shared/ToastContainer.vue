<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[100] space-y-2 w-full max-w-sm pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="toastClass(toast.type)"
          class="pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-lg border"
        >
          <i :class="iconClass(toast.type)" class="mt-0.5"></i>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium">{{ toast.title }}</p>
            <p v-if="toast.message" class="text-sm opacity-80 mt-0.5">{{ toast.message }}</p>
          </div>
          <button @click="remove(toast.id)" class="opacity-60 hover:opacity-100">
            <i class="pi pi-times text-sm"></i>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { toasts, remove } = useToast()

const toastClass = (type: string) => ({
  'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/50 dark:border-green-800 dark:text-green-200': type === 'success',
  'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/50 dark:border-red-800 dark:text-red-200': type === 'error',
  'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:border-yellow-800 dark:text-yellow-200': type === 'warning',
  'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/50 dark:border-blue-800 dark:text-blue-200': type === 'info',
})

const iconClass = (type: string) => ({
  'pi pi-check-circle': type === 'success',
  'pi pi-times-circle': type === 'error',
  'pi pi-exclamation-triangle': type === 'warning',
  'pi pi-info-circle': type === 'info',
}[type])
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}
.toast-leave-active {
  transition: all 0.2s ease-in;
}
.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
