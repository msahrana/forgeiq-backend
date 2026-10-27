import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import {
    ICreateMachine,
    IUpdateMachine,
    IUpdateMachineStatus,
} from './machine.interface';
import { prisma } from '../../lib/prisma';
import { Prisma } from '../../../generated/prisma/client';
import { IMachine } from '../../interface';

const createMachineIntoDB = async (payload: ICreateMachine) => {
    const { plantId, productionLineId, code } = payload;

    // Check Plant
    const plant = await prisma.plant.findUnique({
        where: {
            id: plantId,
        },
    });

    if (!plant) {
        throw new AppError(httpStatus.NOT_FOUND, 'Plant not found');
    }

    // Check duplicate machine code inside same plant
    const existingMachine = await prisma.machine.findUnique({
        where: {
            plantId_code: {
                plantId,
                code,
            },
        },
    });

    if (existingMachine) {
        throw new AppError(
            httpStatus.CONFLICT,
            'Machine code already exists in this plant',
        );
    }

    // If productionLineId is provided
    if (productionLineId) {
        const productionLine = await prisma.productionLine.findUnique({
            where: {
                id: productionLineId,
            },
        });

        if (!productionLine) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Production line not found',
            );
        }

        // Production line must belong to same plant
        if (productionLine.plantId !== plantId) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Production line does not belong to this plant',
            );
        }
    }

    const result = await prisma.machine.create({
        data: payload,

        include: {
            plant: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    status: true,
                },
            },

            productionLine: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    status: true,
                },
            },
        },
    });

    return result;
};

const getAllMachinesFromDB = async (query: IMachine) => {
    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const skip = (page - 1) * limit;

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const andConditions: Prisma.MachineWhereInput[] = [];

    // Filter by plant
    if (query.plantId) {
        andConditions.push({
            plantId: query.plantId,
        });
    }

    // Filter by production line
    if (query.productionLineId) {
        andConditions.push({
            productionLineId: query.productionLineId,
        });
    }

    // Search by machine name or code
    if (query.searchTerm) {
        andConditions.push({
            OR: [
                {
                    name: {
                        contains: query.searchTerm,
                        mode: 'insensitive',
                    },
                },
                {
                    code: {
                        contains: query.searchTerm,
                        mode: 'insensitive',
                    },
                },
            ],
        });
    }

    const where: Prisma.MachineWhereInput = {
        AND: andConditions,
    };

    const [machines, totalMachineCount] = await prisma.$transaction([
        prisma.machine.findMany({
            where,
            take: limit,
            skip,
            include: {
                plant: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
                productionLine: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
                _count: {
                    select: {
                        metrics: true,
                        maintenanceTasks: true,
                        workOrders: true,
                        alerts: true,
                        productionRecords: true,
                        energyRecords: true,
                    },
                },
            },
            orderBy: {
                [sortBy]: sortOrder,
            },
        }),

        prisma.machine.count({
            where,
        }),
    ]);

    return {
        data: machines,
        meta: {
            page,
            limit,
            total: totalMachineCount,
            totalPages: Math.ceil(totalMachineCount / limit),
        },
    };
};

const getSingleMachineFromDB = async (id: string) => {
    const result = await prisma.machine.findUnique({
        where: {
            id,
        },

        include: {
            plant: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    location: true,
                    timezone: true,
                    status: true,
                },
            },

            productionLine: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    description: true,
                    status: true,
                    targetOutput: true,
                },
            },

            _count: {
                select: {
                    metrics: true,
                    maintenanceTasks: true,
                    workOrders: true,
                    alerts: true,
                    maintenanceHistory: true,
                    productionRecords: true,
                    energyRecords: true,
                },
            },
        },
    });

    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Machine not found');
    }

    return result;
};

const updateMachineIntoDB = async (id: string, payload: IUpdateMachine) => {
    const existingMachine = await prisma.machine.findUnique({
        where: {
            id,
        },
    });

    if (!existingMachine) {
        throw new AppError(httpStatus.NOT_FOUND, 'Machine not found');
    }

    const { plantId, productionLineId, code } = payload;

    const finalPlantId = plantId ?? existingMachine.plantId;

    const finalProductionLineId =
        productionLineId === undefined
            ? existingMachine.productionLineId
            : productionLineId;

    // Check Plant
    if (plantId) {
        const plant = await prisma.plant.findUnique({
            where: {
                id: plantId,
            },
        });

        if (!plant) {
            throw new AppError(httpStatus.NOT_FOUND, 'Plant not found');
        }
    }

    // Check duplicate code
    if (code) {
        const duplicateMachine = await prisma.machine.findFirst({
            where: {
                plantId: finalPlantId,
                code,
                NOT: {
                    id,
                },
            },
        });

        if (duplicateMachine) {
            throw new AppError(
                httpStatus.CONFLICT,
                'Machine code already exists in this plant',
            );
        }
    }

    // Check production line
    if (finalProductionLineId) {
        const productionLine = await prisma.productionLine.findUnique({
            where: {
                id: finalProductionLineId,
            },
        });

        if (!productionLine) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Production line not found',
            );
        }

        if (productionLine.plantId !== finalPlantId) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Production line does not belong to this plant',
            );
        }
    }

    const result = await prisma.machine.update({
        where: {
            id,
        },

        data: payload,

        include: {
            plant: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    status: true,
                },
            },

            productionLine: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    status: true,
                },
            },
        },
    });

    return result;
};

const updateMachineStatusIntoDB = async (
    id: string,
    payload: IUpdateMachineStatus,
) => {
    const machine = await prisma.machine.findUnique({
        where: {
            id,
        },
    });

    if (!machine) {
        throw new AppError(httpStatus.NOT_FOUND, 'Machine not found');
    }

    const result = await prisma.machine.update({
        where: {
            id,
        },

        data: {
            status: payload.status,
        },

        include: {
            plant: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },

            productionLine: {
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

const deleteMachineFromDB = async (id: string) => {
    const machine = await prisma.machine.findUnique({
        where: {
            id,
        },
    });

    if (!machine) {
        throw new AppError(httpStatus.NOT_FOUND, 'Machine not found');
    }

    await prisma.machine.delete({
        where: {
            id,
        },
    });

    return null;
};

export const machineServices = {
    createMachineIntoDB,
    getAllMachinesFromDB,
    getSingleMachineFromDB,
    updateMachineIntoDB,
    updateMachineStatusIntoDB,
    deleteMachineFromDB,
};
