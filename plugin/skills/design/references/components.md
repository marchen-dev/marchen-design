<!-- 由 scripts/gen-catalog.ts 生成，勿手改。修改源头后运行 pnpm gen -->

# 组件目录

需要组件时先查这里：已有的直接使用或安装，不要手写一个长得差不多的。

## 核心组件（base 初始化时已安装）

### button

按钮。default 为黑白反色的主操作，brand 为强调色。

**何时使用**：default 用于页面或弹窗里的主操作（保存、确定、开始使用）；secondary 用于次要操作（取消、添加）；ghost 用于工具栏和行内图标按钮；brand 只在需要强调色时使用；destructive 用于删除这类不可逆操作。

**不要这样用**：
- 一屏不要出现多个 brand 按钮，主操作默认用 default
- 不要用 brand 表示状态（开关、选中），状态交给 Switch、Checkbox 等组件
- 不要通过 className 给按钮加渐变、阴影或其他彩色

### label

表单标签。

**何时使用**：给输入框、开关、复选框等控件提供可点击的文字标签；在 Field 中使用 FieldLabel。

**不要这样用**：
- 不要用 Label 当普通标题或说明文字

### separator

分隔线，水平或垂直。

**何时使用**：分隔同一容器内不同性质的内容，比如菜单分组、工具栏按钮组之间。

**不要这样用**：
- 设置项之间不要逐行加分隔线，行与行靠行高拉开
- 卡片与卡片之间不需要分隔线

### field

表单字段的组合容器：标签、说明、控件、错误信息。

**何时使用**：所有带标签的表单控件都用 Field 组织：竖排用于输入框、多行文本；横排（orientation="horizontal"）用于设置页的"名称 ↔ 开关 / 选择器"行。错误时给 Field 加 data-invalid，给控件加 aria-invalid，并放 FieldError。

**不要这样用**：
- 不要自己用 div 拼标签 + 说明 + 错误信息
- 说明文字一行能说清就不要写两行

### input

单行输入框，胶囊形。

**何时使用**：文本、搜索、数字、邮箱等单行输入；放在 Field 中配合 FieldLabel 使用。

**不要这样用**：
- 多行内容用 Textarea
- 不要给输入框加阴影或彩色边框，错误状态用 aria-invalid

### textarea

多行输入框，高度随内容增长。

**何时使用**：备注、简介、反馈等多行文本。

**不要这样用**：
- 单行内容用 Input

### select

下拉选择器，触发器为胶囊形。

**何时使用**：从一组固定选项中选一个，选项较多（超过 4 个）或空间有限时使用；设置页的"名称 ↔ 选择器"行。传入 items 让触发器显示选项的文字。

**不要这样用**：
- 只有两个选项、表示开 / 关时用 Switch
- 需要搜索过滤的长列表不要用 Select

### switch

开关。开启时为强调色。

**何时使用**：立即生效的开 / 关设置，例如开机启动、通知开关；设置页中放在行的右侧。

**不要这样用**：
- 需要点"保存"才生效的选项用 Checkbox
- 不要用 Switch 表示多选列表中的选中

### checkbox

复选框。选中时为强调色。

**何时使用**：多选列表、同意条款，以及需要提交后才生效的布尔选项。

**不要这样用**：
- 立即生效的开关用 Switch

### dialog

模态弹窗。

**何时使用**：需要用户专注完成的任务或确认：表单编辑、重命名、删除确认、设置面板。标题用 DialogTitle，底部操作放 DialogFooter：主操作在右，用 default 变体；取消用 secondary，并用 DialogClose 包裹。

**不要这样用**：
- 不要用弹窗展示可以直接放在页面里的信息
- 不要在弹窗里再打开弹窗
- 大弹窗里放卡片时，内容区用 bg-background，卡片才会比底色亮

### popover

轻量浮层，点击触发。

**何时使用**：展示与触发元素相关的补充信息或少量操作，例如同步状态、快速筛选。

**不要这样用**：
- 需要用户完成任务时用 Dialog
- 只是一句提示时用 Tooltip
- 选项列表用 DropdownMenu 或 Select

### dropdown-menu

下拉菜单：操作列表、勾选项、单选项、子菜单。

**何时使用**："更多"按钮、行操作、视图选项。危险操作放在最后，用 variant="destructive" 并用分隔线隔开。

**不要这样用**：
- 从一组值里选一个并显示在触发器上时用 Select
- 菜单项不要用强调色，悬停和选中用灰色

### tooltip

文字提示，悬停或聚焦时出现。

**何时使用**：解释图标按钮的含义、补充被截断的文字。

**不要这样用**：
- 不要在 tooltip 里放可交互的内容（用 Popover）
- 不要用 tooltip 承载必须看到的信息，触屏设备上看不到

### toast

全局通知。

**何时使用**：操作结果的轻量反馈：已保存、已复制、同步失败。在应用根部挂载一次 <Toaster />（或用 <Toaster>{children}</Toaster> 包裹应用），之后在任意位置 import { toast } from "@/components/ui/toast"，调用 toast.add({ title, description, type })；type 为 success / info / warning / error / loading。

**不要这样用**：
- 需要用户做决定的消息用 Dialog
- 不要给每个成功操作都弹 toast，界面上已有明显变化时可以省略
- 不要自定义彩色背景，错误类型会自动使用 destructive 色图标

### tabs

标签页，胶囊形分段切换。

**何时使用**：在同一区域内切换几种并列的视图，例如"全部 / 在看 / 看完"。选项 2～5 个；line 变体用于页面级的二级导航。

**不要这样用**：
- 选项超过 5 个或需要层级时用侧栏导航
- 不要用标签页做表单的分步流程
- 选中态是灰阶，不要改成强调色

### card

卡片容器：白底（深色下更亮一档）+ 一像素边框，没有阴影。

**何时使用**：把一组相关内容或设置项框在一起，例如设置分组、信息摘要。设置分组用 size="sm" 并去掉内边距，行与行之间不加分隔线。

**不要这样用**：
- 不要给卡片加阴影
- 不要把所有内容都套进卡片，平铺的列表和正文不需要
- 卡片不要嵌套卡片

### scroll-area

自定义滚动区域，滚动条为灰色细条。

**何时使用**：固定高度的列表、侧栏、弹层中需要滚动的内容。

**不要这样用**：
- 整页滚动直接用浏览器原生滚动

## 其他组件（按需安装）

暂无。

## 区块（按需安装）

### sidebar-nav

侧栏导航列表：线性图标 + 文字，选中项为灰色底，支持分组标题，导航项可渲染为链接。

**何时使用**：设置界面的分类导航、文档站或应用的二级导航。用 SidebarNavGroup 分组（label 可选），SidebarNavItem 传 icon 和 active；需要路由跳转时用 render 渲染为链接，例如 render={<a href="/settings/general" />} 或路由库的 Link。外层容器自己决定背景（通常是 bg-sidebar）。

**不要这样用**：
- 选中项不要改成强调色、加粗或加竖条
- 不要给图标单独上色，图标颜色由组件统一
- 需要可折叠、移动端抽屉的应用级侧栏不要用它（那是 shadcn 上游 sidebar 的场景）

安装：`npx shadcn@latest add @marchen-design/sidebar-nav`

### settings

设置界面区块：SettingsShell（导航 + 内容区布局）、SettingsSection（分组）、SettingsRow（名称 ↔ 控件）、SettingsDialog（设置弹窗）。

**何时使用**：所有设置界面都用这组区块：设置弹窗用 SettingsDialog，设置页面把 SettingsShell 放进页面布局。结构为 SettingsShellNav（直接放 SidebarNavItem）+ SettingsShellContent（SettingsHeader / SettingsBody / SettingsFooter）。SettingsBody 中用 SettingsSection 分组，每一项是 SettingsRow：label、可选 description，控件作为 children，名称会自动关联控件。立即生效的开关用 Switch；需要"保存"才生效时把按钮放在 SettingsFooter。

**不要这样用**：
- 不要用 shadcn 的 field 手拼设置行，field 适合竖排的普通表单
- 设置行之间不要加分隔线，不要给分组卡片加阴影
- 不要把 SettingsShellContent 的背景改成 popover 或 card，否则深色下卡片会显得凹陷
- 一个分组里不要超过 6～7 行，太多时拆成多个分组

安装：`npx shadcn@latest add @marchen-design/settings`
