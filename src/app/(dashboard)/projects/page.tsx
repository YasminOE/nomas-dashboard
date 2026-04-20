"use client"

import { useEffect, useState } from "react"
import { TopNav } from "@/components/layout/TopNav"
import { ProjectCard } from "@/components/projects/ProjectCard"
import { CreateProjectModal } from "@/components/projects/CreateProjectModal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

type ProjectStatus = "all" | "active" | "paused" | "exited"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState<ProjectStatus>("all")

  type Project = {
    id: string
    name: string
    description: string | null
    status: string
    driveFolderId: string
    createdAt: string
    members: { user: { id: string; name: string; email: string }; role: string }[]
  }

  async function load() {
    setLoading(true)
    const res = await fetch("/api/projects")
    const data = await res.json()
    setProjects(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = filter === "all" ? projects : projects.filter((p) => p.status === filter)

  const counts = {
    all: projects.length,
    active: projects.filter((p) => p.status === "active").length,
    paused: projects.filter((p) => p.status === "paused").length,
    exited: projects.filter((p) => p.status === "exited").length,
  }

  const tabs: { key: ProjectStatus; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "paused", label: "Paused" },
    { key: "exited", label: "Exited" },
  ]

  return (
    <>
      <TopNav title="Projects" />
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  filter === key
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {label}
                <Badge className="bg-gray-200 text-gray-600 border-0 text-xs h-4 px-1.5">
                  {counts[key]}
                </Badge>
              </button>
            ))}
          </div>
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-black hover:bg-gray-800 text-white gap-1.5"
          >
            <Plus size={15} />
            New project
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 text-sm">
              {filter === "all" ? "No projects yet. Create your first one." : `No ${filter} projects.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={{ ...p, createdAt: new Date(p.createdAt) }} />
            ))}
          </div>
        )}
      </div>

      <CreateProjectModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={load}
      />
    </>
  )
}
