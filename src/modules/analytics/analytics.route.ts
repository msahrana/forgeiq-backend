import { Router } from 'express';

import { auth } from '../../middleware/checkAuth';

import { ANALYTICS_ROLES } from './analytics.constant';
import { analyticsControllers } from './analytics.controller';

const router = Router();

/*
|--------------------------------------------------------------------------
| Analytics Dashboard
|--------------------------------------------------------------------------
*/

router.get(
    '/dashboard',
    auth(...ANALYTICS_ROLES.VIEW),
    analyticsControllers.getAnalyticsDashboard,
);

/*
|--------------------------------------------------------------------------
| Analytics Overview
|--------------------------------------------------------------------------
*/

router.get(
    '/overview',
    auth(...ANALYTICS_ROLES.VIEW),
    analyticsControllers.getAnalyticsOverview,
);

/*
|--------------------------------------------------------------------------
| Production Analytics
|--------------------------------------------------------------------------
*/

router.get(
    '/production',
    auth(...ANALYTICS_ROLES.VIEW),
    analyticsControllers.getProductionAnalytics,
);

/*
|--------------------------------------------------------------------------
| Machine Analytics
|--------------------------------------------------------------------------
*/

router.get(
    '/machines',
    auth(...ANALYTICS_ROLES.VIEW),
    analyticsControllers.getMachineAnalytics,
);

/*
|--------------------------------------------------------------------------
| Maintenance Analytics
|--------------------------------------------------------------------------
*/

router.get(
    '/maintenance',
    auth(...ANALYTICS_ROLES.VIEW),
    analyticsControllers.getMaintenanceAnalytics,
);

/*
|--------------------------------------------------------------------------
| Quality Analytics
|--------------------------------------------------------------------------
*/

router.get(
    '/quality',
    auth(...ANALYTICS_ROLES.VIEW),
    analyticsControllers.getQualityAnalytics,
);

/*
|--------------------------------------------------------------------------
| Energy Analytics
|--------------------------------------------------------------------------
*/

router.get(
    '/energy',
    auth(...ANALYTICS_ROLES.VIEW),
    analyticsControllers.getEnergyAnalytics,
);

export const analyticsRoutes = router;
