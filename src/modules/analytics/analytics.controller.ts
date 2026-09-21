import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { IAnalyticsQuery } from './analytics.interface';
import { analyticsServices } from './analytics.service';

const getProductionAnalytics = catchAsync(
    async (req: Request, res: Response) => {
        const result = await analyticsServices.getProductionAnalytics(
            req.query as unknown as IAnalyticsQuery,
        );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Production analytics retrieved successfully',
            data: result,
        });
    },
);

const getMachineAnalytics = catchAsync(async (req: Request, res: Response) => {
    const result = await analyticsServices.getMachineAnalytics(
        req.query as unknown as IAnalyticsQuery,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Machine analytics retrieved successfully',
        data: result,
    });
});

const getMaintenanceAnalytics = catchAsync(
    async (req: Request, res: Response) => {
        const result = await analyticsServices.getMaintenanceAnalytics(
            req.query as unknown as IAnalyticsQuery,
        );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Maintenance analytics retrieved successfully',
            data: result,
        });
    },
);

const getQualityAnalytics = catchAsync(async (req: Request, res: Response) => {
    const result = await analyticsServices.getQualityAnalytics(
        req.query as unknown as IAnalyticsQuery,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Quality analytics retrieved successfully',
        data: result,
    });
});

const getEnergyAnalytics = catchAsync(async (req: Request, res: Response) => {
    const result = await analyticsServices.getEnergyAnalytics(
        req.query as unknown as IAnalyticsQuery,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Energy analytics retrieved successfully',
        data: result,
    });
});

const getAnalyticsOverview = catchAsync(async (req: Request, res: Response) => {
    const result = await analyticsServices.getAnalyticsOverview(
        req.query as unknown as IAnalyticsQuery,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Analytics overview retrieved successfully',
        data: result,
    });
});

const getAnalyticsDashboard = catchAsync(
    async (req: Request, res: Response) => {
        const result = await analyticsServices.getAnalyticsDashboard(
            req.query as unknown as IAnalyticsQuery,
        );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Analytics dashboard retrieved successfully',
            data: result,
        });
    },
);

export const analyticsControllers = {
    getProductionAnalytics,
    getMachineAnalytics,
    getMaintenanceAnalytics,
    getQualityAnalytics,
    getEnergyAnalytics,
    getAnalyticsOverview,
    getAnalyticsDashboard,
};
