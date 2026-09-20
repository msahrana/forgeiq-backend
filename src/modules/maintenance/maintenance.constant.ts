export const MAINTENANCE_COST_LIMITS = {
    MIN: 0,
    MAX: 999999999999,
} as const;

export const MAINTENANCE_TITLE_LIMITS = {
    MIN: 3,
    MAX: 200,
} as const;

export const MAINTENANCE_DESCRIPTION_LIMITS = {
    MIN: 5,
    MAX: 2000,
} as const;

export const MAINTENANCE_ROLES = {
    CREATE: [
        'SUPER_ADMIN',
        'ORG_OWNER',
        'FACTORY_MANAGER',
        'MAINTENANCE_ENGINEER',
    ],

    ASSIGN: [
        'SUPER_ADMIN',
        'ORG_OWNER',
        'FACTORY_MANAGER',
        'MAINTENANCE_ENGINEER',
    ],

    EXECUTE: [
        'SUPER_ADMIN',
        'ORG_OWNER',
        'FACTORY_MANAGER',
        'MAINTENANCE_ENGINEER',
        'TECHNICIAN',
    ],
} as const;
