## 动机

`scaffold-architecture` 搭好了 token、registry、预览站和验证体系，但 registry 里只有 button 一个组件。base 初始化后，其余组件只能从 shadcn 上游安装：颜色会跟随我们的 token，形状、阴影、尺寸等细节仍然是上游的样子，整体风格不统一，也还不能真正用到项目里。

核心集（15 个组件）是 base 初始化时就要装好的组件，覆盖设置页、列表页、弹窗表单这三类最常见的工具界面。把它们全部按 marchen-design 的规则改写之后，base 才算完整，后续的区块和 design skill 也才有可靠的基础。

另外，单个组件好看不难，难的是拼成一整页之后仍然克制。这次同时用核心组件拼出一个完整的设置弹窗，作为检验整体风格的场景。

## 变更内容

**统一的组件视觉规格**（这次确定并落实到所有组件）
- 形状：所有组件的圆角都由 `--radius` 这一个 token 按固定比例派生，统一为小圆角：控件（按钮、输入框、选择器触发器）约 6px，容器（卡片、弹层、toast、多行输入框）8px，弹窗约 11px，嵌套在里面的元素（选项高亮、标签页触发器）约 5px。只有开关保留胶囊形。改 `--radius` 一个值，全部组件按比例变化。
- 尺寸：控件默认高 32px、小号 28px，信息密度偏紧凑。
- 深度：浅色模式下只有浮层带阴影；深色模式下浮层用边框表现层级，不依赖阴影。
- 状态：开启、选中、进度用强调色；悬停、按下用灰阶；焦点环用强调色。
- 交互元素保持系统默认指针。

**改写 14 个核心组件**，加上作为依赖的 label、separator：
input、textarea、field、label、select、switch、checkbox、dialog、dropdown-menu、popover、tooltip、tabs、card、scroll-area、toast、separator。
- 以上游 base-nova 版本为起点（经 CLI 转换后的代码），按视觉规格改写 class，精简变体和尺寸。组件名、子组件结构、常用 prop 名保持与 shadcn 一致。
- 每个组件提供 stories（覆盖主要状态和变体）和用法元数据（何时使用、不要怎么用）。
- 全部标记为核心集已完成，写入 base。

**调整 button**：按新的形状规格改为由 token 派生的小圆角，与其他控件统一。

**设置弹窗 demo**：用核心组件直接拼出一个完整的设置弹窗（左侧导航 + 右侧分组设置项，包含开关、选择器、输入框、按钮等），在预览站的 demos 区展示，并纳入截图回归。

**toast 接入说明**：toast 需要在应用根部挂载一次，在组件用法说明中写明接入方式。

## 能力

### 新增能力
- `component-visual-spec`：所有组件共同遵守的视觉规格（形状、尺寸、深度、状态、指针、焦点）。
- `core-component-set`：核心组件的完整性、可安装性、API 一致性、stories 与用法元数据、toast 接入。
- `settings-dialog-demo`：用核心组件拼出的设置弹窗 demo，以及它在预览站和截图回归中的位置。

### 修改能力
无规格层面的修改。`registry-install` 中"base 只安装核心组件集"的要求不变，这次是把核心集全部标记为完成；冒烟测试会自动按新的核心集校验。

## 影响范围

- **registry**：新增 `registry/ui/` 下 16 个组件文件夹（各含源码、registry.json、stories），修改 `registry/ui/registry.json`、`registry/core.ts`、`registry/ui/button/`。
- **预览站**：新增设置弹窗 demo（`preview/src/demos/`）；gallery 和截图基准随 stories 增加。
- **token**：`tokens/foundation.ts` 的 `radius` 从 `0.625rem` 改为 `0.5rem`。
- **生成物**：`registry/themes/registry.json`（base 依赖列表）、`tsconfig.paths.json`、plugin 组件目录随之更新。
- **截图基准**：button 形状变化会让现有基准失效，需要重新生成；新增组件和 demo 的基准。
- **用户侧**：base 初始化后会安装全部核心组件；`--radius` 默认值从 `0.625rem` 改为 `0.5rem`，所有组件的圆角随之变小（目前还没有外部使用者）。
- **不涉及**：区块（settings-section、sidebar-nav 等）、design skill 规则内容、部署。
