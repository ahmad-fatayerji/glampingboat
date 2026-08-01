import { NextResponse } from "next/server";
import {
  consumeTokenChallenge,
  recordAuthEvent,
} from "@/lib/auth-security";
import { prisma } from "@/lib/prisma";
import { getString, isRecord } from "@/lib/type-guards";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const token = isRecord(body) ? getString(body, "token") : undefined;
  if (!token) {
    return NextResponse.json({ error: "Invalid verification link" }, { status: 400 });
  }

  const challenge = await consumeTokenChallenge(token, "VERIFY_EMAIL");
  if (!challenge) {
    return NextResponse.json(
      { error: "Verification link is invalid or expired" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: challenge.userId },
    data: { emailVerifiedAt: new Date() },
  });
  await recordAuthEvent({
    userId: challenge.userId,
    type: "EMAIL_VERIFIED",
    provider: "credentials",
    request: req,
  });

  return NextResponse.json({ ok: true });
}
