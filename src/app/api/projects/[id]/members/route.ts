import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { assertProjectAccess } from "@/lib/permissions"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  try {
    await assertProjectAccess(session.user.id, id, "viewer")
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 })
  }

  const members = await db.projectMember.findMany({
    where: { projectId: id },
    include: { user: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json(members)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  try {
    await assertProjectAccess(session.user.id, id, "owner")
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 })
  }

  const { userId, role } = await req.json()
  if (!userId || !["owner", "editor", "viewer"].includes(role)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  }

  const member = await db.projectMember.upsert({
    where: { projectId_userId: { projectId: id, userId } },
    update: { role },
    create: { projectId: id, userId, role },
    include: { user: { select: { id: true, name: true, email: true } } },
  })

  const targetUser = await db.user.findUnique({ where: { id: userId } })
  await db.activityLog.create({
    data: {
      projectId: id,
      userId: session.user.id,
      action: `added ${targetUser?.name ?? "a user"} as ${role}`,
    },
  })

  return NextResponse.json(member, { status: 201 })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  try {
    await assertProjectAccess(session.user.id, id, "owner")
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 })
  }

  const { userId } = await req.json()

  await db.projectMember.delete({
    where: { projectId_userId: { projectId: id, userId } },
  })

  const targetUser = await db.user.findUnique({ where: { id: userId } })
  await db.activityLog.create({
    data: {
      projectId: id,
      userId: session.user.id,
      action: `removed ${targetUser?.name ?? "a user"} from project`,
    },
  })

  return NextResponse.json({ success: true })
}
