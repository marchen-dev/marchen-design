## 目的

维护设计 token 的唯一源头，并把它生成为 registry 主题、预览站样式和 plugin 兜底样式三种产物，保证三处一致且满足对比度要求。

### 需求: 唯一源头

所有颜色、字体、圆角、动效、层级 token MUST 只在一个源头中定义。registry 主题条目、预览站样式、plugin 兜底样式 MUST 全部由该源头生成，不得手写。

#### 场景: 修改源头后三处同步

- **GIVEN** 源头中浅色模式的 background 值被修改
- **WHEN** 运行 token 生成命令
- **THEN** registry 的 base 条目、预览站样式、plugin 兜底样式中的 background 值都更新为新值
- **AND** 三处的值完全相同

#### 场景: 生成物带有不可手改标记

- **WHEN** 打开任意一个由 token 生成的文件
- **THEN** 文件开头标明它由哪个命令生成、不应手动修改

### 需求: 分层结构

token MUST 分为三层：原始值（中性灰阶、强调色参数）、语义 token、非颜色 token。原始灰阶 MUST NOT 作为 CSS 变量或工具类导出，组件和使用者只能使用语义 token。

#### 场景: 原始灰阶不可直接使用

- **GIVEN** 一个安装了 base 的项目
- **WHEN** 在其中查找灰阶色阶类的 CSS 变量（例如第 3 档灰）
- **THEN** 找不到，只能找到 background、muted、border 等语义变量

### 需求: 语义命名沿用 shadcn

语义 token MUST 沿用 shadcn 的变量名（background、foreground、card、popover、primary、secondary、muted、accent、destructive、border、input、ring、sidebar-* 等），保证上游组件不改代码也能使用。系统 SHALL 额外提供 `primary-text`（强调色用作文字）和 `overlay`（遮罩）两个语义 token。新增其他语义 token 时 MUST 说明为什么现有语义不够用。

#### 场景: 上游组件直接可用

- **GIVEN** 一个安装了 base 的项目
- **WHEN** 从 shadcn 官方安装一个未被改写的组件
- **THEN** 该组件使用的所有颜色变量都有定义，不出现缺失的变量

#### 场景: 强调色文字可用工具类

- **GIVEN** 一个安装了 base 的项目
- **WHEN** 在元素上使用 `text-primary-text`
- **THEN** 元素文字颜色为强调色的文字专用值，浅色模式下比 primary 更深，深色模式下比 primary 更亮

### 需求: 纯中性灰阶

灰阶 MUST 为纯中性（色度为 0），明暗两种模式都不得带蓝色或其他色调。

#### 场景: 灰阶无色偏

- **WHEN** 检查生成产物中除强调色、destructive 之外的所有颜色值
- **THEN** 它们的色度都为 0

### 需求: 深色层级越往上越亮

深色模式下 MUST 按 sidebar < background < card < popover < muted 的顺序，亮度逐级递增。

#### 场景: 深色层级顺序

- **WHEN** 读取深色模式的语义 token
- **THEN** sidebar、background、card、popover、muted 的亮度严格递增

### 需求: 强调色派生

每种强调色预设 MUST 只由色相和色度两个参数描述。系统 MUST 从这两个参数派生出明暗两种模式下的 primary、primary-foreground、primary-text、ring、sidebar-primary、sidebar-primary-foreground、sidebar-ring。默认强调色 MUST 为蓝色。

#### 场景: 新增强调色只需一个参数组

- **GIVEN** 在源头的强调色预设中新增一项，只填色相和色度
- **WHEN** 运行 token 生成命令
- **THEN** 生成对应的强调色主题条目，包含明暗两种模式下的全部派生值

#### 场景: 前景色自动选择

- **GIVEN** 一个亮度很高的强调色（例如黄色）
- **WHEN** 生成该强调色
- **THEN** primary-foreground 为接近黑色的值
- **AND** 对于亮度较低的强调色（例如蓝色），primary-foreground 为接近白色的值

### 需求: 对比度检查

token 生成 MUST 对每种强调色、每种模式检查 WCAG 对比度：primary-foreground 在 primary 上、primary-text 在 background 上、muted-foreground 在 background 上，对比度都 MUST 不低于 4.5:1。任一项不达标时，生成命令 MUST 失败，并指出是哪个强调色、哪个模式、哪一对颜色。

#### 场景: 对比度不达标时失败

- **GIVEN** 某个强调色在深色模式下 primary-text 与 background 的对比度为 3.2:1
- **WHEN** 运行 token 生成命令
- **THEN** 命令以非零状态退出
- **AND** 错误信息包含该强调色名称、"dark" 和 "primary-text / background"

### 需求: 两种输出形状

生成给 registry 的主题 MUST 为覆盖式（作用于 `:root` 和 `.dark`）。生成给预览站的样式 MUST 为作用域式，让所有强调色可以在同一页面中通过属性切换，同时可用。

#### 场景: 预览站可同时使用多种强调色

- **GIVEN** 预览站中有两个容器，一个指定绿色强调色，另一个不指定
- **WHEN** 两个容器同时渲染 `bg-primary`
- **THEN** 前者显示绿色，后者显示默认蓝色

### 需求: 系统字体栈

无衬线字体 MUST 使用系统字体栈（覆盖 macOS、Windows 以及简体中文字体），等宽字体 MUST 使用系统等宽字体栈。base MUST NOT 安装任何字体包。

#### 场景: 安装后不引入字体依赖

- **WHEN** 用 base 初始化一个新项目
- **THEN** 项目依赖中不出现任何字体包
- **AND** 页面正文使用系统字体渲染

### 需求: 非颜色 token

系统 MUST 提供圆角档位、弹层进入动效（180ms，减速曲线）、退出动效（120ms）和层级（z-index）token。

#### 场景: 动效 token 可用

- **GIVEN** 一个安装了 base 的项目
- **WHEN** 查找进入、退出动效的时长和曲线变量
- **THEN** 都存在，取值与设计规定一致
