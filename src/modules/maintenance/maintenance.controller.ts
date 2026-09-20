import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { maintenanceServices } from './maintenance.service';

const createMaintenanceTask = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const createdById = req.user?.id;
        const result = await maintenanceServices.createMaintenanceTaskIntoDB(
            payload,
            createdById as string,
        );

        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: 'Maintenance task created successfully',
            data: result,
        });
    },
);

const getAllMaintenanceTasks = catchAsync(
    async (req: Request, res: Response) => {
        const result = await maintenanceServices.getAllMaintenanceTasksFromDB(
            req.query,
        );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'All Maintenance tasks retrieved successfully',
            data: result,
        });
    },
);

const getSingleMaintenanceTask = catchAsync(
    async (req: Request, res: Response) => {
        const result = await maintenanceServices.getSingleMaintenanceTaskFromDB(
            req.params.id as string,
        );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Single Maintenance task retrieved successfully',
            data: result,
        });
    },
);

const updateMaintenanceTask = catchAsync(
    async (req: Request, res: Response) => {
        const result = await maintenanceServices.updateMaintenanceTaskIntoDB(
            req.params.id as string,
            req.body,
        );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Maintenance task updated successfully',
            data: result,
        });
    },
);

const startMaintenanceTask = catchAsync(async (req: Request, res: Response) => {
    const result = await maintenanceServices.startMaintenanceTaskIntoDB(
        req.params.id as string,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Maintenance task started successfully',
        data: result,
    });
});

const holdMaintenanceTask = catchAsync(async (req: Request, res: Response) => {
    const result = await maintenanceServices.holdMaintenanceTaskIntoDB(
        req.params.id as string,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Maintenance task put on hold successfully',
        data: result,
    });
});

const completeMaintenanceTask = catchAsync(
    async (req: Request, res: Response) => {
        const result = await maintenanceServices.completeMaintenanceTaskIntoDB(
            req.params.id as string,
            req.body.actualCost,
        );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Maintenance task completed successfully',
            data: result,
        });
    },
);

const cancelMaintenanceTask = catchAsync(
    async (req: Request, res: Response) => {
        const result = await maintenanceServices.cancelMaintenanceTaskIntoDB(
            req.params.id as string,
        );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Maintenance task cancelled successfully',
            data: result,
        });
    },
);

const deleteMaintenanceTask = catchAsync(
    async (req: Request, res: Response) => {
        await maintenanceServices.deleteMaintenanceTaskFromDB(
            req.params.id as string,
        );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Maintenance task deleted successfully',
            data: null,
        });
    },
);

export const maintenanceControllers = {
    createMaintenanceTask,
    getAllMaintenanceTasks,
    getSingleMaintenanceTask,
    updateMaintenanceTask,
    startMaintenanceTask,
    holdMaintenanceTask,
    completeMaintenanceTask,
    cancelMaintenanceTask,
    deleteMaintenanceTask,
};
