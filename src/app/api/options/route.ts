import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const options = await prisma.option.findMany({ select: { id: true, name: true, priceHt: true } });
    return NextResponse.json(options);
}
