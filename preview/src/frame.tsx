// iframe 单格：?story=<id>&theme=light|dark&accent=<name>
// 主题挂在 <html> 上，与用户项目一致；弹层 portal 到本文档的 body，自然跟随主题
// 只加载这一个 story 所在的文件（load-story.ts），不要引用 gallery/stories（会加载全部 story）
import { StrictMode, useEffect, useRef } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { FRAME_HEIGHT_MESSAGE } from "~/gallery/csf"
import { loadStory } from "~/gallery/load-story"

const params = new URLSearchParams(location.search)
const storyId = params.get("story") ?? ""
const html = document.documentElement
html.classList.toggle("dark", params.get("theme") === "dark")
html.dataset.accent = params.get("accent") ?? "blue"

const found = await loadStory(storyId)

function Frame() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 截图脚本等待这个标记（找不到 story 时也要设置，避免一直等待）
    html.dataset.ready = "true"
    const el = ref.current
    if (!el) return
    // 上报内容高度，外层 iframe 据此自适应
    const report = () =>
      window.parent.postMessage({ type: FRAME_HEIGHT_MESSAGE, height: el.offsetHeight }, "*")
    const observer = new ResizeObserver(report)
    observer.observe(el)
    report()
    return () => observer.disconnect()
  }, [])

  if (!found) return <p className="p-4 text-sm text-destructive">找不到 story：{storyId}</p>
  const { group, story } = found
  return (
    <div ref={ref} className="p-4" style={{ minHeight: group.meta.parameters?.minHeight }}>
      <story.Component />
    </div>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Frame />
  </StrictMode>,
)
