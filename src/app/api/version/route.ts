import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    {
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? "unknown",
      nodeEnv: process.env.NODE_ENV ?? "unknown",
      servedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
