import { useSocket } from './useSocket'
import { useAuthStore } from '~/stores/auth'

/**
 * Composable that listens for real-time socket events and triggers
 * toast notifications + reactive state updates.
 * Must be used within a component that has access to the socket.
 */
export const useRealtimeEvents = () => {
  const { on, off, connect, connected } = useSocket()
  const toast = useToast()
  const authStore = useAuthStore()

  const unreadCount = ref(0)
  const lastEvent = ref<{ type: string; data: any } | null>(null)

  const setupListeners = () => {
    if (!connected.value) {
      connect()
    }

    on('notification', (data: any) => {
      unreadCount.value++
      lastEvent.value = { type: 'notification', data }
      toast.info(data.title || 'New notification')
    })

    on('task:assigned', (data: any) => {
      lastEvent.value = { type: 'task:assigned', data }
      toast.success('New task assigned to you!')
    })

    on('task:reviewed', (data: any) => {
      lastEvent.value = { type: 'task:reviewed', data }
      const decision = data.decision || 'reviewed'
      if (decision === 'approved') {
        toast.success('Your task was approved!')
      } else if (decision === 'rejected') {
        toast.error('Your task was rejected')
      } else {
        toast.info('Your task needs revision')
      }
    })

    on('wallet:updated', (data: any) => {
      lastEvent.value = { type: 'wallet:updated', data }
      if (data.type === 'deposit') {
        toast.success(`Deposit of KES ${data.amount?.toLocaleString()} received!`)
      } else if (data.type === 'withdrawal_approved') {
        toast.success('Withdrawal approved!')
      } else if (data.type === 'withdrawal_rejected') {
        toast.error('Withdrawal was rejected')
      }
    })

    on('review:needed', (data: any) => {
      lastEvent.value = { type: 'review:needed', data }
      toast.info('New task ready for review')
    })
  }

  const clearListeners = () => {
    off('notification')
    off('task:assigned')
    off('task:reviewed')
    off('wallet:updated')
    off('review:needed')
  }

  onMounted(() => {
    if (authStore.isAuthenticated) {
      setupListeners()
    }
  })

  onUnmounted(() => {
    clearListeners()
  })

  return { unreadCount, lastEvent, connected }
}
