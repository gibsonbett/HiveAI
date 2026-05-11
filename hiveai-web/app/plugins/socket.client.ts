import { io, type Socket } from 'socket.io-client'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  let socket: Socket | null = null

  const connect = () => {
    if (socket?.connected) return socket

    socket = io(config.public.socketUrl as string, {
      auth: { token: authStore.token },
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.connect()
    return socket
  }

  const disconnect = () => {
    socket?.disconnect()
    socket = null
  }

  const getSocket = () => socket

  return {
    provide: {
      socket: { connect, disconnect, getSocket },
    },
  }
})
