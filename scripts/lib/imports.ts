// 从源码 import 推导 registry 条目的依赖（check-registry、fork-upstream 共用）
import ts from "typescript"

export const NAMESPACE = "@marchen-design/"

/** 运行时自带、不需要声明的包 */
const IMPLICIT_PACKAGES = new Set(["react", "react-dom"])

/** 用户项目中的别名前缀（顺序重要：ui 要先于 components 匹配） */
const ALIAS_PREFIXES = ["@/components/ui/", "@/lib/", "@/components/"]

export const packageName = (spec: string) => {
  const parts = spec.split("/")
  return spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]
}

/** dependencies 里可能写成 pkg@^1.0.0 */
export const stripVersion = (dep: string) => dep.replace(/(?<=.)@[^/]*$/, "")

/** 别名 import → registry 依赖：本 registry 有的条目写命名空间形式，没有的视为 shadcn 上游条目 */
export function resolveAlias(spec: string, knownNames: Set<string>): string | null {
  for (const prefix of ALIAS_PREFIXES) {
    if (!spec.startsWith(prefix)) continue
    const name = spec.slice(prefix.length).split("/")[0]
    return knownNames.has(name) ? `${NAMESPACE}${name}` : name
  }
  return null
}

export interface ImportDeps {
  packages: Set<string>
  items: Set<string>
}

/** 解析一段源码的 import / re-export / 动态 import，归类为 npm 包和 registry 条目 */
export function analyzeImports(source: string, knownNames: Set<string>, into?: ImportDeps): ImportDeps {
  const deps = into ?? { packages: new Set(), items: new Set() }
  for (const { fileName: spec } of ts.preProcessFile(source, true, true).importedFiles) {
    if (spec.startsWith(".")) continue
    const alias = resolveAlias(spec, knownNames)
    if (alias) deps.items.add(alias)
    else if (!IMPLICIT_PACKAGES.has(packageName(spec))) deps.packages.add(packageName(spec))
  }
  return deps
}
