-- Keep unresolved canonical collisions queryable without scanning every
-- Gmail-shaped row on each authentication request.
ALTER TABLE "User" ADD COLUMN "collisionCanonicalEmail" TEXT;

WITH canonicalized AS (
  SELECT
    "id",
    regexp_replace(
      split_part(split_part(lower(trim("email")), '@', 1), '+', 1),
      '\.',
      '',
      'g'
    ) || '@gmail.com' AS canonical
  FROM "User"
  WHERE "canonicalEmail" IS NULL
    AND split_part(lower(trim("email")), '@', 2) IN ('gmail.com', 'googlemail.com')
)
UPDATE "User" AS users
SET "collisionCanonicalEmail" = canonicalized.canonical
FROM canonicalized
WHERE users."id" = canonicalized."id";

CREATE INDEX "User_collisionCanonicalEmail_idx"
  ON "User"("collisionCanonicalEmail");

-- Store a non-reversible account key with auth events so login throttling can
-- be scoped to an account without putting raw submitted addresses in logs.
ALTER TABLE "AuthEvent" ADD COLUMN "subjectHash" TEXT;
CREATE INDEX "AuthEvent_type_ipAddress_createdAt_idx"
  ON "AuthEvent"("type", "ipAddress", "createdAt");
CREATE INDEX "AuthEvent_type_subjectHash_createdAt_idx"
  ON "AuthEvent"("type", "subjectHash", "createdAt");
