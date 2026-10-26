## 目的

在使用 marchen-design 的项目中，引导 AI 设计和实现 UI 时使用已有的组件、区块和 token，遵守颜色分工与层级原则，避免自行绘制样式；在不使用 marchen-design 的项目中不介入。

### 需求: 触发范围

design skill MUST 在以下情况被使用：项目 `components.json` 的 `registries` 中配置了 `@marchen-design`；或用户明确要求使用 marchen-design / 这套黑白强调色风格。在没有配置 `@marchen-design`、且用户未明确要求的项目中，skill MUST NOT 主动改变项目的视觉风格或替换项目已有组件。

#### 场景: 已配置的项目中做界面

- **GIVEN** 项目的 `components.json` 配置了 `@marchen-design`
- **WHEN** 用户要求"做一个设置页"
- **THEN** 使用 design skill 的规则完成

#### 场景: 有自己设计系统的项目

- **GIVEN** 项目没有配置 `@marchen-design`，使用自己的组件库
- **WHEN** 用户要求"加一个按钮"
- **THEN** 不引入 marchen-design 的组件、token 或规则，按项目现有风格完成

### 需求: 项目模式检测

skill MUST 在每次使用时根据 `components.json` 判断项目模式，不依赖初始化时写入的额外记录：
- `style` 以 `base-` 开头 → 完整模式；
- `style` 以 `radix-`、`aria-` 开头，或为 `new-york`、`default` → 仅 token 模式；
- 没有 `components.json` → 提示用户先运行 design-init。

完整模式下 MUST 使用 marchen-design 的组件与区块；仅 token 模式下 MUST NOT 安装 marchen-design 的组件或区块，只遵守 token 与设计原则，组件使用项目已有的。

#### 场景: Radix 项目

- **GIVEN** `components.json` 的 `style` 为 `new-york`，并配置了 `@marchen-design`
- **WHEN** 用户要求"做一个设置弹窗"
- **THEN** 不安装 `@marchen-design/settings` 或 marchen-design 的 dialog
- **AND** 使用项目已有的组件，颜色只用语义 token

### 需求: 使用已有组件与区块

完整模式下，需要的组件或区块已在 marchen-design 中提供时 MUST 使用它；项目中尚未安装时 MUST 先通过 shadcn CLI 以 `@marchen-design/<name>` 安装，MUST NOT 手写一个外观相似的替代品。marchen-design 未提供的组件 MAY 从 shadcn 上游安装。设置界面 MUST 使用 settings 区块。

#### 场景: 需要的区块未安装

- **GIVEN** 完整模式的项目，尚未安装 settings 区块
- **WHEN** 用户要求"做一个设置页"
- **THEN** 先安装 `@marchen-design/settings`，再用它组合页面

### 需求: 不覆盖组件的视觉样式

skill MUST 要求不通过 className 覆盖组件的颜色、圆角、阴影和字号；布局相关的 class（宽度、间距、定位、栅格）MAY 使用。

#### 场景: 调整按钮

- **WHEN** 需要让按钮更醒目
- **THEN** 选择合适的变体（如 default），而不是给按钮加 `bg-*`、`shadow-*` 或 `rounded-*`

### 需求: 只用语义 token

skill MUST 要求颜色只使用语义 token（如 `bg-background`、`text-muted-foreground`、`border-border`、`text-primary-text`），MUST NOT 使用 Tailwind 调色板颜色、写死的色值、渐变或强调色以外的装饰色。

#### 场景: 次要文字

- **WHEN** 需要一段次要说明文字
- **THEN** 使用 `text-muted-foreground`，而不是 `text-gray-500`

### 需求: 颜色分工

skill MUST 规定：主操作使用 Button 的 default 变体（黑白反色）；强调色只用于状态（开关开启、选中、进度、焦点、链接）；一屏最多一个 brand 按钮；危险操作使用 destructive 变体。

#### 场景: 表单底部按钮

- **WHEN** 表单底部有"保存"和"取消"
- **THEN** "保存"为 default 变体，"取消"为 secondary 变体，均不使用强调色

### 需求: 页面组合参考

skill MUST 提供以下页面类型的组合参考：设置页（指向 settings 区块）、列表页（搜索与筛选）、表单、详情页、空状态。每个参考 MUST 说明结构、使用的组件，以及该类页面常见的错误写法。

#### 场景: 做列表页

- **WHEN** 用户要求"做一个带搜索和筛选的列表页"
- **THEN** 按列表页参考组合：搜索使用 input，筛选使用 select 或 dropdown-menu，行操作放在 dropdown-menu 中

### 需求: 完成后自查

skill MUST 要求在完成 UI 改动后运行设计规则检查（lint-design）扫描改动的文件，存在违规时修正后再交付。

#### 场景: 写完一个页面

- **WHEN** AI 完成一个页面的实现
- **THEN** 运行 lint-design 检查该页面文件，并修正报告的问题

### 需求: 规则简短、细节按需读取

SKILL.md 的正文 MUST 只包含触发后每次都需要遵守的硬规则和工作流程；组件目录、原则细节、页面组合参考 MUST 放在 references 中，由 SKILL.md 指明何时读取哪一份。硬规则 MUST 写成可检查的形式（具体的组件名、变体、class），MUST NOT 使用"简洁""高级""克制"等无法检查的形容词作为规则。

#### 场景: 规则可检查

- **WHEN** 阅读 SKILL.md 的每一条硬规则
- **THEN** 每条都能对照代码判断是否违反
