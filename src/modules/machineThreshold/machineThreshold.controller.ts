import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';

import { machineThresholdServices } from './machineThreshold.service';

const createMachineThreshold = catchAsync(
    async (req: Request, res: Response) => {
        const result =
            await machineThresholdServices.createMachineThresholdIntoDB(
                req.body,
            );

        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: 'Machine threshold created successfully',
            data: result,
        });
    },
);

const getAllMachineThresholds = catchAsync(
    async (req: Request, res: Response) => {
        const result =
            await machineThresholdServices.getAllMachineThresholdsFromDB();

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'All Machine thresholds retrieved successfully',
            data: result,
        });
    },
);

const getSingleMachineThreshold = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const result =
            await machineThresholdServices.getSingleMachineThresholdFromDB(
                id as string,
            );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Single Machine threshold retrieved successfully',
            data: result,
        });
    },
);

const getMachineThresholdByMachineId = catchAsync(
    async (req: Request, res: Response) => {
        const { machineId } = req.params;

        const result =
            await machineThresholdServices.getMachineThresholdByMachineIdFromDB(
                machineId as string,
            );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Machine threshold by machine ID retrieved successfully',
            data: result,
        });
    },
);

const updateMachineThreshold = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const payload = req.body;

        const result =
            await machineThresholdServices.updateMachineThresholdIntoDB(
                id as string,
                payload,
            );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Machine threshold updated successfully',
            data: result,
        });
    },
);

const deleteMachineThreshold = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const result =
            await machineThresholdServices.deleteMachineThresholdFromDB(
                id as string,
            );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Machine threshold deleted successfully',
            data: result,
        });
    },
);

export const machineThresholdControllers = {
    createMachineThreshold,
    getAllMachineThresholds,
    getSingleMachineThreshold,
    getMachineThresholdByMachineId,
    updateMachineThreshold,
    deleteMachineThreshold,
};
