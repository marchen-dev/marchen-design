// 沿 include 递归加载 registry 源码清单（check-registry、gen-catalog 共用）
import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { ROOT } from "./generated.ts"

export interface Item {
  name: string
  type: string
  title?: string
  description?: string
  dependencies?: string[]
  registryDependencies?: string[]
  files?: { path: string; type?: string }[]
  meta?: { usage?: string; avoid?: string[]; forkedFrom?: string }
}

export interface LoadedItem {
  item: Item
  /** 声明该条目的清单所在目录，files[].path 相对于它 */
  dir: string
  manifest: string
}

interface RegistryFile {
  include?: string[]
  items?: Item[]
}

export interface LoadResult {
  items: LoadedItem[]
  /** 被 include 引用到的清单绝对路径 */
  included: Set<string>
  /** include 指向了不存在的文件 */
  missing: { manifest: string; include: string }[]
}

export async function loadRegistry(manifest = join(ROOT, "registry.json")): Promise<LoadResult> {
  const result: LoadResult = { items: [], included: new Set(), missing: [] }
  await walk(manifest, result)
  return result
}

async function walk(manifest: string, result: LoadResult) {
  const data = JSON.parse(await readFile(manifest, "utf8")) as RegistryFile
  for (const inc of data.include ?? []) {
    const path = join(dirname(manifest), inc)
    if (!existsSync(path)) {
      result.missing.push({ manifest, include: inc })
      continue
    }
    result.included.add(path)
    await walk(path, result)
  }
  for (const item of data.items ?? []) result.items.push({ item, dir: dirname(manifest), manifest })
}
