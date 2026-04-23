-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('DRAFT', 'PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'EXPIRED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ReservationPaymentStatus" AS ENUM ('UNPAID', 'CHECKOUT_OPEN', 'PAID_DEPOSIT', 'PAID_FULL', 'PAYMENT_FAILED', 'REFUND_PENDING', 'REFUNDED');

-- CreateEnum
CREATE TYPE "BookingPaymentPurpose" AS ENUM ('DEPOSIT', 'FULL', 'BALANCE', 'SECURITY_DEPOSIT');

-- CreateEnum
CREATE TYPE "BookingPaymentStatus" AS ENUM ('PENDING', 'CHECKOUT_OPEN', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED', 'REFUND_PENDING', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ReservationEventType" AS ENUM ('CREATED', 'UPDATED', 'PAYMENT_CREATED', 'PAYMENT_SUCCEEDED', 'PAYMENT_FAILED', 'CANCELLED', 'EXPIRED', 'REFUNDED');

-- AlterTable
ALTER TABLE "Reservation"
  ADD COLUMN "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
  ADD COLUMN "paymentStatus" "ReservationPaymentStatus" NOT NULL DEFAULT 'UNPAID',
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'EUR',
  ADD COLUMN "baseAmountHtCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "optionsAmountHtCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "subtotalAmountHtCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "vatAmountCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "touristTaxAmountCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "totalAmountTtcCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "depositAmountCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "balanceAmountCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "securityDepositAmountCents" INTEGER NOT NULL DEFAULT 50000,
  ADD COLUMN "paidAmountCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "customerFirstName" TEXT,
  ADD COLUMN "customerLastName" TEXT,
  ADD COLUMN "customerEmail" TEXT,
  ADD COLUMN "customerPhone" TEXT,
  ADD COLUMN "customerMobile" TEXT,
  ADD COLUMN "billingAddressNumber" TEXT,
  ADD COLUMN "billingAddressStreet" TEXT,
  ADD COLUMN "billingAddressCity" TEXT,
  ADD COLUMN "billingAddressState" TEXT,
  ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'en',
  ADD COLUMN "payFullNow" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "pricingVersion" TEXT NOT NULL DEFAULT '2026-datas-tarifs-reservation',
  ADD COLUMN "touristTaxVersion" TEXT NOT NULL DEFAULT '2026-decazeville-5pct-plus-dept10',
  ADD COLUMN "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
  ADD COLUMN "touristTaxCommunityRate" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
  ADD COLUMN "touristTaxDepartmentUplift" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
  ADD COLUMN "selectedOptionsSnapshot" JSONB,
  ADD COLUMN "pricingSnapshot" JSONB,
  ADD COLUMN "termsAcceptedAt" TIMESTAMP(3),
  ADD COLUMN "termsVersion" TEXT,
  ADD COLUMN "termsLocale" TEXT,
  ADD COLUMN "termsHash" TEXT,
  ADD COLUMN "privacyVersion" TEXT,
  ADD COLUMN "privacyHash" TEXT,
  ADD COLUMN "consentIpAddress" TEXT,
  ADD COLUMN "consentUserAgent" TEXT,
  ADD COLUMN "cancelledAt" TIMESTAMP(3),
  ADD COLUMN "cancellationReason" TEXT,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ReservationOption"
  ADD COLUMN "totalPriceHtCents" INTEGER NOT NULL DEFAULT 0;

-- Backfill cent columns from existing float money fields.
UPDATE "Reservation"
SET
  "baseAmountHtCents" = ROUND("basePriceHt" * 100)::integer,
  "optionsAmountHtCents" = ROUND("optionsPriceHt" * 100)::integer,
  "subtotalAmountHtCents" = ROUND("subtotalHt" * 100)::integer,
  "vatAmountCents" = ROUND("tvaHt" * 100)::integer,
  "touristTaxAmountCents" = ROUND("taxSejourTtc" * 100)::integer,
  "totalAmountTtcCents" = ROUND("totalTtc" * 100)::integer,
  "depositAmountCents" = ROUND("depositAmount" * 100)::integer,
  "balanceAmountCents" = ROUND("balanceAmount" * 100)::integer,
  "securityDepositAmountCents" = ROUND("securityDeposit" * 100)::integer;

UPDATE "ReservationOption"
SET "totalPriceHtCents" = ROUND("totalPriceHt" * 100)::integer;

-- CreateTable
CREATE TABLE "BookingPayment" (
  "id" TEXT NOT NULL,
  "reservationId" TEXT NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'stripe',
  "purpose" "BookingPaymentPurpose" NOT NULL,
  "status" "BookingPaymentStatus" NOT NULL DEFAULT 'PENDING',
  "amountCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'EUR',
  "stripeCheckoutSessionId" TEXT,
  "stripePaymentIntentId" TEXT,
  "stripeCustomerId" TEXT,
  "checkoutUrl" TEXT,
  "idempotencyKey" TEXT,
  "stripeStatus" TEXT,
  "stripePayload" JSONB,
  "expiresAt" TIMESTAMP(3),
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BookingPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeWebhookEvent" (
  "id" TEXT NOT NULL,
  "stripeEventId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "apiVersion" TEXT,
  "livemode" BOOLEAN NOT NULL DEFAULT false,
  "stripeCreatedAt" TIMESTAMP(3),
  "payload" JSONB NOT NULL,
  "processedAt" TIMESTAMP(3),
  "processingError" TEXT,
  "attemptCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "StripeWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationEvent" (
  "id" TEXT NOT NULL,
  "reservationId" TEXT NOT NULL,
  "actorUserId" TEXT,
  "type" "ReservationEventType" NOT NULL,
  "fromStatus" "ReservationStatus",
  "toStatus" "ReservationStatus",
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ReservationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppIdempotencyKey" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "operation" TEXT NOT NULL,
  "userId" TEXT,
  "reservationId" TEXT,
  "requestHash" TEXT,
  "response" JSONB,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AppIdempotencyKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reservation_userId_startDate_idx" ON "Reservation"("userId", "startDate");

-- CreateIndex
CREATE INDEX "Reservation_status_startDate_endDate_idx" ON "Reservation"("status", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "Reservation_paymentStatus_idx" ON "Reservation"("paymentStatus");

-- CreateIndex
CREATE UNIQUE INDEX "BookingPayment_stripeCheckoutSessionId_key" ON "BookingPayment"("stripeCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "BookingPayment_stripePaymentIntentId_key" ON "BookingPayment"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "BookingPayment_idempotencyKey_key" ON "BookingPayment"("idempotencyKey");

-- CreateIndex
CREATE INDEX "BookingPayment_reservationId_purpose_idx" ON "BookingPayment"("reservationId", "purpose");

-- CreateIndex
CREATE INDEX "BookingPayment_status_idx" ON "BookingPayment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "StripeWebhookEvent_stripeEventId_key" ON "StripeWebhookEvent"("stripeEventId");

-- CreateIndex
CREATE INDEX "StripeWebhookEvent_type_idx" ON "StripeWebhookEvent"("type");

-- CreateIndex
CREATE INDEX "StripeWebhookEvent_processedAt_idx" ON "StripeWebhookEvent"("processedAt");

-- CreateIndex
CREATE INDEX "ReservationEvent_reservationId_createdAt_idx" ON "ReservationEvent"("reservationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AppIdempotencyKey_key_key" ON "AppIdempotencyKey"("key");

-- CreateIndex
CREATE INDEX "AppIdempotencyKey_operation_idx" ON "AppIdempotencyKey"("operation");

-- CreateIndex
CREATE INDEX "AppIdempotencyKey_userId_idx" ON "AppIdempotencyKey"("userId");

-- AddForeignKey
ALTER TABLE "BookingPayment" ADD CONSTRAINT "BookingPayment_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationEvent" ADD CONSTRAINT "ReservationEvent_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppIdempotencyKey" ADD CONSTRAINT "AppIdempotencyKey_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
