## 目的

提供完整的核心组件集：每个组件都按视觉规格改写，可通过 registry 安装，API 与 shadcn 保持一致，并带有 stories 和用法说明。

### 需求: 核心集完整

registry MUST 提供以下核心组件：button、input、textarea、field、select、switch、checkbox、dialog、dropdown-menu、popover、tooltip、tabs、card、scroll-area、toast，以及它们依赖的 label、separator。所有核心组件 MUST 标记为已完成，并由 base 安装。

#### 场景: 初始化后组件齐全

- **WHEN** 用 base 初始化一个新项目
- **THEN** 项目中存在上述 17 个组件文件
- **AND** 不存在核心集以外的组件

#### 场景: 单独安装任一核心组件

- **GIVEN** 一个配置了 marchen-design 命名空间、但没有 dialog 的项目
- **WHEN** 安装 `@marchen-design/dialog`
- **THEN** dialog 及其依赖的 button 被安装，项目编译通过

### 需求: API 与 shadcn 一致

每个核心组件 MUST 导出与 shadcn 同名组件相同的子组件名（例如 dialog 导出 Dialog、DialogTrigger、DialogContent、DialogHeader、DialogFooter、DialogTitle、DialogDescription、DialogClose），常用 prop 名 MUST 一致。变体和尺寸 MAY 精简，MUST NOT 改名。

#### 场景: 按 shadcn 写法使用

- **GIVEN** 一段按 shadcn 文档写的使用 Select、Dialog、Field 的代码
- **WHEN** 在安装了 marchen-design 的项目中编译
- **THEN** 不需要修改组件名或 prop 名即可编译通过

#### 场景: 删除的尺寸被类型检查拦下

- **GIVEN** 某个组件删除了上游的一个尺寸档位
- **WHEN** 代码中使用了这个尺寸
- **THEN** 类型检查报错

### 需求: 依赖声明准确

每个核心组件的 npm 依赖和 registry 依赖 MUST 与源码引用一致（包括 `@base-ui/react`、`lucide-react` 等），并通过 registry 依赖校验。

#### 场景: 依赖校验通过

- **WHEN** 运行 registry 依赖校验
- **THEN** 所有核心组件都通过，没有缺失或多余的依赖

### 需求: stories 覆盖主要状态

每个核心组件 MUST 提供 stories，覆盖它的主要变体和状态：表单控件包含默认、禁用、错误（如适用）状态；有弹层的组件 MUST 有一个弹层处于打开状态的 story，便于在明暗两种模式下对比弹层。

#### 场景: 弹层组件有打开状态

- **WHEN** 在预览站查看 select、dropdown-menu、popover、tooltip、dialog
- **THEN** 每个都至少有一个 story 默认处于打开状态

#### 场景: 表单控件有错误状态

- **WHEN** 在预览站查看 input、textarea、select、checkbox、field
- **THEN** 能看到校验失败（aria-invalid）时的样式

### 需求: 用法说明

每个核心组件的元数据 MUST 包含一句话描述和"何时使用"，SHOULD 包含"不要这样用"。plugin 的组件目录 MUST 包含所有核心组件。

#### 场景: 组件目录完整

- **WHEN** 查看 plugin 的组件目录
- **THEN** "核心组件"部分列出全部 17 个组件，没有"尚未改写"的提示

### 需求: toast 接入方式

toast 的用法说明 MUST 写明需要在应用根部挂载一次 toast 容器，以及如何触发一条通知。

#### 场景: 按说明接入 toast

- **GIVEN** 一个用 base 初始化的项目
- **WHEN** 按 toast 用法说明在根部挂载容器，并调用触发方法
- **THEN** 页面上出现一条通知
