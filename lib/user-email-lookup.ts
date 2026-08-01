import type { NormalizedEmail } from "@/lib/email-identity";
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

  // Collision rows cannot share the unique canonicalEmail field. The indexed,
  // non-unique collision key keeps them discoverable until a reviewed merge.
  const unresolved = await prisma.user.findMany({
    where: {
      collisionCanonicalEmail: normalized.canonicalEmail,
    },
    take: 3,
  });

  const byId = new Map(direct.map((user) => [user.id, user]));
  for (const user of unresolved) byId.set(user.id, user);

  return [...byId.values()];
}
