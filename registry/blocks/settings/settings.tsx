"use client"

import * as React from "react"
import { Field } from "@base-ui/react/field"
import { cn } from "cn"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"

// ───────────────────────── 外壳 ─────────────────────────

interface SettingsShellContextValue {
  /** 是否在 SettingsDialog 中：导航区要给关闭按钮留位，内容区作为初始焦点 */
  inDialog: boolean
  contentRef?: React.RefObject<HTMLDivElement | null>
}

const SettingsShellContext = React.createContext<SettingsShellContextValue>({ inDialog: false })

/** 左侧导航 + 右侧内容区的布局。只负责布局，高度跟随父容器，放在弹窗或页面中都可以 */
function SettingsShell({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="settings-shell"
      className={cn("grid h-full min-h-0 grid-cols-[168px_minmax(0,1fr)]", className)}
      {...props}
    />
  )
}

/** 左侧导航区：内部已包含 SidebarNav，直接放 SidebarNavItem / SidebarNavGroup */
function SettingsShellNav({ className, children, ...props }: React.ComponentProps<"aside">) {
  const { inDialog } = React.useContext(SettingsShellContext)
  return (
    <aside
      data-slot="settings-shell-nav"
      className={cn("min-h-0 overflow-y-auto bg-sidebar p-2", inDialog && "pt-12", className)}
      {...props}
    >
      <SidebarNav>{children}</SidebarNav>
    </aside>
  )
}

/**
 * 右侧内容区：background 层，卡片放在上面才会比底色亮（深色模式下尤其明显）。
 * 在 SettingsDialog 中作为弹窗打开时的初始焦点，避免第一个导航项出现焦点环
 */
function SettingsShellContent({ className, ...props }: React.ComponentProps<"div">) {
  const { inDialog, contentRef } = React.useContext(SettingsShellContext)
  return (
    <div
      ref={contentRef}
      tabIndex={inDialog ? -1 : undefined}
      data-slot="settings-shell-content"
      className={cn("flex min-h-0 flex-col bg-background outline-none", className)}
      {...props}
    />
  )
}

function SettingsHeader({
  title,
  description,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"header">, "title"> & { title: React.ReactNode; description?: React.ReactNode }) {
  return (
    <header data-slot="settings-header" className={cn("flex items-start gap-4 px-6 pt-5 pb-3", className)} {...props}>
      <div className="min-w-0 flex-1">
        <h2 className="font-heading text-base leading-none font-medium">{title}</h2>
        {description && <p className="mt-1.5 text-[0.8rem] text-muted-foreground">{description}</p>}
      </div>
      {children}
    </header>
  )
}

/** 唯一的滚动区域，标题和底部操作保持可见 */
function SettingsBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="settings-body"
      className={cn("flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-4", className)}
      {...props}
    />
  )
}

function SettingsFooter({ className, ...props }: React.ComponentProps<"footer">) {
  return <footer data-slot="settings-footer" className={cn("flex justify-end gap-2 px-6 py-3", className)} {...props} />
}

// ───────────────────────── 分组与行 ─────────────────────────

/** 分组：标题在卡片外，卡片内放 SettingsRow，行与行之间不加分隔线 */
function SettingsSection({
  title,
  description,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & { title?: React.ReactNode; description?: React.ReactNode }) {
  return (
    <section data-slot="settings-section" className={cn("flex flex-col gap-1.5", className)} {...props}>
      {(title || description) && (
        <div className="px-1">
          {title && <h3 className="text-xs text-muted-foreground">{title}</h3>}
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      )}
      <Card size="sm" className="gap-0 py-0">
        {children}
      </Card>
    </section>
  )
}

/**
 * 一行设置：左边名称和说明，右边控件（垂直居中）。
 * 基于 Base UI Field：名称自动与控件关联，点击名称会切换开关 / 复选框、聚焦输入框，不需要手写 id
 */
function SettingsRow({
  label,
  description,
  className,
  children,
  ...props
}: Omit<Field.Root.Props, "children"> & {
  label: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <Field.Root
      data-slot="settings-row"
      className={cn("flex min-h-14 items-center justify-between gap-4 px-4 py-3", className)}
      {...props}
    >
      <div className="min-w-0 flex-1">
        <Field.Label className="text-sm leading-snug font-medium">{label}</Field.Label>
        {description && (
          <Field.Description className="mt-0.5 text-[0.8rem] leading-normal text-muted-foreground">
            {description}
          </Field.Description>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </Field.Root>
  )
}

// ───────────────────────── 弹窗 ─────────────────────────

/**
 * 设置弹窗：Dialog + 固定尺寸 + SettingsShell，打开时焦点落在内容区。
 * children 放 SettingsShellNav 和 SettingsShellContent
 */
function SettingsDialog({
  title = "设置",
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, "children"> & {
  /** 弹窗的可访问名称 */
  title?: string
  className?: string
  children?: React.ReactNode
}) {
  const contentRef = React.useRef<HTMLDivElement>(null)
  return (
    <Dialog {...props}>
      <DialogContent
        aria-label={title}
        initialFocus={contentRef}
        className={cn(
          "h-[600px] max-h-[calc(100vh-2rem)] gap-0 overflow-hidden p-0 sm:max-w-[840px]",
          className,
        )}
      >
        <SettingsShellContext.Provider value={{ inDialog: true, contentRef }}>
          <SettingsShell>{children}</SettingsShell>
        </SettingsShellContext.Provider>
      </DialogContent>
    </Dialog>
  )
}

export {
  SettingsBody,
  SettingsDialog,
  SettingsFooter,
  SettingsHeader,
  SettingsRow,
  SettingsSection,
  SettingsShell,
  SettingsShellContent,
  SettingsShellNav,
}
