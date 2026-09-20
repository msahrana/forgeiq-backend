import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { alertServices } from './alert.service';

const createAlert = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    const result = await alertServices.createAlertIntoDB(payload);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Alert created successfully',
        data: result,
    });
});

const getAllAlerts = catchAsync(async (req: Request, res: Response) => {
    const { plantId, machineId, status } = req.query;

    const result = await alertServices.getAllAlertsFromDB(
        plantId as string | undefined,
        machineId as string | undefined,
        status as string | undefined,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Alerts retrieved successfully',
        data: result,
    });
});

const getSingleAlert = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await alertServices.getSingleAlertFromDB(id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Single Alert retrieved successfully',
        data: result,
    });
});

const updateAlert = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;

    const result = await alertServices.updateAlertIntoDB(id as string, payload);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Alert updated successfully',
        data: result,
    });
});

const acknowledgeAlert = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const userId = req.user?.id;

    if (!userId) {
        return;
    }

    const result = await alertServices.acknowledgeAlertIntoDB(
        id as string,
        userId,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Alert acknowledged successfully',
        data: result,
    });
});

const resolveAlert = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const userId = req.user?.id;

    if (!userId) {
        return;
    }

    const result = await alertServices.resolveAlertIntoDB(id as string, userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Alert resolved successfully',
        data: result,
    });
});

const dismissAlert = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await alertServices.dismissAlertIntoDB(
        id as string,
        req.body.reason,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Alert dismissed successfully',
        data: result,
    });
});

const deleteAlert = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await alertServices.deleteAlertFromDB(id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Alert deleted successfully',
        data: result,
    });
});

export const alertControllers = {
    createAlert,
    getAllAlerts,
    getSingleAlert,
    updateAlert,
    acknowledgeAlert,
    resolveAlert,
    dismissAlert,
    deleteAlert,
};
