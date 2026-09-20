import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { machineMetricServices } from './machineMetric.service';

const createMachineMetric = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    const result =
        await machineMetricServices.createMachineMetricIntoDB(payload);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Machine metric created successfully',
        data: result,
    });
});

const getAllMachineMetrics = catchAsync(async (req: Request, res: Response) => {
    const { machineId } = req.query;

    const result = await machineMetricServices.getAllMachineMetricsFromDB(
        machineId as string | undefined,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Machine metrics retrieved successfully',
        data: result,
    });
});

const getSingleMachineMetric = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const result = await machineMetricServices.getSingleMachineMetricFromDB(
            id as string,
        );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Single Machine metric retrieved successfully',
            data: result,
        });
    },
);

const getLatestMachineMetric = catchAsync(
    async (req: Request, res: Response) => {
        const { machineId } = req.params;

        const result = await machineMetricServices.getLatestMachineMetricFromDB(
            machineId as string,
        );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Latest machine metric retrieved successfully',
            data: result,
        });
    },
);

const getMachineMetricHistory = catchAsync(
    async (req: Request, res: Response) => {
        const { machineId } = req.params;

        const { startDate, endDate } = req.query;

        const parsedStartDate = startDate
            ? new Date(startDate as string)
            : undefined;

        const parsedEndDate = endDate ? new Date(endDate as string) : undefined;

        const result =
            await machineMetricServices.getMachineMetricHistoryFromDB(
                machineId as string,
                parsedStartDate,
                parsedEndDate,
            );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Machine metric history retrieved successfully',
            data: result,
        });
    },
);

export const machineMetricControllers = {
    createMachineMetric,
    getAllMachineMetrics,
    getSingleMachineMetric,
    getLatestMachineMetric,
    getMachineMetricHistory,
};
