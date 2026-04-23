import { auth } from "@auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/http";
import {
  toProfileApiUser,
  toProfileUpdatePayload,
  USER_PROFILE_SELECT,
} from "@/lib/profile";
import { sanitizePhoneNumber } from "@/lib/input";
import { getString, isRecord } from "@/lib/type-guards";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const payload = isRecord(body)
      ? toProfileUpdatePayload({
          firstName: getString(body, "firstName") ?? "",
          lastName: getString(body, "lastName") ?? "",
          phone: sanitizePhoneNumber(getString(body, "phone") ?? ""),
          mobile: sanitizePhoneNumber(getString(body, "mobile") ?? ""),
          birthDate: getString(body, "birthDate") ?? "",
          addressNumber: getString(body, "addressNumber") ?? "",
          addressStreet: getString(body, "addressStreet") ?? "",
          addressCity: getString(body, "addressCity") ?? "",
          addressState: getString(body, "addressState") ?? "",
        })
      : {};

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...payload,
        birthDate: payload.birthDate ? new Date(payload.birthDate) : undefined,
      },
      select: USER_PROFILE_SELECT,
    });

    return NextResponse.json({ ok: true, user: toProfileApiUser(user) });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Server error") },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: USER_PROFILE_SELECT,
  });

  return NextResponse.json({ user: toProfileApiUser(user) });
}
