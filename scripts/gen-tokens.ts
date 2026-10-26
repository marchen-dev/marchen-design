// tokens/ → 三个目标：
//   registry/themes/registry.json          base + accent-*（覆盖式 cssVars）
//   preview/src/theme.css                  作用域式，所有强调色可在同一页面并存
//   plugin/skills/design/references/tokens.css  纯 CSS 变量，给非 shadcn 项目
// 生成前先做断言：灰阶无色偏、深色层级递增、对比度达标、色域内。任一失败即退出
import { DEFAULT_ACCENT, accents, type AccentName } from "../tokens/accents.ts"
import { contrast, format, inSrgbGamut, type Oklch } from "../tokens/color.ts"
import * as foundation from "../tokens/foundation.ts"
import { ACCENT_KEYS, semantic, surfaces, type Mode } from "../tokens/semantic.ts"
import { baseExtras, core } from "../registry/core.ts"
import { writeGenerated } from "./lib/generated.ts"

const SCRIPT = "gen-tokens.ts"
const NAMESPACE = "@marchen-design"
const MODES: Mode[] = ["light", "dark"]
const MIN_CONTRAST = 4.5
/** 允许带色度的变量：强调色派生出的变量 + destructive */
const CHROMATIC = new Set<string>([...ACCENT_KEYS, "destructive"])

type Tokens = Record<string, Oklch>

const tokensFor = (mode: Mode, accent: AccentName) => semantic(mode, accents[accent])
const formatAll = (tokens: Tokens) =>
  Object.fromEntries(Object.entries(tokens).map(([k, v]) => [k, format(v)]))
const pick = (tokens: Tokens, keys: readonly string[]) =>
  Object.fromEntries(keys.map((k) => [k, tokens[k]])) as Tokens

// ───────────────────────── 断言 ─────────────────────────

function assertTokens(): string[] {
  const errors: string[] = []

  for (const mode of MODES) {
    const base = tokensFor(mode, DEFAULT_ACCENT)

    for (const [key, value] of Object.entries(base)) {
      if (!CHROMATIC.has(key) && value.c !== 0) errors.push(`${mode}: ${key} 带有色度 ${value.c}，灰阶必须为纯中性`)
      if (!inSrgbGamut(value)) errors.push(`${mode}: ${key} 超出 sRGB 色域`)
    }

    if (mode === "dark") {
      const order = ["sidebar", "background", "card", "popover", "muted"]
      for (let i = 1; i < order.length; i++) {
        if (!(base[order[i]].l > base[order[i - 1]].l))
          errors.push(`dark: 层级亮度必须递增，${order[i - 1]}（${base[order[i - 1]].l}）≥ ${order[i]}（${base[order[i]].l}）`)
      }
    }

    for (const accent of Object.keys(accents) as AccentName[]) {
      const t = tokensFor(mode, accent)
      const checks: [string, Oklch, Oklch[]][] = [
        ["primary-foreground / primary", t["primary-foreground"], [t.primary]],
        ["primary-text / background", t["primary-text"], surfaces(mode)],
        ["muted-foreground / background", t["muted-foreground"], surfaces(mode)],
      ]
      for (const [pair, fg, backgrounds] of checks) {
        const ratio = Math.min(...backgrounds.map((bg) => contrast(fg, bg)))
        if (ratio < MIN_CONTRAST) errors.push(`${accent} ${mode}: ${pair} 对比度 ${ratio.toFixed(2)} < ${MIN_CONTRAST}`)
      }
      if (!inSrgbGamut(t.primary)) errors.push(`${accent} ${mode}: primary 超出 sRGB 色域`)
    }
  }
  return errors
}

// ───────────────────────── registry 主题条目 ─────────────────────────

/** base 与 theme 共用：完整的明暗 token + 主题变量（默认强调色） */
function fullCssVars() {
  return {
    theme: foundation.theme,
    light: { radius: foundation.radius, ...formatAll(tokensFor("light", DEFAULT_ACCENT)) },
    dark: formatAll(tokensFor("dark", DEFAULT_ACCENT)),
  }
}

const zIndexVars = () => Object.fromEntries(Object.entries(foundation.zIndex).map(([k, v]) => [`--${k}`, v]))

function baseItem() {
  const deps = [...baseExtras, ...core.filter((c) => c.ready).map((c) => c.name)]

  return {
    name: "base",
    type: "registry:base",
    extends: "none",
    title: "marchen-design",
    description: "黑白 + 单一强调色设计系统：项目配置、明暗 token 与核心组件。",
    config: {
      style: "base-nova",
      iconLibrary: "lucide",
      rtl: false,
      menuColor: "default",
      menuAccent: "subtle",
      tailwind: { baseColor: "neutral", cssVariables: true },
      registries: { [NAMESPACE]: "{{REGISTRY_URL}}/r/{name}.json" },
    },
    dependencies: ["shadcn", "tw-animate-css", "lucide-react"],
    registryDependencies: deps.map((name) => `${NAMESPACE}/${name}`),
    cssVars: fullCssVars(),
    css: {
      '@import "tw-animate-css"': {},
      '@import "shadcn/tailwind.css"': {},
      "@layer base": {
        ":root": zIndexVars(),
        "*": { "@apply border-border outline-ring/50": {} },
        body: { "@apply bg-background text-foreground": {} },
        html: { "@apply font-sans": {} },
      },
    },
  }
}

/**
 * 只含 token 的主题：给 Radix / React Aria 项目或只想试配色的项目。
 * 不改 components.json 配置、不装组件；也不带 base 中依赖 npm 包的 @import（tw-animate-css、shadcn/tailwind.css）
 */
function themeItem() {
  return {
    name: "theme",
    type: "registry:theme",
    title: "marchen-design theme",
    description: "只包含 marchen-design 的明暗 token、圆角、字体与动效变量，不安装组件、不修改项目配置。",
    cssVars: fullCssVars(),
    css: {
      "@layer base": {
        ":root": zIndexVars(),
        html: { "@apply font-sans": {} },
      },
    },
  }
}

function accentItem(accent: AccentName) {
  return {
    name: `accent-${accent}`,
    type: "registry:theme",
    title: `Accent: ${accent}`,
    description: `把强调色换成 ${accent}，只覆盖强调色相关变量。`,
    cssVars: Object.fromEntries(
      MODES.map((mode) => [mode, formatAll(pick(tokensFor(mode, accent), ACCENT_KEYS))]),
    ),
  }
}

// ───────────────────────── CSS 输出 ─────────────────────────

const block = (selector: string, vars: Record<string, string>) =>
  `${selector} {\n${Object.entries(vars).map(([k, v]) => `  --${k}: ${v};`).join("\n")}\n}\n`

/** 与 shadcn CLI 安装结果一致：theme 原样写入，light 中的每个颜色变量注册为 --color-* */
function themeInline() {
  const colors = Object.keys(tokensFor("light", DEFAULT_ACCENT))
  return block("@theme inline", {
    ...foundation.theme,
    ...Object.fromEntries(colors.map((k) => [`color-${k}`, `var(--${k})`])),
  })
}

function rootBlocks() {
  return [
    block(":root", {
      radius: foundation.radius,
      ...foundation.zIndex,
      ...formatAll(tokensFor("light", DEFAULT_ACCENT)),
    }),
    block(".dark", formatAll(tokensFor("dark", DEFAULT_ACCENT))),
  ]
}

function previewCss() {
  const scoped = (Object.keys(accents) as AccentName[]).flatMap((accent) => [
    block(`[data-accent="${accent}"]`, formatAll(pick(tokensFor("light", accent), ACCENT_KEYS))),
    block(
      `.dark[data-accent="${accent}"],\n.dark [data-accent="${accent}"]`,
      formatAll(pick(tokensFor("dark", accent), ACCENT_KEYS)),
    ),
  ])
  return [themeInline(), ...rootBlocks(), "/* 强调色：在任意元素上设置 data-accent 切换 */\n", ...scoped].join("\n")
}

function plainCss() {
  const fonts = { "font-sans": foundation.fontSans, "font-mono": foundation.fontMono }
  const motion = {
    "ease-out-expo": foundation.theme["ease-out-expo"],
    "duration-enter": foundation.theme["duration-enter"],
    "duration-exit": foundation.theme["duration-exit"],
  }
  return [
    "/* 纯 CSS 变量版本，供没有 Tailwind / shadcn 的项目使用。深色模式：在祖先元素上加 .dark */\n",
    block(":root", {
      ...fonts,
      ...motion,
      radius: foundation.radius,
      ...foundation.zIndex,
      ...formatAll(tokensFor("light", DEFAULT_ACCENT)),
    }),
    block(".dark", formatAll(tokensFor("dark", DEFAULT_ACCENT))),
  ].join("\n")
}

// ───────────────────────── 入口 ─────────────────────────

export async function genTokens() {
  const errors = assertTokens()
  if (errors.length) {
    console.error(`token 断言失败（${errors.length} 项）：`)
    for (const e of errors) console.error(`  ✗ ${e}`)
    process.exit(1)
  }

  const themes = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    items: [baseItem(), themeItem(), ...(Object.keys(accents) as AccentName[]).map(accentItem)],
  }
  await writeGenerated("registry/themes/registry.json", "json", SCRIPT, JSON.stringify(themes))
  await writeGenerated("preview/src/theme.css", "css", SCRIPT, previewCss())
  await writeGenerated("plugin/skills/design/references/tokens.css", "css", SCRIPT, plainCss())
}

if (import.meta.main) await genTokens()
