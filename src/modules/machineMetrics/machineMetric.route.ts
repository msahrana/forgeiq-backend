import { Router } from 'express';

import { machineMetricControllers } from './machineMetric.controller';
import { createMachineMetricValidationSchema } from './machineMetric.validation';
import { auth } from '../../middleware/checkAuth';
import { UserRole } from '../../../generated/prisma/enums';
import { validateRequest } from '../../middleware/validateRequest';

const router = Router();

/**
 * Create machine telemetry
 */

router.post(
    '/',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.PRODUCTION_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
        UserRole.TECHNICIAN,
    ),
    validateRequest(createMachineMetricValidationSchema),
    machineMetricControllers.createMachineMetric,
);

/**
 * Get all machine telemetry
 *
 * Optional:
 * ?machineId=...
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
    machineMetricControllers.getAllMachineMetrics,
);

/**
 * IMPORTANT:
 * Specific /machine/... routes must come
 * before /:id route.
 */

/**
 * Get latest telemetry of a machine
 */

router.get(
    '/machine/:machineId/latest',
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
    machineMetricControllers.getLatestMachineMetric,
);

/**
 * Get machine telemetry history
 *
 * Optional:
 * ?startDate=2026-09-01&endDate=2026-09-20
 */

router.get(
    '/machine/:machineId/history',
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
    machineMetricControllers.getMachineMetricHistory,
);

/**
 * Get single telemetry record
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
    machineMetricControllers.getSingleMachineMetric,
);

export const machineMetricRoutes = router;
