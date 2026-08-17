import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import path from 'path';
import {
    IForgotPasswordPayload,
    IGoogleLoginPayload,
    ILoginUserPayload,
    IRegisterPatientPayload,
    IRequestUser,
    IResetPasswordPayload,
    IVerifyEmailPayload,
} from './auth.interface';
import { redisClient } from '../../lib/redis';
import config from '../../config';
import ejs from 'ejs';
import { transporter } from '../../lib/nodemailer';
import { jwtUtils } from '../../utils/jwt';
import { SignOptions } from 'jsonwebtoken';
import { UserRole, UserStatus } from '../../../generated/prisma/enums';

const userRegisterIntoDB = async (payload: IRegisterPatientPayload) => {
    const { name, password, phone } = payload;
    console.log(name, password, phone);

    const email = payload.email.trim().toLowerCase();

    const isUserExists = await prisma.user.findUnique({
        where: { email },
    });

    if (isUserExists) {
        throw new Error('User with this email already exists!');
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    const expirationSeconds = 5 * 60; // 5 min

    const otpKey = `user-registration-otp:${email}`;
    const otpValue = crypto.randomInt(100000, 1000000).toString();

    await redisClient.set(otpKey, otpValue, {
        expiration: {
            type: 'EX',
            value: expirationSeconds,
        },
    });

    const patientRegistrationKey = `user-registration-data:${email}`;

    const redisUserDataPayload = {
        name,
        email,
        password: hashedPassword,
        phone,
    };

    await redisClient.set(
        patientRegistrationKey,
        JSON.stringify(redisUserDataPayload),
        {
            expiration: {
                type: 'EX',
                value: expirationSeconds,
            },
        },
    );

    const templatePath = path.join(
        process.cwd(),
        'src/templates/registration-user-otp.ejs',
    );

    const templateData = {
        name,
        email,
        otp: otpValue,
        expirationMinutes: expirationSeconds / 60,
    };

    const html = await ejs.renderFile(templatePath, templateData);

    await transporter.sendMail({
        from: config.email_sender,
        to: email,
        subject: 'Email Verification',
        html,
    });
};

const verifyEmailIntoDB = async (payload: IVerifyEmailPayload) => {
    const otp = payload.otp;

    const email = payload.email.trim().toLowerCase();

    const isUserExists = await prisma.user.findUnique({
        where: { email },
    });

    if (isUserExists?.status === 'DEACTIVATED') {
        throw new Error('User is DEACTIVATED!');
    }

    if (isUserExists?.emailVerified) {
        throw new Error('Email ALready Verified!');
    }

    const otpKey = `user-registration-otp:${email}`;

    const redisOtp = await redisClient.get(otpKey);

    if (!redisOtp) {
        throw new Error('Invalid OTP!');
    }

    if (redisOtp !== otp) {
        throw new Error('OTP Does Not Match!');
    }

    await redisClient.del([otpKey]);

    const patientRegistrationKey = `user-registration-data:${email}`;

    const redisPatientData = await redisClient.get(patientRegistrationKey);

    if (!redisPatientData) {
        throw new Error('User Does not Exist!');
    }

    const patientPayload: IRegisterPatientPayload =
        JSON.parse(redisPatientData);

    const createdUser = await prisma.user.create({
        data: {
            name: patientPayload.name,
            email: patientPayload.email,
            password: patientPayload.password,
            role: UserRole.VIEWER,
            emailVerified: true,
            status: UserStatus.ACTIVE,
        },
        omit: { password: true },
    });

    await redisClient.del(patientRegistrationKey);

    const templatePath = path.join(
        process.cwd(),
        'src/templates/user-welcome-email.ejs',
    );

    const templateData = {
        name: createdUser.name,
    };

    const html = await ejs.renderFile(templatePath, templateData);

    await transporter.sendMail({
        from: config.email_sender,
        to: email,
        subject: 'Welcome To SR Healthcare System',
        html,
    });

    const { ...user } = createdUser;

    const jwtPayload = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions,
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions,
    );

    return {
        user,
        accessToken,
        refreshToken,
    };
};

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
