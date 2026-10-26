// CSF 解析与 gallery 共用定义。不含任何 import.meta.glob：
// 文档站外壳（stories.ts，一次性加载全部）和 iframe 单格（load-story.ts，只加载一个）都依赖这里
import type { ComponentType } from "react"

export interface StoryMeta {
  title: string
  parameters?: {
    /** 含弹层的 story 需要给 iframe 留出弹层空间 */
    minHeight?: number
    /** page：整页 demo，矩阵中每行一个格子，截图用更宽的视口 */
    layout?: "page"
  }
}

export interface StoryModule {
  default: StoryMeta
  /** 具名导出的声明顺序：由 vite-plugin-csf-order 构建时注入，也可以在 story 文件里显式导出 */
  __namedExportsOrder?: string[]
  [exportName: string]: ComponentType | StoryMeta | string[] | undefined
}

export interface Story {
  id: string
  name: string
  Component: ComponentType
}

export interface StoryGroup {
  /** 组件级 id，如 ui-button */
  id: string
  title: string
  meta: StoryMeta
  stories: Story[]
}

/** Storybook 的 sanitize：小写，非字母数字转成 -，去掉首尾 - */
export const sanitize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

/** 具名导出转展示名：WithIcon → With Icon */
const startCase = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, "$1 $2")

/**
 * 由文件路径推出分组 id，iframe 据此只加载需要的那一个文件：
 *   registry/ui/dropdown-menu/dropdown-menu.stories.tsx → ui-dropdown-menu
 *   registry/blocks/settings-row/...                    → blocks-settings-row
 *   demos/settings-dialog.stories.tsx                    → demos-settings-dialog
 * 约定：story 的 title 必须与之对应（"UI/Dropdown Menu"、"Demos/Settings Dialog"），stories.ts 会校验
 */
export function groupIdFromPath(path: string): string | undefined {
  const registry = path.match(/registry\/([^/]+)\/([^/]+)\/[^/]+\.stories\.tsx$/)
  if (registry) return `${registry[1]}-${registry[2]}`
  const demo = path.match(/demos\/([^/]+)\.stories\.tsx$/)
  if (demo) return `demos-${demo[1]}`
  return undefined
}

export function toGroup(mod: StoryModule): StoryGroup {
  const meta = mod.default
  const id = sanitize(meta.title)
  // 命名空间对象的键按字母排序，优先用注入的声明顺序
  const order = mod.__namedExportsOrder ?? Object.keys(mod)
  const stories = order
    .map((key) => [key, mod[key]] as const)
    .filter(([key, value]) => key !== "default" && key !== "__namedExportsOrder" && typeof value === "function")
    .map(([key, value]) => ({
      id: `${id}--${sanitize(key)}`,
      name: startCase(key),
      Component: value as ComponentType,
    }))
  return { id, title: meta.title, meta, stories }
}

/** 预览矩阵：明暗 × 强调色。截图回归遍历同一份定义 */
export const THEMES = ["light", "dark"] as const
export const ACCENTS = ["blue", "green"] as const
export type Theme = (typeof THEMES)[number]
export type Accent = (typeof ACCENTS)[number]

export const frameUrl = (storyId: string, theme: Theme, accent: Accent) =>
  `frame.html?story=${encodeURIComponent(storyId)}&theme=${theme}&accent=${accent}`

/** iframe 向外层上报内容高度的消息类型 */
export const FRAME_HEIGHT_MESSAGE = "marchen-design:frame-height"
