import { ref, computed } from 'vue'
import type { ApiResponse } from '~/types/api'
import { createApi } from '~/utils/api'

export const useApi = () => {
  const config = useRuntimeConfig()
  const api = createApi(config.public.apiUrl as string)

  const loading = ref(false)
  const error = ref<string | null>(null)

  const request = async <T>(
    method: 'get' | 'post' | 'patch' | 'put' | 'delete',
    url: string,
    data?: unknown,
    params?: Record<string, unknown>
  ): Promise<ApiResponse<T>> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.request<ApiResponse<T>>({
        method,
        url,
        data,
        params,
      })
      return response.data
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'An error occurred'
      error.value = message
      throw err
    } finally {
      loading.value = false
    }
  }

  const get = <T>(url: string, params?: Record<string, unknown>) =>
    request<T>('get', url, undefined, params)

  const post = <T>(url: string, data?: unknown) =>
    request<T>('post', url, data)

  const patch = <T>(url: string, data?: unknown) =>
    request<T>('patch', url, data)

  const del = <T>(url: string) =>
    request<T>('delete', url)

  return { api, loading, error, get, post, patch, del }
}
