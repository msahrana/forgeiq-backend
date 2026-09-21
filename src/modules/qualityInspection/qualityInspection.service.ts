import httpStatus from 'http-status';
import { Prisma, QualityResult } from '../../../generated/prisma/client';
import { prisma } from '../../lib/prisma';
import AppError from '../../errors/AppError';

import {
    ICreateQualityInspection,
    IGetQualityInspectionsQuery,
    IUpdateQualityInspection,
} from './qualityInspection.interface';

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const validateQuantities = (
    inspectedQuantity: number,
    passedQuantity: number,
    defectQuantity: number,
) => {
    if (inspectedQuantity < 0) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Inspected quantity cannot be negative',
        );
    }

    if (passedQuantity < 0) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Passed quantity cannot be negative',
        );
    }

    if (defectQuantity < 0) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Defect quantity cannot be negative',
        );
    }

    if (passedQuantity > inspectedQuantity) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Passed quantity cannot be greater than inspected quantity',
        );
    }

    if (defectQuantity > inspectedQuantity) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Defect quantity cannot be greater than inspected quantity',
        );
    }

    if (passedQuantity + defectQuantity > inspectedQuantity) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Passed quantity and defect quantity cannot exceed inspected quantity',
        );
    }
};

/* -------------------------------------------------------------------------- */
/* Create Quality Inspection                                                  */
/* -------------------------------------------------------------------------- */

const createQualityInspectionIntoDB = async (
    payload: ICreateQualityInspection,
) => {
    const {
        plantId,
        productionLineId,
        productName,
        batchNumber,
        inspectedQuantity,
        passedQuantity,
        defectQuantity,
        result,
        defectType,
        notes,
        inspectedById,
        inspectionDate,
    } = payload;

    /* ------------------------------ Quantities ----------------------------- */

    validateQuantities(inspectedQuantity, passedQuantity, defectQuantity);

    /* -------------------------------- Plant -------------------------------- */

    const plant = await prisma.plant.findUnique({
        where: {
            id: plantId,
        },
    });

    if (!plant) {
        throw new AppError(httpStatus.NOT_FOUND, 'Plant not found');
    }

    /* ------------------------- Production Line ---------------------------- */

    const productionLine = await prisma.productionLine.findUnique({
        where: {
            id: productionLineId,
        },
    });

    if (!productionLine) {
        throw new AppError(httpStatus.NOT_FOUND, 'Production line not found');
    }

    if (productionLine.plantId !== plantId) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Production line does not belong to this plant',
        );
    }

    /* ------------------------------- Inspector ----------------------------- */

    const inspector = await prisma.user.findUnique({
        where: {
            id: inspectedById,
        },
    });

    if (!inspector) {
        throw new AppError(httpStatus.NOT_FOUND, 'Inspector not found');
    }

    if (inspector.isDeleted) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Inspector account has been deleted',
        );
    }

    if (inspector.status !== 'ACTIVE') {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Inspector account is not active',
        );
    }

    /* --------------------------- Automatic Result -------------------------- */

    let finalResult = result;

    if (!finalResult) {
        if (passedQuantity === inspectedQuantity && defectQuantity === 0) {
            finalResult = QualityResult.PASSED;
        } else if (
            passedQuantity === 0 &&
            defectQuantity === inspectedQuantity
        ) {
            finalResult = QualityResult.FAILED;
        } else if (passedQuantity > 0 && defectQuantity > 0) {
            finalResult = QualityResult.PARTIAL;
        } else {
            finalResult = QualityResult.PENDING;
        }
    }

    /* --------------------------- Defect Validation ------------------------- */

    if (defectQuantity > 0 && !defectType) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Defect type is required when defect quantity is greater than zero',
        );
    }

    if (defectQuantity === 0 && defectType) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Defect type should not be provided when defect quantity is zero',
        );
    }

    /* -------------------------------- Create -------------------------------- */

    const resultData = await prisma.qualityInspection.create({
        data: {
            plantId,
            productionLineId,
            productName,
            batchNumber,
            inspectedQuantity,
            passedQuantity,
            defectQuantity,
            result: finalResult,
            defectType,
            notes,
            inspectedById,
            inspectionDate,
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
            inspectedBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });

    return resultData;
};

/* -------------------------------------------------------------------------- */
/* Get All Quality Inspections                                                */
/* -------------------------------------------------------------------------- */

const getAllQualityInspectionsFromDB = async (
    query: IGetQualityInspectionsQuery,
) => {
    const {
        plantId,
        productionLineId,
        inspectedById,
        result,
        defectType,
        startDate,
        endDate,
    } = query;

    const where: Prisma.QualityInspectionWhereInput = {};

    if (plantId) {
        where.plantId = plantId;
    }

    if (productionLineId) {
        where.productionLineId = productionLineId;
    }

    if (inspectedById) {
        where.inspectedById = inspectedById;
    }

    if (result) {
        where.result = result;
    }

    if (defectType) {
        where.defectType = defectType;
    }

    if (startDate || endDate) {
        where.inspectionDate = {};

        if (startDate) {
            where.inspectionDate.gte = startDate;
        }

        if (endDate) {
            where.inspectionDate.lte = endDate;
        }
    }

    const inspections = await prisma.qualityInspection.findMany({
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
                },
            },
            inspectedBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
        orderBy: {
            inspectionDate: 'desc',
        },
    });

    return inspections;
};

/* -------------------------------------------------------------------------- */
/* Get Single Quality Inspection                                              */
/* -------------------------------------------------------------------------- */

const getSingleQualityInspectionFromDB = async (id: string) => {
    const inspection = await prisma.qualityInspection.findUnique({
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
            productionLine: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
            inspectedBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });

    if (!inspection) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Quality inspection not found',
        );
    }

    return inspection;
};

/* -------------------------------------------------------------------------- */
/* Update Quality Inspection                                                  */
/* -------------------------------------------------------------------------- */

const updateQualityInspectionIntoDB = async (
    id: string,
    payload: IUpdateQualityInspection,
) => {
    const existingInspection = await prisma.qualityInspection.findUnique({
        where: {
            id,
        },
    });

    if (!existingInspection) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Quality inspection not found',
        );
    }

    /* -------------------------- Final Quantities --------------------------- */

    const finalInspectedQuantity =
        payload.inspectedQuantity ?? existingInspection.inspectedQuantity;

    const finalPassedQuantity =
        payload.passedQuantity ?? existingInspection.passedQuantity;

    const finalDefectQuantity =
        payload.defectQuantity ?? existingInspection.defectQuantity;

    validateQuantities(
        finalInspectedQuantity,
        finalPassedQuantity,
        finalDefectQuantity,
    );

    /* --------------------------- Automatic Result -------------------------- */

    let finalResult = payload.result;

    if (!finalResult) {
        if (
            finalPassedQuantity === finalInspectedQuantity &&
            finalDefectQuantity === 0
        ) {
            finalResult = QualityResult.PASSED;
        } else if (
            finalPassedQuantity === 0 &&
            finalDefectQuantity === finalInspectedQuantity
        ) {
            finalResult = QualityResult.FAILED;
        } else if (finalPassedQuantity > 0 && finalDefectQuantity > 0) {
            finalResult = QualityResult.PARTIAL;
        } else {
            finalResult = QualityResult.PENDING;
        }
    }

    /* --------------------------- Defect Validation ------------------------- */

    const finalDefectType =
        payload.defectType !== undefined
            ? payload.defectType
            : existingInspection.defectType;

    if (finalDefectQuantity > 0 && !finalDefectType) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Defect type is required when defect quantity is greater than zero',
        );
    }

    if (finalDefectQuantity === 0 && finalDefectType) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Defect type should not be provided when defect quantity is zero',
        );
    }

    /* -------------------------------- Update -------------------------------- */

    const updatedInspection = await prisma.qualityInspection.update({
        where: {
            id,
        },
        data: {
            ...(payload.productName !== undefined && {
                productName: payload.productName,
            }),

            ...(payload.batchNumber !== undefined && {
                batchNumber: payload.batchNumber,
            }),

            ...(payload.inspectedQuantity !== undefined && {
                inspectedQuantity: payload.inspectedQuantity,
            }),

            ...(payload.passedQuantity !== undefined && {
                passedQuantity: payload.passedQuantity,
            }),

            ...(payload.defectQuantity !== undefined && {
                defectQuantity: payload.defectQuantity,
            }),

            ...(payload.result !== undefined
                ? {
                      result: payload.result,
                  }
                : {
                      result: finalResult,
                  }),

            ...(payload.defectType !== undefined && {
                defectType: payload.defectType,
            }),

            ...(payload.notes !== undefined && {
                notes: payload.notes,
            }),

            ...(payload.inspectionDate !== undefined && {
                inspectionDate: payload.inspectionDate,
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
            productionLine: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
            inspectedBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });

    return updatedInspection;
};

/* -------------------------------------------------------------------------- */
/* Delete Quality Inspection                                                 */
/* -------------------------------------------------------------------------- */

const deleteQualityInspectionFromDB = async (id: string) => {
    const existingInspection = await prisma.qualityInspection.findUnique({
        where: {
            id,
        },
    });

    if (!existingInspection) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Quality inspection not found',
        );
    }

    await prisma.qualityInspection.delete({
        where: {
            id,
        },
    });

    return null;
};

/* -------------------------------------------------------------------------- */
/* Export                                                                     */
/* -------------------------------------------------------------------------- */

export const qualityInspectionServices = {
    createQualityInspectionIntoDB,
    getAllQualityInspectionsFromDB,
    getSingleQualityInspectionFromDB,
    updateQualityInspectionIntoDB,
    deleteQualityInspectionFromDB,
};
