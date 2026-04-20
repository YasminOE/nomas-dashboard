"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"

interface FileUploadProps {
  projectId: string
  onUploaded: () => void
}

export function FileUpload({ projectId, onUploaded }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError("")
    setUploading(true)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch(`/api/projects/${projectId}/upload`, {
        method: "POST",
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Upload failed")
      }
      onUploaded()
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        disabled={uploading}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="gap-1.5 border-gray-200 hover:bg-gray-50"
      >
        {uploading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Upload size={14} />
        )}
        {uploading ? "Uploading…" : "Upload file"}
      </Button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
