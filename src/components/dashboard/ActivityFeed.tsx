import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

interface ActivityItem {
  id: string
  action: string
  createdAt: Date
  user: { name: string }
  project?: { name: string } | null
}

interface ActivityFeedProps {
  activities: ActivityItem[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-6">
        No recent activity
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((item) => {
        const initials = item.user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)

        return (
          <div key={item.id} className="flex items-start gap-3">
            <Avatar className="h-7 w-7 mt-0.5 shrink-0">
              <AvatarFallback className="bg-gray-200 text-gray-700 text-[10px] font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-700">
                <span className="font-medium">{item.user.name}</span>{" "}
                {item.action}
                {item.project && (
                  <span className="text-gray-400"> · {item.project.name}</span>
                )}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatDistanceToNow(new Date(item.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
