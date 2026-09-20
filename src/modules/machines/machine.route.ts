import { Router } from 'express';
import { UserRole } from '../../../generated/prisma/enums';
import { auth } from '../../middleware/checkAuth';
import { validateRequest } from '../../middleware/validateRequest';
import { machineControllers } from './machine.controller';
import {
    createMachineValidationSchema,
    updateMachineValidationSchema,
    updateMachineStatusValidationSchema,
} from './machine.validation';

const router = Router();

/**
 * Create Machine
 */
router.post(
    '/',
    auth(UserRole.SUPER_ADMIN, UserRole.ORG_OWNER, UserRole.FACTORY_MANAGER),
    validateRequest(createMachineValidationSchema),
    machineControllers.createMachine,
);

/**
 * Get All Machines
 *
 * Optional:
 * ?plantId=...
 * ?productionLineId=...
 */
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
    machineControllers.getAllMachines,
);

/**
 * Update Machine Status
 *
 * IMPORTANT:
 * This route should be before /:id
 */
router.patch(
    '/:id/status',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.PRODUCTION_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
        UserRole.TECHNICIAN,
    ),
    validateRequest(updateMachineStatusValidationSchema),
    machineControllers.updateMachineStatus,
);

/**
 * Update Machine
 */
router.patch(
    '/:id',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
    ),
    validateRequest(updateMachineValidationSchema),
    machineControllers.updateMachine,
);

/**
 * Delete Machine
 */
router.delete(
    '/:id',
    auth(UserRole.SUPER_ADMIN, UserRole.ORG_OWNER, UserRole.FACTORY_MANAGER),
    machineControllers.deleteMachine,
);

/**
 * Get Single Machine
 *
 * Keep this after specific routes.
 */
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
    machineControllers.getSingleMachine,
);

export const machineRoutes = router;
