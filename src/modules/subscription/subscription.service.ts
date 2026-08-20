import { Prisma } from '../../../generated/prisma/client';
import { SubscriptionStatus } from '../../../generated/prisma/enums';
import { prisma } from '../../lib/prisma';
import { SUBSCRIPTION_STATUS } from './subscription.constant';

/**
 * Create Subscription
 */
const createSubscriptionIntoDB = async (
    organizationId: string,
    planId: string,
) => {
    /*
     * Check Organization
     */
    const organization = await prisma.organization.findUnique({
        where: {
            id: organizationId,
        },
    });

    if (!organization) {
        throw new Error('Organization not found');
    }

    /*
     * Check Plan
     */
    const plan = await prisma.plan.findUnique({
        where: {
            id: planId,
        },
    });

    if (!plan) {
        throw new Error('Plan not found');
    }

    /*
     * Plan must be active
     */
    if (!plan.isActive) {
        throw new Error('This plan is currently inactive');
    }

    /*
     * Check existing pending/active subscription
     */
    const existingSubscription = await prisma.subscription.findFirst({
        where: {
            organizationId,
            status: {
                in: [SUBSCRIPTION_STATUS.PENDING, SUBSCRIPTION_STATUS.ACTIVE],
            },
        },
    });

    if (existingSubscription) {
        throw new Error(
            'Organization already has an active or pending subscription',
        );
    }

    /*
     * Create Subscription
     */
    const subscription = await prisma.subscription.create({
        data: {
            organizationId,
            planId,
            status: SUBSCRIPTION_STATUS.PENDING,
        },
        include: {
            organization: true,
            plan: true,
        },
    });

    return subscription;
};

/**
 * Get All Subscriptions
 */
const getAllSubscriptionsIntoDB = async () => {
    const subscriptions = await prisma.subscription.findMany({
        include: {
            organization: true,
            plan: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return subscriptions;
};

/**
 * Get Subscription By ID
 */
const getSubscriptionByIdIntoDB = async (id: string) => {
    const subscription = await prisma.subscription.findUnique({
        where: {
            id,
        },
        include: {
            organization: true,
            plan: true,
            invoices: true,
            payments: true,
        },
    });

    if (!subscription) {
        throw new Error('Subscription not found');
    }

    return subscription;
};

/**
 * Get Subscriptions By Organization
 */
const getSubscriptionsByOrganizationIntoDB = async (organizationId: string) => {
    const organization = await prisma.organization.findUnique({
        where: {
            id: organizationId,
        },
    });

    if (!organization) {
        throw new Error('Organization not found');
    }

    const subscriptions = await prisma.subscription.findMany({
        where: {
            organizationId,
        },
        include: {
            plan: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return subscriptions;
};

/**
 * Update Subscription
 *
 * Only startDate and endDate can be manually updated.
 */
const updateSubscriptionIntoDB = async (
    id: string,
    payload: {
        startDate?: Date;
        endDate?: Date;
    },
) => {
    const subscription = await prisma.subscription.findUnique({
        where: {
            id,
        },
    });

    if (!subscription) {
        throw new Error('Subscription not found');
    }

    /*
     * Terminal subscriptions
     * cannot be updated
     */
    if (
        subscription.status === SUBSCRIPTION_STATUS.CANCELLED ||
        subscription.status === SUBSCRIPTION_STATUS.EXPIRED
    ) {
        throw new Error('Cancelled or expired subscription cannot be updated');
    }

    const startDate = payload.startDate ?? subscription.startDate;

    const endDate = payload.endDate ?? subscription.endDate;

    /*
     * Validate date range
     */
    if (startDate && endDate && startDate >= endDate) {
        throw new Error('End date must be greater than start date');
    }

    const updatedSubscription = await prisma.subscription.update({
        where: {
            id,
        },
        data: {
            startDate: payload.startDate,
            endDate: payload.endDate,
        },
        include: {
            organization: true,
            plan: true,
        },
    });

    return updatedSubscription;
};

/**
 * Update Subscription Status
 */
const updateSubscriptionStatusIntoDB = async (
    id: string,
    status: SubscriptionStatus,
) => {
    const subscription = await prisma.subscription.findUnique({
        where: {
            id,
        },
    });

    if (!subscription) {
        throw new Error('Subscription not found');
    }

    /*
     * Cannot modify terminal status
     */
    if (
        subscription.status === SUBSCRIPTION_STATUS.CANCELLED ||
        subscription.status === SUBSCRIPTION_STATUS.EXPIRED
    ) {
        throw new Error('Subscription is already in a terminal state');
    }

    /*
     * PENDING → PAUSED
     * is not allowed
     */
    if (
        subscription.status === SUBSCRIPTION_STATUS.PENDING &&
        status === SUBSCRIPTION_STATUS.EXPIRED
    ) {
        throw new Error('Pending subscription cannot be paused');
    }

    const updateData: Prisma.SubscriptionUpdateInput = {
        status,
    };

    /*
     * When ACTIVE
     */
    if (status === SUBSCRIPTION_STATUS.ACTIVE && !subscription.startDate) {
        updateData.startDate = new Date();
    }

    /*
     * When CANCELLED
     */
    if (status === SUBSCRIPTION_STATUS.CANCELLED) {
        updateData.endDate = new Date();
    }

    /*
     * When EXPIRED
     */
    if (status === SUBSCRIPTION_STATUS.EXPIRED) {
        updateData.endDate = new Date();
    }

    const updatedSubscription = await prisma.subscription.update({
        where: {
            id,
        },
        data: updateData,
        include: {
            organization: true,
            plan: true,
        },
    });

    return updatedSubscription;
};

/**
 * Cancel Subscription
 */
const cancelSubscriptionIntoDB = async (id: string) => {
    const subscription = await prisma.subscription.findUnique({
        where: {
            id,
        },
    });

    if (!subscription) {
        throw new Error('Subscription not found');
    }

    if (subscription.status === SUBSCRIPTION_STATUS.CANCELLED) {
        throw new Error('Subscription is already cancelled');
    }

    if (subscription.status === SUBSCRIPTION_STATUS.EXPIRED) {
        throw new Error('Expired subscription cannot be cancelled');
    }

    const updatedSubscription = await prisma.subscription.update({
        where: {
            id,
        },
        data: {
            status: SUBSCRIPTION_STATUS.CANCELLED,
            endDate: new Date(),
        },
        include: {
            organization: true,
            plan: true,
        },
    });

    return updatedSubscription;
};

export const subscriptionServices = {
    createSubscriptionIntoDB,
    getAllSubscriptionsIntoDB,
    getSubscriptionByIdIntoDB,
    getSubscriptionsByOrganizationIntoDB,
    updateSubscriptionIntoDB,
    updateSubscriptionStatusIntoDB,
    cancelSubscriptionIntoDB,
};
