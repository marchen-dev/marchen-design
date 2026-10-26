import { groups, THEMES, ACCENTS } from "~/gallery/stories"
import { Shell } from "~/site/Shell"

// 供截图脚本读取的 story 清单与矩阵定义
declare global {
  interface Window {
    __MARCHEN_GALLERY__?: {
      stories: { id: string; layout?: "page" }[]
      themes: readonly string[]
      accents: readonly string[]
    }
  }
}
window.__MARCHEN_GALLERY__ = {
  stories: groups.flatMap((g) => g.stories.map((s) => ({ id: s.id, layout: g.meta.parameters?.layout }))),
  themes: THEMES,
  accents: ACCENTS,
}

export function App() {
  return <Shell />
}

export default App
