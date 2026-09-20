export const PRODUCTION_STATUS = {
    IDLE: 'IDLE',
    RUNNING: 'RUNNING',
    ERROR: 'ERROR',
    STOPPED: 'STOPPED',
    MAINTENANCE: 'MAINTENANCE',
} as const;

export const productionStatusValues = Object.values(PRODUCTION_STATUS);
