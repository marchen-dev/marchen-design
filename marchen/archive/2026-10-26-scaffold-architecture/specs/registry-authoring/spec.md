## 目的

规定 registry 条目在仓库中的组织方式和元数据约定，校验依赖声明，并把条目构建成可部署的静态 JSON。

### 需求: 每个条目一个文件夹

每个组件、区块、工具条目 MUST 有自己的文件夹，其中包含该条目的元数据文件、源码，以及可选的 story 文件。根清单 MUST 通过引用各分类清单来聚合所有条目，不得在根清单里直接罗列条目。

#### 场景: 新增条目只改它自己的文件夹和分类清单

- **GIVEN** 要新增一个组件
- **WHEN** 创建该组件的文件夹并在所属分类清单中引用它
- **THEN** 构建产物中出现该条目
- **AND** 根清单不需要修改

### 需求: story 文件不随组件安装

story 文件 MUST NOT 出现在条目的安装文件列表中。

#### 场景: 安装组件不带 story

- **GIVEN** button 文件夹里有 story 文件
- **WHEN** 用户项目安装 button
- **THEN** 用户项目中只出现组件源码，没有 story 文件

### 需求: 条目元数据包含用法说明

每个组件和区块条目 MUST 提供一句话描述，SHOULD 在元数据中提供"何时使用"和"不要怎么用"的说明，供 plugin 的组件目录生成使用。

#### 场景: 缺少用法说明时给出提示

- **GIVEN** 一个组件条目没有"何时使用"说明
- **WHEN** 运行 registry 校验
- **THEN** 输出警告，指出该条目缺少用法说明
- **AND** 校验不因此失败

### 需求: 依赖一致性校验

系统 MUST 提供校验命令，比对每个条目源码中的 import 与元数据中的依赖声明：
- 引用的 npm 包 MUST 出现在 npm 依赖中（React 等运行时自带的包除外）；
- 引用的其他 registry 组件 MUST 出现在 registry 依赖中；
- 声明了但源码没有引用的依赖 MUST 报告为多余。

#### 场景: 漏写 npm 依赖

- **GIVEN** 某组件源码引用了 `@base-ui/react`，元数据的 npm 依赖中没有它
- **WHEN** 运行 registry 校验
- **THEN** 命令以非零状态退出，指出该条目缺少 `@base-ui/react`

#### 场景: 漏写 registry 依赖

- **GIVEN** 某区块源码引用了 button 组件，元数据的 registry 依赖中没有 button
- **WHEN** 运行 registry 校验
- **THEN** 命令以非零状态退出，指出该条目缺少对 button 的依赖

#### 场景: 多余依赖

- **GIVEN** 某组件元数据声明了 `lucide-react`，源码没有引用
- **WHEN** 运行 registry 校验
- **THEN** 命令以非零状态退出，指出 `lucide-react` 是多余的依赖

### 需求: 源码里的 import 与用户项目一致

条目源码中引用其他组件和工具的路径 MUST 使用 shadcn 标准别名（如 `@/components/ui/button`、`@/lib/utils`），使同一份源码既能在仓库预览站中运行，安装到用户项目后也无需修改。

#### 场景: 同一份源码两处可用

- **GIVEN** 一个引用了 button 的区块
- **WHEN** 分别在预览站中渲染它、把它安装到用户项目后编译
- **THEN** 两处都能正常工作

### 需求: 构建与部署地址

构建命令 MUST 产出每个条目一个 JSON 文件和一份总清单。部署地址 MUST 在构建时通过参数注入，未指定时默认为本地地址。条目之间的 registry 依赖在源码中 MUST 写为命名空间形式，在构建产物中 MUST 改写为基于部署地址的绝对 URL。

#### 场景: 注入部署地址

- **WHEN** 指定部署地址为 `https://example.com` 并执行构建
- **THEN** 产物中所有内部依赖的形式为 `https://example.com/r/<name>.json`
- **AND** 产物中不残留地址占位符

#### 场景: 默认本地地址

- **WHEN** 不指定部署地址直接构建
- **THEN** 产物中的内部依赖指向本地地址

### 需求: 组件 API 与 shadcn 一致

改写后的组件 MUST 保持与 shadcn 相同的组件名、子组件结构和常用 prop 名。变体和尺寸 MAY 精简，MUST NOT 改名。

#### 场景: Button 尺寸精简

- **WHEN** 查看 button 支持的尺寸
- **THEN** 只有 default、sm、icon、icon-sm 四种
- **AND** 变体包含 default（黑白反色）和 brand（强调色），不存在名为 accent 的变体

#### 场景: 使用不存在的尺寸被类型检查拦下

- **GIVEN** 代码中写了 `<Button size="xs">`
- **WHEN** 进行类型检查
- **THEN** 报告类型错误
