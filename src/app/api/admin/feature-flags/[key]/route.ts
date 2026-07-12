import { NextRequest, NextResponse } from "next/server";
import { AdminAccessError, requireSuperAdmin } from "@/lib/admin";
import { isFeatureFlagKey, setFeatureFlag } from "@/lib/feature-flags";
import { getErrorMessage } from "@/lib/http";
import { getBoolean, isRecord } from "@/lib/type-guards";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const session = await requireSuperAdmin();
    const { key } = await params;
    const body = await req.json();
    const enabled = isRecord(body) ? getBoolean(body, "enabled") : undefined;

    if (!isFeatureFlagKey(key)) {
      return NextResponse.json({ error: "Invalid feature flag" }, { status: 400 });
    }

    if (enabled === undefined) {
      return NextResponse.json({ error: "Invalid enabled value" }, { status: 400 });
    }

    const flag = await setFeatureFlag(key, enabled, session.user.id);

    return NextResponse.json({ flag });
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
