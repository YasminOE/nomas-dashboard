import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { TopNav } from "@/components/layout/TopNav"
import { KPICard } from "@/components/dashboard/KPICard"
import { ActivityFeed } from "@/components/dashboard/ActivityFeed"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getUserProjectIds } from "@/lib/permissions"
import { FolderKanban, Users, FileText, TrendingUp } from "lucide-react"
import Link from "next/link"

export default async function OverviewPage() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) redirect("/login")

  const projectIds = await getUserProjectIds(userId)

  const [projects, teamCount, activities] = await Promise.all([
    db.project.findMany({
      where: { id: { in: projectIds } },
      include: { members: true },
      orderBy: { createdAt: "desc" },
    }),
    db.user.count(),
    db.activityLog.findMany({
      where: { projectId: { in: projectIds } },
      include: { user: true, project: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ])

  const activeCount = projects.filter((p: { status: string }) => p.status === "active").length
  const pausedCount = projects.filter((p: { status: string }) => p.status === "paused").length
  const exitedCount = projects.filter((p: { status: string }) => p.status === "exited").length

  const statusColor: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    paused: "bg-amber-100 text-amber-700",
    exited: "bg-gray-100 text-gray-600",
  }

  return (
    <>
      <TopNav title="Dashboard" />
      <div className="flex-1 p-6 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-4 gap-4">
          <KPICard
            title="Total Projects"
            value={projects.length}
            change={`${activeCount} active`}
            changeType="up"
            icon={FolderKanban}
            iconColor="text-violet-500"
          />
          <KPICard
            title="Active Projects"
            value={activeCount}
            change={pausedCount > 0 ? `${pausedCount} paused` : undefined}
            changeType="neutral"
            icon={TrendingUp}
            iconColor="text-emerald-500"
          />
          <KPICard
            title="Team Members"
            value={teamCount}
            icon={Users}
            iconColor="text-blue-500"
          />
          <KPICard
            title="Exited"
            value={exitedCount}
            icon={FileText}
            iconColor="text-gray-400"
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Projects Status Grid */}
          <div className="col-span-2">
            <Card className="border-gray-100 shadow-none h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-900">
                  Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">
                    No projects yet.{" "}
                    <Link href="/projects" className="underline">
                      Create one
                    </Link>
                  </p>
                ) : (
                  <div className="space-y-2">
                    {projects.slice(0, 8).map((p: typeof projects[0]) => (
                      <Link
                        key={p.id}
                        href={`/projects/${p.id}`}
                        className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-2 h-2 rounded-full bg-gray-200 shrink-0" />
                          <span className="text-sm font-medium text-gray-800 truncate group-hover:text-gray-900">
                            {p.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-4">
                          <span className="text-xs text-gray-400">
                            {p.members.length} member
                            {p.members.length !== 1 ? "s" : ""}
                          </span>
                          <Badge
                            className={`text-xs font-medium capitalize border-0 ${
                              statusColor[p.status] ?? "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {p.status}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <Card className="border-gray-100 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed activities={activities} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
