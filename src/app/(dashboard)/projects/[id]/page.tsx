"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { TopNav } from "@/components/layout/TopNav"
import { FileList } from "@/components/projects/FileList"
import { FileUpload } from "@/components/projects/FileUpload"
import { MembersPanel } from "@/components/projects/MembersPanel"
import { ActivityFeed } from "@/components/dashboard/ActivityFeed"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { DriveFile } from "@/types"
import { useSession } from "next-auth/react"

type Member = {
  id: string
  role: string
  user: { id: string; name: string; email: string }
}

type Project = {
  id: string
  name: string
  description: string | null
  status: string
  driveFolderId: string
  members: Member[]
}

type ActivityItem = {
  id: string
  action: string
  createdAt: string
  user: { name: string }
  project?: { name: string } | null
}

const statusStyle: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-0",
  paused: "bg-amber-100 text-amber-700 border-0",
  exited: "bg-gray-100 text-gray-500 border-0",
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const [project, setProject] = useState<Project | null>(null)
  const [files, setFiles] = useState<DriveFile[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadProject = useCallback(async () => {
    const res = await fetch(`/api/projects/${id}`)
    if (res.ok) setProject(await res.json())
  }, [id])

  const loadFiles = useCallback(async () => {
    const res = await fetch(`/api/projects/${id}/files`)
    if (res.ok) setFiles(await res.json())
  }, [id])

  const loadActivities = useCallback(async () => {
    const res = await fetch(`/api/projects/${id}/activity`)
    if (res.ok) setActivities(await res.json())
  }, [id])

  useEffect(() => {
    Promise.all([loadProject(), loadFiles()]).then(() => setLoading(false))
  }, [loadProject, loadFiles])

  useEffect(() => {
    loadActivities()
  }, [loadActivities])

  if (loading || !project) {
    return (
      <>
        <TopNav title="Project" />
        <div className="p-6 grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </>
    )
  }

  const currentMember = project.members.find(
    (m) => m.user.id === session?.user?.id
  )
  const canEdit =
    session?.user?.isAdmin ||
    currentMember?.role === "owner" ||
    currentMember?.role === "editor"
  const canManage =
    session?.user?.isAdmin || currentMember?.role === "owner"

  return (
    <>
      <TopNav title={project.name} />
      <div className="flex-1 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Badge className={cn("capitalize text-sm", statusStyle[project.status])}>
            {project.status}
          </Badge>
          {project.description && (
            <p className="text-sm text-gray-500">{project.description}</p>
          )}
          <a
            href={`https://drive.google.com/drive/folders/${project.driveFolderId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ExternalLink size={14} />
            Open in Drive
          </a>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Files */}
          <div className="col-span-2 space-y-4">
            <Card className="border-gray-100 shadow-none">
              <CardHeader className="pb-3 flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-900">
                  Files
                  <span className="ml-2 text-gray-400 font-normal">({files.length})</span>
                </CardTitle>
                {canEdit && (
                  <FileUpload
                    projectId={id}
                    onUploaded={() => { loadFiles(); loadActivities() }}
                  />
                )}
              </CardHeader>
              <CardContent>
                <FileList
                  projectId={id}
                  files={files}
                  canEdit={!!canEdit}
                  onRefresh={() => { loadFiles(); loadActivities() }}
                />
              </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-900">Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityFeed
                  activities={activities.map((a) => ({
                    ...a,
                    createdAt: new Date(a.createdAt),
                  }))}
                />
              </CardContent>
            </Card>
          </div>

          {/* Members */}
          <Card className="border-gray-100 shadow-none h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900">
                Members ({project.members.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MembersPanel
                projectId={id}
                members={project.members}
                canManage={!!canManage}
                currentUserId={session?.user?.id ?? ""}
                onRefresh={loadProject}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
