export const invoiceSearchableFields = ['invoiceNumber', 'currency', 'status'];

export const invoiceFilterableFields = ['status', 'currency', 'subscriptionId'];

export const invoiceSortableFields = [
    'invoiceNumber',
    'amount',
    'issuedAt',
    'dueAt',
    'paidAt',
    'createdAt',
    'updatedAt',
];

export const invoiceDefaultSort = 'createdAt';
