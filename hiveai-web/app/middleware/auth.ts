import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()

  if (authStore.user) {
    return
  }

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

  try {
    const hasSession = await fetchMe()
    if (hasSession) return
  } catch {
    // Try refresh fallback below.
  }

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

    const hasSession = await fetchMe()
    if (hasSession) return
  } catch {
    authStore.clearAuth()
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/login')
  }
})
