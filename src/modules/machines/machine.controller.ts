import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { machineServices } from './machine.service';
import { IQuery } from '../../interface';

const createMachine = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    const result = await machineServices.createMachineIntoDB(payload);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Machine created successfully',
        data: result,
    });
});

const getAllMachines = catchAsync(async (req: Request, res: Response) => {
    const result = await machineServices.getAllMachinesFromDB(
        req.query as unknown as IQuery,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Machines retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});

const getSingleMachine = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await machineServices.getSingleMachineFromDB(id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Single Machine retrieved successfully',
        data: result,
    });
});

const updateMachine = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await machineServices.updateMachineIntoDB(
        id as string,
        req.body,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Machine updated successfully',
        data: result,
    });
});

const updateMachineStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;

    const result = await machineServices.updateMachineStatusIntoDB(
        id as string,
        payload,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Machine status updated successfully',
        data: result,
    });
});

const deleteMachine = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    await machineServices.deleteMachineFromDB(id as string);

    sendResponse(res, {
        statusCode: httpStatus.NO_CONTENT,
        success: true,
        message: 'Machine deleted successfully',
        data: null,
    });
});

export const machineControllers = {
    createMachine,
    getAllMachines,
    getSingleMachine,
    updateMachine,
    updateMachineStatus,
    deleteMachine,
};
