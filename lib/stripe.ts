import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function requireEnv(name: "STRIPE_SECRET_KEY" | "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY") {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} is not configured`);
    }

    return value;
}

/**
 * Refunds hold the reservation row lock across the Stripe call to stop two
 * concurrent requests exceeding the refundable entitlement, so a hung request
 * must not pin that lock indefinitely. Keep the ceiling well under the Prisma
 * transaction timeout in refundReservation.
 */
const STRIPE_TIMEOUT_MS = 10_000;

export function getStripeServerClient() {
    if (!stripeClient) {
        stripeClient = new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
            timeout: STRIPE_TIMEOUT_MS,
            maxNetworkRetries: 1,
        });
    }

    return stripeClient;
}

export function getStripePublishableKey() {
    return requireEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
}
