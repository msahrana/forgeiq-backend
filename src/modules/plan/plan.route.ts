import { Router } from 'express';
import { planControllers } from './plan.controller';
import { planValidation } from './plan.validation';
import { validateRequest } from '../../middleware/validateRequest';

const router = Router();

router.post(
    '/create',
    validateRequest(planValidation.createPlanValidationSchema),
    planControllers.createPlan,
);

router.get('/all-plans', planControllers.getAllPlans);

router.get('/active', planControllers.getActivePlans);

router.get('/:id', planControllers.getPlanById);

router.put(
    '/:id',
    validateRequest(planValidation.updatePlanValidationSchema),
    planControllers.updatePlan,
);

router.patch(
    '/:id/status',
    validateRequest(planValidation.updatePlanStatusValidationSchema),
    planControllers.updatePlanStatus,
);

router.delete('/:id', planControllers.deletePlan);

export const planRoutes = router;
