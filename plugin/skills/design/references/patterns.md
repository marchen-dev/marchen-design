# 页面组合参考

每类页面四段：结构、组件、要点、常见错误。组件用法细节见 `components.md`。
标注"上游"的组件 marchen-design 尚未提供，用 `npx shadcn@latest add <name>` 从 shadcn 安装，会自动使用 marchen-design 的 token。

## 设置页 / 设置弹窗

**结构**：直接使用 settings 区块。

```
SettingsDialog（弹窗）或 SettingsShell（页面中）
├─ SettingsShellNav       左侧分类：SidebarNavItem（icon + 文字）
└─ SettingsShellContent
   ├─ SettingsHeader      当前分类标题
   ├─ SettingsBody        SettingsSection（分组）→ SettingsRow（名称 + 说明 ↔ 控件）
   └─ SettingsFooter      需要"保存"时才放：secondary 取消 + default 保存
```

**组件**：`@marchen-design/settings`（会带上 sidebar-nav）、switch、select、input、checkbox、button。

**要点**
- 立即生效的项（开关）不需要"保存"；只有需要提交的表单才放 SettingsFooter。
- 每个分组 2～6 行，超过就拆分组；分组标题写名词（"通知方式"），不写完整句子。
- 危险操作（退出登录、删除账户）放在最后一个分组，用 `destructive` 小号按钮。

**常见错误**：用 field 手拼设置行；在行与行之间加分隔线；分组卡片加阴影；把整个设置页做成一张超长表单。

## 列表页（搜索 + 筛选）

**结构**

```
顶部：标题（text-base font-medium）·········· 主操作 Button（default）
工具栏：搜索 Input（w-64）· 筛选 Select ×1～3 ······ 次要操作（ghost / secondary）
列表：行（名称 + 次要信息 muted ······ 状态 · 行操作 ⋯）
空状态 / 无搜索结果
```

**组件**：input、select、dropdown-menu（行操作 ⋯、更多筛选）、button、card（行少时包一层）；数据多列时用上游 `table`；状态标记用上游 `badge`。

**要点**
- 主操作只有一个，放在右上。
- 每行的操作收进 `⋯` 的 DropdownMenu；最多直接露出一个最常用的操作（ghost 小号按钮）。
- 筛选条件 ≤ 3 个时平铺在工具栏；更多时收进 Popover 或"筛选"下拉。
- 状态用文字或 badge（灰色，只有需要强调的状态用强调色），不要每行都挂彩色徽章。
- 行的悬停用 `hover:bg-muted/50`，不用阴影。

**常见错误**：每行放三四个按钮；用卡片网格展示纯文本数据；给每行加头像或图标凑视觉；用彩色区分分类。

## 表单（新建 / 编辑）

**结构**

```
标题 + 一行说明（可选）
FieldGroup
├─ Field（竖排）：FieldLabel · 控件 · FieldDescription / FieldError
└─ …
底部操作：secondary 取消 · default 提交（右对齐）
```

**组件**：field、input、textarea、select、checkbox、switch、button；放在弹窗里时用 dialog（DialogFooter 放按钮）。

**要点**
- 竖排表单用 shadcn 的 `field`（`Field` + `FieldLabel` + `FieldDescription` + `FieldError`），**不要**用 SettingsRow。
- 校验失败：`Field` 加 `data-invalid`，控件加 `aria-invalid`，下面放 `FieldError`。
- 宽度：单列，表单最大宽度约 `max-w-md`；短字段（邮编、数量）可以缩窄，不要所有输入框都拉满整页。
- 提交按钮文字用动词（"创建项目"），不要只写"提交"。

**常见错误**：两列甚至三列的表单；占位符代替标签；必填星号用红色大号；提交按钮用强调色或渐变。

## 详情页

**结构**

```
顶部：返回 ← · 标题 · 状态 ·············· 次要操作 ⋯ · 主操作（如"编辑"）
内容：分组的信息块（Card）
  └─ 名称 / 值 对：名称 text-muted-foreground，值 text-foreground
可选：Tabs 切换"概览 / 活动 / 设置"
```

**组件**：card、tabs、button、dropdown-menu、separator（只在同一卡片内分隔不同性质的内容时用）。

**要点**
- "名称 / 值"成对展示，名称灰、值黑；用两列栅格（`grid grid-cols-[120px_1fr] gap-y-2`）对齐。
- 次要操作（复制链接、导出、删除）收进 `⋯`，删除放最后并用 `variant="destructive"`。
- 标签页 2～5 个；只有一类内容时不要用标签页。

**常见错误**：每个字段一张卡片；用大号彩色数字做"仪表盘"装饰；值和名称同样的颜色和字重。

## 空状态

**结构**

```
（可选）lucide 图标 size-8 text-muted-foreground
标题：text-sm font-medium   "还没有项目"
说明：text-[0.8rem] text-muted-foreground   一句话说明为什么空、可以做什么
操作：一个 Button（default 或 secondary）
```

**要点**
- 区分"从未有过数据"（给出创建入口）和"筛选 / 搜索无结果"（给出清除筛选的入口）。
- 居中放在列表区域内，不要占满整页；上下留白适中（`py-12` 左右）。
- 图标可选，用线性图标、灰色、小尺寸。

**常见错误**：大幅插画；彩色或渐变图标；多个按钮并列；俏皮的长文案。
