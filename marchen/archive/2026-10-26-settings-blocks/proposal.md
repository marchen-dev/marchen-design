## 动机

核心组件已经齐全，但做一个设置界面仍然要从组件一点点拼。`core-components` 的设置弹窗 demo 证明了这些组件能拼出克制的整页，也暴露出几处必须"记得写"的细节：

- 设置行要用 `items-center!` 覆盖 field 横排时的顶部对齐；
- 大弹窗里放卡片时，内容区必须用 `bg-background`，否则深色下卡片显得凹陷；
- 弹窗打开时焦点不能落在第一个导航项上，否则静态画面里焦点环像"选中"，还多占一处强调色；
- 分组标题在卡片外、卡片去掉内边距、行与行之间不加分隔线。

这些细节在 demo 里写一次可以，但每个项目、每次让 AI 做设置页都要重新写对，一定会漏。把它们封装成可安装的区块，使用者只需要组合，细节由区块保证。这也是后续 design skill 的基础：skill 可以直接说"设置界面用 settings 区块"，而不是描述一堆 class。

## 变更内容

**新增区块**（通过 registry 安装到用户项目的 `components/` 下）：
- `sidebar-nav`：线性图标 + 文字的导航列表，选中项为灰色底，支持分组标题，导航项可以渲染为链接或按钮。设置界面和文档站外壳都会用到，所以单独作为一个区块。
- `settings`：设置界面的一组组合组件。
  - `SettingsShell`：只负责"左侧导航 + 右侧内容区"的布局，内容区为 background 层并可滚动，带标题区和底部操作区；放在弹窗里或页面里都可以。
  - `SettingsSection`：分组，标题在卡片外，卡片内放设置行。
  - `SettingsRow`：一行设置，左边名称和可选说明，右边控件，名称与控件自动关联。
  - `SettingsDialog`：把弹窗尺寸、`SettingsShell` 和"打开时焦点落在内容区"组合好，做设置弹窗时直接使用。

**自用**
- 设置弹窗 demo 改用这些区块重写，并新增一个"设置页面"形态的 demo，验证 shell 在页面中的用法。
- 文档站外壳的左侧导航改用 `sidebar-nav`。

**顺带的小改进**
- stories 按源码中的声明顺序展示（目前按字母排序，例如 Disabled 排在 Variants 前面），支持 CSF 的 `__namedExportsOrder`。
- 检查 tabs 触发器在回退为上游内边距后是否过挤，必要时调整。

## 能力

### 新增能力
- `sidebar-nav-block`：导航列表区块的结构、选中态、分组、链接渲染与可访问性。
- `settings-block`：设置界面区块（shell、section、row、dialog）的布局、层级、焦点处理与两种使用形态。
- `story-ordering`：预览站与截图回归中 story 的展示顺序。

### 修改能力
无规格层面的修改。区块沿用已有的 registry 组织方式、依赖校验、预览矩阵和截图回归。

## 影响范围

- **registry**：新增 `registry/blocks/sidebar-nav/`、`registry/blocks/settings/`（源码、registry.json、stories），修改 `registry/blocks/registry.json`。
- **预览站**：`preview/src/demos/settings-dialog.stories.tsx` 重写；新增设置页面 demo；`preview/src/site/Shell.tsx` 改用 `sidebar-nav`；`preview/src/gallery/csf.ts` 支持声明顺序。
- **组件**：可能微调 `registry/ui/tabs/tabs.tsx` 的内边距。
- **生成物**：`tsconfig.paths.json`、plugin 组件目录（新增"区块"一节）。
- **截图基准**：新增区块和 demo 的基准；story 顺序变化不影响文件名，但 demo 重写后基准需要重新生成。
- **用户侧**：区块不进入 base，需要按需 `add`；不影响已有安装。
- **不涉及**：design skill 规则内容、design-init、部署。
