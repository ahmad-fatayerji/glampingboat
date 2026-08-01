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
import { prisma } from "@/lib/prisma";

export const PASSWORD_RESET_RESEND_COOLDOWN_MS = 60 * 1000;

export class PasswordResetCooldownError extends Error {
  readonly retryAfterMs: number;

  constructor(retryAfterMs: number) {
    super("A reset link was just sent. Try again shortly.");
    this.name = "PasswordResetCooldownError";
    this.retryAfterMs = retryAfterMs;
  }
}

export type PasswordResetCooldownClient = {
  authChallenge: {
    findFirst(args: {
      where: unknown;
      orderBy: unknown;
      select: unknown;
    }): Promise<{ createdAt: Date } | null>;
  };
};

const defaultCooldownClient = prisma as unknown as PasswordResetCooldownClient;

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
  cooldownClient = defaultCooldownClient,
}: {
  userId: string;
  email: string;
  locale: unknown;
  origin: string;
  cooldownClient?: PasswordResetCooldownClient;
}) {
  const lastIssued = await cooldownClient.authChallenge.findFirst({
    where: {
      userId,
      purpose: "RESET_PASSWORD",
      createdAt: {
        gte: new Date(Date.now() - PASSWORD_RESET_RESEND_COOLDOWN_MS),
      },
    },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (lastIssued) {
    const elapsed = Date.now() - lastIssued.createdAt.getTime();
    throw new PasswordResetCooldownError(
      Math.max(PASSWORD_RESET_RESEND_COOLDOWN_MS - elapsed, 0)
    );
  }

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
