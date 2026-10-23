import httpStatus from 'http-status';

import AppError from '../../errors/AppError';
import { prisma } from '../../lib/prisma';
import {
    ICreateProductionLine,
    IUpdateProductionLine,
} from './productionLine.interface';
import { Prisma } from '../../../generated/prisma/client';
import { IQuery } from '../../interface';

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


const getAllProductionLinesFromDB = async (query: IQuery) => {
    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const skip = (page - 1) * limit;

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const andConditions: Prisma.ProductionLineWhereInput[] = [];

    // Filter by plant
    if (query.plantId) {
        andConditions.push({
            plantId: query.plantId,
        });
    }

    // Searching
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

    const where: Prisma.ProductionLineWhereInput = {
        AND: andConditions,
    };

    const [productionLines, totalProductionLineCount] =
        await prisma.$transaction([
            prisma.productionLine.findMany({
                where,
                take: limit,
                skip,
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
                    [sortBy]: sortOrder,
                },
            }),

            prisma.productionLine.count({
                where,
            }),
        ]);

    return {
        data: productionLines,
        meta: {
            page,
            limit,
            total: totalProductionLineCount,
            totalPages: Math.ceil(totalProductionLineCount / limit),
        },
    };
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
