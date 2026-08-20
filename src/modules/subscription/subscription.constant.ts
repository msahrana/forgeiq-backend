import { SubscriptionStatus } from '../../../generated/prisma/enums';

export const SUBSCRIPTION_STATUS = {
    PENDING: SubscriptionStatus.PENDING,
    ACTIVE: SubscriptionStatus.ACTIVE,
    CANCELLED: SubscriptionStatus.CANCELED,
    EXPIRED: SubscriptionStatus.EXPIRED,
} as const;

export const SUBSCRIPTION_STATUS_VALUES = Object.values(SubscriptionStatus);
