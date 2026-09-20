import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { ICreateAlert, IUpdateAlert } from './alert.interface';
import { prisma } from '../../lib/prisma';
import { AlertStatus, Prisma } from '../../../generated/prisma/client';

const createAlertIntoDB = async (payload: ICreateAlert) => {
    // Check plant
    const plant = await prisma.plant.findUnique({
        where: {
            id: payload.plantId,
        },
    });

    if (!plant) {
        throw new AppError(httpStatus.NOT_FOUND, 'Plant not found');
    }

    // Check machine if provided
    if (payload.machineId) {
        const machine = await prisma.machine.findUnique({
            where: {
                id: payload.machineId,
            },
        });

        if (!machine) {
            throw new AppError(httpStatus.NOT_FOUND, 'Machine not found');
        }

        // Machine must belong to the same plant
        if (machine.plantId !== payload.plantId) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Machine does not belong to this plant',
            );
        }
    }

    const result = await prisma.alert.create({
        data: {
            plantId: payload.plantId,
            machineId: payload.machineId,

            type: payload.type,
            severity: payload.severity,
            status: payload.status,

            title: payload.title,
            message: payload.message,

            riskScore: payload.riskScore,
            metadata: payload.metadata,
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
        },
    });

    return result;
};

const getAllAlertsFromDB = async (
    plantId?: string,
    machineId?: string,
    status?: string,
) => {
    const result = await prisma.alert.findMany({
        where: {
            ...(plantId && {
                plantId,
            }),

            ...(machineId && {
                machineId,
            }),

            ...(status && {
                status: status as AlertStatus,
            }),
        },

        orderBy: {
            createdAt: 'desc',
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

            acknowledgedBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },

            resolvedBy: {
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

const getSingleAlertFromDB = async (id: string) => {
    const result = await prisma.alert.findUnique({
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

            acknowledgedBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },

            resolvedBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });

    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Alert not found');
    }

    return result;
};

const updateAlertIntoDB = async (id: string, payload: IUpdateAlert) => {
    const existingAlert = await prisma.alert.findUnique({
        where: {
            id,
        },
    });

    if (!existingAlert) {
        throw new AppError(httpStatus.NOT_FOUND, 'Alert not found');
    }

    // Resolved alerts should not be modified
    if (existingAlert.status === 'RESOLVED') {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Resolved alert cannot be updated',
        );
    }

    const updateData: Prisma.AlertUpdateInput = {
        type: payload.type,
        severity: payload.severity,
        status: payload.status,
        title: payload.title,
        message: payload.message,
        riskScore: payload.riskScore,
    };

    // Handle JSON metadata separately
    if (payload.metadata !== undefined) {
        updateData.metadata =
            payload.metadata === null ? Prisma.JsonNull : payload.metadata;
    }

    const result = await prisma.alert.update({
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
        },
    });

    return result;
};

const acknowledgeAlertIntoDB = async (id: string, userId: string) => {
    const existingAlert = await prisma.alert.findUnique({
        where: {
            id,
        },
    });

    if (!existingAlert) {
        throw new AppError(httpStatus.NOT_FOUND, 'Alert not found');
    }

    if (existingAlert.status === 'ACKNOWLEDGED') {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Alert is already acknowledged',
        );
    }

    if (existingAlert.status === 'RESOLVED') {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Resolved alert cannot be acknowledged',
        );
    }

    if (existingAlert.status === 'DISMISSED') {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Dismissed alert cannot be acknowledged',
        );
    }

    const result = await prisma.alert.update({
        where: {
            id,
        },

        data: {
            status: 'ACKNOWLEDGED',
            acknowledgedById: userId,
            acknowledgedAt: new Date(),
        },

        include: {
            acknowledgedBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },

            machine: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
        },
    });

    return result;
};

const resolveAlertIntoDB = async (id: string, userId: string) => {
    const existingAlert = await prisma.alert.findUnique({
        where: {
            id,
        },
    });

    if (!existingAlert) {
        throw new AppError(httpStatus.NOT_FOUND, 'Alert not found');
    }

    if (existingAlert.status === 'RESOLVED') {
        throw new AppError(httpStatus.BAD_REQUEST, 'Alert is already resolved');
    }

    if (existingAlert.status === 'DISMISSED') {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Dismissed alert cannot be resolved',
        );
    }

    const result = await prisma.alert.update({
        where: {
            id,
        },

        data: {
            status: 'RESOLVED',
            resolvedById: userId,
            resolvedAt: new Date(),
        },

        include: {
            resolvedBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },

            machine: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
        },
    });

    return result;
};

const dismissAlertIntoDB = async (id: string, reason?: string) => {
    const existingAlert = await prisma.alert.findUnique({
        where: {
            id,
        },
    });

    if (!existingAlert) {
        throw new AppError(httpStatus.NOT_FOUND, 'Alert not found');
    }

    if (existingAlert.status === 'RESOLVED') {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Resolved alert cannot be dismissed',
        );
    }

    if (existingAlert.status === 'DISMISSED') {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Alert is already dismissed',
        );
    }

    const currentMetadata =
        existingAlert.metadata &&
        typeof existingAlert.metadata === 'object' &&
        !Array.isArray(existingAlert.metadata)
            ? existingAlert.metadata
            : {};

    const result = await prisma.alert.update({
        where: {
            id,
        },

        data: {
            status: 'DISMISSED',

            metadata: {
                ...currentMetadata,
                ...(reason
                    ? {
                          dismissalReason: reason,
                      }
                    : {}),
            },
        },

        include: {
            machine: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
        },
    });

    return result;
};

const deleteAlertFromDB = async (id: string) => {
    const existingAlert = await prisma.alert.findUnique({
        where: {
            id,
        },
    });

    if (!existingAlert) {
        throw new AppError(httpStatus.NOT_FOUND, 'Alert not found');
    }

    const result = await prisma.alert.delete({
        where: {
            id,
        },
    });

    return result;
};

export const alertServices = {
    createAlertIntoDB,
    getAllAlertsFromDB,
    getSingleAlertFromDB,
    updateAlertIntoDB,
    acknowledgeAlertIntoDB,
    resolveAlertIntoDB,
    dismissAlertIntoDB,
    deleteAlertFromDB,
};
