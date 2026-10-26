// 构建 registry：shadcn build → 产物后处理
//   1. {{REGISTRY_URL}} 替换为部署地址
//   2. registryDependencies 里的 @marchen-design/xxx 改写为绝对 URL，
//      让未配置命名空间的项目也能直接 `shadcn add <url>`
//   3. files[].path 去掉条目文件夹这一层：registry/ui/button/button.tsx → registry/ui/button.tsx
//      CLI 按这个路径计算安装位置，不去掉会装成 components/ui/button/button.tsx
// 用法：[REGISTRY_URL=https://design.suemor.com] [REGISTRY_OUTPUT=public/r] node scripts/build-registry.mjs
//   本地调试 registry 时传 REGISTRY_URL=http://localhost:4173（pnpm preview 的地址）
import { execFileSync } from "node:child_process"
import { readdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"

const REGISTRY_URL = (process.env.REGISTRY_URL ?? "https://design.suemor.com").replace(/\/$/, "")
const OUTPUT_DIR = process.env.REGISTRY_OUTPUT ?? "public/r"
const NAMESPACE = "@marchen-design/"

const flattenPath = (path) => path.replace(/^registry\/([^/]+)\/[^/]+\/(.+)$/, "registry/$1/$2")

const toUrl = (dep) =>
  dep.startsWith(NAMESPACE) ? `${REGISTRY_URL}/r/${dep.slice(NAMESPACE.length)}.json` : dep

execFileSync("shadcn", ["build", "--output", OUTPUT_DIR], { stdio: "inherit" })

for (const file of await readdir(OUTPUT_DIR)) {
  if (!file.endsWith(".json")) continue
  const path = join(OUTPUT_DIR, file)
  const data = JSON.parse((await readFile(path, "utf8")).replaceAll("{{REGISTRY_URL}}", REGISTRY_URL))
  // registry.json 是条目清单，其余是单个条目
  for (const item of data.items ?? [data]) {
    if (item.registryDependencies) item.registryDependencies = item.registryDependencies.map(toUrl)
    for (const file of item.files ?? []) file.path = flattenPath(file.path)
  }
  await writeFile(path, JSON.stringify(data, null, 2) + "\n")
}

console.log(`registry built → ${OUTPUT_DIR} (REGISTRY_URL=${REGISTRY_URL})`)
