import { UserRole } from '../../../generated/prisma/enums';

export const ENERGY_RECORD_ROLES = {
    CREATE: [
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.PRODUCTION_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
    ],

    UPDATE: [
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.PRODUCTION_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
    ],

    DELETE: [
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
    ],

    VIEW: [
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.PRODUCTION_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
        UserRole.TECHNICIAN,
        UserRole.EXECUTIVE,
        UserRole.VIEWER,
    ],
} as const;
