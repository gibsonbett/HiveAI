import { ref, onMounted, onUnmounted } from 'vue'
import { io, type Socket } from 'socket.io-client'
import { useAuthStore } from '~/stores/auth'

export const useSocket = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  const socket = ref<Socket | null>(null)
  const connected = ref(false)

  const connect = () => {
    if (socket.value?.connected) return
    if (!authStore.token) return

    socket.value = io(config.public.socketUrl as string, {
      auth: { token: authStore.token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.value.on('connect', () => {
      connected.value = true
    })

    socket.value.on('disconnect', () => {
      connected.value = false
    })
  }

  const disconnect = () => {
    socket.value?.disconnect()
    socket.value = null
    connected.value = false
  }

  const on = (event: string, callback: (...args: unknown[]) => void) => {
    socket.value?.on(event, callback)
  }

  const off = (event: string, callback?: (...args: unknown[]) => void) => {
    socket.value?.off(event, callback)
  }

  onMounted(() => {
    if (authStore.isAuthenticated) {
      connect()
    }
  })

  onUnmounted(() => {
    disconnect()
  })

  return { socket, connected, connect, disconnect, on, off }
}
