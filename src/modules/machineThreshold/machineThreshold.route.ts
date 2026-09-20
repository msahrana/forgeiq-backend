import { Router } from 'express';
import { UserRole } from '../../../generated/prisma/enums';
import { auth } from '../../middleware/checkAuth';
import { validateRequest } from '../../middleware/validateRequest';
import { machineThresholdControllers } from './machineThreshold.controller';

import {
    createMachineThresholdValidationSchema,
    updateMachineThresholdValidationSchema,
} from './machineThreshold.validation';

const router = Router();

// Create
router.post(
    '/',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
    ),
    validateRequest(createMachineThresholdValidationSchema),
    machineThresholdControllers.createMachineThreshold,
);

// Get all
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
    machineThresholdControllers.getAllMachineThresholds,
);

// Get by machine ID
router.get(
    '/machine/:machineId',
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
    machineThresholdControllers.getMachineThresholdByMachineId,
);

// Get single
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
    machineThresholdControllers.getSingleMachineThreshold,
);

// Update
router.patch(
    '/:id',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
    ),
    validateRequest(updateMachineThresholdValidationSchema),
    machineThresholdControllers.updateMachineThreshold,
);

// Delete
router.delete(
    '/:id',
    auth(UserRole.SUPER_ADMIN, UserRole.ORG_OWNER, UserRole.FACTORY_MANAGER),
    machineThresholdControllers.deleteMachineThreshold,
);

export const machineThresholdRoutes = router;
