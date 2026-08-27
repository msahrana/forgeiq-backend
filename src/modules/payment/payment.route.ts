import { Router } from 'express';
import { paymentControllers } from './payment.controller';
import { auth } from '../../middleware/checkAuth';
import { UserRole } from '../../../generated/prisma/enums';

const router = Router();

router.post(
    '/create',
    auth(UserRole.VIEWER, UserRole.EXECUTIVE, UserRole.TECHNICIAN),
    paymentControllers.createCheckoutSession,
);

router.post('/webhook', paymentControllers.handleWebhook);

router.get(
    '/',
    auth(UserRole.VIEWER, UserRole.EXECUTIVE, UserRole.TECHNICIAN),
    paymentControllers.getMyPaymentHistory,
);

router.get(
    '/:id',
    auth(UserRole.VIEWER, UserRole.EXECUTIVE, UserRole.TECHNICIAN),
    paymentControllers.getSinglePaymentData,
);

export const paymentRoutes = router;
