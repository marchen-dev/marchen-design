import { BellIcon, BookOpenIcon, PaletteIcon, Settings2Icon, UserIcon } from "lucide-react"
import { useState } from "react"
import { SidebarNav, SidebarNavGroup, SidebarNavItem } from "@/components/sidebar-nav"

export default { title: "Blocks/Sidebar Nav" }

const SECTIONS = [
  { id: "general", label: "通用", icon: <Settings2Icon /> },
  { id: "appearance", label: "外观", icon: <PaletteIcon /> },
  { id: "notifications", label: "通知", icon: <BellIcon /> },
  { id: "account", label: "账户", icon: <UserIcon /> },
]

/** 按钮形态：点击切换当前项 */
export const Buttons = () => {
  const [current, setCurrent] = useState("appearance")
  return (
    <div className="w-44 rounded-lg bg-sidebar p-2">
      <SidebarNav>
        <SidebarNavGroup>
          {SECTIONS.map((s) => (
            <SidebarNavItem key={s.id} icon={s.icon} active={s.id === current} onClick={() => setCurrent(s.id)}>
              {s.label}
            </SidebarNavItem>
          ))}
        </SidebarNavGroup>
      </SidebarNav>
    </div>
  )
}

/** 链接形态 + 分组 */
export const LinksWithGroups = () => (
  <div className="w-52 rounded-lg bg-sidebar p-2">
    <SidebarNav>
      <SidebarNavGroup label="组件">
        <SidebarNavItem render={<a href="#button" />} active>
          Button
        </SidebarNavItem>
        <SidebarNavItem render={<a href="#dialog" />}>Dialog</SidebarNavItem>
        <SidebarNavItem render={<a href="#select" />}>Select</SidebarNavItem>
      </SidebarNavGroup>
      <SidebarNavGroup label="文档">
        <SidebarNavItem render={<a href="#guide" />} icon={<BookOpenIcon />}>
          使用指南
        </SidebarNavItem>
      </SidebarNavGroup>
    </SidebarNav>
  </div>
)
