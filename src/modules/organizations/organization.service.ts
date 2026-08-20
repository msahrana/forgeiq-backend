import {
    MemberStatus,
    OrganizationStatus,
    UserRole,
} from '../../../generated/prisma/enums';
import { prisma } from '../../lib/prisma';
import { ORGANIZATION_STATUS, MEMBER_STATUS } from './organization.constant';

/*
|--------------------------------------------------------------------------
| Create Organization
|--------------------------------------------------------------------------
*/

const createOrganizationIntoDB = async (
    ownerId: string,
    payload: {
        name: string;
        slug: string;
        logo?: string;
        industry?: string;
        country?: string;
        timezone?: string;
    },
) => {
    /*
     * Check User
     */

    const owner = await prisma.user.findUnique({
        where: {
            id: ownerId,
        },
    });

    if (!owner) {
        throw new Error('Owner not found');
    }

    /*
     * Check slug
     */

    const existingOrganization = await prisma.organization.findUnique({
        where: {
            slug: payload.slug,
        },
    });

    if (existingOrganization) {
        throw new Error('Organization slug already exists');
    }

    /*
     * Create Organization + Owner Member
     */

    const organization = await prisma.$transaction(async (tx) => {
        const createdOrganization = await tx.organization.create({
            data: {
                name: payload.name,
                slug: payload.slug,
                logo: payload.logo,
                industry: payload.industry,
                country: payload.country,
                timezone: payload.timezone ?? 'UTC',

                ownerId,

                status: ORGANIZATION_STATUS.TRIAL,
            },
        });

        /*
         * Add owner as member
         */

        await tx.organizationMember.create({
            data: {
                userId: ownerId,

                organizationId: createdOrganization.id,

                role: UserRole.ORG_OWNER,

                status: MEMBER_STATUS.ACTIVE,
            },
        });

        return createdOrganization;
    });

    return organization;
};

/*
|--------------------------------------------------------------------------
| Get All Organizations
|--------------------------------------------------------------------------
*/

const getAllOrganizationsIntoDB = async () => {
    return await prisma.organization.findMany({
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },

            _count: {
                select: {
                    members: true,
                    plants: true,
                    subscriptions: true,
                    reports: true,
                },
            },
        },

        orderBy: {
            createdAt: 'desc',
        },
    });
};

/*
|--------------------------------------------------------------------------
| Get Organization By ID
|--------------------------------------------------------------------------
*/

const getOrganizationByIdIntoDB = async (id: string) => {
    const organization = await prisma.organization.findUnique({
        where: {
            id,
        },

        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },

            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        },
                    },
                },

                orderBy: {
                    createdAt: 'asc',
                },
            },

            plants: true,

            subscriptions: {
                include: {
                    plan: true,
                },
            },

            reports: true,

            _count: {
                select: {
                    members: true,
                    plants: true,
                    subscriptions: true,
                    reports: true,
                    aiConversations: true,
                    auditLogs: true,
                },
            },
        },
    });

    if (!organization) {
        throw new Error('Organization not found');
    }

    return organization;
};

/*
|--------------------------------------------------------------------------
| Get Organizations By Owner
|--------------------------------------------------------------------------
*/

const getOrganizationsByOwnerIntoDB = async (ownerId: string) => {
    const organizations = await prisma.organization.findMany({
        where: {
            ownerId,
        },

        include: {
            _count: {
                select: {
                    members: true,
                    plants: true,
                    subscriptions: true,
                },
            },
        },

        orderBy: {
            createdAt: 'desc',
        },
    });

    return organizations;
};

/*
|--------------------------------------------------------------------------
| Update Organization
|--------------------------------------------------------------------------
*/

const updateOrganizationIntoDB = async (
    id: string,
    payload: {
        name?: string;
        slug?: string;
        logo?: string | null;
        industry?: string | null;
        country?: string | null;
        timezone?: string;
    },
) => {
    const organization = await prisma.organization.findUnique({
        where: {
            id,
        },
    });

    if (!organization) {
        throw new Error('Organization not found');
    }

    /*
     * Check duplicate slug
     */

    if (payload.slug && payload.slug !== organization.slug) {
        const existing = await prisma.organization.findUnique({
            where: {
                slug: payload.slug,
            },
        });

        if (existing) {
            throw new Error('Organization slug already exists');
        }
    }

    return await prisma.organization.update({
        where: {
            id,
        },

        data: {
            name: payload.name,
            slug: payload.slug,
            logo: payload.logo,
            industry: payload.industry,
            country: payload.country,
            timezone: payload.timezone,
        },
    });
};

/*
|--------------------------------------------------------------------------
| Update Organization Status
|--------------------------------------------------------------------------
*/

const updateOrganizationStatusIntoDB = async (
    id: string,
    status: OrganizationStatus,
) => {
    const organization = await prisma.organization.findUnique({
        where: {
            id,
        },
    });

    if (!organization) {
        throw new Error('Organization not found');
    }

    /*
     * Prevent modifying cancelled organization
     */

    if (
        organization.status === OrganizationStatus.CANCELLED &&
        status !== OrganizationStatus.CANCELLED
    ) {
        throw new Error('Cancelled organization cannot be reactivated');
    }

    return await prisma.organization.update({
        where: {
            id,
        },

        data: {
            status,
        },
    });
};

/*
|--------------------------------------------------------------------------
| Delete Organization
|--------------------------------------------------------------------------
*/

const deleteOrganizationIntoDB = async (id: string) => {
    const organization = await prisma.organization.findUnique({
        where: {
            id,
        },
    });

    if (!organization) {
        throw new Error('Organization not found');
    }

    /*
     * Soft delete through status
     */

    await prisma.organization.update({
        where: {
            id,
        },

        data: {
            status: OrganizationStatus.CANCELLED,
        },
    });
};

/*
|--------------------------------------------------------------------------
| Add Member
|--------------------------------------------------------------------------
*/

const addMemberIntoDB = async (
    organizationId: string,
    userId: string,
    role: UserRole,
) => {
    /*
     * Check organization
     */

    const organization = await prisma.organization.findUnique({
        where: {
            id: organizationId,
        },
    });

    if (!organization) {
        throw new Error('Organization not found');
    }

    /*
     * Check user
     */

    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });

    if (!user) {
        throw new Error('User not found');
    }

    /*
     * Check existing member
     */

    const existingMember = await prisma.organizationMember.findUnique({
        where: {
            userId_organizationId: {
                userId,
                organizationId,
            },
        },
    });

    if (existingMember) {
        throw new Error('User is already a member of this organization');
    }

    /*
     * Add member
     */

    return await prisma.organizationMember.create({
        data: {
            userId,
            organizationId,
            role,
            status: MEMBER_STATUS.INVITED,
        },

        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
        },
    });
};

/*
|--------------------------------------------------------------------------
| Get Members
|--------------------------------------------------------------------------
*/

const getMembersIntoDB = async (organizationId: string) => {
    const organization = await prisma.organization.findUnique({
        where: {
            id: organizationId,
        },
    });

    if (!organization) {
        throw new Error('Organization not found');
    }

    return await prisma.organizationMember.findMany({
        where: {
            organizationId,
        },

        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
        },

        orderBy: {
            createdAt: 'asc',
        },
    });
};

/*
|--------------------------------------------------------------------------
| Update Member Role
|--------------------------------------------------------------------------
*/

const updateMemberRoleIntoDB = async (
    organizationId: string,
    memberId: string,
    role: UserRole,
) => {
    /*
    |--------------------------------------------------------------------------
    | Find Organization Member
    |--------------------------------------------------------------------------
    */

    const member = await prisma.organizationMember.findFirst({
        where: {
            id: memberId,
            organizationId,
        },
    });

    if (!member) {
        throw new Error('Organization member not found');
    }

    /*
     * Owner role protection
     */

    if (member.role === UserRole.ORG_OWNER) {
        throw new Error('Organization owner role cannot be changed');
    }

    /*
    |--------------------------------------------------------------------------
    | Prevent Same Role Update
    |--------------------------------------------------------------------------
    */

    if (member.role === role) {
        throw new Error('Member already has this role');
    }

    /*
    |--------------------------------------------------------------------------
    | Update Member Role
    |--------------------------------------------------------------------------
    */

    const updatedMember = await prisma.organizationMember.update({
        where: {
            id: memberId,
        },

        data: {
            role,
        },

        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },

            organization: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
    });

    return updatedMember;
};

/*
|--------------------------------------------------------------------------
| Update Member Status
|--------------------------------------------------------------------------
*/

const updateMemberStatusIntoDB = async (
    organizationId: string,
    memberId: string,
    status: MemberStatus,
) => {
    const member = await prisma.organizationMember.findFirst({
        where: {
            id: memberId,
            organizationId,
        },
    });

    if (!member) {
        throw new Error('Organization member not found');
    }

    /*
     * Owner protection
     */

    if (member.role === UserRole.ORG_OWNER && status !== MemberStatus.ACTIVE) {
        throw new Error('Organization owner cannot be suspended or removed');
    }

    return await prisma.organizationMember.update({
        where: {
            id: memberId,
        },

        data: {
            status,
        },

        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
        },
    });
};

/*
|--------------------------------------------------------------------------
| Remove Member
|--------------------------------------------------------------------------
*/

const removeMemberIntoDB = async (organizationId: string, memberId: string) => {
    const member = await prisma.organizationMember.findFirst({
        where: {
            id: memberId,
            organizationId,
        },
    });

    if (!member) {
        throw new Error('Organization member not found');
    }

    /*
     * Owner cannot be removed
     */

    if (member.role === UserRole.ORG_OWNER) {
        throw new Error('Organization owner cannot be removed');
    }

    return await prisma.organizationMember.update({
        where: {
            id: memberId,
        },

        data: {
            status: MemberStatus.REMOVED,
        },
    });
};

export const organizationServices = {
    createOrganizationIntoDB,
    getAllOrganizationsIntoDB,
    getOrganizationByIdIntoDB,
    getOrganizationsByOwnerIntoDB,
    updateOrganizationIntoDB,
    updateOrganizationStatusIntoDB,
    deleteOrganizationIntoDB,
    addMemberIntoDB,
    getMembersIntoDB,
    updateMemberRoleIntoDB,
    updateMemberStatusIntoDB,
    removeMemberIntoDB,
};
