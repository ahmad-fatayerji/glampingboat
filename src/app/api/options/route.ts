import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const OPTION_SELECT = {
  id: true,
  name: true,
  priceHt: true,
} satisfies Prisma.OptionSelect;

export async function GET() {
  const options = await prisma.option.findMany({ select: OPTION_SELECT });
  return NextResponse.json(options);
}
