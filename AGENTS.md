# marchen-design 开发约定

「黑白 + 单一强调色」设计系统，面向工具 / 应用类界面。仓库同时是三样东西：

- **shadcn registry**：`registry/` 源码 → `public/r/*.json`，用户用官方 shadcn CLI 安装
- **预览站**：`preview/`（Vite），gallery 以「明暗 × 强调色」iframe 矩阵展示每个 story
- **Claude Code plugin**：`plugin/`，仓库根的 `.claude-plugin/marketplace.json` 让本仓库可作为 marketplace 安装

架构决策的完整记录见 `marchen/changes/scaffold-architecture/design.md`（归档后在 `marchen/archive/`）。

## 源头与生成物

**只改源头，生成物用 `pnpm gen` 重新生成。** `pnpm check:generated` 会拦住过期的生成物。

| 源头（手写） | 生成器 | 生成物（勿手改，文件头有标记） |
| --- | --- | --- |
| `tokens/*.ts`、`registry/core.ts` | `scripts/gen-tokens.ts` | `registry/themes/registry.json`、`preview/src/theme.css`、`plugin/skills/design/references/tokens.css` |
| `registry/{ui,blocks,lib}/*/` 文件夹 | `scripts/gen-paths.ts` | `tsconfig.paths.json` |
| 各条目 `registry.json` 的 `description` / `meta` | `scripts/gen-catalog.ts` | `plugin/skills/design/references/components.md` |

`public/r/`（`pnpm registry:build` 输出）和 `dist/` 不提交。

## 目录

```
tokens/            token 源头：neutral（灰阶）、accents（强调色）、semantic（语义映射）、foundation（字体/圆角/动效/层级）、color（色彩计算）
registry/
  ui/<name>/       registry.json + <name>.tsx + <name>.stories.tsx
  blocks/<name>/   同上（区块）
  lib/<name>/      同上（工具）
  themes/          生成：base + accent-*
  core.ts          核心组件集及 ready 状态
registry.json      根清单，只有 name / homepage / include
preview/           预览站：index.html（文档站）、frame.html（iframe 单格）、src/
plugin/            skills/design、skills/design-review（含 lint-design.mjs）、commands/design-init
scripts/           生成器、校验、构建、冒烟测试
tests/             lint-design 单元测试、visual/ 截图基准
```

## 别名

- `@/components/ui/<name>`、`@/components/<name>`、`@/lib/<name>`：**只代表用户项目里看到的路径**，在仓库里指向 `registry/` 源码。registry 源码只能用这些别名互相引用。
- `~/*`：预览站内部代码（`preview/src/*`），registry 源码里禁止使用。
- Vite 用正则别名；TypeScript 用生成的 `tsconfig.paths.json`（TS 的 paths 无法表达 `button → button/button.tsx`）。新增条目文件夹后要 `pnpm gen`。

## 加一个组件

1. `pnpm fork <name>`：在 `.cache/upstream/app` 里用 CLI 安装上游 base-nova 组件，复制到 `registry/ui/<name>/`，并生成 registry.json 骨架（依赖由 import 推导）。**不要直接拿官方 JSON 里的源码**，那是模板形式，图标和组件引用都是占位。
2. 在 `registry/ui/registry.json` 的 `include` 中加一行，`pnpm gen`。
3. 按下面的组件视觉规格改写 class、精简变体和尺寸。**组件名、子组件结构、常用 prop 名保持与 shadcn 一致**，可以删变体，不能改名。交互和动画相关的 class（`data-open:`、`origin-(--transform-origin)` 等）保持原样。
4. 补全 registry.json 的 `description`、`meta.usage`、`meta.avoid`。
5. 写 `<name>.stories.tsx`（CSF：`export default { title: "UI/<Name>" }` + 具名导出的函数组件）。有弹层的组件要有一个默认打开的 story，并在默认导出里设置 `parameters.minHeight`。stories 不要写进 `files`。**title 必须与文件夹名对应**：`registry/ui/dropdown-menu/` → `"UI/Dropdown Menu"`（iframe 按文件路径只加载对应的 story，对不上时文档站会直接报错）。
6. 如果属于核心集，在 `registry/core.ts` 中标为 `ready: true`。
7. `pnpm gen` → `pnpm check` → `pnpm dev` 在 gallery 里检查明暗 × 强调色 → `pnpm screenshot:update` 更新基准。

完整页面 demo 放在 `preview/src/demos/<name>.stories.tsx`，`title` 为 `"Demos/<Name>"`（与文件名对应），`parameters.layout: "page"`。

## 组件视觉规格

| 方面 | 规则 |
| --- | --- |
| 形状 | 圆角全部由 `--radius`（默认 0.5rem）派生，不写死像素。四档：内层项 `rounded-sm`（选项高亮、tabs 触发器、checkbox）< 控件 `rounded-md`（按钮、输入框、选择器触发器、tooltip、导航项）< 容器 `rounded-lg`（卡片、弹层、toast、textarea、tabs 列表）< 弹窗 `rounded-xl`。嵌套时内层圆角 = 外层 − 内边距，不大于外层。`rounded-full` 只用于 switch 和滚动条滑块。 |
| 尺寸 | 默认高 `h-8`（32px），小号 `h-7`（28px），不提供更高的档位；正文 `text-sm`，说明文字 `text-[0.8rem]`。 |
| 深度 | 浅色：只有浮层带阴影（`shadow-md`），平铺元素最多 `shadow-sm`，卡片靠底色差 + `ring-1 ring-foreground/10`。深色：浮层 `dark:shadow-none`，靠更亮的底色 + ring。遮罩用 `bg-overlay`。 |
| 状态 | 开关开启、复选框选中、焦点环用强调色；悬停、按下、菜单高亮、标签页选中用灰阶；主操作按钮为黑白反色（`default` 变体）。 |
| 指针 | 不用 `cursor-pointer`。 |
| 布局 | 大弹窗里放卡片时，内容区用 `bg-background`，卡片才会比底色亮。弹窗打开时不要让焦点落在导航项上（用 `initialFocus`）。 |

## 规则

- **不与上游同步。** 组件复制一次后由本仓库维护；交互和无障碍修复随 `@base-ui/react` 升级获得。
- **token 只增不改名。** 要废弃某个 token 时先保留别名，避免已安装的项目里的 class 失效。
- **非颜色 token 放 `cssVars.theme`**（`tokens/foundation.ts`），不要放进 light/dark：CLI 会把 light/dark 里的每个变量注册成 `--color-*`。
- **不暴露原始灰阶。** 组件只用语义 token；缺语义就在 `tokens/semantic.ts` 加，并说明为什么现有语义不够。
- **对比度由生成器保证。** 调 token 时 `pnpm gen` 会检查每种强调色 × 明暗的 WCAG 对比度（≥ 4.5），不达标直接失败，不要绕过。
- **`@base-ui/react` 锁定精确版本。** 升级流程：改版本号 → `pnpm check` → `pnpm smoke` → `pnpm screenshot`。
- 新增 registry 依赖或 npm 依赖时，以 `pnpm check:registry` 的结果为准，它会比对源码 import。

## 命令

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 预览站 / 文档站（gallery） |
| `pnpm gen` | 运行全部生成器 |
| `pnpm fork <name...>` | 从上游复制组件作为改写起点（`--force` 覆盖） |
| `pnpm check` | 日常检查：生成物一致性 → registry 依赖 → 设计规则 → 类型 → eslint → 单元测试 → registry 构建 |
| `pnpm smoke` | 冒烟测试：临时目录里 init / add / 切换强调色 / 装上游组件 / 编译（约 1～2 分钟，需要网络；`--keep` 保留临时目录） |
| `pnpm screenshot` / `screenshot:update` | 截图回归 / 更新基准（基准以 macOS 为准） |
| `pnpm lint:design` | 设计规则检查（`node plugin/skills/design-review/scripts/lint-design.mjs <目录>` 可检查任意目录） |
| `pnpm build` | 构建 registry（`public/r`）和预览站（`dist/`，含 `dist/r`），即部署产物 |
| `pnpm registry:build` | 只构建 registry 到 `public/r`；`REGISTRY_URL` 指定部署地址（默认 `https://design.suemor.com`，本地调试 `pnpm preview` 时传 `http://localhost:4173`） |

## 环境

- npm 源使用官方源（见 `.npmrc`），不要改成镜像源。
- 包管理器：pnpm。

## 部署

EdgeOne Pages 连接 GitHub 仓库，push 到 `main` 自动部署，配置在 `edgeone.json`（构建命令 `pnpm build`、输出 `dist`、Node 22.21.1、`/r/*` 缓存头）。正式地址 `https://design.suemor.com`，写入所有 registry 产物和用户项目的 `components.json`，**不要更换**。平台分配的 `*.edgeone.cool` 域名需要控制台鉴权，不能作为 registry 地址。
