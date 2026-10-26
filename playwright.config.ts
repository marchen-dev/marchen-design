import { defineConfig, devices } from "@playwright/test"

const PORT = 4180

// 截图回归：遍历 gallery 的 story × 明暗 × 强调色（pnpm screenshot / screenshot:update）
// 基准图按平台区分文件名；系统字体在不同系统上渲染不同，基准以 macOS 为准
export default defineConfig({
  testDir: "tests/visual",
  snapshotPathTemplate: "{testDir}/__screenshots__/{arg}-{platform}{ext}",
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 720, height: 480 },
    deviceScaleFactor: 1,
  },
  expect: {
    // 默认 threshold 0.2 会放过灰阶微调（如 0.27 → 0.32），token 回归需要更严格
    toHaveScreenshot: { animations: "disabled", caret: "hide", threshold: 0.02 },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 720, height: 480 }, deviceScaleFactor: 1 } }],
  webServer: {
    command: `pnpm build && pnpm exec vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
