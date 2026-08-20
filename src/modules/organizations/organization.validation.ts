import { z } from 'zod';

import {
    ORGANIZATION_MEMBER_ROLE_VALUES,
    ORGANIZATION_STATUS_VALUES,
    MEMBER_STATUS_VALUES,
} from './organization.constant';

/*
|--------------------------------------------------------------------------
| Create Organization
|--------------------------------------------------------------------------
*/

const createOrganizationValidationSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, 'Organization name must be at least 2 characters')
        .max(100, 'Organization name cannot exceed 100 characters'),

    slug: z
        .string()
        .trim()
        .min(2, 'Slug must be at least 2 characters')
        .max(100, 'Slug cannot exceed 100 characters')
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid organization slug'),

    logo: z.string().url('Invalid logo URL').optional(),

    industry: z
        .string()
        .trim()
        .max(100, 'Industry cannot exceed 100 characters')
        .optional(),

    country: z
        .string()
        .trim()
        .max(100, 'Country cannot exceed 100 characters')
        .optional(),

    timezone: z
        .string()
        .trim()
        .max(100, 'Timezone cannot exceed 100 characters')
        .default('UTC'),
});

/*
|--------------------------------------------------------------------------
| Update Organization
|--------------------------------------------------------------------------
*/

const updateOrganizationValidationSchema = z.object({
    name: z.string().trim().min(2).max(100).optional(),

    slug: z
        .string()
        .trim()
        .min(2)
        .max(100)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid organization slug')
        .optional(),

    logo: z.string().url('Invalid logo URL').nullable().optional(),

    industry: z.string().trim().max(100).nullable().optional(),

    country: z.string().trim().max(100).nullable().optional(),

    timezone: z.string().trim().max(100).optional(),
});

/*
|--------------------------------------------------------------------------
| Organization Status
|--------------------------------------------------------------------------
*/

const updateOrganizationStatusValidationSchema = z.object({
    status: z.enum(ORGANIZATION_STATUS_VALUES),
});

/*
|--------------------------------------------------------------------------
| Add Organization Member
|--------------------------------------------------------------------------
*/

const addOrganizationMemberValidationSchema = z.object({
    userId: z.string().uuid('Invalid user ID'),

    role: z.enum(ORGANIZATION_MEMBER_ROLE_VALUES),
});

/*
|--------------------------------------------------------------------------
| Update Member Role
|--------------------------------------------------------------------------
*/

const updateMemberRoleValidationSchema = z.object({
    role: z.enum(ORGANIZATION_MEMBER_ROLE_VALUES),
});

/*
|--------------------------------------------------------------------------
| Update Member Status
|--------------------------------------------------------------------------
*/

const updateMemberStatusValidationSchema = z.object({
    status: z.enum(MEMBER_STATUS_VALUES),
});

export const organizationValidation = {
    createOrganizationValidationSchema,
    updateOrganizationValidationSchema,
    updateOrganizationStatusValidationSchema,
    addOrganizationMemberValidationSchema,
    updateMemberRoleValidationSchema,
    updateMemberStatusValidationSchema,
};
