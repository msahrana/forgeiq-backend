import { z } from 'zod';

const uuidSchema = z.string().uuid();

export const createMachineMetricValidationSchema = z
    .object({
        machineId: uuidSchema,

        temperature: z.number().min(-100).max(1000).optional(),

        vibration: z.number().min(0).max(1000).optional(),

        pressure: z.number().min(0).max(10000).optional(),

        rpm: z.number().min(0).max(100000).optional(),

        powerConsumption: z.number().min(0).max(100000).optional(),

        loadPercentage: z.number().min(0).max(100).optional(),

        recordedAt: z.coerce.date().optional(),
    })
    .refine(
        (data) =>
            data.temperature !== undefined ||
            data.vibration !== undefined ||
            data.pressure !== undefined ||
            data.rpm !== undefined ||
            data.powerConsumption !== undefined ||
            data.loadPercentage !== undefined,
        {
            message: 'At least one machine metric is required',
        },
    );
