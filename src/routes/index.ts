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
import { machineMetricRoutes } from '../modules/machineMetrics/machineMetric.route';
import { machineThresholdRoutes } from '../modules/machineThreshold/machineThreshold.route';
import { alertRoutes } from '../modules/alerts/alert.route';
import { maintenanceRoutes } from '../modules/maintenance/maintenance.route';
import { workOrderRoutes } from '../modules/workOrder/workOrder.route';
import { productionRecordRoutes } from '../modules/productionRecord/productionRecord.route';
import { qualityInspectionRoutes } from '../modules/qualityInspection/qualityInspection.route';
import { energyRoutes } from '../modules/energy/energy.route';

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
    {
        path: '/machines',
        route: machineRoutes,
    },
    {
        path: '/machineMetrics',
        route: machineMetricRoutes,
    },
    {
        path: '/machineThreshold',
        route: machineThresholdRoutes,
    },
    {
        path: '/alerts',
        route: alertRoutes,
    },
    {
        path: '/maintenance',
        route: maintenanceRoutes,
    },
    {
        path: '/workOrder',
        route: workOrderRoutes,
    },
    {
        path: '/productionRecord',
        route: productionRecordRoutes,
    },
    {
        path: '/qualityInspection',
        route: qualityInspectionRoutes,
    },
    {
        path: '/energy',
        route: energyRoutes,
    },
];

routerManger.forEach((r) => router.use(r.path, r.route));

export default router;
