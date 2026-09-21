import { Prisma } from '../../../generated/prisma/client';

import { prisma } from '../../lib/prisma';
import AppError from '../../errors/AppError';

import {
    IAnalyticsQuery,
    IAnalyticsOverview,
    IProductionAnalytics,
    IMachineAnalytics,
    IMaintenanceAnalytics,
    IQualityAnalytics,
    IEnergyAnalytics,
} from './analytics.interface';

import { analyticsQueryValidationSchema } from './analytics.validation';

const getDateFilter = (
    startDate?: Date,
    endDate?: Date,
): Prisma.DateTimeFilter | undefined => {
    if (!startDate && !endDate) {
        return undefined;
    }

    return {
        ...(startDate && {
            gte: startDate,
        }),

        ...(endDate && {
            lte: endDate,
        }),
    };
};

const getPlantScope = (organizationId: string, plantId?: string) => {
    return {
        plant: {
            organizationId,
        },

        ...(plantId && {
            plantId,
        }),
    };
};

const validateAnalyticsQuery = (query: IAnalyticsQuery) => {
    const result = analyticsQueryValidationSchema.safeParse(query);

    if (!result.success) {
        throw new AppError(
            400,
            result.error.issues[0]?.message || 'Invalid analytics query',
        );
    }

    return result.data;
};

/* -------------------------------------------------------------------------- */
/*                           PRODUCTION ANALYTICS                             */
/* -------------------------------------------------------------------------- */

const getProductionAnalytics = async (
    query: IAnalyticsQuery,
): Promise<IProductionAnalytics> => {
    const validatedQuery = validateAnalyticsQuery(query);

    const { organizationId, plantId, startDate, endDate } = validatedQuery;

    const productionRecords = await prisma.productionRecord.findMany({
        where: {
            ...getPlantScope(organizationId, plantId),

            recordedAt: getDateFilter(startDate, endDate),
        },

        select: {
            targetQuantity: true,
            actualQuantity: true,
            defectQuantity: true,
            downtimeMinutes: true,
        },
    });

    const totalRecords = productionRecords.length;

    const totalTarget = productionRecords.reduce(
        (sum, record) => sum + record.targetQuantity,
        0,
    );

    const totalActual = productionRecords.reduce(
        (sum, record) => sum + record.actualQuantity,
        0,
    );

    const totalDefects = productionRecords.reduce(
        (sum, record) => sum + record.defectQuantity,
        0,
    );

    const totalDowntimeMinutes = productionRecords.reduce(
        (sum, record) => sum + record.downtimeMinutes,
        0,
    );

    const productionEfficiency =
        totalTarget > 0
            ? Number(((totalActual / totalTarget) * 100).toFixed(2))
            : 0;

    const defectRate =
        totalActual > 0
            ? Number(((totalDefects / totalActual) * 100).toFixed(2))
            : 0;

    return {
        totalRecords,
        totalTarget,
        totalActual,
        totalDefects,
        totalDowntimeMinutes,
        productionEfficiency,
        defectRate,
    };
};

/* -------------------------------------------------------------------------- */
/*                             MACHINE ANALYTICS                              */
/* -------------------------------------------------------------------------- */

const getMachineAnalytics = async (
    query: IAnalyticsQuery,
): Promise<IMachineAnalytics> => {
    const validatedQuery = validateAnalyticsQuery(query);

    const { organizationId, plantId } = validatedQuery;

    const machines = await prisma.machine.findMany({
        where: getPlantScope(organizationId, plantId),

        select: {
            status: true,
            healthScore: true,
            failureRisk: true,
            riskLevel: true,
        },
    });

    const totalMachines = machines.length;

    const onlineMachines = machines.filter(
        (machine) => machine.status === 'ONLINE',
    ).length;

    const offlineMachines = machines.filter(
        (machine) => machine.status === 'OFFLINE',
    ).length;

    const maintenanceMachines = machines.filter(
        (machine) => machine.status === 'MAINTENANCE',
    ).length;

    const warningMachines = machines.filter(
        (machine) => machine.status === 'WARNING',
    ).length;

    const criticalMachines = machines.filter(
        (machine) => machine.status === 'CRITICAL',
    ).length;

    const averageHealthScore =
        totalMachines > 0
            ? Number(
                  (
                      machines.reduce(
                          (sum, machine) => sum + machine.healthScore,
                          0,
                      ) / totalMachines
                  ).toFixed(2),
              )
            : 0;

    const averageFailureRisk =
        totalMachines > 0
            ? Number(
                  (
                      machines.reduce(
                          (sum, machine) => sum + machine.failureRisk,
                          0,
                      ) / totalMachines
                  ).toFixed(2),
              )
            : 0;

    const highRiskMachines = machines.filter(
        (machine) =>
            machine.riskLevel === 'HIGH' || machine.riskLevel === 'CRITICAL',
    ).length;

    const criticalRiskMachines = machines.filter(
        (machine) => machine.riskLevel === 'CRITICAL',
    ).length;

    return {
        totalMachines,
        onlineMachines,
        offlineMachines,
        maintenanceMachines,
        warningMachines,
        criticalMachines,
        averageHealthScore,
        averageFailureRisk,
        highRiskMachines,
        criticalRiskMachines,
    };
};

/* -------------------------------------------------------------------------- */
/*                           MAINTENANCE ANALYTICS                            */
/* -------------------------------------------------------------------------- */

const getMaintenanceAnalytics = async (
    query: IAnalyticsQuery,
): Promise<IMaintenanceAnalytics> => {
    const validatedQuery = validateAnalyticsQuery(query);

    const { organizationId, plantId, startDate, endDate } = validatedQuery;

    const maintenanceTasks = await prisma.maintenanceTask.findMany({
        where: {
            ...getPlantScope(organizationId, plantId),

            createdAt: getDateFilter(startDate, endDate),
        },

        select: {
            status: true,
        },
    });

    const totalTasks = maintenanceTasks.length;

    const completedTasks = maintenanceTasks.filter(
        (task) => task.status === 'COMPLETED',
    ).length;

    const pendingTasks = maintenanceTasks.filter(
        (task) => task.status === 'TODO',
    ).length;

    const inProgressTasks = maintenanceTasks.filter(
        (task) => task.status === 'IN_PROGRESS',
    ).length;

    const overdueTasks = maintenanceTasks.filter(
        (task) => task.status === 'OVERDUE',
    ).length;

    const cancelledTasks = maintenanceTasks.filter(
        (task) => task.status === 'CANCELLED',
    ).length;

    const completionRate =
        totalTasks > 0
            ? Number(((completedTasks / totalTasks) * 100).toFixed(2))
            : 0;

    return {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        overdueTasks,
        cancelledTasks,
        completionRate,
    };
};

/* -------------------------------------------------------------------------- */
/*                              QUALITY ANALYTICS                             */
/* -------------------------------------------------------------------------- */

const getQualityAnalytics = async (
    query: IAnalyticsQuery,
): Promise<IQualityAnalytics> => {
    const validatedQuery = validateAnalyticsQuery(query);

    const { organizationId, plantId, startDate, endDate } = validatedQuery;

    const inspections = await prisma.qualityInspection.findMany({
        where: {
            ...getPlantScope(organizationId, plantId),

            inspectionDate: getDateFilter(startDate, endDate),
        },

        select: {
            inspectedQuantity: true,
            passedQuantity: true,
            defectQuantity: true,
        },
    });

    const totalInspections = inspections.length;

    const totalInspectedQuantity = inspections.reduce(
        (sum, inspection) => sum + inspection.inspectedQuantity,
        0,
    );

    const totalPassedQuantity = inspections.reduce(
        (sum, inspection) => sum + inspection.passedQuantity,
        0,
    );

    const totalDefectQuantity = inspections.reduce(
        (sum, inspection) => sum + inspection.defectQuantity,
        0,
    );

    const passRate =
        totalInspectedQuantity > 0
            ? Number(
                  (
                      (totalPassedQuantity / totalInspectedQuantity) *
                      100
                  ).toFixed(2),
              )
            : 0;

    const defectRate =
        totalInspectedQuantity > 0
            ? Number(
                  (
                      (totalDefectQuantity / totalInspectedQuantity) *
                      100
                  ).toFixed(2),
              )
            : 0;

    return {
        totalInspections,
        totalInspectedQuantity,
        totalPassedQuantity,
        totalDefectQuantity,
        passRate,
        defectRate,
    };
};

/* -------------------------------------------------------------------------- */
/*                              ENERGY ANALYTICS                              */
/* -------------------------------------------------------------------------- */

const getEnergyAnalytics = async (
    query: IAnalyticsQuery,
): Promise<IEnergyAnalytics> => {
    const validatedQuery = validateAnalyticsQuery(query);

    const { organizationId, plantId, startDate, endDate } = validatedQuery;

    const energyRecords = await prisma.energyRecord.findMany({
        where: {
            ...getPlantScope(organizationId, plantId),

            recordedAt: getDateFilter(startDate, endDate),
        },

        select: {
            energyConsumed: true,
            energyCost: true,
        },
    });

    const totalRecords = energyRecords.length;

    const totalEnergyConsumed = energyRecords.reduce(
        (sum, record) => sum + record.energyConsumed,
        0,
    );

    const totalEnergyCost = energyRecords.reduce(
        (sum, record) => sum + Number(record.energyCost ?? 0),
        0,
    );

    const averageEnergyConsumed =
        totalRecords > 0
            ? Number((totalEnergyConsumed / totalRecords).toFixed(2))
            : 0;

    const averageEnergyCost =
        totalRecords > 0
            ? Number((totalEnergyCost / totalRecords).toFixed(2))
            : 0;

    return {
        totalRecords,
        totalEnergyConsumed: Number(totalEnergyConsumed.toFixed(2)),
        totalEnergyCost: Number(totalEnergyCost.toFixed(2)),
        averageEnergyConsumed,
        averageEnergyCost,
    };
};

/* -------------------------------------------------------------------------- */
/*                              OVERVIEW                                      */
/* -------------------------------------------------------------------------- */

const getAnalyticsOverview = async (
    query: IAnalyticsQuery,
): Promise<IAnalyticsOverview> => {
    const [production, machines, maintenance, quality, energy] =
        await Promise.all([
            getProductionAnalytics(query),
            getMachineAnalytics(query),
            getMaintenanceAnalytics(query),
            getQualityAnalytics(query),
            getEnergyAnalytics(query),
        ]);

    return {
        production,
        machines,
        maintenance,
        quality,
        energy,
    };
};

/* -------------------------------------------------------------------------- */
/*                              DASHBOARD                                     */
/* -------------------------------------------------------------------------- */

const getAnalyticsDashboard = async (query: IAnalyticsQuery) => {
    const validatedQuery = validateAnalyticsQuery(query);

    const overview = await getAnalyticsOverview(validatedQuery);

    return {
        period: {
            startDate: validatedQuery.startDate ?? null,

            endDate: validatedQuery.endDate ?? null,
        },

        overview,
    };
};

export const analyticsServices = {
    getProductionAnalytics,
    getMachineAnalytics,
    getMaintenanceAnalytics,
    getQualityAnalytics,
    getEnergyAnalytics,
    getAnalyticsOverview,
    getAnalyticsDashboard,
};
