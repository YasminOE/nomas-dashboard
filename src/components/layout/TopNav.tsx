"use client"

import { Search, Bell } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface TopNavProps {
  title: string
}

export function TopNav({ title }: TopNavProps) {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-gray-100 bg-white">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={15}
          />
          <Input
            placeholder="Search..."
            className="pl-9 h-9 w-56 bg-gray-50 border-gray-200 text-sm focus:bg-white"
          />
        </div>
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell size={18} className="text-gray-500" />
          <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-black text-white border-white border-2">
            3
          </Badge>
        </button>
      </div>
    </header>
  )
}
