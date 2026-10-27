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

router.post(
    '/',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.PRODUCTION_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
    ),
    validateRequest(createMachineValidationSchema),
    machineControllers.createMachine,
);

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

router.delete(
    '/:id',
    auth(UserRole.SUPER_ADMIN, UserRole.ORG_OWNER, UserRole.FACTORY_MANAGER),
    machineControllers.deleteMachine,
);

export const machineRoutes = router;
