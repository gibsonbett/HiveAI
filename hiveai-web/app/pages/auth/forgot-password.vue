<template>
  <div>
    <NuxtLink to="/" class="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 mb-6 transition underline decoration-2 underline-offset-2 hover:decoration-teal-600 dark:hover:decoration-teal-300">
      <i class="pi pi-arrow-left text-sm"></i>
      Back to home
    </NuxtLink>
    
    <h2 class="text-xl font-bold text-gray-900 dark:text-white">Forgot password</h2>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Enter your email to receive a reset link</p>

    <form v-if="!sent" @submit.prevent="handleSubmit" class="mt-6 space-y-4">
      <div>
        <label class="label">Email</label>
        <input v-model="email" type="email" class="input-field" placeholder="you@example.com" required />
      </div>

      <button type="submit" :disabled="loading" class="btn-primary w-full">
        <span v-if="loading" class="flex items-center justify-center gap-2">
          <i class="pi pi-spin pi-spinner"></i> Sending...
        </span>
        <span v-else>Send reset link</span>
      </button>
    </form>

    <div v-else class="mt-6 text-center">
      <i class="pi pi-check-circle text-4xl text-green-500 mb-4"></i>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        If an account with that email exists, we've sent a password reset link.
      </p>
    </div>

    <p class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
      <NuxtLink to="/auth/login" class="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium">
        Back to sign in
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const email = ref('')
const sent = ref(false)
const { loading, post } = useApi()

const handleSubmit = async () => {
  try {
    await post('/auth/forgot-password', { email: email.value })
    sent.value = true
  } catch {
    // Still show success to not reveal if email exists
    sent.value = true
  }
}
</script>
