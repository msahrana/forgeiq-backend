import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { ICreateMachineMetric } from './machineMetric.interface';
import { prisma } from '../../lib/prisma';

const createMachineMetricIntoDB = async (payload: ICreateMachineMetric) => {
    const { machineId, recordedAt, ...metricData } = payload;

    // Check machine existence
    const machine = await prisma.machine.findUnique({
        where: {
            id: machineId,
        },
    });

    if (!machine) {
        throw new AppError(httpStatus.NOT_FOUND, 'Machine not found');
    }

    const result = await prisma.machineMetric.create({
        data: {
            machineId,
            ...metricData,
            ...(recordedAt !== undefined && {
                recordedAt,
            }),
        },

        include: {
            machine: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    type: true,
                    status: true,
                    healthScore: true,
                    failureRisk: true,
                    riskLevel: true,
                },
            },
        },
    });

    return result;
};

const getAllMachineMetricsFromDB = async (machineId?: string) => {
    if (machineId) {
        const machine = await prisma.machine.findUnique({
            where: {
                id: machineId,
            },
        });

        if (!machine) {
            throw new AppError(httpStatus.NOT_FOUND, 'Machine not found');
        }
    }

    const result = await prisma.machineMetric.findMany({
        where: machineId
            ? {
                  machineId,
              }
            : undefined,

        orderBy: {
            recordedAt: 'desc',
        },

        include: {
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

const getSingleMachineMetricFromDB = async (id: string) => {
    const result = await prisma.machineMetric.findUnique({
        where: {
            id,
        },

        include: {
            machine: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    type: true,
                    status: true,
                    healthScore: true,
                    failureRisk: true,
                    riskLevel: true,
                },
            },
        },
    });

    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Machine metric not found');
    }

    return result;
};

const getLatestMachineMetricFromDB = async (machineId: string) => {
    // Check machine existence
    const machine = await prisma.machine.findUnique({
        where: {
            id: machineId,
        },
    });

    if (!machine) {
        throw new AppError(httpStatus.NOT_FOUND, 'Machine not found');
    }

    const result = await prisma.machineMetric.findFirst({
        where: {
            machineId,
        },

        orderBy: {
            recordedAt: 'desc',
        },

        include: {
            machine: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    type: true,
                    status: true,
                    healthScore: true,
                    failureRisk: true,
                    riskLevel: true,
                    operatingHours: true,
                },
            },
        },
    });

    if (!result) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'No telemetry data found for this machine',
        );
    }

    return result;
};

const getMachineMetricHistoryFromDB = async (
    machineId: string,
    startDate?: Date,
    endDate?: Date,
) => {
    // Check machine existence
    const machine = await prisma.machine.findUnique({
        where: {
            id: machineId,
        },
    });

    if (!machine) {
        throw new AppError(httpStatus.NOT_FOUND, 'Machine not found');
    }

    const result = await prisma.machineMetric.findMany({
        where: {
            machineId,

            ...(startDate || endDate
                ? {
                      recordedAt: {
                          ...(startDate && {
                              gte: startDate,
                          }),

                          ...(endDate && {
                              lte: endDate,
                          }),
                      },
                  }
                : {}),
        },

        orderBy: {
            recordedAt: 'desc',
        },
    });

    return result;
};

export const machineMetricServices = {
    createMachineMetricIntoDB,
    getAllMachineMetricsFromDB,
    getSingleMachineMetricFromDB,
    getLatestMachineMetricFromDB,
    getMachineMetricHistoryFromDB,
};
