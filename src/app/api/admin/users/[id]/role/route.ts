import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@/generated/prisma/client";
import { AdminAccessError, requireSuperAdmin } from "@/lib/admin";
import { getErrorMessage } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getString, isRecord } from "@/lib/type-guards";

const ASSIGNABLE_ROLES: readonly UserRole[] = ["CUSTOMER", "ADMIN", "SUPER_ADMIN"];
const ELEVATED_ROLE_CONFIRMATION = "CONFIRMER";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSuperAdmin();
    const { id } = await params;
    const body = await req.json();
    const role = isRecord(body) ? (getString(body, "role") as UserRole) : undefined;
    const confirmation = isRecord(body) ? getString(body, "confirmation") : undefined;

    if (!role || !ASSIGNABLE_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (
      (role === "ADMIN" || role === "SUPER_ADMIN") &&
      confirmation !== ELEVATED_ROLE_CONFIRMATION
    ) {
      return NextResponse.json(
        { error: "Role elevation requires confirmation" },
        { status: 400 }
      );
    }

    if (id === session.user.id && role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "A super admin cannot demote their own account" },
        { status: 409 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof AdminAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Server error") },
      { status: 500 }
    );
  }
}
