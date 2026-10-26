// 文档站外壳用：一次性加载全部 *.stories.tsx，用于导航和矩阵
// title 以 "Demos/" 开头的是完整页面 demo，在导航中归入 demos 区
// story id 采用 Storybook 的规则，以后迁移到 Storybook 时地址保持不变
// iframe 单格不要引用本模块（会把所有 story 都加载一遍），用 load-story.ts
// glob 范围需与 load-story.ts 保持一致（import.meta.glob 只接受字面量，无法共用常量）
import { groupIdFromPath, toGroup, type StoryGroup, type StoryModule } from "./csf"

export * from "./csf"

const modules = import.meta.glob<StoryModule>(
  ["../../../registry/**/*.stories.tsx", "../demos/**/*.stories.tsx"],
  { eager: true },
)

export const groups: StoryGroup[] = Object.entries(modules)
  .map(([path, mod]) => {
    const group = toGroup(mod)
    // iframe 靠文件路径找 story，title 必须与文件夹 / 文件名对应
    const expected = groupIdFromPath(path)
    if (group.id !== expected)
      throw new Error(
        `story 的 title "${group.title}" 与文件路径 ${path} 不对应：期望 id 为 "${expected}"，实际为 "${group.id}"`,
      )
    return group
  })
  .sort((a, b) => a.title.localeCompare(b.title))

export const isDemo = (group: StoryGroup) => group.title.startsWith("Demos/")
export const isBlock = (group: StoryGroup) => group.title.startsWith("Blocks/")
