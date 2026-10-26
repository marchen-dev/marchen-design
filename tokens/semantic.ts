// L2：语义 token。灰阶 + 强调色 → shadcn 语义名，额外提供 primary-text、overlay
import type { Accent } from "./accents.ts"
import { contrast, fitGamut, oklch, type Oklch } from "./color.ts"
import * as neutral from "./neutral.ts"

export type Mode = "light" | "dark"

/**
 * 强调色在两种模式下共用的亮度。
 * OKLab 的 L≈0.55 时相对亮度约 0.17，白字对比度刚好 ≥ 4.5；再提亮就只能换黑字，
 * 所以深色模式不提亮 primary，文字可读性交给 primary-text。
 */
export const ACCENT_LIGHTNESS: Record<Mode, number> = { light: 0.55, dark: 0.55 }

/** 强调色主题条目需要覆盖的变量 */
export const ACCENT_KEYS = [
  "primary",
  "primary-foreground",
  "primary-text",
  "ring",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-ring",
] as const

const NEAR_WHITE = oklch(1)
const NEAR_BLACK = oklch(neutral.light.foreground)
const MIN_TEXT_CONTRAST = 4.5

/** 各模式下文字可能出现的底色层，primary-text / muted-foreground 要在所有层上都可读 */
export function surfaces(mode: Mode): Oklch[] {
  if (mode === "light") {
    const n = neutral.light
    return [n.surface, n.background, n.sidebar, n.subtle].map((l) => oklch(l))
  }
  const n = neutral.dark
  return [n.sidebar, n.background, n.card, n.popover, n.subtle].map((l) => oklch(l))
}

const minContrast = (color: Oklch, backgrounds: Oklch[]) =>
  Math.min(...backgrounds.map((bg) => contrast(color, bg)))

/** 从 primary 出发调整亮度（浅色变深、深色变亮），直到在所有底色上都可读 */
function derivePrimaryText(primary: Oklch, mode: Mode): Oklch {
  const step = mode === "light" ? -0.005 : 0.005
  let text = primary
  while (minContrast(text, surfaces(mode)) < MIN_TEXT_CONTRAST) {
    const l = text.l + step
    if (l <= 0 || l >= 1) break
    text = fitGamut({ ...text, l })
  }
  return text
}

export function deriveAccent(accent: Accent, mode: Mode) {
  const primary = fitGamut(oklch(ACCENT_LIGHTNESS[mode], accent.chroma, accent.hue))
  const foreground =
    contrast(NEAR_WHITE, primary) >= contrast(NEAR_BLACK, primary) ? NEAR_WHITE : NEAR_BLACK
  return {
    primary,
    "primary-foreground": foreground,
    "primary-text": derivePrimaryText(primary, mode),
    ring: primary,
    "sidebar-primary": primary,
    "sidebar-primary-foreground": foreground,
    "sidebar-ring": primary,
  } satisfies Record<(typeof ACCENT_KEYS)[number], Oklch>
}

/** destructive 取自 shadcn 默认值并裁剪到 sRGB 色域，是灰阶之外唯一允许的非强调色 */
const DESTRUCTIVE: Record<Mode, Oklch> = {
  light: fitGamut(oklch(0.577, 0.245, 27.325)),
  dark: fitGamut(oklch(0.704, 0.191, 22.216)),
}

/** 图表色保持 shadcn neutral 的灰阶，保证上游 chart 组件可用 */
const CHART = [0.87, 0.556, 0.439, 0.371, 0.269]

export function semantic(mode: Mode, accent: Accent): Record<string, Oklch> {
  const accentTokens = deriveAccent(accent, mode)
  const charts = Object.fromEntries(CHART.map((l, i) => [`chart-${i + 1}`, oklch(l)]))

  if (mode === "light") {
    const n = neutral.light
    const fg = oklch(n.foreground)
    return {
      background: oklch(n.background),
      foreground: fg,
      card: oklch(n.surface),
      "card-foreground": fg,
      popover: oklch(n.surface),
      "popover-foreground": fg,
      ...accentTokens,
      secondary: oklch(n.subtle),
      "secondary-foreground": fg,
      muted: oklch(n.subtle),
      "muted-foreground": oklch(n.mutedForeground),
      accent: oklch(n.subtle),
      "accent-foreground": fg,
      destructive: DESTRUCTIVE.light,
      border: oklch(n.border),
      input: oklch(n.border),
      ...charts,
      sidebar: oklch(n.sidebar),
      "sidebar-foreground": fg,
      "sidebar-accent": oklch(n.selected),
      "sidebar-accent-foreground": fg,
      "sidebar-border": oklch(n.border),
      overlay: oklch(0, 0, 0, 0.3),
    }
  }

  const n = neutral.dark
  const fg = oklch(n.foreground)
  return {
    background: oklch(n.background),
    foreground: fg,
    card: oklch(n.card),
    "card-foreground": fg,
    popover: oklch(n.popover),
    "popover-foreground": fg,
    ...accentTokens,
    secondary: oklch(n.subtle),
    "secondary-foreground": fg,
    muted: oklch(n.subtle),
    "muted-foreground": oklch(n.mutedForeground),
    accent: oklch(n.subtle),
    "accent-foreground": fg,
    destructive: DESTRUCTIVE.dark,
    border: oklch(1, 0, 0, n.borderAlpha),
    input: oklch(1, 0, 0, n.inputAlpha),
    ...charts,
    sidebar: oklch(n.sidebar),
    "sidebar-foreground": fg,
    "sidebar-accent": oklch(n.selected),
    "sidebar-accent-foreground": fg,
    "sidebar-border": oklch(1, 0, 0, n.borderAlpha),
    overlay: oklch(0, 0, 0, 0.6),
  }
}
