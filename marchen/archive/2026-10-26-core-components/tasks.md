## 1. 工具与基础

- [x] 1.1 抽出 check-registry 中的 import 解析与依赖推导为共用函数（`scripts/lib/`），check-registry 改为调用它，行为不变
- [x] 1.2 `scripts/fork-upstream.ts`：在 `.cache/upstream/app`（首次自动创建，加入 .gitignore）中用锁定版本的 CLI `shadcn add`，复制到 `registry/ui/<name>/`，生成 registry.json 骨架（依赖由 import 推导、`meta.forkedFrom`、TODO 描述）；目标已存在时拒绝覆盖，支持 `--force`
- [x] 1.3 截图回归改为整页截图（`expect(page).toHaveScreenshot({ fullPage: true })`）
- [x] 1.4 gallery 收集范围加入 `preview/src/demos/**/*.stories.tsx`；`Demos/` 开头的 title 归入导航 demos 区；删除 `preview/src/demos/index.ts` 注册表及 Shell 中对应逻辑
- [x] 1.5 支持 `parameters.layout: "page"`：矩阵中每行一个格子；截图时这类 story 使用 1024px 视口
- [x] 1.6 `pnpm check` 通过

## 2. 表单类组件

- [x] 2.1 用 fork-upstream 引入 label、separator、field、input、textarea、select、switch、checkbox，加入 `registry/ui/registry.json` 的 include，`pnpm gen`
- [x] 2.2 button 改为胶囊形：去掉各尺寸的特殊圆角，统一 `rounded-full`；图标按钮为正圆；更新 stories
- [x] 2.3 label、separator：核对规格（通常无需改动），补 registry.json 描述与用法，写 stories
- [x] 2.4 input：`rounded-full`、`px-3`，删除多余尺寸；stories 覆盖默认 / 占位 / 禁用 / 错误 / 带文件选择（如上游支持）
- [x] 2.5 textarea：`rounded-xl`；stories 覆盖默认 / 禁用 / 错误
- [x] 2.6 select：触发器 `rounded-full`，弹出层 `rounded-xl`，选项高亮 `rounded-full`，弹出层深色 `shadow-none`；尺寸只保留 default / sm；stories 含打开状态（`parameters.minHeight`）和错误状态
- [x] 2.7 switch：核对尺寸和颜色，滑块阴影不超过 shadow-sm；stories 覆盖开 / 关 / 禁用 / 小号
- [x] 2.8 checkbox：核对选中色与焦点环；stories 覆盖未选 / 选中 / 禁用 / 错误 / 搭配 label
- [x] 2.9 field：核对与 input / select / switch / checkbox 组合时的间距和错误信息样式；stories 覆盖竖排、横排（名称左、控件右）、带说明、带错误
- [x] 2.10 补全以上组件的 `description`、`meta.usage`、`meta.avoid`；`pnpm gen` 后 `pnpm check` 通过

## 3. 设置弹窗 demo（第一轮）

- [x] 3.1 用 fork-upstream 引入 dialog（暂不改写），加入 include
- [x] 3.2 `preview/src/demos/settings-dialog.stories.tsx`：按 design D9 的结构实现四个分类（通用、外观、通知、账户），左侧导航可切换，覆盖 spec 要求的全部控件
- [x] 3.3 在 gallery 中检查明暗 × 强调色，统计默认分类下的强调色使用处（≤ 5），确认主操作为黑白反色
- [x] 3.4 评估胶囊形在整页中的效果（特别是 select 选项高亮，design R1）；如需调整，暂停并通过 `/marchen:update` 修订 spec 与 design

## 4. 浮层类组件

- [x] 4.1 dialog：容器 `rounded-xl`、深色 `shadow-none`，遮罩改用 `bg-overlay`；核对关闭按钮与 footer；stories 含打开状态
- [x] 4.2 用 fork-upstream 引入 popover、dropdown-menu、tooltip、toast，加入 include
- [x] 4.3 popover：`rounded-xl`、深色 `shadow-none`；stories 含打开状态
- [x] 4.4 dropdown-menu：弹层 `rounded-xl`，选项 `rounded-full`，子菜单 `shadow-lg` → `shadow-md`，深色 `shadow-none`；stories 含打开状态、子菜单、勾选项、单选项、快捷键
- [x] 4.5 tooltip：`rounded-lg`；stories 含打开状态（单行与多行）
- [x] 4.6 toast：`rounded-xl`、`shadow-md`、深色 `shadow-none`，类型图标改为语义色；读 `Toaster` 实现确认接入方式并写进 `meta.usage`；stories 展示一条显示中的通知（design R5）
- [x] 4.7 补全以上组件的用法元数据；`pnpm check` 通过

## 5. 结构类组件

- [x] 5.1 用 fork-upstream 引入 tabs、card、scroll-area，加入 include
- [x] 5.2 tabs：列表与触发器 `rounded-full`，选中触发器阴影不超过 shadow-sm；保留上游已有变体；stories 覆盖默认、禁用项、上游的其他变体
- [x] 5.3 card：去掉阴影，保留 `ring-1 ring-foreground/10`；stories 覆盖带标题/描述/操作/底部的完整卡片和设置分组式卡片
- [x] 5.4 scroll-area：核对滚动条颜色使用语义 token；stories 覆盖竖向与横向滚动
- [x] 5.5 补全以上组件的用法元数据；`pnpm check` 通过

## 6. 收尾

- [x] 6.1 `registry/core.ts` 全部标记 ready；`pnpm gen`，确认 base 的依赖列表与 plugin 组件目录完整（无"尚未改写"提示）
- [x] 6.2 设置弹窗 demo 第二轮检查：dialog 已改写后的整页效果，明暗 × 强调色
- [x] 6.3 `pnpm check`、`pnpm smoke` 通过（冒烟测试按完整核心集校验）
- [x] 6.4 `pnpm screenshot:update` 重新生成全部基准，人工抽查打开状态的弹层确实出现在截图中；再运行 `pnpm screenshot` 确认稳定
- [x] 6.5 更新 `AGENTS.md`：加组件流程改为使用 fork-upstream；记录组件视觉规格的要点（形状、尺寸、深度、状态）

## 7. 圆角改为由 token 派生的小圆角（评审后修订，见 design D2）

- [x] 7.1 `tokens/foundation.ts` 的 `radius` 改为 `0.5rem`，`pnpm gen`
- [x] 7.2 控件改为 `rounded-md`：button（各尺寸与图标按钮）、input、select 触发器、tooltip；button、input、select 触发器的内边距回退为上游值
- [x] 7.3 容器改为 `rounded-lg`：card（含 header / footer 上下圆角）、popover、dropdown-menu 与 select 弹出层（含子菜单）、toast、textarea、tabs 列表、field 卡片式选项；dialog 保持 `rounded-xl`
- [x] 7.4 内层项改为 `rounded-sm`：select 与 dropdown-menu 选项（内边距、标签、inset 回退为上游值）、tabs 触发器（内边距回退）、checkbox
- [x] 7.5 demo 与 stories 中手写的圆角改为 token 派生（设置弹窗导航项 → `rounded-md`，scroll-area 示例等）
- [x] 7.6 确认 registry 中 `rounded-full` 只出现在 switch 和 scroll-area；更新 `AGENTS.md` 的组件视觉规格
- [x] 7.7 `pnpm check`、`pnpm smoke` 通过；`pnpm screenshot:update` 重新生成基准，抽查控件 / 容器 / 弹窗 / 选项的圆角层级
