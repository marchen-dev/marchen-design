## 背景

已归档的 `core-components` 提供了 17 个核心组件和一个设置弹窗 demo（`preview/src/demos/settings-dialog.stories.tsx`，约 240 行）。demo 里的局部组合 `Group`、`Row` 和手写的导航，就是这次要提炼的对象。它的设计发现记录在 `marchen/archive/2026-10-26-core-components/design.md` 的 D9：大弹窗内容区用 `bg-background`、打开时用 `initialFocus` 避免导航项出现焦点环。

提案阶段的调查结论（作为本设计的约束）：

- **区块的安装位置**：`registry:block` 条目中类型为 `registry:component` 的文件，安装到用户项目的 `components/<文件名>`（实测）。与仓库现有别名 `@/components/<name>` → `registry/blocks/<name>/<name>.tsx` 一致，gen-paths、check-registry 不需要改动。
- **依赖必须用命名空间**：实测区块如果依赖上游的 `button`（不带命名空间），安装时会**把用户项目里 marchen-design 的 button 覆盖成上游版本**。check-registry 已经要求"本 registry 有的条目必须写 `@marchen-design/xxx`"，可以防住。
- **Base UI 的 Field 能自动关联控件**：`Field.Root` 中的 Switch、Checkbox、Select、Input 会从上下文读取 `labelId`。实测点击 `Field.Label` 能切换开关和复选框、聚焦输入框，select 触发器的可访问名称正确。不需要手动 id，也不需要 cloneElement。
- **Base UI 提供 `useRender`**（`@base-ui/react/use-render`）和 `mergeProps`，可以让自定义组件支持 `render` prop，与 Base UI 其他组件的写法一致。
- **story 的声明顺序在运行时拿不到**：ES 模块命名空间对象的键按规范按字母排序，`Object.entries(mod)` 无法反映源码顺序。Storybook 的做法是构建时注入 `__namedExportsOrder`。

## 目标与非目标

**目标：**
- `sidebar-nav`、`settings` 两个可安装区块，覆盖 demo 中的全部局部组合，并把已知的坑封装在内。
- 设置外壳与外层容器解耦，弹窗和页面两种形态都能用。
- demo 改用区块重写、新增页面形态 demo、文档站外壳改用 `sidebar-nav`。
- stories 按源码声明顺序展示。

**非目标：**
- 其他场景的区块（列表页、空状态、聊天等）。
- 移动端适配（窄屏下导航折叠为下拉或抽屉）：工具类界面以桌面为主，后续有需要再加。设置弹窗只保证小视口下不超出屏幕。
- 应用级侧栏（可折叠、记住状态）：shadcn 上游的 `sidebar` 组件覆盖这个场景，`sidebar-nav` 只是轻量导航列表，不 fork 上游的 sidebar。
- design skill、design-init、部署。

## 决策

### D1. 两个条目，而不是四个

```
registry/blocks/
├── sidebar-nav/   sidebar-nav.tsx    SidebarNav · SidebarNavGroup · SidebarNavItem
└── settings/      settings.tsx       SettingsShell · SettingsShellNav · SettingsShellContent
                                      SettingsHeader · SettingsBody · SettingsFooter
                                      SettingsSection · SettingsRow · SettingsDialog
```

- 提案里说的 shell、section、row、dialog 是**一组配合使用的组件**，和 shadcn 的 card（`Card`、`CardHeader`、`CardContent`……）一样放在一个文件、作为一个条目。用户 `add @marchen-design/settings` 一次就拿到全部，不会出现"装了 row 没装 section"。
- `sidebar-nav` 单独一个条目：文档站和应用二级导航都会单独用到它，`settings` 依赖它。
- 两个都是 `registry:block`，文件类型 `registry:component`，安装后为 `components/settings.tsx`、`components/sidebar-nav.tsx`。

### D2. sidebar-nav 的 API

```tsx
<SidebarNav>                                   // <nav>，纵向排列，组间距
  <SidebarNavGroup label="组件">               // 可选标题：text-xs muted
    <SidebarNavItem icon={<Settings2Icon />} active onClick={...}>通用</SidebarNavItem>
    <SidebarNavItem render={<a href="#/ui-button" />}>Button</SidebarNavItem>
  </SidebarNavGroup>
</SidebarNav>
```

- `SidebarNavItem` 用 `useRender` 实现，默认渲染为 `<button type="button">`，传 `render` 可以换成链接或路由库的 Link。
- `active` 时加 `aria-current="page"` 和 `data-active`；样式：`bg-sidebar-accent text-sidebar-accent-foreground`，悬停 `hover:bg-sidebar-accent/60`。不加粗、不用强调色、不加竖条。
- 尺寸：`h-8 gap-2 rounded-md px-2.5 text-sm`；图标 `size-4 text-muted-foreground`。焦点环沿用组件规范 `focus-visible:ring-3 focus-visible:ring-ring/50`。
- `icon` 用 prop 而不是 children 里放图标：保证图标和文字的间距、颜色统一，AI 也不会随手给图标加颜色。
- `SidebarNav` 本身不带背景色：放在哪里由外层决定（设置外壳的导航区、文档站侧栏各自用 `bg-sidebar`）。

### D3. settings 的 API 与布局

```tsx
// 页面形态
<SettingsShell>
  <SettingsShellNav>                             // 左侧导航区：bg-sidebar，固定宽度 168px，内置 SidebarNav
    <SidebarNavItem …>…</SidebarNavItem>
  </SettingsShellNav>
  <SettingsShellContent>                         // 右侧：bg-background，纵向 flex
    <SettingsHeader title="通用" description?>   // 固定
    <SettingsBody>                               // 唯一的滚动区域，分组间距 gap-5
      <SettingsSection title="行为" description?>
        <SettingsRow label="开机启动" description="登录系统后自动运行。">
          <Switch />
        </SettingsRow>
      </SettingsSection>
    </SettingsBody>
    <SettingsFooter>                             // 固定，右对齐，可选
      <Button variant="secondary">取消</Button><Button>保存</Button>
    </SettingsFooter>
  </SettingsShellContent>
</SettingsShell>

// 弹窗形态：SettingsDialog 包好 Dialog + DialogContent 尺寸 + SettingsShell + initialFocus
<SettingsDialog open={open} onOpenChange={setOpen}>
  <SettingsShellNav>…</SettingsShellNav>
  <SettingsShellContent>…</SettingsShellContent>
</SettingsDialog>
```

布局要点：

```
SettingsShell            grid h-full min-h-0 grid-cols-[168px_minmax(0,1fr)]
├─ SettingsShellNav      bg-sidebar p-2，弹窗形态下 pt-12 给关闭按钮留位置
└─ SettingsShellContent  flex min-h-0 flex-col bg-background
   ├─ SettingsHeader     px-6 pt-5 pb-3（固定）
   ├─ SettingsBody       min-h-0 flex-1 overflow-y-auto px-6 pb-4（滚动）
   └─ SettingsFooter     flex justify-end gap-2 px-6 py-3（固定）
```

- **为什么 shell 不内置 Dialog**：页面形态不需要弹窗、焦点和固定尺寸。shell 只用 `h-full`，高度由外层决定：弹窗里是 600px，页面里是父容器的高度。
- **SettingsDialog 封装的内容**：`DialogContent` 的 `h-[600px] max-h-[calc(100vh-2rem)] gap-0 overflow-hidden p-0 sm:max-w-[840px]`；内部渲染 `SettingsShell`；通过 context 把内容区的 ref 交给 `SettingsShellContent`（`tabIndex={-1}`、`outline-none`），作为 `initialFocus`。导航区在弹窗中需要给关闭按钮留出顶部空间，通过同一个 context 告诉 `SettingsShellNav`。
- **弹窗的可访问名称（实现时修订）**：`SettingsDialog` 通过 `aria-label` 提供（`title` prop，默认"设置"），`SettingsHeader` 在两种形态下都渲染为普通 `h2`。最初方案是 header 在弹窗内渲染为 `DialogTitle`，但弹窗里没有 header 时还要再补一个隐藏标题，两个 `DialogTitle` 同时存在时行为不确定；改为 `aria-label` 后不再依赖 context 切换标签，R1 的隐式行为也随之消除。
- **`SettingsShellNav` 内置 `SidebarNav`（实现时修订）**：使用者直接放 `SidebarNavItem` / `SidebarNavGroup`，少一层嵌套；settings 也因此真正引用 sidebar-nav，安装 settings 时自动带上它，依赖校验不会把它判为多余。

### D4. SettingsRow 用 Base UI Field

```tsx
<Field.Root className="flex min-h-14 items-center justify-between gap-4 px-4 py-3">
  <div className="min-w-0 flex-1">
    <Field.Label className="text-sm font-medium">{label}</Field.Label>
    {description && <Field.Description className="text-[0.8rem] text-muted-foreground">{description}</Field.Description>}
  </div>
  <div className="shrink-0">{children}</div>
</Field.Root>
```

- **不复用 shadcn 的 `field` 组件**：shadcn 的 `Field` 是普通 div，名称和控件靠手写 `htmlFor`/`id` 关联；横排有说明时还会顶部对齐，demo 里只能用 `items-center!` 硬覆盖。Base UI 的 `Field.Root` 自带关联，我们自己写对齐，就没有要覆盖的东西。
- 这样 registry 依赖里没有 `field`，npm 依赖为 `@base-ui/react`。
- 支持 `id`（透传给 `Field.Root` 不需要；需要外部引用时，用户直接给控件设 id 即可），不额外设计 API。
- 一行里放多个控件（例如"输入框 + 按钮"）时，`children` 外层是 `flex items-center gap-2`。

### D5. SettingsSection

```tsx
<section className="flex flex-col gap-1.5">
  <div className="px-1">
    <h3 className="text-xs text-muted-foreground">{title}</h3>
    {description && <p className="text-xs text-muted-foreground">{description}</p>}
  </div>
  <Card size="sm" className="gap-0 py-0">{children}</Card>
</section>
```

依赖 `@marchen-design/card`。行之间不加分隔线（与 demo 一致，靠 `py-3` 的行高区分）。

### D6. 文档站外壳与 demo

- `preview/src/site/Shell.tsx`：左侧导航改为 `SidebarNav` + 两个 `SidebarNavGroup`，导航项 `render={<a href="#/…" />}`。外壳本身不是设置界面，不使用 `SettingsShell`。
- `settings-dialog.stories.tsx`：用 `SettingsDialog` + 区块重写，删除局部的 `Group`、`Row` 和手写导航，预期从约 240 行降到约 150 行（四个分类的内容占大头）。
- 新增 `preview/src/demos/settings-page.stories.tsx`（`title: "Demos/Settings Page"`，`layout: "page"`）：一个带应用顶栏的页面，正文区放 `SettingsShell`，验证页面形态和内容区滚动。
- 区块自己的 stories 放在 `registry/blocks/<name>/<name>.stories.tsx`，`title` 为 `"Blocks/Sidebar Nav"`、`"Blocks/Settings"`（与 `groupIdFromPath` 推出的 `blocks-sidebar-nav`、`blocks-settings` 对应）。文档站导航相应增加"区块"分组。

### D7. story 顺序：构建时注入 `__namedExportsOrder`

新增一个很小的 Vite 插件（写在 `vite.config.ts` 或 `preview/vite-plugin-csf-order.ts`）：

```
transform(code, id)  仅处理 *.stories.tsx
  ├─ 已经导出 __namedExportsOrder → 不处理
  └─ 否则用 TypeScript 编译器 API（ts.createSourceFile，仓库已有依赖）按顺序取出具名导出
     （Vite 8 改用 rolldown 后不再暴露 es-module-lexer，不新增依赖）
       → 在末尾追加 export const __namedExportsOrder = ["Variants", "Sizes", …]
```

`csf.ts` 的 `toGroup` 优先使用 `mod.__namedExportsOrder` 排序，并在过滤 story 时排除这个键。story id 由导出名计算，不受顺序影响，截图基准文件名不变。

为什么不在 `toGroup` 里解析源码：运行时拿不到源码文本；用 `?raw` 再导入一次会让每个 iframe 多加载一份 story 源码，违背上次修复 iframe 加载量的初衷。

### D8. tabs 触发器内边距

`core-components` 的圆角修订把 tabs 触发器内边距回退为上游的 `px-1.5`。实现时在 gallery 中对比 `px-1.5` 与 `px-2`；如果文字明显贴边，改为 `px-2`，并同步截图基准。只做这一处判断，不扩大范围。

### D9. 验证

- `pnpm check`：check-registry 自动校验两个区块的依赖（`settings` 应依赖 `@marchen-design/{card,dialog,sidebar-nav}` 和 `@base-ui/react`、`cn`，不应依赖上游名字）。
- 冒烟测试新增一步：在 base 初始化的项目里安装 `@marchen-design/settings`，确认新增 `components/settings.tsx`、`components/sidebar-nav.tsx`，button、card 等仍是 marchen-design 版本（检查 button 中的 `brand:` 变体），并编译通过。
- 截图回归：新增区块 stories 和两个 demo 的基准；对照检查 demo 重写前后的视觉一致（除导航项外应基本无差异）。
- 设置行的关联行为用 Playwright 写一个小测试（点击名称切换开关），放在 `tests/visual/` 之外的 `tests/blocks/`，纳入 `pnpm screenshot` 同一套 Playwright 运行。

## 风险与权衡

- **R1（已随 D3 修订消除）：`SettingsHeader` 根据 context 决定渲染 `DialogTitle` 还是 `h2`**，隐式行为。好处是使用者不用关心；坏处是在弹窗外误用 `DialogTitle` 会报错，这里正好由 context 避免。可以接受，并在用法说明中写明。
- **R2：Base UI Field 与 shadcn field 同时存在**，用户可能困惑该用哪个。规则：普通表单（竖排输入框）用 shadcn 的 `field`；设置界面用 `SettingsRow`。写进两者的 `meta.usage`。
- **R3：Vite 插件只作用于预览站**。用户项目里没有这个插件，但 stories 不会安装到用户项目，没有影响；以后迁移到 Storybook 时，Storybook 自己的 CSF 插件会做同样的事。
- **R4：`SettingsShellNav` 固定 168px**，导航文字很长时会截断。设置分类通常是短词；提供 `className` 覆盖即可，不做可配置宽度的 API。
- **R5：页面形态 demo 需要一个"应用顶栏"**，这部分只是 demo 内的示意，不作为区块，避免范围扩大。
