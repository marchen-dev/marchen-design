// 设置页面 demo：SettingsShell 放在应用页面中（不用弹窗），验证页面形态与内容区滚动
import { BellIcon, KeyRoundIcon, PaletteIcon, Settings2Icon, UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { SidebarNavGroup, SidebarNavItem } from "@/components/sidebar-nav"

export default { title: "Demos/Settings Page", parameters: { layout: "page", minHeight: 680 } }

export const Account = () => (
  <div className="-m-4 flex h-[680px] flex-col bg-background">
    {/* 应用顶栏：只是示意，不属于区块 */}
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
      <span className="text-sm font-medium">Marchen</span>
      <Button variant="ghost" size="sm">
        帮助
      </Button>
    </header>
    <div className="min-h-0 flex-1">
      <SettingsShell>
        <SettingsShellNav>
          <SidebarNavGroup label="个人">
            <SidebarNavItem icon={<UserIcon />} active>
              账户
            </SidebarNavItem>
            <SidebarNavItem icon={<KeyRoundIcon />}>安全</SidebarNavItem>
          </SidebarNavGroup>
          <SidebarNavGroup label="应用">
            <SidebarNavItem icon={<Settings2Icon />}>通用</SidebarNavItem>
            <SidebarNavItem icon={<PaletteIcon />}>外观</SidebarNavItem>
            <SidebarNavItem icon={<BellIcon />}>通知</SidebarNavItem>
          </SidebarNavGroup>
        </SettingsShellNav>
        <SettingsShellContent>
          <SettingsHeader title="账户" description="管理你的个人资料和登录方式。" />
          <SettingsBody>
            <SettingsSection title="个人资料">
              <SettingsRow label="昵称">
                <Input defaultValue="suemor" className="h-7 w-48" />
              </SettingsRow>
              <SettingsRow label="邮箱" description="用于登录和接收重要通知。">
                <Input type="email" defaultValue="suemor@example.com" className="h-7 w-48" />
              </SettingsRow>
            </SettingsSection>
            <SettingsSection title="登录方式">
              <SettingsRow label="两步验证" description="登录时需要输入验证器生成的动态码。">
                <Switch defaultChecked />
              </SettingsRow>
              <SettingsRow label="登录提醒" description="新设备登录时发送邮件。">
                <Switch defaultChecked />
              </SettingsRow>
              <SettingsRow label="密码" description="上次修改于 3 个月前。">
                <Button variant="secondary" size="sm">
                  修改密码
                </Button>
              </SettingsRow>
            </SettingsSection>
            <SettingsSection title="已登录的设备">
              {["MacBook Pro · 当前设备", "iPhone 16", "Windows 台式机"].map((device) => (
                <SettingsRow key={device} label={device} description="上次活跃于今天">
                  <Button variant="ghost" size="sm">
                    退出
                  </Button>
                </SettingsRow>
              ))}
            </SettingsSection>
            <SettingsSection title="危险操作">
              <SettingsRow label="删除账户" description="账户和所有数据会被永久删除，无法恢复。">
                <Button variant="destructive" size="sm">
                  删除账户
                </Button>
              </SettingsRow>
            </SettingsSection>
          </SettingsBody>
          <SettingsFooter>
            <Button variant="secondary">取消</Button>
            <Button>保存</Button>
          </SettingsFooter>
        </SettingsShellContent>
      </SettingsShell>
    </div>
  </div>
)
