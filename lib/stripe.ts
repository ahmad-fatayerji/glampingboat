import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function requireEnv(name: "STRIPE_SECRET_KEY" | "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY") {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} is not configured`);
    }

    return value;
}

export function getStripeServerClient() {
    if (!stripeClient) {
        stripeClient = new Stripe(requireEnv("STRIPE_SECRET_KEY"));
    }

    return stripeClient;
}

export function getStripePublishableKey() {
    return requireEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
}
