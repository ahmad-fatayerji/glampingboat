// src/app/api/reservations/route.ts
import { NextResponse } from "next/server"
import { auth }         from "@auth"     // ← the new universal helper
import { prisma }       from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const reservations = await prisma.reservation.findMany({
    where:   { userId: session.user.id },
    orderBy: { date: "asc" },
  })
  return NextResponse.json(reservations)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { date, timeSlot } = await request.json()
  const dt = new Date(date)

  // conflict check
  const clash = await prisma.reservation.findFirst({
    where: { date: dt, timeSlot }
  })
  if (clash) {
    return new NextResponse("Time slot already booked", { status: 409 })
  }

  const reservation = await prisma.reservation.create({
    data: {
      userId:   session.user.id,
      date:     dt,
      timeSlot,
    }
  })
  return NextResponse.json(reservation)
}
