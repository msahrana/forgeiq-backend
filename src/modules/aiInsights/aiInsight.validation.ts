import { z } from 'zod';

const uuidSchema = z.string().uuid();

const aiInsightTypeSchema = z.enum([
    'MACHINE_FAILURE',
    'PRODUCTION_DROP',
    'ENERGY_SPIKE',
    'QUALITY_ISSUE',
    'MAINTENANCE_DUE',
    'EFFICIENCY_DROP',
    'GENERAL',
]);

const aiInsightSeveritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const createAIInsightValidationSchema = z.object({
    organizationId: uuidSchema,

    plantId: uuidSchema.optional(),

    type: aiInsightTypeSchema,

    severity: aiInsightSeveritySchema,

    title: z
        .string()
        .trim()
        .min(1, 'Insight title is required')
        .max(200, 'Insight title cannot exceed 200 characters'),

    message: z
        .string()
        .trim()
        .min(1, 'Insight message is required')
        .max(2000, 'Insight message cannot exceed 2000 characters'),

    recommendation: z
        .string()
        .trim()
        .max(2000, 'Recommendation cannot exceed 2000 characters')
        .optional(),

    metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateAIInsightValidationSchema = z.object({
    severity: aiInsightSeveritySchema.optional(),

    title: z
        .string()
        .trim()
        .min(1, 'Insight title cannot be empty')
        .max(200, 'Insight title cannot exceed 200 characters')
        .optional(),

    message: z
        .string()
        .trim()
        .min(1, 'Insight message cannot be empty')
        .max(2000, 'Insight message cannot exceed 2000 characters')
        .optional(),

    recommendation: z
        .string()
        .trim()
        .max(2000, 'Recommendation cannot exceed 2000 characters')
        .nullable()
        .optional(),

    metadata: z.record(z.string(), z.unknown()).nullable().optional(),

    isResolved: z.boolean().optional(),

    resolvedAt: z.coerce.date().nullable().optional(),
});

export const aiInsightQueryValidationSchema = z
    .object({
        organizationId: uuidSchema,

        plantId: uuidSchema.optional(),

        type: aiInsightTypeSchema.optional(),

        severity: aiInsightSeveritySchema.optional(),

        isResolved: z
            .enum(['true', 'false'])
            .transform((value) => value === 'true')
            .optional(),

        startDate: z.coerce.date().optional(),

        endDate: z.coerce.date().optional(),
    })
    .refine(
        (data) => {
            if (data.startDate && data.endDate) {
                return data.startDate <= data.endDate;
            }

            return true;
        },
        {
            message: 'Start date cannot be greater than end date',
            path: ['startDate'],
        },
    );
