import { z } from 'zod';

const uuidSchema = z.string().uuid();

const reportTypeSchema = z.enum([
    'PRODUCTION',
    'MAINTENANCE',
    'MACHINE_HEALTH',
    'ENERGY',
    'QUALITY',
    'EXECUTIVE',
    'CUSTOM',
]);

const reportStatusSchema = z.enum([
    'PENDING',
    'GENERATING',
    'COMPLETED',
    'FAILED',
]);

export const createReportValidationSchema = z
    .object({
        organizationId: uuidSchema,

        plantId: uuidSchema.optional(),

        type: reportTypeSchema,

        title: z
            .string()
            .trim()
            .min(1, 'Report title is required')
            .max(200, 'Report title cannot exceed 200 characters'),

        dateFrom: z.coerce.date(),

        dateTo: z.coerce.date(),

        status: reportStatusSchema.optional(),

        fileUrl: z.string().url('Invalid report file URL').optional(),

        metadata: z.record(z.string(), z.unknown()).optional(),
    })
    .refine((data) => data.dateFrom <= data.dateTo, {
        message: 'Date from cannot be greater than date to',
        path: ['dateFrom'],
    });

export const updateReportValidationSchema = z
    .object({
        plantId: uuidSchema.nullable().optional(),

        type: reportTypeSchema.optional(),

        title: z
            .string()
            .trim()
            .min(1, 'Report title cannot be empty')
            .max(200, 'Report title cannot exceed 200 characters')
            .optional(),

        dateFrom: z.coerce.date().optional(),

        dateTo: z.coerce.date().optional(),

        status: reportStatusSchema.optional(),

        fileUrl: z
            .string()
            .url('Invalid report file URL')
            .nullable()
            .optional(),

        metadata: z.record(z.string(), z.unknown()).nullable().optional(),
    })
    .refine(
        (data) => {
            if (data.dateFrom && data.dateTo) {
                return data.dateFrom <= data.dateTo;
            }

            return true;
        },
        {
            message: 'Date from cannot be greater than date to',
            path: ['dateFrom'],
        },
    );

export const reportQueryValidationSchema = z
    .object({
        organizationId: uuidSchema.optional(),

        plantId: uuidSchema.optional(),

        type: reportTypeSchema.optional(),

        status: reportStatusSchema.optional(),

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
