import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createGmailTransporter } from "@/lib/mailer";
import { getString, isRecord } from "@/lib/type-guards";

export async function POST(req: Request) {
  const payload = await req.json();
  const email = isRecord(payload) ? getString(payload, "email") : undefined;
  if (!email) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60);

    await prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpiresAt: expires },
    });

    const transporter = createGmailTransporter();
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${token}`;

    await transporter.sendMail({
      to: email,
      subject: "Your password reset link",
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    });
  }

  return NextResponse.json({ ok: true });
}
