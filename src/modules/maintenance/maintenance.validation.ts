import { z } from 'zod';

import {
    MaintenancePriority,
    MaintenanceStatus,
    MaintenanceType,
} from '../../../generated/prisma/enums';

const uuidSchema = z.string().uuid();

const maintenanceTypeSchema = z.nativeEnum(MaintenanceType);
const maintenancePrioritySchema = z.nativeEnum(MaintenancePriority);
const maintenanceStatusSchema = z.nativeEnum(MaintenanceStatus);

const costSchema = z.number().min(0).max(999999999999);

export const createMaintenanceTaskValidationSchema = z.object({
    plantId: uuidSchema,

    machineId: uuidSchema,

    assignedToId: uuidSchema.optional(),

    title: z.string().min(3).max(200),

    description: z.string().min(5).max(2000).optional(),

    maintenanceType: maintenanceTypeSchema.optional(),

    priority: maintenancePrioritySchema.optional(),

    status: maintenanceStatusSchema.optional(),

    dueDate: z.string().datetime().optional(),

    estimatedCost: costSchema.optional(),

    actualCost: costSchema.optional(),
});

export const updateMaintenanceTaskValidationSchema = z.object({
    assignedToId: uuidSchema.nullable().optional(),

    title: z.string().min(3).max(200).optional(),

    description: z.string().min(5).max(2000).nullable().optional(),

    maintenanceType: maintenanceTypeSchema.optional(),

    priority: maintenancePrioritySchema.optional(),

    status: maintenanceStatusSchema.optional(),

    dueDate: z.string().datetime().nullable().optional(),

    estimatedCost: costSchema.nullable().optional(),

    actualCost: costSchema.nullable().optional(),
});

export const completeMaintenanceTaskValidationSchema = z.object({
    actualCost: costSchema.optional(),
});

export const maintenanceQueryValidationSchema = z.object({
    plantId: uuidSchema.optional(),

    machineId: uuidSchema.optional(),

    assignedToId: uuidSchema.optional(),

    status: maintenanceStatusSchema.optional(),

    priority: maintenancePrioritySchema.optional(),

    maintenanceType: maintenanceTypeSchema.optional(),
});
