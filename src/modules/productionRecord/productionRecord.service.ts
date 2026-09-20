import httpStatus from 'http-status';
import { ProductionStatus } from '../../../generated/prisma/enums';
import { Prisma } from '../../../generated/prisma/client';
import AppError from '../../errors/AppError';
import { prisma } from '../../lib/prisma';

import {
    ICreateProductionRecord,
    IGetProductionRecordsQuery,
    IUpdateProductionRecord,
} from './productionRecord.interface';

const createProductionRecordIntoDB = async (
    payload: ICreateProductionRecord,
) => {
    const {
        plantId,
        productionLineId,
        machineId,
        targetQuantity,
        actualQuantity,
        defectQuantity = 0,
        downtimeMinutes = 0,
        status = ProductionStatus.RUNNING,
        recordedAt,
    } = payload;

    // --------------------------------------------------
    // Validate Plant
    // --------------------------------------------------

    const plant = await prisma.plant.findUnique({
        where: {
            id: plantId,
        },
    });

    if (!plant) {
        throw new AppError(httpStatus.NOT_FOUND, 'Plant not found');
    }

    // --------------------------------------------------
    // Validate Production Line
    // --------------------------------------------------

    const productionLine = await prisma.productionLine.findUnique({
        where: {
            id: productionLineId,
        },
    });

    if (!productionLine) {
        throw new AppError(httpStatus.NOT_FOUND, 'Production line not found');
    }

    // Production Line must belong to the same Plant

    if (productionLine.plantId !== plantId) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Production line does not belong to this plant',
        );
    }

    // --------------------------------------------------
    // Validate Machine
    // --------------------------------------------------

    if (machineId) {
        const machine = await prisma.machine.findUnique({
            where: {
                id: machineId,
            },
        });

        if (!machine) {
            throw new AppError(httpStatus.NOT_FOUND, 'Machine not found');
        }

        // Machine must belong to same Plant

        if (machine.plantId !== plantId) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Machine does not belong to this plant',
            );
        }

        // If machine has a production line,
        // it must match the requested production line.

        if (
            machine.productionLineId &&
            machine.productionLineId !== productionLineId
        ) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Machine does not belong to this production line',
            );
        }
    }

    // --------------------------------------------------
    // Quantity validation
    // --------------------------------------------------

    if (defectQuantity > actualQuantity) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Defect quantity cannot be greater than actual quantity',
        );
    }

    // --------------------------------------------------
    // Create Production Record
    // --------------------------------------------------

    const result = await prisma.productionRecord.create({
        data: {
            plant: {
                connect: {
                    id: plantId,
                },
            },

            productionLine: {
                connect: {
                    id: productionLineId,
                },
            },

            ...(machineId
                ? {
                      machine: {
                          connect: {
                              id: machineId,
                          },
                      },
                  }
                : {}),

            targetQuantity,
            actualQuantity,
            defectQuantity,
            downtimeMinutes,
            status,
            ...(recordedAt
                ? {
                      recordedAt,
                  }
                : {}),
        },

        include: {
            plant: true,
            productionLine: true,
            machine: true,
        },
    });

    return result;
};

const getAllProductionRecordsFromDB = async (
    query: IGetProductionRecordsQuery,
) => {
    const { plantId, productionLineId, machineId, status, startDate, endDate } =
        query;

    const where: Prisma.ProductionRecordWhereInput = {};

    if (plantId) {
        where.plantId = plantId;
    }

    if (productionLineId) {
        where.productionLineId = productionLineId;
    }

    if (machineId) {
        where.machineId = machineId;
    }

    if (status) {
        where.status = status;
    }

    if (startDate || endDate) {
        where.recordedAt = {
            ...(startDate
                ? {
                      gte: startDate,
                  }
                : {}),

            ...(endDate
                ? {
                      lte: endDate,
                  }
                : {}),
        };
    }

    const result = await prisma.productionRecord.findMany({
        where,

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
                    status: true,
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

const getSingleProductionRecordFromDB = async (id: string) => {
    const result = await prisma.productionRecord.findUnique({
        where: {
            id,
        },

        include: {
            plant: true,
            productionLine: true,
            machine: true,
        },
    });

    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Production record not found');
    }

    return result;
};

const updateProductionRecordIntoDB = async (
    id: string,
    payload: IUpdateProductionRecord,
) => {
    const existingRecord = await prisma.productionRecord.findUnique({
        where: {
            id,
        },
    });

    if (!existingRecord) {
        throw new AppError(httpStatus.NOT_FOUND, 'Production record not found');
    }

    const finalActualQuantity =
        payload.actualQuantity ?? existingRecord.actualQuantity;

    const finalDefectQuantity =
        payload.defectQuantity ?? existingRecord.defectQuantity;

    // --------------------------------------------------
    // Validate final quantities
    // --------------------------------------------------

    if (finalDefectQuantity > finalActualQuantity) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Defect quantity cannot be greater than actual quantity',
        );
    }

    // --------------------------------------------------
    // Prevent negative values
    // --------------------------------------------------

    if (payload.targetQuantity !== undefined && payload.targetQuantity < 0) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Target quantity cannot be negative',
        );
    }

    if (payload.actualQuantity !== undefined && payload.actualQuantity < 0) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Actual quantity cannot be negative',
        );
    }

    if (payload.defectQuantity !== undefined && payload.defectQuantity < 0) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Defect quantity cannot be negative',
        );
    }

    if (payload.downtimeMinutes !== undefined && payload.downtimeMinutes < 0) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Downtime cannot be negative',
        );
    }

    // --------------------------------------------------
    // Update
    // --------------------------------------------------

    const result = await prisma.productionRecord.update({
        where: {
            id,
        },

        data: {
            ...(payload.targetQuantity !== undefined
                ? {
                      targetQuantity: payload.targetQuantity,
                  }
                : {}),

            ...(payload.actualQuantity !== undefined
                ? {
                      actualQuantity: payload.actualQuantity,
                  }
                : {}),

            ...(payload.defectQuantity !== undefined
                ? {
                      defectQuantity: payload.defectQuantity,
                  }
                : {}),

            ...(payload.downtimeMinutes !== undefined
                ? {
                      downtimeMinutes: payload.downtimeMinutes,
                  }
                : {}),

            ...(payload.status !== undefined
                ? {
                      status: payload.status,
                  }
                : {}),

            ...(payload.recordedAt !== undefined
                ? {
                      recordedAt: payload.recordedAt,
                  }
                : {}),
        },

        include: {
            plant: true,
            productionLine: true,
            machine: true,
        },
    });

    return result;
};

const deleteProductionRecordFromDB = async (id: string) => {
    const existingRecord = await prisma.productionRecord.findUnique({
        where: {
            id,
        },
    });

    if (!existingRecord) {
        throw new AppError(httpStatus.NOT_FOUND, 'Production record not found');
    }

    await prisma.productionRecord.delete({
        where: {
            id,
        },
    });

    return null;
};

export const productionRecordServices = {
    createProductionRecordIntoDB,
    getAllProductionRecordsFromDB,
    getSingleProductionRecordFromDB,
    updateProductionRecordIntoDB,
    deleteProductionRecordFromDB,
};
