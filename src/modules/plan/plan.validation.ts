import { z } from 'zod';

const createPlanValidationSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, 'Plan name must be at least 2 characters')
        .max(100, 'Plan name cannot exceed 100 characters'),

    description: z
        .string()
        .trim()
        .max(500, 'Description cannot exceed 500 characters')
        .optional(),

    price: z.number().positive('Price must be greater than 0'),

    currency: z
        .string()
        .trim()
        .length(3, 'Currency must be a 3-letter code')
        .default('BDT'),

    billingInterval: z.enum(['MONTHLY', 'YEARLY']),

    isActive: z.boolean().optional(),
});

const updatePlanValidationSchema = z.object({
    name: z.string().trim().min(2).max(100).optional(),

    description: z.string().trim().max(500).optional(),

    price: z.number().positive().optional(),

    currency: z.string().trim().length(3).optional(),

    billingInterval: z.enum(['MONTHLY', 'YEARLY']).optional(),

    isActive: z.boolean().optional(),
});

const updatePlanStatusValidationSchema = z.object({
    isActive: z.boolean(),
});

export const planValidation = {
    createPlanValidationSchema,
    updatePlanValidationSchema,
    updatePlanStatusValidationSchema,
};
