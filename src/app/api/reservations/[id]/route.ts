import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/reservations/:id
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = params;
    try {
        const reservation = await prisma.reservation.findUnique({ where: { id } });
        if (!reservation || reservation.userId !== session.user.id) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        await prisma.reservationOption.deleteMany({ where: { reservationId: id } });
        await prisma.reservation.delete({ where: { id } });
        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
