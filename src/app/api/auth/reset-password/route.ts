import { NextResponse } from "next/server"
import { prisma }      from "@/lib/prisma"
import bcrypt          from "bcryptjs"

export async function POST(req: Request) {
  const { token, password } = await req.json()
  if (!token || typeof password !== "string") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  // 1) find by token & ensure not expired
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiresAt: { gt: new Date() },
    },
  })
  if (!user) {
    return NextResponse.json({ error: "Token invalid or expired" }, { status: 400 })
  }

  // 2) hash new password & clear out the reset fields
  const hash = await bcrypt.hash(password, 12)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hash,
      resetToken: null,
      resetTokenExpiresAt: null,
    },
  })

  return NextResponse.json({ ok: true })
}
