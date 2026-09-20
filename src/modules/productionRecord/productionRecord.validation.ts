import { z } from 'zod';

import { ProductionStatus } from '../../../generated/prisma/enums';

const uuidSchema = z.string().uuid();

const quantitySchema = z.number().int().min(0);

const downtimeSchema = z.number().int().min(0);

export const createProductionRecordValidationSchema = z
    .object({
        plantId: uuidSchema,

        productionLineId: uuidSchema,

        machineId: uuidSchema.optional(),

        targetQuantity: quantitySchema,

        actualQuantity: quantitySchema,

        defectQuantity: quantitySchema.optional(),

        downtimeMinutes: downtimeSchema.optional(),

        status: z.nativeEnum(ProductionStatus).optional(),

        recordedAt: z.coerce.date().optional(),
    })
    .refine((data) => (data.defectQuantity ?? 0) <= data.actualQuantity, {
        message: 'Defect quantity cannot be greater than actual quantity',
        path: ['defectQuantity'],
    });

export const updateProductionRecordValidationSchema = z
    .object({
        targetQuantity: quantitySchema.optional(),

        actualQuantity: quantitySchema.optional(),

        defectQuantity: quantitySchema.optional(),

        downtimeMinutes: downtimeSchema.optional(),

        status: z.nativeEnum(ProductionStatus).optional(),

        recordedAt: z.coerce.date().optional(),
    })
    .refine(
        (data) => {
            if (
                data.defectQuantity !== undefined &&
                data.actualQuantity !== undefined
            ) {
                return data.defectQuantity <= data.actualQuantity;
            }

            return true;
        },
        {
            message: 'Defect quantity cannot be greater than actual quantity',
            path: ['defectQuantity'],
        },
    );

export const productionRecordQueryValidationSchema = z.object({
    plantId: uuidSchema.optional(),

    productionLineId: uuidSchema.optional(),

    machineId: uuidSchema.optional(),

    status: z.nativeEnum(ProductionStatus).optional(),

    startDate: z.coerce.date().optional(),

    endDate: z.coerce.date().optional(),
});
