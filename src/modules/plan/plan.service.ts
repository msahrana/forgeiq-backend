import { Prisma } from '../../../generated/prisma/client';
import { prisma } from '../../lib/prisma';

const createPlanIntoDB = async (payload: Prisma.PlanCreateInput) => {
    const existingPlan = await prisma.plan.findFirst({
        where: {
            name: {
                equals: payload.name,
                mode: 'insensitive',
            },
        },
    });

    if (existingPlan) {
        throw new Error('A plan with this name already exists');
    }

    const plan = await prisma.plan.create({
        data: payload,
    });

    return plan;
};

const getAllPlansIntoDB = async () => {
    const plans = await prisma.plan.findMany({
        orderBy: {
            createdAt: 'desc',
        },
    });

    return plans;
};

const getActivePlansIntoDB = async () => {
    const plans = await prisma.plan.findMany({
        where: {
            isActive: true,
        },
        orderBy: {
            price: 'asc',
        },
    });

    return plans;
};

const getPlanByIdIntoDB = async (id: string) => {
    const plan = await prisma.plan.findUnique({
        where: {
            id,
        },
    });

    if (!plan) {
        throw new Error('Plan not found');
    }

    return plan;
};

const updatePlanIntoDB = async (
    id: string,
    payload: Prisma.PlanUpdateInput,
) => {
    const existingPlan = await prisma.plan.findUnique({
        where: {
            id,
        },
    });

    if (!existingPlan) {
        throw new Error('Plan not found');
    }

    if (payload.name) {
        const duplicatePlan = await prisma.plan.findFirst({
            where: {
                name: {
                    equals: payload.name as string,
                    mode: 'insensitive',
                },
                NOT: {
                    id,
                },
            },
        });

        if (duplicatePlan) {
            throw new Error('A plan with this name already exists');
        }
    }

    const plan = await prisma.plan.update({
        where: {
            id,
        },
        data: payload,
    });

    return plan;
};

const updatePlanStatusIntoDB = async (id: string, isActive: boolean) => {
    const existingPlan = await prisma.plan.findUnique({
        where: {
            id,
        },
    });

    if (!existingPlan) {
        throw new Error('Plan not found');
    }

    const plan = await prisma.plan.update({
        where: {
            id,
        },
        data: {
            isActive,
        },
    });

    return plan;
};

const deletePlanIntoDB = async (id: string) => {
    const existingPlan = await prisma.plan.findUnique({
        where: {
            id,
        },
        include: {
            subscriptions: true,
        },
    });

    if (!existingPlan) {
        throw new Error('Plan not found');
    }

    if (existingPlan.subscriptions.length > 0) {
        throw new Error(
            'This plan cannot be deleted because it has subscriptions',
        );
    }

    await prisma.plan.delete({
        where: {
            id,
        },
    });

    return null;
};

export const planServices = {
    createPlanIntoDB,
    getAllPlansIntoDB,
    getActivePlansIntoDB,
    getPlanByIdIntoDB,
    updatePlanIntoDB,
    updatePlanStatusIntoDB,
    deletePlanIntoDB,
};
