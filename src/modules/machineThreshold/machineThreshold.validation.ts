import { z } from 'zod';

const uuidSchema = z.string().uuid();

const thresholdFields = {
    temperatureWarning: z.number().min(-100).max(1000).optional(),
    temperatureCritical: z.number().min(-100).max(1000).optional(),

    vibrationWarning: z.number().min(0).max(1000).optional(),
    vibrationCritical: z.number().min(0).max(1000).optional(),

    pressureWarning: z.number().min(0).max(10000).optional(),
    pressureCritical: z.number().min(0).max(10000).optional(),

    rpmWarning: z.number().min(0).max(100000).optional(),
    rpmCritical: z.number().min(0).max(100000).optional(),

    powerWarning: z.number().min(0).max(100000).optional(),
    powerCritical: z.number().min(0).max(100000).optional(),
};

export const createMachineThresholdValidationSchema = z
    .object({
        machineId: uuidSchema,

        ...thresholdFields,
    })
    .refine(
        (data) => {
            const thresholds = [
                [data.temperatureWarning, data.temperatureCritical],
                [data.vibrationWarning, data.vibrationCritical],
                [data.pressureWarning, data.pressureCritical],
                [data.rpmWarning, data.rpmCritical],
                [data.powerWarning, data.powerCritical],
            ];

            return thresholds.every(
                ([warning, critical]) =>
                    warning === undefined ||
                    critical === undefined ||
                    warning < critical,
            );
        },
        {
            message: 'Warning threshold must be lower than critical threshold',
        },
    )
    .refine(
        (data) =>
            data.temperatureWarning !== undefined ||
            data.temperatureCritical !== undefined ||
            data.vibrationWarning !== undefined ||
            data.vibrationCritical !== undefined ||
            data.pressureWarning !== undefined ||
            data.pressureCritical !== undefined ||
            data.rpmWarning !== undefined ||
            data.rpmCritical !== undefined ||
            data.powerWarning !== undefined ||
            data.powerCritical !== undefined,
        {
            message: 'At least one threshold is required',
        },
    );

export const updateMachineThresholdValidationSchema = z.object({
    temperatureWarning: z.number().min(-100).max(1000).nullable().optional(),
    temperatureCritical: z.number().min(-100).max(1000).nullable().optional(),

    vibrationWarning: z.number().min(0).max(1000).nullable().optional(),
    vibrationCritical: z.number().min(0).max(1000).nullable().optional(),

    pressureWarning: z.number().min(0).max(10000).nullable().optional(),
    pressureCritical: z.number().min(0).max(10000).nullable().optional(),

    rpmWarning: z.number().min(0).max(100000).nullable().optional(),
    rpmCritical: z.number().min(0).max(100000).nullable().optional(),

    powerWarning: z.number().min(0).max(100000).nullable().optional(),
    powerCritical: z.number().min(0).max(100000).nullable().optional(),
});
