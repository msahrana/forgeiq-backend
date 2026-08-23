import { InvoiceStatus } from '../../../generated/prisma/enums';

export interface ICreateInvoice {
    subscriptionId: string;
    amount: number;
    currency?: string;
    issuedAt?: Date;
    dueAt?: Date;
    status?: InvoiceStatus;
}

export interface IUpdateInvoice {
    amount?: number;
    currency?: string;
    dueAt?: Date | null;
    paidAt?: Date | null;
    status?: InvoiceStatus;
}

export interface IInvoiceFilterRequest {
    searchTerm?: string;
    status?: InvoiceStatus;
    currency?: string;
    subscriptionId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
