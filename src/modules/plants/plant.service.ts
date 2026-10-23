import httpStatus from 'http-status';
import AppError from '../../errors/AppError';

import { ICreatePlant, IUpdatePlant } from './plant.interface';
import { prisma } from '../../lib/prisma';
import { Prisma } from '../../../generated/prisma/client';

const ALLOWED_MANAGER_ROLES = ['ORG_OWNER', 'FACTORY_MANAGER'] as const;

// Validate a manager and their membership in an organization.

const validatePlantManager = async (
    organizationId: string,
    managerId: string,
) => {
    const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: {
            id: true,
            ownerId: true,
        },
    });

    if (!organization) {
        throw new AppError(httpStatus.NOT_FOUND, 'Organization not found');
    }

    const manager = await prisma.user.findUnique({
        where: { id: managerId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
        },
    });

    if (!manager) {
        throw new AppError(httpStatus.NOT_FOUND, 'Plant manager not found');
    }

    if (manager.status !== 'ACTIVE') {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Plant manager account is not active',
        );
    }

    const isOwner = organization.ownerId === manager.id;

    const membership = await prisma.organizationMember.findUnique({
        where: {
            userId_organizationId: {
                userId: manager.id,
                organizationId: organization.id,
            },
        },
        select: {
            userId: true,
            organizationId: true,
            role: true,
            status: true,
        },
    });

    const isActiveMember = membership?.status === 'ACTIVE';

    if (!isOwner && !isActiveMember) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            membership
                ? `Plant manager membership is ${membership.status}, not ACTIVE`
                : 'Plant manager is not a member of this organization',
        );
    }

    const isAllowedRole = (ALLOWED_MANAGER_ROLES as readonly string[]).includes(
        manager.role,
    );

    if (!isAllowedRole) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Selected user does not have an allowed plant manager role',
        );
    }

    return manager;
};

// CREATE PLANT
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

    // 1. Validate organization
    const organization = await prisma.organization.findUnique({
        where: {
            id: organizationId,
        },
        select: {
            id: true,
        },
    });

    if (!organization) {
        throw new AppError(httpStatus.NOT_FOUND, 'Organization not found');
    }

    // 2. Validate manager, if provided
    if (managerId) {
        await validatePlantManager(organizationId, managerId);
    }

    // 3. Check duplicate plant code
    const existingPlant = await prisma.plant.findFirst({
        where: {
            organizationId,
            code,
        },
        select: {
            id: true,
        },
    });

    if (existingPlant) {
        throw new AppError(
            httpStatus.CONFLICT,
            'Plant code already exists in this organization',
        );
    }

    // 4. Create plant
    return prisma.plant.create({
        data: {
            organizationId,
            managerId: managerId || null,
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
};

// GET ALL PLANTS
const getAllPlantsFromDB = async (query: Record<string, unknown>) => {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const organizationId =
        typeof query.organizationId === 'string'
            ? query.organizationId.trim()
            : '';

    const searchTerm =
        typeof query.searchTerm === 'string' ? query.searchTerm.trim() : '';

    const where: Prisma.PlantWhereInput = {
        ...(organizationId && { organizationId }),

        ...(searchTerm && {
            OR: [
                {
                    name: {
                        contains: searchTerm,
                        mode: 'insensitive',
                    },
                },
                {
                    code: {
                        contains: searchTerm,
                        mode: 'insensitive',
                    },
                },
                {
                    location: {
                        contains: searchTerm,
                        mode: 'insensitive',
                    },
                },
            ],
        }),
    };

    const [plants, total] = await prisma.$transaction([
        prisma.plant.findMany({
            where,
            skip,
            take: limit,
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
        }),

        prisma.plant.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
        data: plants,
        meta: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
    };
};

// GET SINGLE PLANT
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

// UPDATE PLANT
const updatePlantIntoDB = async (id: string, payload: IUpdatePlant) => {
    // 1. Check plant
    const plant = await prisma.plant.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
            organizationId: true,
        },
    });

    if (!plant) {
        throw new AppError(httpStatus.NOT_FOUND, 'Plant not found');
    }

    // 2. Validate manager if provided.
    // null or empty string means remove the assigned manager.
    if (payload.managerId) {
        await validatePlantManager(plant.organizationId, payload.managerId);
    }

    // 3. Check duplicate plant code
    if (payload.code) {
        const existingPlant = await prisma.plant.findFirst({
            where: {
                organizationId: plant.organizationId,
                code: payload.code,
                NOT: {
                    id,
                },
            },
            select: {
                id: true,
            },
        });

        if (existingPlant) {
            throw new AppError(
                httpStatus.CONFLICT,
                'Plant code already exists in this organization',
            );
        }
    }

    // 4. Update plant
    return prisma.plant.update({
        where: {
            id,
        },
        data: {
            ...(payload.managerId !== undefined && {
                managerId: payload.managerId || null,
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
};

// UPDATE PLANT STATUS
const updatePlantStatusIntoDB = async (
    id: string,
    status: IUpdatePlant['status'],
) => {
    const plant = await prisma.plant.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
        },
    });

    if (!plant) {
        throw new AppError(httpStatus.NOT_FOUND, 'Plant not found');
    }

    return prisma.plant.update({
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
};

// DELETE PLANT
const deletePlantFromDB = async (id: string) => {
    const plant = await prisma.plant.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
        },
    });

    if (!plant) {
        throw new AppError(httpStatus.NOT_FOUND, 'Plant not found');
    }

    return prisma.plant.delete({
        where: {
            id,
        },
    });
};

export const plantServices = {
    createPlantIntoDB,
    getAllPlantsFromDB,
    getSinglePlantFromDB,
    updatePlantIntoDB,
    updatePlantStatusIntoDB,
    deletePlantFromDB,
};
