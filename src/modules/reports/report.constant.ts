import { UserRole } from '../../../generated/prisma/enums';

export const REPORT_ROLES = {
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

    GENERATE: [
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.PRODUCTION_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
    ],
} as const;
