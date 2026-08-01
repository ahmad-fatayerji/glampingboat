import { NextResponse } from "next/server";
import {
  createAuthChallenge,
  EMAIL_VERIFICATION_TTL_MS,
} from "@/lib/auth-security";
import { sendVerificationEmail } from "@/lib/auth-emails";
import { normalizeEmailAddress } from "@/lib/email-identity";
import { getString, isRecord } from "@/lib/type-guards";
import { findAccountCandidates } from "@/lib/user-email-lookup";
import { normalizeEmailLocale } from "@/lib/email-i18n";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const rawEmail = isRecord(body) ? getString(body, "email") : undefined;
  const normalized = rawEmail ? normalizeEmailAddress(rawEmail) : null;
  const locale = normalizeEmailLocale(
    isRecord(body) ? getString(body, "locale") : undefined
  );

  if (normalized) {
    const candidates = await findAccountCandidates(normalized);
    const user =
      candidates.length === 1 && !candidates[0].emailVerifiedAt
        ? candidates[0]
        : null;

    if (user) {
      try {
        const { token } = await createAuthChallenge({
          userId: user.id,
          purpose: "VERIFY_EMAIL",
          ttlMs: EMAIL_VERIFICATION_TTL_MS,
        });
        const origin = process.env.NEXTAUTH_URL ?? new URL(req.url).origin;
        await sendVerificationEmail(
          user.email,
          `${origin}/verify-email/${encodeURIComponent(token)}`,
          locale
        );
      } catch (error) {
        if (error instanceof Error && /Too many requests/i.test(error.message)) {
          return NextResponse.json({ error: error.message }, { status: 429 });
        }
        console.error("Failed to resend verification email", error);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
