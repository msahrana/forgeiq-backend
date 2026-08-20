import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { subscriptionServices } from './subscription.service';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';

const createSubscription = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, planId } = req.body;

    const result = await subscriptionServices.createSubscriptionIntoDB(
        organizationId,
        planId,
    );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Subscription created successfully',
        data: result,
    });
});

const getAllSubscriptions = catchAsync(async (req: Request, res: Response) => {
    const result = await subscriptionServices.getAllSubscriptionsIntoDB();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Subscriptions retrieved successfully',
        data: result,
    });
});

const getSubscriptionById = catchAsync(async (req: Request, res: Response) => {
    const result = await subscriptionServices.getSubscriptionByIdIntoDB(
        req.params.id as string,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Subscription retrieved successfully',
        data: result,
    });
});

const getSubscriptionsByOrganization = catchAsync(
    async (req: Request, res: Response) => {
        const result =
            await subscriptionServices.getSubscriptionsByOrganizationIntoDB(
                req.params.organizationId as string,
            );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Organization subscriptions retrieved successfully',
            data: result,
        });
    },
);

const updateSubscription = catchAsync(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.body;

    const result = await subscriptionServices.updateSubscriptionIntoDB(
        req.params.id as string,
        {
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        },
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Subscription updated successfully',
        data: result,
    });
});

const updateSubscriptionStatus = catchAsync(
    async (req: Request, res: Response) => {
        const result =
            await subscriptionServices.updateSubscriptionStatusIntoDB(
                req.params.id as string,
                req.body.status,
            );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Subscription status updated successfully',
            data: result,
        });
    },
);

const cancelSubscription = catchAsync(async (req: Request, res: Response) => {
    const result = await subscriptionServices.cancelSubscriptionIntoDB(
        req.params.id as string,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Subscription cancelled successfully',
        data: result,
    });
});

export const subscriptionControllers = {
    createSubscription,
    getAllSubscriptions,
    getSubscriptionById,
    getSubscriptionsByOrganization,
    updateSubscription,
    updateSubscriptionStatus,
    cancelSubscription,
};
