// Align with Next.js: .env then .env.local (local overrides).
import { config } from "dotenv"
import path from "node:path"
import { defineConfig } from "prisma/config"

const root = process.cwd()
config({ path: path.join(root, ".env") })
config({ path: path.join(root, ".env.local"), override: true })

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
})
