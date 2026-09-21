export interface ICreateEnergyRecord {
    plantId: string;
    machineId?: string;
    energyConsumed: number;
    energyCost?: number;
    recordedAt?: Date;
}

export interface IUpdateEnergyRecord {
    machineId?: string | null;
    energyConsumed?: number;
    energyCost?: number | null;
    recordedAt?: Date;
}

export interface IGetEnergyRecordsQuery {
    plantId?: string;
    machineId?: string;
    startDate?: Date;
    endDate?: Date;
}
