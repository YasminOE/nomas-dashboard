import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST() {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  const name = process.env.SEED_ADMIN_NAME

  if (!email || !password || !name) {
    return NextResponse.json({ error: "Seed env vars not set" }, { status: 500 })
  }

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ message: "Admin already exists" })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await db.user.create({
    data: { name, email, passwordHash, isAdmin: true },
    select: { id: true, name: true, email: true },
  })

  return NextResponse.json({ created: user })
}
