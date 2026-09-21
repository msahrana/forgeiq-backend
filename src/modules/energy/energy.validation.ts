import { z } from 'zod';

const uuidSchema = z.string().uuid();

const energyConsumedSchema = z.number().min(0).max(999999999);

const energyCostSchema = z.number().min(0).max(999999999999);

export const createEnergyRecordValidationSchema = z.object({
    plantId: uuidSchema,

    machineId: uuidSchema.optional(),

    energyConsumed: energyConsumedSchema,

    energyCost: energyCostSchema.optional(),

    recordedAt: z.coerce.date().optional(),
});

export const updateEnergyRecordValidationSchema = z.object({
    machineId: uuidSchema.nullable().optional(),

    energyConsumed: energyConsumedSchema.optional(),

    energyCost: energyCostSchema.nullable().optional(),

    recordedAt: z.coerce.date().optional(),
});

export const energyRecordQueryValidationSchema = z
    .object({
        plantId: uuidSchema.optional(),

        machineId: uuidSchema.optional(),

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
