export const PLANT_STATUS = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    MAINTENANCE: 'MAINTENANCE',
    CLOSED: 'CLOSED',
} as const;

export const plantStatusValues = Object.values(PLANT_STATUS);
