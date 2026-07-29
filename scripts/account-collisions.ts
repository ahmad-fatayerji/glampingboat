import { normalizeEmailAddress } from "@/lib/email-identity";
import { prisma } from "@/lib/prisma";

function argument(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function collisionGroups() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      canonicalEmail: true,
      emailVerifiedAt: true,
      role: true,
      password: true,
      createdAt: true,
      _count: { select: { reservations: true, authIdentities: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const groups = new Map<string, typeof users>();
  for (const user of users) {
    const canonical = normalizeEmailAddress(user.email)?.canonicalEmail;
    if (!canonical) continue;
    const current = groups.get(canonical) ?? [];
    current.push(user);
    groups.set(canonical, current);
  }

  return [...groups.entries()]
    .filter(([, members]) => members.length > 1)
    .map(([canonicalEmail, members]) => ({
      canonicalEmail,
      users: members.map(({ password, ...user }) => ({
        ...user,
        hasPassword: Boolean(password),
      })),
    }));
}

async function audit() {
  const groups = await collisionGroups();
  if (!groups.length) {
    console.log("No canonical email collisions found.");
    return;
  }

  console.log(
    JSON.stringify(
      {
        collisionGroups: groups.length,
        warning:
          "Review reservation ownership, roles, profiles, and password presence before selecting a survivor.",
        groups,
      },
      null,
      2
    )
  );
  process.exitCode = 2;
}

async function merge() {
  const survivorId = argument("--survivor");
  const mergedIds = (argument("--merge") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const apply = process.argv.includes("--apply");

  if (!survivorId || !mergedIds.length || mergedIds.includes(survivorId)) {
    throw new Error(
      "Usage: --survivor <user-id> --merge <id,id> [--apply]"
    );
  }

  const users = await prisma.user.findMany({
    where: { id: { in: [survivorId, ...mergedIds] } },
    include: { authIdentities: true, _count: { select: { reservations: true } } },
  });
  if (users.length !== 1 + mergedIds.length) {
    throw new Error("One or more supplied user IDs do not exist.");
  }

  const canonicalEmails = new Set(
    users.map((user) => normalizeEmailAddress(user.email)?.canonicalEmail)
  );
  if (canonicalEmails.size !== 1 || canonicalEmails.has(undefined)) {
    throw new Error("Refusing to merge users that do not share one mailbox.");
  }

  const survivor = users.find((user) => user.id === survivorId)!;
  const preview = {
    canonicalEmail: [...canonicalEmails][0],
    survivor: {
      id: survivor.id,
      email: survivor.email,
      role: survivor.role,
      hasPassword: Boolean(survivor.password),
      reservations: survivor._count.reservations,
    },
    mergedUsers: users
      .filter((user) => user.id !== survivorId)
      .map((user) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        hasPassword: Boolean(user.password),
        reservations: user._count.reservations,
      })),
  };
  console.log(JSON.stringify(preview, null, 2));

  if (!apply) {
    console.log("Dry run only. Add --apply after reviewing this output.");
    return;
  }

  const canonicalEmail = [...canonicalEmails][0]!;
  const verifiedDates = users
    .map((user) => user.emailVerifiedAt)
    .filter((value): value is Date => Boolean(value));

  await prisma.$transaction(async (tx) => {
    await tx.reservation.updateMany({
      where: { userId: { in: mergedIds } },
      data: { userId: survivorId },
    });
    await tx.availabilityBlock.updateMany({
      where: { actorUserId: { in: mergedIds } },
      data: { actorUserId: survivorId },
    });
    await tx.bookingPromo.updateMany({
      where: { actorUserId: { in: mergedIds } },
      data: { actorUserId: survivorId },
    });
    await tx.appIdempotencyKey.updateMany({
      where: { userId: { in: mergedIds } },
      data: { userId: survivorId },
    });
    await tx.reservationEvent.updateMany({
      where: { actorUserId: { in: mergedIds } },
      data: { actorUserId: survivorId },
    });
    await tx.featureFlag.updateMany({
      where: { updatedByUserId: { in: mergedIds } },
      data: { updatedByUserId: survivorId },
    });
    await tx.authIdentity.updateMany({
      where: { userId: { in: mergedIds } },
      data: { userId: survivorId },
    });
    await tx.authEvent.updateMany({
      where: { userId: { in: mergedIds } },
      data: { userId: survivorId },
    });
    await tx.authChallenge.updateMany({
      where: { userId: { in: mergedIds }, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    await tx.user.deleteMany({ where: { id: { in: mergedIds } } });
    await tx.user.update({
      where: { id: survivorId },
      data: {
        canonicalEmail,
        emailVerifiedAt: verifiedDates.length
          ? new Date(Math.max(...verifiedDates.map((date) => date.getTime())))
          : survivor.emailVerifiedAt,
        sessionVersion: { increment: 1 },
      },
    });
  });

  console.log(
    `Merged ${mergedIds.length} user(s) into ${survivorId}. Existing sessions were invalidated.`
  );
}

const command = process.argv[2] ?? "audit";

try {
  if (command === "audit") {
    await audit();
  } else if (command === "merge") {
    await merge();
  } else {
    throw new Error(`Unknown command: ${command}`);
  }
} finally {
  await prisma.$disconnect();
}
