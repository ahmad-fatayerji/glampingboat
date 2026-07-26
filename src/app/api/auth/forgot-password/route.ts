import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import {
  getPasswordResetEmailCopy,
  normalizeEmailLocale,
} from "@/lib/email-i18n";
import { prisma } from "@/lib/prisma";
import {
  buildBrandedEmail,
  createGmailTransporter,
  getMailerAddress,
} from "@/lib/mailer";
import { getString, isRecord } from "@/lib/type-guards";

function buildPasswordResetEmail(resetUrl: string, locale: string) {
  const copy = getPasswordResetEmailCopy(locale);
  const text = copy.text(resetUrl);

  const html = buildBrandedEmail({
    title: copy.title,
    eyebrow: copy.eyebrow,
    preview: copy.preview,
    locale,
    bodyHtml: `
      <p style="margin: 0 0 14px;">
        ${copy.intro}
      </p>
      <p style="margin: 0;">
        ${copy.instructions}
      </p>
    `,
    action: {
      href: resetUrl,
      label: copy.actionLabel,
    },
    footer: copy.footer(resetUrl),
  });

  return { html, subject: copy.subject, text };
}

export async function POST(req: Request) {
  const payload = await req.json();
  const email = isRecord(payload) ? getString(payload, "email") : undefined;
  const locale = normalizeEmailLocale(
    isRecord(payload) ? getString(payload, "locale") : undefined
  );
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
    const { html, subject, text } = buildPasswordResetEmail(resetUrl, locale);

    await transporter.sendMail({
      from: getMailerAddress("Glamping Boat"),
      to: email,
      subject,
      text,
      html,
    });
  }

  return NextResponse.json({ ok: true });
}
