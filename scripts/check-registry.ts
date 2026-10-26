// 校验 registry 源码与元数据一致：
//   结构：分类清单 include 了所有子文件夹、files 都存在、stories 不在 files 中
//   依赖：源码 import 与 dependencies / registryDependencies 双向一致
//   元数据：组件、区块缺少 meta.usage 时警告（不失败）
import { existsSync } from "node:fs"
import { readdir, readFile } from "node:fs/promises"
import { join, relative } from "node:path"
import { ROOT } from "./lib/generated.ts"
import { analyzeImports, stripVersion, type ImportDeps } from "./lib/imports.ts"
import { loadRegistry, type LoadedItem } from "./lib/registry.ts"

/** 本仓库手写条目所在的分类（themes 由 gen-tokens 生成，不在此检查） */
const CATEGORIES = ["lib", "ui", "blocks"]

const errors: string[] = []
const warnings: string[] = []
const rel = (p: string) => relative(ROOT, p)

async function checkStructure(included: Set<string>) {
  for (const category of CATEGORIES) {
    const dir = join(ROOT, "registry", category)
    if (!existsSync(dir)) continue
    if (!included.has(join(dir, "registry.json"))) errors.push(`registry/${category}/registry.json 未被根清单 include`)
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const manifest = join(dir, entry.name, "registry.json")
      if (!existsSync(manifest)) errors.push(`registry/${category}/${entry.name}/ 缺少 registry.json`)
      else if (!included.has(manifest))
        errors.push(`registry/${category}/${entry.name}/ 未被 registry/${category}/registry.json include`)
    }
  }
}

async function checkItem({ item, dir, manifest }: LoadedItem, knownNames: Set<string>) {
  const where = `${rel(manifest)} › ${item.name}`
  if ((item.type === "registry:ui" || item.type === "registry:block") && !item.meta?.usage)
    warnings.push(`${where}: 缺少 meta.usage（何时使用）`)

  const used: ImportDeps = { packages: new Set(), items: new Set() }
  for (const file of item.files ?? []) {
    const path = join(dir, file.path)
    if (/\.stories\.[jt]sx?$/.test(file.path)) errors.push(`${where}: story 文件 ${file.path} 不应出现在 files 中`)
    if (!existsSync(path)) {
      errors.push(`${where}: files 中的 ${file.path} 不存在`)
      continue
    }
    analyzeImports(await readFile(path, "utf8"), knownNames, used)
  }
  if (!item.files?.length) return // 主题、base 等没有源码的条目只检查元数据

  const declaredPackages = new Set((item.dependencies ?? []).map(stripVersion))
  const declaredItems = new Set(item.registryDependencies ?? [])
  for (const p of used.packages) if (!declaredPackages.has(p)) errors.push(`${where}: 缺少 npm 依赖 ${p}`)
  for (const p of declaredPackages) if (!used.packages.has(p)) errors.push(`${where}: npm 依赖 ${p} 是多余的（源码未引用）`)
  for (const i of used.items) if (!declaredItems.has(i)) errors.push(`${where}: 缺少 registry 依赖 ${i}`)
  for (const i of declaredItems) if (!used.items.has(i)) errors.push(`${where}: registry 依赖 ${i} 是多余的（源码未引用）`)
}

export async function checkRegistry(): Promise<boolean> {
  const { items, included, missing } = await loadRegistry()
  for (const m of missing) errors.push(`${rel(m.manifest)}: include 的 ${m.include} 不存在`)
  await checkStructure(included)

  const knownNames = new Set(items.map((i) => i.item.name))
  const seen = new Set<string>()
  for (const loaded of items) {
    if (seen.has(loaded.item.name)) errors.push(`条目名重复：${loaded.item.name}`)
    seen.add(loaded.item.name)
    await checkItem(loaded, knownNames)
  }

  for (const w of warnings) console.warn(`  ⚠ ${w}`)
  for (const e of errors) console.error(`  ✗ ${e}`)
  console.log(errors.length ? `check-registry：${errors.length} 个错误` : `check-registry：${items.length} 个条目通过`)
  return errors.length === 0
}

if (import.meta.main && !(await checkRegistry())) process.exit(1)
