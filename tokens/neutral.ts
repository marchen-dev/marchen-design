// L1：纯中性灰阶（色度恒为 0）。只给 semantic.ts 使用，不导出成 CSS 变量

export interface NeutralRamp {
  /** 卡片、弹层：最亮的一层 */
  surface: number
  background: number
  sidebar: number
  /** 次要按钮、弱化底色、悬停底色 */
  subtle: number
  /** 选中项底色（侧栏选中等） */
  selected: number
  border: number
  mutedForeground: number
  foreground: number
}

/** 浅色：越往上越白。侧栏比主区略灰，卡片纯白 */
export const light: NeutralRamp = {
  surface: 1,
  background: 0.985,
  sidebar: 0.97,
  subtle: 0.96,
  selected: 0.93,
  border: 0.922,
  mutedForeground: 0.53,
  foreground: 0.2,
}

/**
 * 深色：越往上越亮（sidebar < background < card < popover < muted）。
 * 底色接近黑但不是纯黑，文字接近白但不是纯白。
 */
export const dark = {
  sidebar: 0.16,
  background: 0.18,
  card: 0.215,
  popover: 0.245,
  subtle: 0.27,
  selected: 0.3,
  mutedForeground: 0.71,
  foreground: 0.96,
  /** 深色下边框用白色半透明，跟随所在层的亮度 */
  borderAlpha: 0.1,
  inputAlpha: 0.15,
}
