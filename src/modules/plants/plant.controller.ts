import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { plantServices } from './plant.service';
import { Request, Response } from 'express';

const createPlant = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    const result = await plantServices.createPlantIntoDB(payload);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Plant created successfully',
        data: result,
    });
});

const getAllPlants = catchAsync(async (req: Request, res: Response) => {
    const organizationId = req.query.organizationId as string | undefined;

    const result = await plantServices.getAllPlantsFromDB(organizationId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Plants retrieved successfully',
        data: result,
    });
});

const getSinglePlant = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await plantServices.getSinglePlantFromDB(id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Single Plant retrieved successfully',
        data: result,
    });
});

const updatePlant = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;

    const result = await plantServices.updatePlantIntoDB(id as string, payload);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Plant updated successfully',
        data: result,
    });
});

const updatePlantStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const result = await plantServices.updatePlantStatusIntoDB(
        id as string,
        status,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Plant status updated successfully',
        data: result,
    });
});

const deletePlant = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await plantServices.deletePlantFromDB(id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Plant deleted successfully',
        data: result,
    });
});

export const plantControllers = {
    createPlant,
    getAllPlants,
    getSinglePlant,
    updatePlant,
    updatePlantStatus,
    deletePlant,
};
