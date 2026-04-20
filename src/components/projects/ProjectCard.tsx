import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProjectCardProps {
  project: {
    id: string
    name: string
    description: string | null
    status: string
    driveFolderId: string
    createdAt: Date
    members: { user: { id: string; name: string; email: string }; role: string }[]
  }
}

const statusStyle: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-0",
  paused: "bg-amber-100 text-amber-700 border-0",
  exited: "bg-gray-100 text-gray-500 border-0",
}

export function ProjectCard({ project }: ProjectCardProps) {
  const topMembers = project.members.slice(0, 4)
  const extra = project.members.length - 4

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="border-gray-100 shadow-none hover:shadow-sm hover:border-gray-200 transition-all cursor-pointer h-full">
        <CardContent className="p-5 flex flex-col gap-3 h-full">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">
              {project.name}
            </h3>
            <Badge className={cn("text-xs capitalize shrink-0", statusStyle[project.status])}>
              {project.status}
            </Badge>
          </div>

          {project.description && (
            <p className="text-xs text-gray-400 line-clamp-2 flex-1">
              {project.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
            <div className="flex -space-x-1.5">
              {topMembers.map(({ user }) => {
                const initials = user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
                return (
                  <Avatar key={user.id} className="h-6 w-6 ring-2 ring-white">
                    <AvatarFallback className="bg-gray-200 text-gray-700 text-[9px] font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                )
              })}
              {extra > 0 && (
                <div className="h-6 w-6 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-[9px] font-semibold text-gray-500">
                  +{extra}
                </div>
              )}
            </div>
            <a
              href={`https://drive.google.com/drive/folders/${project.driveFolderId}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
