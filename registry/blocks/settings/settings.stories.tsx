import { BellIcon, PaletteIcon, Settings2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  SettingsBody,
  SettingsFooter,
  SettingsHeader,
  SettingsRow,
  SettingsSection,
  SettingsShell,
  SettingsShellContent,
  SettingsShellNav,
} from "@/components/settings"
import { SidebarNavItem } from "@/components/sidebar-nav"

export default { title: "Blocks/Settings", parameters: { layout: "page" } }

const themes = [
  { label: "跟随系统", value: "system" },
  { label: "浅色", value: "light" },
  { label: "深色", value: "dark" },
]

/** 分组与行：有说明 / 无说明 / 多个控件 */
export const SectionAndRows = () => (
  <div className="max-w-xl bg-background p-6">
    <SettingsSection title="行为" description="这些设置会立即生效。">
      <SettingsRow label="开机启动" description="登录系统后自动在后台运行。">
        <Switch defaultChecked />
      </SettingsRow>
      <SettingsRow label="颜色模式">
        <Select items={themes} defaultValue="system">
          <SelectTrigger size="sm" className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {themes.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingsRow>
      <SettingsRow label="下载目录" description="新下载的文件会保存在这里。">
        <Input defaultValue="~/Downloads" className="h-7 w-40" />
        <Button variant="secondary" size="sm">
          选择…
        </Button>
      </SettingsRow>
    </SettingsSection>
  </div>
)

/** 页面形态：SettingsShell 放在固定高度的容器中，只有内容区滚动 */
export const ShellInPage = () => (
  <div className="h-[420px] overflow-hidden rounded-lg ring-1 ring-foreground/10">
    <SettingsShell>
      <SettingsShellNav>
        <SidebarNavItem icon={<Settings2Icon />} active>
          通用
        </SidebarNavItem>
        <SidebarNavItem icon={<PaletteIcon />}>外观</SidebarNavItem>
        <SidebarNavItem icon={<BellIcon />}>通知</SidebarNavItem>
      </SettingsShellNav>
      <SettingsShellContent>
        <SettingsHeader title="通用" description="应用的基础行为。" />
        <SettingsBody>
          {["启动", "更新", "隐私"].map((group) => (
            <SettingsSection key={group} title={group}>
              <SettingsRow label={`${group}选项一`} description="一行说明文字。">
                <Switch defaultChecked />
              </SettingsRow>
              <SettingsRow label={`${group}选项二`}>
                <Switch />
              </SettingsRow>
            </SettingsSection>
          ))}
        </SettingsBody>
        <SettingsFooter>
          <Button variant="secondary">取消</Button>
          <Button>保存</Button>
        </SettingsFooter>
      </SettingsShellContent>
    </SettingsShell>
  </div>
)
