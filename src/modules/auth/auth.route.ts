import { validateRequest } from '../../middleware/validateRequest';
import { UserRole } from '../../../generated/prisma/enums';
import { authControllers } from './auth.controller';
import { UserValidation } from './auth.validation';
import { auth } from '../../middleware/checkAuth';
import { Router } from 'express';
import { upload } from '../../lib/multer';

const router = Router();

router.post(
    '/register',
    validateRequest(UserValidation.RegistrationZodSchema),
    authControllers.userRegister,
);

router.post(
    '/verify-email',
    validateRequest(UserValidation.EmailVerifyZodSchema),
    authControllers.verifyEmail,
);

router.post(
    '/login',
    validateRequest(UserValidation.LoginZodSchema),
    authControllers.loginUser,
);

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

router.post('/forgot-password', authControllers.forgotPassword);

router.post('/reset-password', authControllers.resetPassword);

router.post('/google', authControllers.googleLogin);

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

router.get('/users', authControllers.getAllUsers);

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
    upload.single('profileImage'),
    authControllers.uploadProfileImage,
);

export const authRoutes = router;
