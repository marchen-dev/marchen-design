// OKLCH 颜色计算：转 sRGB、色域判断、WCAG 对比度
// 公式来自 Björn Ottosson 的 OKLab 定义与 WCAG 2.x 相对亮度

export interface Oklch {
  l: number
  c: number
  h: number
  /** 0–1，缺省为不透明 */
  alpha?: number
}

export const oklch = (l: number, c = 0, h = 0, alpha?: number): Oklch => ({ l, c, h, alpha })

const round = (n: number, digits: number) => Number(n.toFixed(digits))

export function format({ l, c, h, alpha }: Oklch): string {
  const base = c === 0 ? `${round(l, 3)} 0 0` : `${round(l, 3)} ${round(c, 3)} ${round(h, 1)}`
  return alpha === undefined ? `oklch(${base})` : `oklch(${base} / ${Math.round(alpha * 100)}%)`
}

/** OKLCH → 线性 sRGB（未裁剪） */
export function toLinearSrgb({ l, c, h }: Oklch): [number, number, number] {
  const rad = (h * Math.PI) / 180
  const a = c * Math.cos(rad)
  const b = c * Math.sin(rad)
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ]
}

const EPSILON = 1e-4

export function inSrgbGamut(color: Oklch): boolean {
  return toLinearSrgb(color).every((v) => v >= -EPSILON && v <= 1 + EPSILON)
}

/** 色度超出 sRGB 时逐步降低色度，保持亮度和色相 */
export function fitGamut(color: Oklch): Oklch {
  let c = color.c
  while (c > 0 && !inSrgbGamut({ ...color, c })) c = Math.max(0, c - 0.002)
  return { ...color, c }
}

/** sRGB 显示值（0–255），用于自测和调试 */
export function toSrgb255(color: Oklch): [number, number, number] {
  const encode = (v: number) => {
    const x = Math.min(1, Math.max(0, v))
    return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055
  }
  return toLinearSrgb(color).map((v) => Math.round(encode(v) * 255)) as [number, number, number]
}

/** WCAG 相对亮度（线性 sRGB 加权），只用于不透明颜色 */
export function luminance(color: Oklch): number {
  const [r, g, b] = toLinearSrgb(color).map((v) => Math.min(1, Math.max(0, v)))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a: Oklch, b: Oklch): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
