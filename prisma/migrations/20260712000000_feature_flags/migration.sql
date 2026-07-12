CREATE TABLE "FeatureFlag" (
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "updatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "FeatureFlag_enabled_idx" ON "FeatureFlag"("enabled");

INSERT INTO "FeatureFlag" ("key", "enabled", "description")
VALUES ('bookingEnabled', true, 'Allow customers to create new bookings')
ON CONFLICT ("key") DO NOTHING;
