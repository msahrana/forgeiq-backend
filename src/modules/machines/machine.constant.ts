export const MACHINE_TYPE = {
    CNC: 'CNC',
    MOTOR: 'MOTOR',
    PUMP: 'PUMP',
    CONVEYOR: 'CONVEYOR',
    ROBOT: 'ROBOT',
    COMPRESSOR: 'COMPRESSOR',
    GENERATOR: 'GENERATOR',
    BOILER: 'BOILER',
    HVAC: 'HVAC',
    PACKAGING: 'PACKAGING',
    PRESS: 'PRESS',
    LATHE: 'LATHE',
    MILLING: 'MILLING',
} as const;

export const MACHINE_STATUS = {
    ONLINE: 'ONLINE',
    OFFLINE: 'OFFLINE',
    MAINTENANCE: 'MAINTENANCE',
    IDLE: 'IDLE',
    WARNING: 'WARNING',
    CRITICAL: 'CRITICAL',
} as const;

export const RISK_LEVEL = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL',
} as const;

export const machineTypeValues = Object.values(MACHINE_TYPE);

export const machineStatusValues = Object.values(MACHINE_STATUS);

export const riskLevelValues = Object.values(RISK_LEVEL);
