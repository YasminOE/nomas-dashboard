import { db } from "@/lib/db"

const ROLE_RANK: Record<string, number> = {
  viewer: 1,
  editor: 2,
  owner: 3,
}

export async function assertProjectAccess(
  userId: string,
  projectId: string,
  minRole: "viewer" | "editor" | "owner" = "viewer"
): Promise<void> {
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error("Unauthorized")

  if (user.isAdmin) return // admins bypass all checks

  const membership = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  })

  if (!membership) throw new Error("Forbidden")

  if ((ROLE_RANK[membership.role] ?? 0) < ROLE_RANK[minRole]) {
    throw new Error("Insufficient permissions")
  }
}

export async function getUserProjectIds(userId: string): Promise<string[]> {
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) return []

  if (user.isAdmin) {
    const projects = await db.project.findMany({ select: { id: true } })
    return projects.map((p: { id: string }) => p.id)
  }

  const memberships = await db.projectMember.findMany({
    where: { userId },
    select: { projectId: true },
  })
  return memberships.map((m: { projectId: string }) => m.projectId)
}
