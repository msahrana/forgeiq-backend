import { z } from 'zod';

export const initiatePaymentValidation = z.object({
    userId: z.string().uuid(),

    amount: z.number().positive('Amount must be greater than 0'),

    customerName: z.string().min(2, 'Customer name is required'),

    customerEmail: z.email('Invalid email address'),

    customerPhone: z.string().min(10, 'Invalid phone number'),

    customerAddress: z.string().min(3, 'Customer address is required'),

    customerCity: z.string().min(2, 'Customer city is required'),

    customerPostCode: z.string().optional(),

    customerCountry: z.string().default('Bangladesh'),

    productName: z.string().min(2, 'Product name is required'),

    productCategory: z.string().optional(),
});
