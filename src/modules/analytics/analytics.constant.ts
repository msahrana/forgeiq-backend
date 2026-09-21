import { UserRole } from '../../../generated/prisma/enums';

export const ANALYTICS_ROLES = {
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
