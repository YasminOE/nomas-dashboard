"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { UserPlus, Trash2, Loader2 } from "lucide-react"

interface Member {
  id: string
  role: string
  user: { id: string; name: string; email: string }
}

interface MembersPanelProps {
  projectId: string
  members: Member[]
  canManage: boolean
  currentUserId: string
  onRefresh: () => void
}

const roleStyle: Record<string, string> = {
  owner: "bg-violet-100 text-violet-700 border-0",
  editor: "bg-blue-100 text-blue-700 border-0",
  viewer: "bg-gray-100 text-gray-600 border-0",
}

export function MembersPanel({
  projectId,
  members,
  canManage,
  currentUserId,
  onRefresh,
}: MembersPanelProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [allUsers, setAllUsers] = useState<{ id: string; name: string; email: string }[]>([])
  const [selectedUser, setSelectedUser] = useState("")
  const [selectedRole, setSelectedRole] = useState("viewer")
  const [working, setWorking] = useState(false)

  async function openAddDialog() {
    const res = await fetch("/api/team")
    if (res.ok) {
      const users = await res.json()
      const memberIds = new Set(members.map((m) => m.user.id))
      setAllUsers(users.filter((u: { id: string }) => !memberIds.has(u.id)))
    }
    setShowAdd(true)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setWorking(true)
    await fetch(`/api/projects/${projectId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedUser, role: selectedRole }),
    })
    setWorking(false)
    setShowAdd(false)
    setSelectedUser("")
    onRefresh()
  }

  async function handleRemove(userId: string) {
    if (!confirm("Remove this member?")) return
    setWorking(true)
    await fetch(`/api/projects/${projectId}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
    setWorking(false)
    onRefresh()
  }

  return (
    <>
      <div className="space-y-2">
        {members.map((m) => {
          const initials = m.user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
          return (
            <div key={m.id} className="flex items-center gap-3 py-2 group">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-gray-200 text-gray-700 text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{m.user.name}</p>
                <p className="text-xs text-gray-400 truncate">{m.user.email}</p>
              </div>
              <Badge className={`text-xs capitalize ${roleStyle[m.role]}`}>{m.role}</Badge>
              {canManage && m.user.id !== currentUserId && (
                <button
                  onClick={() => handleRemove(m.user.id)}
                  disabled={working}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          )
        })}

        {canManage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={openAddDialog}
            className="w-full mt-2 gap-2 text-gray-500 hover:text-gray-900 border border-dashed border-gray-200 hover:border-gray-300"
          >
            <UserPlus size={14} />
            Add member
          </Button>
        )}
      </div>

      <Dialog open={showAdd} onOpenChange={(v) => !v && setShowAdd(false)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Team member</Label>
              <Select value={selectedUser} onValueChange={(v) => setSelectedUser(v ?? "")} required>
                <SelectTrigger className="bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Select a person…" />
                </SelectTrigger>
                <SelectContent>
                  {allUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} — {u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v ?? "viewer")}>
                <SelectTrigger className="bg-gray-50 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer — read-only</SelectItem>
                  <SelectItem value="editor">Editor — can upload & manage files</SelectItem>
                  <SelectItem value="owner">Owner — full access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button
                type="submit"
                className="bg-black hover:bg-gray-800 text-white"
                disabled={working || !selectedUser}
              >
                {working ? <Loader2 size={14} className="animate-spin" /> : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
