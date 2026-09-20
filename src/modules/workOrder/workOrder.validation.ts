import { z } from 'zod';

import {
    MaintenancePriority,
    WorkOrderStatus,
} from '../../../generated/prisma/enums';

const uuidSchema = z.string().uuid();

const costSchema = z.number().min(0).max(999999999999);

export const createWorkOrderValidationSchema = z.object({
    plantId: uuidSchema,

    machineId: uuidSchema,

    maintenanceTaskId: uuidSchema.optional(),

    assignedToId: uuidSchema.optional(),

    workOrderNumber: z.string().min(3).max(50).optional(),

    issue: z.string().min(3).max(1000),

    instructions: z.string().min(3).max(3000).optional(),

    priority: z.nativeEnum(MaintenancePriority).optional(),

    status: z.nativeEnum(WorkOrderStatus).optional(),

    estimatedCost: costSchema.optional(),

    actualCost: costSchema.optional(),
});

export const updateWorkOrderValidationSchema = z.object({
    assignedToId: uuidSchema.nullable().optional(),

    issue: z.string().min(3).max(1000).optional(),

    instructions: z.string().min(3).max(3000).nullable().optional(),

    priority: z.nativeEnum(MaintenancePriority).optional(),

    estimatedCost: costSchema.nullable().optional(),

    actualCost: costSchema.nullable().optional(),
});

export const completeWorkOrderValidationSchema = z.object({
    actualCost: costSchema.optional(),
});
