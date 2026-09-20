import { UserRole } from '../../../generated/prisma/enums';

export const WORK_ORDER_ASSIGNABLE_ROLES: UserRole[] = [
    UserRole.SUPER_ADMIN,
    UserRole.ORG_OWNER,
    UserRole.FACTORY_MANAGER,
    UserRole.MAINTENANCE_ENGINEER,
    UserRole.TECHNICIAN,
];

export const WORK_ORDER_ROLES = {
    CREATE: [
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
    ],

    ASSIGN: [
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
    ],

    EXECUTE: [
        UserRole.SUPER_ADMIN,
        UserRole.ORG_OWNER,
        UserRole.FACTORY_MANAGER,
        UserRole.MAINTENANCE_ENGINEER,
        UserRole.TECHNICIAN,
    ],
} as const;
