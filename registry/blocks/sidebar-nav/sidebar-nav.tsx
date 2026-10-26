"use client"

import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cn } from "cn"

// 导航项可以直接放在 SidebarNav 里，也可以用 SidebarNavGroup 分组；组与组之间的间距由 Group 自己负责
function SidebarNav({ className, ...props }: React.ComponentProps<"nav">) {
  return <nav data-slot="sidebar-nav" className={cn("flex flex-col gap-0.5 text-sm", className)} {...props} />
}

function SidebarNavGroup({
  label,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { label?: React.ReactNode }) {
  return (
    <div data-slot="sidebar-nav-group" className={cn("flex flex-col gap-0.5 not-first:mt-4", className)} {...props}>
      {label && <div className="px-2.5 pb-1 text-xs text-muted-foreground">{label}</div>}
      {children}
    </div>
  )
}

interface SidebarNavItemProps extends useRender.ComponentProps<"button"> {
  /** 左侧线性图标，颜色和尺寸由组件统一 */
  icon?: React.ReactNode
  /** 当前项：灰色底 + aria-current="page" */
  active?: boolean
}

function SidebarNavItem({ icon, active = false, className, render, children, ...props }: SidebarNavItemProps) {
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      {
        // 渲染为链接等非 button 元素时不需要 type
        ...(render ? {} : { type: "button" as const }),
        "aria-current": active ? "page" : undefined,
        className: cn(
          "flex h-8 w-full items-center gap-2 rounded-md px-2.5 text-left text-sm text-sidebar-foreground outline-none select-none hover:bg-sidebar-accent/60 focus-visible:ring-3 focus-visible:ring-ring/50 data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-muted-foreground",
          className,
        ),
        children: (
          <>
            {icon}
            <span className="min-w-0 flex-1 truncate">{children}</span>
          </>
        ),
      },
      props,
    ),
    state: { active },
    stateAttributesMapping: { active: (value) => (value ? { "data-active": "" } : null) },
  })
}

export { SidebarNav, SidebarNavGroup, SidebarNavItem }
