// 生成物一致性：在内存中重新生成，与磁盘上的文件比较（pnpm check:generated）
import { genCatalog } from "./gen-catalog.ts"
import { genPaths } from "./gen-paths.ts"
import { genTokens } from "./gen-tokens.ts"
import { checkMode } from "./lib/generated.ts"

checkMode.enabled = true
await genTokens()
await genPaths()
await genCatalog()

if (checkMode.stale.length) {
  console.error("生成物已过期，请运行 pnpm gen：")
  for (const path of checkMode.stale) console.error(`  ✗ ${path}`)
  process.exit(1)
}
console.log("check-generated：生成物与源头一致")
