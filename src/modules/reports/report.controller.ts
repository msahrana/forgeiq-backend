import httpStatus from 'http-status';
import { Request, Response } from 'express';

import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';

import { reportServices } from './report.service';

const createReport = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const createdById = req.user?.id;

    const result = await reportServices.createReportIntoDB(
        payload,
        createdById as string,
    );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Report created successfully',
        data: result,
    });
});

const getAllReports = catchAsync(async (req: Request, res: Response) => {
    const result = await reportServices.getAllReportsFromDB(req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Reports retrieved successfully',
        data: result,
    });
});

const getSingleReport = catchAsync(async (req: Request, res: Response) => {
    const result = await reportServices.getSingleReportFromDB(
        req.params.id as string,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Single Report retrieved successfully',
        data: result,
    });
});

const updateReport = catchAsync(async (req: Request, res: Response) => {
    const result = await reportServices.updateReportIntoDB(
        req.params.id as string,
        req.body,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Report updated successfully',
        data: result,
    });
});

const deleteReport = catchAsync(async (req: Request, res: Response) => {
    await reportServices.deleteReportFromDB(req.params.id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Report deleted successfully',
        data: null,
    });
});

export const reportControllers = {
    createReport,
    getAllReports,
    getSingleReport,
    updateReport,
    deleteReport,
};
