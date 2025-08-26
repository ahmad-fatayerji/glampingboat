import { auth } from '@/../auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const body = await req.json();
        const data: any = {};
        const allowed = ['firstName', 'lastName', 'phone', 'mobile', 'birthDate', 'addressNumber', 'addressStreet', 'addressCity', 'addressState'];
        for (const key of allowed) {
            if (key in body) {
                if (key === 'birthDate' && body.birthDate) {
                    data.birthDate = new Date(body.birthDate);
                } else {
                    data[key] = body[key];
                }
            }
        }
        const user = await prisma.user.update({ where: { id: session.user.id }, data });
        return NextResponse.json({ ok: true, user });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await prisma.user.findUnique({
        where: { id: session.user.id }, select: {
            id: true, email: true, firstName: true, lastName: true, phone: true, mobile: true,
            birthDate: true, addressNumber: true, addressStreet: true, addressCity: true, addressState: true,
        } as any
    });
    return NextResponse.json({ user });
}