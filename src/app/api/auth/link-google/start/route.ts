import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@auth";
import {
  createAuthChallenge,
  getAuthCookieOptions,
  GOOGLE_LINK_INTENT_COOKIE,
  GOOGLE_LINK_TTL_MS,
} from "@/lib/auth-security";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { token } = await createAuthChallenge({
      userId: session.user.id,
      purpose: "LINK_GOOGLE_INTENT",
      ttlMs: GOOGLE_LINK_TTL_MS,
    });
    const cookieStore = await cookies();
    cookieStore.set(
      GOOGLE_LINK_INTENT_COOKIE,
      token,
      getAuthCookieOptions(GOOGLE_LINK_TTL_MS)
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to start Google linking";
    return NextResponse.json(
      { error: message },
      { status: /Too many requests/i.test(message) ? 429 : 500 }
    );
  }
}
