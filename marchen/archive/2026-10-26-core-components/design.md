## 背景

`scaffold-architecture`（已归档，见 `marchen/archive/2026-10-26-scaffold-architecture/`）建立了：token 生成链路、每个组件一个文件夹的 registry 结构与依赖校验、iframe 矩阵预览站、冒烟测试与截图回归。registry 里目前只有 button（上游尺寸精简后的版本，圆角仍是上游的 `rounded-lg`）。

提案阶段对上游 base-nova（shadcn@4.22.1）做了调查：

- **官方 JSON 里的源码是模板形式**：图标写成 `@/app/(create)/components/icon-placeholder`，组件互相引用写成 `@/registry/base-nova/ui/button`，要等 CLI 安装时才会替换成用户选的图标库和别名。所以改写的起点必须是 **CLI 安装到项目之后的代码**，不能直接取 JSON。
- 用 CLI 装进临时项目后，16 个组件的外部引用只有：`cn`、`react`、`class-variance-authority`、`lucide-react`（checkbox、dialog、dropdown-menu、select、toast）、`@base-ui/react/*`，以及互相引用的 `@/components/ui/{button,label,separator}`。
- 上游 registry.json 的 npm 依赖大多只写了 `cn`，没写 `@base-ui/react`（默认 base 已安装）。我们的 check-registry 要求完整声明。
- 上游的形状和深度现状：

| 组件 | 圆角 | 阴影 | 高度 |
| --- | --- | --- | --- |
| input | rounded-lg | – | h-8 |
| textarea | rounded-lg | – | min-h-16 |
| select | 触发器 rounded-lg / 选项 rounded-md | 弹出层 shadow-md | h-8 / h-7 |
| switch | rounded-full | – | – |
| checkbox | rounded-[4px] | – | – |
| dialog | rounded-xl | –（ring） | – |
| dropdown-menu | 弹层 rounded-lg / 选项 rounded-md | shadow-md，子菜单 shadow-lg | – |
| popover | rounded-lg | shadow-md | – |
| tooltip | rounded-md | – | – |
| tabs | 列表 rounded-lg / 触发器 rounded-md | 选中 shadow-sm | h-8 |
| card | rounded-xl | –（ring） | – |
| toast | rounded-2xl | shadow-lg | – |

- toast：`Toaster` 内部包了 Base UI 的 Toast Provider，需要用户在应用根部挂载一次；`toast` 是模块级的 toast manager，导出供调用。tooltip 不需要 Provider 也能工作（`TooltipProvider` 只用于共享延迟）。
- **截图回归的漏洞**：现在的截图只拍 `#root` 元素，而弹层通过 portal 挂在 `body` 下，打开状态的弹层不在截图里。

## 目标与非目标

**目标：**
- 确定统一的组件视觉规格，并落实到 16 个组件和 button。
- 核心集全部改写完成并写入 base，冒烟测试按完整核心集通过。
- 每个组件有覆盖主要状态的 stories 和用法元数据。
- 用核心组件拼出设置弹窗 demo，并纳入预览站和截图回归。
- 修复截图回归拍不到弹层的问题。
- 提供一个把上游组件复制进来的小工具，后续加组件也能用。

**非目标：**
- 区块（settings-section、settings-row、sidebar-nav 等）。demo 里的设置行直接用组件和 class 拼，不抽象成区块。
- 第二梯队组件（radio-group、slider、badge 等）。
- design skill 规则内容、部署。
- 改动 token 的取值（除非实现中发现对比度或层级问题，那时单独说明）。例外：圆角评审后 `--radius` 从 `0.625rem` 改为 `0.5rem`（见 D2）。

## 决策

### D1. 改写起点：用 CLI 安装后的上游代码，提供 fork 工具

新增 `scripts/fork-upstream.ts <name...>`：

```
.cache/upstream/            （gitignore）
└── app/                    首次运行时用 shadcn init -t vite -b base -p nova 创建，之后复用
    └── src/components/ui/  shadcn add <name> --overwrite 的结果

fork-upstream button select
  → 在 .cache/upstream/app 中 shadcn add（使用仓库锁定版本的 CLI）
  → 复制到 registry/ui/<name>/<name>.tsx（目标已存在时拒绝覆盖，除非 --force）
  → 生成 registry/ui/<name>/registry.json 骨架：
       dependencies / registryDependencies 由 import 推导（复用 check-registry 的解析逻辑）
       meta.forkedFrom = "shadcn@<版本>/base-nova"，description / usage 留 TODO
  → 提示在 registry/ui/registry.json 中加 include、运行 pnpm gen
```

不自动修改 `registry/ui/registry.json`（include 顺序由人决定），由 check-registry 兜底检查漏 include。TODO 占位会让 check-registry 报警告（缺少 usage），提醒补全。

### D2. 形状：圆角由 `--radius` 派生，统一为小圆角

> 修订记录：最初的方案是"单行控件为胶囊形 `rounded-full`、容器 `rounded-xl`（≈14px）"。全部组件完成后整体评审，认为胶囊形加上 14px 容器整体偏圆、偏软；实测对比后选定现在的方案（评审中的方案 B）。观感上起决定作用的是控件的胶囊形，容器从 14px 降到 10px 在整页中几乎看不出差别。

所有圆角都使用 shadcn 由 `--radius` 派生的工具类，不写死像素，不使用 `rounded-full`（例外见表）。`--radius` 默认值改为 `0.5rem`（8px），写在 `tokens/foundation.ts`。

| 层级 | 工具类 | 8px 基准下 | 组件部位 |
| --- | --- | --- | --- |
| 内层项 | `rounded-sm`（×0.6） | ≈ 5px | select / dropdown-menu 选项高亮、tabs 触发器、checkbox |
| 控件 | `rounded-md`（×0.8） | ≈ 6px | button（含图标按钮）、input、select 触发器、tooltip、导航项 |
| 容器 | `rounded-lg`（×1） | 8px | card（含 header / footer 的上下圆角）、popover、dropdown-menu 与 select 弹出层（含子菜单）、toast、textarea、tabs 列表、field 卡片式选项 |
| 弹窗 | `rounded-xl`（×1.4） | ≈ 11px | dialog（含 footer 的下圆角） |
| 例外 | `rounded-full` | — | switch 轨道与滑块、scroll-area 滑块 |

同心规则：嵌套元素的圆角 = 外层圆角 − 内边距，取最接近的档位。
- 弹出层 `rounded-lg`（8px）+ `p-1`（4px）→ 选项 ≈ 4px → `rounded-sm`。
- tabs 列表 `rounded-lg` + `p-[3px]` → 触发器 ≈ 5px → `rounded-sm`。
- dialog `rounded-xl`（≈11px）里放卡片 `rounded-lg`（8px），内层小于外层。

其他：
- 当初为胶囊形加大的左右内边距（button `px-3`、input / select 触发器 `px-3`、选项 `pl-2.5`、标签 `px-2.5`、inset `pl-8`、tabs 触发器 `px-3`）**回退为上游值**。
- 删除所有 `rounded-[min(var(--radius-md),Npx)]` 这类上游为小尺寸写的特殊圆角，统一使用上表的档位。
- checkbox 从上游的 `rounded-[4px]` 改为 `rounded-sm`，跟随 token 缩放。

### D3. 尺寸

- 默认 `h-8`（32px），小号 `h-7`（28px），沿用上游 base-nova 的数值。
- 删除高于 36px 的档位（button 已在上个变更删除 lg）。
- 正文 `text-sm`（14px），小号 `text-[0.8rem]`（约 13px），沿用上游。

### D4. 深度

- 浮层（popover、dropdown-menu 及子菜单、select 弹出层、dialog、toast）：浅色 `shadow-md` + `ring-1 ring-foreground/10`；深色 `dark:shadow-none`，只保留 ring（等于一像素浅色边框）。子菜单和 toast 的 `shadow-lg` 降为 `shadow-md`。
- 深色下的"更亮"已经由 token 保证（popover 0.245 > card 0.215 > background 0.18），组件里使用 `bg-popover` / `bg-card` 即可。
- 平铺元素：card 去掉阴影，只用 `ring-1 ring-foreground/10`；tabs 选中触发器保留 `shadow-sm`（规格允许的最高档）。
- 遮罩：dialog overlay 使用 `bg-overlay` 语义 token（上游是 `bg-black/10`），保留上游的轻微模糊 `supports-backdrop-filter:backdrop-blur-xs`（设计规则允许遮罩模糊）。

### D5. 状态

上游基本已经符合规格，逐个核对即可：
- 开关、复选框选中：`bg-primary`（强调色）✓
- 焦点环：`ring-ring/50`，ring = primary ✓
- 菜单 / 选项高亮：`bg-accent`（accent token 是灰色）✓
- 错误：`aria-invalid:border-destructive` ✓
- toast 的类型图标（成功、信息、警告、错误）：上游如有彩色，改为成功/信息用 `text-foreground`，警告/错误用 `text-destructive`，不引入额外彩色（实现时以设计规则检查为准）。

### D6. API 与变体

- 子组件名、prop 名全部保持上游。
- 变体：保留上游已有的语义变体（如 tabs 的 `line` 变体如果存在则保留），不新增。
- 尺寸：只保留 `default` 和 `sm`（以及 button 的图标尺寸），删除其他档位。
- **select 改了上游的一个默认值（评审后修订）**：`SelectContent` 的 `alignItemWithTrigger` 默认从 `true` 改为 `false`。上游默认模仿 macOS 原生菜单，弹出层盖住触发器并让选中项文字与触发器文字对齐；实测会让弹出层偏移约 5px，露出触发器边框、超出所在卡片，而且用 `defaultOpen` 打开时又出现在触发器下方，行为不一致。改为默认在触发器下方展开（与 dropdown-menu 一致），prop 保留，需要时可显式开启。
- **select 弹出层的内边距放在列表上**：上游的 `p-1` 写在 `SelectGroup` 上，不包 `SelectGroup` 时选项高亮会贴着外框。改为 `SelectPrimitive.List` 带 `p-1`，`SelectGroup` 不再带内边距。

### D7. toast 接入

在 toast 的 `meta.usage` 中写明：

```tsx
// 应用根部挂载一次
<Toaster>{children}</Toaster>   // 或按上游实现的实际签名
// 任意位置触发
toast.add({ title: "已保存" })
```

具体写法以实际代码签名为准（实现时读 `Toaster` 的实现确认是包裹 children 还是独立挂载）。冒烟测试不覆盖 toast 的运行时行为，toast 的 story 用一个按钮触发并展示一条处于显示状态的通知。

### D8. 截图回归：改为整页截图

```
现状：expect(page.locator("#root")).toHaveScreenshot()   → 拍不到 portal 到 body 的弹层
改为：expect(page).toHaveScreenshot({ fullPage: true })  → 拍整个文档
```

- frame 页面的 `body` 高度由内容决定，含弹层的 story 用 `parameters.minHeight` 留出空间，保证弹层在截图范围内。
- 视口宽度固定为 720px（现有），整页截图的高度随内容变化。
- 改完后所有基准需要重新生成（button 形状也变了，本来就要重新生成）。

### D9. 设置弹窗 demo：作为一种特殊的 story

demo 放在 `preview/src/demos/settings-dialog.stories.tsx`，用 CSF 格式，`title: "Demos/Settings Dialog"`，`parameters: { layout: "page", minHeight: 640 }`：

- gallery 的收集范围从 `registry/**` 扩大到 `registry/**` + `preview/src/demos/**`。`title` 以 `Demos/` 开头的归入导航的 demos 区。
- `layout: "page"` 的 story 在矩阵中**每行一个格子**（单格宽度为内容区全宽），而不是一行四个；截图时视口宽度改为 1024px，以容纳 840px 宽的弹窗。
- 这样 demo 自动获得单格地址、明暗 × 强调色矩阵和截图回归，不需要另写一套机制。原来 `preview/src/demos/index.ts` 的 demo 注册表删除。
- 弹窗使用真实的 `Dialog`（`defaultOpen`），一并检验遮罩、弹窗容器和焦点处理。内容结构：

```
┌──────────────────────── Dialog (rounded-xl, 840×600) ─────────────────────────┐
│ ┌─ 导航 168px (bg-sidebar) ─┐ ┌─ 内容 ───────────────────────────────────────┐ │
│ │ ● 通用   ← bg-sidebar-accent│ │ 通用                                        │ │
│ │   外观                     │ │ 语言与地区   ← 分组标题 text-xs muted，卡片外 │ │
│ │   通知                     │ │ ┌─ Card ───────────────────────────────────┐ │ │
│ │   账户                     │ │ │ 界面语言          [ 简体中文      ⌄ ]      │ │ │
│ │                            │ │ │ 时区  说明…       [ 自动          ⌄ ]      │ │ │
│ │                            │ │ └──────────────────────────────────────────┘ │ │
│ │                            │ │ 行为                                        │ │
│ │                            │ │ ┌─ Card ───────────────────────────────────┐ │ │
│ │                            │ │ │ 开机启动                          (●  )   │ │ │
│ │                            │ │ │ 发送使用数据  说明…               (  ●)   │ │ │
│ │                            │ │ └──────────────────────────────────────────┘ │ │
│ │                            │ │                       ( 取消 )  ( 保存 )     │ │
│ └────────────────────────────┘ └─────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────┘
外观：主题 select、强调色 select、紧凑模式 checkbox
通知：若干 switch + 免打扰时段 input
账户：用户名 input、邮箱 input、退出登录（destructive）
```

导航用普通按钮元素加 class 实现，不抽象成 sidebar-nav 区块（区块留给下一个变更）。

第一轮实现中的发现（记录给后续 settings 区块）：
- **大弹窗里放卡片时，内容区要用 `bg-background`**。dialog 本身是 `bg-popover`，深色下 popover（0.245）比 card（0.215）亮，卡片会显得凹陷；浅色下两者都是纯白，只能靠细边框区分。内容区换成 background 层后，浅色是浅灰底上的白卡片，深色是卡片比底色亮一档，和 Grok 截图一致。
- **打开弹窗时焦点不要落在导航项上**。Base UI 默认聚焦第一个可聚焦元素，静态画面里焦点环像"选中"，还多占一处强调色。demo 用 `initialFocus` 指向内容区；dialog 组件本身保持默认行为（这是正确的无障碍行为）。
- design R1 的担心没有出现：胶囊形的选项高亮、导航选中项和其他控件放在一起很协调，spec 不需要修改。之后全部组件完成后的整体评审认为胶囊形和 14px 容器整体偏圆，改为由 token 派生的小圆角（见修订后的 D2）。

### D10. 推进顺序

```
1. 工具与基础：fork-upstream、截图改为整页、gallery 支持 layout: "page" 和 demos 收集
2. 表单类：label、separator、field、input、textarea、select、switch、checkbox，button 改为 token 派生圆角（最初为胶囊形，见 D2 修订记录）
3. 设置弹窗 demo（先只用表单类 + 简单的导航；dialog 用上游原版临时顶替）→ 对照规格检查，必要时回调第 2 步
4. 浮层类：dialog、popover、dropdown-menu、tooltip、toast
5. 结构类：tabs、card、scroll-area
6. core.ts 全部 ready → pnpm gen → check → smoke → 重新生成全部截图基准
```

先做 demo 再做浮层，是为了尽早在整页场景里验证形状和尺寸，避免 16 个组件都改完才发现形状不协调。第 3 步之前 dialog 还没改写，demo 可以先用 fork 进来但尚未改写的 dialog，第 4 步改写后自然生效。

## 风险与权衡

- **R1（已由修订后的 D2 取代）：胶囊形的选项高亮在弹层里可能显得突兀。** 第 3 步拼 demo 时会实际看到；如果不协调，退回为 `rounded-lg`，并同步修改 spec 中"选项高亮为胶囊形"的要求（通过 `/marchen:update`）。
- **R2：上游 class 字符串很长，改写时容易漏改或改坏交互相关的 class**（如 `data-open:`、`origin-(--transform-origin)` 动画）。原则是只改形状、阴影、尺寸相关的 class，交互和动画 class 保持原样；每个组件改完都在 gallery 的打开状态 story 中检查。
- **R3：整页截图对内容高度敏感。** 某个 story 内容高度变化会让整页截图尺寸变化而失败。这本身就是回归信号，可以接受。
- **R4：dialog 在 iframe 中的焦点陷阱和滚动锁定**可能影响 gallery 页面本身的滚动。iframe 隔离了文档，预计不受影响；如有问题，demo 的格子改为固定高度。
- **R5：toast 的显示状态有动画和自动消失。** story 中需要用较长的 timeout 或不自动消失的配置，截图时关闭动画；如果仍然不稳定，toast 的 story 不纳入截图回归，并在测试中显式跳过。
- **R6：`.cache/upstream` 首次创建需要网络和约 1 分钟。** 只在 fork 新组件时需要，不影响日常检查。
- **R7：工作量较大（17 个组件 + demo）。** 按 D10 分批，每批结束时 `pnpm check` 通过再进入下一批，避免问题堆积。
