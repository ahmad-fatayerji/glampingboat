-- Add explicit GTCR balance due date and admin-managed booking promos.
ALTER TABLE "Reservation"
  ADD COLUMN "balanceDueDate" TIMESTAMP(3);

UPDATE "Reservation"
SET "balanceDueDate" = "startDate" - INTERVAL '15 days'
WHERE "balanceDueDate" IS NULL;

CREATE INDEX "Reservation_balanceDueDate_idx" ON "Reservation"("balanceDueDate");

CREATE TABLE "BookingPromo" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "nightlyTtcCents" INTEGER NOT NULL DEFAULT 19500,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "actorUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BookingPromo_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BookingPromo_startDate_endDate_idx" ON "BookingPromo"("startDate", "endDate");
CREATE INDEX "BookingPromo_isActive_idx" ON "BookingPromo"("isActive");

ALTER TABLE "BookingPromo"
  ADD CONSTRAINT "BookingPromo_actorUserId_fkey"
  FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
