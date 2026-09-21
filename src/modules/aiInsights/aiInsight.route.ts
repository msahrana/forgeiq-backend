import { Router } from 'express';
import { auth } from '../../middleware/checkAuth';
import { validateRequest } from '../../middleware/validateRequest';
import { aiInsightControllers } from './aiInsight.controller';
import { AI_INSIGHT_ROLES } from './aiInsight.constant';

import {
    createAIInsightValidationSchema,
    updateAIInsightValidationSchema,
} from './aiInsight.validation';

const router = Router();

// Generate AI insights
router.post(
    '/generate',
    auth(...AI_INSIGHT_ROLES.GENERATE),
    aiInsightControllers.generateAIInsights,
);

// Create manual AI insight
router.post(
    '/',
    auth(...AI_INSIGHT_ROLES.GENERATE),
    validateRequest(createAIInsightValidationSchema),
    aiInsightControllers.createAIInsight,
);

// Get all AI insights
router.get(
    '/',
    auth(...AI_INSIGHT_ROLES.VIEW),
    aiInsightControllers.getAllAIInsights,
);

// Get single AI insight
router.get(
    '/:id',
    auth(...AI_INSIGHT_ROLES.VIEW),
    aiInsightControllers.getSingleAIInsight,
);

// Update AI insight
router.patch(
    '/:id',
    auth(...AI_INSIGHT_ROLES.RESOLVE),
    validateRequest(updateAIInsightValidationSchema),
    aiInsightControllers.updateAIInsight,
);

// Delete AI insight
router.delete(
    '/:id',
    auth(...AI_INSIGHT_ROLES.DELETE),
    aiInsightControllers.deleteAIInsight,
);

export const aiInsightRoutes = router;
