import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        user={{
          name: session.user.name ?? "User",
          email: session.user.email ?? "",
          isAdmin: session.user.isAdmin,
        }}
      />
      <main className="ml-60 min-h-screen flex flex-col">{children}</main>
    </div>
  )
}
