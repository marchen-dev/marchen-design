// 文档站外壳（占位）：左侧导航 + 右侧内容。区块完成后换成 sidebar-nav / settings-*
import { useEffect, useState, type ReactNode } from "react"
import { StoryMatrix } from "~/gallery/StoryMatrix"
import { groups, isDemo, type StoryGroup } from "~/gallery/stories"

/** 路由：#/<story 分组 id>，如 #/ui-button、#/demos-settings-dialog */
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

function NavSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <h2 className="px-2 pb-1 text-xs text-muted-foreground">{title}</h2>
      {children}
    </div>
  )
}

function NavItem({ group, active }: { group: StoryGroup; active: boolean }) {
  return (
    <a
      href={`#/${group.id}`}
      className={`rounded-md px-2 py-1 text-sm ${active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/60"}`}
    >
      {group.title.split("/").at(-1)}
    </a>
  )
}

export function Shell() {
  const route = useHashRoute()
  const components = groups.filter((g) => !isDemo(g))
  const demos = groups.filter(isDemo)
  const current = groups.find((g) => g.id === route) ?? components[0]

  return (
    <div className="grid min-h-svh grid-cols-[200px_minmax(0,1fr)] text-sm">
      <nav className="flex flex-col gap-5 border-r border-sidebar-border bg-sidebar p-3 text-sidebar-foreground">
        <div className="px-2 font-medium">marchen-design</div>
        <NavSection title="组件">
          {components.map((g) => (
            <NavItem key={g.id} group={g} active={g === current} />
          ))}
        </NavSection>
        <NavSection title="Demos">
          {demos.length ? (
            demos.map((g) => <NavItem key={g.id} group={g} active={g === current} />)
          ) : (
            <p className="px-2 text-muted-foreground">暂无</p>
          )}
        </NavSection>
        <p className="mt-auto px-2 text-xs text-muted-foreground">
          按 <kbd>d</kbd> 切换外壳明暗
        </p>
      </nav>
      <main className="min-w-0 p-6">
        {current ? <StoryMatrix group={current} /> : <p className="text-muted-foreground">还没有 story。</p>}
      </main>
    </div>
  )
}
