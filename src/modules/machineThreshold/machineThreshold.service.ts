import httpStatus from 'http-status';
import AppError from '../../errors/AppError';

import {
    ICreateMachineThreshold,
    IUpdateMachineThreshold,
} from './machineThreshold.interface';
import { prisma } from '../../lib/prisma';

const validateThresholdPairs = (data: {
    temperatureWarning?: number | null;
    temperatureCritical?: number | null;

    vibrationWarning?: number | null;
    vibrationCritical?: number | null;

    pressureWarning?: number | null;
    pressureCritical?: number | null;

    rpmWarning?: number | null;
    rpmCritical?: number | null;

    powerWarning?: number | null;
    powerCritical?: number | null;
}) => {
    const pairs = [
        {
            name: 'Temperature',
            warning: data.temperatureWarning,
            critical: data.temperatureCritical,
        },
        {
            name: 'Vibration',
            warning: data.vibrationWarning,
            critical: data.vibrationCritical,
        },
        {
            name: 'Pressure',
            warning: data.pressureWarning,
            critical: data.pressureCritical,
        },
        {
            name: 'RPM',
            warning: data.rpmWarning,
            critical: data.rpmCritical,
        },
        {
            name: 'Power',
            warning: data.powerWarning,
            critical: data.powerCritical,
        },
    ];

    for (const pair of pairs) {
        if (
            pair.warning !== null &&
            pair.warning !== undefined &&
            pair.critical !== null &&
            pair.critical !== undefined &&
            pair.warning >= pair.critical
        ) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                `${pair.name} warning threshold must be lower than critical threshold`,
            );
        }
    }
};

const createMachineThresholdIntoDB = async (
    payload: ICreateMachineThreshold,
) => {
    const machine = await prisma.machine.findUnique({
        where: {
            id: payload.machineId,
        },
    });

    if (!machine) {
        throw new AppError(httpStatus.NOT_FOUND, 'Machine not found');
    }

    const existingThreshold = await prisma.machineThreshold.findUnique({
        where: {
            machineId: payload.machineId,
        },
    });

    if (existingThreshold) {
        throw new AppError(
            httpStatus.CONFLICT,
            'Threshold configuration already exists for this machine',
        );
    }

    validateThresholdPairs(payload);

    const result = await prisma.machineThreshold.create({
        data: {
            machineId: payload.machineId,

            temperatureWarning: payload.temperatureWarning,
            temperatureCritical: payload.temperatureCritical,

            vibrationWarning: payload.vibrationWarning,
            vibrationCritical: payload.vibrationCritical,

            pressureWarning: payload.pressureWarning,
            pressureCritical: payload.pressureCritical,

            rpmWarning: payload.rpmWarning,
            rpmCritical: payload.rpmCritical,

            powerWarning: payload.powerWarning,
            powerCritical: payload.powerCritical,
        },

        include: {
            machine: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    type: true,
                    status: true,
                },
            },
        },
    });

    return result;
};

const getAllMachineThresholdsFromDB = async () => {
    const result = await prisma.machineThreshold.findMany({
        orderBy: {
            createdAt: 'desc',
        },

        include: {
            machine: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    type: true,
                    status: true,
                    plantId: true,
                },
            },
        },
    });

    return result;
};

const getSingleMachineThresholdFromDB = async (id: string) => {
    const result = await prisma.machineThreshold.findUnique({
        where: {
            id,
        },

        include: {
            machine: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    type: true,
                    status: true,
                    plantId: true,
                    productionLineId: true,
                },
            },
        },
    });

    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Machine threshold not found');
    }

    return result;
};

const getMachineThresholdByMachineIdFromDB = async (machineId: string) => {
    const machine = await prisma.machine.findUnique({
        where: {
            id: machineId,
        },
    });

    if (!machine) {
        throw new AppError(httpStatus.NOT_FOUND, 'Machine not found');
    }

    const result = await prisma.machineThreshold.findUnique({
        where: {
            machineId,
        },

        include: {
            machine: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    type: true,
                    status: true,
                    plantId: true,
                    productionLineId: true,
                },
            },
        },
    });

    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Machine threshold not found');
    }

    return result;
};

const updateMachineThresholdIntoDB = async (
    id: string,
    payload: IUpdateMachineThreshold,
) => {
    const existingThreshold = await prisma.machineThreshold.findUnique({
        where: {
            id,
        },
    });

    if (!existingThreshold) {
        throw new AppError(httpStatus.NOT_FOUND, 'Machine threshold not found');
    }

    const finalData = {
        temperatureWarning:
            payload.temperatureWarning !== undefined
                ? payload.temperatureWarning
                : existingThreshold.temperatureWarning,

        temperatureCritical:
            payload.temperatureCritical !== undefined
                ? payload.temperatureCritical
                : existingThreshold.temperatureCritical,

        vibrationWarning:
            payload.vibrationWarning !== undefined
                ? payload.vibrationWarning
                : existingThreshold.vibrationWarning,

        vibrationCritical:
            payload.vibrationCritical !== undefined
                ? payload.vibrationCritical
                : existingThreshold.vibrationCritical,

        pressureWarning:
            payload.pressureWarning !== undefined
                ? payload.pressureWarning
                : existingThreshold.pressureWarning,

        pressureCritical:
            payload.pressureCritical !== undefined
                ? payload.pressureCritical
                : existingThreshold.pressureCritical,

        rpmWarning:
            payload.rpmWarning !== undefined
                ? payload.rpmWarning
                : existingThreshold.rpmWarning,

        rpmCritical:
            payload.rpmCritical !== undefined
                ? payload.rpmCritical
                : existingThreshold.rpmCritical,

        powerWarning:
            payload.powerWarning !== undefined
                ? payload.powerWarning
                : existingThreshold.powerWarning,

        powerCritical:
            payload.powerCritical !== undefined
                ? payload.powerCritical
                : existingThreshold.powerCritical,
    };

    validateThresholdPairs(finalData);

    const result = await prisma.machineThreshold.update({
        where: {
            id,
        },

        data: {
            temperatureWarning: payload.temperatureWarning,
            temperatureCritical: payload.temperatureCritical,

            vibrationWarning: payload.vibrationWarning,
            vibrationCritical: payload.vibrationCritical,

            pressureWarning: payload.pressureWarning,
            pressureCritical: payload.pressureCritical,

            rpmWarning: payload.rpmWarning,
            rpmCritical: payload.rpmCritical,

            powerWarning: payload.powerWarning,
            powerCritical: payload.powerCritical,
        },

        include: {
            machine: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    type: true,
                    status: true,
                },
            },
        },
    });

    return result;
};

const deleteMachineThresholdFromDB = async (id: string) => {
    const existingThreshold = await prisma.machineThreshold.findUnique({
        where: {
            id,
        },
    });

    if (!existingThreshold) {
        throw new AppError(httpStatus.NOT_FOUND, 'Machine threshold not found');
    }

    const result = await prisma.machineThreshold.delete({
        where: {
            id,
        },
    });

    return result;
};

export const machineThresholdServices = {
    createMachineThresholdIntoDB,
    getAllMachineThresholdsFromDB,
    getSingleMachineThresholdFromDB,
    getMachineThresholdByMachineIdFromDB,
    updateMachineThresholdIntoDB,
    deleteMachineThresholdFromDB,
};
