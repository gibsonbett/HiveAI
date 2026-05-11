export type UserRole = 'admin' | 'client' | 'worker' | 'reviewer'
export type UserStatus = 'active' | 'suspended' | 'banned' | 'pending'
export type SubscriptionPlan = 'free' | 'basic' | 'silver' | 'gold' | 'platinum' | 'pro' | 'elite'
export type SubscriptionStatus = 'inactive' | 'active' | 'expired'

export interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: UserRole
  walletBalance: number
  pendingBalance: number
  accuracyScore: number
  trustScore: number
  subscriptionPlan: SubscriptionPlan
  subscriptionStatus: SubscriptionStatus
  subscriptionEndsAt?: string
  trialUsageCount: number
  trialLimit?: number
  status: UserStatus
  kycStatus: string
  skills: string[]
  emailVerified: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  phone?: string
  password: string
  role?: UserRole
}
