import httpStatus from 'http-status';
import AppError from '../../errors/AppError';

import { ICreatePlant, IUpdatePlant } from './plant.interface';
import { prisma } from '../../lib/prisma';

const createPlantIntoDB = async (payload: ICreatePlant) => {
    const {
        organizationId,
        managerId,
        name,
        code,
        location,
        timezone,
        status,
    } = payload;

    // 1. Check Organization
    const organization = await prisma.organization.findUnique({
        where: {
            id: organizationId,
        },
    });

    if (!organization) {
        throw new AppError(httpStatus.NOT_FOUND, 'Organization not found');
    }

    // 2. Check Manager
    if (managerId) {
        const manager = await prisma.user.findUnique({
            where: {
                id: managerId,
            },
        });

        if (!manager) {
            throw new AppError(httpStatus.NOT_FOUND, 'Plant manager not found');
        }

        // 3. Check Manager belongs to Organization
        const organizationMember = await prisma.organizationMember.findFirst({
            where: {
                organizationId,
                userId: managerId,
            },
        });

        if (!organizationMember) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Plant manager does not belong to this organization',
            );
        }
    }

    // 4. Check duplicate plant code
    const existingPlant = await prisma.plant.findFirst({
        where: {
            organizationId,
            code,
        },
    });

    if (existingPlant) {
        throw new AppError(
            httpStatus.CONFLICT,
            'Plant code already exists in this organization',
        );
    }

    // 5. Create Plant
    const result = await prisma.plant.create({
        data: {
            organizationId,
            managerId,
            name,
            code,
            location,
            timezone,
            status,
        },
        include: {
            organization: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
            manager: {
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

const getAllPlantsFromDB = async (organizationId?: string) => {
    const result = await prisma.plant.findMany({
        where: organizationId
            ? {
                  organizationId,
              }
            : undefined,

        include: {
            organization: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },

            manager: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },

            _count: {
                select: {
                    productionLines: true,
                    machines: true,
                    maintenanceTasks: true,
                    workOrders: true,
                    alerts: true,
                    productionRecords: true,
                    qualityInspections: true,
                    energyRecords: true,
                },
            },
        },

        orderBy: {
            createdAt: 'desc',
        },
    });

    return result;
};

const getSinglePlantFromDB = async (id: string) => {
    const result = await prisma.plant.findUnique({
        where: {
            id,
        },

        include: {
            organization: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    industry: true,
                    country: true,
                    timezone: true,
                },
            },

            manager: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    status: true,
                },
            },

            _count: {
                select: {
                    productionLines: true,
                    machines: true,
                    maintenanceTasks: true,
                    workOrders: true,
                    alerts: true,
                    productionRecords: true,
                    qualityInspections: true,
                    energyRecords: true,
                },
            },
        },
    });

    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Plant not found');
    }

    return result;
};

const updatePlantIntoDB = async (id: string, payload: IUpdatePlant) => {
    // 1. Check Plant
    const plant = await prisma.plant.findUnique({
        where: {
            id,
        },
    });

    if (!plant) {
        throw new AppError(httpStatus.NOT_FOUND, 'Plant not found');
    }

    // 2. Check Manager
    if (payload.managerId !== undefined && payload.managerId !== null) {
        const manager = await prisma.user.findUnique({
            where: {
                id: payload.managerId,
            },
        });

        if (!manager) {
            throw new AppError(httpStatus.NOT_FOUND, 'Plant manager not found');
        }

        // 3. Check Manager belongs to same organization
        const organizationMember = await prisma.organizationMember.findFirst({
            where: {
                organizationId: plant.organizationId,
                userId: payload.managerId,
            },
        });

        if (!organizationMember) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Plant manager does not belong to this organization',
            );
        }
    }

    // 4. Check duplicate code
    if (payload.code) {
        const existingPlant = await prisma.plant.findFirst({
            where: {
                organizationId: plant.organizationId,
                code: payload.code,
                NOT: {
                    id,
                },
            },
        });

        if (existingPlant) {
            throw new AppError(
                httpStatus.CONFLICT,
                'Plant code already exists in this organization',
            );
        }
    }

    // 5. Update Plant
    const result = await prisma.plant.update({
        where: {
            id,
        },

        data: {
            ...(payload.managerId !== undefined && {
                managerId: payload.managerId,
            }),

            ...(payload.name !== undefined && {
                name: payload.name,
            }),

            ...(payload.code !== undefined && {
                code: payload.code,
            }),

            ...(payload.location !== undefined && {
                location: payload.location,
            }),

            ...(payload.timezone !== undefined && {
                timezone: payload.timezone,
            }),

            ...(payload.status !== undefined && {
                status: payload.status,
            }),
        },

        include: {
            organization: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },

            manager: {
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

const updatePlantStatusIntoDB = async (
    id: string,
    status: IUpdatePlant['status'],
) => {
    const plant = await prisma.plant.findUnique({
        where: {
            id,
        },
    });

    if (!plant) {
        throw new AppError(httpStatus.NOT_FOUND, 'Plant not found');
    }

    const result = await prisma.plant.update({
        where: {
            id,
        },

        data: {
            status,
        },

        include: {
            organization: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },

            manager: {
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

const deletePlantFromDB = async (id: string) => {
    const plant = await prisma.plant.findUnique({
        where: {
            id,
        },
    });

    if (!plant) {
        throw new AppError(httpStatus.NOT_FOUND, 'Plant not found');
    }

    const result = await prisma.plant.delete({
        where: {
            id,
        },
    });

    return result;
};

export const plantServices = {
    createPlantIntoDB,
    getAllPlantsFromDB,
    getSinglePlantFromDB,
    updatePlantIntoDB,
    updatePlantStatusIntoDB,
    deletePlantFromDB,
};
