export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client',
  WORKER = 'worker',
  REVIEWER = 'reviewer',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
  PENDING = 'pending',
}

export enum KycStatus {
  NOT_STARTED = 'not_started',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum SubscriptionPlan {
  FREE = 'free',
  BASIC = 'basic',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  PRO = 'pro',
  ELITE = 'elite',
}

export enum SubscriptionStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  EXPIRED = 'expired',
}

export enum ProjectStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export enum TaskType {
  IMAGE_ANNOTATION = 'image_annotation',
  TEXT_CLASSIFICATION = 'text_classification',
  RLHF_COMPARISON = 'rlhf_comparison',
  AUDIO_TRANSCRIPTION = 'audio_transcription',
  VIDEO_ANNOTATION = 'video_annotation',
  AI_EVALUATION = 'ai_evaluation',
}

export enum TaskStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SKIPPED = 'skipped',
}

export enum ReviewDecision {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  NEEDS_REVISION = 'needs_revision',
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  EARNING = 'earning',
  BONUS = 'bonus',
  REFUND = 'refund',
  SUBSCRIPTION = 'subscription',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum NotificationType {
  TASK_ASSIGNED = 'task_assigned',
  TASK_REJECTED = 'task_rejected',
  TASK_APPROVED = 'task_approved',
  REVIEW_NEEDED = 'review_needed',
  PAYMENT_COMPLETED = 'payment_completed',
  WITHDRAWAL_APPROVED = 'withdrawal_approved',
  SYSTEM = 'system',
}
