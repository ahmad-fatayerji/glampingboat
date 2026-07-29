-- Add account-security primitives without automatically merging existing users.
CREATE TYPE "MfaMode" AS ENUM ('DISABLED', 'EMAIL');
CREATE TYPE "AuthChallengePurpose" AS ENUM (
  'VERIFY_EMAIL',
  'LOGIN_EMAIL_OTP',
  'RESET_PASSWORD',
  'LINK_GOOGLE_INTENT',
  'LINK_GOOGLE'
);
CREATE TYPE "AuthEventType" AS ENUM (
  'SIGNUP',
  'EMAIL_VERIFIED',
  'SIGN_IN',
  'SIGN_IN_FAILED',
  'LOGIN_CODE_SENT',
  'PASSWORD_RESET',
  'GOOGLE_LINKED',
  'GOOGLE_UNLINKED',
  'MFA_ENABLED',
  'MFA_DISABLED'
);

ALTER TABLE "User"
  ADD COLUMN "canonicalEmail" TEXT,
  ADD COLUMN "emailVerifiedAt" TIMESTAMP(3),
  ADD COLUMN "mfaMode" "MfaMode" NOT NULL DEFAULT 'DISABLED',
  ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;

-- Gmail consumer addresses are dot-insensitive. Plus tags are aliases and
-- googlemail.com is the same consumer mailbox namespace as gmail.com.
-- Other domains retain their exact lower-cased local part.
WITH canonicalized AS (
  SELECT
    "id",
    CASE
      WHEN split_part(lower(trim("email")), '@', 2) IN ('gmail.com', 'googlemail.com')
        THEN regexp_replace(
          split_part(split_part(lower(trim("email")), '@', 1), '+', 1),
          '\.',
          '',
          'g'
        ) || '@gmail.com'
      ELSE lower(trim("email"))
    END AS canonical
  FROM "User"
),
canonical_counts AS (
  SELECT canonical, count(*) AS occurrences
  FROM canonicalized
  GROUP BY canonical
)
UPDATE "User" AS users
SET "canonicalEmail" = canonicalized.canonical
FROM canonicalized
JOIN canonical_counts ON canonical_counts.canonical = canonicalized.canonical
WHERE users."id" = canonicalized."id"
  AND canonical_counts.occurrences = 1;

-- Collision groups deliberately remain NULL so deployment is safe. The audit
-- script reports them for a reviewed, transactional merge.
CREATE UNIQUE INDEX "User_canonicalEmail_key" ON "User"("canonicalEmail");

CREATE TABLE "AuthIdentity" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerSubject" TEXT NOT NULL,
  "providerEmail" TEXT,
  "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuthIdentity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuthChallenge" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "purpose" "AuthChallengePurpose" NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "codeHash" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "attemptCount" INTEGER NOT NULL DEFAULT 0,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuthChallenge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuthEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "type" "AuthEventType" NOT NULL,
  "provider" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuthEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AuthIdentity_provider_providerSubject_key"
  ON "AuthIdentity"("provider", "providerSubject");
CREATE INDEX "AuthIdentity_userId_idx" ON "AuthIdentity"("userId");
CREATE UNIQUE INDEX "AuthChallenge_tokenHash_key" ON "AuthChallenge"("tokenHash");
CREATE INDEX "AuthChallenge_userId_purpose_createdAt_idx"
  ON "AuthChallenge"("userId", "purpose", "createdAt");
CREATE INDEX "AuthChallenge_purpose_expiresAt_idx"
  ON "AuthChallenge"("purpose", "expiresAt");
CREATE INDEX "AuthEvent_userId_createdAt_idx" ON "AuthEvent"("userId", "createdAt");
CREATE INDEX "AuthEvent_type_createdAt_idx" ON "AuthEvent"("type", "createdAt");

ALTER TABLE "AuthIdentity"
  ADD CONSTRAINT "AuthIdentity_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuthChallenge"
  ADD CONSTRAINT "AuthChallenge_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuthEvent"
  ADD CONSTRAINT "AuthEvent_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "User"
  DROP COLUMN "resetToken",
  DROP COLUMN "resetTokenExpiresAt";
