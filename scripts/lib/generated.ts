// 生成器共用：统一的"勿手改"标记 + 写文件
import { existsSync } from "node:fs"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"

export const ROOT = resolve(import.meta.dirname, "../..")

export const notice = (script: string) => `由 scripts/${script} 生成，勿手改。修改源头后运行 pnpm gen`

type Format = "css" | "md" | "jsonc" | "json"

/** 按文件格式加上生成标记。json 不支持注释，标记写进顶层 "$generated" 字段 */
export function withNotice(format: Format, script: string, content: string): string {
  const text = notice(script)
  switch (format) {
    case "css":
      return `/* ${text} */\n\n${content}`
    case "md":
      return `<!-- ${text} -->\n\n${content}`
    case "jsonc":
      return `// ${text}\n${content}`
    case "json": {
      const data = JSON.parse(content)
      return JSON.stringify({ $generated: text, ...data }, null, 2) + "\n"
    }
  }
}

/** 检查模式：只比较不写入，用于 check-generated（不依赖 git，未提交的文件也能检查） */
export const checkMode = { enabled: false, stale: [] as string[] }

export async function writeGenerated(path: string, format: Format, script: string, content: string) {
  const abs = resolve(ROOT, path)
  const next = withNotice(format, script, content)
  if (checkMode.enabled) {
    const current = existsSync(abs) ? await readFile(abs, "utf8") : null
    if (current !== next) checkMode.stale.push(path)
    return
  }
  await mkdir(dirname(abs), { recursive: true })
  await writeFile(abs, next)
  console.log(`  generated ${path}`)
}
