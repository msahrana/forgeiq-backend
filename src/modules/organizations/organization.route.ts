import { Router } from 'express';
import { organizationControllers } from './organization.controller';
import { organizationValidation } from './organization.validation';
import { validateRequest } from '../../middleware/validateRequest';
import { auth } from '../../middleware/checkAuth';
import { UserRole } from '../../../generated/prisma/enums';

const router = Router();

/*
|--------------------------------------------------------------------------
| Organization:
|--------------------------------------------------------------------------
*/

/*
 * Create Organization
 */
router.post(
    '/',
    auth(UserRole.VIEWER, UserRole.SUPER_ADMIN, UserRole.ORG_OWNER),
    validateRequest(organizationValidation.createOrganizationValidationSchema),
    organizationControllers.createOrganization,
);

/*
 * Get All Organization
 */
router.get('/', organizationControllers.getAllOrganizations);

/*
 * Get Organization By Owner
 */
router.get('/owner/:ownerId', organizationControllers.getOrganizationsByOwner);

/*
 * Get Organization By ID
 */
router.get('/:id', organizationControllers.getOrganizationById);

/*
 * Update Organization
 */
router.patch(
    '/:id',
    validateRequest(organizationValidation.updateOrganizationValidationSchema),
    organizationControllers.updateOrganization,
);

/*
 * Update Organization Status
 */
router.patch(
    '/:id/status',
    validateRequest(
        organizationValidation.updateOrganizationStatusValidationSchema,
    ),
    organizationControllers.updateOrganizationStatus,
);

/*
 * Delete Organization / Cancel Organization
 */
router.delete('/:id', organizationControllers.deleteOrganization);

/*
|--------------------------------------------------------------------------
| Organization Members:
|--------------------------------------------------------------------------
*/

/*
 * Add Member
 */
router.post(
    '/:organizationId/members',
    validateRequest(
        organizationValidation.addOrganizationMemberValidationSchema,
    ),
    organizationControllers.addMember,
);

/*
 * Get Members
 */
router.get('/:organizationId/members', organizationControllers.getMembers);

/*
 * Update Member Role
 */
router.patch(
    '/:organizationId/members/:memberId/role',
    validateRequest(organizationValidation.updateMemberRoleValidationSchema),
    organizationControllers.updateMemberRole,
);

/*
 * Update Member Status
 */
router.patch(
    '/:organizationId/members/:memberId/status',
    validateRequest(organizationValidation.updateMemberStatusValidationSchema),
    organizationControllers.updateMemberStatus,
);

/*
 * Remove Member
 */
router.delete(
    '/:organizationId/members/:memberId',
    organizationControllers.removeMember,
);

export const organizationRoutes = router;
