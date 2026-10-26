## 1. story 顺序

- [x] 1.1 Vite 插件：对 `*.stories.tsx` 用 TypeScript 编译器 API 取出具名导出顺序，未导出 `__namedExportsOrder` 时在末尾追加；注册到 `vite.config.ts`
- [x] 1.2 `preview/src/gallery/csf.ts`：`toGroup` 优先按 `__namedExportsOrder` 排序，并在 story 列表中排除该键
- [x] 1.3 验证：Button 依次显示 Variants、Sizes、With Icon、Disabled；`pnpm screenshot` 无新增或缺失的基准文件

## 2. sidebar-nav 区块

- [x] 2.1 `registry/blocks/sidebar-nav/sidebar-nav.tsx`：`SidebarNav`、`SidebarNavGroup`（可选标题）、`SidebarNavItem`（`useRender`，默认 button，`icon`、`active` → `aria-current` / `data-active`）
- [x] 2.2 `registry.json`（`registry:block`，文件类型 `registry:component`，描述与用法元数据）并加入 `registry/blocks/registry.json` 的 include，`pnpm gen`
- [x] 2.3 stories（`title: "Blocks/Sidebar Nav"`）：按钮形态带选中项、链接形态、两个分组
- [x] 2.4 文档站导航增加"区块"分组；`preview/src/site/Shell.tsx` 改用 `SidebarNav`（导航项渲染为 `<a href>`）

## 3. settings 区块

- [x] 3.1 `SettingsRow`：Base UI `Field.Root` / `Field.Label` / `Field.Description`，控件垂直居中，多控件时 flex 排列
- [x] 3.2 `SettingsSection`：卡片外的标题与可选说明，内部为 `Card size="sm"`，行间无分隔线
- [x] 3.3 `SettingsShell` / `SettingsShellNav` / `SettingsShellContent` / `SettingsHeader` / `SettingsBody` / `SettingsFooter`：布局与滚动区域按 design D3
- [x] 3.4 `SettingsDialog`：Dialog 尺寸（含小视口约束）、context 提供内容区 ref 作为 `initialFocus`、导航区顶部留位、`SettingsHeader` 在弹窗内渲染为 `DialogTitle`、可访问名称兜底
- [x] 3.5 `registry.json`（依赖 `@marchen-design/{card,dialog,sidebar-nav}`、`@base-ui/react`、`cn`）与用法元数据（含与 shadcn `field` 的分工），加入 include，`pnpm gen`；`pnpm check:registry` 通过
- [x] 3.6 stories（`title: "Blocks/Settings"`）：单独的 section + row（含说明 / 无说明 / 多控件）、页面形态的 shell

## 4. demo 与验证

- [x] 4.1 用 `SettingsDialog` 和区块重写 `settings-dialog.stories.tsx`，删除局部 `Group`、`Row` 与手写导航
- [x] 4.2 新增 `settings-page.stories.tsx`（`Demos/Settings Page`，`layout: "page"`）：示意顶栏 + `SettingsShell`，内容足够多以验证只有内容区滚动
- [x] 4.3 对比重写前后的设置弹窗截图，除导航项外无明显差异；检查明暗 × 强调色与打开时无导航焦点环
- [x] 4.4 tabs 触发器内边距：对比 `px-1.5` 与 `px-2`，必要时调整（design D8）
- [x] 4.5 `tests/blocks/settings-row.spec.ts`：点击名称切换开关、select 的可访问名称正确；纳入 Playwright 运行
- [x] 4.6 冒烟测试新增步骤：安装 `@marchen-design/settings`，确认新增两个区块文件、button 仍为 marchen-design 版本、编译通过

## 5. 收尾

- [x] 5.1 `pnpm check`、`pnpm smoke` 通过；`pnpm screenshot:update` 生成新基准并抽查，再运行一次确认稳定
- [x] 5.2 `AGENTS.md`：区块的目录与安装位置、"settings 区块 vs shadcn field"的分工、stories 顺序约定
