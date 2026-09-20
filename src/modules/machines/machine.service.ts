import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import {
    ICreateMachine,
    IUpdateMachine,
    IUpdateMachineStatus,
} from './machine.interface';
import { prisma } from '../../lib/prisma';

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

const getAllMachinesFromDB = async (
    plantId?: string,
    productionLineId?: string,
) => {
    // Validate plant if filter provided
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

    // Validate production line if filter provided
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
    }

    const result = await prisma.machine.findMany({
        where: {
            ...(plantId && {
                plantId,
            }),

            ...(productionLineId && {
                productionLineId,
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
    });

    return result;
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
