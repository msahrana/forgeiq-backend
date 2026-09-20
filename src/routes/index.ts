import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.route';
import { machineRoutes } from '../modules/machines/machine.route';
import { sensorRoutes } from '../modules/sensors/sensor.route';
import { paymentRoutes } from '../modules/payment/payment.route';
import { planRoutes } from '../modules/plan/plan.route';
import { subscriptionRoutes } from '../modules/subscription/subscription.route';
import { organizationRoutes } from '../modules/organizations/organization.route';
import { invoiceRoutes } from '../modules/invoice/invoice.route';
import { plantRoutes } from '../modules/plants/plant.route';
import { productionLineRoutes } from '../modules/productionLine/productionLine.route';

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
        path: '/payments',
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
    {
        path: '/invoice',
        route: invoiceRoutes,
    },
    {
        path: '/plants',
        route: plantRoutes,
    },
    {
        path: '/productionLines',
        route: productionLineRoutes,
    },
];

routerManger.forEach((r) => router.use(r.path, r.route));

export default router;
