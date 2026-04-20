export type ProjectStatus = "active" | "paused" | "exited"
export type ProjectRole = "owner" | "editor" | "viewer"

export interface ProjectWithMembers {
  id: string
  name: string
  description: string | null
  status: string
  driveFolderId: string
  createdAt: Date
  members: {
    id: string
    role: string
    user: {
      id: string
      name: string
      email: string
    }
  }[]
}

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  size: string | null
  createdTime: string | null
  modifiedTime: string | null
  webViewLink: string | null
}

declare module "next-auth" {
  interface User {
    id: string
    isAdmin: boolean
  }
  interface Session {
    user: {
      id: string
      name: string
      email: string
      isAdmin: boolean
    }
  }
}
