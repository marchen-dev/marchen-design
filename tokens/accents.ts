// L1：强调色预设。每种只用色相和色度描述，明暗两种模式的取值由 semantic.ts 派生

export interface Accent {
  hue: number
  chroma: number
}

export const accents = {
  blue: { hue: 256, chroma: 0.2 },
  green: { hue: 150, chroma: 0.16 },
  orange: { hue: 45, chroma: 0.18 },
  pink: { hue: 355, chroma: 0.2 },
  red: { hue: 27, chroma: 0.21 },
  purple: { hue: 300, chroma: 0.2 },
} satisfies Record<string, Accent>

export type AccentName = keyof typeof accents

export const DEFAULT_ACCENT: AccentName = "blue"
