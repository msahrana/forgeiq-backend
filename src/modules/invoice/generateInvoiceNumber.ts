import { prisma } from '../../lib/prisma';

export const generateInvoiceNumber = async (): Promise<string> => {
    const year = new Date().getFullYear();

    const lastInvoice = await prisma.invoice.findFirst({
        where: {
            invoiceNumber: {
                startsWith: `INV-${year}-`,
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        select: {
            invoiceNumber: true,
        },
    });

    let sequence = 1;

    if (lastInvoice) {
        const lastSequence = Number(lastInvoice.invoiceNumber.split('-').pop());

        sequence = lastSequence + 1;
    }

    return `INV-${year}-${String(sequence).padStart(6, '0')}`;
};
