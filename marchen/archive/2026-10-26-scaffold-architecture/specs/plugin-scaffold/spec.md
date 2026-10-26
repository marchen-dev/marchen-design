## 目的

建立 Claude Code plugin 的骨架，让本仓库可以作为 plugin marketplace 被安装，并接收由 registry 和 token 生成的参考资料。规则内容不在此能力范围内。

### 需求: 可作为 marketplace 安装

仓库 MUST 提供 marketplace 清单，声明 marchen-design plugin 及其所在目录。plugin 目录 MUST 提供 plugin 清单（名称、描述、版本）。

#### 场景: 添加 marketplace

- **WHEN** 在 Claude Code 中把本仓库添加为 plugin marketplace
- **THEN** 能看到 marchen-design plugin，并可以安装

### 需求: 目录结构

plugin MUST 包含 design skill、design-review skill 和 design-init 命令的目录位置。本变更中，这些位置 MAY 只包含说明"待编写"的占位内容，但 MUST NOT 包含会误导使用者的未完成规则。

#### 场景: 占位内容不会被误用

- **GIVEN** 安装了骨架阶段的 plugin
- **WHEN** 触发 design skill
- **THEN** skill 明确说明自己尚未完成，不输出任何设计规则

### 需求: 生成的参考资料

plugin 的 design skill 参考目录中 MUST 包含两份生成物：组件目录（来自各条目的描述和用法说明）和纯 CSS 版 token（供非 shadcn 项目使用）。两者 MUST 在源头变化后通过生成命令更新，并受生成物一致性检查保护。

#### 场景: 组件目录随 registry 更新

- **GIVEN** 给 button 条目新增了"不要怎么用"的说明
- **WHEN** 运行组件目录生成命令
- **THEN** plugin 的组件目录中 button 一节出现这条说明

#### 场景: 纯 CSS token 可独立使用

- **WHEN** 把 plugin 中的纯 CSS token 文件引入一个没有 Tailwind 的页面
- **THEN** 页面可以通过 CSS 变量使用全部语义 token，包括明暗两种模式

### 需求: 设计规则检查脚本可随 plugin 分发

design-review 目录中 MUST 能访问设计规则检查脚本，且该脚本与仓库自身使用的是同一份，不得复制出第二份。

#### 场景: 同一份检查逻辑

- **WHEN** 修改设计规则检查中的一条规则
- **THEN** 仓库自身的检查和 plugin 的审查同时生效
