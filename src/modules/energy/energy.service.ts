import { Prisma } from '../../../generated/prisma/client';
import { prisma } from '../../lib/prisma';
import AppError from '../../errors/AppError';

import {
    ICreateEnergyRecord,
    IGetEnergyRecordsQuery,
    IUpdateEnergyRecord,
} from './energy.interface';

const createEnergyRecordIntoDB = async (payload: ICreateEnergyRecord) => {
    const { plantId, machineId, energyConsumed, energyCost, recordedAt } =
        payload;

    // 1. Validate plant
    const plant = await prisma.plant.findUnique({
        where: {
            id: plantId,
        },
    });

    if (!plant) {
        throw new AppError(404, 'Plant not found');
    }

    // 2. Validate machine if provided
    if (machineId) {
        const machine = await prisma.machine.findUnique({
            where: {
                id: machineId,
            },
        });

        if (!machine) {
            throw new AppError(404, 'Machine not found');
        }

        // Machine must belong to the same plant
        if (machine.plantId !== plantId) {
            throw new AppError(400, 'Machine does not belong to this plant');
        }
    }

    // 3. Validate energy values
    if (energyConsumed < 0) {
        throw new AppError(400, 'Energy consumed cannot be negative');
    }

    if (energyCost !== undefined && energyCost < 0) {
        throw new AppError(400, 'Energy cost cannot be negative');
    }

    // 4. Create energy record
    const result = await prisma.energyRecord.create({
        data: {
            plantId,
            machineId,
            energyConsumed,
            energyCost,
            recordedAt,
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

const getAllEnergyRecordsFromDB = async (query: IGetEnergyRecordsQuery) => {
    const { plantId, machineId, startDate, endDate } = query;

    const whereConditions: Prisma.EnergyRecordWhereInput = {};

    // Plant filter
    if (plantId) {
        whereConditions.plantId = plantId;
    }

    // Machine filter
    if (machineId) {
        whereConditions.machineId = machineId;
    }

    // Date filter
    if (startDate || endDate) {
        whereConditions.recordedAt = {};

        if (startDate) {
            whereConditions.recordedAt.gte = startDate;
        }

        if (endDate) {
            whereConditions.recordedAt.lte = endDate;
        }
    }

    const result = await prisma.energyRecord.findMany({
        where: whereConditions,

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

        orderBy: {
            recordedAt: 'desc',
        },
    });

    return result;
};

const getSingleEnergyRecordFromDB = async (id: string) => {
    const result = await prisma.energyRecord.findUnique({
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
        },
    });

    if (!result) {
        throw new AppError(404, 'Energy record not found');
    }

    return result;
};

const updateEnergyRecordIntoDB = async (
    id: string,
    payload: IUpdateEnergyRecord,
) => {
    // 1. Find existing record
    const existingRecord = await prisma.energyRecord.findUnique({
        where: {
            id,
        },
    });

    if (!existingRecord) {
        throw new AppError(404, 'Energy record not found');
    }

    // 2. Validate machine if machineId is being changed
    if (payload.machineId !== undefined && payload.machineId !== null) {
        const machine = await prisma.machine.findUnique({
            where: {
                id: payload.machineId,
            },
        });

        if (!machine) {
            throw new AppError(404, 'Machine not found');
        }

        if (machine.plantId !== existingRecord.plantId) {
            throw new AppError(400, 'Machine does not belong to this plant');
        }
    }

    // 3. Validate energy consumed
    if (payload.energyConsumed !== undefined && payload.energyConsumed < 0) {
        throw new AppError(400, 'Energy consumed cannot be negative');
    }

    // 4. Validate energy cost
    if (
        payload.energyCost !== undefined &&
        payload.energyCost !== null &&
        payload.energyCost < 0
    ) {
        throw new AppError(400, 'Energy cost cannot be negative');
    }

    // 5. Update record
    const result = await prisma.energyRecord.update({
        where: {
            id,
        },

        data: {
            ...(payload.machineId !== undefined && {
                machineId: payload.machineId,
            }),

            ...(payload.energyConsumed !== undefined && {
                energyConsumed: payload.energyConsumed,
            }),

            ...(payload.energyCost !== undefined && {
                energyCost: payload.energyCost,
            }),

            ...(payload.recordedAt !== undefined && {
                recordedAt: payload.recordedAt,
            }),
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

const deleteEnergyRecordFromDB = async (id: string) => {
    // 1. Check record
    const existingRecord = await prisma.energyRecord.findUnique({
        where: {
            id,
        },
    });

    if (!existingRecord) {
        throw new AppError(404, 'Energy record not found');
    }

    // 2. Delete
    await prisma.energyRecord.delete({
        where: {
            id,
        },
    });

    return null;
};

export const energyServices = {
    createEnergyRecordIntoDB,
    getAllEnergyRecordsFromDB,
    getSingleEnergyRecordFromDB,
    updateEnergyRecordIntoDB,
    deleteEnergyRecordFromDB,
};
