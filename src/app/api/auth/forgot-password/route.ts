import { NextResponse } from "next/server";
import {
  getPasswordResetEmailCopy,
  normalizeEmailLocale,
} from "@/lib/email-i18n";
import {
  buildBrandedEmail,
  createGmailTransporter,
  getMailerAddress,
} from "@/lib/mailer";
import { getString, isRecord } from "@/lib/type-guards";
import {
  createAuthChallenge,
  PASSWORD_RESET_TTL_MS,
} from "@/lib/auth-security";
import { normalizeEmailAddress } from "@/lib/email-identity";
import { findAccountCandidates } from "@/lib/user-email-lookup";

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

  const normalized = normalizeEmailAddress(email);
  const candidates = normalized ? await findAccountCandidates(normalized) : [];
  const user =
    candidates.length === 1 && candidates[0].emailVerifiedAt
      ? candidates[0]
      : null;
  if (user) {
    try {
      const { token } = await createAuthChallenge({
        userId: user.id,
        purpose: "RESET_PASSWORD",
        ttlMs: PASSWORD_RESET_TTL_MS,
      });

      const transporter = createGmailTransporter();
      const origin = process.env.NEXTAUTH_URL ?? new URL(req.url).origin;
      const resetUrl = `${origin}/reset-password/${token}`;
      const { html, subject, text } = buildPasswordResetEmail(resetUrl, locale);

      await transporter.sendMail({
        from: getMailerAddress("Glamping Boat"),
        to: user.email,
        subject,
        text,
        html,
      });
    } catch (error) {
      console.error("Failed to issue password reset", error);
    }
  }

  return NextResponse.json({ ok: true });
}
