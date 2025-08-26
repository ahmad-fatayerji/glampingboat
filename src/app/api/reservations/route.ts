import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/../auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // Ensure profile completeness (basic required fields)
    const profile = await prisma.user.findUnique({ where: { id: session.user.id }, select: { firstName: true, lastName: true, phone: true, addressCity: true, addressStreet: true } as any });
    if (!profile || !(profile as any).firstName || !(profile as any).lastName || !(profile as any).phone || !(profile as any).addressCity || !(profile as any).addressStreet) {
        return NextResponse.json({ error: 'Profile incomplete' }, { status: 400 });
    }
    try {
        const body = await req.json();
        const { startDate, endDate, adults, children, optionIds = [], pricing } = body;
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (!(start instanceof Date) || isNaN(start.getTime()) || !(end instanceof Date) || isNaN(end.getTime())) {
            return NextResponse.json({ error: 'Invalid dates' }, { status: 400 });
        }

        // Build pricing (trust client for now, later recompute on server)
        const basePriceHt = pricing?.basePriceHt ?? 0;
        const optionsPriceHt = pricing?.optionSumHt ?? 0;
        const subtotalHt = pricing?.subtotalHt ?? basePriceHt + optionsPriceHt;
        const tvaHt = pricing?.tvaHt ?? subtotalHt * 0.2;
        const taxSejourTtc = pricing?.taxSejourTtc ?? 0;
        const totalTtc = pricing?.total ?? subtotalHt + tvaHt + taxSejourTtc;
        const depositAmount = parseFloat((totalTtc * 0.3).toFixed(2));
        const balanceAmount = parseFloat((totalTtc - depositAmount).toFixed(2));
        const securityDeposit = 500; // placeholder

        const reservation = await prisma.reservation.create({
            data: {
                userId: session.user.id,
                startDate: start,
                endDate: end,
                adults,
                children,
                basePriceHt,
                optionsPriceHt,
                subtotalHt,
                tvaHt,
                taxSejourTtc,
                totalTtc,
                depositAmount,
                balanceAmount,
                securityDeposit,
                items: { create: optionIds.map((id: string) => ({ optionId: id, quantity: 1, totalPriceHt: 0 })) },
            },
            include: { items: true }
        });

        return NextResponse.json(reservation, { status: 201 });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
