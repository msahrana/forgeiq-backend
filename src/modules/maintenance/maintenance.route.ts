import { Router } from 'express';
import { auth } from '../../middleware/checkAuth';
import { validateRequest } from '../../middleware/validateRequest';
import { UserRole } from '../../../generated/prisma/enums';
import { maintenanceControllers } from './maintenance.controller';

import {
    completeMaintenanceTaskValidationSchema,
    createMaintenanceTaskValidationSchema,
    updateMaintenanceTaskValidationSchema,
} from './maintenance.validation';

const router = Router();

// Create Maintenance Task
router.post(
    '/',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
    ),
    validateRequest(createMaintenanceTaskValidationSchema),
    maintenanceControllers.createMaintenanceTask,
);

// Get All Maintenance Tasks
router.get(
    '/',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
        UserRole.TECHNICIAN,
        UserRole.EXECUTIVE,
        UserRole.VIEWER,
    ),
    maintenanceControllers.getAllMaintenanceTasks,
);

// Start Maintenance Task
router.patch(
    '/:id/start',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
        UserRole.TECHNICIAN,
    ),
    maintenanceControllers.startMaintenanceTask,
);

// Hold Maintenance Task
router.patch(
    '/:id/hold',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
        UserRole.TECHNICIAN,
    ),
    maintenanceControllers.holdMaintenanceTask,
);

// Complete Maintenance Task
router.patch(
    '/:id/complete',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
        UserRole.TECHNICIAN,
    ),
    validateRequest(completeMaintenanceTaskValidationSchema),
    maintenanceControllers.completeMaintenanceTask,
);

// Cancel Maintenance Task
router.patch(
    '/:id/cancel',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
    ),
    maintenanceControllers.cancelMaintenanceTask,
);

// Get Single Maintenance Task
router.get(
    '/:id',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
        UserRole.TECHNICIAN,
        UserRole.EXECUTIVE,
        UserRole.VIEWER,
    ),
    maintenanceControllers.getSingleMaintenanceTask,
);

// Update Maintenance Task
router.patch(
    '/:id',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
    ),
    validateRequest(updateMaintenanceTaskValidationSchema),
    maintenanceControllers.updateMaintenanceTask,
);

// Delete Maintenance Task
router.delete(
    '/:id',
    auth(UserRole.SUPER_ADMIN, UserRole.ORG_OWNER, UserRole.FACTORY_MANAGER),
    maintenanceControllers.deleteMaintenanceTask,
);

export const maintenanceRoutes = router;
