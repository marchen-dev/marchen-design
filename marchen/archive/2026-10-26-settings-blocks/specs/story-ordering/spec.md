## 目的

让预览站和截图回归按作者在源码中的意图展示 story，最重要的示例排在最前面。

### 需求: 按声明顺序展示

预览站 MUST 按 story 在源码中的导出顺序展示。若 story 文件导出了 `__namedExportsOrder`（Storybook CSF 约定），MUST 以它为准。

#### 场景: 源码顺序

- **GIVEN** button 的 stories 依次导出 Variants、Sizes、WithIcon、Disabled
- **WHEN** 在预览站查看 Button
- **THEN** 依次显示 Variants、Sizes、With Icon、Disabled

#### 场景: 显式顺序

- **GIVEN** 某个 story 文件导出了 `__namedExportsOrder = ["Open", "Default"]`
- **WHEN** 在预览站查看该组件
- **THEN** 先显示 Open，再显示 Default

### 需求: 不影响 story id

调整展示顺序 MUST NOT 改变任何 story 的 id、单格地址或截图基准的文件名。`__namedExportsOrder` MUST NOT 被当作 story 展示。

#### 场景: 截图基准不变

- **WHEN** 只调整 story 的展示顺序后运行截图回归
- **THEN** 不出现新增或缺失的基准文件
