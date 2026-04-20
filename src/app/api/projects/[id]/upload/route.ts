import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { assertProjectAccess } from "@/lib/permissions"
import { uploadDriveFile } from "@/lib/drive"

export async function POST(
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

  const project = await db.project.findUnique({ where: { id } })
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    const uploaded = await uploadDriveFile(
      project.driveFolderId,
      file.name,
      file.type || "application/octet-stream",
      buffer
    )

    await db.activityLog.create({
      data: {
        projectId: id,
        userId: session.user.id,
        action: `uploaded "${file.name}"`,
      },
    })

    return NextResponse.json(uploaded, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Upload to Drive failed" }, { status: 500 })
  }
}
