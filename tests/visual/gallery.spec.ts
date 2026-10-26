/// <reference lib="dom" />
import { expect, test } from "@playwright/test"

interface Gallery {
  stories: { id: string; layout?: "page" }[]
  themes: string[]
  accents: string[]
}

// 由 preview/src/App.tsx 在页面上设置
declare global {
  interface Window {
    __MARCHEN_GALLERY__?: Gallery
  }
}

test("gallery 所有格子与基准一致", async ({ page }) => {
  // story 清单由预览站在运行时收集，这里从页面读取，和 gallery 使用同一份定义
  await page.goto("/")
  const gallery = await page.waitForFunction(() => window.__MARCHEN_GALLERY__).then((h) => h.jsonValue() as Promise<Gallery>)
  expect(gallery.stories.length).toBeGreaterThan(0)

  for (const { id, layout } of gallery.stories) {
    // 整页 demo 用更大的视口（弹窗相对视口居中，视口要比弹窗高）；组件 story 用 720×480
    await page.setViewportSize(layout === "page" ? { width: 1024, height: 720 } : { width: 720, height: 480 })
    for (const theme of gallery.themes) {
      for (const accent of gallery.accents) {
        await page.goto(`/frame.html?story=${encodeURIComponent(id)}&theme=${theme}&accent=${accent}`)
        await page.waitForSelector("html[data-ready=true]")
        await page.evaluate(() => document.fonts.ready)
        // 整页截图：弹层通过 portal 挂在 body 下，只拍 #root 会漏掉打开状态的弹层
        // 软断言：一个格子不一致不影响继续比较其余格子，最后统一报告
        await expect.soft(page).toHaveScreenshot(`${id}--${theme}-${accent}.png`, { fullPage: true })
      }
    }
  }
})
