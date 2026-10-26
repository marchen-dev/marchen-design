## 目的

提供只包含设计 token 的 registry 条目，让不能使用 marchen-design 组件的项目（Radix、React Aria）或只想试用配色的项目，安全地引入 token。

### 需求: 只包含 token

`theme` 条目 MUST 包含与 base 相同的明暗语义 token、圆角、字体、动效变量，MUST NOT 包含项目配置（`config`），MUST NOT 依赖任何组件或区块，MUST NOT 引入 npm 依赖。

#### 场景: 条目内容

- **WHEN** 查看构建产物中的 `theme.json`
- **THEN** 只包含 cssVars（及必要的全局样式），没有 config、registryDependencies 和 dependencies

### 需求: 与 base 的 token 一致

`theme` 的 token 值 MUST 与 base 完全相同，并由同一个生成器从同一份源头生成。

#### 场景: 修改 token 后同步

- **WHEN** 修改 token 源头并重新生成
- **THEN** base 和 theme 中的对应值同时变化，且相同

### 需求: 安装效果

在已有 shadcn 项目中安装 `theme` 后，MUST 更新全局 CSS 变量，MUST NOT 修改 `components.json` 的 `style` 等配置，MUST NOT 新增或替换组件文件。

#### 场景: 在 Radix 项目中安装

- **GIVEN** 一个 `style` 为 `new-york` 的 shadcn 项目，已有 button 组件
- **WHEN** 安装 `theme`
- **THEN** `--primary` 等变量变为 marchen-design 的值
- **AND** `components.json` 的 `style` 仍为 `new-york`，button 组件文件未改变
- **AND** 项目编译通过

### 需求: 可与强调色条目组合

安装 `theme` 后再安装 `accent-*` 条目 MUST 能切换强调色，效果与在 base 项目中相同。

#### 场景: theme + 绿色

- **WHEN** 先安装 `theme`，再安装 `accent-green`
- **THEN** 强调色相关变量变为绿色系，其余 token 不变
