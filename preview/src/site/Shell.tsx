// 文档站外壳：左侧导航用 sidebar-nav 区块（自己先用一遍），右侧为 story 矩阵
import { useEffect, useState } from "react"
import { SidebarNav, SidebarNavGroup, SidebarNavItem } from "@/components/sidebar-nav"
import { StoryMatrix } from "~/gallery/StoryMatrix"
import { groups, isBlock, isDemo, type StoryGroup } from "~/gallery/stories"

/** 路由：#/<story 分组 id>，如 #/ui-button、#/blocks-settings、#/demos-settings-dialog */
function useHashRoute() {
  const read = () => location.hash.replace(/^#\/?/, "")
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const onChange = () => setRoute(read())
    window.addEventListener("hashchange", onChange)
    return () => window.removeEventListener("hashchange", onChange)
  }, [])
  return route
}

const SECTIONS: { label: string; filter: (g: StoryGroup) => boolean }[] = [
  { label: "组件", filter: (g) => !isDemo(g) && !isBlock(g) },
  { label: "区块", filter: isBlock },
  { label: "Demos", filter: isDemo },
]

export function Shell() {
  const route = useHashRoute()
  const current = groups.find((g) => g.id === route) ?? groups.find(SECTIONS[0].filter)

  return (
    <div className="grid min-h-svh grid-cols-[200px_minmax(0,1fr)] text-sm">
      <aside className="flex flex-col gap-5 border-r border-sidebar-border bg-sidebar p-3">
        <div className="px-2.5 font-medium">marchen-design</div>
        <SidebarNav>
          {SECTIONS.map(({ label, filter }) => {
            const items = groups.filter(filter)
            if (!items.length) return null
            return (
              <SidebarNavGroup key={label} label={label}>
                {items.map((g) => (
                  <SidebarNavItem key={g.id} render={<a href={`#/${g.id}`} />} active={g === current}>
                    {g.title.split("/").at(-1)}
                  </SidebarNavItem>
                ))}
              </SidebarNavGroup>
            )
          })}
        </SidebarNav>
        <p className="mt-auto px-2.5 text-xs text-muted-foreground">
          按 <kbd>d</kbd> 切换外壳明暗
        </p>
      </aside>
      <main className="min-w-0 p-6">
        {current ? <StoryMatrix group={current} /> : <p className="text-muted-foreground">还没有 story。</p>}
      </main>
    </div>
  )
}
