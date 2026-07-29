import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type MfaMode, type UserRole } from "../generated/prisma/client";
import { normalizeEmailAddress } from "../lib/email-identity";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? "",
  }),
});

const TEST_PASSWORD = "Test-password1!";

type TestAccount = {
  email: string;
  name: string;
  verified: boolean;
  role?: UserRole;
  mfaMode?: MfaMode;
  canonicalEmail?: string | null;
  hasPassword?: boolean;
};

const accounts: TestAccount[] = [
  {
    email: "verified.customer@example.com",
    name: "Verified Customer",
    verified: true,
  },
  {
    email: "unverified.customer@example.com",
    name: "Unverified Customer",
    verified: false,
  },
  {
    email: "mfa.customer@example.com",
    name: "Email MFA Customer",
    verified: true,
    mfaMode: "EMAIL",
  },
  {
    email: "admin@example.com",
    name: "Development Admin",
    verified: true,
    role: "ADMIN",
  },
  {
    email: "gmail.alias.customer@gmail.com",
    name: "Gmail Alias Customer",
    verified: true,
  },
  {
    email: "ahmad.fatayerji2004@gmail.com",
    name: "Ahmad Google Linking Test",
    verified: true,
    role: "SUPER_ADMIN",
  },
  {
    email: "linked.customer@example.com",
    name: "Linked Identity Customer",
    verified: true,
  },
  {
    email: "google.only@example.com",
    name: "Google Only Customer",
    verified: true,
    hasPassword: false,
  },
  // These two rows intentionally model a pre-migration Gmail collision.
  {
    email: "dev.collision@gmail.com",
    name: "Collision Dotted",
    verified: true,
    canonicalEmail: null,
  },
  {
    email: "devcollision@gmail.com",
    name: "Collision Dotless",
    verified: true,
    canonicalEmail: null,
  },
];

async function seedAccount(
  account: TestAccount,
  passwordHash: string
) {
  const normalized = normalizeEmailAddress(account.email);
  if (!normalized) {
    throw new Error(`Invalid seed email: ${account.email}`);
  }

  const user = await prisma.user.upsert({
    where: { email: normalized.email },
    update: {
      name: account.name,
      canonicalEmail:
        account.canonicalEmail === undefined
          ? normalized.canonicalEmail
          : account.canonicalEmail,
      emailVerifiedAt: account.verified ? new Date() : null,
      password: account.hasPassword === false ? null : passwordHash,
      role: account.role ?? "CUSTOMER",
      mfaMode: account.mfaMode ?? "DISABLED",
    },
    create: {
      email: normalized.email,
      canonicalEmail:
        account.canonicalEmail === undefined
          ? normalized.canonicalEmail
          : account.canonicalEmail,
      emailVerifiedAt: account.verified ? new Date() : null,
      password: account.hasPassword === false ? null : passwordHash,
      name: account.name,
      avatar: "",
      firstName: account.name.split(" ")[0],
      lastName: account.name.split(" ").slice(1).join(" "),
      phone: "+33 6 00 00 00 00",
      addressStreet: "1 Development Quay",
      addressCity: "Decazeville",
      role: account.role ?? "CUSTOMER",
      mfaMode: account.mfaMode ?? "DISABLED",
    },
  });

  return user;
}

async function seedReservation(userId: string) {
  const option = await prisma.option.upsert({
    where: { name: "Development bed linen" },
    update: {
      priceHt: 75,
      description: "Seeded option for account-security testing",
    },
    create: {
      name: "Development bed linen",
      priceHt: 75,
      description: "Seeded option for account-security testing",
    },
  });

  const startDate = new Date();
  startDate.setHours(12, 0, 0, 0);
  startDate.setDate(startDate.getDate() + 45);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 4);

  const reservation = await prisma.reservation.upsert({
    where: { bookingRef: "DEV-AUTH-001" },
    update: {
      userId,
      startDate,
      endDate,
      status: "CONFIRMED",
      paymentStatus: "PAID_DEPOSIT",
      customerEmail: "verified.customer@example.com",
    },
    create: {
      userId,
      bookingRef: "DEV-AUTH-001",
      status: "CONFIRMED",
      paymentStatus: "PAID_DEPOSIT",
      startDate,
      endDate,
      adults: 2,
      children: 0,
      basePriceHt: 960,
      optionsPriceHt: 75,
      subtotalHt: 1035,
      tvaHt: 207,
      taxSejourTtc: 6,
      totalTtc: 1248,
      depositAmount: 624,
      balanceAmount: 624,
      securityDeposit: 500,
      baseAmountHtCents: 96000,
      optionsAmountHtCents: 7500,
      subtotalAmountHtCents: 103500,
      vatAmountCents: 20700,
      touristTaxAmountCents: 600,
      totalAmountTtcCents: 124800,
      depositAmountCents: 62400,
      balanceAmountCents: 62400,
      securityDepositAmountCents: 50000,
      paidAmountCents: 62400,
      customerFirstName: "Verified",
      customerLastName: "Customer",
      customerEmail: "verified.customer@example.com",
      customerPhone: "+33 6 00 00 00 00",
      billingAddressStreet: "1 Development Quay",
      billingAddressCity: "Decazeville",
      locale: "en",
      termsAcceptedAt: new Date(),
      termsVersion: "development",
      privacyVersion: "development",
      items: {
        create: {
          optionId: option.id,
          quantity: 1,
          totalPriceHt: 75,
          totalPriceHtCents: 7500,
        },
      },
      payments: {
        create: {
          provider: "stripe",
          purpose: "DEPOSIT",
          status: "PAID",
          amountCents: 62400,
          currency: "EUR",
          idempotencyKey: "dev-auth-payment-001",
          stripeStatus: "paid_seed",
          paidAt: new Date(),
        },
      },
      events: {
        create: {
          actorUserId: userId,
          type: "PAYMENT_SUCCEEDED",
          toStatus: "CONFIRMED",
          metadata: { seeded: true },
        },
      },
    },
  });

  await prisma.reservationOption.upsert({
    where: {
      reservationId_optionId: {
        reservationId: reservation.id,
        optionId: option.id,
      },
    },
    update: {
      quantity: 1,
      totalPriceHt: 75,
      totalPriceHtCents: 7500,
    },
    create: {
      reservationId: reservation.id,
      optionId: option.id,
      quantity: 1,
      totalPriceHt: 75,
      totalPriceHtCents: 7500,
    },
  });
}

async function main() {
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 12);
  const seededUsers = new Map<string, Awaited<ReturnType<typeof seedAccount>>>();

  for (const account of accounts) {
    const user = await seedAccount(account, passwordHash);
    seededUsers.set(user.email, user);
  }

  const linkedUser = seededUsers.get("linked.customer@example.com")!;
  await prisma.authIdentity.upsert({
    where: {
      provider_providerSubject: {
        provider: "google",
        providerSubject: "dev-linked-google-subject",
      },
    },
    update: {
      userId: linkedUser.id,
      providerEmail: linkedUser.email,
    },
    create: {
      userId: linkedUser.id,
      provider: "google",
      providerSubject: "dev-linked-google-subject",
      providerEmail: linkedUser.email,
    },
  });

  const googleOnly = seededUsers.get("google.only@example.com")!;
  await prisma.authIdentity.upsert({
    where: {
      provider_providerSubject: {
        provider: "google",
        providerSubject: "dev-google-only-subject",
      },
    },
    update: {
      userId: googleOnly.id,
      providerEmail: googleOnly.email,
    },
    create: {
      userId: googleOnly.id,
      provider: "google",
      providerSubject: "dev-google-only-subject",
      providerEmail: googleOnly.email,
    },
  });

  await seedReservation(
    seededUsers.get("verified.customer@example.com")!.id
  );

  for (const [key, description] of [
    ["bookingEnabled", "Allow customers to create reservations"],
    ["stripeCheckoutEnabled", "Allow Stripe Checkout sessions"],
  ] as const) {
    await prisma.featureFlag.upsert({
      where: { key },
      update: { enabled: true, description },
      create: { key, enabled: true, description },
    });
  }

  const users = await prisma.user.findMany({
    orderBy: { email: "asc" },
    select: {
      email: true,
      emailVerifiedAt: true,
      role: true,
      mfaMode: true,
      password: true,
      canonicalEmail: true,
      _count: { select: { reservations: true, authIdentities: true } },
    },
  });

  console.table(
    users.map((user) => ({
      email: user.email,
      verified: Boolean(user.emailVerifiedAt),
      password: user.password ? TEST_PASSWORD : "(Google only)",
      role: user.role,
      mfa: user.mfaMode,
      canonical: user.canonicalEmail ?? "(collision pending)",
      reservations: user._count.reservations,
      googleIdentities: user._count.authIdentities,
    }))
  );
  console.log("Mailpit inbox: http://localhost:8025");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
