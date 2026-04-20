import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { assertProjectAccess } from "@/lib/permissions"
import { listDriveFiles } from "@/lib/drive"

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

  const project = await db.project.findUnique({ where: { id } })
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })

  try {
    const files = await listDriveFiles(project.driveFolderId)
    return NextResponse.json(files)
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch files from Drive" },
      { status: 500 }
    )
  }
}
