import { Router } from 'express';
import { subscriptionControllers } from './subscription.controller';
import { subscriptionValidation } from './subscription.validation';
import { validateRequest } from '../../middleware/validateRequest';

const router = Router();

router.post(
    '/',
    validateRequest(subscriptionValidation.createSubscriptionValidationSchema),
    subscriptionControllers.createSubscription,
);

router.get('/', subscriptionControllers.getAllSubscriptions);

router.get('/:id', subscriptionControllers.getSubscriptionById);

router.get(
    '/organization/:organizationId',
    subscriptionControllers.getSubscriptionsByOrganization,
);

router.patch(
    '/:id',
    validateRequest(subscriptionValidation.updateSubscriptionValidationSchema),
    subscriptionControllers.updateSubscription,
);

router.patch(
    '/:id/status',
    validateRequest(
        subscriptionValidation.updateSubscriptionStatusValidationSchema,
    ),
    subscriptionControllers.updateSubscriptionStatus,
);

router.patch('/:id/cancel', subscriptionControllers.cancelSubscription);

export const subscriptionRoutes = router;
