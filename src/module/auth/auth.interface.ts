import { UserRole, UserStatus } from '../../../generated/prisma/enums';

export interface IRegisterPatientPayload {
    name: string;
    email: string;
    password: string;
    phone?: string;
}

export interface IVerifyEmailPayload {
    email: string;
    otp: string;
}

export interface ILoginUserPayload {
    email: string;
    password: string;
}

export type UpdateProfilePayload = {
    name?: string;
    email?: string;
};

export interface IGoogleLoginPayload {
    idToken: string;
}

export interface IForgotPasswordPayload {
    email: string;
}

export interface IResetPasswordPayload {
    email: string;
    otp: string;
    newPassword: string;
}

export interface IRequestUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    status: UserStatus;
}
