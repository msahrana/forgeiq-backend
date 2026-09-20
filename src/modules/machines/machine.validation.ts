import { z } from 'zod';

const machineTypeEnum = z.enum([
    'CNC',
    'MOTOR',
    'PUMP',
    'CONVEYOR',
    'ROBOT',
    'COMPRESSOR',
    'GENERATOR',
    'BOILER',
    'HVAC',
    'PACKAGING',
    'PRESS',
    'LATHE',
    'MILLING',
]);

const machineStatusEnum = z.enum([
    'ONLINE',
    'OFFLINE',
    'MAINTENANCE',
    'IDLE',
    'WARNING',
    'CRITICAL',
]);

const riskLevelEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

const uuidSchema = z.string().uuid();

export const createMachineValidationSchema = z.object({
    plantId: uuidSchema,

    productionLineId: uuidSchema.optional(),

    name: z.string().min(2).max(100),

    code: z
        .string()
        .min(2)
        .max(50)
        .regex(
            /^[A-Za-z0-9_-]+$/,
            'Machine code can only contain letters, numbers, hyphens and underscores',
        ),

    type: machineTypeEnum,

    manufacturer: z.string().max(100).optional(),

    model: z.string().max(100).optional(),

    serialNumber: z.string().max(100).optional(),

    status: machineStatusEnum.optional(),

    healthScore: z.number().min(0).max(100).optional(),

    failureRisk: z.number().min(0).max(100).optional(),

    riskLevel: riskLevelEnum.optional(),

    installationDate: z.coerce.date().optional(),

    lastMaintenanceAt: z.coerce.date().optional(),

    nextMaintenanceAt: z.coerce.date().optional(),

    operatingHours: z.number().min(0).optional(),
});

export const updateMachineValidationSchema = z.object({
    productionLineId: uuidSchema.nullable().optional(),

    name: z.string().min(2).max(100).optional(),

    code: z
        .string()
        .min(2)
        .max(50)
        .regex(
            /^[A-Za-z0-9_-]+$/,
            'Machine code can only contain letters, numbers, hyphens and underscores',
        )
        .optional(),

    type: machineTypeEnum.optional(),

    manufacturer: z.string().max(100).nullable().optional(),

    model: z.string().max(100).nullable().optional(),

    serialNumber: z.string().max(100).nullable().optional(),

    status: machineStatusEnum.optional(),

    healthScore: z.number().min(0).max(100).optional(),

    failureRisk: z.number().min(0).max(100).optional(),

    riskLevel: riskLevelEnum.optional(),

    installationDate: z.coerce.date().nullable().optional(),

    lastMaintenanceAt: z.coerce.date().nullable().optional(),

    nextMaintenanceAt: z.coerce.date().nullable().optional(),

    operatingHours: z.number().min(0).optional(),
});

export const updateMachineStatusValidationSchema = z.object({
    status: machineStatusEnum,
});

export const updateMachineRiskValidationSchema = z.object({
    healthScore: z.number().min(0).max(100),

    failureRisk: z.number().min(0).max(100),

    riskLevel: riskLevelEnum,
});
