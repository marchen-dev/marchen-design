---
name: design-review
description: >-
  审查 UI 代码是否符合 marchen-design 的规则：先运行零依赖的设计规则检查脚本，再对照清单检查脚本无法判断的项，
  输出按严重程度分组的问题和修改建议。用于用户要求审查 / 检查 UI，或完成 marchen-design 项目中的较大 UI 改动之后。
when_to_use: 审查 UI、检查设计规范、design review、看看这个页面有没有问题
allowed-tools: Read(/${CLAUDE_PLUGIN_ROOT}/skills/**) Bash(node ${CLAUDE_SKILL_DIR}/scripts/lint-design.mjs *) Bash(git diff --name-only *) Bash(git status --porcelain *)
---

# marchen-design 审查

只报告问题，**不要直接修改代码**；用户看完结果明确要求后再改。

## 1. 确定范围

按优先级：

1. 用户指定的文件或目录；
2. 否则取 git 工作区中改动的 UI 文件：`git status --porcelain`，保留 `.tsx` `.jsx` `.ts` `.css` `.html` `.vue`（跳过 `components/ui/` 下未改动的组件源码和生成文件）；
3. 都没有时询问用户要审查什么。

读 `components.json` 判断项目模式（规则同 design skill）：`style` 以 `base-` 开头为完整模式；`radix-` / `aria-` / `new-york` / `default` 为仅 token 模式。

## 2. 自动检查

```bash
node ${CLAUDE_SKILL_DIR}/scripts/lint-design.mjs <文件或目录...>
```

脚本检查：渐变、Tailwind 调色板颜色、写死的色值、非浮层的大阴影、`cursor-pointer`、内容层毛玻璃。退出码 1 表示有违规，输出里有文件、行号和违规写法。同一行写了 `lint-design-ignore` 的视为作者有意豁免，可以在结果中列出但不算违规。

## 3. 清单检查

读审查范围内的文件，逐项检查脚本判断不了的问题：

**完整模式**
- [ ] 手写了 marchen-design 已提供的组件或区块（用 div + class 拼开关、下拉、对话框、设置行等）→ 改用对应组件，查插件的 `skills/design/references/components.md`
- [ ] 设置界面没有使用 settings 区块，或用 `field` 手拼了设置行
- [ ] 用 className 覆盖了组件的颜色、圆角、阴影或字号（例如给 `Button` 加 `bg-*`、`rounded-full`、`shadow-*`）
- [ ] 一屏有多个主操作，或主操作不是 `default` 变体；`brand` 按钮超过一个
- [ ] 强调色用于装饰而不是状态（例如强调色的标题、卡片背景、图标）
- [ ] 大面积容器使用了 `bg-card` / `bg-popover`，导致其中的卡片显得凹陷
- [ ] 用了 emoji 当图标，或图标被单独上了彩色

**仅 token 模式**
- [ ] 安装或引入了 `@marchen-design` 的组件、区块或 base
- [ ] 修改了 `components.json` 的 `style`，或改写了项目已有组件来模仿 marchen-design

**两种模式都检查**
- [ ] 页面结构是否符合 `skills/design/references/patterns.md` 中对应页面类型的要点（列表页行操作收进菜单、表单单列、空状态只有一个操作等）

## 4. 输出

```
## 必须修改
- path/to/File.tsx:42 · 禁止渐变 · `bg-gradient-to-r from-...` → 改为 `bg-card`，层级用底色和边框表现
- …

## 建议修改
- path/to/File.tsx:10 · 每行有 3 个按钮 · 把"复制""删除"收进 ⋯ 的 DropdownMenu

## 通过的检查
- 颜色只用语义 token、按钮分工正确、……

审查范围：<文件列表> · 项目模式：完整 / 仅 token
```

"必须修改"对应硬规则和脚本违规；"建议修改"对应页面组合和一致性问题。没有任何问题时，直接说明"通过"并列出审查过的文件。
