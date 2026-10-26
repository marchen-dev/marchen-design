// registry 条目元数据 → plugin 的组件目录（components.md）
import { core } from "../registry/core.ts"
import { writeGenerated } from "./lib/generated.ts"
import { loadRegistry, type Item } from "./lib/registry.ts"

/** base 会安装的条目：ready 的核心组件及其在本 registry 内的传递依赖（如 field → label、separator） */
function baseClosure(items: Item[]): Set<string> {
  const byName = new Map(items.map((i) => [i.name, i]))
  const result = new Set<string>()
  const visit = (name: string) => {
    if (result.has(name) || !byName.has(name)) return
    result.add(name)
    for (const dep of byName.get(name)!.registryDependencies ?? []) visit(dep.replace("@marchen-design/", ""))
  }
  core.filter((c) => c.ready).forEach((c) => visit(c.name))
  return result
}

let inBase = new Set<string>()

function section(item: Item): string {
  const lines = [`### ${item.name}`, "", item.description ?? "", ""]
  if (item.meta?.usage) lines.push(`**何时使用**：${item.meta.usage}`, "")
  if (item.meta?.avoid?.length) lines.push("**不要这样用**：", ...item.meta.avoid.map((a) => `- ${a}`), "")
  if (!inBase.has(item.name)) lines.push(`安装：\`npx shadcn@latest add @marchen-design/${item.name}\``, "")
  return lines.join("\n")
}

export async function genCatalog() {
  const { items } = await loadRegistry()
  inBase = baseClosure(items.map((i) => i.item))
  const byType = (type: string) => items.map((i) => i.item).filter((i) => i.type === type)
  const ui = byType("registry:ui")
  const blocks = byType("registry:block")
  const coreItems = ui.filter((i) => inBase.has(i.name))
  const extraItems = ui.filter((i) => !inBase.has(i.name))
  const pending = core.filter((c) => !c.ready).map((c) => `\`${c.name}\``)

  const parts = [
    "# 组件目录",
    "",
    "需要组件时先查这里：已有的直接使用或安装，不要手写一个长得差不多的。",
    "",
    "## 核心组件（base 初始化时已安装）",
    "",
    ...coreItems.map(section),
  ]
  if (pending.length)
    parts.push(
      `> 以下核心组件尚未改写完成，暂时可从 shadcn 官方安装（\`npx shadcn@latest add <name>\`），会自动使用本设计系统的 token：${pending.join("、")}`,
      "",
    )
  parts.push("## 其他组件（按需安装）", "", ...(extraItems.length ? extraItems.map(section) : ["暂无。", ""]))
  parts.push("## 区块（按需安装）", "", ...(blocks.length ? blocks.map(section) : ["暂无。", ""]))

  await writeGenerated("plugin/skills/design/references/components.md", "md", "gen-catalog.ts", parts.join("\n"))
}

if (import.meta.main) await genCatalog()
