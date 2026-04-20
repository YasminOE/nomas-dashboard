/**
 * Creates the database named in DATABASE_URL if it does not exist.
 * Connects via the same host/user/password against the `postgres` maintenance DB.
 */
import pg from "pg"
import { config } from "dotenv"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")
config({ path: path.join(root, ".env") })
config({ path: path.join(root, ".env.local"), override: true })

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
  console.error("DATABASE_URL is not set (.env.local or .env).")
  process.exit(1)
}

const u = new URL(dbUrl)
const dbName = u.pathname.replace(/^\//, "").split("/")[0]
if (!dbName) {
  console.error("Could not parse database name from DATABASE_URL")
  process.exit(1)
}

u.pathname = "/postgres"
const adminUrl = u.toString()

const client = new pg.Client({ connectionString: adminUrl })

try {
  await client.connect()
  const { rows } = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [dbName]
  )
  if (rows.length === 0) {
    await client.query(`CREATE DATABASE ${pg.escapeIdentifier(dbName)}`)
    console.log(`Created database "${dbName}".`)
  } else {
    console.log(`Database "${dbName}" already exists.`)
  }
} finally {
  await client.end().catch(() => {})
}
