# 仅 token 模式

项目底层是 Radix 或 React Aria（`components.json` 的 `style` 为 `radix-*`、`aria-*`、`new-york`、`default`）时使用。marchen-design 的组件基于 Base UI，API 与 Radix 不同（例如 `render` 与 `asChild`），不能混用，所以这类项目只引入 token。

## 仍然适用

- **颜色分工**：主操作用 Button 的 default 变体（token 已把 `primary` 设为强调色——如果项目 Button 的 default 用的是 `bg-primary`，主操作会显示为强调色；这种情况下主操作改用项目里黑白风格的变体，或保持项目原样，不要为此改写组件）。
- **只用语义 token**：`bg-background`、`text-muted-foreground`、`border-border`、`text-primary-text` 等；不用调色板颜色、写死色值、渐变、装饰性彩色。
- **层级**：大面积容器用 `bg-background`，卡片用 `bg-card`；深色下靠底色和边框区分层级。
- **禁用清单**：见 `principles.md`，全部适用。
- **页面组合参考**：`patterns.md` 中的结构和要点适用，组件换成项目里已有的同类组件。设置页没有 settings 区块可用，按其结构用项目已有的组件组合。

## 不适用

- 四档圆角、深色浮层不用阴影、胶囊开关等组件内置的形状规则：项目组件是上游 Radix 版本，形状和阴影保持上游默认。
- "只用 @marchen-design 组件、没有就 add"：**不要**安装 marchen-design 的组件或区块，也不要安装 base。
- 需要新组件时，从项目原本使用的来源安装（例如 `npx shadcn@latest add <name>`，按项目的 `style` 安装 Radix 版本）。

## 不要做

- 不要改写项目已有的组件来"模仿" marchen-design 的形状。
- 不要修改 `components.json` 的 `style`。
- 想要完整的 marchen-design 风格，需要先把项目迁移到 Base UI，这超出日常 UI 任务的范围，应先和用户确认。
