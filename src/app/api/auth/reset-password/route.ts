import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  PASSWORD_POLICY_ERROR,
  validatePasswordPolicy,
} from "@/lib/password-policy";
import { getString, isRecord } from "@/lib/type-guards";
import {
  consumeTokenChallenge,
  recordAuthEvent,
} from "@/lib/auth-security";

export async function POST(req: Request) {
  const payload = await req.json();
  const token = isRecord(payload) ? getString(payload, "token") : undefined;
  const password = isRecord(payload) ? getString(payload, "password") : undefined;

  if (!token || !password) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  if (!validatePasswordPolicy(password).valid) {
    return NextResponse.json({ error: PASSWORD_POLICY_ERROR }, { status: 400 });
  }

  const challenge = await consumeTokenChallenge(token, "RESET_PASSWORD");
  if (!challenge) {
    return NextResponse.json(
      { error: "Token invalid or expired" },
      { status: 400 }
    );
  }

  const hash = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: challenge.userId },
    data: {
      password: hash,
      sessionVersion: { increment: 1 },
    },
  });
  await recordAuthEvent({
    userId: challenge.userId,
    type: "PASSWORD_RESET",
    provider: "credentials",
    request: req,
  });

  return NextResponse.json({ ok: true });
}
