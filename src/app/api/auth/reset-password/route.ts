import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getString, isRecord } from "@/lib/type-guards";

export async function POST(req: Request) {
  const payload = await req.json();
  const token = isRecord(payload) ? getString(payload, "token") : undefined;
  const password = isRecord(payload) ? getString(payload, "password") : undefined;

  if (!token || !password) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiresAt: { gt: new Date() },
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Token invalid or expired" },
      { status: 400 }
    );
  }

  const hash = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hash,
      resetToken: null,
      resetTokenExpiresAt: null,
    },
  });

  return NextResponse.json({ ok: true });
}
