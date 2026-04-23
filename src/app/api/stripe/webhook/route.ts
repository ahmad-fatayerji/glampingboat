import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripeServerClient } from "@/lib/stripe";

function getWebhookSecret() {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
        throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
    }

    return secret;
}

async function processCheckoutCompleted(event: Stripe.Event) {
    const session = event.data.object as Stripe.Checkout.Session;
    const checkoutSessionId = session.id;
    const paymentIntentId =
        typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null;
    const customerId =
        typeof session.customer === "string" ? session.customer : null;

    const payment = await prisma.bookingPayment.findFirst({
        where: { stripeCheckoutSessionId: checkoutSessionId },
        include: {
            reservation: true,
        },
    });

    if (!payment) {
        return;
    }

    const reservationPaymentStatus =
        payment.purpose === "FULL" ? "PAID_FULL" : "PAID_DEPOSIT";

    await prisma.$transaction(async (tx) => {
        await tx.bookingPayment.update({
            where: { id: payment.id },
            data: {
                status: "PAID",
                stripeStatus: session.status,
                stripePaymentIntentId: paymentIntentId,
                stripeCustomerId: customerId,
                stripePayload: {
                    eventId: event.id,
                    checkoutStatus: session.status,
                    paymentStatus: session.payment_status,
                    amountTotal: session.amount_total,
                },
                paidAt: new Date(),
            },
        });

        await tx.reservation.update({
            where: { id: payment.reservationId },
            data: {
                paymentStatus: reservationPaymentStatus,
                status: "CONFIRMED",
                paidAmountCents: {
                    increment: payment.amountCents,
                },
            },
        });

        await tx.reservationEvent.create({
            data: {
                reservationId: payment.reservationId,
                type: "PAYMENT_SUCCEEDED",
                metadata: {
                    stripeEventId: event.id,
                    stripeCheckoutSessionId: checkoutSessionId,
                    paymentId: payment.id,
                    amountCents: payment.amountCents,
                    currency: payment.currency,
                },
            },
        });
    });
}

async function processCheckoutExpired(event: Stripe.Event) {
    const session = event.data.object as Stripe.Checkout.Session;
    const payment = await prisma.bookingPayment.findFirst({
        where: { stripeCheckoutSessionId: session.id },
    });

    if (!payment) {
        return;
    }

    await prisma.$transaction(async (tx) => {
        await tx.bookingPayment.update({
            where: { id: payment.id },
            data: {
                status: "EXPIRED",
                stripeStatus: session.status,
                stripePayload: {
                    eventId: event.id,
                    checkoutStatus: session.status,
                    paymentStatus: session.payment_status,
                },
            },
        });

        await tx.reservation.update({
            where: { id: payment.reservationId },
            data: {
                paymentStatus: "UNPAID",
            },
        });

        await tx.reservationEvent.create({
            data: {
                reservationId: payment.reservationId,
                type: "EXPIRED",
                metadata: {
                    stripeEventId: event.id,
                    stripeCheckoutSessionId: session.id,
                    paymentId: payment.id,
                },
            },
        });
    });
}

async function processPaymentFailed(event: Stripe.Event) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const payment = await prisma.bookingPayment.findFirst({
        where: {
            stripePaymentIntentId: paymentIntent.id,
        },
    });

    if (!payment) {
        return;
    }

    await prisma.$transaction(async (tx) => {
        await tx.bookingPayment.update({
            where: { id: payment.id },
            data: {
                status: "FAILED",
                stripeStatus: paymentIntent.status,
                stripePayload: {
                    eventId: event.id,
                    paymentIntentStatus: paymentIntent.status,
                    lastPaymentError: paymentIntent.last_payment_error?.message ?? null,
                },
            },
        });

        await tx.reservation.update({
            where: { id: payment.reservationId },
            data: {
                paymentStatus: "PAYMENT_FAILED",
            },
        });

        await tx.reservationEvent.create({
            data: {
                reservationId: payment.reservationId,
                type: "PAYMENT_FAILED",
                metadata: {
                    stripeEventId: event.id,
                    paymentIntentId: paymentIntent.id,
                    paymentId: payment.id,
                },
            },
        });
    });
}

async function handleEvent(event: Stripe.Event) {
    switch (event.type) {
        case "checkout.session.completed":
            await processCheckoutCompleted(event);
            break;
        case "checkout.session.expired":
            await processCheckoutExpired(event);
            break;
        case "payment_intent.payment_failed":
            await processPaymentFailed(event);
            break;
        default:
            break;
    }
}

export async function POST(req: NextRequest) {
    const stripe = getStripeServerClient();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
        return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
    }

    const payload = await req.text();

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(payload, signature, getWebhookSecret());
    } catch (error) {
        const message = error instanceof Error ? error.message : "Invalid webhook";
        return NextResponse.json({ error: message }, { status: 400 });
    }

    try {
        await prisma.stripeWebhookEvent.create({
            data: {
                stripeEventId: event.id,
                type: event.type,
                apiVersion: event.api_version ?? undefined,
                livemode: event.livemode,
                stripeCreatedAt: event.created
                    ? new Date(event.created * 1000)
                    : undefined,
                payload: JSON.parse(payload),
            },
        });
    } catch (error) {
        if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "P2002"
        ) {
            return NextResponse.json({ received: true, duplicate: true });
        }

        return NextResponse.json({ error: "Failed to store webhook event" }, { status: 500 });
    }

    try {
        await handleEvent(event);

        await prisma.stripeWebhookEvent.update({
            where: { stripeEventId: event.id },
            data: { processedAt: new Date(), attemptCount: { increment: 1 } },
        });

        return NextResponse.json({ received: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Webhook processing failed";

        await prisma.stripeWebhookEvent.update({
            where: { stripeEventId: event.id },
            data: {
                processingError: message,
                attemptCount: { increment: 1 },
            },
        });

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
