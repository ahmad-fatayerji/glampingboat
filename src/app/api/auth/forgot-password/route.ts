import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildBrandedEmail,
  createGmailTransporter,
  getMailerAddress,
} from "@/lib/mailer";
import { getString, isRecord } from "@/lib/type-guards";

function buildPasswordResetEmail(resetUrl: string) {
  const text = [
    "Reset your Glamping Boat password",
    "",
    "Use the link below to choose a new password. This link expires in 1 hour.",
    resetUrl,
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  const html = buildBrandedEmail({
    title: "Reset your password",
    eyebrow: "Account security",
    preview: "Use this secure link to reset your Glamping Boat password.",
    bodyHtml: `
      <p style="margin: 0 0 14px;">
        We received a request to reset the password for your Glamping Boat account.
      </p>
      <p style="margin: 0;">
        Use the button below to choose a new password. This link expires in 1 hour.
      </p>
    `,
    action: {
      href: resetUrl,
      label: "Reset password",
    },
    footer: `If the button does not work, paste this link into your browser:\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
  });

  return { html, text };
}

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
    const { html, text } = buildPasswordResetEmail(resetUrl);

    await transporter.sendMail({
      from: getMailerAddress("Glamping Boat"),
      to: email,
      subject: "Reset your Glamping Boat password",
      text,
      html,
    });
  }

  return NextResponse.json({ ok: true });
}
