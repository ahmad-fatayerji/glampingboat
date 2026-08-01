import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import {
    getReservationPaidStatus,
    markCheckoutSessionPaid,
} from "@/lib/stripe-payments";
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
    await markCheckoutSessionPaid({
        session,
        stripeEventId: event.id,
    });
}

async function processCheckoutExpired(event: Stripe.Event) {
    const session = event.data.object as Stripe.Checkout.Session;
    const payment = await prisma.bookingPayment.findFirst({
        where: { stripeCheckoutSessionId: session.id },
        include: {
            reservation: true,
        },
    });

    if (!payment || payment.status === "PAID") {
        return;
    }

    const reservationPaymentStatus = getReservationPaidStatus(
        payment.reservation.paidAmountCents,
        payment.reservation.totalAmountTtcCents
    );

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

        // PENDING_PAYMENT counts as an active reservation for availability, so
        // an abandoned checkout would hold the dates forever. Release them if
        // nothing was ever received; a part-paid stay stays booked.
        const releaseDates =
            payment.reservation.status === "PENDING_PAYMENT" &&
            payment.reservation.paidAmountCents === 0;

        await tx.reservation.update({
            where: { id: payment.reservationId },
            data: {
                paymentStatus: reservationPaymentStatus,
                ...(releaseDates ? { status: "EXPIRED" } : {}),
            },
        });

        await tx.reservationEvent.create({
            data: {
                reservationId: payment.reservationId,
                type: "EXPIRED",
                fromStatus: payment.reservation.status,
                ...(releaseDates ? { toStatus: "EXPIRED" as const } : {}),
                metadata: {
                    stripeEventId: event.id,
                    stripeCheckoutSessionId: session.id,
                    paymentId: payment.id,
                    datesReleased: releaseDates,
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
        include: {
            reservation: true,
        },
    });

    if (!payment || payment.status === "PAID") {
        return;
    }

    const reservationPaymentStatus =
        payment.reservation.paidAmountCents > 0
            ? getReservationPaidStatus(
                payment.reservation.paidAmountCents,
                payment.reservation.totalAmountTtcCents
            )
            : "PAYMENT_FAILED";

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
                paymentStatus: reservationPaymentStatus,
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

/**
 * Refunds issued straight from the Stripe Dashboard never touch our refund
 * endpoint, so without this the app would keep showing the stay as paid.
 */
async function processChargeRefunded(event: Stripe.Event) {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId =
        typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id ?? null;

    if (!paymentIntentId) {
        return;
    }

    const payment = await prisma.bookingPayment.findFirst({
        where: { stripePaymentIntentId: paymentIntentId },
        include: { reservation: true },
    });

    if (!payment) {
        return;
    }

    // Stripe reports the cumulative refunded total on the charge, so this stays
    // correct whether the refund came from us or from the Dashboard.
    const refundedOnPayment = Math.min(charge.amount_refunded, payment.amountCents);
    const otherPaymentsRefunded = await prisma.bookingPayment.aggregate({
        where: {
            reservationId: payment.reservationId,
            id: { not: payment.id },
        },
        _sum: { refundedAmountCents: true },
    });
    const reservationRefunded =
        (otherPaymentsRefunded._sum.refundedAmountCents ?? 0) + refundedOnPayment;

    const retained = Math.max(
        0,
        payment.reservation.paidAmountCents - reservationRefunded
    );

    await prisma.$transaction(async (tx) => {
        await tx.bookingPayment.update({
            where: { id: payment.id },
            data: {
                refundedAmountCents: refundedOnPayment,
                refundedAt: new Date(),
                status:
                    refundedOnPayment >= payment.amountCents ? "REFUNDED" : "PAID",
                stripePayload: {
                    eventId: event.id,
                    chargeId: charge.id,
                    amountRefunded: charge.amount_refunded,
                },
            },
        });

        await tx.reservation.update({
            where: { id: payment.reservationId },
            data: {
                refundedAmountCents: reservationRefunded,
                paymentStatus: retained <= 0 ? "REFUNDED" : "REFUND_PENDING",
            },
        });

        await tx.reservationEvent.create({
            data: {
                reservationId: payment.reservationId,
                type: "REFUNDED",
                metadata: {
                    source: "webhook",
                    stripeEventId: event.id,
                    chargeId: charge.id,
                    paymentId: payment.id,
                    refundedOnPaymentCents: refundedOnPayment,
                    reservationRefundedCents: reservationRefunded,
                },
            },
        });
    });
}

/**
 * A dispute is money leaving the account on someone else's initiative. Nothing
 * is decided automatically here; it is recorded so the owner sees it.
 */
async function processDisputeCreated(event: Stripe.Event) {
    const dispute = event.data.object as Stripe.Dispute;
    const paymentIntentId =
        typeof dispute.payment_intent === "string"
            ? dispute.payment_intent
            : dispute.payment_intent?.id ?? null;

    if (!paymentIntentId) {
        return;
    }

    const payment = await prisma.bookingPayment.findFirst({
        where: { stripePaymentIntentId: paymentIntentId },
        select: { id: true, reservationId: true },
    });

    if (!payment) {
        return;
    }

    await prisma.reservationEvent.create({
        data: {
            reservationId: payment.reservationId,
            type: "ADMIN_NOTE",
            metadata: {
                source: "webhook",
                kind: "stripe_dispute",
                stripeEventId: event.id,
                disputeId: dispute.id,
                paymentId: payment.id,
                amountCents: dispute.amount,
                reason: dispute.reason,
                dueBy: dispute.evidence_details?.due_by ?? null,
            },
        },
    });
}

async function handleEvent(event: Stripe.Event) {
    switch (event.type) {
        case "checkout.session.completed":
            await processCheckoutCompleted(event);
            break;
        case "checkout.session.async_payment_succeeded":
            await processCheckoutCompleted(event);
            break;
        case "checkout.session.expired":
            await processCheckoutExpired(event);
            break;
        case "payment_intent.payment_failed":
            await processPaymentFailed(event);
            break;
        case "charge.refunded":
            await processChargeRefunded(event);
            break;
        case "charge.dispute.created":
            await processDisputeCreated(event);
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
            // The row already exists, but that alone does not mean the event was
            // handled: a previous attempt may have stored it and then failed
            // during processing. Only a non-null processedAt proves completion.
            // Short-circuiting on row existence would strand every event whose
            // first attempt errored, since Stripe's retries all land here.
            const stored = await prisma.stripeWebhookEvent.findUnique({
                where: { stripeEventId: event.id },
                select: { processedAt: true },
            });

            if (stored?.processedAt) {
                return NextResponse.json({ received: true, duplicate: true });
            }
            // Otherwise fall through and retry the handler.
        } else {
            return NextResponse.json({ error: "Failed to store webhook event" }, { status: 500 });
        }
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
