import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import z from 'zod';

export const validateRequest = (zodSchema: z.ZodType) => {
    return catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const result = zodSchema.safeParse(req.body);

            if (!result.success) {
                throw new Error(result.error.issues[0].message);
            }

            req.body = result.data;

            next();
        },
    );
};
