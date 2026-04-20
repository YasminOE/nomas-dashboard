import { google } from "googleapis"
import { Readable } from "stream"

function getDriveClient() {
  const keyJson = Buffer.from(
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY ?? "",
    "base64"
  ).toString("utf-8")

  const key = JSON.parse(keyJson)

  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ["https://www.googleapis.com/auth/drive"],
  })

  return google.drive({ version: "v3", auth })
}

export async function createDriveFolder(name: string): Promise<string> {
  const drive = getDriveClient()
  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
    },
    fields: "id",
  })
  return res.data.id!
}

export async function listDriveFiles(folderId: string) {
  const drive = getDriveClient()
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: "files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink)",
    orderBy: "modifiedTime desc",
  })
  return res.data.files ?? []
}

export async function uploadDriveFile(
  folderId: string,
  fileName: string,
  mimeType: string,
  buffer: Buffer
) {
  const drive = getDriveClient()
  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: "id, name, webViewLink",
  })
  return res.data
}

export async function renameDriveFile(fileId: string, newName: string) {
  const drive = getDriveClient()
  await drive.files.update({
    fileId,
    requestBody: { name: newName },
  })
}

export async function deleteDriveFile(fileId: string) {
  const drive = getDriveClient()
  await drive.files.delete({ fileId })
}

export async function getDriveFile(fileId: string) {
  const drive = getDriveClient()
  const res = await drive.files.get({
    fileId,
    fields: "id, name, mimeType, size, webViewLink",
  })
  return res.data
}
