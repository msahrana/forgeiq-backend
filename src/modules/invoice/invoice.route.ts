import { Router } from 'express';
import { invoiceControllers } from './invoice.controller';
import { invoiceValidation } from './invoice.validation';
import { validateRequest } from '../../middleware/validateRequest';

const router = Router();

router.post(
    '/',
    validateRequest(invoiceValidation.createInvoiceValidationSchema),
    invoiceControllers.createInvoice,
);

router.get('/', invoiceControllers.getAllInvoices);

router.get('/:id', invoiceControllers.getInvoiceById);

router.put(
    '/:id',
    validateRequest(invoiceValidation.updateInvoiceValidationSchema),
    invoiceControllers.updateInvoice,
);

router.patch(
    '/:id/status',
    validateRequest(invoiceValidation.updateInvoiceStatusValidationSchema),
    invoiceControllers.updateInvoiceStatus,
);

router.delete('/:id', invoiceControllers.deleteInvoice);

export const invoiceRoutes = router;
