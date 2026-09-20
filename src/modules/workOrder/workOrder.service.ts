import httpStatus from 'http-status';

import {
    MaintenancePriority,
    MaintenanceStatus,
    WorkOrderStatus,
} from '../../../generated/prisma/enums';
import { Prisma } from '../../../generated/prisma/client';

import AppError from '../../errors/AppError';

import {
    ICreateWorkOrder,
    IGetWorkOrdersQuery,
    IUpdateWorkOrder,
} from './workOrder.interface';
import { WORK_ORDER_ASSIGNABLE_ROLES } from './workOrder.constant';
import { prisma } from '../../lib/prisma';

const generateWorkOrderNumber = async (): Promise<string> => {
    const year = new Date().getFullYear();

    const lastWorkOrder = await prisma.workOrder.findFirst({
        where: {
            workOrderNumber: {
                startsWith: `WO-${year}-`,
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        select: {
            workOrderNumber: true,
        },
    });

    let nextNumber = 1;

    if (lastWorkOrder) {
        const parts = lastWorkOrder.workOrderNumber.split('-');
        const lastNumber = Number(parts[2]);

        if (!Number.isNaN(lastNumber)) {
            nextNumber = lastNumber + 1;
        }
    }

    return `WO-${year}-${String(nextNumber).padStart(5, '0')}`;
};

const createWorkOrderIntoDB = async (
    payload: ICreateWorkOrder,
    createdById: string,
) => {
    // --------------------------------------------------
    // 1. Check Plant
    // --------------------------------------------------

    const plant = await prisma.plant.findUnique({
        where: {
            id: payload.plantId,
        },
        select: {
            id: true,
            name: true,
            code: true,
            organizationId: true,
        },
    });

    if (!plant) {
        throw new AppError(httpStatus.NOT_FOUND, 'Plant not found');
    }

    // --------------------------------------------------
    // 2. Check Machine
    // --------------------------------------------------

    const machine = await prisma.machine.findUnique({
        where: {
            id: payload.machineId,
        },
        select: {
            id: true,
            name: true,
            code: true,
            plantId: true,
            status: true,
        },
    });

    if (!machine) {
        throw new AppError(httpStatus.NOT_FOUND, 'Machine not found');
    }

    if (machine.plantId !== payload.plantId) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Machine does not belong to this plant',
        );
    }

    // --------------------------------------------------
    // 3. Check Creator
    // --------------------------------------------------

    const creator = await prisma.user.findUnique({
        where: {
            id: createdById,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            isDeleted: true,
        },
    });

    if (!creator) {
        throw new AppError(httpStatus.NOT_FOUND, 'Creator user not found');
    }

    if (creator.isDeleted) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'Deleted user cannot create work order',
        );
    }

    // --------------------------------------------------
    // 4. Check Maintenance Task
    // --------------------------------------------------

    if (payload.maintenanceTaskId) {
        const maintenanceTask = await prisma.maintenanceTask.findUnique({
            where: {
                id: payload.maintenanceTaskId,
            },
            select: {
                id: true,
                plantId: true,
                machineId: true,
                status: true,
            },
        });

        if (!maintenanceTask) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Maintenance task not found',
            );
        }

        if (maintenanceTask.plantId !== payload.plantId) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Maintenance task does not belong to this plant',
            );
        }

        if (maintenanceTask.machineId !== payload.machineId) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Maintenance task does not belong to this machine',
            );
        }

        if (
            maintenanceTask.status === MaintenanceStatus.CANCELLED ||
            maintenanceTask.status === MaintenanceStatus.COMPLETED
        ) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Work order cannot be created from a completed or cancelled maintenance task',
            );
        }
    }

    // --------------------------------------------------
    // 5. Check Assigned User
    // --------------------------------------------------

    if (payload.assignedToId) {
        const assignee = await prisma.user.findUnique({
            where: {
                id: payload.assignedToId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                isDeleted: true,
            },
        });

        if (!assignee) {
            throw new AppError(httpStatus.NOT_FOUND, 'Assigned user not found');
        }

        if (assignee.isDeleted) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Deleted user cannot be assigned to work order',
            );
        }

        if (!WORK_ORDER_ASSIGNABLE_ROLES.includes(assignee.role)) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Selected user is not eligible for work order',
            );
        }
    }

    // --------------------------------------------------
    // 6. Generate Work Order Number
    // --------------------------------------------------

    const workOrderNumber =
        payload.workOrderNumber ?? (await generateWorkOrderNumber());

    // --------------------------------------------------
    // 7. Check Duplicate Work Order Number
    // --------------------------------------------------

    const existingWorkOrder = await prisma.workOrder.findUnique({
        where: {
            workOrderNumber,
        },
        select: {
            id: true,
        },
    });

    if (existingWorkOrder) {
        throw new AppError(
            httpStatus.CONFLICT,
            'Work order number already exists',
        );
    }

    // --------------------------------------------------
    // 8. Create Work Order
    // --------------------------------------------------

    const data: Prisma.WorkOrderCreateInput = {
        workOrderNumber,

        issue: payload.issue,
        instructions: payload.instructions,

        priority: payload.priority ?? MaintenancePriority.MEDIUM,

        status: payload.assignedToId
            ? WorkOrderStatus.ASSIGNED
            : WorkOrderStatus.OPEN,

        estimatedCost:
            payload.estimatedCost !== undefined
                ? new Prisma.Decimal(payload.estimatedCost)
                : undefined,

        actualCost:
            payload.actualCost !== undefined
                ? new Prisma.Decimal(payload.actualCost)
                : undefined,

        plant: {
            connect: {
                id: payload.plantId,
            },
        },

        machine: {
            connect: {
                id: payload.machineId,
            },
        },

        createdBy: {
            connect: {
                id: createdById,
            },
        },

        ...(payload.maintenanceTaskId
            ? {
                  maintenanceTask: {
                      connect: {
                          id: payload.maintenanceTaskId,
                      },
                  },
              }
            : {}),

        ...(payload.assignedToId
            ? {
                  assignedTo: {
                      connect: {
                          id: payload.assignedToId,
                      },
                  },
              }
            : {}),
    };

    const result = await prisma.workOrder.create({
        data,

        include: {
            plant: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },

            machine: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    type: true,
                    status: true,
                },
            },

            maintenanceTask: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                    priority: true,
                },
            },

            assignedTo: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },

            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });

    return result;
};

const getAllWorkOrdersFromDB = async (query: IGetWorkOrdersQuery) => {
    const {
        plantId,
        machineId,
        maintenanceTaskId,
        assignedToId,
        priority,
        status,
    } = query;

    const result = await prisma.workOrder.findMany({
        where: {
            ...(plantId ? { plantId } : {}),
            ...(machineId ? { machineId } : {}),
            ...(maintenanceTaskId ? { maintenanceTaskId } : {}),
            ...(assignedToId ? { assignedToId } : {}),
            ...(priority ? { priority } : {}),
            ...(status ? { status } : {}),
        },

        include: {
            plant: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },

            machine: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    type: true,
                    status: true,
                },
            },

            maintenanceTask: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                    priority: true,
                },
            },

            assignedTo: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },

            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },

        orderBy: {
            createdAt: 'desc',
        },
    });

    return result;
};

const getSingleWorkOrderFromDB = async (id: string) => {
    const result = await prisma.workOrder.findUnique({
        where: {
            id,
        },

        include: {
            plant: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },

            machine: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    type: true,
                    status: true,
                },
            },

            maintenanceTask: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                    priority: true,
                },
            },

            assignedTo: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },

            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },

            maintenanceHistory: true,
        },
    });

    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Work order not found');
    }

    return result;
};

const updateWorkOrderIntoDB = async (id: string, payload: IUpdateWorkOrder) => {
    const existingWorkOrder = await prisma.workOrder.findUnique({
        where: {
            id,
        },
    });

    if (!existingWorkOrder) {
        throw new AppError(httpStatus.NOT_FOUND, 'Work order not found');
    }

    if (existingWorkOrder.status === WorkOrderStatus.COMPLETED) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Completed work order cannot be updated',
        );
    }

    if (existingWorkOrder.status === WorkOrderStatus.CANCELLED) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Cancelled work order cannot be updated',
        );
    }

    // Check new assignee
    if (payload.assignedToId !== undefined && payload.assignedToId !== null) {
        const assignee = await prisma.user.findUnique({
            where: {
                id: payload.assignedToId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isDeleted: true,
            },
        });

        if (!assignee) {
            throw new AppError(httpStatus.NOT_FOUND, 'Assigned user not found');
        }

        if (assignee.isDeleted) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Deleted user cannot be assigned',
            );
        }

        if (!WORK_ORDER_ASSIGNABLE_ROLES.includes(assignee.role)) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Selected user is not eligible for work order',
            );
        }
    }

    const updateData: Prisma.WorkOrderUpdateInput = {
        issue: payload.issue,
        instructions: payload.instructions,
        priority: payload.priority,

        estimatedCost:
            payload.estimatedCost === null
                ? null
                : payload.estimatedCost !== undefined
                  ? new Prisma.Decimal(payload.estimatedCost)
                  : undefined,

        actualCost:
            payload.actualCost === null
                ? null
                : payload.actualCost !== undefined
                  ? new Prisma.Decimal(payload.actualCost)
                  : undefined,

        assignedTo:
            payload.assignedToId === null
                ? {
                      disconnect: true,
                  }
                : payload.assignedToId !== undefined
                  ? {
                        connect: {
                            id: payload.assignedToId,
                        },
                    }
                  : undefined,
    };

    // If assigning a user to OPEN work order,
    // automatically move it to ASSIGNED.
    if (
        payload.assignedToId &&
        existingWorkOrder.status === WorkOrderStatus.OPEN
    ) {
        updateData.status = WorkOrderStatus.ASSIGNED;
    }

    const result = await prisma.workOrder.update({
        where: {
            id,
        },

        data: updateData,

        include: {
            plant: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },

            machine: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    type: true,
                    status: true,
                },
            },

            maintenanceTask: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                    priority: true,
                },
            },

            assignedTo: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },

            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });

    return result;
};

const assignWorkOrderIntoDB = async (id: string, assignedToId: string) => {
    const workOrder = await prisma.workOrder.findUnique({
        where: {
            id,
        },
    });

    if (!workOrder) {
        throw new AppError(httpStatus.NOT_FOUND, 'Work order not found');
    }

    if (
        workOrder.status === WorkOrderStatus.COMPLETED ||
        workOrder.status === WorkOrderStatus.CANCELLED
    ) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Completed or cancelled work order cannot be assigned',
        );
    }

    const assignee = await prisma.user.findUnique({
        where: {
            id: assignedToId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isDeleted: true,
        },
    });

    if (!assignee) {
        throw new AppError(httpStatus.NOT_FOUND, 'Assigned user not found');
    }

    if (assignee.isDeleted) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Deleted user cannot be assigned',
        );
    }

    if (!WORK_ORDER_ASSIGNABLE_ROLES.includes(assignee.role)) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Selected user is not eligible for work order',
        );
    }

    return prisma.workOrder.update({
        where: {
            id,
        },

        data: {
            assignedTo: {
                connect: {
                    id: assignedToId,
                },
            },

            status: WorkOrderStatus.ASSIGNED,
        },

        include: {
            assignedTo: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
};

const startWorkOrderIntoDB = async (id: string) => {
    const workOrder = await prisma.workOrder.findUnique({
        where: {
            id,
        },
    });

    if (!workOrder) {
        throw new AppError(httpStatus.NOT_FOUND, 'Work order not found');
    }

    if (
        workOrder.status !== WorkOrderStatus.ASSIGNED &&
        workOrder.status !== WorkOrderStatus.ON_HOLD
    ) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            `Work order cannot be started from ${workOrder.status} status`,
        );
    }

    return prisma.workOrder.update({
        where: {
            id,
        },

        data: {
            status: WorkOrderStatus.IN_PROGRESS,

            startedAt: workOrder.startedAt ?? new Date(),
        },
    });
};

const holdWorkOrderIntoDB = async (id: string) => {
    const workOrder = await prisma.workOrder.findUnique({
        where: {
            id,
        },
    });

    if (!workOrder) {
        throw new AppError(httpStatus.NOT_FOUND, 'Work order not found');
    }

    if (workOrder.status !== WorkOrderStatus.IN_PROGRESS) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Only an in-progress work order can be put on hold',
        );
    }

    return prisma.workOrder.update({
        where: {
            id,
        },

        data: {
            status: WorkOrderStatus.ON_HOLD,
        },
    });
};

const completeWorkOrderIntoDB = async (id: string, actualCost?: number) => {
    const workOrder = await prisma.workOrder.findUnique({
        where: {
            id,
        },
    });

    if (!workOrder) {
        throw new AppError(httpStatus.NOT_FOUND, 'Work order not found');
    }

    if (workOrder.status !== WorkOrderStatus.IN_PROGRESS) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Only an in-progress work order can be completed',
        );
    }

    const result = await prisma.workOrder.update({
        where: {
            id,
        },

        data: {
            status: WorkOrderStatus.COMPLETED,

            completedAt: new Date(),

            ...(actualCost !== undefined
                ? {
                      actualCost: new Prisma.Decimal(actualCost),
                  }
                : {}),
        },
    });

    // If this WorkOrder belongs to a MaintenanceTask,
    // mark MaintenanceTask as completed as well.
    if (workOrder.maintenanceTaskId) {
        await prisma.maintenanceTask.update({
            where: {
                id: workOrder.maintenanceTaskId,
            },

            data: {
                status: MaintenanceStatus.COMPLETED,
                completedAt: new Date(),

                ...(actualCost !== undefined
                    ? {
                          actualCost: new Prisma.Decimal(actualCost),
                      }
                    : {}),
            },
        });
    }

    return result;
};

const cancelWorkOrderIntoDB = async (id: string) => {
    const workOrder = await prisma.workOrder.findUnique({
        where: {
            id,
        },
    });

    if (!workOrder) {
        throw new AppError(httpStatus.NOT_FOUND, 'Work order not found');
    }

    if (
        workOrder.status === WorkOrderStatus.COMPLETED ||
        workOrder.status === WorkOrderStatus.CANCELLED
    ) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Completed or already cancelled work order cannot be cancelled',
        );
    }

    return prisma.workOrder.update({
        where: {
            id,
        },

        data: {
            status: WorkOrderStatus.CANCELLED,
        },
    });
};

const deleteWorkOrderFromDB = async (id: string) => {
    const workOrder = await prisma.workOrder.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
            status: true,
        },
    });

    if (!workOrder) {
        throw new AppError(httpStatus.NOT_FOUND, 'Work order not found');
    }

    if (workOrder.status === WorkOrderStatus.IN_PROGRESS) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'In-progress work order cannot be deleted',
        );
    }

    if (workOrder.status === WorkOrderStatus.COMPLETED) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Completed work order cannot be deleted',
        );
    }

    await prisma.workOrder.delete({
        where: {
            id,
        },
    });

    return null;
};

export const workOrderServices = {
    createWorkOrderIntoDB,
    getAllWorkOrdersFromDB,
    getSingleWorkOrderFromDB,
    updateWorkOrderIntoDB,
    assignWorkOrderIntoDB,
    startWorkOrderIntoDB,
    holdWorkOrderIntoDB,
    completeWorkOrderIntoDB,
    cancelWorkOrderIntoDB,
    deleteWorkOrderFromDB,
};
