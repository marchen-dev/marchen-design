## 目的

规定 registry 的安装体验：新项目一条命令完成初始化，已有项目按需安装组件和切换强调色。

### 需求: base 一次完成初始化

base 条目 MUST 为完整设计系统类型，且不继承上游 style。用 base 的地址初始化新项目时 MUST 一次完成：写入项目配置（含 marchen-design 命名空间、neutral 基色、lucide 图标）、写入明暗 token 和全局样式、安装核心组件及其 npm 依赖。初始化后的项目 MUST 能直接编译通过。

#### 场景: 空目录初始化

- **GIVEN** 一个空目录
- **WHEN** 以 Vite 模板和 base 的地址执行 shadcn 初始化
- **THEN** 项目配置中存在 marchen-design 命名空间，指向部署地址
- **AND** 全局样式中的 primary 为默认蓝色、灰阶为纯中性
- **AND** 项目编译成功

### 需求: 核心组件集

base MUST 只安装核心组件集：button、input、textarea、field、select、switch、checkbox、dialog、dropdown-menu、popover、tooltip、tabs、card、scroll-area、toast，以及它们的传递依赖（如 label、separator、utils）。区块和核心集以外的组件 MUST NOT 随 base 安装。核心集中尚未改写完成的组件 MAY 暂时不列入 base，但 MUST 在核心集清单中标明。

#### 场景: 初始化只装核心集

- **WHEN** 用 base 初始化新项目
- **THEN** 项目组件目录中只出现 base 当前列出的核心组件及其传递依赖
- **AND** 不出现任何区块，也不出现 badge、slider 等非核心组件

### 需求: 保留上游安装能力

base 初始化后的项目 MUST 仍能直接从 shadcn 官方安装尚未被 marchen-design 改写的组件。

#### 场景: 安装上游组件

- **GIVEN** 一个用 base 初始化的项目
- **WHEN** 按名称安装一个 marchen-design 未提供的官方组件
- **THEN** 安装成功，组件使用 marchen-design 的 token，项目编译通过

### 需求: 命名空间安装

配置了 marchen-design 命名空间的项目 MUST 能用 `@marchen-design/<name>` 安装任意条目，其 registry 依赖和 npm 依赖 MUST 被一并安装。

#### 场景: 按命名空间安装组件

- **GIVEN** 一个配置了命名空间的项目，其中不存在 button
- **WHEN** 安装 `@marchen-design/button`
- **THEN** button 及其依赖被写入项目，项目编译通过

### 需求: 未配置命名空间也能按地址安装

没有配置 marchen-design 命名空间的普通 shadcn 项目 MUST 能直接用条目的完整地址安装，安装过程 MUST NOT 因为无法识别命名空间而失败。

#### 场景: 按地址安装

- **GIVEN** 一个普通 shadcn 项目，没有 marchen-design 命名空间
- **WHEN** 用 button 条目的完整地址安装
- **THEN** 安装成功，依赖的 utils 也被安装

### 需求: 切换强调色

每种强调色预设 MUST 作为独立的主题条目提供。安装后 MUST 只覆盖强调色相关的变量，其余 token 保持不变。

#### 场景: 换成绿色

- **GIVEN** 一个用 base 初始化的项目
- **WHEN** 安装 `@marchen-design/accent-green`
- **THEN** 明暗两种模式下的 primary、ring、primary-text 等强调色变量都变成绿色系
- **AND** background、border 等其他变量不变

### 需求: 交互元素不使用手形指针

base 安装的组件 MUST NOT 给交互元素加手形指针，保持系统默认指针。

#### 场景: 按钮指针

- **WHEN** 在初始化后的项目中检查 button 的样式
- **THEN** 不包含手形指针样式
