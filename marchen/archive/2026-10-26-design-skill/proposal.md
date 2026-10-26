## 动机

项目最初的目标是让 AI 在任何项目里做 UI 时，都能走「黑白 + 单一强调色」这套风格，而不是默认的 AI 味（渐变、靛紫色、到处阴影、emoji 图标）。registry 的组件、区块和 token 已经完整上线（`https://design.suemor.com`），但 Claude Code plugin 里的三个入口目前都是占位：

- `design` skill 只声明"尚未完成"，不提供任何规则；
- `design-review` 只有 lint-design 脚本，没有审查流程；
- `design-init` 命令只告诉用户手动执行 `shadcn init`。

另外，已有项目分成几种情况（Base UI、Radix、React Aria、非 React），目前只有"新项目 init base"这一条路。Radix 项目没法安全地只引入 token，因为 base 会改写 `components.json` 并安装 Base UI 组件。

立项时定过：等组件和 demo 验证完，再从验证过的代码里总结规则。现在组件、区块、demo 都已完成，是写规则的时候了。

## 变更内容

**design skill（规则内容）**
- 触发条件：项目的 `components.json` 配置了 `@marchen-design` 命名空间，或者用户明确要求这种风格。有自己设计系统的项目不会被误触发。
- 每次使用时自行检测项目模式：完整模式（Base UI，使用 marchen-design 的组件与区块）或仅 token 模式（Radix / React Aria，只遵守 token 与原则）。不依赖 init 写入额外记录。
- SKILL.md 只放少量可检查的硬规则和工作流程，细节放在 references 中按需读取。
- 新增页面组合参考：列表页（搜索 + 筛选）、表单、详情页、空状态；设置页指向 settings 区块。
- 原则参考：颜色分工、层级与深度、形状、密度、明暗模式要点、禁用清单。

**design-review skill（审查流程）**
- 运行 lint-design 扫描改动的文件，再对照审查清单检查无法用正则判断的项（主操作是否唯一、强调色用量、是否手写了已有组件等），输出问题清单和修改建议。

**design-init（初始化流程）**
- 读取 `components.json` 判断项目情况，分为：新项目、Base UI 项目（有 / 无自定义主题）、Radix 或 React Aria 项目、非 React + Tailwind 4 项目，分别执行对应的安装方式。
- 任何会覆盖已有文件或 CSS 变量的步骤，执行前先向用户确认。
- 可选择强调色。

**只含 token 的主题条目（`theme`）**
- 新增 registry 条目，只包含明暗 token 和字体、圆角、动效等主题变量，不改写 `components.json` 的配置，不安装任何组件。供 Radix / React Aria 项目和"只想试配色"的项目使用。由 gen-tokens 生成。

**文档**
- README 的 Claude Code plugin 一节更新为可用状态，说明三个入口的用法。

**不做 eval**：不建立 `claude plugin eval` 评测。完成后在一个真实项目中试用一次，根据结果调整规则。

## 能力

### 新增能力
- `design-skill-rules`：触发条件、项目模式检测、硬规则、工作流程与参考资料组织。
- `design-review-flow`：审查流程、lint 范围、审查清单与输出形式。
- `design-init-flow`：项目情况判断、各分支的安装行为、覆盖前确认、强调色选择。
- `theme-only-item`：只含 token 的主题条目的内容与安装效果。

### 修改能力
- `plugin-scaffold`（`scaffold-architecture` 中定义）：占位内容替换为正式内容。原规格要求占位阶段"不输出规则"，本变更结束后不再是占位，相关要求由新能力取代。

## 影响范围

- **plugin**：`plugin/skills/design/SKILL.md` 及 `references/`（新增 principles.md、patterns.md、modes.md 等）、`plugin/skills/design-review/SKILL.md`、`plugin/commands/design-init.md`（可能改为 skill 形式，见 design）、`plugin/.claude-plugin/plugin.json` 版本号。
- **registry**：`scripts/gen-tokens.ts` 新增 `theme` 条目输出；`registry/themes/registry.json` 随之变化。
- **验证**：冒烟测试新增"仅 token 模式"场景（在 Radix 项目中安装 `theme`）。
- **文档**：README、AGENTS.md。
- **不涉及**：组件、区块代码，token 取值，部署配置。
