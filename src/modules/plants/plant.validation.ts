import { z } from 'zod';

const plantStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'CLOSED']);

const uuidSchema = z.string().uuid();

export const createPlantValidationSchema = z.object({
    organizationId: uuidSchema,

    managerId: uuidSchema.optional(),

    name: z
        .string()
        .min(2, 'Plant name must be at least 2 characters')
        .max(100, 'Plant name cannot exceed 100 characters'),

    code: z
        .string()
        .min(2, 'Plant code must be at least 2 characters')
        .max(50, 'Plant code cannot exceed 50 characters')
        .regex(
            /^[A-Za-z0-9_-]+$/,
            'Plant code can only contain letters, numbers, hyphens and underscores',
        ),

    location: z
        .string()
        .max(255, 'Location cannot exceed 255 characters')
        .optional(),

    timezone: z
        .string()
        .max(100, 'Timezone cannot exceed 100 characters')
        .optional(),

    status: plantStatusEnum.optional(),
});

export const updatePlantValidationSchema = z.object({
    managerId: uuidSchema.nullable().optional(),

    name: z
        .string()
        .min(2, 'Plant name must be at least 2 characters')
        .max(100, 'Plant name cannot exceed 100 characters')
        .optional(),

    code: z
        .string()
        .min(2, 'Plant code must be at least 2 characters')
        .max(50, 'Plant code cannot exceed 50 characters')
        .regex(
            /^[A-Za-z0-9_-]+$/,
            'Plant code can only contain letters, numbers, hyphens and underscores',
        )
        .optional(),

    location: z
        .string()
        .max(255, 'Location cannot exceed 255 characters')
        .nullable()
        .optional(),

    timezone: z
        .string()
        .max(100, 'Timezone cannot exceed 100 characters')
        .nullable()
        .optional(),

    status: plantStatusEnum.optional(),
});

export const updatePlantStatusValidationSchema = z.object({
    status: plantStatusEnum,
});
