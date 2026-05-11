import { ref } from 'vue'

export interface Toast {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

const toasts = ref<Toast[]>([])
let nextId = 0

export const useToast = () => {
  const add = (toast: Omit<Toast, 'id'>) => {
    const id = nextId++
    const duration = toast.duration ?? 4000
    toasts.value.push({ ...toast, id })
    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
    return id
  }

  const remove = (id: number) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  const success = (title: string, message?: string) => add({ type: 'success', title, message })
  const error = (title: string, message?: string) => add({ type: 'error', title, message })
  const warning = (title: string, message?: string) => add({ type: 'warning', title, message })
  const info = (title: string, message?: string) => add({ type: 'info', title, message })

  return { toasts, add, remove, success, error, warning, info }
}
