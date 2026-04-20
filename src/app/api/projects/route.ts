import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createDriveFolder } from "@/lib/drive"
import { getUserProjectIds } from "@/lib/permissions"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const projectIds = await getUserProjectIds(session.user.id)

  const projects = await db.project.findMany({
    where: { id: { in: projectIds } },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, description } = await req.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  let driveFolderId: string
  try {
    driveFolderId = await createDriveFolder(name.trim())
  } catch {
    return NextResponse.json(
      { error: "Failed to create Drive folder. Check service account config." },
      { status: 500 }
    )
  }

  const project = await db.project.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      driveFolderId,
      members: {
        create: { userId: session.user.id, role: "owner" },
      },
    },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  })

  await db.activityLog.create({
    data: {
      projectId: project.id,
      userId: session.user.id,
      action: `created project "${project.name}"`,
    },
  })

  return NextResponse.json(project, { status: 201 })
}
