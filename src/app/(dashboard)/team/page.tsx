"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { TopNav } from "@/components/layout/TopNav"
import { MemberCard } from "@/components/team/MemberCard"
import { InviteModal } from "@/components/team/InviteModal"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { UserPlus, Lock } from "lucide-react"

type User = {
  id: string
  name: string
  email: string
  isAdmin: boolean
  createdAt: string
}

export default function TeamPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)

  const isAdmin = session?.user?.isAdmin

  async function load() {
    if (!isAdmin) { setLoading(false); return }
    const res = await fetch("/api/team")
    if (res.ok) setUsers(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [isAdmin])

  async function handleRemove(userId: string) {
    if (!confirm("Remove this team member?")) return
    await fetch("/api/team", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
    load()
  }

  if (!isAdmin) {
    return (
      <>
        <TopNav title="Team" />
        <div className="flex-1 flex items-center justify-center text-center p-12">
          <div>
            <Lock size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Only admins can manage team members.</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <TopNav title="Team" />
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            {users.length} member{users.length !== 1 ? "s" : ""}
          </p>
          <Button
            onClick={() => setShowInvite(true)}
            className="bg-black hover:bg-gray-800 text-white gap-1.5"
          >
            <UserPlus size={15} />
            Invite member
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {users.map((user) => (
              <MemberCard
                key={user.id}
                user={user}
                isCurrentUser={user.id === session?.user?.id}
                onRemove={() => handleRemove(user.id)}
              />
            ))}
          </div>
        )}
      </div>

      <InviteModal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        onInvited={load}
      />
    </>
  )
}
