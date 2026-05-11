import { SubscriptionPlan, SubscriptionStatus, UserRole } from '../constants';
import { User } from '../models/User';
import { userRepository } from '../repositories/UserRepository';
import { AppError } from '../middlewares/errorHandler';
import { exchangeRateService } from './ExchangeRateService';

export const TRIAL_ITEM_LIMIT = 3;
const REQUIRED_WITHDRAWAL_PLAN = SubscriptionPlan.SILVER;

type PlanConfig = {
  id: SubscriptionPlan;
  name: string;
  subtitle: string;
  priceUsd: number;
  durationDays: number;
  benefits: string[];
  isPopular?: boolean;
};

const PLAN_CONFIGS: PlanConfig[] = [
  {
    id: SubscriptionPlan.BASIC,
    name: 'Basic',
    subtitle: 'Unlock full item access after trial',
    priceUsd: 30,
    durationDays: 30,
    benefits: [
      'Unlimited access to available tasks',
      'Unlimited review queue visibility',
      'Priority support response within 48h',
    ],
  },
  {
    id: SubscriptionPlan.SILVER,
    name: 'Silver',
    subtitle: 'Full access + withdrawals enabled',
    priceUsd: 55,
    durationDays: 30,
    benefits: [
      'Everything in Basic',
      'Withdrawals unlocked',
      'Faster payout processing window',
      'Priority support response within 24h',
    ],
    isPopular: true,
  },
  {
    id: SubscriptionPlan.GOLD,
    name: 'Gold',
    subtitle: 'Higher-tier access for heavy contributors',
    priceUsd: 85,
    durationDays: 30,
    benefits: [
      'Everything in Silver',
      'Higher priority in task assignment pools',
      'Early access to new task batches',
      'Priority support response within 12h',
    ],
  },
  {
    id: SubscriptionPlan.PLATINUM,
    name: 'Platinum',
    subtitle: 'Top-tier plan with maximum access priority',
    priceUsd: 120,
    durationDays: 30,
    benefits: [
      'Everything in Gold',
      'Top priority access across eligible projects',
      'Dedicated support queue',
      'Fastest payout processing lane',
    ],
  },
];

const PLAN_RANK: Record<string, number> = {
  [SubscriptionPlan.FREE]: 0,
  [SubscriptionPlan.BASIC]: 1,
  [SubscriptionPlan.SILVER]: 2,
  [SubscriptionPlan.GOLD]: 3,
  [SubscriptionPlan.PLATINUM]: 4,
  [SubscriptionPlan.PRO]: 2,
  [SubscriptionPlan.ELITE]: 4,
};

class SubscriptionService {
  private isActiveSubscription(user: {
    subscriptionStatus?: SubscriptionStatus;
    subscriptionEndsAt?: Date | string;
  }): boolean {
    if (user.subscriptionStatus !== SubscriptionStatus.ACTIVE) return false;
    if (!user.subscriptionEndsAt) return false;
    return new Date(user.subscriptionEndsAt) > new Date();
  }

  private hasPlanOrHigher(userPlan: SubscriptionPlan | undefined, requiredPlan: SubscriptionPlan): boolean {
    if (!userPlan) return false;
    return (PLAN_RANK[userPlan] || 0) >= (PLAN_RANK[requiredPlan] || 0);
  }

  async getPlanCatalog() {
    const kesPerUsd = await exchangeRateService.getUsdToKesRate();

    return {
      kesPerUsd,
      plans: PLAN_CONFIGS.map((plan) => ({
        ...plan,
        priceKes: Number((plan.priceUsd * kesPerUsd).toFixed(2)),
        requiredForWithdrawals: plan.id === REQUIRED_WITHDRAWAL_PLAN,
      })),
      trialLimit: TRIAL_ITEM_LIMIT,
      requiredWithdrawalPlan: REQUIRED_WITHDRAWAL_PLAN,
    };
  }

  async getUserSubscription(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const planCatalog = await this.getPlanCatalog();
    const active = this.isActiveSubscription(user);

    return {
      plan: user.subscriptionPlan,
      status: active ? SubscriptionStatus.ACTIVE : SubscriptionStatus.INACTIVE,
      endsAt: user.subscriptionEndsAt,
      trialUsageCount: user.trialUsageCount || 0,
      trialLimit: TRIAL_ITEM_LIMIT,
      unlockedItems: active ? null : Math.max(TRIAL_ITEM_LIMIT - (user.trialUsageCount || 0), 0),
      kesPerUsd: planCatalog.kesPerUsd,
      requiredWithdrawalPlan: REQUIRED_WITHDRAWAL_PLAN,
    };
  }

  async assertCanWorkOnItem(userId: string, role: UserRole): Promise<void> {
    if (role !== UserRole.WORKER && role !== UserRole.REVIEWER) return;

    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    if (this.isActiveSubscription(user)) return;

    if ((user.trialUsageCount || 0) >= TRIAL_ITEM_LIMIT) {
      throw new AppError('Trial limit reached. Upgrade your plan to continue working on more items.', 402);
    }
  }

  async consumeTrialUsage(userId: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    if (this.isActiveSubscription(user)) return;

    await User.findByIdAndUpdate(userId, {
      $inc: { trialUsageCount: 1 },
    }).exec();
  }

  async assertCanWithdraw(userId: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const active = this.isActiveSubscription(user);
    const hasRequiredPlan = this.hasPlanOrHigher(user.subscriptionPlan, REQUIRED_WITHDRAWAL_PLAN);

    if (!active || !hasRequiredPlan) {
      throw new AppError('Withdrawals require an active Silver plan or higher. Upgrade to continue.', 402);
    }
  }

  async activatePlan(userId: string, planId: SubscriptionPlan, durationDays: number): Promise<void> {
    const now = new Date();
    const endsAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    await User.findByIdAndUpdate(userId, {
      subscriptionPlan: planId,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      subscriptionEndsAt: endsAt,
    }).exec();
  }

  getPlanById(planId: string): PlanConfig | undefined {
    return PLAN_CONFIGS.find((plan) => plan.id === planId);
  }
}

export const subscriptionService = new SubscriptionService();
