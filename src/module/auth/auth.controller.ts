import { NextFunction, Request, Response } from 'express';
import { sendResponse } from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { authServices } from './auth.service';
import httpStatus from 'http-status';

const register = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const payload = req.body;

        await authServices.registerIntoDB(payload);

        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: 'Verification OTP Sent & Verification Your Account...!',
            data: null,
        });
    },
);

export const authControllers = { register };
