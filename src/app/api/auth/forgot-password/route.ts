import { NextResponse } from "next/server";
import { normalizeEmailLocale } from "@/lib/email-i18n";
import { getString, isRecord } from "@/lib/type-guards";
import { normalizeEmailAddress } from "@/lib/email-identity";
import { issuePasswordResetEmail } from "@/lib/password-reset-email";
import { findAccountCandidates } from "@/lib/user-email-lookup";

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
  const user = candidates.length === 1 ? candidates[0] : null;
  if (user) {
    try {
      const origin = process.env.NEXTAUTH_URL ?? new URL(req.url).origin;
      await issuePasswordResetEmail({
        userId: user.id,
        email: user.email,
        locale,
        origin,
      });
    } catch (error) {
      console.error("Failed to issue password reset", error);
    }
  }

  return NextResponse.json({ ok: true });
}
