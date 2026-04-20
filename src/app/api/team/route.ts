import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!session.user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const users = await db.user.findMany({
    select: { id: true, name: true, email: true, isAdmin: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!session.user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { name, email, password, isAdmin } = await req.json()
  if (!name?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: "name, email, and password are required" }, { status: 400 })
  }

  const existing = await db.user.findUnique({ where: { email: email.trim() } })
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await db.user.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      isAdmin: !!isAdmin,
    },
    select: { id: true, name: true, email: true, isAdmin: true, createdAt: true },
  })

  return NextResponse.json(user, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!session.user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })
  if (userId === session.user.id) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 })
  }

  await db.user.delete({ where: { id: userId } })

  return NextResponse.json({ success: true })
}
