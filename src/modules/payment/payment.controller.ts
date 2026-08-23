import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { paymentServices } from './payment.service';
import { sendResponse } from '../../utils/sendResponse';
import httpStatus from 'http-status';

const createCheckoutSession = catchAsync(
    async (req: Request, res: Response) => {
        const userId = req.user?.id;

        const { subscriptionId } = req.body;

        const result = await paymentServices.createCheckoutSessionIntoDB(
            subscriptionId,
            userId!,
        );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Stripe checkout session created successfully',
            data: result,
        });
    },
);

const handleWebhook = catchAsync(async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'];

    if (!signature || Array.isArray(signature)) {
        res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: 'Missing Stripe signature',
        });

        return;
    }

    const result = await paymentServices.handleWebhookIntoDB(
        signature,
        req.body,
    );

    res.status(httpStatus.OK).json(result);
});

const getMyPaymentHistory = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    const result = await paymentServices.getMyPaymentHistoryIntoDB(userId!);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Payment history retrieved successfully',
        data: result,
    });
});

const getSinglePaymentData = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    const result = await paymentServices.getSinglePaymentDataIntoDB(
        req.params.id as string,
        userId!,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Payment retrieved successfully',
        data: result,
    });
});

export const paymentControllers = {
    createCheckoutSession,
    handleWebhook,
    getMyPaymentHistory,
    getSinglePaymentData,
};
