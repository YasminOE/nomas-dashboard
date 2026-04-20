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

  const activities = await db.activityLog.findMany({
    where: { projectId: id },
    include: { user: { select: { name: true } }, project: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return NextResponse.json(activities)
}
