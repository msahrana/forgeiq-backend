import { Request, Response } from 'express';
import { sendResponse } from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { authServices } from './auth.service';
import httpStatus from 'http-status';

const userRegister = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    await authServices.userRegisterIntoDB(payload);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Verification OTP Sent & Verification Your Account...!',
        data: null,
    });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    const result = await authServices.verifyEmailIntoDB(payload);

    const { user, accessToken, refreshToken } = result;

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Email Verified Successfully!',
        data: { user, accessToken, refreshToken },
    });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {});

const refreshToken = catchAsync(async (req: Request, res: Response) => {});

const changePassword = catchAsync(async (req: Request, res: Response) => {});

const googleLogin = catchAsync(async (req: Request, res: Response) => {});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {});

const resetPassword = catchAsync(async (req: Request, res: Response) => {});

const getMe = catchAsync(async (req: Request, res: Response) => {});

const getUsers = catchAsync(async (req: Request, res: Response) => {});

const getUserById = catchAsync(async (req: Request, res: Response) => {});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {});

const uploadProfileImage = catchAsync(
    async (req: Request, res: Response) => {},
);

export const authControllers = {
    userRegister,
    verifyEmail,
    loginUser,
    refreshToken,
    changePassword,
    googleLogin,
    forgotPassword,
    resetPassword,
    getMe,
    getUsers,
    getUserById,
    updateMyProfile,
    uploadProfileImage,
};
