import {
    MaintenancePriority,
    MaintenanceStatus,
    MaintenanceType,
} from '../../../generated/prisma/enums';

export interface ICreateMaintenanceTask {
    plantId: string;
    machineId: string;
    assignedToId?: string;
    title: string;
    description?: string;
    maintenanceType?: MaintenanceType;
    priority?: MaintenancePriority;
    status?: MaintenanceStatus;
    dueDate?: Date;
    estimatedCost?: number;
    actualCost?: number;
}

export interface IUpdateMaintenanceTask {
    assignedToId?: string | null;
    title?: string;
    description?: string | null;
    maintenanceType?: MaintenanceType;
    priority?: MaintenancePriority;
    status?: MaintenanceStatus;
    dueDate?: Date | null;
    estimatedCost?: number | null;
    actualCost?: number | null;
    completedAt?: Date | null;
}

export interface IGetMaintenanceTasksQuery {
    plantId?: string;
    machineId?: string;
    assignedToId?: string;
    status?: MaintenanceStatus;
    priority?: MaintenancePriority;
    maintenanceType?: MaintenanceType;
}
