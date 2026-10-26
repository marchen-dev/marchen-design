// L3：非颜色 token。全部写进 cssVars.theme（放进 light/dark 会被 CLI 当成颜色注册）

export const fontSans = [
  "-apple-system",
  "BlinkMacSystemFont",
  '"Segoe UI"',
  '"PingFang SC"',
  '"Hiragino Sans GB"',
  '"Microsoft YaHei"',
  "sans-serif",
].join(", ")

export const fontMono = ["ui-monospace", '"SF Mono"', "Menlo", "Consolas", "monospace"].join(", ")

/** 基准圆角，写在 :root；各档位在 theme 中按比例派生（与 shadcn 一致） */
export const radius = "0.5rem"

export const theme: Record<string, string> = {
  "font-sans": fontSans,
  "font-mono": fontMono,
  "font-heading": "var(--font-sans)",
  "radius-sm": "calc(var(--radius) * 0.6)",
  "radius-md": "calc(var(--radius) * 0.8)",
  "radius-lg": "var(--radius)",
  "radius-xl": "calc(var(--radius) * 1.4)",
  "radius-2xl": "calc(var(--radius) * 1.8)",
  "radius-3xl": "calc(var(--radius) * 2.2)",
  "radius-4xl": "calc(var(--radius) * 2.6)",
  // 弹层动效：进入减速、退出略快
  "ease-out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
  "duration-enter": "180ms",
  "duration-exit": "120ms",
}

/** 层级：不进 Tailwind theme，作为普通变量写在 :root */
export const zIndex: Record<string, string> = {
  "z-dropdown": "50",
  "z-modal": "100",
  "z-popover": "150",
  "z-tooltip": "200",
  "z-toast": "300",
}
