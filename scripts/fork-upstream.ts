// 把 shadcn 上游组件复制进 registry，作为改写的起点
// 用法：pnpm fork <name...> [--force]
//
// 官方 JSON 里的源码是模板（图标、组件引用都是占位），必须经 CLI 安装到项目后才是可用代码。
// 所以先在 .cache/upstream/app（base-nova + lucide，首次自动创建）里 shadcn add，再复制过来。
import { spawn } from "node:child_process"
import { existsSync } from "node:fs"
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { ROOT } from "./lib/generated.ts"
import { analyzeImports } from "./lib/imports.ts"
import { loadRegistry } from "./lib/registry.ts"

const SHADCN = join(ROOT, "node_modules/.bin/shadcn")
const CACHE = join(ROOT, ".cache/upstream")
const APP = join(CACHE, "app")
const ENV = { ...process.env, npm_config_registry: "https://registry.npmjs.org/", CI: "1" }

const args = process.argv.slice(2)
const force = args.includes("--force")
const names = args.filter((a) => !a.startsWith("--"))

function run(args: string[], cwd: string) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(SHADCN, args, { cwd, env: ENV, stdio: ["ignore", "pipe", "pipe"] })
    let output = ""
    child.stdout.on("data", (d) => (output += d))
    child.stderr.on("data", (d) => (output += d))
    child.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`shadcn ${args.join(" ")} 失败：\n${output.trim().split("\n").slice(-20).join("\n")}`)),
    )
  })
}

const titleCase = (name: string) => name.replace(/(^|-)(\w)/g, (_, sep, c) => (sep ? " " : "") + c.toUpperCase())

async function main() {
  if (!names.length) {
    console.error("用法：pnpm fork <name...> [--force]")
    process.exit(1)
  }

  if (!existsSync(join(APP, "components.json"))) {
    console.log("首次运行：创建上游临时项目 .cache/upstream/app（约 1 分钟）…")
    await rm(APP, { recursive: true, force: true }) // 清理上次失败留下的残留
    await mkdir(CACHE, { recursive: true })
    await writeFile(join(CACHE, ".npmrc"), "registry=https://registry.npmjs.org/\n")
    await run(["init", "-t", "vite", "-b", "base", "-p", "nova", "-n", "app", "--no-monorepo", "-y"], CACHE)
  }

  console.log(`从上游安装：${names.join(" ")}`)
  await run(["add", ...names, "--overwrite", "-y"], APP)

  const version = JSON.parse(await readFile(join(ROOT, "node_modules/shadcn/package.json"), "utf8")).version
  const { items } = await loadRegistry()
  const knownNames = new Set([...items.map((i) => i.item.name), ...names])

  for (const name of names) {
    const src = join(APP, "src/components/ui", `${name}.tsx`)
    const dir = join(ROOT, "registry/ui", name)
    if (!existsSync(src)) {
      console.error(`  ✗ ${name}：上游安装后没有找到 ${name}.tsx`)
      continue
    }
    if (existsSync(dir) && !force) {
      console.warn(`  - ${name}：registry/ui/${name}/ 已存在，跳过（--force 覆盖）`)
      continue
    }
    await mkdir(dir, { recursive: true })
    await copyFile(src, join(dir, `${name}.tsx`))

    const deps = analyzeImports(await readFile(src, "utf8"), knownNames)
    const item = {
      name,
      type: "registry:ui",
      title: titleCase(name),
      description: "TODO：一句话描述",
      dependencies: [...deps.packages].sort(),
      ...(deps.items.size ? { registryDependencies: [...deps.items].sort() } : {}),
      files: [{ path: `${name}.tsx`, type: "registry:ui" }],
      meta: { forkedFrom: `shadcn@${version}/base-nova` },
    }
    const manifest = { $schema: "https://ui.shadcn.com/schema/registry.json", items: [item] }
    await writeFile(join(dir, "registry.json"), JSON.stringify(manifest, null, 2) + "\n")
    console.log(`  ✓ ${name} → registry/ui/${name}/`)
  }

  console.log(`
接下来：
  1. 在 registry/ui/registry.json 的 include 中加入新条目
  2. pnpm gen
  3. 改写源码，补全 registry.json 的 description、meta.usage、meta.avoid，写 stories`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
