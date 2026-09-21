import { QualityResult, UserRole } from '../../../generated/prisma/enums';

export const QUALITY_INSPECTION_ROLES = {
    CREATE: [
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.PRODUCTION_MANAGER,
    ],

    UPDATE: [
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.PRODUCTION_MANAGER,
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

export const QUALITY_RESULTS = [
    QualityResult.PASSED,
    QualityResult.FAILED,
    QualityResult.PARTIAL,
    QualityResult.PENDING,
] as const;
