import { z } from 'zod';

import { DefectType, QualityResult } from '../../../generated/prisma/enums';

const uuidSchema = z.string().uuid();

const quantitySchema = z.number().int().min(0);

export const createQualityInspectionValidationSchema = z
    .object({
        plantId: uuidSchema,

        productionLineId: uuidSchema,

        productName: z.string().min(2).max(200),

        batchNumber: z.string().min(1).max(100).optional(),

        inspectedQuantity: quantitySchema,

        passedQuantity: quantitySchema,

        defectQuantity: quantitySchema,

        result: z.nativeEnum(QualityResult).optional(),

        defectType: z.nativeEnum(DefectType).optional(),

        notes: z.string().max(3000).optional(),

        inspectedById: uuidSchema,

        inspectionDate: z.coerce.date().optional(),
    })
    .refine((data) => data.passedQuantity <= data.inspectedQuantity, {
        message: 'Passed quantity cannot be greater than inspected quantity',
        path: ['passedQuantity'],
    })
    .refine((data) => data.defectQuantity <= data.inspectedQuantity, {
        message: 'Defect quantity cannot be greater than inspected quantity',
        path: ['defectQuantity'],
    })
    .refine(
        (data) =>
            data.passedQuantity + data.defectQuantity <= data.inspectedQuantity,
        {
            message:
                'Passed quantity and defect quantity cannot exceed inspected quantity',
            path: ['defectQuantity'],
        },
    );

export const updateQualityInspectionValidationSchema = z.object({
    productName: z.string().min(2).max(200).optional(),

    batchNumber: z.string().min(1).max(100).nullable().optional(),

    inspectedQuantity: quantitySchema.optional(),

    passedQuantity: quantitySchema.optional(),

    defectQuantity: quantitySchema.optional(),

    result: z.nativeEnum(QualityResult).optional(),

    defectType: z.nativeEnum(DefectType).nullable().optional(),

    notes: z.string().max(3000).nullable().optional(),

    inspectionDate: z.coerce.date().optional(),
});

export const qualityInspectionQueryValidationSchema = z
    .object({
        plantId: uuidSchema.optional(),

        productionLineId: uuidSchema.optional(),

        inspectedById: uuidSchema.optional(),

        result: z.nativeEnum(QualityResult).optional(),

        defectType: z.nativeEnum(DefectType).optional(),

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
