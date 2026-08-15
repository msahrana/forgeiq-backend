import { Router } from 'express';
import { authControllers } from './auth.controller';
import { auth } from '../../middleware/checkAuth';
import { UserRole } from '../../../generated/prisma/enums';

const router = Router();

router.post('/register', authControllers.userRegister);

router.post('/verify-email', authControllers.verifyEmail);

router.post('/login', authControllers.loginUser);

router.post('/refresh-token', authControllers.refreshToken);

router.post(
    '/change-password',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.FACTORY_MANAGER,
        UserRole.EXECUTIVE,
        UserRole.MAINTENANCE_ENGINEER,
        UserRole.ORG_OWNER,
        UserRole.PRODUCTION_MANAGER,
        UserRole.TECHNICIAN,
        UserRole.VIEWER,
    ),
    authControllers.changePassword,
);

router.post('/google', authControllers.googleLogin);

router.post('/forgot-password', authControllers.forgotPassword);

router.post('/reset-password', authControllers.resetPassword);

router.get(
    '/me',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.FACTORY_MANAGER,
        UserRole.EXECUTIVE,
        UserRole.MAINTENANCE_ENGINEER,
        UserRole.ORG_OWNER,
        UserRole.PRODUCTION_MANAGER,
        UserRole.TECHNICIAN,
        UserRole.VIEWER,
    ),
    authControllers.getMe,
);

router.get('/users', authControllers.getUsers);

router.get('/user/:id', authControllers.getUserById);

router.put(
    '/my-profile',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.FACTORY_MANAGER,
        UserRole.EXECUTIVE,
        UserRole.MAINTENANCE_ENGINEER,
        UserRole.ORG_OWNER,
        UserRole.PRODUCTION_MANAGER,
        UserRole.TECHNICIAN,
        UserRole.VIEWER,
    ),
    authControllers.updateMyProfile,
);

router.patch(
    '/profile-image',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.FACTORY_MANAGER,
        UserRole.EXECUTIVE,
        UserRole.MAINTENANCE_ENGINEER,
        UserRole.ORG_OWNER,
        UserRole.PRODUCTION_MANAGER,
        UserRole.TECHNICIAN,
        UserRole.VIEWER,
    ),
    authControllers.uploadProfileImage,
);

export const authRoutes = router;
