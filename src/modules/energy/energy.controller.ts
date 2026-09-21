import httpStatus from 'http-status';
import { Request, Response } from 'express';

import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';

import { energyServices } from './energy.service';

const createEnergyRecord = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    const result = await energyServices.createEnergyRecordIntoDB(payload);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Energy record created successfully',
        data: result,
    });
});

const getAllEnergyRecords = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;

    const result = await energyServices.getAllEnergyRecordsFromDB(query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Energy records retrieved successfully',
        data: result,
    });
});

const getSingleEnergyRecord = catchAsync(
    async (req: Request, res: Response) => {
        const result = await energyServices.getSingleEnergyRecordFromDB(
            req.params.id as string,
        );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Single Energy record retrieved successfully',
            data: result,
        });
    },
);

const updateEnergyRecord = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    const result = await energyServices.updateEnergyRecordIntoDB(
        req.params.id as string,
        payload,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Energy record updated successfully',
        data: result,
    });
});

const deleteEnergyRecord = catchAsync(async (req: Request, res: Response) => {
    await energyServices.deleteEnergyRecordFromDB(req.params.id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Energy record deleted successfully',
        data: null,
    });
});

export const energyControllers = {
    createEnergyRecord,
    getAllEnergyRecords,
    getSingleEnergyRecord,
    updateEnergyRecord,
    deleteEnergyRecord,
};
