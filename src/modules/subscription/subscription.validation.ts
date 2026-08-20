import { z } from 'zod';

import { SUBSCRIPTION_STATUS_VALUES } from './subscription.constant';

const createSubscriptionValidationSchema = z.object({
    organizationId: z.string().uuid('Invalid organization ID'),

    planId: z.string().uuid('Invalid plan ID'),
});

const updateSubscriptionValidationSchema = z.object({
    startDate: z.string().datetime('Invalid start date').optional(),

    endDate: z.string().datetime('Invalid end date').optional(),
});

const updateSubscriptionStatusValidationSchema = z.object({
    status: z.enum(SUBSCRIPTION_STATUS_VALUES),
});

export const subscriptionValidation = {
    createSubscriptionValidationSchema,
    updateSubscriptionValidationSchema,
    updateSubscriptionStatusValidationSchema,
};
