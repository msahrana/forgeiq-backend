import { prisma } from '../../lib/prisma';
import {
    IForgotPasswordPayload,
    IGoogleLoginPayload,
    ILoginUserPayload,
    IRegisterPatientPayload,
    IRequestUser,
    IResetPasswordPayload,
    IVerifyEmailPayload,
} from './auth.interface';

const userRegisterIntoDB = async (payload: IRegisterPatientPayload) => {
    const { name, password, phone } = payload;
    console.log(name, password, phone);

    const email = payload.email.trim().toLowerCase();

    const isUserExists = await prisma.user.findUnique({
        where: { email },
    });

    if (isUserExists) {
        throw new Error('User with this email already exists');
    }
};

const verifyEmailIntoDB = async (payload: IVerifyEmailPayload) => {};

const loginUserIntoDB = async (payload: ILoginUserPayload) => {};

const refreshTokenIntoDB = async (token: string) => {};

const changePasswordIntoDB = async () => {};

const googleLoginIntoDB = async (payload: IGoogleLoginPayload) => {};

const forgotPasswordIntoDB = async (payload: IForgotPasswordPayload) => {};

const resetPasswordIntoDB = async (payload: IResetPasswordPayload) => {};

const getMeIntoDB = async (user: IRequestUser) => {};

const getUsersIntoDB = async () => {};

const getUserByIdIntoDB = async (userId: string) => {};

const updateMyProfileIntoDB = async () => {};

const uploadProfileImageIntoDB = async (buffer: Buffer, userId: string) => {};

export const authServices = {
    userRegisterIntoDB,
    verifyEmailIntoDB,
    loginUserIntoDB,
    refreshTokenIntoDB,
    changePasswordIntoDB,
    googleLoginIntoDB,
    forgotPasswordIntoDB,
    resetPasswordIntoDB,
    getMeIntoDB,
    getUsersIntoDB,
    getUserByIdIntoDB,
    updateMyProfileIntoDB,
    uploadProfileImageIntoDB,
};
