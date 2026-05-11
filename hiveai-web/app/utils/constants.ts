export const TASK_TYPE_LABELS: Record<string, string> = {
  image_annotation: 'Image Annotation',
  text_classification: 'Text Classification',
  rlhf_comparison: 'RLHF Comparison',
  audio_transcription: 'Audio Transcription',
  video_annotation: 'Video Annotation',
  ai_evaluation: 'AI Evaluation',
}

export const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  suspended: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  banned: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  submitted: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  assigned: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  under_review: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
}

export const SIDEBAR_ITEMS: Record<string, Array<{ label: string; icon: string; to: string }>> = {
  admin: [
    { label: 'Dashboard', icon: 'pi pi-home', to: '/dashboard/admin' },
    { label: 'Users', icon: 'pi pi-users', to: '/dashboard/admin/users' },
    { label: 'Projects', icon: 'pi pi-folder', to: '/dashboard/admin/projects' },
    { label: 'Analytics', icon: 'pi pi-chart-bar', to: '/dashboard/admin/analytics' },
    { label: 'Withdrawals', icon: 'pi pi-money-bill', to: '/dashboard/admin/withdrawals' },
    { label: 'Notifications', icon: 'pi pi-bell', to: '/dashboard/notifications' },
  ],
  worker: [
    { label: 'Dashboard', icon: 'pi pi-home', to: '/dashboard/worker' },
    { label: 'Available Tasks', icon: 'pi pi-list', to: '/dashboard/worker/tasks' },
    { label: 'My History', icon: 'pi pi-history', to: '/dashboard/worker/history' },
    { label: 'Wallet', icon: 'pi pi-wallet', to: '/dashboard/worker/wallet' },
    { label: 'Notifications', icon: 'pi pi-bell', to: '/dashboard/notifications' },
  ],
  client: [
    { label: 'Dashboard', icon: 'pi pi-home', to: '/dashboard/client' },
    { label: 'Projects', icon: 'pi pi-folder', to: '/dashboard/client/projects' },
    { label: 'Create Project', icon: 'pi pi-plus', to: '/dashboard/client/create-project' },
    { label: 'Wallet', icon: 'pi pi-wallet', to: '/dashboard/client/wallet' },
    { label: 'Notifications', icon: 'pi pi-bell', to: '/dashboard/notifications' },
  ],
  reviewer: [
    { label: 'Dashboard', icon: 'pi pi-home', to: '/dashboard/reviewer' },
    { label: 'Review Queue', icon: 'pi pi-check-square', to: '/dashboard/reviewer/queue' },
    { label: 'Notifications', icon: 'pi pi-bell', to: '/dashboard/notifications' },
  ],
}
