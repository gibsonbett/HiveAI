export type TaskType = 'image_annotation' | 'text_classification' | 'rlhf_comparison' | 'audio_transcription' | 'video_annotation' | 'ai_evaluation'
export type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'skipped'
export type ProjectStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived'
export type ReviewDecision = 'approved' | 'rejected' | 'needs_revision'

export interface Project {
  _id: string
  title: string
  description: string
  clientId: string | { _id: string; firstName: string; lastName: string; email: string }
  taskType: TaskType
  datasetUrl?: string
  status: ProjectStatus
  budget: number
  payoutPerTask: number
  qualityThreshold: number
  totalTasks: number
  completedTasks: number
  settings: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface Task {
  _id: string
  projectId: string | { _id: string; title: string; taskType: TaskType }
  assignedTo?: string | { _id: string; firstName: string; lastName: string }
  status: TaskStatus
  inputData: Record<string, unknown>
  outputData?: Record<string, unknown>
  reviewStatus?: string
  qualityScore?: number
  payoutAmount: number
  priority: number
  startedAt?: string
  submittedAt?: string
  timeLimit?: number
  createdAt: string
  updatedAt: string
}

export interface Review {
  _id: string
  taskId: string | Task
  reviewerId: string | { _id: string; firstName: string; lastName: string }
  decision: ReviewDecision
  comments?: string
  score: number
  reviewedAt: string
  createdAt: string
}

export interface Notification {
  _id: string
  userId: string
  type: string
  title: string
  message: string
  read: boolean
  metadata?: Record<string, unknown>
  createdAt: string
}

export type TransactionType = 'deposit' | 'withdrawal' | 'earning' | 'bonus' | 'refund' | 'subscription'
export type TransactionStatus = 'pending' | 'completed' | 'failed'

export interface Transaction {
  _id: string
  userId: string | { _id: string; firstName: string; lastName: string; email: string }
  type: TransactionType
  amount: number
  mpesaReceipt?: string
  transactionId?: string
  status: TransactionStatus
  description: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}
