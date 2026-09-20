import {
    MachineStatus,
    MachineType,
    RiskLevel,
} from '../../../generated/prisma/enums';

export interface ICreateMachine {
    plantId: string;
    productionLineId?: string;

    name: string;
    code: string;
    type: MachineType;

    manufacturer?: string;
    model?: string;
    serialNumber?: string;

    status?: MachineStatus;

    healthScore?: number;
    failureRisk?: number;
    riskLevel?: RiskLevel;

    installationDate?: Date;
    lastMaintenanceAt?: Date;
    nextMaintenanceAt?: Date;

    operatingHours?: number;
}

export interface IUpdateMachine {
    plantId?: string;
    productionLineId?: string | null;

    name?: string;
    code?: string;
    type?: MachineType;

    manufacturer?: string | null;
    model?: string | null;
    serialNumber?: string | null;

    status?: MachineStatus;

    healthScore?: number;
    failureRisk?: number;
    riskLevel?: RiskLevel;

    installationDate?: Date | null;
    lastMaintenanceAt?: Date | null;
    nextMaintenanceAt?: Date | null;

    operatingHours?: number;
}

export interface IUpdateMachineStatus {
    status: MachineStatus;
}
