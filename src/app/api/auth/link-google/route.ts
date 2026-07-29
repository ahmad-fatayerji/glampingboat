import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getActiveChallenge, recordAuthEvent } from "@/lib/auth-security";
import { sendGoogleLinkedEmail } from "@/lib/auth-emails";
import { normalizeEmailAddress } from "@/lib/email-identity";
import { prisma } from "@/lib/prisma";
import { getString, isRecord } from "@/lib/type-guards";

function getLinkMetadata(metadata: unknown) {
  if (!isRecord(metadata)) {
    return null;
  }
  const provider = getString(metadata, "provider");
  const providerSubject = getString(metadata, "providerSubject");
  const providerEmail = getString(metadata, "providerEmail");
  return provider === "google" && providerSubject && providerEmail
    ? { provider, providerSubject, providerEmail }
    : null;
}

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Invalid link request" }, { status: 400 });
  }

  const challenge = await getActiveChallenge(token, "LINK_GOOGLE");
  const metadata = challenge ? getLinkMetadata(challenge.metadata) : null;
  if (!challenge || !metadata) {
    return NextResponse.json(
      { error: "This link request is invalid or expired" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    email: challenge.user.email,
    googleEmail: metadata.providerEmail,
    requiresPassword:
      challenge.user.role !== "CUSTOMER" && Boolean(challenge.user.password),
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const token = isRecord(body) ? getString(body, "token") : undefined;
  const password = isRecord(body) ? getString(body, "password") : undefined;
  if (!token) {
    return NextResponse.json({ error: "Invalid link request" }, { status: 400 });
  }

  const challenge = await getActiveChallenge(token, "LINK_GOOGLE");
  const metadata = challenge ? getLinkMetadata(challenge.metadata) : null;
  if (!challenge || !metadata) {
    return NextResponse.json(
      { error: "This link request is invalid or expired" },
      { status: 400 }
    );
  }

  if (
    challenge.user.role !== "CUSTOMER" &&
    challenge.user.password &&
    (!password || !(await bcrypt.compare(password, challenge.user.password)))
  ) {
    return NextResponse.json(
      { error: "Your current password is required" },
      { status: 401 }
    );
  }

  const normalizedGoogleEmail = normalizeEmailAddress(metadata.providerEmail);
  const normalizedUserEmail = normalizeEmailAddress(challenge.user.email);
  if (
    !normalizedGoogleEmail ||
    !normalizedUserEmail ||
    normalizedGoogleEmail.canonicalEmail !== normalizedUserEmail.canonicalEmail
  ) {
    return NextResponse.json(
      { error: "The Google email no longer matches this account" },
      { status: 409 }
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      const consumed = await tx.authChallenge.updateMany({
        where: {
          id: challenge.id,
          consumedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: { consumedAt: new Date() },
      });
      if (consumed.count !== 1) {
        throw new Error("This link request was already used");
      }

      await tx.authIdentity.create({
        data: {
          userId: challenge.userId,
          provider: "google",
          providerSubject: metadata.providerSubject,
          providerEmail: normalizedGoogleEmail.email,
        },
      });
      await tx.user.update({
        where: { id: challenge.userId },
        data: { emailVerifiedAt: challenge.user.emailVerifiedAt ?? new Date() },
      });
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to link Google";
    return NextResponse.json({ error: message }, { status: 409 });
  }

  await recordAuthEvent({
    userId: challenge.userId,
    type: "GOOGLE_LINKED",
    provider: "google",
    request: req,
  });
  await sendGoogleLinkedEmail(challenge.user.email).catch((error) =>
    console.error("Failed to send Google-link security email", error)
  );

  return NextResponse.json({ ok: true });
}
