export interface ICreateMachineMetric {
    machineId: string;

    temperature?: number;
    vibration?: number;
    pressure?: number;
    rpm?: number;
    powerConsumption?: number;
    loadPercentage?: number;

    recordedAt?: Date;
}

export interface IUpdateMachineMetric {
    temperature?: number | null;
    vibration?: number | null;
    pressure?: number | null;
    rpm?: number | null;
    powerConsumption?: number | null;
    loadPercentage?: number | null;
    recordedAt?: Date;
}
