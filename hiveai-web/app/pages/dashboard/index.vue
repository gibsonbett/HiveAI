<template>
  <div></div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const authStore = useAuthStore()
const validRoles = new Set(['admin', 'client', 'worker', 'reviewer'])
const role = authStore.userRole

if (role && validRoles.has(role)) {
  navigateTo(`/dashboard/${role}`)
} else {
  navigateTo('/auth/login')
}
</script>
