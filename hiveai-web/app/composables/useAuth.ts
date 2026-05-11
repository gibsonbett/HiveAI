import { useAuthStore } from '~/stores/auth'
import type { LoginPayload, RegisterPayload, User } from '~/types/user'

export const useAuth = () => {
  const authStore = useAuthStore()
  const { loading, error, post, get } = useApi()
  const router = useRouter()

  const login = async (payload: LoginPayload) => {
    const response = await post<{ user: User; accessToken?: string }>('/auth/login', payload)
    if (response.data) {
      authStore.setUser(response.data.user)
      if (response.data.accessToken) {
        authStore.setToken(response.data.accessToken)
      }
      navigateToDashboard(response.data.user.role)
    }
    return response
  }

  const register = async (payload: RegisterPayload) => {
    const response = await post<{ user: User; accessToken?: string }>('/auth/register', payload)
    if (response.data) {
      // Public signup now requires admin approval before login.
      authStore.clearAuth()
    }
    return response
  }

  const logout = async () => {
    try {
      await post('/auth/logout')
    } catch {
      // Continue with local cleanup even if server logout fails
    }
    authStore.clearAuth()
    router.push('/auth/login')
  }

  const fetchUser = async () => {
    try {
      const response = await get<User>('/users/me')
      if (response.data) {
        authStore.setUser(response.data)
      }
    } catch {
      authStore.clearAuth()
    }
  }

  const navigateToDashboard = (role: string | null) => {
    const validRoles = ['admin', 'client', 'worker', 'reviewer']
    const safeRole = role && validRoles.includes(role) ? role : 'worker'
    router.push(`/dashboard/${safeRole}`)
  }

  return {
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    loading,
    error,
    login,
    register,
    logout,
    fetchUser,
  }
}
