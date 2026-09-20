import { ProductionStatus } from '../../../generated/prisma/enums';

export interface ICreateProductionRecord {
    plantId: string;

    productionLineId: string;

    machineId?: string;

    targetQuantity: number;

    actualQuantity: number;

    defectQuantity?: number;

    downtimeMinutes?: number;

    status?: ProductionStatus;

    recordedAt?: Date;
}

export interface IUpdateProductionRecord {
    targetQuantity?: number;

    actualQuantity?: number;

    defectQuantity?: number;

    downtimeMinutes?: number;

    status?: ProductionStatus;

    recordedAt?: Date;
}

export interface IGetProductionRecordsQuery {
    plantId?: string;

    productionLineId?: string;

    machineId?: string;

    status?: ProductionStatus;

    startDate?: Date;

    endDate?: Date;
}
