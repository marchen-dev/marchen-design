## 1. theme 条目

- [x] 1.1 `scripts/gen-tokens.ts` 输出 `theme` 条目（与 base 相同的 cssVars；css 只含层级变量和 `html` 字体；无 config / 依赖），`pnpm gen`
- [x] 1.2 冒烟测试新增"仅 token 模式"：Radix 项目安装 `theme`，校验变量更新、`style` 与 button 未变、编译通过，再安装 `accent-green` 校验强调色变化
- [x] 1.3 `pnpm check`、`pnpm smoke` 通过

## 2. design skill

- [x] 2.1 `references/principles.md`：颜色分工、层级与深度、四档圆角、尺寸与密度、明暗模式要点、禁用清单，每条附原因（来源：AGENTS.md 组件视觉规格、BRIEF.md 原则）
- [x] 2.2 `references/patterns.md`：设置页、列表页（搜索 + 筛选）、表单、详情页、空状态，每类按"结构 / 组件 / 要点 / 常见错误"四段
- [x] 2.3 `references/token-mode.md`：仅 token 模式下仍适用和不适用的规则，以及不要改写项目组件
- [x] 2.4 `SKILL.md`：frontmatter（description、when_to_use、allowed-tools）；模式检测表；完整模式 6 条硬规则（附原因）；仅 token 模式说明；工作流程（何时读哪份 reference、完成后运行 lint）；正文控制在约 80 行

## 3. design-review

- [x] 3.1 `SKILL.md`：范围确定（用户指定 > git 改动 > 询问）、运行 lint、清单检查项、按"必须修改 / 建议修改 / 通过"输出、不自动修改；`allowed-tools` 预授权 lint 与只读 git 命令

## 4. design-init

- [x] 4.1 新建 `skills/design-init/SKILL.md`（`disable-model-invocation: true`），删除 `commands/design-init.md` 与 `commands/` 目录
- [x] 4.2 按 design D7 写出四类情况的判断与操作步骤、D8 的自定义主题判断、强调色选择、覆盖前确认、完成后总结

## 5. 收尾与试用

- [x] 5.1 `plugin.json` 版本号升为 `0.1.0`；`claude plugin validate ./ ` 与 `claude plugin validate ./plugin --strict` 通过
- [x] 5.2 本地安装 plugin，在临时目录的新项目中试用：`design-init` → "做一个带搜索和筛选的列表页" → `design-review`；记录触发情况、规则遵守情况和问题
- [x] 5.3 根据试用结果调整规则（如有）；验证完卸载本地安装的 plugin 与 marketplace
  > **试用记录（2026-10-26）**
  > - 列表页（Base UI 项目，请求中未提 marchen-design）：skill 自动触发；生成页面只用语义 token，筛选用 tabs，空状态单一 secondary 操作，lint 零违规；对比未加载 skill 的版本少了强调色装饰。费用约 $0.36 / 次。
  > - design-init（Radix 项目）：正确识别为仅 token 模式，列出将覆盖的变量并先确认，未修改任何文件，主动提示主按钮会变为强调色。
  > - 发现并修正：① plugin 目录在项目外，references 读取被权限拦截 → `allowed-tools` 增加 `Read(/${CLAUDE_SKILL_DIR}/**)`，复测可读取；② AI 盲试不存在的 `@marchen-design/table`、`badge` → 硬规则 1 改为"先查组件目录，未列出的直接从上游安装"。
  > - 试用环境注意：临时项目必须用 `npm_config_registry` 指定官方源；非交互试用需要预授权 `Skill`。
- [x] 5.4 README 的 Claude Code plugin 一节改为可用状态（三个入口的用法）；AGENTS.md 补充 plugin 结构与 theme 条目
- [x] 5.5 `pnpm check` 通过
