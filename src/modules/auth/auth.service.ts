import {
    IForgotPasswordPayload,
    IGoogleLoginPayload,
    ILoginUserPayload,
    IRegisterPatientPayload,
    IRequestUser,
    IResetPasswordPayload,
    IVerifyEmailPayload,
} from './auth.interface';
import { UserRole, UserStatus } from '../../../generated/prisma/enums';
import { JwtPayload, SignOptions } from 'jsonwebtoken';
import { transporter } from '../../lib/nodemailer';
import { redisClient } from '../../lib/redis';
import { jwtUtils } from '../../utils/jwt';
import { prisma } from '../../lib/prisma';
import config from '../../config';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import path from 'path';
import ejs from 'ejs';

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

const loginUserIntoDB = async (payload: ILoginUserPayload) => {
    const { password } = payload;

    const email = payload.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new Error('User not found');
    }

    if (user.status === UserStatus.DEACTIVATED) {
        throw new Error('User is DEACTIVATED!!');
    }

    if (user.status === UserStatus.SUSPENDED) {
        throw new Error('User is SUSPENDED!!');
    }

    if (user.isDeleted || user.status === 'DELETED') {
        throw new Error('User is DELETED!');
    }

    const isPasswordMatched = await bcrypt.compare(
        password,
        user.password as string,
    );

    if (!isPasswordMatched) {
        throw new Error('Invalid credentials');
    }

    const jwtPayload = {
        id: user.id,
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
        accessToken,
        refreshToken,
    };
};

const refreshTokenIntoDB = async (token: string) => {
    const verifiedRefreshToken = jwtUtils.verifyToken(
        token,
        config.jwt_refresh_secret,
    );

    if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
        throw new Error(
            config.node_env === 'development'
                ? verifiedRefreshToken.error
                : 'Invalid refresh token',
        );
    }

    const data = verifiedRefreshToken.data as JwtPayload;

    const user = await prisma.user.findUnique({
        where: { id: data.userId },
    });

    if (!user || user.isDeleted || user.status !== UserStatus.ACTIVE) {
        throw new Error('User is inactive or not found');
    }

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
        accessToken,
        refreshToken,
    };
};

const changePasswordIntoDB = async (
    userId: string,
    oldPassword: string,
    newPassword: string,
) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error('User Not Found...!');
    }

    const isPasswordMatched = await bcrypt.compare(
        oldPassword,
        user.password as string,
    );

    if (!isPasswordMatched) {
        throw new Error('Invalid old password');
    }

    const hashedNewPassword = await bcrypt.hash(
        newPassword,
        Number(config.bcrypt_salt_rounds),
    );

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
    });

    return updatedUser;
};

const forgotPasswordIntoDB = async (payload: IForgotPasswordPayload) => {
    const { email } = payload;

    const isUserExist = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (!isUserExist) {
        throw new Error('User Does Not Exist!');
    }

    if (isUserExist.status === 'DEACTIVATED') {
        throw new Error('User is DEACTIVATED!');
    }

    if (!isUserExist.emailVerified) {
        throw new Error('User Not Verified!');
    }

    if (isUserExist.status === 'SUSPENDED') {
        throw new Error('User is SUSPENDED!');
    }

    if (isUserExist.isDeleted || isUserExist.status === 'DELETED') {
        throw new Error('User is DELETED!');
    }

    if (isUserExist.googleId && isUserExist.authProvider === 'GOOGLE') {
        throw new Error('User Has Account With Google!');
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    const key = `forgot-password-otp:${isUserExist.email}`;

    const expirationSeconds = 5 * 60; // 5 min

    await redisClient.set(key, otp, {
        expiration: {
            type: 'EX',
            value: expirationSeconds,
        },
    });

    const templatePath = path.join(
        process.cwd(),
        'src/templates/forgot-password.ejs',
    );

    const templateData = {
        name: isUserExist.name,
        otp,
        expirationMinutes: expirationSeconds / 60,
    };

    const html = await ejs.renderFile(templatePath, templateData);

    await transporter.sendMail({
        from: config.email_sender,
        to: isUserExist.email,
        subject: 'Forgot Password',
        html,
    });
};

const resetPasswordIntoDB = async (payload: IResetPasswordPayload) => {
    const { email, otp, newPassword } = payload;

    const isUserExist = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (!isUserExist) {
        throw new Error('User Does Not Exist!');
    }

    if (isUserExist.status === 'DEACTIVATED') {
        throw new Error('User is DEACTIVATED!');
    }

    if (!isUserExist.emailVerified) {
        throw new Error('User Not Verified!');
    }

    if (isUserExist.status === 'SUSPENDED') {
        throw new Error('User is SUSPENDED!');
    }

    if (isUserExist.isDeleted || isUserExist.status === 'DELETED') {
        throw new Error('User is DELETED!');
    }

    if (isUserExist.googleId && isUserExist.authProvider === 'GOOGLE') {
        throw new Error('User Has Account With Google!');
    }

    const key = `forgot-password-otp:${isUserExist.email}`;

    const redisOtp = await redisClient.get(key);

    if (!redisOtp) {
        throw new Error('Invalid OTP!');
    }

    if (redisOtp !== otp) {
        throw new Error('OTP Does Not Match!');
    }

    const hashedNewPassword = await bcrypt.hash(
        newPassword,
        Number(config.bcrypt_salt_rounds),
    );

    await prisma.user.update({
        where: {
            email: isUserExist.email,
        },
        data: {
            password: hashedNewPassword,
        },
    });

    await redisClient.del([key]);

    const templatePath = path.join(
        process.cwd(),
        'src/templates/reset-password-success.ejs',
    );

    const templateData = {
        name: isUserExist.name,
    };

    const html = await ejs.renderFile(templatePath, templateData);

    await transporter.sendMail({
        from: config.email_sender,
        to: isUserExist.email,
        subject: 'Password Changed',
        html,
    });
};

const googleLoginIntoDB = async (payload: IGoogleLoginPayload) => {};

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
    forgotPasswordIntoDB,
    resetPasswordIntoDB,
    googleLoginIntoDB,
    getMeIntoDB,
    getUsersIntoDB,
    getUserByIdIntoDB,
    updateMyProfileIntoDB,
    uploadProfileImageIntoDB,
};
