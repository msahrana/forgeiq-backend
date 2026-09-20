import { Router } from 'express';
import { UserRole } from '../../../generated/prisma/enums';
import { auth } from '../../middleware/checkAuth';
import { validateRequest } from '../../middleware/validateRequest';
import { workOrderControllers } from './workOrder.controller';

import {
    completeWorkOrderValidationSchema,
    createWorkOrderValidationSchema,
    updateWorkOrderValidationSchema,
} from './workOrder.validation';

const router = Router();

// ======================================================
// CREATE
// ======================================================

router.post(
    '/',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
    ),
    validateRequest(createWorkOrderValidationSchema),
    workOrderControllers.createWorkOrder,
);

// ======================================================
// GET ALL
// ======================================================

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
    workOrderControllers.getAllWorkOrders,
);

// ======================================================
// ASSIGN
// ======================================================

router.patch(
    '/:id/assign',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
    ),
    workOrderControllers.assignWorkOrder,
);

// ======================================================
// START
// ======================================================

router.patch(
    '/:id/start',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
        UserRole.TECHNICIAN,
    ),
    workOrderControllers.startWorkOrder,
);

// ======================================================
// HOLD
// ======================================================

router.patch(
    '/:id/hold',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
        UserRole.TECHNICIAN,
    ),
    workOrderControllers.holdWorkOrder,
);

// ======================================================
// COMPLETE
// ======================================================

router.patch(
    '/:id/complete',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
        UserRole.TECHNICIAN,
    ),
    validateRequest(completeWorkOrderValidationSchema),
    workOrderControllers.completeWorkOrder,
);

// ======================================================
// CANCEL
// ======================================================

router.patch(
    '/:id/cancel',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
    ),
    workOrderControllers.cancelWorkOrder,
);

// ======================================================
// GET SINGLE
// ======================================================

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
    workOrderControllers.getSingleWorkOrder,
);

// ======================================================
// UPDATE
// ======================================================

router.patch(
    '/:id',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
    ),
    validateRequest(updateWorkOrderValidationSchema),
    workOrderControllers.updateWorkOrder,
);

// ======================================================
// DELETE
// ======================================================

router.delete(
    '/:id',
    auth(UserRole.SUPER_ADMIN, UserRole.ORG_OWNER, UserRole.FACTORY_MANAGER),
    workOrderControllers.deleteWorkOrder,
);

export const workOrderRoutes = router;
