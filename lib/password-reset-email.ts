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
  createAuthChallengeInTransaction,
  PASSWORD_RESET_TTL_MS,
  type AuthChallengeTransactionClient,
} from "@/lib/auth-security";
import { prisma } from "@/lib/prisma";
import { PASSWORD_RESET_RESEND_COOLDOWN_MS } from "@/lib/password-reset-cooldown";

export { PASSWORD_RESET_RESEND_COOLDOWN_MS } from "@/lib/password-reset-cooldown";

export class PasswordResetCooldownError extends Error {
  readonly retryAfterMs: number;

  constructor(retryAfterMs: number) {
    super("A reset link was just sent. Try again shortly.");
    this.name = "PasswordResetCooldownError";
    this.retryAfterMs = retryAfterMs;
  }
}

export type PasswordResetCooldownClient = {
  $transaction<T>(
    callback: (tx: PasswordResetCooldownTransactionClient) => Promise<T>
  ): Promise<T>;
};

type PasswordResetCooldownTransactionClient = AuthChallengeTransactionClient & {
  authChallenge: AuthChallengeTransactionClient["authChallenge"] & {
    findFirst(args: {
      where: unknown;
      orderBy: unknown;
      select: unknown;
    }): Promise<{ createdAt: Date } | null>;
  };
  $queryRawUnsafe<T = unknown>(query: string, ...values: unknown[]): Promise<T>;
};

const defaultCooldownClient = prisma as unknown as PasswordResetCooldownClient;

type PasswordResetMessage = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
};

const PASSWORD_RESET_LOCK_QUERY =
  "SELECT pg_try_advisory_xact_lock(hashtextextended($1, 0)) AS locked";

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
  sendMail = (message) => createGmailTransporter().sendMail(message),
}: {
  userId: string;
  email: string;
  locale: unknown;
  origin: string;
  cooldownClient?: PasswordResetCooldownClient;
  sendMail?: (message: PasswordResetMessage) => Promise<unknown>;
}) {
  const normalizedLocale = normalizeEmailLocale(locale);
  const { token } = await cooldownClient.$transaction(async (tx) => {
    const [lock] = await tx.$queryRawUnsafe<Array<{ locked: boolean }>>(
      PASSWORD_RESET_LOCK_QUERY,
      `password-reset:${userId}`
    );
    if (!lock?.locked) {
      throw new PasswordResetCooldownError(
        PASSWORD_RESET_RESEND_COOLDOWN_MS
      );
    }

    const lastIssued = await tx.authChallenge.findFirst({
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

    return createAuthChallengeInTransaction(
      {
        userId,
        purpose: "RESET_PASSWORD",
        ttlMs: PASSWORD_RESET_TTL_MS,
      },
      tx
    );
  });
  const resetUrl = `${origin}/reset-password/${token}`;
  const { html, subject, text } = buildPasswordResetEmail(
    resetUrl,
    normalizedLocale
  );

  await sendMail({
    from: getMailerAddress("Glamping Boat"),
    to: email,
    subject,
    text,
    html,
  });
}
