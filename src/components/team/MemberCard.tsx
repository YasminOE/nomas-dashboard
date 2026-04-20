import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface MemberCardProps {
  user: {
    id: string
    name: string
    email: string
    isAdmin: boolean
    createdAt: string
  }
  isCurrentUser: boolean
  onRemove?: () => void
}

export function MemberCard({ user, isCurrentUser, onRemove }: MemberCardProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarFallback className="bg-gray-200 text-gray-700 text-sm font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
          {user.isAdmin && (
            <Badge className="bg-black text-white border-0 text-xs">Admin</Badge>
          )}
          {isCurrentUser && (
            <Badge className="bg-gray-100 text-gray-500 border-0 text-xs">You</Badge>
          )}
        </div>
        <p className="text-xs text-gray-400 truncate">{user.email}</p>
      </div>
      {onRemove && !isCurrentUser && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
        >
          <Trash2 size={15} />
        </Button>
      )}
    </div>
  )
}
