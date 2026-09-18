import AppError from '../../errors/AppError';
import { prisma } from '../../lib/prisma';
import httpStatus from 'http-status';
import { stripe } from '../../lib/stripe';
import Stripe from 'stripe';
import config from '../../config';

const createCheckoutSessionIntoDB = async (
    subscriptionId: string,
    userId: string,
) => {
    // =========================================================
    // 1. Find subscription
    // =========================================================

    const subscription = await prisma.subscription.findUnique({
        where: {
            id: subscriptionId,
        },
        include: {
            organization: true,
            plan: true,

            invoices: {
                where: {
                    status: 'ISSUED',
                },
                orderBy: {
                    issuedAt: 'desc',
                },
                take: 1,
            },
        },
    });

    if (!subscription) {
        throw new AppError(httpStatus.NOT_FOUND, 'Subscription not found');
    }

    // =========================================================
    // 2. Get latest unpaid invoice
    // =========================================================

    const invoice = subscription.invoices[0];

    if (!invoice) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'No unpaid invoice found for this subscription',
        );
    }

    // =========================================================
    // 3. Check existing payment
    // =========================================================

    const existingPayment = await prisma.payment.findFirst({
        where: {
            invoiceId: invoice.id,
            status: {
                in: ['PENDING', 'SUCCESS'],
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    // =========================================================
    // 4. Already paid
    // =========================================================

    if (existingPayment?.status === 'SUCCESS') {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'This invoice has already been paid',
        );
    }

    // =========================================================
    // 5. Get organization owner
    // =========================================================

    const owner = await prisma.user.findUnique({
        where: {
            id: subscription.organization.ownerId,
        },
        select: {
            id: true,
            email: true,
            name: true,
        },
    });

    if (!owner) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Organization owner not found',
        );
    }

    // =========================================================
    // 6. Create Stripe Customer
    // =========================================================

    const customer = await stripe.customers.create({
        email: owner.email,
        name: owner.name,
        metadata: {
            userId,
            organizationId: subscription.organizationId,
            subscriptionId: subscription.id,
        },
    });

    const stripeCustomerId = customer.id;

    // =========================================================
    // 7. Convert amount into smallest currency unit
    // =========================================================

    const amount = Math.round(Number(invoice.amount) * 100);

    if (amount <= 0) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Invoice amount must be greater than zero',
        );
    }

    // =========================================================
    // 8. Create Stripe Checkout Session
    // =========================================================

    const session = await stripe.checkout.sessions.create({
        mode: 'payment',

        customer: stripeCustomerId,

        payment_method_types: ['card'],

        line_items: [
            {
                price_data: {
                    currency: invoice.currency.toLowerCase(),

                    product_data: {
                        name: subscription.plan.name,

                        description:
                            subscription.plan.description ||
                            `ForgeIQ subscription for ${subscription.organization.name}`,
                    },

                    unit_amount: amount,
                },

                quantity: 1,
            },
        ],

        success_url:
            `${config.backend_url}/payment/success` +
            '?session_id={CHECKOUT_SESSION_ID}',

        cancel_url: `${config.backend_url}/payment/cancel`,

        metadata: {
            subscriptionId: subscription.id,
            invoiceId: invoice.id,
            organizationId: subscription.organizationId,
            userId,
            stripeCustomerId,
        },
    });

    // =========================================================
    // 9. Make sure Stripe generated checkout URL
    // =========================================================

    if (!session.url) {
        throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Stripe checkout URL was not generated',
        );
    }

    // =========================================================
    // 10. Create Payment record
    // =========================================================

    const payment = await prisma.payment.create({
        data: {
            subscriptionId: subscription.id,
            invoiceId: invoice.id,
            userId,

            // Internal transaction reference
            transactionId: session.id,

            amount: invoice.amount,
            currency: invoice.currency,

            gateway: 'STRIPE',
            status: 'PENDING',

            // Stripe dedicated fields
            stripeSessionId: session.id,
            stripeCustomerId: stripeCustomerId,

            gatewayData: {
                mode: session.mode,
                paymentStatus: session.payment_status,
                customerEmail: owner.email,
            },
        },
    });

    // =========================================================
    // 11. Return checkout information
    // =========================================================

    return {
        paymentId: payment.id,

        transactionId: payment.transactionId,

        sessionId: session.id,

        checkoutUrl: session.url,
    };
};

const handleWebhookIntoDB = async (signature: string, rawBody: Buffer) => {
    let event: Stripe.Event;

    // =========================================================
    // 1. VERIFY STRIPE WEBHOOK SIGNATURE
    // =========================================================

    try {
        event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!,
        );
    } catch (error) {
        console.error('Stripe webhook signature error:', error);

        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Invalid Stripe webhook signature',
        );
    }

    // =========================================================
    // 2. HANDLE STRIPE EVENT
    // =========================================================

    switch (event.type) {
        // =======================================================
        // CHECKOUT SESSION COMPLETED
        // =======================================================

        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;

            console.log(`Stripe checkout completed: ${session.id}`);

            // =====================================================
            // 3. GET METADATA
            // =====================================================

            const subscriptionId = session.metadata?.subscriptionId;

            const invoiceId = session.metadata?.invoiceId;

            // =====================================================
            // 4. VALIDATE METADATA
            // =====================================================

            if (!subscriptionId || !invoiceId) {
                console.error(
                    'Missing subscriptionId or invoiceId in Stripe metadata',
                );

                break;
            }

            // =====================================================
            // 5. VERIFY PAYMENT STATUS
            // =====================================================

            if (session.payment_status !== 'paid') {
                console.log(
                    `Stripe payment is not completed. Status: ${session.payment_status}`,
                );

                break;
            }

            // =====================================================
            // 6. FIND PAYMENT
            // =====================================================

            const payment = await prisma.payment.findUnique({
                where: {
                    transactionId: session.id,
                },

                include: {
                    invoice: true,
                    subscription: true,
                },
            });

            if (!payment) {
                console.error(
                    `Payment not found for Stripe session: ${session.id}`,
                );

                break;
            }

            // =====================================================
            // 7. DUPLICATE WEBHOOK PROTECTION
            // =====================================================

            if (payment.status === 'SUCCESS') {
                console.log(`Payment ${payment.id} already processed`);

                break;
            }

            // =====================================================
            // 8. VERIFY INVOICE
            // =====================================================

            if (payment.invoiceId !== invoiceId) {
                console.error(`Invoice mismatch for payment ${payment.id}`);

                break;
            }

            // =====================================================
            // 9. VERIFY SUBSCRIPTION
            // =====================================================

            if (payment.subscriptionId !== subscriptionId) {
                console.error(
                    `Subscription mismatch for payment ${payment.id}`,
                );

                break;
            }

            // =====================================================
            // 10. STRIPE PAYMENT INTENT
            // =====================================================

            const paymentIntentId =
                typeof session.payment_intent === 'string'
                    ? session.payment_intent
                    : null;

            let stripePaymentId: string | null = null;

            if (paymentIntentId) {
                try {
                    const charges = await stripe.charges.list({
                        payment_intent: paymentIntentId,
                        limit: 1,
                    });

                    stripePaymentId = charges.data[0]?.id ?? null;
                } catch (error) {
                    console.error('Unable to retrieve Stripe Charge:', error);
                }
            }
            // =====================================================
            // 11. STRIPE CUSTOMER
            // =====================================================

            const stripeCustomerId =
                typeof session.customer === 'string' ? session.customer : null;

            // =====================================================
            // 12. OPTIONAL PAYMENT INTENT VERIFICATION
            // =====================================================

            let paymentIntent: Stripe.PaymentIntent | null = null;

            if (paymentIntentId) {
                try {
                    paymentIntent =
                        await stripe.paymentIntents.retrieve(paymentIntentId);
                } catch (error) {
                    console.error(
                        'Unable to retrieve Stripe PaymentIntent:',
                        error,
                    );
                }
            }

            // =====================================================
            // 13. VERIFY PAYMENT INTENT STATUS
            // =====================================================

            if (paymentIntent && paymentIntent.status !== 'succeeded') {
                console.log(
                    `Stripe PaymentIntent is not succeeded. Status: ${paymentIntent.status}`,
                );

                break;
            }

            // =====================================================
            // 14. PREPARE GATEWAY DATA
            // =====================================================

            const gatewayData = {
                checkoutSessionId: session.id,

                paymentIntentId,

                stripeCustomerId,

                paymentStatus: session.payment_status,

                paymentIntentStatus: paymentIntent?.status ?? null,

                customerEmail: session.customer_details?.email ?? null,

                customerName: session.customer_details?.name ?? null,

                paymentMethod: session.payment_method_types?.[0] ?? null,

                mode: session.mode,

                amountTotal: session.amount_total ?? null,

                currency: session.currency ?? null,

                verifiedAt: new Date().toISOString(),
            };

            // =====================================================
            // 15. PROCESS EVERYTHING ATOMICALLY
            // =====================================================

            await prisma.$transaction(async (tx) => {
                // ===================================================
                // PAYMENT → SUCCESS
                // ===================================================

                await tx.payment.update({
                    where: {
                        id: payment.id,
                    },

                    data: {
                        status: 'SUCCESS',

                        // Stripe fields
                        stripeSessionId: session.id,

                        stripePaymentIntentId: paymentIntentId,

                        stripeCustomerId: stripeCustomerId,
                        stripePaymentId,

                        gatewayData,
                    },
                });

                // ===================================================
                // INVOICE → PAID
                // ===================================================

                await tx.invoice.update({
                    where: {
                        id: invoiceId,
                    },

                    data: {
                        status: 'PAID',

                        paidAt: new Date(),
                    },
                });

                // ===================================================
                // SUBSCRIPTION → ACTIVE
                // ===================================================

                await tx.subscription.update({
                    where: {
                        id: subscriptionId,
                    },

                    data: {
                        status: 'ACTIVE',
                    },
                });
            });

            console.log(
                `Payment successfully verified and processed: ${payment.id}`,
            );

            break;
        }

        // =======================================================
        // CHECKOUT SESSION EXPIRED
        // =======================================================

        case 'checkout.session.expired': {
            const session = event.data.object as Stripe.Checkout.Session;

            console.log(`Stripe checkout session expired: ${session.id}`);

            const payment = await prisma.payment.findUnique({
                where: {
                    transactionId: session.id,
                },
            });

            if (!payment) {
                console.log(
                    `No payment found for expired session: ${session.id}`,
                );

                break;
            }

            // Only cancel pending payment
            if (payment.status !== 'PENDING') {
                break;
            }

            await prisma.payment.update({
                where: {
                    id: payment.id,
                },

                data: {
                    status: 'CANCELED',

                    gatewayData: {
                        checkoutSessionId: session.id,
                        paymentStatus: session.payment_status,
                        expiredAt: new Date().toISOString(),
                    },
                },
            });

            console.log(
                `Payment canceled because Checkout Session expired: ${payment.id}`,
            );

            break;
        }

        // =======================================================
        // PAYMENT INTENT SUCCEEDED
        // =======================================================

        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;

            console.log(`Stripe PaymentIntent succeeded: ${paymentIntent.id}`);

            // Find payment using PaymentIntent ID
            const payment = await prisma.payment.findFirst({
                where: {
                    stripePaymentIntentId: paymentIntent.id,
                },
            });

            // Payment may not exist yet.
            // checkout.session.completed will handle it.
            if (!payment) {
                console.log(
                    `No local payment found for PaymentIntent: ${paymentIntent.id}`,
                );

                break;
            }

            // Already processed
            if (payment.status === 'SUCCESS') {
                break;
            }

            await prisma.payment.update({
                where: {
                    id: payment.id,
                },

                data: {
                    status: 'SUCCESS',

                    stripePaymentIntentId: paymentIntent.id,

                    stripeCustomerId:
                        typeof paymentIntent.customer === 'string'
                            ? paymentIntent.customer
                            : payment.stripeCustomerId,

                    gatewayData: {
                        paymentIntentId: paymentIntent.id,

                        paymentIntentStatus: paymentIntent.status,

                        amount: paymentIntent.amount,

                        currency: paymentIntent.currency,

                        verifiedAt: new Date().toISOString(),
                    },
                },
            });

            break;
        }

        // =======================================================
        // PAYMENT INTENT PAYMENT FAILED
        // =======================================================

        case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;

            console.log(`Stripe PaymentIntent failed: ${paymentIntent.id}`);

            const payment = await prisma.payment.findFirst({
                where: {
                    stripePaymentIntentId: paymentIntent.id,
                },
            });

            if (!payment) {
                break;
            }

            if (payment.status === 'SUCCESS') {
                break;
            }

            await prisma.payment.update({
                where: {
                    id: payment.id,
                },

                data: {
                    status: 'FAILED',

                    gatewayData: {
                        paymentIntentId: paymentIntent.id,

                        paymentIntentStatus: paymentIntent.status,

                        failureMessage:
                            paymentIntent.last_payment_error?.message ?? null,

                        failureCode:
                            paymentIntent.last_payment_error?.code ?? null,

                        failedAt: new Date().toISOString(),
                    },
                },
            });

            break;
        }

        // =======================================================
        // CHARGE SUCCEEDED
        // =======================================================

        case 'charge.succeeded': {
            const charge = event.data.object as Stripe.Charge;

            console.log(`Stripe charge succeeded: ${charge.id}`);

            const paymentIntentId =
                typeof charge.payment_intent === 'string'
                    ? charge.payment_intent
                    : null;

            if (!paymentIntentId) {
                break;
            }

            const payment = await prisma.payment.findFirst({
                where: {
                    stripePaymentIntentId: paymentIntentId,
                },
            });

            if (!payment) {
                break;
            }

            await prisma.payment.update({
                where: {
                    id: payment.id,
                },

                data: {
                    stripePaymentId: charge.id,

                    gatewayData: {
                        chargeId: charge.id,
                        paymentIntentId,
                        amount: charge.amount,
                        currency: charge.currency,
                        paid: charge.paid,
                        status: charge.status,
                    },
                },
            });

            break;
        }

        // =======================================================
        // CHARGE FAILED
        // =======================================================

        case 'charge.failed': {
            const charge = event.data.object as Stripe.Charge;

            console.log(`Stripe charge failed: ${charge.id}`);

            const paymentIntentId =
                typeof charge.payment_intent === 'string'
                    ? charge.payment_intent
                    : null;

            if (!paymentIntentId) {
                break;
            }

            const payment = await prisma.payment.findFirst({
                where: {
                    stripePaymentIntentId: paymentIntentId,
                },
            });

            if (!payment) {
                break;
            }

            if (payment.status === 'SUCCESS') {
                break;
            }

            await prisma.payment.update({
                where: {
                    id: payment.id,
                },

                data: {
                    status: 'FAILED',

                    stripePaymentId: charge.id,

                    gatewayData: {
                        chargeId: charge.id,
                        paymentIntentId,
                        amount: charge.amount,
                        currency: charge.currency,
                        paid: charge.paid,
                        status: charge.status,
                        failureMessage: charge.failure_message ?? null,
                    },
                },
            });

            break;
        }

        // =======================================================
        // DEFAULT
        // =======================================================

        default: {
            console.log(`Unhandled Stripe event: ${event.type}`);

            break;
        }
    }

    // =========================================================
    // RESPONSE
    // =========================================================

    return {
        received: true,
    };
};

const getMyPaymentHistoryIntoDB = async (userId: string) => {
    const payments = await prisma.payment.findMany({
        where: {
            userId,
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
            userId,
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
