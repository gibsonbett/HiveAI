import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()

  const fetchMe = async () => {
    const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
    const response = await $fetch<{ success: boolean; data?: any }>(`${config.public.apiUrl}/users/me`, {
      credentials: 'include',
      headers,
    })
    if (response?.data) {
      authStore.setUser(response.data)
      return true
    }
    return false
  }

  if (!authStore.user) {
    try {
      await fetchMe()
    } catch {
      try {
        const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
        const refresh = await $fetch<{ success: boolean; data?: { accessToken?: string } }>(
          `${config.public.apiUrl}/auth/refresh`,
          {
            method: 'POST',
            credentials: 'include',
            headers,
          }
        )
        if (refresh?.data?.accessToken) {
          authStore.setToken(refresh.data.accessToken)
        }
        await fetchMe()
      } catch {
        // User is truly unauthenticated.
      }
    }
  }

  if (authStore.isAuthenticated) {
    const role = authStore.userRole || 'worker'
    return navigateTo(`/dashboard/${role}`)
  }
})
