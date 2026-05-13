CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN', 'SUPER_ADMIN');

CREATE TYPE "AvailabilityBlockType" AS ENUM ('MAINTENANCE', 'OWNER_USE', 'CLEANING_BUFFER', 'PRIVATE_HOLD', 'OTHER');

ALTER TYPE "ReservationEventType" ADD VALUE 'ADMIN_UPDATED';
ALTER TYPE "ReservationEventType" ADD VALUE 'ADMIN_NOTE';
ALTER TYPE "ReservationEventType" ADD VALUE 'MANUAL_PAYMENT_RECORDED';
ALTER TYPE "ReservationEventType" ADD VALUE 'AVAILABILITY_BLOCK_CREATED';
ALTER TYPE "ReservationEventType" ADD VALUE 'AVAILABILITY_BLOCK_DELETED';

ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER';

CREATE TABLE "AvailabilityBlock" (
  "id" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "type" "AvailabilityBlockType" NOT NULL DEFAULT 'OTHER',
  "reason" TEXT NOT NULL,
  "note" TEXT,
  "actorUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AvailabilityBlock_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AvailabilityBlock_startDate_endDate_idx" ON "AvailabilityBlock"("startDate", "endDate");
CREATE INDEX "AvailabilityBlock_type_idx" ON "AvailabilityBlock"("type");

ALTER TABLE "AvailabilityBlock"
  ADD CONSTRAINT "AvailabilityBlock_actorUserId_fkey"
  FOREIGN KEY ("actorUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
