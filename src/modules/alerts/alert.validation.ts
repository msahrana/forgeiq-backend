import { z } from 'zod';

import {
    AlertSeverity,
    AlertStatus,
    AlertType,
} from '../../../generated/prisma/enums';

const uuidSchema = z.string().uuid();

const alertTypeSchema = z.nativeEnum(AlertType);

const alertSeveritySchema = z.nativeEnum(AlertSeverity);

const alertStatusSchema = z.nativeEnum(AlertStatus);

// Create Alert
export const createAlertValidationSchema = z.object({
    plantId: uuidSchema,

    machineId: uuidSchema.optional(),

    type: alertTypeSchema,

    severity: alertSeveritySchema,

    status: alertStatusSchema.optional(),

    title: z
        .string()
        .min(3, 'Alert title must be at least 3 characters')
        .max(200, 'Alert title cannot exceed 200 characters'),

    message: z
        .string()
        .min(5, 'Alert message must be at least 5 characters')
        .max(2000, 'Alert message cannot exceed 2000 characters'),

    riskScore: z
        .number()
        .min(0, 'Risk score cannot be less than 0')
        .max(100, 'Risk score cannot exceed 100')
        .optional(),

    metadata: z.record(z.string(), z.unknown()).optional(),
});

// Update Alert
export const updateAlertValidationSchema = z.object({
    type: alertTypeSchema.optional(),

    severity: alertSeveritySchema.optional(),

    status: alertStatusSchema.optional(),

    title: z
        .string()
        .min(3, 'Alert title must be at least 3 characters')
        .max(200, 'Alert title cannot exceed 200 characters')
        .optional(),

    message: z
        .string()
        .min(5, 'Alert message must be at least 5 characters')
        .max(2000, 'Alert message cannot exceed 2000 characters')
        .optional(),

    riskScore: z
        .number()
        .min(0, 'Risk score cannot be less than 0')
        .max(100, 'Risk score cannot exceed 100')
        .optional(),

    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

// Acknowledge Alert
export const acknowledgeAlertValidationSchema = z.object({
    acknowledgedById: uuidSchema,
});

// Resolve Alert
export const resolveAlertValidationSchema = z.object({
    resolvedById: uuidSchema,
});

// Dismiss Alert
export const dismissAlertValidationSchema = z.object({
    reason: z
        .string()
        .min(3, 'Dismiss reason must be at least 3 characters')
        .max(500, 'Dismiss reason cannot exceed 500 characters')
        .optional(),
});
