<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <SharedToastContainer />
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/ui'
import SharedToastContainer from '~/components/shared/ToastContainer.vue'

const uiStore = useUiStore()

onMounted(() => {
  uiStore.initDarkMode()
})
</script>
