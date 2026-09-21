import { Router } from 'express';

import { auth } from '../../middleware/checkAuth';
import { validateRequest } from '../../middleware/validateRequest';

import { energyControllers } from './energy.controller';
import { ENERGY_RECORD_ROLES } from './energy.constant';

import {
    createEnergyRecordValidationSchema,
    updateEnergyRecordValidationSchema,
} from './energy.validation';

const router = Router();

// Create Energy Record
router.post(
    '/',
    auth(...ENERGY_RECORD_ROLES.CREATE),
    validateRequest(createEnergyRecordValidationSchema),
    energyControllers.createEnergyRecord,
);

// Get All Energy Records
router.get(
    '/',
    auth(...ENERGY_RECORD_ROLES.VIEW),
    energyControllers.getAllEnergyRecords,
);

// Get Single Energy Record
router.get(
    '/:id',
    auth(...ENERGY_RECORD_ROLES.VIEW),
    energyControllers.getSingleEnergyRecord,
);

// Update Energy Record
router.patch(
    '/:id',
    auth(...ENERGY_RECORD_ROLES.UPDATE),
    validateRequest(updateEnergyRecordValidationSchema),
    energyControllers.updateEnergyRecord,
);

// Delete Energy Record
router.delete(
    '/:id',
    auth(...ENERGY_RECORD_ROLES.DELETE),
    energyControllers.deleteEnergyRecord,
);

export const energyRoutes = router;
