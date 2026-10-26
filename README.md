# marchen-design

「黑白 + 单一强调色」的设计系统，面向工具和应用类界面（设置页、列表、弹窗表单、后台）。基于 [shadcn/ui](https://ui.shadcn.com)（Base UI）和 Tailwind CSS 4，通过官方 shadcn CLI 安装。

- 黑白用于主操作，强调色只表示状态（开关、选中、焦点），其余都是纯中性灰
- 深色模式越往上越亮，浮层用细边框代替阴影
- 圆角、颜色全部由 token 派生，改一个变量即可整体调整；强调色可切换
- 系统字体，紧凑的信息密度，默认箭头指针

| 浅色 | 深色 |
| --- | --- |
| ![浅色](tests/visual/__screenshots__/demos-settings-dialog--general--light-blue-darwin.png) | ![深色](tests/visual/__screenshots__/demos-settings-dialog--general--dark-blue-darwin.png) |

在线文档：<https://design.suemor.com>

## 安装

### 新项目

```bash
npx shadcn@latest init https://design.suemor.com/r/base.json
```

会写入项目配置（包括 `@marchen-design` 命名空间）、明暗 token 和全局样式，并安装核心组件：button、input、textarea、field、select、switch、checkbox、dialog、dropdown-menu、popover、tooltip、toast、tabs、card、scroll-area（以及依赖的 label、separator）。

### 已有项目

在 `components.json` 中加入命名空间：

```json
{
  "registries": {
    "@marchen-design": "https://design.suemor.com/r/{name}.json"
  }
}
```

然后按需安装：

```bash
npx shadcn@latest add @marchen-design/button @marchen-design/dialog
```

不配置命名空间也可以直接用地址安装：`npx shadcn@latest add https://design.suemor.com/r/button.json`。

> 安装 `@marchen-design/base` 会覆盖项目已有的 CSS 变量和组件配置。已有自己设计系统的项目，建议只按需安装组件。

### 切换强调色

默认是蓝色。可选 `green`、`orange`、`pink`、`red`、`purple`：

```bash
npx shadcn@latest add @marchen-design/accent-green
```

只会覆盖强调色相关的变量，其余 token 不变。

### 使用 toast

在应用根部挂载一次 `<Toaster />`，之后在任意位置调用：

```tsx
import { toast } from "@/components/ui/toast"

toast.add({ title: "已保存", type: "success" })
```

## Claude Code plugin

仓库同时是一个 Claude Code plugin marketplace：

```
/plugin marketplace add marchen-dev/marchen-design
/plugin install marchen-design@marchen-design
```

> design skill 的设计规则仍在编写中，目前只提供组件目录、纯 CSS token 和设计规则检查脚本（`design-review`）。

## 本地开发

需要 Node 22.18+ 和 pnpm 10。

```bash
pnpm install
pnpm dev          # 预览站：每个组件以「明暗 × 强调色」矩阵展示
pnpm gen          # 修改 tokens/ 或新增组件后重新生成
pnpm check        # 生成物一致性、依赖校验、设计规则、类型、eslint、单元测试、registry 构建
pnpm smoke        # 在临时目录走一遍真实的 init / add 流程
pnpm screenshot   # 截图回归
```

开发约定（源头与生成物、加组件的流程、组件视觉规格）见 [AGENTS.md](AGENTS.md)。

## 许可证

[MIT](LICENSE)
