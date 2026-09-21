import { Prisma } from '../../../generated/prisma/client';

import { prisma } from '../../lib/prisma';
import AppError from '../../errors/AppError';

import {
    ICreateAIInsight,
    IUpdateAIInsight,
    IGetAIInsightsQuery,
} from './aiInsight.interface';

import { aiInsightQueryValidationSchema } from './aiInsight.validation';

/* -------------------------------------------------------------------------- */
/*                              HELPER FUNCTIONS                              */
/* -------------------------------------------------------------------------- */

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

const validateQuery = (query: IGetAIInsightsQuery) => {
    const result = aiInsightQueryValidationSchema.safeParse(query);

    if (!result.success) {
        throw new AppError(
            400,
            result.error.issues[0]?.message || 'Invalid AI insight query',
        );
    }

    return result.data;
};

/* -------------------------------------------------------------------------- */
/*                              CREATE INSIGHT                                */
/* -------------------------------------------------------------------------- */

const createAIInsightIntoDB = async (payload: ICreateAIInsight) => {
    const {
        organizationId,
        plantId,
        type,
        severity,
        title,
        message,
        recommendation,
        metadata,
    } = payload;

    const organization = await prisma.organization.findUnique({
        where: {
            id: organizationId,
        },
    });

    if (!organization) {
        throw new AppError(404, 'Organization not found');
    }

    if (plantId) {
        const plant = await prisma.plant.findUnique({
            where: {
                id: plantId,
            },
        });

        if (!plant) {
            throw new AppError(404, 'Plant not found');
        }

        if (plant.organizationId !== organizationId) {
            throw new AppError(
                400,
                'Plant does not belong to this organization',
            );
        }
    }

    const result = await prisma.aIInsight.create({
        data: {
            organizationId,
            plantId,
            type,
            severity,
            title,
            message,
            recommendation,
            metadata,
        },

        include: {
            organization: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },

            plant: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
        },
    });

    return result;
};

/* -------------------------------------------------------------------------- */
/*                                GET ALL                                     */
/* -------------------------------------------------------------------------- */

const getAllAIInsightsFromDB = async (query: IGetAIInsightsQuery) => {
    const validatedQuery = validateQuery(query);

    const {
        organizationId,
        plantId,
        type,
        severity,
        isResolved,
        startDate,
        endDate,
    } = validatedQuery;

    const whereConditions: Prisma.AIInsightWhereInput = {
        organizationId,
    };

    if (plantId) {
        whereConditions.plantId = plantId;
    }

    if (type) {
        whereConditions.type = type;
    }

    if (severity) {
        whereConditions.severity = severity;
    }

    if (isResolved !== undefined) {
        whereConditions.isResolved = isResolved;
    }

    if (startDate || endDate) {
        whereConditions.createdAt = getDateFilter(startDate, endDate);
    }

    const result = await prisma.aIInsight.findMany({
        where: whereConditions,

        include: {
            organization: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },

            plant: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
        },

        orderBy: {
            createdAt: 'desc',
        },
    });

    return result;
};

/* -------------------------------------------------------------------------- */
/*                              GET SINGLE                                    */
/* -------------------------------------------------------------------------- */

const getSingleAIInsightFromDB = async (id: string) => {
    const result = await prisma.aIInsight.findUnique({
        where: {
            id,
        },

        include: {
            organization: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },

            plant: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
        },
    });

    if (!result) {
        throw new AppError(404, 'AI insight not found');
    }

    return result;
};

/* -------------------------------------------------------------------------- */
/*                                UPDATE                                      */
/* -------------------------------------------------------------------------- */

const updateAIInsightIntoDB = async (id: string, payload: IUpdateAIInsight) => {
    const existingInsight = await prisma.aIInsight.findUnique({
        where: {
            id,
        },
    });

    if (!existingInsight) {
        throw new AppError(404, 'AI insight not found');
    }

    const updateData: Prisma.AIInsightUpdateInput = {
        ...(payload.severity !== undefined && {
            severity: payload.severity,
        }),

        ...(payload.title !== undefined && {
            title: payload.title,
        }),

        ...(payload.message !== undefined && {
            message: payload.message,
        }),

        ...(payload.recommendation !== undefined && {
            recommendation: payload.recommendation,
        }),

        ...(payload.metadata !== undefined && {
            metadata:
                payload.metadata === null ? Prisma.JsonNull : payload.metadata,
        }),

        ...(payload.isResolved !== undefined && {
            isResolved: payload.isResolved,
        }),

        ...(payload.resolvedAt !== undefined && {
            resolvedAt: payload.resolvedAt,
        }),
    };

    const result = await prisma.aIInsight.update({
        where: {
            id,
        },

        data: updateData,

        include: {
            organization: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },

            plant: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
        },
    });

    return result;
};

/* -------------------------------------------------------------------------- */
/*                                DELETE                                      */
/* -------------------------------------------------------------------------- */

const deleteAIInsightFromDB = async (id: string) => {
    const existingInsight = await prisma.aIInsight.findUnique({
        where: {
            id,
        },
    });

    if (!existingInsight) {
        throw new AppError(404, 'AI insight not found');
    }

    await prisma.aIInsight.delete({
        where: {
            id,
        },
    });

    return null;
};

/* -------------------------------------------------------------------------- */
/*                         GENERATE AI INSIGHTS                               */
/* -------------------------------------------------------------------------- */

const generateAIInsightsIntoDB = async (
    organizationId: string,
    plantId?: string,
) => {
    const organization = await prisma.organization.findUnique({
        where: {
            id: organizationId,
        },
    });

    if (!organization) {
        throw new AppError(404, 'Organization not found');
    }

    if (plantId) {
        const plant = await prisma.plant.findUnique({
            where: {
                id: plantId,
            },
        });

        if (!plant) {
            throw new AppError(404, 'Plant not found');
        }

        if (plant.organizationId !== organizationId) {
            throw new AppError(
                400,
                'Plant does not belong to this organization',
            );
        }
    }

    const scope = getPlantScope(organizationId, plantId);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
        machines,
        productionRecords,
        energyRecords,
        qualityInspections,
        maintenanceTasks,
    ] = await Promise.all([
        prisma.machine.findMany({
            where: scope,

            select: {
                id: true,
                name: true,
                code: true,
                healthScore: true,
                failureRisk: true,
                riskLevel: true,
                status: true,
                nextMaintenanceAt: true,
            },
        }),

        prisma.productionRecord.findMany({
            where: {
                ...scope,

                recordedAt: {
                    gte: sevenDaysAgo,
                },
            },

            select: {
                targetQuantity: true,
                actualQuantity: true,
                defectQuantity: true,
                downtimeMinutes: true,
            },
        }),

        prisma.energyRecord.findMany({
            where: {
                ...scope,

                recordedAt: {
                    gte: sevenDaysAgo,
                },
            },

            select: {
                energyConsumed: true,
                energyCost: true,
                recordedAt: true,
            },
            orderBy: {
                recordedAt: 'desc',
            },
        }),

        prisma.qualityInspection.findMany({
            where: {
                ...scope,

                inspectionDate: {
                    gte: sevenDaysAgo,
                },
            },

            select: {
                inspectedQuantity: true,
                passedQuantity: true,
                defectQuantity: true,
            },
        }),

        prisma.maintenanceTask.findMany({
            where: scope,

            select: {
                id: true,
                title: true,
                status: true,
                priority: true,
                dueDate: true,
            },
        }),
    ]);

    const insights: ICreateAIInsight[] = [];

    /* -------------------------- MACHINE FAILURE -------------------------- */

    for (const machine of machines) {
        if (
            machine.failureRisk >= 70 ||
            machine.riskLevel === 'HIGH' ||
            machine.riskLevel === 'CRITICAL'
        ) {
            const severity =
                machine.failureRisk >= 90 || machine.riskLevel === 'CRITICAL'
                    ? 'CRITICAL'
                    : 'HIGH';

            insights.push({
                organizationId,
                plantId,

                type: 'MACHINE_FAILURE',
                severity,

                title: `High failure risk detected for ${machine.name}`,

                message:
                    `${machine.name} (${machine.code}) ` +
                    `has a failure risk of ` +
                    `${machine.failureRisk}%.`,

                recommendation:
                    'Inspect the machine and consider scheduling preventive maintenance.',

                metadata: {
                    machineId: machine.id,
                    machineName: machine.name,
                    machineCode: machine.code,
                    healthScore: machine.healthScore,
                    failureRisk: machine.failureRisk,
                    riskLevel: machine.riskLevel,
                    machineStatus: machine.status,
                },
            });
        }
    }

    /* --------------------------- PRODUCTION DROP ------------------------- */

    const totalTarget = productionRecords.reduce(
        (sum, record) => sum + record.targetQuantity,
        0,
    );

    const totalActual = productionRecords.reduce(
        (sum, record) => sum + record.actualQuantity,
        0,
    );

    const totalDowntime = productionRecords.reduce(
        (sum, record) => sum + record.downtimeMinutes,
        0,
    );

    const totalProductionDefects = productionRecords.reduce(
        (sum, record) => sum + record.defectQuantity,
        0,
    );

    const productionEfficiency =
        totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;

    if (productionEfficiency < 80) {
        insights.push({
            organizationId,
            plantId,

            type: 'PRODUCTION_DROP',
            severity: productionEfficiency < 60 ? 'CRITICAL' : 'HIGH',

            title: 'Production efficiency has dropped',

            message:
                `Production efficiency for the recent ` +
                `period is ${productionEfficiency.toFixed(2)}%.`,

            recommendation:
                'Review production downtime, machine status, and production line performance.',

            metadata: {
                totalTarget,
                totalActual,
                totalProductionDefects,
                totalDowntimeMinutes: totalDowntime,
                productionEfficiency: Number(productionEfficiency.toFixed(2)),
            },
        });
    }

    /* ----------------------------- ENERGY SPIKE -------------------------- */

    const totalEnergy = energyRecords.reduce(
        (sum, record) => sum + record.energyConsumed,
        0,
    );

    if (energyRecords.length > 0) {
        const averageEnergy = totalEnergy / energyRecords.length;

        const latestEnergy = energyRecords[0]?.energyConsumed ?? 0;

        if (latestEnergy > averageEnergy * 1.5) {
            insights.push({
                organizationId,
                plantId,

                type: 'ENERGY_SPIKE',
                severity: 'HIGH',

                title: 'Potential energy consumption spike detected',

                message:
                    `Recent energy consumption is significantly ` +
                    `higher than the average recorded consumption.`,

                recommendation:
                    'Inspect high-consumption machines and investigate abnormal operating conditions.',

                metadata: {
                    latestRecordedAt: energyRecords[0]?.recordedAt,
                    averageEnergy: Number(averageEnergy.toFixed(2)),

                    latestEnergy,

                    totalEnergyConsumed: Number(totalEnergy.toFixed(2)),
                },
            });
        }
    }

    /* ---------------------------- QUALITY ISSUE -------------------------- */

    const totalInspected = qualityInspections.reduce(
        (sum, inspection) => sum + inspection.inspectedQuantity,
        0,
    );

    const totalPassed = qualityInspections.reduce(
        (sum, inspection) => sum + inspection.passedQuantity,
        0,
    );

    const totalDefects = qualityInspections.reduce(
        (sum, inspection) => sum + inspection.defectQuantity,
        0,
    );

    const defectRate =
        totalInspected > 0 ? (totalDefects / totalInspected) * 100 : 0;

    if (defectRate > 5) {
        insights.push({
            organizationId,
            plantId,

            type: 'QUALITY_ISSUE',
            severity: defectRate > 10 ? 'CRITICAL' : 'HIGH',

            title: 'Quality defect rate is elevated',

            message:
                `The current defect rate is ` + 
                `${defectRate.toFixed(2)}%.`,

            recommendation:
                'Investigate defect patterns, production conditions, and affected machines or production lines.',

            metadata: {
                totalInspected,
                totalPassed,
                totalDefects,
                defectRate: Number(defectRate.toFixed(2)),
            },
        });
    }

    /* -------------------------- MAINTENANCE DUE -------------------------- */

    const now = new Date();

    const maintenanceDue = machines.filter(
        (machine) =>
            machine.nextMaintenanceAt && machine.nextMaintenanceAt <= now,
    );

    if (maintenanceDue.length > 0) {
        insights.push({
            organizationId,
            plantId,

            type: 'MAINTENANCE_DUE',
            severity: 'HIGH',

            title: 'Machine maintenance is due',

            message:
                `${maintenanceDue.length} machine(s) have reached ` +
                `their scheduled maintenance date.`,

            recommendation:
                'Review the maintenance schedule and create or assign maintenance work orders.',

            metadata: {
                machineCount: maintenanceDue.length,

                machines: maintenanceDue.map((machine) => ({
                    id: machine.id,
                    name: machine.name,
                    code: machine.code,
                    nextMaintenanceAt: machine.nextMaintenanceAt,
                })),
            },
        });
    }

    /* -------------------------- OVERDUE TASKS ----------------------------- */

    const overdueTasks = maintenanceTasks.filter(
        (task) => task.status === 'OVERDUE',
    );

    if (overdueTasks.length > 0) {
        insights.push({
            organizationId,
            plantId,

            type: 'MAINTENANCE_DUE',
            severity: 'CRITICAL',

            title: 'Overdue maintenance tasks detected',

            message:
                `${overdueTasks.length} maintenance task(s) ` +
                `are currently overdue.`,

            recommendation:
                'Review and prioritize overdue maintenance tasks immediately.',

            metadata: {
                overdueTaskCount: overdueTasks.length,

                tasks: overdueTasks.map((task) => ({
                    id: task.id,
                    title: task.title,
                    priority: task.priority,
                    dueDate: task.dueDate,
                })),
            },
        });
    }

    /* ------------------------ REMOVE DUPLICATES -------------------------- */ const uniqueInsights =
        insights.filter(
            (insight, index, self) =>
                index ===
                self.findIndex(
                    (item) =>
                        item.organizationId === insight.organizationId &&
                        item.plantId === insight.plantId &&
                        item.type === insight.type &&
                        item.title === insight.title,
                ),
        );
    if (uniqueInsights.length === 0) {
        return { generated: 0, insights: [] };
    }

    /* ---------------------- CHECK EXISTING INSIGHTS ----------------------- */ const existingInsights =
        await prisma.aIInsight.findMany({
            where: {
                organizationId,
                ...(plantId ? { plantId } : {}),
                isResolved: false,
                OR: uniqueInsights.map((insight) => ({
                    type: insight.type,
                    title: insight.title,
                })),
            },
            select: { type: true, title: true, plantId: true },
        });

    /* ---------------------- FILTER NEW INSIGHTS --------------------------- */ const newInsights =
        uniqueInsights.filter(
            (insight) =>
                !existingInsights.some(
                    (existing) =>
                        existing.type === insight.type &&
                        existing.title === insight.title &&
                        existing.plantId === insight.plantId,
                ),
        );
    if (newInsights.length === 0) {
        return { generated: 0, insights: [] };
    }

    /* ---------------------------- SAVE INSIGHTS -------------------------- */

    const createdInsights = await prisma.$transaction(
        insights.map((insight) =>
            prisma.aIInsight.create({
                data: {
                    organizationId: insight.organizationId,

                    plantId: insight.plantId,

                    type: insight.type,

                    severity: insight.severity,

                    title: insight.title,

                    message: insight.message,

                    recommendation: insight.recommendation,

                    metadata: insight.metadata,
                },

                include: {
                    plant: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
            }),
        ),
    );

    return {
        generated: createdInsights.length,
        insights: createdInsights,
    };
};

/* -------------------------------------------------------------------------- */
/*                                  EXPORT                                    */
/* -------------------------------------------------------------------------- */

export const aiInsightServices = {
    createAIInsightIntoDB,
    getAllAIInsightsFromDB,
    getSingleAIInsightFromDB,
    updateAIInsightIntoDB,
    deleteAIInsightFromDB,
    generateAIInsightsIntoDB,
};
