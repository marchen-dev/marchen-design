// 设置弹窗 demo：只用核心组件和语义 token 拼成，检验组件组合成整页后是否仍然克制
import { BellIcon, PaletteIcon, Settings2Icon, UserIcon, type LucideIcon } from "lucide-react"
import { useRef, useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export default { title: "Demos/Settings Dialog", parameters: { layout: "page", minHeight: 680 } }

type SectionId = "general" | "appearance" | "notifications" | "account"

const SECTIONS: { id: SectionId; label: string; icon: LucideIcon }[] = [
  { id: "general", label: "通用", icon: Settings2Icon },
  { id: "appearance", label: "外观", icon: PaletteIcon },
  { id: "notifications", label: "通知", icon: BellIcon },
  { id: "account", label: "账户", icon: UserIcon },
]

// ───────────────────────── 局部组合（区块完成后替换为 settings-*） ─────────────────────────

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="px-1 text-xs text-muted-foreground">{title}</h3>
      <Card size="sm" className="gap-0 py-0">
        {children}
      </Card>
    </section>
  )
}

function Row({ id, label, description, children }: { id: string; label: string; description?: string; children: ReactNode }) {
  return (
    <Field orientation="horizontal" className="items-center! px-4 py-3">
      <FieldContent>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
      {children}
    </Field>
  )
}

function SimpleSelect({ id, items, defaultValue }: { id: string; items: { label: string; value: string }[]; defaultValue: string }) {
  return (
    <Select items={items} defaultValue={defaultValue}>
      <SelectTrigger id={id} size="sm" className="w-36">
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

// ───────────────────────── 各分类内容 ─────────────────────────

function General() {
  return (
    <>
      <Group title="语言与地区">
        <Row id="language" label="界面语言">
          <SimpleSelect
            id="language"
            defaultValue="zh-CN"
            items={[
              { label: "简体中文", value: "zh-CN" },
              { label: "English", value: "en" },
              { label: "日本語", value: "ja" },
            ]}
          />
        </Row>
        <Row id="timezone" label="时区" description="用于显示时间和安排提醒。">
          <SimpleSelect
            id="timezone"
            defaultValue="auto"
            items={[
              { label: "自动", value: "auto" },
              { label: "北京时间", value: "Asia/Shanghai" },
              { label: "东京时间", value: "Asia/Tokyo" },
            ]}
          />
        </Row>
      </Group>
      <Group title="行为">
        <Row id="autostart" label="开机启动" description="登录系统后自动在后台运行。">
          <Switch id="autostart" defaultChecked />
        </Row>
        <Row id="telemetry" label="发送使用数据" description="匿名的崩溃和使用统计，用于改进产品。">
          <Switch id="telemetry" />
        </Row>
      </Group>
    </>
  )
}

function Appearance() {
  return (
    <>
      <Group title="主题">
        <Row id="theme" label="颜色模式">
          <SimpleSelect
            id="theme"
            defaultValue="system"
            items={[
              { label: "跟随系统", value: "system" },
              { label: "浅色", value: "light" },
              { label: "深色", value: "dark" },
            ]}
          />
        </Row>
        <Row id="accent" label="强调色" description="开关、选中状态和链接使用的颜色。">
          <SimpleSelect
            id="accent"
            defaultValue="blue"
            items={[
              { label: "蓝色", value: "blue" },
              { label: "绿色", value: "green" },
              { label: "橙色", value: "orange" },
            ]}
          />
        </Row>
      </Group>
      <Group title="布局">
        <Row id="compact" label="紧凑模式" description="减小列表行高，一屏显示更多内容。">
          <Checkbox id="compact" />
        </Row>
      </Group>
    </>
  )
}

function Notifications() {
  return (
    <>
      <Group title="通知方式">
        <Row id="desktop" label="桌面通知">
          <Switch id="desktop" defaultChecked />
        </Row>
        <Row id="sound" label="提示音">
          <Switch id="sound" />
        </Row>
      </Group>
      <Group title="免打扰">
        <Row id="quiet-hours" label="免打扰时段" description="这段时间内不弹出通知。">
          <Input id="quiet-hours" defaultValue="22:00 – 08:00" className="h-7 w-36" />
        </Row>
      </Group>
    </>
  )
}

function Account() {
  return (
    <>
      <Group title="个人资料">
        <Row id="username" label="用户名">
          <Input id="username" defaultValue="suemor" className="h-7 w-48" />
        </Row>
        <Row id="email" label="邮箱" description="用于登录和接收重要通知。">
          <Input id="email" type="email" defaultValue="suemor@example.com" className="h-7 w-48" />
        </Row>
      </Group>
      <Group title="危险操作">
        <Row id="sign-out" label="退出登录" description="退出后需要重新登录才能同步数据。">
          <Button id="sign-out" variant="destructive" size="sm">
            退出登录
          </Button>
        </Row>
      </Group>
    </>
  )
}

const CONTENT: Record<SectionId, () => ReactNode> = {
  general: General,
  appearance: Appearance,
  notifications: Notifications,
  account: Account,
}

// ───────────────────────── 弹窗 ─────────────────────────

function SettingsDialog({ initial = "general" }: { initial?: SectionId }) {
  const [section, setSection] = useState<SectionId>(initial)
  const current = SECTIONS.find((s) => s.id === section)!
  const Content = CONTENT[section]
  // 打开时把焦点放在内容区，避免第一个导航项出现焦点环（静态画面里像"选中"，还多占一处强调色）
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <Dialog defaultOpen>
      <DialogContent initialFocus={contentRef} className="h-[600px] gap-0 overflow-hidden p-0 sm:max-w-[840px]">
        <div className="grid h-full min-h-0 grid-cols-[168px_minmax(0,1fr)]">
          <nav className="flex flex-col gap-0.5 bg-sidebar p-2 pt-12 text-sidebar-foreground">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSection(id)}
                className={`flex h-8 items-center gap-2 rounded-md px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
                  id === section ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/60"
                }`}
              >
                <Icon className="size-4 text-muted-foreground" />
                {label}
              </button>
            ))}
          </nav>
          {/* 内容区用 background 层，卡片（card 层）放在上面：浅色是浅灰底上的白卡片，深色是卡片比底色亮 */}
          <div ref={contentRef} tabIndex={-1} className="flex min-h-0 flex-col bg-background outline-none">
            <header className="px-6 pt-5 pb-3">
              <DialogTitle>{current.label}</DialogTitle>
              <DialogDescription className="sr-only">{current.label}设置</DialogDescription>
            </header>
            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-4">
              <Content />
            </div>
            <footer className="flex justify-end gap-2 px-6 py-3">
              <Button variant="secondary">取消</Button>
              <Button>保存</Button>
            </footer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const General_ = () => <SettingsDialog />
export const Account_ = () => <SettingsDialog initial="account" />
