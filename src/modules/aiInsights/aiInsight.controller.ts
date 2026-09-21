import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { aiInsightServices } from './aiInsight.service';

import {
    ICreateAIInsight,
    IGetAIInsightsQuery,
    IUpdateAIInsight,
} from './aiInsight.interface';

const createAIInsight = catchAsync(async (req: Request, res: Response) => {
    const result = await aiInsightServices.createAIInsightIntoDB(
        req.body as ICreateAIInsight,
    );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'AI insight created successfully',
        data: result,
    });
});

const getAllAIInsights = catchAsync(async (req: Request, res: Response) => {
    const query = req.query as unknown as IGetAIInsightsQuery;

    const result = await aiInsightServices.getAllAIInsightsFromDB(query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'AI insights retrieved successfully',
        data: result,
    });
});

const getSingleAIInsight = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await aiInsightServices.getSingleAIInsightFromDB(
        id as string,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'AI insight retrieved successfully',
        data: result,
    });
});

const updateAIInsight = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await aiInsightServices.updateAIInsightIntoDB(
        id as string,
        req.body as IUpdateAIInsight,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'AI insight updated successfully',
        data: result,
    });
});

const deleteAIInsight = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    await aiInsightServices.deleteAIInsightFromDB(id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'AI insight deleted successfully',
        data: null,
    });
});

const generateAIInsights = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, plantId } = req.query as unknown as {
        organizationId: string;
        plantId?: string;
    };

    const result = await aiInsightServices.generateAIInsightsIntoDB(
        organizationId,
        plantId,
    );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'AI insights generated successfully',
        data: result,
    });
});

export const aiInsightControllers = {
    createAIInsight,
    getAllAIInsights,
    getSingleAIInsight,
    updateAIInsight,
    deleteAIInsight,
    generateAIInsights,
};
