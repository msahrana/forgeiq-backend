import { Prisma } from '../../../generated/prisma/client';
import { prisma } from '../../lib/prisma';
import AppError from '../../errors/AppError';

import {
    ICreateReport,
    IGetReportsQuery,
    IUpdateReport,
} from './report.interface';

import { reportQueryValidationSchema } from './report.validation';

const createReportIntoDB = async (
    payload: ICreateReport,
    createdById: string,
) => {
    const {
        organizationId,
        plantId,
        type,
        title,
        dateFrom,
        dateTo,
        status,
        fileUrl,
        metadata,
    } = payload;

    // Check organization
    const organization = await prisma.organization.findUnique({
        where: {
            id: organizationId,
        },
    });

    if (!organization) {
        throw new AppError(404, 'Organization not found');
    }

    // Check plant if provided
    if (plantId) {
        const plant = await prisma.plant.findUnique({
            where: {
                id: plantId,
            },
        });

        if (!plant) {
            throw new AppError(404, 'Plant not found');
        }

        if (plant.organizationId !== organizationId) {
            throw new AppError(
                400,
                'Plant does not belong to this organization',
            );
        }
    }

    // Check date range
    if (dateFrom > dateTo) {
        throw new AppError(400, 'Date from cannot be greater than date to');
    }

    const result = await prisma.report.create({
        data: {
            organizationId,
            plantId,
            createdById,

            type,
            title,

            dateFrom,
            dateTo,

            status,
            fileUrl,
            metadata,
        },

        include: {
            organization: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },

            plant: {
                select: {
                    id: true,
                    name: true,
                    code: true,
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

const getAllReportsFromDB = async (query: IGetReportsQuery) => {
    const validatedQuery = reportQueryValidationSchema.parse(query);

    const { organizationId, plantId, type, status, startDate, endDate } =
        validatedQuery;

    const whereConditions: Prisma.ReportWhereInput = {};

    if (organizationId) {
        whereConditions.organizationId = organizationId;
    }

    if (plantId) {
        whereConditions.plantId = plantId;
    }

    if (type) {
        whereConditions.type = type;
    }

    if (status) {
        whereConditions.status = status;
    }

    if (startDate || endDate) {
        whereConditions.dateFrom = {};

        if (startDate) {
            whereConditions.dateFrom.gte = startDate;
        }

        if (endDate) {
            whereConditions.dateFrom.lte = endDate;
        }
    }

    const result = await prisma.report.findMany({
        where: whereConditions,

        include: {
            organization: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },

            plant: {
                select: {
                    id: true,
                    name: true,
                    code: true,
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

        orderBy: {
            createdAt: 'desc',
        },
    });

    return result;
};

const getSingleReportFromDB = async (id: string) => {
    const result = await prisma.report.findUnique({
        where: {
            id,
        },

        include: {
            organization: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },

            plant: {
                select: {
                    id: true,
                    name: true,
                    code: true,
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

    if (!result) {
        throw new AppError(404, 'Report not found');
    }

    return result;
};

const updateReportIntoDB = async (id: string, payload: IUpdateReport) => {
    const existingReport = await prisma.report.findUnique({
        where: {
            id,
        },
    });

    if (!existingReport) {
        throw new AppError(404, 'Report not found');
    }

    // Check plant if plantId is being changed
    if (payload.plantId !== undefined && payload.plantId !== null) {
        const plant = await prisma.plant.findUnique({
            where: {
                id: payload.plantId,
            },
        });

        if (!plant) {
            throw new AppError(404, 'Plant not found');
        }

        if (plant.organizationId !== existingReport.organizationId) {
            throw new AppError(
                400,
                'Plant does not belong to this organization',
            );
        }
    }

    // Check date range using existing values
    const finalDateFrom = payload.dateFrom ?? existingReport.dateFrom;

    const finalDateTo = payload.dateTo ?? existingReport.dateTo;

    if (finalDateFrom > finalDateTo) {
        throw new AppError(400, 'Date from cannot be greater than date to');
    }

    const updateData: Prisma.ReportUpdateInput = {
        ...(payload.plantId !== undefined && {
            plant:
                payload.plantId === null
                    ? {
                          disconnect: true,
                      }
                    : {
                          connect: {
                              id: payload.plantId,
                          },
                      },
        }),

        ...(payload.type !== undefined && {
            type: payload.type,
        }),

        ...(payload.title !== undefined && {
            title: payload.title,
        }),

        ...(payload.dateFrom !== undefined && {
            dateFrom: payload.dateFrom,
        }),

        ...(payload.dateTo !== undefined && {
            dateTo: payload.dateTo,
        }),

        ...(payload.status !== undefined && {
            status: payload.status,
        }),

        ...(payload.fileUrl !== undefined && {
            fileUrl: payload.fileUrl,
        }),

        ...(payload.metadata !== undefined && {
            metadata:
                payload.metadata === null ? Prisma.JsonNull : payload.metadata,
        }),
    };

    const result = await prisma.report.update({
        where: {
            id,
        },

        data: updateData,

        include: {
            organization: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },

            plant: {
                select: {
                    id: true,
                    name: true,
                    code: true,
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

const deleteReportFromDB = async (id: string) => {
    const existingReport = await prisma.report.findUnique({
        where: {
            id,
        },
    });

    if (!existingReport) {
        throw new AppError(404, 'Report not found');
    }

    await prisma.report.delete({
        where: {
            id,
        },
    });

    return null;
};

export const reportServices = {
    createReportIntoDB,
    getAllReportsFromDB,
    getSingleReportFromDB,
    updateReportIntoDB,
    deleteReportFromDB,
};
