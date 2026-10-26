---
name: design-init
description: 在当前目录或项目中初始化 marchen-design：根据项目情况新建项目、安装 base，或只引入 token；覆盖前先确认。
disable-model-invocation: true
argument-hint: "[项目名]"
allowed-tools: Bash(ls *) Bash(cat package.json) Bash(cat components.json)
---

# 初始化 marchen-design

registry 地址：`https://design.suemor.com`（正式地址，不要替换）。

原则：**先检查、再说明、确认后执行**。任何会覆盖文件、组件或 CSS 变量的命令，执行前列出受影响的内容并等待用户确认。所有命令使用用户项目已有的包管理器（看 lock 文件：pnpm / yarn / bun / npm），下面以 `npx` 为例。

## 1. 检查项目情况

读取（不存在就跳过）：`package.json`、`components.json`、`components.json` 中 `tailwind.css` 指向的全局 CSS 文件。按下表归类，并**先把结论告诉用户**：

| 情况 | 判断 | 走哪一步 |
| --- | --- | --- |
| 新项目 | 当前目录为空，或没有 `package.json` | 2 |
| Base UI 项目 | `components.json` 的 `style` 以 `base-` 开头 | 3 |
| Radix / React Aria 项目 | `style` 以 `radix-` 或 `aria-` 开头，或为 `new-york`、`default` 等旧名 | 4 |
| 未接入 shadcn 的 React 项目 | 有 `package.json`，依赖中有 `react` 和 `tailwindcss` 4.x，没有 `components.json` | 5 |
| 不支持 | 其他（非 React、Tailwind 3 等） | 6 |

## 2. 新项目

询问（有默认值，用户直接回车即用默认）：

- 项目名（默认：参数 `$ARGUMENTS`，没有则 `my-app`）
- 模板：`vite`（默认）/ `next` / `start` / `react-router` / `astro`
- 强调色：`blue`（默认）/ `green` / `orange` / `pink` / `red` / `purple`

执行：

```bash
npx shadcn@latest init https://design.suemor.com/r/base.json -t <模板> -n <项目名>
```

然后到第 7 步。

## 3. Base UI 项目

先判断有没有自定义主题：比较全局 CSS 中 `:root` 下的 `--primary`、`--background`、`--radius` 与 shadcn 默认值（`--primary: oklch(0.205 0 0)`、`--background: oklch(1 0 0)`、`--radius: 0.625rem`）。任一不同就视为**有自定义主题**。

- **没有自定义主题**：列出将被替换的内容——`components/ui/` 下与核心组件同名的文件（button、input、select、dialog 等）、全局 CSS 中的主题变量、`components.json` 的部分配置——得到确认后执行：

  ```bash
  npx shadcn@latest add https://design.suemor.com/r/base.json --overwrite
  ```

- **有自定义主题**：让用户二选一：
  1. 用 marchen-design 的主题覆盖：同上；
  2. 保留现有主题：只在 `components.json` 的 `registries` 中加入 `"@marchen-design": "https://design.suemor.com/r/{name}.json"`（保留文件其他内容），之后按需 `npx shadcn@latest add @marchen-design/<name>`。

然后到第 7 步。

## 4. Radix / React Aria 项目：只引入 token

告诉用户：marchen-design 的组件基于 Base UI，和这个项目的组件 API 不同，所以**只引入 token（配色、圆角、字体变量），不安装组件，不修改 `style`**。列出将被覆盖的全局 CSS 变量，确认后：

1. 在 `components.json` 的 `registries` 中加入 `"@marchen-design": "https://design.suemor.com/r/{name}.json"`，保留其他内容不变；
2. 执行 `npx shadcn@latest add @marchen-design/theme`。

提醒用户：项目里 Button 的 default 变体如果使用 `bg-primary`，主操作会显示为强调色；这是仅 token 模式的预期效果，不需要改组件。然后到第 7 步。

## 5. 未接入 shadcn 的 React + Tailwind 4 项目

说明将先接入 shadcn（Base UI），再安装 marchen-design。确认后：

```bash
npx shadcn@latest init https://design.suemor.com/r/base.json
```

然后到第 7 步。

## 6. 不支持的项目

不要执行任何安装。说明 marchen-design 的组件需要 React + Tailwind CSS 4。如果用户只想要配色，告诉他纯 CSS 版 token 文件位于 `${CLAUDE_PLUGIN_ROOT}/skills/design/references/tokens.css`，可以复制进项目并在全局样式中引入（深色模式在祖先元素上加 `.dark` 类）。结束。

## 7. 强调色

第 2 步之外的情况，询问强调色（默认 `blue`）。选择非蓝色时执行：

```bash
npx shadcn@latest add @marchen-design/accent-<颜色>
```

## 8. 完成后总结

告诉用户：

- **项目模式**：完整模式（Base UI，可使用 marchen-design 的组件和区块）或仅 token 模式；
- **安装了什么**：组件列表、主题、强调色；
- **接下来**：直接描述需求（例如"做一个设置页""做一个带筛选的列表页"），会按 marchen-design 的规则完成；需要设置界面时会自动安装 settings 区块；可随时用 `/marchen-design:design-review` 审查。
