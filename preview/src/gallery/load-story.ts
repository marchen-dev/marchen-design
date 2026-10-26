// iframe 单格用：按 story id 只加载对应的那一个 *.stories.tsx
import { groupIdFromPath, toGroup, type StoryModule } from "./csf"

const loaders = import.meta.glob<StoryModule>(["../../../registry/**/*.stories.tsx", "../demos/**/*.stories.tsx"])

export async function loadStory(storyId: string) {
  const groupId = storyId.split("--")[0]
  const path = Object.keys(loaders).find((p) => groupIdFromPath(p) === groupId)
  if (!path) return undefined
  const group = toGroup(await loaders[path]())
  const story = group.stories.find((s) => s.id === storyId)
  return story ? { group, story } : undefined
}
