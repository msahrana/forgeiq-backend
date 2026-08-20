import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.route';
import { machineRoutes } from '../modules/machines/machine.route';
import { sensorRoutes } from '../modules/sensors/sensor.route';
import { paymentRoutes } from '../modules/payment/payment.route';
import { planRoutes } from '../modules/plan/plan.route';
import { subscriptionRoutes } from '../modules/subscription/subscription.route';
import { organizationRoutes } from '../modules/organizations/organization.route';

const router = Router();

const routerManger = [
    {
        path: '/auth',
        route: authRoutes,
    },
    {
        path: '/machine',
        route: machineRoutes,
    },
    {
        path: '/sensor',
        route: sensorRoutes,
    },
    {
        path: '/payment',
        route: paymentRoutes,
    },
    {
        path: '/plan',
        route: planRoutes,
    },
    {
        path: '/subscription',
        route: subscriptionRoutes,
    },
    {
        path: '/organizations',
        route: organizationRoutes,
    },
];

routerManger.forEach((r) => router.use(r.path, r.route));

export default router;
