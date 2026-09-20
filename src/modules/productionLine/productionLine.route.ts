import { Router } from 'express';
import { productionLineControllers } from './productionLine.controller';
import { validateRequest } from '../../middleware/validateRequest';
import {
    createProductionLineValidationSchema,
    updateProductionLineStatusValidationSchema,
    updateProductionLineValidationSchema,
} from './productionLine.validation';
import { auth } from '../../middleware/checkAuth';
import { UserRole } from '../../../generated/prisma/enums';

const router = Router();

router.post(
    '/',
    auth(UserRole.SUPER_ADMIN, UserRole.ORG_OWNER, UserRole.FACTORY_MANAGER),
    validateRequest(createProductionLineValidationSchema),
    productionLineControllers.createProductionLine,
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
    productionLineControllers.getAllProductionLines,
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
    productionLineControllers.getSingleProductionLine,
);

router.patch(
    '/:id',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.PRODUCTION_MANAGER,
    ),
    validateRequest(updateProductionLineValidationSchema),
    productionLineControllers.updateProductionLine,
);

router.patch(
    '/:id/status',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.PRODUCTION_MANAGER,
    ),
    validateRequest(updateProductionLineStatusValidationSchema),
    productionLineControllers.updateProductionLineStatus,
);

router.delete(
    '/:id',
    auth(UserRole.SUPER_ADMIN, UserRole.ORG_OWNER, UserRole.FACTORY_MANAGER),
    productionLineControllers.deleteProductionLine,
);

export const productionLineRoutes = router;
