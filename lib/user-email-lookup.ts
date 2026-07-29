import type { NormalizedEmail } from "@/lib/email-identity";
import { normalizeEmailAddress } from "@/lib/email-identity";
import { prisma } from "@/lib/prisma";

export async function findAccountCandidates(normalized: NormalizedEmail) {
  const direct = await prisma.user.findMany({
    where: {
      OR: [
        { email: normalized.email },
        { canonicalEmail: normalized.canonicalEmail },
      ],
    },
    take: 3,
  });

  if (!normalized.isGmailConsumer) {
    return direct;
  }

  // The migration deliberately leaves canonicalEmail NULL for pre-existing
  // collision groups. Scan only those unresolved Gmail rows so the app blocks
  // account creation/linking until a reviewed merge is completed.
  const unresolved = await prisma.user.findMany({
    where: {
      canonicalEmail: null,
      OR: [
        { email: { endsWith: "@gmail.com", mode: "insensitive" } },
        { email: { endsWith: "@googlemail.com", mode: "insensitive" } },
      ],
    },
  });

  const byId = new Map(direct.map((user) => [user.id, user]));
  for (const user of unresolved) {
    if (
      normalizeEmailAddress(user.email)?.canonicalEmail ===
      normalized.canonicalEmail
    ) {
      byId.set(user.id, user);
    }
  }

  return [...byId.values()];
}
