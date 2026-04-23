import { NextRequest, NextResponse } from "next/server";
import { auth } from "@auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/http";
import { getStripeServerClient } from "@/lib/stripe";

interface CreateCheckoutSessionPayload {
    reservationId?: string;
}

const ELIGIBLE_PAYMENT_STATUSES = new Set(["PENDING", "CHECKOUT_OPEN"]);

export async function POST(req: NextRequest) {
    const authSession = await auth();

    if (!authSession?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: CreateCheckoutSessionPayload;

    try {
        body = (await req.json()) as CreateCheckoutSessionPayload;
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const reservationId = body.reservationId?.trim();
    if (!reservationId) {
        return NextResponse.json(
            { error: "reservationId is required" },
            { status: 400 }
        );
    }

    try {
        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: {
                payments: {
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!reservation || reservation.userId !== authSession.user.id) {
            return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
        }

        if (reservation.status !== "PENDING_PAYMENT") {
            return NextResponse.json(
                { error: "Reservation is not in a payable state" },
                { status: 409 }
            );
        }

        const expectedPurpose = reservation.payFullNow ? "FULL" : "DEPOSIT";
        const payment =
            reservation.payments.find(
                (entry) =>
                    entry.purpose === expectedPurpose &&
                    ELIGIBLE_PAYMENT_STATUSES.has(entry.status)
            ) ??
            reservation.payments.find((entry) => ELIGIBLE_PAYMENT_STATUSES.has(entry.status));

        if (!payment) {
            return NextResponse.json(
                { error: "No pending payment found for this reservation" },
                { status: 409 }
            );
        }

        if (
            payment.stripeCheckoutSessionId &&
            payment.checkoutUrl &&
            payment.status === "CHECKOUT_OPEN"
        ) {
            return NextResponse.json({
                sessionId: payment.stripeCheckoutSessionId,
                checkoutUrl: payment.checkoutUrl,
            });
        }

        const stripe = getStripeServerClient();
        const origin = process.env.NEXTAUTH_URL ?? req.nextUrl.origin;

        const successUrl = new URL("/account", origin);
        successUrl.searchParams.set("checkout", "success");
        successUrl.searchParams.set("reservation", reservation.id);

        const cancelUrl = new URL("/account", origin);
        cancelUrl.searchParams.set("checkout", "canceled");
        cancelUrl.searchParams.set("reservation", reservation.id);

        const checkoutSession = await stripe.checkout.sessions.create(
            {
                mode: "payment",
                success_url: successUrl.toString(),
                cancel_url: cancelUrl.toString(),
                client_reference_id: reservation.bookingRef ?? reservation.id,
                customer_email: reservation.customerEmail ?? undefined,
                payment_method_types: ["card"],
                line_items: [
                    {
                        quantity: 1,
                        price_data: {
                            currency: payment.currency.toLowerCase(),
                            unit_amount: payment.amountCents,
                            product_data: {
                                name:
                                    payment.purpose === "FULL"
                                        ? "Glamping Boat booking (full payment)"
                                        : "Glamping Boat booking (deposit)",
                                description: reservation.bookingRef
                                    ? `Booking ${reservation.bookingRef}`
                                    : `Reservation ${reservation.id}`,
                            },
                        },
                    },
                ],
                metadata: {
                    reservationId: reservation.id,
                    paymentId: payment.id,
                    bookingRef: reservation.bookingRef ?? "",
                    purpose: payment.purpose,
                },
                payment_intent_data: {
                    metadata: {
                        reservationId: reservation.id,
                        paymentId: payment.id,
                        bookingRef: reservation.bookingRef ?? "",
                        purpose: payment.purpose,
                    },
                },
            },
            payment.idempotencyKey
                ? { idempotencyKey: payment.idempotencyKey }
                : undefined
        );

        const paymentIntentId =
            typeof checkoutSession.payment_intent === "string"
                ? checkoutSession.payment_intent
                : checkoutSession.payment_intent?.id ?? null;

        await prisma.$transaction(async (tx) => {
            await tx.bookingPayment.update({
                where: { id: payment.id },
                data: {
                    status: "CHECKOUT_OPEN",
                    stripeCheckoutSessionId: checkoutSession.id,
                    stripePaymentIntentId: paymentIntentId,
                    checkoutUrl: checkoutSession.url,
                    stripeStatus: checkoutSession.status,
                    stripePayload: {
                        checkoutStatus: checkoutSession.status,
                        paymentStatus: checkoutSession.payment_status,
                        amountTotal: checkoutSession.amount_total,
                    },
                    expiresAt: checkoutSession.expires_at
                        ? new Date(checkoutSession.expires_at * 1000)
                        : null,
                },
            });

            await tx.reservation.update({
                where: { id: reservation.id },
                data: {
                    paymentStatus: "CHECKOUT_OPEN",
                },
            });

            await tx.reservationEvent.create({
                data: {
                    reservationId: reservation.id,
                    actorUserId: authSession.user.id,
                    type: "PAYMENT_CREATED",
                    metadata: {
                        paymentId: payment.id,
                        stripeCheckoutSessionId: checkoutSession.id,
                        amountCents: payment.amountCents,
                        currency: payment.currency,
                    },
                },
            });
        });

        return NextResponse.json({
            sessionId: checkoutSession.id,
            checkoutUrl: checkoutSession.url,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: getErrorMessage(error, "Failed to create Stripe Checkout session") },
            { status: 500 }
        );
    }
}
