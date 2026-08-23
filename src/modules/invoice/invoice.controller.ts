import { Request, Response } from 'express';
import httpStatus from 'http-status';

import { invoiceServices } from './invoice.service';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';

const createInvoice = catchAsync(async (req: Request, res: Response) => {
    const result = await invoiceServices.createInvoiceIntoDB(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Invoice Created Successfully!',
        data: result,
    });
});

const getAllInvoices = catchAsync(async (req: Request, res: Response) => {
    const result = await invoiceServices.getAllInvoicesFromDB(req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Invoices Retrieved Successfully.',
        data: result,
    });
});

const getInvoiceById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await invoiceServices.getInvoiceByIdFromDB(id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Single Invoice Retrieved Successfully',
        data: result,
    });
});

const updateInvoice = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await invoiceServices.updateInvoiceIntoDB(
        id as string,
        req.body,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Invoice Updated Successfully',
        data: result,
    });
});

const updateInvoiceStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const result = await invoiceServices.updateInvoiceStatusIntoDB(
        id as string,
        status,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Invoice status updated successfully',
        data: result,
    });
});

const deleteInvoice = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    await invoiceServices.deleteInvoiceFromDB(id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Invoice deleted successfully',
        data: null,
    });
});

export const invoiceControllers = {
    createInvoice,
    getAllInvoices,
    getInvoiceById,
    updateInvoice,
    updateInvoiceStatus,
    deleteInvoice,
};
