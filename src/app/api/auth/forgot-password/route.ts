// POST /api/auth/forgot-password
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (typeof email !== "string") {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  // 1) Find the user
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    // 2) Generate token + expiry
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1h

    await prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpiresAt: expires },
    });

    // 3) Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // use an App Password
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${token}`;
    await transporter.sendMail({
      to: email,
      subject: "Your password reset link",
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    });
  }

  // Always return 200 so you don’t leak which emails exist
  return NextResponse.json({ ok: true });
}
