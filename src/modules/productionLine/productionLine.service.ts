import httpStatus from 'http-status';

import AppError from '../../errors/AppError';
import { prisma } from '../../lib/prisma';
import {
    ICreateProductionLine,
    IUpdateProductionLine,
} from './productionLine.interface';

const createProductionLineIntoDB = async (payload: ICreateProductionLine) => {
    const { plantId, name, code, description, status, targetOutput } = payload;

    // Check Plant
    const plant = await prisma.plant.findUnique({
        where: {
            id: plantId,
        },
    });

    if (!plant) {
        throw new AppError(httpStatus.NOT_FOUND, 'Plant not found');
    }

    // Check duplicate code inside same Plant
    const existingProductionLine = await prisma.productionLine.findFirst({
        where: {
            plantId,
            code,
        },
    });

    if (existingProductionLine) {
        throw new AppError(
            httpStatus.CONFLICT,
            'Production line code already exists in this plant',
        );
    }

    const result = await prisma.productionLine.create({
        data: {
            plantId,
            name,
            code,
            description,
            status,
            targetOutput,
        },

        include: {
            plant: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    location: true,
                    status: true,
                },
            },

            _count: {
                select: {
                    machines: true,
                    productionRecords: true,
                    qualityInspections: true,
                },
            },
        },
    });

    return result;
};

const getAllProductionLinesFromDB = async (plantId?: string) => {
    const result = await prisma.productionLine.findMany({
        where: plantId
            ? {
                  plantId,
              }
            : undefined,

        include: {
            plant: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    location: true,
                    status: true,
                },
            },

            _count: {
                select: {
                    machines: true,
                    productionRecords: true,
                    qualityInspections: true,
                },
            },
        },

        orderBy: {
            createdAt: 'desc',
        },
    });

    return result;
};

const getSingleProductionLineFromDB = async (id: string) => {
    const result = await prisma.productionLine.findUnique({
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

            machines: {
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

                orderBy: {
                    createdAt: 'desc',
                },
            },

            _count: {
                select: {
                    machines: true,
                    productionRecords: true,
                    qualityInspections: true,
                },
            },
        },
    });

    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Production line not found');
    }

    return result;
};

const updateProductionLineIntoDB = async (
    id: string,
    payload: IUpdateProductionLine,
) => {
    const productionLine = await prisma.productionLine.findUnique({
        where: {
            id,
        },
    });

    if (!productionLine) {
        throw new AppError(httpStatus.NOT_FOUND, 'Production line not found');
    }

    // Check duplicate code
    if (payload.code) {
        const existingProductionLine = await prisma.productionLine.findFirst({
            where: {
                plantId: productionLine.plantId,
                code: payload.code,

                NOT: {
                    id,
                },
            },
        });

        if (existingProductionLine) {
            throw new AppError(
                httpStatus.CONFLICT,
                'Production line code already exists in this plant',
            );
        }
    }

    const result = await prisma.productionLine.update({
        where: {
            id,
        },

        data: {
            ...(payload.name !== undefined && {
                name: payload.name,
            }),

            ...(payload.code !== undefined && {
                code: payload.code,
            }),

            ...(payload.description !== undefined && {
                description: payload.description,
            }),

            ...(payload.status !== undefined && {
                status: payload.status,
            }),

            ...(payload.targetOutput !== undefined && {
                targetOutput: payload.targetOutput,
            }),
        },

        include: {
            plant: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    location: true,
                    status: true,
                },
            },

            _count: {
                select: {
                    machines: true,
                    productionRecords: true,
                    qualityInspections: true,
                },
            },
        },
    });

    return result;
};

const updateProductionLineStatusIntoDB = async (
    id: string,
    status: IUpdateProductionLine['status'],
) => {
    const productionLine = await prisma.productionLine.findUnique({
        where: {
            id,
        },
    });

    if (!productionLine) {
        throw new AppError(httpStatus.NOT_FOUND, 'Production line not found');
    }

    const result = await prisma.productionLine.update({
        where: {
            id,
        },

        data: {
            status,
        },

        include: {
            plant: {
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

const deleteProductionLineFromDB = async (id: string) => {
    const productionLine = await prisma.productionLine.findUnique({
        where: {
            id,
        },
    });

    if (!productionLine) {
        throw new AppError(httpStatus.NOT_FOUND, 'Production line not found');
    }

    const result = await prisma.productionLine.delete({
        where: {
            id,
        },
    });

    return result;
};

export const productionLineServices = {
    createProductionLineIntoDB,
    getAllProductionLinesFromDB,
    getSingleProductionLineFromDB,
    updateProductionLineIntoDB,
    updateProductionLineStatusIntoDB,
    deleteProductionLineFromDB,
};
