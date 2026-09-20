import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { workOrderServices } from './workOrder.service';

const createWorkOrder = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const createdById = req.user?.id;

    const result = await workOrderServices.createWorkOrderIntoDB(
        payload,
        createdById as string,
    );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Work order created successfully',
        data: result,
    });
});

const getAllWorkOrders = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;

    const result = await workOrderServices.getAllWorkOrdersFromDB(query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Work orders retrieved successfully',
        data: result,
    });
});

const getSingleWorkOrder = catchAsync(async (req: Request, res: Response) => {
    const result = await workOrderServices.getSingleWorkOrderFromDB(
        req.params.id as string,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Single Work order retrieved successfully',
        data: result,
    });
});

const updateWorkOrder = catchAsync(async (req: Request, res: Response) => {
    const result = await workOrderServices.updateWorkOrderIntoDB(
        req.params.id as string,
        req.body,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Work order updated successfully',
        data: result,
    });
});

const assignWorkOrder = catchAsync(async (req: Request, res: Response) => {
    const result = await workOrderServices.assignWorkOrderIntoDB(
        req.params.id as string,
        req.body.assignedToId,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Work order assigned successfully',
        data: result,
    });
});

const startWorkOrder = catchAsync(async (req: Request, res: Response) => {
    const result = await workOrderServices.startWorkOrderIntoDB(
        req.params.id as string,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Work order started successfully',
        data: result,
    });
});

const holdWorkOrder = catchAsync(async (req: Request, res: Response) => {
    const result = await workOrderServices.holdWorkOrderIntoDB(
        req.params.id as string,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Work order put on hold successfully',
        data: result,
    });
});

const completeWorkOrder = catchAsync(async (req: Request, res: Response) => {
    const result = await workOrderServices.completeWorkOrderIntoDB(
        req.params.id as string,
        req.body?.actualCost,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Work order completed successfully',
        data: result,
    });
});

const cancelWorkOrder = catchAsync(async (req: Request, res: Response) => {
    const result = await workOrderServices.cancelWorkOrderIntoDB(
        req.params.id as string,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Work order cancelled successfully',
        data: result,
    });
});

const deleteWorkOrder = catchAsync(async (req: Request, res: Response) => {
    await workOrderServices.deleteWorkOrderFromDB(req.params.id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Work order deleted successfully',
        data: null,
    });
});

export const workOrderControllers = {
    createWorkOrder,
    getAllWorkOrders,
    getSingleWorkOrder,
    updateWorkOrder,
    assignWorkOrder,
    startWorkOrder,
    holdWorkOrder,
    completeWorkOrder,
    cancelWorkOrder,
    deleteWorkOrder,
};
