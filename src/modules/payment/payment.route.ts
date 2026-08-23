import { Router } from 'express';
import { paymentControllers } from './payment.controller';
import { auth } from '../../middleware/checkAuth';
import { UserRole } from '../../../generated/prisma/enums';

const router = Router();

router.post(
    '/create',
    auth(UserRole.VIEWER),
    paymentControllers.createCheckoutSession,
);

router.post('/webhook', paymentControllers.handleWebhook);

router.get('/', auth(UserRole.VIEWER), paymentControllers.getMyPaymentHistory);

router.get(
    '/:id',
    auth(UserRole.VIEWER),
    paymentControllers.getSinglePaymentData,
);

export const paymentRoutes = router;
