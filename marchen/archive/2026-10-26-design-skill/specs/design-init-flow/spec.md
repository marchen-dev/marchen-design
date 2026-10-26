## 目的

根据项目现状选择合适的方式引入 marchen-design：新项目完整初始化，已有项目按底层组件库和主题情况分别处理，任何覆盖都先征得用户同意。

### 需求: 只由用户触发

design-init MUST 只在用户主动调用时执行，AI MUST NOT 在用户没有要求时自动运行初始化。

#### 场景: 用户只是让做一个页面

- **WHEN** 用户在未初始化的项目中说"做一个设置页"
- **THEN** 不自动执行初始化，而是提示可以运行 design-init

### 需求: 项目情况判断

design-init MUST 先检查项目情况再执行安装，并在执行前向用户说明判断结果和即将执行的操作。判断依据：
- 目录为空或没有 `package.json` → 新项目；
- 有 `components.json`：按 `style` 判断底层组件库（`base-*` 为 Base UI；`radix-*`、`new-york`、`default` 为 Radix；`aria-*` 为 React Aria）；
- 有 `package.json` 但没有 `components.json`：检查是否为 React + Tailwind CSS 4 项目。

#### 场景: 说明判断结果

- **GIVEN** 一个 `style` 为 `radix-nova` 的项目
- **WHEN** 运行 design-init
- **THEN** 先告诉用户"这是 Radix 项目，将只引入 token，不安装组件"，再继续

### 需求: 新项目

新项目 MUST 用 `shadcn init <registry>/r/base.json` 初始化，并按用户选择的模板（默认 Vite）和项目名创建。

#### 场景: 空目录

- **WHEN** 在空目录运行 design-init，用户选择 Vite 模板、项目名 `my-app`
- **THEN** 创建 `my-app`，其中包含 marchen-design 的配置、token 和核心组件

### 需求: Base UI 项目

Base UI 项目 MUST 先检查是否有自定义主题（全局 CSS 变量与 shadcn 默认值明显不同）。没有自定义主题时，在用户确认后安装 base；有自定义主题时 MUST 让用户选择"用 marchen-design 的主题覆盖"或"保留现有主题，只配置命名空间"。

#### 场景: 已有自定义主题

- **GIVEN** 一个 Base UI 项目，`--primary` 等变量已被改为品牌色
- **WHEN** 运行 design-init
- **THEN** 询问用户是覆盖主题还是只配置命名空间，不直接覆盖

### 需求: Radix 与 React Aria 项目

Radix 和 React Aria 项目 MUST 只配置 `@marchen-design` 命名空间并安装只含 token 的主题条目，MUST NOT 安装 base 或 marchen-design 的组件、区块，MUST NOT 修改 `components.json` 中的 `style`。

#### 场景: Radix 项目初始化

- **GIVEN** 一个 `style` 为 `new-york` 的项目
- **WHEN** 运行 design-init 并确认
- **THEN** `components.json` 中新增 `@marchen-design` 命名空间，`style` 仍为 `new-york`
- **AND** 全局 CSS 变量更新为 marchen-design 的 token，没有新增组件文件

### 需求: 不支持的项目

不是 React + Tailwind CSS 4 的项目 MUST NOT 执行安装，MUST 说明需要的条件；MAY 提供插件中的纯 CSS token 文件供用户手动引入。

#### 场景: Vue 项目

- **GIVEN** 一个 Vue 项目
- **WHEN** 运行 design-init
- **THEN** 说明 marchen-design 组件需要 React + Tailwind CSS 4，并告知纯 CSS token 文件的位置

### 需求: 覆盖前确认

任何会覆盖已有文件、组件或 CSS 变量的操作，MUST 在执行前列出将受影响的内容，并得到用户确认。

#### 场景: 覆盖组件

- **GIVEN** 项目中已有 `components/ui/button.tsx`
- **WHEN** design-init 准备安装 base
- **THEN** 先说明 button 等组件将被替换、CSS 变量将被覆盖，用户确认后才执行

### 需求: 强调色

design-init MUST 让用户选择强调色（默认蓝色，可选 green、orange、pink、red、purple），非默认时安装对应的 `accent-*` 条目。

#### 场景: 选择绿色

- **WHEN** 用户选择绿色
- **THEN** 初始化完成后安装 `@marchen-design/accent-green`

### 需求: 完成后的说明

初始化完成后 MUST 告诉用户：当前项目模式（完整 / 仅 token）、安装了什么、之后可以直接描述需求让 AI 使用 design skill。

#### 场景: 完成提示

- **WHEN** 新项目初始化完成
- **THEN** 输出项目模式、已安装的组件列表和下一步可以做什么
