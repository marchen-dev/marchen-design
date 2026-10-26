// registry 文件夹 → tsconfig.paths.json
// TS 的 paths 替换值只允许一个 *（TS5062），无法表达 button → button/button.tsx，所以逐条生成
import { existsSync } from "node:fs"
import { readdir } from "node:fs/promises"
import { join } from "node:path"
import { ROOT, writeGenerated } from "./lib/generated.ts"

/** registry 分类目录 → 用户项目中的别名前缀 */
const CATEGORIES = {
  ui: "@/components/ui/",
  blocks: "@/components/",
  lib: "@/lib/",
} as const

export async function genPaths() {
  const paths: Record<string, string[]> = {}

  for (const [category, prefix] of Object.entries(CATEGORIES)) {
    const dir = join(ROOT, "registry", category)
    if (!existsSync(dir)) continue
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries.filter((e) => e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
      const name = entry.name
      const file = [`${name}.tsx`, `${name}.ts`].find((f) => existsSync(join(dir, name, f)))
      if (!file) throw new Error(`registry/${category}/${name}/ 下缺少 ${name}.tsx 或 ${name}.ts`)
      paths[`${prefix}${name}`] = [`./registry/${category}/${name}/${file}`]
    }
  }
  paths["~/*"] = ["./preview/src/*"]

  const content = JSON.stringify({ compilerOptions: { paths } }, null, 2) + "\n"
  await writeGenerated("tsconfig.paths.json", "jsonc", "gen-paths.ts", content)
}

if (import.meta.main) await genPaths()
