## 动机

marchen-design 是一套通用的「黑白 + 单一强调色」设计系统，面向工具和应用类界面。它由三部分组成：shadcn 自定义 registry、Claude Code plugin 和预览站。立项讨论和 spike 已经验证了核心分发链路：`registry:base` 配合 `shadcn init <url>` 可以一次装好配置、token 和组件；按命名空间 `add` 和按 URL `add` 也都能用。

但 spike 产物只是验证用的原型，有几个结构性问题，现在不解决，组件一多就会失控：

- **token 有两份**：`registry.json` 里的 cssVars 和预览站的 `src/index.css` 各写一份，已经开始漂移。强调色每种都要手写明暗共 8 个值，也没有对比度保障。
- **`registry.json` 全部手写**：组件到几十个时，`dependencies`、`registryDependencies` 靠人工对照 import，一定会漏。
- **没有自动化验证**：init、add、build 三个场景是手工跑的，没有设计规则检查，也没有视觉回归。
- **预览站只是一个按钮列表**：无法同时对比「明暗 × 强调色」，弹层组件在局部 `.dark` 容器里会因为 portal 显示错误的主题。

这个变更要在批量改写组件之前，把仓库架构、生成链路和验证体系定型，让后续每加一个组件都走同一条有保障的流程。

## 变更内容

**目录与工程**
- `src/` 迁移为 `preview/`，作为预览站兼文档站。
- 组件改为每个组件一个文件夹（`registry.json` + 源码 + `*.stories.tsx`），根目录 `registry.json` 用官方 `include` 聚合。
- 新增 `AGENTS.md`，写明源头与生成物的区分、加组件的流程。

**token**
- 新增 `tokens/`（TS）作为唯一的 token 源头，分三层：原始灰阶和强调色、语义 token、非颜色 token。
- 新增 `gen-tokens`，从这一份源头生成 registry 主题条目、预览站的作用域式 CSS 和 plugin 的兜底 `tokens.css`，并做 WCAG 对比度检查。
- 字体使用系统字体栈，不安装字体包。
- 新增语义 token `primary-text`、`overlay`，不暴露原始灰阶工具类。

**registry**
- 新增 `check-registry`，校验 import 与依赖声明是否一致。
- `base` 条目定义 15 个核心组件（button、input、textarea、field、select、switch、checkbox、dialog、dropdown-menu、popover、tooltip、tabs、card、scroll-area、toast）及其依赖。区块和其余组件按需 `add`。
- 强调色预设由色相参数派生，生成 `accent-*` 条目。
- 本变更只把 `button`（精简为 4 种尺寸）和 `utils` 迁移到新结构，作为整条链路的样板。其余核心组件的改写放到后续变更。

**预览站**
- gallery 自动收集 `*.stories.tsx`（CSF 格式），每个 story 以「明暗 × 强调色」iframe 矩阵展示。
- 预留 demos 和文档站外壳。

**验证**
- `lint-design`：扫描禁用的类名，仓库和 plugin 的 review 共用这一份脚本。
- `smoke`：把 spike 的三个安装场景自动化。
- `screenshot`：遍历 iframe 单格截图，作为视觉回归基准。
- 聚合成一条 `pnpm check`。

**plugin**
- 建立 plugin 骨架（`plugin.json`、`marketplace.json`、目录结构），生成的 `components.md` 和 `tokens.css` 写入其中。SKILL.md 等规则内容不在本变更范围内，等组件和 demo 验证完成后再写。

**移除**
- 不做上游同步机制。组件从 shadcn 复制一次之后由我们自己维护，只保持组件名、子组件结构和常用 prop 名与 shadcn 一致。
- 删除 spike 时留下的平铺结构和手写主题条目。

## 能力

### 新增能力
- `design-tokens`：token 源头的三层结构、生成到三个目标、对比度检查、强调色派生、字体栈。
- `registry-authoring`：每个组件一个文件夹、include 聚合、条目元数据约定、依赖一致性校验、构建与 URL 改写。
- `registry-install`：`base` 核心集、强调色主题条目，以及 init、命名空间 add、URL add 三个安装场景应达到的结果。
- `preview-gallery`：stories 约定、iframe 矩阵、单格地址、文档站外壳与 demos 预留。
- `verification`：设计 lint、生成一致性、冒烟测试、截图回归，以及聚合命令。
- `plugin-scaffold`：plugin 与 marketplace 清单、目录结构、生成物落点。

### 修改能力
无（项目中尚无已归档的能力规格）。

## 影响范围

- **代码**：`src/` → `preview/`；`registry/` 重组；新增 `tokens/`、`scripts/` 下的多个脚本、`plugin/`、`.claude-plugin/`、`tests/visual/`、`AGENTS.md`；修改 `vite.config.ts`、`tsconfig*.json`、根 `registry.json`、`package.json`。
- **依赖**：新增 Playwright（截图和冒烟测试）、`tsx`（运行 TS 脚本，选型以 design 为准）；锁定 `@base-ui/react` 版本。
- **对外**：registry 的条目名（`base`、`button`、`utils`、`accent-*`）和 URL 结构 `/r/{name}.json` 保持与 spike 一致；Button 尺寸从 8 种精简为 4 种（目前还没有外部使用者）。
- **不受影响**：`marchen/`、`.claude/` 以及 Marchen Player。
