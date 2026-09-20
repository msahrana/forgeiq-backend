import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { productionRecordServices } from './productionRecord.service';

const createProductionRecord = catchAsync(
    async (req: Request, res: Response) => {
        const result =
            await productionRecordServices.createProductionRecordIntoDB(
                req.body,
            );

        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: 'Production record created successfully',
            data: result,
        });
    },
);

const getAllProductionRecords = catchAsync(
    async (req: Request, res: Response) => {
        const result =
            await productionRecordServices.getAllProductionRecordsFromDB(
                req.query,
            );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'All Production records retrieved successfully',
            data: result,
        });
    },
);

const getSingleProductionRecord = catchAsync(
    async (req: Request, res: Response) => {
        const result =
            await productionRecordServices.getSingleProductionRecordFromDB(
                req.params.id as string,
            );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Single Production record retrieved successfully',
            data: result,
        });
    },
);

const updateProductionRecord = catchAsync(
    async (req: Request, res: Response) => {
        const result =
            await productionRecordServices.updateProductionRecordIntoDB(
                req.params.id as string,
                req.body,
            );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Production record updated successfully',
            data: result,
        });
    },
);

const deleteProductionRecord = catchAsync(
    async (req: Request, res: Response) => {
        await productionRecordServices.deleteProductionRecordFromDB(
            req.params.id as string,
        );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Production record deleted successfully',
            data: null,
        });
    },
);

export const productionRecordControllers = {
    createProductionRecord,
    getAllProductionRecords,
    getSingleProductionRecord,
    updateProductionRecord,
    deleteProductionRecord,
};
