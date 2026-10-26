// 核心组件集：base 初始化时安装的组件。ready 表示已按 marchen-design 改写完成，
// 只有 ready 的组件会写进 base 的 registryDependencies（gen-tokens 读取）

export const core = [
  { name: "button", ready: true },
  { name: "input", ready: true },
  { name: "textarea", ready: true },
  { name: "field", ready: true },
  { name: "select", ready: true },
  { name: "switch", ready: true },
  { name: "checkbox", ready: true },
  { name: "dialog", ready: true },
  { name: "dropdown-menu", ready: true },
  { name: "popover", ready: true },
  { name: "tooltip", ready: true },
  { name: "tabs", ready: true },
  { name: "card", ready: true },
  { name: "scroll-area", ready: true },
  { name: "toast", ready: true },
] as const satisfies readonly { name: string; ready: boolean }[]

/** 不属于组件、但 base 总是安装的条目 */
export const baseExtras = ["utils"] as const
