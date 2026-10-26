## 背景

spike（2026-10-26，shadcn@4.22.1）在仓库里留下了一个可运行的原型：

- 根目录是官方 `shadcn init -t vite -b base --no-pointer` 生成的 Vite 应用，组件在 `src/` 下。
- `registry/ui/button.tsx`、`registry/lib/utils.ts` 平铺存放，根 `registry.json` 手写了 `utils`、`button`、`base`、`accent-green` 四个条目。
- `scripts/build-registry.mjs`：执行 `shadcn build`，然后把产物中的 `{{REGISTRY_URL}}` 和 `@marchen-design/*` 依赖改写为绝对 URL。
- 预览站通过 vite / tsconfig 别名直接引用 `registry/`；`src/index.css` 是从 CLI 安装结果拷贝过来的。

spike 已验证的事实（作为本设计的约束）：

- `init <url>` 读取条目后，若 `type: registry:base`，把 `config` 合并进 `components.json`；`extends: "none"` 时不安装上游 style 索引；随后把该 URL 当作第一个组件安装。
- 条目间依赖必须在产物中写成绝对 URL，否则未配置命名空间的项目会报 `Unknown registry`。
- CLI 会去掉组件文件开头的注释。
- `shadcn build` 原生支持 `include`：被包含的文件必须叫 `registry.json`，只能用相对路径、不能跳出根目录；`files[].path` 相对于声明它的那个 `registry.json`。
- Base UI 包名为 `@base-ui/react`（1.9.0）；上游 `cn` 来自 npm 包 `cn`。
- Base UI 的 Portal 支持 `container`，但 shadcn 包装层没有暴露，弹层一律挂到 `body`。
- base-nova 的 `toast` 基于 Base UI（依赖 `cn`、`@base-ui/react`，registry 依赖 `button`）；`sonner` 额外依赖 `sonner` 和 `next-themes`。

## 目标与非目标

**目标：**
- 确定目录结构和"源头 → 生成物"的边界，生成物可以重复生成，并有一致性检查。
- token 只有一份源头，自带对比度保障，强调色只需一个参数组。
- 每个组件一个文件夹，依赖声明有自动校验。
- 预览站能准确展示「明暗 × 强调色」，包括弹层。
- 冒烟测试、设计规则检查、截图回归全部自动化。
- 用 button 走通整条链路，作为后续改写组件的样板。

**非目标：**
- 改写 button 以外的 14 个核心组件（后续变更）。
- 区块（settings-*、sidebar-nav 等）的实现。
- design skill、design-review skill、design-init 命令的规则内容。
- 部署平台选型和上线。
- 与 shadcn 上游的持续同步机制（明确不做）。
- CI 平台接入（本变更只提供本地命令，CI 直接调用即可）。

## 决策

### D1. 目录结构：根目录单包，`src/` 改为 `preview/`

```
marchen-design/
├── tokens/              ◆ token 源头（TS）
├── registry/
│   ├── ui/<name>/       ◆ registry.json + <name>.tsx + <name>.stories.tsx
│   ├── blocks/<name>/   ◆ 同上（本变更只建目录）
│   ├── lib/utils/       ◆
│   └── themes/          ◇ registry.json（base + accent-*，生成）
├── registry.json        ◆ 根清单：name / homepage / include
├── preview/             ◆ 预览站（Vite root）
│   ├── index.html  frame.html
│   └── src/{main,frame}.tsx · theme.css◇ · gallery/ · demos/ · site/
├── plugin/              ◆ + ◇（components.md、tokens.css）
├── .claude-plugin/marketplace.json
├── scripts/             gen-tokens · gen-catalog · check-registry · build-registry
│                        lint-design · smoke · screenshot · check-generated
├── tests/visual/        截图基准
└── public/r/            ◇ 不提交
```

◆ 为手写源头，◇ 为生成物。除 `public/r/` 外的生成物都提交进仓库，方便在 diff 中看到 token 变化的实际效果。

不拆 monorepo：plugin 是纯 Markdown，registry 只是静态 JSON，预览站是普通 Vite 应用，共用一套依赖最简单。Vite 的 `root` 指向 `preview/`，`publicDir` 指向根目录的 `public/`，让 `public/r` 随预览站一起部署。

### D2. registry 组织：官方格式 + include，只校验不生成

```
registry.json                     { name, homepage, include: [
                                     "./registry/lib/registry.json",
                                     "./registry/ui/registry.json",
                                     "./registry/blocks/registry.json",
                                     "./registry/themes/registry.json" ] }
registry/ui/registry.json         { include: ["./button/registry.json", ...] }
registry/ui/button/registry.json  { items: [{ name: "button", files: [{ path: "button.tsx" }], ... }] }
```

- **为什么不全部生成 `registry.json`**：组件元数据用官方格式，人和 AI 都认识，可以直接参照 shadcn 文档。依赖漏写属于"检查"问题：校验脚本出错时会报错，生成脚本出错时会悄悄产出错误结果。
- **例外**：`registry/themes/registry.json` 由 gen-tokens 生成，因为它的内容完全由 token 推导而来。
- **安装路径要平铺（冒烟测试发现）**：CLI 按产物里的 `files[].path` 计算安装位置，`registry/ui/button/button.tsx` 会被装到 `components/ui/button/button.tsx`。所以 build-registry 在后处理中去掉条目文件夹这一层，改成 `registry/ui/button.tsx`（和上游产物格式一致）。文件内容已经内嵌，改路径不影响内容。
- **include 的约束**：每个组件文件夹里的清单必须叫 `registry.json`；分类清单（`ui/registry.json`）需要逐个列出子文件夹。新增组件时在分类清单里加一行，由 check-registry 检查"文件夹存在但未被 include"的情况。
- **元数据扩展**：用法说明放在条目的 `meta` 字段：`meta.usage`（何时使用）、`meta.avoid`（不要怎么用）。实现时需确认 `meta` 会原样保留到产物中；如果不会，就由 gen-catalog 直接读取源码清单，不依赖产物。

### D3. check-registry 的规则

逐个条目解析源码的 import（用 TypeScript 编译器 API 或 es-module-lexer，避免用正则）：

| import 形式 | 应出现在 |
| --- | --- |
| `@/components/ui/x`、`@/lib/utils` 等别名 | `registryDependencies`（`@marchen-design/x`） |
| 裸包名（取包名部分，如 `@base-ui/react/button` → `@base-ui/react`） | `dependencies` |
| `react`、`react-dom` | 忽略（运行时自带） |
| 相对路径（同一条目内的文件） | 忽略 |

另外检查：分类清单是否 include 了所有子文件夹；`files` 里的文件是否都存在；`*.stories.tsx` 不出现在 `files` 中；缺少 `meta.usage` 时只警告，不失败。

### D4. token 源头与生成

```
tokens/
├── neutral.ts      明暗两套 ramp（每档只有 L，C=0）
├── accents.ts      { blue: { hue: 256, chroma: 0.20 }, green, orange, pink, red, purple }
├── semantic.ts     (ramp, accent, mode) → shadcn 语义名 + primary-text + overlay
├── foundation.ts   字体栈、radius、动效、z-index → cssVars.theme
└── color.ts        oklch → sRGB → 相对亮度 → WCAG 对比度
```

- **用 TS 写而不是 JSON**：需要计算（强调色派生、前景色选择、对比度），也需要注释。脚本用 `tsx` 运行，不引入构建步骤。
- **强调色派生**：明暗两种模式**共用同一个亮度 L=0.55**（实现时校准）。OKLab L≈0.55 时相对亮度约 0.17，白字对比度刚好 ≥ 4.5；最初设想的"深色模式提亮 primary"会让白字不达标、被迫换成黑字，所以深色下的文字可读性完全交给 `primary-text`。`primary-text` 在浅色下降低亮度、在深色下提高亮度，直到在**所有底色层**（不只是 background）上的对比度都 ≥ 4.5。`primary-foreground` 在纯白和近黑之间选对比度更高的一个，不使用亮度阈值这类经验值。实测默认蓝为 `oklch(0.55 0.186 256)`（约 `#046eda`）。
- **不提供黄色预设**：共用亮度下黄色只能呈现为橄榄色或棕色；要支持黄色，就得允许个别预设单独指定亮度，这与 spec "只由色相和色度描述"冲突。等有实际需求时再修订 spec。
- **深色层级**：语义映射直接引用 ramp 档位，sidebar < background < card < popover < muted 的递增关系由档位顺序保证，gen-tokens 再断言一次。
- **对比度不达标即失败**：不提供"跳过检查"的开关，调不出合格的值说明预设本身有问题。

三种输出：

| 目标 | 形状 | 内容 |
| --- | --- | --- |
| `registry/themes/registry.json` | 条目的 cssVars（覆盖式） | `base`：全部 token（默认蓝）+ config + css + 核心集依赖；`accent-*`：只有强调色相关变量 |
| `preview/src/theme.css` | 作用域式 CSS | `:root` / `.dark` 是默认值；`[data-accent=x]` / `.dark[data-accent=x]` 只覆盖强调色变量 |
| `plugin/.../tokens.css` | 纯 CSS 变量 | 与 base 相同的值，`:root` + `.dark`，不依赖 Tailwind |

新增的 `primary-text`、`overlay` 需要在 `cssVars.theme` 中注册 `--color-primary-text`、`--color-overlay`，才能生成 `text-primary-text` 这样的工具类。spike 没有验证过 `cssVars.theme` 能否写入 `@theme inline`，这是实现的第一个验证点（见风险 R1）。

### D5. base 条目与核心集

- 核心集清单写在 `tokens/` 之外的一个小配置里（`registry/core.ts`），gen-tokens 读取它来生成 base 的 `registryDependencies`。
- 清单中每项标记 `ready: boolean`，只有已改写完成的组件才写进 base。本变更中只有 button 是 `ready: true`。
- base 的 `config` 沿用 spike：`style: "base-nova"`（保证上游组件仍能安装）、`iconLibrary: "lucide"`、`tailwind.baseColor: "neutral"`、`registries` 中写入命名空间。
- base 的 `dependencies` 不包含任何字体包。

### D6. Button 精简

- 尺寸保留 `default / sm / icon / icon-sm`，删除 `xs / lg / icon-xs / icon-lg`。
- 变体保留 `default`（黑白反色）、`brand`、`secondary`、`outline`、`ghost`、`destructive`、`link`。`link` 改用 `text-primary-text`。
- 其余 class 本变更不做调整（圆角、高度等留给组件改写变更统一处理），只确保没有违反 lint-design 的写法。
- 来源记录写在条目的 `meta.forkedFrom: "shadcn@4.22.1/base-nova"`，只作记录，不参与任何流程。

### D7. 预览站：自己的 gallery + iframe 矩阵

```
preview/index.html → main.tsx（文档站外壳 + gallery 导航）
   └─ 每个 story 渲染为矩阵：
        ┌──────────┬──────────┬──────────┬──────────┐
        │ light·蓝 │ dark·蓝  │ light·绿 │ dark·绿  │
        ├──────────┼──────────┼──────────┼──────────┤
        │ <iframe src="frame.html?story=button--variants&theme=dark&accent=green">
        └──────────┴──────────┴──────────┴──────────┘
preview/frame.html → frame.tsx
   └─ 读取 query → 给 <html> 设置 .dark 和 data-accent → 只渲染这个 story
```

- **为什么用 iframe**：shadcn 包装层的弹层会 portal 到 `body`，局部 `.dark` 容器管不到。iframe 让每个格子都有自己的 `<html>`，和用户项目的真实情况完全一致，组件代码不需要为预览做任何改动。方案对比见探索记录：context 注入 portal 容器会污染安装到用户项目的组件；只展示关闭状态等于放弃对比弹层。
- **story 收集**：`import.meta.glob("/registry/**/*.stories.tsx")`，按 CSF 解析：默认导出 `{ title }`，具名导出为 story（函数组件）。story id 用 Storybook 的命名规则（`button--variants`），以后迁移到 Storybook 时地址不变。
- **iframe 高度**：frame 内用 `ResizeObserver` 通过 `postMessage` 上报内容高度，外层自适应。含弹层的 story 可以在默认导出中声明 `parameters.minHeight`。
- **不用 Storybook**：核心需求是「明暗 × 强调色」矩阵和用自己的区块搭文档站，Storybook 都要绕路实现，依赖也重。CSF 格式保留了以后迁移的可能。
- 文档站外壳和 demos 本变更只做占位：左侧导航（组件 / demos 两组）+ 右侧内容区。等区块完成后再换成 sidebar-nav 和 settings-*。

### D8. 别名

| 别名 | 指向 |
| --- | --- |
| `@/components/ui/<name>` | `registry/ui/<name>/<name>.tsx` |
| `@/components/<name>`（区块） | `registry/blocks/<name>/<name>.tsx` |
| `@/lib/utils` | `registry/lib/utils/utils.ts` |
| `~/*` | `preview/src/*`（预览站内部代码） |

- **`@/` 只代表"用户项目里会看到的路径"**，完全留给 registry 源码；预览站内部改用 `~/`。最初的方案是"其余 `@/*` 回落到 `preview/src`"，但这样会和区块别名冲突（例如预览站的 `@/components/theme-provider` 会被当成区块）。
- **Vite** 用正则别名（支持 `$1` 替换，一条规则覆盖所有组件）。
- **TypeScript** 的 `paths` 替换值只允许一个 `*`（TS5062），无法表达 `button → button/button.tsx`。所以由 `scripts/gen-paths.ts` 扫描 registry 文件夹，生成 `tsconfig.paths.json`，每个条目一行，`tsconfig.app.json` 通过 `extends` 引用。它属于生成物，纳入 `gen` 和一致性检查。

区块的安装目标路径（`components/` 还是 `components/blocks/`）在第一个区块变更时再定，本变更只预留。

### D9. 验证体系

| 层 | 命令 | 内容 | 是否在 `pnpm check` 中 |
| --- | --- | --- | --- |
| L1 | `check:generated` | 生成器以检查模式运行，在内存中生成并与磁盘文件比较（不依赖 git：仓库尚无提交时 `git diff` 看不到未跟踪文件） | ✓ |
| L1 | `check:registry` | D3 中的规则 | ✓ |
| L2 | `lint:design` | 禁用写法扫描 | ✓ |
| L1 | `typecheck` / `lint` / `registry:build` | | ✓ |
| L3 | `smoke` | 临时目录中依次跑安装场景 | ✗（耗时，单独执行） |
| L4 | `screenshot` / `screenshot:update` | Playwright 截图并比较 | ✗ |

- **lint-design**：源码放在 `plugin/skills/design-review/scripts/lint-design.mjs`，仓库的 `lint:design` 直接调用这个路径，保证只有一份。用纯 Node 实现、零依赖，这样在任何项目里都能用 `node <path> <dir>` 运行。规则以"正则 + 允许的上下文"描述，例如阴影规则只允许出现在 `data-slot` 属于浮层的元素上（popover、dropdown、dialog、tooltip、select 弹出层）。浮层的判断用"同一个 className 字符串中包含浮层标识"做近似，接受少量误判，可以用行内注释 `lint-design-ignore` 豁免。
- **smoke**：用 Node 内置 `http` 起静态服务（随机端口），以这个端口作为 `REGISTRY_URL` 构建到临时目录（`REGISTRY_OUTPUT`，不污染 `public/r`）；子进程必须异步执行，否则会阻塞同进程内的静态服务；在 `os.tmpdir()` 下创建隔离目录，写入官方源 `.npmrc`；按顺序执行 init → 检查文件 → build → 命名空间 add → 无命名空间项目 URL add → accent add → 检查变量。每步都有名字，失败时打印步骤名和命令输出；`finally` 中关闭服务、删除目录。无命名空间的项目用 `shadcn init -t vite -b base -p nova` 生成。
- **screenshot**：Playwright 启动 `vite preview`，从 gallery 的 story 清单生成全部 frame 地址，逐个截图，用 Playwright 自带的 `toHaveScreenshot` 比较，基准放在 `tests/visual/__screenshots__/`。只用 Chromium，固定视口和 `deviceScaleFactor`，关闭动画。逐像素容差 `threshold` 设为 0.02：默认的 0.2 会放过灰阶微调（实测深色 subtle 0.27 → 0.32 检测不到）。Playwright 收集用例时拿不到 story 清单，所以写成单个测试：从页面读取 `window.__MARCHEN_GALLERY__`，用 `expect.soft` 逐格比较。

### D10. plugin 骨架

```
.claude-plugin/marketplace.json   { name: "marchen-design", plugins: [{ name: "marchen-design", source: "./plugin" }] }
plugin/.claude-plugin/plugin.json
plugin/skills/design/SKILL.md            占位：声明"尚未完成，不提供规则"
plugin/skills/design/references/components.md  ◇ gen-catalog
plugin/skills/design/references/tokens.css     ◇ gen-tokens
plugin/skills/design-review/SKILL.md     占位
plugin/skills/design-review/scripts/lint-design.mjs  ◆ 唯一的一份
plugin/commands/design-init.md           占位
```

清单格式（2026-10 查阅官方文档）：
- `marketplace.json` 必填 `name`、`owner.name`、`plugins[]`；条目必填 `name`、`source`。相对路径 `source` 从仓库根目录（包含 `.claude-plugin/` 的目录）解析，必须以 `./` 开头。条目 `name` 必须与 `plugin.json` 的 `name` 一致。
- `plugin.json` 只有 `name`（kebab-case）是必填的；`version`、`description`、`author` 缺失时 `claude plugin validate` 会警告，所以都要写上。`skills/`、`commands/` 放在默认位置会被自动发现，不需要声明。
- 校验：`claude plugin validate ./` 和 `claude plugin validate ./plugin --strict`。本地安装：`claude plugin marketplace add <仓库绝对路径>`，然后 `claude plugin install marchen-design@marchen-design`。
- 安装后的调用名为 `/marchen-design:design`、`/marchen-design:design-init`。

### D11. 工具与依赖

- 运行 TS 脚本：`tsx`（devDependency）。
- 截图：`@playwright/test`，只安装 Chromium。
- import 解析：优先用已有的 `typescript` 编译器 API，不新增依赖。
- 锁定 `@base-ui/react` 为精确版本（去掉 `^`）。升级流程：改版本号 → `pnpm check` → `smoke` → `screenshot`。
- `package.json` 脚本命名：`gen`（全部生成器）、`check`（聚合）、`smoke`、`screenshot`、`screenshot:update`、`registry:build`、`dev`、`build`。

## 风险与权衡

- **R1（已验证，shadcn@4.22.1）：新语义颜色可直接使用。** `cssVars.light` / `dark` 中出现的每个变量，CLI 都会自动在 `@theme inline` 中注册为 `--color-<name>: var(--<name>)`（`radius` 例外），所以 `primary-text`、`overlay` 只需写在 light/dark 中，就能得到 `text-primary-text`、`bg-overlay`。`cssVars.theme` 中的变量（如 `font-sans`、`ease-out-expo`）原样写入 `@theme inline`。约束：**非颜色 token 必须放在 `theme` 里**，放进 light/dark 会被错误地注册为颜色。
- **R2（已验证）：`meta` 会原样保留**到单条目 JSON 和产物中的总清单（包括嵌套对象和数组）。gen-catalog 直接读取源码清单即可，不依赖构建产物。
- **R3：include 要求逐个列出子文件夹。** 组件多了以后分类清单会变长，靠 check-registry 防止漏 include。可以接受。
- **R4：lint-design 用正则近似判断。** 会有误判和漏判。好处是零依赖、到处能跑。用豁免注释兜底，规则在实际使用中逐步收紧。
- **R5：iframe 矩阵的性能。** 一个 story 4 个 iframe，一个组件页面如果有 5 个 story 就是 20 个 iframe。用懒加载（`loading="lazy"`）缓解；必要时 gallery 默认只展开当前 story。
- **R6：截图在不同机器上的像素差异。** 字体用的是系统字体栈，不同操作系统渲染会不同。基准图以 macOS 为准；接入 CI 时需要固定运行环境（或者 CI 只跑 smoke，不跑截图）。系统字体栈是有意的设计选择，这是它带来的代价。
- **R7：生成物提交进仓库会让 diff 变大。** 换来的是 token 改动的实际影响在 review 时一目了然，并且不需要构建就能浏览生成结果。
- **R8：不同步上游意味着上游的修复要人工发现。** 真正关键的修复（交互、无障碍）在 `@base-ui/react` 里，随 npm 升级获得；包装层的修复靠偶尔看 changelog。这是主动的取舍。
- **R9：smoke 依赖网络**（从 npm 安装依赖、从 shadcn 官方拉取 nova preset）。在离线环境下无法运行，属于正常限制。
