## 背景

已完成并归档的变更（见 `marchen/changelog.md`）提供了：token 生成链路、17 个核心组件、`sidebar-nav` 与 `settings` 区块、部署在 `https://design.suemor.com` 的 registry，以及 plugin 骨架。plugin 当前状态：

```
plugin/
├── .claude-plugin/plugin.json        version 0.0.1
├── skills/design/SKILL.md            占位："尚未完成，不提供规则"
│   └── references/components.md      ◇ gen-catalog 生成：每个组件 / 区块的描述、何时使用、不要这样用
│   └── references/tokens.css         ◇ gen-tokens 生成：纯 CSS token
├── skills/design-review/SKILL.md     占位
│   └── scripts/lint-design.mjs       零依赖规则检查（渐变、调色板颜色、写死色值、非浮层大阴影、cursor-pointer、内容层毛玻璃）
└── commands/design-init.md           占位
```

提案阶段确认的事实：

- **skill 内引用自带文件**：skill 正文和 `allowed-tools` 中可以使用 `${CLAUDE_SKILL_DIR}`（该 skill 的目录）和 `${CLAUDE_PLUGIN_ROOT}`（plugin 安装目录），文档没有承诺裸相对路径会按 skill 目录解析。
- **命令的推荐写法**：官方文档说明 commands 是旧格式，新内容推荐用 skill；只允许用户触发的用 `disable-model-invocation: true`，调用名为 `/<plugin>:<skill 目录名>`。
- **frontmatter**：`description` + `when_to_use` 合计在列表中截断到 1,536 字符，关键用途要写在最前面；`allowed-tools` 只在触发该 skill 的这一轮免确认。
- **skill 之间互相调用**没有文档保证；需要确定执行的步骤，直接写脚本路径。
- **shadcn 如何从 `style` 判断底层组件库**（`@shadcn/registry` 的 `getBase`）：未设置为 Base UI；新格式名取前缀（`base` / `radix` / `aria`）；`new-york`、`default` 等旧名视为 Radix。
- **base 条目的全局样式**里 import 了 `tw-animate-css` 和 `shadcn/tailwind.css`，二者都依赖 npm 包。

## 目标与非目标

**目标：**
- `design` skill 给出可检查的硬规则、模式检测、工作流程，细节放在 references。
- `design-review` 给出"脚本 + 清单"的审查流程。
- `design-init` 覆盖新项目、Base UI、Radix / React Aria、不支持的项目四类情况，所有覆盖先确认。
- 新增只含 token 的 `theme` 条目，冒烟测试覆盖 Radix 项目安装 `theme`。
- 在一个真实项目中试用，根据问题调整规则。

**非目标：**
- `claude plugin eval` 评测。
- Tailwind CSS 3 项目的支持（token 写法和 `@theme inline` 只适用于 v4）。
- 新的组件或区块；页面组合参考中缺的组件，先指向 shadcn 上游。
- 自动修复：design-review 只报告，不直接改代码。

## 决策

### D1. plugin 结构

```
plugin/
├── .claude-plugin/plugin.json          version → 0.1.0
└── skills/
    ├── design/
    │   ├── SKILL.md                    触发条件 · 模式检测 · 硬规则 · 工作流程（目标：正文约 80 行以内）
    │   └── references/
    │       ├── components.md           ◇ 已有（生成）
    │       ├── tokens.css              ◇ 已有（生成）
    │       ├── principles.md           ◆ 颜色分工、层级与深度、形状、密度、明暗模式、禁用清单（含原因）
    │       ├── patterns.md             ◆ 设置页 / 列表页 / 表单 / 详情页 / 空状态
    │       └── token-mode.md           ◆ 仅 token 模式下怎么做（不能用区块时如何按原则组合）
    ├── design-review/
    │   ├── SKILL.md                    审查流程 + 清单
    │   └── scripts/lint-design.mjs     ◆ 已有，不改动
    └── design-init/
        └── SKILL.md                    disable-model-invocation: true；初始化流程
```

- **design-init 从 `commands/` 改为 skill**：按官方推荐写法，调用名不变（`/marchen-design:design-init`），并且能用 `allowed-tools` 预先授权它需要的 `npx shadcn` 命令。删除 `commands/` 目录。
- **design-review 允许模型调用**（不设 `disable-model-invocation`），用户可以主动调用，design skill 也能引导 AI 使用它。但 design skill 中"完成后自查"这一步**直接写 lint 脚本路径**（`node ${CLAUDE_PLUGIN_ROOT}/skills/design-review/scripts/lint-design.mjs <文件>`），因为 skill 之间的调用没有保证；需要完整清单审查时才提示使用 design-review。
- 版本号升到 `0.1.0`：第一个可用版本。

### D2. design 的触发描述

```yaml
name: design
description: >-
  在配置了 marchen-design 的项目中设计和实现 UI（components.json 的 registries 含
  "@marchen-design"），或用户明确要求 marchen-design / 黑白加单一强调色风格时使用。
  提供组件与区块的选用、页面组合方式和必须遵守的样式规则。项目没有配置 @marchen-design
  且用户没有要求时不要使用。
when_to_use: 做页面、表单、设置页、列表、弹窗、调整 UI 样式、新增组件时
allowed-tools: Bash(node ${CLAUDE_PLUGIN_ROOT}/skills/design-review/scripts/lint-design.mjs *)
```

- 把判断条件写进 description 本身，让"不触发"的边界和"触发"一样明确。
- `allowed-tools` 只预授权 lint 脚本；`npx shadcn add` 不预授权，安装组件时由用户确认，避免在用户不知情时改动依赖。

### D3. SKILL.md 的正文结构

```
## 第一步：判断项目模式            （读 components.json，规则表，见 D4）
## 硬规则（完整模式）              （5～7 条，全部可检查）
   1. 组件和区块只用 @marchen-design 提供的；没装就 add；没有的从 shadcn 上游 add
   2. 设置界面用 settings 区块；不要用 field 手拼设置行
   3. 不用 className 覆盖组件的颜色、圆角、阴影、字号；布局类 class 可以
   4. 颜色只用语义 token；不用调色板颜色、写死色值、渐变、装饰性彩色
   5. 主操作 Button default（黑白），次要 secondary，危险 destructive；brand 每屏最多一个；强调色只表示状态
   6. 交互元素不加 cursor-pointer；不加 emoji 图标；不加毛玻璃
## 硬规则（仅 token 模式）          （一句话：组件用项目已有的，规则 3～6 同样适用，见 token-mode.md）
## 工作流程
   需要组件 → 查 references/components.md
   做某类页面 → 查 references/patterns.md 对应章节
   拿不准为什么 → 查 references/principles.md
   完成后 → 运行 lint 脚本扫描改动的文件，修正后再交付
```

- 规则 1～6 与 lint-design 的规则、AGENTS.md 的"组件视觉规格"保持一致，只是换成面向使用者的写法。lint 能查的（规则 4、6 的大部分）以脚本为准；lint 查不了的（规则 1、2、3、5）由 AI 遵守，design-review 的清单再查一遍。
- 每条规则后面用一句话说明原因（例如"覆盖圆角会破坏四档圆角层级"）。只写结论的规则，AI 遇到边界情况时容易自行变通。

### D4. 模式检测规则

| `components.json` | 模式 | 行为 |
| --- | --- | --- |
| 不存在 | — | 不做 UI 规则之外的事，提示用户运行 `/marchen-design:design-init` |
| `style` 以 `base-` 开头 | 完整 | 组件、区块、token 全部使用 |
| `style` 以 `radix-` / `aria-` 开头，或为 `new-york` / `default` 等旧名 | 仅 token | 不安装 marchen-design 组件和区块；组件用项目已有的；遵守 token 与原则 |

- 与 shadcn CLI 的 `getBase` 判断一致，用户手动安装（没跑 init）也能正确识别。
- 仅 token 模式下，项目里的组件是上游 Radix 版本，形状和阴影是上游默认的。`token-mode.md` 说明在这种情况下哪些规则仍然适用（颜色分工、语义 token、禁用清单），哪些不适用（四档圆角、组件内置的深色边框），以及不要去改写项目组件来"模仿" marchen-design。

### D5. patterns.md 的写法

每类页面固定四段，保持短小：

```
### 列表页（搜索 + 筛选）
结构：    顶部工具栏（标题 · 搜索 input · 筛选 select · 主操作 Button）→ 列表 → 空状态
组件：    input、select / dropdown-menu、button、card 或普通行、dropdown-menu（行操作）
要点：    主操作只有一个且在右上；行操作收进 ⋯ 菜单；筛选条件 ≤ 3 个时平铺，更多时收进 popover
常见错误：每行都放三四个按钮；给每行加彩色徽章；用卡片网格展示纯文本数据
```

- 页面类型：设置页（直接指向 settings 区块的用法）、列表页、表单、详情页、空状态。
- 用到 marchen-design 还没有的组件（如 table、badge）时，写明"从 shadcn 上游 add，会自动使用 token"，并给出使用上的约束（例如 badge 只用于状态，不用于装饰）。
- 不放大段代码。结构图 + 组件名就够了，代码 AI 自己会写；放大段代码反而会被原样照抄，限制组合。

### D6. design-review 流程

```
1. 确定范围：用户指定 > git 工作区改动的 UI 文件（tsx/jsx/css/html/vue）> 询问
2. 运行 lint：node ${CLAUDE_SKILL_DIR}/scripts/lint-design.mjs <文件...>
3. 读文件，逐项对照清单（D3 规则 1、2、3、5，外加仅 token 模式下是否误装组件）
4. 输出：
   ## 必须修改（违反硬规则）     文件:行  规则  建议
   ## 建议修改（可读性 / 一致性）
   ## 通过的检查
```

- 不自动修改。用户看完结果后说"按建议修改"，再由 AI 执行。
- `allowed-tools` 预授权 lint 脚本和 `git diff --name-only`、`git status --porcelain`（用于确定范围）。

### D7. design-init 流程

```
           ┌─ 读 package.json、components.json、全局 CSS ─┐
           ▼                                            │
   ┌───────┴───────────────────────────────────────┐    │
   空目录 / 无 package.json                          │    │
   → 问：项目名、模板（vite 默认 / next / …）、强调色    │    │
   → npx shadcn@latest init <URL>/r/base.json -t <模板> -n <名>
   有 components.json                               │
   ├─ base-*  → 检查自定义主题（D8）                    │
   │    ├─ 无 → 列出将覆盖的组件与变量 → 确认 → add <URL>/r/base.json
   │    └─ 有 → 问：覆盖主题 / 只配置命名空间
   └─ radix-* / aria-* / 旧名
        → 列出将覆盖的变量 → 确认 → 写入命名空间 → add @marchen-design/theme
   有 package.json、无 components.json
   ├─ React + Tailwind 4 → 先 shadcn init（Base UI）→ 同"新项目"的 base 安装
   └─ 其他 → 说明条件，指向 ${CLAUDE_PLUGIN_ROOT}/skills/design/references/tokens.css
           ▼
   强调色非蓝色 → add @marchen-design/accent-<色>
           ▼
   总结：模式、安装了什么、下一步
```

- registry 地址写在 skill 里（`https://design.suemor.com`），这是正式地址，不会变（AGENTS.md 已注明）。
- "写入命名空间"：直接编辑 `components.json` 的 `registries` 字段，保留其他内容。
- `allowed-tools` 预授权只读检查命令（读文件、`ls`），安装命令每次都由用户确认，保证"覆盖前确认"。

### D8. 判断"有没有自定义主题"

比较全局 CSS 中 `:root` 下的 `--primary`、`--background`、`--radius` 三个变量与 shadcn 默认值（neutral 基色）是否一致。任一不同即视为有自定义主题，让用户决定。这是启发式判断：宁可多问一次，不要误覆盖。

### D9. theme 条目

gen-tokens 新增输出 `theme` 条目（`registry:theme`）：

```
{
  name: "theme", type: "registry:theme",
  cssVars: { theme: foundation.theme, light: { radius, ...light }, dark },   // 与 base 完全相同
  css: { "@layer base": { ":root": zIndex, html: { "@apply font-sans": {} } } }
}
```

- 与 base 共用同一份计算结果，保证一致。
- **不包含** base 中的 `@import "tw-animate-css"` 和 `@import "shadcn/tailwind.css"`：它们需要 npm 包，而 `theme` 的定位是不引入依赖；已有的 shadcn 项目通常已经有这两项。
- 没有 `config`、`dependencies`、`registryDependencies`。

### D10. 验证

- `pnpm check`：生成物一致性会覆盖 `theme` 条目。
- **冒烟测试新增"仅 token 模式"**：`shadcn init -t vite -b radix -p nova` 创建 Radix 项目（`style` 为 `radix-nova`）→ 记录 `components.json` 的 style 和 button 文件哈希 → `add <URL>/r/theme.json` → 校验 `--primary` 为 marchen-design 的值、style 未变、button 未变、编译通过 → 再 `add accent-green`，校验强调色变化。
- `claude plugin validate ./plugin --strict` 通过。
- **真实项目试用**：完成后本地安装 plugin，在一个新的 Vite 项目中走一遍 `design-init` → "做一个带筛选的列表页" → `design-review`，记录问题并调整规则。试用的项目和结果记录在 tasks 中，不提交到仓库。

## 风险与权衡

- **R1：不做 eval，无法量化规则是否有效。** 用三点缓解：规则全部写成可检查的；lint 自动兜底；真实项目试用一次。某条规则是否多余无法判断，所以坚持 SKILL.md 简短，宁可少写。
- **R2：触发描述可能过宽或过窄。** 写成以"配置了 @marchen-design"为条件，试用时观察是否被正常触发。如果在已配置的项目中不触发，调整 `when_to_use` 的措辞。
- **R3：自定义主题的判断是启发式的**（D8），可能把轻微修改过的默认主题也当作自定义主题。代价只是多问一次。
- **R4：仅 token 模式的效果有限。** 上游 Radix 组件的形状和阴影仍然是上游默认的，只有颜色会统一。这是有意的取舍：不改写用户项目的组件。在 token-mode.md 中写明。
- **R5：registry 地址写死在 skill 里。** 如果将来更换域名，要同时改 skill；AGENTS.md 已经规定不换。
- **R6：`allowed-tools` 中 `${CLAUDE_PLUGIN_ROOT}` 的 Bash 规则写法**以文档示例为准（`Bash(<路径> *)` 形式）。如果试用时仍然每次弹出确认，再调整写法。
