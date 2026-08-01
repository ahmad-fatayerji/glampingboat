import {
  getPasswordResetEmailCopy,
  normalizeEmailLocale,
} from "@/lib/email-i18n";
import {
  buildBrandedEmail,
  createGmailTransporter,
  getMailerAddress,
} from "@/lib/mailer";
import {
  createAuthChallenge,
  PASSWORD_RESET_TTL_MS,
} from "@/lib/auth-security";

export function buildPasswordResetEmail(resetUrl: string, locale: string) {
  const copy = getPasswordResetEmailCopy(locale);
  const text = copy.text(resetUrl);
  const html = buildBrandedEmail({
    title: copy.title,
    eyebrow: copy.eyebrow,
    preview: copy.preview,
    locale,
    bodyHtml: `<p style="margin: 0 0 14px;">${copy.intro}</p><p style="margin: 0;">${copy.instructions}</p>`,
    action: { href: resetUrl, label: copy.actionLabel },
    footer: copy.footer(resetUrl),
  });

  return { html, subject: copy.subject, text };
}

export async function issuePasswordResetEmail({
  userId,
  email,
  locale,
  origin,
}: {
  userId: string;
  email: string;
  locale: unknown;
  origin: string;
}) {
  const normalizedLocale = normalizeEmailLocale(locale);
  const { token } = await createAuthChallenge({
    userId,
    purpose: "RESET_PASSWORD",
    ttlMs: PASSWORD_RESET_TTL_MS,
  });
  const resetUrl = `${origin}/reset-password/${token}`;
  const { html, subject, text } = buildPasswordResetEmail(
    resetUrl,
    normalizedLocale
  );

  await createGmailTransporter().sendMail({
    from: getMailerAddress("Glamping Boat"),
    to: email,
    subject,
    text,
    html,
  });
}
