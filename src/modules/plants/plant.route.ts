import { plantControllers } from './plant.controller';
import {
    createPlantValidationSchema,
    updatePlantStatusValidationSchema,
    updatePlantValidationSchema,
} from './plant.validation';
import { auth } from '../../middleware/checkAuth';
import { UserRole } from '../../../generated/prisma/enums';
import { validateRequest } from '../../middleware/validateRequest';
import { Router } from 'express';

const router = Router();

// Create Plant
router.post(
    '/',
    auth(UserRole.SUPER_ADMIN, UserRole.ORG_OWNER, UserRole.FACTORY_MANAGER),
    validateRequest(createPlantValidationSchema),
    plantControllers.createPlant,
);

// Get All Plants
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
    plantControllers.getAllPlants,
);

// Get Single Plant
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
    plantControllers.getSinglePlant,
);

// Update Plant
router.patch(
    '/:id',
    auth(UserRole.SUPER_ADMIN, UserRole.ORG_OWNER, UserRole.FACTORY_MANAGER),
    validateRequest(updatePlantValidationSchema),
    plantControllers.updatePlant,
);

// Update Plant Status
router.patch(
    '/:id/status',
    auth(UserRole.SUPER_ADMIN, UserRole.ORG_OWNER, UserRole.FACTORY_MANAGER),
    validateRequest(updatePlantStatusValidationSchema),
    plantControllers.updatePlantStatus,
);

// Delete Plant
router.delete(
    '/:id',
    auth(UserRole.SUPER_ADMIN, UserRole.ORG_OWNER, UserRole.FACTORY_MANAGER),
    plantControllers.deletePlant,
);

export const plantRoutes = router;
