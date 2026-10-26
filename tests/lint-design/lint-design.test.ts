import assert from "node:assert/strict"
import { join } from "node:path"
import { test } from "node:test"
// @ts-expect-error 零依赖的 .mjs 脚本没有类型声明
import { lintPaths } from "../../plugin/skills/design-review/scripts/lint-design.mjs"

interface Violation {
  line: number
  rule: string
  match: string
}
const lint = (name: string): Violation[] => lintPaths([join(import.meta.dirname, "fixtures", name)]).violations

test("每条规则都能命中", () => {
  const hits = lint("violations.html").map((v) => `${v.line}:${v.rule}:${v.match}`)
  const expected = [
    "1:gradient:bg-gradient-to-r",
    "1:gradient:from-indigo-500",
    "1:palette-color:from-indigo-500",
    "1:gradient:to-violet-500",
    "1:palette-color:to-violet-500",
    "2:gradient:bg-linear-to-r",
    "3:palette-color:text-purple-600",
    "3:palette-color:hover:bg-blue-500/20",
    "4:palette-color:bg-zinc-900",
    "5:arbitrary-color:bg-[#6366f1]",
    "5:arbitrary-color:text-[oklch(0.6_0.2_280)]",
    "6:large-shadow:shadow-xl",
    "7:cursor-pointer:cursor-pointer",
    "8:backdrop-blur:backdrop-blur-md",
    "9:gradient:linear-gradient(",
    "9:cursor-pointer:cursor: pointer",
  ]
  assert.deepEqual(hits.sort(), expected.sort())
})

test("允许的写法不误报", () => {
  assert.deepEqual(lint("allowed.html"), [])
})
