import AppError from '../../errors/AppError';
import { prisma } from '../../lib/prisma';
import httpStatus from 'http-status';
import { stripe } from '../../lib/stripe';
import Stripe from 'stripe';

const createCheckoutSessionIntoDB = async (
    subscriptionId: string,
    userId: string,
) => {
    const subscription = await prisma.subscription.findUnique({
        where: {
            id: subscriptionId,
        },
        include: {
            plan: true,
            organization: true,
            invoices: {
                where: {
                    status: 'ISSUED',
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: 1,
            },
        },
    });

    if (!subscription) {
        throw new AppError(httpStatus.NOT_FOUND, 'Subscription not found');
    }

    if (subscription.organization.ownerId !== userId) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'You are not authorized to make this payment',
        );
    }

    const invoice = subscription.invoices[0];

    if (!invoice) {
        throw new AppError(httpStatus.NOT_FOUND, 'No unpaid invoice found');
    }

    const existingPayment = await prisma.payment.findFirst({
        where: {
            invoiceId: invoice.id,
            status: {
                in: ['PENDING', 'CANCELED'],
            },
        },
    });

    if (existingPayment) {
        if (existingPayment.status === 'SUCCESS') {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'This invoice has already been paid',
            );
        }

        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Payment session already exists',
        );
    }

    /**
     * Stripe smallest currency unit
     *
     * Example:
     * 1000 BDT = 100000 paisa
     */
    const amountInSmallestUnit = Math.round(Number(invoice.amount) * 100);

    const session = await stripe.checkout.sessions.create({
        mode: 'payment',

        payment_method_types: ['card'],

        line_items: [
            {
                price_data: {
                    currency: invoice.currency.toLowerCase(),

                    product_data: {
                        name: subscription.plan.name,
                        description: `ForgeIQ ${subscription.plan.name} subscription`,
                    },

                    unit_amount: amountInSmallestUnit,
                },

                quantity: 1,
            },
        ],

        metadata: {
            subscriptionId: subscription.id,
            invoiceId: invoice.id,
            organizationId: subscription.organizationId,
        },

        success_url: `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,

        cancel_url: process.env.STRIPE_CANCEL_URL,
    });

    if (!session.url) {
        throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to create Stripe checkout URL',
        );
    }

    const payment = await prisma.payment.create({
        data: {
            subscriptionId: subscription.id,
            invoiceId: invoice.id,

            transactionId: session.id,

            amount: invoice.amount,

            currency: invoice.currency,

            gateway: 'STRIPE',

            status: 'PENDING',

            gatewayData: {
                checkoutSessionId: session.id,
                paymentStatus: session.payment_status,
                mode: session.mode,
            },
        },
    });

    return {
        paymentId: payment.id,
        transactionId: payment.transactionId,
        sessionId: session.id,
        checkoutUrl: session.url,
    };
};

const handleWebhookIntoDB = async (signature: string, rawBody: Buffer) => {
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!,
        );
    } catch {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Invalid Stripe webhook signature',
        );
    }

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;

            const subscriptionId = session.metadata?.subscriptionId;

            const invoiceId = session.metadata?.invoiceId;

            if (!subscriptionId || !invoiceId) {
                break;
            }

            const payment = await prisma.payment.findUnique({
                where: {
                    transactionId: session.id,
                },
            });

            if (!payment) {
                break;
            }

            if (payment.status === 'SUCCESS') {
                break;
            }

            await prisma.$transaction(async (tx) => {
                await tx.payment.update({
                    where: {
                        id: payment.id,
                    },

                    data: {
                        status: 'SUCCESS',

                        gatewayData: {
                            checkoutSessionId: session.id,

                            paymentIntentId:
                                typeof session.payment_intent === 'string'
                                    ? session.payment_intent
                                    : null,

                            paymentStatus: session.payment_status,

                            customerEmail:
                                session.customer_details?.email ?? null,
                        },
                    },
                });

                await tx.invoice.update({
                    where: {
                        id: invoiceId,
                    },

                    data: {
                        status: 'PAID',
                        paidAt: new Date(),
                    },
                });

                await tx.subscription.update({
                    where: {
                        id: subscriptionId,
                    },

                    data: {
                        status: 'ACTIVE',
                    },
                });
            });

            break;
        }

        case 'checkout.session.expired': {
            const session = event.data.object as Stripe.Checkout.Session;

            await prisma.payment.updateMany({
                where: {
                    transactionId: session.id,
                    status: 'PENDING',
                },

                data: {
                    status: 'CANCELED',
                },
            });

            break;
        }

        default:
            break;
    }

    return {
        received: true,
    };
};

const getMyPaymentHistoryIntoDB = async (userId: string) => {
    const payments = await prisma.payment.findMany({
        where: {
            subscription: {
                organization: {
                    ownerId: userId,
                },
            },
        },

        include: {
            subscription: {
                include: {
                    plan: true,
                    organization: true,
                },
            },

            invoice: true,
        },

        orderBy: {
            createdAt: 'desc',
        },
    });

    return payments;
};

const getSinglePaymentDataIntoDB = async (
    paymentId: string,
    userId: string,
) => {
    const payment = await prisma.payment.findFirst({
        where: {
            id: paymentId,

            subscription: {
                organization: {
                    ownerId: userId,
                },
            },
        },

        include: {
            subscription: {
                include: {
                    plan: true,
                    organization: true,
                },
            },

            invoice: true,
        },
    });

    if (!payment) {
        throw new AppError(httpStatus.NOT_FOUND, 'Payment not found');
    }

    return payment;
};

export const paymentServices = {
    createCheckoutSessionIntoDB,
    handleWebhookIntoDB,
    getMyPaymentHistoryIntoDB,
    getSinglePaymentDataIntoDB,
};
