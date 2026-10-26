## 1. 前置验证

- [x] 1.1 在临时 registry 条目中用 `cssVars.theme` 注册 `color-primary-text`，`init` 到临时项目后确认 `text-primary-text` 可用；不可用则改用 `css` 字段写 `@theme inline`，结论记入 design R1
- [x] 1.2 确认条目的 `meta` 字段会原样保留到 `shadcn build` 产物中，结论记入 design R2
- [x] 1.3 查阅 Claude Code 当前文档，确认 `marketplace.json` 和 `plugin.json` 的字段格式

## 2. 目录与工程迁移

- [x] 2.1 `src/` 迁移为 `preview/src/`，`index.html` 移到 `preview/`；`vite.config.ts` 设置 `root: preview`、`publicDir` 指向根 `public/`，`build.outDir` 指向根 `dist/`
- [x] 2.2 按 design D8 更新 vite 正则别名和 tsconfig `paths`；tsconfig `include` 覆盖 `preview`、`registry`、`tokens`、`scripts`
- [x] 2.3 安装 `tsx`、`@playwright/test`（只装 Chromium）；把 `@base-ui/react` 锁定为精确版本
- [x] 2.4 确认 `pnpm dev`、`pnpm build`、`pnpm typecheck`、`pnpm lint` 在迁移后正常

## 3. registry 结构重组

- [x] 3.1 建立 `registry/lib/utils/`（`registry.json` + `utils.ts`）和 `registry/lib/registry.json`
- [x] 3.2 建立 `registry/ui/button/`：迁入 button 源码，按 D6 精简尺寸为 4 种、`link` 改用 `text-primary-text`，写 `registry.json`（含 `meta.usage`、`meta.avoid`、`meta.forkedFrom`）
- [x] 3.3 建立 `registry/ui/registry.json`、`registry/blocks/registry.json`（空 items）
- [x] 3.4 根 `registry.json` 改为只包含 `name`、`homepage`、`include`；删除 spike 留下的平铺文件和手写的 base / accent 条目
- [x] 3.5 `build-registry.mjs` 适配 include 结构（含产物中的总清单），确认 `pnpm registry:build` 输出 `utils`、`button` 等条目

## 4. token 源头与生成

- [x] 4.1 `tokens/color.ts`：oklch → sRGB → 相对亮度 → WCAG 对比度，用几个已知颜色对写单元自测
- [x] 4.2 `tokens/neutral.ts`：明暗两套纯中性 ramp
- [x] 4.3 `tokens/accents.ts`：blue（默认）、green、orange、pink、red、purple、yellow 预设
- [x] 4.4 `tokens/semantic.ts`：ramp + accent + mode → shadcn 语义名 + `primary-text` + `overlay`；实现前景色自动选择和 primary-text 亮度调整
- [x] 4.5 `tokens/foundation.ts`：系统字体栈（sans / mono）、radius 档位、动效（180ms 进入 / 120ms 退出及曲线）、z-index
- [x] 4.6 `registry/core.ts`：15 个核心组件清单及 `ready` 标记（本变更只有 button 为 ready）
- [x] 4.7 `scripts/gen-tokens.ts` 输出 `registry/themes/registry.json`（base + accent-*，按 1.1 的结论注册新工具类）
- [x] 4.8 gen-tokens 输出 `preview/src/theme.css`（作用域式），预览站改为引用它，删除拷贝来的 `index.css` token 部分
- [x] 4.9 gen-tokens 输出 `plugin/skills/design/references/tokens.css`（纯 CSS）
- [x] 4.10 gen-tokens 加入断言：灰阶色度为 0、深色层级亮度递增、每种强调色 × 模式的三组对比度 ≥ 4.5；失败信息包含强调色、模式和颜色对
- [x] 4.11 所有生成文件写入"由 xxx 生成，勿手改"的文件头；调整预设值直到全部断言通过

## 5. registry 校验与目录生成

- [x] 5.1 `scripts/check-registry.ts`：用 TypeScript 编译器 API 解析 import，按 D3 比对 `dependencies` / `registryDependencies`，报告缺失和多余
- [x] 5.2 check-registry 增加结构检查：分类清单 include 了所有子文件夹、`files` 都存在、stories 不在 `files` 中、缺少 `meta.usage` 时警告
- [x] 5.3 为 check-registry 准备反例（临时漏写依赖、多写依赖、漏 include），确认都能报出来
- [x] 5.4 `scripts/gen-catalog.ts`：从条目元数据生成 `plugin/skills/design/references/components.md`

## 6. 预览站 gallery

- [x] 6.1 `registry/ui/button/button.stories.tsx`（CSF：Variants、Sizes、Disabled 等）
- [x] 6.2 gallery 用 `import.meta.glob` 收集 stories，按 Storybook 规则生成 story id，并导出 story 清单供截图脚本使用
- [x] 6.3 `preview/frame.html` + `frame.tsx`：读取 `story` / `theme` / `accent` 参数，设置 `<html>` 的 `.dark` 和 `data-accent`，只渲染该 story；用 `postMessage` 上报高度
- [x] 6.4 gallery 矩阵：每个 story 渲染 light·蓝、dark·蓝、light·绿、dark·绿 四个 iframe，自适应高度，`loading="lazy"`
- [x] 6.5 文档站外壳占位：左侧导航（组件 / demos），右侧内容区；demos 区放一个占位页
- [x] 6.6 用一个临时的弹层 story（从上游 `shadcn add popover` 得到的原版即可，验证后删除或保留为第二梯队样例）确认深色格子中弹层为深色

## 7. 设计规则检查

- [x] 7.1 `plugin/skills/design-review/scripts/lint-design.mjs`：零依赖 Node 脚本，参数为目录；规则包括渐变、indigo/violet/purple、非浮层大阴影、cursor-pointer、内容层 backdrop-blur；支持 `lint-design-ignore` 豁免；输出文件、行号和违规写法
- [x] 7.2 准备违规样例目录，确认每条规则都能命中，浮层阴影不误报
- [x] 7.3 `package.json` 的 `lint:design` 直接调用该脚本扫描 `registry/`

## 8. 冒烟测试与截图回归

- [x] 8.1 `scripts/smoke.ts`：内置静态服务（随机端口）+ 以该地址构建 + 临时目录（官方源 `.npmrc`）；步骤化执行并在 `finally` 中清理
- [x] 8.2 smoke 步骤：init → 校验 base 列出的组件存在且无多余组件、无字体依赖 → build → 命名空间 add → 无命名空间项目 URL add → `accent-green` add 并校验强调色变量变化、其余变量不变 → 安装一个上游组件并 build
- [x] 8.3 故意让 base 引用不存在的条目，确认 smoke 报出失败步骤为 init，然后恢复
- [x] 8.4 `scripts/screenshot.ts`（或 Playwright 测试文件）：`vite preview` + 遍历 story 清单 × 矩阵地址截图，使用 `toHaveScreenshot`，固定视口、DPR，关闭动画
- [x] 8.5 生成首批基准到 `tests/visual/`；修改一个 token 后确认能检测到差异，然后恢复

## 9. plugin 骨架

- [x] 9.1 按 1.3 的结论写 `.claude-plugin/marketplace.json` 和 `plugin/.claude-plugin/plugin.json`
- [x] 9.2 design、design-review 的 SKILL.md 和 `commands/design-init.md` 写占位内容，明确声明尚未完成、不提供规则
- [x] 9.3 在 Claude Code 中把本地仓库添加为 marketplace，确认 plugin 可以安装

## 10. 聚合与文档

- [x] 10.1 `scripts/check-generated`：运行 `gen`（gen-tokens + gen-catalog）后对生成物路径执行 `git diff --exit-code`
- [x] 10.2 `package.json` 脚本：`gen`、`check`（check:generated → check:registry → lint:design → typecheck → lint → registry:build）、`smoke`、`screenshot`、`screenshot:update`
- [x] 10.3 编写 `AGENTS.md`：源头与生成物清单、加组件流程、API 与 shadcn 一致原则、token 只增不改名、`@base-ui/react` 升级流程、各命令用途
- [x] 10.4 精简 `BRIEF.md`，只保留立项背景，决策部分指向本变更的 artifact
- [x] 10.5 完整跑一遍 `pnpm check`、`pnpm smoke`、`pnpm screenshot`，全部通过
