# marchen-design 立项背景

本文件只保留立项背景（2026-10-26）。**架构决策以 Marchen 变更 `scaffold-architecture` 的 artifact 为准**（`marchen/changes/scaffold-architecture/`，归档后在 `marchen/archive/`），日常开发约定见 `AGENTS.md`。

## 缘起

AI 生成的界面普遍带着一种"AI 味"：靛蓝到紫色的渐变、渐变文字、毛玻璃、到处是大圆角和阴影、emoji 图标、超大标题配大片留白。黑白加一个强调蓝的配色明显克制得多，接近系统界面和工具类产品（macOS、Linear、Vercel）。

目标是做一套通用的「黑白 + 单一强调色」设计系统，配合 Claude Code plugin，让 AI 在任何项目里做 UI 时都走这套风格。范围是工具 / 应用类界面（设置页、列表、聊天、后台），不包括营销落地页。与 Marchen Player 无关。

## 参考来源

- **Grok bot 明暗截图**（聊天页 + 设置弹窗），只提炼原则，不照抄：
  - `~/Pictures/screenshot/CleanShot 2026-10-26 at 15.26.44.png`（浅色聊天）
  - `~/Pictures/screenshot/CleanShot 2026-10-26 at 15.27.26.png`（浅色设置）
  - `~/Pictures/screenshot/CleanShot 2026-10-26 at 15.29.24.png`（深色聊天）
  - `~/Pictures/screenshot/CleanShot 2026-10-26 at 15.29.30.png`（深色设置）
- **Marchen Player 现有 UI**（只读参考）：
  - `../marchen-player/src/renderer/src/styles/shadcn.css`：蓝色用作背景和用作文字分开取值（`--brand-text`）
  - `../marchen-player/src/renderer/src/styles/settings.css`：设置页尺寸基准（168px 导航、64px 行高、12px 说明、13px 分组标题、一像素边框分组）
  - `../marchen-player/src/renderer/src/components/modules/settings/`：设置页区块的拆分方式

## 从参考中提炼的设计原则（待写进 design skill）

**颜色分工**
- 黑 / 白：主操作（浅色下黑底白字，深色下白底黑字）
- 强调色：只表示状态或身份（开关开启、选中、进度、链接、"我"），一屏大致不超过 3～5 处
- 灰阶：其余一切，层级靠 3～5 档灰区分

**层级与深度**
- 浅色：越往上越白；阴影只给浮层，平铺内容不加阴影
- 深色：越往上越亮，用一像素浅色边框代替阴影；底色接近黑但不是纯黑，文字接近白但不是纯白
- 遮罩：最多轻微模糊，内容层不用毛玻璃

**形状、尺寸、密度**
- 控件、按钮、气泡统一胶囊 / 圆形；卡片单独一档圆角
- 正文 13～14px，控件高度 28～32px，信息偏紧凑
- 设置页：左侧线性图标 + 文字导航，选中项浅灰圆角底（不用强调色、不加粗、不加竖条）；右侧分组卡片，小号灰色分组标题在卡片外，行内左侧名称 / 右侧控件

**禁用清单**
- 渐变、发光阴影、渐变文字
- 把强调色以外的彩色用于装饰
- 非浮层的大阴影、内容层毛玻璃、emoji 图标、`cursor-pointer`

## 参考文档

- shadcn registry：https://ui.shadcn.com/docs/registry
- registry-item.json：https://ui.shadcn.com/docs/registry/registry-item-json
- 命名空间：https://ui.shadcn.com/docs/registry/namespace
- CLI：https://ui.shadcn.com/docs/cli
- Base UI 成为默认：https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default
