import axios from 'axios'
import type { ApiResponse } from '~/types/api'

let isRefreshing = false
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = []

const processQueue = (error: unknown | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(undefined)
    }
  })
  failedQueue = []
}

const normalizeApiBaseUrl = (rawBaseUrl: string) => {
  const trimmed = rawBaseUrl.trim().replace(/\/+$/, '')
  if (trimmed.endsWith('/api/v1')) return trimmed
  return `${trimmed}/api/v1`
}

export const createApi = (baseURL: string) => {
  const api = axios.create({
    baseURL: normalizeApiBaseUrl(baseURL),
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  })

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          }).then(() => api(originalRequest))
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          await api.post('/auth/refresh')
          processQueue(null)
          return api(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError)
          if (import.meta.client) {
            window.location.href = '/auth/login'
          }
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      return Promise.reject(error)
    }
  )

  return api
}
