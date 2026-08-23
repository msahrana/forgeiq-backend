import { InvoiceStatus, Prisma } from '../../../generated/prisma/client';
import { prisma } from '../../lib/prisma';
import { generateInvoiceNumber } from './generateInvoiceNumber';
import {
    ICreateInvoice,
    IInvoiceFilterRequest,
    IUpdateInvoice,
} from './invoice.interface';

const createInvoiceIntoDB = async (payload: ICreateInvoice) => {
    const subscription = await prisma.subscription.findUnique({
        where: {
            id: payload.subscriptionId,
        },
    });

    if (!subscription) {
        throw new Error('Subscription not found');
    }

    if (subscription.status !== 'ACTIVE') {
        throw new Error(
            'Invoice can only be created for an active subscription',
        );
    }

    const invoiceNumber = await generateInvoiceNumber();

    const amount = new Prisma.Decimal(payload.amount);

    const invoice = await prisma.invoice.create({
        data: {
            invoiceNumber,
            subscriptionId: payload.subscriptionId,
            amount,
            currency: payload.currency ?? 'BDT',
            issuedAt: payload.issuedAt ?? new Date(),
            dueAt: payload.dueAt,
            status: payload.status ?? InvoiceStatus.ISSUED,
        },
        include: {
            subscription: true,
        },
    });

    return invoice;
};

const getAllInvoicesFromDB = async (filters: IInvoiceFilterRequest) => {
    const {
        searchTerm,
        status,
        currency,
        subscriptionId,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
    } = filters;

    const skip = (page - 1) * limit;

    const andConditions: Prisma.InvoiceWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: [
                {
                    invoiceNumber: {
                        contains: searchTerm,
                        mode: 'insensitive',
                    },
                },
                {
                    currency: {
                        contains: searchTerm,
                        mode: 'insensitive',
                    },
                },
            ],
        });
    }

    if (status) {
        andConditions.push({
            status,
        });
    }

    if (currency) {
        andConditions.push({
            currency,
        });
    }

    if (subscriptionId) {
        andConditions.push({
            subscriptionId,
        });
    }

    const whereConditions: Prisma.InvoiceWhereInput =
        andConditions.length > 0
            ? {
                  AND: andConditions,
              }
            : {};

    const [data, total] = await Promise.all([
        prisma.invoice.findMany({
            where: whereConditions,
            skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder,
            },
            include: {
                subscription: true,
            },
        }),

        prisma.invoice.count({
            where: whereConditions,
        }),
    ]);

    return {
        meta: {
            page,
            limit,
            total,
            totalPage: Math.ceil(total / limit),
        },
        data,
    };
};

const getInvoiceByIdFromDB = async (id: string) => {
    const invoice = await prisma.invoice.findUnique({
        where: {
            id,
        },
        include: {
            subscription: true,
            payments: true,
        },
    });

    if (!invoice) {
        throw new Error('Invoice not found');
    }

    return invoice;
};

const updateInvoiceIntoDB = async (id: string, payload: IUpdateInvoice) => {
    const existingInvoice = await prisma.invoice.findUnique({
        where: {
            id,
        },
    });

    if (!existingInvoice) {
        throw new Error('Invoice not found');
    }

    if (
        existingInvoice.status === InvoiceStatus.PAID ||
        existingInvoice.status === InvoiceStatus.REFUNDED
    ) {
        throw new Error('Paid or refunded invoice cannot be updated');
    }

    const updateData: Prisma.InvoiceUpdateInput = {};

    if (payload.amount !== undefined) {
        updateData.amount = new Prisma.Decimal(payload.amount);
    }

    if (payload.currency !== undefined) {
        updateData.currency = payload.currency;
    }

    if (payload.dueAt !== undefined) {
        updateData.dueAt = payload.dueAt;
    }

    if (payload.paidAt !== undefined) {
        updateData.paidAt = payload.paidAt;
    }

    if (payload.status !== undefined) {
        updateData.status = payload.status;
    }

    const invoice = await prisma.invoice.update({
        where: {
            id,
        },
        data: updateData,
        include: {
            subscription: true,
            payments: true,
        },
    });

    return invoice;
};

const updateInvoiceStatusIntoDB = async (id: string, status: InvoiceStatus) => {
    const invoice = await prisma.invoice.findUnique({
        where: {
            id,
        },
    });

    if (!invoice) {
        throw new Error('Invoice not found');
    }

    if (invoice.status === InvoiceStatus.REFUNDED) {
        throw new Error('Refunded invoice status cannot be changed');
    }

    const invoiceUpdateData: Prisma.InvoiceUpdateInput = {
        status,
    };

    if (status === InvoiceStatus.PAID) {
        invoiceUpdateData.paidAt = new Date();
    }

    const updatedInvoice = await prisma.invoice.update({
        where: {
            id,
        },
        data: invoiceUpdateData,
    });

    return updatedInvoice;
};

const deleteInvoiceFromDB = async (id: string) => {
    const invoice = await prisma.invoice.findUnique({
        where: {
            id,
        },
    });

    if (!invoice) {
        throw new Error('Invoice not found');
    }

    if (
        invoice.status === InvoiceStatus.PAID ||
        invoice.status === InvoiceStatus.PARTIALLY_PAID
    ) {
        throw new Error('Paid or partially paid invoice cannot be deleted');
    }

    await prisma.invoice.delete({
        where: {
            id,
        },
    });

    return null;
};

export const invoiceServices = {
    createInvoiceIntoDB,
    getAllInvoicesFromDB,
    getInvoiceByIdFromDB,
    updateInvoiceIntoDB,
    updateInvoiceStatusIntoDB,
    deleteInvoiceFromDB,
};
