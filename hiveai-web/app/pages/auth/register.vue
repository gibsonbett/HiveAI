<template>
  <div>
    <NuxtLink to="/" class="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 mb-6 transition underline decoration-2 underline-offset-2 hover:decoration-teal-600 dark:hover:decoration-teal-300">
      <i class="pi pi-arrow-left text-sm"></i>
      Back to home
    </NuxtLink>
    
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Create your HiveAI account</h2>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Choose your role and apply to join the platform.</p>

    <div v-if="registeredPending" class="mt-6 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800 dark:border-teal-700 dark:bg-teal-900/20 dark:text-teal-200">
      <p class="font-semibold">Signup submitted successfully</p>
      <p class="mt-1">We sent a confirmation email and your account is now awaiting admin approval.</p>
      <p class="mt-1">After approval, you will get another email and can log in.</p>
      <NuxtLink to="/auth/login" class="mt-3 inline-flex items-center font-medium text-teal-700 underline dark:text-teal-300">
        Go to login page
      </NuxtLink>
    </div>

    <form v-else @submit.prevent="handleRegister" class="mt-6 space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="label">First Name</label>
          <input v-model="form.firstName" type="text" class="input-field" placeholder="John" required />
        </div>
        <div>
          <label class="label">Last Name</label>
          <input v-model="form.lastName" type="text" class="input-field" placeholder="Doe" required />
        </div>
      </div>

      <div>
        <label class="label">Email</label>
        <input v-model="form.email" type="email" class="input-field" placeholder="you@example.com" required />
      </div>

      <div>
        <label class="label">Phone (optional)</label>
        <input v-model="form.phone" type="tel" class="input-field" placeholder="+254712345678" />
      </div>

      <div>
        <label class="label">I want to</label>
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            v-for="role in roles"
            :key="role.value"
            type="button"
            @click="form.role = role.value"
            :class="[
              'rounded-lg border p-3 text-left text-sm font-medium transition-all',
              form.role === role.value
                ? 'border-teal-500 bg-teal-50 text-teal-700 dark:border-teal-400 dark:bg-teal-900/30 dark:text-teal-300'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
            ]"
          >
            <i :class="role.icon" class="mb-2 block"></i>
            <span class="block">{{ role.label }}</span>
            <span class="mt-1 block text-xs font-normal opacity-80">{{ role.description }}</span>
          </button>
        </div>
      </div>

      <div v-if="form.role === 'worker'" class="rounded-lg border border-teal-100 bg-teal-50/50 p-3 dark:border-teal-900 dark:bg-teal-900/20">
        <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Worker details</p>
        <div class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <label class="label">Primary skill</label>
            <input v-model="extra.workerSkill" type="text" class="input-field" placeholder="Image annotation" />
          </div>
          <div>
            <label class="label">Availability</label>
            <select v-model="extra.workerAvailability" class="input-field">
              <option value="">Select availability</option>
              <option value="part-time">Part time</option>
              <option value="full-time">Full time</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="form.role === 'client'" class="rounded-lg border border-cyan-100 bg-cyan-50/50 p-3 dark:border-cyan-900 dark:bg-cyan-900/20">
        <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Client details</p>
        <div class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <label class="label">Company name</label>
            <input v-model="extra.clientCompany" type="text" class="input-field" placeholder="Acme AI" />
          </div>
          <div>
            <label class="label">Project scale</label>
            <select v-model="extra.clientScale" class="input-field">
              <option value="">Select scale</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="form.role === 'reviewer'" class="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 dark:border-emerald-900 dark:bg-emerald-900/20">
        <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Reviewer details</p>
        <div class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <label class="label">Expertise area</label>
            <input v-model="extra.reviewerExpertise" type="text" class="input-field" placeholder="NLP, CV, RLHF" />
          </div>
          <div>
            <label class="label">Review experience</label>
            <select v-model="extra.reviewerExperience" class="input-field">
              <option value="">Select experience</option>
              <option value="junior">0-1 years</option>
              <option value="mid">2-3 years</option>
              <option value="senior">4+ years</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label class="label">Password</label>
        <input v-model="form.password" type="password" class="input-field" placeholder="Min 8 characters" required minlength="8" />
      </div>

      <div>
        <label class="label">Confirm Password</label>
        <input v-model="confirmPassword" type="password" class="input-field" placeholder="••••••••" required />
      </div>

      <div v-if="formError" class="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
        {{ formError }}
      </div>

      <button type="submit" :disabled="loading" class="btn-primary w-full">
        <span v-if="loading" class="flex items-center justify-center gap-2">
          <i class="pi pi-spin pi-spinner"></i> Creating account...
        </span>
        <span v-else>Submit for approval</span>
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
      Already have an account?
      <NuxtLink to="/auth/login" class="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium">
        Sign in
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import type { UserRole } from '~/types/user'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const roles = [
  { value: 'worker' as UserRole, label: 'Work on tasks', icon: 'pi pi-briefcase', description: 'Earn by completing AI tasks' },
  { value: 'client' as UserRole, label: 'Post projects', icon: 'pi pi-database', description: 'Upload work and track quality' },
  { value: 'reviewer' as UserRole, label: 'Review work', icon: 'pi pi-check-square', description: 'Approve and improve outputs' },
]

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  role: 'worker' as UserRole,
})

const confirmPassword = ref('')
const formError = ref('')
const registeredPending = ref(false)
const extra = reactive({
  workerSkill: '',
  workerAvailability: '',
  clientCompany: '',
  clientScale: '',
  reviewerExpertise: '',
  reviewerExperience: '',
})

const { register, loading, error } = useAuth()
const toast = useToast()

const handleRegister = async () => {
  formError.value = ''

  if (form.password !== confirmPassword.value) {
    formError.value = 'Passwords do not match'
    return
  }

  try {
    const payload = { ...form }
    if (!payload.phone) delete (payload as any).phone
    await register(payload)
    registeredPending.value = true
    toast.success('Signup submitted. Awaiting approval.')
  } catch {
    formError.value = error.value || 'Registration failed'
  }
}
</script>
