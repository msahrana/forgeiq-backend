import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { planServices } from './plan.service';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';

const createPlan = catchAsync(async (req: Request, res: Response) => {
    const result = await planServices.createPlanIntoDB(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Plan Created Successfully!',
        data: result,
    });
});

const getAllPlans = catchAsync(async (req: Request, res: Response) => {
    const result = await planServices.getAllPlansIntoDB();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Plans Retrieved Successfully!',
        data: result,
    });
});

const getActivePlans = catchAsync(async (req: Request, res: Response) => {
    const result = await planServices.getActivePlansIntoDB();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Active Plans Retrieved Successfully!',
        data: result,
    });
});

const getPlanById = catchAsync(async (req: Request, res: Response) => {
    const result = await planServices.getPlanByIdIntoDB(
        req.params.id as string,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Single Plan Retrieved Successfully!',
        data: result,
    });
});

const updatePlan = catchAsync(async (req: Request, res: Response) => {
    const result = await planServices.updatePlanIntoDB(
        req.params.id as string,
        req.body,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Plan Updated Successfully!',
        data: result,
    });
});

const updatePlanStatus = catchAsync(async (req: Request, res: Response) => {
    const result = await planServices.updatePlanStatusIntoDB(
        req.params.id as string,
        req.body.isActive,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Plan Status Updated Successfully!',
        data: result,
    });
});

const deletePlan = catchAsync(async (req: Request, res: Response) => {
    await planServices.deletePlanIntoDB(req.params.id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'One Plan Deleted Successfully!!!',
        data: null,
    });
});

export const planControllers = {
    createPlan,
    getAllPlans,
    getActivePlans,
    getPlanById,
    updatePlan,
    updatePlanStatus,
    deletePlan,
};
