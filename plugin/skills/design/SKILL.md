---
name: design
description: >-
  在配置了 marchen-design 的项目中设计和实现 UI（components.json 的 registries 含 "@marchen-design"），
  或用户明确要求使用 marchen-design / 黑白加单一强调色风格时使用。提供组件与区块的选用、页面组合方式和必须遵守的样式规则。
  项目没有配置 @marchen-design 且用户没有要求时不要使用，按项目自己的设计系统来。
when_to_use: 做页面、表单、设置页、列表、弹窗，调整 UI 样式，新增或替换组件时
allowed-tools: Read(/${CLAUDE_SKILL_DIR}/**) Bash(node ${CLAUDE_PLUGIN_ROOT}/skills/design-review/scripts/lint-design.mjs *)
---

# marchen-design

黑白 + 单一强调色的设计系统，基于 shadcn（Base UI）与 Tailwind CSS 4。组件和区块已经内置了形状、层级、颜色规则，你的任务是**选对组件、正确组合、不去覆盖它们的样式**。

## 第一步：判断项目模式

读 `components.json`：

| 情况 | 模式 |
| --- | --- |
| `style` 以 `base-` 开头 | **完整模式**：使用下面全部规则 |
| `style` 以 `radix-` / `aria-` 开头，或为 `new-york` / `default` | **仅 token 模式**：读 `${CLAUDE_SKILL_DIR}/references/token-mode.md`，按它的规则做 |
| 没有 `components.json` | 先告诉用户可以运行 `/marchen-design:design-init`，再按项目现状完成任务 |

## 硬规则（完整模式）

1. **组件和区块优先用 `@marchen-design` 提供的**。先查 `references/components.md`：列在里面的，项目里没有就 `npx shadcn@latest add @marchen-design/<name>`；**没列出的（如 table、badge）不要试 `@marchen-design/` 前缀，直接从 shadcn 上游安装** `npx shadcn@latest add <name>`，会自动使用 marchen-design 的 token。不要用 div 和 class 手写一个外观相似的组件——手写的版本缺少内置的状态、焦点和深色处理。
2. **设置界面用 settings 区块**（SettingsDialog / SettingsShell → SettingsSection → SettingsRow）。普通竖排表单才用 `field`。区块封装了对齐、层级和焦点，手拼很容易漏。
3. **不用 className 覆盖组件的颜色、圆角、阴影、字号**。要换样式就换变体或尺寸（`variant`、`size`）；布局类 class（宽度、间距、定位、栅格）可以加。覆盖会破坏圆角层级和明暗适配。
4. **颜色只用语义 token**：`bg-background`、`bg-card`、`bg-muted`、`text-foreground`、`text-muted-foreground`、`text-primary-text`、`border-border`、`text-destructive` 等。不用 Tailwind 调色板颜色（`bg-blue-500`、`text-gray-500`）、写死的色值、渐变、强调色以外的装饰色。否则换强调色和切深色时不会跟着变。
5. **按钮分工**：主操作 `default`（黑白），次要操作 `secondary`，工具栏和行内 `ghost`，危险操作 `destructive`；`brand`（强调色）每屏最多一个，通常不需要。强调色只表示状态（开关、选中、进度、焦点、链接）。
6. **不加**：`cursor-pointer`、emoji 图标、毛玻璃（`backdrop-blur`）、非浮层的大阴影（`shadow-lg` 及以上）。图标用 `lucide-react` 线性图标，颜色继承或用 `text-muted-foreground`。

## 工作流程

1. 需要某个组件或区块时，查 `${CLAUDE_SKILL_DIR}/references/components.md`：里面有每个组件的用途、"何时使用"和"不要这样用"，以及安装命令。
2. 做设置页、列表页、表单、详情页、空状态时，先读 `${CLAUDE_SKILL_DIR}/references/patterns.md` 中对应的一节，按其中的结构组合。
3. 规则没覆盖到、拿不准时，读 `${CLAUDE_SKILL_DIR}/references/principles.md` 中的原因再判断。
4. 安装组件或区块会修改项目文件，执行前告诉用户要安装什么。
5. **完成后自查**：对改动过的 UI 文件运行

   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/skills/design-review/scripts/lint-design.mjs <文件或目录...>
   ```

   有违规就修正后再交付。用户要求完整审查时，使用 `/marchen-design:design-review`。

## 参考资料

| 文件 | 内容 |
| --- | --- |
| `references/components.md` | 组件与区块目录（自动生成） |
| `references/patterns.md` | 五类页面的结构、组件、要点、常见错误 |
| `references/principles.md` | 颜色分工、层级、圆角、密度、禁用清单及原因 |
| `references/token-mode.md` | Radix / React Aria 项目的做法 |
| `references/tokens.css` | 纯 CSS 版 token（非 React 项目手动引入） |
