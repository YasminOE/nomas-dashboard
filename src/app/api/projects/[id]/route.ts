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

  const project = await db.project.findUnique({
    where: { id },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  })

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(project)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  try {
    await assertProjectAccess(session.user.id, id, "editor")
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 })
  }

  const body = await req.json()
  const allowed = ["name", "description", "status"]
  const data = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  )

  const project = await db.project.update({ where: { id }, data })

  await db.activityLog.create({
    data: { projectId: id, userId: session.user.id, action: "updated project details" },
  })

  return NextResponse.json(project)
}

export async function DELETE(
  _req: NextRequest,
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

  await db.project.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
