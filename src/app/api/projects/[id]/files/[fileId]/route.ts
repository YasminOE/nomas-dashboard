import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { assertProjectAccess } from "@/lib/permissions"
import { deleteDriveFile, renameDriveFile } from "@/lib/drive"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, fileId } = await params

  try {
    await assertProjectAccess(session.user.id, id, "editor")
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 })
  }

  try {
    await deleteDriveFile(fileId)
  } catch {
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 })
  }

  await db.activityLog.create({
    data: { projectId: id, userId: session.user.id, action: "deleted a file" },
  })

  return NextResponse.json({ success: true })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, fileId } = await params

  try {
    await assertProjectAccess(session.user.id, id, "editor")
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 })
  }

  const { name } = await req.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  try {
    await renameDriveFile(fileId, name.trim())
  } catch {
    return NextResponse.json({ error: "Failed to rename file" }, { status: 500 })
  }

  await db.activityLog.create({
    data: { projectId: id, userId: session.user.id, action: `renamed a file to "${name.trim()}"` },
  })

  return NextResponse.json({ success: true })
}
