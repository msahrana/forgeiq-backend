import { z } from 'zod';

const createInvoiceValidationSchema = z.object({
    subscriptionId: z.string().uuid('Invalid subscription ID'),

    amount: z.number().positive('Amount must be greater than 0'),

    currency: z.string().min(3).max(3).optional(),

    issuedAt: z.string().datetime().optional(),

    dueAt: z.string().datetime().optional(),

    status: z
        .enum([
            'DRAFT',
            'ISSUED',
            'PAID',
            'PARTIALLY_PAID',
            'OVERDUE',
            'CANCELLED',
            'REFUNDED',
        ])
        .optional(),
});

const updateInvoiceValidationSchema = z.object({
    amount: z.number().positive('Amount must be greater than 0').optional(),

    currency: z.string().min(3).max(3).optional(),

    dueAt: z.string().datetime().nullable().optional(),

    paidAt: z.string().datetime().nullable().optional(),

    status: z
        .enum([
            'DRAFT',
            'ISSUED',
            'PAID',
            'PARTIALLY_PAID',
            'OVERDUE',
            'CANCELLED',
            'REFUNDED',
        ])
        .optional(),
});

const updateInvoiceStatusValidationSchema = z.object({
    status: z.enum([
        'DRAFT',
        'ISSUED',
        'PAID',
        'PARTIALLY_PAID',
        'OVERDUE',
        'CANCELLED',
        'REFUNDED',
    ]),
});

export const invoiceValidation = {
    createInvoiceValidationSchema,
    updateInvoiceValidationSchema,
    updateInvoiceStatusValidationSchema,
};
