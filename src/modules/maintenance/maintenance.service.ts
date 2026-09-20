import httpStatus from 'http-status';
import { Prisma } from '../../../generated/prisma/client';
import { MaintenanceStatus, UserRole } from '../../../generated/prisma/enums';
import AppError from '../../errors/AppError';
import { prisma } from '../../lib/prisma';

import {
    ICreateMaintenanceTask,
    IGetMaintenanceTasksQuery,
    IUpdateMaintenanceTask,
} from './maintenance.interface';

const createMaintenanceTaskIntoDB = async (
    payload: ICreateMaintenanceTask,
    createdById: string,
) => {
    // -----------------------------------------
    // 1. Check Plant
    // -----------------------------------------
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

    // -----------------------------------------
    // 2. Check Machine
    // -----------------------------------------
    const machine = await prisma.machine.findUnique({
        where: {
            id: payload.machineId,
        },
        select: {
            id: true,
            name: true,
            code: true,
            plantId: true,
        },
    });

    if (!machine) {
        throw new AppError(httpStatus.NOT_FOUND, 'Machine not found');
    }

    // -----------------------------------------
    // 3. Machine must belong to same Plant
    // -----------------------------------------
    if (machine.plantId !== payload.plantId) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Machine does not belong to this plant',
        );
    }

    // -----------------------------------------
    // 4. Check Creator
    // -----------------------------------------
    const creator = await prisma.user.findUnique({
        where: {
            id: createdById,
        },
        select: {
            id: true,
            name: true,
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
            'Deleted user cannot create maintenance task',
        );
    }

    // -----------------------------------------
    // 5. Check Assignee
    // -----------------------------------------
    if (payload.assignedToId) {
        const assignee = await prisma.user.findUnique({
            where: {
                id: payload.assignedToId,
            },
            select: {
                id: true,
                name: true,
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
                'Deleted user cannot be assigned to maintenance task',
            );
        }

        // -----------------------------------------
        // Allowed maintenance roles
        // -----------------------------------------
        const allowedRoles: UserRole[] = [
            UserRole.SUPER_ADMIN,
            UserRole.ORG_OWNER,
            UserRole.FACTORY_MANAGER,
            UserRole.MAINTENANCE_ENGINEER,
            UserRole.TECHNICIAN,
        ];

        if (!allowedRoles.includes(assignee.role)) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Selected user is not eligible for maintenance task',
            );
        }
    }

    // -----------------------------------------
    // 6. Prepare data
    // -----------------------------------------
    const data: Prisma.MaintenanceTaskCreateInput = {
        title: payload.title,
        description: payload.description,

        maintenanceType: payload.maintenanceType,
        priority: payload.priority,
        status: payload.status,

        dueDate: payload.dueDate,

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

    // -----------------------------------------
    // 7. Create Maintenance Task
    // -----------------------------------------
    const result = await prisma.maintenanceTask.create({
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

const getAllMaintenanceTasksFromDB = async (
    query: IGetMaintenanceTasksQuery,
) => {
    const {
        plantId,
        machineId,
        assignedToId,
        status,
        priority,
        maintenanceType,
    } = query;

    const result = await prisma.maintenanceTask.findMany({
        where: {
            ...(plantId ? { plantId } : {}),
            ...(machineId ? { machineId } : {}),
            ...(assignedToId ? { assignedToId } : {}),
            ...(status ? { status } : {}),
            ...(priority ? { priority } : {}),
            ...(maintenanceType ? { maintenanceType } : {}),
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

            workOrders: true,
        },

        orderBy: {
            dueDate: 'asc',
        },
    });

    return result;
};

const getSingleMaintenanceTaskFromDB = async (id: string) => {
    const result = await prisma.maintenanceTask.findUnique({
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

            workOrders: true,
        },
    });

    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Maintenance task not found');
    }

    return result;
};

const updateMaintenanceTaskIntoDB = async (
    id: string,
    payload: IUpdateMaintenanceTask,
) => {
    // -----------------------------------------
    // 1. Find existing task
    // -----------------------------------------
    const existingTask = await prisma.maintenanceTask.findUnique({
        where: {
            id,
        },
    });

    if (!existingTask) {
        throw new AppError(httpStatus.NOT_FOUND, 'Maintenance task not found');
    }

    // -----------------------------------------
    // 2. Completed / Cancelled tasks
    // cannot be normally updated
    // -----------------------------------------
    if (existingTask.status === MaintenanceStatus.COMPLETED) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Completed maintenance task cannot be updated',
        );
    }

    if (existingTask.status === MaintenanceStatus.CANCELLED) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Cancelled maintenance task cannot be updated',
        );
    }

    // -----------------------------------------
    // 3. Validate status change
    // -----------------------------------------
    if (payload.status !== undefined) {
        const currentStatus = existingTask.status;
        const newStatus = payload.status;

        const allowedTransitions: Record<
            MaintenanceStatus,
            MaintenanceStatus[]
        > = {
            TODO: [MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.CANCELLED],

            IN_PROGRESS: [
                MaintenanceStatus.ON_HOLD,
                MaintenanceStatus.COMPLETED,
            ],

            ON_HOLD: [
                MaintenanceStatus.IN_PROGRESS,
                MaintenanceStatus.CANCELLED,
            ],

            OVERDUE: [
                MaintenanceStatus.IN_PROGRESS,
                MaintenanceStatus.CANCELLED,
            ],

            COMPLETED: [],

            CANCELLED: [],
        };

        if (
            currentStatus !== newStatus &&
            !allowedTransitions[currentStatus].includes(newStatus)
        ) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                `Cannot change maintenance status from ${currentStatus} to ${newStatus}`,
            );
        }
    }

    // -----------------------------------------
    // 4. Validate new assignee
    // -----------------------------------------
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
                'Deleted user cannot be assigned',
            );
        }

        const allowedRoles: UserRole[] = [
            UserRole.SUPER_ADMIN,
            UserRole.ORG_OWNER,
            UserRole.FACTORY_MANAGER,
            UserRole.MAINTENANCE_ENGINEER,
            UserRole.TECHNICIAN,
        ];

        if (!allowedRoles.includes(assignee.role)) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Selected user is not eligible for maintenance task',
            );
        }
    }

    // -----------------------------------------
    // 5. Build update data
    // -----------------------------------------
    const updateData: Prisma.MaintenanceTaskUpdateInput = {
        title: payload.title,

        description: payload.description,

        maintenanceType: payload.maintenanceType,

        priority: payload.priority,

        status: payload.status,

        // payload.dueDate is already Date
        dueDate: payload.dueDate,

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

    // -----------------------------------------
    // 6. Update Maintenance Task
    // -----------------------------------------
    const result = await prisma.maintenanceTask.update({
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

const startMaintenanceTaskIntoDB = async (id: string) => {
    const task = await prisma.maintenanceTask.findUnique({
        where: {
            id,
        },
    });

    if (!task) {
        throw new AppError(httpStatus.NOT_FOUND, 'Maintenance task not found');
    }

    if (
        task.status !== MaintenanceStatus.TODO &&
        task.status !== MaintenanceStatus.ON_HOLD &&
        task.status !== MaintenanceStatus.OVERDUE
    ) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            `Maintenance task cannot be started from ${task.status} status`,
        );
    }

    const result = await prisma.maintenanceTask.update({
        where: {
            id,
        },

        data: {
            status: MaintenanceStatus.IN_PROGRESS,
        },

        include: {
            machine: {
                select: {
                    id: true,
                    name: true,
                    code: true,
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
        },
    });

    return result;
};

const holdMaintenanceTaskIntoDB = async (id: string) => {
    const task = await prisma.maintenanceTask.findUnique({
        where: {
            id,
        },
    });

    if (!task) {
        throw new AppError(httpStatus.NOT_FOUND, 'Maintenance task not found');
    }

    if (task.status !== MaintenanceStatus.IN_PROGRESS) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Only an in-progress maintenance task can be put on hold',
        );
    }

    const result = await prisma.maintenanceTask.update({
        where: {
            id,
        },

        data: {
            status: MaintenanceStatus.ON_HOLD,
        },
    });

    return result;
};

const completeMaintenanceTaskIntoDB = async (
    id: string,
    actualCost?: number,
) => {
    const task = await prisma.maintenanceTask.findUnique({
        where: {
            id,
        },
    });

    if (!task) {
        throw new AppError(httpStatus.NOT_FOUND, 'Maintenance task not found');
    }

    if (task.status !== MaintenanceStatus.IN_PROGRESS) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Only an in-progress maintenance task can be completed',
        );
    }

    const result = await prisma.maintenanceTask.update({
        where: {
            id,
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
                },
            },

            assignedTo: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    return result;
};

const cancelMaintenanceTaskIntoDB = async (id: string) => {
    const task = await prisma.maintenanceTask.findUnique({
        where: {
            id,
        },
    });

    if (!task) {
        throw new AppError(httpStatus.NOT_FOUND, 'Maintenance task not found');
    }

    if (task.status === MaintenanceStatus.COMPLETED) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Completed maintenance task cannot be cancelled',
        );
    }

    if (task.status === MaintenanceStatus.CANCELLED) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Maintenance task is already cancelled',
        );
    }

    const result = await prisma.maintenanceTask.update({
        where: {
            id,
        },

        data: {
            status: MaintenanceStatus.CANCELLED,
        },
    });

    return result;
};

const deleteMaintenanceTaskFromDB = async (id: string) => {
    const task = await prisma.maintenanceTask.findUnique({
        where: {
            id,
        },

        select: {
            id: true,
            status: true,
        },
    });

    if (!task) {
        throw new AppError(httpStatus.NOT_FOUND, 'Maintenance task not found');
    }

    if (
        task.status === MaintenanceStatus.IN_PROGRESS ||
        task.status === MaintenanceStatus.COMPLETED
    ) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'In-progress or completed maintenance task cannot be deleted',
        );
    }

    const result = await prisma.maintenanceTask.delete({
        where: {
            id,
        },
    });

    return result;
};

export const maintenanceServices = {
    createMaintenanceTaskIntoDB,
    getAllMaintenanceTasksFromDB,
    getSingleMaintenanceTaskFromDB,
    updateMaintenanceTaskIntoDB,
    startMaintenanceTaskIntoDB,
    holdMaintenanceTaskIntoDB,
    completeMaintenanceTaskIntoDB,
    cancelMaintenanceTaskIntoDB,
    deleteMaintenanceTaskFromDB,
};
