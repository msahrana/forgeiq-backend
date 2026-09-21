import { z } from 'zod';

const uuidSchema = z.string().uuid();

export const analyticsQueryValidationSchema = z
    .object({
        organizationId: uuidSchema,

        plantId: uuidSchema.optional(),

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
