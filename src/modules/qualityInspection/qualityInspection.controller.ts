import httpStatus from 'http-status';
import { Request, Response } from 'express';

import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';

import { qualityInspectionServices } from './qualityInspection.service';

/* -------------------------------------------------------------------------- */
/* Create Quality Inspection                                                  */
/* -------------------------------------------------------------------------- */

const createQualityInspection = catchAsync(
    async (req: Request, res: Response) => {
        const result =
            await qualityInspectionServices.createQualityInspectionIntoDB(
                req.body,
            );

        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: 'Quality inspection created successfully',
            data: result,
        });
    },
);

/* -------------------------------------------------------------------------- */
/* Get All Quality Inspections                                                */
/* -------------------------------------------------------------------------- */

const getAllQualityInspections = catchAsync(
    async (req: Request, res: Response) => {
        const result =
            await qualityInspectionServices.getAllQualityInspectionsFromDB(
                req.query,
            );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'All Quality inspections retrieved successfully',
            data: result,
        });
    },
);

/* -------------------------------------------------------------------------- */
/* Get Single Quality Inspection                                               */
/* -------------------------------------------------------------------------- */

const getSingleQualityInspection = catchAsync(
    async (req: Request, res: Response) => {
        const result =
            await qualityInspectionServices.getSingleQualityInspectionFromDB(
                req.params.id as string,
            );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Single Quality inspection retrieved successfully',
            data: result,
        });
    },
);

/* -------------------------------------------------------------------------- */
/* Update Quality Inspection                                                  */
/* -------------------------------------------------------------------------- */

const updateQualityInspection = catchAsync(
    async (req: Request, res: Response) => {
        const result =
            await qualityInspectionServices.updateQualityInspectionIntoDB(
                req.params.id as string,
                req.body,
            );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Quality inspection updated successfully',
            data: result,
        });
    },
);

/* -------------------------------------------------------------------------- */
/* Delete Quality Inspection                                                  */
/* -------------------------------------------------------------------------- */

const deleteQualityInspection = catchAsync(
    async (req: Request, res: Response) => {
        await qualityInspectionServices.deleteQualityInspectionFromDB(
            req.params.id as string,
        );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Quality inspection deleted successfully',
            data: null,
        });
    },
);

/* -------------------------------------------------------------------------- */
/* Export                                                                     */
/* -------------------------------------------------------------------------- */

export const qualityInspectionControllers = {
    createQualityInspection,
    getAllQualityInspections,
    getSingleQualityInspection,
    updateQualityInspection,
    deleteQualityInspection,
};
