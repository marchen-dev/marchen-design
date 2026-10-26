// 冒烟测试：在临时目录里走一遍真实安装流程（pnpm smoke）
//   本地起静态服务 → 以该地址构建 registry → init 新项目 → 校验核心集 → 编译
//   → 命名空间 add → 无命名空间项目按 URL add → 切换强调色 → 安装上游组件
// 选项：--keep 保留临时目录便于排查
import { spawn } from "node:child_process"
import { existsSync } from "node:fs"
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises"
import { createServer } from "node:http"
import type { AddressInfo } from "node:net"
import { tmpdir } from "node:os"
import { extname, join, normalize } from "node:path"
import { core } from "../registry/core.ts"
import { ACCENT_KEYS } from "../tokens/semantic.ts"
import { ROOT } from "./lib/generated.ts"
import { loadRegistry } from "./lib/registry.ts"

const KEEP = process.argv.includes("--keep")
const SHADCN = join(ROOT, "node_modules/.bin/shadcn")
const ENV = { ...process.env, npm_config_registry: "https://registry.npmjs.org/", CI: "1" }

// ───────────────────────── 工具 ─────────────────────────

class StepError extends Error {}

/** 必须异步执行：静态服务和测试在同一进程，同步子进程会阻塞服务响应 */
function run(cmd: string, args: string[], cwd: string, env: NodeJS.ProcessEnv = ENV) {
  return new Promise<string>((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, env, stdio: ["ignore", "pipe", "pipe"] })
    let output = ""
    child.stdout.on("data", (d) => (output += d))
    child.stderr.on("data", (d) => (output += d))
    child.on("error", reject)
    child.on("close", (code) => {
      if (code === 0) return resolve(output)
      const tail = output.trim().split("\n").slice(-25).join("\n")
      reject(new StepError(`命令失败：${cmd} ${args.join(" ")}\n${tail}`))
    })
  })
}

function expect(condition: unknown, message: string): asserts condition {
  if (!condition) throw new StepError(message)
}

let stepNo = 0
async function step(name: string, fn: () => Promise<void> | void) {
  stepNo++
  const started = Date.now()
  process.stdout.write(`  ${stepNo}. ${name} … `)
  try {
    await fn()
    console.log(`✓ ${((Date.now() - started) / 1000).toFixed(1)}s`)
  } catch (error) {
    console.log("✗")
    console.error(`\n冒烟测试失败于第 ${stepNo} 步「${name}」：\n${(error as Error).message}`)
    throw error
  }
}

/** 解析 CSS 中某个选择器块里的自定义属性 */
function cssVars(css: string, selector: string): Record<string, string> {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const body = css.match(new RegExp(`(^|\\n)${escaped}\\s*\\{([^}]*)\\}`))?.[2] ?? ""
  return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
}

function serve(dir: string) {
  const types: Record<string, string> = { ".json": "application/json" }
  const server = createServer(async (req, res) => {
    const path = join(dir, normalize(decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname)))
    if (!path.startsWith(dir) || !existsSync(path)) return res.writeHead(404).end()
    res.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream" })
    res.end(await readFile(path))
  })
  return new Promise<{ url: string; close: () => void }>((resolve) =>
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as AddressInfo
      resolve({ url: `http://127.0.0.1:${port}`, close: () => server.close() })
    }),
  )
}

// ───────────────────────── 期望值 ─────────────────────────

/** base 应安装的 ui 组件：ready 的核心组件 + 它们在本 registry 内的传递依赖 */
async function expectedUiFiles() {
  const { items } = await loadRegistry()
  const byName = new Map(items.map((i) => [i.item.name, i.item]))
  const names = new Set<string>()
  const visit = (name: string) => {
    if (names.has(name)) return
    const item = byName.get(name)
    if (!item) return
    names.add(name)
    for (const dep of item.registryDependencies ?? []) visit(dep.replace("@marchen-design/", ""))
  }
  core.filter((c) => c.ready).forEach((c) => visit(c.name))
  return [...names].filter((n) => byName.get(n)?.type === "registry:ui").map((n) => `${n}.tsx`).sort()
}

// ───────────────────────── 流程 ─────────────────────────

async function main() {
  // registry 构建到临时目录，不污染 public/r
  const tmp = await mkdtemp(join(tmpdir(), "marchen-design-smoke-"))
  const server = await serve(join(tmp, "registry"))
  await writeFile(join(tmp, ".npmrc"), "registry=https://registry.npmjs.org/\n")
  const app = join(tmp, "app")
  const plain = join(tmp, "plain")
  const r = (name: string) => `${server.url}/r/${name}.json`
  console.log(`冒烟测试：registry ${server.url}，临时目录 ${tmp}`)

  try {
    await step("构建 registry", async () => {
      await run("node", ["scripts/build-registry.mjs"], ROOT, {
        ...ENV,
        REGISTRY_URL: server.url,
        REGISTRY_OUTPUT: join(tmp, "registry/r"),
      })
    })

    await step("用 base 初始化新项目", async () => {
      await run(SHADCN, ["init", r("base"), "-t", "vite", "-n", "app", "--no-monorepo", "-y"], tmp)
    })

    await step("校验配置、核心组件与依赖", async () => {
      const config = JSON.parse(await readFile(join(app, "components.json"), "utf8"))
      expect(config.registries?.["@marchen-design"] === `${server.url}/r/{name}.json`, "components.json 缺少 marchen-design 命名空间")
      expect(config.tailwind?.baseColor === "neutral", "baseColor 不是 neutral")

      const installed = (await readdir(join(app, "src/components/ui"))).sort()
      const expected = await expectedUiFiles()
      expect(JSON.stringify(installed) === JSON.stringify(expected), `组件不符：期望 ${expected.join(", ")}，实际 ${installed.join(", ")}`)
      expect(existsSync(join(app, "src/lib/utils.ts")), "缺少 lib/utils.ts")

      const pkg = JSON.parse(await readFile(join(app, "package.json"), "utf8"))
      const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })
      const fonts = deps.filter((d) => /font/i.test(d))
      expect(fonts.length === 0, `不应安装字体包：${fonts.join(", ")}`)

      const button = await readFile(join(app, "src/components/ui/button.tsx"), "utf8")
      expect(button.includes("brand:"), "button 不是 marchen-design 版本")
      expect(!button.includes("cursor-pointer"), "button 含有 cursor-pointer")
    })

    await step("编译新项目", async () => {
      await run("pnpm", ["build"], app)
    })

    await step("按命名空间安装", async () => {
      await rm(join(app, "src/components/ui/button.tsx"))
      await run(SHADCN, ["add", "@marchen-design/button", "-y"], app)
      expect(existsSync(join(app, "src/components/ui/button.tsx")), "button 未安装")
    })

    await step("安装 settings 区块且不覆盖已有组件", async () => {
      await run(SHADCN, ["add", "@marchen-design/settings", "-y"], app)
      for (const file of ["components/settings.tsx", "components/sidebar-nav.tsx"])
        expect(existsSync(join(app, "src", file)), `缺少 ${file}`)
      // 区块依赖必须走命名空间，否则 CLI 会把已有组件替换成上游版本
      const button = await readFile(join(app, "src/components/ui/button.tsx"), "utf8")
      expect(button.includes("brand:"), "button 被替换成了上游版本")
      await run("pnpm", ["build"], app)
    })

    await step("未配置命名空间的项目按 URL 安装", async () => {
      await run(SHADCN, ["init", "-t", "vite", "-b", "base", "-p", "nova", "-n", "plain", "--no-monorepo", "-y"], tmp)
      await rm(join(plain, "src/components/ui/button.tsx"), { force: true })
      await run(SHADCN, ["add", r("button"), "-y"], plain)
      const button = await readFile(join(plain, "src/components/ui/button.tsx"), "utf8")
      expect(button.includes("brand:"), "按 URL 安装的 button 不是 marchen-design 版本")
    })

    await step("切换强调色（accent-green）", async () => {
      const cssPath = join(app, "src/index.css")
      const before = await readFile(cssPath, "utf8")
      await run(SHADCN, ["add", "@marchen-design/accent-green", "-y"], app)
      const after = await readFile(cssPath, "utf8")
      const green = JSON.parse(await readFile(join(tmp, "registry/r/accent-green.json"), "utf8")).cssVars
      for (const [selector, mode] of [[":root", "light"], [".dark", "dark"]] as const) {
        const prev = cssVars(before, selector)
        const next = cssVars(after, selector)
        for (const key of ACCENT_KEYS)
          expect(next[key] === green[mode][key], `${selector} --${key} 应为 ${green[mode][key]}，实际 ${next[key]}`)
        for (const key of Object.keys(prev).filter((k) => !(ACCENT_KEYS as readonly string[]).includes(k)))
          expect(next[key] === prev[key], `${selector} --${key} 不应改变（${prev[key]} → ${next[key]}）`)
      }
    })

    await step("安装上游组件并编译", async () => {
      await run(SHADCN, ["add", "badge", "-y"], app)
      await run("pnpm", ["build"], app)
    })

    console.log("\n冒烟测试全部通过")
  } finally {
    server.close()
    if (KEEP) console.log(`保留临时目录：${tmp}`)
    else await rm(tmp, { recursive: true, force: true })
  }
}

main().catch((error) => {
  if (!(error instanceof StepError)) console.error(error)
  process.exit(1)
})
