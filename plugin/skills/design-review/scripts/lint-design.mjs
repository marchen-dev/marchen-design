#!/usr/bin/env node
// marchen-design 设计规则检查（零依赖）
// 用法：node lint-design.mjs [目录或文件...]   默认检查当前目录
// 豁免：在同一行或上一行写 lint-design-ignore
// 退出码：0 无违规，1 有违规
import { readdirSync, readFileSync, statSync } from "node:fs"
import { extname, join, relative } from "node:path"

const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".css", ".html", ".vue", ".svelte", ".mdx"])
const SKIP_DIRS = new Set(["node_modules", "dist", "build", ".git", ".next", "coverage", "public"])

const PALETTE =
  "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone"
const COLOR_UTILITIES =
  "bg|text|border|border-[xytrbl]|ring|ring-offset|outline|fill|stroke|shadow|decoration|divide|accent|caret|placeholder|from|via|to"

/** 浮层：弹出层、弹窗、提示等，允许较大的阴影 */
const isFloating = (line) => /(^|[\s"'`])(z-\d+|z-\[|fixed|origin-\(--transform-origin\))/.test(line)
/** 遮罩层：允许轻微模糊 */
const isOverlay = (line) => /inset-0|bg-overlay/.test(line)

/** 作用在单个工具类上的规则（已去掉 hover:、dark: 等变体前缀） */
const UTILITY_RULES = [
  {
    id: "gradient",
    message: "禁止渐变",
    test: (u) => /^bg-(gradient|linear|radial|conic)(-|$)/.test(u) || /^(from|via|to)-[a-z[#]/.test(u),
  },
  {
    id: "palette-color",
    message: "禁止直接使用 Tailwind 调色板颜色，改用语义 token（primary、muted、border 等）",
    test: (u) => new RegExp(`^-?(${COLOR_UTILITIES})-(${PALETTE})-\\d+(\\/\\d+)?$`).test(u),
  },
  {
    id: "arbitrary-color",
    message: "禁止写死色值，改用语义 token",
    test: (u) => /-\[(#[0-9a-fA-F]{3,8}|(rgb|rgba|hsl|hsla|oklch|oklab|lab|lch)\()/.test(u),
  },
  {
    id: "large-shadow",
    message: "shadow-lg 及以上只能用于浮层（弹出层、弹窗、提示）",
    test: (u, line) => /^shadow-(lg|xl|2xl)$/.test(u) && !isFloating(line),
  },
  {
    id: "cursor-pointer",
    message: "交互元素保持系统默认指针，不用 cursor-pointer",
    test: (u) => u === "cursor-pointer",
  },
  {
    id: "backdrop-blur",
    message: "毛玻璃只允许用于遮罩层，内容层不用",
    test: (u, line) => /^backdrop-blur(-|$)/.test(u) && !isOverlay(line),
  },
]

/** 作用在原始文本上的规则（CSS、内联样式） */
const RAW_RULES = [
  { id: "gradient", message: "禁止渐变", pattern: /\b(linear|radial|conic)-gradient\(/g },
  { id: "cursor-pointer", message: "交互元素保持系统默认指针，不用 cursor: pointer", pattern: /cursor:\s*pointer/g },
]

/** 去掉变体前缀和 ! 修饰：dark:hover:!bg-red-500 → bg-red-500（不切分方括号内的冒号） */
function baseUtility(token) {
  let depth = 0
  let start = 0
  for (let i = 0; i < token.length; i++) {
    const ch = token[i]
    if (ch === "[" || ch === "(") depth++
    else if (ch === "]" || ch === ")") depth--
    else if (ch === ":" && depth === 0) start = i + 1
  }
  return token.slice(start).replace(/^!|!$/g, "")
}

function lintText(text, file) {
  const violations = []
  const lines = text.split("\n")
  lines.forEach((line, index) => {
    if (line.includes("lint-design-ignore") || lines[index - 1]?.includes("lint-design-ignore")) return
    const push = (rule, column, match) =>
      violations.push({ file, line: index + 1, column: column + 1, rule: rule.id, message: rule.message, match })

    for (const m of line.matchAll(/[^\s"'`{}<>=,;]+/g)) {
      const utility = baseUtility(m[0])
      for (const rule of UTILITY_RULES) if (rule.test(utility, line)) push(rule, m.index, m[0])
    }
    for (const rule of RAW_RULES) for (const m of line.matchAll(rule.pattern)) push(rule, m.index, m[0])
  })
  return violations
}

function collectFiles(path, out) {
  const stat = statSync(path)
  if (stat.isFile()) {
    if (EXTENSIONS.has(extname(path))) out.push(path)
    return out
  }
  for (const entry of readdirSync(path)) {
    if (SKIP_DIRS.has(entry) || entry.startsWith(".")) continue
    collectFiles(join(path, entry), out)
  }
  return out
}

export function lintPaths(paths) {
  const files = paths.flatMap((p) => collectFiles(p, []))
  return { files, violations: files.flatMap((f) => lintText(readFileSync(f, "utf8"), f)) }
}

const isMain = import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("lint-design.mjs")
if (isMain) {
  const targets = process.argv.slice(2)
  const { files, violations } = lintPaths(targets.length ? targets : ["."])
  for (const v of violations)
    console.log(`${relative(process.cwd(), v.file)}:${v.line}:${v.column}  ${v.rule}  ${v.match}\n    ${v.message}`)
  console.log(
    violations.length
      ? `\nlint-design：${violations.length} 处违规（${files.length} 个文件）`
      : `lint-design：${files.length} 个文件，无违规`,
  )
  process.exit(violations.length ? 1 : 0)
}
