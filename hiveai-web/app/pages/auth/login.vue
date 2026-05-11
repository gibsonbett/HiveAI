<template>
  <div>
    <NuxtLink to="/" class="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 mb-6 transition underline decoration-2 underline-offset-2 hover:decoration-teal-600 dark:hover:decoration-teal-300">
      <i class="pi pi-arrow-left text-sm"></i>
      Back to home
    </NuxtLink>
    
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Sign in</h2>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Welcome back to HiveAI</p>

    <div class="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-3 text-xs text-teal-800 dark:border-teal-700 dark:bg-teal-900/20 dark:text-teal-200">
      New signup? Your account must be approved by an admin before first login.
    </div>

    <form @submit.prevent="handleLogin" class="mt-6 space-y-4">
      <div>
        <label class="label">Email</label>
        <input v-model="form.email" type="email" class="input-field" placeholder="you@example.com" required />
      </div>

      <div>
        <label class="label">Password</label>
        <input v-model="form.password" type="password" class="input-field" placeholder="••••••••" required />
      </div>

      <div class="flex items-center justify-between">
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" class="rounded border-gray-300 dark:border-gray-600" />
          <span class="text-gray-600 dark:text-gray-400">Remember me</span>
        </label>
        <NuxtLink to="/auth/forgot-password" class="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
          Forgot password?
        </NuxtLink>
      </div>

      <div v-if="error" class="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
        {{ error }}
      </div>

      <div v-if="isPendingApprovalError" class="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm">
        Your account is still awaiting approval. Check your email for updates from HiveAI.
      </div>

      <button type="submit" :disabled="loading" class="btn-primary w-full">
        <span v-if="loading" class="flex items-center justify-center gap-2">
          <i class="pi pi-spin pi-spinner"></i> Signing in...
        </span>
        <span v-else>Sign in</span>
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
      Don't have an account?
      <NuxtLink to="/auth/register" class="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium">
        Sign up
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const form = reactive({
  email: '',
  password: '',
})

const { login, loading, error } = useAuth()
const toast = useToast()
const isPendingApprovalError = computed(() =>
  (error.value || '').toLowerCase().includes('awaiting admin approval')
)

const handleLogin = async () => {
  try {
    await login(form)
    toast.success('Welcome back!')
  } catch {
    // error is already set by useAuth
  }
}
</script>
