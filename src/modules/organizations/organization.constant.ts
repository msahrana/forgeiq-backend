import {
    MemberStatus,
    OrganizationStatus,
    UserRole,
} from '../../../generated/prisma/enums';

export const ORGANIZATION_STATUS = {
    ACTIVE: OrganizationStatus.ACTIVE,
    TRIAL: OrganizationStatus.TRIAL,
    SUSPENDED: OrganizationStatus.SUSPENDED,
    CANCELLED: OrganizationStatus.CANCELLED,
} as const;

export const ORGANIZATION_STATUS_VALUES = Object.values(OrganizationStatus);

export const MEMBER_STATUS = {
    ACTIVE: MemberStatus.ACTIVE,
    INVITED: MemberStatus.INVITED,
    SUSPENDED: MemberStatus.SUSPENDED,
    REMOVED: MemberStatus.REMOVED,
    DELETED: MemberStatus.DELETED,
} as const;

export const MEMBER_STATUS_VALUES = Object.values(MemberStatus);

export const ORGANIZATION_MEMBER_ROLES = {
    ORG_OWNER: UserRole.ORG_OWNER,
    FACTORY_MANAGER: UserRole.FACTORY_MANAGER,
    PRODUCTION_MANAGER: UserRole.PRODUCTION_MANAGER,
    MAINTENANCE_ENGINEER: UserRole.MAINTENANCE_ENGINEER,
    TECHNICIAN: UserRole.TECHNICIAN,
    EXECUTIVE: UserRole.EXECUTIVE,
    VIEWER: UserRole.VIEWER,
} as const;

export const ORGANIZATION_MEMBER_ROLE_VALUES = Object.values(
    ORGANIZATION_MEMBER_ROLES,
);
