import { z } from 'zod';

export const RegistrationZodSchema = z.object({
    name: z
        .string()
        .min(3, 'Name must be at least 2 characters')
        .max(100, 'Name must not exceed 100 characters')
        .trim(),

    email: z
        .string()
        .email('Please provide a valid email address')
        .toLowerCase()
        .trim(),

    password: z
        .string()
        .min(8, 'Password Must Minimum 8 Characters Long.')
        .regex(/[a-z]/, 'Password must contain at least 1 Lowercase Letter')
        .regex(/[A-Z]/, 'Password must contain at least 1 Uppercase Letter')
        .regex(/[0-9]/, 'Password must contain at least 1 Number')
        .regex(
            /[^A-Za-z0-9]/,
            'Password must contain at least 1 Special Character',
        )
        .max(100, 'Password must not exceed 100 characters'),

    phone: z.string().trim().optional(),
});

const EmailVerifyZodSchema = z.object({
    email: z.email('Not email!!'),

    otp: z.string().length(6),
});

const LoginZodSchema = z.object({
    email: z.email(),

    password: z
        .string()
        .min(8, 'Password Must Minimum 8 Characters Long.')
        .regex(/[a-z]/, 'Password must contain at least 1 Lowercase Letter')
        .regex(/[A-Z]/, 'Password must contain at least 1 Uppercase Letter')
        .regex(/[0-9]/, 'Password must contain at least 1 Number')
        .regex(
            /[^A-Za-z0-9]/,
            'Password must contain at least 1 Special Character',
        ),
});

const ForgotPasswordZodSchema = z.object({
    email: z.email(),
});

const ResetPasswordZodSchema = z.object({
    email: z.email(),

    newPassword: z
        .string()
        .min(8, 'Password Must Minimum 8 Characters Long.')
        .regex(/[a-z]/, 'Password must contain at least 1 Lowercase Letter')
        .regex(/[A-Z]/, 'Password must contain at least 1 Uppercase Letter')
        .regex(/[0-9]/, 'Password must contain at least 1 Number')
        .regex(
            /[^A-Za-z0-9]/,
            'Password must contain at least 1 Special Character',
        ),

    otp: z.string().length(6),
});

export const UserValidation = {
    RegistrationZodSchema,
    EmailVerifyZodSchema,
    LoginZodSchema,
    ForgotPasswordZodSchema,
    ResetPasswordZodSchema,
};
