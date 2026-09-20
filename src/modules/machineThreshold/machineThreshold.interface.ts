export interface ICreateMachineThreshold {
    machineId: string;

    temperatureWarning?: number;
    temperatureCritical?: number;

    vibrationWarning?: number;
    vibrationCritical?: number;

    pressureWarning?: number;
    pressureCritical?: number;

    rpmWarning?: number;
    rpmCritical?: number;

    powerWarning?: number;
    powerCritical?: number;
}

export interface IUpdateMachineThreshold {
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
}
