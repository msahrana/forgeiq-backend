import { Router } from 'express';
import { alertControllers } from './alert.controller';
import { auth } from '../../middleware/checkAuth';
import { UserRole } from '../../../generated/prisma/enums';
import { validateRequest } from '../../middleware/validateRequest';

import {
    createAlertValidationSchema,
    updateAlertValidationSchema,
    dismissAlertValidationSchema,
} from './alert.validation';

const router = Router();

// Create Alert
router.post(
    '/',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.PRODUCTION_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
    ),
    validateRequest(createAlertValidationSchema),
    alertControllers.createAlert,
);

// Get All Alerts
router.get(
    '/',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.PRODUCTION_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
        UserRole.TECHNICIAN,
        UserRole.EXECUTIVE,
        UserRole.VIEWER,
    ),
    alertControllers.getAllAlerts,
);

// Acknowledge Alert
router.patch(
    '/:id/acknowledge',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
        UserRole.TECHNICIAN,
    ),
    alertControllers.acknowledgeAlert,
);

// Resolve Alert
router.patch(
    '/:id/resolve',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
        UserRole.TECHNICIAN,
    ),
    alertControllers.resolveAlert,
);

// Dismiss Alert
router.patch(
    '/:id/dismiss',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
    ),
    validateRequest(dismissAlertValidationSchema),
    alertControllers.dismissAlert,
);

// Update Alert
router.patch(
    '/:id',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
    ),
    validateRequest(updateAlertValidationSchema),
    alertControllers.updateAlert,
);

// Delete Alert
router.delete(
    '/:id',
    auth(UserRole.SUPER_ADMIN, UserRole.ORG_OWNER, UserRole.FACTORY_MANAGER),
    alertControllers.deleteAlert,
);

// Get Single Alert
router.get(
    '/:id',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.PRODUCTION_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
        UserRole.TECHNICIAN,
        UserRole.EXECUTIVE,
        UserRole.VIEWER,
    ),
    alertControllers.getSingleAlert,
);

export const alertRoutes = router;
