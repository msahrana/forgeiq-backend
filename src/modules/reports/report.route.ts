import { Router } from 'express';
import { auth } from '../../middleware/checkAuth';
import { validateRequest } from '../../middleware/validateRequest';
import { reportControllers } from './report.controller';
import { REPORT_ROLES } from './report.constant';
import {
    createReportValidationSchema,
    updateReportValidationSchema,
} from './report.validation';

const router = Router();

// Create Report
router.post(
    '/',
    auth(...REPORT_ROLES.CREATE),
    validateRequest(createReportValidationSchema),
    reportControllers.createReport,
);

// Get All Reports
router.get('/', auth(...REPORT_ROLES.VIEW), reportControllers.getAllReports);

// Get Single Report
router.get(
    '/:id',
    auth(...REPORT_ROLES.VIEW),
    reportControllers.getSingleReport,
);

// Update Report
router.patch(
    '/:id',
    auth(...REPORT_ROLES.UPDATE),
    validateRequest(updateReportValidationSchema),
    reportControllers.updateReport,
);

// Delete Report
router.delete(
    '/:id',
    auth(...REPORT_ROLES.DELETE),
    reportControllers.deleteReport,
);

export const reportRoutes = router;
