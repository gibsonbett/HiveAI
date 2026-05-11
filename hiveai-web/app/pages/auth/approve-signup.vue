<template>
  <div>
    <NuxtLink to="/" class="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 mb-6 transition underline decoration-2 underline-offset-2 hover:decoration-teal-600 dark:hover:decoration-teal-300">
      <i class="pi pi-arrow-left text-sm"></i>
      Back to home
    </NuxtLink>
    
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Signup approval</h2>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Processing secure approval link</p>

    <div v-if="loading" class="mt-6 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-600 dark:text-gray-300">
      <span class="inline-flex items-center gap-2">
        <i class="pi pi-spin pi-spinner"></i>
        Verifying link and approving account...
      </span>
    </div>

    <div v-else-if="approved" class="mt-6 rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800 dark:border-teal-700 dark:bg-teal-900/20 dark:text-teal-200">
      <p class="font-semibold">User approved successfully</p>
      <p class="mt-1">The applicant can now log in after receiving their approval email.</p>
      <NuxtLink to="/dashboard/admin/users" class="mt-3 inline-flex items-center font-medium underline">
        Open user management
      </NuxtLink>
    </div>

    <div v-else class="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
      <p class="font-semibold">Approval failed</p>
      <p class="mt-1">{{ errorMessage }}</p>
      <NuxtLink to="/dashboard/admin/users" class="mt-3 inline-flex items-center font-medium underline">
        Go to user management
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const route = useRoute()
const { post } = useApi()

const loading = ref(true)
const approved = ref(false)
const errorMessage = ref('Invalid or expired approval link.')

const runApproval = async () => {
  const token = String(route.query.token || '')
  const userId = String(route.query.userId || '')

  if (!token || !userId) {
    loading.value = false
    return
  }

  try {
    await post('/auth/approve-signup', { token, userId })
    approved.value = true
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.message || 'Approval could not be completed.'
  } finally {
    loading.value = false
  }
}

onMounted(runApproval)
</script>
