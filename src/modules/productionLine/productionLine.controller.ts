import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { productionLineServices } from './productionLine.service';
import { Request, Response } from 'express';

const createProductionLine = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    const result =
        await productionLineServices.createProductionLineIntoDB(payload);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Production line created successfully',
        data: result,
    });
});

const getAllProductionLines = catchAsync(
    async (req: Request, res: Response) => {
        const plantId = req.query.plantId as string | undefined;

        const result =
            await productionLineServices.getAllProductionLinesFromDB(plantId);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'All Production lines retrieved successfully',
            data: result,
        });
    },
);

const getSingleProductionLine = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const result =
            await productionLineServices.getSingleProductionLineFromDB(
                id as string,
            );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Single Production line retrieved successfully',
            data: result,
        });
    },
);

const updateProductionLine = catchAsync(async (req, res) => {
    const { id } = req.params;
    const payload = req.body;

    const result = await productionLineServices.updateProductionLineIntoDB(
        id as string,
        payload,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Production line updated successfully',
        data: result,
    });
});

const updateProductionLineStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const result =
        await productionLineServices.updateProductionLineStatusIntoDB(
            id as string,
            status,
        );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Production line status updated successfully',
        data: result,
    });
});

const deleteProductionLine = catchAsync(async (req, res) => {
    const { id } = req.params;

    const result = await productionLineServices.deleteProductionLineFromDB(
        id as string,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Production line deleted successfully',
        data: result,
    });
});

export const productionLineControllers = {
    createProductionLine,
    getAllProductionLines,
    getSingleProductionLine,
    updateProductionLine,
    updateProductionLineStatus,
    deleteProductionLine,
};
