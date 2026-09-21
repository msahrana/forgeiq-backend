import { Router } from 'express';
import { auth } from '../../middleware/checkAuth';
import { validateRequest } from '../../middleware/validateRequest';
import { qualityInspectionControllers } from './qualityInspection.controller';

import {
    createQualityInspectionValidationSchema,
    updateQualityInspectionValidationSchema,
} from './qualityInspection.validation';

import { QUALITY_INSPECTION_ROLES } from './qualityInspection.constant';

const router = Router();

/* -------------------------------------------------------------------------- */
/* Create Quality Inspection                                                  */
/* -------------------------------------------------------------------------- */

router.post(
    '/',
    auth(...QUALITY_INSPECTION_ROLES.CREATE),
    validateRequest(createQualityInspectionValidationSchema),
    qualityInspectionControllers.createQualityInspection,
);

/* -------------------------------------------------------------------------- */
/* Get All Quality Inspections                                                */
/* -------------------------------------------------------------------------- */

router.get(
    '/',
    auth(...QUALITY_INSPECTION_ROLES.VIEW),
    qualityInspectionControllers.getAllQualityInspections,
);

/* -------------------------------------------------------------------------- */
/* Get Single Quality Inspection                                               */
/* -------------------------------------------------------------------------- */

router.get(
    '/:id',
    auth(...QUALITY_INSPECTION_ROLES.VIEW),
    qualityInspectionControllers.getSingleQualityInspection,
);

/* -------------------------------------------------------------------------- */
/* Update Quality Inspection                                                  */
/* -------------------------------------------------------------------------- */

router.patch(
    '/:id',
    auth(...QUALITY_INSPECTION_ROLES.UPDATE),
    validateRequest(updateQualityInspectionValidationSchema),
    qualityInspectionControllers.updateQualityInspection,
);

/* -------------------------------------------------------------------------- */
/* Delete Quality Inspection                                                  */
/* -------------------------------------------------------------------------- */

router.delete(
    '/:id',
    auth(...QUALITY_INSPECTION_ROLES.DELETE),
    qualityInspectionControllers.deleteQualityInspection,
);

export const qualityInspectionRoutes = router;
