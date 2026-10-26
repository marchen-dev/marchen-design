/// <reference lib="dom" />
import { expect, test } from "@playwright/test"

const frame = (story: string) => `/frame.html?story=${story}&theme=light&accent=blue`

test("SettingsRow：点击名称切换开关，控件带有可访问名称", async ({ page }) => {
  await page.goto(frame("blocks-settings--sectionandrows"))
  await page.waitForSelector("html[data-ready=true]")

  const toggle = page.getByRole("switch", { name: "开机启动" })
  await expect(toggle).toHaveAttribute("aria-checked", "true")
  await page.getByText("开机启动", { exact: true }).click()
  await expect(toggle).toHaveAttribute("aria-checked", "false")

  await expect(page.getByRole("combobox", { name: "颜色模式" })).toBeVisible()
})

test("SettingsDialog：打开时焦点在内容区，不在导航项上", async ({ page }) => {
  await page.goto(frame("demos-settings-dialog--general"))
  await page.waitForSelector("html[data-ready=true]")
  await expect(page.getByRole("dialog", { name: "设置" })).toBeVisible()

  const focused = await page.evaluate(() => document.activeElement?.getAttribute("data-slot"))
  expect(focused).toBe("settings-shell-content")
  await expect(page.locator("[data-slot=settings-shell-nav] button:focus-visible")).toHaveCount(0)
})

test("SidebarNavItem：当前项带 aria-current", async ({ page }) => {
  await page.goto(frame("blocks-sidebar-nav--buttons"))
  await page.waitForSelector("html[data-ready=true]")
  await expect(page.locator("[aria-current=page]")).toHaveText("外观")
  await page.getByRole("button", { name: "通知" }).click()
  await expect(page.locator("[aria-current=page]")).toHaveText("通知")
})
