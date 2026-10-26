// 设置弹窗 demo：只用 settings / sidebar-nav 区块和核心组件组合，检验区块拼成整页后是否仍然克制
import { BellIcon, PaletteIcon, Settings2Icon, UserIcon, type LucideIcon } from "lucide-react"
import { useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  SettingsBody,
  SettingsDialog,
  SettingsFooter,
  SettingsHeader,
  SettingsRow,
  SettingsSection,
  SettingsShellContent,
  SettingsShellNav,
} from "@/components/settings"
import { SidebarNavItem } from "@/components/sidebar-nav"

export default { title: "Demos/Settings Dialog", parameters: { layout: "page", minHeight: 680 } }

type SectionId = "general" | "appearance" | "notifications" | "account"

const SECTIONS: { id: SectionId; label: string; icon: LucideIcon }[] = [
  { id: "general", label: "通用", icon: Settings2Icon },
  { id: "appearance", label: "外观", icon: PaletteIcon },
  { id: "notifications", label: "通知", icon: BellIcon },
  { id: "account", label: "账户", icon: UserIcon },
]

function SimpleSelect({ items, defaultValue }: { items: { label: string; value: string }[]; defaultValue: string }) {
  return (
    <Select items={items} defaultValue={defaultValue}>
      <SelectTrigger size="sm" className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const CONTENT: Record<SectionId, () => ReactNode> = {
  general: () => (
    <>
      <SettingsSection title="语言与地区">
        <SettingsRow label="界面语言">
          <SimpleSelect
            defaultValue="zh-CN"
            items={[
              { label: "简体中文", value: "zh-CN" },
              { label: "English", value: "en" },
              { label: "日本語", value: "ja" },
            ]}
          />
        </SettingsRow>
        <SettingsRow label="时区" description="用于显示时间和安排提醒。">
          <SimpleSelect
            defaultValue="auto"
            items={[
              { label: "自动", value: "auto" },
              { label: "北京时间", value: "Asia/Shanghai" },
              { label: "东京时间", value: "Asia/Tokyo" },
            ]}
          />
        </SettingsRow>
      </SettingsSection>
      <SettingsSection title="行为">
        <SettingsRow label="开机启动" description="登录系统后自动在后台运行。">
          <Switch defaultChecked />
        </SettingsRow>
        <SettingsRow label="发送使用数据" description="匿名的崩溃和使用统计，用于改进产品。">
          <Switch />
        </SettingsRow>
      </SettingsSection>
    </>
  ),
  appearance: () => (
    <>
      <SettingsSection title="主题">
        <SettingsRow label="颜色模式">
          <SimpleSelect
            defaultValue="system"
            items={[
              { label: "跟随系统", value: "system" },
              { label: "浅色", value: "light" },
              { label: "深色", value: "dark" },
            ]}
          />
        </SettingsRow>
        <SettingsRow label="强调色" description="开关、选中状态和链接使用的颜色。">
          <SimpleSelect
            defaultValue="blue"
            items={[
              { label: "蓝色", value: "blue" },
              { label: "绿色", value: "green" },
              { label: "橙色", value: "orange" },
            ]}
          />
        </SettingsRow>
      </SettingsSection>
      <SettingsSection title="布局">
        <SettingsRow label="紧凑模式" description="减小列表行高，一屏显示更多内容。">
          <Checkbox />
        </SettingsRow>
      </SettingsSection>
    </>
  ),
  notifications: () => (
    <>
      <SettingsSection title="通知方式">
        <SettingsRow label="桌面通知">
          <Switch defaultChecked />
        </SettingsRow>
        <SettingsRow label="提示音">
          <Switch />
        </SettingsRow>
      </SettingsSection>
      <SettingsSection title="免打扰">
        <SettingsRow label="免打扰时段" description="这段时间内不弹出通知。">
          <Input defaultValue="22:00 – 08:00" className="h-7 w-36" />
        </SettingsRow>
      </SettingsSection>
    </>
  ),
  account: () => (
    <>
      <SettingsSection title="个人资料">
        <SettingsRow label="用户名">
          <Input defaultValue="suemor" className="h-7 w-48" />
        </SettingsRow>
        <SettingsRow label="邮箱" description="用于登录和接收重要通知。">
          <Input type="email" defaultValue="suemor@example.com" className="h-7 w-48" />
        </SettingsRow>
      </SettingsSection>
      <SettingsSection title="危险操作">
        <SettingsRow label="退出登录" description="退出后需要重新登录才能同步数据。">
          <Button variant="destructive" size="sm">
            退出登录
          </Button>
        </SettingsRow>
      </SettingsSection>
    </>
  ),
}

function Demo({ initial = "general" }: { initial?: SectionId }) {
  const [section, setSection] = useState<SectionId>(initial)
  const current = SECTIONS.find((s) => s.id === section)!
  const Content = CONTENT[section]

  return (
    <SettingsDialog defaultOpen>
      <SettingsShellNav>
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <SidebarNavItem key={id} icon={<Icon />} active={id === section} onClick={() => setSection(id)}>
            {label}
          </SidebarNavItem>
        ))}
      </SettingsShellNav>
      <SettingsShellContent>
        <SettingsHeader title={current.label} />
        <SettingsBody>
          <Content />
        </SettingsBody>
        <SettingsFooter>
          <Button variant="secondary">取消</Button>
          <Button>保存</Button>
        </SettingsFooter>
      </SettingsShellContent>
    </SettingsDialog>
  )
}

export const General = () => <Demo />
export const Account = () => <Demo initial="account" />
