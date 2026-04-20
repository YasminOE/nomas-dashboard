"use client"

import { useState } from "react"
import { DriveFile } from "@/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  File,
  FileText,
  Image,
  Video,
  MoreHorizontal,
  ExternalLink,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

function fileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return Image
  if (mimeType.startsWith("video/")) return Video
  if (mimeType.includes("pdf") || mimeType.includes("text")) return FileText
  return File
}

function formatBytes(bytes: string | null) {
  if (!bytes) return "—"
  const n = parseInt(bytes)
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

interface FileListProps {
  projectId: string
  files: DriveFile[]
  canEdit: boolean
  onRefresh: () => void
}

export function FileList({ projectId, files, canEdit, onRefresh }: FileListProps) {
  const [renaming, setRenaming] = useState<DriveFile | null>(null)
  const [newName, setNewName] = useState("")
  const [working, setWorking] = useState(false)

  async function handleDelete(fileId: string) {
    if (!confirm("Delete this file? This cannot be undone.")) return
    setWorking(true)
    await fetch(`/api/projects/${projectId}/files/${fileId}`, { method: "DELETE" })
    setWorking(false)
    onRefresh()
  }

  async function handleRename(e: React.FormEvent) {
    e.preventDefault()
    if (!renaming) return
    setWorking(true)
    await fetch(`/api/projects/${projectId}/files/${renaming.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    })
    setWorking(false)
    setRenaming(null)
    onRefresh()
  }

  if (files.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-10">
        No files yet. Upload the first one.
      </p>
    )
  }

  return (
    <>
      <div className="divide-y divide-gray-50">
        {files.map((file) => {
          const Icon = fileIcon(file.mimeType)
          return (
            <div
              key={file.id}
              className="flex items-center gap-3 py-3 px-1 hover:bg-gray-50 rounded-lg transition-colors group"
            >
              <div className="p-1.5 rounded-lg bg-gray-100 text-gray-500 shrink-0">
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-400">
                  {formatBytes(file.size)}{" "}
                  {file.modifiedTime && (
                    <>
                      · {formatDistanceToNow(new Date(file.modifiedTime), { addSuffix: true })}
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {file.webViewLink && (
                  <a
                    href={file.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
                {canEdit && (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal size={14} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem
                        onClick={() => { setRenaming(file); setNewName(file.name) }}
                      >
                        <Pencil size={13} className="mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(file.id)}
                        disabled={working}
                      >
                        <Trash2 size={13} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={!!renaming} onOpenChange={(v) => !v && setRenaming(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename file</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRename} className="space-y-4">
            <div className="space-y-1.5">
              <Label>New name</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="bg-gray-50 border-gray-200"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setRenaming(null)}>Cancel</Button>
              <Button type="submit" className="bg-black hover:bg-gray-800 text-white" disabled={working}>
                {working ? <Loader2 size={14} className="animate-spin" /> : "Rename"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
