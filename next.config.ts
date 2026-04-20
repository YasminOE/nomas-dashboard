import type { NextConfig } from "next"
import path from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = path.dirname(fileURLToPath(import.meta.url))
const nm = (...parts: string[]) => path.join(projectRoot, "node_modules", ...parts)

const nextConfig: NextConfig = {
  /*
   * Pin workspace root and CSS tooling resolution to this app. Otherwise a
   * package.json higher up (e.g. ~/) can make Turbopack resolve `tailwindcss`
   * from the wrong directory (e.g. `/Users/.../Developer` instead of here).
   */
  turbopack: {
    root: projectRoot,
    resolveAlias: {
      tailwindcss: nm("tailwindcss"),
      "@tailwindcss/postcss": nm("@tailwindcss/postcss"),
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      tailwindcss: nm("tailwindcss"),
      "@tailwindcss/postcss": nm("@tailwindcss/postcss"),
    }
    return config
  },
}

export default nextConfig;
