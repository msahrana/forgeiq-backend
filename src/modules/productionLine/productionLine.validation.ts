import { z } from 'zod';

const productionStatusEnum = z.enum([
    'IDLE',
    'RUNNING',
    'PAUSED',
    'STOPPED',
    'MAINTENANCE',
]);

const uuidSchema = z.string().uuid();

export const createProductionLineValidationSchema = z.object({
    plantId: uuidSchema,

    name: z.string().min(2).max(100),

    code: z
        .string()
        .min(2)
        .max(50)
        .regex(
            /^[A-Za-z0-9_-]+$/,
            'Production line code can only contain letters, numbers, hyphens and underscores',
        ),

    description: z.string().max(500).optional(),

    status: productionStatusEnum.optional(),

    targetOutput: z.number().int().positive().optional(),
});

export const updateProductionLineValidationSchema = z.object({
    name: z.string().min(2).max(100).optional(),

    code: z
        .string()
        .min(2)
        .max(50)
        .regex(
            /^[A-Za-z0-9_-]+$/,
            'Production line code can only contain letters, numbers, hyphens and underscores',
        )
        .optional(),

    description: z.string().max(500).nullable().optional(),

    status: productionStatusEnum.optional(),

    targetOutput: z.number().int().positive().nullable().optional(),
});

export const updateProductionLineStatusValidationSchema = z.object({
    status: productionStatusEnum,
});
