import {
    MaintenancePriority,
    WorkOrderStatus,
} from '../../../generated/prisma/enums';

export interface ICreateWorkOrder {
    plantId: string;
    machineId: string;

    maintenanceTaskId?: string;
    assignedToId?: string;

    workOrderNumber?: string;

    issue: string;
    instructions?: string;

    priority?: MaintenancePriority;
    status?: WorkOrderStatus;

    estimatedCost?: number;
    actualCost?: number;
}

export interface IUpdateWorkOrder {
    assignedToId?: string | null;

    issue?: string;
    instructions?: string | null;

    priority?: MaintenancePriority;

    estimatedCost?: number | null;
    actualCost?: number | null;
}

export interface IGetWorkOrdersQuery {
    plantId?: string;
    machineId?: string;
    maintenanceTaskId?: string;
    assignedToId?: string;
    priority?: MaintenancePriority;
    status?: WorkOrderStatus;
}
