// 运行全部生成器（pnpm gen）
import { genCatalog } from "./gen-catalog.ts"
import { genPaths } from "./gen-paths.ts"
import { genTokens } from "./gen-tokens.ts"

await genTokens()
await genPaths()
await genCatalog()
